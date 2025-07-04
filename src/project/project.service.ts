import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiResponse } from 'src/common/response/api-response';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        ApiResponse.error('User not found', `Invalid userId: ${userId}`),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.categoryNames && dto.categoryNames.length > 0) {
      const lowercaseCategoryNames = dto.categoryNames.map((name) =>
        name.toLowerCase(),
      );

      const categories = await this.prisma.category.findMany({
        where: {
          category_name: {
            in: lowercaseCategoryNames,
          },
        },
      });

      if (categories.length !== dto.categoryNames.length) {
        const foundNames = categories.map((cat) => cat.category_name);
        const missingNames = lowercaseCategoryNames.filter(
          (name) => !foundNames.includes(name),
        );
        throw new HttpException(
          ApiResponse.error(
            'Invalid categories',
            `Category names not found: ${missingNames.join(', ')}`,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const project = await this.prisma.$transaction(async (prisma) => {
      const newProject = await prisma.project.create({
        data: {
          userId: userId,
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

      if (dto.categoryNames && dto.categoryNames.length > 0) {
        const lowercaseCategoryNames = dto.categoryNames.map((name) =>
          name.toLowerCase(),
        );
        const categories = await prisma.category.findMany({
          where: {
            category_name: {
              in: lowercaseCategoryNames,
            },
          },
        });

        await prisma.mtm_Project_Category.createMany({
          data: categories.map((category) => ({
            projectId: newProject.id,
            categoryId: category.id,
          })),
        });
      }

      return prisma.project.findUnique({
        where: { id: newProject.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
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

    let categoryIds: string[] = [];
    if (dto.categoryNames && dto.categoryNames.length > 0) {
      console.log('Input category names for update:', dto.categoryNames);

      const lowercaseCategoryNames = dto.categoryNames.map((name) =>
        name.toLowerCase().trim(),
      );
      console.log('Lowercase category names:', lowercaseCategoryNames);

      const categories = await this.prisma.category.findMany({
        where: {
          category_name: {
            in: lowercaseCategoryNames,
          },
        },
      });

      console.log('Found categories for update:', categories);

      if (categories.length !== dto.categoryNames.length) {
        const foundNames = categories.map((cat) => cat.category_name);
        const missingNames = lowercaseCategoryNames.filter(
          (name) => !foundNames.includes(name),
        );
        throw new HttpException(
          ApiResponse.error(
            'Invalid categories',
            `Category names not found: ${missingNames.join(', ')}`,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      categoryIds = categories.map((cat) => cat.id);
      console.log('Category IDs to update:', categoryIds);
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedProject = await prisma.project.update({
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

      console.log('Updated project basic data:', updatedProject);

      if (dto.categoryNames !== undefined) {
        console.log('Updating categories...');

        await prisma.mtm_Project_Category.deleteMany({
          where: {
            projectId: id,
          },
        });

        console.log('Deleted existing category relationships');

        if (categoryIds.length > 0) {
          const mtmData = categoryIds.map((categoryId) => ({
            projectId: id,
            categoryId: categoryId,
          }));

          console.log('Creating new MTM relationships:', mtmData);

          await prisma.mtm_Project_Category.createMany({
            data: mtmData,
          });

          console.log('New MTM relationships created successfully');
        }
      }

      return prisma.project.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
    });

    console.log('Final update result:', result);
    return result;
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
