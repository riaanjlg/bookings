import { Field, ObjectType } from '@nestjs/graphql';
import { Booking } from '../../entities/booking.entity.js';

@ObjectType()
export class CreateBookingPayload {
  @Field(() => Booking)
  booking: Booking;
}
