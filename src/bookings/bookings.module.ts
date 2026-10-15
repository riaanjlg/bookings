import { Module } from '@nestjs/common';
import { BookingsResolver } from './bookings.resolver.js';
import { BookingsService } from './bookings.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Resource } from '../resources/entities/resource.entity.js';
import { UsersModule } from '../users/users.module.js';
import { ResourcesModule } from '../resources/resources.module.js';
import { ResourceBookingsResolver } from './resource-bookings.resolver.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Resource]),
    UsersModule,
    ResourcesModule,
  ],
  providers: [BookingsResolver, ResourceBookingsResolver, BookingsService],
})
export class BookingsModule {}
