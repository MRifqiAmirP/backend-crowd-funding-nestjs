import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';


@Injectable()
export class BlogService {

  constructor(
    private prisma: PrismaService
  ) { }

  async create(createBlogDto: CreateBlogDto, userId: string) {
    const category = await this.prisma.blog_Category.findUnique({
      where: {
        id: createBlogDto.blog_categoryId,
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
        blogCategoryId: createBlogDto.blog_categoryId,
        userId,
      },
      include: {
        category: true,
      },
    });

    return blog;
  }

  async findAll() {
    return await this.prisma.blog.findMany({
      include: {
        category: true
      }
    });
  }

  async findOne(id: string) {
    return await this.prisma.blog.findUnique({
      where: {
        id
      }
    });
  }

  async findByCategory(blogCategoryId: string) {
    return await this.prisma.blog.findMany({
      where: {
        blogCategoryId
      },
      include: {
        category: true
      }
    })
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const existingBlog = await this.findOne(id);

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.blog_categoryId) {
      const category = await this.prisma.blog_Category.findUnique({
        where: { id: updateBlogDto.blog_categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        updated_at: new Date(),
      },
      include: {
        category: true,
      },
    });

    return blog;
  }

  async remove(id: string) {
    return await this.prisma.blog.delete({
      where: {
        id
      }
    })
  }
}
