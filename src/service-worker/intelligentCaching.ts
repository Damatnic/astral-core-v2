/**
 * Intelligent Caching Strategy for Mental Health Platform
 * 
 * Advanced service worker caching with:
 * - User behavior-based prefetching
 * - Crisis-priority resource management
 * - Adaptive cache strategies
 * - Performance-aware resource loading
 */

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
  options: {
    cacheName: string;
    expiration?: {
      maxEntries: number;
      maxAgeSeconds: number;
      purgeOnQuotaError: boolean;
    };
    networkTimeoutSeconds?: number;
    plugins?: unknown[];
  };
  priority: 'crisis' | 'high' | 'medium' | 'low';
}

export interface UserBehaviorMetrics {
  visitedRoutes: string[];
  timeSpentOnRoutes: Record<string, number>;
  crisisInteractions: number;
  helperRequests: number;
  lastActiveTime: number;
  preferredFeatures: string[];
  networkCondition: 'fast' | 'slow' | 'offline';
  deviceCapabilities: {
    memory: number;
    connection: string;
    isLowEnd: boolean;
  };
}

export class IntelligentCachingManager {
  private userMetrics: UserBehaviorMetrics;
  private prefetchQueue: string[] = [];
  private cacheStrategies: CacheStrategy[] = [];
  private analyticsCache: Map<string, any> = new Map();

  constructor() {
    this.userMetrics = this.initializeUserMetrics();
    this.setupCacheStrategies();
    this.setupEventListeners();
  }

  /**
   * Initialize user behavior tracking
   */
  private initializeUserMetrics(): UserBehaviorMetrics {
    const stored = localStorage.getItem('astral-cache-metrics');
    const defaults: UserBehaviorMetrics = {
      visitedRoutes: [],
      timeSpentOnRoutes: {},
      crisisInteractions: 0,
      helperRequests: 0,
      lastActiveTime: Date.now(),
      preferredFeatures: [],
      networkCondition: 'fast',
      deviceCapabilities: {
        memory: (navigator as any).deviceMemory || 4,
        connection: (navigator as any).connection?.effectiveType || '4g',
        isLowEnd: (navigator as any).deviceMemory < 2
      }
    };

    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }

  /**
   * Setup advanced cache strategies with crisis prioritization
   */
  private setupCacheStrategies(): void {
    this.cacheStrategies = [
      // CRISIS TIER - Highest Priority (Never purge, immediate access)
      {
        name: 'Crisis Resources',
        pattern: /\/(crisis|emergency|suicide-prevention|hotline).*\.(json|html|js|css)$/,
        strategy: 'CacheFirst',
        options: {
          cacheName: 'crisis-resources-v3',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 180, // 6 months
            purgeOnQuotaError: false
          },
          plugins: [this.createCrisisPlugin()]
        },
        priority: 'crisis'
      },

      // MENTAL HEALTH CORE - High Priority
      {
        name: 'Core Mental Health Features',
        pattern: /\/(mood-tracker|journal|coping-strategies|meditation).*\.(json|js|css)$/,
        strategy: 'StaleWhileRevalidate',
        options: {
          cacheName: 'mental-health-core-v3',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            purgeOnQuotaError: false
          },
          plugins: [this.createPerformancePlugin()]
        },
        priority: 'high'
      },

