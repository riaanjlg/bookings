import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { MongoRepository } from 'typeorm';
import { toObjectId } from '../common/utils/toObjectId.js';
import { CreateBookingInput } from './dto/input/create-booking.input.js';
import { UpdateBookingInput } from './dto/input/update-booking.input.js';
import { User } from '../users/entities/user.entity.js';
import { Resource } from '../resources/entities/resource.entity.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: MongoRepository<Booking>,
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    @InjectRepository(Resource)
    private readonly resourcesRepository: MongoRepository<Resource>,
  ) {}

  findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find();
  }

  findOne(id: string): Promise<Booking | null> {
    return this.bookingsRepository.findOneBy({ id: toObjectId(id) });
  }

  findByResource(resourceId: string): Promise<Booking[]> {
    return this.bookingsRepository.findBy({
      resourceId: toObjectId(resourceId),
    });
  }

  findByUser(userId: string): Promise<Booking[]> {
    return this.bookingsRepository.findBy({
      userId: toObjectId(userId),
    });
  }

  async create(input: CreateBookingInput): Promise<Booking> {
    const userId = toObjectId(input.userId);
    const resourceId = toObjectId(input.resourceId);

    const foundUser = await this.usersRepository.findOneBy({ id: userId });
    const foundResource = await this.resourcesRepository.findOneBy({
      id: resourceId,
    });

    if (!foundUser) {
      throw new NotFoundException(`User ${input.userId} not found`);
    }

    if (!foundResource) {
      throw new NotFoundException(`Resource ${input.resourceId} not found`);
    }

    const booking = this.bookingsRepository.create({
      ...input,
      resourceId,
      userId,
    });
    return this.save(booking);
  }

  async update(input: UpdateBookingInput): Promise<Booking> {
    const { id, ...changes } = input;
    const booking = await this.findOne(id);

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    Object.assign(booking, changes);
    return this.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    await this.bookingsRepository.remove(booking);
  }

  private async save(booking: Booking): Promise<Booking> {
    if (booking.end <= booking.start) {
      throw new BadRequestException('End must be after start');
    }

    const clash = await this.bookingsRepository.findOne({
      where: {
        resourceId: booking.resourceId,
        start: { $lt: booking.end },
        end: { $gt: booking.start },
        ...(booking.id && { _id: { $ne: booking.id } }),
      },
    });

    if (clash) {
      throw new ConflictException(
        'This resource is already booked for that time',
      );
    }

    return this.bookingsRepository.save(booking);
  }
}
