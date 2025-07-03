import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthMailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: './reset-password', // gunakan ejs/hbs template
      context: {
        resetLink,
      },
    });
  }
}
