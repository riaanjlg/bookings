import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity.js';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { CreateResourceInput } from './dto/input/create-resource.input.js';
import { UpdateResourceInput } from './dto/input/update-resource.input.js';

const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: MongoRepository<Resource>,
  ) {}

  findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find();
  }

  findOne(id: string): Promise<Resource | null> {
    return this.resourcesRepository.findOneBy({ id: this.toObjectId(id) });
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

    await this.resourcesRepository.remove(resource);
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`"${id}" is not a valid id`);
    }
    return new ObjectId(id);
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
