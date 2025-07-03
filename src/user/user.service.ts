import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UserService {

  constructor(
    private prisma: PrismaService
  ) { }

  async create(data: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        ...data,
        email_validated: false
      }
    });
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

    if (data.email && data.email !== existingUser.email) {
      const existingEmail = await this.checkEmailExists(data.email)

      if (existingEmail) {
        throw new ConflictException('Email is already used by another user');
      }
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async checkEmailExists(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email
      }
    })
    
  }


  async remove(id: string) {
    return await this.prisma.user.delete({
      where: {
        id
      }
    });
  }
}
