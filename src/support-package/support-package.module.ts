import { Module } from '@nestjs/common';
import { SupportPackageService } from './support-package.service';
import { SupportPackageController } from './support-package.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [SupportPackageController],
  providers: [SupportPackageService],
})
export class SupportPackageModule {}
