import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import { ApiResponse } from 'src/common/response/api-response';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';

@Controller('api/payments')
@UseGuards(JwtCookieRolesGuard)
export class MidtransController {
  constructor(private readonly midtransService: MidtransService) {}

  @Post('token')
  async create(@Body() createMidtranDto: CreateMidtranDto) {
    try {
      const result = await this.midtransService.generateSnapToken(createMidtranDto);
      return ApiResponse.success(result, 'Snap token generated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to generate snap token', [error.message]);
    }
  }

  @Post('webhook')
  async handleNotification(@Body() payload: any) {
    try {
      const result = await this.midtransService.handleNotification(payload);
      return ApiResponse.success(result, 'Snap token generated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to generate snap token', [error.message]);
    }
  }


}
