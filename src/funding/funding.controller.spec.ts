import { Test, TestingModule } from '@nestjs/testing';
import { FundingController } from './funding.controller';
import { FundingService } from './funding.service';

describe('FundingController', () => {
  let controller: FundingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundingController],
      providers: [FundingService],
    }).compile();

    controller = module.get<FundingController>(FundingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
