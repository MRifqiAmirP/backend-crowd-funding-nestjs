import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectCommentDto } from './dto/create-commentar-project.dto';
import { UpdateProjectCommentarDto } from './dto/update-commentar-project.dto';

@Injectable()
export class CommentarProjectService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    projectId: string,
    dto: CreateProjectCommentDto,
  ) {
    const checkProject = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!checkProject) {
      throw new NotFoundException('Project not found');
    }

    const result = await this.prisma.projectComments.create({
      data: {
        userId,
        projectId,
        commentar: dto.commentar,
      },
    });

    return result;
  }

  async update(id: string, userId: string, dto: UpdateProjectCommentarDto) {
    const checkKomentar = await this.prisma.projectComments.findUnique({
        where: {
            id,
            userId
        }
    })
    if (!checkKomentar) {
        throw new NotFoundException('Commentar not found')
    }

    const result = await this.prisma.projectComments.update({
        where: {
            id,
            userId
        },
        data: {
            commentar: dto.commentar
        }
    })

    return result
  }

  async findAll() {
    const result = await this.prisma.projectComments.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            instance: true,
            education_level: true,
          },
        },
      },
    });

    return result;
  }

  async findByProjectId(projectId: string) {
    const checkProject = await this.prisma.project.findUnique({
        where: { id: projectId }
    })
    if (!checkProject) {
        throw new NotFoundException('Project not found')
    }

    const result = await this.prisma.projectComments.findMany({
        where: { projectId }
    })

    return result
  }

  async findByUserId(userId: string) {
    const checkUser = await this.prisma.user.findUnique({
        where: { id: userId }
    })
    if (!checkUser) {
        throw new NotFoundException('User not found')
    }

    const result = await this.prisma.projectComments.findMany({
        where: { userId },
        include: {
            project: {
                select: {
                    projectName: true
                }
            }
        }
    })

    return result
  }

  async delete(id: string) {
    const checkId = await this.prisma.projectComments.findUnique({
        where: { id }
    })
    if (!checkId) {
        throw new NotFoundException('Commentar not found')
    }

    const result = await this.prisma.projectComments.delete({
        where: { id }
    })

    return result
  }
}
