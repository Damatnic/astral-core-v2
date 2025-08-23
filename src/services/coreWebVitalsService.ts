/**
 * Core Web Vitals Monitoring Service
 * 
 * Comprehensive performance monitoring for Largest Contentful Paint (LCP),
 * First Input Delay (FID), Cumulative Layout Shift (CLS), and other performance metrics.
 * Critical for mental health platform where fast response times can be crucial during crisis situations.
 */

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type PerformanceRating = 'good' | 'needs-improvement' | 'poor';
type WebVitalName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: PerformanceRating;
  delta: number;
  navigationType?: string;
  id: string;
  timestamp: number;
  route?: string;
  userAgent?: string;
  connectionType?: string;
  isCrisisSituation?: boolean;
}

interface WebVitalsReport {
  metrics: WebVitalMetric[];
  sessionId: string;
  deviceType: DeviceType;
  connectionType: string;
  timestamp: number;
  route: string;
  userJourney: string[];
  crisisMetrics?: {
    timeToFirstCrisisResource: number;
    crisisPageLoadTime: number;
    emergencyButtonResponseTime: number;
  };
}

interface PerformanceBudget {
  LCP: { good: number; needsImprovement: number };
  FID: { good: number; needsImprovement: number };
  CLS: { good: number; needsImprovement: number };
  FCP: { good: number; needsImprovement: number };
  TTFB: { good: number; needsImprovement: number };
  INP: { good: number; needsImprovement: number };
}

