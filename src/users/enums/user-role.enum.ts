import { registerEnumType } from '@nestjs/graphql';
import { ResourceType } from '../../resources/enums/resource-type.enum.js';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'What role is assigned to an user',
});
