import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { Response, Request } from 'express';
import { JwtCookieRolesGuard } from './guards/jwt-cookie-roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Auth } from './entities/auth.entity';
import { plainToInstance } from 'class-transformer';
import { RegisterDTO } from './dto/register.dto';
import { ApiResponse } from 'src/common/response/api-response';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDTO: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.register(registerDTO, res);
      return ApiResponse.success(result, 'User registration successful');
    } catch (error) {
      return ApiResponse.error('Registration failed', [error.message]);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const validatedUser = await this.authService.validatedUser(dto.email, dto.password);
      const result = await this.authService.login(validatedUser, res);
      return ApiResponse.success(result, 'User login successful');
    } catch (error) {
      this.logger.warn('Login failed:', error.message);
      return ApiResponse.error('Login failed', [error.message]);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.refresh(req, res);
      return ApiResponse.success(plainToInstance(Auth, result), 'Token refreshed successfully');
    } catch (error) {
      this.logger.error('Refresh failed:', error.message);
      return ApiResponse.error('Token refresh failed', [error.message]);
    }
  }

  @Post('logout')
  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    try {
      this.authService.logout(res);
      return ApiResponse.success(null, 'Logout successful');
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
      return ApiResponse.error('Logout failed', [error.message]);
    }
  }

  @Get('me')
  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  getMe(@Req() req: AuthenticatedRequest) {
    try {
      if (!req.user) {
        return ApiResponse.error('Tidak ada user dalam request');
      }
      return ApiResponse.success(req.user, 'User profile fetched successfully');
    } catch (error) {
      this.logger.error('GetMe failed:', error.message);
      return ApiResponse.error('Failed to fetch user profile', [error.message]);
    }
  }
}