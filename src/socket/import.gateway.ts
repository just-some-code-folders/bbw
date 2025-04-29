import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: "*",  // Allow frontend origin
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],  // Ensure both transports are allowed

})
export class ImportGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    console.log("Client connected: ", client);
    console.log('Message received:', payload);
    this.server.emit('message', payload);
  }

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  sendLog(log: string) {
    this.server.emit('import-log', log);
  }

  sendProgress(progress: number) {
    this.server.emit('import-progress', progress);
  }
  
}
