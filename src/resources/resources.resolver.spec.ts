import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Resource } from './entities/resource.entity.js';
import { ResourceType } from './enums/resource-type.enum.js';
import { ResourcesResolver } from './resources.resolver.js';
import { ResourcesService } from './resources.service.js';

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: new ObjectId(),
  name: 'Boardroom',
  type: ResourceType.ROOM,
  location: 'Floor 2',
  capacity: 12,
  ...overrides,
});

describe('ResourcesResolver', () => {
  let resolver: ResourcesResolver;

  const service = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesResolver,
        { provide: ResourcesService, useValue: service },
      ],
    }).compile();

    resolver = module.get(ResourcesResolver);
  });

  it('resources returns the list from the service', async () => {
    const resources = [makeResource(), makeResource({ name: 'Projector' })];
    service.findAll.mockResolvedValue(resources);

    await expect(resolver.resources()).resolves.toEqual(resources);
  });

  it('resource returns one resource by id', async () => {
    const resource = makeResource();
    service.findOne.mockResolvedValue(resource);

    const id = resource.id.toHexString();

    await expect(resolver.resource(id)).resolves.toBe(resource);
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('resource returns null when it does not exist', async () => {
    service.findOne.mockResolvedValue(null);

    await expect(
      resolver.resource(new ObjectId().toHexString()),
    ).resolves.toBeNull();
  });

  it('createResource wraps the new resource in a payload', async () => {
    const resource = makeResource();
    const input = {
      name: resource.name,
      type: resource.type,
      location: resource.location,
      capacity: resource.capacity,
    };
    service.create.mockResolvedValue(resource);

    await expect(resolver.createResource(input)).resolves.toEqual({
      resource,
    });
    expect(service.create).toHaveBeenCalledWith(input);
  });

  it('updateResource wraps the updated resource in a payload', async () => {
    const resource = makeResource({ name: 'Large Boardroom' });
    const input = { id: resource.id.toHexString(), name: 'Large Boardroom' };
    service.update.mockResolvedValue(resource);

    await expect(resolver.updateResource(input)).resolves.toEqual({
      resource,
    });
    expect(service.update).toHaveBeenCalledWith(input);
  });

  it('deleteResource returns the id of the deleted resource', async () => {
    const id = new ObjectId().toHexString();
    service.remove.mockResolvedValue(undefined);

    await expect(resolver.deleteResource({ id })).resolves.toEqual({
      deletedResourceId: id,
    });
    expect(service.remove).toHaveBeenCalledWith(id);
  });

  it('propagates service errors to the caller', async () => {
    const error = new Error('boom');
    service.findAll.mockRejectedValue(error);

    await expect(resolver.resources()).rejects.toBe(error);
  });
});
