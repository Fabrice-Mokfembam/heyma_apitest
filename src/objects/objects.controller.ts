import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { S3Service } from '../s3/s3.service';
import { ObjectsGateway } from './objects.gateway';
import { ObjectClass, ObjectDocument } from './schemas/object.schema';

interface ObjectResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

interface UploadedFile extends Express.Multer.File {
  location?: string;
}

@Controller('objects')
export class ObjectsController {
  constructor(
    private readonly objectsService: ObjectsService,
    private readonly objectsGateway: ObjectsGateway,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Invalid image format. Only PNG, JPG, and GIF are allowed.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createObjectDto: CreateObjectDto,
    @UploadedFile() file: UploadedFile,
  ): Promise<ObjectResponse> {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    try {
      const imageUrl = file.location || ''; // S3 URL returned by multer-s3
      const newObject = await this.objectsService.create(
        createObjectDto,
        imageUrl,
      );

      // Emit real-time event
      this.objectsGateway.broadcastObjectCreated(newObject);

      return {
        id: (newObject as any)._id?.toString() || '',
        title: newObject.title,
        description: newObject.description,
        imageUrl: newObject.imageUrl,
        createdAt: newObject.createdAt,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create object');
    }
  }

  @Get()
  async findAll(): Promise<ObjectResponse[]> {
    const objects = await this.objectsService.findAll();
    return objects.map((obj) => ({
      id: (obj as any)._id?.toString() || '',
      title: obj.title,
      description: obj.description,
      imageUrl: obj.imageUrl,
      createdAt: obj.createdAt,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ObjectResponse> {
    const object = await this.objectsService.findOne(id);
    return {
      id: (object as any)._id?.toString() || '',
      title: object.title,
      description: object.description,
      imageUrl: object.imageUrl,
      createdAt: object.createdAt,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.objectsService.delete(id);

      // Emit real-time event
      this.objectsGateway.broadcastObjectDeleted(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete object');
    }
  }
}
