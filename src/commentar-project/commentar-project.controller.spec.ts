import { Test, TestingModule } from '@nestjs/testing';
import { CommentarProjectController } from './commentar-project.controller';

describe('CommentarProjectController', () => {
  let controller: CommentarProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentarProjectController],
    }).compile();

    controller = module.get<CommentarProjectController>(CommentarProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
