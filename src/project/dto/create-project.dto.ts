import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  userId: string;

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

  @IsInt()
  target: number;

  @IsDateString()
  deadline: string;

  @IsString({ each: true })
  categoryNames: string[];
}