import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class VerifyEmailDto extends PickType(CreateUserDto, [
  'email',
] as const) {
  /**
   * 6-digit verification code
   * @example "123456"
   */
  @IsString()
  @Length(6, 6)
  @IsNotEmpty({ message: 'Verification code is required.' })
  code: string;
}
