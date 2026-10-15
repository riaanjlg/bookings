import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Booking } from './entities/booking.entity.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingPayload } from './dto/payload/create-booking.payload.js';
import { CreateBookingInput } from './dto/input/create-booking.input.js';
import { UpdateBookingInput } from './dto/input/update-booking.input.js';
import { UpdateBookingPayload } from './dto/payload/update-booking.payload.js';
import { DeleteBookingPayload } from './dto/payload/delete-booking.payload.js';
import { DeleteBookingInput } from './dto/input/delete-booking.input.js';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Query(() => [Booking])
  bookings(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Query(() => Booking, { nullable: true })
  booking(@Args('id', { type: () => ID }) id: string): Promise<Booking | null> {
    return this.bookingsService.findOne(id);
  }

  @Mutation(() => CreateBookingPayload)
  async createBooking(
    @Args('input') input: CreateBookingInput,
  ): Promise<CreateBookingPayload> {
    const booking = await this.bookingsService.create(input);
    return { booking };
  }

  @Mutation(() => UpdateBookingPayload)
  async updateBooking(
    @Args('input') input: UpdateBookingInput,
  ): Promise<UpdateBookingPayload> {
    const booking = await this.bookingsService.update(input);
    return { booking };
  }

  @Mutation(() => DeleteBookingPayload)
  async deleteBooking(
    @Args('input') input: DeleteBookingInput,
  ): Promise<DeleteBookingPayload> {
    await this.bookingsService.remove(input.id);
    return { deletedBookingId: input.id };
  }
}
