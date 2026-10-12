import { registerEnumType } from '@nestjs/graphql';

export enum ResourceType {
  ROOM = 'ROOM',
  EQUIPMENT = 'EQUIPMENT',
}

registerEnumType(ResourceType, {
  name: 'ResourceType',
  description: 'What type of thing can be booked',
});
