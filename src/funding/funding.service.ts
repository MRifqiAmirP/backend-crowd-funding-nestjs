import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFundingDto } from './dto/create-funding.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MidtransService } from 'src/midtrans/midtrans.service';

@Injectable()
export class FundingService {

  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private midtransService: MidtransService
  ) { }

  async create(createFundingDto: CreateFundingDto, userId: string) {
    const user = await this.userService.findOne(userId);
    const support = await this.prisma.supportPackage.findUnique({ where: { id: createFundingDto.supportPackageId } });

    if (!user || !support) throw new NotFoundException('User or Support Package not found');

    const orderId = `ORDER-${Date.now()}-${userId}`;
    const isAnonymous = createFundingDto.isAnonymous;

    const funding = await this.prisma.funding.create({
      data: {
        supportPackageId: createFundingDto.supportPackageId,
        projectId: createFundingDto.supportPackageId,
        userId,
        amount: createFundingDto.amount,
        fundingType: isAnonymous ? 'anonymous' : 'public',
        status: 'pending',
        orderId,
      }
    });

    const snap = await this.midtransService.createTransaction(orderId, createFundingDto.amount, {
      firstName: isAnonymous ? 'Anonymous' : user.first_name.split(' ')[0],
      email: user.email,
    });

    await this.prisma.funding.update({
      where: { id: funding.id },
      data: { snapToken: snap.token },
    });

    return {
      snapToken: snap.token,
      redirectUrl: snap.redirect_url,
    };
  }
}
