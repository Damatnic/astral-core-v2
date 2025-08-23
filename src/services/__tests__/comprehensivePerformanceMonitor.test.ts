/**
 * @jest-environment jsdom
 */

import ComprehensivePerformanceMonitor, { comprehensivePerformanceMonitor } from '../comprehensivePerformanceMonitor';
import type {
  EnhancedPerformanceMetrics,
  PerformanceAlert,
  PerformanceBottleneck,
} from '../comprehensivePerformanceMonitor';

// Mock dependencies
const mockAnalyticsService = {
  track: jest.fn(),
};

jest.mock('../analyticsService', () => ({
  getAnalyticsService: () => mockAnalyticsService,
}));

// Mock performance APIs
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  getEntries: jest.fn(() => []),
};

const mockPerformanceEntry = {
  name: 'test-entry',
  entryType: 'navigation',
  startTime: 100,
  duration: 200,
  loadEventStart: 300,
  loadEventEnd: 400,
  domContentLoadedEventStart: 250,
  domContentLoadedEventEnd: 280,
  responseStart: 150,
  requestStart: 120,
  transferSize: 1024,
  encodedBodySize: 512,
} as PerformanceNavigationTiming;

Object.defineProperty(global, 'PerformanceObserver', {
  value: jest.fn().mockImplementation(() => mockPerformanceObserver),
  writable: true,
});

Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => [mockPerformanceEntry]),
    getEntriesByName: jest.fn(() => [mockPerformanceEntry]),
    timing: {
      navigationStart: Date.now() - 5000,
    },
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
      jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
    },
  },
  writable: true,
});

// Mock navigator connection
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    rtt: 50,
    downlink: 10,
  },
  writable: true,
});

// Mock document for crisis detection
Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn(() => []),
  writable: true,
});

// Mock window for viewport and other checks
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true,
});

