import { registerAs } from '@nestjs/config';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import type { Request, Response } from 'express';

export default registerAs('graphql', (): ApolloDriverConfig => ({
  autoSchemaFile: true,
  sortSchema: true,
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
}));
