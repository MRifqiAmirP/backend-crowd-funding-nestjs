import { Module } from '@nestjs/common';
import { FundingService } from './funding.service';
import { FundingController } from './funding.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { MidtransModule } from 'src/midtrans/midtrans.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, MidtransModule],
  controllers: [FundingController],
  providers: [FundingService],
})
export class FundingModule {}
