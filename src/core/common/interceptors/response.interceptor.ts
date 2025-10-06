import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
        if (Array.isArray(data)) {
          return {
            code,
            status: 'success',
            results: data.length,
            data,
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
}
