import { PartialType } from '@nestjs/mapped-types';
import { CreateMidtranDto } from './create-midtran.dto';

export class UpdateMidtranDto extends PartialType(CreateMidtranDto) {}
