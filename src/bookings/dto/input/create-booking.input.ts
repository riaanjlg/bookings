import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateBookingInput {
  @Field(() => ID)
  @IsMongoId()
  resourceId: string;

  @Field(() => ID)
  @IsMongoId()
  userId: string;

  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  purpose: string;
}
