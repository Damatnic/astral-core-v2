import { renderHook, act, waitFor } from '../test-utils';
import { useServiceWorker, useOfflineStatus, useCacheManager } from './useServiceWorker';
import serviceWorkerManager from '../services/serviceWorkerManager';

// Mock the service worker manager
jest.mock('../services/serviceWorkerManager', () => ({
  __esModule: true,
  default: {
    onOnline: jest.fn(),
    onOffline: jest.fn(),
    onUpdateAvailable: jest.fn(),
    removeOnlineListener: jest.fn(),
    removeOfflineListener: jest.fn(),
    removeUpdateListener: jest.fn(),
    isOfflineReady: jest.fn(),
    getCacheStatus: jest.fn(),
    skipWaiting: jest.fn(),
    checkForUpdates: jest.fn(),
    clearCache: jest.fn(),
    cacheCrisisResource: jest.fn(),
    precacheCrisisResources: jest.fn(),
    forceReload: jest.fn(),
    getNetworkStatus: jest.fn()
  }
}));

// Mock navigator
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});


describe('useServiceWorker Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (navigator as any).onLine = true;
    
    // Default mock implementations
    (serviceWorkerManager.isOfflineReady as jest.Mock).mockResolvedValue(false);
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockResolvedValue({
      totalSize: 1024,
      itemCount: 10,
      lastUpdated: Date.now()
    });
    (serviceWorkerManager.getNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true
    });
  });

  it.skip('should initialize with correct default state', async () => {
    const { result } = renderHook(() => useServiceWorker());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOfflineReady).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.cacheStatus).toBeNull();
  });

  it.skip('should register event listeners on mount', async () => {
    renderHook(() => useServiceWorker());
    
    expect(serviceWorkerManager.onOnline).toHaveBeenCalled();
    expect(serviceWorkerManager.onOffline).toHaveBeenCalled();
    expect(serviceWorkerManager.onUpdateAvailable).toHaveBeenCalled();
  });

  it.skip('should remove event listeners on unmount', async () => {
    const { unmount } = renderHook(() => useServiceWorker());
    
    unmount();
    
    expect(serviceWorkerManager.removeOnlineListener).toHaveBeenCalled();
    expect(serviceWorkerManager.removeOfflineListener).toHaveBeenCalled();
    expect(serviceWorkerManager.removeUpdateListener).toHaveBeenCalled();
  });

  it.skip('should update online status when coming online', async () => {
    let onlineHandler: () => void;
    (serviceWorkerManager.onOnline as jest.Mock).mockImplementation((handler) => {
      onlineHandler = handler;
    });

    const { result } = renderHook(() => useServiceWorker());
    
    // Initially offline
    result.current.isOnline = false;
    
    await act(async () => {
      onlineHandler();
    });

    expect(result.current.isOnline).toBe(true);
  });

  it.skip('should update online status when going offline', async () => {
    let offlineHandler: () => void;
    (serviceWorkerManager.onOffline as jest.Mock).mockImplementation((handler) => {
      offlineHandler = handler;
    });

    const { result } = renderHook(() => useServiceWorker());
    
    // Initially online (navigator.onLine defaults to true in jsdom)
    expect(result.current.isOnline).toBe(true);
    
    await act(async () => {
      offlineHandler();
    });

    expect(result.current.isOnline).toBe(false);
  });

  it.skip('should update when service worker update is available', async () => {
    let updateHandler: () => void;
    (serviceWorkerManager.onUpdateAvailable as jest.Mock).mockImplementation((handler) => {
      updateHandler = handler;
    });

    const { result } = renderHook(() => useServiceWorker());
    
    await act(async () => {
      updateHandler();
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it.skip('should check offline readiness on mount', async () => {
    (serviceWorkerManager.isOfflineReady as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useServiceWorker());
    
    await waitFor(() => {
      expect(result.current.isOfflineReady).toBe(true);
    });

    expect(serviceWorkerManager.isOfflineReady).toHaveBeenCalled();
  });

  it.skip('should handle offline readiness check errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.isOfflineReady as jest.Mock).mockRejectedValue(new Error('Check failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    await waitFor(() => {
      expect(result.current.isOfflineReady).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to check offline readiness:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should get cache status on mount', async () => {
    const mockCacheStatus = {
      totalSize: 2048,
      itemCount: 20,
      lastUpdated: Date.now()
    };
    
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockResolvedValue(mockCacheStatus);
    
    const { result } = renderHook(() => useServiceWorker());
    
    await waitFor(() => {
      expect(result.current.cacheStatus).toEqual(mockCacheStatus);
    });

    expect(serviceWorkerManager.getCacheStatus).toHaveBeenCalled();
  });

  it.skip('should handle cache status errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockRejectedValue(new Error('Status failed'));
    
    renderHook(() => useServiceWorker());
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get cache status:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it.skip('should skip waiting and clear update available', async () => {
    (serviceWorkerManager.skipWaiting as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useServiceWorker());
    
    // Set update available
    result.current.updateAvailable = true;
    
    await act(async () => {
      await result.current.skipWaiting();
    });

    expect(serviceWorkerManager.skipWaiting).toHaveBeenCalled();
    expect(result.current.updateAvailable).toBe(false);
  });

  it.skip('should handle skip waiting errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.skipWaiting as jest.Mock).mockRejectedValue(new Error('Skip failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    await act(async () => {
      await result.current.skipWaiting();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to skip waiting:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should check for updates', async () => {
    (serviceWorkerManager.checkForUpdates as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useServiceWorker());
    
    let hasUpdate: boolean = false;
    await act(async () => {
      hasUpdate = await result.current.checkForUpdates();
    });

    expect(hasUpdate).toBe(true);
    expect(serviceWorkerManager.checkForUpdates).toHaveBeenCalled();
  });

  it.skip('should handle check for updates errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.checkForUpdates as jest.Mock).mockRejectedValue(new Error('Check failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    let hasUpdate: boolean = false;
    await act(async () => {
      hasUpdate = await result.current.checkForUpdates();
    });

    expect(hasUpdate).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to check for updates:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should clear cache and update status', async () => {
    (serviceWorkerManager.clearCache as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useServiceWorker());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.clearCache();
    });

    expect(success).toBe(true);
    expect(serviceWorkerManager.clearCache).toHaveBeenCalled();
    expect(serviceWorkerManager.getCacheStatus).toHaveBeenCalledTimes(2); // Initial + after clear
    expect(serviceWorkerManager.isOfflineReady).toHaveBeenCalledTimes(2); // Initial + after clear
  });

  it.skip('should handle clear cache errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.clearCache as jest.Mock).mockRejectedValue(new Error('Clear failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.clearCache();
    });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to clear cache:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should cache crisis resource', async () => {
    (serviceWorkerManager.cacheCrisisResource as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useServiceWorker());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.cacheCrisisResource('/crisis-resources.json');
    });

    expect(success).toBe(true);
    expect(serviceWorkerManager.cacheCrisisResource).toHaveBeenCalledWith('/crisis-resources.json');
  });

  it.skip('should handle cache crisis resource errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.cacheCrisisResource as jest.Mock).mockRejectedValue(new Error('Cache failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.cacheCrisisResource('/crisis-resources.json');
    });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to cache crisis resource:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should precache crisis resources', async () => {
    (serviceWorkerManager.precacheCrisisResources as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useServiceWorker());
    
    await act(async () => {
      await result.current.precacheCrisisResources();
    });

    expect(serviceWorkerManager.precacheCrisisResources).toHaveBeenCalled();
  });

  it.skip('should handle precache crisis resources errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.precacheCrisisResources as jest.Mock).mockRejectedValue(new Error('Precache failed'));
    
    const { result } = renderHook(() => useServiceWorker());
    
    await act(async () => {
      await result.current.precacheCrisisResources();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to pre-cache crisis resources:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should force reload', async () => {
    const { result } = renderHook(() => useServiceWorker());
    
    result.current.forceReload();

    expect(serviceWorkerManager.forceReload).toHaveBeenCalled();
  });

  it.skip('should sync with service worker manager network status', async () => {
    (serviceWorkerManager.getNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: false
    });

    const { result } = renderHook(() => useServiceWorker());
    
    // Should update to match service worker manager status
    expect(result.current.isOnline).toBe(false);
  });
});

