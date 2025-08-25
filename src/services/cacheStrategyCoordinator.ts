/**
 * Cache Strategy Coordinator
 *
 * Coordinates intelligent caching strategies with existing Workbox configuration
 * Provides enhanced cache management for crisis-focused mental health platform
 *
 * Features:
 * - Multi-tier caching strategy coordination
 * - Crisis resource priority caching
 * - Intelligent cache invalidation
 * - Performance-optimized cache routing
 * - Offline-first strategy implementation
 * - Cache analytics and monitoring
 *
 * @license Apache-2.0
 */

import { logger } from '../utils/logger';
import { intelligentCachingService, CachePriority, ResourceType } from './intelligentCachingService';
import { performanceService } from './performanceService';

// Cache Strategy Interface
interface CacheStrategy {
  name: string;
  pattern: RegExp | string;
  handler: CacheHandler;
  options: CacheOptions;
  priority: CachePriority;
  resourceType: ResourceType;
  ttl?: number;
  maxEntries?: number;
}

// Cache Handler Interface
interface CacheHandler {
  handle(request: Request): Promise<Response>;
  name: string;
  fallback?: () => Promise<Response>;
}

// Cache Options Interface
interface CacheOptions {
  cacheName: string;
  maxAgeSeconds?: number;
  maxEntries?: number;
  purgeOnQuotaError?: boolean;
  precacheController?: any;
  plugins?: Array<{
    cacheKeyWillBeUsed?: (params: any) => Promise<string>;
    cacheWillUpdate?: (params: any) => Promise<Response | undefined>;
    cachedResponseWillBeUsed?: (params: any) => Promise<Response | undefined>;
    requestWillFetch?: (params: any) => Promise<Request>;
    fetchDidFail?: (params: any) => Promise<void>;
    fetchDidSucceed?: (params: any) => Promise<Response>;
  }>;
}

// Cache Performance Metrics Interface
interface CachePerformanceMetrics {
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  cacheSize: number;
  evictionCount: number;
  errorRate: number;
  lastUpdated: Date;
}

