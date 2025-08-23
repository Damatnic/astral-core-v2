// Secure storage wrapper with automatic encryption for sensitive data
// Provides a drop-in replacement for localStorage with HIPAA compliance

import { getEncryptionService } from './encryptionService';

export interface SecureStorageOptions {
  enableEncryption?: boolean;
  enableAuditLogging?: boolean;
  enableDataRetention?: boolean;
  maxRetentionDays?: number;
}

export interface StorageMetadata {
  timestamp: number;
  classification: string;
  encrypted: boolean;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

class SecureStorageService {
  private encryptionService = getEncryptionService();
  private options: Required<SecureStorageOptions>;
  private accessLog: Map<string, StorageMetadata> = new Map();

  constructor(options: SecureStorageOptions = {}) {
    this.options = {
      enableEncryption: true,
      enableAuditLogging: true,
      enableDataRetention: true,
      maxRetentionDays: 2555, // 7 years for HIPAA compliance
      ...options
    };

    this.loadAccessLog();
    this.scheduleDataRetentionCleanup();
  }

  /**
   * Load access log from localStorage
   */
  private loadAccessLog(): void {
    try {
      const storedLog = localStorage.getItem('_secure_storage_log');
      if (storedLog) {
        const parsed = JSON.parse(storedLog);
        this.accessLog = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load access log:', error);
    }
  }

  /**
   * Save access log to localStorage
   */
  private saveAccessLog(): void {
    try {
      const logObject = Object.fromEntries(this.accessLog);
      localStorage.setItem('_secure_storage_log', JSON.stringify(logObject));
    } catch (error) {
      console.warn('Failed to save access log:', error);
    }
  }

  /**
   * Update metadata for a key
   */
  private updateMetadata(key: string, data: string, isRead: boolean = false): void {
    if (!this.options.enableAuditLogging) return;

    const existing = this.accessLog.get(key);
    const now = Date.now();

    const metadata: StorageMetadata = {
      timestamp: existing?.timestamp || now,
      classification: this.getDataClassification(key),
      encrypted: this.shouldEncrypt(key),
      size: data.length,
      accessCount: (existing?.accessCount || 0) + (isRead ? 1 : 0),
      lastAccessed: now
    };

    this.accessLog.set(key, metadata);
    this.saveAccessLog();
  }

  /**
   * Get data classification for a key
   */
  private getDataClassification(key: string): string {
    // Crisis data
    if (key.includes('crisis') || key.includes('emergency')) {
      return 'crisis';
    }
    
    // Health data
    if (key.includes('mood') || key.includes('safety') || key.includes('health')) {
      return 'health';
    }
    
    // Communication data
    if (key.includes('chat') || key.includes('message')) {
      return 'communication';
    }
    
    // Personal data
    if (key.includes('user') || key.includes('token') || key.includes('profile')) {
      return 'personal';
    }

    return 'general';
  }

  /**
   * Determine if data should be encrypted
   */
  private shouldEncrypt(key: string): boolean {
    if (!this.options.enableEncryption) return false;

    const classification = this.getDataClassification(key);
    return ['crisis', 'health', 'communication', 'personal'].includes(classification);
  }

  /**
   * Schedule automatic data retention cleanup
   */
  private scheduleDataRetentionCleanup(): void {
    if (!this.options.enableDataRetention) return;

    // Run cleanup immediately
    this.performDataRetentionCleanup();

    // Schedule daily cleanup
    setInterval(() => {
      this.performDataRetentionCleanup();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Perform data retention cleanup based on age and classification
   */
  private performDataRetentionCleanup(): void {
    const now = Date.now();
    const maxAge = this.options.maxRetentionDays * 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    this.accessLog.forEach((metadata, key) => {
      const age = now - metadata.timestamp;
      
      // Check if data exceeds retention period
      if (age > maxAge) {
        this.removeItem(key);
        this.accessLog.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`Data retention cleanup: removed ${cleanedCount} expired items`);
      this.saveAccessLog();
    }
  }

  /**
   * Securely store data with automatic encryption for sensitive data
   */
  public async setItem(key: string, value: string): Promise<void> {
    try {
      // Update metadata before storing
      this.updateMetadata(key, value);

      // Use encryption service for secure storage
      await this.encryptionService.secureSetItem(key, value);

      // Log storage event
      if (this.options.enableAuditLogging) {
        this.logStorageEvent('data_stored', {
          key,
          size: value.length,
          encrypted: this.shouldEncrypt(key),
          classification: this.getDataClassification(key)
        });
      }

    } catch (error) {
      console.error('SecureStorage: Failed to store data:', error);
      throw new Error(`Failed to store data for key: ${key}`);
    }
  }

  /**
   * Securely retrieve data with automatic decryption
   */
  public async getItem(key: string): Promise<string | null> {
    try {
      // Retrieve data using encryption service
      const value = await this.encryptionService.secureGetItem(key);

      if (value !== null) {
        // Update access metadata
        this.updateMetadata(key, value, true);

        // Log access event
        if (this.options.enableAuditLogging) {
          this.logStorageEvent('data_accessed', {
            key,
            size: value.length,
            classification: this.getDataClassification(key)
          });
        }
      }

      return value;

    } catch (error) {
      console.error('SecureStorage: Failed to retrieve data:', error);
      // Return null instead of throwing to maintain localStorage compatibility
      return null;
    }
  }

  /**
   * Remove data and update metadata
   */
  public removeItem(key: string): void {
    try {
      // Remove from localStorage
      this.encryptionService.secureRemoveItem(key);

      // Update metadata
      this.accessLog.delete(key);
      this.saveAccessLog();

      // Log removal event
      if (this.options.enableAuditLogging) {
        this.logStorageEvent('data_removed', {
          key,
          classification: this.getDataClassification(key)
        });
      }

    } catch (error) {
      console.error('SecureStorage: Failed to remove data:', error);
    }
  }

  /**
   * Clear all data and metadata
   */
  public clear(): void {
    try {
      // Clear localStorage
      localStorage.clear();

      // Clear metadata
      this.accessLog.clear();

      // Log clear event
      if (this.options.enableAuditLogging) {
        this.logStorageEvent('storage_cleared', {});
      }

    } catch (error) {
      console.error('SecureStorage: Failed to clear storage:', error);
    }
  }

  /**
   * Get the number of items in storage
   */
  public get length(): number {
    return localStorage.length;
  }

  /**
   * Get key at specific index
   */
  public key(index: number): string | null {
    return localStorage.key(index);
  }

  /**
   * Check if a key exists
   */
  public hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys in storage
   */
  public getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): {
    totalKeys: number;
    encryptedKeys: number;
    totalSize: number;
    byClassification: Record<string, number>;
    byEncryption: { encrypted: number; plaintext: number };
  } {
    const stats = {
      totalKeys: 0,
      encryptedKeys: 0,
      totalSize: 0,
      byClassification: {} as Record<string, number>,
      byEncryption: { encrypted: 0, plaintext: 0 }
    };

    this.accessLog.forEach((metadata, _key) => {
      stats.totalKeys++;
      stats.totalSize += metadata.size;

      if (metadata.encrypted) {
        stats.encryptedKeys++;
        stats.byEncryption.encrypted++;
      } else {
        stats.byEncryption.plaintext++;
      }

      stats.byClassification[metadata.classification] = 
        (stats.byClassification[metadata.classification] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get access metadata for a key
   */
  public getMetadata(key: string): StorageMetadata | null {
    return this.accessLog.get(key) || null;
  }

  /**
   * Get all metadata
   */
  public getAllMetadata(): Map<string, StorageMetadata> {
    return new Map(this.accessLog);
  }

  /**
   * Validate data integrity for all encrypted data
   */
  public async validateIntegrity(): Promise<{
    valid: number;
    invalid: number;
    errors: string[];
  }> {
    return await this.encryptionService.validateDataIntegrity();
  }

  /**
   * Migrate existing data to encrypted format
   */
  public async migrateToEncrypted(): Promise<void> {
    await this.encryptionService.migrateExistingData();
    
    // Update metadata for migrated data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.shouldEncrypt(key)) {
        const value = await this.getItem(key);
        if (value) {
          this.updateMetadata(key, value);
        }
      }
    }
  }

  /**
   * Perform HIPAA compliance check
   */
  public performHIPAAComplianceCheck(): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    return this.encryptionService.performHIPAAComplianceCheck();
  }

  /**
   * Export data for backup or migration
   */
  public async exportData(includeMetadata: boolean = true): Promise<{
    data: Record<string, string>;
    metadata?: Record<string, StorageMetadata>;
    exportTime: string;
    version: string;
  }> {
    const exportData: Record<string, string> = {};
    const keys = this.getAllKeys();

    for (const key of keys) {
      const value = await this.getItem(key);
      if (value !== null) {
        exportData[key] = value;
      }
    }

    const result: {
      data: Record<string, string>;
      exportTime: string;
      version: string;
      metadata?: Record<string, StorageMetadata>;
    } = {
      data: exportData,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };

    if (includeMetadata) {
      result.metadata = Object.fromEntries(this.accessLog);
    }

    return result;
  }

  /**
   * Import data from backup
   */
  public async importData(backup: {
    data: Record<string, string>;
    metadata?: Record<string, StorageMetadata>;
  }): Promise<void> {
    const importedKeys: string[] = [];

    try {
      // Import data
      for (const [key, value] of Object.entries(backup.data)) {
        await this.setItem(key, value);
        importedKeys.push(key);
      }

      // Import metadata if available
      if (backup.metadata) {
        for (const [key, metadata] of Object.entries(backup.metadata)) {
          this.accessLog.set(key, metadata);
        }
        this.saveAccessLog();
      }

      this.logStorageEvent('data_imported', {
        importedCount: importedKeys.length,
        keys: importedKeys
      });

    } catch (error) {
      console.error('SecureStorage: Failed to import data:', error);
      throw new Error('Data import failed');
    }
  }

  /**
   * Log storage events for audit trail
   */
  private logStorageEvent(event: string, details: any): void {
    if (!this.options.enableAuditLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: `secure_storage_${event}`,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity: 'info' as const
    };

    // Store in security logs
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to log storage event:', error);
    }
  }
}

// Singleton instance
let secureStorageInstance: SecureStorageService | null = null;

/**
 * Get the singleton secure storage instance
 */
export const getSecureStorage = (options?: SecureStorageOptions): SecureStorageService => {
  if (!secureStorageInstance) {
    secureStorageInstance = new SecureStorageService(options);
  }
  return secureStorageInstance;
};

/**
 * React hook for using secure storage
 */
export const useSecureStorage = () => {
  const storage = getSecureStorage();

  const setSecureItem = async (key: string, value: string) => {
    await storage.setItem(key, value);
  };

  const getSecureItem = async (key: string) => {
    return await storage.getItem(key);
  };

  const removeSecureItem = (key: string) => {
    storage.removeItem(key);
  };

  const clearSecureStorage = () => {
    storage.clear();
  };

  return {
    setItem: setSecureItem,
    getItem: getSecureItem,
    removeItem: removeSecureItem,
    clear: clearSecureStorage,
    hasItem: (key: string) => storage.hasItem(key),
    getAllKeys: () => storage.getAllKeys(),
    getStats: () => storage.getStorageStats(),
    getMetadata: (key: string) => storage.getMetadata(key),
    validateIntegrity: () => storage.validateIntegrity(),
    migrateToEncrypted: () => storage.migrateToEncrypted(),
    checkHIPAACompliance: () => storage.performHIPAAComplianceCheck(),
    exportData: (includeMetadata?: boolean) => storage.exportData(includeMetadata),
    importData: (backup: any) => storage.importData(backup)
  };
};

export { SecureStorageService };
export default SecureStorageService;
