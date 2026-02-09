import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { ConfigService } from '@nestjs/config';
import { StorageEngine } from 'multer';
import { Request } from 'express';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');

    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required S3 configuration');
    }

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for some S3-compatible services
    });
  }

  getS3() {
    return this.s3;
  }

  getMulterS3Storage(): StorageEngine {
    const bucket = this.configService.get<string>('S3_BUCKET');
    if (!bucket) {
      throw new Error('S3_BUCKET is not configured');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return multerS3({
      s3: this.s3,
      bucket,
      metadata: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: any, metadata?: any) => void,
      ) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: any, key?: string) => void,
      ) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop();
        const filename = `objects/${uniqueSuffix}.${extension}`;
        cb(null, filename);
      },
    }) as StorageEngine;
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const bucket = this.configService.get<string>('S3_BUCKET');
    if (!endpoint || !bucket) {
      throw new Error('S3 configuration is missing');
    }
    return `${endpoint}/${bucket}/${key}`;
  }
}
