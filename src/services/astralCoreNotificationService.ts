/**
 * Notification Service for Astral Core
 * Handles push notifications, in-app notifications, and notification preferences
 */

import { apiClient } from './apiClient';
import { getEnv } from '../utils/envValidator';

// Notification Types
export enum NotificationType {
  CRISIS_ALERT = 'crisis_alert',
  PEER_MESSAGE = 'peer_message',
  SUPPORT_REQUEST = 'support_request',
  WELLNESS_REMINDER = 'wellness_reminder',
  ASSESSMENT_DUE = 'assessment_due',
  SAFETY_PLAN_REMINDER = 'safety_plan_reminder',
  COMMUNITY_UPDATE = 'community_update',
  SYSTEM_ALERT = 'system_alert',
  ACHIEVEMENT = 'achievement',
  APPOINTMENT_REMINDER = 'appointment_reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRISIS = 'crisis',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  timestamp: Date;
  read: boolean;
  soundEnabled?: boolean;
  vibrationPattern?: number[];
  requireInteraction?: boolean;
  expiresAt?: Date;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  crisisAlerts: boolean;
  peerMessages: boolean;
  wellnessReminders: boolean;
  communityUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  blockedTypes: NotificationType[];
}

/**
 * Astral Core Notification Service
 */
class AstralCoreNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private preferences: NotificationPreferences;
  private readonly notificationQueue: Notification[] = [];
  private isOnline: boolean = navigator.onLine;
  private readonly vapidPublicKey: string;

  constructor() {
    this.vapidPublicKey = getEnv('VITE_VAPID_PUBLIC_KEY') || '';
    this.preferences = this.loadPreferences();
    // Initialize service asynchronously to avoid constructor async operation
    setTimeout(() => this.initializeService(), 0);
  }

  /**
   * Initialize notification service
   */
  private async initializeService(): Promise<void> {
    // Check browser support
    if (!('Notification' in window)) {
      console.warn('Astral Core: Browser does not support notifications');
      return;
    }

    // Get current permission
    this.permission = Notification.permission;

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
        console.log('Astral Core: Service worker ready for notifications');
      } catch (error) {
        console.error('Astral Core: Service worker registration failed:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedNotifications();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for push notifications
    if (this.swRegistration) {
      this.swRegistration.addEventListener('push', this.handlePushEvent.bind(this));
      this.swRegistration.addEventListener('notificationclick', this.handleNotificationClick.bind(this));
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Astral Core: Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        await this.subscribeToPush();
        this.showWelcomeNotification();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Astral Core: Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(): Promise<void> {
    if (!this.swRegistration || !this.vapidPublicKey) {
      return;
    }

    try {
      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });

        // Send subscription to server
        await apiClient.post('/notifications/subscribe', {
          subscription: subscription.toJSON(),
          preferences: this.preferences,
        });

        console.log('Astral Core: Subscribed to push notifications');
      }
    } catch (error) {
      console.error('Astral Core: Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Show notification
   */
  async show(notification: Partial<Notification>): Promise<void> {
    // Check preferences
    if (!this.shouldShowNotification(notification)) {
      return;
    }

    // Create full notification object
    const fullNotification: Notification = {
      id: this.generateId(),
      type: notification.type || NotificationType.SYSTEM_ALERT,
      priority: notification.priority || NotificationPriority.NORMAL,
      title: notification.title || 'Astral Core',
      body: notification.body || '',
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    // Queue if offline and not crisis
    if (!this.isOnline && fullNotification.priority !== NotificationPriority.CRISIS) {
      this.notificationQueue.push(fullNotification);
      return;
    }

    // Show notification
    await this.displayNotification(fullNotification);

    // Store in history
    await this.storeNotification(fullNotification);

    // Send analytics
    this.trackNotification(fullNotification);
  }

  /**
   * Display notification
   */
  private async displayNotification(notification: Notification): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Astral Core: Cannot show notification - permission not granted');
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      badge: notification.badge || '/icon-96.png',
      tag: notification.id,
      data: notification.data,
      requireInteraction: notification.requireInteraction || notification.priority === NotificationPriority.CRISIS,
      silent: !notification.soundEnabled,
    };

    // Use service worker if available
    if (this.swRegistration) {
      await this.swRegistration.showNotification(notification.title, options);
    } else {
      // Fallback to browser notification
      new Notification(notification.title, options);
    }
  }

  /**
   * Show crisis notification
   */
  async showCrisisAlert(
    title: string,
    body: string,
    actions?: NotificationAction[]
  ): Promise<void> {
    await this.show({
      type: NotificationType.CRISIS_ALERT,
      priority: NotificationPriority.CRISIS,
      title,
      body,
      icon: '/icons/crisis-icon.png',
      badge: '/icons/crisis-badge.png',
      requireInteraction: true,
      soundEnabled: true,
      vibrationPattern: [200, 100, 200, 100, 200], // SOS pattern
      actions: actions || [
        { action: 'call-988', title: 'Call 988' },
        { action: 'safety-plan', title: 'Safety Plan' },
      ],
    });
  }

  /**
   * Show wellness reminder
   */
  async showWellnessReminder(
    type: 'mood' | 'meditation' | 'journal' | 'assessment',
    customMessage?: string
  ): Promise<void> {
    const messages = {
      mood: 'Time to check in with your mood',
      meditation: 'Ready for your daily meditation?',
      journal: 'Take a moment to reflect in your journal',
      assessment: 'Your wellness assessment is due',
    };

    await this.show({
      type: NotificationType.WELLNESS_REMINDER,
      priority: NotificationPriority.NORMAL,
      title: 'Wellness Reminder',
      body: customMessage || messages[type],
      icon: '/icons/wellness-icon.png',
      actions: [
        { action: `open-${type}`, title: 'Open' },
        { action: 'snooze', title: 'Snooze' },
      ],
    });
  }

  /**
   * Show peer message notification
   */
  async showPeerMessage(
    senderName: string,
    message: string,
    conversationId: string
  ): Promise<void> {
    await this.show({
      type: NotificationType.PEER_MESSAGE,
      priority: NotificationPriority.NORMAL,
      title: `Message from ${senderName}`,
      body: message,
      icon: '/icons/message-icon.png',
      data: { conversationId },
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' },
      ],
    });
  }

  /**
   * Handle push event
   */
  private async handlePushEvent(event: Event): Promise<void> {
    const pushEvent = event as any;
    const data = pushEvent.data?.json() || {};
    
    // Create notification from push data
    const notification: Partial<Notification> = {
      type: data.type,
      priority: data.priority,
      title: data.title,
      body: data.body,
      icon: data.icon,
      data: data.data,
      actions: data.actions,
    };

    await this.show(notification);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(event: Event): void {
    const notificationEvent = event as any;
    notificationEvent.notification?.close();

    const action = notificationEvent.action;
    const data = notificationEvent.notification?.data;

    // Handle different actions
    switch (action) {
      case 'call-988':
        window.location.href = 'tel:988';
        break;
      case 'safety-plan':
        window.location.href = '/safety-plan';
        break;
      case 'reply':
        window.location.href = `/chat/${data.conversationId}`;
        break;
      case 'view':
        window.location.href = data.url || '/';
        break;
      case 'snooze':
        this.snoozeNotification(data);
        break;
      default:
        // Open app if no specific action
        if (data?.url) {
          window.location.href = data.url;
        }
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = {
      ...this.preferences,
      ...preferences,
    };

    // Save locally
    this.savePreferences();

    // Update on server
    await apiClient.put('/notifications/preferences', this.preferences);
  }

  /**
   * Get notification history
   */
  async getHistory(limit: number = 50): Promise<Notification[]> {
    try {
      const notifications = await apiClient.get<Notification[]>('/notifications/history', {
        limit,
      });
      return notifications;
    } catch (error) {
      console.error('Astral Core: Failed to get notification history:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Astral Core: Failed to mark notification as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    try {
      await apiClient.delete('/notifications/all');
      
      // Clear from service worker
      if (this.swRegistration) {
        const notifications = await this.swRegistration.getNotifications();
        notifications.forEach(n => n.close());
      }
    } catch (error) {
      console.error('Astral Core: Failed to clear notifications:', error);
    }
  }

  /**
   * Check if should show notification
   */
  private shouldShowNotification(notification: Partial<Notification>): boolean {
    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return false;
    }

    // Always show crisis notifications
    if (notification.priority === NotificationPriority.CRISIS) {
      return true;
    }

    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = this.preferences.quietHours;
      
      if (start <= end) {
        if (currentTime >= start && currentTime <= end) {
          return false;
        }
      } else if (currentTime >= start || currentTime <= end) {
        return false;
      }
    }

    // Check blocked types
    if (notification.type && this.preferences.blockedTypes.includes(notification.type)) {
      return false;
    }

    // Check specific preferences
    switch (notification.type) {
      case NotificationType.CRISIS_ALERT:
        return this.preferences.crisisAlerts;
      case NotificationType.PEER_MESSAGE:
        return this.preferences.peerMessages;
      case NotificationType.WELLNESS_REMINDER:
        return this.preferences.wellnessReminders;
      case NotificationType.COMMUNITY_UPDATE:
        return this.preferences.communityUpdates;
      default:
        return true;
    }
  }

  /**
   * Process queued notifications
   */
  private async processQueuedNotifications(): Promise<void> {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        await this.displayNotification(notification);
      }
    }
  }

  /**
   * Snooze notification
   */
  private async snoozeNotification(data: unknown): Promise<void> {
    // Schedule notification for 15 minutes later
    const notificationData = data as Partial<Notification>;
    if (notificationData) {
      setTimeout(() => {
        this.show({
          ...notificationData,
          title: `[Snoozed] ${notificationData.title || 'Notification'}`,
        });
      }, 15 * 60 * 1000);
    }
  }

  /**
   * Store notification in history
   */
  private async storeNotification(notification: Notification): Promise<void> {
    try {
      await apiClient.post('/notifications/history', notification);
    } catch (error) {
      console.error('Astral Core: Failed to store notification:', error);
    }
  }

  /**
   * Track notification analytics
   */
  private trackNotification(notification: Notification): void {
    // Send analytics event
    const windowWithGtag = window as any;
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag('event', 'notification_shown', {
        notification_type: notification.type,
        notification_priority: notification.priority,
      });
    }
  }

  /**
   * Show welcome notification
   */
  private showWelcomeNotification(): void {
    this.show({
      type: NotificationType.SYSTEM_ALERT,
      priority: NotificationPriority.NORMAL,
      title: 'Welcome to Astral Core',
      body: 'Notifications are now enabled. We\'ll keep you updated on important events.',
      icon: '/icon-192.png',
    });
  }

  /**
   * Load preferences from storage
   */
  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('astralcore_notification_preferences');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      enabled: true,
      sound: true,
      vibration: true,
      crisisAlerts: true,
      peerMessages: true,
      wellnessReminders: true,
      communityUpdates: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      blockedTypes: [],
    };
  }

  /**
   * Save preferences to storage
   */
  private savePreferences(): void {
    localStorage.setItem('astralcore_notification_preferences', JSON.stringify(this.preferences));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }
}

// Export singleton instance
export const astralCoreNotificationService = new AstralCoreNotificationService();

export default astralCoreNotificationService;