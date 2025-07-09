import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';


@Injectable()
export class MailerService {
    constructor(
        private mailerService: NestMailerService
    ) { }

    async send(to: string, subject: string, template: string, context: Record<string, any>) {
        await this.mailerService.sendMail({
            to,
            subject,
            template,
            context,
        });
    }

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
