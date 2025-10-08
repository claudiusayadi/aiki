import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { ApiConfig } from './app.config';

export default registerAs('email', () => {
  const config = {
    transport: {
      host: ApiConfig.EMAIL_HOST,
      port: ApiConfig.EMAIL_PORT,
      secure: ApiConfig.EMAIL_SECURE,
      auth: {
        user: ApiConfig.EMAIL_USERNAME,
        pass: ApiConfig.EMAIL_PASSWORD,
      },
    },
    defaults: {
      from: {
        name: ApiConfig.EMAIL_FROM,
        address: ApiConfig.EMAIL_SENDER,
      },
    },
    template: {
      dir: join(process.cwd(), 'src/modules/email/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    verificationCodeTtl: ApiConfig.VERIFICATION_CODE_TTL * 1000,
  } as const satisfies MailerOptions & { verificationCodeTtl: number };

  return config;
});
