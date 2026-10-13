import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ResourceType } from '../enums/resource-type.enum.js';

@ObjectType({ description: 'resource' })
@Entity('resources')
export class Resource {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectId;

  @Field()
  @Index({ unique: true })
  @Column()
  name: string;

  @Field(() => ResourceType)
  @Column()
  type: ResourceType;

  @Field()
  @Column()
  location: string;

  @Field(() => Int)
  @Column()
  capacity: number;
}
