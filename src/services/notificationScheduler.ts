/**
 * Notification Scheduler Service
 * 
 * Manages scheduled push notifications for medication reminders,
 * mood check-ins, therapy sessions, and custom reminders.
 */

import { pushNotificationService } from './pushNotificationService';

interface ScheduledNotification {
  id: string;
  type: 'medication' | 'mood_checkin' | 'therapy' | 'wellness' | 'custom';
  title: string;
  message: string;
  time: string; // HH:MM format
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  enabled: boolean;
  lastSent?: Date;
  nextScheduled?: Date | null; // Allow null for compatibility
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
  metadata?: {
    medicationName?: string;
    dosage?: string;
    therapistName?: string;
    sessionType?: string;
    [key: string]: any;
  };
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationQueue {
  id: string;
  scheduledFor: Date;
  notification: ScheduledNotification;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

class NotificationScheduler {
  private schedules: Map<string, ScheduledNotification> = new Map();
  private queue: NotificationQueue[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadSchedules();
    this.start();
  }

  /**
   * Start the notification scheduler
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[Scheduler] Starting notification scheduler');
    
    // Check every minute for scheduled notifications
    this.checkInterval = setInterval(() => {
      this.checkScheduledNotifications();
    }, 60000); // 1 minute
    
    // Initial check
    this.checkScheduledNotifications();
    
    // Schedule all active notifications
    this.scheduleAllNotifications();
  }

  /**
   * Stop the notification scheduler
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    console.log('[Scheduler] Stopping notification scheduler');
    
    // Clear interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Add a new scheduled notification
   */
  public addSchedule(notification: Omit<ScheduledNotification, 'id'>): string {
    const id = this.generateId();
    const schedule: ScheduledNotification = {
      ...notification,
      id,
      nextScheduled: this.calculateNextScheduledTime(notification)
    };
    
    this.schedules.set(id, schedule);
    this.saveSchedules();
    
    if (schedule.enabled) {
      this.scheduleNotification(schedule);
    }
    
    console.log('[Scheduler] Added schedule:', schedule);
    return id;
  }

  /**
   * Update an existing scheduled notification
   */
  public updateSchedule(id: string, updates: Partial<ScheduledNotification>): boolean {
    const schedule = this.schedules.get(id);
    if (!schedule) return false;
    
    // Clear existing timer
    const existingTimer = this.timers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(id);
    }
    
    // Update schedule
    const updatedSchedule = {
      ...schedule,
      ...updates,
      nextScheduled: this.calculateNextScheduledTime({ ...schedule, ...updates })
    };
    
    this.schedules.set(id, updatedSchedule);
    this.saveSchedules();
    
    // Reschedule if enabled
    if (updatedSchedule.enabled) {
      this.scheduleNotification(updatedSchedule);
    }
    
    console.log('[Scheduler] Updated schedule:', updatedSchedule);
    return true;
  }

  /**
   * Remove a scheduled notification
   */
  public removeSchedule(id: string): boolean {
    const schedule = this.schedules.get(id);
    if (!schedule) return false;
    
    // Clear timer
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    
    // Remove from schedules
    this.schedules.delete(id);
    this.saveSchedules();
    
    // Remove from queue
    this.queue = this.queue.filter(item => item.notification.id !== id);
    
    console.log('[Scheduler] Removed schedule:', id);
    return true;
  }

  /**
   * Get all scheduled notifications
   */
  public getSchedules(): ScheduledNotification[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get scheduled notifications by type
   */
  public getSchedulesByType(type: ScheduledNotification['type']): ScheduledNotification[] {
    return Array.from(this.schedules.values()).filter(s => s.type === type);
  }

  /**
   * Get upcoming notifications
   */
  public getUpcomingNotifications(hours: number = 24): NotificationQueue[] {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return this.queue.filter(item => 
      item.status === 'pending' &&
      item.scheduledFor >= now &&
      item.scheduledFor <= futureTime
    ).sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  /**
   * Add medication reminder
   */
  public addMedicationReminder(
    medicationName: string,
    dosage: string,
    time: string,
    days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  ): string {
    return this.addSchedule({
      type: 'medication',
      title: 'Medication Reminder',
      message: `Time to take ${medicationName} (${dosage})`,
      time,
      days,
      enabled: true,
      repeatInterval: 'daily',
      metadata: {
        medicationName,
        dosage
      }
    });
  }

  /**
   * Add mood check-in reminder
   */
  public addMoodCheckIn(
    time: string,
    days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    message: string = 'How are you feeling today?'
  ): string {
    return this.addSchedule({
      type: 'mood_checkin',
      title: 'Mood Check-In',
      message,
      time,
      days,
      enabled: true,
      repeatInterval: 'daily'
    });
  }

  /**
   * Add therapy session reminder
   */
  public addTherapyReminder(
    therapistName: string,
    sessionType: string,
    time: string,
    days: string[]
  ): string {
    return this.addSchedule({
      type: 'therapy',
      title: 'Therapy Session Reminder',
      message: `Upcoming ${sessionType} session with ${therapistName}`,
      time,
      days,
      enabled: true,
      repeatInterval: 'weekly',
      metadata: {
        therapistName,
        sessionType
      }
    });
  }

  /**
   * Schedule a notification
   */
  private scheduleNotification(schedule: ScheduledNotification): void {
    if (!schedule.enabled) return;
    
    const nextTime = this.calculateNextScheduledTime(schedule);
    if (!nextTime) return;
    
    const now = new Date();
    const delay = nextTime.getTime() - now.getTime();
    
    if (delay <= 0) {
      // Should have been sent already, schedule for next occurrence
      this.sendNotification(schedule);
      return;
    }
    
    // Clear existing timer
    const existingTimer = this.timers.get(schedule.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.sendNotification(schedule);
    }, delay);
    
    this.timers.set(schedule.id, timer);
    
    // Add to queue
    this.addToQueue(schedule, nextTime);
  }

  /**
   * Schedule all active notifications
   */
  private scheduleAllNotifications(): void {
    this.schedules.forEach(schedule => {
      if (schedule.enabled) {
        this.scheduleNotification(schedule);
      }
    });
  }

  /**
   * Check for scheduled notifications that should be sent
   */
  private checkScheduledNotifications(): void {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    
    this.schedules.forEach(schedule => {
      if (!schedule.enabled) return;
      if (!schedule.days.includes(currentDay)) return;
      if (schedule.time !== currentTime) return;
      
      // Check if already sent recently (within last 5 minutes)
      if (schedule.lastSent) {
        const timeSinceLastSent = now.getTime() - schedule.lastSent.getTime();
        if (timeSinceLastSent < 5 * 60 * 1000) return;
      }
      
      this.sendNotification(schedule);
    });
  }

  /**
   * Send a scheduled notification
   */
  private async sendNotification(schedule: ScheduledNotification): Promise<void> {
    try {
      // Check if notifications are enabled and user has permission
      const status = pushNotificationService.getStatus();
      if (!status.hasPermission || !status.isSubscribed) {
        console.log('[Scheduler] Cannot send notification - no permission or not subscribed');
        this.updateQueueStatus(schedule.id, 'cancelled');
        return;
      }
      
      // Check quiet hours
      const userId = localStorage.getItem('userId') || 'default';
      const shouldSend = await pushNotificationService.shouldSendNotification(
        userId,
        schedule.type === 'medication' ? 'urgent' : 'non_urgent'
      );
      
      if (!shouldSend) {
        console.log('[Scheduler] Notification blocked by quiet hours:', schedule.id);
        this.updateQueueStatus(schedule.id, 'cancelled');
        
        // Reschedule for next occurrence
        this.rescheduleNotification(schedule);
        return;
      }
      
      // Send the notification
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.warn('[Scheduler] No service worker registration');
        this.updateQueueStatus(schedule.id, 'failed');
        return;
      }
      
      await registration.showNotification(schedule.title, {
        body: schedule.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `scheduled-${schedule.id}`,
        data: {
          type: schedule.type,
          scheduleId: schedule.id,
          metadata: schedule.metadata,
          timestamp: Date.now()
        },
        requireInteraction: schedule.type === 'medication'
        // Note: actions property not supported in NotificationOptions
        // Actions would be handled via service worker in production
      });
      
      // Update last sent time
      schedule.lastSent = new Date();
      this.schedules.set(schedule.id, schedule);
      this.saveSchedules();
      
      // Update queue status
      this.updateQueueStatus(schedule.id, 'sent');
      
      // Schedule next occurrence
      this.rescheduleNotification(schedule);
      
      console.log('[Scheduler] Notification sent:', schedule.id);
    } catch (error) {
      console.error('[Scheduler] Failed to send notification:', error);
      this.updateQueueStatus(schedule.id, 'failed');
    }
  }

  /**
   * Reschedule notification for next occurrence
   */
  private rescheduleNotification(schedule: ScheduledNotification): void {
    const nextTime = this.calculateNextScheduledTime(schedule);
    if (nextTime) {
      schedule.nextScheduled = nextTime;
      this.schedules.set(schedule.id, schedule);
      this.saveSchedules();
      this.scheduleNotification(schedule);
    }
  }

  /**
   * Calculate next scheduled time for a notification
   */
  private calculateNextScheduledTime(schedule: Partial<ScheduledNotification>): Date | null {
    if (!schedule.time || !schedule.days || schedule.days.length === 0) {
      return null;
    }
    
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Find next occurrence
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(hours, minutes, 0, 0);
      
      const dayName = dayNames[checkDate.getDay()];
      
      if (schedule.days.includes(dayName)) {
        // Skip if it's today but the time has passed
        if (i === 0 && checkDate.getTime() <= now.getTime()) {
          continue;
        }
        return checkDate;
      }
    }
    
    return null;
  }

