import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service.js';
import { ResourcesResolver } from './resources.resolver.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  providers: [ResourcesService, ResourcesResolver],
})
export class ResourcesModule {}
