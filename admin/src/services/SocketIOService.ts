import { fetchUnreadCount } from "@/redux/features/messagesSlice";
import { fetchNotifications } from "@/redux/features/notificationsSlice";
import { store } from "@/redux/store";
import { io, Socket } from "socket.io-client";

export enum SocketEvents {
  CONNECTED = "connected",
  NEW_MESSAGE = "new_message",
  MESSAGE_READ = "message_read",
  NEW_NOTIFICATION = "new_notification",
  NOTIFICATION_READ = "notification_read",
  ERROR = "error",
}

class SocketIOService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private debounceTimers: { [key: string]: NodeJS.Timeout } = {};
  private wasDisconnected: boolean = false;
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();

  // Initialize Socket.IO connection
  connect(): void {
    try {
      // Don't create a new connection if one already exists and is connected
      if (this.socket && this.connected) {
        return;
      }

      // Close existing connection if any
      this.disconnect();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      // Remove /api/v1 from the URL as Socket.IO needs the base URL
      const socketUrl = apiUrl.replace(/\/api\/v1$/, "");

      // Reset connection attempts on manual connect
      this.connectionAttempts = 0;

      // Create Socket.IO connection with cookies (HTTP-only cookies will be included automatically)
      this.socket = io(socketUrl, {
        path: "/socket.io",
        withCredentials: true, // Include cookies in the connection
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

      // If we were previously disconnected, fetch latest data
      if (this.wasDisconnected) {
        this.wasDisconnected = false;
        this.refreshData();
      }

      // Emit event to any listeners
      this.emitToListeners("connect", {});
    });

    // Connection closed
    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      this.wasDisconnected = true;

      // Auto-reconnect for certain disconnect reasons
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "transport error"
      ) {
        this.scheduleReconnect();
      }

      // Emit event to any listeners
      this.emitToListeners("disconnect", { reason });
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO: Connection error", error);
      this.connected = false;
      this.wasDisconnected = true;
      this.scheduleReconnect();

      // Emit event to any listeners
      this.emitToListeners("connect_error", { error });
    });

    // New message received
    this.socket.on(SocketEvents.NEW_MESSAGE, (data) => {
      // Don't automatically fetch unread count here since the frontend
      // is now handling this manually in the useWebSocketConnection hook
      // This prevents conflicts with our manual unread count management

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_MESSAGE, data);
    });

    // New notification received
    this.socket.on(SocketEvents.NEW_NOTIFICATION, (data) => {
      // Immediately update notifications in Redux store
      store.dispatch(
        fetchNotifications({ page: 1, limit: 10, unreadOnly: false })
      );

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_NOTIFICATION, data);
    });

    // Message read event
    this.socket.on(SocketEvents.MESSAGE_READ, (data) => {
      // Don't automatically fetch unread count here since the frontend
      // is already handling this through the markConversationAsRead action
      // This prevents conflicts with local state updates

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.MESSAGE_READ, data);
    });

    // Notification read event
    this.socket.on(SocketEvents.NOTIFICATION_READ, (data) => {
      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NOTIFICATION_READ, data);
    });

    // Error event
    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error("Socket.IO: Error event received", error);

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.ERROR, { error });
    });
  }

  // Emit event to all registered listeners
  private emitToListeners(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `Socket.IO: Error in listener for event ${event}`,
            error
          );
        }
      });
    }
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

      console.log(
        `Socket.IO: Scheduling reconnect in ${delay}ms (attempt ${this.connectionAttempts})`
      );

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.warn(
        `Socket.IO: Maximum reconnection attempts (${this.maxReconnectionAttempts}) reached`
      );
      // Reset connection attempts after max attempts
      this.connectionAttempts = 0;
    }
  }

  // Method to refresh all real-time data
  private refreshData(): void {
    // Fetch updated data after reconnection
    Promise.all([
      store.dispatch(fetchUnreadCount()),
      store.dispatch(fetchNotifications({ page: 1, limit: 10 })),
    ]).catch((error) => {
      console.error(
        "Socket.IO: Error refreshing data after reconnection:",
        error
      );
    });
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

    // Clear all debounce timers
    Object.keys(this.debounceTimers).forEach((key) => {
      clearTimeout(this.debounceTimers[key]);
      delete this.debounceTimers[key];
    });

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
  on(event: string, listener: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  // Remove event listener
  off(event: string, listener: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }

    if (this.socket) {
      this.socket.off(event, listener);
    }
  }

  // Force a refresh of all real-time data
  refreshAllData(): void {
    if (this.connected) {
      console.log("Socket.IO: Manually refreshing all data");
      this.refreshData();
    } else {
      // Try to reconnect first
      console.log(
        "Socket.IO: Not connected, attempting to connect before refreshing data"
      );
      this.connect();
    }
  }

  // Force a refresh of just notification data
  refreshNotifications(): void {
    if (this.connected) {
      console.log("Socket.IO: Manually refreshing notifications");
      store.dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }
}

// Create a singleton instance
const socketService = new SocketIOService();
export default socketService;
