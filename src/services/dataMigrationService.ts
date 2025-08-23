// Data Migration and HIPAA Compliance Utility
// Migrates existing unencrypted sensitive data to encrypted format

import { getSecureStorage } from './secureStorageService';
import { getEncryptionService } from './encryptionService';

export interface MigrationReport {
  totalKeys: number;
  migratedKeys: number;
  failedKeys: number;
  skippedKeys: number;
  errors: string[];
  warnings: string[];
  encryptionStats: any;
  complianceCheck: any;
  migrationTime: number;
}

export interface MigrationOptions {
  dryRun?: boolean;
  backupExisting?: boolean;
  forceUpdate?: boolean;
  enableLogging?: boolean;
}

class DataMigrationService {
  private secureStorage = getSecureStorage();
  private encryptionService = getEncryptionService();

  /**
   * Initialize migration report
   */
  private initializeMigrationReport(): MigrationReport {
    return {
      totalKeys: 0,
      migratedKeys: 0,
      failedKeys: 0,
      skippedKeys: 0,
      errors: [],
      warnings: [],
      encryptionStats: {},
      complianceCheck: {},
      migrationTime: 0
    };
  }

  /**
   * Process all keys for migration
   */
  private async processAllKeys(allKeys: string[], options: MigrationOptions, report: MigrationReport): Promise<void> {
    report.totalKeys = allKeys.length;

    for (const key of allKeys) {
      try {
        const migrated = await this.migrateKey(key, options);
        if (migrated) {
          report.migratedKeys++;
        } else {
          report.skippedKeys++;
        }
      } catch (error) {
        report.failedKeys++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        report.errors.push(`Failed to migrate key '${key}': ${errorMessage}`);
      }
    }
  }

  /**
   * Finalize migration report with statistics and compliance check
   */
  private async finalizeMigrationReport(report: MigrationReport, _options: MigrationOptions): Promise<void> {
    // Get final encryption statistics
    report.encryptionStats = this.encryptionService.getEncryptionStats();

    // Perform HIPAA compliance check
    report.complianceCheck = this.encryptionService.performHIPAAComplianceCheck();

    // Add warnings for non-compliant data
    if (!report.complianceCheck.compliant) {
      report.warnings.push('HIPAA compliance violations detected');
      report.warnings.push(...report.complianceCheck.violations);
    }
  }

  /**
   * Perform complete data migration and HIPAA compliance setup
   */
  public async performMigration(options: MigrationOptions = {}): Promise<MigrationReport> {
    const startTime = Date.now();
    const report = this.initializeMigrationReport();

    try {
      if (options.enableLogging) {
        console.log('Starting data migration for HIPAA compliance...');
      }

      // Create backup if requested
      if (options.backupExisting && !options.dryRun) {
        await this.createBackup();
      }

      // Get all localStorage keys and process them
      const allKeys = this.getAllLocalStorageKeys();
      await this.processAllKeys(allKeys, options, report);

      // Run encryption service migration for any remaining data
      if (!options.dryRun) {
        await this.encryptionService.migrateExistingData();
      }

      // Finalize report with statistics and compliance check
      await this.finalizeMigrationReport(report, options);

      report.migrationTime = Date.now() - startTime;

      if (options.enableLogging) {
        this.logMigrationReport(report);
      }

      return report;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      report.errors.push(`Migration failed: ${errorMessage}`);
      report.migrationTime = Date.now() - startTime;
      return report;
    }
  }

  /**
   * Migrate a single key to secure storage
   */
  private async migrateKey(key: string, options: MigrationOptions): Promise<boolean> {
    // Skip system keys
    if (this.isSystemKey(key)) {
      return false;
    }

    const existingValue = localStorage.getItem(key);
    if (!existingValue) {
      return false;
    }

    // Check if already encrypted
    if (this.isAlreadyEncrypted(existingValue)) {
      return false;
    }

    // Check if this key needs encryption
    if (!this.shouldEncryptKey(key)) {
      return false;
    }

    if (options.dryRun) {
      return true; // Would migrate this key
    }

    // Migrate to secure storage
    await this.secureStorage.setItem(key, existingValue);
    return true;
  }

  /**
   * Check if a key is a system key that shouldn't be migrated
   */
  private isSystemKey(key: string): boolean {
    const systemKeys = [
      '_secure_storage_log',
      'security_logs',
      'analytics_opted_out',
      'analytics_events',
      'analytics_failed'
    ];
    
    return systemKeys.includes(key) || key.startsWith('_');
  }

