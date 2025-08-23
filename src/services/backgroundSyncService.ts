/**
 * Background Sync Service
 * 
 * Handles offline data synchronization using Background Sync API
 * with fallback to periodic sync for broader browser support
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Priority-based sync queue
 * - Crisis data priority synchronization
 * - Batch sync optimization
 * - Conflict resolution
 * 
 * @license Apache-2.0
 */

interface SyncRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  metadata?: {
    type: 'crisis-event' | 'safety-plan' | 'session-data' | 'analytics' | 'user-data';
    userId?: string;
    sessionId?: string;
  };
}

interface SyncResult {
  success: boolean;
  requestId: string;
  response?: any;
  error?: string;
  timestamp: number;
}

interface BackgroundSyncOptions {
  enablePeriodicSync?: boolean;
  syncInterval?: number; // milliseconds
  maxQueueSize?: number;
  enableBatching?: boolean;
  batchSize?: number;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncQueue: Map<string, SyncRequest> = new Map();
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private db: IDBDatabase | null = null;
  private readonly dbName = 'BackgroundSyncDB';
  private readonly dbVersion = 1;
  private syncListeners: Set<(result: SyncResult) => void> = new Set();
  private options: BackgroundSyncOptions;
  private periodicSyncInterval: number | null = null;

  private constructor(options: BackgroundSyncOptions = {}) {
    this.options = {
      enablePeriodicSync: true,
      syncInterval: 30000, // 30 seconds
      maxQueueSize: 100,
      enableBatching: true,
      batchSize: 10,
      conflictResolution: 'client-wins',
      ...options
    };
    this.initialize();
  }

