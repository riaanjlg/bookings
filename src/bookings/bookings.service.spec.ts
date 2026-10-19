import { BadRequestException, ConflictException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { BookingsService } from './bookings.service.js';
import { ErrorCode } from '../common/errors/error-codes.js';

const NOW = new Date('2026-10-20T12:00:00.000Z');
const HOUR = 60 * 60 * 1000;
const at = (ms: number) => new Date(NOW.getTime() + ms);

describe('BookingsService', () => {
  const userId = new ObjectId();
  const resourceId = new ObjectId();

  // Builds the service with fake repositories. `existing` is the booking that
  // update() will "find" in the database.
  const setup = (existing?: { start: Date; end: Date }) => {
    const bookingsRepository = {
      findOneBy: vi.fn().mockResolvedValue(
        existing && {
          id: new ObjectId(),
          userId,
          resourceId,
          purpose: 'meeting',
          ...existing,
        },
      ),
      findOne: vi.fn().mockResolvedValue(null), // the overlap query: null = no clash
      create: vi.fn((booking) => booking),
      save: vi.fn((booking) => Promise.resolve(booking)),
    };
    const usersRepository = {
      findOneBy: vi.fn().mockResolvedValue({ id: userId }),
    };
    const resourcesRepository = {
      findOneBy: vi.fn().mockResolvedValue({ id: resourceId }),
    };
    const service = new BookingsService(
      bookingsRepository as never,
      usersRepository as never,
      resourcesRepository as never,
    );
    return {
      service,
      bookingsRepository,
      usersRepository,
      resourcesRepository,
    };
  };

  const input = (start: Date, end: Date) => ({
    userId: userId.toString(),
    resourceId: resourceId.toString(),
    start,
    end,
    purpose: 'meeting',
  });

  // Runs the promise, expects it to fail with the given exception class, and
  // returns the body (statusCode, message, code) that the client will see.
  const rejection = async <T extends Error>(
    promise: Promise<unknown>,
    exceptionClass: new (...args: never[]) => T,
  ) => {
    const error = await promise.then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(exceptionClass);
    return (
      error as unknown as { getResponse(): Record<string, unknown> }
    ).getResponse();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('time rules on create', () => {
    it('rejects end equal to start', async () => {
      const { service } = setup();
      const response = await rejection(
        service.create(input(at(HOUR), at(HOUR))),
        BadRequestException,
      );
      expect(response).toMatchObject({
        statusCode: 400,
        code: ErrorCode.BOOKING_END_BEFORE_START,
        message: 'End must be after start',
      });
    });

    it('rejects end before start', async () => {
      const { service } = setup();
      const response = await rejection(
        service.create(input(at(2 * HOUR), at(HOUR))),
        BadRequestException,
      );
      expect(response.code).toBe(ErrorCode.BOOKING_END_BEFORE_START);
    });

    it('rejects a booking longer than 8 hours', async () => {
      const { service } = setup();
      const response = await rejection(
        service.create(input(at(HOUR), at(HOUR + 8 * HOUR + 1))),
        BadRequestException,
      );
      expect(response).toMatchObject({
        statusCode: 400,
        code: ErrorCode.BOOKING_TOO_LONG,
      });
    });

    it('allows exactly 8 hours', async () => {
      const { service, bookingsRepository } = setup();
      await service.create(input(at(HOUR), at(HOUR + 8 * HOUR)));
      expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('rejects a start in the past', async () => {
      const { service } = setup();
      const response = await rejection(
        service.create(input(at(-1), at(HOUR))),
        BadRequestException,
      );
      expect(response).toMatchObject({
        statusCode: 400,
        code: ErrorCode.BOOKING_IN_PAST,
      });
    });

    it('allows a start exactly now', async () => {
      const { service, bookingsRepository } = setup();
      await service.create(input(at(0), at(HOUR)));
      expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('reports end-before-start first when several rules are broken', async () => {
      const { service } = setup();
      const response = await rejection(
        service.create(input(at(-10 * HOUR), at(-20 * HOUR))),
        BadRequestException,
      );
      expect(response.code).toBe(ErrorCode.BOOKING_END_BEFORE_START);
    });

    it('rejects before touching the database', async () => {
      const {
        service,
        usersRepository,
        resourcesRepository,
        bookingsRepository,
      } = setup();
      await rejection(
        service.create(input(at(-HOUR), at(HOUR))),
        BadRequestException,
      );
      expect(usersRepository.findOneBy).not.toHaveBeenCalled();
      expect(resourcesRepository.findOneBy).not.toHaveBeenCalled();
      expect(bookingsRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('time rules on update', () => {
    const id = () => new ObjectId().toString();

    it('allows editing only the purpose of a booking that already started', async () => {
      const { service, bookingsRepository } = setup({
        start: at(-2 * HOUR),
        end: at(-HOUR),
      });
      await service.update({ id: id(), purpose: 'new purpose' });
      expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('allows sending the same start again', async () => {
      const { service, bookingsRepository } = setup({
        start: at(-2 * HOUR),
        end: at(-HOUR),
      });
      await service.update({ id: id(), start: at(-2 * HOUR) });
      expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('rejects moving the start into the past', async () => {
      const { service } = setup({ start: at(HOUR), end: at(2 * HOUR) });
      const response = await rejection(
        service.update({ id: id(), start: at(-HOUR) }),
        BadRequestException,
      );
      expect(response.code).toBe(ErrorCode.BOOKING_IN_PAST);
    });

    it('rejects an end that is not after the existing start', async () => {
      const { service } = setup({ start: at(HOUR), end: at(2 * HOUR) });
      const response = await rejection(
        service.update({ id: id(), end: at(HOUR) }),
        BadRequestException,
      );
      expect(response.code).toBe(ErrorCode.BOOKING_END_BEFORE_START);
    });

    it('rejects stretching a booking past 8 hours', async () => {
      const { service } = setup({ start: at(HOUR), end: at(2 * HOUR) });
      const response = await rejection(
        service.update({ id: id(), end: at(HOUR + 8 * HOUR + 1) }),
        BadRequestException,
      );
      expect(response.code).toBe(ErrorCode.BOOKING_TOO_LONG);
    });
  });

  describe('overlap check', () => {
    it('rejects with a conflict when the repository finds a clash', async () => {
      const { service, bookingsRepository } = setup();
      bookingsRepository.findOne.mockResolvedValue({ id: new ObjectId() });

      const response = await rejection(
        service.create(input(at(HOUR), at(2 * HOUR))),
        ConflictException,
      );

      expect(response).toMatchObject({
        statusCode: 409,
        code: ErrorCode.BOOKING_OVERLAP,
        message: 'This resource is already booked for that time',
      });
      expect(bookingsRepository.save).not.toHaveBeenCalled();
    });

    it('saves the booking when there is no clash', async () => {
      const { service, bookingsRepository } = setup();

      await service.create(input(at(HOUR), at(2 * HOUR)));

      expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
    });

    // The database decides what a clash is, so a fake repository cannot prove
    // the edge cases. What we can lock down is the question we ask it: same
    // resource, existing.start < new.end and existing.end > new.start. The
    // strict < and > are what let back-to-back bookings through.
    it('asks for a booking on the same resource that starts before the new end and ends after the new start', async () => {
      const { service, bookingsRepository } = setup();
      const start = at(HOUR);
      const end = at(2 * HOUR);

      await service.create(input(start, end));

      expect(bookingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          resourceId,
          start: { $lt: end },
          end: { $gt: start },
        },
      });
    });

    it('ignores the booking itself when updating it', async () => {
      const { service, bookingsRepository } = setup({
        start: at(HOUR),
        end: at(2 * HOUR),
      });
      const existing = await bookingsRepository.findOneBy();

      await service.update({ id: existing.id.toString(), purpose: 'renamed' });

      expect(bookingsRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({ _id: { $ne: existing.id } }),
      });
    });
  });
});
