import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectsGateway } from './objects.gateway';
import { ObjectClass, ObjectSchema } from './schemas/object.schema';
import { S3Module } from '../s3/s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectClass.name, schema: ObjectSchema },
    ]),
    S3Module,
    MulterModule.registerAsync({
      imports: [S3Module],
      useFactory: (s3Service: S3Service) => ({
        storage: s3Service.getMulterS3Storage(),
      }),
      inject: [S3Service],
    }),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway],
  exports: [ObjectsService],
})
export class ObjectsModule {}
