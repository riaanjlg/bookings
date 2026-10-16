import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';
import { ResourcesService } from './resources/resources.service.js';
import { BookingsService } from './bookings/bookings.service.js';
import { ResourceType } from './resources/enums/resource-type.enum.js';
import { User } from './users/entities/user.entity.js';
import { Resource } from './resources/entities/resource.entity.js';

const users = [
  {
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
  },
  {
    name: 'Liam Peterson',
    email: 'liam.peterson@example.com',
  },
  {
    name: 'Jason Duval',
    email: 'jason.duval@example.com',
  },
  {
    name: 'Lucia Caminos',
    email: 'lucia.caminos@example.com',
  },
  {
    name: 'Cal Hampton',
    email: 'cal.hampton@example.com',
  },
  {
    name: 'Brian Heder',
    email: 'brian.heder@example.com',
  },
];

const resources = [
  {
    name: 'Boardroom A',
    type: ResourceType.ROOM,
    location: '1st Floor',
    capacity: 23,
  },
  {
    name: 'Meeting Room B',
    type: ResourceType.ROOM,
    location: 'Ground Floor',
    capacity: 12,
  },
  {
    name: 'Epson Projector',
    type: ResourceType.EQUIPMENT,
    location: 'Storage Room',
    capacity: 2,
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const usersService = app.get(UsersService);
  const resourcesService = app.get(ResourcesService);
  const bookingsService = app.get(BookingsService);

  const createdUsers: User[] = [];
  for (const user of users) {
    const createdUser = await usersService.create(user);
    createdUsers.push(createdUser);
  }

  const createdResources: Resource[] = [];
  for (const resource of resources) {
    const createdResource = await resourcesService.create(resource);
    createdResources.push(createdResource);
  }

  for (let i = 0; i < 12; i++) {
    const start = new Date(Date.UTC(2026, 9, 19 + i, 9, 0));
    const end = new Date(Date.UTC(2026, 9, 19 + i, 10, 0));
    await bookingsService.create({
      userId: createdUsers[i % 4].id.toString(),
      resourceId: createdResources[i % 3].id.toString(),
      start: start,
      end: end,
      purpose: 'testing',
    });
  }
  await app.close();
}
seed();
