import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class InitializePaymentDto {
  /**
   * ID of the plan to purchase
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsUUID()
  @IsNotEmpty()
  plan_id: string;

  /**
   * Quantity to purchase (for Focus plan)
   * @example 10
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
