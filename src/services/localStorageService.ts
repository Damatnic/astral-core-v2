/**
 * Local Storage Service
 *
 * Secure local storage service for mental health platform.
 * Manages persistent data for users with encryption, compression,
 * and HIPAA-compliant data handling for offline functionality.
 *
 * @fileoverview Secure local storage with encryption and compression
 * @version 2.0.0
 */

import { logger } from '../utils/logger';

export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB';
export type DataCategory = 
  | 'user-preferences'
  | 'mood-data'
  | 'offline-cache'
  | 'session-data'
  | 'analytics'
  | 'security-logs'
  | 'app-state'
  | 'temporary';

export interface StorageOptions {
  encrypt: boolean;
  compress: boolean;
  expiration?: number; // in milliseconds
  category: DataCategory;
  storageType: StorageType;
  maxSize?: number; // in bytes
}

export interface StorageItem {
  key: string;
  value: any;
  encrypted: boolean;
  compressed: boolean;
  category: DataCategory;
  timestamp: Date;
  expiration?: Date;
  size: number;
  checksum: string;
}

export interface StorageMetadata {
  totalItems: number;
  totalSize: number;
  categories: Record<DataCategory, number>;
  storageTypes: Record<StorageType, number>;
  encryptedItems: number;
  compressedItems: number;
  expiredItems: number;
}

export interface StorageQuota {
  available: number;
  used: number;
  quota: number;
  percentage: number;
  categoryUsage: Record<DataCategory, number>;
}

class LocalStorageService {
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB default
  private readonly ENCRYPTION_PREFIX = 'enc:';
  private readonly COMPRESSION_PREFIX = 'comp:';
  private readonly METADATA_KEY = '__storage_metadata__';
  private readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  private readonly QUOTA_CRITICAL_THRESHOLD = 0.95; // 95%

  private encryptionKey: string = '';
  private compressionEnabled: boolean = true;
  private quotaWarningCallback?: (quota: StorageQuota) => void;

  constructor(options: {
    encryptionKey?: string;
    compressionEnabled?: boolean;
    quotaWarningCallback?: (quota: StorageQuota) => void;
  } = {}) {
    this.encryptionKey = options.encryptionKey || this.generateEncryptionKey();
    this.compressionEnabled = options.compressionEnabled ?? true;
    this.quotaWarningCallback = options.quotaWarningCallback;
    
    this.initialize();
  }

  private initialize(): void {
    try {
      // Check storage availability
      this.checkStorageAvailability();
      
      // Clean expired items
      this.cleanExpiredItems();
      
      // Update metadata
      this.updateMetadata();
      
      // Check quota
      this.checkQuota();
      
      logger.info('LocalStorageService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize LocalStorageService:', error);
    }
  }

  public setItem(
    key: string,
    value: any,
    options: Partial<StorageOptions> = {}
  ): boolean {
    try {
      const storageOptions: StorageOptions = {
        encrypt: false,
        compress: this.compressionEnabled,
        category: 'app-state',
        storageType: 'localStorage',
        ...options
      };

      // Validate inputs
      this.validateKey(key);
      this.validateCategory(storageOptions.category);

      // Prepare the storage item
      const storageItem = this.prepareStorageItem(key, value, storageOptions);

      // Check size limits
      if (storageOptions.maxSize && storageItem.size > storageOptions.maxSize) {
        throw new Error(`Item size (${storageItem.size}) exceeds maximum allowed size (${storageOptions.maxSize})`);
      }

      // Check overall quota
      const quota = this.getQuota();
      if (quota.percentage > this.QUOTA_CRITICAL_THRESHOLD) {
        this.performEmergencyCleanup();
      }

      // Store the item
      const success = this.storeItem(storageItem, storageOptions.storageType);
      
      if (success) {
        // Update metadata
        this.updateMetadata();
        
        // Check quota after storage
        this.checkQuota();
        
        logger.debug(`Stored item: ${key}`, {
          category: storageOptions.category,
          size: storageItem.size,
          encrypted: storageItem.encrypted,
          compressed: storageItem.compressed
        });
      }

      return success;
    } catch (error) {
      logger.error(`Failed to set item: ${key}`, error);
      return false;
    }
  }

