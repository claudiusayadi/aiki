import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { IsBoolean } from 'src/core/common/decorators/is-boolean.decorator';

export class CreatePlanDto {
  /**
   * Unique slug for the plan
   * @example "starter"
   */
  @IsString()
  @IsNotEmpty()
  slug: string;

  /**
   * Name of the plan
   * @example "Starter"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Description of the plan
   * @example "Free forever. Create up to 5 tasks to get started."
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * Task limit for the plan (null = unlimited)
   * @example 5
   */
  @IsNumber()
  @IsOptional()
  task_limit?: number | null;

  /**
   * Price of the plan (in the smallest currency unit, e.g. kobo for NGN)
   * @example 1000
   */
  @IsNumber()
  @IsNotEmpty()
  price: number;

  /**
   * Whether the plan is a subscription
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  is_subscription: boolean;

  /**
   * Additional metadata (JSON object)
   * @example { paystack_plan_code: 'abc123', custom_field: 'value' }
   */
  @IsOptional()
  metadata?: Record<string, any>;
}
