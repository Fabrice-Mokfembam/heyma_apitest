import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectClass, ObjectDocument } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectClass.name) private objectModel: Model<ObjectDocument>,
    private s3Service: S3Service,
  ) {}

  async create(
    createObjectDto: CreateObjectDto,
    imageUrl: string,
  ): Promise<ObjectClass> {
    const newObject = new this.objectModel({
      ...createObjectDto,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newObject.save();
  }

  async findAll(): Promise<ObjectClass[]> {
    return this.objectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ObjectClass> {
    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }
    return object;
  }

  async delete(id: string): Promise<void> {
    const object = await this.findOne(id);

    // Extract the key from the imageUrl
    const urlParts = object.imageUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Get objects/filename.ext

    // Delete from S3 (you might want to implement this with proper error handling)
    // For now, we'll just delete from MongoDB

    await this.objectModel.findByIdAndDelete(id).exec();
  }
}
