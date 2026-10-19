import { Field, ID, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  purpose: string;
}
