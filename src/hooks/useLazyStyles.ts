/**
 * Lazy Styles Hook
 *
 * Performance-optimized hook for lazy loading and managing CSS styles
 * with intelligent caching, critical CSS detection, and responsive loading
 *
 * Features:
 * - Dynamic CSS loading based on component visibility
 * - Critical CSS prioritization and inline injection
 * - Media query responsive style loading
 * - Style dependency management and resolution
 * - CSS modules and scoped styles support
 * - Performance monitoring and optimization
 * - Memory-efficient style cleanup
 * - Theme-aware style loading
 *
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

// Style Definition Interface
interface StyleDefinition {
  id: string;
  url?: string;
  css?: string;
  media?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[];
  condition?: () => boolean;
  theme?: string;
  responsive?: {
    breakpoint: string;
    styles: string;
  }[];
}

// Style Load State Interface
interface StyleLoadState {
  id: string;
  status: 'pending' | 'loading' | 'loaded' | 'error' | 'cached';
  element?: HTMLStyleElement | HTMLLinkElement;
  loadTime?: number;
  size?: number;
  error?: string;
}

// Performance Metrics Interface
interface StylePerformanceMetrics {
  totalStyles: number;
  loadedStyles: number;
  criticalStyles: number;
  totalLoadTime: number;
  averageLoadTime: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: number;
}

// Hook Configuration Interface
interface UseLazyStylesConfig {
  // Loading Strategy
  enableLazyLoading: boolean;
  preloadCritical: boolean;
  loadOnIntersection: boolean;
  intersectionThreshold: number;
  
  // Performance
  enableCaching: boolean;
  maxCacheSize: number;
  preconnectDomains: string[];
  enablePreloading: boolean;
  
  // Responsive Loading
  enableResponsiveLoading: boolean;
  breakpoints: Record<string, number>;
  loadBasedOnViewport: boolean;
  
  // Theme Support
  enableThemeSupport: boolean;
  defaultTheme: string;
  themeChangeStrategy: 'replace' | 'overlay' | 'transition';
  
  // Cleanup
  autoCleanup: boolean;
  cleanupDelay: number;
  maxUnusedTime: number;
  
  // Monitoring
  enablePerformanceMonitoring: boolean;
  reportMetrics: boolean;
}

// Hook Return Type
interface UseLazyStylesReturn {
  // Style Management
  loadStyle: (definition: StyleDefinition) => Promise<void>;
  loadStyles: (definitions: StyleDefinition[]) => Promise<void>;
  unloadStyle: (id: string) => void;
  unloadStyles: (ids: string[]) => void;
  
  // State
  loadedStyles: Map<string, StyleLoadState>;
  isLoading: boolean;
  error: string | null;
  
  // Theme Management
  setTheme: (theme: string) => void;
  getCurrentTheme: () => string;
  getThemeStyles: (theme: string) => StyleDefinition[];
  
  // Performance
  getMetrics: () => StylePerformanceMetrics;
  clearCache: () => void;
  preloadStyles: (ids: string[]) => Promise<void>;
  
  // Responsive
  loadResponsiveStyles: (breakpoint: string) => Promise<void>;
  getCurrentBreakpoint: () => string;
  
  // Utilities
  isStyleLoaded: (id: string) => boolean;
  getStyleElement: (id: string) => HTMLElement | null;
  injectCriticalCSS: (css: string) => void;
}

// Default Configuration
const DEFAULT_CONFIG: UseLazyStylesConfig = {
  enableLazyLoading: true,
  preloadCritical: true,
  loadOnIntersection: false,
  intersectionThreshold: 0.1,
  enableCaching: true,
  maxCacheSize: 50,
  preconnectDomains: [],
  enablePreloading: true,
  enableResponsiveLoading: true,
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    wide: 1920
  },
  loadBasedOnViewport: true,
  enableThemeSupport: true,
  defaultTheme: 'default',
  themeChangeStrategy: 'replace',
  autoCleanup: true,
  cleanupDelay: 30000, // 30 seconds
  maxUnusedTime: 300000, // 5 minutes
  enablePerformanceMonitoring: true,
  reportMetrics: false
};

/**
 * Lazy Styles Hook
 * 
 * @param config - Configuration for lazy style loading
 * @returns Style loading utilities and state
 */
