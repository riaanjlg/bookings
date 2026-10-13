import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { MongoRepository } from 'typeorm';
import { toObjectId } from '../common/utils/toObjectId.js';
import { CreateUserInput } from './dto/input/create-user.input.js';
import { DUPLICATE_KEY_ERROR } from '../common/constants.js';
import { UpdateUserInput } from './dto/input/update-user.input.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: MongoRepository<Booking>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: toObjectId(id) });
  }

  create(input: CreateUserInput): Promise<User> {
    const user = this.usersRepository.create({ ...input, role: UserRole.USER });
    return this.save(user);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const { id, ...changes } = input;
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    Object.assign(user, changes);
    return this.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const bookingCount = await this.bookingsRepository.countBy({
      userId: user.id,
    });

    if (bookingCount > 0) {
      throw new ConflictException(
        `User ${id} has ${bookingCount} booking(s) and cannot be deleted`,
      );
    }

    await this.usersRepository.remove(user);
  }

  private async save(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR) {
        throw new ConflictException(
          `A user with the email "${user.email}" already exists`,
        );
      }
      throw error;
    }
  }
}
