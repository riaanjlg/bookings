import DataLoader from 'dataloader';
import { BookingsService } from '../../bookings/bookings.service.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Resource } from '../../resources/entities/resource.entity.js';
import { ResourcesService } from '../../resources/resources.service.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/users.service.js';

export function createLoaders(
  usersService: UsersService,
  resourcesService: ResourcesService,
  bookingsService: BookingsService,
) {
  const userById = new DataLoader<string, User | null>(async (userIds) => {
    const users = await usersService.findByIds(userIds);

    const usersById = new Map<string, User>();
    for (const user of users) {
      usersById.set(user.id.toString(), user);
    }

    return userIds.map((id) => usersById.get(id) ?? null);
  });

  const resourceById = new DataLoader<string, Resource | null>(
    async (resourceIds) => {
      const resources = await resourcesService.findByIds(resourceIds);

      const resourcesById = new Map<string, Resource>();
      for (const resource of resources) {
        resourcesById.set(resource.id.toString(), resource);
      }

      return resourceIds.map((id) => resourcesById.get(id) ?? null);
    },
  );

  const bookingsByResourceId = new DataLoader<string, Booking[]>(
    async (resourceIds) => {
      const bookings = await bookingsService.findByResourceIds(resourceIds);

      const bookingsByResource = new Map<string, Booking[]>();
      for (const booking of bookings) {
        const key = booking.resourceId.toString();
        const existing = bookingsByResource.get(key) ?? [];
        existing.push(booking);
        bookingsByResource.set(key, existing);
      }

      return resourceIds.map((id) => bookingsByResource.get(id) ?? []);
    },
  );

  return { userById, resourceById, bookingsByResourceId };
}

export type Loaders = ReturnType<typeof createLoaders>;
