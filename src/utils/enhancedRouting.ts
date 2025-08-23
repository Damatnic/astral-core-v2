/**
 * Enhanced Route-Based Code Splitting
 * 
 * Builds upon existing index.tsx lazy loading with intelligent route optimization,
 * predictive loading, and mobile-specific performance enhancements.
 */

import React, { ComponentType, lazy, useEffect } from 'react';
import { createEnhancedLazyComponent, ComponentPreloader } from '../components/EnhancedLazyComponent';
import { initializeBundleOptimization } from './bundleOptimization';

// Type aliases
type Priority = 'low' | 'medium' | 'high';
type PrefetchTrigger = 'hover' | 'viewport' | 'immediate' | 'interaction';

// Route configuration interface
interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  preload?: boolean;
  priority?: Priority;
  dependencies?: string[];
  mobileOptimized?: boolean;
  prefetchTrigger?: PrefetchTrigger;
}

// Navigation patterns for predictive loading
interface NavigationPattern {
  from: string;
  to: string;
  probability: number;
  timestamp: number;
}

// Enhanced route manager
export class EnhancedRouteManager {
  private static routes = new Map<string, RouteConfig>();
  private static navigationHistory: NavigationPattern[] = [];
  private static preloadCache = new Set<string>();
  private static currentRoute = '';
  private static isInitialized = false;

