import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto, userId: string) {
    const firstCategoryId = createBlogDto.blog_categoryIds?.[0];

    if (!firstCategoryId) {
      throw new BadRequestException('At least one category ID is required');
    }

    const category = await this.prisma.blog_Category.findUnique({
      where: {
        id: firstCategoryId, // ✅ FIXED
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const generatedSlug = slugify(createBlogDto.title, {
      lower: true,
      strict: true,
    });

    const blog = await this.prisma.blog.create({
      data: {
        ...createBlogDto,
        slug: generatedSlug,
        userId,
        categories: {
          connect: createBlogDto.blog_categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });

    return blog;
  }

  async findAll() {
    return this.prisma.blog.findMany({
      include: {
        categories: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        categories: true,
      },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.blog.findMany({
      where: {
        categories: {
          some: {
            categoryId: categoryId,
          },
        },
      },
      include: {
        categories: true,
      },
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const existingBlog = await this.findOne(id);

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.blog_categoryIds) {
      const categoriesExist = await this.prisma.blog_Category.findMany({
        where: { id: { in: updateBlogDto.blog_categoryIds } },
      });

      if (categoriesExist.length !== updateBlogDto.blog_categoryIds.length) {
        throw new NotFoundException('Some categories not found');
      }
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        updated_at: new Date(),
        categories: {
          set: updateBlogDto.blog_categoryIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        categories: true,
      },
    });

    return updatedBlog;
  }

  async remove(id: string) {
    return await this.prisma.blog.delete({
      where: {
        id,
      },
    });
  }
}
