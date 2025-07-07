import { Injectable } from '@nestjs/common';
import { CreateMidtranDto } from './dto/create-midtran.dto';
import { UpdateMidtranDto } from './dto/update-midtran.dto';

@Injectable()
export class MidtransService {
  create(createMidtranDto: CreateMidtranDto) {
    return 'This action adds a new midtran';
  }

  findAll() {
    return `This action returns all midtrans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} midtran`;
  }

  update(id: number, updateMidtranDto: UpdateMidtranDto) {
    return `This action updates a #${id} midtran`;
  }

  remove(id: number) {
    return `This action removes a #${id} midtran`;
  }
}
