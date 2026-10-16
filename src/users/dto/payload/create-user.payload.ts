import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../entities/user.entity.js';

@ObjectType()
export class CreateUserPayload {
  @Field(() => User)
  user: User;
}
