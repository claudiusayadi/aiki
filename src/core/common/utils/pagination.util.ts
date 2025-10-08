import {
  FindManyOptions,
  FindOptionsOrder,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import type { PaginationDto } from '../dto/pagination.dto';
import type { SortDto } from '../dto/sort.dto';
import type { PaginatedResult } from '../interfaces/paginated-result.interface';

export class PaginationUtil {
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: {
      pagination: PaginationDto;
      sort?: SortDto;
      where?: FindManyOptions<T>['where'];
      relations?: FindManyOptions<T>['relations'];
    },
  ): Promise<PaginatedResult<T>> {
    const { pagination, sort, where, relations } = options;
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    let order: FindOptionsOrder<T> | undefined;
    if (sort?.sortBy) {
      order = {
        [sort.sortBy]: sort.sortOrder || 'DESC',
      } as FindOptionsOrder<T>;
    }

    const [data, total] = await repository.findAndCount({
      where,
      relations,
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static buildOrder<T extends ObjectLiteral>(
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): FindOptionsOrder<T> {
    if (!sortBy) return {} as FindOptionsOrder<T>;

    return {
      [sortBy]: sortOrder,
    } as FindOptionsOrder<T>;
  }
}
