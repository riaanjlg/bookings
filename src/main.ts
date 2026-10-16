import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { mongoQueriesLogger } from './common/loggers/mongo-queries.logger.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = await app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
  });

  if (process.env.NODE_ENV !== 'production') mongoQueriesLogger(app);

  const port = Number(config.get<number>('PORT') ?? 3000);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`GraphQL: http://localhost:${port}/graphql`);
}

await bootstrap();
