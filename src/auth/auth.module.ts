import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtCookieRolesGuard } from './guards/jwt-cookie-roles.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TokenService } from './utils/token.service';
import { AuthMailService } from './mail/mail.service';

@Module({
  imports: [
    PassportModule,

    forwardRef(() => UserModule),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '15m' },
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
         from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: path.join(process.cwd(), 'src', 'auth', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(), // atau EjsAdapter()
        options: { strict: true },
      },
    })
  ],

  controllers: [AuthController],

  providers: [
    AuthService, 
    JwtCookieRolesGuard,
    TokenService,
    AuthMailService
  ],

  exports: [
    AuthService,
    JwtCookieRolesGuard,
    JwtModule,
    TokenService,
    AuthMailService
  ],
})
export class AuthModule { }