// Cache Strategy Configuration Interface
interface CacheStrategyConfig {
  strategies: CacheStrategy[];
  defaultStrategy: string;
  fallbackStrategy: string;
  performance: {
    enableMetrics: boolean;
    reportingInterval: number;
    maxMetricsHistory: number;
  };
  debugging: {
    enableLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

// Main Service Interface
interface CacheStrategyCoordinator {
  // Strategy Management
  registerStrategy(strategy: CacheStrategy): Promise<void>;
  unregisterStrategy(strategyName: string): Promise<void>;
  getStrategy(strategyName: string): CacheStrategy | null;
  listStrategies(): CacheStrategy[];
  
  // Request Routing
  routeRequest(request: Request): Promise<Response>;
  findMatchingStrategy(request: Request): CacheStrategy | null;
  
  // Cache Management
  invalidateCache(pattern: string | RegExp): Promise<void>;
  clearAllCaches(): Promise<void>;
  getCacheSize(cacheName: string): Promise<number>;
  
  // Performance Monitoring
  getPerformanceMetrics(): Promise<CachePerformanceMetrics>;
  resetMetrics(): Promise<void>;
  
  // Configuration
  updateConfiguration(config: Partial<CacheStrategyConfig>): Promise<void>;
  getConfiguration(): CacheStrategyConfig;
}

// Predefined Cache Handlers
class NetworkFirstHandler implements CacheHandler {
  name = 'NetworkFirst';

  constructor(private options: CacheOptions) {}

  async handle(request: Request): Promise<Response> {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful response
        const cache = await caches.open(this.options.cacheName);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      
      // Network failed, try cache
      return await this.getCachedResponse(request);
    } catch (error) {
      logger.debug('Network first handler - network failed, trying cache', { error });
      return await this.getCachedResponse(request);
    }
  }

  private async getCachedResponse(request: Request): Promise<Response> {
    const cache = await caches.open(this.options.cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache, return fallback or error
    if (this.fallback) {
      return await this.fallback();
    }
    
    return new Response('Network error and no cache available', { status: 503 });
  }

  fallback?: () => Promise<Response>;
}

class CacheFirstHandler implements CacheHandler {
  name = 'CacheFirst';

  constructor(private options: CacheOptions) {}

  async handle(request: Request): Promise<Response> {
    try {
      // Try cache first
      const cache = await caches.open(this.options.cacheName);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Cache miss, try network
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      logger.error('Cache first handler failed', { error });
      
      if (this.fallback) {
        return await this.fallback();
      }
      
      return new Response('Cache and network failed', { status: 503 });
    }
  }

  fallback?: () => Promise<Response>;
}

class StaleWhileRevalidateHandler implements CacheHandler {
  name = 'StaleWhileRevalidate';

  constructor(private options: CacheOptions) {}

  async handle(request: Request): Promise<Response> {
    try {
      const cache = await caches.open(this.options.cacheName);
      const cachedResponse = await cache.match(request);
      
      // Start network request in background
      const networkPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch((error) => {
        logger.debug('Background network request failed', { error });
        return null;
      });
      
      // Return cached response immediately if available
      if (cachedResponse) {
        // Don't wait for network request
        networkPromise.catch(() => {}); // Prevent unhandled promise rejection
        return cachedResponse;
      }
      
      // No cache, wait for network
      const networkResponse = await networkPromise;
      if (networkResponse) {
        return networkResponse;
      }
      
      if (this.fallback) {
        return await this.fallback();
      }
      
      return new Response('No cache and network failed', { status: 503 });
    } catch (error) {
      logger.error('Stale while revalidate handler failed', { error });
      
      if (this.fallback) {
        return await this.fallback();
      }
      
      return new Response('Handler error', { status: 503 });
    }
  }

  fallback?: () => Promise<Response>;
}

// Default Cache Strategies
const DEFAULT_STRATEGIES: CacheStrategy[] = [
  {
    name: 'crisis-resources',
    pattern: /\/api\/crisis|\/crisis-resources/,
    handler: new NetworkFirstHandler({
      cacheName: 'crisis-resources-v1',
      maxAgeSeconds: 300, // 5 minutes
      maxEntries: 100,
      purgeOnQuotaError: true
    }),
    options: {
      cacheName: 'crisis-resources-v1',
      maxAgeSeconds: 300,
      maxEntries: 100,
      purgeOnQuotaError: true
    },
    priority: 'critical',
    resourceType: 'api',
    ttl: 300000
  },
  {
    name: 'static-assets',
    pattern: /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
    handler: new CacheFirstHandler({
      cacheName: 'static-assets-v1',
      maxAgeSeconds: 86400, // 24 hours
      maxEntries: 500,
      purgeOnQuotaError: true
    }),
    options: {
      cacheName: 'static-assets-v1',
      maxAgeSeconds: 86400,
      maxEntries: 500,
      purgeOnQuotaError: true
    },
    priority: 'high',
    resourceType: 'static',
    ttl: 86400000
  },
  {
    name: 'api-responses',
    pattern: /\/api\//,
    handler: new StaleWhileRevalidateHandler({
      cacheName: 'api-responses-v1',
      maxAgeSeconds: 3600, // 1 hour
      maxEntries: 200,
      purgeOnQuotaError: true
    }),
    options: {
      cacheName: 'api-responses-v1',
      maxAgeSeconds: 3600,
      maxEntries: 200,
      purgeOnQuotaError: true
    },
    priority: 'medium',
    resourceType: 'api',
    ttl: 3600000
  },
  {
    name: 'documents',
    pattern: /\.(html|htm)$/,
    handler: new NetworkFirstHandler({
      cacheName: 'documents-v1',
      maxAgeSeconds: 1800, // 30 minutes
      maxEntries: 50,
      purgeOnQuotaError: true
    }),
    options: {
      cacheName: 'documents-v1',
      maxAgeSeconds: 1800,
      maxEntries: 50,
      purgeOnQuotaError: true
    },
    priority: 'medium',
    resourceType: 'document',
    ttl: 1800000
  }
];

// Default Configuration
const DEFAULT_CONFIG: CacheStrategyConfig = {
  strategies: DEFAULT_STRATEGIES,
  defaultStrategy: 'api-responses',
  fallbackStrategy: 'static-assets',
  performance: {
    enableMetrics: true,
    reportingInterval: 60000, // 1 minute
    maxMetricsHistory: 100
  },
  debugging: {
    enableLogging: process.env.NODE_ENV === 'development',
    logLevel: 'info'
  }
};

// Implementation
class CacheStrategyCoordinatorImpl implements CacheStrategyCoordinator {
  private strategies = new Map<string, CacheStrategy>();
  private config: CacheStrategyConfig;
  private performanceMetrics: CachePerformanceMetrics;
  private metricsHistory: CachePerformanceMetrics[] = [];
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.performanceMetrics = {
      hitRate: 0,
      missRate: 0,
      averageResponseTime: 0,
      cacheSize: 0,
      evictionCount: 0,
      errorRate: 0,
      lastUpdated: new Date()
    };

    this.initializeDefaultStrategies();
    this.startMetricsCollection();
  }

  async registerStrategy(strategy: CacheStrategy): Promise<void> {
    try {
      // Validate strategy
      this.validateStrategy(strategy);
      
      // Register with intelligent caching service
      await intelligentCachingService.setCacheStrategy(
        strategy.resourceType,
        strategy.priority
      );
      
      // Store strategy
      this.strategies.set(strategy.name, strategy);
      
      logger.info('Cache strategy registered', {
        name: strategy.name,
        pattern: strategy.pattern.toString(),
        priority: strategy.priority,
        resourceType: strategy.resourceType
      });
    } catch (error) {
      logger.error('Failed to register cache strategy', { error, strategyName: strategy.name });
      throw error;
    }
  }

  async unregisterStrategy(strategyName: string): Promise<void> {
    try {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) {
        throw new Error(`Strategy not found: ${strategyName}`);
      }
      
      // Clear cache for this strategy
      await this.clearStrategyCache(strategy);
      
      // Remove strategy
      this.strategies.delete(strategyName);
      
      logger.info('Cache strategy unregistered', { strategyName });
    } catch (error) {
      logger.error('Failed to unregister cache strategy', { error, strategyName });
      throw error;
    }
  }

