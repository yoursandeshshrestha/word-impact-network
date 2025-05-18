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

      console.log("Socket.IO: Attempting to connect to", apiUrl);

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
      console.log("Socket.IO: Connected successfully");
      this.connected = true;
      this.connectionAttempts = 0; // Reset attempts on successful connection

      // If we were previously disconnected, fetch latest data
      if (this.wasDisconnected) {
        console.log("Socket.IO: Refreshing data after reconnection");
        this.wasDisconnected = false;
        this.refreshData();
      }

      // Emit event to any listeners
      this.emitToListeners("connect", {});
    });

    // Connection closed
    this.socket.on("disconnect", (reason) => {
      console.log(`Socket.IO: Disconnected - reason: ${reason}`);
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
      console.log("Socket.IO: New message received", data);

      // Immediately update unread count in Redux store
      store.dispatch(fetchUnreadCount());

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_MESSAGE, data);
    });

    // New notification received
    this.socket.on(SocketEvents.NEW_NOTIFICATION, (data) => {
      console.log("Socket.IO: New notification received", data);

      // Immediately update notifications in Redux store
      store.dispatch(
        fetchNotifications({ page: 1, limit: 10, unreadOnly: false })
      );

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_NOTIFICATION, data);
    });

    // Message read event
    this.socket.on(SocketEvents.MESSAGE_READ, (data) => {
      console.log("Socket.IO: Message read event", data);

      // Update unread count in Redux store
      store.dispatch(fetchUnreadCount());

      // Emit event to any listeners
      this.emitToListeners(SocketEvents.MESSAGE_READ, data);
    });

    // Notification read event
    this.socket.on(SocketEvents.NOTIFICATION_READ, (data) => {
      console.log("Socket.IO: Notification read event", data);

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
      console.log(`Socket.IO: Sending message - event: ${event}`, data);
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
      console.log("Socket.IO: Disconnecting");
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

    // If we're already connected and listener is being added for an existing event
    if (this.socket) {
      this.socket.on(event, listener);
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
