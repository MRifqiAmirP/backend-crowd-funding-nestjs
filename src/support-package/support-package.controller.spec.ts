import { Test, TestingModule } from '@nestjs/testing';
import { SupportPackageController } from './support-package.controller';
import { SupportPackageService } from './support-package.service';

describe('SupportPackageController', () => {
  let controller: SupportPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportPackageController],
      providers: [SupportPackageService],
    }).compile();

    controller = module.get<SupportPackageController>(SupportPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
