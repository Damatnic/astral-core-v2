/**
 * Store Enhancement Utilities
 * 
 * Provides standardized error handling, persistence, and optimization
 * utilities for all Zustand stores in the application.
 */

import { StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions, PersistStorage, devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * Standard error state interface for all stores
 */
export interface ErrorState {
  error: Error | null;
  errorCode?: string;
  errorTimestamp?: Date;
  errorRetryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  clearError: () => void;
  setError: (error: Error | string, code?: string) => void;
  retryLastAction?: () => Promise<void>;
}

/**
 * Standard loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  loadingProgress?: number;
  setLoading: (loading: boolean, message?: string, progress?: number) => void;
}

/**
 * Standard optimization state
 */
export interface OptimizationState {
  lastUpdated: Date | null;
  updateCount: number;
  cacheValid: boolean;
  invalidateCache: () => void;
  updateMetrics: () => void;
}

/**
 * Combined enhanced state interface
 */
export interface EnhancedState extends ErrorState, LoadingState, OptimizationState {
  // Version for migration support
  _version: number;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Create standard error handling slice
 */
export const createErrorSlice = <T extends ErrorState>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
): ErrorState => ({
  error: null,
  errorCode: undefined,
  errorTimestamp: undefined,
  errorRetryCount: 0,
  maxRetries: 3,
  isRetrying: false,
  
  clearError: () => set({
    error: null,
    errorCode: undefined,
    errorTimestamp: undefined,
    errorRetryCount: 0,
    isRetrying: false
  } as Partial<T>),
  
  setError: (error: Error | string, code?: string) => set({
    error: typeof error === 'string' ? new Error(error) : error,
    errorCode: code,
    errorTimestamp: new Date(),
    isRetrying: false
  } as Partial<T>)
});

/**
 * Create standard loading slice
 */
export const createLoadingSlice = <T extends LoadingState>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
): LoadingState => ({
  isLoading: false,
  loadingMessage: undefined,
  loadingProgress: undefined,
  
  setLoading: (loading: boolean, message?: string, progress?: number) => set({
    isLoading: loading,
    loadingMessage: message,
    loadingProgress: progress
  } as Partial<T>)
});

/**
 * Create optimization slice
 */
export const createOptimizationSlice = <T extends OptimizationState>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
): OptimizationState => ({
  lastUpdated: null,
  updateCount: 0,
  cacheValid: true,
  
  invalidateCache: () => set({
    cacheValid: false
  } as Partial<T>),
  
  updateMetrics: () => set((state: any) => ({
    ...state,
    lastUpdated: new Date(),
    updateCount: state.updateCount + 1,
    cacheValid: true
  }))
});

/**
 * Create enhanced state with all standard features
 */
export const createEnhancedSlice = <T extends EnhancedState>(
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
): Omit<EnhancedState, '_version' | '_hasHydrated' | 'setHasHydrated'> => ({
  ...createErrorSlice<T>(set),
  ...createLoadingSlice<T>(set),
  ...createOptimizationSlice<T>(set)
});

/**
 * Persistence configuration factory
 */
export interface PersistConfig<T> {
  name: string;
  version?: number;
  migrate?: (persistedState: any, version: number) => T;
  partialize?: (state: T) => Partial<T>;
  skipHydration?: boolean;
  storage?: 'localStorage' | 'sessionStorage' | 'indexedDB';
}

/**
 * Create persistence options with sensible defaults
 */
export const createPersistOptions = <T extends EnhancedState>(
  config: PersistConfig<T>
): PersistOptions<T, Partial<T>> => {
  // Choose storage based on config
  let storage: PersistStorage<Partial<T>> | undefined;
  switch (config.storage) {
    case 'sessionStorage':
      storage = createJSONStorage(() => sessionStorage);
      break;
    case 'indexedDB':
      // For IndexedDB, you'd need to implement or use a library
      // Falling back to localStorage for now
      storage = createJSONStorage(() => localStorage);
      break;
    default:
      storage = createJSONStorage(() => localStorage);
  }

  return {
    name: `astral-core-${config.name}`,
    version: config.version || 1,
    storage: storage as PersistStorage<Partial<T>>,
    
    // Default partialize - exclude error and loading states
    partialize: config.partialize || ((state) => {
      const typedState = state as any & {
        error?: any;
        errorCode?: any;
        errorTimestamp?: any;
        errorRetryCount?: any;
        isRetrying?: any;
        isLoading?: any;
        loadingMessage?: any;
        loadingProgress?: any;
      };
      const { error, errorCode, errorTimestamp, errorRetryCount, isRetrying,
              isLoading, loadingMessage, loadingProgress, ...rest } = typedState;
      return rest;
    }),
    
    // Migration support
    migrate: config.migrate,
    
    // Skip hydration if needed
    skipHydration: config.skipHydration || false,
    
    // Handle hydration
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.setHasHydrated(true);
      }
    }
  };
};

