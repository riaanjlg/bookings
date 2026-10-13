import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'mongodb',
  url: process.env.MONGODB_URL,
  database: process.env.MONGODB_DB,
  autoLoadEntities: true,
  synchronize: true,
}));
