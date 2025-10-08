import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  /**
   * Paystack transaction reference
   * @example "re4lyvq3s3"
   */
  @IsString()
  @IsNotEmpty()
  reference: string;
}
