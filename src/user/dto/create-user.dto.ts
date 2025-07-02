import {} from 'class-validator'

export class CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  role: string;
  email_validated: boolean;
  instance: string;
  education_level: string;
}
