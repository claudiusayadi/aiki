import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class Traffic implements NestInterceptor {
  private readonly logger = new Logger(Traffic.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          const isSuccess = statusCode < 400;

          this.logger.log(
            `${isSuccess ? '✓' : '✗'} ${method} ${url} ${statusCode} ${duration}ms - ${ip}`,
          );
        },
        error: (error: Error & { status?: number }) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status ?? 500;

          this.logger.error(
            `✗ ${method} ${url} ${statusCode} ${duration}ms - ${ip}`,
            error.message,
          );
        },
      }),
    );
  }
}
