import { Module } from '@nestjs/common';
import { SupportPackageService } from './support-package.service';
import { SupportPackageController } from './support-package.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SupportPackageController],
  providers: [SupportPackageService],
})
export class SupportPackageModule {}
