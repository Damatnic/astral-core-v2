/**
 * React Hook for Enhanced Offline Functionality
 * 
 * Provides easy access to offline crisis resources, multilingual support,
 * and PWA capabilities optimized for low-connectivity environments.
 * 
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { enhancedOfflineService, OfflineResource, OfflineCapabilities, SyncQueueItem } from '../services/enhancedOfflineService';

export interface UseEnhancedOfflineReturn {
  // Offline capabilities
  isOnline: boolean;
  capabilities: OfflineCapabilities | null;
  hasOfflineSupport: boolean;
  
  // Crisis resources
  getCrisisResources: (type?: string) => Promise<OfflineResource[]>;
  detectCrisisOffline: (text: string) => Promise<{
    isCrisis: boolean;
    severity: 'low' | 'medium' | 'high';
    keywords: string[];
    recommendations: OfflineResource[];
    confidence: number;
  }>;
  
  // Data management
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  clearOfflineData: () => Promise<void>;
  updateOfflineResources: () => Promise<void>;
  
  // Status monitoring
  storageUsage: {
    used: number;
    quota: number;
    percentage: number;
  };
  syncQueueSize: number;
  lastSync: number | null;
  
  // Loading states
  isInitializing: boolean;
  isUpdatingResources: boolean;
  isSyncing: boolean;
  error: string | null;
}

export const useEnhancedOffline = (): UseEnhancedOfflineReturn => {
  const { i18n } = useTranslation();
  const culturalContext = 'western'; // Default cultural context - could be enhanced with proper context detection
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [capabilities, setCapabilities] = useState<OfflineCapabilities | null>(null);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0, percentage: 0 });
  const [syncQueueSize, setSyncQueueSize] = useState(0);
  const [lastSync, setLastSync] = useState<number | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isUpdatingResources, setIsUpdatingResources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize the offline service
   */
  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Initialize the enhanced offline service
        await enhancedOfflineService.initialize();
        
        // Get initial capabilities
        const caps = await enhancedOfflineService.getOfflineCapabilities();
        setCapabilities(caps);
        setIsOnline(caps?.isOnline || navigator.onLine);
        
        // Update storage usage
        await updateStorageUsage();
        
        console.log('[Enhanced Offline Hook] Service initialized successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize offline service');
        console.error('[Enhanced Offline Hook] Initialization failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeOfflineService();
  }, []);

  /**
   * Set up status monitoring
   */
  useEffect(() => {
    const unsubscribe = enhancedOfflineService.onStatusChange((status: OfflineCapabilities) => {
      setCapabilities(status);
      setIsOnline(status.isOnline);
    });

    return unsubscribe;
  }, []);

  /**
   * Monitor network status
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Update storage usage information
   */
  const updateStorageUsage = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;
        
        setStorageUsage({ used, quota, percentage });
      }
    } catch (err) {
      console.warn('[Enhanced Offline Hook] Could not estimate storage:', err);
    }
  }, []);

  /**
   * Get crisis resources for current language and cultural context
   */
  const getCrisisResources = useCallback(async (type?: string): Promise<OfflineResource[]> => {
    try {
      setError(null);
      return await enhancedOfflineService.getCrisisResources(
        i18n.language,
        culturalContext,
        type
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get crisis resources';
      setError(errorMessage);
      console.error('[Enhanced Offline Hook] Failed to get crisis resources:', err);
      return [];
    }
  }, [i18n.language, culturalContext]);

  /**
   * Perform offline crisis detection
   */
  const detectCrisisOffline = useCallback(async (text: string) => {
    try {
      setError(null);
      return await enhancedOfflineService.detectCrisisOffline(
        text,
        i18n.language,
        culturalContext
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect crisis offline';
      setError(errorMessage);
      console.error('[Enhanced Offline Hook] Failed to detect crisis offline:', err);
      
      // Return safe fallback
      return {
        isCrisis: false,
        severity: 'low' as const,
        keywords: [],
        recommendations: [],
        confidence: 0
      };
    }
  }, [i18n.language, culturalContext]);

  /**
   * Add item to sync queue
   */
  const addToSyncQueue = useCallback(async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      setError(null);
      await enhancedOfflineService.addToSyncQueue({
        ...item,
        language: i18n.language,
        culturalContext
      });
      setSyncQueueSize(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to sync queue';
      setError(errorMessage);
      console.error('[Enhanced Offline Hook] Failed to add to sync queue:', err);
    }
  }, [i18n.language, culturalContext]);

  /**
   * Clear all offline data
   */
  const clearOfflineData = useCallback(async () => {
    try {
      setError(null);
      await enhancedOfflineService.clearOfflineData();
      await updateStorageUsage();
      setSyncQueueSize(0);
      console.log('[Enhanced Offline Hook] Offline data cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear offline data';
      setError(errorMessage);
      console.error('[Enhanced Offline Hook] Failed to clear offline data:', err);
    }
  }, [updateStorageUsage]);

  /**
   * Update offline resources
   */
  const updateOfflineResources = useCallback(async () => {
    try {
      setIsUpdatingResources(true);
      setError(null);
      
      await enhancedOfflineService.updateOfflineResources();
      await updateStorageUsage();
      
      console.log('[Enhanced Offline Hook] Offline resources updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update offline resources';
      setError(errorMessage);
      console.error('[Enhanced Offline Hook] Failed to update offline resources:', err);
    } finally {
      setIsUpdatingResources(false);
    }
  }, [updateStorageUsage]);

  /**
   * Periodic storage usage updates
   */
  useEffect(() => {
    const interval = setInterval(() => {
      updateStorageUsage();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [updateStorageUsage]);

  /**
   * Determine if offline support is available
   */
  const hasOfflineSupport = Boolean(
    capabilities?.hasIndexedDB || capabilities?.hasStorage
  );

  return {
    isOnline,
    capabilities,
    hasOfflineSupport,
    getCrisisResources,
    detectCrisisOffline,
    addToSyncQueue,
    clearOfflineData,
    updateOfflineResources,
    storageUsage,
    syncQueueSize,
    lastSync,
    isInitializing,
    isUpdatingResources,
    isSyncing: false, // Not currently used but part of interface
    error
  };
};
