/**
 * Comprehensive Performance Monitor Component
 * 
 * React component that provides a complete performance monitoring dashboard
 * with real-time alerts, performance budgets, optimization recommendations,
 * and mental health-specific performance considerations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  comprehensivePerformanceMonitor,
  EnhancedPerformanceMetrics,
  PerformanceAlert,
  OptimizationRecommendation,
  AlertSeverity
} from '../services/comprehensivePerformanceMonitor';

interface ComprehensivePerformanceMonitorProps {
  showDetails?: boolean;
  enableRealTimeAlerts?: boolean;
  className?: string;
  onAlert?: (alert: PerformanceAlert) => void;
}

export const ComprehensivePerformanceMonitorComponent: React.FC<ComprehensivePerformanceMonitorProps> = ({
  showDetails = false,
  enableRealTimeAlerts = true,
  className = '',
  onAlert
}) => {
  const [metrics, setMetrics] = useState<EnhancedPerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceGrade, setPerformanceGrade] = useState<string>('');

  // Update metrics and related data
  const updatePerformanceData = useCallback(() => {
    const currentMetrics = comprehensivePerformanceMonitor.getCurrentMetrics();
    const activeAlerts = comprehensivePerformanceMonitor.getActiveAlerts();
    const optimizationRecs = comprehensivePerformanceMonitor.generateOptimizationRecommendations();
    
    setMetrics(currentMetrics);
    setAlerts(activeAlerts);
    setRecommendations(optimizationRecs);
    
    if (currentMetrics) {
      // Generate performance report and extract grade
      const report = comprehensivePerformanceMonitor.generatePerformanceReport();
      const gradeMatch = report.match(/## 📈 Performance Grade\n(.+)/);
      setPerformanceGrade(gradeMatch ? gradeMatch[1] : 'Unknown');
    }
    
    setIsLoading(false);
  }, []);

  // Handle alert updates
  const handleAlertUpdate = useCallback((alert: PerformanceAlert) => {
    setAlerts(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(a => a.id === alert.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = alert;
      } else {
        updated.push(alert);
      }
      
      return updated;
    });
    
    // Notify parent component
    onAlert?.(alert);
  }, [onAlert]);

  // Set up real-time monitoring and alerts
  useEffect(() => {
    // Initial data load
    updatePerformanceData();

    // Set up periodic updates
    const interval = setInterval(updatePerformanceData, 10000); // Every 10 seconds

    // Set up alert handling
    let unsubscribeAlert: (() => void) | undefined;
    
    if (enableRealTimeAlerts) {
      unsubscribeAlert = comprehensivePerformanceMonitor.onAlert(handleAlertUpdate);
    }

    return () => {
      clearInterval(interval);
      unsubscribeAlert?.();
    };
  }, [updatePerformanceData, enableRealTimeAlerts, handleAlertUpdate]);

  // Format metric values for display
  const formatMetric = (value: number, unit: string, precision = 0): string => {
    if (unit === 'ms') return `${value.toFixed(precision)}ms`;
    if (unit === 'MB') return `${value.toFixed(precision)}MB`;
    if (unit === 'KB') return `${(value / 1024).toFixed(precision)}KB`;
    if (unit === '%') return `${value.toFixed(precision)}%`;
    return `${value.toFixed(precision)}`;
  };

  // Get severity color
  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c'; // orange-600
      case 'medium': return '#d97706'; // amber-600
      case 'low': return '#65a30d'; // lime-600
      default: return '#64748b'; // slate-500
    }
  };

  // Get metric status color
  const getMetricStatusColor = (value: number, target: number, warning: number): string => {
    if (value <= target) return '#22c55e'; // green-500
    if (value <= warning) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  if (isLoading) {
    return (
      <div className={`comprehensive-performance-monitor ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Collecting comprehensive performance metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`comprehensive-performance-monitor ${className}`}>
        <div className="error-state">
          <p>Unable to collect performance metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`comprehensive-performance-monitor ${className}`}>
      {/* Performance Grade Overview */}
      <div className="performance-grade">
        <h3>Overall Performance Grade</h3>
        <div className="grade-display">{performanceGrade}</div>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h4>🚨 Active Performance Alerts ({alerts.length})</h4>
          <div className="alerts-list">
            {alerts
              .sort((a, b) => {
                // Crisis-related alerts first, then by severity
                if (a.isCrisisRelated && !b.isCrisisRelated) return -1;
                if (!a.isCrisisRelated && b.isCrisisRelated) return 1;
                
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .slice(0, 5) // Show top 5 alerts
              .map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-item alert-${alert.severity}`}
                  style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                >
                  <div className="alert-header">
                    <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                    {alert.isCrisisRelated && <span className="crisis-badge">🩺 CRISIS-RELATED</span>}
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  {alert.recommendations.length > 0 && (
                    <div className="alert-recommendations">
                      <strong>Recommendations:</strong>
                      <ul>
                        {alert.recommendations.slice(0, 2).map((rec) => (
                          <li key={`${alert.id}-rec-${rec.substring(0, 20)}`}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Core Metrics Dashboard */}
      <div className="metrics-dashboard">
        <div className="metrics-section">
          <h4>🏃‍♂️ Core Web Vitals</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">First Contentful Paint</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.firstContentfulPaint, 1500, 3000) }}
              >
                {formatMetric(metrics.firstContentfulPaint, 'ms')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Largest Contentful Paint</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.largestContentfulPaint, 2500, 4000) }}
              >
                {formatMetric(metrics.largestContentfulPaint, 'ms')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">First Input Delay</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.firstInputDelay, 50, 100) }}
              >
                {formatMetric(metrics.firstInputDelay, 'ms')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Cumulative Layout Shift</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.cumulativeLayoutShift, 0.05, 0.1) }}
              >
                {formatMetric(metrics.cumulativeLayoutShift, '', 3)}
              </span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h4>🧠 Mental Health Platform Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-card crisis-metric">
              <span className="metric-label">Crisis Detection Response</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.crisisDetectionResponseTime, 100, 300) }}
              >
                {formatMetric(metrics.crisisDetectionResponseTime, 'ms')}
                {metrics.crisisDetectionResponseTime > 300 && <span className="warning-icon">🚨</span>}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Chat Message Latency</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.chatMessageLatency, 200, 500) }}
              >
                {formatMetric(metrics.chatMessageLatency, 'ms')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Video Streaming Quality</span>
              <span className="metric-value">
                {formatMetric(metrics.videoStreamingQuality, '%')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Offline Capability</span>
              <span className="metric-value">
                {formatMetric(metrics.offlineCapabilityStatus, '%')}
              </span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h4>💻 System Performance</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Bundle Size</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.bundleSize, 500000, 1000000) }}
              >
                {formatMetric(metrics.bundleSize, 'KB')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Memory Usage</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.memoryUsage, 50, 100) }}
              >
                {formatMetric(metrics.memoryUsage, 'MB')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Load Time</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.loadTime, 2000, 4000) }}
              >
                {formatMetric(metrics.loadTime, 'ms')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Network Latency</span>
              <span className="metric-value">
                {formatMetric(metrics.networkLatency, 'ms')}
              </span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h4>👤 User Experience Scores</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">User Engagement</span>
              <span className="metric-value">
                {formatMetric(metrics.userEngagementScore, '%')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Feature Usability</span>
              <span className="metric-value">
                {formatMetric(metrics.featureUsabilityScore, '%')}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Accessibility Score</span>
              <span 
                className="metric-value"
                style={{ color: getMetricStatusColor(metrics.accessibilityScore, 85, 70) }}
              >
                {formatMetric(metrics.accessibilityScore, '%')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 Optimization Recommendations ({recommendations.length})</h4>
          <div className="recommendations-list">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className={`recommendation-item priority-${rec.priority}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`priority-badge priority-${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-details">
                  <div className="recommendation-gain">
                    <strong>Expected gain:</strong> {rec.estimatedGain}
                  </div>
                  <div className="recommendation-impact">
                    <strong>Mental health impact:</strong> {rec.mentalHealthImpact}
                  </div>
                </div>
                {showDetails && (
                  <div className="recommendation-implementation">
                    <strong>Implementation:</strong> {rec.implementation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trends (if detailed view) */}
      {showDetails && (
        <div className="trends-section">
          <h4>📈 Performance Trends</h4>
          <div className="trends-info">
            <p>Historical performance data and trend analysis would be displayed here.</p>
            <p>This could include charts showing performance over time, regression detection, and improvement tracking.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles for the comprehensive performance monitor
export const comprehensivePerformanceMonitorStyles = `
  .comprehensive-performance-monitor {
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    background-color: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 12px;
    padding: 24px;
    margin: 16px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary, #64748b);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 16px;
    border: 3px solid var(--border-light, #e2e8f0);
    border-top: 3px solid var(--primary-500, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .performance-grade {
    text-align: center;
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, var(--primary-50, #eff6ff), var(--primary-100, #dbeafe));
    border-radius: 8px;
  }

  .performance-grade h3 {
    margin: 0 0 12px 0;
    color: var(--text-primary, #1e293b);
    font-size: 18px;
    font-weight: 600;
  }

  .grade-display {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-600, #2563eb);
  }

  .alerts-section {
    margin-bottom: 24px;
  }

  .alerts-section h4 {
    margin: 0 0 16px 0;
    color: var(--text-primary, #1e293b);
    font-size: 16px;
    font-weight: 600;
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alert-item {
    padding: 16px;
    border-left: 4px solid;
    border-radius: 6px;
    background-color: var(--bg-secondary, #f8fafc);
  }

  .alert-critical {
    background-color: var(--red-50, #fef2f2);
    border-left-color: var(--red-500, #ef4444);
  }

  .alert-high {
    background-color: var(--orange-50, #fff7ed);
    border-left-color: var(--orange-500, #f97316);
  }

  .alert-medium {
    background-color: var(--amber-50, #fffbeb);
    border-left-color: var(--amber-500, #f59e0b);
  }

  .alert-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .alert-severity {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--gray-200, #e5e7eb);
    color: var(--gray-800, #1f2937);
  }

  .crisis-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--red-100, #fee2e2);
    color: var(--red-800, #991b1b);
  }

  .alert-description {
    margin: 0 0 8px 0;
    color: var(--text-primary, #1e293b);
    font-size: 14px;
  }

  .alert-recommendations {
    font-size: 13px;
    color: var(--text-secondary, #64748b);
  }

  .alert-recommendations ul {
    margin: 4px 0 0 0;
    padding-left: 16px;
  }

  .metrics-dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;
  }

  .metrics-section h4 {
    margin: 0 0 16px 0;
    color: var(--text-primary, #1e293b);
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .metric-card {
    padding: 16px;
    background-color: var(--white, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.2s ease;
  }

  .metric-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .crisis-metric {
    border: 2px solid var(--red-200, #fecaca);
    background-color: var(--red-50, #fef2f2);
  }

  .metric-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary, #64748b);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metric-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #1e293b);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .warning-icon {
    font-size: 14px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .recommendations-section {
    margin-bottom: 24px;
  }

  .recommendations-section h4 {
    margin: 0 0 16px 0;
    color: var(--text-primary, #1e293b);
    font-size: 16px;
    font-weight: 600;
  }

  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .recommendation-item {
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--border-light, #e2e8f0);
    background-color: var(--white, #ffffff);
  }

  .priority-critical {
    border-left: 4px solid var(--red-500, #ef4444);
    background-color: var(--red-50, #fef2f2);
  }

  .priority-high {
    border-left: 4px solid var(--orange-500, #f97316);
    background-color: var(--orange-50, #fff7ed);
  }

  .priority-medium {
    border-left: 4px solid var(--amber-500, #f59e0b);
    background-color: var(--amber-50, #fffbeb);
  }

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .recommendation-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .priority-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .priority-badge.priority-critical {
    background-color: var(--red-100, #fee2e2);
    color: var(--red-800, #991b1b);
  }

  .priority-badge.priority-high {
    background-color: var(--orange-100, #ffedd5);
    color: var(--orange-800, #9a3412);
  }

  .priority-badge.priority-medium {
    background-color: var(--amber-100, #fef3c7);
    color: var(--amber-800, #92400e);
  }

  .recommendation-description {
    margin: 0 0 12px 0;
    color: var(--text-primary, #1e293b);
    font-size: 14px;
    line-height: 1.5;
  }

  .recommendation-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary, #64748b);
  }

  .recommendation-implementation {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-light, #e2e8f0);
    font-size: 13px;
    color: var(--text-secondary, #64748b);
  }

  .trends-section {
    padding-top: 24px;
    border-top: 1px solid var(--border-light, #e2e8f0);
  }

  .trends-section h4 {
    margin: 0 0 16px 0;
    color: var(--text-primary, #1e293b);
    font-size: 16px;
    font-weight: 600;
  }

  .trends-info {
    padding: 20px;
    background-color: var(--gray-50, #f9fafb);
    border-radius: 8px;
    color: var(--text-secondary, #64748b);
    font-size: 14px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .comprehensive-performance-monitor {
      padding: 16px;
    }

    .metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .metric-card {
      padding: 12px;
    }

    .recommendation-header {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .comprehensive-performance-monitor {
      background-color: var(--bg-primary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .metric-card,
    .recommendation-item {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .performance-grade {
      background: linear-gradient(135deg, var(--primary-900, #1e3a8a), var(--primary-800, #1e40af));
    }

    .grade-display {
      color: var(--primary-300, #93c5fd);
    }

    .metric-label {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .metric-value {
      color: var(--text-primary-dark, #f1f5f9);
    }
  }
`;

export default ComprehensivePerformanceMonitorComponent;
