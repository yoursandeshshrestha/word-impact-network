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
  VIDEO_STATUS_UPDATE = 'video_status_update',
  VIDEO_PROCESSING_PROGRESS = 'video_processing_progress',
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}
