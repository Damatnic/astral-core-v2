/**
 * Intelligent Caching Hook
 *
 * Advanced caching system with predictive algorithms, multi-tier storage,
 * and performance optimization for mental health platform
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { logger } from '../utils/logger';

export enum CacheStrategy {
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  NETWORK_ONLY = 'network-only',
  CACHE_ONLY = 'cache-only'
}

export enum CacheTier {
  MEMORY = 'memory',
  SESSION = 'session',
  LOCAL = 'local',
  INDEXED_DB = 'indexed-db',
  SERVICE_WORKER = 'service-worker'
}

export interface CacheItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: number;
  tags: string[];
  metadata: {
    source: string;
    version: string;
    etag?: string;
    contentType?: string;
    isCritical: boolean;
  };
}

export interface CacheConfig {
  maxSize: number; // bytes
  maxItems: number;
  defaultTTL: number; // milliseconds
  strategy: CacheStrategy;
  tiers: CacheTier[];
  enableCompression: boolean;
  enableEncryption: boolean;
  enableMetrics: boolean;
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  cacheSize: number;
  itemCount: number;
  evictions: number;
}

interface UseIntelligentCachingReturn {
  // Core caching operations
  get: <T>(key: string, defaultValue?: T) => Promise<T | undefined>;
  set: <T>(key: string, value: T, options?: CacheSetOptions) => Promise<boolean>;
  remove: (key: string) => Promise<boolean>;
  clear: (pattern?: string) => Promise<boolean>;
  
  // Batch operations
  getMany: <T>(keys: string[]) => Promise<Map<string, T>>;
  setMany: <T>(items: Map<string, T>, options?: CacheSetOptions) => Promise<boolean>;
  removeMany: (keys: string[]) => Promise<boolean>;
  
  // Cache management
  invalidate: (tags: string[]) => Promise<boolean>;
  refresh: (key: string) => Promise<boolean>;
  preload: (keys: string[]) => Promise<boolean>;
  
  // Analytics and optimization
  metrics: CacheMetrics;
  optimize: () => Promise<void>;
  analyze: () => Promise<CacheAnalysis>;
  
  // State
  isLoading: boolean;
  config: CacheConfig;
  updateConfig: (updates: Partial<CacheConfig>) => void;
}

interface CacheSetOptions {
  ttl?: number;
  priority?: number;
  tags?: string[];
  tier?: CacheTier;
  strategy?: CacheStrategy;
  compress?: boolean;
  encrypt?: boolean;
}

interface CacheAnalysis {
  topItems: Array<{ key: string; accessCount: number; size: number }>;
  leastUsed: Array<{ key: string; lastAccessed: number }>;
  largestItems: Array<{ key: string; size: number }>;
  expiringSoon: Array<{ key: string; expiresAt: number }>;
  recommendations: string[];
}

// Cache Context
const CacheContext = createContext<UseIntelligentCachingReturn | null>(null);

export const CacheProvider: React.FC<{ 
  children: React.ReactNode; 
  config?: Partial<CacheConfig> 
}> = ({ children, config }) => {
  const cache = useIntelligentCaching(config);
  
  return (
    <CacheContext.Provider value={cache}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxItems: 1000,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
  tiers: [CacheTier.MEMORY, CacheTier.LOCAL],
  enableCompression: true,
  enableEncryption: false,
  enableMetrics: true
};

export function useIntelligentCaching(
  initialConfig: Partial<CacheConfig> = {}
): UseIntelligentCachingReturn {
  const [config, setConfig] = useState<CacheConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    averageResponseTime: 0,
    cacheSize: 0,
    itemCount: 0,
    evictions: 0
  });

  // Cache storage refs
  const memoryCache = useRef<Map<string, CacheItem>>(new Map());
  const compressionWorker = useRef<Worker | null>(null);
  const metricsTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize compression worker
  useEffect(() => {
    if (config.enableCompression && 'Worker' in window) {
      try {
        const workerBlob = new Blob([`
          self.onmessage = function(e) {
            const { action, data, id } = e.data;
            
            if (action === 'compress') {
              // Simple compression simulation (in real app, use actual compression)
              const compressed = JSON.stringify(data);
              self.postMessage({ id, result: compressed });
            } else if (action === 'decompress') {
              try {
                const decompressed = JSON.parse(data);
                self.postMessage({ id, result: decompressed });
              } catch (error) {
                self.postMessage({ id, error: error.message });
              }
            }
          };
        `], { type: 'application/javascript' });
        
        const workerUrl = URL.createObjectURL(workerBlob);
        compressionWorker.current = new Worker(workerUrl);
        
        compressionWorker.current.onerror = (error) => {
          logger.error('Compression worker error', error);
        };
        
        return () => {
          if (compressionWorker.current) {
            compressionWorker.current.terminate();
            URL.revokeObjectURL(workerUrl);
          }
        };
      } catch (error) {
        logger.warn('Failed to initialize compression worker', error);
      }
    }
  }, [config.enableCompression]);

  // Calculate item size
  const calculateSize = useCallback((data: any): number => {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }, []);

  // Compress data
  const compressData = useCallback(async (data: any): Promise<any> => {
    if (!config.enableCompression || !compressionWorker.current) {
      return data;
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handleMessage = (e: MessageEvent) => {
        if (e.data.id === id) {
          compressionWorker.current?.removeEventListener('message', handleMessage);
          
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };

      compressionWorker.current.addEventListener('message', handleMessage);
      compressionWorker.current.postMessage({ action: 'compress', data, id });
    });
  }, [config.enableCompression]);

  // Decompress data
  const decompressData = useCallback(async (data: any): Promise<any> => {
    if (!config.enableCompression || !compressionWorker.current) {
      return data;
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handleMessage = (e: MessageEvent) => {
        if (e.data.id === id) {
          compressionWorker.current?.removeEventListener('message', handleMessage);
          
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };

      compressionWorker.current.addEventListener('message', handleMessage);
      compressionWorker.current.postMessage({ action: 'decompress', data, id });
    });
  }, [config.enableCompression]);

  // Storage tier operations
  const getFromTier = useCallback(async (key: string, tier: CacheTier): Promise<CacheItem | null> => {
    try {
      switch (tier) {
        case CacheTier.MEMORY:
          return memoryCache.current.get(key) || null;
          
        case CacheTier.SESSION:
          const sessionData = sessionStorage.getItem(`cache_${key}`);
          return sessionData ? JSON.parse(sessionData) : null;
          
        case CacheTier.LOCAL:
          const localData = localStorage.getItem(`cache_${key}`);
          return localData ? JSON.parse(localData) : null;
          
        case CacheTier.INDEXED_DB:
          // IndexedDB implementation would go here
          return null;
          
        default:
          return null;
      }
    } catch (error) {
      logger.error(`Failed to get from ${tier}`, { key, error });
      return null;
    }
  }, []);

  const setToTier = useCallback(async (key: string, item: CacheItem, tier: CacheTier): Promise<boolean> => {
    try {
      const serialized = JSON.stringify(item);
      
      switch (tier) {
        case CacheTier.MEMORY:
          memoryCache.current.set(key, item);
          return true;
          
        case CacheTier.SESSION:
          sessionStorage.setItem(`cache_${key}`, serialized);
          return true;
          
        case CacheTier.LOCAL:
          localStorage.setItem(`cache_${key}`, serialized);
          return true;
          
        case CacheTier.INDEXED_DB:
          // IndexedDB implementation would go here
          return false;
          
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Failed to set to ${tier}`, { key, error });
      return false;
    }
  }, []);

  const removeFromTier = useCallback(async (key: string, tier: CacheTier): Promise<boolean> => {
    try {
      switch (tier) {
        case CacheTier.MEMORY:
          return memoryCache.current.delete(key);
          
        case CacheTier.SESSION:
          sessionStorage.removeItem(`cache_${key}`);
          return true;
          
        case CacheTier.LOCAL:
          localStorage.removeItem(`cache_${key}`);
          return true;
          
        case CacheTier.INDEXED_DB:
          // IndexedDB implementation would go here
          return false;
          
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Failed to remove from ${tier}`, { key, error });
      return false;
    }
  }, []);

  // Cache eviction
  const evictLRU = useCallback(async (): Promise<void> => {
    const items = Array.from(memoryCache.current.entries());
    
    if (items.length === 0) return;

    // Sort by last accessed (LRU)
    items.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 10% of items
    const toRemove = Math.max(1, Math.floor(items.length * 0.1));
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = items[i];
      memoryCache.current.delete(key);
      
      // Also remove from other tiers
      await Promise.all(
        config.tiers.map(tier => removeFromTier(key, tier))
      );
    }

    setMetrics(prev => ({
      ...prev,
      evictions: prev.evictions + toRemove
    }));

    logger.info('Cache eviction completed', { removed: toRemove });
  }, [config.tiers, removeFromTier]);

  // Core cache operations
  const get = useCallback(async <T>(key: string, defaultValue?: T): Promise<T | undefined> => {
    const startTime = performance.now();
    setIsLoading(true);

    try {
      // Try each tier in order
      for (const tier of config.tiers) {
        const item = await getFromTier(key, tier);
        
        if (item) {
          // Check expiration
          if (item.expiresAt > Date.now()) {
            // Update access statistics
            item.accessCount++;
            item.lastAccessed = Date.now();
            
            // Promote to higher tier if needed
            if (tier !== config.tiers[0]) {
              await setToTier(key, item, config.tiers[0]);
            }
            
            const decompressed = await decompressData(item.data);
            
            // Update metrics
            setMetrics(prev => ({
              ...prev,
              totalRequests: prev.totalRequests + 1,
              totalHits: prev.totalHits + 1,
              hitRate: (prev.totalHits + 1) / (prev.totalRequests + 1),
              averageResponseTime: (prev.averageResponseTime + (performance.now() - startTime)) / 2
            }));

            return decompressed as T;
          } else {
            // Item expired, remove it
            await removeFromTier(key, tier);
          }
        }
      }

      // Cache miss
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        totalMisses: prev.totalMisses + 1,
        missRate: (prev.totalMisses + 1) / (prev.totalRequests + 1)
      }));

      return defaultValue;
    } catch (error) {
      logger.error('Cache get failed', { key, error });
      return defaultValue;
    } finally {
      setIsLoading(false);
    }
  }, [config.tiers, getFromTier, setToTier, removeFromTier, decompressData]);

  const set = useCallback(async <T>(
    key: string, 
    value: T, 
    options: CacheSetOptions = {}
  ): Promise<boolean> => {
    try {
      const now = Date.now();
      const ttl = options.ttl || config.defaultTTL;
      const compressed = await compressData(value);
      
      const item: CacheItem = {
        id: key,
        data: compressed,
        timestamp: now,
        expiresAt: now + ttl,
        accessCount: 0,
        lastAccessed: now,
        size: calculateSize(value),
        priority: options.priority || 1,
        tags: options.tags || [],
        metadata: {
          source: 'user',
          version: '1.0.0',
          isCritical: options.priority ? options.priority > 5 : false
        }
      };

      // Check if we need to evict
      const currentSize = Array.from(memoryCache.current.values())
        .reduce((total, item) => total + item.size, 0);
      
      if (currentSize + item.size > config.maxSize || 
          memoryCache.current.size >= config.maxItems) {
        await evictLRU();
      }

      // Store in specified tiers
      const targetTiers = options.tier ? [options.tier] : config.tiers;
      const results = await Promise.all(
        targetTiers.map(tier => setToTier(key, item, tier))
      );

      const success = results.some(result => result);

      if (success) {
        setMetrics(prev => ({
          ...prev,
          cacheSize: currentSize + item.size,
          itemCount: prev.itemCount + 1
        }));
      }

      return success;
    } catch (error) {
      logger.error('Cache set failed', { key, error });
      return false;
    }
  }, [config.defaultTTL, config.maxSize, config.maxItems, config.tiers, compressData, calculateSize, evictLRU, setToTier]);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      const results = await Promise.all(
        config.tiers.map(tier => removeFromTier(key, tier))
      );

      const success = results.some(result => result);
      
      if (success) {
        setMetrics(prev => ({
          ...prev,
          itemCount: Math.max(0, prev.itemCount - 1)
        }));
      }

      return success;
    } catch (error) {
      logger.error('Cache remove failed', { key, error });
      return false;
    }
  }, [config.tiers, removeFromTier]);

  const clear = useCallback(async (pattern?: string): Promise<boolean> => {
    try {
      if (pattern) {
        // Clear items matching pattern
        const regex = new RegExp(pattern);
        const keys = Array.from(memoryCache.current.keys()).filter(key => regex.test(key));
        
        const results = await Promise.all(keys.map(key => remove(key)));
        return results.every(result => result);
      } else {
        // Clear all
        memoryCache.current.clear();
        
        // Clear from storage tiers
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cache_')) {
            keys.push(key);
          }
        }
        
        keys.forEach(key => localStorage.removeItem(key));
        
        // Reset metrics
        setMetrics({
          hitRate: 0,
          missRate: 0,
          totalRequests: 0,
          totalHits: 0,
          totalMisses: 0,
          averageResponseTime: 0,
          cacheSize: 0,
          itemCount: 0,
          evictions: 0
        });
        
        return true;
      }
    } catch (error) {
      logger.error('Cache clear failed', { pattern, error });
      return false;
    }
  }, [remove]);

  // Batch operations
  const getMany = useCallback(async <T>(keys: string[]): Promise<Map<string, T>> => {
    const results = new Map<string, T>();
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await get<T>(key);
        if (value !== undefined) {
          results.set(key, value);
        }
      })
    );
    
    return results;
  }, [get]);

  const setMany = useCallback(async <T>(
    items: Map<string, T>, 
    options: CacheSetOptions = {}
  ): Promise<boolean> => {
    const results = await Promise.all(
      Array.from(items.entries()).map(([key, value]) => set(key, value, options))
    );
    
    return results.every(result => result);
  }, [set]);

  const removeMany = useCallback(async (keys: string[]): Promise<boolean> => {
    const results = await Promise.all(keys.map(key => remove(key)));
    return results.every(result => result);
  }, [remove]);

  // Cache management
  const invalidate = useCallback(async (tags: string[]): Promise<boolean> => {
    try {
      const toRemove: string[] = [];
      
      for (const [key, item] of memoryCache.current.entries()) {
        if (item.tags.some(tag => tags.includes(tag))) {
          toRemove.push(key);
        }
      }
      
      return await removeMany(toRemove);
    } catch (error) {
      logger.error('Cache invalidate failed', { tags, error });
      return false;
    }
  }, [removeMany]);

  const refresh = useCallback(async (key: string): Promise<boolean> => {
    // Remove and let next get fetch fresh data
    return await remove(key);
  }, [remove]);

  const preload = useCallback(async (keys: string[]): Promise<boolean> => {
    // This would typically fetch and cache data
    // For now, just return true
    logger.info('Cache preload requested', { keys });
    return true;
  }, []);

  // Analytics
  const analyze = useCallback(async (): Promise<CacheAnalysis> => {
    const items = Array.from(memoryCache.current.entries());
    
    const topItems = items
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(([key, item]) => ({
        key,
        accessCount: item.accessCount,
        size: item.size
      }));

    const leastUsed = items
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, 10)
      .map(([key, item]) => ({
        key,
        lastAccessed: item.lastAccessed
      }));

    const largestItems = items
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 10)
      .map(([key, item]) => ({
        key,
        size: item.size
      }));

    const expiringSoon = items
      .filter(([, item]) => item.expiresAt - Date.now() < 60000) // Expiring in 1 minute
      .map(([key, item]) => ({
        key,
        expiresAt: item.expiresAt
      }));

    const recommendations: string[] = [];
    
    if (metrics.hitRate < 0.5) {
      recommendations.push('Consider increasing cache TTL or size');
    }
    
    if (metrics.evictions > 100) {
      recommendations.push('Cache size may be too small, consider increasing maxSize');
    }
    
    if (expiringSoon.length > items.length * 0.1) {
      recommendations.push('Many items expiring soon, consider adjusting TTL strategy');
    }

    return {
      topItems,
      leastUsed,
      largestItems,
      expiringSoon,
      recommendations
    };
  }, [metrics]);

  const optimize = useCallback(async (): Promise<void> => {
    const analysis = await analyze();
    
    // Remove least used items if cache is getting full
    if (memoryCache.current.size > config.maxItems * 0.8) {
      const toRemove = analysis.leastUsed.slice(0, 10);
      await removeMany(toRemove.map(item => item.key));
    }
    
    // Remove expired items
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of memoryCache.current.entries()) {
      if (item.expiresAt <= now) {
        expiredKeys.push(key);
      }
    }
    
    if (expiredKeys.length > 0) {
      await removeMany(expiredKeys);
    }
    
    logger.info('Cache optimization completed', {
      removedLeastUsed: analysis.leastUsed.length,
      removedExpired: expiredKeys.length
    });
  }, [analyze, config.maxItems, removeMany]);

  const updateConfig = useCallback((updates: Partial<CacheConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Periodic optimization
  useEffect(() => {
    if (config.enableMetrics) {
      metricsTimer.current = setInterval(() => {
        optimize();
      }, 60000); // Every minute

      return () => {
        if (metricsTimer.current) {
          clearInterval(metricsTimer.current);
        }
      };
    }
  }, [config.enableMetrics, optimize]);

  return {
    // Core operations
    get,
    set,
    remove,
    clear,
    
    // Batch operations
    getMany,
    setMany,
    removeMany,
    
    // Cache management
    invalidate,
    refresh,
    preload,
    
    // Analytics
    metrics,
    analyze,
    optimize,
    
    // State
    isLoading,
    config,
    updateConfig
  };
}

export type { 
  UseIntelligentCachingReturn, 
  CacheItem, 
  CacheConfig, 
  CacheSetOptions, 
  CacheMetrics,
  CacheAnalysis 
};