  getStrategy(strategyName: string): CacheStrategy | null {
    return this.strategies.get(strategyName) || null;
  }

  listStrategies(): CacheStrategy[] {
    return Array.from(this.strategies.values());
  }

  async routeRequest(request: Request): Promise<Response> {
    const startTime = performance.now();
    
    try {
      // Find matching strategy
      const strategy = this.findMatchingStrategy(request);
      
      if (!strategy) {
        logger.debug('No matching strategy found, using default', { url: request.url });
        return await this.handleWithDefaultStrategy(request);
      }
      
      // Handle request with strategy
      const response = await strategy.handler.handle(request);
      
      // Update metrics
      const responseTime = performance.now() - startTime;
      this.updateMetrics('hit', responseTime);
      
      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics('error', responseTime);
      
      logger.error('Request routing failed', { error, url: request.url });
      throw error;
    }
  }

  findMatchingStrategy(request: Request): CacheStrategy | null {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Sort strategies by priority
    const sortedStrategies = Array.from(this.strategies.values())
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    
    for (const strategy of sortedStrategies) {
      if (this.matchesPattern(pathname, strategy.pattern)) {
        return strategy;
      }
    }
    
    return null;
  }

  async invalidateCache(pattern: string | RegExp): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const url = new URL(request.url);
          
