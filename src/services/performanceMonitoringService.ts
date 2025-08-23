/**
 * Performance Monitoring Service
 * Simplified version to resolve build issues
 */;

interface PerformanceReport {
  sessionId: string;
  userId?: string;
  timestamp: number;
  webVitals: {
    LCP?: { value: number; rating: string };
    FID?: { value: number; rating: string };
    CLS?: { value: number; rating: string };
    INP?: { value: number; rating: string };
    TTFB?: { value: number; rating: string };
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
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

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.report = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      webVitals: {},
      errors: [];
    };
    this.initialize();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    // Initialize performance monitoring
    this.monitorWebVitals();
    this.monitorErrors();
    this.monitorMemory();
    this.monitorConnection();
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.report.userId = userId;
  }

  private monitorWebVitals(): void {
    // Simple Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Monitor LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.report.webVitals.LCP = {
              value: lastEntry.startTime,
              rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor';
            };
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        console.warn('Web Vitals monitoring not supported:', error);
      }
    }
  }

  private monitorErrors(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.report.errors.push({
          message: event.message,
          stack: event.error?.stack,
          timestamp: Date.now();
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.report.errors.push({
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          timestamp: Date.now();
        });
      });
    }
  }

  private monitorMemory(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        const performance = (window.performance as any);
        if (performance.memory) {
          this.report.memory = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit;
          };
        }
      }, 30000); // Every 30 seconds
    }
  }

  private monitorConnection(): void {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.report.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData;
        };

        connection.addEventListener('change', () => {
          this.report.connection = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData;
          };
        });
      }
    }
  }

  getReport(): PerformanceReport {
    return { ...this.report };
  }

  getPerformanceScore(): { score: number; recommendations: string[] } {
    let score = 100;
    const recommendations: string[] = [];

    // Simple scoring based on Web Vitals;
    const webVitals = this.report.webVitals;
    
    if (webVitals.LCP?.rating === 'poor') {
      score -= 20;
      recommendations.push('Optimize Largest Contentful Paint');
    }
    
    if (webVitals.FID?.rating === 'poor') {
      score -= 20;
      recommendations.push('Optimize First Input Delay');
    }
    
    if (webVitals.CLS?.rating === 'poor') {
      score -= 20;
      recommendations.push('Fix Cumulative Layout Shift');
    }

    if (this.report.errors.length > 0) {
      score -= Math.min(this.report.errors.length * 5, 30);
      recommendations.push('Fix JavaScript errors');
    }

    return { score: Math.max(score, 0), recommendations };
  }

  async sendReport(): Promise<void> {
    try {
      // In a real implementation, send to analytics service
      console.log('Performance Report:', this.getReport());
      console.log('Performance Score:', this.getPerformanceScore());
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  reset(): void {
    this.report = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      webVitals: {},
      errors: [];
    };
  }
}

export default PerformanceMonitoringService.getInstance();
export { PerformanceMonitoringService };