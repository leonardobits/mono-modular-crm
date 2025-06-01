import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { appConfig } from '@/config/app.config';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(env.NEXT_PUBLIC_WS_URL, {
      reconnection: true,
      reconnectionAttempts: appConfig.websocket.reconnectAttempts,
      reconnectionDelay: appConfig.websocket.reconnectInterval,
      timeout: appConfig.api.timeout,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= appConfig.websocket.reconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.on(event, callback);
  }

  unsubscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }
}

export const websocket = new WebSocketClient();
export default websocket; 