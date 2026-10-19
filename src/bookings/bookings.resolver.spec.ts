import { Test, TestingModule } from '@nestjs/testing';
import { BookingsResolver } from './bookings.resolver.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsResolver', () => {
  let resolver: BookingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsResolver, { provide: BookingsService, useValue: {} }],
    }).compile();

    resolver = module.get<BookingsResolver>(BookingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
