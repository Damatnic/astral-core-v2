/**
 * Storage Service
 * Provides unified interface for browser storage with encryption support
 */

export interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}

export interface StorageOptions {
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
  storage?: 'local' | 'session';
}

class StorageService {
  private readonly prefix = 'astral_';
  
  /**
   * Set item in storage
   */
  public setItem(key: string, value: any, options: StorageOptions = {}): void {
    const { storage = 'local', ttl } = options;
    const storageApi = storage === 'session' ? sessionStorage : localStorage;
    
    const item: StorageItem = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined
    };
    
    try {
      storageApi.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error(`[Storage] Failed to set item ${key}:`, error);
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearExpiredItems();
        // Retry once after clearing expired items
        try {
          storageApi.setItem(this.prefix + key, JSON.stringify(item));
        } catch {
          throw new Error('Storage quota exceeded');
        }
      }
    }
  }
  
  /**
   * Get item from storage
   */
  public getItem(key: string, storage: 'local' | 'session' = 'local'): any {
    const storageApi = storage === 'session' ? sessionStorage : localStorage;
    
    try {
      const raw = storageApi.getItem(this.prefix + key);
      if (!raw) return null;
      
      const item: StorageItem = JSON.parse(raw);
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key, storage);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`[Storage] Failed to get item ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove item from storage
   */
  public removeItem(key: string, storage: 'local' | 'session' = 'local'): void {
    const storageApi = storage === 'session' ? sessionStorage : localStorage;
    storageApi.removeItem(this.prefix + key);
  }
  
  /**
   * Clear all items from storage
   */
  public clear(storage?: 'local' | 'session'): void {
    if (!storage || storage === 'local') {
      this.clearStorage(localStorage);
    }
    if (!storage || storage === 'session') {
      this.clearStorage(sessionStorage);
    }
  }
  
  /**
   * Clear storage with prefix
   */
  private clearStorage(storageApi: Storage): void {
    const keys = Object.keys(storageApi);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        storageApi.removeItem(key);
      }
    });
  }
  
  /**
   * Get all items from storage
   */
  public getAllItems(storage: 'local' | 'session' = 'local'): Record<string, any> {
    const storageApi = storage === 'session' ? sessionStorage : localStorage;
    const items: Record<string, any> = {};
    
    Object.keys(storageApi).forEach(key => {
      if (key.startsWith(this.prefix)) {
        const cleanKey = key.replace(this.prefix, '');
        const value = this.getItem(cleanKey, storage);
        if (value !== null) {
          items[cleanKey] = value;
        }
      }
    });
    
    return items;
  }
  
  /**
   * Clear expired items
   */
  public clearExpiredItems(): void {
    ['local', 'session'].forEach(storage => {
      const storageApi = storage === 'session' ? sessionStorage : localStorage;
      const keys = Object.keys(storageApi);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const raw = storageApi.getItem(key);
            if (raw) {
              const item: StorageItem = JSON.parse(raw);
              if (item.expiresAt && Date.now() > item.expiresAt) {
                storageApi.removeItem(key);
              }
            }
          } catch {
            // Remove corrupted items
            storageApi.removeItem(key);
          }
        }
      });
    });
  }
  
  /**
   * Get storage size in bytes
   */
  public getStorageSize(storage: 'local' | 'session' = 'local'): number {
    const storageApi = storage === 'session' ? sessionStorage : localStorage;
    let size = 0;
    
    Object.keys(storageApi).forEach(key => {
      if (key.startsWith(this.prefix)) {
        const value = storageApi.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    });
    
    return size * 2; // UTF-16 characters are 2 bytes each
  }
  
  /**
   * Check if storage is available
   */
  public isStorageAvailable(storage: 'local' | 'session' = 'local'): boolean {
    try {
      const storageApi = storage === 'session' ? sessionStorage : localStorage;
      const testKey = `${this.prefix}test`;
      storageApi.setItem(testKey, 'test');
      storageApi.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Migrate data between storage types
   */
  public migrateStorage(from: 'local' | 'session', to: 'local' | 'session'): void {
    const items = this.getAllItems(from);
    
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value, { storage: to });
      this.removeItem(key, from);
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default StorageService;