describe('ComprehensivePerformanceMonitor', () => {
  let monitor: ComprehensivePerformanceMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Reset performance mocks
    (performance.now as jest.Mock).mockReturnValue(Date.now());
    (performance.getEntriesByType as jest.Mock).mockReturnValue([mockPerformanceEntry]);
    (document.querySelectorAll as jest.Mock).mockReturnValue([]);

    monitor = new ComprehensivePerformanceMonitor();
  });

  afterEach(() => {
    if (monitor) {
      monitor.destroy();
    }
  });

  describe('Initialization', () => {
    test.skip('should initialize with default configuration', () => {
      expect(monitor).toBeDefined();
      expect(PerformanceObserver).toHaveBeenCalled();
    });

    test.skip('should set up performance observers', () => {
      expect(mockPerformanceObserver.observe).toHaveBeenCalled();
    });

    test.skip('should detect device type correctly', () => {
      // Test mobile detection
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
      const mobileMonitor = new ComprehensivePerformanceMonitor();
      
      const budgets = (mobileMonitor as any).getDefaultBudgets();
      expect(budgets.firstContentfulPaint.target).toBe(2000); // Mobile target
      
      mobileMonitor.destroy();
    });

    test.skip('should initialize with custom config', () => {
      const customConfig = {
        enableRealTimeMonitoring: false,
        collectInterval: 10000,
        retentionPeriod: 60,
      };

      const customMonitor = new ComprehensivePerformanceMonitor(customConfig);
      
      expect(customMonitor).toBeDefined();
      customMonitor.destroy();
    });
  });

  describe('Performance Budgets', () => {
    test.skip('should have appropriate mobile budgets', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
      const mobileMonitor = new ComprehensivePerformanceMonitor();
      const budgets = (mobileMonitor as any).getDefaultBudgets();

      expect(budgets.firstContentfulPaint.target).toBe(2000);
      expect(budgets.largestContentfulPaint.target).toBe(3000);
      expect(budgets.loadTime.target).toBe(3000);
      expect(budgets.bundleSize.target).toBe(500000); // 500KB for mobile
      
      mobileMonitor.destroy();
    });

    test.skip('should have appropriate desktop budgets', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
      const desktopMonitor = new ComprehensivePerformanceMonitor();
      const budgets = (desktopMonitor as any).getDefaultBudgets();

      expect(budgets.firstContentfulPaint.target).toBe(1500);
      expect(budgets.largestContentfulPaint.target).toBe(2500);
      expect(budgets.loadTime.target).toBe(2000);
      expect(budgets.bundleSize.target).toBe(800000); // 800KB for desktop
      
      desktopMonitor.destroy();
    });

    test.skip('should have strict crisis detection budgets', () => {
      const budgets = (monitor as any).getDefaultBudgets();
      
      expect(budgets.crisisDetectionResponseTime.target).toBe(100); // Very strict
      expect(budgets.crisisDetectionResponseTime.critical).toBe(500);
    });
  });

  describe('Metrics Collection', () => {
    beforeEach(() => {
      // Mock paint entries
      (performance.getEntriesByType as jest.Mock).mockImplementation((type) => {
        if (type === 'paint') {
          return [
            { name: 'first-contentful-paint', startTime: 1500 },
            { name: 'first-paint', startTime: 1200 },
          ];
        }
        if (type === 'navigation') {
          return [mockPerformanceEntry];
        }
        if (type === 'resource') {
          return [
            {
              name: 'app.js',
              transferSize: 100000,
              encodedBodySize: 80000,
              duration: 200,
            },
            {
              name: 'styles.css',
              transferSize: 50000,
              encodedBodySize: 40000,
              duration: 100,
            },
          ];
        }
        return [];
      });
    });

    test.skip('should collect current performance metrics', async () => {
      const metrics = await (monitor as any).collectCurrentMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.firstContentfulPaint).toBe(1500);
      expect(metrics.loadTime).toBe(100); // loadEventEnd - loadEventStart
      expect(metrics.domContentLoaded).toBe(30); // domContentLoadedEventEnd - domContentLoadedEventStart
      expect(metrics.timeToFirstByte).toBe(30); // responseStart - requestStart
    });

    test.skip('should calculate memory usage', async () => {
      const metrics = await (monitor as any).collectCurrentMetrics();
      
      expect(metrics.memoryUsage).toBeCloseTo(50, 0); // 50MB
    });

    test.skip('should calculate bundle size', async () => {
      const metrics = await (monitor as any).collectCurrentMetrics();
      
      expect(metrics.bundleSize).toBe(100000); // Size of .js files
      expect(metrics.totalResourceSize).toBe(150000); // Total size
      expect(metrics.chunkCount).toBe(1); // Number of JS files
    });

    test.skip('should detect network information', async () => {
      const metrics = await (monitor as any).collectCurrentMetrics();
      
      expect(metrics.networkLatency).toBe(50);
      expect(metrics.bandwidth).toBe(10);
    });

    test.skip('should measure crisis detection time', async () => {
      const crisisTime = await (monitor as any).measureCrisisDetectionTime();
      
      expect(typeof crisisTime).toBe('number');
      expect(crisisTime).toBeGreaterThan(0);
    });

    test.skip('should measure chat latency', async () => {
      const chatLatency = await (monitor as any).measureChatLatency();
      
      expect(typeof chatLatency).toBe('number');
      expect(chatLatency).toBeGreaterThanOrEqual(10); // Includes 10ms delay
    });
  });

  describe('Video Quality Assessment', () => {
    test.skip('should assess video quality with HD videos', () => {
      const mockVideo = document.createElement('video');
      Object.defineProperty(mockVideo, 'videoWidth', { value: 1280, writable: true });
      document.body.appendChild(mockVideo);

      (document.querySelectorAll as jest.Mock).mockReturnValue([mockVideo]);
      
      const quality = (monitor as any).assessVideoQuality();
      expect(quality).toBe(100);
    });

    test.skip('should assess video quality with SD videos', () => {
      const mockVideo = document.createElement('video');
      Object.defineProperty(mockVideo, 'videoWidth', { value: 640, writable: true });
      document.body.appendChild(mockVideo);

      (document.querySelectorAll as jest.Mock).mockReturnValue([mockVideo]);
      
      const quality = (monitor as any).assessVideoQuality();
      expect(quality).toBe(75);
    });

    test.skip('should return perfect score with no videos', () => {
      (document.querySelectorAll as jest.Mock).mockReturnValue([]);
      
      const quality = (monitor as any).assessVideoQuality();
      expect(quality).toBe(100);
    });
  });

  describe('Offline Capability Check', () => {
    test.skip('should check offline capabilities', () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: {}, writable: true });
      Object.defineProperty(window, 'caches', { value: {}, writable: true });
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
      
      const score = (monitor as any).checkOfflineCapability();
      expect(score).toBe(100); // 40 + 30 + 30 = 100
    });

    test.skip('should handle missing offline features', () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, writable: true });
      Object.defineProperty(window, 'caches', { value: undefined, writable: true });
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      const score = (monitor as any).checkOfflineCapability();
      expect(score).toBe(0);
    });
  });

  describe('User Experience Scores', () => {
    test.skip('should calculate engagement score based on session duration', () => {
      const score = (monitor as any).calculateEngagementScore();
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test.skip('should calculate usability score', () => {
      // Add aria labels and alt text
      document.body.innerHTML = `
        <button aria-label="Submit">Submit</button>
        <img src="test.jpg" alt="Test image">
        <meta name="viewport" content="width=device-width">
      `;

      const score = (monitor as any).calculateUsabilityScore();
      expect(score).toBe(100); // Base 60 + 15 + 15 + 10 = 100
    });

    test.skip('should calculate accessibility score', async () => {
      // Mock elements for accessibility checks
      document.body.innerHTML = `
        <button>Click me</button>
        <a href="/test">Link</a>
      `;

      const score = await (monitor as any).calculateAccessibilityScore();
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Budget Checking', () => {
    test.skip('should detect budget violations', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 5000, // Exceeds critical threshold
        largestContentfulPaint: 2000,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.05,
        timeToFirstByte: 100,
        loadTime: 1000,
        domContentLoaded: 500,
        bundleSize: 500000,
        chunkCount: 5,
        cacheHitRate: 0.8,
        totalResourceSize: 2000000,
        memoryUsage: 100,
        cpuUsage: 0.5,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 100,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 90,
        accessibilityScore: 85,
        timestamp: Date.now(),
      };

      (monitor as any).checkPerformanceBudgets(mockMetrics);
      
      const alerts = (monitor as any).activeAlerts;
      expect(alerts.length).toBeGreaterThan(0);
      
      const fcpAlert = alerts.find((alert: PerformanceAlert) => alert.metric === 'firstContentfulPaint');
      expect(fcpAlert).toBeDefined();
      expect(fcpAlert.severity).toBe('high');
    });

    test.skip('should handle good performance gracefully', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1200, // Good performance
        largestContentfulPaint: 2000,
        firstInputDelay: 30,
        cumulativeLayoutShift: 0.02,
        timeToFirstByte: 200,
        loadTime: 1500,
        domContentLoaded: 800,
        bundleSize: 300000,
        chunkCount: 3,
        cacheHitRate: 0.9,
        totalResourceSize: 800000,
        memoryUsage: 40,
        cpuUsage: 0.3,
        networkLatency: 30,
        bandwidth: 15,
        crisisDetectionResponseTime: 80,
        chatMessageLatency: 150,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 90,
        featureUsabilityScore: 95,
        accessibilityScore: 90,
        timestamp: Date.now(),
      };

      (monitor as any).checkPerformanceBudgets(mockMetrics);
      
      const alerts = (monitor as any).activeAlerts;
      const highSeverityAlerts = alerts.filter((alert: PerformanceAlert) => 
        alert.severity === 'critical' || alert.severity === 'high'
      );
      expect(highSeverityAlerts.length).toBe(0);
    });
  });

  describe('Bottleneck Detection', () => {
    test.skip('should detect bundle size bottlenecks', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 2500000, // 2.5MB - critical size
        memoryUsage: 50,
        crisisDetectionResponseTime: 100,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 10,
        cacheHitRate: 0.8,
        totalResourceSize: 3000000,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: Date.now(),
      };

      const bottlenecks = (monitor as any).detectBottlenecks(mockMetrics);
      
      const bundleBottleneck = bottlenecks.find((b: PerformanceBottleneck) => 
        b.metric === 'bundleSize'
      );
      expect(bundleBottleneck).toBeDefined();
      expect(bundleBottleneck.impact).toBe('critical');
      expect(bundleBottleneck.suggestions).toContain('Implement code splitting for non-critical routes');
    });

    test.skip('should detect memory usage bottlenecks', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 500000,
        memoryUsage: 300, // 300MB - critical memory usage
        crisisDetectionResponseTime: 100,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 5,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: Date.now(),
      };

      const bottlenecks = (monitor as any).detectBottlenecks(mockMetrics);
      
      const memoryBottleneck = bottlenecks.find((b: PerformanceBottleneck) => 
        b.metric === 'memoryUsage'
      );
      expect(memoryBottleneck).toBeDefined();
      expect(memoryBottleneck.impact).toBe('critical');
      expect(memoryBottleneck.suggestions).toContain('Implement virtual scrolling for long lists');
    });

    test.skip('should detect crisis detection bottlenecks', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 500000,
        memoryUsage: 50,
        crisisDetectionResponseTime: 600, // 600ms - too slow for crisis
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 5,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: Date.now(),
      };

      const bottlenecks = (monitor as any).detectBottlenecks(mockMetrics);
      
      const crisisBottleneck = bottlenecks.find((b: PerformanceBottleneck) => 
        b.component === 'Crisis Detection System'
      );
      expect(crisisBottleneck).toBeDefined();
      expect(crisisBottleneck.impact).toBe('critical');
      expect(crisisBottleneck.suggestions).toContain('Optimize AI model inference time');
    });
  });

  describe('Optimization Recommendations', () => {
    test.skip('should generate bundle optimization recommendations', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 1200000, // 1.2MB - needs optimization
        largestContentfulPaint: 2000,
        memoryUsage: 80,
        crisisDetectionResponseTime: 150,
        accessibilityScore: 90,
        firstContentfulPaint: 1500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 8,
        cacheHitRate: 0.8,
        totalResourceSize: 1500000,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [mockMetrics];

      const recommendations = monitor.generateOptimizationRecommendations();
      
      const bundleRec = recommendations.find(r => r.id === 'bundle_optimization');
      expect(bundleRec).toBeDefined();
      expect(bundleRec?.priority).toBe('high');
      expect(bundleRec?.mentalHealthImpact).toContain('crisis intervention');
    });

    test.skip('should generate LCP optimization recommendations', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 500000,
        largestContentfulPaint: 4000, // 4s - needs optimization
        memoryUsage: 50,
        crisisDetectionResponseTime: 100,
        accessibilityScore: 90,
        firstContentfulPaint: 1500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 3,
        cacheHitRate: 0.8,
        totalResourceSize: 800000,
        cpuUsage: 0.3,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [mockMetrics];

      const recommendations = monitor.generateOptimizationRecommendations();
      
      const lcpRec = recommendations.find(r => r.id === 'lcp_optimization');
      expect(lcpRec).toBeDefined();
      expect(lcpRec?.category).toBe('loading');
      expect(lcpRec?.priority).toBe('high');
    });

    test.skip('should generate crisis detection optimization recommendations', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 500000,
        largestContentfulPaint: 2500,
        memoryUsage: 50,
        crisisDetectionResponseTime: 400, // 400ms - needs optimization
        accessibilityScore: 90,
        firstContentfulPaint: 1500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 3,
        cacheHitRate: 0.8,
        totalResourceSize: 800000,
        cpuUsage: 0.3,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [mockMetrics];

      const recommendations = monitor.generateOptimizationRecommendations();
      
      const crisisRec = recommendations.find(r => r.id === 'crisis_detection_optimization');
      expect(crisisRec).toBeDefined();
      expect(crisisRec?.priority).toBe('critical');
      expect(crisisRec?.mentalHealthImpact).toContain('save lives');
    });

    test.skip('should sort recommendations by priority', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        bundleSize: 1200000,
        largestContentfulPaint: 4000,
        memoryUsage: 150,
        crisisDetectionResponseTime: 400,
        accessibilityScore: 70,
        firstContentfulPaint: 3000,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        chunkCount: 8,
        cacheHitRate: 0.8,
        totalResourceSize: 2000000,
        cpuUsage: 0.3,
        networkLatency: 50,
        bandwidth: 10,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [mockMetrics];

      const recommendations = monitor.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(1);
      
      // First recommendation should be critical priority
      expect(recommendations[0].priority).toBe('critical');
      
      // Should be sorted by priority (critical > high > medium > low)
      const priorities = recommendations.map(r => r.priority);
      const criticalIndex = priorities.indexOf('critical');
      const highIndex = priorities.indexOf('high');
      
      if (criticalIndex !== -1 && highIndex !== -1) {
        expect(criticalIndex).toBeLessThan(highIndex);
      }
    });
  });

  describe('Alert System', () => {
    test.skip('should create and track alerts', () => {
      const alert: PerformanceAlert = {
        id: 'test-alert',
        type: 'budget_violation',
        severity: 'high',
        metric: 'firstContentfulPaint',
        currentValue: 3000,
        expectedValue: 1500,
        description: 'FCP exceeds target',
        recommendations: ['Optimize critical CSS'],
        timestamp: Date.now(),
        isCrisisRelated: false,
      };

      (monitor as any).createAlert(alert);
      
      const activeAlerts = monitor.getActiveAlerts();
      expect(activeAlerts).toContain(alert);
    });

    test.skip('should prevent duplicate alerts', () => {
      const alert1: PerformanceAlert = {
        id: 'alert-1',
        type: 'budget_violation',
        severity: 'high',
        metric: 'firstContentfulPaint',
        currentValue: 3000,
        expectedValue: 1500,
        description: 'FCP exceeds target',
        recommendations: ['Optimize critical CSS'],
        timestamp: Date.now(),
        isCrisisRelated: false,
      };

      const alert2: PerformanceAlert = {
        id: 'alert-2',
        type: 'budget_violation',
        severity: 'medium',
        metric: 'firstContentfulPaint',
        currentValue: 2500,
        expectedValue: 1500,
        description: 'FCP still exceeds target',
        recommendations: ['Optimize critical CSS'],
        timestamp: Date.now() + 1000,
        isCrisisRelated: false,
      };

      (monitor as any).createAlert(alert1);
      (monitor as any).createAlert(alert2);
      
      const activeAlerts = monitor.getActiveAlerts();
      expect(activeAlerts.length).toBe(1);
      expect(activeAlerts[0].currentValue).toBe(2500); // Should be updated
    });

    test.skip('should register alert callbacks', () => {
      const mockCallback = jest.fn();
      const unsubscribe = monitor.onAlert(mockCallback);

      const alert: PerformanceAlert = {
        id: 'callback-test',
        type: 'bottleneck_detected',
        severity: 'critical',
        metric: 'crisisDetectionResponseTime',
        currentValue: 600,
        expectedValue: 100,
        description: 'Crisis detection too slow',
        recommendations: ['Optimize AI model'],
        timestamp: Date.now(),
        isCrisisRelated: true,
      };

      (monitor as any).createAlert(alert);
      
      expect(mockCallback).toHaveBeenCalledWith(alert);
      
      unsubscribe();
    });

    test.skip('should clear resolved alerts', async () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1200, // Good value now
        largestContentfulPaint: 2000,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.05,
        timeToFirstByte: 200,
        loadTime: 1500,
        domContentLoaded: 800,
        bundleSize: 500000,
        chunkCount: 5,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        memoryUsage: 60,
        cpuUsage: 0.3,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 100,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 85,
        featureUsabilityScore: 90,
        accessibilityScore: 85,
        timestamp: Date.now(),
      };

      // Add a resolved alert
      const alert: PerformanceAlert = {
        id: 'resolved-alert',
        type: 'budget_violation',
        severity: 'high',
        metric: 'firstContentfulPaint',
        currentValue: 3000,
        expectedValue: 1500,
        description: 'FCP was too slow',
        recommendations: ['Optimize CSS'],
        timestamp: Date.now(),
        isCrisisRelated: false,
      };

      (monitor as any).createAlert(alert);
      (monitor as any).performanceHistory = [mockMetrics];

      monitor.clearResolvedAlerts();
      
      const activeAlerts = monitor.getActiveAlerts();
      expect(activeAlerts).not.toContain(alert);
    });
  });

  describe('Performance Reports', () => {
    test.skip('should generate comprehensive performance report', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1200,
        largestContentfulPaint: 2400,
        firstInputDelay: 45,
        cumulativeLayoutShift: 0.08,
        timeToFirstByte: 180,
        loadTime: 1800,
        domContentLoaded: 900,
        bundleSize: 650000,
        chunkCount: 4,
        cacheHitRate: 0.85,
        totalResourceSize: 1200000,
        memoryUsage: 75,
        cpuUsage: 0.35,
        networkLatency: 40,
        bandwidth: 12,
        crisisDetectionResponseTime: 95,
        chatMessageLatency: 180,
        videoStreamingQuality: 95,
        offlineCapabilityStatus: 90,
        userEngagementScore: 88,
        featureUsabilityScore: 92,
        accessibilityScore: 87,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [mockMetrics];

      const report = monitor.generatePerformanceReport();
      
      expect(report).toContain('Comprehensive Performance Report');
      expect(report).toContain('Core Web Vitals');
      expect(report).toContain('Crisis Detection Response');
      expect(report).toContain('Performance Grade');
      expect(report).toContain('1200ms'); // FCP value
      expect(report).toContain('95ms'); // Crisis detection
    });

    test.skip('should calculate performance grade correctly', () => {
      const excellentMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 800,
        largestContentfulPaint: 1800,
        firstInputDelay: 20,
        cumulativeLayoutShift: 0.02,
        timeToFirstByte: 120,
        loadTime: 1200,
        domContentLoaded: 600,
        bundleSize: 400000,
        chunkCount: 3,
        cacheHitRate: 0.95,
        totalResourceSize: 800000,
        memoryUsage: 35,
        cpuUsage: 0.25,
        networkLatency: 25,
        bandwidth: 20,
        crisisDetectionResponseTime: 60,
        chatMessageLatency: 120,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 95,
        featureUsabilityScore: 98,
        accessibilityScore: 95,
        timestamp: Date.now(),
      };

      (monitor as any).performanceHistory = [excellentMetrics];
      const report = monitor.generatePerformanceReport();
      
      expect(report).toContain('Excellent (A+)');
    });

    test.skip('should handle empty metrics gracefully', () => {
      const report = monitor.generatePerformanceReport();
      
      expect(report).toBe('No performance data available');
    });
  });

  describe('Data Management', () => {
    test.skip('should add metrics to history', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        bundleSize: 600000,
        chunkCount: 4,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        memoryUsage: 60,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 120,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: Date.now(),
      };

      (monitor as any).addMetricsToHistory(mockMetrics);
      
      const history = monitor.getPerformanceHistory();
      expect(history).toContain(mockMetrics);
    });

    test.skip('should limit history size', () => {
      // Add more than 1000 metrics
      for (let i = 0; i < 1200; i++) {
        const mockMetrics: EnhancedPerformanceMetrics = {
          firstContentfulPaint: 1500,
          largestContentfulPaint: 2500,
          firstInputDelay: 50,
          cumulativeLayoutShift: 0.1,
          timeToFirstByte: 200,
          loadTime: 2000,
          domContentLoaded: 1000,
          bundleSize: 600000,
          chunkCount: 4,
          cacheHitRate: 0.8,
          totalResourceSize: 1000000,
          memoryUsage: 60,
          cpuUsage: 0.4,
          networkLatency: 50,
          bandwidth: 10,
          crisisDetectionResponseTime: 120,
          chatMessageLatency: 200,
          videoStreamingQuality: 100,
          offlineCapabilityStatus: 100,
          userEngagementScore: 80,
          featureUsabilityScore: 85,
          accessibilityScore: 80,
          timestamp: Date.now() + i,
        };
        (monitor as any).addMetricsToHistory(mockMetrics);
      }
      
      const history = monitor.getPerformanceHistory();
      expect(history.length).toBe(1000);
    });

    test.skip('should get current metrics', () => {
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        bundleSize: 600000,
        chunkCount: 4,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        memoryUsage: 60,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 120,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: Date.now(),
      };

      (monitor as any).addMetricsToHistory(mockMetrics);
      
      const current = monitor.getCurrentMetrics();
      expect(current).toBe(mockMetrics);
    });

    test.skip('should filter history by time range', () => {
      const now = Date.now();
      const oldMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        bundleSize: 600000,
        chunkCount: 4,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        memoryUsage: 60,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 120,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: now - 25 * 60 * 60 * 1000, // 25 hours ago
      };

      const recentMetrics: EnhancedPerformanceMetrics = {
        ...oldMetrics,
        timestamp: now - 1 * 60 * 60 * 1000, // 1 hour ago
      };

      (monitor as any).addMetricsToHistory(oldMetrics);
      (monitor as any).addMetricsToHistory(recentMetrics);
      
      const recent = monitor.getPerformanceHistory(24); // Last 24 hours
      expect(recent).toContain(recentMetrics);
      expect(recent).not.toContain(oldMetrics);
    });

    test.skip('should cleanup old data', () => {
      const oldTimestamp = Date.now() - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const mockMetrics: EnhancedPerformanceMetrics = {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToFirstByte: 200,
        loadTime: 2000,
        domContentLoaded: 1000,
        bundleSize: 600000,
        chunkCount: 4,
        cacheHitRate: 0.8,
        totalResourceSize: 1000000,
        memoryUsage: 60,
        cpuUsage: 0.4,
        networkLatency: 50,
        bandwidth: 10,
        crisisDetectionResponseTime: 120,
        chatMessageLatency: 200,
        videoStreamingQuality: 100,
        offlineCapabilityStatus: 100,
        userEngagementScore: 80,
        featureUsabilityScore: 85,
        accessibilityScore: 80,
        timestamp: oldTimestamp,
      };

      (monitor as any).addMetricsToHistory(mockMetrics);
      (monitor as any).cleanupOldData();
      
      const history = monitor.getPerformanceHistory();
      expect(history).not.toContain(mockMetrics);
    });
  });

  describe('Error Handling', () => {
    test.skip('should handle observer setup errors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock observer creation to throw
      (global.PerformanceObserver as any as jest.Mock).mockImplementation(() => {
        throw new Error('Observer not supported');
      });

      const errorMonitor = new ComprehensivePerformanceMonitor();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      
      errorMonitor.destroy();
    });

    test.skip('should handle metrics collection errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock performance.getEntriesByType to throw
      (performance.getEntriesByType as jest.Mock).mockImplementation(() => {
        throw new Error('Performance API error');
      });

      const metrics = await (monitor as any).collectCurrentMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test.skip('should handle analytics tracking errors', async () => {
      mockAnalyticsService.track.mockRejectedValue(new Error('Analytics error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // This shouldn't throw even if analytics fails
      await (monitor as any).collectCurrentMetrics();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Singleton Instance', () => {
    test.skip('should export singleton instance', () => {
      expect(comprehensivePerformanceMonitor).toBeInstanceOf(ComprehensivePerformanceMonitor);
    });

    test.skip('should maintain same instance', () => {
      const instance1 = comprehensivePerformanceMonitor;
      const instance2 = comprehensivePerformanceMonitor;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Cleanup', () => {
    test.skip('should stop monitoring properly', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      monitor.stopMonitoring();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockPerformanceObserver.disconnect).toHaveBeenCalled();
    });

    test.skip('should destroy monitor properly', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      monitor.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockPerformanceObserver.disconnect).toHaveBeenCalled();
      
      // Should clear internal data
      expect((monitor as any).performanceHistory.length).toBe(0);
      expect((monitor as any).activeAlerts.length).toBe(0);
      expect((monitor as any).alertCallbacks.length).toBe(0);
    });
  });
});
