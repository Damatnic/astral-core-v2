/**
 * Intelligent Caching Integration
 * 
 * Integrates intelligent caching strategies with the existing enhanced service worker
 * Provides a bridge between our new caching services and the Workbox foundation
 */

import { intelligentCache, CachePriority, ResourceType } from './intelligentCachingService';
import { cacheCoordinator } from './cacheStrategyCoordinator';

export interface CacheIntegrationConfig {
  enableCacheWarming: boolean;
  enableIntelligentEviction: boolean;
  enableAnalytics: boolean;
  maintenanceInterval: number; // minutes
}

export class CacheIntegration {
  private config: CacheIntegrationConfig;
  private maintenanceTimer: number | null = null;
  private initialized = false;

  constructor(config: Partial<CacheIntegrationConfig> = {}) {
    this.config = {
      enableCacheWarming: true,
      enableIntelligentEviction: true,
      enableAnalytics: true,
      maintenanceInterval: 30, // 30 minutes
      ...config
    };
  }

  /**
   * Initialize intelligent caching integration
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[CacheIntegration] Initializing intelligent caching...');

    try {
      // Initialize cache warming if enabled
      if (this.config.enableCacheWarming) {
        await this.initializeCacheWarming();
      }

      // Set up periodic maintenance
      this.setupPeriodicMaintenance();

      // Set up storage monitoring
      this.setupStorageMonitoring();

      this.initialized = true;
      console.log('[CacheIntegration] Intelligent caching initialized successfully');
    } catch (error) {
      console.error('[CacheIntegration] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Initialize cache warming for critical resources
   */
  private async initializeCacheWarming(): Promise<void> {
    try {
      console.log('[CacheIntegration] Starting cache warming...');
      
      // Warm critical caches using intelligent service
      await intelligentCache.warmCriticalCaches();
      
      // Initialize coordinator cache warming
      await cacheCoordinator.initializeCacheWarming();
      
      console.log('[CacheIntegration] Cache warming completed');
    } catch (error) {
      console.error('[CacheIntegration] Cache warming failed:', error);
    }
  }

  /**
   * Set up periodic cache maintenance
   */
  private setupPeriodicMaintenance(): void {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
    }

    const intervalMs = this.config.maintenanceInterval * 60 * 1000;
    
    this.maintenanceTimer = window.setInterval(async () => {
      console.log('[CacheIntegration] Running periodic maintenance...');
      
      try {
        if (this.config.enableIntelligentEviction) {
          await intelligentCache.performIntelligentEviction();
        }
        
        await intelligentCache.cleanupExpiredEntries();
        await cacheCoordinator.performCacheCleanup();
        
        console.log('[CacheIntegration] Periodic maintenance completed');
      } catch (error) {
        console.error('[CacheIntegration] Periodic maintenance failed:', error);
      }
    }, intervalMs);

