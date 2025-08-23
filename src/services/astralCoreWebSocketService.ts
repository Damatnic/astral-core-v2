/**
 * WebSocket Service for Astral Core
 * Handles real-time communication for chat, crisis alerts, and live features
 */

import { auth0Service } from './auth0Service';
import { astralCoreNotificationService, NotificationType, NotificationPriority } from './astralCoreNotificationService';
import { getEnv, isProduction } from '../utils/envValidator';

// WebSocket Configuration
const WS_BASE_URL = getEnv('VITE_WEBSOCKET_URL') || 'ws://localhost:3000';
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MESSAGE_QUEUE_SIZE = 100;

// WebSocket Events
export enum WSEventType {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  
  // Authentication
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  
  // Chat Events
  MESSAGE_NEW = 'message_new',
  MESSAGE_EDIT = 'message_edit',
  MESSAGE_DELETE = 'message_delete',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  
  // Presence Events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_AWAY = 'user_away',
  USER_BUSY = 'user_busy',
  
  // Crisis Events
  CRISIS_ALERT = 'crisis_alert',
  CRISIS_RESOLVED = 'crisis_resolved',
  SOS_TRIGGERED = 'sos_triggered',
  HELPER_ASSIGNED = 'helper_assigned',
  
  // Peer Support Events
  PEER_REQUEST = 'peer_request',
  PEER_MATCH = 'peer_match',
  PEER_DISCONNECT = 'peer_disconnect',
  
  // Live Updates
  MOOD_UPDATE = 'mood_update',
  ASSESSMENT_UPDATE = 'assessment_update',
  SAFETY_PLAN_UPDATE = 'safety_plan_update',
  
  // System Events
  HEARTBEAT = 'heartbeat',
  BROADCAST = 'broadcast',
  NOTIFICATION = 'notification',
  MAINTENANCE = 'maintenance',
}

export interface WSMessage {
  id: string;
  type: WSEventType;
  data: any;
  timestamp: string;
  from?: string;
  to?: string;
  room?: string;
  metadata?: Record<string, any>;
}

export interface WSConnectionState {
  connected: boolean;
  reconnecting: boolean;
  authenticated: boolean;
  reconnectAttempts: number;
  lastActivity: Date;
  latency: number;
}

export interface WSSubscription {
  id: string;
  event: WSEventType | string;
  callback: (data: unknown) => void;
  once?: boolean;
}

/**
 * Astral Core WebSocket Service
 */