  static getInstance(options?: BackgroundSyncOptions): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService(options);
    }
    return BackgroundSyncService.instance;
  }

  /**
   * Initialize the background sync service
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize IndexedDB for persistent queue storage
      await this.initializeDatabase();
      
      // Load existing sync queue from storage
      await this.loadQueueFromStorage();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      // Register service worker sync
      await this.registerBackgroundSync();
      
      // Setup periodic sync fallback
      if (this.options.enablePeriodicSync) {
        this.setupPeriodicSync();
      }
      
      console.log('[BackgroundSync] Service initialized');
    } catch (error) {
      console.error('[BackgroundSync] Initialization failed:', error);
    }
  }

  /**
   * Initialize IndexedDB for persistent storage
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('[BackgroundSync] Failed to open database');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[BackgroundSync] Database opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', ['metadata', 'type'], { unique: false });
        }
        
        // Create sync results store
        if (!db.objectStoreNames.contains('syncResults')) {
          const store = db.createObjectStore('syncResults', { keyPath: 'requestId' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Load existing sync queue from storage
   */
  private async loadQueueFromStorage(): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const items = request.result as SyncRequest[];
          items.forEach(item => {
            this.syncQueue.set(item.id, item);
          });
          console.log(`[BackgroundSync] Loaded ${items.length} queued items`);
          resolve();
        };
        
        request.onerror = () => {
          console.error('[BackgroundSync] Failed to load queue');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('[BackgroundSync] Error loading queue:', error);
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('[BackgroundSync] Network online, triggering sync');
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      console.log('[BackgroundSync] Network offline');
      this.isOnline = false;
    });
  }

  /**
   * Register background sync with service worker
   */
  private async registerBackgroundSync(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      console.warn('[BackgroundSync] Background Sync API not supported');
      return;
    }
    
    try {
      await navigator.serviceWorker.ready;
      
      // Listen for sync messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'sync-complete') {
          this.handleSyncComplete(event.data.results);
        }
      });
      
      console.log('[BackgroundSync] Registered with service worker');
    } catch (error) {
      console.error('[BackgroundSync] Service worker registration failed:', error);
    }
  }

  /**
   * Setup periodic sync fallback
   */
  private setupPeriodicSync(): void {
    // Clear existing interval if any
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
    }
    
    // Setup periodic sync
    this.periodicSyncInterval = window.setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        console.log('[BackgroundSync] Periodic sync triggered');
        this.processSyncQueue();
      }
    }, this.options.syncInterval!);
  }

  /**
   * Add a request to the sync queue
   */
  async addToQueue(request: Omit<SyncRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    // Check queue size limit
    if (this.syncQueue.size >= this.options.maxQueueSize!) {
      console.warn('[BackgroundSync] Queue size limit reached, removing oldest items');
      await this.pruneQueue();
    }
    
    const syncRequest: SyncRequest = {
      ...request,
      id: this.generateRequestId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: request.maxRetries || 3
    };
    
    // Add to queue
    this.syncQueue.set(syncRequest.id, syncRequest);
    
    // Persist to storage
    await this.persistRequest(syncRequest);
    
    // Trigger sync if online
    if (this.isOnline) {
      this.triggerSync();
    }
    
    console.log(`[BackgroundSync] Added request ${syncRequest.id} to queue`);
    return syncRequest.id;
  }

  /**
   * Persist sync request to storage
   */
  private async persistRequest(request: SyncRequest): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await store.put(request);
    } catch (error) {
      console.error('[BackgroundSync] Failed to persist request:', error);
    }
  }

  /**
   * Remove request from storage
   */
  private async removeFromStorage(requestId: string): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await store.delete(requestId);
    } catch (error) {
      console.error('[BackgroundSync] Failed to remove from storage:', error);
    }
  }

  /**
   * Trigger background sync
   */
  async triggerSync(): Promise<void> {
    if (!this.isOnline || this.isSyncing || this.syncQueue.size === 0) {
      return;
    }
    
    // Try to use Background Sync API
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('data-sync');
        console.log('[BackgroundSync] Background sync registered');
        return;
      } catch (error) {
        console.warn('[BackgroundSync] Failed to register background sync:', error);
      }
    }
    
    // Fallback to direct processing
    await this.processSyncQueue();
  }

  /**
   * Process the sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    console.log(`[BackgroundSync] Processing ${this.syncQueue.size} queued requests`);
    
    // Sort queue by priority and timestamp
    const sortedQueue = Array.from(this.syncQueue.values()).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
    
    // Process in batches if enabled
    const batchSize = this.options.enableBatching ? this.options.batchSize! : sortedQueue.length;
    
    for (let i = 0; i < sortedQueue.length; i += batchSize) {
      const batch = sortedQueue.slice(i, i + batchSize);
      
      if (this.options.enableBatching && batch.length > 1) {
        await this.processBatch(batch);
      } else {
        for (const request of batch) {
          await this.processRequest(request);
        }
      }
      
      // Break if offline
      if (!this.isOnline) {
        console.log('[BackgroundSync] Network offline, stopping sync');
        break;
      }
    }
    
    this.isSyncing = false;
    console.log('[BackgroundSync] Queue processing complete');
  }

  /**
   * Process a single sync request
   */
  private async processRequest(request: SyncRequest): Promise<void> {
    try {
      console.log(`[BackgroundSync] Processing request ${request.id}`);
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Request-Id': request.id,
          'X-Sync-Timestamp': request.timestamp.toString(),
          ...request.headers
        }
      };
      
      if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        fetchOptions.body = JSON.stringify(request.body);
      }
      
      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      fetchOptions.signal = controller.signal;
      
      const response = await fetch(request.url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        
        // Success - remove from queue
        this.syncQueue.delete(request.id);
        await this.removeFromStorage(request.id);
        
        // Notify listeners
        const result: SyncResult = {
          success: true,
          requestId: request.id,
          response: responseData,
          timestamp: Date.now()
        };
        
        await this.saveSyncResult(result);
        this.notifySyncListeners(result);
        
        console.log(`[BackgroundSync] Request ${request.id} synced successfully`);
      } else {
        // Server error - handle based on status
        await this.handleSyncError(request, `Server error: ${response.status}`);
      }
    } catch (error) {
      // Network or other error
      await this.handleSyncError(request, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Process a batch of requests
   */
  private async processBatch(batch: SyncRequest[]): Promise<void> {
    console.log(`[BackgroundSync] Processing batch of ${batch.length} requests`);
    
    try {
      const batchRequest = {
        requests: batch.map(req => ({
          id: req.id,
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: req.body,
          metadata: req.metadata
        }))
      };
      
      const response = await fetch('/api/batch-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Batch-Sync': 'true'
        },
        body: JSON.stringify(batchRequest)
      });
      
      if (response.ok) {
        const results = await response.json();
        
        // Process batch results
        for (const result of results.results) {
          const request = batch.find(r => r.id === result.id);
          if (request) {
            if (result.success) {
              this.syncQueue.delete(request.id);
              await this.removeFromStorage(request.id);
              
              const syncResult: SyncResult = {
                success: true,
                requestId: request.id,
                response: result.response,
                timestamp: Date.now()
              };
              
              await this.saveSyncResult(syncResult);
              this.notifySyncListeners(syncResult);
            } else {
              await this.handleSyncError(request, result.error);
            }
          }
        }
      } else {
        // Batch failed - process individually
        console.warn('[BackgroundSync] Batch sync failed, processing individually');
        for (const request of batch) {
          await this.processRequest(request);
        }
      }
    } catch (error) {
      console.error('[BackgroundSync] Batch processing error:', error);
      // Process individually on batch error
      for (const request of batch) {
        await this.processRequest(request);
      }
    }
  }

  /**
   * Handle sync error with retry logic
   */
  private async handleSyncError(request: SyncRequest, error: string): Promise<void> {
    console.error(`[BackgroundSync] Request ${request.id} failed:`, error);
    
    request.retryCount++;
    
    if (request.retryCount >= request.maxRetries) {
      // Max retries reached - remove from queue
      console.error(`[BackgroundSync] Request ${request.id} max retries reached, removing from queue`);
      
      this.syncQueue.delete(request.id);
      await this.removeFromStorage(request.id);
      
      // Notify failure
      const result: SyncResult = {
        success: false,
        requestId: request.id,
        error: `Failed after ${request.maxRetries} retries: ${error}`,
        timestamp: Date.now()
      };
      
      await this.saveSyncResult(result);
      this.notifySyncListeners(result);
    } else {
      // Update retry count and persist
      this.syncQueue.set(request.id, request);
      await this.persistRequest(request);
      
      // Schedule retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, request.retryCount), 60000); // Max 1 minute
      console.log(`[BackgroundSync] Request ${request.id} will retry in ${delay}ms`);
      
      setTimeout(() => {
        if (this.isOnline) {
          this.processRequest(request);
        }
      }, delay);
    }
  }

  /**
   * Save sync result to storage
   */
  private async saveSyncResult(result: SyncResult): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['syncResults'], 'readwrite');
      const store = transaction.objectStore('syncResults');
      await store.put(result);
    } catch (error) {
      console.error('[BackgroundSync] Failed to save result:', error);
    }
  }

  /**
   * Handle sync complete message from service worker
   */
  private handleSyncComplete(results: SyncResult[]): void {
    results.forEach(result => {
      if (result.success) {
        this.syncQueue.delete(result.requestId);
        this.removeFromStorage(result.requestId);
      }
      this.notifySyncListeners(result);
    });
  }

  /**
   * Notify sync listeners
   */
  private notifySyncListeners(result: SyncResult): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('[BackgroundSync] Listener error:', error);
      }
    });
  }

  /**
   * Prune old items from queue
   */
  private async pruneQueue(): Promise<void> {
    const sortedQueue = Array.from(this.syncQueue.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const itemsToRemove = sortedQueue.slice(0, 10); // Remove oldest 10 items
    
    for (const item of itemsToRemove) {
      this.syncQueue.delete(item.id);
      await this.removeFromStorage(item.id);
    }
    
    console.log(`[BackgroundSync] Pruned ${itemsToRemove.length} old items from queue`);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public API Methods
   */

  /**
   * Check if a request is in the queue
   */
  isQueued(requestId: string): boolean {
    return this.syncQueue.has(requestId);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.syncQueue.size;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    size: number;
    isOnline: boolean;
    isSyncing: boolean;
    requests: Array<{
      id: string;
      priority: string;
      retryCount: number;
      timestamp: number;
    }>;
  } {
    return {
      size: this.syncQueue.size,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      requests: Array.from(this.syncQueue.values()).map(r => ({
        id: r.id,
        priority: r.priority,
        retryCount: r.retryCount,
        timestamp: r.timestamp
      }))
    };
  }

  /**
   * Clear the sync queue
   */
  async clearQueue(): Promise<void> {
    this.syncQueue.clear();
    
    if (this.db) {
      try {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        await store.clear();
        console.log('[BackgroundSync] Queue cleared');
      } catch (error) {
        console.error('[BackgroundSync] Failed to clear queue:', error);
      }
    }
  }

  /**
   * Add sync listener
   */
  addSyncListener(listener: (result: SyncResult) => void): void {
    this.syncListeners.add(listener);
  }

  /**
   * Remove sync listener
   */
  removeSyncListener(listener: (result: SyncResult) => void): void {
    this.syncListeners.delete(listener);
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    console.log('[BackgroundSync] Force sync triggered');
    await this.processSyncQueue();
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit = 50): Promise<SyncResult[]> {
    if (!this.db) return [];
    
    try {
      const transaction = this.db.transaction(['syncResults'], 'readonly');
      const store = transaction.objectStore('syncResults');
      const index = store.index('timestamp');
      
      return new Promise((resolve, reject) => {
        const results: SyncResult[] = [];
        const request = index.openCursor(null, 'prev');
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        
        request.onerror = () => {
          console.error('[BackgroundSync] Failed to get history');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('[BackgroundSync] Error getting history:', error);
      return [];
    }
  }

  /**
   * Cleanup old sync results
   */
  async cleanupOldResults(daysToKeep = 7): Promise<void> {
    if (!this.db) return;
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    try {
      const transaction = this.db.transaction(['syncResults'], 'readwrite');
      const store = transaction.objectStore('syncResults');
      const index = store.index('timestamp');
      
      const request = index.openCursor();
      let deletedCount = 0;
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value.timestamp < cutoffTime) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          console.log(`[BackgroundSync] Cleaned up ${deletedCount} old results`);
        }
      };
    } catch (error) {
      console.error('[BackgroundSync] Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const backgroundSyncService = BackgroundSyncService.getInstance();

// Export types
export type { SyncRequest, SyncResult, BackgroundSyncOptions };