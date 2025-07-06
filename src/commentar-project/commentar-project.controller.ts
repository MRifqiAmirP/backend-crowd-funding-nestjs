import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { CommentarProjectService } from './commentar-project.service';
import { CreateProjectCommentDto } from './dto/create-commentar-project.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ApiResponse } from 'src/common/response/api-response';
import { UpdateProjectCommentarDto } from './dto/update-commentar-project.dto';

@UseGuards(JwtCookieRolesGuard)
@Controller('/api/commentar-project')
export class CommentarProjectController {
  constructor(
    private readonly CommentarProjectService: CommentarProjectService,
  ) {}

  @Post('/create/:projectId')
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.sub;

      const result = await this.CommentarProjectService.create(
        userId,
        projectId,
        dto,
      );
      return ApiResponse.success(result, 'Commentar added');
    } catch (error) {
      return ApiResponse.error('Failed add commentar', [error.message]);
    }
  }

  @Patch('/:id')
  async pdate(@Param('id') id: string, @Req() req:AuthenticatedRequest, @Body() dto: UpdateProjectCommentarDto) {
    try {
      const userId = req.user.sub

      const result = await this.CommentarProjectService.update(id, userId, dto)
      return ApiResponse.success(result, 'Successed update commentar')
    } catch (error) {
      return ApiResponse.error('Failed update commentar', [error.message])
    }
  }

  @Get()
  async findAll() {
    const result = await this.CommentarProjectService.findAll()
    return ApiResponse.success(result, 'Successed get data commentar')
  }

  @Get('project/:projectId')
  async findByProjectId(@Param('projectId') projectId: string) {
    const result = await this.CommentarProjectService.findByProjectId(projectId)
    return ApiResponse.success(result, 'Successed get data commentar by project ID')
  }

  @Get('/user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const result = await this.CommentarProjectService.findByUserId(userId)
    return ApiResponse.success(result, 'Successed get data commentar by user ID')
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    const result = await this.CommentarProjectService.delete(id)
    return ApiResponse.success(null, 'Successed delete commentar')
  }
}
