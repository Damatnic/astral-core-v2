/**
 * Performance Monitoring Hook
 * 
 * React hook for monitoring Core Web Vitals and performance metrics
 * specifically optimized for mental health crisis scenarios.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { coreWebVitalsService } from '../services/coreWebVitalsService';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  inp: number | null;
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  isLoading: boolean;
  performanceScore: number;
  recommendations: string[];
  crisisOptimized: boolean;
  mobileOptimized: boolean;
}

interface UsePerformanceMonitorOptions {
  enableRealTimeAlerts?: boolean;
  enableCrisisOptimization?: boolean;
  enableAutomaticReporting?: boolean;
  reportingInterval?: number;
}

interface CrisisPerformanceThresholds {
  criticalLCP: number;
  criticalFID: number;
  criticalTTFB: number;
  emergencyResponseTime: number;
}

const CRISIS_THRESHOLDS: CrisisPerformanceThresholds = {
  criticalLCP: 1500, // 1.5s for crisis pages
  criticalFID: 50,   // 50ms for crisis interactions
  criticalTTFB: 500, // 500ms for crisis resources
  emergencyResponseTime: 100 // 100ms for emergency buttons
};

const DEFAULT_THRESHOLDS = {
  goodLCP: 2500,
  goodFID: 100,
  goodCLS: 0.1,
  goodFCP: 1800,
  goodTTFB: 800,
  goodINP: 200
};

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    enableRealTimeAlerts = true,
    enableCrisisOptimization = true,
    enableAutomaticReporting = true,
    reportingInterval = 30000
  } = options;

  // Use native location for performance monitoring
  const location = { 
    pathname: window.location.pathname, 
    search: window.location.search, 
    hash: window.location.hash, 
    state: null, 
    key: 'default' 
  };
  
  const reportingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    metrics: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      inp: null
    },
    isLoading: true,
    performanceScore: 0,
    recommendations: [],
    crisisOptimized: false,
    mobileOptimized: false
  });

  /**
   * Check if current route is crisis-related
   */
  const isCrisisRoute = useCallback((): boolean => {
    const crisisRoutes = ['/crisis', '/emergency', '/safety-plan', '/offline-crisis'];
    return crisisRoutes.some(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  /**
   * Check if current device is mobile
   */
  const isMobileDevice = useCallback((): boolean => {
    return window.innerWidth < 768;
  }, []);

  /**
   * Calculate LCP score
   */
  const calculateLCPScore = useCallback((lcp: number | null, isCrisis: boolean): number => {
    if (lcp === null) return 0;
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalLCP : DEFAULT_THRESHOLDS.goodLCP;
    if (lcp > threshold) return -25;
    if (lcp > threshold * 0.8) return -10;
    return 0;
  }, []);

  /**
   * Calculate FID score
   */
  const calculateFIDScore = useCallback((fid: number | null, isCrisis: boolean): number => {
    if (fid === null) return 0;
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalFID : DEFAULT_THRESHOLDS.goodFID;
    if (fid > threshold) return -20;
    if (fid > threshold * 0.8) return -8;
    return 0;
  }, []);

  /**
   * Calculate TTFB score
   */
  const calculateTTFBScore = useCallback((ttfb: number | null, isCrisis: boolean): number => {
    if (ttfb === null) return 0;
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalTTFB : DEFAULT_THRESHOLDS.goodTTFB;
    const penalty = isCrisis ? 30 : 15;
    const lightPenalty = isCrisis ? 15 : 6;
    if (ttfb > threshold) return -penalty;
    if (ttfb > threshold * 0.8) return -lightPenalty;
    return 0;
  }, []);

  /**
   * Calculate performance score based on metrics
   */
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    const isCrisis = isCrisisRoute();
    const isMobile = isMobileDevice();

    // Apply individual metric scores
    score += calculateLCPScore(metrics.lcp, isCrisis);
    score += calculateFIDScore(metrics.fid, isCrisis);
    score += calculateTTFBScore(metrics.ttfb, isCrisis);

    // CLS scoring
    if (metrics.cls !== null) {
      if (metrics.cls > DEFAULT_THRESHOLDS.goodCLS) score -= 15;
      else if (metrics.cls > DEFAULT_THRESHOLDS.goodCLS * 0.8) score -= 6;
    }

    // Mobile-specific penalties
    if (isMobile) {
      if (metrics.lcp && metrics.lcp > 3000) score -= 10;
      if (metrics.fid && metrics.fid > 200) score -= 10;
    }

    return Math.max(0, Math.round(score));
  }, [isCrisisRoute, isMobileDevice, calculateLCPScore, calculateFIDScore, calculateTTFBScore]);

  /**
   * Generate LCP recommendations
   */
  const generateLCPRecommendations = useCallback((lcp: number | null, isCrisis: boolean): string[] => {
    if (!lcp) return [];
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalLCP : DEFAULT_THRESHOLDS.goodLCP;
    if (lcp > threshold) {
      return [isCrisis 
        ? 'Crisis page LCP too slow - prioritize critical resources'
        : 'Large Contentful Paint too slow - optimize images and critical resources'];
    }
    return [];
  }, []);

  /**
   * Generate FID recommendations
   */
  const generateFIDRecommendations = useCallback((fid: number | null, isCrisis: boolean): string[] => {
    if (!fid) return [];
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalFID : DEFAULT_THRESHOLDS.goodFID;
    if (fid > threshold) {
      return [isCrisis
        ? 'Crisis interaction response too slow - reduce JavaScript execution time'
        : 'First Input Delay too high - reduce main thread blocking'];
    }
    return [];
  }, []);

  /**
   * Generate TTFB recommendations
   */
  const generateTTFBRecommendations = useCallback((ttfb: number | null, isCrisis: boolean): string[] => {
    if (!ttfb) return [];
    const threshold = isCrisis ? CRISIS_THRESHOLDS.criticalTTFB : DEFAULT_THRESHOLDS.goodTTFB;
    if (ttfb > threshold) {
      return [isCrisis
        ? 'Crisis resource server response too slow - optimize backend'
        : 'Server response time too slow - optimize backend performance'];
    }
    return [];
  }, []);

  /**
   * Generate performance recommendations
   */
  const generateRecommendations = useCallback((metrics: PerformanceMetrics, score: number): string[] => {
    const isCrisis = isCrisisRoute();
    const isMobile = isMobileDevice();
    
    let recommendations: string[] = [];

    // Collect recommendations from individual metrics
    recommendations = recommendations.concat(generateLCPRecommendations(metrics.lcp, isCrisis));
    recommendations = recommendations.concat(generateFIDRecommendations(metrics.fid, isCrisis));
    recommendations = recommendations.concat(generateTTFBRecommendations(metrics.ttfb, isCrisis));

    // CLS recommendations
    if (metrics.cls && metrics.cls > DEFAULT_THRESHOLDS.goodCLS) {
      recommendations.push('Layout shifts detected - ensure stable page layouts');
    }

    // Mobile and crisis context recommendations
    if (isMobile && score < 80) {
      recommendations.push('Mobile performance suboptimal - implement mobile-specific optimizations');
    }

    if (isCrisis && score < 90) {
      recommendations.push('Crisis page performance critical - implement emergency optimizations');
    }

    return recommendations;
  }, [isCrisisRoute, isMobileDevice, generateLCPRecommendations, generateFIDRecommendations, generateTTFBRecommendations]);

  /**
   * Handle performance metric updates
   */
  const handleMetricUpdate = useCallback((metric: { name: string; value: number; id?: string; isCrisisCritical?: boolean }) => {
    setPerformanceState(prevState => {
      const newMetrics = {
        ...prevState.metrics,
        [metric.name.toLowerCase()]: metric.value
      };

      const newScore = calculatePerformanceScore(newMetrics);
      const newRecommendations = generateRecommendations(newMetrics, newScore);
      const isCrisis = isCrisisRoute();
      const isMobile = isMobileDevice();

      // Check optimization status
      const crisisOptimized = !isCrisis || newScore >= 90;
      const mobileOptimized = !isMobile || newScore >= 85;

      // Real-time alerts for poor performance
      if (enableRealTimeAlerts && isCrisis && metric.value > CRISIS_THRESHOLDS.criticalLCP) {
        console.warn(`🚨 Critical performance issue in crisis scenario: ${metric.name} = ${metric.value}ms`);
        // Could trigger user notifications or fallback mechanisms
      }

      return {
        metrics: newMetrics,
        isLoading: false,
        performanceScore: newScore,
        recommendations: newRecommendations,
        crisisOptimized,
        mobileOptimized
      };
    });
  }, [calculatePerformanceScore, generateRecommendations, isCrisisRoute, isMobileDevice, enableRealTimeAlerts]);

  /**
   * Monitor emergency button performance
   */
  const monitorEmergencyButtons = useCallback(() => {
    const handleEmergencyClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.crisis-button') || 
          target.closest('.emergency-button') ||
          target.closest('[data-crisis="true"]')) {
        
        const startTime = performance.now();
        
        // Measure time to visual response
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          
          if (responseTime > CRISIS_THRESHOLDS.emergencyResponseTime) {
            console.warn(`🚨 Emergency button response time too slow: ${responseTime}ms`);
            
            // Update metrics with emergency response time
            handleMetricUpdate({
              name: 'FID',
              value: responseTime,
              id: `emergency-${Date.now()}`,
              isCrisisCritical: true
            });
          }
        });
      }
    };

    document.addEventListener('click', handleEmergencyClick);
    return () => document.removeEventListener('click', handleEmergencyClick);
  }, [handleMetricUpdate]);

  /**
   * Start automatic performance reporting
   */
  const startAutomaticReporting = useCallback(() => {
    if (!enableAutomaticReporting) return;

    // Clear any existing interval
    if (reportingIntervalRef.current) {
      clearInterval(reportingIntervalRef.current);
    }

    reportingIntervalRef.current = setInterval(() => {
      const report = coreWebVitalsService.generateReport();
      
      // Log performance summary
      console.log('📊 Performance Report:', {
        route: window.location.pathname,
        timestamp: Date.now()
      });
      
      // Store performance data locally for analysis
      try {
        const existingReports = localStorage.getItem('performance_reports');
        const reports = existingReports ? JSON.parse(existingReports) : [];
        reports.push({
          ...report,
          pathname: window.location.pathname,
          timestamp: Date.now()
        });
        
        // Keep only last 50 reports
        if (reports.length > 50) {
          reports.splice(0, reports.length - 50);
        }
        
        localStorage.setItem('performance_reports', JSON.stringify(reports));
      } catch (error) {
        console.warn('Could not store performance report:', error);
      }
    }, reportingInterval);
    
    // Return cleanup function
    return () => {
      if (reportingIntervalRef.current) {
        clearInterval(reportingIntervalRef.current);
      }
    };
  }, [enableAutomaticReporting, reportingInterval]);

  /**
   * Initialize performance monitoring
   */
  useEffect(() => {
    let emergencyCleanup: (() => void) | undefined;
    let reportingCleanup: (() => void) | undefined;

    const initializeMonitoring = async () => {
      try {
        // Initialize Core Web Vitals service
        await coreWebVitalsService.initialize();
        
        // Set up emergency button monitoring
        emergencyCleanup = monitorEmergencyButtons();
        
        // Start automatic reporting
        reportingCleanup = startAutomaticReporting();
        
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
        setPerformanceState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeMonitoring();

    return () => {
      if (emergencyCleanup) emergencyCleanup();
      if (reportingCleanup) reportingCleanup();
      if (reportingIntervalRef.current) {
        clearInterval(reportingIntervalRef.current);
      }
    };
  }, [monitorEmergencyButtons, startAutomaticReporting]);

  /**
   * Reset metrics on route change
   */
  useEffect(() => {
    setPerformanceState(prev => ({
      ...prev,
      metrics: {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        inp: null
      },
      isLoading: true
    }));
  }, [location.pathname]);

  /**
   * Optimize for crisis routes
   */
  useEffect(() => {
    if (enableCrisisOptimization && isCrisisRoute()) {
      // Implement crisis-specific optimizations
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/offline-crisis.html';
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [enableCrisisOptimization, isCrisisRoute]);

  /**
   * Get current performance summary
   */
  const getPerformanceSummary = useCallback(() => {
    return {
      ...performanceState,
      webVitalsSummary: coreWebVitalsService.getPerformanceSummary(),
      isCrisisRoute: isCrisisRoute(),
      isMobileDevice: isMobileDevice()
    };
  }, [performanceState, isCrisisRoute, isMobileDevice]);

  /**
   * Force generate performance report
   */
  const generateReport = useCallback(() => {
    return coreWebVitalsService.generateReport();
  }, []);

  /**
   * Check if performance is critical
   */
  const isPerformanceCritical = useCallback((): boolean => {
    const { metrics } = performanceState;
    const isCrisis = isCrisisRoute();
    
    if (isCrisis) {
      return (
        (metrics.lcp !== null && metrics.lcp > CRISIS_THRESHOLDS.criticalLCP) ||
        (metrics.fid !== null && metrics.fid > CRISIS_THRESHOLDS.criticalFID) ||
        (metrics.ttfb !== null && metrics.ttfb > CRISIS_THRESHOLDS.criticalTTFB)
      );
    }
    
    return performanceState.performanceScore < 70;
  }, [performanceState, isCrisisRoute]);

  return {
    ...performanceState,
    getPerformanceSummary,
    generateReport,
    isPerformanceCritical,
    handleMetricUpdate,
    isCrisisRoute: isCrisisRoute(),
    isMobileDevice: isMobileDevice()
  };
};
