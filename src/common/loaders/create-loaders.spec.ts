import { ObjectId } from 'mongodb';
import { createLoaders } from './create-loaders.js';
import type { Booking } from '../../bookings/entities/booking.entity.js';
import type { User } from '../../users/entities/user.entity.js';

const makeUser = (): User => ({ id: new ObjectId() }) as User;

describe('createLoaders', () => {
  const setup = (users: User[] = [], bookings: Booking[] = []) => {
    const usersService = { findByIds: vi.fn().mockResolvedValue(users) };
    const resourcesService = { findByIds: vi.fn().mockResolvedValue([]) };
    const bookingsService = {
      findByResourceIds: vi.fn().mockResolvedValue(bookings),
    };
    const loaders = createLoaders(
      usersService as never,
      resourcesService as never,
      bookingsService as never,
    );
    return { loaders, usersService, resourcesService, bookingsService };
  };

  it('batches loads made in the same tick into one query', async () => {
    const [a, b, c] = [makeUser(), makeUser(), makeUser()];
    const { loaders, usersService } = setup([a, b, c]);

    await Promise.all(
      [a, b, c].map((u) => loaders.userById.load(u.id.toString())),
    );

    expect(usersService.findByIds).toHaveBeenCalledTimes(1);
    expect(usersService.findByIds).toHaveBeenCalledWith([
      a.id.toString(),
      b.id.toString(),
      c.id.toString(),
    ]);
  });

  it('returns results in key order even when the db returns them shuffled', async () => {
    const [a, b, c] = [makeUser(), makeUser(), makeUser()];
    const { loaders } = setup([c, a, b]);

    const result = await Promise.all(
      [a, b, c].map((u) => loaders.userById.load(u.id.toString())),
    );

    expect(result).toEqual([a, b, c]);
  });

  it('returns null for an id that does not exist', async () => {
    const a = makeUser();
    const { loaders } = setup([a]);

    const [found, missing] = await Promise.all([
      loaders.userById.load(a.id.toString()),
      loaders.userById.load(new ObjectId().toString()),
    ]);

    expect(found).toBe(a);
    expect(missing).toBeNull();
  });

  it('only fetches a repeated id once', async () => {
    const a = makeUser();
    const { loaders, usersService } = setup([a]);

    await Promise.all([
      loaders.userById.load(a.id.toString()),
      loaders.userById.load(a.id.toString()),
    ]);

    expect(usersService.findByIds).toHaveBeenCalledWith([a.id.toString()]);
  });

  it('groups bookings by resource and returns [] for a resource with none', async () => {
    const [r1, r2, r3] = [new ObjectId(), new ObjectId(), new ObjectId()];
    const b1 = { id: new ObjectId(), resourceId: r1 } as Booking;
    const b2 = { id: new ObjectId(), resourceId: r2 } as Booking;
    const b3 = { id: new ObjectId(), resourceId: r1 } as Booking;
    const { loaders, bookingsService } = setup([], [b1, b2, b3]);

    const result = await Promise.all(
      [r1, r2, r3].map((r) => loaders.bookingsByResourceId.load(r.toString())),
    );

    expect(bookingsService.findByResourceIds).toHaveBeenCalledTimes(1);
    expect(result).toEqual([[b1, b3], [b2], []]);
  });

  it('does not share a cache between two sets of loaders', async () => {
    const a = makeUser();
    const first = setup([a]);
    const second = setup([a]);

    await first.loaders.userById.load(a.id.toString());
    await second.loaders.userById.load(a.id.toString());

    expect(first.usersService.findByIds).toHaveBeenCalledTimes(1);
    expect(second.usersService.findByIds).toHaveBeenCalledTimes(1);
  });
});