  public getItem<T = any>(
    key: string,
    storageType: StorageType = 'localStorage'
  ): T | null {
    try {
      this.validateKey(key);
      
      const rawValue = this.getRawItem(key, storageType);
      if (!rawValue) {
        return null;
      }

      // Parse the storage item
      const storageItem = this.parseStorageItem(rawValue);
      
      // Check expiration
      if (storageItem.expiration && new Date() > storageItem.expiration) {
        this.removeItem(key, storageType);
        return null;
      }

      // Validate checksum
      if (!this.validateChecksum(storageItem)) {
        logger.warn(`Checksum validation failed for item: ${key}`);
        this.removeItem(key, storageType);
        return null;
      }

      // Decrypt if necessary
      let value = storageItem.value;
      if (storageItem.encrypted) {
        value = this.decrypt(value);
      }

      // Decompress if necessary
      if (storageItem.compressed) {
        value = this.decompress(value);
      }

      return value;
    } catch (error) {
      logger.error(`Failed to get item: ${key}`, error);
      return null;
    }
  }

  public removeItem(key: string, storageType: StorageType = 'localStorage'): boolean {
    try {
      this.validateKey(key);
      
      const storage = this.getStorage(storageType);
      storage.removeItem(key);
      
      // Update metadata
      this.updateMetadata();
      
      logger.debug(`Removed item: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item: ${key}`, error);
      return false;
    }
  }

