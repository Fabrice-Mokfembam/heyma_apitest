import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { ObjectDocument } from './schemas/object.schema';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://heyma-webtest.vercel.app',
      'https://heyma-apitest.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ObjectsGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private configService: ConfigService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:objects')
  handleJoinObjects(client: Socket) {
    client.join('objects');
    console.log(`Client ${client.id} joined objects room`);
  }

  @SubscribeMessage('leave:objects')
  handleLeaveObjects(client: Socket) {
    client.leave('objects');
    console.log(`Client ${client.id} left objects room`);
  }

  broadcastObjectCreated(object: ObjectDocument) {
    this.server.to('objects').emit('object:created', {
      id: object._id?.toString() || '',
      title: object.title,
      description: object.description,
      imageUrl: object.imageUrl,
      createdAt: object.createdAt,
    });
  }

  broadcastObjectDeleted(objectId: string) {
    this.server.to('objects').emit('object:deleted', objectId);
  }
}
