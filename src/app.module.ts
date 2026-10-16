import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dbConfig from './common/config/db.config.js';
import graphqlConfig from './common/config/graphql.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ResourcesModule } from './resources/resources.module.js';
import { AppResolver } from './app.resolver.js';
import { UsersModule } from './users/users.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { UsersService } from './users/users.service.js';
import { ResourcesService } from './resources/resources.service.js';
import { BookingsService } from './bookings/bookings.service.js';
import { createLoaders } from './common/loaders/create-loaders.js';
import type { Request, Response } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [dbConfig, graphqlConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ConfigType<typeof dbConfig>) => db,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [UsersModule, ResourcesModule, BookingsModule],
      inject: [
        graphqlConfig.KEY,
        UsersService,
        ResourcesService,
        BookingsService,
      ],
      useFactory: (
        gql: ConfigType<typeof graphqlConfig>,
        usersService: UsersService,
        resourcesService: ResourcesService,
        bookingsService: BookingsService,
      ) => ({
        ...gql,
        context: ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
          loaders: createLoaders(
            usersService,
            resourcesService,
            bookingsService,
          ),
        }),
      }),
    }),
    ResourcesModule,
    UsersModule,
    BookingsModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
