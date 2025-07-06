import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { CategoryModule } from './category/category.module';
import { GalleryModule } from './gallery/gallery.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ProjectModule, CategoryModule, GalleryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
