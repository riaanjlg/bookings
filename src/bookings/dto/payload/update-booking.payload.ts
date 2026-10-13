import { Field, ObjectType } from '@nestjs/graphql';
import { Booking } from '../../entities/booking.entity.js';

@ObjectType()
export class UpdateBookingPayload {
  @Field(() => Booking)
  booking: Booking;
}
