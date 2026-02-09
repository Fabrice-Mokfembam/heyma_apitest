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

    // Check if S3 is properly configured (not using placeholder values)
    const isConfigured =
      endpoint &&
      region &&
      accessKeyId &&
      secretAccessKey &&
      !endpoint.includes('your-s3-compatible-endpoint') &&
      !accessKeyId.includes('your-access-key');

    if (!isConfigured) {
      console.warn(
        '⚠️  S3 is not configured. File upload features will not work.',
      );
      console.warn(
        '   Please update S3 configuration in .env file to enable file uploads.',
      );
      // Create a dummy S3 client to prevent errors
      this.s3 = new S3Client({
        endpoint: 'https://dummy.endpoint.com',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy',
        },
      });
      return;
    }

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    console.log('✅ AWS S3 is properly configured');
    console.log(`📦 Bucket: ${this.configService.get<string>('S3_BUCKET')}`);
    console.log(`🌍 Region: ${region}`);
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
      // Note: ACL is removed because modern S3 buckets have ACLs disabled
      // Public access is controlled via bucket policy instead
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
    const region = this.configService.get<string>('S3_REGION');
    const bucket = this.configService.get<string>('S3_BUCKET');
    if (!region || !bucket) {
      throw new Error('S3 configuration is missing');
    }
    // AWS S3 URL format: https://bucket-name.s3.region.amazonaws.com/key
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
