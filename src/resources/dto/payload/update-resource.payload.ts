import { Field, ObjectType } from '@nestjs/graphql';
import { Resource } from '../../entities/resource.entity.js';

@ObjectType()
export class UpdateResourcePayload {
  @Field(() => Resource)
  resource: Resource;
}
