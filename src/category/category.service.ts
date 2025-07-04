import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const lowercaseCategoryName = dto.category_name.toLowerCase();

    const checkCategory = await this.prisma.category.findFirst({
      where: { category_name: lowercaseCategoryName },
    });

    if (checkCategory) {
      throw new Error(`Category ${dto.category_name} already exists`);
    }

    return this.prisma.category.create({
      data: {
        category_name: dto.category_name,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (!dto.category_name) {
      throw new Error('Category name is required for update');
    }

    const lowercaseCategoryName = dto.category_name.toLowerCase();

    const checkCategory = await this.prisma.category.findFirst({
      where: {
        category_name: lowercaseCategoryName,
        id: { not: id },
      },
    });

    if (checkCategory) {
      throw new Error(`Category ${dto.category_name} already exists`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        category_name: dto.category_name,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