    console.log(`[CacheIntegration] Periodic maintenance scheduled every ${this.config.maintenanceInterval} minutes`);
  }

  /**
   * Set up storage monitoring and warnings
   */
  private setupStorageMonitoring(): void {
    // Listen for storage warnings from intelligent cache
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('storage-warning', ((event: CustomEvent) => {
        const { level, usagePercentage } = event.detail;
        this.handleStorageWarning(level, usagePercentage);
      }) as EventListener);
    }

    // Periodic storage checks
    setInterval(async () => {
      try {
        const storageInfo = await intelligentCache.getStorageInfo();
        
        if (storageInfo.usagePercentage > 0.9) {
          this.handleStorageWarning('critical', storageInfo.usagePercentage);
        } else if (storageInfo.usagePercentage > 0.8) {
          this.handleStorageWarning('warning', storageInfo.usagePercentage);
        }
      } catch (error) {
        console.error('[CacheIntegration] Storage monitoring check failed:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Handle storage warnings
   */
  private handleStorageWarning(level: 'warning' | 'critical', usagePercentage: number): void {
    console.warn(`[CacheIntegration] Storage ${level}: ${Math.round(usagePercentage * 100)}% used`);
    
    // Emit custom event for UI components to handle
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('cache-storage-warning', {
        detail: { level, usagePercentage }
      });
      window.dispatchEvent(event);
    }

    // Automatic cleanup for critical storage situations
    if (level === 'critical' && this.config.enableIntelligentEviction) {
      setTimeout(async () => {
        try {
          await intelligentCache.performIntelligentEviction();
          console.log('[CacheIntegration] Emergency cache cleanup completed');
        } catch (error) {
          console.error('[CacheIntegration] Emergency cache cleanup failed:', error);
        }
      }, 1000);
    }
  }

  /**
   * Manually trigger cache warming
   */
  public async warmCaches(): Promise<void> {
    if (!this.initialized) {
      // Gracefully handle uninitialized state
      console.log('[CacheIntegration] Cache warming requested but not initialized, skipping');
      return;
    }

    console.log('[CacheIntegration] Manual cache warming triggered');
    await this.initializeCacheWarming();
  }

  /**
   * Manually trigger cache cleanup
   */
  public async cleanupCaches(): Promise<void> {
    if (!this.initialized) {
      // Gracefully handle uninitialized state
      console.log('[CacheIntegration] Cache cleanup requested but not initialized, skipping');
      return;
    }

    console.log('[CacheIntegration] Manual cache cleanup triggered');
    
    await intelligentCache.cleanupExpiredEntries();
    await cacheCoordinator.performCacheCleanup();
    
    if (this.config.enableIntelligentEviction) {
      await intelligentCache.performIntelligentEviction();
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  public async getCacheStatistics(): Promise<{
    storage: any;
    analytics: any;
    strategies: any;
    maintenance: {
      lastRun: number;
      intervalMinutes: number;
      isEnabled: boolean;
    };
  }> {
    if (!this.initialized) {
      throw new Error('Cache integration not initialized');
    }

    const [storageInfo, analytics, strategies] = await Promise.all([
      intelligentCache.getStorageInfo(),
      intelligentCache.getCacheAnalytics(),
      cacheCoordinator.getCacheStatistics()
    ]);

    return {
      storage: storageInfo,
      analytics,
      strategies,
      maintenance: {
        lastRun: Date.now(), // This would be tracked in a real implementation
        intervalMinutes: this.config.maintenanceInterval,
        isEnabled: this.maintenanceTimer !== null
      }
    };
  }

  /**
   * Invalidate specific cache entries
   */
  public async invalidateCache(url: string, reason: 'expired' | 'updated' | 'manual' = 'manual'): Promise<void> {
    if (!this.initialized) {
      throw new Error('Cache integration not initialized');
    }

    console.log(`[CacheIntegration] Invalidating cache for ${url} (${reason})`);
    await intelligentCache.invalidateCache(url, reason);
  }

  /**
   * Preload critical resources
   */
  public async preloadCriticalResources(urls: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Cache integration not initialized');
    }

    console.log(`[CacheIntegration] Preloading ${urls.length} critical resources`);
    
    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: {
            'X-Preload': 'true',
            'X-Cache-Priority': CachePriority.CRITICAL
          }
        });
        
        if (response.ok) {
          console.log(`[CacheIntegration] Preloaded: ${url}`);
        }
      } catch (error) {
        console.warn(`[CacheIntegration] Failed to preload ${url}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Check if resource is cached
   */
  public async isCached(url: string): Promise<boolean> {
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(url);
        if (response) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[CacheIntegration] Cache check failed:', error);
      return false;
    }
  }

  /**
   * Get cache size information
   */
  public async getCacheSize(): Promise<{
    totalSize: number;
    cacheBreakdown: Array<{
      name: string;
      size: number;
      entryCount: number;
    }>;
  }> {
    try {
      const cacheNames = await caches.keys();
      const cacheBreakdown = await this.calculateCacheBreakdown(cacheNames);
      const totalSize = cacheBreakdown.reduce((sum, cache) => sum + cache.size, 0);

      return {
        totalSize,
        cacheBreakdown
      };
    } catch (error) {
      console.error('[CacheIntegration] Cache size calculation failed:', error);
      return {
        totalSize: 0,
        cacheBreakdown: []
      };
    }
  }

  /**
   * Calculate cache breakdown for each cache
   */
  private async calculateCacheBreakdown(cacheNames: string[]): Promise<Array<{
    name: string;
    size: number;
    entryCount: number;
  }>> {
    const breakdown: Array<{
      name: string;
      size: number;
      entryCount: number;
    }> = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const size = await this.estimateCacheSize(cache, keys);
      
      breakdown.push({
        name: cacheName,
        size,
        entryCount: keys.length
      });
    }

    return breakdown;
  }

  /**
   * Estimate cache size
   */
  private async estimateCacheSize(cache: Cache, keys: readonly Request[]): Promise<number> {
    let totalSize = 0;

    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const size = await this.estimateResponseSize(response);
          totalSize += size;
        }
      } catch {
        totalSize += 1024; // Default estimate on error
      }
    }

    return totalSize;
  }

  /**
   * Estimate response size
   */
  private async estimateResponseSize(response: Response): Promise<number> {
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    }

    // Estimate based on response content
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      return text.length * 2; // Rough estimate for UTF-16
    } catch {
      return 1024; // Default estimate
    }
  }

  /**
   * Destroy the cache integration
   */
  public destroy(): void {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = null;
    }

    this.initialized = false;
    console.log('[CacheIntegration] Cache integration destroyed');
  }
}

// Export singleton instance for use throughout the application
export const cacheIntegration = new CacheIntegration();

// Export types and utilities
export {
  CachePriority,
  ResourceType,
  intelligentCache,
  cacheCoordinator
};
