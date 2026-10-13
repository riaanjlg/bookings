import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum.js';

@ObjectType({ description: 'user' })
@Entity('users')
export class User {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectId;

  @Field()
  @Column()
  name: string;

  @Field()
  @Index({ unique: true })
  @Column()
  email: string;

  @Field(() => UserRole)
  @Column()
  role: UserRole;

  @Index({ unique: true, sparse: true }) // sparse should be dropped in phase 4
  @Column({ nullable: true }) // this too
  externalId?: string; // should not be optional in phase 4
}
