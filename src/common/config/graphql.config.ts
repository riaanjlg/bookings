import { registerAs } from '@nestjs/config';
import type { ApolloDriverConfig } from '@nestjs/apollo';

export default registerAs('graphql', (): ApolloDriverConfig => ({
  autoSchemaFile: true,
  sortSchema: true,
  formatError: (formattedError) => {
    const original = formattedError.extensions?.originalError as
      { code?: string } | undefined;
    if (!original?.code) return formattedError;

    return {
      ...formattedError,
      extensions: { ...formattedError.extensions, code: original.code },
    };
  },
}));