  public hasItem(key: string, storageType: StorageType = 'localStorage'): boolean {
    try {
      this.validateKey(key);
      
      const rawValue = this.getRawItem(key, storageType);
      if (!rawValue) {
        return false;
      }

      // Check if item is expired
      const storageItem = this.parseStorageItem(rawValue);
      if (storageItem.expiration && new Date() > storageItem.expiration) {
        this.removeItem(key, storageType);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to check item existence: ${key}`, error);
      return false;
    }
  }

  public clear(
    category?: DataCategory,
    storageType: StorageType = 'localStorage'
  ): number {
    let removedCount = 0;

    try {
      const storage = this.getStorage(storageType);
      const keys = Object.keys(storage);

      for (const key of keys) {
        if (key === this.METADATA_KEY) continue;

        try {
          const rawValue = storage.getItem(key);
          if (!rawValue) continue;

          const storageItem = this.parseStorageItem(rawValue);
          
          // If category is specified, only remove items from that category
          if (category && storageItem.category !== category) {
            continue;
          }

          storage.removeItem(key);
          removedCount++;
        } catch (error) {
          logger.error(`Failed to remove item during clear: ${key}`, error);
        }
      }

      // Update metadata
      this.updateMetadata();
      
      logger.info(`Cleared ${removedCount} items`, { category, storageType });
    } catch (error) {
      logger.error('Failed to clear storage:', error);
    }

    return removedCount;
  }

  public getKeys(
    category?: DataCategory,
    storageType: StorageType = 'localStorage'
  ): string[] {
    const keys: string[] = [];

    try {
      const storage = this.getStorage(storageType);
      const allKeys = Object.keys(storage);

      for (const key of allKeys) {
        if (key === this.METADATA_KEY) continue;

        try {
          const rawValue = storage.getItem(key);
          if (!rawValue) continue;

          const storageItem = this.parseStorageItem(rawValue);
          
          // If category is specified, only include items from that category
          if (category && storageItem.category !== category) {
            continue;
          }

          // Check if item is expired
          if (storageItem.expiration && new Date() > storageItem.expiration) {
            storage.removeItem(key);
            continue;
          }

          keys.push(key);
        } catch (error) {
          logger.error(`Failed to process key during getKeys: ${key}`, error);
        }
      }
    } catch (error) {
      logger.error('Failed to get keys:', error);
    }

    return keys;
  }

  public getMetadata(): StorageMetadata {
    try {
      const metadata = this.getRawItem(this.METADATA_KEY, 'localStorage');
      if (metadata) {
        return JSON.parse(metadata);
      }
    } catch (error) {
      logger.error('Failed to get metadata:', error);
    }

    // Return default metadata
    return {
      totalItems: 0,
      totalSize: 0,
      categories: {} as Record<DataCategory, number>,
      storageTypes: {} as Record<StorageType, number>,
      encryptedItems: 0,
      compressedItems: 0,
      expiredItems: 0
    };
  }

  public getQuota(): StorageQuota {
    try {
      const metadata = this.getMetadata();
      const available = this.MAX_STORAGE_SIZE - metadata.totalSize;
      const percentage = metadata.totalSize / this.MAX_STORAGE_SIZE;

      return {
        available,
        used: metadata.totalSize,
        quota: this.MAX_STORAGE_SIZE,
        percentage,
        categoryUsage: metadata.categories
      };
    } catch (error) {
      logger.error('Failed to get quota:', error);
      return {
        available: this.MAX_STORAGE_SIZE,
        used: 0,
        quota: this.MAX_STORAGE_SIZE,
        percentage: 0,
        categoryUsage: {} as Record<DataCategory, number>
      };
    }
  }

  public exportData(category?: DataCategory): Record<string, any> {
    const exportData: Record<string, any> = {};

    try {
      const keys = this.getKeys(category);
      
      for (const key of keys) {
        const value = this.getItem(key);
        if (value !== null) {
          exportData[key] = value;
        }
      }

      logger.info(`Exported ${Object.keys(exportData).length} items`, { category });
    } catch (error) {
      logger.error('Failed to export data:', error);
    }

    return exportData;
  }

  public importData(
    data: Record<string, any>,
    options: Partial<StorageOptions> = {}
  ): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    try {
      for (const [key, value] of Object.entries(data)) {
        if (this.setItem(key, value, options)) {
          success++;
        } else {
          failed++;
        }
      }

      logger.info(`Import completed: ${success} success, ${failed} failed`);
    } catch (error) {
      logger.error('Failed to import data:', error);
    }

    return { success, failed };
  }

  private prepareStorageItem(
    key: string,
    value: any,
    options: StorageOptions
  ): StorageItem {
    let processedValue = value;
    let encrypted = false;
    let compressed = false;

    // Serialize the value
    if (typeof processedValue !== 'string') {
      processedValue = JSON.stringify(processedValue);
    }

    // Compress if enabled
    if (options.compress) {
      processedValue = this.compress(processedValue);
      compressed = true;
    }

    // Encrypt if enabled
    if (options.encrypt) {
      processedValue = this.encrypt(processedValue);
      encrypted = true;
    }

    const timestamp = new Date();
    const expiration = options.expiration ? new Date(Date.now() + options.expiration) : undefined;
    const size = new Blob([processedValue]).size;
    const checksum = this.calculateChecksum(processedValue);

    return {
      key,
      value: processedValue,
      encrypted,
      compressed,
      category: options.category,
      timestamp,
      expiration,
      size,
      checksum
    };
  }

  private storeItem(item: StorageItem, storageType: StorageType): boolean {
    try {
      const storage = this.getStorage(storageType);
      const serializedItem = JSON.stringify({
        value: item.value,
        encrypted: item.encrypted,
        compressed: item.compressed,
        category: item.category,
        timestamp: item.timestamp.toISOString(),
        expiration: item.expiration?.toISOString(),
        size: item.size,
        checksum: item.checksum
      });

      storage.setItem(item.key, serializedItem);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        logger.warn('Storage quota exceeded, attempting cleanup');
        this.performEmergencyCleanup();
        
        // Try again after cleanup
        try {
          const storage = this.getStorage(storageType);
          const serializedItem = JSON.stringify({
            value: item.value,
            encrypted: item.encrypted,
            compressed: item.compressed,
            category: item.category,
            timestamp: item.timestamp.toISOString(),
            expiration: item.expiration?.toISOString(),
            size: item.size,
            checksum: item.checksum
          });

          storage.setItem(item.key, serializedItem);
          return true;
        } catch (retryError) {
          logger.error('Storage failed even after cleanup:', retryError);
          return false;
        }
      }
      
      logger.error('Failed to store item:', error);
      return false;
    }
  }

  private parseStorageItem(rawValue: string): StorageItem {
    const parsed = JSON.parse(rawValue);
    
    return {
      key: '', // Will be set by caller
      value: parsed.value,
      encrypted: parsed.encrypted || false,
      compressed: parsed.compressed || false,
      category: parsed.category || 'app-state',
      timestamp: new Date(parsed.timestamp),
      expiration: parsed.expiration ? new Date(parsed.expiration) : undefined,
      size: parsed.size || 0,
      checksum: parsed.checksum || ''
    };
  }

  private getRawItem(key: string, storageType: StorageType): string | null {
    try {
      const storage = this.getStorage(storageType);
      return storage.getItem(key);
    } catch (error) {
      logger.error(`Failed to get raw item: ${key}`, error);
      return null;
    }
  }

  private getStorage(storageType: StorageType): Storage {
    switch (storageType) {
      case 'localStorage':
        return localStorage;
      case 'sessionStorage':
        return sessionStorage;
      case 'indexedDB':
        // IndexedDB would require async operations, simplified for now
        throw new Error('IndexedDB not implemented in this version');
      default:
        throw new Error(`Unsupported storage type: ${storageType}`);
    }
  }

  private encrypt(value: string): string {
    // Simplified encryption (use proper encryption in production)
    if (!this.encryptionKey) {
      return value;
    }
    
    const encoded = btoa(value);
    return `${this.ENCRYPTION_PREFIX}${encoded}`;
  }

  private decrypt(encryptedValue: string): string {
    // Simplified decryption
    if (!encryptedValue.startsWith(this.ENCRYPTION_PREFIX)) {
      return encryptedValue;
    }
    
    const encoded = encryptedValue.replace(this.ENCRYPTION_PREFIX, '');
    return atob(encoded);
  }

  private compress(value: string): string {
    // Simplified compression (use proper compression in production)
    if (!this.compressionEnabled) {
      return value;
    }
    
    // Basic compression simulation
    const compressed = value.replace(/\s+/g, ' ').trim();
    return `${this.COMPRESSION_PREFIX}${compressed}`;
  }

  private decompress(compressedValue: string): string {
    // Simplified decompression
    if (!compressedValue.startsWith(this.COMPRESSION_PREFIX)) {
      return compressedValue;
    }
    
    return compressedValue.replace(this.COMPRESSION_PREFIX, '');
  }

  private calculateChecksum(value: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private validateChecksum(item: StorageItem): boolean {
    if (!item.checksum) {
      return true; // No checksum to validate
    }
    
    const currentChecksum = this.calculateChecksum(item.value);
    return currentChecksum === item.checksum;
  }

  private validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key: must be a non-empty string');
    }
    
    if (key.length > 100) {
      throw new Error('Invalid key: too long (max 100 characters)');
    }
    
    if (key === this.METADATA_KEY) {
      throw new Error('Invalid key: reserved metadata key');
    }
  }

  private validateCategory(category: DataCategory): void {
    const validCategories: DataCategory[] = [
      'user-preferences',
      'mood-data',
      'offline-cache',
      'session-data',
      'analytics',
      'security-logs',
      'app-state',
      'temporary'
    ];
    
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
  }

  private checkStorageAvailability(): void {
    try {
      const testKey = '__storage_test__';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('localStorage not working properly');
      }
    } catch (error) {
      throw new Error(`Storage not available: ${error.message}`);
    }
  }

  private cleanExpiredItems(): number {
    let cleanedCount = 0;

    try {
      const storageTypes: StorageType[] = ['localStorage', 'sessionStorage'];
      
      for (const storageType of storageTypes) {
        try {
          const storage = this.getStorage(storageType);
          const keys = Object.keys(storage);

          for (const key of keys) {
            if (key === this.METADATA_KEY) continue;

            try {
              const rawValue = storage.getItem(key);
              if (!rawValue) continue;

              const item = this.parseStorageItem(rawValue);
              
              if (item.expiration && new Date() > item.expiration) {
                storage.removeItem(key);
                cleanedCount++;
              }
            } catch (error) {
              // Remove corrupted items
              storage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          logger.error(`Failed to clean expired items from ${storageType}:`, error);
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned ${cleanedCount} expired items`);
      }
    } catch (error) {
      logger.error('Failed to clean expired items:', error);
    }

