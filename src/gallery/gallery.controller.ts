import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from 'src/common/response/api-response';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';

@UseGuards(JwtCookieRolesGuard)
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.galleryService.create(dto, file);
    return ApiResponse.success(result, 'Gallery item created successfully');
  }

  @Get()
  async findAll() {
    const result = await this.galleryService.findAll();
    return ApiResponse.success(result, 'All gallery items retrieved');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.galleryService.findOne(id);
    return ApiResponse.success(result, 'Gallery item retrieved');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.galleryService.remove(id);
    return ApiResponse.success(null, 'Gallery item deleted');
  }
}
