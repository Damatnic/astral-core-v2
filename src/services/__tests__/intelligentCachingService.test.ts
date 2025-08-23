import { IntelligentCachingService, intelligentCache } from '../intelligentCachingService';

// Mock IndexedDB
const mockDatabase = {
  transaction: jest.fn(),
  objectStoreNames: ['cacheEntries', 'analytics'],
  close: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
};

const mockObjectStore = {
  add: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  index: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
  oncomplete: null,
  onerror: null,
};

// Mock openDB from idb
jest.mock('idb', () => ({
  openDB: jest.fn(),
}));

// Mock Cache API
const mockCache = {
  match: jest.fn(),
  add: jest.fn(),
  addAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
};

Object.defineProperty(window, 'caches', {
  value: {
    open: jest.fn().mockResolvedValue(mockCache),
    match: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn(),
  },
  writable: true,
});

// Mock Navigator connection
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    type: 'cellular'
  },
  writable: true,
});

// Mock Navigator storage - fix for undefined storage
if (!navigator.storage) {
  Object.defineProperty(navigator, 'storage', {
    value: {
      estimate: jest.fn().mockResolvedValue({
        quota: 1000000000, // 1GB
        usage: 100000000   // 100MB
      }),
      getDirectory: jest.fn(),
      persist: jest.fn()
    },
    writable: true,
    configurable: true
  });
} else {
  // If storage exists, just mock the estimate method
  if (navigator.storage && !navigator.storage.estimate) {
    navigator.storage.estimate = jest.fn().mockResolvedValue({
      quota: 1000000000, // 1GB
      usage: 100000000   // 100MB
    });
  }
}

