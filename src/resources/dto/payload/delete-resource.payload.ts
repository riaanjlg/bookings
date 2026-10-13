import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteResourcePayload {
  @Field(() => ID)
  deletedResourceId: string;
}
