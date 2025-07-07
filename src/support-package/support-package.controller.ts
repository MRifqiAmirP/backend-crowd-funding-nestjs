import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupportPackageService } from './support-package.service';
import { CreateSupportPackageDto } from './dto/create-support-package.dto';
import { UpdateSupportPackageDto } from './dto/update-support-package.dto';

@Controller('support-package')
export class SupportPackageController {
  constructor(private readonly supportPackageService: SupportPackageService) {}

  @Post()
  create(@Body() createSupportPackageDto: CreateSupportPackageDto) {
    return this.supportPackageService.create(createSupportPackageDto);
  }

  @Get()
  findAll() {
    return this.supportPackageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportPackageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupportPackageDto: UpdateSupportPackageDto) {
    return this.supportPackageService.update(+id, updateSupportPackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportPackageService.remove(+id);
  }
}