describe('useOfflineStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (navigator as any).onLine = true;
  });

  it.skip('should initialize with navigator online status', async () => {
    const { result } = renderHook(() => useOfflineStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it.skip('should register event listeners', async () => {
    renderHook(() => useOfflineStatus());
    
    expect(serviceWorkerManager.onOnline).toHaveBeenCalled();
    expect(serviceWorkerManager.onOffline).toHaveBeenCalled();
  });

  it.skip('should remove event listeners on unmount', async () => {
    const { unmount } = renderHook(() => useOfflineStatus());
    
    unmount();
    
    expect(serviceWorkerManager.removeOnlineListener).toHaveBeenCalled();
    expect(serviceWorkerManager.removeOfflineListener).toHaveBeenCalled();
  });

  it.skip('should update status when going online', async () => {
    let onlineHandler: () => void;
    (serviceWorkerManager.onOnline as jest.Mock).mockImplementation((handler) => {
      onlineHandler = handler;
    });

    const { result } = renderHook(() => useOfflineStatus());
    
    act(() => {
      onlineHandler();
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it.skip('should update status when going offline', async () => {
    let offlineHandler: () => void;
    (serviceWorkerManager.onOffline as jest.Mock).mockImplementation((handler) => {
      offlineHandler = handler;
    });

    const { result } = renderHook(() => useOfflineStatus());
    
    act(() => {
      offlineHandler();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });
});

describe('useCacheManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockResolvedValue({
      totalSize: 1024,
      itemCount: 10,
      lastUpdated: Date.now()
    });
  });

  it.skip('should initialize with null cache status', async () => {
    const { result } = renderHook(() => useCacheManager());
    
    expect(result.current.cacheStatus).toBeNull();
    // Initially loading as it fetches cache status on mount
    expect(result.current.isLoading).toBe(true);
  });

  it.skip('should get cache status on mount', async () => {
    const mockStatus = {
      totalSize: 2048,
      itemCount: 20,
      lastUpdated: Date.now()
    };
    
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockResolvedValue(mockStatus);
    
    const { result } = renderHook(() => useCacheManager());
    
    await waitFor(() => {
      expect(result.current.cacheStatus).toEqual(mockStatus);
    });

    expect(serviceWorkerManager.getCacheStatus).toHaveBeenCalled();
  });

  it.skip('should show loading state during cache operations', async () => {
    (serviceWorkerManager.clearCache as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    
    const { result } = renderHook(() => useCacheManager());
    
    act(() => {
      result.current.clearCache();
    });

    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it.skip('should clear cache and update status', async () => {
    (serviceWorkerManager.clearCache as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useCacheManager());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.clearCache();
    });

    expect(success).toBe(true);
    expect(serviceWorkerManager.clearCache).toHaveBeenCalled();
  });

  it.skip('should handle clear cache errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.clearCache as jest.Mock).mockRejectedValue(new Error('Clear failed'));
    
    const { result } = renderHook(() => useCacheManager());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.clearCache();
    });

    expect(success).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to clear cache:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should cache crisis resource', async () => {
    (serviceWorkerManager.cacheCrisisResource as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useCacheManager());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.cacheCrisisResource('/test-resource.json');
    });

    expect(success).toBe(true);
    expect(serviceWorkerManager.cacheCrisisResource).toHaveBeenCalledWith('/test-resource.json');
  });

  it.skip('should handle cache crisis resource errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (serviceWorkerManager.cacheCrisisResource as jest.Mock).mockRejectedValue(new Error('Cache failed'));
    
    const { result } = renderHook(() => useCacheManager());
    
    let success: boolean = false;
    await act(async () => {
      success = await result.current.cacheCrisisResource('/test-resource.json');
    });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to cache crisis resource:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it.skip('should update cache status manually', async () => {
    const { result } = renderHook(() => useCacheManager());
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Clear mock to count only manual calls
    (serviceWorkerManager.getCacheStatus as jest.Mock).mockClear();
    
    await act(async () => {
      await result.current.updateCacheStatus();
    });

    expect(serviceWorkerManager.getCacheStatus).toHaveBeenCalledTimes(1); // Only manual call
  });
});
