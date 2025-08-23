/**
 * Mobile Performance Integration
 * 
 * Integration utilities to seamlessly enhance existing codebase with mobile performance optimizations.
 * Provides wrapper components and migration helpers for existing lazy loading infrastructure.
 */

import React, { ComponentType, useEffect } from 'react';
import { MobilePerformanceProvider } from '../components/MobilePerformanceProvider';
import { createEnhancedLazyComponent } from '../components/EnhancedLazyComponent';
import { EnhancedRouteManager } from '../utils/enhancedRouting';
import { initializeBundleOptimization } from '../utils/bundleOptimization';

// Integration configuration
interface PerformanceConfig {
  enableMobileOptimizations: boolean;
  enableBundleAnalysis: boolean;
  enableRouteOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  enablePreloading: boolean;
  debugMode: boolean;
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  enableMobileOptimizations: true,
  enableBundleAnalysis: process.env.NODE_ENV === 'development',
  enableRouteOptimization: true,
  enablePerformanceMonitoring: true,
  enablePreloading: true,
  debugMode: process.env.NODE_ENV === 'development',
};

// Performance integration HOC
export const withMobilePerformance = <P extends object>(
  WrappedComponent: ComponentType<P>,
  config: Partial<PerformanceConfig> = {}
) => {
  const mergedConfig = { ...defaultConfig, ...config };

  const EnhancedComponent: React.FC<P> = (props) => {
    useEffect(() => {
      // Initialize performance optimizations
      if (mergedConfig.enableBundleAnalysis) {
        initializeBundleOptimization();
      }

      if (mergedConfig.enableRouteOptimization) {
        EnhancedRouteManager.initialize();
      }

      if (mergedConfig.debugMode) {
        console.log('🚀 Mobile performance optimizations initialized');
      }
    }, []);

    if (mergedConfig.enableMobileOptimizations) {
      return (
        <MobilePerformanceProvider
          enableMonitoring={mergedConfig.enablePerformanceMonitoring}
          enablePreloading={mergedConfig.enablePreloading}
          optimizeForMobile={true}
        >
          <WrappedComponent {...props} />
        </MobilePerformanceProvider>
      );
    }

    return <WrappedComponent {...props} />;
  };

  EnhancedComponent.displayName = `withMobilePerformance(${WrappedComponent.displayName || WrappedComponent.name})`;
  return EnhancedComponent;
};

// Migration helper for existing React.lazy components
export const migrateLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  mobileOptimized: boolean = true
): ComponentType<any> => {
  if (mobileOptimized) {
    return createEnhancedLazyComponent(importFn, {
      strategy: 'network-aware',
      trackPerformance: true,
      componentName,
      respectDataSaver: true,
      priority: 'medium',
      maxRetries: 2,
      retryDelay: 1000,
    });
  }

  // Fallback to standard React.lazy
  return React.lazy(importFn) as ComponentType<any>;
};

// Enhanced index.tsx utilities - provides factory for mobile-optimized routes
export const createMobileOptimizedRoutes = () => {
  // Factory function to create mobile-optimized lazy routes
  const createOptimizedRoute = (
    importFn: () => Promise<{ default: ComponentType<any> }>,
    componentName: string,
    _priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    return migrateLazyComponent(importFn, componentName, true);
  };

  return {
    createOptimizedRoute,
    // Example usage patterns for existing views
    exampleUsage: {
      // High priority routes (immediate loading)
      createCriticalRoute: (importFn: () => Promise<{ default: ComponentType<any> }>, name: string) =>
        createOptimizedRoute(importFn, name, 'high'),
      
      // Medium priority routes (network-aware loading)
      createStandardRoute: (importFn: () => Promise<{ default: ComponentType<any> }>, name: string) =>
        createOptimizedRoute(importFn, name, 'medium'),
      
      // Low priority routes (deferred loading)
      createDeferredRoute: (importFn: () => Promise<{ default: ComponentType<any> }>, name: string) =>
        createOptimizedRoute(importFn, name, 'low'),
    }
  };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC<{ enabled?: boolean }> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  useEffect(() => {
    if (!enabled) return;

    const logPerformanceMetrics = () => {
      // Log navigation stats
      const navStats = EnhancedRouteManager.getNavigationStats();
      console.group('📊 Performance Metrics');
      console.log('Navigation Stats:', navStats);
      
      // Log Web Vitals if available
      if ('performance' in window && 'measure' in performance) {
        const marks = performance.getEntriesByType('measure');
        if (marks.length > 0) {
          console.log('Performance Marks:', marks);
        }
      }
      
      console.groupEnd();
    };

    // Log metrics periodically
    const interval = setInterval(logPerformanceMetrics, 30000);
    
    // Log metrics on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logPerformanceMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  return null;
};

// Mobile-specific optimizations activator
export const MobileOptimizationsProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<PerformanceConfig>;
}> = ({ children, config = {} }) => {
  const mergedConfig = { ...defaultConfig, ...config };

  return (
    <MobilePerformanceProvider
      enableMonitoring={mergedConfig.enablePerformanceMonitoring}
      enablePreloading={mergedConfig.enablePreloading}
      optimizeForMobile={mergedConfig.enableMobileOptimizations}
    >
      {children}
      <PerformanceMonitor enabled={mergedConfig.debugMode} />
    </MobilePerformanceProvider>
  );
};

// Hook for performance integration
export const usePerformanceIntegration = (config: Partial<PerformanceConfig> = {}) => {
  const mergedConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Initialize all performance systems
    if (mergedConfig.enableBundleAnalysis) {
      initializeBundleOptimization();
    }

    if (mergedConfig.enableRouteOptimization) {
      EnhancedRouteManager.initialize();
    }

    if (mergedConfig.debugMode) {
      console.log('🚀 Performance integration initialized', mergedConfig);
    }
  }, [mergedConfig]);

  return {
    createMobileOptimizedRoutes,
    migrateLazyComponent,
    getNavigationStats: EnhancedRouteManager.getNavigationStats,
    getRouteMetrics: EnhancedRouteManager.getRouteMetrics,
  };
};

// Utility to wrap existing App component
export const enhanceAppWithMobilePerformance = (
  AppComponent: ComponentType<any>,
  config: Partial<PerformanceConfig> = {}
) => {
  return withMobilePerformance(AppComponent, config);
};

export default {
  withMobilePerformance,
  migrateLazyComponent,
  createMobileOptimizedRoutes,
  PerformanceMonitor,
  MobileOptimizationsProvider,
  usePerformanceIntegration,
  enhanceAppWithMobilePerformance,
};
