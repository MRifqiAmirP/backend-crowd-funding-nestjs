import { PartialType } from '@nestjs/mapped-types';
import { CreateSupportPackageDto } from './create-support-package.dto';

export class UpdateSupportPackageDto extends PartialType(CreateSupportPackageDto) {}
