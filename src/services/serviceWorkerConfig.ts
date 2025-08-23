/**
 * Service Worker Configuration
 * Manages service worker registration with environment-specific settings
 */

interface ServiceWorkerOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onInstall?: () => void;
  onActivate?: () => void;
  onFetch?: () => void;
  onError?: () => void;
  onPerformance?: () => void;
  cacheStrategy?: string;
  staticAssets?: string[];
  apiEndpoints?: string[];
  dynamicContent?: string[];
  offlinePage?: string;
  offlineAssets?: string[];
  criticalResources?: string[];
  pushNotifications?: {
    enabled: boolean;
    vapidKey: string;
  };
  backgroundSync?: {
    enabled: boolean;
    tags: string[];
  };
  preloadResources?: string[];
  resourceHints?: {
    preconnect: string[];
    prefetch: string[];
  };
}

export const registerServiceWorker = async (options?: ServiceWorkerOptions) => {
  // Only register service worker in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ServiceWorker] Skipping registration in development mode');
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[ServiceWorker] Registration successful:', registration.scope);

      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess(registration);
      }

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Call update callback if provided
              if (options?.onUpdate) {
                options.onUpdate(registration);
              } else if (window.confirm('New version available! Reload to update?')) {
                // Default behavior
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
      return null;
    }
  }

  return null;
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('[ServiceWorker] Unregistered successfully');
      return true;
    } catch (error) {
      console.error('[ServiceWorker] Unregistration failed:', error);
      return false;
    }
  }
  return false;
};

// For development: clear any existing service workers that might cause issues
export const updateServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('[ServiceWorker] Update check completed');
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Update check failed:', error);
  }
};

export const clearServiceWorkersInDev = async () => {
  if (process.env.NODE_ENV === 'development') {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[ServiceWorker] Cleared development service worker');
      }
      
      // Also clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('[ServiceWorker] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
    }
  }
};