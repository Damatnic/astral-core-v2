/**
 * Cache Strategy Coordinator
 * 
 * Coordinates intelligent caching strategies with existing Workbox configuration
 * Provides enhanced cache management for crisis-focused mental health platform
 */

import { intelligentCache, CachePriority, ResourceType } from './intelligentCachingService';

export interface CacheStrategy {
  name: string;
  pattern: RegExp | string;
  handler: CacheHandler;
  options: CacheOptions;
  priority: CachePriority;
  resourceType: ResourceType;
}

export interface CacheOptions {
  cacheName: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
  purgeOnQuotaError?: boolean;
  networkTimeoutSeconds?: number;
  plugins?: CachePlugin[];
}

export interface CachePlugin {
  cacheKeyWillBeUsed?: (params: { request: Request }) => Promise<string>;
  cacheWillUpdate?: (params: { request: Request; response: Response }) => Promise<boolean>;
  requestWillFetch?: (params: { request: Request }) => Promise<Request>;
  fetchDidFail?: (params: { originalRequest: Request; error: Error }) => Promise<void>;
}

export enum CacheHandler {
  NETWORK_FIRST = 'NetworkFirst',
  CACHE_FIRST = 'CacheFirst',
  STALE_WHILE_REVALIDATE = 'StaleWhileRevalidate',
  NETWORK_ONLY = 'NetworkOnly',
  CACHE_ONLY = 'CacheOnly'
}