describe('IntelligentCachingService', () => {
  let service: IntelligentCachingService;
  const { openDB } = require('idb');
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Reset the mock before each test
    openDB.mockResolvedValue(mockDatabase);
    mockDatabase.transaction.mockReturnValue(mockTransaction);
    mockDatabase.get.mockResolvedValue(null);
    mockDatabase.getAll.mockResolvedValue([]);
    mockDatabase.put.mockResolvedValue(undefined);
    mockDatabase.delete.mockResolvedValue(undefined);
    mockObjectStore.get.mockResolvedValue(null);
    mockObjectStore.getAll.mockResolvedValue([]);
    mockObjectStore.put.mockResolvedValue(undefined);
    mockObjectStore.delete.mockResolvedValue(undefined);
    
    // Create a new service instance for each test
    service = new IntelligentCachingService();
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it.skip('should initialize successfully', async () => {
      // Wait a bit for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(openDB).toHaveBeenCalledWith(
        'intelligent-cache',
        1,
        expect.objectContaining({
          upgrade: expect.any(Function)
        })
      );
    });

    it.skip('should set up database schema during upgrade', async () => {
      const mockDb = {
        createObjectStore: jest.fn().mockReturnValue({
          createIndex: jest.fn()
        })
      };
      
      openDB.mockImplementation((_name: string, _version: number, { upgrade }: any) => {
        upgrade(mockDb);
        return Promise.resolve(mockDatabase);
      });

      // Create a new service to trigger initialization
      new IntelligentCachingService();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(openDB).toHaveBeenCalled();
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('cache_entries', { keyPath: 'url' });
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('cache_analytics', { keyPath: 'id' });
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('storage_quota', { keyPath: 'id' });
    });

    it.skip('should handle initialization errors gracefully', async () => {
      // Restore console.error for this test to check the error
      consoleErrorSpy.mockRestore();
      const testConsoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      openDB.mockRejectedValue(new Error('DB initialization failed'));
      
      // Create a new service to trigger initialization
      new IntelligentCachingService();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(testConsoleSpy).toHaveBeenCalledWith(
        '[IntelligentCache] Failed to initialize database:',
        expect.any(Error)
      );
      
      testConsoleSpy.mockRestore();
      // Re-suppress for next tests
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
  });

  describe('cache management', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should cache critical resources with highest priority', async () => {
      const url = '/crisis-resources/hotlines';
      const response = new Response('Crisis hotline data');
      
      // Mock fetch for warming resources
      global.fetch = jest.fn().mockResolvedValue(response);
      
      // Use the warmCriticalCaches method which is public
      await service.warmCriticalCaches();

      // Verify critical resources were warmed
      expect(global.fetch).toHaveBeenCalled();
      expect(mockCache.put).toHaveBeenCalled();
    });

    it.skip('should invalidate cache entries', async () => {
      const url = '/cached-resource';
      
      mockCache.delete.mockResolvedValue(true);
      
      await service.invalidateCache(url, 'manual');
      
      expect(mockCache.delete).toHaveBeenCalledWith(url);
      expect(mockDatabase.delete).toHaveBeenCalledWith(url);
    });

    it.skip('should get storage info', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            quota: 1000000,
            usage: 500000
          })
        },
        writable: true
      });
      
      mockDatabase.getAll.mockResolvedValue([{}, {}, {}]);
      
      const storageInfo = await service.getStorageInfo();
      
      expect(storageInfo).toEqual({
        usage: 500000,
        quota: 1000000,
        usagePercentage: 0.5,
        cacheEntries: 3
      });
    });

    it.skip('should clean up expired entries', async () => {
      const oldTimestamp = Date.now() - (4 * 24 * 60 * 60 * 1000); // 4 days ago
      
      mockDatabase.getAll.mockResolvedValue([
        {
          url: '/old-resource',
          priority: 'low',
          timestamp: oldTimestamp,
          resourceType: 'static-asset'
        }
      ]);
      
      const cleanedCount = await service.cleanupExpiredEntries();
      
      expect(cleanedCount).toBeGreaterThan(0);
      expect(mockCache.delete).toHaveBeenCalledWith('/old-resource');
    });

    it.skip('should get cache analytics', async () => {
      const mockAnalytics = {
        id: 'current',
        hitRate: 0.75,
        missRate: 0.25,
        evictionCount: 5,
        storageUsage: 0.5,
        performanceMetrics: {
          averageLoadTime: 100,
          cacheRetrievalTime: 50,
          networkFallbackTime: 200,
          offlineRequestCount: 10
        }
      };
      
      mockDatabase.get.mockResolvedValue(mockAnalytics);
      
      const analytics = await service.getCacheAnalytics();
      
      expect(analytics).toEqual(expect.objectContaining({
        hitRate: mockAnalytics.hitRate,
        missRate: mockAnalytics.missRate,
        evictionCount: mockAnalytics.evictionCount
      }));
    });
  });

  describe('cache eviction and cleanup', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should perform intelligent eviction when storage is high', async () => {
      // Mock high storage usage
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            quota: 1000000,
            usage: 850000 // 85% usage
          })
        },
        writable: true
      });
      
      mockDatabase.getAll.mockResolvedValue([
        {
          url: '/resource1',
          priority: 'medium',
          timestamp: Date.now() - 1000,
          lastAccessed: Date.now() - 5000,
          hitCount: 1,
          resourceType: 'static-asset'
        }
      ]);

      await service.performIntelligentEviction();

      expect(mockCache.delete).toHaveBeenCalled();
    });

    it.skip('should never evict critical resources', async () => {
      // Mock high storage usage
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            quota: 1000000,
            usage: 850000 // 85% usage
          })
        },
        writable: true
      });
      
      mockDatabase.getAll.mockResolvedValue([
        {
          url: '/crisis-hotline',
          priority: 'critical',
          timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000),
          lastAccessed: Date.now() - (30 * 24 * 60 * 60 * 1000),
          hitCount: 100,
          resourceType: 'crisis-resource'
        }
      ]);

      await service.performIntelligentEviction();

      expect(mockCache.delete).not.toHaveBeenCalledWith('/crisis-hotline');
    });

    it.skip('should clean up expired entries based on retention policy', async () => {
      const now = Date.now();
      
      mockDatabase.getAll.mockResolvedValue([
        {
          url: '/old-low-priority',
          priority: 'low',
          timestamp: now - (4 * 24 * 60 * 60 * 1000), // 4 days old (exceeds 3 day retention)
          resourceType: 'static-asset'
        },
        {
          url: '/recent-high-priority',
          priority: 'high',
          timestamp: now - (1 * 24 * 60 * 60 * 1000), // 1 day old (within 30 day retention)
          resourceType: 'user-data'
        }
      ]);

      const cleanedCount = await service.cleanupExpiredEntries();

      expect(cleanedCount).toBe(1);
      expect(mockCache.delete).toHaveBeenCalledWith('/old-low-priority');
      expect(mockCache.delete).not.toHaveBeenCalledWith('/recent-high-priority');
    });
  });

  describe('storage monitoring', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should get storage info correctly', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            quota: 2000000,
            usage: 1000000
          })
        },
        writable: true
      });
      
      mockDatabase.getAll.mockResolvedValue([{}, {}, {}, {}]);
      
      const info = await service.getStorageInfo();
      
      expect(info).toEqual({
        usage: 1000000,
        quota: 2000000,
        usagePercentage: 0.5,
        cacheEntries: 4
      });
    });

    it.skip('should handle storage quota warnings', async () => {
      // Simulate high storage usage
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            quota: 1000000,
            usage: 910000 // 91% usage - critical
          })
        },
        writable: true
      });
      
      // Trigger a manual check by getting storage info
      await service.getStorageInfo();
      
      // The monitoring interval will handle warnings, but we can check the storage state
      const info = await service.getStorageInfo();
      expect(info.usagePercentage).toBeGreaterThan(0.9);
    });
  });

  describe('cache warming', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should warm critical caches on initialization', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        new Response('Mock response', {
          headers: { 'content-length': '100' }
        })
      );
      
      await service.warmCriticalCaches();
      
      // Should attempt to warm critical resources
      expect(global.fetch).toHaveBeenCalled();
      expect(mockCache.put).toHaveBeenCalled();
    });

    it.skip('should handle cache warming errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await service.warmCriticalCaches();
      
      // Should log warnings but not throw
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('analytics and monitoring', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should return cache analytics', async () => {
      const mockAnalytics = {
        id: 'current',
        hitRate: 0.8,
        missRate: 0.2,
        evictionCount: 10,
        storageUsage: 0.6,
        performanceMetrics: {
          averageLoadTime: 150,
          cacheRetrievalTime: 75,
          networkFallbackTime: 250,
          offlineRequestCount: 5
        }
      };
      
      mockDatabase.get.mockResolvedValue(mockAnalytics);
      
      const analytics = await service.getCacheAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.hitRate).toBe(0.8);
      expect(analytics.missRate).toBe(0.2);
    });

    it.skip('should return default analytics when DB is not available', async () => {
      mockDatabase.get.mockResolvedValue(null);
      
      const analytics = await service.getCacheAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.performanceMetrics).toBeDefined();
      expect(analytics.performanceMetrics.averageLoadTime).toBeDefined();
    });

    it.skip('should track performance metrics', async () => {
      const analytics = await service.getCacheAnalytics() as any;

      expect(analytics.performanceMetrics).toHaveProperty('averageLoadTime');
      expect(analytics.performanceMetrics).toHaveProperty('cacheRetrievalTime');
      expect(analytics.performanceMetrics).toHaveProperty('networkFallbackTime');
      expect(analytics.performanceMetrics).toHaveProperty('offlineRequestCount');
    });
  });

  describe('cache invalidation', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should invalidate cache entries', async () => {
      const url = '/resource-to-invalidate';
      
      mockCache.delete.mockResolvedValue(true);
      (window.caches.keys as jest.Mock).mockResolvedValue(['cache1', 'cache2']);
      
      await service.invalidateCache(url, 'updated');
      
      expect(mockCache.delete).toHaveBeenCalledWith(url);
      expect(mockDatabase.delete).toHaveBeenCalledWith(url);
    });

    it.skip('should handle invalidation errors gracefully', async () => {
      // Temporarily restore console.error to test it
      consoleErrorSpy.mockRestore();
      const testConsoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockCache.delete.mockRejectedValue(new Error('Delete failed'));
      
      await service.invalidateCache('/resource', 'manual');
      
      expect(testConsoleSpy).toHaveBeenCalled();
      
      testConsoleSpy.mockRestore();
      // Re-suppress for next tests
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
  });

  describe('cleanup operations', () => {
    beforeEach(async () => {
      // Wait for service initialization
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should clean up expired entries by priority', async () => {
      const now = Date.now();
      
      mockDatabase.getAll.mockResolvedValue([
        // Should be deleted - exceeds 3 day retention for low priority
        {
          url: '/old-low',
          priority: 'low',
          timestamp: now - (5 * 24 * 60 * 60 * 1000),
          resourceType: 'static-asset'
        },
        // Should NOT be deleted - within 30 day retention for high priority
        {
          url: '/old-high',
          priority: 'high',
          timestamp: now - (20 * 24 * 60 * 60 * 1000),
          resourceType: 'user-data'
        },
        // Should NOT be deleted - critical resources have 90 day retention
        {
          url: '/old-critical',
          priority: 'critical',
          timestamp: now - (60 * 24 * 60 * 60 * 1000),
          resourceType: 'crisis-resource'
        }
      ]);
      
      const cleanedCount = await service.cleanupExpiredEntries();
      
      expect(cleanedCount).toBe(1);
      expect(mockCache.delete).toHaveBeenCalledWith('/old-low');
      expect(mockCache.delete).not.toHaveBeenCalledWith('/old-high');
      expect(mockCache.delete).not.toHaveBeenCalledWith('/old-critical');
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      // Wait for service initialization  
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it.skip('should handle cache operations when DB is not initialized', async () => {
      // Create a service instance but mock DB to be null
      const testService = new IntelligentCachingService();
      (testService as any).db = null;
      
      // Should not throw when DB is null
      await expect(testService.getCacheAnalytics()).resolves.toBeDefined();
      await expect(testService.getStorageInfo()).resolves.toBeDefined();
      await expect(testService.cleanupExpiredEntries()).resolves.toBe(0);
    });

    it.skip('should handle storage estimate errors', async () => {
      // Temporarily restore console.error to test it
      consoleErrorSpy.mockRestore();
      const testConsoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockRejectedValue(new Error('Storage API error'))
        },
        writable: true
      });
      
      const info = await service.getStorageInfo();
      
      expect(info).toEqual({
        usage: 0,
        quota: 0,
        usagePercentage: 0,
        cacheEntries: 0
      });
      
      expect(testConsoleSpy).toHaveBeenCalled();
      
      testConsoleSpy.mockRestore();
      // Re-suppress for next tests
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
  });
});
