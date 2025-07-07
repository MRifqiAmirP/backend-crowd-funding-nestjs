import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { CreateProjectWithGalleriesDto } from './create-project-gallery.dto';
import { Transform } from 'class-transformer';

export class UpdateProjectDto extends PartialType(
  CreateProjectWithGalleriesDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  deletedGalleryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  GalleryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  updateCaption?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  supportPackagesName?: string[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [Number(value)];
    if (Array.isArray(value)) return value.map((v) => Number(v));
    return value;
  })
  nominal?: number[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  benefit?: string[];
}
