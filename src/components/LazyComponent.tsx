/**
 * Lazy Component Loader with Enhanced Features
 * 
 * Provides optimized lazy loading with loading states, error boundaries,
 * and preloading strategies for the Astral Core mental health platform.
 */

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import { SimpleErrorBoundary } from './SimpleErrorBoundary';

export interface LazyComponentProps {
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

export interface LazyLoadOptions {
  skeleton?: 'default' | 'card' | 'list' | 'form' | 'chat' | 'dashboard';
  errorMessage?: string;
  retryable?: boolean;
  preloadStrategy?: 'idle' | 'visible' | 'hover' | 'immediate';
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="lazy-error-fallback">
    <div className="error-content">
      <h3>Something went wrong</h3>
      <p>We're having trouble loading this content. Please try again.</p>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={resetErrorBoundary} className="retry-button">
        Try again
      </button>
    </div>
  </div>
);

// Preloading strategies
export const PreloadStrategies = {
  idle: (loadComponent: () => Promise<unknown>) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadComponent());
    } else {
      setTimeout(loadComponent, 100);
    }
  },
  
  visible: (loadComponent: () => Promise<unknown>, element?: Element) => {
    if ('IntersectionObserver' in window && element) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadComponent();
            observer.disconnect();
          }
        });
      });
      observer.observe(element);
    } else {
      loadComponent();
    }
  },
  
  hover: (loadComponent: () => Promise<unknown>, element?: Element) => {
    if (element) {
      const handleMouseEnter = () => {
        loadComponent();
        element.removeEventListener('mouseenter', handleMouseEnter);
      };
      element.addEventListener('mouseenter', handleMouseEnter);
    }
  },
  
  immediate: (loadComponent: () => Promise<unknown>) => {
    loadComponent();
  }
};

// Enhanced lazy wrapper with preloading and error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    skeleton = 'default',
    retryable = true,
    preloadStrategy = 'idle'
  } = options;

  // Create the lazy component
  const LazyComponent = lazy(importFn);

  // Store the import function for preloading
  const preloadComponent = () => importFn();

  // Enhanced wrapper component
  const EnhancedLazyComponent: React.FC<LazyComponentProps & any> = ({
    fallback,
    errorFallback = DefaultErrorFallback,
    onError,
    preload = false,
    priority = 'medium',
    className = '',
    ...props
  }) => {
    const [retryCount, setRetryCount] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle preloading
    React.useEffect(() => {
      if (preload || preloadStrategy === 'immediate') {
        preloadComponent();
      } else {
        const element = containerRef.current;
        
        switch (preloadStrategy) {
          case 'idle':
            PreloadStrategies.idle(preloadComponent);
            break;
          case 'visible':
            PreloadStrategies.visible(preloadComponent, element || undefined);
            break;
          case 'hover':
            PreloadStrategies.hover(preloadComponent, element || undefined);
            break;
        }
      }
    }, [preload, preloadStrategy]);

    // Custom error handler with retry capability
    const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
      console.error(`Lazy component error (attempt ${retryCount + 1}):`, error);
      
      if (onError) {
        onError(error, errorInfo);
      }

      // Analytics integration point
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Lazy Component Error', {
          error: error.message,
          component: importFn.toString(),
          retryCount,
          userAgent: navigator.userAgent
        });
      }
    }, [onError, retryCount]);

    const handleReset = React.useCallback(() => {
      setRetryCount(prev => prev + 1);
    }, []);

    // Generate appropriate loading skeleton
    const getLoadingSkeleton = () => {
      if (fallback) return fallback;
      
      // Map skeleton types to LoadingSkeleton variant types
      let loadingVariant: 'post' | 'comment' | 'profile' | 'chat' = 'post';
      
      if (skeleton === 'chat') {
        loadingVariant = 'chat';
      } else if (skeleton === 'form' || skeleton === 'card') {
        loadingVariant = 'profile';  // Use profile for form/card skeletons
      } else if (skeleton === 'list') {
        loadingVariant = 'comment';  // Use comment for list skeletons
      } else if (skeleton === 'dashboard') {
        loadingVariant = 'post';  // Use post for dashboard skeletons
      }
      
      return (
        <LoadingSkeleton 
          variant={loadingVariant}
          className={`lazy-loading ${className}`}
        />
      );
    };

    // Enhanced error fallback with retry
    const EnhancedErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
      error, 
      resetErrorBoundary 
    }) => {
      const handleRetry = () => {
        resetErrorBoundary();
        handleReset();
      };

      return (
        <div className={`lazy-error-container ${className}`}>
          {React.createElement(errorFallback, { 
            error, 
            resetErrorBoundary: retryable ? handleRetry : resetErrorBoundary 
          })}
        </div>
      );
    };

    return (
      <div 
        ref={containerRef}
        className={`lazy-component-wrapper ${className}`}
        data-priority={priority}
      >
        <SimpleErrorBoundary
          fallback={<EnhancedErrorFallback error={new Error('Component failed')} resetErrorBoundary={handleReset} />}
          onError={handleError}
          resetKeys={[retryCount]}
        >
          <Suspense fallback={getLoadingSkeleton()}>
            <LazyComponent {...props} />
          </Suspense>
        </SimpleErrorBoundary>
      </div>
    );
  };

  // Attach preload function to component
  (EnhancedLazyComponent as any).preload = preloadComponent;

  return EnhancedLazyComponent;
}

