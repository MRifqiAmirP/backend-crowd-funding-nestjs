import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { Response, Request } from 'express';
import { RegisterDTO } from './dto/register.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { TokenService } from './utils/token.service';
import { AuthMailService } from './mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password';


@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
    private authMailService: AuthMailService
  ) { }

  async validatedUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException("User is not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    return user;

  }

  async register(registerDTO: RegisterDTO, res: Response): Promise<User> {
    const existingEmail = await this.userService.checkEmailExists(registerDTO.email);

    if (existingEmail) {
      throw new ConflictException('Email already in used by another user');
    }
   
    const newUser = await this.userService.create({
      email: registerDTO.email,
      password: registerDTO.password,
      first_name: registerDTO.first_name,
      last_name: registerDTO.last_name,
      role: registerDTO.role,
      instance: registerDTO.instance,
      education_level: registerDTO.education_level,
      email_validated: false,
    });

    const user = new User(newUser);
    return user;
  }


  async login(user: User, res: Response): Promise<Auth> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '15m' },
    );

    const idToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('id_token', idToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, idToken };
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException('No refresh token');

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.login(new User(user), res);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO) {
    const user = await this.userService.findOneByEmail(forgotPasswordDTO.email);
    if (!user) {
      return;
    }
    const token = this.tokenService.generateResetToken({
      sub: user.id,
      email: user.email
    });

    await this.authMailService.sendResetPassword(user.email, token);
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDTO.token, {
        secret: process.env.JWT_RESET_SECRET,
      });

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(resetPasswordDTO.newPassword, 10);
      await this.userService.update(user.id, {
        password: hashedPassword,
      });

      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('id_token');
    res.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }
}

