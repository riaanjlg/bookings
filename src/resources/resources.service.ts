import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity.js';
import { MongoRepository } from 'typeorm';
import { CreateResourceInput } from './dto/input/create-resource.input.js';
import { UpdateResourceInput } from './dto/input/update-resource.input.js';
import { DUPLICATE_KEY_ERROR } from '../common/constants.js';
import { toObjectId } from '../common/utils/toObjectId.js';
import { Booking } from '../bookings/entities/booking.entity.js';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: MongoRepository<Resource>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: MongoRepository<Booking>,
  ) {}

  findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find();
  }

  findOne(id: string): Promise<Resource | null> {
    return this.resourcesRepository.findOneBy({ id: toObjectId(id) });
  }

  findByIds(ids: readonly string[]): Promise<Resource[]> {
    return this.resourcesRepository.find({
      where: { _id: { $in: ids.map(toObjectId) } },
    });
  }

  create(input: CreateResourceInput): Promise<Resource> {
    const resource = this.resourcesRepository.create(input);
    return this.save(resource);
  }

  async update(input: UpdateResourceInput): Promise<Resource> {
    const { id, ...changes } = input;
    const resource = await this.findOne(id);

    if (!resource) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    Object.assign(resource, changes);
    return this.save(resource);
  }

  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);

    if (!resource) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const bookingCount = await this.bookingsRepository.countBy({
      resourceId: resource.id,
    });

    if (bookingCount > 0) {
      throw new ConflictException(
        `Resource ${id} is used in ${bookingCount} booking(s) and cannot be deleted`,
      );
    }

    await this.resourcesRepository.remove(resource);
  }

  private async save(resource: Resource): Promise<Resource> {
    try {
      return await this.resourcesRepository.save(resource);
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR) {
        throw new ConflictException(
          `A resource named "${resource.name}" already exists`,
        );
      }
      throw error;
    }
  }
}
