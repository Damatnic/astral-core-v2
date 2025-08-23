// AES-256 encryption service for HIPAA-compliant data protection
// Implements client-side encryption for sensitive mental health data

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  iterations: number;
  hashAlgorithm: string;
}

export interface EncryptedData {
  data: string;          // Base64 encoded encrypted data
  iv: string;           // Base64 encoded initialization vector
  salt: string;         // Base64 encoded salt for key derivation
  tag?: string;         // Base64 encoded authentication tag (for GCM)
  version: string;      // Encryption version for future compatibility
  algorithm: string;    // Encryption algorithm used
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  category: 'personal' | 'health' | 'crisis' | 'communication' | 'analytics';
  retention: number;    // Days to retain data
  hipaaCompliant: boolean;
}

// Default encryption configuration
const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-GCM',
  keyLength: 256,       // AES-256
  ivLength: 12,         // 96 bits for GCM
  tagLength: 16,        // 128 bits for authentication
  iterations: 100000,   // PBKDF2 iterations
  hashAlgorithm: 'SHA-256'
};

// Data classification rules for different types of sensitive data
const DATA_CLASSIFICATIONS: Record<string, DataClassification> = {
  // Safety plans contain highly sensitive personal crisis information
  'safetyPlan': {
    level: 'restricted',
    category: 'health',
    retention: 2555,      // 7 years (HIPAA requirement)
    hipaaCompliant: true
  },
  
  // Mood analysis contains personal health information
  'mood_analyses': {
    level: 'restricted',
    category: 'health',
    retention: 2555,
    hipaaCompliant: true
  },
  
  // User tokens for authentication
  'userToken': {
    level: 'confidential',
    category: 'personal',
    retention: 90,
    hipaaCompliant: false
  },
  
  // User ID for identification
  'userId': {
    level: 'confidential',
    category: 'personal',
    retention: 90,
    hipaaCompliant: false
  },
  
  // Chat messages may contain health information
  'aiChatHistory': {
    level: 'restricted',
    category: 'health',
    retention: 1095,      // 3 years
    hipaaCompliant: true
  },
  
  'peerChatHistory': {
    level: 'restricted',
    category: 'communication',
    retention: 1095,
    hipaaCompliant: true
  },
  
  // Crisis-specific data requires highest protection
  'crisis_error': {
    level: 'restricted',
    category: 'crisis',
    retention: 2555,
    hipaaCompliant: true
  },
  
  'last_crisis_error': {
    level: 'restricted',
    category: 'crisis',
    retention: 2555,
    hipaaCompliant: true
  },
  
  // User stats and gamification data
  'userStats': {
    level: 'internal',
    category: 'analytics',
    retention: 365,
    hipaaCompliant: false
  },
  
  // Accessibility preferences
  'accessibility-preferences': {
    level: 'internal',
    category: 'personal',
    retention: 365,
    hipaaCompliant: false
  },
  
  // Content filters
  'contentFilters': {
    level: 'internal',
    category: 'personal',
    retention: 365,
    hipaaCompliant: false
  }
};

