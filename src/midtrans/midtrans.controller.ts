import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import { ApiResponse } from 'src/common/response/api-response';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { FundingService } from 'src/funding/funding.service';

@Controller('api/midtrans')
@UseGuards(JwtCookieRolesGuard)
export class MidtransController {
  constructor(
    private readonly midtransService: MidtransService,
    private fundingService: FundingService
  ) { }

  @Post('token')
  async create(@Body() createMidtranDto: CreateMidtranDto) {
    try {
      const result = await this.midtransService.generateSnapToken(createMidtranDto);
      return ApiResponse.success(result, 'Snap token generated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to generate snap token', [error.message]);
    }
  }

  @Post('notification')
  @HttpCode(HttpStatus.CREATED)
  async handleNotification(@Req() req: Request) {

    try {
      const notification = req.body;

      const isValid = this.midtransService.verifySignature(notification);
      if (!isValid) {
        return ApiResponse.error('Invalid signature');
      }

      return ApiResponse.success(notification, 'Notification send successfully');
    } catch (error) {
      return ApiResponse.error('Failed to send notification', [error.message]);
    }
  }



}
