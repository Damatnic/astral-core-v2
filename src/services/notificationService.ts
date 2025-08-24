/**
 * Notification Service for CoreV2 Mental Health Platform
 * Handles push notifications, in-app notifications, and notification preferences
 * HIPAA-compliant with privacy and security considerations
 */

import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { auth0Service } from './auth0Service';

export type NotificationUrgency = 'low' | 'normal' | 'high' | 'crisis';
export type NotificationCategory = 'message' | 'reminder' | 'alert' | 'crisis' | 'achievement' | 'system' | 'therapy' | 'wellness';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  urgency?: NotificationUrgency;
  category?: NotificationCategory;
  scheduledTime?: Date;
  expiresAt?: Date;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'crisis';
  urgency: NotificationUrgency;
  category: NotificationCategory;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  expiresAt?: Date;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  categories: {
    [K in NotificationCategory]: {
      enabled: boolean;
      push: boolean;
      inApp: boolean;
      email: boolean;
      sms: boolean;
      quietHours?: {
        start: string; // HH:mm format
        end: string;   // HH:mm format
      };
    };
  };
  urgencyLevels: {
    [K in NotificationUrgency]: {
      overrideQuietHours: boolean;
      sound: boolean;
      vibration: boolean;
    };
  };
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private inAppNotifications: InAppNotification[] = [];
  private preferences: NotificationPreferences | null = null;
  private listeners: Array<(notification: InAppNotification) => void> = [];

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Initialize service worker for push notifications
      if ('serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.ready;
      }

      // Load user preferences
      await this.loadPreferences();

      // Set up notification click handlers
      this.setupNotificationHandlers();

      logger.info('Notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize notification service:', error);
    }
  }

  private setupNotificationHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.notification);
        }
      });
    }
  }

  private handleNotificationClick(notificationData: unknown): void {
    logger.info('Notification clicked:', notificationData);
    // Handle notification click based on data
    // This could navigate to specific views, open modals, etc.
  }

  // Permission management
  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    logger.info('Notification permission:', permission);
    return permission;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Push notification subscription
  public async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not available');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check if already subscribed
      this.subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!this.subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        this.subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      logger.info('Push subscription successful');
      return this.subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  public async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        logger.info('Push unsubscription successful');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

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

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: NotificationSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      await apiService.post('/notifications/subscribe', subscriptionData);
    } catch (error) {
      logger.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await apiService.delete('/notifications/unsubscribe');
    } catch (error) {
      logger.error('Failed to remove subscription from server:', error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // In-app notifications
  public showInAppNotification(options: Omit<InAppNotification, 'id' | 'timestamp' | 'read' | 'dismissed'>): string {
    const notification: InAppNotification = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      dismissed: false,
      ...options
    };

    this.inAppNotifications.unshift(notification);
    
    // Limit to 100 notifications
    if (this.inAppNotifications.length > 100) {
      this.inAppNotifications = this.inAppNotifications.slice(0, 100);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(notification));

    // Auto-dismiss non-crisis notifications after 5 seconds
    if (notification.urgency !== 'crisis') {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, 5000);
    }

    logger.info('In-app notification shown:', notification.title);
    return notification.id;
  }

  public getInAppNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  public getUnreadNotifications(): InAppNotification[] {
    return this.inAppNotifications.filter(n => !n.read && !n.dismissed);
  }

  public markAsRead(notificationId: string): void {
    const notification = this.inAppNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      logger.debug('Notification marked as read:', notificationId);
    }
  }

  public dismissNotification(notificationId: string): void {
    const notification = this.inAppNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      logger.debug('Notification dismissed:', notificationId);
    }
  }

  public clearAllNotifications(): void {
    this.inAppNotifications = [];
    logger.info('All notifications cleared');
  }

  // Browser notifications
  public async showBrowserNotification(options: NotificationOptions): Promise<void> {
    try {
      const permission = this.getPermissionStatus();
      if (permission !== 'granted') {
        logger.warn('Cannot show browser notification: permission not granted');
        return;
      }

      // Check preferences
      if (!this.shouldShowNotification(options.category || 'system', options.urgency || 'normal')) {
        logger.debug('Notification blocked by user preferences');
        return;
      }

      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || options.urgency === 'crisis',
        silent: options.silent || false,
        vibrate: options.vibrate,
        actions: options.actions
      });

      // Handle click
      notification.onclick = () => {
        window.focus();
        this.handleNotificationClick(options.data);
        notification.close();
      };

      // Auto-close after delay (except crisis notifications)
      if (options.urgency !== 'crisis') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      logger.info('Browser notification shown:', options.title);
    } catch (error) {
      logger.error('Failed to show browser notification:', error);
    }
  }

  // Convenience methods
  public async sendNotification(
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' | 'crisis' = 'info',
    category: NotificationCategory = 'system'
  ): Promise<void> {
    const urgency: NotificationUrgency = type === 'crisis' ? 'crisis' : type === 'error' ? 'high' : 'normal';
    
    // Show in-app notification
    this.showInAppNotification({
      title,
      message,
      type,
      urgency,
      category
    });

    // Show browser notification for important messages
    if (urgency === 'crisis' || urgency === 'high') {
      await this.showBrowserNotification({
        title,
        body: message,
        urgency,
        category,
        requireInteraction: urgency === 'crisis'
      });
    }
  }

  public async sendCrisisAlert(message: string, data?: Record<string, unknown>): Promise<void> {
    await this.sendNotification(
      '🚨 Crisis Alert',
      message,
      'crisis',
      'crisis'
    );

    // Also send push notification if subscribed
    try {
      await apiService.post('/notifications/crisis-alert', {
        message,
        timestamp: new Date().toISOString(),
        data
      });
    } catch (error) {
      logger.error('Failed to send crisis alert via push:', error);
    }
  }

  // Preferences management
  public async loadPreferences(): Promise<NotificationPreferences> {
    try {
      if (auth0Service.isAuthenticated()) {
        const response = await apiService.get<NotificationPreferences>('/user/notification-preferences');
        this.preferences = response.data;
      } else {
        // Load from localStorage for anonymous users
        const stored = localStorage.getItem('notification_preferences');
        this.preferences = stored ? JSON.parse(stored) : this.getDefaultPreferences();
      }

      return this.preferences!;
    } catch (error) {
      logger.error('Failed to load notification preferences:', error);
      this.preferences = this.getDefaultPreferences();
      return this.preferences;
    }
  }

  public async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      this.preferences = preferences;

      if (auth0Service.isAuthenticated()) {
        await apiService.put('/user/notification-preferences', preferences);
      } else {
        localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      }

      logger.info('Notification preferences saved');
    } catch (error) {
      logger.error('Failed to save notification preferences:', error);
      throw error;
    }
  }

  public getPreferences(): NotificationPreferences {
    return this.preferences || this.getDefaultPreferences();
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      pushEnabled: true,
      inAppEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      categories: {
        message: { enabled: true, push: true, inApp: true, email: false, sms: false },
        reminder: { enabled: true, push: true, inApp: true, email: true, sms: false },
        alert: { enabled: true, push: true, inApp: true, email: true, sms: false },
        crisis: { enabled: true, push: true, inApp: true, email: true, sms: true },
        achievement: { enabled: true, push: false, inApp: true, email: false, sms: false },
        system: { enabled: true, push: false, inApp: true, email: false, sms: false },
        therapy: { enabled: true, push: true, inApp: true, email: true, sms: false },
        wellness: { enabled: true, push: false, inApp: true, email: false, sms: false }
      },
      urgencyLevels: {
        low: { overrideQuietHours: false, sound: false, vibration: false },
        normal: { overrideQuietHours: false, sound: true, vibration: true },
        high: { overrideQuietHours: true, sound: true, vibration: true },
        crisis: { overrideQuietHours: true, sound: true, vibration: true }
      }
    };
  }

  private shouldShowNotification(category: NotificationCategory, urgency: NotificationUrgency): boolean {
    if (!this.preferences) return true;

    const categoryPrefs = this.preferences.categories[category];
    if (!categoryPrefs?.enabled) return false;

    // Check quiet hours (unless overridden by urgency)
    const urgencyPrefs = this.preferences.urgencyLevels[urgency];
    if (!urgencyPrefs.overrideQuietHours && this.isQuietHours(categoryPrefs.quietHours)) {
      return false;
    }

    return true;
  }

  private isQuietHours(quietHours?: { start: string; end: string }): boolean {
    if (!quietHours) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }

  // Event listeners
  public addNotificationListener(listener: (notification: InAppNotification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Cleanup
  public cleanup(): void {
    this.listeners = [];
    this.inAppNotifications = [];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
