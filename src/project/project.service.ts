import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiResponse } from '../common/response/api-response';
import { CreateProjectWithGalleriesDto } from './dto/create-project-gallery.dto';
import { Category } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with userId: ${userId} not found`);
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
        throw new NotFoundException(
          `Category names not found: ${missingNames.join(', ')}`,
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
        throw new NotFoundException(
          `Category names not found: ${missingNames.join(', ')}`,
        );
      }
    }

    const thumbnail = files.thumbnail?.[0];
    const thumbnailPath = thumbnail
      ? `/uploads/thumbnails/${thumbnail.filename}`
      : null;
    const galleryFiles = files.galleries ?? [];

    if (
      !Array.isArray(dto.supportPackagesName) ||
      !Array.isArray(dto.nominal) ||
      !Array.isArray(dto.benefit) ||
      dto.supportPackagesName.length === 0 ||
      dto.nominal.length === 0 ||
      dto.benefit.length === 0 ||
      dto.supportPackagesName.length !== dto.nominal.length ||
      dto.supportPackagesName.length !== dto.benefit.length
    ) {
      throw new HttpException(
        ApiResponse.error(
          '`supportPackagesName`, `nominal`, and `benefit` must be non-empty arrays with the same length',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

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

      if (
        dto.supportPackagesName &&
        dto.nominal &&
        dto.benefit &&
        dto.supportPackagesName.length > 0
      ) {
        await prisma.supportPackage.createMany({
          data: dto.supportPackagesName.map((name, index) => ({
            projectId: newProject.id,
            packageName: name,
            nominal: dto.nominal![index],
            benefit: dto.benefit![index],
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
          supportPackages: {
            select: {
              id: true,
              packageName: true,
              nominal: true,
              benefit: true,
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
        supportPackages: {
          select: {
            id: true,
            packageName: true,
            nominal: true,
            benefit: true,
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
        supportPackages: {
          select: {
            id: true,
            packageName: true,
            nominal: true,
            benefit: true,
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
    const project = await this.prisma.project.findUnique({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project not found with ID: ${id}`);
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

      if (
        dto.GalleryIds &&
        dto.updateCaption &&
        dto.GalleryIds.length === dto.updateCaption.length
      ) {
        for (let i = 0; i < dto.GalleryIds.length; i++) {
          const galleryId = dto.GalleryIds[i];
          const caption = dto.updateCaption[i];

          await prisma.gallery.updateMany({
            where: {
              id: galleryId,
              projectId: id,
            },
            data: {
              caption,
            },
          });
        }
      } else if (
        (dto.GalleryIds && !dto.updateCaption) ||
        (!dto.GalleryIds && dto.updateCaption)
      ) {
        throw new HttpException(
          ApiResponse.error(
            'GalleryIds and updateCaption must be provided together and have the same length.',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        dto.supportPackagesName &&
        dto.nominal &&
        dto.benefit &&
        dto.supportPackagesName.length > 0
      ) {
        await prisma.supportPackage.deleteMany({
          where: { projectId: id },
        });

        const supportPackagesData = dto.supportPackagesName.map((name, index) => ({
          projectId: id,
          packageName: name,
          nominal: dto.nominal![index],
          benefit: dto.benefit![index],
        }));

        await prisma.supportPackage.createMany({
          data: supportPackagesData,
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
          supportPackages: {
            select: {
              id: true,
              packageName: true,
              nominal: true,
              benefit: true,
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

      await prisma.supportPackage.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectComments.deleteMany({
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
