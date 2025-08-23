/**
 * Tests for Enhanced Offline Hook
 */

// Mock services BEFORE imports
jest.mock('../services/enhancedOfflineService');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en'
    }
  })
}));

import { renderHook, act, waitFor } from '../test-utils';
import { useEnhancedOffline } from './useEnhancedOffline';
import { enhancedOfflineService } from '../services/enhancedOfflineService';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en'
    }
  })
}));

// Mock the enhanced offline service
jest.mock('../services/enhancedOfflineService', () => ({
  enhancedOfflineService: {
    initialize: jest.fn(),
    getOfflineCapabilities: jest.fn(),
    onStatusChange: jest.fn(),
    getCrisisResources: jest.fn(),
    detectCrisisOffline: jest.fn(),
    addToSyncQueue: jest.fn(),
    clearOfflineData: jest.fn(),
    updateOfflineResources: jest.fn()
  }
}));

const mockOfflineCapabilities = {
  isOnline: true,
  hasIndexedDB: true,
  hasStorage: true,
  hasServiceWorker: true,
  estimatedStorage: 1024 * 1024 * 100, // 100MB
  usedStorage: 1024 * 1024 * 10, // 10MB
  supportsPWA: true
};

const mockCrisisResources = [
  {
    id: 'resource-1',
    type: 'hotline',
    title: 'Crisis Hotline',
    description: '24/7 crisis support',
    content: 'Call 988 for immediate help',
    language: 'en',
    culturalContext: 'western',
    priority: 1,
    offline: true
  },
  {
    id: 'resource-2',
    type: 'technique',
    title: 'Breathing Exercise',
    description: 'Grounding technique',
    content: 'Take slow deep breaths',
    language: 'en',
    culturalContext: 'western',
    priority: 2,
    offline: true
  }
];

const mockCrisisDetectionResult = {
  isCrisis: true,
  severity: 'high' as const,
  keywords: ['hopeless', 'end it all'],
  recommendations: mockCrisisResources,
  confidence: 0.85
};

// Mock navigator properties
const mockNavigator = {
  onLine: true,
  storage: {
    estimate: jest.fn().mockResolvedValue({
      usage: 10 * 1024 * 1024, // 10MB
      quota: 100 * 1024 * 1024  // 100MB
    })
  }
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});