class CoreWebVitalsService {
  private metrics: WebVitalMetric[] = [];
  private sessionId: string;
  private deviceType: DeviceType;
  private connectionType: string;
  private userJourney: string[] = [];
  private reportingEndpoint: string | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  // Performance budgets based on Web Vitals thresholds
  private readonly PERFORMANCE_BUDGET: PerformanceBudget = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 }
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceType = this.detectDeviceType();
    this.connectionType = this.detectConnectionType();
    this.setupRouteTracking();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  public async initialize(reportingEndpoint?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    this.reportingEndpoint = reportingEndpoint || null;

    try {
      // Dynamic import to avoid bundling if not supported
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      // Monitor Core Web Vitals
      onCLS(this.handleMetric.bind(this), { reportAllChanges: true });
      onINP(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this), { reportAllChanges: true });
      onTTFB(this.handleMetric.bind(this));

      // Monitor Interaction to Next Paint if available
      if ('PerformanceObserver' in window) {
        this.setupINPMonitoring();
      }

      // Monitor custom crisis-specific metrics
      this.setupCrisisMetrics();

      // Set up periodic reporting
      this.setupPeriodicReporting();

      console.log('🚀 Core Web Vitals monitoring initialized');
    } catch (error) {
      console.warn('Core Web Vitals monitoring not available:', error);
    }
  }

  /**
   * Handle incoming web vital metrics
   */
  private handleMetric(metric: any): void {
    const webVitalMetric: WebVitalMetric = {
      name: metric.name as WebVitalMetric['name'],
      value: metric.value,
      rating: this.calculateRating(metric.name, metric.value),
      delta: metric.delta,
      navigationType: metric.navigationType,
      id: metric.id,
      timestamp: Date.now(),
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      connectionType: this.connectionType,
      isCrisisSituation: this.isCrisisRoute()
    };

    this.metrics.push(webVitalMetric);
    this.handleRealTimeAlerts(webVitalMetric);

    // Special handling for crisis situations
    if (webVitalMetric.isCrisisSituation) {
      this.handleCrisisPerformanceMetric(webVitalMetric);
    }
  }

  /**
   * Calculate performance rating based on Web Vitals thresholds
   */
  private calculateRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const budget = this.PERFORMANCE_BUDGET[metricName as keyof PerformanceBudget];
    if (!budget) return 'good';

    if (value <= budget.good) return 'good';
    if (value <= budget.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Set up Interaction to Next Paint monitoring
   */
  private setupINPMonitoring(): void {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event') {
            const inp = entry as any;
            if (inp.processingStart && inp.startTime) {
              const inpValue = inp.processingStart - inp.startTime;
              this.handleMetric({
                name: 'INP',
                value: inpValue,
                delta: inpValue,
                id: `inp-${Date.now()}`,
                navigationType: 'navigate'
              });
            }
          }
        }
      });

      this.performanceObserver.observe({ 
        type: 'event', 
        buffered: true 
      });
    } catch (error) {
      console.warn('INP monitoring not supported:', error);
    }
  }

  /**
   * Monitor crisis-specific performance metrics
   */
  private setupCrisisMetrics(): void {
    // Monitor crisis resource loading times
    this.measureCrisisResourceTiming();
    
    // Monitor emergency button response times
    this.setupEmergencyButtonMonitoring();
    
    // Monitor offline functionality performance
    this.setupOfflineMetrics();
  }

  /**
   * Calculate rating for crisis resource timing
   */
  private calculateCrisisResourceRating(duration: number): PerformanceRating {
    if (duration < 1000) return 'good';
    if (duration < 2500) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Measure crisis resource loading performance
   */
  private measureCrisisResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('crisis') || 
            entry.name.includes('emergency') || 
            entry.name.includes('safety')) {
          
          const crisisMetric: WebVitalMetric = {
            name: 'LCP', // Custom crisis resource timing
            value: entry.duration,
            rating: this.calculateCrisisResourceRating(entry.duration),
            delta: entry.duration,
            id: `crisis-resource-${Date.now()}`,
            timestamp: Date.now(),
            route: window.location.pathname,
            isCrisisSituation: true
          };

          this.metrics.push(crisisMetric);
        }
      }
    });

    observer.observe({ type: 'resource', buffered: true });
  }

  /**
   * Calculate rating for emergency response time
   */
  private calculateEmergencyResponseRating(responseTime: number): PerformanceRating {
    if (responseTime < 50) return 'good';
    if (responseTime < 100) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Monitor emergency button response times
   */
  private setupEmergencyButtonMonitoring(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('.crisis-button') || 
          target.closest('.emergency-button') ||
          target.closest('[data-crisis="true"]')) {
        
        const startTime = performance.now();
        
        // Measure time to UI response
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          
          const emergencyMetric: WebVitalMetric = {
            name: 'FID',
            value: responseTime,
            rating: this.calculateEmergencyResponseRating(responseTime),
            delta: responseTime,
            id: `emergency-response-${Date.now()}`,
            timestamp: Date.now(),
            route: window.location.pathname,
            isCrisisSituation: true
          };

          this.metrics.push(emergencyMetric);
          
          // Immediate alert for poor emergency response times
          if (emergencyMetric.rating === 'poor') {
            console.warn('🚨 Poor emergency button response time:', responseTime, 'ms');
          }
        });
      }
    });
  }

  /**
   * Monitor offline functionality performance
   */
  private setupOfflineMetrics(): void {
    window.addEventListener('online', () => {
      this.trackNetworkChange('online');
    });

    window.addEventListener('offline', () => {
      this.trackNetworkChange('offline');
    });
  }

  /**
   * Track network status changes
   */
  private trackNetworkChange(status: 'online' | 'offline'): void {
    const networkMetric: WebVitalMetric = {
      name: 'TTFB',
      value: status === 'offline' ? 0 : performance.now(),
      rating: status === 'offline' ? 'poor' : 'good',
      delta: 0,
      id: `network-${status}-${Date.now()}`,
      timestamp: Date.now(),
      route: window.location.pathname,
      isCrisisSituation: this.isCrisisRoute()
    };

    this.metrics.push(networkMetric);
  }

  /**
   * Handle real-time alerts for poor performance
   */
  private handleRealTimeAlerts(metric: WebVitalMetric): void {
    if (metric.rating === 'poor' && metric.isCrisisSituation) {
      console.warn(`🚨 Poor ${metric.name} in crisis situation:`, {
        value: metric.value,
        route: metric.route,
        metric
      });

      // Could trigger notifications to development team
      this.notifyDevelopmentTeam(metric);
    }
  }

  /**
   * Handle performance metrics specifically for crisis situations
   */
  private handleCrisisPerformanceMetric(metric: WebVitalMetric): void {
    // Log crisis performance separately for analysis
    const crisisData = {
      metric,
      timestamp: Date.now(),
      route: window.location.pathname,
      sessionId: this.sessionId,
      deviceType: this.deviceType,
      connectionType: this.connectionType
    };

    // Store crisis metrics locally for analysis
    this.storeCrisisMetrics(crisisData);
  }

  /**
   * Store crisis metrics locally
   */
  private storeCrisisMetrics(data: unknown): void {
    try {
      const existingData = localStorage.getItem('crisis-performance-metrics');
      const metrics = existingData ? JSON.parse(existingData) : [];
      metrics.push(data);
      
      // Keep only last 100 crisis metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem('crisis-performance-metrics', JSON.stringify(metrics));
    } catch (error) {
      console.warn('Could not store crisis metrics:', error);
    }
  }

  /**
   * Check if current route is crisis-related
   */
  private isCrisisRoute(): boolean {
    const path = window.location.pathname.toLowerCase();
    return path.includes('crisis') || 
           path.includes('emergency') || 
           path.includes('safety') ||
           path.includes('offline-crisis');
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `cwv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): DeviceType {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Detect connection type
   */
  private detectConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Set up route tracking for user journey
   */
  private setupRouteTracking(): void {
    // Track initial route
    this.userJourney.push(window.location.pathname);

    // Listen for route changes (for SPA)
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.userJourney.push(window.location.pathname);
      if (this.userJourney.length > 20) {
        this.userJourney.shift();
      }
    };
  }

  /**
   * Set up periodic reporting
   */
  private setupPeriodicReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.generateReport();
      }
    }, 30000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateReport();
    });
  }

  /**
   * Generate comprehensive performance report
   */
  public generateReport(): WebVitalsReport {
    const report: WebVitalsReport = {
      metrics: [...this.metrics],
      sessionId: this.sessionId,
      deviceType: this.deviceType,
      connectionType: this.connectionType,
      timestamp: Date.now(),
      route: window.location.pathname,
      userJourney: [...this.userJourney]
    };

    // Add crisis-specific metrics if applicable
    const crisisMetrics = this.calculateCrisisMetrics();
    if (crisisMetrics) {
      report.crisisMetrics = crisisMetrics;
    }

    // Send to reporting endpoint if configured
    if (this.reportingEndpoint) {
      this.sendReport(report);
    }

    // Clear metrics after reporting
    this.metrics = [];

    return report;
  }

  /**
   * Calculate crisis-specific performance metrics
   */
  private calculateCrisisMetrics() {
    const crisisMetrics = this.metrics.filter(m => m.isCrisisSituation);
    if (crisisMetrics.length === 0) return null;

    const crisisResourceMetrics = crisisMetrics.filter(m => m.id.includes('crisis-resource'));
    const emergencyButtonMetrics = crisisMetrics.filter(m => m.id.includes('emergency-response'));
    const crisisPageMetrics = crisisMetrics.filter(m => m.name === 'LCP' && m.isCrisisSituation);

    return {
      timeToFirstCrisisResource: crisisResourceMetrics.length > 0 
        ? Math.min(...crisisResourceMetrics.map(m => m.value))
        : 0,
      crisisPageLoadTime: crisisPageMetrics.length > 0
        ? Math.max(...crisisPageMetrics.map(m => m.value))
        : 0,
      emergencyButtonResponseTime: emergencyButtonMetrics.length > 0
        ? Math.max(...emergencyButtonMetrics.map(m => m.value))
        : 0
    };
  }

  /**
   * Send report to analytics endpoint
   */
  private async sendReport(report: WebVitalsReport): Promise<void> {
    try {
      if (!this.reportingEndpoint) return;

      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send Web Vitals report:', error);
    }
  }

  /**
   * Notify development team of critical performance issues
   */
  private notifyDevelopmentTeam(metric: WebVitalMetric): void {
    // In production, this could send alerts to monitoring services
    console.error('🚨 Critical performance issue detected:', metric);
  }

  /**
   * Get current performance summary
   */
  public getPerformanceSummary() {
    return {
      totalMetrics: this.metrics.length,
      goodMetrics: this.metrics.filter(m => m.rating === 'good').length,
      needsImprovementMetrics: this.metrics.filter(m => m.rating === 'needs-improvement').length,
      poorMetrics: this.metrics.filter(m => m.rating === 'poor').length,
      crisisMetrics: this.metrics.filter(m => m.isCrisisSituation).length,
      deviceType: this.deviceType,
      connectionType: this.connectionType,
      sessionId: this.sessionId
    };
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    // Generate final report
    this.generateReport();
  }
}

// Export singleton instance
export const coreWebVitalsService = new CoreWebVitalsService();
export default coreWebVitalsService;
