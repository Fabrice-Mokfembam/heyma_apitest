import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get MongoDB connection from NestJS
  const connection = app.get<Connection>(getConnectionToken());

  // MongoDB connection event listeners
  connection.on('connected', () => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${connection.db.databaseName}`);
  });

  connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
  });

  // Log if already connected
  if (connection.readyState === 1) {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${connection.db.databaseName}`);
  }

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
