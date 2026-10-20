import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { mongoQueriesLogger } from './common/loggers/mongo-queries.logger.js';
import { ErrorCode } from './common/errors/error-codes.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          code: ErrorCode.VALIDATION_FAILED,
          fields: errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints ?? {})[0],
          })),
        }),
    }),
  );

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
  });

  if (process.env.NODE_ENV !== 'production') mongoQueriesLogger(app);

  const port = Number(config.get<number>('PORT') ?? 3000);
  await app.listen(port);
}

await bootstrap();
