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
    const project = await this.prisma.project.findUnique({
      where: { id: createFundingDto.projectId },
    });

    if (!user || !support || !project) throw new NotFoundException('User or Support or Project Package not found');

    const orderId = `ORD-${Date.now()}`;
    const isAnonymous = createFundingDto.isAnonymous;

    const funding = await this.prisma.funding.create({
      data: {
        supportPackageId: createFundingDto.supportPackageId,
        projectId: createFundingDto.projectId,
        userId,
        amount: createFundingDto.amount,
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

  async handleMidtransNotification(notification: any) {
    const { order_id, transaction_status, payment_type } = notification;

    const funding = await this.prisma.funding.findUnique({
      where: { orderId: order_id },
    });

    if (!funding) {
      throw new NotFoundException('Funding not found');
    }

    let status = 'pending';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      status = 'success';
    } else if (transaction_status === 'cancel' || transaction_status === 'expire' || transaction_status === 'deny') {
      status = 'failed';
    }

    await this.prisma.funding.update({
      where: { id: funding.id },
      data: {
        status,
        paymentType: payment_type,
      },
    });
  }
}
