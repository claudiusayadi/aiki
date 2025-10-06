import { User } from '../entities/user.entity';
import { UserRole } from '../enums/roles.enum';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export interface IRequestUser {
  /**
   * User ID
   * @example 123e4567-e89b-12d3-a456-426614174000
   */
  readonly id: string;

  /**
   * User Email
   * @example bornfree@member.local
   */
  readonly email: string;

  /**
   * User Role
   * @example Reader
   */
  readonly role: UserRole;
}