class EncryptionService {
  private config: EncryptionConfig;
  private keyCache: Map<string, CryptoKey> = new Map();
  private isSupported: boolean = false;

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.checkBrowserSupport();
  }

  /**
   * Check if the browser supports the required cryptographic operations
   */
  private checkBrowserSupport(): void {
    this.isSupported = !!(
      typeof crypto !== 'undefined' &&
      crypto.subtle &&
      typeof crypto.getRandomValues === 'function' &&
      typeof TextEncoder !== 'undefined' &&
      typeof TextDecoder !== 'undefined'
    );

    if (!this.isSupported) {
      console.warn('EncryptionService: Browser does not support required cryptographic operations');
    }
  }

  /**
   * Generate a cryptographically secure random password for key derivation
   */
  private generateSecurePassword(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get or create a device-specific password for encryption
   */
  private async getDevicePassword(): Promise<string> {
    let password = sessionStorage.getItem('device_encryption_key');
    
    if (!password) {
      password = this.generateSecurePassword();
      
      // Store in session storage (cleared when browser closes)
      sessionStorage.setItem('device_encryption_key', password);
      
      // Also create a backup in memory for this session
      if (typeof window !== 'undefined') {
        (window as any).__astral_device_key = password;
      }
    }
    
    return password;
  }

  /**
   * Derive a cryptographic key from password and salt using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES key using PBKDF2
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.iterations,
        hash: this.config.hashAlgorithm
      },
      keyMaterial,
      {
        name: this.config.algorithm,
        length: this.config.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random bytes for salt or IV
   */
  private generateRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Convert Uint8Array to Base64 string
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    const bytes = Array.from(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  /**
   * Convert Base64 string to Uint8Array
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Get data classification for a given key
   */
  private getDataClassification(key: string): DataClassification {
    // Check for exact match first
    if (DATA_CLASSIFICATIONS[key]) {
      return DATA_CLASSIFICATIONS[key];
    }

    // Check for pattern matches
    if (key.includes('crisis') || key.includes('emergency')) {
      return DATA_CLASSIFICATIONS['crisis_error'];
    }
    
    if (key.includes('mood') || key.includes('health')) {
      return DATA_CLASSIFICATIONS['mood_analyses'];
    }
    
    if (key.includes('chat') || key.includes('message')) {
      return DATA_CLASSIFICATIONS['aiChatHistory'];
    }

    // Default to internal level for unknown keys
    return {
      level: 'internal',
      category: 'personal',
      retention: 90,
      hipaaCompliant: false
    };
  }

  /**
   * Determine if data should be encrypted based on classification
   */
  private shouldEncrypt(key: string): boolean {
    const classification = this.getDataClassification(key);
    return classification.level === 'restricted' || classification.level === 'confidential';
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  public async encrypt(data: string, key: string): Promise<EncryptedData> {
    if (!this.isSupported) {
      throw new Error('Encryption not supported in this browser');
    }

    try {
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);

      // Generate random salt and IV
      const salt = this.generateRandomBytes(16);
      const iv = this.generateRandomBytes(this.config.ivLength);

      // Get device password and derive encryption key
      const password = await this.getDevicePassword();
      const cryptoKey = await this.deriveKey(password, salt);

      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv
        },
        cryptoKey,
        dataBytes
      );

      // Split encrypted data and authentication tag for GCM
      const encryptedArray = new Uint8Array(encryptedData);
      const tagLength = this.config.tagLength;
      const ciphertext = encryptedArray.slice(0, -tagLength);
      const tag = encryptedArray.slice(-tagLength);

      const result: EncryptedData = {
        data: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        tag: this.arrayBufferToBase64(tag),
        version: '1.0',
        algorithm: this.config.algorithm
      };

      // Log encryption event for audit trail (without sensitive data)
      this.logSecurityEvent('data_encrypted', {
        key: key,
        algorithm: this.config.algorithm,
        dataSize: data.length,
        classification: this.getDataClassification(key)
      });

      return result;

    } catch (error) {
      console.error('Encryption failed:', error);
      this.logSecurityEvent('encryption_failed', {
        key: key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  public async decrypt(encryptedData: EncryptedData, key: string): Promise<string> {
    if (!this.isSupported) {
      throw new Error('Decryption not supported in this browser');
    }

    try {
      // Convert Base64 data back to Uint8Array
      const ciphertext = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const salt = this.base64ToArrayBuffer(encryptedData.salt);
      const tag = this.base64ToArrayBuffer(encryptedData.tag || '');

      // Combine ciphertext and tag for GCM
      const combinedData = new Uint8Array(ciphertext.length + tag.length);
      combinedData.set(ciphertext);
      combinedData.set(tag, ciphertext.length);

      // Get device password and derive decryption key
      const password = await this.getDevicePassword();
      const cryptoKey = await this.deriveKey(password, salt);

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm,
          iv: iv
        },
        cryptoKey,
        combinedData
      );

      // Convert decrypted data back to string
      const decoder = new TextDecoder();
      const result = decoder.decode(decryptedData);

      // Log decryption event for audit trail
      this.logSecurityEvent('data_decrypted', {
        key: key,
        algorithm: encryptedData.algorithm,
        dataSize: result.length,
        classification: this.getDataClassification(key)
      });

      return result;

    } catch (error) {
      console.error('Decryption failed:', error);
      this.logSecurityEvent('decryption_failed', {
        key: key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Securely store data in localStorage with automatic encryption for sensitive data
   */
  public async secureSetItem(key: string, value: string): Promise<void> {
    try {
      if (this.shouldEncrypt(key)) {
        const encryptedData = await this.encrypt(value, key);
        const storageData = {
          encrypted: true,
          ...encryptedData,
          classification: this.getDataClassification(key),
          timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(storageData));
      } else {
        // Store non-sensitive data as plain text
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      // Fallback to plain text storage if encryption fails
      localStorage.setItem(key, value);
    }
  }

  /**
   * Securely retrieve data from localStorage with automatic decryption
   */
  public async secureGetItem(key: string): Promise<string | null> {
    try {
      const storedValue = localStorage.getItem(key);
      
      if (!storedValue) {
        return null;
      }

      // Try to parse as encrypted data
      let parsedData: any;
      try {
        parsedData = JSON.parse(storedValue);
      } catch {
        // If parsing fails, it's plain text data
        return storedValue;
      }

      // Check if data is encrypted
      if (parsedData.encrypted && parsedData.data) {
        const encryptedData: EncryptedData = {
          data: parsedData.data,
          iv: parsedData.iv,
          salt: parsedData.salt,
          tag: parsedData.tag,
          version: parsedData.version,
          algorithm: parsedData.algorithm
        };
        
        return await this.decrypt(encryptedData, key);
      }

      // Return parsed JSON data (for objects) or original string
      return typeof parsedData === 'object' ? JSON.stringify(parsedData) : storedValue;

    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      // Return original value if decryption fails
      return localStorage.getItem(key);
    }
  }

  /**
   * Remove encrypted data from localStorage
   */
  public secureRemoveItem(key: string): void {
    const classification = this.getDataClassification(key);
    
    // Log data deletion for audit trail
    this.logSecurityEvent('data_deleted', {
      key: key,
      classification: classification
    });

    localStorage.removeItem(key);
  }

  /**
   * Get all keys that contain encrypted data
   */
  public getEncryptedKeys(): string[] {
    const encryptedKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.encrypted) {
              encryptedKeys.push(key);
            }
          } catch {
            // Not JSON, skip
          }
        }
      }
    }
    
    return encryptedKeys;
  }

  /**
   * Check if data is already encrypted
   */
  private isDataEncrypted(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return parsed.encrypted === true;
    } catch {
      return false;
    }
  }

  /**
   * Migrate a single key to encrypted format
   */
  private async migrateSingleKey(key: string): Promise<boolean> {
    try {
      const value = localStorage.getItem(key);
      if (!value || this.isDataEncrypted(value)) {
        return false; // No data or already encrypted
      }

      await this.secureSetItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to migrate data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys that need migration
   */
  private getKeysForMigration(): string[] {
    const keysToMigrate: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.shouldEncrypt(key)) {
        keysToMigrate.push(key);
      }
    }
    
    return keysToMigrate;
  }

  /**
   * Migrate existing unencrypted sensitive data to encrypted format
   */
  public async migrateExistingData(): Promise<void> {
    const migrationStartTime = Date.now();
    let migratedCount = 0;
    let failedCount = 0;

    const keysToMigrate = this.getKeysForMigration();

    for (const key of keysToMigrate) {
      const migrated = await this.migrateSingleKey(key);
      if (migrated) {
        migratedCount++;
      } else {
        failedCount++;
      }
    }

    const migrationTime = Date.now() - migrationStartTime;

    // Log migration completion
    this.logSecurityEvent('data_migration_completed', {
      migratedCount,
      failedCount,
      migrationTime,
      totalKeys: localStorage.length
    });

    console.log(`Data migration completed: ${migratedCount} keys migrated, ${failedCount} failed in ${migrationTime}ms`);
  }

  /**
   * Validate data integrity for encrypted data
   */
  public async validateDataIntegrity(): Promise<{ valid: number; invalid: number; errors: string[] }> {
    const results = { valid: 0, invalid: 0, errors: [] as string[] };
    const encryptedKeys = this.getEncryptedKeys();

    for (const key of encryptedKeys) {
      try {
        const value = await this.secureGetItem(key);
        if (value !== null) {
          results.valid++;
        } else {
          results.invalid++;
          results.errors.push(`Failed to decrypt data for key: ${key}`);
        }
      } catch (error) {
        results.invalid++;
        results.errors.push(`Integrity check failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Clear all encryption keys and reset encryption state
   */
  public clearEncryptionKeys(): void {
    sessionStorage.removeItem('device_encryption_key');
    if (typeof window !== 'undefined') {
      delete (window as any).__astral_device_key;
    }
    this.keyCache.clear();

    this.logSecurityEvent('encryption_keys_cleared', {
      keysClearedCount: this.keyCache.size
    });
  }

  /**
   * Get encryption statistics and health information
   */
  public getEncryptionStats(): {
    isSupported: boolean;
    encryptedKeys: number;
    totalKeys: number;
    classifications: Record<string, number>;
    hipaaCompliantKeys: number;
  } {
    const encryptedKeys = this.getEncryptedKeys();
    const classifications: Record<string, number> = {};
    let hipaaCompliantKeys = 0;

    // Count classifications
    for (const key of encryptedKeys) {
      const classification = this.getDataClassification(key);
      classifications[classification.level] = (classifications[classification.level] || 0) + 1;
      
      if (classification.hipaaCompliant) {
        hipaaCompliantKeys++;
      }
    }

    return {
      isSupported: this.isSupported,
      encryptedKeys: encryptedKeys.length,
      totalKeys: localStorage.length,
      classifications,
      hipaaCompliantKeys
    };
  }

  /**
   * Log security events for audit trail
   */
  private logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: `encryption_${event}`,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity: 'info' as const
    };

    // Store in localStorage for development/audit
    try {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', logEntry);
    }
  }

  /**
   * Check if a specific key contains unencrypted HIPAA data
   */
  private checkKeyForHIPAAViolation(key: string): string | null {
    const classification = this.getDataClassification(key);
    
    if (!classification.hipaaCompliant) {
      return null; // Not HIPAA data, no violation
    }

    const value = localStorage.getItem(key);
    if (!value) {
      return null; // No data, no violation
    }

    try {
      const parsed = JSON.parse(value);
      if (!parsed.encrypted) {
        return `HIPAA-sensitive data in key '${key}' is not encrypted`;
      }
    } catch {
      // Plain text HIPAA data
      return `HIPAA-sensitive data in key '${key}' is stored as plain text`;
    }

    return null; // No violation found
  }

  /**
   * Scan all localStorage keys for HIPAA violations
   */
  private scanForHIPAAViolations(): string[] {
    const violations: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const violation = this.checkKeyForHIPAAViolation(key);
        if (violation) {
          violations.push(violation);
        }
      }
    }

    return violations;
  }

  /**
   * Generate HIPAA compliance recommendations
   */
  private generateHIPAARecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push('Run data migration to encrypt all HIPAA-sensitive data');
      recommendations.push('Implement automatic encryption for all health-related data');
      recommendations.push('Review data classification rules for completeness');
    }

    return recommendations;
  }

  /**
   * Perform HIPAA compliance check for stored data
   */
  public performHIPAAComplianceCheck(): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations = this.scanForHIPAAViolations();
    const recommendations = this.generateHIPAARecommendations(violations);
    const compliant = violations.length === 0;

    return {
      compliant,
      violations,
      recommendations
    };
  }
}

// Singleton instance
let encryptionServiceInstance: EncryptionService | null = null;

/**
 * Get the singleton encryption service instance
 */
export const getEncryptionService = (): EncryptionService => {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new EncryptionService();
  }
  return encryptionServiceInstance;
};

/**
 * React hook for using the encryption service
 */
export const useEncryption = () => {
  const service = getEncryptionService();

  const encryptData = async (data: string, key: string) => {
    return await service.encrypt(data, key);
  };

  const decryptData = async (encryptedData: EncryptedData, key: string) => {
    return await service.decrypt(encryptedData, key);
  };

  const secureStore = async (key: string, value: string) => {
    return await service.secureSetItem(key, value);
  };

  const secureRetrieve = async (key: string) => {
    return await service.secureGetItem(key);
  };

  const secureDelete = (key: string) => {
    service.secureRemoveItem(key);
  };

  return {
    encryptData,
    decryptData,
    secureStore,
    secureRetrieve,
    secureDelete,
    migrateData: () => service.migrateExistingData(),
    validateIntegrity: () => service.validateDataIntegrity(),
    getStats: () => service.getEncryptionStats(),
    checkHIPAACompliance: () => service.performHIPAAComplianceCheck()
  };
};

export default EncryptionService;
