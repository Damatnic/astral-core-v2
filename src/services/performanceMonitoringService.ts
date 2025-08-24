/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and application performance metrics
 */

import { logger } from '../utils/logger';

// Performance metric types
export interface WebVital {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  name: string;
}

export interface PerformanceMetrics {
  webVitals: {
    LCP?: WebVital; // Largest Contentful Paint
    FID?: WebVital; // First Input Delay
    CLS?: WebVital; // Cumulative Layout Shift
    FCP?: WebVital; // First Contentful Paint
    TTFB?: WebVital; // Time to First Byte
  };
  navigation: {
    loadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  resources: {
    totalSize?: number;
    resourceCount?: number;
    cacheHitRate?: number;
  };
  memory?: {
    used?: number;
    total?: number;
    limit?: number;
  };
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

export interface PerformanceConfig {
  enableWebVitals: boolean;
  enableResourceMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  sampleRate: number;
  reportingEndpoint?: string;
  }

class PerformanceMonitoringService {
  private metrics: PerformanceMetrics = {
    webVitals: {},
    navigation: {},
    resources: {}
  };
  
  private config: PerformanceConfig = {
    enableWebVitals: true,
    enableResourceMonitoring: true,
    enableMemoryMonitoring: true,
    sampleRate: 1.0
  };

  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor(config?: Partial<PerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') return;

      // Check if performance API is available
      if (!('performance' in window)) {
        logger.warn('Performance API not available', undefined, 'PerformanceMonitoringService');
        return;
      }

      // Initialize Web Vitals monitoring
      if (this.config.enableWebVitals) {
        await this.initializeWebVitals();
      }

      // Initialize resource monitoring
      if (this.config.enableResourceMonitoring) {
        this.initializeResourceMonitoring();
      }

      // Initialize memory monitoring
      if (this.config.enableMemoryMonitoring) {
        this.initializeMemoryMonitoring();
      }

      // Initialize navigation timing
      this.initializeNavigationTiming();

      // Initialize connection monitoring
      this.initializeConnectionMonitoring();

      this.isInitialized = true;
      logger.info('Performance monitoring initialized', this.config, 'PerformanceMonitoringService');

    } catch (error) {
      logger.error('Failed to initialize performance monitoring', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private async initializeWebVitals(): Promise<void> {
    try {
      // Dynamically import web-vitals to avoid loading in SSR
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      // Core Web Vitals
      getCLS((metric) => this.handleWebVital('CLS', metric));
      getFID((metric) => this.handleWebVital('FID', metric));
      getLCP((metric) => this.handleWebVital('LCP', metric));
      
      // Additional metrics
      getFCP((metric) => this.handleWebVital('FCP', metric));
      getTTFB((metric) => this.handleWebVital('TTFB', metric));

    } catch (error) {
      logger.error('Failed to initialize Web Vitals', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Handle Web Vital metric
   */
  private handleWebVital(name: string, metric: any): void {
    const webVital: WebVital = {
      name,
      value: metric.value,
      rating: this.getRating(name, metric.value),
      delta: metric.delta,
      id: metric.id
    };

    this.metrics.webVitals[name as keyof typeof this.metrics.webVitals] = webVital;

    logger.info(`Web Vital: ${name}`, webVital, 'PerformanceMonitoringService');

    // Report if configured
    if (this.config.reportingEndpoint) {
      this.reportMetric('web-vital', webVital);
    }
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: [2500, 4000], // Good: ≤2.5s, Poor: >4s
      FID: [100, 300],   // Good: ≤100ms, Poor: >300ms
      CLS: [0.1, 0.25],  // Good: ≤0.1, Poor: >0.25
      FCP: [1800, 3000], // Good: ≤1.8s, Poor: >3s
      TTFB: [800, 1800]  // Good: ≤800ms, Poor: >1.8s
    };

    const [good, poor] = thresholds[name as keyof typeof thresholds] || [0, Infinity];

    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Initialize resource monitoring
   */
  private initializeResourceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let totalSize = 0;
        let resourceCount = 0;

        entries.forEach((entry: any) => {
          if (entry.transferSize) {
            totalSize += entry.transferSize;
            resourceCount++;
          }
        });

        this.metrics.resources = {
          ...this.metrics.resources,
          totalSize: (this.metrics.resources.totalSize || 0) + totalSize,
          resourceCount: (this.metrics.resources.resourceCount || 0) + resourceCount
        };
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);

    } catch (error) {
      logger.error('Failed to initialize resource monitoring', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Initialize memory monitoring
   */
  private initializeMemoryMonitoring(): void {
    if (!('memory' in performance)) return;
    
    try {
      const updateMemoryMetrics = () => {
        const memory = (performance as any).memory;
        this.metrics.memory = {
            used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
        };
      };

      // Update memory metrics periodically
      updateMemoryMetrics();
      setInterval(updateMemoryMetrics, 30000); // Every 30 seconds

    } catch (error) {
      logger.error('Failed to initialize memory monitoring', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Initialize navigation timing
   */
  private initializeNavigationTiming(): void {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.navigation = {
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          firstPaint: 0, // Will be updated by paint observer
          firstContentfulPaint: 0 // Will be updated by paint observer
        };
      }

      // Observe paint events
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.metrics.navigation.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              this.metrics.navigation.firstContentfulPaint = entry.startTime;
            }
          });
        });

        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      }

    } catch (error) {
      logger.error('Failed to initialize navigation timing', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Initialize connection monitoring
   */
  private initializeConnectionMonitoring(): void {
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        this.metrics.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        };

        // Listen for connection changes
        connection.addEventListener('change', () => {
          this.metrics.connection = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          };
        });
      }

    } catch (error) {
      logger.error('Failed to initialize connection monitoring', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Report metric to external service
   */
  private async reportMetric(type: string, data: any): Promise<void> {
    if (!this.config.reportingEndpoint) return;

    try {
      // Sample based on configured rate
      if (Math.random() > this.config.sampleRate) return;

      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
        })
      });

    } catch (error) {
      logger.error('Failed to report metric', error, 'PerformanceMonitoringService');
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getSummary(): any {
    const webVitals = this.metrics.webVitals;
    const navigation = this.metrics.navigation;
    const resources = this.metrics.resources;
    const memory = this.metrics.memory;
    
    return {
      coreWebVitals: {
        LCP: webVitals.LCP?.value,
        FID: webVitals.FID?.value,
        CLS: webVitals.CLS?.value,
        overall: this.getOverallRating()
      },
      loadPerformance: {
        loadTime: navigation.loadTime,
        domContentLoaded: navigation.domContentLoaded,
        firstContentfulPaint: navigation.firstContentfulPaint
      },
      resourceUsage: {
        totalSize: resources.totalSize,
        resourceCount: resources.resourceCount,
        memoryUsed: memory?.used
      }
    };
  }

  /**
   * Get overall performance rating
   */
  private getOverallRating(): 'good' | 'needs-improvement' | 'poor' {
    const vitals = [
      this.metrics.webVitals.LCP?.rating,
      this.metrics.webVitals.FID?.rating,
      this.metrics.webVitals.CLS?.rating
    ].filter(Boolean);

    if (vitals.length === 0) return 'good';

    const poorCount = vitals.filter(rating => rating === 'poor').length;
    const needsImprovementCount = vitals.filter(rating => rating === 'needs-improvement').length;

    if (poorCount > 0) return 'poor';
    if (needsImprovementCount > 0) return 'needs-improvement';
    return 'good';
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

// Export class for testing
export { PerformanceMonitoringService };

// Default export
export default performanceMonitoringService;