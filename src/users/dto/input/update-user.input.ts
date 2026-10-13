import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input.js';
import { IsMongoId } from 'class-validator';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  @IsMongoId()
  id: string;
}
