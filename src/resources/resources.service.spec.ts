import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Resource } from './entities/resource.entity.js';
import { ResourceType } from './enums/resource-type.enum.js';
import { ResourcesService } from './resources.service.js';
import { Booking } from '../bookings/entities/booking.entity.js';

const DUPLICATE_KEY_CODE = 11000;

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: new ObjectId(),
  name: 'Boardroom',
  type: ResourceType.ROOM,
  location: 'Floor 2',
  capacity: 12,
  ...overrides,
});

describe('ResourcesService', () => {
  let service: ResourcesService;

  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  const bookingsRepository = { countBy: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    bookingsRepository.countBy.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(Resource), useValue: repository },
        { provide: getRepositoryToken(Booking), useValue: bookingsRepository },
      ],
    }).compile();

    service = module.get(ResourcesService);
  });

  describe('findAll', () => {
    it('returns every resource from the repository', async () => {
      const resources = [makeResource(), makeResource({ name: 'Projector' })];
      repository.find.mockResolvedValue(resources);

      await expect(service.findAll()).resolves.toEqual(resources);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('looks the resource up by ObjectId', async () => {
      const resource = makeResource();
      repository.findOneBy.mockResolvedValue(resource);

      const result = await service.findOne(resource.id.toHexString());

      expect(result).toBe(resource);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: resource.id });
    });

    it('returns null when nothing matches', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.findOne(new ObjectId().toHexString()),
      ).resolves.toBeNull();
    });

    it('rejects an id that is not a valid ObjectId', () => {
      expect(() => service.findOne('not-an-id')).toThrow(BadRequestException);
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const input = {
      name: 'Boardroom',
      type: ResourceType.ROOM,
      location: 'Floor 2',
      capacity: 12,
    };

    it('creates and saves the resource', async () => {
      const entity = makeResource();
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.create(input);

      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toBe(entity);
    });

    it('throws a conflict error when the name already exists', async () => {
      repository.create.mockReturnValue(makeResource());
      repository.save.mockRejectedValue({ code: DUPLICATE_KEY_CODE });

      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });

    it('rethrows any other database error unchanged', async () => {
      const error = new Error('connection lost');
      repository.create.mockReturnValue(makeResource());
      repository.save.mockRejectedValue(error);

      await expect(service.create(input)).rejects.toBe(error);
    });
  });

  describe('update', () => {
    it('applies the changes, keeps the original id and saves', async () => {
      const existing = makeResource();
      const idString = existing.id.toHexString();
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockImplementation((r: Resource) => Promise.resolve(r));

      const result = await service.update({
        id: idString,
        name: 'Large Boardroom',
        capacity: 20,
      });

      expect(result.name).toBe('Large Boardroom');
      expect(result.capacity).toBe(20);
      expect(result.location).toBe('Floor 2');
      expect(result.id).toBeInstanceOf(ObjectId);
      expect(repository.save).toHaveBeenCalledWith(existing);
    });

    it('throws not found when the resource does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update({ id: new ObjectId().toHexString(), name: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an invalid id before touching the database', async () => {
      await expect(service.update({ id: 'nope', name: 'X' })).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });

    it('throws a conflict error when renaming to an existing name', async () => {
      const existing = makeResource();
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockRejectedValue({ code: DUPLICATE_KEY_CODE });

      await expect(
        service.update({ id: existing.id.toHexString(), name: 'Taken' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes the resource that was found', async () => {
      const existing = makeResource();
      repository.findOneBy.mockResolvedValue(existing);
      repository.remove.mockResolvedValue(existing);

      await service.remove(existing.id.toHexString());

      expect(repository.remove).toHaveBeenCalledWith(existing);
    });

    it('throws not found when the resource does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.remove(new ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
    it('refuses to remove a resource that has bookings', async () => {
      const existing = makeResource();
      repository.findOneBy.mockResolvedValue(existing);
      bookingsRepository.countBy.mockResolvedValue(2);

      await expect(service.remove(existing.id.toHexString())).rejects.toThrow(
        ConflictException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
