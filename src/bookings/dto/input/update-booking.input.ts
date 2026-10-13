import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateBookingInput } from '../input/create-booking.input.js';
import { IsMongoId } from 'class-validator';

@InputType()
export class UpdateBookingInput extends PartialType(
  OmitType(CreateBookingInput, ['userId', 'resourceId']),
) {
  @Field(() => ID)
  @IsMongoId()
  id: string;
}
