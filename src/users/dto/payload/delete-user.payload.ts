import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteUserPayload {
  @Field(() => ID)
  deletedUserId: string;
}
