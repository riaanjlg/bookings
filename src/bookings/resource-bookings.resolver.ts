import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Resource } from '../resources/entities/resource.entity.js';
import { BookingsService } from './bookings.service.js';
import { Booking } from './entities/booking.entity.js';

@Resolver(() => Resource)
export class ResourceBookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @ResolveField(() => [Booking])
  bookings(@Parent() resource: Resource): Promise<Booking[]> {
    return this.bookingsService.findByResource(resource.id.toString());
  }
}
