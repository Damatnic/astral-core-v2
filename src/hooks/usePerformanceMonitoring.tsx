/**
 * Performance Monitor Integration Utility
 * 
 * Integrates the comprehensive performance monitoring system with existing
 * components and provides hooks for React components to easily access
 * performance data and alerts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  comprehensivePerformanceMonitor,
  EnhancedPerformanceMetrics,
  PerformanceAlert,
  OptimizationRecommendation
} from '../services/comprehensivePerformanceMonitor';

// Hook for accessing current performance metrics
export const usePerformanceMetrics = (refreshInterval = 10000) => {
  const [metrics, setMetrics] = useState<EnhancedPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        // Simulate async operation for consistency
        await new Promise(resolve => setTimeout(resolve, 0));
        const currentMetrics = comprehensivePerformanceMonitor.getCurrentMetrics();
        setMetrics(currentMetrics);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    // Initial load
    updateMetrics();

    // Set up periodic updates
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { metrics, isLoading, error };
};

// Hook for performance alerts
export const usePerformanceAlerts = () => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const alertsRef = useRef<PerformanceAlert[]>([]);

  // Handle alert updates
  const handleAlertUpdate = useCallback((alert: PerformanceAlert) => {
    setAlerts(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(a => a.id === alert.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = alert;
      } else {
        updated.push(alert);
        // Increment new alert count
        setNewAlertCount(count => count + 1);
      }
      
      alertsRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    // Load existing alerts
    const existingAlerts = comprehensivePerformanceMonitor.getActiveAlerts();
    setAlerts(existingAlerts);
    alertsRef.current = existingAlerts;

    // Subscribe to new alerts
    const unsubscribe = comprehensivePerformanceMonitor.onAlert(handleAlertUpdate);

    return unsubscribe;
  }, [handleAlertUpdate]);

  const clearNewAlerts = useCallback(() => {
    setNewAlertCount(0);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    newAlertCount,
    clearNewAlerts,
    dismissAlert
  };
};

// Hook for optimization recommendations
export const useOptimizationRecommendations = (maxRecommendations = 10) => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateRecommendations = async () => {
      try {
        // Simulate async operation for consistency
        await new Promise(resolve => setTimeout(resolve, 0));
        const recs = comprehensivePerformanceMonitor.generateOptimizationRecommendations();
        setRecommendations(recs.slice(0, maxRecommendations));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to generate optimization recommendations:', error);
        setIsLoading(false);
      }
    };

    updateRecommendations();

    // Update recommendations when metrics change significantly
    const interval = setInterval(updateRecommendations, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [maxRecommendations]);

  return { recommendations, isLoading };
};

// Hook for performance grade calculation
export const usePerformanceGrade = () => {
  const [grade, setGrade] = useState<string>('');
  const [gradeColor, setGradeColor] = useState<string>('#64748b');

  useEffect(() => {
    const updateGrade = () => {
      try {
        const report = comprehensivePerformanceMonitor.generatePerformanceReport();
        const gradeMatch = report.match(/## 📈 Performance Grade\n(.+)/);
        const gradeText = gradeMatch ? gradeMatch[1] : 'Unknown';
        
        setGrade(gradeText);
        
        // Set color based on grade
        if (gradeText.includes('Excellent') || gradeText.includes('A+')) {
          setGradeColor('#22c55e'); // green
        } else if (gradeText.includes('Good') || gradeText.includes('A')) {
          setGradeColor('#3b82f6'); // blue
        } else if (gradeText.includes('Fair') || gradeText.includes('B')) {
          setGradeColor('#eab308'); // yellow
        } else if (gradeText.includes('Needs Improvement') || gradeText.includes('C')) {
          setGradeColor('#f97316'); // orange
        } else {
          setGradeColor('#ef4444'); // red
        }
      } catch (error) {
        console.error('Failed to calculate performance grade:', error);
        setGrade('Error');
        setGradeColor('#ef4444');
      }
    };

    updateGrade();

    // Update grade periodically
    const interval = setInterval(updateGrade, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { grade, gradeColor };
};

// Hook for crisis performance monitoring
export const useCrisisPerformanceMonitoring = () => {
  const [crisisMetrics, setCrisisMetrics] = useState({
    responseTime: 0,
    isHealthy: true,
    lastCheck: Date.now()
  });

  useEffect(() => {
    const checkCrisisPerformance = () => {
      const metrics = comprehensivePerformanceMonitor.getCurrentMetrics();
      
      if (metrics) {
        const responseTime = metrics.crisisDetectionResponseTime;
        const isHealthy = responseTime < 300; // 300ms threshold for crisis detection
        
        setCrisisMetrics({
          responseTime,
          isHealthy,
          lastCheck: Date.now()
        });

        // Log critical issues
        if (!isHealthy) {
          console.error(`🚨 Crisis detection performance degraded: ${responseTime}ms`);
        }
      }
    };

    // Check immediately
    checkCrisisPerformance();

    // Check frequently for crisis performance
    const interval = setInterval(checkCrisisPerformance, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return crisisMetrics;
};

// Performance context provider for app-wide performance monitoring
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { metrics } = usePerformanceMetrics();

  // Monitor for critical performance issues
  useEffect(() => {
    if (metrics) {
      // Check for critical performance issues
      const criticalIssues: string[] = [];
      
      if (metrics.crisisDetectionResponseTime > 500) {
        criticalIssues.push('Crisis detection severely degraded');
      }
      
      if (metrics.memoryUsage > 200) {
        criticalIssues.push('Memory usage critically high');
      }
      
      if (metrics.largestContentfulPaint > 5000) {
        criticalIssues.push('Page loading extremely slow');
      }

      // Log critical issues for monitoring
      if (criticalIssues.length > 0) {
        console.error('Critical performance issues detected:', criticalIssues);
        
        // Could trigger notifications, fallback modes, etc.
        // notifyDevOps(criticalIssues);
        // enablePerformanceEmergencyMode();
      }
    }
  }, [metrics]);

  return <>{children}</>;
};

// Utility function to generate performance summary
export const generatePerformanceSummary = (): string => {
  try {
    return comprehensivePerformanceMonitor.generatePerformanceReport();
  } catch (error) {
    console.error('Failed to generate performance summary:', error);
    return 'Performance summary unavailable';
  }
};

// Utility function to export performance data
export const exportPerformanceData = (hours = 24) => {
  try {
    const metrics = comprehensivePerformanceMonitor.getPerformanceHistory(hours);
    const alerts = comprehensivePerformanceMonitor.getActiveAlerts();
    const recommendations = comprehensivePerformanceMonitor.generateOptimizationRecommendations();
    
    return {
      exportTimestamp: new Date().toISOString(),
      timeRange: `${hours} hours`,
      metrics,
      alerts,
      recommendations,
      summary: generatePerformanceSummary()
    };
  } catch (error) {
    console.error('Failed to export performance data:', error);
    return null;
  }
};

// Utility function to check if performance monitoring is healthy
export const isPerformanceMonitoringHealthy = (): boolean => {
  try {
    const metrics = comprehensivePerformanceMonitor.getCurrentMetrics();
    return metrics !== null && metrics.timestamp > Date.now() - 60000; // Data less than 1 minute old
  } catch (error) {
    console.error('Performance monitoring health check failed:', error);
    return false;
  }
};

// Utility component for performance debugging (development only)
export const PerformanceDebugInfo: React.FC = () => {
  const { metrics } = usePerformanceMetrics(5000); // Update every 5 seconds
  const { alerts } = usePerformanceAlerts();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!metrics) {
    return (
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999
      }}>
        Performance data loading...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa' }}>🔍 Performance Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>FCP:</strong> {metrics.firstContentfulPaint.toFixed(0)}ms
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>LCP:</strong> {metrics.largestContentfulPaint.toFixed(0)}ms
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>FID:</strong> {metrics.firstInputDelay.toFixed(0)}ms
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>CLS:</strong> {metrics.cumulativeLayoutShift.toFixed(3)}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Bundle:</strong> {(metrics.bundleSize / 1024).toFixed(0)}KB
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Memory:</strong> {metrics.memoryUsage.toFixed(1)}MB
      </div>
      
      <div style={{ 
        marginBottom: '8px',
        color: metrics.crisisDetectionResponseTime > 300 ? '#f87171' : '#34d399'
      }}>
        <strong>Crisis Response:</strong> {metrics.crisisDetectionResponseTime.toFixed(0)}ms
        {metrics.crisisDetectionResponseTime > 300 && ' 🚨'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Accessibility:</strong> {metrics.accessibilityScore.toFixed(0)}%
      </div>
      
      {alerts.length > 0 && (
        <div style={{ 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #374151'
        }}>
          <strong style={{ color: '#f87171' }}>Alerts ({alerts.length}):</strong>
          {alerts.slice(0, 3).map(alert => (
            <div key={alert.id} style={{ 
              fontSize: '10px',
              color: '#fbbf24',
              marginTop: '2px'
            }}>
              {alert.severity.toUpperCase()}: {alert.metric}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  usePerformanceMetrics,
  usePerformanceAlerts,
  useOptimizationRecommendations,
  usePerformanceGrade,
  useCrisisPerformanceMonitoring,
  PerformanceProvider,
  PerformanceDebugInfo,
  generatePerformanceSummary,
  exportPerformanceData,
  isPerformanceMonitoringHealthy
};
