import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  /**
   * User email address
   * @example "chiefprocrastinator@gmail.com"
   */
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
