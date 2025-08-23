/**
 * Astral Core Service Worker Template
 * 
 * This service worker provides comprehensive offline functionality for a mental health
 * support platform with special emphasis on crisis intervention capabilities.
 * 
 * Key Features:
 * - Crisis resources always available offline
 * - Background sync for critical user actions
 * - Intelligent caching strategies
 * - Performance optimization
 * - Privacy protection
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Service Worker Version and Configuration
const SW_VERSION = '1.0.0';
const CACHE_PREFIX = 'astral-core';
const CRISIS_MODE_ENABLED = true;

// Cache Names
const CACHE_NAMES = {
  CRITICAL: `${CACHE_PREFIX}-critical-v1`,
  API: `${CACHE_PREFIX}-api-v1`, 
  COMMUNITY: `${CACHE_PREFIX}-community-v1`,
  CRISIS: `${CACHE_PREFIX}-crisis-v1`,
  IMAGES: `${CACHE_PREFIX}-images-v1`,
  FONTS: `${CACHE_PREFIX}-fonts-v1`
};

// Crisis Resources (Always Available Offline)
const CRISIS_RESOURCES = [
  '/crisis',
  '/emergency',
  '/safety-plan',
  '/crisis-resources.json',
  '/offline-coping-strategies.json',
  '/emergency-contacts.json'
];

// Background Sync Queues
const bgSyncQueues = {
  crisis: new BackgroundSync('crisis-reports', {
    maxRetentionTime: 24 * 60 // 24 hours
  }),
  wellness: new BackgroundSync('wellness-data', {
    maxRetentionTime: 7 * 24 * 60 // 7 days
  }),
  community: new BackgroundSync('community-actions', {
    maxRetentionTime: 3 * 24 * 60 // 3 days
  })
};

// Workbox Precaching (injected by build process)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

/* =================================
   CRISIS INTERVENTION FEATURES
   ================================= */

// Ensure crisis resources are always cached
self.addEventListener('install', (event) => {
  // Installing service worker
  
  event.waitUntil(
    Promise.all([
      // Precache critical crisis resources
      caches.open(CACHE_NAMES.CRISIS).then(cache => {
        return cache.addAll(CRISIS_RESOURCES.map(url => new Request(url, {
          cache: 'reload' // Always fetch fresh copies
        })));
      }),
      
      // Precache offline fallback pages
      caches.open(CACHE_NAMES.CRITICAL).then(cache => {
        return cache.addAll([
          '/offline.html',
          '/offline-crisis.html'
        ]);
      })
    ])
  );
  
  // Skip waiting in development, but be careful in production
  if (process.env.NODE_ENV === 'development') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  // Activating service worker
  
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      self.clients.claim(),
      
      // Clean up old caches
      cleanupOldCaches(),
      
      // Initialize crisis mode if needed
      initializeCrisisMode(),
      
      // Update crisis resources
      updateCrisisResources()
    ])
  );
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith(CACHE_PREFIX) && !Object.values(CACHE_NAMES).includes(name)
  );
  
  return Promise.all(
    oldCaches.map(name => caches.delete(name))
  );
}

async function initializeCrisisMode() {
  if (!CRISIS_MODE_ENABLED) return;
  
  // Ensure crisis cache is always available
  const crisisCache = await caches.open(CACHE_NAMES.CRISIS);
  const cachedRequests = await crisisCache.keys();
  
  if (cachedRequests.length === 0) {
    // Initializing crisis mode - caching resources
    await crisisCache.addAll(CRISIS_RESOURCES);
  }
}

async function updateCrisisResources() {
  try {
    const crisisCache = await caches.open(CACHE_NAMES.CRISIS);
    
    // Update crisis resources daily
    const promises = CRISIS_RESOURCES.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) {
          await crisisCache.put(url, response);
        }
      } catch (error) {
        console.warn(`[SW] Failed to update crisis resource: ${url}`, error);
      }
    });
    
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('[SW] Failed to update crisis resources', error);
  }
}

/* =================================
   ROUTING AND CACHING STRATEGIES
   ================================= */

// API Routes - Network First with Background Sync
registerRoute(
  ({ url }) => url.pathname.startsWith('/.netlify/functions/'),
  async ({ request, event }) => {
    const strategy = new NetworkFirst({
      cacheName: CACHE_NAMES.API,
      networkTimeoutSeconds: 10,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 5 * 60, // 5 minutes
          purgeOnQuotaError: true
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    });
    
    try {
      return await strategy.handle({ request, event });
    } catch (error) {
      console.error('[SW] API request failed:', error);
      
      // Handle failed API calls with background sync
      await handleFailedApiCall(request, event);
      
      // Return cached response or offline fallback
      const cachedResponse = await getCachedApiResponse(request);
      return cachedResponse || createOfflineApiResponse(request);
    }
  }
);

// Crisis Routes - Cache First (Always Available)
registerRoute(
  ({ url }) => CRISIS_RESOURCES.some(resource => url.pathname.includes(resource.replace('/', ''))),
  new CacheFirst({
    cacheName: CACHE_NAMES.CRISIS,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Community Content - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.includes('/community') || url.pathname.includes('/dilemmas'),
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.COMMUNITY,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 15 * 60, // 15 minutes
      })
    ]
  })
);

