import { fetchUnreadCount } from "@/redux/features/messagesSlice";
import { fetchNotifications } from "@/redux/features/notificationsSlice";
import { store } from "@/redux/store";
import { getAuthToken } from "@/utils/auth";
import { io, Socket } from "socket.io-client";

export enum SocketEvents {
  CONNECTED = "connected",
  NEW_MESSAGE = "new_message",
  MESSAGE_READ = "message_read",
  NEW_NOTIFICATION = "new_notification",
  NOTIFICATION_READ = "notification_read",
  ERROR = "error",
}

// Define a type for the event data
interface SocketEventData {
  type: string;
  payload?: unknown;
}

class SocketIOService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;

  // Initialize Socket.IO connection
  connect(): void {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("Socket.IO: No auth token available");
        return;
      }

      // Don't create a new connection if one already exists and is connected
      if (this.socket && this.connected) {
        return;
      }

      // Close existing connection if any
      this.disconnect();

      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

      // Reset connection attempts on manual connect
      this.connectionAttempts = 0;

      // Create Socket.IO connection with auth token
      this.socket = io(apiUrl, {
        auth: { token },
        query: { token }, // Including in query for backward compatibility
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 20000,
        transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
      });

      // Set up event handlers
      this.setupEventHandlers();
    } catch (error) {
      console.error("Socket.IO: Connection error", error);
      this.scheduleReconnect();
    }
  }

  // Set up Socket.IO event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on("connect", () => {
      this.connected = true;
      this.connectionAttempts = 0; // Reset attempts on successful connection

      // Fetch latest data on connection
      store.dispatch(fetchUnreadCount());
      store.dispatch(fetchNotifications({ page: 1, limit: 10 }));
    });

    // Connection closed
    this.socket.on("disconnect", (reason) => {
      this.connected = false;

      // Auto-reconnect for certain disconnect reasons
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "transport error"
      ) {
        this.scheduleReconnect();
      }
    });

    // Connection error
    this.socket.on("connect_error", () => {
      this.connected = false;
      this.scheduleReconnect();
    });

    // // Server confirmed connection
    // this.socket.on(SocketEvents.CONNECTED, (data) => {
    //   console.log("Socket.IO: Connected confirmation received", data);
    // });

    // New message received
    this.socket.on(SocketEvents.NEW_MESSAGE, () => {
      // console.log("Socket.IO: New message notification received", data);
      // Update unread count in Redux store
      store.dispatch(fetchUnreadCount());
    });

    // New notification received
    this.socket.on(SocketEvents.NEW_NOTIFICATION, () => {
      // Update notifications in Redux store
      store.dispatch(
        fetchNotifications({ page: 1, limit: 10, unreadOnly: false })
      );
    });

    // Error event
    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error("Socket.IO: Error event received", error);
    });

    // // Ping response (although Socket.IO handles this internally)
    // this.socket.on("pong", () => {
    //   console.log("Socket.IO: Pong received");
    // });
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.connectionAttempts++;

    if (this.connectionAttempts <= this.maxReconnectionAttempts) {
      // Exponential backoff: 2^attempts * 1000 ms, capped at 30 seconds
      const delay = Math.min(
        Math.pow(2, this.connectionAttempts) * 1000,
        30000
      );

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  // Send a message through Socket.IO
  sendMessage(event: string, data: unknown): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, { type: event, data });
    } else {
      console.warn("Socket.IO: Cannot send message, connection not open");
      // Try to reconnect
      if (!this.connected) {
        this.connect();
      }
    }
  }

  // Disconnect Socket.IO
  disconnect(): void {
    // Clear any pending reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Check if Socket.IO is connected
  isConnected(): boolean {
    return this.socket !== null && this.connected;
  }

  // Register event listener
  on(event: string, listener: (data: SocketEventData) => void): void {
    if (this.socket) {
      this.socket.on(event, listener);
    }
  }

  // Remove event listener
  off(event: string, listener: (data: SocketEventData) => void): void {
    if (this.socket) {
      this.socket.off(event, listener);
    }
  }

  // Force a refresh of the notification data
  refreshNotifications(): void {
    store.dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }
}

// Create a singleton instance
const socketService = new SocketIOService();
export default socketService;
