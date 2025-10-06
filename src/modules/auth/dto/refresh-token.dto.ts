import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  /**
   * Refresh Token (JWT)
   * @example abcdefghijklmnopqrstuvwxyz1234567890
   */
  @IsJWT()
  refreshToken: string;
}
