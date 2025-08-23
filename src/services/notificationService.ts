/**
 * Notification Service for Astral Core
 * Handles push notifications, in-app notifications, and notification preferences
 */

import { Toast } from '../types';
import { ENV } from '../utils/envConfig';
import apiService from './apiService';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  urgency?: 'low' | 'normal' | 'high' | 'crisis';
  category?: 'message' | 'reminder' | 'alert' | 'crisis' | 'achievement' | 'system';
  scheduledTime?: Date;
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
  messages: boolean;
  reminders: boolean;
  achievements: boolean;
  systemUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  frequency: 'all' | 'important' | 'crisis-only';
}

export interface ScheduledNotification {
  id: string;
  notification: NotificationOptions;
  scheduledTime: Date;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
}

class NotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private notificationQueue: NotificationOptions[] = [];
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private preferences: NotificationPreferences = {
    enabled: true,
    sound: true,
    vibration: true,
    crisisAlerts: true,
    messages: true,
    reminders: true,
    achievements: true,
    systemUpdates: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'all'
  };
  private isOnline: boolean = navigator.onLine;
  private vapidPublicKey: string = ENV.VAPID_PUBLIC_KEY || '';
  private _addToast: ((message: string, type?: Toast['type']) => void) | null = null;

  constructor() {
    this.init();
    this.setupEventListeners();
    this.loadPreferences();
  }

  /**
   * Initialize the notification service
   */
  private async init() {
    // Check browser support
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    // Check service worker support
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return;
    }

    // Register service worker
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushNotificationQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for notification clicks from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'notification-click') {
          this.handleNotificationClick(event.data);
        }
      });
    }

    // Listen for visibility change to handle background notifications
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkMissedNotifications();
      }
    });
  }

  /**
   * Load notification preferences from localStorage
   */
  private loadPreferences() {
    const stored = localStorage.getItem('notification_preferences');
    if (stored) {
      this.preferences = { ...this.preferences, ...JSON.parse(stored) };
    }
  }

  /**
   * Save notification preferences
   */
  private savePreferences() {
    localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    // Already have permission
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Subscribe to push notifications
      await this.subscribeToPushNotifications();
    }

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications() {
    if (!this.serviceWorkerRegistration || !this.vapidPublicKey) {
      return;
    }

    try {
      // Convert VAPID key to Uint8Array
      const convertedVapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Subscribe to push service
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to backend
      await apiService.post('/notifications/subscribe', {
        subscription: subscription.toJSON(),
        preferences: this.preferences
      });

      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<void> {
    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    // Check quiet hours
    if (this.isInQuietHours() && options.urgency !== 'crisis') {
      this.queueNotification(options);
      return;
    }

    // Check frequency preferences
    if (!this.shouldShowNotification(options)) {
      return;
    }

    // Add default icon if not provided
    if (!options.icon) {
      options.icon = '/icon-192.png';
    }

    // Add vibration pattern for crisis notifications
    if (options.urgency === 'crisis' && this.preferences.vibration) {
      options.vibrate = [200, 100, 200, 100, 200];
      options.requireInteraction = true;
    }

    // Show notification
    try {
      if (this.serviceWorkerRegistration) {
        // Use service worker for better reliability
        await this.serviceWorkerRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          tag: options.tag || `notification-${Date.now()}`,
          data: options.data,
          requireInteraction: options.requireInteraction,
          silent: options.silent || !this.preferences.sound,
          // vibrate: this.preferences.vibration ? options.vibrate : undefined,
          // actions: options.actions
        });
      } else {
        // Fallback to Notification API
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction,
          silent: options.silent || !this.preferences.sound
          // vibrate: this.preferences.vibration ? options.vibrate : undefined
        });
      }

      // Track notification shown
      this.trackNotification('shown', options);
    } catch (error) {
      console.error('Failed to show notification:', error);
      
      // Queue for later if offline
      if (!this.isOnline) {
        this.queueNotification(options);
      }
    }
  }

  /**
   * Check if in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(options: NotificationOptions): boolean {
    const { frequency } = this.preferences;
    
    if (frequency === 'crisis-only' && options.urgency !== 'crisis') {
      return false;
    }

    if (frequency === 'important' && options.urgency === 'low') {
      return false;
    }

    // Check category preferences
    switch (options.category) {
      case 'crisis':
        return this.preferences.crisisAlerts;
      case 'message':
        return this.preferences.messages;
      case 'reminder':
        return this.preferences.reminders;
      case 'achievement':
        return this.preferences.achievements;
      case 'system':
        return this.preferences.systemUpdates;
      default:
        return true;
    }
  }

  /**
   * Queue notification for later
   */
  private queueNotification(options: NotificationOptions) {
    this.notificationQueue.push(options);
    
    // Store in localStorage for persistence
    localStorage.setItem('notification_queue', JSON.stringify(this.notificationQueue));
  }

  /**
   * Flush notification queue
   */
  private async flushNotificationQueue() {
    // Load queue from localStorage
    const stored = localStorage.getItem('notification_queue');
    if (stored) {
      this.notificationQueue = JSON.parse(stored);
    }

    // Show all queued notifications
    for (const notification of this.notificationQueue) {
      await this.show(notification);
    }

    // Clear queue
    this.notificationQueue = [];
    localStorage.removeItem('notification_queue');
  }

  /**
   * Schedule a notification
   */
  scheduleNotification(notification: NotificationOptions, scheduledTime: Date, recurring?: ScheduledNotification['recurring']): string {
    const id = `scheduled-${Date.now()}-${Math.random()}`;
    
    const schedule = () => {
      const now = new Date();
      const delay = scheduledTime.getTime() - now.getTime();

      if (delay <= 0) {
        // Show immediately if time has passed
        this.show(notification);
        
        // Schedule next occurrence if recurring
        if (recurring) {
          this.scheduleNextOccurrence(id, notification, scheduledTime, recurring);
        }
      } else {
        // Schedule for future
        const timeout = setTimeout(() => {
          this.show(notification);
          
          // Schedule next occurrence if recurring
          if (recurring) {
            this.scheduleNextOccurrence(id, notification, scheduledTime, recurring);
          } else {
            this.scheduledNotifications.delete(id);
          }
        }, delay);

        this.scheduledNotifications.set(id, timeout);
      }
    };

    schedule();
    
    // Store scheduled notification
    this.storeScheduledNotification({ id, notification, scheduledTime, recurring });
    
    return id;
  }

  /**
   * Schedule next occurrence of recurring notification
   */
  private scheduleNextOccurrence(_id: string, notification: NotificationOptions, lastTime: Date, recurring: ScheduledNotification['recurring']) {
    let nextTime = new Date(lastTime);

    if (!recurring) { return; }
    switch (recurring.type) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
          // Find next day in daysOfWeek
          let daysToAdd = 1;
          const currentDay = nextTime.getDay();
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (recurring.daysOfWeek.includes(checkDay)) {
              daysToAdd = i;
              break;
            }
          }
          nextTime.setDate(nextTime.getDate() + daysToAdd);
        } else {
          nextTime.setDate(nextTime.getDate() + 7);
        }
        break;
      case 'monthly':
        if (recurring.dayOfMonth) {
          nextTime.setMonth(nextTime.getMonth() + 1);
          nextTime.setDate(recurring.dayOfMonth);
        } else {
          nextTime.setMonth(nextTime.getMonth() + 1);
        }
        break;
    }

    this.scheduleNotification(notification, nextTime, recurring);
  }

  /**
   * Cancel scheduled notification
   */
  cancelScheduledNotification(id: string) {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
    }
    
    // Remove from storage
    this.removeScheduledNotification(id);
  }

  /**
   * Store scheduled notification
   */
  private storeScheduledNotification(scheduled: ScheduledNotification) {
    const stored = localStorage.getItem('scheduled_notifications');
    const notifications: ScheduledNotification[] = stored ? JSON.parse(stored) : [];
    notifications.push(scheduled);
    localStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
  }

  /**
   * Remove scheduled notification from storage
   */
  private removeScheduledNotification(id: string) {
    const stored = localStorage.getItem('scheduled_notifications');
    if (stored) {
      const notifications: ScheduledNotification[] = JSON.parse(stored);
      const filtered = notifications.filter(n => n.id !== id);
      localStorage.setItem('scheduled_notifications', JSON.stringify(filtered));
    }
  }

  /**
   * Load and reschedule stored notifications
   */
  loadScheduledNotifications() {
    const stored = localStorage.getItem('scheduled_notifications');
    if (stored) {
      const notifications: ScheduledNotification[] = JSON.parse(stored);
      for (const scheduled of notifications) {
        this.scheduleNotification(
          scheduled.notification,
          new Date(scheduled.scheduledTime),
          scheduled.recurring
        );
      }
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(data: unknown) {
    const notificationData = data as any;
    // Track click
    this.trackNotification('clicked', notificationData as NotificationOptions);

    // Handle based on action
    if (notificationData.action) {
      switch (notificationData.action) {
        case 'view':
          // Navigate to relevant page
          if (notificationData.url) {
            window.location.href = notificationData.url;
          }
          break;
        case 'dismiss':
          // Just close the notification
          break;
        case 'snooze':
          // Reschedule for 10 minutes later
          const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
          this.scheduleNotification(notificationData.notification, snoozeTime);
          break;
        default:
          // Custom action handling
          window.dispatchEvent(new CustomEvent('notification-action', { detail: notificationData }));
      }
    } else if (notificationData.url) {
      // Default click behavior
      window.location.href = notificationData.url;
    }
  }

  /**
   * Check for missed notifications
   */
  private async checkMissedNotifications() {
    try {
      const missed = await apiService.get('/notifications/missed');
      for (const notification of missed) {
        await this.show(notification);
      }
    } catch (error) {
      console.error('Failed to check missed notifications:', error);
    }
  }

  /**
   * Track notification events
   */
  private trackNotification(event: 'shown' | 'clicked' | 'dismissed', options: NotificationOptions) {
    // Send analytics event
    apiService.post('/notifications/track', {
      event,
      category: options.category,
      urgency: options.urgency,
      timestamp: new Date().toISOString()
    }).catch(console.error);
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    
    // Update backend
    apiService.post('/notifications/preferences', this.preferences).catch(console.error);
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Show crisis notification
   */
  async showCrisisNotification(title: string, body: string, data?: any) {
    await this.show({
      title,
      body,
      urgency: 'crisis',
      category: 'crisis',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Get Help Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: {
        ...data,
        url: '/crisis-support'
      }
    });
  }

  /**
   * Show message notification
   */
  async showMessageNotification(from: string, message: string, conversationId: string) {
    await this.show({
      title: `New message from ${from}`,
      body: message,
      category: 'message',
      urgency: 'normal',
      tag: `message-${conversationId}`,
      actions: [
        { action: 'view', title: 'Reply' },
        { action: 'dismiss', title: 'Later' }
      ],
      data: {
        url: `/chat/${conversationId}`
      }
    });
  }

  /**
   * Show reminder notification
   */
  async showReminderNotification(title: string, body: string, reminderId: string) {
    await this.show({
      title,
      body,
      category: 'reminder',
      urgency: 'normal',
      tag: `reminder-${reminderId}`,
      actions: [
        { action: 'view', title: 'Open' },
        { action: 'snooze', title: 'Snooze' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  /**
   * Show achievement notification
   */
  async showAchievementNotification(achievement: string, description: string) {
    await this.show({
      title: `Achievement Unlocked: ${achievement}`,
      body: description,
      category: 'achievement',
      urgency: 'low',
      icon: '/achievements-icon.png'
    });
  }

  /**
   * Clear all notifications
   */
  async clearAll() {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications();
      notifications.forEach(n => n.close());
    }
  }

  /**
   * Clear notifications by tag
   */
  async clearByTag(tag: string) {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications({ tag });
      notifications.forEach(n => n.close());
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Test notification
   */
  async testNotification() {
    await this.show({
      title: 'Test Notification',
      body: 'This is a test notification from Astral Core',
      category: 'system',
      urgency: 'low'
    });
  }

  // Legacy toast support
  setToastFunction(addToastFn: (message: string, type?: Toast['type']) => void) {
    this._addToast = addToastFn;
  }

  addToast(message: string, type: Toast['type'] = 'success') {
    if (this._addToast) {
      this._addToast(message, type);
    } else {
      console.warn('Toast function not set, falling back to alert');
      alert(message);
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// Load scheduled notifications on startup
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    notificationService.loadScheduledNotifications();
  });
}

export default notificationService;
