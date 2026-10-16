import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Resource } from '../resources/entities/resource.entity.js';
import { Booking } from './entities/booking.entity.js';
import type { Loaders } from '../common/loaders/create-loaders.js';

@Resolver(() => Resource)
export class ResourceBookingsResolver {
  @ResolveField(() => [Booking])
  bookings(
    @Parent() resource: Resource,
    @Context('loaders') loaders: Loaders,
  ): Promise<Booking[]> {
    return loaders.bookingsByResourceId.load(resource.id.toString());
  }
}