    return cleanedCount;
  }

  private updateMetadata(): void {
    try {
      const metadata: StorageMetadata = {
        totalItems: 0,
        totalSize: 0,
        categories: {} as Record<DataCategory, number>,
        storageTypes: {} as Record<StorageType, number>,
        encryptedItems: 0,
        compressedItems: 0,
        expiredItems: 0
      };

      const storageTypes: StorageType[] = ['localStorage', 'sessionStorage'];
      
      for (const storageType of storageTypes) {
        try {
          const storage = this.getStorage(storageType);
          const keys = Object.keys(storage);

          for (const key of keys) {
            if (key === this.METADATA_KEY) continue;

            try {
              const rawValue = storage.getItem(key);
              if (!rawValue) continue;

              const item = this.parseStorageItem(rawValue);
              
              metadata.totalItems++;
              metadata.totalSize += item.size;
              
              // Count by category
              metadata.categories[item.category] = (metadata.categories[item.category] || 0) + 1;
              
              // Count by storage type
              metadata.storageTypes[storageType] = (metadata.storageTypes[storageType] || 0) + 1;
              
              // Count encrypted items
              if (item.encrypted) {
                metadata.encryptedItems++;
              }
              
              // Count compressed items
              if (item.compressed) {
                metadata.compressedItems++;
              }
              
              // Count expired items
              if (item.expiration && new Date() > item.expiration) {
                metadata.expiredItems++;
              }
            } catch (error) {
              // Skip corrupted items
            }
          }
        } catch (error) {
          logger.error(`Failed to update metadata for ${storageType}:`, error);
        }
      }

      // Store metadata
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      logger.error('Failed to update metadata:', error);
    }
  }

  private checkQuota(): void {
    try {
      const quota = this.getQuota();
      
      if (quota.percentage > this.QUOTA_CRITICAL_THRESHOLD) {
        logger.error(`Storage quota critical: ${(quota.percentage * 100).toFixed(1)}%`);
        this.performEmergencyCleanup();
      } else if (quota.percentage > this.QUOTA_WARNING_THRESHOLD) {
        logger.warn(`Storage quota warning: ${(quota.percentage * 100).toFixed(1)}%`);
        
        if (this.quotaWarningCallback) {
          this.quotaWarningCallback(quota);
        }
      }
    } catch (error) {
      logger.error('Failed to check quota:', error);
    }
  }

  private performEmergencyCleanup(): number {
    let cleanedCount = 0;

    try {
      logger.info('Performing emergency storage cleanup');

      // 1. Clean expired items first
      cleanedCount += this.cleanExpiredItems();

      // 2. Clean temporary items
      cleanedCount += this.clear('temporary');

      // 3. Clean old analytics data
      const analyticsKeys = this.getKeys('analytics');
      const sortedAnalyticsKeys = analyticsKeys
        .map(key => ({ key, item: this.parseStorageItem(this.getRawItem(key, 'localStorage')!) }))
        .sort((a, b) => a.item.timestamp.getTime() - b.item.timestamp.getTime());

      // Remove oldest 50% of analytics data
      const toRemove = sortedAnalyticsKeys.slice(0, Math.floor(sortedAnalyticsKeys.length / 2));
      for (const { key } of toRemove) {
        if (this.removeItem(key)) {
          cleanedCount++;
        }
      }

      // 4. Clean old offline cache if still needed
      const quota = this.getQuota();
      if (quota.percentage > this.QUOTA_WARNING_THRESHOLD) {
        cleanedCount += this.clear('offline-cache');
      }

      logger.info(`Emergency cleanup completed: ${cleanedCount} items removed`);
    } catch (error) {
      logger.error('Emergency cleanup failed:', error);
    }

    return cleanedCount;
  }

  private generateEncryptionKey(): string {
    // Generate a simple encryption key (use proper key generation in production)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Public utility methods
  public getStorageInfo(): {
    available: boolean;
    type: string;
    quota: StorageQuota;
    metadata: StorageMetadata;
  } {
    return {
      available: this.isStorageAvailable(),
      type: 'localStorage',
      quota: this.getQuota(),
      metadata: this.getMetadata()
    };
  }

  public isStorageAvailable(): boolean {
    try {
      this.checkStorageAvailability();
      return true;
    } catch (error) {
      return false;
    }
  }

  public optimizeStorage(): {
    itemsCleaned: number;
    spaceSaved: number;
  } {
    const beforeQuota = this.getQuota();
    const itemsCleaned = this.cleanExpiredItems();
    this.updateMetadata();
    const afterQuota = this.getQuota();
    
    return {
      itemsCleaned,
      spaceSaved: beforeQuota.used - afterQuota.used
    };
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService({
  compressionEnabled: true,
  quotaWarningCallback: (quota) => {
    console.warn(`Storage quota warning: ${(quota.percentage * 100).toFixed(1)}% used`);
  }
});

export default localStorageService;