// Images - Cache First with Size Management
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Navigation Fallback
const navigationRoute = new NavigationRoute(
  async ({ event }) => {
    const request = event.request;
    
    try {
      // Try network first for navigation
      return await fetch(request);
    } catch (error) {
      console.warn('[SW] Navigation request failed, serving offline fallback:', error);
      
      // Check if it's a crisis-related route
      if (CRISIS_RESOURCES.some(resource => request.url.includes(resource))) {
        return caches.match('/offline-crisis.html') || caches.match('/offline.html');
      }
      
      // Default offline fallback
      return caches.match('/offline.html');
    }
  },
  {
    allowlist: [/^(?!\/__).*/], // Exclude service worker and API routes
    denylist: [/\/_/, /\/api/, /\.netlify/]
  }
);

registerRoute(navigationRoute);

/* =================================
   BACKGROUND SYNC FUNCTIONALITY
   ================================= */

async function handleFailedApiCall(request, event) {
  const url = new URL(request.url);
  const functionName = url.pathname.split('/').pop();
  
  // Determine sync queue based on function type
  let queue;
  if (functionName.includes('crisis') || functionName.includes('emergency')) {
    queue = bgSyncQueues.crisis;
  } else if (functionName.includes('wellness') || functionName.includes('mood')) {
    queue = bgSyncQueues.wellness;
  } else {
    queue = bgSyncQueues.community;
  }
  
  // Add to background sync queue
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const requestData = await request.clone().json();
      await queue.pushIntoQueue({
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: JSON.stringify(requestData)
        },
        timestamp: Date.now(),
        retryCount: 0
      });
    } catch (error) {
      console.error('[SW] Failed to queue request for background sync', error);
    }
  }
}

async function getCachedApiResponse(request) {
  const cache = await caches.open(CACHE_NAMES.API);
  return cache.match(request);
}

function createOfflineApiResponse(request) {
  const url = new URL(request.url);
  
  // Create appropriate offline responses based on endpoint
  if (url.pathname.includes('/wellness')) {
    return new Response(JSON.stringify({
      success: false,
      offline: true,
      message: 'Your data will be synced when you\'re back online',
      timestamp: Date.now()
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    error: 'Offline - data will sync when connection is restored',
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/* =================================
   MESSAGE HANDLING & COMMUNICATION
   ================================= */

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: SW_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      clearSpecificCache(payload.cacheName)
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ success: false, error }));
      break;
      
    case 'CACHE_CRISIS_RESOURCE':
      cacheCrisisResource(payload.url)
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ success: false, error }));
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus()
        .then(status => event.ports[0].postMessage({ status }))
        .catch(error => event.ports[0].postMessage({ error }));
      break;
      
    default:
      console.warn('[SW] Unknown message type:', type);
  }
});

async function clearSpecificCache(cacheName) {
  if (cacheName === CACHE_NAMES.CRISIS) {
    throw new Error('Cannot clear crisis cache - it contains essential safety resources');
  }
  
  return caches.delete(cacheName);
}

async function cacheCrisisResource(url) {
  const crisisCache = await caches.open(CACHE_NAMES.CRISIS);
  const response = await fetch(url);
  
  if (response.ok) {
    await crisisCache.put(url, response);
  }
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    if (name.startsWith(CACHE_PREFIX)) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      status[name] = {
        count: keys.length,
        size: await calculateCacheSize(cache)
      };
    }
  }
  
  return status;
}

async function calculateCacheSize(cache) {
  const keys = await cache.keys();
  let totalSize = 0;
  
  for (const key of keys) {
    try {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    } catch (error) {
      console.warn('[SW] Failed to calculate size for cached response:', error);
      // Skip errored responses - continue with calculation
    }
  }
  
  return totalSize;
}

/* =================================
   PERFORMANCE MONITORING
   ================================= */

self.addEventListener('fetch', (event) => {
  // Track performance metrics for critical resources
  if (event.request.url.includes('/crisis') || event.request.url.includes('/emergency')) {
    const startTime = performance.now();
    
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          const endTime = performance.now();
          
          // Log performance for crisis resources
          // Crisis resource loaded successfully
          
          return response;
        } catch (error) {
          console.warn('[SW] Failed to fetch crisis resource, serving from cache:', error);
          
          const cachedResponse = await caches.match(event.request);
          const endTime = performance.now();
          
          // Crisis resource served from cache
          
          return cachedResponse || new Response('Crisis resource unavailable', { status: 503 });
        }
      })()
    );
  }
});

/* =================================
   ERROR HANDLING & LOGGING
   ================================= */

self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker Error:', event.error);
  
  // Send error to main thread if possible
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_ERROR',
        error: event.error.message,
        timestamp: Date.now()
      });
    });
  });
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled Promise Rejection:', event.reason);
  
  // Prevent the default handling
  event.preventDefault();
});

// Heartbeat mechanism for monitoring service worker health
setInterval(() => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_HEARTBEAT',
        version: SW_VERSION,
        timestamp: Date.now()
      });
    });
  });
}, 60000); // Every minute

// Service worker initialized
