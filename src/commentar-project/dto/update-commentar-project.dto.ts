import { PartialType } from "@nestjs/mapped-types";
import { CreateProjectCommentDto } from "./create-commentar-project.dto";

export class UpdateProjectCommentarDto extends PartialType(CreateProjectCommentDto){}