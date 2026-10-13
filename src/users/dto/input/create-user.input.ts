import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field()
  @IsEmail()
  @MaxLength(254)
  email: string;
}
