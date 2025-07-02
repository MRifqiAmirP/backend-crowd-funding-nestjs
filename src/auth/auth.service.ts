import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { Response, Request } from 'express';
import { RegisterDTO } from './dto/register.dto';


@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async validatedUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException("User is not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    return user;

  }

  async register(registerDTO: RegisterDTO, res: Response): Promise<User> {
    const existingEmail = await this.userService.findOneByEmail(registerDTO.email);

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }
    const hashed = await bcrypt.hash(registerDTO.password, 10);
    const newUser = await this.userService.create({
      email: registerDTO.email,
      password: hashed,
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

  logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('id_token');
    res.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);
    return !!user; 
  }
}

