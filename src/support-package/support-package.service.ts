import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateSupportPackageDto } from './dto/create-support-package.dto';
import { UpdateSupportPackageDto } from './dto/update-support-package.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';

@Injectable()
@UseGuards(JwtCookieRolesGuard)
export class SupportPackageService {

  constructor(
      private prisma: PrismaService,
    ) {}

  async create(createSupportPackageDto: CreateSupportPackageDto) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: createSupportPackageDto.projectId
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const newSupportPackage = await this.prisma.supportPackage.create({
      data: {
        projectId: createSupportPackageDto.projectId,
        packageName: createSupportPackageDto.packageName,
        nominal: createSupportPackageDto.nominal,
        benefit: createSupportPackageDto.benefit,
      }
    });

    return newSupportPackage;
  }

  async findByProject(projectId: string) {
    return this.prisma.supportPackage.findMany({
      where: { projectId },
    });
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
