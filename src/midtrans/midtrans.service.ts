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

  async handleNotification(payload: any) {
    const { transaction_status, order_id, payment_type } = payload;

    const status = {
      'settlement': 'success',
      'capture': 'success',
      'pending': 'pending',
      'deny': 'failed',
      'expire': 'expired',
      'cancel': 'cancelled',
    }[transaction_status] || 'unknown';

    await this.prisma.funding.updateMany({
      where: { orderId: order_id },
      data: {
        status,
        paymentType: payment_type,
      },
    });

    // (Optional) Send email notification here if needed

    return { received: true };
  }
}


