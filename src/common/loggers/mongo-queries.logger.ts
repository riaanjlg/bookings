import type { INestApplication } from '@nestjs/common';
import type { MongoClient } from 'mongodb';
import { DataSource } from 'typeorm';

export function mongoQueriesLogger(app: INestApplication) {
  const driver = app.get(DataSource).driver as unknown as {
    queryRunner: { databaseConnection: MongoClient };
  };

  let count = 0;
  driver.queryRunner.databaseConnection.on('commandStarted', (event) => {
    const isRead = ['find', 'aggregate', 'count'].includes(event.commandName);
    if (isRead) {
      console.log(
        `#${++count} ${event.commandName} ${event.command[event.commandName]}`,
      );
    }
  });
}
