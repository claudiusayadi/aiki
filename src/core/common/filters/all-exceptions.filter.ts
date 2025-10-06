import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | string
        | { message?: string };
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse &&
              typeof exceptionResponse === 'object' &&
              'message' in exceptionResponse
            ? (exceptionResponse.message ?? exception.message)
            : exception.message;
    }

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    response.status(status).json({
      code: status,
      status: Number(status) >= 400 && Number(status) < 500 ? 'fail' : 'error',
      message,
      ...(this.config.get<string>('NODE_ENV') === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
