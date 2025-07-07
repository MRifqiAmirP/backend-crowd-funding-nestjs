import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import { ApiResponse } from 'src/common/response/api-response';

@Controller('api/payments')
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

  @Post('notification')
  async handleNotification(@Req() req: Request, @Res() res: Response) {
    try {
      const notification = req.body;
    } catch (error) {
      
    }
  }
}
