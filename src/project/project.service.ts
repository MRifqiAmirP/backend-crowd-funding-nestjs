import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiResponse } from 'src/common/response/api-response';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new HttpException(
        ApiResponse.error('User not found', `Invalid userId: ${dto.userId}`),
        HttpStatus.BAD_REQUEST,
      );
    }

    const project = await this.prisma.project.create({
      data: {
        userId: dto.userId,
        projectName: dto.projectName,
        provider: dto.provider,
        educationLevel: dto.educationLevel,
        institutionName: dto.institutionName,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        aboutProject: dto.aboutProject,
        target: dto.target,
        deadline: new Date(dto.deadline),
      },
    });

    return project;
  }

  findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        userId: userId,
      },
    });
    if (!project) {
      throw new HttpException(
        ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.projectName && { projectName: dto.projectName }),
        ...(dto.provider && { provider: dto.provider }),
        ...(dto.educationLevel && { educationLevel: dto.educationLevel }),
        ...(dto.institutionName && { institutionName: dto.institutionName }),
        ...(dto.shortDescription && {
          shortDescription: dto.shortDescription,
        }),
        ...(dto.fullDescription && { fullDescription: dto.fullDescription }),
        ...(dto.aboutProject && { aboutProject: dto.aboutProject }),
        ...(dto.target && { target: Number(dto.target) }),
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
      },
    });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new HttpException(
        ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
        HttpStatus.NOT_FOUND,
      );
    }
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
