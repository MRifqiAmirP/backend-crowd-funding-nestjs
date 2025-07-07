import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';

@Controller('midtrans')
export class MidtransController {
  constructor(private readonly midtransService: MidtransService) {}

  @Post()
  create(@Body() createMidtranDto: CreateMidtranDto) {
    return this.midtransService.create(createMidtranDto);
  }

  @Get()
  findAll() {
    return this.midtransService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.midtransService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMidtranDto: UpdateMidtranDto) {
    return this.midtransService.update(+id, updateMidtranDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.midtransService.remove(+id);
  }
}
