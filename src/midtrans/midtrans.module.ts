import { Module } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { MidtransController } from './midtrans.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { FundingService } from 'src/funding/funding.service';
import { UserService } from 'src/user/user.service';
import { MailerModule } from 'src/mailer/mailer.module';


@Module({
  imports: [PrismaModule, AuthModule, MailerModule],
  controllers: [MidtransController],
  providers: [MidtransService, FundingService, UserService],
  exports: [MidtransService]
})
export class MidtransModule {}
