import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service.js';
import { ResourcesResolver } from './resources.resolver.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, Booking])],
  providers: [ResourcesService, ResourcesResolver],
  exports: [ResourcesService],
})
export class ResourcesModule {}
