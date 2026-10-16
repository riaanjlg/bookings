import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export const toObjectId = (id: string): ObjectId => {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException(`"${id}" is not a valid id`);
  }
  return new ObjectId(id);
};
