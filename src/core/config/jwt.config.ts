import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { ApiConfig } from './app.config';

export default registerAs('jwt', () => {
  const config = {
    secret: ApiConfig.JWT_SECRET,
    signOptions: {
      expiresIn: ApiConfig.JWT_ACCESS_TOKEN_TTL,
    },
    refreshTokenTtl: ApiConfig.JWT_REFRESH_TOKEN_TTL,
  } as const satisfies JwtModuleOptions & {
    refreshTokenTtl: string | number;
  };
  return config;
});