export class CacheStrategyCoordinator {
  private strategies: Map<string, CacheStrategy> = new Map();
  private initialized = false;

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default caching strategies building on existing Workbox config
   */
  private initializeDefaultStrategies(): void {
    // Crisis Resources - Highest priority, never purge
    this.addStrategy({
      name: 'crisis-resources-enhanced',
      pattern: /\/(crisis|emergency|safety|988|suicide-prevention)/,
      handler: CacheHandler.CACHE_FIRST,
      priority: CachePriority.CRITICAL,
      resourceType: ResourceType.CRISIS_RESOURCE,
      options: {
        cacheName: 'crisis-resources-v2',
        maxEntries: 50,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
        purgeOnQuotaError: false, // Never purge crisis resources
        plugins: [
          {
            cacheWillUpdate: async () => true, // Always cache crisis resources
            requestWillFetch: async ({ request }) => {
              // Add integrity checking for crisis resources
              return new Request(request.url, {
                ...request,
                headers: {
                  ...request.headers,
                  'X-Crisis-Resource': 'true',
                  'X-Cache-Priority': 'critical'
                }
              });
            }
          }
        ]
      }
    });

    // API Responses - Network first with intelligent fallback
    this.addStrategy({
      name: 'api-enhanced',
      pattern: /^https:\/\/.*\.netlify\.app\/\.netlify\/functions\//,
      handler: CacheHandler.NETWORK_FIRST,
      priority: CachePriority.HIGH,
      resourceType: ResourceType.API_RESPONSE,
      options: {
        cacheName: 'api-cache-v2',
        maxEntries: 200,
        maxAgeSeconds: 10 * 60, // 10 minutes
        networkTimeoutSeconds: 15, // Increased for mobile networks
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              // Normalize cache keys and remove sensitive data
              const url = new URL(request.url);
              url.searchParams.delete('auth');
              url.searchParams.delete('token');
              url.searchParams.delete('session');
              return url.href;
            },
            cacheWillUpdate: async ({ response }) => {
              // Only cache successful responses
              return response.status === 200 && response.type !== 'opaque';
            },
            fetchDidFail: async ({ originalRequest, error }) => {
              // Log API failures for analytics
              console.warn('[CacheCoordinator] API fetch failed:', originalRequest.url, error);
              await intelligentCache.getCacheAnalytics(); // Trigger analytics update
            }
          }
        ]
      }
    });

    // User Data - High priority with encryption consideration
    this.addStrategy({
      name: 'user-data-enhanced',
      pattern: /\/(user|profile|safety-plan|mood-tracking)/,
      handler: CacheHandler.NETWORK_FIRST,
      priority: CachePriority.HIGH,
      resourceType: ResourceType.USER_DATA,
      options: {
        cacheName: 'user-data-v2',
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        networkTimeoutSeconds: 10,
        plugins: [
          {
            cacheWillUpdate: async ({ request: _request, response }) => {
              // Don't cache user data if response indicates privacy concerns
              const privacyHeader = response.headers.get('X-Privacy-Level');
              if (privacyHeader === 'sensitive') {
                return false;
              }
              return response.status === 200;
            },
            requestWillFetch: async ({ request }) => {
              // Add user context for server-side handling
              return new Request(request.url, {
                ...request,
                headers: {
                  ...request.headers,
                  'X-Cache-Strategy': 'user-data',
                  'X-Offline-Safe': 'true'
                }
              });
            }
          }
        ]
      }
    });

    // Chat History - Medium priority with size optimization
    this.addStrategy({
      name: 'chat-history-enhanced',
      pattern: /\/(chat|messages|conversations)/,
      handler: CacheHandler.STALE_WHILE_REVALIDATE,
      priority: CachePriority.MEDIUM,
      resourceType: ResourceType.CHAT_HISTORY,
      options: {
        cacheName: 'chat-history-v2',
        maxEntries: 150,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Check response size and don't cache if too large
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > 100 * 1024) {
                console.warn('[CacheCoordinator] Chat response too large for cache:', contentLength);
                return false;
              }
              return response.status === 200;
            }
          }
        ]
      }
    });

    // Community Content - Medium priority with engagement tracking
    this.addStrategy({
      name: 'community-enhanced',
      pattern: /\/(community|posts|dilemmas|feedback)/,
      handler: CacheHandler.STALE_WHILE_REVALIDATE,
      priority: CachePriority.MEDIUM,
      resourceType: ResourceType.COMMUNITY_CONTENT,
      options: {
        cacheName: 'community-cache-v2',
        maxEntries: 100,
        maxAgeSeconds: 15 * 60, // 15 minutes
        purgeOnQuotaError: true,
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              // Normalize community URLs for better cache hits
              const url = new URL(request.url);
              url.searchParams.sort();
              // Remove pagination params for better cache efficiency
              url.searchParams.delete('offset');
              url.searchParams.delete('cursor');
              return url.href;
            }
          }
        ]
      }
    });

    // Static Assets - Cache first with intelligent sizing
    this.addStrategy({
      name: 'static-assets-enhanced',
      pattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i,
      handler: CacheHandler.CACHE_FIRST,
      priority: CachePriority.LOW,
      resourceType: ResourceType.STATIC_ASSET,
      options: {
        cacheName: 'static-assets-v2',
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
        plugins: [
          {
            requestWillFetch: async ({ request }) => {
              // Check storage quota before caching large assets
              const quota = await navigator.storage.estimate();
              const usagePercentage = (quota.usage || 0) / (quota.quota || 1);
              
              if (usagePercentage > 0.8) {
                // Skip caching if near quota limit
                return new Request(request.url, {
                  ...request,
                  headers: {
                    ...request.headers,
                    'X-Skip-Cache': 'true'
                  }
                });
              }
              
              return request;
            }
          }
        ]
      }
    });

    // Video Content - Special handling for large files
    this.addStrategy({
      name: 'video-enhanced',
      pattern: /\.(?:mp4|webm|ogg|m4v)$/i,
      handler: CacheHandler.CACHE_FIRST,
      priority: CachePriority.LOW,
      resourceType: ResourceType.VIDEO,
      options: {
        cacheName: 'video-cache-v2',
        maxEntries: 20, // Limited entries for large files
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
        plugins: [
          {
            cacheWillUpdate: async ({ request: _request, response }) => {
              // Only cache videos if sufficient storage and good network
              const quota = await navigator.storage.estimate();
              const usagePercentage = (quota.usage || 0) / (quota.quota || 1);
              
              // Don't cache videos if storage is over 70%
              if (usagePercentage > 0.7) {
                return false;
              }
              
              // Check connection quality (if available)
              if ('connection' in navigator) {
                const conn = (navigator as any).connection;
                if (conn && ((conn as any).effectiveType === 'slow-2g' || (conn as any).effectiveType === '2g')) {
                  return false;
                }
              }
              
              return response.status === 200;
            }
          }
        ]
      }
    });

    console.log('[CacheCoordinator] Default strategies initialized');
  }

  /**
   * Add a new caching strategy
   */
  public addStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);
    console.log(`[CacheCoordinator] Added strategy: ${strategy.name}`);
  }

  /**
   * Get strategy for a specific URL
   */
  public getStrategyForUrl(url: string): CacheStrategy | null {
    for (const [_name, strategy] of this.strategies) {
      const pattern = strategy.pattern;
      
      if (pattern instanceof RegExp) {
        if (pattern.test(url)) {
          return strategy;
        }
      } else if (typeof pattern === 'string') {
        if (url.includes(pattern)) {
          return strategy;
        }
      }
    }
    
    return null;
  }

  /**
   * Initialize cache warming for all critical strategies
   */
  public async initializeCacheWarming(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[CacheCoordinator] Starting comprehensive cache warming...');
    
    try {
      // Warm critical caches first
      await intelligentCache.warmCriticalCaches();
      
      // Warm strategy-specific caches
      const warmingPromises: Promise<void>[] = [];
      
      for (const [_name, strategy] of this.strategies) {
        if (strategy.priority === CachePriority.CRITICAL) {
          warmingPromises.push(this.warmStrategy(strategy));
        }
      }
      
      await Promise.allSettled(warmingPromises);
      
      this.initialized = true;
      console.log('[CacheCoordinator] Cache warming completed');
    } catch (error) {
      console.error('[CacheCoordinator] Cache warming failed:', error);
    }
  }

  /**
   * Warm cache for a specific strategy
   */
  private async warmStrategy(strategy: CacheStrategy): Promise<void> {
    try {
      const cache = await caches.open(strategy.options.cacheName);
      
      // Strategy-specific warming logic
      switch (strategy.name) {
        case 'crisis-resources-enhanced':
          await this.warmCrisisResources(cache);
          break;
        case 'api-enhanced':
          await this.warmCriticalApiEndpoints(cache);
          break;
        default:
          console.log(`[CacheCoordinator] No specific warming for ${strategy.name}`);
      }
    } catch (error) {
      console.error(`[CacheCoordinator] Failed to warm ${strategy.name}:`, error);
    }
  }

  /**
   * Warm crisis resources cache
   */
  private async warmCrisisResources(cache: Cache): Promise<void> {
    const crisisUrls = [
      '/crisis-resources.json',
      '/emergency-contacts.json',
      '/988-crisis-protocol.json',
      '/safety-plan-template.json',
      '/offline-crisis.html',
      '/offline-coping-strategies.json'
    ];

    const warmingPromises = crisisUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
          console.log(`[CacheCoordinator] Warmed crisis resource: ${url}`);
        }
      } catch (error) {
        console.warn(`[CacheCoordinator] Failed to warm crisis resource ${url}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
  }

  /**
   * Warm critical API endpoints cache
   */
  private async warmCriticalApiEndpoints(cache: Cache): Promise<void> {
    // These would be endpoints that should be immediately available
    const criticalEndpoints = [
      '/.netlify/functions/crisis',
      '/.netlify/functions/emergency-contacts',
      '/.netlify/functions/wellness' // For immediate mood check access
    ];

    const warmingPromises = criticalEndpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'X-Prefetch': 'true',
            'X-Cache-Warming': 'true'
          }
        });
        
        if (response.ok) {
          await cache.put(endpoint, response.clone());
          console.log(`[CacheCoordinator] Warmed API endpoint: ${endpoint}`);
        }
      } catch (error) {
        console.warn(`[CacheCoordinator] Failed to warm API endpoint ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
  }

  /**
   * Perform cache cleanup across all strategies
   */
  public async performCacheCleanup(): Promise<void> {
    console.log('[CacheCoordinator] Starting cache cleanup...');
    
    try {
      // Clean up expired entries in intelligent cache
      const expiredCount = await intelligentCache.cleanupExpiredEntries();
      
      // Perform strategy-specific cleanup
      for (const [_name, strategy] of this.strategies) {
        await this.cleanupStrategy(strategy);
      }
      
      // Perform intelligent eviction if needed
      await intelligentCache.performIntelligentEviction();
      
      console.log(`[CacheCoordinator] Cache cleanup completed. Removed ${expiredCount} expired entries`);
    } catch (error) {
      console.error('[CacheCoordinator] Cache cleanup failed:', error);
    }
  }

  /**
   * Clean up a specific strategy's cache
   */
  private async cleanupStrategy(strategy: CacheStrategy): Promise<void> {
    try {
      const cache = await caches.open(strategy.options.cacheName);
      const keys = await cache.keys();
      
      // Strategy-specific cleanup logic
      if (strategy.options.maxEntries && keys.length > strategy.options.maxEntries) {
        const excessCount = keys.length - strategy.options.maxEntries;
        
        // Remove oldest entries (this is a simplified approach)
        for (let i = 0; i < excessCount; i++) {
          await cache.delete(keys[i]);
        }
        
        console.log(`[CacheCoordinator] Cleaned ${excessCount} excess entries from ${strategy.name}`);
      }
    } catch (error) {
      console.error(`[CacheCoordinator] Failed to cleanup ${strategy.name}:`, error);
    }
  }

  /**
   * Get cache statistics across all strategies
   */
  public async getCacheStatistics(): Promise<{
    strategies: Array<{
      name: string;
      entryCount: number;
      priority: CachePriority;
      resourceType: ResourceType;
    }>;
    totalEntries: number;
    storageInfo: any;
  }> {
    const strategyStats: Array<{
      name: string;
      entryCount: number;
      priority: CachePriority;
      resourceType: ResourceType;
    }> = [];
    let totalEntries = 0;

    for (const [name, strategy] of this.strategies) {
      try {
        const cache = await caches.open(strategy.options.cacheName);
        const keys = await cache.keys();
        const entryCount = keys.length;
        
        strategyStats.push({
          name,
          entryCount,
          priority: strategy.priority,
          resourceType: strategy.resourceType
        });
        
        totalEntries += entryCount;
      } catch (error) {
        console.error(`[CacheCoordinator] Failed to get stats for ${name}:`, error);
      }
    }

    const storageInfo = await intelligentCache.getStorageInfo();

    return {
      strategies: strategyStats,
      totalEntries,
      storageInfo
    };
  }

  /**
   * Handle fetch requests with intelligent strategy selection
   */
  public async handleFetch(request: Request): Promise<Response | null> {
    const strategy = this.getStrategyForUrl(request.url);
    
    if (!strategy) {
      return null; // Let default handling take over
    }

    try {
      // Apply the appropriate cache strategy
      return await this.applyStrategy(strategy, request);
    } catch (error) {
      console.error(`[CacheCoordinator] Strategy ${strategy.name} failed:`, error);
      return null; // Fallback to network
    }
  }

  /**
   * Apply a specific cache strategy to a request
   */
  private async applyStrategy(strategy: CacheStrategy, request: Request): Promise<Response> {
    const cache = await caches.open(strategy.options.cacheName);
    
    // Apply plugins if available
    let processedRequest = request;
    if (strategy.options.plugins) {
      for (const plugin of strategy.options.plugins) {
        if (plugin.requestWillFetch) {
          processedRequest = await plugin.requestWillFetch({ request: processedRequest });
        }
      }
    }

    switch (strategy.handler) {
      case CacheHandler.CACHE_FIRST:
        return this.cacheFirstStrategy(cache, processedRequest, strategy.options);
        
      case CacheHandler.NETWORK_FIRST:
        return this.networkFirstStrategy(cache, processedRequest, strategy.options);
        
      case CacheHandler.STALE_WHILE_REVALIDATE:
        return this.staleWhileRevalidateStrategy(cache, processedRequest, strategy.options);
        
      default:
        throw new Error(`Unknown cache handler: ${strategy.handler}`);
    }
  }

  /**
   * Cache First strategy implementation
   */
  private async cacheFirstStrategy(cache: Cache, request: Request, _options: CacheOptions): Promise<Response> {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  }

  /**
   * Network First strategy implementation
   */
  private async networkFirstStrategy(cache: Cache, request: Request, options: CacheOptions): Promise<Response> {
    try {
      const networkResponse = await fetch(request, {
        signal: AbortSignal.timeout(options.networkTimeoutSeconds ? options.networkTimeoutSeconds * 1000 : 10000)
      });
      
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      console.warn('[CacheCoordinator] Network failed, trying cache:', error);
      
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw error;
    }
  }

  /**
   * Stale While Revalidate strategy implementation
   */
  private async staleWhileRevalidateStrategy(cache: Cache, request: Request, _options: CacheOptions): Promise<Response> {
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkResponsePromise = fetch(request).then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    }).catch((error) => {
      console.warn('[CacheCoordinator] Background revalidation failed:', error);
      return null;
    });

    // Return cached response immediately if available
    if (cachedResponse) {
      // Start background update but don't wait for it
      networkResponsePromise.catch(() => {
        // Ignore background update failures
      });
      return cachedResponse;
    }
    
    // If no cache, wait for network
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    throw new Error('No cached response and network request failed');
  }
}

// Export singleton instance
export const cacheCoordinator = new CacheStrategyCoordinator();
