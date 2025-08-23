/**
 * Service Worker Manager - Basic Implementation
 * 
 * Provides basic service worker functionality interface
 * for compatibility with existing hooks.
 */

export interface CacheStatus {
  staticResources: boolean;
  crisisResources: boolean;
  translations: boolean;
  culturalContent: boolean;
  aiModels: boolean;
  swRegistered?: boolean;
  cacheVersion?: string;
  updateAvailable?: boolean;
}

class ServiceWorkerManager {
  private readonly isReady: boolean = false;
  private readonly onlineCallbacks: Array<() => void> = [];
  private readonly offlineCallbacks: Array<() => void> = [];
  private readonly updateCallbacks: Array<() => void> = [];

  async initialize(): Promise<{ supported: boolean; registered?: boolean }> {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[ServiceWorker] Registered:', registration);
      return { supported: true, registered: true };
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
      return { supported: true, registered: false };
    }
  }

  hasMessageChannel(): boolean {
    return true; // Stub implementation
  }

  async cacheResources(resources: string[]): Promise<boolean> {
    console.log('[ServiceWorker] Cache resources:', resources);
    return true; // Stub implementation
  }

  async preloadCriticalResources(resources: string[]): Promise<void> {
    console.log('[ServiceWorker] Preload critical resources:', resources);
  }

  async registerBackgroundSync(data: unknown): Promise<void> {
    console.log('[ServiceWorker] Register background sync:', data);
  }

  async queueOfflineAction(action: any): Promise<void> {
    console.log('[ServiceWorker] Queue offline action:', action);
  }

  async setupPushNotifications(vapidKey: string): Promise<PushSubscription | null> {
    console.log('[ServiceWorker] Setup push notifications with VAPID key:', vapidKey);
    return null; // Stub implementation
  }

  async sendNotification(notification: any): Promise<void> {
    console.log('[ServiceWorker] Send notification:', notification);
  }

  // Keep the existing onNotification property for compatibility
  onNotification?: (notification: any) => void;

  async isOfflineReady(): Promise<boolean> {
    return this.isReady;
  }

  async getCacheStatus(): Promise<CacheStatus> {
    return {
      staticResources: false,
      crisisResources: false,
      translations: false,
      culturalContent: false,
      aiModels: false,
      swRegistered: 'serviceWorker' in navigator,
      cacheVersion: '1.0.0',
      updateAvailable: false
    };
  }

  async skipWaiting(): Promise<void> {
    // Stub implementation
    console.log('[ServiceWorker] Skip waiting requested');
  }

  async checkForUpdates(): Promise<boolean> {
    // Stub implementation
    return false;
  }

  async clearCache(cacheName?: string): Promise<boolean> {
    // Stub implementation
    console.log('[ServiceWorker] Clear cache:', cacheName || 'all');
    return true;
  }

  async cacheCrisisResource(url: string): Promise<boolean> {
    console.log('[ServiceWorker] Cache crisis resource:', url);
    return true;
  }

  async precacheCrisisResources(): Promise<void> {
    console.log('[ServiceWorker] Precache crisis resources');
  }

  forceReload(): void {
    window.location.reload();
  }

  onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }

  onUpdateAvailable(callback: () => void): void {
    this.updateCallbacks.push(callback);
  }

  removeOnlineListener(callback: () => void): void {
    const index = this.onlineCallbacks.indexOf(callback);
    if (index > -1) {
      this.onlineCallbacks.splice(index, 1);
    }
  }

  removeOfflineListener(callback: () => void): void {
    const index = this.offlineCallbacks.indexOf(callback);
    if (index > -1) {
      this.offlineCallbacks.splice(index, 1);
    }
  }

  removeUpdateListener(callback: () => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  getNetworkStatus(): { isOnline: boolean; type?: string } {
    // Type-safe access to network connection API
    const navigatorWithConnection = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
      };
    };
    
    return {
      isOnline: navigator.onLine,
      type: navigatorWithConnection.connection?.effectiveType || 'unknown'
    };
  }
}

const serviceWorkerManager = new ServiceWorkerManager();
export default serviceWorkerManager;
