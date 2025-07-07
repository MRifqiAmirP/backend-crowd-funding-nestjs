import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { SupportPackageService } from './support-package.service';
import { CreateSupportPackageDto } from './dto/create-support-package.dto';
import { UpdateSupportPackageDto } from './dto/update-support-package.dto';
import { ApiResponse } from 'src/common/response/api-response';

@Controller('api/support-package')
export class SupportPackageController {
  constructor(private readonly supportPackageService: SupportPackageService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSupportPackageDto: CreateSupportPackageDto) {
    try {
        const result = await this.supportPackageService.create(createSupportPackageDto);
        return ApiResponse.success(result, 'Support Package created successfully');
      } catch (error) {
        return ApiResponse.error('Failed to create support package', [error.message]);
      }
  }

  @Get(':projectId')
  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('projectId') projectId: string) {
    try {
      const result = await this.supportPackageService.findByProject(projectId);
      return ApiResponse.success(result, 'Support Packages fetched successfully');
    } catch (error) {
      return ApiResponse.error('Failed to fetch support packages', [error.message]);
    }
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
