import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSupportPackageDto {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    packageName: string;

    @IsNotEmpty()
    @IsNumber()
    nominal: number;

    @IsNotEmpty()
    @IsString()
    benefit: string;
}
