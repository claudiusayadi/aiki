import { registerAs } from '@nestjs/config';
import { ApiConfig } from './app.config';

export default registerAs('email', () => ({
  host: ApiConfig.EMAIL_HOST,
  port: ApiConfig.EMAIL_PORT,
  secure: ApiConfig.EMAIL_SECURE === 'true' || true,
  auth: {
    user: ApiConfig.EMAIL_USERNAME,
    pass: ApiConfig.EMAIL_PASSWORD,
  },
  from: {
    name: ApiConfig.EMAIL_FROM,
    address: ApiConfig.EMAIL_SENDER,
  },
  verificationCodeTtl: ApiConfig.VERIFICATION_CODE_TTL * 1000, // to milliseconds
}));
