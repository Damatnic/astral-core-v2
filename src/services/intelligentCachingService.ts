/**
 * Intelligent Caching Service
 * 
 * Advanced caching strategies that build upon the existing robust Workbox foundation
 * with intelligent cache warming, analytics, and mobile optimization for crisis support
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types for cache analytics and monitoring
interface CacheEntry {
  url: string;
  timestamp: number;
  hitCount: number;
  lastAccessed: number;
  size: number;
  priority: CachePriority;
  resourceType: ResourceType;
}

interface CacheAnalytics {
  hitRate: number;
  missRate: number;
  evictionCount: number;
  storageUsage: number;
  performanceMetrics: PerformanceMetrics;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  cacheRetrievalTime: number;
  networkFallbackTime: number;
  offlineRequestCount: number;
}

enum CachePriority {
  CRITICAL = 'critical',     // Crisis resources, safety plans - never purge
  HIGH = 'high',            // User data, chat history - 30 day retention
  MEDIUM = 'medium',        // Community content - 7 day retention
  LOW = 'low'               // General assets - 3 day retention
}

enum ResourceType {
  CRISIS_RESOURCE = 'crisis-resource',
  SAFETY_PLAN = 'safety-plan',
  CHAT_HISTORY = 'chat-history',
  USER_DATA = 'user-data',
  COMMUNITY_CONTENT = 'community-content',
  STATIC_ASSET = 'static-asset',
  API_RESPONSE = 'api-response',
  IMAGE = 'image',
  VIDEO = 'video'
}

// IndexedDB schema for cache management
interface CacheDB extends DBSchema {
  cache_entries: {
    key: string;
    value: CacheEntry;
    indexes: {
      'by-priority': CachePriority;
      'by-type': ResourceType;
      'by-timestamp': number;
      'by-access': number;
    };
  };
  cache_analytics: {
    key: string;
    value: CacheAnalytics & { id: string };
  };
  storage_quota: {
    key: string;
    value: {
      id: string;
      quota: number;
      usage: number;
      timestamp: number;
      warningThreshold: number;
    };
  };
}

export class IntelligentCachingService {
  private db: IDBPDatabase<CacheDB> | null = null;
  private analytics: CacheAnalytics = {
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    storageUsage: 0,
    performanceMetrics: {
      averageLoadTime: 0,
      cacheRetrievalTime: 0,
      networkFallbackTime: 0,
      offlineRequestCount: 0
    }
  };

  // Critical resources that should never be evicted
  private readonly CRITICAL_RESOURCES = [
    '/crisis-resources.json',
    '/emergency-contacts.json',
    '/offline.html',
    '/offline-crisis.html',
    '/988-crisis-protocol.json',
    '/safety-plan-template.json'
  ];

  // Cache warming patterns for immediate availability
  private readonly CACHE_WARMING_PATTERNS = [
    // Core app files
    { pattern: '/assets/index-*.css', priority: CachePriority.CRITICAL },
    { pattern: '/assets/index-*.js', priority: CachePriority.CRITICAL },
    { pattern: '/manifest.json', priority: CachePriority.CRITICAL },
    
    // Crisis resources
    { pattern: '/crisis/**/*', priority: CachePriority.CRITICAL },
    { pattern: '/emergency/**/*', priority: CachePriority.CRITICAL },
    { pattern: '/safety/**/*', priority: CachePriority.CRITICAL },
    
    // User interface essentials
    { pattern: '/assets/ui-icons-*.svg', priority: CachePriority.HIGH },
    { pattern: '/fonts/**/*', priority: CachePriority.HIGH }
  ];

  constructor() {
    this.initializeDatabase();
    this.monitorStorageQuota();
  }

  /**
   * Initialize IndexedDB for cache management
   */
  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>('intelligent-cache', 1, {
        upgrade(db) {
          // Cache entries store
          const cacheStore = db.createObjectStore('cache_entries', {
            keyPath: 'url'
          });
          cacheStore.createIndex('by-priority', 'priority');
          cacheStore.createIndex('by-type', 'resourceType');
          cacheStore.createIndex('by-timestamp', 'timestamp');
          cacheStore.createIndex('by-access', 'lastAccessed');

          // Analytics store
          db.createObjectStore('cache_analytics', {
            keyPath: 'id'
          });

          // Storage quota tracking
          db.createObjectStore('storage_quota', {
            keyPath: 'id'
          });
        }
      });

      console.log('[IntelligentCache] Database initialized successfully');
    } catch (error) {
      console.error('[IntelligentCache] Failed to initialize database:', error);
    }
  }

  /**
   * Warm up critical caches on service worker activation
   */
  public async warmCriticalCaches(): Promise<void> {
    console.log('[IntelligentCache] Starting cache warming...');
    const startTime = performance.now();

    try {
      const cache = await caches.open('intelligent-cache-critical');
      const warmingPromises: Promise<void>[] = [];

      // Warm critical resources first
      for (const resource of this.CRITICAL_RESOURCES) {
        warmingPromises.push(this.warmResource(cache, resource, CachePriority.CRITICAL));
      }

      // Warm resources by pattern
      for (const pattern of this.CACHE_WARMING_PATTERNS) {
        warmingPromises.push(this.warmByPattern(cache, pattern.pattern, pattern.priority));
      }

      await Promise.allSettled(warmingPromises);

      const endTime = performance.now();
      console.log(`[IntelligentCache] Cache warming completed in ${endTime - startTime}ms`);

      await this.updateAnalytics('warmup', endTime - startTime);
    } catch (error) {
      console.error('[IntelligentCache] Cache warming failed:', error);
    }
  }

  /**
   * Warm a specific resource
   */
  private async warmResource(cache: Cache, url: string, priority: CachePriority): Promise<void> {
    try {
      const request = new Request(url, {
        headers: {
          'X-Cache-Priority': priority,
          'X-Prefetch': 'true'
        }
      });

      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        await this.trackCacheEntry(url, priority, this.getResourceType(url), response);
        console.log(`[IntelligentCache] Warmed: ${url}`);
      }
    } catch (error) {
      console.warn(`[IntelligentCache] Failed to warm ${url}:`, error);
    }
  }

  /**
   * Warm resources matching a pattern
   */
  private async warmByPattern(cache: Cache, pattern: string, priority: CachePriority): Promise<void> {
    try {
      // For now, we'll handle specific known patterns
      // In a real implementation, you might enumerate available resources
      const knownUrls = await this.getUrlsMatchingPattern(pattern);
      
      for (const url of knownUrls) {
        await this.warmResource(cache, url, priority);
      }
    } catch (error) {
      console.warn(`[IntelligentCache] Failed to warm pattern ${pattern}:`, error);
    }
  }

  /**
   * Intelligent cache invalidation strategy
   */
  public async invalidateCache(url: string, reason: 'expired' | 'updated' | 'manual' = 'manual'): Promise<void> {
    try {
      // Remove from all cache instances
      const cacheNames = await caches.keys();
      const invalidationPromises = cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const deleted = await cache.delete(url);
        if (deleted) {
          console.log(`[IntelligentCache] Invalidated ${url} from ${cacheName} (${reason})`);
        }
      });

      await Promise.all(invalidationPromises);

      // Update database
      if (this.db) {
        await this.db.delete('cache_entries', url);
      }

      await this.updateAnalytics('invalidation', 0, reason);
    } catch (error) {
      console.error(`[IntelligentCache] Failed to invalidate ${url}:`, error);
    }
  }

  /**
   * Intelligent cache eviction based on priority and usage
   */
  public async performIntelligentEviction(): Promise<void> {
    if (!this.db) return;

    try {
      console.log('[IntelligentCache] Performing intelligent eviction...');

      // Get current storage usage
      const quota = await navigator.storage.estimate();
      const usagePercentage = (quota.usage || 0) / (quota.quota || 1);

      // Only evict if we're over 80% usage
      if (usagePercentage < 0.8) {
        return;
      }

      // Get all cache entries sorted by eviction priority
      const entries = await this.db.getAll('cache_entries');
      const evictionCandidates = entries
        .filter(entry => entry.priority !== CachePriority.CRITICAL)
        .sort((a, b) => this.calculateEvictionScore(a) - this.calculateEvictionScore(b));

      // Evict lowest priority items until we're under 70% usage
      let evictedCount = 0;
      for (const entry of evictionCandidates) {
        if (usagePercentage < 0.7) break;

        await this.evictCacheEntry(entry);
        evictedCount++;
      }

      console.log(`[IntelligentCache] Evicted ${evictedCount} cache entries`);
      this.analytics.evictionCount += evictedCount;
    } catch (error) {
      console.error('[IntelligentCache] Intelligent eviction failed:', error);
    }
  }

  /**
   * Calculate eviction score (lower = evict first)
   */
  private calculateEvictionScore(entry: CacheEntry): number {
    const now = Date.now();
    const daysSinceAccess = (now - entry.lastAccessed) / (24 * 60 * 60 * 1000);
    const hitCountWeight = Math.log(entry.hitCount + 1);
    const priorityWeight = this.getPriorityWeight(entry.priority);

    // Lower score = higher eviction priority
    return (priorityWeight * hitCountWeight) / (daysSinceAccess + 1);
  }

  /**
   * Get priority weight for eviction calculation
   */
  private getPriorityWeight(priority: CachePriority): number {
    switch (priority) {
      case CachePriority.CRITICAL: return 1000; // Never evict
      case CachePriority.HIGH: return 100;
      case CachePriority.MEDIUM: return 10;
      case CachePriority.LOW: return 1;
      default: return 1;
    }
  }

  /**
   * Monitor storage quota and provide warnings
   */
  private async monitorStorageQuota(): Promise<void> {
    try {
      const checkQuota = async () => {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usagePercentage = usage / quota;

        if (this.db) {
          await this.db.put('storage_quota', {
            id: 'current',
            quota,
            usage,
            timestamp: Date.now(),
            warningThreshold: 0.8
          });
        }

        // Emit storage warnings
        if (usagePercentage > 0.9) {
          this.emitStorageWarning('critical', usagePercentage);
        } else if (usagePercentage > 0.8) {
          this.emitStorageWarning('warning', usagePercentage);
        }

        // Auto-eviction at 85%
        if (usagePercentage > 0.85) {
          await this.performIntelligentEviction();
        }
      };

      // Check immediately and then every 5 minutes
      await checkQuota();
      setInterval(checkQuota, 5 * 60 * 1000);
    } catch (error) {
      console.error('[IntelligentCache] Storage monitoring failed:', error);
    }
  }

  /**
   * Track cache entry for analytics
   */
  private async trackCacheEntry(
    url: string, 
    priority: CachePriority, 
    resourceType: ResourceType,
    response: Response
  ): Promise<void> {
    if (!this.db) return;

    try {
      const existing = await this.db.get('cache_entries', url);
      const now = Date.now();

      const entry: CacheEntry = {
        url,
        timestamp: existing?.timestamp || now,
        hitCount: existing ? existing.hitCount + 1 : 1,
        lastAccessed: now,
        size: this.estimateResponseSize(response),
        priority,
        resourceType
      };

      await this.db.put('cache_entries', entry);
    } catch (error) {
      console.error('[IntelligentCache] Failed to track cache entry:', error);
    }
  }

  /**
   * Get resource URLs matching a pattern
   */
  private async getUrlsMatchingPattern(pattern: string): Promise<string[]> {
    // This is a simplified implementation
    // In practice, you might maintain a registry of available resources
    const knownPatterns: Record<string, string[]> = {
      '/assets/index-*.css': ['/assets/index-main.css'],
      '/assets/index-*.js': ['/assets/index-main.js'],
      '/crisis/**/*': ['/crisis-resources.json', '/crisis/contact-numbers.json'],
      '/emergency/**/*': ['/emergency-contacts.json'],
      '/safety/**/*': ['/safety-plan-template.json'],
      '/assets/ui-icons-*.svg': ['/assets/ui-icons-pack.svg'],
      '/fonts/**/*': ['/fonts/inter-regular.woff2', '/fonts/inter-bold.woff2']
    };

    return knownPatterns[pattern] || [];
  }

  /**
   * Determine resource type from URL
   */
  private getResourceType(url: string): ResourceType {
    if (url.includes('crisis') || url.includes('emergency') || url.includes('988')) {
      return ResourceType.CRISIS_RESOURCE;
    }
    if (url.includes('safety-plan')) {
      return ResourceType.SAFETY_PLAN;
    }
    if (url.includes('chat') || url.includes('message')) {
      return ResourceType.CHAT_HISTORY;
    }
    if (url.includes('user') || url.includes('profile')) {
      return ResourceType.USER_DATA;
    }
    if (url.includes('community') || url.includes('post')) {
      return ResourceType.COMMUNITY_CONTENT;
    }
    if (url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) {
      return ResourceType.IMAGE;
    }
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return ResourceType.VIDEO;
    }
    if (url.includes('/api/') || url.includes('/.netlify/functions/')) {
      return ResourceType.API_RESPONSE;
    }
    return ResourceType.STATIC_ASSET;
  }

  /**
   * Estimate response size for analytics
   */
  private estimateResponseSize(response: Response): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  /**
   * Evict a specific cache entry
   */
  private async evictCacheEntry(entry: CacheEntry): Promise<void> {
    try {
      await this.invalidateCache(entry.url, 'expired');
      console.log(`[IntelligentCache] Evicted: ${entry.url} (priority: ${entry.priority})`);
    } catch (error) {
      console.error(`[IntelligentCache] Failed to evict ${entry.url}:`, error);
    }
  }

  /**
   * Emit storage warning events
   */
  private emitStorageWarning(level: 'warning' | 'critical', usagePercentage: number): void {
    const event = new CustomEvent('storage-warning', {
      detail: { level, usagePercentage }
    });
    self.dispatchEvent(event);
    
    console.warn(`[IntelligentCache] Storage ${level}: ${Math.round(usagePercentage * 100)}% used`);
  }

  /**
   * Update analytics data
   */
  private async updateAnalytics(_operation: string, duration: number, _details?: string): Promise<void> {
    if (!this.db) return;

    try {
      this.analytics.performanceMetrics.averageLoadTime = 
        (this.analytics.performanceMetrics.averageLoadTime + duration) / 2;

      await this.db.put('cache_analytics', {
        id: 'current',
        ...this.analytics
      });
    } catch (error) {
      console.error('[IntelligentCache] Failed to update analytics:', error);
    }
  }

  /**
   * Get current cache analytics
   */
  public async getCacheAnalytics(): Promise<CacheAnalytics> {
    if (!this.db) return this.analytics;

    try {
      const stored = await this.db.get('cache_analytics', 'current');
      return stored || this.analytics;
    } catch (error) {
      console.error('[IntelligentCache] Failed to get analytics:', error);
      return this.analytics;
    }
  }

  /**
   * Get storage usage information
   */
  public async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    usagePercentage: number;
    cacheEntries: number;
  }> {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const usagePercentage = usage / quota;

      let cacheEntries = 0;
      if (this.db) {
        const entries = await this.db.getAll('cache_entries');
        cacheEntries = entries.length;
      }

      return {
        usage,
        quota,
        usagePercentage,
        cacheEntries
      };
    } catch (error) {
      console.error('[IntelligentCache] Failed to get storage info:', error);
      return {
        usage: 0,
        quota: 0,
        usagePercentage: 0,
        cacheEntries: 0
      };
    }
  }

  /**
   * Clean up expired entries based on priority
   */
  public async cleanupExpiredEntries(): Promise<number> {
    if (!this.db) return 0;

    try {
      const now = Date.now();
      const entries = await this.db.getAll('cache_entries');
      let cleanedCount = 0;

      for (const entry of entries) {
        const ageInDays = (now - entry.timestamp) / (24 * 60 * 60 * 1000);
        let maxAge = 0;

        // Set max age based on priority
        switch (entry.priority) {
          case CachePriority.CRITICAL:
            maxAge = 90; // 90 days for critical resources
            break;
          case CachePriority.HIGH:
            maxAge = 30; // 30 days for high priority
            break;
          case CachePriority.MEDIUM:
            maxAge = 7; // 7 days for medium priority
            break;
          case CachePriority.LOW:
            maxAge = 3; // 3 days for low priority
            break;
        }

        if (ageInDays > maxAge) {
          await this.evictCacheEntry(entry);
          cleanedCount++;
        }
      }

      console.log(`[IntelligentCache] Cleaned up ${cleanedCount} expired entries`);
      return cleanedCount;
    } catch (error) {
      console.error('[IntelligentCache] Cleanup failed:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const intelligentCache = new IntelligentCachingService();

// Export types for use in other modules
export {
  CachePriority,
  ResourceType,
  type CacheEntry,
  type CacheAnalytics,
  type PerformanceMetrics
};
