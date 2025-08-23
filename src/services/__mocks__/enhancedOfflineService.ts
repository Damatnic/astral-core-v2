/**
 * Mock for Enhanced Offline Service
 */

export const enhancedOfflineService = {
  isOnline: true,
  syncQueue: [],
  cache: new Map(),
  initialize: jest.fn().mockResolvedValue(undefined),
  queueAction: jest.fn().mockResolvedValue(undefined),
  syncOfflineData: jest.fn().mockResolvedValue({ synced: 0, failed: 0 }),
  getCachedData: jest.fn(),
  setCachedData: jest.fn().mockResolvedValue(undefined),
  clearCache: jest.fn().mockResolvedValue(undefined),
  getOfflineCapabilities: jest.fn().mockReturnValue({
    messaging: true,
    journaling: true,
    moodTracking: true,
    crisisResources: true
  }),
  addSyncListener: jest.fn(),
  removeSyncListener: jest.fn(),
  checkConnectivity: jest.fn().mockResolvedValue(true),
  getQueueSize: jest.fn().mockReturnValue(0),
  clearQueue: jest.fn().mockResolvedValue(undefined),
  forceSyncNow: jest.fn().mockResolvedValue({ synced: 0, failed: 0 })
};