  /**
   * Get notification actions based on type
   * Note: Currently not used as actions aren't supported in NotificationOptions
   * Keeping for future service worker implementation
   */
  // @ts-ignore - Method preserved for future use
  private getNotificationActions(type: string): NotificationAction[] {
    switch (type) {
      case 'medication':
        return [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Remind in 15 min' }
        ];
      case 'mood_checkin':
        return [
          { action: 'checkin', title: 'Check In Now' },
          { action: 'later', title: 'Later' }
        ];
      case 'therapy':
        return [
          { action: 'confirm', title: 'Confirm' },
          { action: 'reschedule', title: 'Reschedule' }
        ];
      default:
        return [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ];
    }
  }

  /**
   * Add notification to queue
   */
  private addToQueue(schedule: ScheduledNotification, scheduledFor: Date): void {
    // Remove existing queue item for this schedule
    this.queue = this.queue.filter(item => item.notification.id !== schedule.id);
    
    // Add new queue item
    this.queue.push({
      id: this.generateId(),
      scheduledFor,
      notification: schedule,
      status: 'pending'
    });
    
    // Keep queue size manageable (last 100 items)
    if (this.queue.length > 100) {
      this.queue = this.queue.slice(-100);
    }
  }

  /**
   * Update queue status
   */
  private updateQueueStatus(scheduleId: string, status: NotificationQueue['status']): void {
    const queueItem = this.queue.find(item => item.notification.id === scheduleId);
    if (queueItem) {
      queueItem.status = status;
    }
  }

  /**
   * Load schedules from storage
   */
  private loadSchedules(): void {
    try {
      const saved = localStorage.getItem('notification_schedules');
      if (saved) {
        const schedules = JSON.parse(saved);
        schedules.forEach((schedule: ScheduledNotification) => {
          // Restore dates
          if (schedule.lastSent) {
            schedule.lastSent = new Date(schedule.lastSent);
          }
          if (schedule.nextScheduled) {
            schedule.nextScheduled = new Date(schedule.nextScheduled);
          }
          this.schedules.set(schedule.id, schedule);
        });
      }
    } catch (error) {
      console.error('[Scheduler] Failed to load schedules:', error);
    }
  }

  /**
   * Save schedules to storage
   */
  private saveSchedules(): void {
    try {
      const schedules = Array.from(this.schedules.values());
      localStorage.setItem('notification_schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('[Scheduler] Failed to save schedules:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();

// Export types
export type { ScheduledNotification, NotificationQueue };