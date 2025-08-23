/**
 * Loading States Components
 * Comprehensive loading indicators for all async operations
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useAccessibility } from './AccessibilityProvider';

// Loading Spinner Component
export const LoadingSpinner: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
  fullScreen?: boolean;
}> = ({ 
  size = 'medium', 
  color = 'var(--color-primary)',
  label = 'Loading...',
  fullScreen = false 
}) => {
  const { announce } = useAccessibility();
  
  useEffect(() => {
    announce(label, 'polite');
  }, [label, announce]);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const spinner = (
    <div
      className={`loading-spinner ${sizeClasses[size]}`}
      role="status"
      aria-label={label}
    >
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        style={{ color }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen" aria-busy="true">
        <div className="loading-fullscreen-content">
          {spinner}
          <p className="loading-fullscreen-text">{label}</p>
        </div>
      </div>
    );
  }

  return spinner;
};

// Skeleton Loader Component
export const SkeletonLoader: React.FC<{
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}> = ({
  width = '100%',
  height = '20px',
  variant = 'text',
  animation = 'pulse',
  className = '',
}) => {
  const variantClasses = {
    text: 'skeleton-text',
    circular: 'skeleton-circular',
    rectangular: 'skeleton-rectangular',
  };

  const animationClasses = {
    pulse: 'skeleton-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={`skeleton-loader ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
};

// Progress Bar Component
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  indeterminate?: boolean;
}> = ({
  value,
  max = 100,
  label = 'Loading progress',
  showPercentage = true,
  color = 'var(--color-primary)',
  size = 'medium',
  indeterminate = false,
}) => {
  const percentage = Math.round((value / max) * 100);
  const { announce } = useAccessibility();

  useEffect(() => {
    if (!indeterminate && percentage % 25 === 0) {
      announce(`${percentage}% complete`);
    }
  }, [percentage, indeterminate, announce]);

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-4',
  };

  return (
    <div className="progress-container" role="progressbar" 
         aria-valuenow={indeterminate ? undefined : value}
         aria-valuemin={0}
         aria-valuemax={max}
         aria-label={label}>
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div
          className={indeterminate ? 'progress-fill progress-indeterminate' : 'progress-fill'}
          style={{
            width: indeterminate ? '30%' : `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showPercentage && !indeterminate && (
        <span className="progress-label">{percentage}%</span>
      )}
    </div>
  );
};

// Loading Button Component
export const LoadingButton: React.FC<{
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({
  loading,
  disabled = false,
  onClick,
  loadingText = 'Processing...',
  children,
  className = '',
  variant = 'primary',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`loading-button loading-button--${variant} ${className}`}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="currentColor" />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Content Loader Component
export const ContentLoader: React.FC<{
  loading: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}> = ({
  loading,
  error,
  empty = false,
  emptyMessage = 'No data available',
  errorMessage = 'An error occurred',
  onRetry,
  children,
  skeleton,
}) => {
  const { announce } = useAccessibility();

  useEffect(() => {
    if (error) {
      announce(errorMessage, 'assertive');
    } else if (empty) {
      announce(emptyMessage, 'polite');
    }
  }, [error, empty, errorMessage, emptyMessage, announce]);

  if (loading) {
    return skeleton || <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="content-error" role="alert">
        <p className="content-error-message">{errorMessage}</p>
        {error.message && (
          <details className="content-error-details">
            <summary>Error details</summary>
            <pre>{error.message}</pre>
          </details>
        )}
        {onRetry && (
          <button onClick={onRetry} className="content-error-retry">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="content-empty" role="status">
        <p className="content-empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Lazy Load Wrapper Component
export const LazyLoadWrapper: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  delay?: number;
}> = ({ children, placeholder, delay = 200 }) => {
  const [showContent, setShowContent] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!showContent) {
    return <>{placeholder || <LoadingSpinner />}</>;
  }

  return <>{children}</>;
};

// Infinite Scroll Loader Component
export const InfiniteScrollLoader: React.FC<{
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  children: React.ReactNode;
}> = ({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100,
  children,
}) => {
  const [loaderRef, setLoaderRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(loaderRef);

    return () => {
      if (loaderRef) {
        observer.unobserve(loaderRef);
      }
    };
  }, [loaderRef, hasMore, loading, onLoadMore, threshold]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={setLoaderRef} className="infinite-scroll-loader">
          {loading && <LoadingSpinner label="Loading more items..." />}
        </div>
      )}
    </>
  );
};

// Async Data Hook
export const useAsyncData = <T,>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, retry: execute };
};

// Loading Dots Component
export const LoadingDots: React.FC<{
  color?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ color = 'var(--color-primary)', size = 'medium' }) => {
  const sizeClasses = {
    small: 'loading-dots--small',
    medium: 'loading-dots--medium',
    large: 'loading-dots--large',
  };

  return (
    <div className={`loading-dots ${sizeClasses[size]}`} aria-label="Loading">
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </div>
  );
};

// Typing Indicator Component
export const TypingIndicator: React.FC<{
  user?: string;
}> = ({ user }) => {
  const { announce } = useAccessibility();
  const message = user ? `${user} is typing` : 'Someone is typing';

  useEffect(() => {
    announce(message, 'polite');
  }, [message, announce]);

  return (
    <div className="typing-indicator" role="status" aria-label={message}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default {
  LoadingSpinner,
  SkeletonLoader,
  ProgressBar,
  LoadingButton,
  ContentLoader,
  LazyLoadWrapper,
  InfiniteScrollLoader,
  LoadingDots,
  TypingIndicator,
  useAsyncData,
};

// Export Spinner as an alias to LoadingSpinner for backward compatibility
export { LoadingSpinner as Spinner };