import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UserService {

  constructor(
    private prisma: PrismaService
  ) {}

  async create(data: CreateUserDto) {
    return await this.prisma.user.create({data}) ;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
    where: { email },
  });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: {
        id
      }
    });
  }
}
