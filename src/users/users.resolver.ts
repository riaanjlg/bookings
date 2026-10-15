import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { CreateUserPayload } from './dto/payload/create-user.payload.js';
import { CreateUserInput } from './dto/input/create-user.input.js';
import { UpdateUserPayload } from './dto/payload/update-user.payload.js';
import { UpdateUserInput } from './dto/input/update-user.input.js';
import { DeleteUserPayload } from './dto/payload/delete-user.payload.js';
import { DeleteUserInput } from './dto/input/delete-user.input.js';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  user(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => CreateUserPayload)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<CreateUserPayload> {
    const user = await this.usersService.create(input);
    return { user };
  }

  @Mutation(() => UpdateUserPayload)
  async updateUser(
    @Args('input') input: UpdateUserInput,
  ): Promise<UpdateUserPayload> {
    const user = await this.usersService.update(input);
    return { user };
  }

  @Mutation(() => DeleteUserPayload)
  async deleteUser(
    @Args('input') input: DeleteUserInput,
  ): Promise<DeleteUserPayload> {
    await this.usersService.remove(input.id);
    return { deletedUserId: input.id };
  }
}
