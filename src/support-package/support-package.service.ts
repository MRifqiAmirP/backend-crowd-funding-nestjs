import { Injectable } from '@nestjs/common';
import { CreateSupportPackageDto } from './dto/create-support-package.dto';
import { UpdateSupportPackageDto } from './dto/update-support-package.dto';

@Injectable()
export class SupportPackageService {
  create(createSupportPackageDto: CreateSupportPackageDto) {
    return 'This action adds a new supportPackage';
  }

  findAll() {
    return `This action returns all supportPackage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supportPackage`;
  }

  update(id: number, updateSupportPackageDto: UpdateSupportPackageDto) {
    return `This action updates a #${id} supportPackage`;
  }

  remove(id: number) {
    return `This action removes a #${id} supportPackage`;
  }
}
