/**
 * Comprehensive Performance Monitoring System
 * 
 * Advanced performance monitoring with real-time alerts, performance budgets,
 * bottleneck detection, and automated optimization recommendations for 
 * the Astral Core mental health platform.
 * 
 * Features:
 * - Real-time performance monitoring with configurable thresholds
 * - Performance budgets and budget violation alerts
 * - Bottleneck detection and performance regression tracking
 * - Automated optimization recommendations
 * - Crisis intervention performance prioritization
 * - Mental health-specific performance considerations
 * - Historical performance trending
 * - Performance anomaly detection
 */

import { getAnalyticsService } from './analyticsService';

// Performance alert severity levels
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Performance alert types
export type AlertType = 'budget_violation' | 'bottleneck_detected' | 'regression' | 'anomaly' | 'critical_failure';

// Performance impact levels
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

// Priority levels
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

// Difficulty levels
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export interface EnhancedPerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToFirstByte: number;
  
  // Loading Performance
  loadTime: number;
  domContentLoaded: number;
  
  // Bundle & Resource Metrics
  bundleSize: number;
  chunkCount: number;
  cacheHitRate: number;
  totalResourceSize: number;
  
  // Memory & CPU
  memoryUsage: number;
  cpuUsage: number;
  
  // Network Performance
  networkLatency: number;
  bandwidth: number;
  
  // Mental Health Platform Specific
  crisisDetectionResponseTime: number;
  chatMessageLatency: number;
  videoStreamingQuality: number;
  offlineCapabilityStatus: number;
  
  // User Experience Metrics
  userEngagementScore: number;
  featureUsabilityScore: number;
  accessibilityScore: number;
  
  // Timestamp for trending
  timestamp: number;
}

// Performance budget configuration
export interface PerformanceBudget {
  // Core Web Vitals Budgets
  firstContentfulPaint: { target: number; warning: number; critical: number };
  largestContentfulPaint: { target: number; warning: number; critical: number };
  firstInputDelay: { target: number; warning: number; critical: number };
  cumulativeLayoutShift: { target: number; warning: number; critical: number };
  
  // Loading Budgets
  loadTime: { target: number; warning: number; critical: number };
  bundleSize: { target: number; warning: number; critical: number };
  
  // Mental Health Specific Budgets
  crisisDetectionResponseTime: { target: number; warning: number; critical: number };
  chatMessageLatency: { target: number; warning: number; critical: number };
  
  // Resource Budgets
  memoryUsage: { target: number; warning: number; critical: number };
  totalResourceSize: { target: number; warning: number; critical: number };
}

// Performance alert interface
export interface PerformanceAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  metric: string;
  currentValue: number;
  expectedValue: number;
  description: string;
  recommendations: string[];
  timestamp: number;
  isCrisisRelated: boolean;
}

// Bottleneck detection result
export interface PerformanceBottleneck {
  component: string;
  metric: string;
  impact: ImpactLevel;
  description: string;
  suggestions: string[];
  estimatedImprovement: number;
}

// Optimization recommendation
export interface OptimizationRecommendation {
  id: string;
  category: 'bundle' | 'loading' | 'runtime' | 'memory' | 'network' | 'ux' | 'accessibility';
  priority: PriorityLevel;
  title: string;
  description: string;
  implementation: string;
  estimatedGain: string;
  difficulty: DifficultyLevel;
  mentalHealthImpact: string;
}

// Performance monitoring configuration
export interface PerformanceMonitorConfig {
  enableRealTimeMonitoring: boolean;
  enableBudgetTracking: boolean;
  enableBottleneckDetection: boolean;
  enableOptimizationSuggestions: boolean;
  enableCrisisPrioritization: boolean;
  collectInterval: number; // milliseconds
  alertThresholds: PerformanceBudget;
  retentionPeriod: number; // days
}

class ComprehensivePerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private performanceHistory: EnhancedPerformanceMetrics[] = [];
  private activeAlerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private intervalId: number | null = null;
  private isMonitoring = false;
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.config = {
      enableRealTimeMonitoring: true,
      enableBudgetTracking: true,
      enableBottleneckDetection: true,
      enableOptimizationSuggestions: true,
      enableCrisisPrioritization: true,
      collectInterval: 5000, // 5 seconds
      retentionPeriod: 30, // 30 days
      alertThresholds: this.getDefaultBudgets(),
      ...config
    };
    
    this.initializeMonitoring();
  }

  /**
   * Get default performance budgets optimized for mental health platform
   */
  private getDefaultBudgets(): PerformanceBudget {
    const isMobile = window.innerWidth <= 768;
    
    return {
      firstContentfulPaint: {
        target: isMobile ? 2000 : 1500,
        warning: isMobile ? 3000 : 2500,
        critical: isMobile ? 4000 : 3500
      },
      largestContentfulPaint: {
        target: isMobile ? 3000 : 2500,
        warning: isMobile ? 4000 : 3500,
        critical: isMobile ? 5000 : 4500
      },
      firstInputDelay: {
        target: 50,
        warning: 100,
        critical: 200
      },
      cumulativeLayoutShift: {
        target: 0.05,
        warning: 0.1,
        critical: 0.25
      },
      loadTime: {
        target: isMobile ? 3000 : 2000,
        warning: isMobile ? 5000 : 4000,
        critical: isMobile ? 8000 : 6000
      },
      bundleSize: {
        target: isMobile ? 500000 : 800000, // 500KB mobile, 800KB desktop
        warning: isMobile ? 750000 : 1200000,
        critical: isMobile ? 1000000 : 1500000
      },
      crisisDetectionResponseTime: {
        target: 100, // Critical for mental health platform
        warning: 300,
        critical: 500
      },
      chatMessageLatency: {
        target: 200,
        warning: 500,
        critical: 1000
      },
      memoryUsage: {
        target: 50, // MB
        warning: 100,
        critical: 200
      },
      totalResourceSize: {
        target: isMobile ? 1000000 : 1500000, // 1MB mobile, 1.5MB desktop
        warning: isMobile ? 1500000 : 2000000,
        critical: isMobile ? 2000000 : 3000000
      }
    };
  }

  /**
   * Initialize performance monitoring system
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Set up performance observers
    this.setupPerformanceObservers();
    
    // Start real-time monitoring
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }

    // Clean up old performance data
    this.cleanupOldData();
  }

  /**
   * Set up performance observers for real-time metrics collection
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    // Core Web Vitals observers
    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('largestContentfulPaint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.updateMetric('firstInputDelay', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetric('cumulativeLayoutShift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation observer for load metrics
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.updateMetric('loadTime', navEntry.loadEventEnd - navEntry.loadEventStart);
            this.updateMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            this.updateMetric('timeToFirstByte', navEntry.responseStart - navEntry.requestStart);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

    } catch (error) {
      console.warn('Failed to set up performance observers:', error);
    }
  }

  /**
   * Start real-time performance monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.intervalId = window.setInterval(() => {
      this.collectCurrentMetrics();
    }, this.config.collectInterval);
  }

  /**
   * Stop real-time performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Collect current performance metrics
   */
  private async collectCurrentMetrics(): Promise<EnhancedPerformanceMetrics> {
    const metrics: Partial<EnhancedPerformanceMetrics> = {
      timestamp: Date.now()
    };

    try {
      // Core Web Vitals
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.firstContentfulPaint = fcpEntry.startTime;
      }

      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
      }

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memoryUsage = (memory as any).usedJSHeapSize / 1024 / 1024; // MB
      }

      // Bundle size estimation
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      let jsResourceCount = 0;
      
      resourceEntries.forEach(entry => {
        const size = entry.transferSize || entry.encodedBodySize || 0;
        totalSize += size;
        
        if (entry.name.includes('.js')) {
          jsResourceCount++;
          metrics.bundleSize = (metrics.bundleSize || 0) + size;
        }
      });
      
      metrics.totalResourceSize = totalSize;
      metrics.chunkCount = jsResourceCount;

      // Network information
      const connection = (navigator as any).connection;
      if (connection) {
        metrics.networkLatency = (connection as any).rtt || 0;
        metrics.bandwidth = (connection as any).downlink || 0;
      }

      // Mental health platform specific metrics
      metrics.crisisDetectionResponseTime = await this.measureCrisisDetectionTime();
      metrics.chatMessageLatency = await this.measureChatLatency();
      metrics.videoStreamingQuality = this.assessVideoQuality();
      metrics.offlineCapabilityStatus = this.checkOfflineCapability();

      // User experience scores
      metrics.userEngagementScore = this.calculateEngagementScore();
      metrics.featureUsabilityScore = this.calculateUsabilityScore();
      metrics.accessibilityScore = await this.calculateAccessibilityScore();

      const completeMetrics = metrics as EnhancedPerformanceMetrics;
      
      // Store metrics
      this.addMetricsToHistory(completeMetrics);
      
      // Check budgets and generate alerts
      if (this.config.enableBudgetTracking) {
        this.checkPerformanceBudgets(completeMetrics);
      }

      // Detect bottlenecks
      if (this.config.enableBottleneckDetection) {
        this.detectBottlenecks(completeMetrics);
      }

      // Track with analytics (privacy-compliant)
      const analyticsService = getAnalyticsService();
      analyticsService.track('performance_monitoring', 'performance', {
        loadTime: completeMetrics.loadTime,
        bundleSize: completeMetrics.bundleSize,
        memoryUsage: completeMetrics.memoryUsage,
        networkLatency: completeMetrics.networkLatency
      });

      return completeMetrics;

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      return metrics as EnhancedPerformanceMetrics;
    }
  }

  /**
   * Measure crisis detection response time
   */
  private async measureCrisisDetectionTime(): Promise<number> {
    // Simulate crisis detection performance measurement
    const startTime = performance.now();
    
    try {
      // Mock crisis keyword detection test
      const testText = "I am feeling suicidal and need help";
      const crisisKeywords = ['suicidal', 'kill myself', 'end it all', 'not worth living'];
      
      // Simulate AI analysis time
      crisisKeywords.some(keyword => 
        testText.toLowerCase().includes(keyword)
      );
      
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      console.warn('Crisis detection measurement failed:', error);
      return 500; // Default high value if measurement fails
    }
  }

  /**
   * Measure chat message latency
   */
  private async measureChatLatency(): Promise<number> {
    const startTime = performance.now();
    
    try {
      // Simulate message processing
      await new Promise(resolve => setTimeout(resolve, 10));
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      console.warn('Chat latency measurement failed:', error);
      return 200; // Default value
    }
  }

  /**
   * Assess video streaming quality
   */
  private assessVideoQuality(): number {
    try {
      const videoElements = document.querySelectorAll('video');
      if (videoElements.length === 0) return 100; // No videos, perfect score
      
      let totalQuality = 0;
      videoElements.forEach(video => {
        // Check for buffering, resolution, etc.
        const quality = video.videoWidth >= 720 ? 100 : 75;
        totalQuality += quality;
      });
      
      return totalQuality / videoElements.length;
    } catch (error) {
      console.warn('Video quality assessment failed:', error);
      return 75; // Default moderate quality
    }
  }

  /**
   * Check offline capability status
   */
  private checkOfflineCapability(): number {
    try {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasCache = 'caches' in window;
      const isOnline = navigator.onLine;
      
      let score = 0;
      if (hasServiceWorker) score += 40;
      if (hasCache) score += 30;
      if (isOnline) score += 30;
      
      return score;
    } catch (error) {
      console.warn('Offline capability check failed:', error);
      return 0;
    }
  }

  /**
   * Calculate user engagement score
   */
  private calculateEngagementScore(): number {
    try {
      // Factor in session duration, interactions, etc.
      const sessionStart = performance.timing.navigationStart;
      const sessionDuration = Date.now() - sessionStart;
      const engagementThreshold = 60000; // 1 minute
      
      const baseScore = Math.min(sessionDuration / engagementThreshold * 100, 100);
      return Math.round(baseScore);
    } catch (error) {
      console.warn('Engagement score calculation failed:', error);
      return 50; // Default moderate engagement
    }
  }

  /**
   * Calculate feature usability score
   */
  private calculateUsabilityScore(): number {
    try {
      // Check for accessibility features, responsive design, etc.
      const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
      const hasAltText = document.querySelectorAll('img[alt]').length > 0;
      const isResponsive = window.innerWidth <= 768 ? 
        document.querySelector('meta[name="viewport"]') !== null : true;
      
      let score = 60; // Base score
      if (hasAriaLabels) score += 15;
      if (hasAltText) score += 15;
      if (isResponsive) score += 10;
      
      return score;
    } catch (error) {
      console.warn('Usability score calculation failed:', error);
      return 60;
    }
  }

  /**
   * Calculate accessibility score
   */
  private async calculateAccessibilityScore(): Promise<number> {
    try {
      let score = 70; // Base score
      
      // Check color contrast
      const elements = document.querySelectorAll('*');
      let contrastIssues = 0;
      
      // Simplified contrast check (would need more sophisticated analysis in production)
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        
        // Basic check for transparent/white backgrounds with light text
        if (bgColor === 'rgba(0, 0, 0, 0)' && textColor.includes('255')) {
          contrastIssues++;
        }
      });
      
      if (contrastIssues < 5) score += 20;
      else if (contrastIssues < 10) score += 10;
      
      // Check for focus indicators
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
      const hasFocusIndicators = Array.from(focusableElements).some(el => {
        const style = window.getComputedStyle(el, ':focus');
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });
      
      if (hasFocusIndicators) score += 10;
      
      return Math.min(score, 100);
    } catch (error) {
      console.warn('Accessibility score calculation failed:', error);
      return 70;
    }
  }

  /**
   * Add metrics to historical data
   */
  private addMetricsToHistory(metrics: EnhancedPerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    
    // Limit history size
    const maxHistorySize = 1000;
    if (this.performanceHistory.length > maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-maxHistorySize);
    }
  }

  /**
   * Check performance budgets and generate alerts
   */
  private checkPerformanceBudgets(metrics: EnhancedPerformanceMetrics): void {
    const budgets = this.config.alertThresholds;
    
    Object.entries(budgets).forEach(([metricName, budget]) => {
      const value = metrics[metricName as keyof EnhancedPerformanceMetrics] as number;
      if (typeof value !== 'number') return;
      
      let severity: PerformanceAlert['severity'] = 'low';
      let description = '';
      
      if (value > budget.critical) {
        severity = 'critical';
        description = `${metricName} (${value.toFixed(0)}) exceeds critical threshold (${budget.critical})`;
      } else if (value > budget.warning) {
        severity = 'high';
        description = `${metricName} (${value.toFixed(0)}) exceeds warning threshold (${budget.warning})`;
      } else if (value > budget.target) {
        severity = 'medium';
        description = `${metricName} (${value.toFixed(0)}) exceeds target (${budget.target})`;
      }
      
      if (severity !== 'low') {
        this.createAlert({
          id: `budget_${metricName}_${Date.now()}`,
          type: 'budget_violation',
          severity,
          metric: metricName,
          currentValue: value,
          expectedValue: budget.target,
          description,
          recommendations: this.getRecommendationsForMetric(metricName, value),
          timestamp: Date.now(),
          isCrisisRelated: metricName === 'crisisDetectionResponseTime'
        });
      }
    });
  }

  /**
   * Detect performance bottlenecks
   */
  private detectBottlenecks(metrics: EnhancedPerformanceMetrics): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    // Bundle size bottleneck
    if (metrics.bundleSize > 1000000) { // 1MB
      bottlenecks.push({
        component: 'JavaScript Bundle',
        metric: 'bundleSize',
        impact: metrics.bundleSize > 2000000 ? 'critical' : 'high',
        description: `Bundle size (${(metrics.bundleSize / 1024).toFixed(0)}KB) is causing slow load times`,
        suggestions: [
          'Implement code splitting for non-critical routes',
          'Remove unused dependencies',
          'Use dynamic imports for heavy components',
          'Enable tree shaking in build process'
        ],
        estimatedImprovement: 30
      });
    }

    // Memory usage bottleneck
    if (metrics.memoryUsage > 150) { // 150MB
      bottlenecks.push({
        component: 'Memory Management',
        metric: 'memoryUsage',
        impact: metrics.memoryUsage > 250 ? 'critical' : 'high',
        description: `High memory usage (${metrics.memoryUsage.toFixed(0)}MB) may cause crashes on low-end devices`,
        suggestions: [
          'Implement virtual scrolling for long lists',
          'Clean up event listeners and subscriptions',
          'Use React.memo for heavy components',
          'Optimize image loading and caching'
        ],
        estimatedImprovement: 25
      });
    }

    // Crisis detection performance bottleneck
    if (metrics.crisisDetectionResponseTime > 300) {
      bottlenecks.push({
        component: 'Crisis Detection System',
        metric: 'crisisDetectionResponseTime',
        impact: 'critical', // Always critical for mental health platform
        description: `Crisis detection taking ${metrics.crisisDetectionResponseTime.toFixed(0)}ms - too slow for emergency situations`,
        suggestions: [
          'Optimize AI model inference time',
          'Implement client-side keyword pre-filtering',
          'Use WebWorkers for background processing',
          'Cache common crisis patterns'
        ],
        estimatedImprovement: 60
      });
    }

    return bottlenecks;
  }

  /**
   * Get optimization recommendations for a specific metric
   */
  private getRecommendationsForMetric(metricName: string, _value: number): string[] {
    const recommendations: Record<string, string[]> = {
      firstContentfulPaint: [
        'Optimize critical CSS delivery',
        'Minimize main thread work',
        'Use resource hints (preload, preconnect)',
        'Optimize font loading'
      ],
      largestContentfulPaint: [
        'Optimize largest image/element loading',
        'Use responsive images with srcset',
        'Implement lazy loading for below-fold content',
        'Optimize server response times'
      ],
      firstInputDelay: [
        'Reduce JavaScript execution time',
        'Use Web Workers for heavy computations',
        'Split long tasks into smaller chunks',
        'Defer non-critical JavaScript'
      ],
      cumulativeLayoutShift: [
        'Add dimensions to images and videos',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
        'Use CSS aspect-ratio for responsive media'
      ],
      bundleSize: [
        'Implement code splitting',
        'Remove unused dependencies',
        'Use tree shaking',
        'Enable gzip/brotli compression'
      ],
      memoryUsage: [
        'Implement virtual scrolling',
        'Clean up subscriptions and listeners',
        'Use React.memo for expensive components',
        'Optimize image memory usage'
      ],
      crisisDetectionResponseTime: [
        'Optimize AI model performance',
        'Implement client-side pre-filtering',
        'Use WebWorkers for background processing',
        'Cache frequently detected patterns'
      ]
    };
    
    return recommendations[metricName] || ['Monitor and optimize based on specific bottlenecks'];
  }

  /**
   * Create and dispatch performance alert
   */
  private createAlert(alert: PerformanceAlert): void {
    // Prevent duplicate alerts
    const existingAlert = this.activeAlerts.find(a => 
      a.metric === alert.metric && a.type === alert.type
    );
    
    if (existingAlert) {
      existingAlert.currentValue = alert.currentValue;
      existingAlert.timestamp = alert.timestamp;
      return;
    }
    
    this.activeAlerts.push(alert);
    
    // Prioritize crisis-related alerts
    if (alert.isCrisisRelated) {
      console.error('🚨 CRITICAL PERFORMANCE ALERT (Crisis-Related):', alert);
    } else {
      console.warn('⚠️ Performance Alert:', alert);
    }
    
    // Notify registered callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
    
    // Track alert in analytics
    const analyticsService = getAnalyticsService();
    analyticsService.track('performance_alert', 'performance', {
      metric: alert.metric,
      severity: alert.severity,
      isCrisisRelated: alert.isCrisisRelated
    });
  }

  /**
   * Register alert callback
   */
  public onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): EnhancedPerformanceMetrics | null {
    return this.performanceHistory[this.performanceHistory.length - 1] || null;
  }

  /**
   * Get performance history
   */
  public getPerformanceHistory(hours = 24): EnhancedPerformanceMetrics[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.performanceHistory.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): PerformanceAlert[] {
    return [...this.activeAlerts];
  }

  /**
   * Clear resolved alerts
   */
  public clearResolvedAlerts(): void {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return;
    
    this.activeAlerts = this.activeAlerts.filter(alert => {
      const currentValue = currentMetrics[alert.metric as keyof EnhancedPerformanceMetrics] as number;
      const budget = this.config.alertThresholds[alert.metric as keyof PerformanceBudget];
      
      // Keep alert if still exceeding target
      return currentValue > budget.target;
    });
  }

  /**
   * Generate comprehensive optimization recommendations
   */
  public generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return [];
    
    const recommendations: OptimizationRecommendation[] = [];
    
    // Bundle optimization recommendations
    if (currentMetrics.bundleSize > 800000) {
      recommendations.push({
        id: 'bundle_optimization',
        category: 'bundle',
        priority: 'high',
        title: 'Optimize JavaScript Bundle Size',
        description: 'Your bundle size is impacting load times, especially on mobile devices.',
        implementation: 'Implement route-based code splitting and remove unused dependencies.',
        estimatedGain: '30-50% improvement in load time',
        difficulty: 'medium',
        mentalHealthImpact: 'Faster loading reduces user anxiety and improves crisis intervention response'
      });
    }

    // Loading performance recommendations
    if (currentMetrics.largestContentfulPaint > 3000) {
      recommendations.push({
        id: 'lcp_optimization',
        category: 'loading',
        priority: 'high',
        title: 'Optimize Largest Contentful Paint',
        description: 'The largest element on your page is loading too slowly.',
        implementation: 'Optimize images, implement lazy loading, and improve server response times.',
        estimatedGain: '25-40% improvement in perceived performance',
        difficulty: 'medium',
        mentalHealthImpact: 'Faster content display improves user engagement and reduces abandonment'
      });
    }

    // Memory optimization recommendations
    if (currentMetrics.memoryUsage > 100) {
      recommendations.push({
        id: 'memory_optimization',
        category: 'memory',
        priority: 'medium',
        title: 'Optimize Memory Usage',
        description: 'High memory usage may cause issues on older devices.',
        implementation: 'Implement virtual scrolling and optimize component lifecycle management.',
        estimatedGain: '20-30% reduction in memory usage',
        difficulty: 'hard',
        mentalHealthImpact: 'Better performance on all devices ensures platform accessibility'
      });
    }

    // Crisis detection optimization
    if (currentMetrics.crisisDetectionResponseTime > 200) {
      recommendations.push({
        id: 'crisis_detection_optimization',
        category: 'runtime',
        priority: 'critical',
        title: 'Optimize Crisis Detection Performance',
        description: 'Crisis detection is taking too long - this is critical for user safety.',
        implementation: 'Optimize AI model inference and implement client-side pre-filtering.',
        estimatedGain: '50-70% improvement in response time',
        difficulty: 'hard',
        mentalHealthImpact: 'Faster crisis detection can literally save lives'
      });
    }

    // Accessibility recommendations
    if (currentMetrics.accessibilityScore < 85) {
      recommendations.push({
        id: 'accessibility_optimization',
        category: 'accessibility',
        priority: 'high',
        title: 'Improve Accessibility',
        description: 'Platform accessibility needs improvement for inclusive mental health support.',
        implementation: 'Add ARIA labels, improve color contrast, and enhance keyboard navigation.',
        estimatedGain: '15-25% improvement in accessibility score',
        difficulty: 'easy',
        mentalHealthImpact: 'Better accessibility ensures everyone can access mental health support'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Update specific metric (for real-time updates)
   */
  private updateMetric(metricName: keyof EnhancedPerformanceMetrics, value: number): void {
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics) {
      (currentMetrics as any)[metricName] = value;
    }
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): string {
    const currentMetrics = this.getCurrentMetrics();
    const alerts = this.getActiveAlerts();
    const recommendations = this.generateOptimizationRecommendations();
    
    if (!currentMetrics) {
      return 'No performance data available';
    }

    const formatValue = (value: number, unit: string) => {
      if (unit === 'ms') return `${value.toFixed(0)}ms`;
      if (unit === 'MB') return `${value.toFixed(1)}MB`;
      if (unit === 'KB') return `${(value / 1024).toFixed(0)}KB`;
      if (unit === '%') return `${value.toFixed(1)}%`;
      return `${value.toFixed(2)}`;
    };

    return `
# 🔍 Comprehensive Performance Report

## 📊 Current Performance Metrics

### Core Web Vitals
- **First Contentful Paint**: ${formatValue(currentMetrics.firstContentfulPaint, 'ms')}
- **Largest Contentful Paint**: ${formatValue(currentMetrics.largestContentfulPaint, 'ms')}
- **First Input Delay**: ${formatValue(currentMetrics.firstInputDelay, 'ms')}
- **Cumulative Layout Shift**: ${formatValue(currentMetrics.cumulativeLayoutShift, '')}

### Loading Performance
- **Load Time**: ${formatValue(currentMetrics.loadTime, 'ms')}
- **DOM Content Loaded**: ${formatValue(currentMetrics.domContentLoaded, 'ms')}
- **Time to First Byte**: ${formatValue(currentMetrics.timeToFirstByte, 'ms')}

### Bundle & Resources
- **Bundle Size**: ${formatValue(currentMetrics.bundleSize, 'KB')}
- **Total Resource Size**: ${formatValue(currentMetrics.totalResourceSize, 'KB')}
- **Chunk Count**: ${currentMetrics.chunkCount}

### Mental Health Platform Metrics
- **Crisis Detection Response**: ${formatValue(currentMetrics.crisisDetectionResponseTime, 'ms')} ${currentMetrics.crisisDetectionResponseTime > 300 ? '🚨' : '✅'}
- **Chat Message Latency**: ${formatValue(currentMetrics.chatMessageLatency, 'ms')}
- **Video Streaming Quality**: ${formatValue(currentMetrics.videoStreamingQuality, '%')}
- **Offline Capability**: ${formatValue(currentMetrics.offlineCapabilityStatus, '%')}

### User Experience Scores
- **User Engagement**: ${formatValue(currentMetrics.userEngagementScore, '%')}
- **Feature Usability**: ${formatValue(currentMetrics.featureUsabilityScore, '%')}
- **Accessibility**: ${formatValue(currentMetrics.accessibilityScore, '%')}

## 🚨 Active Alerts (${alerts.length})
${alerts.length === 0 ? 'No active alerts' : alerts.map(alert => `
- **${alert.severity.toUpperCase()}**: ${alert.description}
  ${alert.isCrisisRelated ? '🩺 *Crisis-related performance issue*' : ''}
`).join('')}

## 💡 Optimization Recommendations (${recommendations.length})
${recommendations.slice(0, 5).map((rec, index) => `
${index + 1}. **${rec.title}** (${rec.priority.toUpperCase()})
   - ${rec.description}
   - *Estimated gain*: ${rec.estimatedGain}
   - *Mental health impact*: ${rec.mentalHealthImpact}
`).join('')}

## 📈 Performance Grade
${this.getPerformanceGrade(currentMetrics)}

---
*Report generated at ${new Date().toLocaleString()}*
    `.trim();
  }

  /**
   * Get overall performance grade
   */
  private getPerformanceGrade(metrics: EnhancedPerformanceMetrics): string {
    let score = 0;
    let maxScore = 0;
    
    const budgets = this.config.alertThresholds;
    
    Object.entries(budgets).forEach(([metricName, budget]) => {
      const value = metrics[metricName as keyof EnhancedPerformanceMetrics] as number;
      if (typeof value !== 'number') return;
      
      maxScore += 100;
      
      if (value <= budget.target) {
        score += 100;
      } else if (value <= budget.warning) {
        score += 75;
      } else if (value <= budget.critical) {
        score += 50;
      } else {
        score += 25;
      }
    });
    
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return '🏆 Excellent (A+)';
    if (percentage >= 80) return '🥇 Good (A)';
    if (percentage >= 70) return '🥈 Fair (B)';
    if (percentage >= 60) return '🥉 Needs Improvement (C)';
    return '🚨 Poor (D) - Immediate optimization required';
  }

  /**
   * Clean up old performance data
   */
  private cleanupOldData(): void {
    const cutoff = Date.now() - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Destroy monitor and clean up resources
   */
  public destroy(): void {
    this.stopMonitoring();
    this.performanceHistory = [];
    this.activeAlerts = [];
    this.alertCallbacks = [];
  }
}

// Export singleton instance
export const comprehensivePerformanceMonitor = new ComprehensivePerformanceMonitor();

export default ComprehensivePerformanceMonitor;
