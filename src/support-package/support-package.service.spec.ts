import { Test, TestingModule } from '@nestjs/testing';
import { SupportPackageService } from './support-package.service';

describe('SupportPackageService', () => {
  let service: SupportPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportPackageService],
    }).compile();

    service = module.get<SupportPackageService>(SupportPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
