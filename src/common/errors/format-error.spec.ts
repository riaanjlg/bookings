import { formatError } from './format-error.js';

const error = (extensions: Record<string, unknown>) => ({
  message: 'original message',
  extensions,
});

describe('formatError', () => {
  it('uses the code from our own errors and drops internals', () => {
    const result = formatError(
      error({
        code: 'BAD_REQUEST',
        stacktrace: ['at somewhere'],
        originalError: { code: 'BOOKING_OVERLAP' },
      }),
    );

    expect(result.message).toBe('original message');
    expect(result.extensions).toEqual({ code: 'BOOKING_OVERLAP' });
  });

  it('passes the failing fields through for validation errors', () => {
    const fields = [
      { field: 'purpose', message: 'purpose should not be empty' },
    ];
    const result = formatError(
      error({ originalError: { code: 'VALIDATION_FAILED', fields } }),
    );

    expect(result.extensions).toEqual({ code: 'VALIDATION_FAILED', fields });
  });

  it('hides the details of unexpected errors', () => {
    const result = formatError(
      error({
        code: 'INTERNAL_SERVER_ERROR',
        stacktrace: ['at mongo://secret-host'],
      }),
    );

    expect(result).toEqual({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('keeps ordinary client errors but removes the stacktrace', () => {
    const result = formatError(
      error({ code: 'NOT_FOUND', stacktrace: ['at somewhere'] }),
    );

    expect(result.message).toBe('original message');
    expect(result.extensions).toEqual({ code: 'NOT_FOUND' });
  });
});
