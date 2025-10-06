import { IsUUID } from 'class-validator';

export class IdDto {
  /**
   * Entity ID
   * @example "372cf3e1-abda-4678-a79d-ed254b1f3fcb"
   */
  @IsUUID()
  id: string;
}
