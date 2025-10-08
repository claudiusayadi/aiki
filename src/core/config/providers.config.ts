import { ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';

import { GlobalExceptionsFilter } from '../common/filters/global-exceptions.filter';
import { Traffic } from '../common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { VALIDATION_PIPE_OPTIONS } from '../common/utils/common.constants';

export const apiProviders = [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RoleGuard,
  },
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe(VALIDATION_PIPE_OPTIONS),
  },
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionsFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: Traffic,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseInterceptor,
  },
];
