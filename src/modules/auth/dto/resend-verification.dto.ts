import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class ResendVerificationDto extends PickType(CreateUserDto, [
  'email',
] as const) {}
