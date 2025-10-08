import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

import { EmailOptions } from './interfaces/email-options';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail(options);

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  public async sendVerificationEmail(
    email: string,
    code: string,
    name?: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Aiki',
      template: 'verification',
      context: { code, name },
    });
  }
}
