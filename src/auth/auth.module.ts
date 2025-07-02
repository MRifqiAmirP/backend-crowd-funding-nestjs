import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtCookieRolesGuard } from './guards/jwt-cookie-roles.guard';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '15m' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtCookieRolesGuard],
  exports: [
    AuthService,
    JwtCookieRolesGuard,
    JwtModule,
  ],
})
export class AuthModule { }
