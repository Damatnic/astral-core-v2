/**
 * Enhanced Offline Hook
 *
 * Comprehensive React hook for managing offline capabilities,
 * data synchronization, and offline-first user experiences
 *
 * Features:
 * - Network status monitoring and detection
 * - Offline data caching and synchronization
 * - Background sync with conflict resolution
 * - Offline queue management
 * - Service Worker integration
 * - Progressive enhancement for offline features
 * - Data integrity and validation
 * - Offline analytics and monitoring
 *
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedOfflineService } from '../services/enhancedOfflineService';
import { logger } from '../utils/logger';

// Network Status Interface
interface NetworkStatus {
  isOnline: boolean;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
  lastChanged: Date;
}

// Offline Data Entry Interface
interface OfflineDataEntry {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  error?: string;
  metadata?: {
    userId?: string;
    sessionId?: string;
    version?: number;
    checksum?: string;
  };
}

// Sync Configuration Interface
interface SyncConfig {
  enableBackgroundSync: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  batchSize: number;
  conflictResolution: 'client_wins' | 'server_wins' | 'manual' | 'merge';
  priorityOrder: Array<'critical' | 'high' | 'medium' | 'low'>;
}

// Offline Storage Stats Interface
interface OfflineStorageStats {
  totalEntries: number;
  pendingSync: number;
  failedSync: number;
  storageUsed: number; // bytes
  storageQuota: number; // bytes
  lastSync: Date | null;
  collections: Record<string, {
    count: number;
    size: number;
    lastModified: Date;
  }>;
}

// Conflict Resolution Interface
interface ConflictResolution {
  id: string;
  collection: string;
  localData: any;
  serverData: any;
  conflictType: 'version' | 'timestamp' | 'checksum';
  resolution: 'pending' | 'resolved';
  strategy?: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
  resolvedAt?: Date;
}

// Hook Configuration Interface
interface UseEnhancedOfflineConfig {
  enableNetworkMonitoring: boolean;
  enableOfflineStorage: boolean;
  enableBackgroundSync: boolean;
  enableConflictResolution: boolean;
  storageQuota: number; // bytes
  syncConfig: Partial<SyncConfig>;
  collections: string[];
  onlineOnlyCollections?: string[];
}

// Hook Return Type
interface UseEnhancedOfflineReturn {
  // Network Status
  networkStatus: NetworkStatus;
  isOnline: boolean;
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  
  // Offline Data Management
  offlineData: OfflineDataEntry[];
  storageStats: OfflineStorageStats;
  conflicts: ConflictResolution[];
  
  // Status
  isSyncing: boolean;
  lastSync: Date | null;
  syncProgress: number; // 0-100
  
  // Data Operations
  saveOffline: (collection: string, data: any, type?: 'create' | 'update' | 'delete', priority?: 'low' | 'medium' | 'high' | 'critical') => Promise<string>;
  getOfflineData: (collection: string, id?: string) => Promise<any[]>;
  updateOfflineData: (id: string, data: any) => Promise<void>;
  deleteOfflineData: (id: string) => Promise<void>;
  
  // Synchronization
  syncNow: () => Promise<void>;
  syncCollection: (collection: string) => Promise<void>;
  cancelSync: () => void;
  
  // Conflict Resolution
  resolveConflict: (conflictId: string, strategy: 'client_wins' | 'server_wins' | 'merge', mergedData?: any) => Promise<void>;
  getConflicts: (collection?: string) => ConflictResolution[];
  
  // Storage Management
  clearOfflineData: (collection?: string) => Promise<void>;
  compactStorage: () => Promise<void>;
  getStorageUsage: () => Promise<OfflineStorageStats>;
  
  // Utilities
  isCollectionOfflineEnabled: (collection: string) => boolean;
  exportOfflineData: () => Promise<string>;
  importOfflineData: (data: string) => Promise<void>;
}

// Default Configuration
const DEFAULT_CONFIG: UseEnhancedOfflineConfig = {
  enableNetworkMonitoring: true,
  enableOfflineStorage: true,
  enableBackgroundSync: true,
  enableConflictResolution: true,
  storageQuota: 50 * 1024 * 1024, // 50MB
  syncConfig: {
    enableBackgroundSync: true,
    syncInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    batchSize: 10,
    conflictResolution: 'manual',
    priorityOrder: ['critical', 'high', 'medium', 'low']
  },
  collections: ['user_data', 'sessions', 'preferences'],
  onlineOnlyCollections: ['analytics', 'logs']
};

/**
 * Enhanced Offline Hook
 * 
 * @param config - Optional configuration for offline capabilities
 * @returns Enhanced offline state and utilities
 */
