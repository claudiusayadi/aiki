import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { IRequestUser } from '../../users/interfaces/user.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof IRequestUser, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();

    return field ? user?.[field] : user;
  },
);
