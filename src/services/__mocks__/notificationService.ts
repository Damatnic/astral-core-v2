/**
 * Mock Notification Service for testing
 */

export const notificationService = {
  // Permission methods
  requestPermission: jest.fn(() => Promise.resolve('granted')),
  getPermissionStatus: jest.fn(() => 'granted'),
  isSupported: jest.fn(() => true),
  
  // Notification methods
  showNotification: jest.fn(() => Promise.resolve()),
  showInAppNotification: jest.fn(),
  scheduleNotification: jest.fn(() => Promise.resolve('notification-id')),
  cancelNotification: jest.fn(() => Promise.resolve()),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
  
  // Push subscription methods
  subscribeToPush: jest.fn(() => Promise.resolve()),
  unsubscribeFromPush: jest.fn(() => Promise.resolve()),
  getPushSubscription: jest.fn(() => Promise.resolve(null)),
  
  // Preference methods
  getPreferences: jest.fn(() => Promise.resolve({
    enabled: true,
    soundEnabled: false,
    crisisAlerts: true,
    sessionReminders: true,
    encouragementMessages: true
  })),
  updatePreferences: jest.fn(() => Promise.resolve()),
  
  // Helper methods
  hasNotificationSupport: jest.fn(() => true),
  hasPushSupport: jest.fn(() => true),
  
  // Service worker methods
  registerServiceWorker: jest.fn(() => Promise.resolve()),
  unregisterServiceWorker: jest.fn(() => Promise.resolve()),
  
  // Badge methods
  setBadge: jest.fn(() => Promise.resolve()),
  clearBadge: jest.fn(() => Promise.resolve()),
};