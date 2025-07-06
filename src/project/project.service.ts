import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiResponse } from '../common/response/api-response';
import { CreateProjectWithGalleriesDto } from './dto/create-project-gallery.dto';
import { Category } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

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

  async createWithGalleries(
    dto: CreateProjectWithGalleriesDto,
    files: {
      thumbnail?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        ApiResponse.error('User not found', `Invalid userId: ${userId}`),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Array.isArray(dto.categoryNames)) {
      throw new HttpException(
        ApiResponse.error(
          'Validation failed',
          '`categoryNames` must be an array',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    let categories: Category[] = [];
    if (dto.categoryNames.length > 0) {
      const lowercaseCategoryNames = dto.categoryNames.map((name) =>
        name.toLowerCase(),
      );

      categories = await this.prisma.category.findMany({
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

    const thumbnail = files.thumbnail?.[0];
    const thumbnailPath = thumbnail
      ? `/uploads/thumbnails/${thumbnail.filename}`
      : null;
    const galleryFiles = files.galleries ?? [];

    const project = await this.prisma.$transaction(async (prisma) => {
      const newProject = await prisma.project.create({
        data: {
          userId,
          projectName: dto.projectName,
          provider: dto.provider,
          educationLevel: dto.educationLevel,
          institutionName: dto.institutionName,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          aboutProject: dto.aboutProject,
          target: dto.target,
          deadline: new Date(dto.deadline),
          thumbnailUrl: thumbnailPath,
          galleries: {
            create: galleryFiles.map((file, index) => ({
              title: file.originalname,
              imageUrl: `/uploads/gallery/${file.filename}`,
              caption: dto.galleryCaptions?.[index] ?? null,
            })),
          },
        },
      });

      if (categories.length > 0) {
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
          galleries: {
            select: {
              id: true,
              title: true,
              caption: true,
              imageUrl: true,
            },
          },
        },
      });
    });

    return project;
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        galleries: {
          select: {
            id: true,
            title: true,
            caption: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        galleries: {
          select: {
            id: true,
            title: true,
            caption: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  // async update(id: string, dto: UpdateProjectDto, userId: string) {
  //   const project = await this.prisma.project.findFirst({
  //     where: {
  //       id,
  //       userId: userId,
  //     },
  //   });

  //   if (!project) {
  //     throw new HttpException(
  //       ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }

  //   let categoryIds: string[] = [];
  //   if (dto.categoryNames && dto.categoryNames.length > 0) {
  //     console.log('Input category names for update:', dto.categoryNames);

  //     const lowercaseCategoryNames = dto.categoryNames.map((name) =>
  //       name.toLowerCase().trim(),
  //     );
  //     console.log('Lowercase category names:', lowercaseCategoryNames);

  //     const categories = await this.prisma.category.findMany({
  //       where: {
  //         category_name: {
  //           in: lowercaseCategoryNames,
  //         },
  //       },
  //     });

  //     console.log('Found categories for update:', categories);

  //     if (categories.length !== dto.categoryNames.length) {
  //       const foundNames = categories.map((cat) => cat.category_name);
  //       const missingNames = lowercaseCategoryNames.filter(
  //         (name) => !foundNames.includes(name),
  //       );
  //       throw new HttpException(
  //         ApiResponse.error(
  //           'Invalid categories',
  //           `Category names not found: ${missingNames.join(', ')}`,
  //         ),
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     categoryIds = categories.map((cat) => cat.id);
  //     console.log('Category IDs to update:', categoryIds);
  //   }

  //   const result = await this.prisma.$transaction(async (prisma) => {
  //     const updatedProject = await prisma.project.update({
  //       where: { id },
  //       data: {
  //         ...(dto.projectName && { projectName: dto.projectName }),
  //         ...(dto.provider && { provider: dto.provider }),
  //         ...(dto.educationLevel && { educationLevel: dto.educationLevel }),
  //         ...(dto.institutionName && { institutionName: dto.institutionName }),
  //         ...(dto.shortDescription && {
  //           shortDescription: dto.shortDescription,
  //         }),
  //         ...(dto.fullDescription && { fullDescription: dto.fullDescription }),
  //         ...(dto.aboutProject && { aboutProject: dto.aboutProject }),
  //         ...(dto.target && { target: Number(dto.target) }),
  //         ...(dto.deadline && { deadline: new Date(dto.deadline) }),
  //       },
  //     });

  //     console.log('Updated project basic data:', updatedProject);

  //     if (dto.categoryNames !== undefined) {
  //       console.log('Updating categories...');

  //       await prisma.mtm_Project_Category.deleteMany({
  //         where: {
  //           projectId: id,
  //         },
  //       });

  //       console.log('Deleted existing category relationships');

  //       if (categoryIds.length > 0) {
  //         const mtmData = categoryIds.map((categoryId) => ({
  //           projectId: id,
  //           categoryId: categoryId,
  //         }));

  //         console.log('Creating new MTM relationships:', mtmData);

  //         await prisma.mtm_Project_Category.createMany({
  //           data: mtmData,
  //         });

  //         console.log('New MTM relationships created successfully');
  //       }
  //     }

  //     return prisma.project.findUnique({
  //       where: { id },
  //       include: {
  //         categories: {
  //           include: {
  //             category: true,
  //           },
  //         },
  //       },
  //     });
  //   });

  //   console.log('Final update result:', result);
  //   return result;
  // }
  async update(
    id: string,
    dto: UpdateProjectDto,
    galleryFiles: Express.Multer.File[],
    thumbnailFile: Express.Multer.File | null,
    userId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new HttpException(
        ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
        HttpStatus.NOT_FOUND,
      );
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      await prisma.project.update({
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
          ...(dto.thumbnailUrl && { thumbnailUrl: dto.thumbnailUrl }),
        },
      });

      // Update categories (boleh dikosongkan)
      if (dto.categoryNames !== undefined) {
        await prisma.mtm_Project_Category.deleteMany({
          where: { projectId: id },
        });

        if (dto.categoryNames.length > 0) {
          const categories = await prisma.category.findMany({
            where: {
              category_name: {
                in: dto.categoryNames.map((name) => name.toLowerCase().trim()),
              },
            },
          });

          if (categories.length !== dto.categoryNames.length) {
            const found = categories.map((c) => c.category_name);
            const missing = dto.categoryNames.filter(
              (n) => !found.includes(n.toLowerCase().trim()),
            );
            throw new HttpException(
              ApiResponse.error(
                'Invalid categories',
                `Category names not found: ${missing.join(', ')}`,
              ),
              HttpStatus.BAD_REQUEST,
            );
          }

          await prisma.mtm_Project_Category.createMany({
            data: categories.map((c) => ({
              projectId: id,
              categoryId: c.id,
            })),
          });
        }
      }

      if (thumbnailFile) {
        const filePath = `/uploads/thumbnails/${thumbnailFile.filename}`;

        const oldThumbnailPath = project.thumbnailUrl?.replace(/^\//, '');
        if (oldThumbnailPath && fs.existsSync(oldThumbnailPath)) {
          try {
            await fs.promises.unlink(oldThumbnailPath);
          } catch (err) {
            console.warn(`Gagal hapus thumbnail lama: ${err.message}`);
          }
        }

        await prisma.project.update({
          where: { id },
          data: {
            thumbnailUrl: filePath,
          },
        });
      }

      if (dto.deletedGalleryIds && dto.deletedGalleryIds.length > 0) {
        const galleriesToDelete = await prisma.gallery.findMany({
          where: { id: { in: dto.deletedGalleryIds }, projectId: id },
        });

        for (const gallery of galleriesToDelete) {
          const path = join(process.cwd(), gallery.imageUrl.replace(/^\//, ''));
          try {
            await fs.promises.unlink(path);
          } catch (err) {
            console.warn(`Gagal hapus file ${path}:`, err.message);
          }
        }

        await prisma.gallery.deleteMany({
          where: { id: { in: dto.deletedGalleryIds } },
        });
      }

      if (galleryFiles.length > 0) {
        await prisma.gallery.createMany({
          data: galleryFiles.map((file, index) => ({
            projectId: id,
            title: file.originalname,
            imageUrl: `/uploads/gallery/${file.filename}`,
            caption: dto.galleryCaptions?.[index] ?? null,
            uploadedAt: new Date(),
          })),
        });
      }

      return prisma.project.findUnique({
        where: { id },
        include: {
          categories: { include: { category: true } },
          galleries: {
            select: {
              id: true,
              title: true,
              caption: true,
              imageUrl: true,
            },
          },
        },
      });
    });

    return result;
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        galleries: true,
      },
    });

    if (!project) {
      throw new HttpException(
        ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Hapus file gambar gallery
      for (const gallery of project.galleries) {
        if (gallery.imageUrl) {
          const galleryPath = path.join(
            process.cwd(),
            gallery.imageUrl.replace(/^\//, ''), // hapus '/' di depan
          );
          try {
            if (fs.existsSync(galleryPath)) {
              fs.unlinkSync(galleryPath);
            }
          } catch (err) {
            console.warn(
              `Failed to delete gallery image: ${galleryPath}`,
              err.message,
            );
          }
        }
      }

      if (project.thumbnailUrl) {
        const thumbnailPath = path.join(
          process.cwd(),
          project.thumbnailUrl.replace(/^\//, ''),
        );
        try {
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        } catch (err) {
          console.warn(
            `Failed to delete thumbnail: ${thumbnailPath}`,
            err.message,
          );
        }
      }

      await prisma.mtm_Project_Category.deleteMany({
        where: { projectId: id },
      });

      await prisma.gallery.deleteMany({
        where: { projectId: id },
      });

      await prisma.project.delete({
        where: { id },
      });

      return ApiResponse.success(
        null,
        'Project and related data deleted successfully',
      );
    });
  }
}
