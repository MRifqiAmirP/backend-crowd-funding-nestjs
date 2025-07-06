import { Module } from '@nestjs/common';
import { CommentarProjectController } from './commentar-project.controller';
import { CommentarProjectService } from './commentar-project.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CommentarProjectController],
  providers: [CommentarProjectService]
})
export class CommentarProjectModule {}