export function useEnhancedOffline(
  config: Partial<UseEnhancedOfflineConfig> = {}
): UseEnhancedOfflineReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const syncConfig = { ...DEFAULT_CONFIG.syncConfig, ...finalConfig.syncConfig };
  
  // State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    lastChanged: new Date()
  });
  
  const [offlineData, setOfflineData] = useState<OfflineDataEntry[]>([]);
  const [storageStats, setStorageStats] = useState<OfflineStorageStats>({
    totalEntries: 0,
    pendingSync: 0,
    failedSync: 0,
    storageUsed: 0,
    storageQuota: finalConfig.storageQuota,
    lastSync: null,
    collections: {}
  });
  
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Refs
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncAbortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Connection Quality Calculation
  const connectionQuality = useCallback((): 'poor' | 'fair' | 'good' | 'excellent' => {
    if (!networkStatus.isOnline) return 'poor';
    
    const { effectiveType, downlink, rtt } = networkStatus;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'poor';
    if (effectiveType === '3g' && downlink < 1.5) return 'fair';
    if (effectiveType === '3g' || (effectiveType === '4g' && rtt > 300)) return 'good';
    
    return 'excellent';
  }, [networkStatus]);
  
  // Network Status Monitoring
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    let effectiveType: NetworkStatus['effectiveType'] = 'unknown';
    let downlink = 0;
    let rtt = 0;
    let saveData = false;
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      effectiveType = connection.effectiveType || 'unknown';
      downlink = connection.downlink || 0;
      rtt = connection.rtt || 0;
      saveData = connection.saveData || false;
    }
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline,
      effectiveType,
      downlink,
      rtt,
      saveData,
      lastChanged: new Date()
    }));
    
    logger.debug('Network status updated', { isOnline, effectiveType, downlink, rtt });
  }, []);
  
  // Initialize Enhanced Offline Service
  const initializeOfflineService = useCallback(async () => {
    try {
      await enhancedOfflineService.initialize({
        storageQuota: finalConfig.storageQuota,
        collections: finalConfig.collections,
        syncConfig
      });
      
      // Load existing offline data
      const existingData = await enhancedOfflineService.getAllOfflineData();
      setOfflineData(existingData);
      
      // Load conflicts
      const existingConflicts = await enhancedOfflineService.getConflicts();
      setConflicts(existingConflicts);
      
      // Update storage stats
      await updateStorageStats();
      
      logger.info('Enhanced offline service initialized');
    } catch (error) {
      logger.error('Failed to initialize enhanced offline service', { error });
    }
  }, [finalConfig, syncConfig]);
  
  // Update Storage Stats
  const updateStorageStats = useCallback(async () => {
    try {
      const stats = await enhancedOfflineService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      logger.error('Failed to update storage stats', { error });
    }
  }, []);
  
  // Save Data Offline
  const saveOffline = useCallback(async (
    collection: string,
    data: any,
    type: 'create' | 'update' | 'delete' = 'create',
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> => {
    try {
      // Check if collection supports offline storage
      if (finalConfig.onlineOnlyCollections?.includes(collection)) {
        throw new Error(`Collection ${collection} is online-only`);
      }
      
      const entry = await enhancedOfflineService.saveOffline({
        collection,
        data,
        type,
        priority
      });
      
      setOfflineData(prev => [...prev, entry]);
      await updateStorageStats();
      
      // Trigger sync if online and auto-sync enabled
      if (networkStatus.isOnline && syncConfig.enableBackgroundSync) {
        scheduleSyncRetry(entry.id);
      }
      
      logger.debug('Data saved offline', { collection, type, id: entry.id });
      return entry.id;
    } catch (error) {
      logger.error('Failed to save data offline', { collection, type, error });
      throw error;
    }
  }, [finalConfig.onlineOnlyCollections, networkStatus.isOnline, syncConfig.enableBackgroundSync]);
  
  // Get Offline Data
  const getOfflineData = useCallback(async (collection: string, id?: string): Promise<any[]> => {
    try {
      return await enhancedOfflineService.getOfflineData(collection, id);
    } catch (error) {
      logger.error('Failed to get offline data', { collection, id, error });
      return [];
    }
  }, []);
  
  // Update Offline Data
  const updateOfflineData = useCallback(async (id: string, data: any) => {
    try {
      await enhancedOfflineService.updateOfflineData(id, data);
      
      setOfflineData(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, data, timestamp: new Date(), syncStatus: 'pending' as const }
            : entry
        )
      );
      
      await updateStorageStats();
      
      logger.debug('Offline data updated', { id });
    } catch (error) {
      logger.error('Failed to update offline data', { id, error });
      throw error;
    }
  }, []);
  
  // Delete Offline Data
  const deleteOfflineData = useCallback(async (id: string) => {
    try {
      await enhancedOfflineService.deleteOfflineData(id);
      
      setOfflineData(prev => prev.filter(entry => entry.id !== id));
      await updateStorageStats();
      
      logger.debug('Offline data deleted', { id });
    } catch (error) {
      logger.error('Failed to delete offline data', { id, error });
      throw error;
    }
  }, []);
  
  // Schedule Sync Retry
  const scheduleSyncRetry = useCallback((entryId: string, delay?: number) => {
    const retryDelay = delay || syncConfig.retryDelay;
    
    const timeoutId = setTimeout(() => {
      syncCollection('all').catch(error => {
        logger.error('Scheduled sync failed', { entryId, error });
      });
      retryTimeoutsRef.current.delete(entryId);
    }, retryDelay);
    
    retryTimeoutsRef.current.set(entryId, timeoutId);
  }, [syncConfig.retryDelay]);
  
  // Sync Now
  const syncNow = useCallback(async () => {
    if (!networkStatus.isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      
      const abortController = new AbortController();
      syncAbortControllerRef.current = abortController;
      
      const pendingEntries = offlineData.filter(entry => entry.syncStatus === 'pending');
      const totalEntries = pendingEntries.length;
      
      if (totalEntries === 0) {
        setSyncProgress(100);
        return;
      }
      
      // Sort by priority
      const sortedEntries = pendingEntries.sort((a, b) => {
        const priorityOrder = syncConfig.priorityOrder || ['critical', 'high', 'medium', 'low'];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      });
      
      // Sync in batches
      const batchSize = syncConfig.batchSize || 10;
      let syncedCount = 0;
      
      for (let i = 0; i < sortedEntries.length; i += batchSize) {
        if (abortController.signal.aborted) break;
        
        const batch = sortedEntries.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (entry) => {
            try {
              await enhancedOfflineService.syncEntry(entry.id);
              
              setOfflineData(prev => 
                prev.map(e => 
                  e.id === entry.id 
                    ? { ...e, syncStatus: 'synced' as const, retryCount: 0 }
                    : e
                )
              );
              
              syncedCount++;
            } catch (error) {
              logger.error('Failed to sync entry', { entryId: entry.id, error });
              
              setOfflineData(prev => 
                prev.map(e => 
                  e.id === entry.id 
                    ? { 
                        ...e, 
                        syncStatus: 'failed' as const, 
                        retryCount: e.retryCount + 1,
                        error: error instanceof Error ? error.message : 'Sync failed'
                      }
                    : e
                )
              );
              
              // Schedule retry if under max retries
              if (entry.retryCount < (syncConfig.maxRetries || 3)) {
                scheduleSyncRetry(entry.id, syncConfig.retryDelay * (entry.retryCount + 1));
              }
            }
          })
        );
        
        setSyncProgress(Math.round((syncedCount / totalEntries) * 100));
      }
      
      setLastSync(new Date());
      await updateStorageStats();
      
      logger.info('Sync completed', { syncedCount, totalEntries });
      
    } catch (error) {
      logger.error('Sync failed', { error });
    } finally {
      setIsSyncing(false);
      setSyncProgress(100);
      syncAbortControllerRef.current = null;
    }
  }, [networkStatus.isOnline, isSyncing, offlineData, syncConfig]);
  
  // Sync Collection
  const syncCollection = useCallback(async (collection: string) => {
    if (collection === 'all') {
      return syncNow();
    }
    
    if (!networkStatus.isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      const collectionEntries = offlineData.filter(
        entry => entry.collection === collection && entry.syncStatus === 'pending'
      );
      
      for (const entry of collectionEntries) {
        try {
          await enhancedOfflineService.syncEntry(entry.id);
          
          setOfflineData(prev => 
            prev.map(e => 
              e.id === entry.id 
                ? { ...e, syncStatus: 'synced' as const }
                : e
            )
          );
        } catch (error) {
          logger.error('Failed to sync collection entry', { collection, entryId: entry.id, error });
        }
      }
      
      await updateStorageStats();
      
    } catch (error) {
      logger.error('Failed to sync collection', { collection, error });
    } finally {
      setIsSyncing(false);
    }
  }, [networkStatus.isOnline, isSyncing, offlineData, syncNow]);
  
  // Cancel Sync
  const cancelSync = useCallback(() => {
    if (syncAbortControllerRef.current) {
      syncAbortControllerRef.current.abort();
      setIsSyncing(false);
      setSyncProgress(0);
      logger.info('Sync cancelled');
    }
  }, []);
  
  // Resolve Conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    strategy: 'client_wins' | 'server_wins' | 'merge',
    mergedData?: any
  ) => {
    try {
      await enhancedOfflineService.resolveConflict(conflictId, strategy, mergedData);
      
      setConflicts(prev => 
        prev.map(conflict => 
          conflict.id === conflictId 
            ? { 
                ...conflict, 
                resolution: 'resolved' as const, 
                strategy,
                resolvedData: mergedData,
                resolvedAt: new Date()
              }
            : conflict
        )
      );
      
      logger.info('Conflict resolved', { conflictId, strategy });
    } catch (error) {
      logger.error('Failed to resolve conflict', { conflictId, strategy, error });
      throw error;
    }
  }, []);
  
  // Get Conflicts
  const getConflicts = useCallback((collection?: string): ConflictResolution[] => {
    return collection 
      ? conflicts.filter(conflict => conflict.collection === collection)
      : conflicts;
  }, [conflicts]);
  
  // Clear Offline Data
  const clearOfflineData = useCallback(async (collection?: string) => {
    try {
      await enhancedOfflineService.clearOfflineData(collection);
      
      if (collection) {
        setOfflineData(prev => prev.filter(entry => entry.collection !== collection));
      } else {
        setOfflineData([]);
      }
      
      await updateStorageStats();
      
      logger.info('Offline data cleared', { collection });
    } catch (error) {
      logger.error('Failed to clear offline data', { collection, error });
      throw error;
    }
  }, []);
  
  // Compact Storage
  const compactStorage = useCallback(async () => {
    try {
      await enhancedOfflineService.compactStorage();
      await updateStorageStats();
      
      logger.info('Storage compacted');
    } catch (error) {
      logger.error('Failed to compact storage', { error });
      throw error;
    }
  }, []);
  
  // Get Storage Usage
  const getStorageUsage = useCallback(async (): Promise<OfflineStorageStats> => {
    try {
      return await enhancedOfflineService.getStorageStats();
    } catch (error) {
      logger.error('Failed to get storage usage', { error });
      return storageStats;
    }
  }, [storageStats]);
  
  // Check if Collection is Offline Enabled
  const isCollectionOfflineEnabled = useCallback((collection: string): boolean => {
    return finalConfig.collections.includes(collection) && 
           !finalConfig.onlineOnlyCollections?.includes(collection);
  }, [finalConfig.collections, finalConfig.onlineOnlyCollections]);
  
  // Export Offline Data
  const exportOfflineData = useCallback(async (): Promise<string> => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        networkStatus,
        offlineData: offlineData.map(entry => ({
          ...entry,
          metadata: { ...entry.metadata, userId: '[REDACTED]' }
        })),
        storageStats,
        conflicts: conflicts.map(conflict => ({
          ...conflict,
          localData: '[REDACTED]',
          serverData: '[REDACTED]'
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('Failed to export offline data', { error });
      return '{}';
    }
  }, [networkStatus, offlineData, storageStats, conflicts]);
  
  // Import Offline Data
  const importOfflineData = useCallback(async (data: string) => {
    try {
      const importData = JSON.parse(data);
      
      // Validate import data structure
      if (!importData.offlineData || !Array.isArray(importData.offlineData)) {
        throw new Error('Invalid import data format');
      }
      
      await enhancedOfflineService.importOfflineData(importData.offlineData);
      
      // Reload data
      const updatedData = await enhancedOfflineService.getAllOfflineData();
      setOfflineData(updatedData);
      
      await updateStorageStats();
      
      logger.info('Offline data imported', { entriesCount: importData.offlineData.length });
    } catch (error) {
      logger.error('Failed to import offline data', { error });
      throw error;
    }
  }, []);
  
  // Set up network monitoring
  useEffect(() => {
    if (!finalConfig.enableNetworkMonitoring) return;
    
    updateNetworkStatus();
    
    const handleOnline = () => {
      updateNetworkStatus();
      
      // Trigger sync when coming back online
      if (syncConfig.enableBackgroundSync) {
        setTimeout(syncNow, 1000);
      }
    };
    
    const handleOffline = () => {
      updateNetworkStatus();
      cancelSync();
    };
    
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [finalConfig.enableNetworkMonitoring, syncConfig.enableBackgroundSync, syncNow, cancelSync]);
  
  // Set up background sync interval
  useEffect(() => {
    if (!syncConfig.enableBackgroundSync || !networkStatus.isOnline) return;
    
    syncIntervalRef.current = setInterval(() => {
      if (networkStatus.isOnline && !isSyncing) {
        syncNow();
      }
    }, syncConfig.syncInterval);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncConfig.enableBackgroundSync, syncConfig.syncInterval, networkStatus.isOnline, isSyncing, syncNow]);
  
  // Initialize on mount
  useEffect(() => {
    initializeOfflineService();
    
    return () => {
      // Cleanup timeouts
      retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      retryTimeoutsRef.current.clear();
      
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      
      if (syncAbortControllerRef.current) {
        syncAbortControllerRef.current.abort();
      }
    };
  }, [initializeOfflineService]);
  
  return {
    // Network Status
    networkStatus,
    isOnline: networkStatus.isOnline,
    connectionQuality: connectionQuality(),
    
    // Offline Data Management
    offlineData,
    storageStats,
    conflicts,
    
    // Status
    isSyncing,
    lastSync,
    syncProgress,
    
    // Data Operations
    saveOffline,
    getOfflineData,
    updateOfflineData,
    deleteOfflineData,
    
    // Synchronization
    syncNow,
    syncCollection,
    cancelSync,
    
    // Conflict Resolution
    resolveConflict,
    getConflicts,
    
    // Storage Management
    clearOfflineData,
    compactStorage,
    getStorageUsage,
    
    // Utilities
    isCollectionOfflineEnabled,
    exportOfflineData,
    importOfflineData
  };
}

export type { 
  UseEnhancedOfflineReturn, 
  NetworkStatus, 
  OfflineDataEntry, 
  ConflictResolution,
  OfflineStorageStats,
  SyncConfig 
};