          if (this.matchesPattern(url.pathname, pattern)) {
            await cache.delete(request);
            logger.debug('Cache entry invalidated', { url: request.url, cacheName });
          }
        }
      }
      
      logger.info('Cache invalidation completed', { pattern: pattern.toString() });
    } catch (error) {
      logger.error('Cache invalidation failed', { error, pattern: pattern.toString() });
      throw error;
    }
  }

  async clearAllCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      logger.info('All caches cleared', { clearedCaches: cacheNames.length });
    } catch (error) {
      logger.error('Failed to clear all caches', { error });
      throw error;
    }
  }

  async getCacheSize(cacheName: string): Promise<number> {
    try {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      let totalSize = 0;
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Failed to get cache size', { error, cacheName });
      return 0;
    }
  }

  async getPerformanceMetrics(): Promise<CachePerformanceMetrics> {
    try {
      // Update cache sizes
      let totalCacheSize = 0;
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        totalCacheSize += await this.getCacheSize(cacheName);
      }
      
      this.performanceMetrics.cacheSize = totalCacheSize;
      this.performanceMetrics.lastUpdated = new Date();
      
      return { ...this.performanceMetrics };
    } catch (error) {
      logger.error('Failed to get performance metrics', { error });
      return this.performanceMetrics;
    }
  }

  async resetMetrics(): Promise<void> {
    this.performanceMetrics = {
      hitRate: 0,
      missRate: 0,
      averageResponseTime: 0,
      cacheSize: 0,
      evictionCount: 0,
      errorRate: 0,
      lastUpdated: new Date()
    };
    this.metricsHistory = [];
    
    logger.info('Performance metrics reset');
  }

  async updateConfiguration(config: Partial<CacheStrategyConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      
      // Restart metrics collection if interval changed
      if (config.performance?.reportingInterval) {
        this.stopMetricsCollection();
        this.startMetricsCollection();
      }
      
      logger.info('Cache strategy configuration updated', { config });
    } catch (error) {
      logger.error('Failed to update configuration', { error });
      throw error;
    }
  }

  getConfiguration(): CacheStrategyConfig {
    return { ...this.config };
  }

  // Private helper methods
  private initializeDefaultStrategies(): void {
    DEFAULT_STRATEGIES.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  private validateStrategy(strategy: CacheStrategy): void {
    if (!strategy.name || !strategy.pattern || !strategy.handler) {
      throw new Error('Invalid strategy: missing required fields');
    }
    
    if (this.strategies.has(strategy.name)) {
      throw new Error(`Strategy already exists: ${strategy.name}`);
    }
  }

  private matchesPattern(path: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return path.includes(pattern);
    }
    return pattern.test(path);
  }

  private getPriorityWeight(priority: CachePriority): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private async handleWithDefaultStrategy(request: Request): Promise<Response> {
    const defaultStrategy = this.strategies.get(this.config.defaultStrategy);
    
    if (defaultStrategy) {
      return await defaultStrategy.handler.handle(request);
    }
    
    // Ultimate fallback
    return await fetch(request);
  }

  private async clearStrategyCache(strategy: CacheStrategy): Promise<void> {
    try {
      await caches.delete(strategy.options.cacheName);
    } catch (error) {
      logger.error('Failed to clear strategy cache', { error, strategyName: strategy.name });
    }
  }

  private updateMetrics(type: 'hit' | 'miss' | 'error', responseTime: number): void {
    // Update response time average
    const currentAvg = this.performanceMetrics.averageResponseTime;
    this.performanceMetrics.averageResponseTime = (currentAvg + responseTime) / 2;
    
    // Update rates (simplified)
    switch (type) {
      case 'hit':
        this.performanceMetrics.hitRate += 0.1;
        break;
      case 'miss':
        this.performanceMetrics.missRate += 0.1;
        break;
      case 'error':
        this.performanceMetrics.errorRate += 0.1;
        break;
    }
    
    // Normalize rates
    const total = this.performanceMetrics.hitRate + this.performanceMetrics.missRate + this.performanceMetrics.errorRate;
    if (total > 0) {
      this.performanceMetrics.hitRate = this.performanceMetrics.hitRate / total;
      this.performanceMetrics.missRate = this.performanceMetrics.missRate / total;
      this.performanceMetrics.errorRate = this.performanceMetrics.errorRate / total;
    }
  }

  private startMetricsCollection(): void {
    if (this.config.performance.enableMetrics) {
      this.metricsInterval = setInterval(async () => {
        try {
          const metrics = await this.getPerformanceMetrics();
          this.metricsHistory.push({ ...metrics });
          
          // Keep only recent metrics
          if (this.metricsHistory.length > this.config.performance.maxMetricsHistory) {
            this.metricsHistory = this.metricsHistory.slice(-this.config.performance.maxMetricsHistory);
          }
          
          // Report to performance service
          await performanceService.recordMetric('cache_hit_rate', metrics.hitRate);
          await performanceService.recordMetric('cache_response_time', metrics.averageResponseTime);
        } catch (error) {
          logger.error('Metrics collection failed', { error });
        }
      }, this.config.performance.reportingInterval);
    }
  }

  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
  }
}

// Export singleton instance
export const cacheStrategyCoordinator = new CacheStrategyCoordinatorImpl();
export type { 
  CacheStrategyCoordinator, 
  CacheStrategy, 
  CacheHandler, 
  CacheOptions, 
  CachePerformanceMetrics,
  CacheStrategyConfig 
};
