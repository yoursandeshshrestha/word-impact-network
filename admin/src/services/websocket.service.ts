// src/services/websocket.service.ts
import { getAuthToken } from "@/utils/auth";
import { store } from "@/redux/store";
import { fetchUnreadCount } from "@/redux/features/messagesSlice";

export enum SocketEvents {
  CONNECTED = "connected",
  NEW_MESSAGE = "new_message",
  MESSAGE_READ = "message_read",
  ERROR = "error",
}

// Define a type for the event data
interface WebSocketEventData {
  type: string;
  payload?: unknown; // Use a more specific type if possible
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  // Initialize WebSocket connection
  connect(): void {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("WebSocket: No auth token available");
        return;
      }

      // Close existing connection if any
      this.disconnect();

      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      // Convert http(s) URL to ws(s) URL
      const wsUrl = `${apiUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://")}/ws`;

      console.log("WebSocket: Connecting to", wsUrl);

      // Create new WebSocket connection with auth token
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("WebSocket: Connection error", error);
      this.attemptReconnect();
    }
  }

  // Handle WebSocket open event
  private handleOpen(): void {
    console.log("WebSocket: Connection established successfully");
    this.reconnectAttempts = 0;

    // Start ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      this.ping();
    }, 30000); // Ping every 30 seconds
  }

  // Send ping to keep connection alive
  private ping(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "ping" }));
    }
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket: Message received:", data);

      // Handle different event types
      if (data.type === SocketEvents.NEW_MESSAGE) {
        console.log("WebSocket: New message notification received");

        // Update unread count in Redux store
        store.dispatch(fetchUnreadCount());
      } else if (data.type === SocketEvents.CONNECTED) {
        console.log("WebSocket: Connected confirmation received");
      } else if (data.type === "pong") {
        console.log("WebSocket: Pong received");
      }
    } catch (error) {
      console.error("WebSocket: Error parsing message", error);
    }
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    console.log("WebSocket: Connection closed", event.code, event.reason);

    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.socket = null;

    // Attempt to reconnect if it wasn't a normal closure
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  // Handle WebSocket error event
  private handleError(event: Event): void {
    console.error("WebSocket: Error occurred:", event);
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("WebSocket: Maximum reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(
      `WebSocket: Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Send a message through the WebSocket
  sendMessage(type: string, data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn("WebSocket: Cannot send message, connection not open");
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Update 'on' method with specific type
  on(event: string, listener: (data: WebSocketEventData) => void): void {
    if (this.socket) {
      this.socket.addEventListener("message", (e: MessageEvent) => {
        const data: WebSocketEventData = JSON.parse(e.data);
        if (data.type === event) {
          listener(data);
        }
      });
    }
  }

  // Update 'off' method to accept event type and listener
  off(event: string, listener: (data: WebSocketEventData) => void): void {
    if (this.socket) {
      this.socket.removeEventListener("message", (e: MessageEvent) => {
        const data: WebSocketEventData = JSON.parse(e.data);
        if (data.type === event) {
          listener(data);
        }
      });
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
