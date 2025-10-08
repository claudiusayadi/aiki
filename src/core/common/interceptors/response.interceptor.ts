import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { PaginatedResult } from '../interfaces/paginated-result.interface';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const code = response.statusCode;

    return next.handle().pipe(
      map((data: T) => {
        if (this.isPaginatedResult(data)) {
          return {
            code,
            status: 'success',
            data: data.data as T,
            meta: data.meta,
          };
        }

        return {
          code,
          status: 'success',
          data,
        };
      }),
    );
  }

  private isPaginatedResult(data: unknown): data is PaginatedResult<unknown> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'meta' in data &&
      Array.isArray((data as PaginatedResult<unknown>).data) &&
      typeof (data as PaginatedResult<unknown>).meta === 'object'
    );
  }
}
