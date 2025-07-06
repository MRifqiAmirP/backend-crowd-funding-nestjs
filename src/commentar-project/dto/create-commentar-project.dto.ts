import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectCommentDto {
  @IsNotEmpty()
  @IsString()
  commentar: string;
}