import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { ApiResponse } from 'src/common/response/api-response';

@UseGuards(JwtCookieRolesGuard)
@Controller('/api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/create')
  async create(@Body() dto: CreateCategoryDto) {
    try {
      const result = await this.categoryService.create(dto);
      return ApiResponse.success(result, 'Category created successfully');
    } catch (error) {
      return ApiResponse.error(error.message, 'Failed to create category');
    }
  }

  @Get()
  async findAll() {
    try {
      const result = await this.categoryService.findAll();
      return ApiResponse.success(result, 'All categories retrieved');
    } catch (error) {
      return ApiResponse.error(error.message, 'Failed to retrieve categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.categoryService.findOne(id);
      if (!result) {
        return ApiResponse.error('Category not found', `No category found with ID ${id}`);
      }    
      return ApiResponse.success(result, 'Category retrieved');
    } catch (error) {
      return ApiResponse.error(error.message, 'Failed to retrieve category by ID');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    try {
      const result = await this.categoryService.update(id, dto);
      return ApiResponse.success(result, 'Category updated successfully');
    } catch (error) {
      return ApiResponse.error(error.message, 'Failed to update category');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.categoryService.remove(id);
      return ApiResponse.success(null, 'Category deleted successfully');
    } catch (error) {
      return ApiResponse.error(error.message, 'Failed to delete category');
    }
  }
}