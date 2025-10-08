import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

export class CreatePaymentDto {
  /**
   * Unique transaction reference
   * @example 'focus-plan-123-1738944000000'
   */
  @IsString()
  @IsNotEmpty()
  transaction_reference: string;

  /**
   * Payment amount in the specified currency
   * @example 5000
   */
  @IsNumber()
  @IsPositive()
  amount: number;

  /**
   * Currency code (3 letters)
   * @example 'NGN'
   * @default 'NGN'
   */
  @IsString()
  @IsOptional()
  currency?: string;

  /**
   * Payment status
   * @default PaymentStatus.PENDING
   */
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  /**
   * Payment type (one-time or subscription)
   * @example PaymentType.ONE_TIME
   */
  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  /**
   * Quantity of items (for one-time payments)
   * @example 1
   */
  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  /**
   * Additional metadata (JSON object)
   * @example { paystack_access_code: 'abc123', custom_field: 'value' }
   */
  @IsOptional()
  metadata?: Record<string, any>;

  /**
   * User ID
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  /**
   * Plan ID
   * @example '123e4567-e89b-12d3-a456-426614174001'
   */
  @IsUUID()
  @IsOptional()
  plan_id?: string;
}