/**
 * Retry logic wrapper for async actions
 */
export const withRetry = async <T>(
  action: () => Promise<T>,
  setError: (error: Error | string, code?: string) => void,
  setLoading: (loading: boolean, message?: string) => void,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T | null> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        setLoading(true, `Retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
      
      const result = await action();
      setLoading(false);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        setError(lastError, 'MAX_RETRIES_EXCEEDED');
        setLoading(false);
        return null;
      }
    }
  }
  
  return null;
};

/**
 * Optimistic update wrapper
 */
export const withOptimisticUpdate = <R>(
  optimisticUpdate: () => void,
  actualUpdate: () => Promise<R>,
  rollback: () => void,
  setError: (error: Error | string, code?: string) => void
): Promise<R | null> => {
  // Apply optimistic update immediately
  optimisticUpdate();
  
  // Perform actual update
  return actualUpdate().catch((error) => {
    // Rollback on failure
    rollback();
    setError(error as Error, 'OPTIMISTIC_UPDATE_FAILED');
    throw error;
  });
};

/**
 * Debounced update wrapper
 */
export const createDebouncedUpdate = <T extends (...args: unknown[]) => any>(
  fn: T,
  delay: number = 500
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

/**
 * Middleware composer for enhanced stores
 */
export const createEnhancedStore = <T extends EnhancedState>(
  storeCreator: StateCreator<T>,
  persistConfig?: PersistConfig<T>,
  enableDevtools: boolean = process.env.NODE_ENV === 'development'
): StateCreator<T, [], [['zustand/persist', Partial<T>], ['zustand/devtools', never], ['zustand/subscribeWithSelector', never]]> => {
  let enhancedCreator = storeCreator;
  
  // Add subscribeWithSelector for advanced subscriptions
  enhancedCreator = subscribeWithSelector(enhancedCreator) as StateCreator<T>;
  
  // Add devtools in development
  if (enableDevtools) {
    enhancedCreator = devtools(enhancedCreator, {
      name: persistConfig?.name || 'Store'
    }) as StateCreator<T>;
  }
  
  // Add persistence if config provided
  if (persistConfig) {
    enhancedCreator = persist(
      enhancedCreator,
      createPersistOptions(persistConfig)
    ) as StateCreator<T>;
  }
  
  return enhancedCreator as StateCreator<T, [], [['zustand/persist', Partial<T>], ['zustand/devtools', never], ['zustand/subscribeWithSelector', never]]>;
};

/**
 * Cache management utilities
 */
export class StoreCache<T> {
  private readonly cache: Map<string, { data: T; timestamp: number }> = new Map();
  private readonly ttl: number;
  
  constructor(ttlSeconds: number = 300) { // 5 minutes default
    this.ttl = ttlSeconds * 1000;
  }
  
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Performance monitoring for stores
 */
export class StorePerformanceMonitor {
  private readonly metrics: Map<string, number[]> = new Map();
  
  measureAction<T>(actionName: string, action: () => T): T {
    const start = performance.now();
    const result = action();
    const duration = performance.now() - start;
    
    if (!this.metrics.has(actionName)) {
      this.metrics.set(actionName, []);
    }
    this.metrics.get(actionName)!.push(duration);
    
    // Log slow actions
    if (duration > 100) {
      console.warn(`Slow store action: ${actionName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  
  getMetrics(actionName: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(actionName);
    if (!measurements || measurements.length === 0) return null;
    
    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }
  
  clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Subscription manager for cleanup
 */
export class SubscriptionManager {
  private subscriptions: (() => void)[] = [];
  
  add(unsubscribe: () => void): void {
    this.subscriptions.push(unsubscribe);
  }
  
  clearAll(): void {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }
}

/**
 * Export type helpers
 */
export type WithEnhancedState<T> = T & EnhancedState;
export type StoreSelector<T, R> = (state: T) => R;
export type StoreSubscriber<T> = (state: T, prevState: T) => void;