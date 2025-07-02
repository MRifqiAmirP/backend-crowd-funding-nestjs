import { Exclude, Expose } from 'class-transformer';

export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name?: string | null;

  @Expose()
  role: string;

  @Expose()
  instance: string;

  @Expose()
  education_level: string;

  @Expose()
  email_validated: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Exclude()
  password: string;
}
