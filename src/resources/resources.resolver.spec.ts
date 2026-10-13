import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesResolver } from './resources.resolver.js';

describe('ResourcesResolver', () => {
  let resolver: ResourcesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesResolver],
    }).compile();

    resolver = module.get<ResourcesResolver>(ResourcesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
