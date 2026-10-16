import { registerAs } from '@nestjs/config';
import type { ApolloDriverConfig } from '@nestjs/apollo';

export default registerAs('graphql', (): ApolloDriverConfig => ({
  autoSchemaFile: true,
  sortSchema: true,
}));
