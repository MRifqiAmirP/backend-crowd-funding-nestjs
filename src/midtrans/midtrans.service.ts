import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';
import * as midtrans from 'midtrans-client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from "crypto"

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

  verifySignature(notification: any): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const { order_id, status_code, gross_amount, signature_key } = notification;

    const rawSignature = order_id + status_code + gross_amount + serverKey;
    const hash = crypto.createHash('sha512').update(rawSignature).digest('hex');

    return signature_key === hash;
  }


}


