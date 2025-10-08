import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdDto } from '../../core/common/dto/id.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { IRequestUser } from '../users/interfaces/user.interface';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'Initialize payment (Focus one-time or Flow subscription)',
  })
  @ApiCreatedResponse({
    description: 'Payment initialized successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @Post('initialize')
  async initializePayment(
    @ActiveUser() user: IRequestUser,
    @Body() dto: InitializePaymentDto,
  ) {
    return await this.paymentsService.initializePayment(user, dto);
  }

  @ApiOperation({ summary: 'Verify payment and update user tasks_left' })
  @ApiOkResponse({
    description: 'Payment verified successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return await this.paymentsService.verifyPayment(dto);
  }

  @ApiOperation({ summary: 'Handle Paystack webhook (public endpoint)' })
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Body() payload: { event: string; data: { reference: string } },
    @Headers('x-paystack-signature') signature: string,
  ) {
    return await this.paymentsService.handleWebhook(payload, signature);
  }

  @ApiOperation({ summary: 'Get all user payments - owner/admin' })
  @ApiOkResponse({
    description: 'Payments retrieved successfully',
    type: [Payment],
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @Get()
  async findAll(@ActiveUser() user: IRequestUser) {
    return await this.paymentsService.findAll(user);
  }

  /**
   * Get specific payment by ID
   */
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiOkResponse({
    description: 'Payment retrieved successfully',
    type: Payment,
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @Get(':id')
  async findOne(@Param() { id }: IdDto, @ActiveUser() user: IRequestUser) {
    return await this.paymentsService.findOne(id, user);
  }
}
