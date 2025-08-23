/**
 * Intelligent Caching Client Integration
 * 
 * React hook and utilities for integrating with the intelligent
 * service worker caching system
 */

import { useEffect, useCallback, useState } from 'react';

// Type definitions
type CachePriority = 'crisis' | 'high' | 'medium' | 'low';

// Extended Navigator interface for connection API
type ExtendedNavigator = Navigator & {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
};

interface CacheStatus {
  caches: Array<{
    name: string;
    entryCount: number;
  }>;
  totalSize: number;
  userMetrics: any;
  session: any;
}

interface PrefetchOptions {
  priority?: CachePriority;
  timeout?: number;
  networkAware?: boolean;
}

/**
 * Hook for intelligent caching integration
 */
export const useIntelligentCaching = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeStartTime, setRouteStartTime] = useState<number>(Date.now());

  // Service worker communication
  const sendMessage = useCallback((type: string, data?: any) => {
    if (!navigator.serviceWorker.controller) {
      console.warn('[Intelligent Cache] Service worker not ready');
      return;
    }

    navigator.serviceWorker.controller.postMessage({ type, data });
  }, []);

  // Track route changes manually (since we don't have Next.js router)
  const trackRouteChange = useCallback((newRoute: string) => {
    const timeSpent = Date.now() - routeStartTime;
    
    // Send route change data to service worker
    sendMessage('ROUTE_CHANGE', {
      route: currentRoute,
      timeSpent,
      timestamp: Date.now()
    });

    setCurrentRoute(newRoute);
    setRouteStartTime(Date.now());
  }, [currentRoute, routeStartTime, sendMessage]);

  // Initialize service worker integration
  useEffect(() => {
    const initializeServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Check if any service worker is registered first
          const registration = await navigator.serviceWorker.getRegistration();
          setIsServiceWorkerReady(!!registration?.active);
          
          // Setup message listener
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_STATUS') {
              setCacheStatus(event.data.data);
            }
          });

          console.log('[Intelligent Cache] Service worker integration ready');
        } catch (error) {
          console.error('[Intelligent Cache] Service worker initialization failed:', error);
        }
      }
    };

    initializeServiceWorker();
  }, []);

  // Check network capabilities safely
  const getNetworkCapabilities = useCallback(() => {
    const nav = navigator as ExtendedNavigator;
    if (!nav.connection) {
      return { isSlowNetwork: false, effectiveType: '4g' };
    }

    const effectiveType = nav.connection.effectiveType;
    return {
      isSlowNetwork: effectiveType === 'slow-2g' || effectiveType === '2g',
      effectiveType
    };
  }, []);

  // Manual prefetch function
  const prefetchResource = useCallback(async (
    url: string, 
    options: PrefetchOptions = {}
  ) => {
    const {
      priority = 'medium',
      timeout = 10000,
      networkAware = true
    } = options;

    try {
      // Check network conditions if enabled
      if (networkAware) {
        const { isSlowNetwork } = getNetworkCapabilities();
        if (isSlowNetwork && priority !== 'crisis') {
          console.log('[Prefetch] Skipping due to slow network:', url);
          return false;
        }
      }

      // Create fetch options with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'X-Prefetch': 'true',
          'X-Priority': priority
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[Prefetch] Failed with status:', response.status, url);
        return false;
      }
      
      console.log('[Prefetch] Successfully prefetched:', url);
      return true;
    } catch (error) {
      console.warn('[Prefetch] Error:', error, url);
      return false;
    }
  }, [getNetworkCapabilities]);

  // Crisis detection and immediate caching
  const reportCrisisDetection = useCallback(() => {
    sendMessage('CRISIS_DETECTED', {
      timestamp: Date.now(),
      route: currentRoute,
      userAgent: navigator.userAgent
    });
    
    console.log('[Intelligent Cache] Crisis detection reported');
  }, [currentRoute, sendMessage]);

  // Update user preferences for caching optimization
  const updatePreferences = useCallback((preferences: Record<string, any>) => {
    sendMessage('USER_PREFERENCES_UPDATED', {
      preferences,
      timestamp: Date.now()
    });
    
    console.log('[Intelligent Cache] Preferences updated:', preferences);
  }, [sendMessage]);

  // Get current cache status
  const getCacheStatus = useCallback(async () => {
    if (!isServiceWorkerReady) {
      return null;
    }

    return new Promise<CacheStatus | null>((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATUS') {
          resolve(event.data.data);
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [channel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }, [isServiceWorkerReady]);

  // Helper function to prefetch multiple resources
  const prefetchMultipleResources = useCallback(async (
    urls: string[], 
    options: PrefetchOptions = {}
  ) => {
    const prefetchPromises = urls.map(url => prefetchResource(url, options));
    const results = await Promise.all(prefetchPromises);
    return results.filter(success => success).length;
  }, [prefetchResource]);

  // Preload critical resources for current user
  const preloadUserResources = useCallback(async (userId: string) => {
    const userResources = [
      `/api/users/${userId}/profile`,
      `/api/users/${userId}/preferences`,
      `/api/users/${userId}/mood-history`,
      `/api/users/${userId}/journal-entries`
    ];

    const successCount = await prefetchMultipleResources(userResources, { priority: 'high' });
    console.log(`[User Preload] Loaded ${successCount}/${userResources.length} resources`);
    
    return successCount;
  }, [prefetchMultipleResources]);

  // Intelligent image preloading
  const preloadImages = useCallback(async (imageUrls: string[]) => {
    const { isSlowNetwork } = getNetworkCapabilities();
    
    if (isSlowNetwork) {
      console.log('[Image Preload] Skipping due to network conditions');
      return 0;
    }

    const successCount = await prefetchMultipleResources(imageUrls, { 
      priority: 'low',
      networkAware: true 
    });

    console.log(`[Image Preload] Loaded ${successCount}/${imageUrls.length} images`);
    return successCount;
  }, [getNetworkCapabilities, prefetchMultipleResources]);

  return {
    // State
    isServiceWorkerReady,
    cacheStatus,
    currentRoute,
    
    // Actions
    prefetchResource,
    reportCrisisDetection,
    updatePreferences,
    getCacheStatus,
    preloadUserResources,
    preloadImages,
    trackRouteChange,
    
    // Utilities
    sendMessage,
    getNetworkCapabilities
  };
};

/**
 * React component for cache status monitoring
 */
export const CacheStatusMonitor: React.FC<{
  onStatusChange?: (status: CacheStatus) => void;
}> = ({ onStatusChange }) => {
  const { getCacheStatus, cacheStatus } = useIntelligentCaching();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = async () => {
      const status = await getCacheStatus();
      if (status) {
        setLastUpdate(new Date());
        onStatusChange?.(status);
      }
    };

    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    updateStatus(); // Initial update

    return () => clearInterval(interval);
  }, [getCacheStatus, onStatusChange]);

  if (!cacheStatus) {
    return null;
  }

  return (
    <div className="cache-status-monitor">
      <h4>Cache Status</h4>
      <div className="cache-metrics">
        <div>Total Caches: {cacheStatus.caches.length}</div>
        <div>
          Total Entries: {cacheStatus.caches.reduce((sum, cache) => sum + cache.entryCount, 0)}
        </div>
        {lastUpdate && (
          <div>Last Updated: {lastUpdate.toLocaleTimeString()}</div>
        )}
      </div>
      
      <div className="cache-details">
        {cacheStatus.caches.map(cache => (
          <div key={cache.name} className="cache-item">
            <span className="cache-name">{cache.name}</span>
            <span className="cache-count">{cache.entryCount} entries</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Helper function to prefetch resources with reduced nesting
 */
const prefetchResourceList = async (
  resources: string[],
  prefetchFn: (url: string, options?: PrefetchOptions) => Promise<boolean>,
  priority?: CachePriority
) => {
  const prefetchPromises = resources.map(url => prefetchFn(url, { priority }));
  const results = await Promise.all(prefetchPromises);
  return results.filter(success => success).length;
};

/**
 * Higher-order component for automatic resource prefetching
 */
export const withIntelligentPrefetch = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  prefetchConfig: {
    resources?: string[];
    images?: string[];
    priority?: CachePriority;
  } = {}
) => {
  return (props: P) => {
    const { prefetchResource, preloadImages } = useIntelligentCaching();

    useEffect(() => {
      const prefetchResources = async () => {
        // Prefetch specified resources
        if (prefetchConfig.resources) {
          await prefetchResourceList(
            prefetchConfig.resources,
            prefetchResource,
            prefetchConfig.priority
          );
        }

        // Prefetch images
        if (prefetchConfig.images) {
          await preloadImages(prefetchConfig.images);
        }
      };

      prefetchResources();
    }, [prefetchResource, preloadImages]);

    return <WrappedComponent {...props} />;
  };
};

/**
 * Hook for crisis scenario optimization
 */
export const useCrisisOptimization = () => {
  const { reportCrisisDetection, prefetchResource } = useIntelligentCaching();

  const triggerCrisisMode = useCallback(async () => {
    console.log('[Crisis Mode] Activating crisis optimization...');
    
    // Report to service worker
    reportCrisisDetection();
    
    // Immediately prefetch critical crisis resources
    const crisisResources = [
      '/crisis-resources.json',
      '/emergency-contacts.json',
      '/offline-crisis.html',
      '/api/crisis/immediate-help'
    ];

    const successCount = await prefetchResourceList(
      crisisResources,
      prefetchResource,
      'crisis'
    );

    console.log(`[Crisis Mode] Cached ${successCount}/${crisisResources.length} critical resources`);
    return successCount === crisisResources.length;
  }, [reportCrisisDetection, prefetchResource]);

  return { triggerCrisisMode };
};

/**
 * Utility function to register service worker with intelligent features
 */
export const registerIntelligentServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Intelligent Cache] Service workers not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-enhanced.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('[Intelligent Cache] Service worker registered:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available, notify user
            console.log('[Intelligent Cache] New version available');
            // Could trigger a notification here
          }
        });
      }
    });

    return true;
  } catch (error) {
    console.error('[Intelligent Cache] Service worker registration failed:', error);
    return false;
  }
};
