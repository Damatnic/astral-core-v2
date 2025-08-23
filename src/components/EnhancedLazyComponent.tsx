/**
 * Enhanced Lazy Component Wrapper
 * 
 * Advanced lazy loading wrapper that builds on existing React.lazy infrastructure
 * with mobile-optimized loading strategies, intelligent preloading, and performance monitoring.
 */

import React, { Suspense, ComponentType, lazy, useEffect, useState, useCallback } from 'react';
import { useMobilePerformance, useComponentRenderTracker, useNetworkAwareLoading } from './MobilePerformanceProvider';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorState } from './ErrorState';

// Enhanced loading options
interface LazyLoadOptions {
  // Loading strategy
  strategy?: 'immediate' | 'viewport' | 'interaction' | 'network-aware';
  
  // Preload timing
  preloadDelay?: number;
  
  // Custom loading component
  fallback?: React.ComponentType;
  
  // Error handling
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  
  // Performance tracking
  trackPerformance?: boolean;
  
  // Component name for tracking
  componentName?: string;
  
  // Viewport offset for intersection observer
  rootMargin?: string;
  
  // Network-aware loading
  respectDataSaver?: boolean;
  
  // Bundle chunk priority
  priority?: 'low' | 'medium' | 'high';
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
}

// Retry state interface
interface RetryState {
  attempts: number;
  isRetrying: boolean;
  lastError: Error | null;
}

