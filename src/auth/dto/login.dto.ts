import { IsEmail, IsString, IsNotEmpty, MinLength } from "class-validator"

export class LoginDTO {

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: "min 8 characters"})
    password: string;

}
