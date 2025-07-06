import { ArrayNotEmpty, IsArray, isArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateBlogDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsString()
    thumbnail: string;

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    blog_categoryIds: string[]; 
}