// Route-based lazy loading for major views
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  routeOptions: LazyLoadOptions & {
    breadcrumb?: string;
    title?: string;
    requiresAuth?: boolean;
  } = {}
) => {
  const {
    breadcrumb,
    title,
    requiresAuth = false,
    ...lazyOptions
  } = routeOptions;

  const LazyRoute = createLazyComponent(importFn, {
    skeleton: 'dashboard',
    preloadStrategy: 'visible',
    ...lazyOptions
  });

  // Add route metadata
  (LazyRoute as any).routeMeta = {
    breadcrumb,
    title,
    requiresAuth
  };

  return LazyRoute;
};

// Bundle analyzer helper
export const getBundleInfo = () => {
  if (typeof window === 'undefined') return null;

  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const jsResources = resourceEntries.filter(entry => 
    entry.name.includes('.js') && !entry.name.includes('chrome-extension')
  );

  const cssResources = resourceEntries.filter(entry => 
    entry.name.includes('.css')
  );

  return {
    totalResources: resourceEntries.length,
    jsResources: jsResources.length,
    cssResources: cssResources.length,
    totalTransferSize: resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
    totalDecodedSize: resourceEntries.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
    mainBundle: jsResources.find(entry => entry.name.includes('index')),
    vendorBundle: jsResources.find(entry => entry.name.includes('vendor')),
    componentsBundle: jsResources.find(entry => entry.name.includes('components'))
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<ReturnType<typeof getBundleInfo>>(null);

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getBundleInfo());
    };

    // Initial measurement
    updateMetrics();

    // Update on new resources
    const observer = new PerformanceObserver((_list) => {
      updateMetrics();
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return metrics;
};

// CSS for lazy loading components
export const lazyComponentStyles = `
  .lazy-component-wrapper {
    position: relative;
    width: 100%;
  }

  .lazy-component-wrapper[data-priority="high"] {
    z-index: 100;
  }

  .lazy-component-wrapper[data-priority="medium"] {
    z-index: 50;
  }

  .lazy-component-wrapper[data-priority="low"] {
    z-index: 10;
  }

  .lazy-loading {
    animation: lazy-pulse 1.5s ease-in-out infinite;
  }

  @keyframes lazy-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .lazy-error-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
    background-color: var(--bg-secondary, #f8fafc);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 8px;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-content h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--red-600, #dc2626);
  }

  .error-content p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--text-secondary, #64748b);
    line-height: 1.5;
  }

  .error-content details {
    margin-bottom: 16px;
    text-align: left;
  }

  .error-content summary {
    cursor: pointer;
    font-size: 12px;
    color: var(--text-secondary, #64748b);
    margin-bottom: 8px;
  }

  .error-content pre {
    background-color: var(--gray-100, #f3f4f6);
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    color: var(--red-700, #b91c1c);
  }

  .retry-button {
    padding: 8px 16px;
    background-color: var(--blue-500, #3b82f6);
    color: var(--white, #ffffff);
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background-color: var(--blue-600, #2563eb);
  }

  .retry-button:focus {
    outline: 2px solid var(--blue-500, #3b82f6);
    outline-offset: 2px;
  }

  .lazy-error-container {
    width: 100%;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .lazy-error-fallback {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .error-content h3 {
      color: var(--red-400, #f87171);
    }

    .error-content p,
    .error-content summary {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .error-content pre {
      background-color: var(--gray-800, #1f2937);
      color: var(--red-300, #fca5a5);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .lazy-loading {
      animation: none;
    }
  }
`;

export default createLazyComponent;