describe('useEnhancedOffline Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Default successful initialization
    (enhancedOfflineService.initialize as jest.Mock).mockResolvedValue(undefined);
    (enhancedOfflineService.getOfflineCapabilities as jest.Mock).mockResolvedValue(mockOfflineCapabilities);
    (enhancedOfflineService.onStatusChange as jest.Mock).mockReturnValue(() => {});
    (enhancedOfflineService.getCrisisResources as jest.Mock).mockResolvedValue(mockCrisisResources);
    (enhancedOfflineService.detectCrisisOffline as jest.Mock).mockResolvedValue(mockCrisisDetectionResult);
  });

  it.skip('should initialize with loading state', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.isOnline).toBe(true); // Should use navigator.onLine initially
    expect(result.current.capabilities).toBeNull();
    expect(result.current.hasOfflineSupport).toBe(false);
    expect(result.current.storageUsage.used).toBe(0);
    expect(result.current.storageUsage.quota).toBe(0);
    expect(result.current.syncQueueSize).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it.skip('should initialize offline service successfully', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(enhancedOfflineService.initialize).toHaveBeenCalled();
    expect(enhancedOfflineService.getOfflineCapabilities).toHaveBeenCalled();
    expect(result.current.capabilities).toEqual(mockOfflineCapabilities);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.hasOfflineSupport).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle initialization errors', async () => {
    const initError = new Error('Failed to initialize offline service');
    (enhancedOfflineService.initialize as jest.Mock).mockRejectedValue(initError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(result.current.error).toBe('Failed to initialize offline service');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Enhanced Offline Hook] Initialization failed:',
      initError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should set up status change monitoring', async () => {
    const mockUnsubscribe = jest.fn();
    (enhancedOfflineService.onStatusChange as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(enhancedOfflineService.onStatusChange).toHaveBeenCalledWith(expect.any(Function));
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it.skip('should handle network status changes', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', { value: true });
    
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastSync).toBeDefined();
  });

  it.skip('should update storage usage', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(navigator.storage.estimate).toHaveBeenCalled();
    expect(result.current.storageUsage.used).toBe(10 * 1024 * 1024);
    expect(result.current.storageUsage.quota).toBe(100 * 1024 * 1024);
    expect(result.current.storageUsage.percentage).toBe(10);
  });

  it.skip('should get crisis resources successfully', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    let resources: unknown[];
    await act(async () => {
      resources = await result.current.getCrisisResources('hotline');
    });

    expect(enhancedOfflineService.getCrisisResources).toHaveBeenCalledWith(
      'en',       // language
      'western',  // cultural context
      'hotline'   // type
    );
    expect(resources!).toEqual(mockCrisisResources);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle crisis resources errors', async () => {
    const resourceError = new Error('Failed to load resources');
    (enhancedOfflineService.getCrisisResources as jest.Mock).mockRejectedValue(resourceError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    let resources: unknown[];
    await act(async () => {
      resources = await result.current.getCrisisResources();
    });

    expect(resources!).toEqual([]);
    expect(result.current.error).toBe('Failed to load resources');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it.skip('should detect crisis offline successfully', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    let detectionResult: any;
    await act(async () => {
      detectionResult = await result.current.detectCrisisOffline('I want to end it all');
    });

    expect(enhancedOfflineService.detectCrisisOffline).toHaveBeenCalledWith(
      'I want to end it all',
      'en',
      'western'
    );
    expect(detectionResult).toEqual(mockCrisisDetectionResult);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle crisis detection errors with safe fallback', async () => {
    const detectionError = new Error('Offline detection unavailable');
    (enhancedOfflineService.detectCrisisOffline as jest.Mock).mockRejectedValue(detectionError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    let detectionResult: any;
    await act(async () => {
      detectionResult = await result.current.detectCrisisOffline('Test text');
    });

    expect(detectionResult).toEqual({
      isCrisis: false,
      severity: 'low',
      keywords: [],
      recommendations: [],
      confidence: 0
    });
    expect(result.current.error).toBe('Offline detection unavailable');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it.skip('should add items to sync queue', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    const syncItem = {
      type: 'crisis-event' as const,
      data: { riskLevel: 75, timestamp: Date.now() },
      priority: 5,
      culturalContext: 'western',
      language: 'en'
    };

    await act(async () => {
      await result.current.addToSyncQueue(syncItem);
    });

    expect(enhancedOfflineService.addToSyncQueue).toHaveBeenCalledWith({
      ...syncItem,
      language: 'en',
      culturalContext: 'western'
    });
    expect(result.current.syncQueueSize).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle sync queue errors', async () => {
    const syncError = new Error('Sync queue full');
    (enhancedOfflineService.addToSyncQueue as jest.Mock).mockRejectedValue(syncError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    const syncItem = {
      type: 'session-data' as const,
      data: { test: true },
      priority: 3,
      culturalContext: 'western',
      language: 'en'
    };

    await act(async () => {
      await result.current.addToSyncQueue(syncItem);
    });

    expect(result.current.error).toBe('Sync queue full');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it.skip('should clear offline data', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await act(async () => {
      await result.current.clearOfflineData();
    });

    expect(enhancedOfflineService.clearOfflineData).toHaveBeenCalled();
    expect(result.current.syncQueueSize).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('[Enhanced Offline Hook] Offline data cleared');
    expect(result.current.error).toBeNull();

    consoleSpy.mockRestore();
  });

  it.skip('should handle clear data errors', async () => {
    const clearError = new Error('Failed to clear data');
    (enhancedOfflineService.clearOfflineData as jest.Mock).mockRejectedValue(clearError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    await act(async () => {
      await result.current.clearOfflineData();
    });

    expect(result.current.error).toBe('Failed to clear data');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it.skip('should update offline resources', async () => {
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(result.current.isUpdatingResources).toBe(false);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const updatePromise = act(async () => {
      await result.current.updateOfflineResources();
    });

    // Should be updating during the call
    expect(result.current.isUpdatingResources).toBe(true);

    await updatePromise;

    expect(enhancedOfflineService.updateOfflineResources).toHaveBeenCalled();
    expect(result.current.isUpdatingResources).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('[Enhanced Offline Hook] Offline resources updated');
    expect(result.current.error).toBeNull();

    consoleSpy.mockRestore();
  });

  it.skip('should handle update resources errors', async () => {
    const updateError = new Error('Network unavailable');
    (enhancedOfflineService.updateOfflineResources as jest.Mock).mockRejectedValue(updateError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    await act(async () => {
      await result.current.updateOfflineResources();
    });

    expect(result.current.isUpdatingResources).toBe(false);
    expect(result.current.error).toBe('Network unavailable');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it.skip('should determine offline support correctly', async () => {
    // Test with full support
    const { result: result1 } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result1.current.hasOfflineSupport).toBe(true);
    });

    // Test with limited support
    (enhancedOfflineService.getOfflineCapabilities as jest.Mock).mockResolvedValue({
      ...mockOfflineCapabilities,
      hasIndexedDB: false,
      hasStorage: false
    });

    const { result: result2 } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result2.current.hasOfflineSupport).toBe(false);
    });
  });

  it.skip('should handle storage estimation errors gracefully', async () => {
    // Mock storage.estimate to throw error
    const storageError = new Error('Storage API unavailable');
    (navigator.storage.estimate as jest.Mock).mockRejectedValue(storageError);

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(result.current.storageUsage.used).toBe(0);
    expect(result.current.storageUsage.quota).toBe(0);
    expect(result.current.storageUsage.percentage).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Enhanced Offline Hook] Could not estimate storage:',
      storageError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should handle browsers without storage API', async () => {
    // Mock navigator without storage API
    const originalStorage = navigator.storage;
    delete (navigator as any).storage;

    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(result.current.storageUsage.used).toBe(0);
    expect(result.current.storageUsage.quota).toBe(0);

    // Restore storage API
    (navigator as any).storage = originalStorage;
  });

  it.skip('should update storage usage periodically', async () => {
    jest.useFakeTimers('modern');

    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    // Clear the initial call
    (navigator.storage.estimate as jest.Mock).mockClear();

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(navigator.storage.estimate).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it.skip('should handle status change callbacks', async () => {
    let statusCallback: (status: any) => void;
    (enhancedOfflineService.onStatusChange as jest.Mock).mockImplementation((callback) => {
      statusCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useEnhancedOffline());

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    const updatedStatus = {
      ...mockOfflineCapabilities,
      isOnline: false
    };

    act(() => {
      statusCallback!(updatedStatus);
    });

    expect(result.current.capabilities).toEqual(updatedStatus);
    expect(result.current.isOnline).toBe(false);
  });

  it.skip('should cleanup event listeners on unmount', async () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useEnhancedOffline());

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it.skip('should clear storage usage update interval on unmount', async () => {
    jest.useFakeTimers('modern');

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useEnhancedOffline());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    jest.useRealTimers();
    clearIntervalSpy.mockRestore();
  });
});