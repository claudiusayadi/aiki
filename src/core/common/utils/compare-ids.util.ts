import { ForbiddenException } from '@nestjs/common';

export const compareIds = (userId: string, requiredId: string) => {
  if (userId !== requiredId)
    throw new ForbiddenException('You are not allowed to perform this action!');
};
