import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { CategoryModule } from './category/category.module';
import { GalleryModule } from './gallery/gallery.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ProjectModule, CategoryModule, GalleryModule],
  imports: [PrismaModule, UserModule, AuthModule, ProjectModule, CategoryModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
