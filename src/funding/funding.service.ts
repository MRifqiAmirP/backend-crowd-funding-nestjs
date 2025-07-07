import { Injectable } from '@nestjs/common';
import { CreateFundingDto } from './dto/create-funding.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';

@Injectable()
export class FundingService {
  create(createFundingDto: CreateFundingDto) {
    return 'This action adds a new funding';
  }

  findAll() {
    return `This action returns all funding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} funding`;
  }

  update(id: number, updateFundingDto: UpdateFundingDto) {
    return `This action updates a #${id} funding`;
  }

  remove(id: number) {
    return `This action removes a #${id} funding`;
  }
}
