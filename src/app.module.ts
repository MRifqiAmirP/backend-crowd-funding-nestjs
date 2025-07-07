import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { CategoryModule } from './category/category.module';
import { GalleryModule } from './gallery/gallery.module';
import { CommentarProjectModule } from './commentar-project/commentar-project.module';
import { BlogModule } from './blog/blog.module';
import { SupportPackageModule } from './support-package/support-package.module';
import { MidtransModule } from './midtrans/midtrans.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ProjectModule, CategoryModule, GalleryModule, CommentarProjectModule, BlogModule, SupportPackageModule, MidtransModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