export function useLazyStyles(
  config: Partial<UseLazyStylesConfig> = {}
): UseLazyStylesReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [loadedStyles, setLoadedStyles] = useState<Map<string, StyleLoadState>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState(finalConfig.defaultTheme);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  
  // Refs
  const styleDefinitionsRef = useRef<Map<string, StyleDefinition>>(new Map());
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cleanupTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const performanceMetricsRef = useRef<StylePerformanceMetrics>({
    totalStyles: 0,
    loadedStyles: 0,
    criticalStyles: 0,
    totalLoadTime: 0,
    averageLoadTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0
  });
  
  // Detect current breakpoint
  const detectBreakpoint = useCallback(() => {
    const width = window.innerWidth;\n    const breakpoints = finalConfig.breakpoints;\n    \n    if (width <= breakpoints.mobile) return 'mobile';\n    if (width <= breakpoints.tablet) return 'tablet';\n    if (width <= breakpoints.desktop) return 'desktop';\n    return 'wide';\n  }, [finalConfig.breakpoints]);\n  \n  // Create style element\n  const createStyleElement = useCallback((definition: StyleDefinition): HTMLStyleElement | HTMLLinkElement => {\n    if (definition.url) {\n      // External stylesheet\n      const link = document.createElement('link');\n      link.rel = 'stylesheet';\n      link.href = definition.url;\n      link.id = definition.id;\n      \n      if (definition.media) {\n        link.media = definition.media;\n      }\n      \n      return link;\n    } else {\n      // Inline styles\n      const style = document.createElement('style');\n      style.id = definition.id;\n      style.textContent = definition.css || '';\n      \n      if (definition.media) {\n        style.media = definition.media;\n      }\n      \n      return style;\n    }\n  }, []);\n  \n  // Load single style\n  const loadStyle = useCallback(async (definition: StyleDefinition): Promise<void> => {\n    const { id } = definition;\n    \n    // Check if already loaded\n    const existingState = loadedStyles.get(id);\n    if (existingState && (existingState.status === 'loaded' || existingState.status === 'loading')) {\n      return;\n    }\n    \n    // Check condition\n    if (definition.condition && !definition.condition()) {\n      return;\n    }\n    \n    // Store definition\n    styleDefinitionsRef.current.set(id, definition);\n    \n    // Update state to loading\n    setLoadedStyles(prev => new Map(prev.set(id, {\n      id,\n      status: 'loading'\n    })));\n    \n    try {\n      const startTime = performance.now();\n      \n      // Check cache first\n      if (finalConfig.enableCaching && definition.css && cacheRef.current.has(id)) {\n        const cachedCSS = cacheRef.current.get(id)!;\n        \n        const style = document.createElement('style');\n        style.id = id;\n        style.textContent = cachedCSS;\n        \n        if (definition.media) {\n          style.media = definition.media;\n        }\n        \n        document.head.appendChild(style);\n        \n        const loadTime = performance.now() - startTime;\n        \n        setLoadedStyles(prev => new Map(prev.set(id, {\n          id,\n          status: 'cached',\n          element: style,\n          loadTime,\n          size: cachedCSS.length\n        })));\n        \n        // Update metrics\n        performanceMetricsRef.current.cacheHits++;\n        performanceMetricsRef.current.loadedStyles++;\n        \n        return;\n      }\n      \n      // Load dependencies first\n      if (definition.dependencies && definition.dependencies.length > 0) {\n        const dependencyPromises = definition.dependencies.map(depId => {\n          const depDefinition = styleDefinitionsRef.current.get(depId);\n          if (depDefinition) {\n            return loadStyle(depDefinition);\n          }\n          return Promise.resolve();\n        });\n        \n        await Promise.all(dependencyPromises);\n      }\n      \n      // Create and append element\n      const element = createStyleElement(definition);\n      \n      const loadPromise = new Promise<void>((resolve, reject) => {\n        if (definition.url) {\n          // External stylesheet\n          const link = element as HTMLLinkElement;\n          \n          link.onload = () => resolve();\n          link.onerror = () => reject(new Error(`Failed to load stylesheet: ${definition.url}`));\n          \n          // Preconnect to domain if configured\n          const url = new URL(definition.url);\n          if (finalConfig.preconnectDomains.includes(url.hostname)) {\n            const preconnect = document.createElement('link');\n            preconnect.rel = 'preconnect';\n            preconnect.href = url.origin;\n            document.head.appendChild(preconnect);\n          }\n        } else {\n          // Inline styles load immediately\n          resolve();\n        }\n      });\n      \n      document.head.appendChild(element);\n      await loadPromise;\n      \n      const loadTime = performance.now() - startTime;\n      const size = definition.css?.length || 0;\n      \n      // Cache CSS if enabled\n      if (finalConfig.enableCaching && definition.css) {\n        cacheRef.current.set(id, definition.css);\n        \n        // Manage cache size\n        if (cacheRef.current.size > finalConfig.maxCacheSize) {\n          const firstKey = cacheRef.current.keys().next().value;\n          cacheRef.current.delete(firstKey);\n        }\n      }\n      \n      // Update state\n      setLoadedStyles(prev => new Map(prev.set(id, {\n        id,\n        status: 'loaded',\n        element,\n        loadTime,\n        size\n      })));\n      \n      // Update metrics\n      performanceMetricsRef.current.cacheMisses++;\n      performanceMetricsRef.current.loadedStyles++;\n      performanceMetricsRef.current.totalLoadTime += loadTime;\n      performanceMetricsRef.current.averageLoadTime = \n        performanceMetricsRef.current.totalLoadTime / performanceMetricsRef.current.loadedStyles;\n      \n      if (definition.priority === 'critical') {\n        performanceMetricsRef.current.criticalStyles++;\n      }\n      \n      logger.debug('Style loaded', { id, loadTime, size, priority: definition.priority });\n      \n    } catch (error) {\n      setLoadedStyles(prev => new Map(prev.set(id, {\n        id,\n        status: 'error',\n        error: error instanceof Error ? error.message : 'Unknown error'\n      })));\n      \n      logger.error('Failed to load style', { id, error });\n      throw error;\n    }\n  }, [loadedStyles, finalConfig, createStyleElement]);\n  \n  // Load multiple styles\n  const loadStyles = useCallback(async (definitions: StyleDefinition[]): Promise<void> => {\n    setIsLoading(true);\n    setError(null);\n    \n    try {\n      // Sort by priority\n      const sortedDefinitions = [...definitions].sort((a, b) => {\n        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };\n        return priorityOrder[a.priority] - priorityOrder[b.priority];\n      });\n      \n      // Load critical styles first\n      const criticalStyles = sortedDefinitions.filter(def => def.priority === 'critical');\n      if (criticalStyles.length > 0) {\n        await Promise.all(criticalStyles.map(def => loadStyle(def)));\n      }\n      \n      // Load remaining styles\n      const remainingStyles = sortedDefinitions.filter(def => def.priority !== 'critical');\n      await Promise.all(remainingStyles.map(def => loadStyle(def)));\n      \n    } catch (error) {\n      setError(error instanceof Error ? error.message : 'Failed to load styles');\n      throw error;\n    } finally {\n      setIsLoading(false);\n    }\n  }, [loadStyle]);\n  \n  // Unload style\n  const unloadStyle = useCallback((id: string) => {\n    const state = loadedStyles.get(id);\n    if (state && state.element) {\n      document.head.removeChild(state.element);\n    }\n    \n    setLoadedStyles(prev => {\n      const newMap = new Map(prev);\n      newMap.delete(id);\n      return newMap;\n    });\n    \n    // Clear cleanup timer\n    const timer = cleanupTimersRef.current.get(id);\n    if (timer) {\n      clearTimeout(timer);\n      cleanupTimersRef.current.delete(id);\n    }\n    \n    logger.debug('Style unloaded', { id });\n  }, [loadedStyles]);\n  \n  // Unload multiple styles\n  const unloadStyles = useCallback((ids: string[]) => {\n    ids.forEach(id => unloadStyle(id));\n  }, [unloadStyle]);\n  \n  // Theme management\n  const setTheme = useCallback((theme: string) => {\n    const previousTheme = currentTheme;\n    setCurrentTheme(theme);\n    \n    // Handle theme change strategy\n    if (finalConfig.themeChangeStrategy === 'replace') {\n      // Unload previous theme styles\n      const themeStyles = Array.from(styleDefinitionsRef.current.values())\n        .filter(def => def.theme === previousTheme);\n      \n      themeStyles.forEach(def => unloadStyle(def.id));\n      \n      // Load new theme styles\n      const newThemeStyles = Array.from(styleDefinitionsRef.current.values())\n        .filter(def => def.theme === theme);\n      \n      loadStyles(newThemeStyles);\n    }\n    \n    logger.info('Theme changed', { from: previousTheme, to: theme });\n  }, [currentTheme, finalConfig.themeChangeStrategy, unloadStyle, loadStyles]);\n  \n  const getCurrentTheme = useCallback(() => currentTheme, [currentTheme]);\n  \n  const getThemeStyles = useCallback((theme: string): StyleDefinition[] => {\n    return Array.from(styleDefinitionsRef.current.values())\n      .filter(def => def.theme === theme);\n  }, []);\n  \n  // Performance utilities\n  const getMetrics = useCallback((): StylePerformanceMetrics => {\n    return {\n      ...performanceMetricsRef.current,\n      totalStyles: styleDefinitionsRef.current.size,\n      memoryUsage: cacheRef.current.size * 1000 // Rough estimate\n    };\n  }, []);\n  \n  const clearCache = useCallback(() => {\n    cacheRef.current.clear();\n    performanceMetricsRef.current.cacheHits = 0;\n    performanceMetricsRef.current.cacheMisses = 0;\n    logger.info('Style cache cleared');\n  }, []);\n  \n  const preloadStyles = useCallback(async (ids: string[]): Promise<void> => {\n    if (!finalConfig.enablePreloading) return;\n    \n    const definitions = ids.map(id => styleDefinitionsRef.current.get(id))\n      .filter((def): def is StyleDefinition => def !== undefined);\n    \n    await loadStyles(definitions);\n  }, [finalConfig.enablePreloading, loadStyles]);\n  \n  // Responsive utilities\n  const loadResponsiveStyles = useCallback(async (breakpoint: string): Promise<void> => {\n    if (!finalConfig.enableResponsiveLoading) return;\n    \n    const responsiveStyles = Array.from(styleDefinitionsRef.current.values())\n      .filter(def => def.responsive?.some(r => r.breakpoint === breakpoint));\n    \n    await loadStyles(responsiveStyles);\n  }, [finalConfig.enableResponsiveLoading, loadStyles]);\n  \n  const getCurrentBreakpoint = useCallback(() => currentBreakpoint, [currentBreakpoint]);\n  \n  // Utility functions\n  const isStyleLoaded = useCallback((id: string): boolean => {\n    const state = loadedStyles.get(id);\n    return state?.status === 'loaded' || state?.status === 'cached';\n  }, [loadedStyles]);\n  \n  const getStyleElement = useCallback((id: string): HTMLElement | null => {\n    const state = loadedStyles.get(id);\n    return state?.element || null;\n  }, [loadedStyles]);\n  \n  const injectCriticalCSS = useCallback((css: string) => {\n    const criticalId = 'critical-css-inline';\n    \n    // Remove existing critical CSS\n    const existing = document.getElementById(criticalId);\n    if (existing) {\n      existing.remove();\n    }\n    \n    // Inject new critical CSS\n    const style = document.createElement('style');\n    style.id = criticalId;\n    style.textContent = css;\n    \n    // Insert at the beginning of head for highest priority\n    document.head.insertBefore(style, document.head.firstChild);\n    \n    logger.info('Critical CSS injected', { size: css.length });\n  }, []);\n  \n  // Auto-cleanup unused styles\n  useEffect(() => {\n    if (!finalConfig.autoCleanup) return;\n    \n    const interval = setInterval(() => {\n      const now = Date.now();\n      \n      loadedStyles.forEach((state, id) => {\n        const definition = styleDefinitionsRef.current.get(id);\n        if (!definition) return;\n        \n        const lastUsed = state.loadTime || 0;\n        const unusedTime = now - lastUsed;\n        \n        if (unusedTime > finalConfig.maxUnusedTime && definition.priority !== 'critical') {\n          unloadStyle(id);\n        }\n      });\n    }, finalConfig.cleanupDelay);\n    \n    return () => clearInterval(interval);\n  }, [finalConfig.autoCleanup, finalConfig.cleanupDelay, finalConfig.maxUnusedTime, loadedStyles, unloadStyle]);\n  \n  // Responsive breakpoint detection\n  useEffect(() => {\n    if (!finalConfig.enableResponsiveLoading) return;\n    \n    const handleResize = () => {\n      const newBreakpoint = detectBreakpoint();\n      if (newBreakpoint !== currentBreakpoint) {\n        setCurrentBreakpoint(newBreakpoint);\n        \n        if (finalConfig.loadBasedOnViewport) {\n          loadResponsiveStyles(newBreakpoint);\n        }\n      }\n    };\n    \n    window.addEventListener('resize', handleResize);\n    handleResize(); // Initial detection\n    \n    return () => window.removeEventListener('resize', handleResize);\n  }, [finalConfig.enableResponsiveLoading, finalConfig.loadBasedOnViewport, currentBreakpoint, detectBreakpoint, loadResponsiveStyles]);\n  \n  // Intersection observer for lazy loading\n  useEffect(() => {\n    if (!finalConfig.loadOnIntersection) return;\n    \n    intersectionObserverRef.current = new IntersectionObserver(\n      (entries) => {\n        entries.forEach((entry) => {\n          if (entry.isIntersecting) {\n            const element = entry.target as HTMLElement;\n            const styleId = element.dataset.lazyStyleId;\n            \n            if (styleId) {\n              const definition = styleDefinitionsRef.current.get(styleId);\n              if (definition) {\n                loadStyle(definition);\n              }\n            }\n          }\n        });\n      },\n      { threshold: finalConfig.intersectionThreshold }\n    );\n    \n    return () => {\n      if (intersectionObserverRef.current) {\n        intersectionObserverRef.current.disconnect();\n      }\n    };\n  }, [finalConfig.loadOnIntersection, finalConfig.intersectionThreshold, loadStyle]);\n  \n  // Cleanup on unmount\n  useEffect(() => {\n    return () => {\n      // Clear all cleanup timers\n      cleanupTimersRef.current.forEach(timer => clearTimeout(timer));\n      cleanupTimersRef.current.clear();\n      \n      // Disconnect intersection observer\n      if (intersectionObserverRef.current) {\n        intersectionObserverRef.current.disconnect();\n      }\n    };\n  }, []);\n  \n  return {\n    // Style Management\n    loadStyle,\n    loadStyles,\n    unloadStyle,\n    unloadStyles,\n    \n    // State\n    loadedStyles,\n    isLoading,\n    error,\n    \n    // Theme Management\n    setTheme,\n    getCurrentTheme,\n    getThemeStyles,\n    \n    // Performance\n    getMetrics,\n    clearCache,\n    preloadStyles,\n    \n    // Responsive\n    loadResponsiveStyles,\n    getCurrentBreakpoint,\n    \n    // Utilities\n    isStyleLoaded,\n    getStyleElement,\n    injectCriticalCSS\n  };\n}\n\nexport type { \n  UseLazyStylesReturn, \n  StyleDefinition, \n  StyleLoadState, \n  StylePerformanceMetrics,\n  UseLazyStylesConfig \n};
