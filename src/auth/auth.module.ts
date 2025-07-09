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
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '15m' },
    }),
    MailerModule
  ],

  controllers: [AuthController],

  providers: [
    AuthService, 
    JwtCookieRolesGuard,
    TokenService,
    MailerService    
  ],

  exports: [
    AuthService,
    JwtCookieRolesGuard,
    JwtModule,
    TokenService
  ],
})
export class AuthModule { }
