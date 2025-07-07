import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import { ApiResponse } from 'src/common/response/api-response';

@Controller('midtrans')
export class MidtransController {
  constructor(private readonly midtransService: MidtransService) {}

  @Post()
  async create(@Body() createMidtranDto: CreateMidtranDto) {
    try {
      const result = await this.midtransService.generateSnapToken(createMidtranDto);
      return ApiResponse.success(result, 'Snap token generated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to generate snap token', [error.message]);
    }
  }
}
