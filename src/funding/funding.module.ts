import { Module } from '@nestjs/common';
import { FundingService } from './funding.service';
import { FundingController } from './funding.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MidtransModule } from 'src/midtrans/midtrans.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, MidtransModule, MailerModule],
  controllers: [FundingController],
  providers: [FundingService, MailerService],
})
export class FundingModule { }
