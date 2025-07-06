import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGalleryDto, file: Express.Multer.File) {
    return this.prisma.gallery.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        caption: dto.caption,
        imageUrl: `/uploads/${file.filename}`,
      },
    });
  }

  findAll() {
    return this.prisma.gallery.findMany();
  }

  findOne(id: string) {
    return this.prisma.gallery.findFirst({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.gallery.delete({ where: { id } });
  }
}
