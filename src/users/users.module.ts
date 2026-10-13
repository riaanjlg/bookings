import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver.js';
import { UsersService } from './users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking])],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
