import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import emailConfig from 'src/core/config/email.config';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forFeature(emailConfig),
    MailerModule.forRootAsync(emailConfig.asProvider()),
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
