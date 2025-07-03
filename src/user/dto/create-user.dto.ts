import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "min 8 characters" })
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  last_name?: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  instance: string;

  @IsString()
  @IsNotEmpty()
  education_level: string;

  @IsBoolean()
  @IsOptional()
  email_validated?: boolean;
}
