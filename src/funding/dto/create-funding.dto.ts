import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFundingDto {
    @IsUUID()
    supportPackageId: string;

    @IsUUID()
    projectId: string;

    @IsInt()
    amount: number;

    @IsBoolean()
    isAnonymous: boolean;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    message?: string;

}
