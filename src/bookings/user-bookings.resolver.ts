import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Resource } from '../resources/entities/resource.entity.js';
import { BookingsService } from './bookings.service.js';
import { Booking } from './entities/booking.entity.js';
import { User } from '../users/entities/user.entity.js';

@Resolver(() => User)
export class UserBookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @ResolveField(() => [Booking])
  bookings(@Parent() user: User): Promise<Booking[]> {
    return this.bookingsService.findByUser(user.id.toString());
  }
}