class AstralCoreWebSocketService {
  private ws: WebSocket | null = null;
  private readonly connectionState: WSConnectionState;
  private readonly subscriptions: Map<string, WSSubscription[]>;
  private readonly messageQueue: WSMessage[];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly wsUrl: string;
  private userId: string | null = null;
  private readonly sessionId: string;
  private readonly rooms: Set<string>;
  private readonly typingTimers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.wsUrl = WS_BASE_URL;
    this.connectionState = {
      connected: false,
      reconnecting: false,
      authenticated: false,
      reconnectAttempts: 0,
      lastActivity: new Date(),
      latency: 0,
    };
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.sessionId = this.generateSessionId();
    this.rooms = new Set();
    this.typingTimers = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws && this.connectionState.connected) {
      console.log('Astral Core WS: Already connected');
      return;
    }

    try {
      // Get authentication token
      const token = await auth0Service.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Get user ID
      const user = await auth0Service.getCurrentUser();
      this.userId = user?.id || null;

      // Build WebSocket URL with auth
      const url = new URL(this.wsUrl);
      url.searchParams.append('token', token);
      url.searchParams.append('sessionId', this.sessionId);

      // Use wss:// in production
      if (isProduction() && url.protocol === 'ws:') {
        url.protocol = 'wss:';
      }

      // Create WebSocket connection
      this.ws = new WebSocket(url.toString());

      // Set up event handlers
      this.setupEventHandlers();

      console.log('Astral Core WS: Connecting to', url.hostname);
    } catch (error) {
      console.error('Astral Core WS: Connection failed', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (!this.ws) {
      return;
    }

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Clear typing timers
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();

    // Close connection
    this.ws.close(1000, 'Client disconnect');
    this.ws = null;

    // Update state
    this.connectionState.connected = false;
    this.connectionState.authenticated = false;
    this.connectionState.reconnecting = false;

    // Clear rooms
    this.rooms.clear();

    // Emit disconnect event
    this.emit(WSEventType.DISCONNECT, { reason: 'Client disconnect' });

    console.log('Astral Core WS: Disconnected');
  }

  /**
   * Send message through WebSocket
   */
  send(type: WSEventType | string, data: any, options?: {
    to?: string;
    room?: string;
    metadata?: Record<string, any>;
  }): void {
    const message: WSMessage = {
      id: this.generateMessageId(),
      type: type as WSEventType,
      data,
      timestamp: new Date().toISOString(),
      from: this.userId || undefined,
      to: options?.to,
      room: options?.room,
      metadata: options?.metadata,
    };

    if (this.connectionState.connected && this.connectionState.authenticated) {
      this.sendMessage(message);
    } else {
      // Queue message if not connected
      this.queueMessage(message);
      
      // Try to reconnect
      if (!this.connectionState.reconnecting) {
        this.reconnect();
      }
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on(event: WSEventType | string, callback: (data: unknown) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: WSSubscription = {
      id: subscriptionId,
      event,
      callback,
      once: false,
    };

    const eventSubscriptions = this.subscriptions.get(event) || [];
    eventSubscriptions.push(subscription);
    this.subscriptions.set(event, eventSubscriptions);

    return subscriptionId;
  }

  /**
   * Subscribe to event once
   */
  once(event: WSEventType | string, callback: (data: unknown) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: WSSubscription = {
      id: subscriptionId,
      event,
      callback,
      once: true,
    };

    const eventSubscriptions = this.subscriptions.get(event) || [];
    eventSubscriptions.push(subscription);
    this.subscriptions.set(event, eventSubscriptions);

    return subscriptionId;
  }

  /**
   * Unsubscribe from event
   */
  off(subscriptionId: string): void {
    this.subscriptions.forEach((subs, event) => {
      const filtered = subs.filter(sub => sub.id !== subscriptionId);
      if (filtered.length < subs.length) {
        this.subscriptions.set(event, filtered);
      }
    });
  }

  /**
   * Join a room for group communication
   */
  joinRoom(roomId: string): void {
    if (this.rooms.has(roomId)) {
      return;
    }

    this.send('join_room', { roomId });
    this.rooms.add(roomId);
    console.log(`Astral Core WS: Joined room ${roomId}`);
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.rooms.has(roomId)) {
      return;
    }

    this.send('leave_room', { roomId });
    this.rooms.delete(roomId);
    console.log(`Astral Core WS: Left room ${roomId}`);
  }

  /**
   * Send chat message
   */
  sendChatMessage(content: string, roomId?: string, recipientId?: string): void {
    this.send(WSEventType.MESSAGE_NEW, 
      { content },
      { room: roomId, to: recipientId }
    );
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    const event = isTyping ? WSEventType.TYPING_START : WSEventType.TYPING_STOP;
    this.send(event, { roomId });

    // Auto-stop typing after 5 seconds
    if (isTyping) {
      const existingTimer = this.typingTimers.get(roomId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        this.sendTypingIndicator(roomId, false);
        this.typingTimers.delete(roomId);
      }, 5000);

      this.typingTimers.set(roomId, timer);
    } else {
      const timer = this.typingTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        this.typingTimers.delete(roomId);
      }
    }
  }

  /**
   * Trigger crisis alert
   */
  triggerCrisisAlert(severity: 'high' | 'critical', message?: string): void {
    this.send(WSEventType.CRISIS_ALERT, {
      severity,
      message,
      location: this.getUserLocation(),
      timestamp: new Date().toISOString(),
    });

    // Also show local notification
    astralCoreNotificationService.showCrisisAlert(
      'Crisis Alert Sent',
      'Help is on the way. A crisis responder will contact you shortly.',
      [
        { action: 'call-988', title: 'Call 988 Now' },
        { action: 'safety-plan', title: 'Open Safety Plan' },
      ]
    );
  }

  /**
   * Request peer support
   */
  requestPeerSupport(topic?: string, anonymous?: boolean): void {
    this.send(WSEventType.PEER_REQUEST, {
      topic,
      anonymous,
      preferredLanguage: navigator.language,
    });
  }

  /**
   * Update presence status
   */
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    const eventMap = {
      online: WSEventType.USER_ONLINE,
      away: WSEventType.USER_AWAY,
      busy: WSEventType.USER_BUSY,
      offline: WSEventType.USER_OFFLINE,
    };

    this.send(eventMap[status], {
      userId: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connection state
   */
  getConnectionState(): WSConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState.connected && this.connectionState.authenticated;
  }

  /**
   * Get active rooms
   */
  getActiveRooms(): string[] {
    return Array.from(this.rooms);
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  /**
   * Handle WebSocket open
   */
  private handleOpen(): void {
    console.log('Astral Core WS: Connection opened');
    
    this.connectionState.connected = true;
    this.connectionState.reconnecting = false;
    this.connectionState.reconnectAttempts = 0;
    this.connectionState.lastActivity = new Date();

    // Authenticate
    this.authenticate();

    // Start heartbeat
    this.startHeartbeat();

    // Emit connect event
    this.emit(WSEventType.CONNECT, {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    console.log('Astral Core WS: Connection closed', event.code, event.reason);

    this.connectionState.connected = false;
    this.connectionState.authenticated = false;

    // Stop heartbeat
    this.stopHeartbeat();

    // Emit disconnect event
    this.emit(WSEventType.DISCONNECT, {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });

    // Attempt reconnect if not intentional disconnect
    if (event.code !== 1000 && event.code !== 1001) {
      this.reconnect();
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('Astral Core WS: Connection error', error);

    // Emit error event
    this.emit(WSEventType.ERROR, {
      message: 'WebSocket connection error',
      error,
    });

    this.handleConnectionError(error);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);
      
      // Update last activity
      this.connectionState.lastActivity = new Date();

      // Handle special messages
      switch (message.type) {
        case WSEventType.AUTH_SUCCESS:
          this.handleAuthSuccess(message.data);
          break;
        case WSEventType.AUTH_FAILURE:
          this.handleAuthFailure(message.data);
          break;
        case WSEventType.HEARTBEAT:
          this.handleHeartbeat(message.data);
          break;
        case WSEventType.CRISIS_ALERT:
          this.handleCrisisAlert(message.data);
          break;
        case WSEventType.MAINTENANCE:
          this.handleMaintenance(message.data);
          break;
      }

      // Emit to subscribers
      this.emit(message.type, message.data);

    } catch (error) {
      console.error('Astral Core WS: Failed to parse message', error);
    }
  }

  /**
   * Authenticate connection
   */
  private async authenticate(): Promise<void> {
    try {
      const token = await auth0Service.getAccessToken();
      const user = await auth0Service.getCurrentUser();

      this.send('authenticate', {
        token,
        userId: user?.id,
        sessionId: this.sessionId,
        clientVersion: '2.0.0',
        platform: 'web',
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Astral Core WS: Authentication failed', error);
      this.handleAuthFailure({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Handle authentication success
   */
  private handleAuthSuccess(data: unknown): void {
    console.log('Astral Core WS: Authenticated successfully');
    
    this.connectionState.authenticated = true;
    const authData = data as any;
    this.userId = authData?.userId;

    // Process queued messages
    this.processMessageQueue();

    // Rejoin rooms
    this.rooms.forEach(roomId => {
      this.send('join_room', { roomId });
    });

    // Update presence
    this.updatePresence('online');
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(data: unknown): void {
    const errorData = data as any;
    console.error('Astral Core WS: Authentication failed', errorData?.error);
    
    this.connectionState.authenticated = false;

    // Try to refresh token and reconnect
    auth0Service.refreshToken().then(() => {
      this.reconnect();
    }).catch(error => {
      console.error('Astral Core WS: Token refresh failed', error);
      this.disconnect();
    });
  }

  /**
   * Handle crisis alert
   */
  private handleCrisisAlert(data: unknown): void {
    // Show notification
    const alertData = data as any;
    astralCoreNotificationService.showCrisisAlert(
      'Crisis Alert',
      alertData?.message || 'Someone needs immediate help',
      [
        { action: 'respond', title: 'Respond' },
        { action: 'forward', title: 'Forward to 988' },
      ]
    );

    // Log for monitoring
    console.warn('Astral Core WS: Crisis alert received', data);
  }

  /**
   * Handle maintenance notification
   */
  private handleMaintenance(data: unknown): void {
    console.warn('Astral Core WS: Maintenance scheduled', data);
    
    // Show notification
    astralCoreNotificationService.show({
      type: NotificationType.SYSTEM_ALERT,
      priority: NotificationPriority.HIGH,
      title: 'Scheduled Maintenance',
      body: (data as any)?.message || 'The service will undergo maintenance soon',
      requireInteraction: true,
    });
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState.connected) {
        const startTime = Date.now();
        this.send(WSEventType.HEARTBEAT, {
          timestamp: new Date().toISOString(),
        });

        // Calculate latency when pong received
        this.once('pong', () => {
          this.connectionState.latency = Date.now() - startTime;
        });
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle heartbeat response
   */
  private handleHeartbeat(data: unknown): void {
    this.emit('pong', data);
  }

  /**
   * Reconnect to WebSocket
   */
  private reconnect(): void {
    if (this.connectionState.reconnecting) {
      return;
    }

    if (this.connectionState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Astral Core WS: Max reconnection attempts reached');
      this.emit(WSEventType.ERROR, {
        message: 'Failed to reconnect after maximum attempts',
      });
      return;
    }

    this.connectionState.reconnecting = true;
    this.connectionState.reconnectAttempts++;

    const delay = Math.min(
      RECONNECT_DELAY * Math.pow(2, this.connectionState.reconnectAttempts - 1),
      30000
    );

    console.log(`Astral Core WS: Reconnecting in ${delay}ms (attempt ${this.connectionState.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: unknown): void {
    // Log error
    console.error('Astral Core WS: Connection error', error);

    // Update state
    this.connectionState.connected = false;
    this.connectionState.authenticated = false;

    // Attempt reconnect
    if (!this.connectionState.reconnecting) {
      this.reconnect();
    }
  }

  /**
   * Send message through WebSocket
   */
  private sendMessage(message: WSMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.connectionState.lastActivity = new Date();
    } catch (error) {
      console.error('Astral Core WS: Failed to send message', error);
      this.queueMessage(message);
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: WSMessage): void {
    this.messageQueue.push(message);

    // Limit queue size
    if (this.messageQueue.length > MESSAGE_QUEUE_SIZE) {
      this.messageQueue.shift();
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Emit event to subscribers
   */
  private emit(event: WSEventType | string, data: any): void {
    const subscriptions = this.subscriptions.get(event) || [];
    
    subscriptions.forEach(sub => {
      try {
        sub.callback(data);
        
        if (sub.once) {
          this.off(sub.id);
        }
      } catch (error) {
        console.error(`Astral Core WS: Error in event handler for ${event}`, error);
      }
    });
  }

  /**
   * Get user location for crisis alerts
   */
  private getUserLocation(): { lat?: number; lon?: number } | null {
    // This would integrate with the geolocation service
    // For now, return null (location not available)
    return null;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const astralCoreWebSocketService = new AstralCoreWebSocketService();

// Auto-connect when authenticated
window.addEventListener('auth:authenticated', () => {
  astralCoreWebSocketService.connect();
});

// Auto-disconnect when logged out
window.addEventListener('auth:logout', () => {
  astralCoreWebSocketService.disconnect();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    astralCoreWebSocketService.updatePresence('away');
  } else {
    astralCoreWebSocketService.updatePresence('online');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  astralCoreWebSocketService.disconnect();
});

export default astralCoreWebSocketService;