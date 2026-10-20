import { registerAs } from '@nestjs/config';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { formatError } from '../errors/format-error.js';

export default registerAs('graphql', (): ApolloDriverConfig => ({
  autoSchemaFile: true,
  sortSchema: true,
  introspection: true,
  playground: true,
  formatError,
}));
