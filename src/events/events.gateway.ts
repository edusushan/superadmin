// src/chat/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from './user.type';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('SupportGateway');
  constructor(
    private chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    try {
      await this.authenticateSocket(client);
    } catch (error) {
      this.handleConnectionError(client, error);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const payload = JSON.parse(data);
    const message = await this.chatService.sendMessage(
      payload.senderId,
      payload.receiverId,
      payload.message,
    );
    this.server.to(payload.senderId).emit('newMessage', message);
    this.server.to(payload.receiverId).emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('joinSupport')
  handleJoinChat(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const payload = JSON.parse(data);
    this.validateRoomTypeAndParticipants(payload.participants, payload.userId);
    console.log('Client Joined the chat');
    client.join(payload.userId);
  }

  private validateRoomTypeAndParticipants(
    participants: string[],
    userId: string,
  ): void {
    if (participants.includes(userId)) {
      throw new WsException(
        'The room owner or updater should not be included in the participants list.',
      );
    }

    if (participants.length !== 1) {
      throw new WsException(
        'Direct chat must include exactly one participant aside from the room owner or updater.',
      );
    }

    const uniqueParticipantIds = new Set(participants);
    if (uniqueParticipantIds.size !== participants.length) {
      throw new WsException('The participants list contains duplicates.');
    }
  }
  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);

    return this.jwtService.verify<UserPayload>(token, {
      secret: 'at-secret',
    });
  }
  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('No authorization header found');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid or missing token');

    return token;
  }
}
