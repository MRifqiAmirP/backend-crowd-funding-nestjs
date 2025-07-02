import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/common/response/api-response';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('api/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.userService.create(createUserDto);
      return ApiResponse.success(result, 'User Created Successfully');
    } catch (error) {
      this.logger.warn('Create User failed:', error.message);
      return ApiResponse.error('Create User Failed', [error.message]);
    }
  }

  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      const result = await this.userService.findAll();
      return ApiResponse.success(result, 'Users Retrieved Successfully');
    } catch (error) {
      this.logger.warn('Get Users failed:', error.message);
      return ApiResponse.error('Get Users Failed', [error.message]);
    }

  }

  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        return ApiResponse.error('User not found');
      }
      return ApiResponse.success(user, 'User retrieved all by id');
    } catch (error) {
      return ApiResponse.error('Get User by id failed', [error.message]);
    }
  }

  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest
  ) {

    try {
      const loggedInUser = req.user;

      if (loggedInUser.role !== 'admin' && loggedInUser.sub !== id) {
        return ApiResponse.error('You are not authorized to update this user');
      }

      const result = await this.userService.update(id, updateUserDto);
      return ApiResponse.success(result, 'User Updated Successfully');
    } catch (error) {
      return ApiResponse.error('User Updated failed', [error.message]);
    }

  }

  @UseGuards(JwtCookieRolesGuard)
  @Roles('admin', 'user')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ) {
    try {
      const loggedInUser = req.user;

      if (loggedInUser.role !== 'admin' && loggedInUser.sub !== id) {
        return ApiResponse.error('You are not authorized to delete this user');
      }

      await this.userService.remove(id);
      return ApiResponse.success('User Deleted Successfully');
    } catch (error) {
      return ApiResponse.error('User Deleted failed', [error.message]);
    }
  }
}
