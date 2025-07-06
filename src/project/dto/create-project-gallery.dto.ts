import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProjectWithGalleriesDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  educationLevel: string;

  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  fullDescription: string;

  @IsString()
  @IsNotEmpty()
  aboutProject: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  target: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  deadline: Date;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  categoryNames?: string[];

  // Gallery
  @IsOptional()
  galleries?: Express.Multer.File[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  galleryCaptions?: string[];
}
