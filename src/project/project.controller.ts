import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ApiResponse } from '../common/response/api-response';

@UseGuards(JwtCookieRolesGuard)
@Controller('/api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/create')
  async create(@Body() dto: CreateProjectDto, @Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user.sub
      const project = await this.projectService.create(dto, userId);
      return ApiResponse.success(project, 'Project created successfully');
    } catch (error) {
      console.error('Create project error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ApiResponse.error('Failed to create project', error?.message || error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const projects = await this.projectService.findAll();
      return ApiResponse.success(projects, 'Projects fetched all successfully');
    } catch (error) {
      console.error('Find all projects error:', error);

      throw new HttpException(
        ApiResponse.error('Failed to fetch projects', error?.message || error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const project = await this.projectService.findOne(id);

      if (!project) {
        throw new HttpException(
          ApiResponse.error('Project not found', `Invalid projectId: ${id}`),
          HttpStatus.NOT_FOUND,
        );
      }

      return ApiResponse.success(project, 'Project fetched successfully');
    } catch (error) {
      console.error('Find one project error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ApiResponse.error('Failed to fetch project', error?.message || error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const updated = await this.projectService.update(id, dto, userId);

    if (!updated) {
      throw new HttpException(
        ApiResponse.error('Project not found or update failed'),
        HttpStatus.NOT_FOUND,
      );
    }

    return ApiResponse.success(updated, 'Project updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const deleted = await this.projectService.remove(id);

      if (!deleted) {
        throw new HttpException(
          ApiResponse.error('Project not found or already deleted'),
          HttpStatus.NOT_FOUND,
        );
      }

      return ApiResponse.success(null, 'Project deleted successfully');
    } catch (error) {
      console.error('Delete project error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ApiResponse.error('Failed to delete project', error?.message || error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
