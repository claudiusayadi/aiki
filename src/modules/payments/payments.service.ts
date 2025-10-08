import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import paymentConfig from '../../core/config/payment.config';
import { Plan } from '../plans/entities/plan.entity';
import { User } from '../users/entities/user.entity';
import type { IRequestUser } from '../users/interfaces/user.interface';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentType } from './enums/payment-type.enum';
import type { IPaymentInitializeResponse } from './interfaces/initialize-response.interface';
import type { IPaymentSubscriptionResponse } from './interfaces/subscription-response.interface';
import type { IPaymentVerificationResponse } from './interfaces/verify-response.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Plan) private readonly plansRepo: Repository<Plan>,
    @Inject(paymentConfig.KEY)
    private readonly config: ConfigType<typeof paymentConfig>,
    private readonly httpService: HttpService,
  ) {}

  public async initializePayment(
    currentUser: IRequestUser,
    dto: InitializePaymentDto,
  ) {
    const plan = await this.plansRepo.findOne({ where: { id: dto.plan_id } });
    if (!plan) throw new NotFoundException('Plan not found');

    const user = await this.usersRepo.findOne({
      where: { id: currentUser.id },
    });
    if (!user) throw new NotFoundException('User not found');

    // One-time payment (focus plan)
    if (!plan.is_subscription) {
      const quantity = dto.quantity || 1;
      const amount = Number(plan.price) * quantity * 100; // In kobo

      // Generate unique reference
      const reference = `aiki-${plan.slug}-${user.id}-${Date.now()}`;

      try {
        // Initialize transaction with Paystack
        const response = await firstValueFrom(
          this.httpService.post<IPaymentInitializeResponse>(
            `${this.config.baseUrl}/transaction/initialize`,
            {
              email: user.email,
              amount: amount.toString(),
              reference,
              callback_url: this.config.callbackUrl,
              metadata: {
                plan_id: plan.id,
                plan_name: plan.name,
                quantity,
                user_id: user.id,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.secretKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        // Save payment record
        const payment = this.paymentsRepo.create({
          transaction_reference: reference,
          amount: Number(plan.price) * quantity,
          currency: 'NGN',
          status: PaymentStatus.PENDING,
          payment_type: PaymentType.ONE_TIME,
          quantity,
          user: { id: user.id },
          plan: { id: plan.id },
          metadata: {
            paystack_access_code: response.data.data.access_code,
          },
        });

        await this.paymentsRepo.save(payment);

        return {
          access_code: response.data.data.access_code,
          authorization_url: response.data.data.authorization_url,
          reference,
        };
      } catch (error) {
        this.logger.error('Paystack initialization failed', error);
        throw new BadRequestException('Payment initialization failed');
      }
    }

    // Subscription (flow plan)
    else {
      // Get Paystack plan code from metadata
      const planCode = plan.metadata?.paystack_plan_code as string | undefined;
      if (!planCode) {
        throw new BadRequestException(
          'Plan is not configured for subscriptions',
        );
      }

      const reference = `${plan.slug}-sub-${user.id}-${Date.now()}`;

      try {
        // Create subscription with Paystack
        const response = await firstValueFrom(
          this.httpService.post<IPaymentSubscriptionResponse>(
            `${this.config.baseUrl}/subscription`,
            {
              customer: user.email,
              plan: planCode,
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.secretKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        // Save payment record
        const payment = this.paymentsRepo.create({
          transaction_reference: reference,
          amount: Number(plan.price),
          currency: 'NGN',
          status: PaymentStatus.PENDING,
          payment_type: PaymentType.SUBSCRIPTION,
          user: { id: user.id },
          plan: { id: plan.id },
          metadata: {
            subscription_code: response.data.data.subscription_code,
            paystack_plan_code: planCode,
          },
        });

        await this.paymentsRepo.save(payment);

        return {
          subscription_code: response.data.data.subscription_code,
          email_token: response.data.data.email_token,
          reference,
        };
      } catch (error) {
        this.logger.error('Paystack subscription failed', error);
        throw new BadRequestException('Subscription initialization failed');
      }
    }
  }

  /**
   * Verify payment and update user tasks_left
   */
  public async verifyPayment(dto: VerifyPaymentDto) {
    try {
      // Verify transaction with Paystack
      const response = await firstValueFrom(
        this.httpService.get<IPaymentVerificationResponse>(
          `${this.config.baseUrl}/transaction/verify/${dto.reference}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.secretKey}`,
            },
          },
        ),
      );

      if (response.data.data.status !== 'success') {
        throw new BadRequestException('Payment verification failed');
      }

      // Find payment record
      const payment = await this.paymentsRepo.findOne({
        where: { transaction_reference: dto.reference },
        relations: ['user', 'plan'],
      });

      if (!payment) {
        throw new NotFoundException('Payment record not found');
      }

      if (!payment.plan) {
        throw new Error('Payment plan not found');
      }

      // Update payment status
      payment.status = PaymentStatus.SUCCESS;
      payment.metadata = {
        ...payment.metadata,
        verified_at: new Date().toISOString(),
        paystack_response: response.data.data,
      };

      await this.paymentsRepo.save(payment);

      // Update user tasks_left based on payment type
      const user = await this.usersRepo.findOne({
        where: { id: payment.user.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (payment.payment_type === PaymentType.ONE_TIME) {
        // Focus plan: increment tasks_left by quantity
        const currentTasks = user.tasks_left || 0;
        const additionalTasks = payment.quantity || 1;
        user.tasks_left = currentTasks + additionalTasks;

        // Update user's plan to Focus plan
        user.plan = payment.plan;
      } else if (payment.payment_type === PaymentType.SUBSCRIPTION) {
        // Flow plan: set tasks_left to null (unlimited) and update plan
        user.tasks_left = null;
        user.plan = payment.plan;

        // Set renewal date for subscription
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        user.renews_at = renewalDate;
      }

      await this.usersRepo.save(user);

      return {
        status: 'success',
        message: 'Payment verified successfully',
        payment,
      };
    } catch (error) {
      this.logger.error('Payment verification failed', error);
      throw new BadRequestException('Payment verification failed');
    }
  }

  /**
   * Handle Paystack webhooks
   */
  public async handleWebhook(
    payload: { event: string; data: { reference: string } },
    signature: string,
  ) {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', this.config.secretKey || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const event = payload.event;

    // Handle charge.success event
    if (event === 'charge.success') {
      const reference = payload.data.reference;

      // Auto-verify payment
      await this.verifyPayment({ reference });

      return { status: 'success', message: 'Webhook processed' };
    }

    return { status: 'ignored', message: 'Event not handled' };
  }

  /**
   * Get all payments for current user
   */
  public async findAll(currentUser: IRequestUser) {
    return await this.paymentsRepo.find({
      where: { user: { id: currentUser.id } },
      relations: ['plan'],
      order: { registry: { createdAt: 'DESC' } },
    });
  }

  /**
   * Get payment by ID
   */
  public async findOne(id: string, currentUser: IRequestUser) {
    const payment = await this.paymentsRepo.findOne({
      where: { id, user: { id: currentUser.id } },
      relations: ['plan', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
