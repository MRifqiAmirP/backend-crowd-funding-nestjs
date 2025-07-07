import { Injectable } from '@nestjs/common';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import * as midtrans from 'midtrans-client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MidtransService {
  private snap: midtrans.Snap;
  

  constructor(
    private prisma: PrismaService
  ) {
    this.snap = new midtrans.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }

  async createTransaction(orderId: string, grossAmount: number, customer: {
    firstName: string,
    email: string
  }) {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customer.firstName,
        email: customer.email,
      },
    };

    return this.snap.createTransaction(parameter);
  }

  async generateSnapToken(createMidtranDto: CreateMidtranDto) {
    const snap = await this.createTransaction(createMidtranDto.orderId, createMidtranDto.grossAmount, {
      firstName: createMidtranDto.firstName,
      email: createMidtranDto.email
    });

    return snap;
  }

  async handleNotification(notification: any) {
    const { order_id, transaction_status, fraud_status } = notification;

    console.log('📦 Midtrans Notification:', notification);

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        // Tunggu approval manual
      } else if (fraud_status === 'accept') {
        await this.markFundingAsPaid(order_id);
      }
    } else if (transaction_status === 'settlement') {
      await this.markFundingAsPaid(order_id);
    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
      await this.markFundingAsFailed(order_id);
    } else if (transaction_status === 'pending') {
      await this.markFundingAsPending(order_id);
    }
  }

  private async markFundingAsPaid(orderId: string) {
    await this.prisma.funding.updateMany({
      where: { orderId },
      data: { status: 'PAID' },
    });
  }

  private async markFundingAsPending(orderId: string) {
    await this.prisma.funding.updateMany({
      where: { orderId },
      data: { status: 'PENDING' },
    });
  }

  private async markFundingAsFailed(orderId: string) {
    await this.prisma.funding.updateMany({
      where: { orderId },
      data: { status: 'FAILED' },
    });
  }
}