  /**
   * Check if data is already encrypted
   */
  private isAlreadyEncrypted(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return parsed.encrypted === true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a key should be encrypted based on data classification
   */
  private shouldEncryptKey(key: string): boolean {
    const sensitiveKeyPatterns = [
      'safetyPlan',
      'mood_analyses',
      'userToken',
      'userId',
      'chat',
      'crisis',
      'health',
      'personal'
    ];

    return sensitiveKeyPatterns.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Get all localStorage keys
   */
  private getAllLocalStorageKeys(): string[] {
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
   * Create backup of existing data
   */
  private async createBackup(): Promise<void> {
    const backup = await this.secureStorage.exportData(true);
    const backupKey = `data_backup_${Date.now()}`;
    
    // Store backup in secure storage
    await this.secureStorage.setItem(backupKey, JSON.stringify(backup));
    
    console.log(`Backup created with key: ${backupKey}`);
  }

  /**
   * Log migration report
   */
  private logMigrationReport(report: MigrationReport): void {
    console.log('=== Data Migration Report ===');
    console.log(`Total keys processed: ${report.totalKeys}`);
    console.log(`Keys migrated: ${report.migratedKeys}`);
    console.log(`Keys skipped: ${report.skippedKeys}`);
    console.log(`Keys failed: ${report.failedKeys}`);
    console.log(`Migration time: ${report.migrationTime}ms`);
    
    if (report.errors.length > 0) {
      console.warn('Migration errors:', report.errors);
    }
    
    if (report.warnings.length > 0) {
      console.warn('Migration warnings:', report.warnings);
    }
    
    console.log('Encryption stats:', report.encryptionStats);
    console.log('HIPAA compliance:', report.complianceCheck);
  }

  /**
   * Validate migration success
   */
  public async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check encryption service status
    const encryptionStats = this.encryptionService.getEncryptionStats();
    if (!encryptionStats.isSupported) {
      issues.push('Browser does not support required encryption features');
      recommendations.push('Use a modern browser that supports Web Crypto API');
    }

    // Check HIPAA compliance
    const complianceCheck = this.encryptionService.performHIPAAComplianceCheck();
    if (!complianceCheck.compliant) {
      issues.push('HIPAA compliance violations detected');
      issues.push(...complianceCheck.violations);
      recommendations.push(...complianceCheck.recommendations);
    }

    // Check data integrity
    const integrityCheck = await this.encryptionService.validateDataIntegrity();
    if (integrityCheck.invalid > 0) {
      issues.push(`${integrityCheck.invalid} encrypted items failed integrity check`);
      recommendations.push('Re-run migration for failed items');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Get migration status and recommendations
   */
  public getMigrationStatus(): {
    needsMigration: boolean;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    sensitiveKeysFound: string[];
  } {
    const sensitiveKeys: string[] = [];
    let hasUnencryptedSensitiveData = false;

    // Check for unencrypted sensitive data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.shouldEncryptKey(key)) {
        const value = localStorage.getItem(key);
        if (value && !this.isAlreadyEncrypted(value)) {
          sensitiveKeys.push(key);
          hasUnencryptedSensitiveData = true;
        }
      }
    }

    // Determine urgency based on data types
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (sensitiveKeys.some(key => key.includes('crisis'))) {
      urgency = 'critical';
    } else if (sensitiveKeys.some(key => key.includes('health') || key.includes('mood'))) {
      urgency = 'high';
    } else if (sensitiveKeys.some(key => key.includes('chat') || key.includes('personal'))) {
      urgency = 'medium';
    }

    return {
      needsMigration: hasUnencryptedSensitiveData,
      reason: hasUnencryptedSensitiveData 
        ? 'Unencrypted sensitive data detected'
        : 'All sensitive data is properly encrypted',
      urgency,
      sensitiveKeysFound: sensitiveKeys
    };
  }

  /**
   * Set up automatic data protection for new data
   */
  public async setupDataProtection(): Promise<void> {
    // Replace global localStorage usage with secure storage
    if (typeof window !== 'undefined') {
      // Store original localStorage methods
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      const originalRemoveItem = localStorage.removeItem;

      // Override localStorage methods for sensitive data
      localStorage.setItem = (key: string, value: string) => {
        if (this.shouldEncryptKey(key)) {
          // Use secure storage for sensitive data
          this.secureStorage.setItem(key, value);
        } else {
          // Use original localStorage for non-sensitive data
          originalSetItem.call(localStorage, key, value);
        }
      };

      localStorage.getItem = (key: string) => {
        if (this.shouldEncryptKey(key)) {
          // This will return a Promise, but localStorage getItem should be sync
          // We'll need to handle this differently in the actual implementation
          console.warn(`Attempting to synchronously access encrypted data for key: ${key}`);
          return null;
        } else {
          return originalGetItem.call(localStorage, key);
        }
      };

      localStorage.removeItem = (key: string) => {
        if (this.shouldEncryptKey(key)) {
          this.secureStorage.removeItem(key);
        } else {
          originalRemoveItem.call(localStorage, key);
        }
      };
    }
  }
}

// Singleton instance
let migrationServiceInstance: DataMigrationService | null = null;

/**
 * Get the singleton data migration service instance
 */
export const getDataMigrationService = (): DataMigrationService => {
  if (!migrationServiceInstance) {
    migrationServiceInstance = new DataMigrationService();
  }
  return migrationServiceInstance;
};

/**
 * React hook for data migration
 */
export const useDataMigration = () => {
  const service = getDataMigrationService();

  return {
    performMigration: (options?: MigrationOptions) => service.performMigration(options),
    validateMigration: () => service.validateMigration(),
    getMigrationStatus: () => service.getMigrationStatus(),
    setupDataProtection: () => service.setupDataProtection()
  };
};

export default DataMigrationService;
