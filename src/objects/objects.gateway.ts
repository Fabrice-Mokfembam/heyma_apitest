import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ObjectsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private configService: ConfigService) {}

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

  broadcastObjectCreated(object: any) {
    this.server.to('objects').emit('object:created', {
      id: object._id,
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