  // Initialize the route manager
  static initialize(): void {
    if (this.isInitialized) return;

    // Initialize bundle optimization
    initializeBundleOptimization();

    // Setup navigation monitoring
    this.setupNavigationMonitoring();

    // Setup intersection observers for viewport-based preloading
    this.setupViewportPreloading();

    // Preload critical routes
    this.preloadCriticalRoutes();

    this.isInitialized = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Enhanced Route Manager initialized');
    }
  }

  // Register a route with enhanced lazy loading
  static registerRoute(config: RouteConfig): ComponentType<any> {
    const { path, component, priority = 'medium', mobileOptimized = true } = config;
    
    this.routes.set(path, config);

    // Create enhanced lazy component
    const EnhancedComponent = createEnhancedLazyComponent(
      () => Promise.resolve({ default: component }),
      {
        strategy: 'network-aware',
        trackPerformance: true,
        componentName: `Route_${path.replace(/[^\w]/g, '_')}`,
        priority,
        respectDataSaver: mobileOptimized,
        maxRetries: 2,
        retryDelay: 1000,
      }
    );

    // Setup preloading if specified
    if (config.preload) {
      this.schedulePreload(path, priority);
    }

    return EnhancedComponent;
  }

  // Enhanced version of existing lazy route creation
  static createLazyRoute(
    importFn: () => Promise<{ default: ComponentType<any> }>,
    routePath: string,
    options: Partial<RouteConfig> = {}
  ): ComponentType<any> {
    const config: RouteConfig = {
      path: routePath,
      component: lazy(importFn) as ComponentType<any>,
      preload: false,
      priority: 'medium',
      mobileOptimized: true,
      prefetchTrigger: 'viewport',
      ...options,
    };

    this.routes.set(routePath, config);

    // Create enhanced lazy component with import function
    const EnhancedComponent = createEnhancedLazyComponent(
      importFn,
      {
        strategy: 'network-aware',
        trackPerformance: true,
        componentName: `Route_${routePath.replace(/[^\w]/g, '_')}`,
        priority: config.priority,
        respectDataSaver: config.mobileOptimized,
        maxRetries: 2,
        retryDelay: 1000,
      }
    );

    // Setup preloading based on trigger
    this.setupPreloadTrigger(routePath, config);

    return EnhancedComponent;
  }

  // Setup navigation monitoring for predictive loading
  private static setupNavigationMonitoring(): void {
    let lastPath = window.location.pathname;

    // Monitor history changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.recordNavigation(lastPath, args[2] as string);
      lastPath = args[2] as string;
      this.currentRoute = lastPath;
      originalPushState.apply(history, args);
      this.onRouteChange(lastPath);
    };

    history.replaceState = (...args) => {
      lastPath = args[2] as string;
      this.currentRoute = lastPath;
      originalReplaceState.apply(history, args);
      this.onRouteChange(lastPath);
    };

    // Monitor popstate events
    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname;
      this.recordNavigation(lastPath, newPath);
      lastPath = newPath;
      this.currentRoute = newPath;
      this.onRouteChange(newPath);
    });
  }

  // Record navigation pattern
  private static recordNavigation(from: string, to: string): void {
    if (from === to) return;

    const pattern: NavigationPattern = {
      from,
      to,
      probability: 1,
      timestamp: Date.now(),
    };

    this.navigationHistory.push(pattern);

    // Keep only recent history (last 100 navigations)
    if (this.navigationHistory.length > 100) {
      this.navigationHistory.shift();
    }

    // Update probabilities
    this.updateNavigationProbabilities();
  }

  // Update navigation probabilities based on history
  private static updateNavigationProbabilities(): void {
    const patterns = new Map<string, { count: number; total: number }>();

    this.navigationHistory.forEach(({ from, to }) => {
      const key = `${from}->${to}`;
      const existing = patterns.get(key) || { count: 0, total: 0 };
      existing.count += 1;
      patterns.set(key, existing);

      // Count total navigations from 'from' route
      const fromKey = `${from}->*`;
      const fromTotal = patterns.get(fromKey) || { count: 0, total: 0 };
      fromTotal.total += 1;
      patterns.set(fromKey, fromTotal);
    });

    // Update probabilities in navigation history
    this.navigationHistory.forEach(pattern => {
      const key = `${pattern.from}->${pattern.to}`;
      const fromKey = `${pattern.from}->*`;
      const patternData = patterns.get(key);
      const totalData = patterns.get(fromKey);

      if (patternData && totalData && totalData.total > 0) {
        pattern.probability = patternData.count / totalData.total;
      }
    });
  }

  // Handle route changes
  private static onRouteChange(newPath: string): void {
    // Preload likely next routes
    this.preloadLikelyRoutes(newPath);

    // Cleanup unused resources
    this.cleanupUnusedResources();
  }

  // Preload likely routes based on navigation patterns
  private static preloadLikelyRoutes(currentPath: string): void {
    const likelyRoutes = this.getLikelyNextRoutes(currentPath);
    
    likelyRoutes.forEach(({ route, probability }) => {
      if (probability > 0.3 && !this.preloadCache.has(route)) {
        this.schedulePreload(route, probability > 0.7 ? 'high' : 'medium');
      }
    });
  }

  // Get likely next routes based on navigation patterns
  private static getLikelyNextRoutes(currentPath: string): Array<{ route: string; probability: number }> {
    const routes: Array<{ route: string; probability: number }> = [];
    
    // Find patterns starting from current path
    const relevantPatterns = this.navigationHistory.filter(p => p.from === currentPath);
    
    // Group by destination and sum probabilities
    const routeProbabilities = new Map<string, number>();
    relevantPatterns.forEach(pattern => {
      const existing = routeProbabilities.get(pattern.to) || 0;
      routeProbabilities.set(pattern.to, existing + pattern.probability);
    });

    // Convert to array and sort by probability
    routeProbabilities.forEach((probability, route) => {
      routes.push({ route, probability });
    });

    return routes.sort((a, b) => b.probability - a.probability).slice(0, 3);
  }

  // Setup preload triggers
  private static setupPreloadTrigger(routePath: string, config: RouteConfig): void {
    const { prefetchTrigger = 'viewport' } = config;

    switch (prefetchTrigger) {
      case 'immediate':
        this.schedulePreload(routePath, config.priority);
        break;
      
      case 'hover':
        this.setupHoverPreload(routePath, config.priority);
        break;
      
      case 'viewport':
        this.setupViewportPreload(routePath, config.priority);
        break;
      
      case 'interaction':
        this.setupInteractionPreload(routePath, config.priority);
        break;
    }
  }

  // Setup hover-based preloading
  private static setupHoverPreload(routePath: string, priority?: Priority): void {
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.getAttribute('href') === routePath) {
        this.schedulePreload(routePath, priority);
      }
    });
  }

  // Setup viewport-based preloading
  private static setupViewportPreload(routePath: string, priority?: Priority): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLElement;
          const href = link.getAttribute('href');
          
          if (href === routePath) {
            this.schedulePreload(routePath, priority);
            observer.unobserve(link);
          }
        }
      });
    }, { rootMargin: '100px' });

    // Observe all links to this route
    setTimeout(() => {
      const links = document.querySelectorAll(`a[href="${routePath}"]`);
      links.forEach(link => observer.observe(link));
    }, 1000);
  }

  // Setup interaction-based preloading
  private static setupInteractionPreload(routePath: string, priority?: Priority): void {
    const events = ['touchstart', 'mousedown'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && link.getAttribute('href') === routePath) {
          this.schedulePreload(routePath, priority);
        }
      }, { passive: true });
    });
  }

  // Setup viewport preloading for all routes
  private static setupViewportPreloading(): void {
    const handleIntersection = (entry: IntersectionObserverEntry, observer: IntersectionObserver) => {
      if (entry.isIntersecting) {
        const link = entry.target as HTMLElement;
        const href = link.getAttribute('href');
        
        if (href && this.routes.has(href)) {
          const config = this.routes.get(href)!;
          if (config.prefetchTrigger === 'viewport') {
            this.schedulePreload(href, config.priority);
            observer.unobserve(link);
          }
        }
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => handleIntersection(entry, observer));
    }, { rootMargin: '100px' });

    // Handle added nodes
    const handleAddedNodes = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const links = element.querySelectorAll('a[href]');
        links.forEach(link => observer.observe(link));
      }
    };

    // Observe links as they appear
    const linkObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(handleAddedNodes);
      });
    });

    linkObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Preload critical routes immediately
  private static preloadCriticalRoutes(): void {
    const criticalRoutes = [
      '/',
      '/chat',
      '/dashboard',
    ];

    criticalRoutes.forEach(route => {
      if (this.routes.has(route)) {
        this.schedulePreload(route, 'high');
      }
    });
  }

  // Schedule route preloading
  private static schedulePreload(routePath: string, priority: Priority = 'medium'): void {
    if (this.preloadCache.has(routePath)) return;

    this.preloadCache.add(routePath);
    const config = this.routes.get(routePath);
    
    if (config && config.component) {
      ComponentPreloader.addToQueue(
        `route_${routePath}`,
        () => Promise.resolve({ default: config.component }),
        priority
      );
    }
  }

  // Cleanup unused resources
  private static cleanupUnusedResources(): void {
    // This would typically involve analyzing which routes haven't been visited
    // and cleaning up their resources if memory is constrained
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Cleaning up unused route resources');
    }
  }

  // Get navigation statistics
  static getNavigationStats() {
    return {
      totalNavigations: this.navigationHistory.length,
      currentRoute: this.currentRoute,
      preloadedRoutes: Array.from(this.preloadCache),
      registeredRoutes: Array.from(this.routes.keys()),
    };
  }

  // Get route performance metrics
  static getRouteMetrics(routePath: string) {
    const config = this.routes.get(routePath);
    return {
      registered: !!config,
      preloaded: this.preloadCache.has(routePath),
      priority: config?.priority,
      mobileOptimized: config?.mobileOptimized,
    };
  }
}

// Hook for using enhanced routing
export const useEnhancedRouting = () => {
  useEffect(() => {
    EnhancedRouteManager.initialize();
  }, []);

  return {
    createLazyRoute: EnhancedRouteManager.createLazyRoute,
    getNavigationStats: EnhancedRouteManager.getNavigationStats,
    getRouteMetrics: EnhancedRouteManager.getRouteMetrics,
  };
};

// HOC for route performance tracking
export const withRouteTracking = <P extends object>(
  Component: ComponentType<P>,
  routePath: string
): ComponentType<P> => {
  const TrackedComponent: React.FC<P> = (props) => {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Route ${routePath} render time: ${renderTime.toFixed(2)}ms`);
        }
      };
    }, []);

    return React.createElement(Component, props);
  };

  TrackedComponent.displayName = `withRouteTracking(${Component.displayName || Component.name})`;
  return TrackedComponent as ComponentType<P>;
};

export default {
  EnhancedRouteManager,
  useEnhancedRouting,
  withRouteTracking,
};
