import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketNotificationDto } from 'lib/dto/volt-pay.dto';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SocketGateway.name);

  emitNotificationEvent({ topic, payload }: SocketNotificationDto) {
    this.server.emit(topic, payload);
  }

  afterInit() {
    this.logger.log('Notification Socket Server initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`New Notification socket client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Notification socket client disconnected: ${client.id}`);
  }
}