// Enhanced lazy component creator
export function createEnhancedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    strategy = 'network-aware',
    preloadDelay = 0,
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback,
    trackPerformance = true,
    componentName = 'LazyComponent',
    rootMargin = '50px',
    respectDataSaver = true,
    priority = 'medium',
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  // Create lazy component with error boundary
  const LazyComponent = lazy(() => {
    const startTime = performance.now();
    
    return importFn()
      .then(module => {
        const loadTime = performance.now() - startTime;
        
        // Track bundle load time
        if (trackPerformance && 'reportWebVital' in window) {
          (window as any).reportWebVital?.(`${componentName}_bundle_load`, loadTime);
        }
        
        return module;
      })
      .catch(error => {
        console.warn(`Failed to load component ${componentName}:`, error);
        throw error;
      });
  });

  // Enhanced wrapper component
  const EnhancedLazyWrapper: ComponentType<React.ComponentProps<T>> = (props) => {
    const [shouldLoad, setShouldLoad] = useState(strategy === 'immediate');
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [retryState, setRetryState] = useState<RetryState>({
      attempts: 0,
      isRetrying: false,
      lastError: null,
    });

    const { optimizeForMobile } = useMobilePerformance();
    const { shouldLoadImmediately, shouldPreload, networkInfo, deviceInfo } = useNetworkAwareLoading();
    
    // Track component render time
    if (trackPerformance) {
      useComponentRenderTracker(componentName);
    }

    // Network-aware loading logic
    useEffect(() => {
      if (strategy === 'network-aware') {
        // Respect data saver setting
        if (respectDataSaver && networkInfo.saveData) {
          return;
        }

        // Load immediately on good connections
        if (shouldLoadImmediately) {
          setShouldLoad(true);
          return;
        }

        // Delay loading on slower connections
        const delay = networkInfo.effectiveType === '3g' ? 1000 : 
                     networkInfo.effectiveType === '2g' ? 2000 : 500;
        
        const timer = setTimeout(() => setShouldLoad(true), delay);
        return () => clearTimeout(timer);
      }
    }, [strategy, shouldLoadImmediately, networkInfo, respectDataSaver]);

    // Viewport-based loading
    useEffect(() => {
      if (strategy === 'viewport' && !shouldLoad) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              
              // Delay loading slightly to avoid loading too many components at once
              setTimeout(() => setShouldLoad(true), preloadDelay);
              
              observer.disconnect();
            }
          },
          { rootMargin }
        );

        // Create a placeholder element to observe
        const placeholder = document.createElement('div');
        placeholder.style.height = '1px';
        document.body.appendChild(placeholder);
        observer.observe(placeholder);

        return () => {
          observer.disconnect();
          if (placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
          }
        };
      }
    }, [strategy, shouldLoad, rootMargin, preloadDelay]);

    // Interaction-based loading
    useEffect(() => {
      if (strategy === 'interaction' && !shouldLoad) {
        const handleInteraction = () => setShouldLoad(true);
        
        const events = ['mouseenter', 'click', 'touchstart', 'focus'];
        events.forEach(event => {
          document.addEventListener(event, handleInteraction, { once: true, passive: true });
        });

        return () => {
          events.forEach(event => {
            document.removeEventListener(event, handleInteraction);
          });
        };
      }
    }, [strategy, shouldLoad]);

    // Preloading logic
    useEffect(() => {
      if (shouldPreload && priority === 'high' && !shouldLoad) {
        // Preload the component bundle
        const timer = setTimeout(() => {
          importFn().catch(() => {
            // Silently fail preload attempts
          });
        }, preloadDelay);

        return () => clearTimeout(timer);
      }
    }, [shouldPreload, priority, shouldLoad, preloadDelay]);

    // Retry logic
    const handleRetry = useCallback(() => {
      if (retryState.attempts < maxRetries) {
        setRetryState(prev => ({
          ...prev,
          attempts: prev.attempts + 1,
          isRetrying: true,
        }));

        setTimeout(() => {
          setRetryState(prev => ({
            ...prev,
            isRetrying: false,
            lastError: null,
          }));
          setShouldLoad(true);
        }, retryDelay);
      }
    }, [retryState.attempts, maxRetries, retryDelay]);

    // Error boundary component
    const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [hasError, setHasError] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      useEffect(() => {
        const handleError = (event: ErrorEvent) => {
          setHasError(true);
          setError(new Error(event.message));
          setRetryState(prev => ({ ...prev, lastError: new Error(event.message) }));
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);

      if (hasError && error) {
        if (CustomErrorFallback) {
          return <CustomErrorFallback error={error} retry={handleRetry} />;
        }
        
        return (
          <ErrorState 
            title="Component Loading Error"
            message={`Failed to load ${componentName}`}
            onRetry={retryState.attempts < maxRetries ? handleRetry : undefined}
            isRetrying={retryState.isRetrying}
          />
        );
      }

      return <>{children}</>;
    };

    // Loading fallback component
    const LoadingFallback = CustomFallback || (() => (
      <div className="lazy-loading-container" style={{ 
        minHeight: '100px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <LoadingSpinner 
          size={optimizeForMobile && deviceInfo.isMobile ? 'small' : 'medium'}
          message={`Loading ${componentName}...`}
        />
      </div>
    ));

    // Don't render anything if we shouldn't load yet
    if (!shouldLoad) {
      // Show placeholder for viewport strategy
      if (strategy === 'viewport') {
        return (
          <div 
            className="lazy-placeholder"
            style={{ 
              minHeight: '50px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}
          >
            {isIntersecting ? 'Loading...' : ''}
          </div>
        );
      }

      // Show loading state for interaction strategy
      if (strategy === 'interaction') {
        return (
          <div 
            className="lazy-interaction-trigger"
            style={{ 
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '20px'
            }}
            onClick={() => setShouldLoad(true)}
          >
            Click to load {componentName}
          </div>
        );
      }

      return <LoadingFallback />;
    }

    // Render the lazy component
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Set display name for debugging
  EnhancedLazyWrapper.displayName = `EnhancedLazy(${componentName})`;

  return EnhancedLazyWrapper;
}

// Preload utility for critical components
export const preloadComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  priority: 'low' | 'high' = 'low'
): Promise<void> => {
  return importFn()
    .then(() => {
      // Component successfully preloaded
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component preloaded with ${priority} priority`);
      }
    })
    .catch((error) => {
      console.warn('Failed to preload component:', error);
    });
};

// Bundle analyzer utility (development only)
export const analyzeBundleSize = async (
  componentName: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const startTime = performance.now();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

  try {
    await importFn();
    
    const loadTime = performance.now() - startTime;
    const memoryIncrease = ((performance as any).memory?.usedJSHeapSize || 0) - initialMemory;
    
    console.group(`📦 Bundle Analysis: ${componentName}`);
    console.log(`⏱️ Load Time: ${loadTime.toFixed(2)}ms`);
    console.log(`💾 Memory Impact: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Failed to analyze ${componentName}:`, error);
  }
};

// Performance-aware component preloader
export class ComponentPreloader {
  private static preloadCache = new Map<string, Promise<unknown>>();
  private static preloadQueue: Array<{ name: string; importFn: () => Promise<unknown>; priority: number }> = [];
  private static isProcessing = false;

  static addToQueue(
    name: string, 
    importFn: () => Promise<unknown>, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const priorityValue = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
    
    this.preloadQueue.push({ name, importFn, priority: priorityValue });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const { name, importFn } = this.preloadQueue.shift()!;
      
      if (!this.preloadCache.has(name)) {
        try {
          const startTime = performance.now();
          const promise = importFn();
          this.preloadCache.set(name, promise);
          
          await promise;
          
          const loadTime = performance.now() - startTime;
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Preloaded ${name} in ${loadTime.toFixed(2)}ms`);
          }
        } catch (error) {
          console.warn(`❌ Failed to preload ${name}:`, error);
          this.preloadCache.delete(name);
        }
      }

      // Small delay to prevent blocking the main thread
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  static isPreloaded(name: string): boolean {
    return this.preloadCache.has(name);
  }

  static clearCache(): void {
    this.preloadCache.clear();
    this.preloadQueue.length = 0;
  }
}

// Mobile-optimized lazy component factory
export const createMobileLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: Partial<LazyLoadOptions> = {}
): ComponentType<React.ComponentProps<T>> => {
  return createEnhancedLazyComponent(importFn, {
    strategy: 'network-aware',
    trackPerformance: true,
    componentName,
    respectDataSaver: true,
    priority: 'medium',
    maxRetries: 2,
    retryDelay: 1000,
    rootMargin: '100px',
    ...options,
  });
};

export default {
  createEnhancedLazyComponent,
  createMobileLazyComponent,
  preloadComponent,
  analyzeBundleSize,
  ComponentPreloader,
};
