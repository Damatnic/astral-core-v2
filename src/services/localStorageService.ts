/**
 * Local Storage Service for Anonymous User Data
 * Manages persistent data for users who haven't logged in
 */

interface LocalStorageData {
  anonymousId: string;
  moodEntries: any[];
  reflections: any[];
  safetyPlan: any;
  wellnessData: any;
  assessments: any[];
  preferences: any;
  lastSyncedAt?: string;
}

class LocalStorageService {
  private readonly STORAGE_KEY_PREFIX = 'astral_core_';
  private readonly ANONYMOUS_ID_KEY = `${this.STORAGE_KEY_PREFIX}anonymous_id`;
  private readonly DATA_KEY = `${this.STORAGE_KEY_PREFIX}user_data`;
  private readonly SYNC_KEY = `${this.STORAGE_KEY_PREFIX}sync_status`;

  /**
   * Get or create anonymous user ID
   */
  getAnonymousId(): string | null {
    try {
      return localStorage.getItem(this.ANONYMOUS_ID_KEY);
    } catch (error) {
      console.error('Failed to get anonymous ID:', error);
      return null;
    }
  }

  /**
   * Set anonymous user ID
   */
  setAnonymousId(id: string): void {
    try {
      localStorage.setItem(this.ANONYMOUS_ID_KEY, id);
    } catch (error) {
      console.error('Failed to set anonymous ID:', error);
    }
  }

  /**
   * Get all user data for anonymous user
   */
  getUserData(): LocalStorageData | null {
    try {
      const data = localStorage.getItem(this.DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Save user data for anonymous user
   */
  setUserData(data: Partial<LocalStorageData>): void {
    try {
      const existingData = this.getUserData() || this.getDefaultUserData();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem(this.DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  /**
   * Get specific data field
   */
  getDataField<T>(field: keyof LocalStorageData): T | null {
    try {
      const data = this.getUserData();
      return data ? (data[field] as T) : null;
    } catch (error) {
      console.error(`Failed to get ${field}:`, error);
      return null;
    }
  }

  /**
   * Set specific data field
   */
  setDataField<T>(field: keyof LocalStorageData, value: T): void {
    try {
      const data = this.getUserData() || this.getDefaultUserData();
      data[field] = value as any;
      localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to set ${field}:`, error);
    }
  }

  /**
   * Add mood entry
   */
  addMoodEntry(entry: any): void {
    const moodEntries = this.getDataField<any[]>('moodEntries') || [];
    moodEntries.push({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });
    this.setDataField('moodEntries', moodEntries);
  }

  /**
   * Add reflection
   */
  addReflection(reflection: any): void {
    const reflections = this.getDataField<any[]>('reflections') || [];
    reflections.push({
      ...reflection,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });
    this.setDataField('reflections', reflections);
  }

  /**
   * Save safety plan
   */
  saveSafetyPlan(plan: any): void {
    this.setDataField('safetyPlan', {
      ...plan,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Add assessment
   */
  addAssessment(assessment: any): void {
    const assessments = this.getDataField<any[]>('assessments') || [];
    assessments.push({
      ...assessment,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });
    this.setDataField('assessments', assessments);
  }

  /**
   * Update wellness data
   */
  updateWellnessData(data: any): void {
    const wellnessData = this.getDataField<any>('wellnessData') || {};
    this.setDataField('wellnessData', {
      ...wellnessData,
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Save preferences
   */
  savePreferences(preferences: any): void {
    this.setDataField('preferences', preferences);
  }

  /**
   * Get default user data structure
   */
  private getDefaultUserData(): LocalStorageData {
    return {
      anonymousId: this.getAnonymousId() || crypto.randomUUID(),
      moodEntries: [],
      reflections: [],
      safetyPlan: null,
      wellnessData: {},
      assessments: [],
      preferences: {
        theme: 'system',
        notifications: false,
        language: 'en',
      },
    };
  }

  /**
   * Clear all anonymous user data
   */
  clearUserData(): void {
    try {
      localStorage.removeItem(this.DATA_KEY);
      localStorage.removeItem(this.SYNC_KEY);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  /**
   * Check if data needs syncing (for future use when user logs in)
   */
  needsSync(): boolean {
    try {
      const syncStatus = localStorage.getItem(this.SYNC_KEY);
      return syncStatus !== 'synced';
    } catch (error) {
      console.error('Failed to check sync status:', error);
      return false;
    }
  }

  /**
   * Mark data as synced
   */
  markAsSynced(): void {
    try {
      localStorage.setItem(this.SYNC_KEY, 'synced');
      this.setDataField('lastSyncedAt', new Date().toISOString());
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  }

  /**
   * Mark data as needing sync
   */
  markAsNeedsSync(): void {
    try {
      localStorage.setItem(this.SYNC_KEY, 'pending');
    } catch (error) {
      console.error('Failed to mark as needs sync:', error);
    }
  }

  /**
   * Migrate anonymous data to authenticated user (when user logs in)
   */
  async migrateToAuthenticatedUser(userId: string): Promise<boolean> {
    try {
      const data = this.getUserData();
      if (!data) {
        return true; // No data to migrate
      }

      // Here you would typically make an API call to save the data to the backend
      // For now, we'll just log it
      console.log('Migrating anonymous data to user:', userId);
      console.log('Data to migrate:', data);

      // After successful migration, clear local data
      this.clearUserData();
      this.markAsSynced();
      
      return true;
    } catch (error) {
      console.error('Failed to migrate data:', error);
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: boolean } {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length + key.length;
          }
        }
      }
      return {
        used: totalSize,
        available: this.isStorageAvailable(),
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: false };
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Export class for testing
export default LocalStorageService;