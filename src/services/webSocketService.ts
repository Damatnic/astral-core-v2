/**
 * Enhanced WebSocket Service for Astral Core
 * Handles real-time communication for chat, notifications, and live updates
 */

import * as React from 'react';
import { auth0Service } from './auth0Service';
import notificationService from './notificationService';

export type WebSocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'message'
  | 'typing'
  | 'presence'
  | 'notification'
  | 'dilemma_update'
  | 'helper_status'
  | 'crisis_alert'
  | 'session_update'
  | 'achievement_unlocked'
  | 'room_joined'
  | 'room_left'
  | 'user_joined'
  | 'user_left'
  | 'check_missed_notifications';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  room?: string;
  event?: WebSocketEvent;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: number;
  type: 'text' | 'emoji' | 'system' | 'crisis';
  roomId?: string;
  metadata?: any;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'crisis';
  timestamp: number;
  actionUrl?: string;
  urgency?: 'low' | 'normal' | 'high' | 'crisis';
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  room: string;
  isTyping: boolean;
}

export interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectInterval = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly messageQueue: WebSocketMessage[] = [];
  private readonly listeners = new Map<string, Set<(message: any) => void>>();
  private readonly connectionListeners = new Set<(connected: boolean) => void>();
  private readonly eventHandlers = new Map<WebSocketEvent, Set<(data: unknown) => void>>();
  private readonly typingIndicators = new Map<string, Map<string, NodeJS.Timeout>>();
  private readonly presenceData = new Map<string, PresenceData>();
  private readonly roomSubscriptions = new Set<string>();
  private demoMode = false;
  private connectionPromise: Promise<void> | null = null;
  private userId: string | null = null;

  constructor(private readonly url: string) {
    // Check if we're in demo mode or if WebSocket server is unavailable
    this.checkDemoMode();
    this.setupLifecycleListeners();
    if (!this.demoMode) {
      this.connect();
    }
  }

  private checkDemoMode() {
    // Enable demo mode if no backend is available
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = this.url.includes('localhost');
    
    if (isDevelopment && isLocalhost) {
      // Try a quick ping to see if server is available
      this.demoMode = true; // Default to demo mode for now
    }
  }

  private setupLifecycleListeners() {
    // Reconnect when coming back online
    window.addEventListener('online', () => {
      console.log('Network is back online, reconnecting WebSocket...');
      this.connect();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, stop heartbeat
        this.stopHeartbeat();
      } else if (this.isConnected()) {
        // Page is visible again, restart heartbeat and check for missed notifications
        this.startHeartbeat();
        this.checkMissedNotifications();
      }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  public async connect(): Promise<void> {
    // Return existing connection promise if connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Already connected
    if (this.isConnected() && this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.demoMode) {
      // Don't try to connect in demo mode
      this.simulateDemoConnection();
      return Promise.resolve();
    }

    this.connectionPromise = this.performConnect();
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async performConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get auth token if available
      auth0Service.getAccessToken().then(token => {
        // Get current user
        auth0Service.getCurrentUser().then(user => {
          if (user) {
            this.userId = user.id;
          }
        });

        // Build WebSocket URL with auth if available
        const wsUrl = token 
          ? `${this.url}?token=${encodeURIComponent(token)}`
          : this.url;

        this.ws = new WebSocket(wsUrl);
        this.setupEventListeners(resolve, reject);
      }).catch(() => {
        // Connect without auth
        this.ws = new WebSocket(this.url);
        this.setupEventListeners(resolve, reject);
      });
    });
  }

  private simulateDemoConnection() {
    // Simulate successful connection for demo mode
    setTimeout(() => {
      this.notifyConnectionListeners(true);
      this.flushMessageQueue();
    }, 100);
  }

  private setupEventListeners(resolve?: Function, reject?: Function) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.info('✓ WebSocket connected');
      }
      this.reconnectAttempts = 0;
      
      // Authenticate if token is available
      auth0Service.getAccessToken().then(token => {
        if (token) {
          this.authenticate(token);
        }
      });
      
      this.startHeartbeat();
      this.notifyConnectionListeners(true);
      this.rejoinRooms();
      this.flushMessageQueue();
      this.emit('connect', { timestamp: Date.now() });
      
      if (resolve) resolve();
    };

    this.ws.onclose = (event) => {
      // Only log meaningful disconnections
      if (event.code !== 1000 && process.env.NODE_ENV === 'development') {
        console.info('WebSocket disconnected (offline mode)');
      }
      this.stopHeartbeat();
      this.notifyConnectionListeners(false);
      this.clearTypingIndicators();
      this.emit('disconnect', { code: event.code, reason: event.reason });
      
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
      if (reject) reject(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle auth responses
    if (message.type === 'auth_success') {
      console.log('WebSocket authenticated');
      return;
    }
    
    if (message.type === 'auth_error') {
      console.error('WebSocket authentication failed:', message.payload);
      this.disconnect();
      return;
    }

    // Handle system messages
    switch (message.type) {
      case 'pong':
        // Heartbeat response
        break;
      
      case 'typing':
        this.handleTypingIndicator(message.payload as TypingIndicator);
        break;
      
      case 'presence':
        this.handlePresenceUpdate(message.payload as PresenceData);
        break;
      
      case 'notification':
        this.handleNotification(message.payload);
        break;
      
      case 'crisis_alert':
        this.handleCrisisAlert(message.payload);
        break;
      
      default: {
        // Handle regular message listeners
        const listeners = this.listeners.get(message.type);
        if (listeners) {
          listeners.forEach(listener => {
            try {
              listener(message.payload);
            } catch (error) {
              console.error('Error in message listener:', error);
            }
          });
        }
        break;
      }
    }
  }

  private authenticate(token: string) {
    this.send('auth', { token });
  }

  private handleTypingIndicator(indicator: TypingIndicator) {
    const { userId, room, isTyping } = indicator;
    
    if (!this.typingIndicators.has(room)) {
      this.typingIndicators.set(room, new Map());
    }

    const roomIndicators = this.typingIndicators.get(room)!;

    if (isTyping) {
      // Clear existing timeout
      const existingTimeout = roomIndicators.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to clear indicator after 3 seconds
      const timeout = setTimeout(() => {
        roomIndicators.delete(userId);
        this.emit('typing', { room, userId, isTyping: false });
      }, 3000);

      roomIndicators.set(userId, timeout);
    } else {
      // Clear typing indicator
      const timeout = roomIndicators.get(userId);
      if (timeout) {
        clearTimeout(timeout);
      }
      roomIndicators.delete(userId);
    }

    // Emit typing event
    this.emit('typing', indicator);
  }

  private handlePresenceUpdate(presence: PresenceData) {
    this.presenceData.set(presence.userId, presence);
    this.emit('presence', presence);
  }

  private handleNotification(data: unknown) {
    // Type-safe data access
    const notificationData = data as {
      title?: string;
      message?: string;
      urgency?: 'low' | 'normal' | 'high' | 'crisis';
      type?: 'message' | 'reminder' | 'alert' | 'crisis' | 'achievement' | 'system';
      metadata?: any;
    };
    
    // Show notification if page is not visible
    if (document.hidden) {
      notificationService.show({
        title: notificationData.title || 'New Notification',
        body: notificationData.message || 'You have a new notification',
        urgency: notificationData.urgency || 'normal',
        category: notificationData.type || 'system',
        data: notificationData.metadata
      });
    }

    // Emit notification event
    this.emit('notification', data);
  }

  private handleCrisisAlert(data: unknown) {
    // Type-safe data access
    const alertData = data as {
      title?: string;
      message?: string;
    };
    
    // Always show crisis notifications
    notificationService.showCrisisNotification(
      alertData.title || 'Crisis Alert',
      alertData.message || 'Immediate assistance needed',
      data
    );

    // Emit crisis alert event
    this.emit('crisis_alert', data);
  }

  private clearTypingIndicators() {
    this.typingIndicators.forEach(roomIndicators => {
      roomIndicators.forEach(timeout => clearTimeout(timeout));
    });
    this.typingIndicators.clear();
  }

  private async checkMissedNotifications() {
    // This would typically make an API call to check for missed notifications
    // For now, we'll just emit an event
    this.emit('check_missed_notifications', {});
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    
    // Stop trying after max attempts
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      // Switch to demo mode after failing to connect
      this.demoMode = true;
      this.simulateDemoConnection();
      return;
    }
    
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      // Silent reconnection attempt
      this.connect();
    }, delay);
  }

  private rejoinRooms() {
    this.roomSubscriptions.forEach(room => {
      this.send('join_room', { room });
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  private sendMessage(message: WebSocketMessage) {
    // In demo mode, simulate successful send
    if (this.demoMode) {
      // Simulate processing delay
      setTimeout(() => {
        // Echo back for demo purposes if needed
        if (message.type === 'chat_message') {
          this.handleMessage({
            type: 'chat_message',
            payload: {
              ...message.payload,
              id: Math.random().toString(36).substring(2, 11),
              userId: 'demo-echo',
              username: 'Demo Echo',
              timestamp: Date.now()
            },
            timestamp: Date.now()
          });
        }
      }, 100);
      return true;
    }
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Public API
  send(type: string, payload: any, room?: string) {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      userId: this.userId || localStorage.getItem('userId') || undefined,
      room
    };

    if (!this.sendMessage(message)) {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  // Event handling methods
  on(event: WebSocketEvent, handler: (data: unknown) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  off(event: WebSocketEvent, handler: (data: unknown) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  once(event: WebSocketEvent, handler: (data: unknown) => void): () => void {
    const wrappedHandler = (data: unknown) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    
    return this.on(event, wrappedHandler);
  }

  private emit(event: WebSocketEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  subscribe(messageType: string, callback: (payload: any) => void) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    this.listeners.get(messageType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(messageType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback);
    
    // Return current connection status
    callback(this.isConnected());

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  isConnected(): boolean {
    // In demo mode, always report as connected
    if (this.demoMode) {
      return true;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Room management
  joinRoom(roomId: string) {
    this.roomSubscriptions.add(roomId);
    this.send('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.roomSubscriptions.delete(roomId);
    
    // Clear typing indicators for this room
    const roomIndicators = this.typingIndicators.get(roomId);
    if (roomIndicators) {
      roomIndicators.forEach(timeout => clearTimeout(timeout));
      this.typingIndicators.delete(roomId);
    }
    
    this.send('leave_room', { roomId });
  }

  // Chat-specific methods
  joinChatRoom(roomId: string) {
    this.joinRoom(roomId);
  }

  leaveChatRoom(roomId: string) {
    this.leaveRoom(roomId);
  }

  sendChatMessage(roomId: string, message: string, metadata?: any) {
    this.send('chat_message', {
      roomId,
      message,
      metadata,
      timestamp: Date.now()
    }, roomId);
  }

  // Notification methods
  subscribeToNotifications(userId: string) {
    this.send('subscribe_notifications', { userId });
  }

  markNotificationRead(notificationId: string) {
    this.send('notification_read', { notificationId });
  }

  // Presence methods
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline') {
    this.send('presence_update', { status });
  }

  // Typing indicators
  startTyping(roomId: string) {
    this.send('typing', { roomId, isTyping: true }, roomId);
  }

  stopTyping(roomId: string) {
    this.send('typing', { roomId, isTyping: false }, roomId);
  }

  getTypingUsers(roomId: string): string[] {
    const roomIndicators = this.typingIndicators.get(roomId);
    return roomIndicators ? Array.from(roomIndicators.keys()) : [];
  }

  // Presence methods
  getUserPresence(userId: string): PresenceData | undefined {
    return this.presenceData.get(userId);
  }

  // Crisis support
  sendCrisisAlert(userId: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.send('crisis_alert', {
      userId,
      severity,
      timestamp: Date.now()
    });
  }

  // Helper status
  updateHelperStatus(status: 'available' | 'busy' | 'offline') {
    this.send('helper_status', { status });
  }

  // Dilemma updates
  requestDilemmaUpdate(dilemmaId: string) {
    this.send('dilemma_update', { dilemmaId });
  }
}

// React hooks for WebSocket
export const useWebSocket = (url: string) => {
  const [service] = React.useState(() => new WebSocketService(url));
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = service.onConnectionChange(setIsConnected);
    
    return () => {
      unsubscribe();
      service.disconnect();
    };
  }, [service]);

  return { service, isConnected };
};

export const useChatRoom = (roomId: string, wsService: WebSocketService) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    wsService.joinChatRoom(roomId);

    const unsubscribeMessages = wsService.subscribe('chat_message', (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    });

    const unsubscribeTyping = wsService.subscribe('typing_update', (data: { userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username];
        } else {
          return prev.filter(user => user !== data.username);
        }
      });
    });

    return () => {
      wsService.leaveChatRoom(roomId);
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [roomId, wsService]);

  const sendMessage = React.useCallback((message: string) => {
    wsService.sendChatMessage(roomId, message);
  }, [roomId, wsService]);

  const startTyping = React.useCallback(() => {
    wsService.startTyping(roomId);
  }, [roomId, wsService]);

  const stopTyping = React.useCallback(() => {
    wsService.stopTyping(roomId);
  }, [roomId, wsService]);

  return {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  };
};

// Singleton instance
let wsServiceInstance: WebSocketService | null = null;

export const getWebSocketService = () => {
  if (!wsServiceInstance) {
    // Use environment variable or default URLs
    const wsUrl = process.env.VITE_WS_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'ws://localhost:8080/ws' 
        : 'wss://api.astralcore.app/ws');
    
    wsServiceInstance = new WebSocketService(wsUrl);
  }
  return wsServiceInstance;
};

// Auto-connect when auth is available
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    // Wait a bit for auth to initialize
    setTimeout(async () => {
      const service = getWebSocketService();
      const token = await auth0Service.getAccessToken();
      if (token) {
        service.connect().catch(console.error);
      }
    }, 1000);
  });

  // Listen for auth events
  window.addEventListener('auth-success', () => {
    getWebSocketService().connect().catch(console.error);
  });

  window.addEventListener('auth-logout', () => {
    getWebSocketService().disconnect();
  });
}

export default WebSocketService;

