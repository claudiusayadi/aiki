import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  /**
   * Task title
   * @example "Complete project documentation"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  /**
   * Detailed description of the task
   * @example "Write comprehensive documentation for the API endpoints"
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Task status
   * @example "todo"
   */
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  /**
   * Task due date (ISO 8601 format)
   * @example "2025-10-15T10:00:00Z"
   */
  @IsDateString()
  @IsOptional()
  due_at?: string;
}
