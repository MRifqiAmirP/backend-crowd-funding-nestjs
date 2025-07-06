import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { GalleryModule } from 'src/gallery/gallery.module';
import { GalleryService } from 'src/gallery/gallery.service';

@Module({
  imports: [PrismaModule, AuthModule, GalleryModule],
  controllers: [ProjectController],
  providers: [ProjectService, GalleryService],
})
export class ProjectModule {}
