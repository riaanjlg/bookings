import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateResourceInput } from '../input/create-resource.input.js';
import { IsMongoId } from 'class-validator';

@InputType()
export class UpdateResourceInput extends PartialType(CreateResourceInput) {
  @Field(() => ID)
  @IsMongoId()
  id: string;
}
