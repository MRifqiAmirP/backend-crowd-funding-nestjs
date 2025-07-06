import { Test, TestingModule } from '@nestjs/testing';
import { CommentarProjectService } from './commentar-project.service';

describe('CommentarProjectService', () => {
  let service: CommentarProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentarProjectService],
    }).compile();

    service = module.get<CommentarProjectService>(CommentarProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
