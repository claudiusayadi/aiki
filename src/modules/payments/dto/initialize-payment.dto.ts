import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class InitializePaymentDto {
  /**
   * Slug of the plan to purchase (e.g., "focus" or "flow")
   * @example "focus"
   */
  @IsString()
  @IsNotEmpty()
  plan_slug: string;

  /**
   * Quantity to purchase (for Focus plan)
   * @example 10
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
