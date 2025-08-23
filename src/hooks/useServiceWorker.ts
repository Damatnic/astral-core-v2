/**
 * Service Worker React Hook
 * 
 * Provides React components with service worker functionality,
 * offline status, cache management, and update notifications.
 */

import { useState, useEffect, useCallback } from 'react';
import serviceWorkerManager, { CacheStatus } from '../services/serviceWorkerManager';

interface UseServiceWorkerReturn {
  isOnline: boolean;
  isOfflineReady: boolean;
  updateAvailable: boolean;
  cacheStatus: CacheStatus | null;
  skipWaiting: () => Promise<void>;
  checkForUpdates: () => Promise<boolean>;
  clearCache: () => Promise<boolean>;
  cacheCrisisResource: (url: string) => Promise<boolean>;
  precacheCrisisResources: () => Promise<void>;
  forceReload: () => void;
}

/**
 * Custom hook for service worker functionality
 */
export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);

  // Update online status
  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Handle service worker updates
  const handleUpdateAvailable = useCallback(() => {
    setUpdateAvailable(true);
  }, []);

  // Check if app is ready for offline use
  const checkOfflineReadiness = useCallback(async () => {
    try {
      const ready = await serviceWorkerManager.isOfflineReady();
      setIsOfflineReady(ready);
    } catch (error) {
      console.error('Failed to check offline readiness:', error);
      setIsOfflineReady(false);
    }
  }, []);

  // Get current cache status
  const updateCacheStatus = useCallback(async () => {
    try {
      const status = await serviceWorkerManager.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to get cache status:', error);
    }
  }, []);

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback(async () => {
    try {
      await serviceWorkerManager.skipWaiting();
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Failed to skip waiting:', error);
    }
  }, []);

  // Check for service worker updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      const hasUpdate = await serviceWorkerManager.checkForUpdates();
      await updateCacheStatus();
      return hasUpdate;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }, [updateCacheStatus]);

  // Clear all caches
  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      const success = await serviceWorkerManager.clearCache();
      if (success) {
        await updateCacheStatus();
        await checkOfflineReadiness();
      }
      return success;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }, [updateCacheStatus, checkOfflineReadiness]);

  // Cache a specific crisis resource
  const cacheCrisisResource = useCallback(async (url: string): Promise<boolean> => {
    try {
      const success = await serviceWorkerManager.cacheCrisisResource(url);
      if (success) {
        await updateCacheStatus();
        await checkOfflineReadiness();
      }
      return success;
    } catch (error) {
      console.error('Failed to cache crisis resource:', error);
      return false;
    }
  }, [updateCacheStatus, checkOfflineReadiness]);

  // Pre-cache all crisis resources
  const precacheCrisisResources = useCallback(async (): Promise<void> => {
    try {
      await serviceWorkerManager.precacheCrisisResources();
      await updateCacheStatus();
      await checkOfflineReadiness();
    } catch (error) {
      console.error('Failed to pre-cache crisis resources:', error);
    }
  }, [updateCacheStatus, checkOfflineReadiness]);

  // Force reload with new service worker
  const forceReload = useCallback(() => {
    serviceWorkerManager.forceReload();
  }, []);

  // Set up event listeners and initial checks
  useEffect(() => {
    // Register event listeners
    serviceWorkerManager.onOnline(handleOnline);
    serviceWorkerManager.onOffline(handleOffline);
    serviceWorkerManager.onUpdateAvailable(handleUpdateAvailable);

    // Initial checks
    updateCacheStatus();
    checkOfflineReadiness();

    // Cleanup
    return () => {
      serviceWorkerManager.removeOnlineListener(handleOnline);
      serviceWorkerManager.removeOfflineListener(handleOffline);
      serviceWorkerManager.removeUpdateListener(handleUpdateAvailable);
    };
  }, [handleOnline, handleOffline, handleUpdateAvailable, updateCacheStatus, checkOfflineReadiness]);

  // Update online status from service worker manager
  useEffect(() => {
    const currentStatus = serviceWorkerManager.getNetworkStatus();
    if (currentStatus.isOnline !== isOnline) {
      setIsOnline(currentStatus.isOnline);
    }
  }, [isOnline]);

  return {
    isOnline,
    isOfflineReady,
    updateAvailable,
    cacheStatus,
    skipWaiting,
    checkForUpdates,
    clearCache,
    cacheCrisisResource,
    precacheCrisisResources,
    forceReload
  };
};

/**
 * Offline Status Hook
 * Simplified hook for just checking online/offline status
 */
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    serviceWorkerManager.onOnline(handleOnline);
    serviceWorkerManager.onOffline(handleOffline);

    return () => {
      serviceWorkerManager.removeOnlineListener(handleOnline);
      serviceWorkerManager.removeOfflineListener(handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
};

/**
 * Cache Management Hook
 * Focused on cache operations
 */
export const useCacheManager = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateCacheStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await serviceWorkerManager.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to get cache status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await serviceWorkerManager.clearCache();
      if (success) {
        await updateCacheStatus();
      }
      return success;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateCacheStatus]);

  const cacheCrisisResource = useCallback(async (url: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await serviceWorkerManager.cacheCrisisResource(url);
      if (success) {
        await updateCacheStatus();
      }
      return success;
    } catch (error) {
      console.error('Failed to cache crisis resource:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateCacheStatus]);

  useEffect(() => {
    updateCacheStatus();
  }, [updateCacheStatus]);

  return {
    cacheStatus,
    isLoading,
    clearCache,
    cacheCrisisResource,
    updateCacheStatus
  };
};

export default useServiceWorker;
