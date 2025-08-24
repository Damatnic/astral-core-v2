/**
 * Enhanced WebSocket Service for Astral Core
 * Handles real-time communication for chat, notifications, and live updates
 */

import { logger } from '../utils/logger';
import { notificationService } from './notificationService';

export type WebSocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'notification'
  | 'typing'
  | 'presence'
  | 'crisis_alert'
  | 'system_update';

export interface WebSocketMessage {
  type: WebSocketEvent;
  payload: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface ConnectionConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  timeout?: number;
}

export interface WebSocketEventHandler {
  (message: WebSocketMessage): void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig;
  private eventHandlers: Map<WebSocketEvent, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(config: ConnectionConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      timeout: 10000,
      ...config
    };
    
    this.maxReconnectAttempts = this.config.reconnectAttempts!;
    this.reconnectDelay = this.config.reconnectDelay!;
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      
      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, this.config.timeout);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

    } catch (error) {
      this.isConnecting = false;
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.shouldReconnect = false;
    this.clearTimeouts();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Send message through WebSocket
   */
  public send(type: WebSocketEvent, payload: any): void {
    if (!this.isConnected()) {
      logger.warn('WebSocket not connected, queuing message:', { type, payload });
      // In a real implementation, you might want to queue messages
      return;
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };

    try {
      this.ws!.send(JSON.stringify(message));
      logger.debug('WebSocket message sent:', message);
    } catch (error) {
      logger.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  public on(event: WebSocketEvent, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  public off(event: WebSocketEvent, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  public getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    logger.info('WebSocket connected successfully');
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.clearTimeouts();
    this.startHeartbeat();
    
    this.emit('connect', { event });
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    logger.info('WebSocket connection closed:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    this.isConnecting = false;
    this.clearTimeouts();
    
    this.emit('disconnect', { event });
    
    // Attempt reconnection if appropriate
    if (this.shouldReconnect && event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    logger.error('WebSocket error occurred:', event);
    this.handleConnectionError(new Error('WebSocket error'));
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      logger.debug('WebSocket message received:', message);
      
      this.emit(message.type, message);
      
      // Handle special message types
      if (message.type === 'crisis_alert') {
        this.handleCrisisAlert(message);
      }
      
    } catch (error) {
      logger.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle crisis alerts
   */
  private handleCrisisAlert(message: WebSocketMessage): void {
    try {
      notificationService.showNotification({
        id: `crisis_${Date.now()}`,
        title: 'Crisis Alert',
        message: message.payload.message || 'Crisis support resources are available',
        type: 'error',
        persistent: true,
        actions: [
          {
            label: 'Get Help',
            action: () => window.open('tel:988', '_blank')
          },
          {
            label: 'Dismiss',
            action: () => {}
          }
        ]
      });
    } catch (error) {
      logger.error('Failed to handle crisis alert:', error);
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(event: WebSocketEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: any): void {
    logger.error('WebSocket connection error:', error);
    this.isConnecting = false;
    
    if (this.shouldReconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    logger.info(`Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch(error => {
          logger.error('Reconnection attempt failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval!);
  }

  /**
   * Clear all timeouts
   */
  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  public getStats(): any {
    return {
      connected: this.isConnected(),
      connectionState: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      eventHandlers: Array.from(this.eventHandlers.keys()),
      config: this.config
    };
  }
}

// Create default instance
const defaultConfig: ConnectionConfig = {
  url: process.env.REACT_APP_WS_URL || 'wss://api.corev2.com/ws',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000,
  timeout: 10000
};

export const webSocketService = new WebSocketService(defaultConfig);
export default webSocketService;
