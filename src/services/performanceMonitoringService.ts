/**
 * Performance Monitoring Service
 * 
 * Comprehensive performance tracking for the mental health platform
 * Monitors Web Vitals, custom metrics, and user interactions
 * 
 * @license Apache-2.0
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Type aliases for union types
type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: PerformanceRating;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
  cached: boolean;
}

interface UserInteraction {
  type: string;
  target: string;
  timestamp: number;
  duration: number;
  successful: boolean;
}

interface PerformanceReport {
  sessionId: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  webVitals: {
    FCP?: PerformanceMetric;
    LCP?: PerformanceMetric;
    INP?: PerformanceMetric;
    CLS?: PerformanceMetric;
    TTFB?: PerformanceMetric;
  };
  customMetrics: PerformanceMetric[];
  resources: ResourceTiming[];
  interactions: UserInteraction[];
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }>;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private readonly sessionId: string;
  private userId?: string;
  private report: PerformanceReport;
  private readonly observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;
  private reportInterval: number | null = null;
  private interactionBuffer: UserInteraction[] = [];
  private errorBuffer: Array<{ message: string; stack?: string; timestamp: number }> = [];
  
  // Thresholds for performance ratings
  private readonly thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.report = this.createEmptyReport();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initialize(userId?: string): void {
    if (this.isInitialized) return;
    
    this.userId = userId;
    this.isInitialized = true;
    
    console.log('[Performance] Initializing monitoring service');
    
    // Monitor Web Vitals
    this.monitorWebVitals();
    
    // Monitor resource loading
    this.monitorResourceTiming();
    
    // Monitor user interactions
    this.monitorUserInteractions();
    
    // Monitor JavaScript errors
    this.monitorErrors();
    
    // Monitor memory usage
    this.monitorMemory();
    
    // Monitor connection quality
    this.monitorConnection();
    
    // Setup periodic reporting
    this.setupPeriodicReporting();
    
    // Monitor page visibility changes
    this.monitorPageVisibility();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorWebVitals(): void {
    // First Contentful Paint
    onFCP((metric) => {
      this.report.webVitals.FCP = this.formatWebVital('FCP', metric.value);
      this.logMetric('FCP', metric.value);
    });
    
    // Largest Contentful Paint
    onLCP((metric) => {
      this.report.webVitals.LCP = this.formatWebVital('LCP', metric.value);
      this.logMetric('LCP', metric.value);
    });
    
    // Interaction to Next Paint (replaces FID in web-vitals v5)
    onINP((metric) => {
      this.report.webVitals.INP = this.formatWebVital('INP', metric.value);
      this.logMetric('INP', metric.value);
    });
    
    // Cumulative Layout Shift
    onCLS((metric) => {
      this.report.webVitals.CLS = this.formatWebVital('CLS', metric.value);
      this.logMetric('CLS', metric.value);
    });
    
    // Time to First Byte
    onTTFB((metric) => {
      this.report.webVitals.TTFB = this.formatWebVital('TTFB', metric.value);
      this.logMetric('TTFB', metric.value);
    });
    
  }

  /**
   * Monitor resource loading performance
   */
  private monitorResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          const resource: ResourceTiming = {
            name: resourceEntry.name,
            type: this.getResourceType(resourceEntry.name),
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize || 0,
            startTime: resourceEntry.startTime,
            cached: resourceEntry.transferSize === 0
          };
          
          this.report.resources.push(resource);
          
          // Track slow resources
          if (resource.duration > 3000) {
            this.trackCustomMetric('slow_resource', resource.duration, {
              url: resource.name,
              type: resource.type
            });
          }
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('[Performance] Could not observe resource timing:', error);
    }
  }

  /**
   * Monitor user interactions
   */
  private monitorUserInteractions(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const interaction: UserInteraction = {
        type: 'click',
        target: this.getTargetSelector(target),
        timestamp: Date.now(),
        duration: 0,
        successful: true
      };
      this.interactionBuffer.push(interaction);
      this.pruneInteractionBuffer();
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLElement;
      const interaction: UserInteraction = {
        type: 'form_submit',
        target: this.getTargetSelector(target),
        timestamp: Date.now(),
        duration: 0,
        successful: true
      };
      this.interactionBuffer.push(interaction);
    });
    
    // Track navigation timing
    if ('PerformanceNavigationTiming' in window) {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming && navTiming instanceof PerformanceNavigationTiming) {
        this.trackCustomMetric('page_load_time', navTiming.loadEventEnd - navTiming.fetchStart);
        this.trackCustomMetric('dom_interactive', navTiming.domInteractive - navTiming.fetchStart);
        this.trackCustomMetric('dom_complete', navTiming.domComplete - navTiming.fetchStart);
      }
    }
  }

  /**
   * Monitor JavaScript errors
   */
  private monitorErrors(): void {
    window.addEventListener('error', (event) => {
      const error = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now()
      };
      
      this.errorBuffer.push(error);
      this.pruneErrorBuffer();
      
      // Track critical errors
      if (event.message.includes('crisis') || event.message.includes('emergency')) {
        this.trackCustomMetric('critical_error', 1, {
          message: event.message
        });
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now()
      };
      
      this.errorBuffer.push(error);
      this.pruneErrorBuffer();
    });
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    if (!('memory' in performance)) return;
    
    setInterval(() => {
      // Type-safe memory access
      const performanceWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      
      const memory = performanceWithMemory.memory;
      if (memory) {
        this.report.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
        
        // Track high memory usage
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usage > 0.9) {
          this.trackCustomMetric('high_memory_usage', usage * 100, {
            used: memory.usedJSHeapSize,
            limit: memory.jsHeapSizeLimit
          });
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Monitor connection quality
   */
  private monitorConnection(): void {
    if (!('connection' in navigator)) return;
    
    // Type-safe connection access
    const navigatorWithConnection = navigator as Navigator & {
      connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
        saveData: boolean;
        addEventListener: (event: string, handler: () => void) => void;
      };
    };
    
    const connection = navigatorWithConnection.connection;
    if (connection) {
      this.report.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
      
      // Track slow connections
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        this.trackCustomMetric('slow_connection', 1, {
          type: connection.effectiveType,
          rtt: connection.rtt
        });
      }
      
      // Monitor connection changes
      connection.addEventListener('change', () => {
        this.report.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      });
    }
  }

  /**
   * Monitor page visibility changes
   */
  private monitorPageVisibility(): void {
    let hiddenTime = 0;
    let visibleTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenTime = Date.now();
        const activeTime = hiddenTime - visibleTime;
        this.trackCustomMetric('page_active_time', activeTime);
      } else {
        visibleTime = Date.now();
        if (hiddenTime > 0) {
          const inactiveTime = visibleTime - hiddenTime;
          this.trackCustomMetric('page_inactive_time', inactiveTime);
        }
      }
    });
  }

  /**
   * Track custom metric
   */
  trackCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: this.getMetricRating(name, value),
      timestamp: Date.now(),
      metadata
    };
    
    this.report.customMetrics.push(metric);
    this.logMetric(name, value);
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, duration: number): void {
    this.trackCustomMetric(`component_render_${componentName}`, duration, {
      component: componentName
    });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, status: number): void {
    this.trackCustomMetric('api_call', duration, {
      endpoint,
      status,
      success: status >= 200 && status < 300
    });
  }

  /**
   * Track crisis resource load time
   */
  trackCrisisResourceLoad(resourceType: string, duration: number): void {
    this.trackCustomMetric('crisis_resource_load', duration, {
      type: resourceType,
      critical: true
    });
  }

  /**
   * Setup periodic reporting
   */
  private setupPeriodicReporting(): void {
    // Send report every 30 seconds
    this.reportInterval = window.setInterval(() => {
      this.sendReport();
    }, 30000);
    
    // Send report before page unload
    window.addEventListener('beforeunload', () => {
      this.sendReport();
    });
  }

  /**
   * Send performance report
   */
  private async sendReport(): Promise<void> {
    if (this.report.customMetrics.length === 0 && 
        Object.keys(this.report.webVitals).length === 0) {
      return; // No data to send
    }
    
    // Add current buffer data
    this.report.interactions = [...this.interactionBuffer];
    this.report.errors = [...this.errorBuffer];
    
    const reportData = {
      ...this.report,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    try {
      // Send to analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
      }
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] Report:', reportData);
      }
      
      // Reset report after sending
      this.report = this.createEmptyReport();
      this.interactionBuffer = [];
      this.errorBuffer = [];
    } catch (error) {
      console.error('[Performance] Failed to send report:', error);
    }
  }

  /**
   * Get performance summary
   */
  /**
   * Calculate performance score based on Web Vitals
   */
  private calculateWebVitalsScore(): { score: number; recommendations: string[] } {
    const webVitals = this.report.webVitals;
    let score = 100;
    const recommendations: string[] = [];
    
    // FCP scoring
    if (webVitals.FCP) {
      if (webVitals.FCP.rating === 'needs-improvement') score -= 10;
      if (webVitals.FCP.rating === 'poor') {
        score -= 20;
        recommendations.push('Improve First Contentful Paint by optimizing critical rendering path');
      }
    }
    
    // LCP scoring
    if (webVitals.LCP) {
      if (webVitals.LCP.rating === 'needs-improvement') score -= 10;
      if (webVitals.LCP.rating === 'poor') {
        score -= 20;
        recommendations.push('Optimize Largest Contentful Paint by lazy loading images and optimizing server response time');
      }
    }
    
    return { score, recommendations };
  }

  /**
   * Get interaction and layout recommendations
   */
  private getInteractionRecommendations(): { scoreReduction: number; recommendations: string[] } {
    const webVitals = this.report.webVitals;
    let scoreReduction = 0;
    const recommendations: string[] = [];
    
    // INP scoring
    if (webVitals.INP) {
      if (webVitals.INP.rating === 'needs-improvement') scoreReduction += 10;
      if (webVitals.INP.rating === 'poor') {
        scoreReduction += 20;
        recommendations.push('Reduce Interaction to Next Paint by breaking up long tasks and optimizing JavaScript execution');
      }
    }
    
    // CLS scoring
    if (webVitals.CLS) {
      if (webVitals.CLS.rating === 'needs-improvement') scoreReduction += 10;
      if (webVitals.CLS.rating === 'poor') {
        scoreReduction += 20;
        recommendations.push('Fix Cumulative Layout Shift by specifying dimensions for images and avoiding dynamic content injection');
      }
    }
    
    return { scoreReduction, recommendations };
  }

  /**
   * Get system-level recommendations
   */
  private getSystemRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Memory recommendations
    if (this.report.memory) {
      const memoryUsage = this.report.memory.usedJSHeapSize / this.report.memory.jsHeapSizeLimit;
      if (memoryUsage > 0.8) {
        recommendations.push('High memory usage detected. Consider optimizing data structures and clearing unused references');
      }
    }
    
    // Connection recommendations
    if (this.report.connection?.effectiveType === '2g' || this.report.connection?.effectiveType === 'slow-2g') {
      recommendations.push('Slow connection detected. Ensure critical resources are cached and minimize payload sizes');
    }
    
    return recommendations;
  }

  getPerformanceSummary(): {
    webVitals: Record<string, any>;
    score: number;
    recommendations: string[];
  } {
    const webVitalsResult = this.calculateWebVitalsScore();
    const interactionResult = this.getInteractionRecommendations();
    const systemRecommendations = this.getSystemRecommendations();
    
    const totalScore = Math.max(0, webVitalsResult.score - interactionResult.scoreReduction);
    const allRecommendations = [
      ...webVitalsResult.recommendations,
      ...interactionResult.recommendations,
      ...systemRecommendations
    ];
    
    return {
      webVitals: this.report.webVitals,
      score: totalScore,
      recommendations: allRecommendations
    };
  }

  /**
   * Helper methods
   */
  
  private formatWebVital(name: string, value: number): PerformanceMetric {
    return {
      name,
      value,
      rating: this.getWebVitalRating(name, value),
      timestamp: Date.now()
    };
  }
  
  private getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  private getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Custom metric ratings
    if (name.includes('component_render')) {
      if (value < 100) return 'good';
      if (value < 300) return 'needs-improvement';
      return 'poor';
    }
    
    if (name === 'api_call') {
      if (value < 1000) return 'good';
      if (value < 3000) return 'needs-improvement';
      return 'poor';
    }
    
    return 'good';
  }
  
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    
    const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg)/;
    if (imageRegex.exec(url)) return 'image';
    
    const fontRegex = /\.(woff|woff2|ttf|otf)/;
    if (fontRegex.exec(url)) return 'font';
    
    if (url.includes('/api/')) return 'api';
    return 'other';
  }
  
  private getTargetSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      return `.${element.className.split(' ')[0]}`;
    }
    return element.tagName.toLowerCase();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
  
  private createEmptyReport(): PerformanceReport {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      webVitals: {},
      customMetrics: [],
      resources: [],
      interactions: [],
      errors: []
    };
  }
  
  private logMetric(name: string, value: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}`);
    }
  }
  
  private pruneInteractionBuffer(): void {
    // Keep only last 50 interactions
    if (this.interactionBuffer.length > 50) {
      this.interactionBuffer = this.interactionBuffer.slice(-50);
    }
  }
  
  private pruneErrorBuffer(): void {
    // Keep only last 20 errors
    if (this.errorBuffer.length > 20) {
      this.errorBuffer = this.errorBuffer.slice(-20);
    }
  }
  
  /**
   * Cleanup and destroy
   */
  destroy(): void {
    // Clear intervals
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Send final report
    this.sendReport();
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceMonitoring = PerformanceMonitoringService.getInstance();
export const performanceMonitoringService = performanceMonitoring;

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitoring.initialize();
  });
}

export default performanceMonitoring;