      // API RESPONSES - Intelligent caching based on content type
      {
        name: 'API Responses',
        pattern: /^https:\/\/.*\.netlify\.app\/\.netlify\/functions\/.*/,
        strategy: 'NetworkFirst',
        options: {
          cacheName: 'api-responses-v3',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 6, // 6 hours
            purgeOnQuotaError: true
          },
          networkTimeoutSeconds: this.getAdaptiveTimeout(),
          plugins: [this.createAPIPlugin()]
        },
        priority: 'high'
      },

      // USER-SPECIFIC DATA - Based on behavior patterns
      {
        name: 'User Data',
        pattern: /\/(profile|preferences|history|sessions).*\.json$/,
        strategy: 'NetworkFirst',
        options: {
          cacheName: 'user-data-v3',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
            purgeOnQuotaError: true
          },
          plugins: [this.createUserDataPlugin()]
        },
        priority: 'high'
      },

      // STATIC ASSETS - Optimized for device capabilities
      {
        name: 'Static Assets',
        pattern: /\.(?:js|css|woff2|ttf)$/,
        strategy: 'CacheFirst',
        options: {
          cacheName: 'static-assets-v3',
          expiration: {
            maxEntries: this.userMetrics.deviceCapabilities.isLowEnd ? 50 : 150,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            purgeOnQuotaError: true
          },
          plugins: [this.createAssetPlugin()]
        },
        priority: 'medium'
      },

      // IMAGES - Progressive loading with format optimization
      {
        name: 'Images',
        pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        strategy: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images-v3',
          expiration: {
            maxEntries: this.userMetrics.deviceCapabilities.isLowEnd ? 75 : 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            purgeOnQuotaError: true
          },
          plugins: [this.createImagePlugin()]
        },
        priority: 'medium'
      },

      // PREFETCHED CONTENT - Based on user behavior
      {
        name: 'Prefetched Content',
        pattern: /\/prefetch\/.*/,
        strategy: 'CacheFirst',
        options: {
          cacheName: 'prefetched-content-v3',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 2, // 2 hours
            purgeOnQuotaError: true
          }
        },
        priority: 'low'
      }
    ];
  }

  /**
   * Get adaptive timeout based on network conditions
   */
  private getAdaptiveTimeout(): number {
    const { networkCondition, deviceCapabilities } = this.userMetrics;
    
    if (networkCondition === 'slow' || deviceCapabilities.isLowEnd) {
      return 30; // 30 seconds for slow networks/devices
    } else if (networkCondition === 'fast') {
      return 8; // 8 seconds for fast networks
    }
    return 15; // 15 seconds default
  }

  /**
   * Crisis-specific cache plugin with priority handling
   */
  private createCrisisPlugin() {
    return {
      cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
        // Add crisis priority marker to cache key
        return `crisis-priority-${request.url}`;
      },
      
      requestWillFetch: async ({ request }: { request: Request }) => {
        // Log crisis resource access for analytics
        this.userMetrics.crisisInteractions++;
        this.saveUserMetrics();
        return request;
      },
      
      cacheWillUpdate: async ({ response }: { response: Response }) => {
        // Always cache crisis resources, even with errors
        return response.status < 500 ? response : null;
      }
    };
  }

  /**
   * Performance monitoring plugin
   */
  private createPerformancePlugin() {
    return {
      requestWillFetch: async ({ request }: { request: Request }) => {
        const startTime = performance.now();
        this.analyticsCache.set(request.url, { startTime });
        return request;
      },
      
      requestDidSucceed: async ({ request, response }: { request: Request; response: Response }) => {
        const data = this.analyticsCache.get(request.url);
        if (data) {
          const loadTime = performance.now() - data.startTime;
          this.updatePerformanceMetrics(request.url, loadTime);
        }
        return response;
      }
    };
  }

  /**
   * API-specific caching plugin with intelligent strategies
   */
  private createAPIPlugin() {
    return {
      cacheWillUpdate: async ({ response }: { response: Response }) => {
        // Cache API responses based on content type and status
        if (response.status === 200) {
          const contentType = response.headers.get('content-type');
          
          // Always cache crisis-related API responses
          if (response.url.includes('/crisis') || response.url.includes('/emergency')) {
            return response;
          }
          
          // Cache JSON responses for longer
          if (contentType?.includes('application/json')) {
            return response;
          }
          
          // Don't cache large payloads on low-end devices
          const contentLength = response.headers.get('content-length');
          if (this.userMetrics.deviceCapabilities.isLowEnd && 
              contentLength && parseInt(contentLength) > 100000) {
            return null;
          }
          
          return response;
        }
        return null;
      }
    };
  }

  /**
   * User data plugin with privacy considerations
   */
  private createUserDataPlugin() {
    return {
      cacheWillUpdate: async ({ response }: { response: Response }) => {
        // Only cache user data if user is active
        const timeSinceActive = Date.now() - this.userMetrics.lastActiveTime;
        const isRecentlyActive = timeSinceActive < 60 * 60 * 1000; // 1 hour
        
        return isRecentlyActive && response.status === 200 ? response : null;
      },
      
      requestWillFetch: async ({ request }: { request: Request }) => {
        // Update last active time on user data requests
        this.userMetrics.lastActiveTime = Date.now();
        this.saveUserMetrics();
        return request;
      }
    };
  }

  /**
   * Asset optimization plugin
   */
  private createAssetPlugin() {
    return {
      cacheWillUpdate: async ({ response }: { request: Request; response: Response }) => {
        // Skip caching large assets on low-end devices
        if (this.userMetrics.deviceCapabilities.isLowEnd) {
          const contentLength = response.headers.get('content-length');
          if (contentLength && parseInt(contentLength) > 500000) { // 500KB limit
            return null;
          }
        }
        
        return response.status === 200 ? response : null;
      }
    };
  }

  /**
   * Image optimization plugin with format preference
   */
  private createImagePlugin() {
    return {
      requestWillFetch: async ({ request }: { request: Request }) => {
        // Prefer modern formats on capable devices
        if (request.destination === 'image') {
          const url = new URL(request.url);
          
          // Add format hints for better caching
          if (this.supportsWebP() && !url.pathname.includes('.webp')) {
            url.searchParams.set('format', 'webp');
          }
          
          if (this.userMetrics.deviceCapabilities.isLowEnd) {
            url.searchParams.set('quality', '75'); // Lower quality for low-end devices
          }
          
          return new Request(url.toString(), {
            method: request.method,
            headers: request.headers,
            body: request.body,
            mode: request.mode,
            credentials: request.credentials,
            cache: request.cache,
            redirect: request.redirect,
            referrer: request.referrer
          });
        }
        
        return request;
      }
    };
  }

  /**
   * Intelligent prefetching based on user behavior
   */
  public async intelligentPrefetch(): Promise<void> {
    const predictions = this.predictNextResources();
    
    for (const resource of predictions) {
      if (this.shouldPrefetch(resource)) {
        await this.prefetchResource(resource);
      }
    }
  }

  /**
   * Predict next resources based on user behavior patterns
   */
  private predictNextResources(): string[] {
    const { timeSpentOnRoutes, preferredFeatures, crisisInteractions } = this.userMetrics;
    const predictions: string[] = [];

    // Crisis prediction - highest priority
    if (crisisInteractions > 0) {
      predictions.push(
        '/crisis-resources.json',
        '/emergency-contacts.json',
        '/offline-crisis.html'
      );
    }

    // Route-based predictions
    const frequentRoutes = Object.entries(timeSpentOnRoutes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route);

    for (const route of frequentRoutes) {
      if (route.includes('mood-tracker')) {
        predictions.push('/mood-data.json', '/mood-insights.json');
      } else if (route.includes('journal')) {
        predictions.push('/journal-prompts.json', '/reflection-templates.json');
      } else if (route.includes('helpers')) {
        predictions.push('/helper-availability.json', '/chat-templates.json');
      }
    }

    // Feature-based predictions
    for (const feature of preferredFeatures) {
      switch (feature) {
        case 'meditation':
          predictions.push('/meditation-sessions.json', '/breathing-exercises.json');
          break;
        case 'community':
          predictions.push('/community-posts.json', '/support-groups.json');
          break;
        case 'wellness':
          predictions.push('/wellness-tips.json', '/self-care-activities.json');
          break;
      }
    }

    return [...new Set(predictions)]; // Remove duplicates
  }

  /**
   * Determine if a resource should be prefetched
   */
  private shouldPrefetch(resourceUrl: string): boolean {
    // Don't prefetch on slow networks or low-end devices
    if (this.userMetrics.networkCondition === 'slow' || 
        this.userMetrics.deviceCapabilities.isLowEnd) {
      // Only prefetch crisis resources
      return resourceUrl.includes('crisis') || resourceUrl.includes('emergency');
    }

    // Don't prefetch if already in queue
    if (this.prefetchQueue.includes(resourceUrl)) {
      return false;
    }

    // Limit prefetch queue size
    return this.prefetchQueue.length < 10;
  }

  /**
   * Prefetch a resource with intelligent caching
   */
  private async prefetchResource(resourceUrl: string): Promise<void> {
    try {
      this.prefetchQueue.push(resourceUrl);
      
      const cache = await caches.open('prefetched-content-v3');
      const response = await fetch(resourceUrl, {
        headers: {
          'X-Prefetch': 'true',
          'Priority': this.getPrefetchPriority(resourceUrl)
        }
      });

      if (response.ok) {
        await cache.put(resourceUrl, response.clone());
        // Prefetch successful
      }
      
    } catch (error) {
      console.warn(`[Intelligent Cache] Prefetch failed for ${resourceUrl}:`, error);
    } finally {
      // Remove from queue
      const index = this.prefetchQueue.indexOf(resourceUrl);
      if (index > -1) {
        this.prefetchQueue.splice(index, 1);
      }
    }
  }

  /**
   * Get prefetch priority for resource scheduling
   */
  private getPrefetchPriority(resourceUrl: string): string {
    if (resourceUrl.includes('crisis') || resourceUrl.includes('emergency')) {
      return 'high';
    } else if (resourceUrl.includes('mood') || resourceUrl.includes('journal')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Update user behavior metrics
   */
  public updateUserBehavior(route: string, timeSpent: number): void {
    this.userMetrics.visitedRoutes.push(route);
    this.userMetrics.timeSpentOnRoutes[route] = 
      (this.userMetrics.timeSpentOnRoutes[route] || 0) + timeSpent;
    this.userMetrics.lastActiveTime = Date.now();
    
    // Update preferred features based on usage patterns
    this.updatePreferredFeatures(route);
    
    this.saveUserMetrics();
    
    // Trigger intelligent prefetching
    this.intelligentPrefetch();
  }

  /**
   * Update preferred features based on usage patterns
   */
  private updatePreferredFeatures(route: string): void {
    const featureMap: Record<string, string> = {
      'mood-tracker': 'mood-tracking',
      'journal': 'journaling',
      'meditation': 'meditation',
      'helpers': 'peer-support',
      'community': 'community',
      'wellness': 'wellness',
      'crisis': 'crisis-support'
    };

    for (const [routePart, feature] of Object.entries(featureMap)) {
      if (route.includes(routePart) && !this.userMetrics.preferredFeatures.includes(feature)) {
        this.userMetrics.preferredFeatures.push(feature);
      }
    }

    // Keep only top 5 preferred features
    if (this.userMetrics.preferredFeatures.length > 5) {
      this.userMetrics.preferredFeatures = this.userMetrics.preferredFeatures.slice(-5);
    }
  }

  /**
   * Update performance metrics for optimization
   */
  private updatePerformanceMetrics(url: string, loadTime: number): void {
    const perfData = {
      url,
      loadTime,
      timestamp: Date.now(),
      networkCondition: this.userMetrics.networkCondition
    };

    // Store performance data for analysis
    const perfHistory = JSON.parse(localStorage.getItem('astral-performance') || '[]');
    perfHistory.push(perfData);
    
    // Keep only last 100 entries
    if (perfHistory.length > 100) {
      perfHistory.splice(0, perfHistory.length - 100);
    }
    
    localStorage.setItem('astral-performance', JSON.stringify(perfHistory));
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Save user metrics to localStorage
   */
  private saveUserMetrics(): void {
    localStorage.setItem('astral-cache-metrics', JSON.stringify(this.userMetrics));
  }

  /**
   * Setup event listeners for behavior tracking
   */
  private setupEventListeners(): void {
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.userMetrics.lastActiveTime = Date.now();
        this.saveUserMetrics();
      }
    });

    // Track network changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        
        let networkCondition: 'fast' | 'slow' | 'offline';
        if (effectiveType === '4g') {
          networkCondition = 'fast';
        } else if (effectiveType === 'slow-2g') {
          networkCondition = 'slow';
        } else {
          networkCondition = 'fast';
        }
        
        this.userMetrics.networkCondition = networkCondition;
        this.saveUserMetrics();
      });
    }
  }

  /**
   * Get cache strategies for workbox configuration
   */
  public getCacheStrategies(): CacheStrategy[] {
    return this.cacheStrategies;
  }

  /**
   * Get user metrics for analytics
   */
  public getUserMetrics(): UserBehaviorMetrics {
    return { ...this.userMetrics };
  }

  /**
   * Clean up old caches and optimize storage
   */
  public async optimizeStorage(): Promise<void> {
    const cacheNames = await caches.keys();
    const currentCaches = this.cacheStrategies.map(s => s.options.cacheName);
    
    // Delete old cache versions
    for (const cacheName of cacheNames) {
      if (!currentCaches.includes(cacheName) && cacheName.includes('astral')) {
        await caches.delete(cacheName);
        // Cache cleanup completed
      }
    }

    // Clear prefetch queue if device is low on storage
    if (this.userMetrics.deviceCapabilities.isLowEnd) {
      this.prefetchQueue = [];
      const prefetchCache = await caches.open('prefetched-content-v3');
      await prefetchCache.keys().then(keys => {
        if (keys.length > 10) {
          // Keep only the 10 most recent prefetched items
          return Promise.all(
            keys.slice(10).map(request => prefetchCache.delete(request))
          );
        }
      });
    }
  }
}

// Export singleton instance
export const intelligentCaching = new IntelligentCachingManager();
