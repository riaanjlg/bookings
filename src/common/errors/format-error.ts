import type { GraphQLFormattedError } from 'graphql';

type CustomErrorBody = { code?: string; fields?: unknown };

export function formatError(
  formattedError: GraphQLFormattedError,
): GraphQLFormattedError {
  const { originalError, stacktrace, ...extensions } =
    formattedError.extensions ?? {};
  const custom = originalError as CustomErrorBody | undefined;

  if (custom?.code) {
    return {
      ...formattedError,
      extensions: {
        ...extensions,
        code: custom.code,
        ...(custom.fields ? { fields: custom.fields } : {}),
      },
    };
  }

  if (extensions.code === 'INTERNAL_SERVER_ERROR') {
    return {
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  }

  return { ...formattedError, extensions };
}
