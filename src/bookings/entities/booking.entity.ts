import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@ObjectType({ description: 'booking' })
@Entity('bookings')
export class Booking {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectId;

  @Field(() => ID)
  @Column()
  resourceId: ObjectId;

  @Field(() => ID)
  @Column()
  userId: ObjectId;

  @Field()
  @Column()
  start: Date;

  @Field()
  @Column()
  end: Date;

  @Field()
  @Column()
  purpose: string;
}
