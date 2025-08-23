/**
 * Real-time Service for Netlify Serverless Architecture
 * Uses Pusher for WebSocket functionality
 */

import Pusher, { Channel, PresenceChannel } from 'pusher-js';
import { getWebSocketService } from './webSocketService';

interface RealtimeConfig {
  key: string;
  cluster: string;
  authEndpoint: string;
  auth?: {
    headers: Record<string, string>;
  };
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'crisis';
  urgency: 'low' | 'normal' | 'high' | 'critical';
  senderId?: string;
  timestamp: number;
}

interface MoodUpdate {
  userId: string;
  mood: {
    value: number;
    label: string;
    color?: string;
  };
  timestamp: number;
}

interface CrisisAlert {
  alertId: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  location?: string;
  timestamp: number;
  requiresImmediate: boolean;
}

interface PresenceInfo {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  mood?: string;
  lastSeen?: Date;
}

class RealtimeService {
  private pusher: Pusher | null = null;
  private channels = new Map<string, Channel>();
  private presenceChannels = new Map<string, PresenceChannel>();
  private isConnected = false;
  private userId: string | null = null;
  private config: RealtimeConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers = new Map<string, Set<Function>>();
  private fallbackToWebSocket = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Fetch Pusher configuration from API
      const response = await fetch('/.netlify/functions/api-realtime/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch realtime configuration');
      }

      this.config = await response.json();
      
      // Initialize Pusher client
      this.initializePusher();
    } catch (error) {
      console.error('Failed to initialize realtime service:', error);
      // Fallback to existing WebSocket service if Pusher fails
      this.fallbackToWebSocket = true;
    }
  }

  private initializePusher() {
    if (!this.config) return;

    // Enable Pusher logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }

    this.pusher = new Pusher(this.config.key, {
      cluster: this.config.cluster,
      authEndpoint: this.config.authEndpoint,
      auth: this.config.auth,
      enabledTransports: ['ws', 'wss'],
      disabledTransports: [],
      forceTLS: true,
      activityTimeout: 10000,
      pongTimeout: 5000,
      unavailableTimeout: 10000
    });

    // Set up connection event handlers
    this.setupConnectionHandlers();

    // Subscribe to global channels
    this.subscribeToGlobalChannels();
  }

  private setupConnectionHandlers() {
    if (!this.pusher) return;

    this.pusher.connection.bind('connected', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Real-time connection established');
      this.emit('connected', { timestamp: Date.now() });
    });

    this.pusher.connection.bind('disconnected', () => {
      this.isConnected = false;
      console.log('❌ Real-time connection lost');
      this.emit('disconnected', { timestamp: Date.now() });
      this.handleReconnection();
    });

    this.pusher.connection.bind('error', (error: unknown) => {
      console.error('Real-time connection error:', error);
      this.emit('error', error);
    });

    this.pusher.connection.bind('state_change', (states: any) => {
      console.log('Connection state changed:', states.previous, '->', states.current);
      this.emit('state_change', states);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached, falling back to WebSocket');
      this.fallbackToWebSocket = true;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.pusher) {
        this.pusher.connect();
      }
    }, delay);
  }

  private subscribeToGlobalChannels() {
    // Subscribe to public channels
    this.subscribeToChannel('presence-global');
    this.subscribeToChannel('mood-updates');
    this.subscribeToChannel('crisis-support-team');
    
    // Subscribe to user-specific channel if authenticated
    const userId = this.getUserId();
    if (userId) {
      this.subscribeToPrivateChannel(`private-user-${userId}`);
    }
  }

  // Public API Methods

  public setUserId(userId: string) {
    this.userId = userId;
    // Subscribe to user's private channel
    this.subscribeToPrivateChannel(`private-user-${userId}`);
  }

  public getUserId(): string | null {
    return this.userId || localStorage.getItem('userId');
  }

  public subscribeToChannel(channelName: string): Channel | null {
    if (this.fallbackToWebSocket) {
      // Use WebSocket service as fallback
      const wsService = getWebSocketService();
      wsService.joinRoom(channelName);
      return null;
    }

    if (!this.pusher) return null;

    // Check if already subscribed
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const subscribedChannel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, subscribedChannel);

    // Set up channel event handlers
    this.setupChannelHandlers(subscribedChannel, channelName);

    return subscribedChannel;
  }

  public subscribeToPrivateChannel(channelName: string): Channel | null {
    if (!channelName.startsWith('private-')) {
      channelName = `private-${channelName}`;
    }
    return this.subscribeToChannel(channelName);
  }

  public subscribeToPresenceChannel(channelName: string): PresenceChannel | null {
    if (this.fallbackToWebSocket) {
      const wsService = getWebSocketService();
      wsService.joinRoom(channelName);
      return null;
    }

    if (!this.pusher) return null;

    if (!channelName.startsWith('presence-')) {
      channelName = `presence-${channelName}`;
    }

    // Check if already subscribed
    if (this.presenceChannels.has(channelName)) {
      return this.presenceChannels.get(channelName)!;
    }

    const channel = this.pusher.subscribe(channelName) as PresenceChannel;
    this.presenceChannels.set(channelName, channel);

    // Set up presence handlers
    this.setupPresenceHandlers(channel, channelName);

    return channel;
  }

  private setupChannelHandlers(channel: Channel, channelName: string) {
    // Handle notifications
    channel.bind('notification', (data: NotificationData) => {
      this.handleNotification(data);
    });

    // Handle messages
    channel.bind('message', (data: unknown) => {
      this.emit('message', { channel: channelName, data });
    });

    // Handle typing indicators
    channel.bind('typing', (data: unknown) => {
      const typingData = data as Record<string, any>;
      this.emit('typing', { channel: channelName, ...typingData });
    });

    // Handle crisis alerts
    channel.bind('crisis-alert', (data: CrisisAlert) => {
      this.handleCrisisAlert(data);
    });

    // Handle mood updates
    channel.bind('mood-shared', (data: MoodUpdate) => {
      this.emit('mood-update', data);
    });
  }

  private setupPresenceHandlers(channel: PresenceChannel, channelName: string) {
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      console.log(`Joined presence channel: ${channelName}`);
      this.emit('presence-subscribed', { channel: channelName, members });
    });

    channel.bind('pusher:member_added', (member: any) => {
      this.emit('member-joined', { channel: channelName, member });
    });

    channel.bind('pusher:member_removed', (member: any) => {
      this.emit('member-left', { channel: channelName, member });
    });

    // Handle presence updates
    channel.bind('presence-update', (data: PresenceInfo) => {
      this.emit('presence-update', data);
    });
  }

  private handleNotification(data: NotificationData) {
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.id,
        requireInteraction: data.urgency === 'high' || data.urgency === 'critical',
        data: data
      });

      notification.onclick = () => {
        window.focus();
        this.emit('notification-clicked', data);
        notification.close();
      };
    }

    // Emit notification event
    this.emit('notification', data);

    // Store in local notifications
    this.storeNotification(data);
  }

  private handleCrisisAlert(data: CrisisAlert) {
    // Always show crisis notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚨 Crisis Alert', {
        body: `Severity: ${data.severity.toUpperCase()}\n${data.message || 'Immediate assistance needed'}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `crisis-${data.alertId}`,
        requireInteraction: true,
        // vibrate: [200, 100, 200], // Not supported in NotificationOptions
        data: data
      });

      notification.onclick = () => {
        window.focus();
        this.emit('crisis-alert-clicked', data);
        notification.close();
      };
    }

    // Emit crisis event
    this.emit('crisis-alert', data);

    // Play alert sound if available
    this.playAlertSound();
  }

  private storeNotification(data: NotificationData) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift(data);
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.pop();
    }
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  private playAlertSound() {
    // Create and play an alert sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // Messaging Methods

  public async sendMessage(channel: string, message: string, type: string = 'message') {
    if (this.fallbackToWebSocket) {
      const wsService = getWebSocketService();
      wsService.send(type, { channel, message });
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/api-realtime/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ channel, message, type })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async sendNotification(targetUserId: string, notification: Partial<NotificationData>) {
    try {
      const response = await fetch('/.netlify/functions/api-realtime/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ targetUserId, ...notification })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  public async updatePresence(status: string, mood?: string) {
    if (this.fallbackToWebSocket) {
      const wsService = getWebSocketService();
      wsService.updatePresence(status as ('offline' | 'online' | 'away' | 'busy'));
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/api-realtime/presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status, mood })
      });

      if (!response.ok) {
        throw new Error('Failed to update presence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating presence:', error);
      throw error;
    }
  }

  public async sendTypingIndicator(channel: string, isTyping: boolean) {
    if (this.fallbackToWebSocket) {
      const wsService = getWebSocketService();
      if (isTyping) {
        wsService.startTyping(channel);
      } else {
        wsService.stopTyping(channel);
      }
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/api-realtime/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ channel, isTyping })
      });

      if (!response.ok) {
        throw new Error('Failed to send typing indicator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      throw error;
    }
  }

  public async shareMoodUpdate(mood: { value: number; label: string; emoji?: string; color?: string }, isPublic: boolean = false) {
    try {
      const response = await fetch('/.netlify/functions/api-realtime/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ mood, isPublic })
      });

      if (!response.ok) {
        throw new Error('Failed to share mood update');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sharing mood update:', error);
      throw error;
    }
  }

  public async sendCrisisAlert(severity: string, message: string, location?: string) {
    try {
      const response = await fetch('/.netlify/functions/api-realtime/crisis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ severity, message, location })
      });

      if (!response.ok) {
        throw new Error('Failed to send crisis alert');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending crisis alert:', error);
      throw error;
    }
  }

  // Event Handling

  public on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  public off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Cleanup

  public disconnect() {
    // Unsubscribe from all channels
    this.channels.forEach((_, name) => {
      if (this.pusher) {
        this.pusher.unsubscribe(name);
      }
    });
    this.channels.clear();

    this.presenceChannels.forEach((_, name) => {
      if (this.pusher) {
        this.pusher.unsubscribe(name);
      }
    });
    this.presenceChannels.clear();

    // Disconnect Pusher
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }

    this.isConnected = false;
  }

  // Status Methods

  public getConnectionStatus(): boolean {
    if (this.fallbackToWebSocket) {
      return getWebSocketService().isConnected();
    }
    return this.isConnected;
  }

  public getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  public getPresenceMembers(channelName: string): any {
    const channel = this.presenceChannels.get(channelName);
    if (channel && 'members' in channel) {
      return channel.members;
    }
    return null;
  }
}

// Create singleton instance
let realtimeServiceInstance: RealtimeService | null = null;

export const getRealtimeService = (): RealtimeService => {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService();
  }
  return realtimeServiceInstance;
};

// React hooks
export const useRealtime = () => {
  const [service] = React.useState(() => getRealtimeService());
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = service.on('connected', () => setIsConnected(true));
    const unsubscribe2 = service.on('disconnected', () => setIsConnected(false));

    // Check initial status
    setIsConnected(service.getConnectionStatus());

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [service]);

  return { service, isConnected };
};

export const useRealtimeChannel = (channelName: string) => {
  const { service } = useRealtime();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    service.subscribeToChannel(channelName);

    const unsubscribeMessage = service.on('message', (data: unknown) => {
      const messageData = data as { channel: string; data: any };
      if (messageData.channel === channelName) {
        setMessages(prev => [...prev, messageData.data]);
      }
    });

    const unsubscribeTyping = service.on('typing', (data: unknown) => {
      const typingData = data as { channel: string; isTyping: boolean; userId: string };
      if (typingData.channel === channelName) {
        setTypingUsers(prev => {
          if (typingData.isTyping) {
            return prev.includes(typingData.userId) ? prev : [...prev, typingData.userId];
          } else {
            return prev.filter(id => id !== typingData.userId);
          }
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [channelName, service]);

  const sendMessage = React.useCallback(async (message: string) => {
    await service.sendMessage(channelName, message);
  }, [channelName, service]);

  const sendTyping = React.useCallback(async (isTyping: boolean) => {
    await service.sendTypingIndicator(channelName, isTyping);
  }, [channelName, service]);

  return {
    messages,
    typingUsers,
    sendMessage,
    sendTyping
  };
};

export const usePresenceChannel = (channelName: string) => {
  const { service } = useRealtime();
  const [members, setMembers] = React.useState<any[]>([]);

  React.useEffect(() => {
    service.subscribeToPresenceChannel(channelName);

    const unsubscribe = service.on('presence-subscribed', (data: unknown) => {
      const presenceData = data as { channel: string; members: { members?: Record<string, any> } };
      if (presenceData.channel === channelName) {
        setMembers(Object.values(presenceData.members.members || {}));
      }
    });

    const unsubscribeJoin = service.on('member-joined', (data: unknown) => {
      const joinData = data as { channel: string; member: any };
      if (joinData.channel === channelName) {
        setMembers(prev => [...prev, joinData.member]);
      }
    });

    const unsubscribeLeave = service.on('member-left', (data: unknown) => {
      const leaveData = data as { channel: string; member: { id: string } };
      if (leaveData.channel === channelName) {
        setMembers(prev => prev.filter(m => m.id !== leaveData.member.id));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeJoin();
      unsubscribeLeave();
    };
  }, [channelName, service]);

  return { members };
};

// Add missing React import
import * as React from 'react';

export default RealtimeService;