import { Module } from '@nestjs/common';
import { FundingService } from './funding.service';
import { FundingController } from './funding.controller';

@Module({
  controllers: [FundingController],
  providers: [FundingService],
})
export class FundingModule {}
