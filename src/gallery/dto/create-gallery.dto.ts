import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  caption?: string;
}