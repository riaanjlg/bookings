import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ResourceType } from '../../enums/resource-type.enum.js';

@InputType()
export class CreateResourceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field(() => ResourceType)
  @IsEnum(ResourceType)
  type: ResourceType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity: number;
}
