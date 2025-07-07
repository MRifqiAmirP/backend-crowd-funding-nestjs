import { Module } from '@nestjs/common';
import { SupportPackageService } from './support-package.service';
import { SupportPackageController } from './support-package.controller';

@Module({
  controllers: [SupportPackageController],
  providers: [SupportPackageService],
})
export class SupportPackageModule {}
