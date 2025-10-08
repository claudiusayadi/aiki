import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SortDto {
  /**
   * Field to sort by
   * @example "createdAt"
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * Sort order (ASC or DESC)
   * @example "DESC"
   */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
