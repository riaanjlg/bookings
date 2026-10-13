import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class DeleteUserInput {
  @Field(() => ID)
  @IsMongoId()
  id: string;
}
