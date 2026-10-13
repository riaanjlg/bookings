import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Resource } from './entities/resource.entity.js';
import { ResourcesService } from './resources.service.js';
import { CreateResourcePayload } from './dto/payload/create-resource.payload.js';
import { CreateResourceInput } from './dto/input/create-resource.input.js';
import { UpdateResourcePayload } from './dto/payload/update-resource.payload.js';
import { UpdateResourceInput } from './dto/input/update-resource.input.js';
import { DeleteResourcePayload } from './dto/payload/delete-resource.payload.js';
import { DeleteResourceInput } from './dto/input/delete-resource.input.js';

@Resolver(() => Resource)
export class ResourcesResolver {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Query(() => [Resource])
  resources(): Promise<Resource[]> {
    return this.resourcesService.findAll();
  }

  @Query(() => Resource, { nullable: true })
  resource(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Resource | null> {
    return this.resourcesService.findOne(id);
  }

  @Mutation(() => CreateResourcePayload)
  async createResource(
    @Args('input') input: CreateResourceInput,
  ): Promise<CreateResourcePayload> {
    const resource = await this.resourcesService.create(input);
    return { resource };
  }

  @Mutation(() => UpdateResourcePayload)
  async updateResource(
    @Args('input') input: UpdateResourceInput,
  ): Promise<UpdateResourcePayload> {
    const resource = await this.resourcesService.update(input);
    return { resource };
  }

  @Mutation(() => DeleteResourcePayload)
  async deleteResource(
    @Args('input') input: DeleteResourceInput,
  ): Promise<DeleteResourcePayload> {
    await this.resourcesService.remove(input.id);
    return { deletedResourceId: input.id };
  }
}
