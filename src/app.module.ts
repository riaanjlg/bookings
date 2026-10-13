import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dbConfig from './common/config/db.config.js';
import graphqlConfig from './common/config/graphql.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ResourcesModule } from './resources/resources.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [dbConfig, graphqlConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ConfigType<typeof dbConfig>) => db,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      inject: [graphqlConfig.KEY],
      useFactory: (gql: ConfigType<typeof graphqlConfig>) => gql,
    }),
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
