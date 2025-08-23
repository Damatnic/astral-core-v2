/**
 * Lazy CSS Loading Hook for Mental Health Platform
 * Dynamically loads CSS based on user interactions and mental health journey patterns
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LazyStyleConfig {
  href: string;
  media?: string;
  priority?: 'immediate' | 'high' | 'medium' | 'low';
  condition?: () => boolean;
  preload?: boolean;
}

interface LazyStylesStrategy {
  immediate: LazyStyleConfig[];
  interaction: LazyStyleConfig[];
  routes: Record<string, LazyStyleConfig[]>;
  responsive: LazyStyleConfig[];
  emotional: Record<string, LazyStyleConfig[]>;
  crisis: LazyStyleConfig[];
}

class CSSLoadingManager {
  private loadedStyles = new Set<string>();
  private preloadedStyles = new Set<string>();
  private interactionTriggered = false;

  /**
   * Load CSS with optimized loading strategy
   */
  loadCSS(config: LazyStyleConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const { href, media = 'all', priority = 'medium' } = config;
      
      if (this.loadedStyles.has(href)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = priority === 'immediate' ? media : 'only x';
      
      const onLoad = () => {
        if (link.media !== media) {
          link.media = media;
        }
        this.loadedStyles.add(href);
        link.onload = null;
        resolve();
      };

      const onError = () => {
        console.warn(`Failed to load CSS: ${href}`);
        link.onerror = null;
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      link.onload = onLoad;
      link.onerror = onError;

      // Fallback for older browsers
      if (priority !== 'immediate') {
        setTimeout(() => {
          if (link.media === 'only x') {
            onLoad();
          }
        }, 3000);
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Preload CSS for better performance
   */
  preloadCSS(href: string): void {
    if (this.preloadedStyles.has(href) || this.loadedStyles.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => this.preloadedStyles.add(href);
    
    document.head.appendChild(link);
  }

  /**
   * Check if a style has been loaded
   */
  isLoaded(href: string): boolean {
    return this.loadedStyles.has(href);
  }

  /**
   * Setup interaction-based loading
   */
  setupInteractionLoading(configs: LazyStyleConfig[]): void {
    if (this.interactionTriggered) return;

    const loadInteractionStyles = () => {
      configs.forEach(config => this.loadCSS(config));
      this.interactionTriggered = true;
    };

    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, loadInteractionStyles, { 
        once: true, 
        passive: true 
      });
    });
  }
}

// Global CSS manager instance
const cssManager = new CSSLoadingManager();

/**
 * Hook for lazy loading CSS styles
 */
export const useLazyStyles = (strategy?: Partial<LazyStylesStrategy>) => {
  const location = useLocation();
  const hasLoadedRef = useRef(false);

  // Default strategy for mental health platform
  const defaultStrategy: LazyStylesStrategy = {
    immediate: [
      { href: '/assets/critical-components.css', priority: 'immediate' },
      { href: '/assets/crisis-styles.css', priority: 'immediate' }
    ],
    interaction: [
      { href: '/assets/animations.css', priority: 'high' },
      { href: '/assets/transitions.css', priority: 'medium' },
      { href: '/assets/hover-effects.css', priority: 'low' }
    ],
    routes: {
      '/mood-tracker': [
        { href: '/assets/mood-tracker.css', priority: 'high' },
        { href: '/assets/charts.css', priority: 'medium' }
      ],
      '/chat': [
        { href: '/assets/chat.css', priority: 'high' },
        { href: '/assets/emoji.css', priority: 'medium' }
      ],
      '/crisis': [
        { href: '/assets/crisis-full.css', priority: 'immediate' },
        { href: '/assets/emergency.css', priority: 'immediate' }
      ],
      '/community': [
        { href: '/assets/community.css', priority: 'high' },
        { href: '/assets/social.css', priority: 'medium' }
      ],
      '/helpers': [
        { href: '/assets/helpers.css', priority: 'high' },
        { href: '/assets/certification.css', priority: 'medium' }
      ],
      '/settings': [
        { href: '/assets/settings.css', priority: 'medium' },
        { href: '/assets/preferences.css', priority: 'low' }
      ]
    },
    responsive: [
      { 
        href: '/assets/mobile.css', 
        media: '(max-width: 767px)', 
        priority: 'high',
        condition: () => window.innerWidth <= 767
      },
      { 
        href: '/assets/tablet.css', 
        media: '(min-width: 768px) and (max-width: 1023px)', 
        priority: 'medium',
        condition: () => window.innerWidth >= 768 && window.innerWidth <= 1023
      },
      { 
        href: '/assets/desktop.css', 
        media: '(min-width: 1024px)', 
        priority: 'medium',
        condition: () => window.innerWidth >= 1024
      }
    ],
    emotional: {
      'seeking-help': [
        { href: '/assets/help-seeking.css', priority: 'high' },
        { href: '/assets/support.css', priority: 'high' }
      ],
      'in-crisis': [
        { href: '/assets/crisis-intervention.css', priority: 'immediate' },
        { href: '/assets/emergency-ui.css', priority: 'immediate' }
      ],
      'distressed': [
        { href: '/assets/calming.css', priority: 'high' },
        { href: '/assets/breathing.css', priority: 'high' }
      ],
      'maintenance': [
        { href: '/assets/progress.css', priority: 'medium' },
        { href: '/assets/tracking.css', priority: 'medium' }
      ]
    },
    crisis: [
      { href: '/assets/crisis-emergency.css', priority: 'immediate' },
      { href: '/assets/offline-crisis.css', priority: 'immediate' },
      { href: '/assets/hotlines.css', priority: 'immediate' }
    ]
  };

  const mergedStrategy = { ...defaultStrategy, ...strategy };

  /**
   * Load immediate styles
   */
  const loadImmediateStyles = useCallback(async () => {
    try {
      const promises = mergedStrategy.immediate.map(config => cssManager.loadCSS(config));
      await Promise.all(promises);
    } catch (error) {
      console.warn('Failed to load some immediate styles:', error);
    }
  }, [mergedStrategy]);

  /**
   * Load route-specific styles
   */
  const loadRouteStyles = useCallback(async (pathname: string) => {
    for (const [route, configs] of Object.entries(mergedStrategy.routes)) {
      if (pathname.startsWith(route)) {
        try {
          const promises = configs.map(config => cssManager.loadCSS(config));
          await Promise.all(promises);
        } catch (error) {
          console.warn(`Failed to load styles for route ${route}:`, error);
        }
      }
    }
  }, [mergedStrategy]);

  /**
   * Load responsive styles based on viewport
   */
  const loadResponsiveStyles = useCallback(async () => {
    const applicableStyles = mergedStrategy.responsive.filter(config => 
      !config.condition || config.condition()
    );

    try {
      const promises = applicableStyles.map(config => cssManager.loadCSS(config));
      await Promise.all(promises);
    } catch (error) {
      console.warn('Failed to load some responsive styles:', error);
    }
  }, [mergedStrategy]);

  /**
   * Load emotional state specific styles
   */
  const loadEmotionalStyles = useCallback(async (emotionalState: string) => {
    const configs = mergedStrategy.emotional[emotionalState];
    if (configs) {
      try {
        const promises = configs.map(config => cssManager.loadCSS(config));
        await Promise.all(promises);
      } catch (error) {
        console.warn(`Failed to load emotional styles for ${emotionalState}:`, error);
      }
    }
  }, [mergedStrategy]);

  /**
   * Load crisis styles immediately
   */
  const loadCrisisStyles = useCallback(async () => {
    try {
      const promises = mergedStrategy.crisis.map(config => cssManager.loadCSS(config));
      await Promise.all(promises);
    } catch (error) {
      console.warn('Failed to load crisis styles:', error);
    }
  }, [mergedStrategy]);

  /**
   * Preload likely next styles based on current route
   */
  const preloadLikelyStyles = useCallback(() => {
    const currentPath = location.pathname;
    const likelyRoutes = {
      '/': ['/mood-tracker', '/chat', '/community'],
      '/mood-tracker': ['/journal', '/insights', '/progress'],
      '/chat': ['/community', '/helpers'],
      '/crisis': ['/emergency-contacts', '/coping-strategies'],
      '/community': ['/chat', '/helpers'],
      '/helpers': ['/chat', '/community']
    };

    const nextRoutes = likelyRoutes[currentPath as keyof typeof likelyRoutes] || [];
    nextRoutes.forEach(route => {
      const configs = mergedStrategy.routes[route];
      if (configs) {
        configs.forEach(config => cssManager.preloadCSS(config.href));
      }
    });
  }, [location.pathname, mergedStrategy]);

  // Initialize lazy loading on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Load immediate styles
    loadImmediateStyles();

    // Load responsive styles
    loadResponsiveStyles();

    // Setup interaction-based loading
    cssManager.setupInteractionLoading(mergedStrategy.interaction);

    // Setup resize listener for responsive styles
    const handleResize = () => {
      loadResponsiveStyles();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [loadImmediateStyles, loadResponsiveStyles, mergedStrategy.interaction]);

  // Load route-specific styles when route changes
  useEffect(() => {
    loadRouteStyles(location.pathname);
    
    // Preload likely next styles
    setTimeout(preloadLikelyStyles, 1000);
  }, [location.pathname, loadRouteStyles, preloadLikelyStyles]);

  return {
    loadEmotionalStyles,
    loadCrisisStyles,
    preloadStyles: cssManager.preloadCSS.bind(cssManager),
    isStyleLoaded: cssManager.isLoaded.bind(cssManager),
    cssManager
  };
};

/**
 * Higher-order component for components that need specific styles
 */
export const withLazyStyles = (styleConfigs: LazyStyleConfig[]) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WithLazyStylesComponent = (props: P) => {
      const { cssManager } = useLazyStyles();

      useEffect(() => {
        styleConfigs.forEach(config => cssManager.loadCSS(config));
      }, [cssManager]);

      return React.createElement(Component, props);
    };

    WithLazyStylesComponent.displayName = `withLazyStyles(${Component.displayName || Component.name})`;
    return WithLazyStylesComponent;
  };
};

/**
 * CSS optimization utilities
 */
export const cssOptimization = {
  /**
   * Mark critical CSS as loaded to hide loading screens
   */
  markCriticalCSSLoaded(): void {
    document.documentElement.classList.add('css-loaded');
  },

  /**
   * Monitor CSS loading performance
   */
  monitorCSSPerformance(): void {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('.css')) {
            console.log(`CSS loaded: ${entry.name} in ${entry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  },

  /**
   * Get CSS loading metrics
   */
  getCSSMetrics(): Record<string, number> {
    if (!('performance' in window)) return {};

    const entries = performance.getEntriesByType('resource');
    const cssEntries = entries.filter(entry => entry.name.includes('.css'));
    
    return {
      totalCSSFiles: cssEntries.length,
      totalCSSLoadTime: cssEntries.reduce((sum, entry) => sum + entry.duration, 0),
      avgCSSLoadTime: cssEntries.length > 0 
        ? cssEntries.reduce((sum, entry) => sum + entry.duration, 0) / cssEntries.length 
        : 0
    };
  }
};

export default useLazyStyles;
