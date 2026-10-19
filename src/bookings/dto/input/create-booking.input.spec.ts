import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ObjectId } from 'mongodb';
import { CreateBookingInput } from './create-booking.input.js';

describe('CreateBookingInput validation', () => {
  const valid = () => ({
    userId: new ObjectId().toString(),
    resourceId: new ObjectId().toString(),
    start: new Date('2026-10-20T09:00:00Z'),
    end: new Date('2026-10-20T10:00:00Z'),
    purpose: 'Team meeting',
  });

  // Runs the same transform + validation the ValidationPipe runs, and returns
  // the names of the fields that failed.
  const failingFields = async (overrides: Record<string, unknown> = {}) => {
    const input = plainToInstance(CreateBookingInput, {
      ...valid(),
      ...overrides,
    });
    const errors = await validate(input);
    return errors.map((error) => error.property);
  };

  it('accepts a valid booking', async () => {
    expect(await failingFields()).toEqual([]);
  });

  describe('ids', () => {
    it('rejects an invalid userId', async () => {
      expect(await failingFields({ userId: 'abc' })).toEqual(['userId']);
    });

    it('rejects an invalid resourceId', async () => {
      expect(await failingFields({ resourceId: 'abc' })).toEqual([
        'resourceId',
      ]);
    });
  });

  describe('dates', () => {
    it('rejects an invalid start date', async () => {
      expect(await failingFields({ start: new Date('not a date') })).toEqual([
        'start',
      ]);
    });

    it('rejects an invalid end date', async () => {
      expect(await failingFields({ end: new Date('not a date') })).toEqual([
        'end',
      ]);
    });

    it('rejects a date sent as text', async () => {
      expect(await failingFields({ start: '2026-10-20' })).toEqual(['start']);
    });
  });

  describe('purpose', () => {
    it('rejects an empty purpose', async () => {
      expect(await failingFields({ purpose: '' })).toEqual(['purpose']);
    });

    it('rejects a purpose that is only spaces', async () => {
      expect(await failingFields({ purpose: '   ' })).toEqual(['purpose']);
    });

    it('accepts exactly 200 characters', async () => {
      expect(await failingFields({ purpose: 'x'.repeat(200) })).toEqual([]);
    });

    it('rejects 201 characters', async () => {
      expect(await failingFields({ purpose: 'x'.repeat(201) })).toEqual([
        'purpose',
      ]);
    });

    it('trims spaces around the purpose', async () => {
      const input = plainToInstance(CreateBookingInput, {
        ...valid(),
        purpose: '  Team meeting  ',
      });
      expect(input.purpose).toBe('Team meeting');
    });
  });
});
