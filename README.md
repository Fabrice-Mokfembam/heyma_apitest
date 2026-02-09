# Heyama Objects API

A NestJS REST API for managing objects with image upload functionality, real-time updates via Socket.IO, and MongoDB integration.

## Features

- RESTful API for CRUD operations on objects
- Image upload to S3-compatible storage
- Real-time updates using Socket.IO
- MongoDB for data persistence
- Comprehensive validation and error handling
- CORS configuration for frontend integration

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: MongoDB
- **File Storage**: S3-compatible storage (DigitalOcean Spaces, MinIO, etc.)
- **Real-time**: Socket.IO
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- S3-compatible storage service
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd heyma_apitest
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/heyma-objects

# S3 Configuration (use any S3-compatible service except AWS)
S3_ENDPOINT=https://your-s3-compatible-endpoint.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=your-region

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Create Object
```http
POST /objects
Content-Type: multipart/form-data

title=Example Object
description=This is an example object
image=@image-file.jpg
```

### Get All Objects
```http
GET /objects
```

### Get Single Object
```http
GET /objects/:id
```

### Delete Object
```http
DELETE /objects/:id
```

## Socket.IO Events

### Client Events
- `join:objects` - Join the objects room for real-time updates
- `leave:objects` - Leave the objects room

### Server Events
- `object:created` - Emitted when a new object is created
- `object:deleted` - Emitted when an object is deleted

## S3 Storage Setup

### Recommended S3-compatible Services

1. **DigitalOcean Spaces**
   - Create a Space
   - Generate API keys
   - Use the Spaces endpoint URL

2. **MinIO**
   - Self-hosted S3-compatible storage
   - Perfect for development/testing

3. **Wasabi**
   - Affordable S3-compatible storage
   - Simple setup process

### Bucket Configuration

- Create a bucket with public read access
- Configure CORS if needed for direct browser access
- Ensure the bucket name is unique

## Database Schema

### Object Collection
```javascript
{
  _id: ObjectId,
  title: String, // max 100 chars
  description: String, // max 500 chars
  imageUrl: String, // S3 URL
  createdAt: Date, // ISO date
  updatedAt: Date // ISO date
}
```

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error type",
  "message": "User-friendly error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/objects"
}
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Example API Usage

### Create Object (curl)
```bash
curl -X POST http://localhost:3001/objects \
  -F "title=Test Object" \
  -F "description=This is a test object" \
  -F "image=@test-image.jpg"
```

### Get Objects (curl)
```bash
curl http://localhost:3001/objects
```

### Delete Object (curl)
```bash
curl -X DELETE http://localhost:3001/objects/{id}
```

## Frontend Integration

### Environment Variables for Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Socket.IO Client Example
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join objects room
socket.emit('join:objects');

// Listen for new objects
socket.on('object:created', (object) => {
  console.log('New object created:', object);
});

// Listen for deleted objects
socket.on('object:deleted', (objectId) => {
  console.log('Object deleted:', objectId);
});
```

## Deployment Considerations

1. **Environment Variables**: Ensure all required environment variables are set in production
2. **Database Security**: Use MongoDB authentication in production
3. **S3 Security**: Use IAM policies and bucket permissions properly
4. **CORS**: Update CORS origins for production domains
5. **SSL/TLS**: Use HTTPS in production

## What You Need to Provide

### 1. MongoDB Connection
- MongoDB instance (local or cloud)
- Connection string URI
- Database name (default: `heyma-objects`)

### 2. S3-compatible Storage
- Service provider (DigitalOcean Spaces, MinIO, Wasabi, etc.)
- Endpoint URL
- Access key and secret key
- Bucket name
- Region

### 3. Frontend URL (for CORS)
- Your frontend application URL
- Default: `http://localhost:3000`

### Example Setup with DigitalOcean Spaces

1. Create a DigitalOcean Space
2. Generate API keys
3. Configure your `.env`:
```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_BUCKET=heyma-objects
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=nyc3
```

### Example Setup with MinIO (Local Development)

1. Install and run MinIO:
```bash
docker run -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

2. Configure your `.env`:
```env
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=heyma-objects
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

## License

This project is licensed under the MIT License.
