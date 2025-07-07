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

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      // Remove /api/v1 from the URL as Socket.IO needs the base URL
      const socketUrl = apiUrl.replace(/\/api\/v1$/, "");

      // Reset connection attempts on manual connect
      this.connectionAttempts = 0;

      // Create Socket.IO connection with cookies (no need for explicit token)
      this.socket = io(socketUrl, {
        path: "/socket.io",
        withCredentials: true, // This will send cookies automatically
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
      console.error("SocketIOService: Connection error", error);
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
      console.error("SocketIOService: Connection error", error);
      this.connected = false;
      this.wasDisconnected = true;
      this.scheduleReconnect();

      // Emit event to any listeners
      this.emitToListeners("connect_error", { error });
    });

    // New message received
    this.socket.on(SocketEvents.NEW_MESSAGE, (data) => {
      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_MESSAGE, data);
    });

    // New notification received
    this.socket.on(SocketEvents.NEW_NOTIFICATION, (data) => {
      // Emit event to any listeners
      this.emitToListeners(SocketEvents.NEW_NOTIFICATION, data);
    });

    // Message read event
    this.socket.on(SocketEvents.MESSAGE_READ, (data) => {
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
      console.error("SocketIOService: Received ERROR event", error);
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
          console.error("SocketIOService: Error in listener", error);
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

      this.reconnectTimer = setTimeout(() => {
        // Always attempt to reconnect (cookies will be sent automatically)
        this.connect();
      }, delay);
    } else {
      // Reset connection attempts after max attempts
      this.connectionAttempts = 0;
    }
  }

  // Method to refresh all real-time data
  private refreshData(): void {
    // No need to fetch unread counts anymore
  }

  // Send a message through Socket.IO
  sendMessage(event: string, data: unknown): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, { type: event, data });
    } else {
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
      this.refreshData();
    } else {
      // Try to reconnect first
      this.connect();
    }
  }
}

// Create a singleton instance
const socketService = new SocketIOService();
export default socketService;
