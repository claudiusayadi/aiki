import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { SortDto } from './sort.dto';

export class QueryDto extends IntersectionType(PaginationDto, SortDto) {}
