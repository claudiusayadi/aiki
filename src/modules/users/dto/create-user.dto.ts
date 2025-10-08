import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

import { UserRole } from '../enums/roles.enum';

export class CreateUserDto {
  /**
   * User email
   * @example "chiefprocrastinator@gmail.com"
   */
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  /**
   * Password must meet the following criteria:
   * - at least 8 characters long
   * - at least one lowercase letter
   * - at least one uppercase letter
   * - at least one number
   * - at least one symbol
   * @example "Alpha123$!@"
   */
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  password: string;

  /**
   * User full name
   * @example "Owolabi Omoninakuna"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * User phone number
   * @example "+2349012345678"
   */
  @IsPhoneNumber('NG', {
    message: 'Phone number must be a valid Nigerian phone number.',
  })
  @IsOptional()
  phone?: string;

  /**
   * User bio
   * @example "A passionate software developer."
   */
  @IsString()
  @IsOptional()
  bio?: string;

  /**
   * User role
   * @example "user"
   */
  @IsString()
  @IsEnum(() => UserRole, { message: 'Role must be either "admin" or "user".' })
  @IsOptional()
  role?: UserRole;

  /**
   * User's last login date and time
   * @example "2023-10-01T12:00:00Z"
   */
  @IsOptional()
  lastLoginAt?: Date;
}
