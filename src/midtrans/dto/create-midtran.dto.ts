import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMidtranDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    grossAmount: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsEmail()
    email: string;
}
