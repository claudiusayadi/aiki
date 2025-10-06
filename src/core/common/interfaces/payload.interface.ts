import { UserRole } from 'src/modules/users/enums/roles.enum';

export interface IPayload {
  /**
   * Subject of the token (User ID)
   * @example 123e4567-e89b-12d3-a456-426614174000
   */
  readonly sub: string;

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
