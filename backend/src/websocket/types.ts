export enum SocketEvents {
  CONNECTION = 'connection',
  CONNECTED = 'connected',
  NEW_MESSAGE = 'new_message',
  MESSAGE_READ = 'message_read',
  DISCONNECT = 'disconnect',
  ANNOUNCEMENT = 'announcement',
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_READ_ALL = 'notification_read_all',
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}
