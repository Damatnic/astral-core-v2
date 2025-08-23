/**
 * Performance Monitor Component
 * 
 * Real-time performance monitoring and bundle analysis
 * for the Astral Core mental health platform.
 */

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from './LazyComponent';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize: number;
  chunkCount: number;
  cacheHitRate: number;
}

export interface PerformanceMonitorProps {
  showDetails?: boolean;
  threshold?: {
    loadTime?: number;
    bundleSize?: number;
    lcp?: number;
    cls?: number;
  };
  onThresholdExceeded?: (metric: string, value: number, threshold: number) => void;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  threshold = {
    loadTime: 3000,
    bundleSize: 1048576, // 1MB
    lcp: 2500,
    cls: 0.1
  },
  onThresholdExceeded,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const bundleInfo = usePerformanceMonitoring();

  // Collect performance metrics
  useEffect(() => {
    const collectMetrics = () => {
      if (typeof window === 'undefined') return;

      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        const clsEntries = performance.getEntriesByType('layout-shift');
        
        // Core Web Vitals
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const lcp = lcpEntries[lcpEntries.length - 1]?.startTime || 0;
        const cls = clsEntries.reduce((sum, entry) => sum + (entry as any).value, 0);
        
        // Load timing
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        // Bundle information
        const bundleSize = bundleInfo?.totalTransferSize || 0;
        const chunkCount = bundleInfo?.jsResources || 0;
        
        // Estimate cache hit rate (simplified)
        const cacheHitRate = bundleInfo ? 
          (bundleInfo.jsResources / Math.max(bundleInfo.totalResources, 1)) * 100 : 0;
        
        const newMetrics: PerformanceMetrics = {
          loadTime,
          domContentLoaded,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
          cumulativeLayoutShift: cls,
          firstInputDelay: 0, // Would need separate measurement
          bundleSize,
          chunkCount,
          cacheHitRate
        };

        setMetrics(newMetrics);
        
        // Check thresholds and generate warnings
        const newWarnings: string[] = [];
        
        if (loadTime > (threshold.loadTime || 3000)) {
          newWarnings.push(`Load time (${loadTime}ms) exceeds threshold`);
          onThresholdExceeded?.('loadTime', loadTime, threshold.loadTime || 3000);
        }
        
        if (bundleSize > (threshold.bundleSize || 1048576)) {
          newWarnings.push(`Bundle size (${(bundleSize / 1024).toFixed(0)}KB) exceeds threshold`);
          onThresholdExceeded?.('bundleSize', bundleSize, threshold.bundleSize || 1048576);
        }
        
        if (lcp > (threshold.lcp || 2500)) {
          newWarnings.push(`LCP (${lcp.toFixed(0)}ms) exceeds threshold`);
          onThresholdExceeded?.('lcp', lcp, threshold.lcp || 2500);
        }
        
        if (cls > (threshold.cls || 0.1)) {
          newWarnings.push(`CLS (${cls.toFixed(3)}) exceeds threshold`);
          onThresholdExceeded?.('cls', cls, threshold.cls || 0.1);
        }
        
        setWarnings(newWarnings);
        
      } catch (error) {
        console.warn('Performance metrics collection failed:', error);
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }

    // Periodic updates for dynamic metrics
    const interval = setInterval(collectMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [threshold, onThresholdExceeded, bundleInfo]);

  // Format metrics for display
  const formatMetric = (value: number, unit: string, precision = 0) => {
    if (unit === 'ms') {
      return `${value.toFixed(precision)}ms`;
    }
    if (unit === 'KB') {
      return `${(value / 1024).toFixed(precision)}KB`;
    }
    if (unit === '%') {
      return `${value.toFixed(precision)}%`;
    }
    return `${value.toFixed(precision)}${unit}`;
  };

  // Performance thresholds configuration
  const performanceThresholds = {
    firstContentfulPaint: { good: 1800, needsImprovement: 3000 },
    largestContentfulPaint: { good: 2500, needsImprovement: 4000 },
    cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25 },
    loadTime: { good: 2000, needsImprovement: 3000 },
    bundleSize: { good: 512000, needsImprovement: 1048576 }
  };

  // Get metric status (good, needs improvement, poor)
  const getMetricStatus = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = performanceThresholds[metric as keyof typeof performanceThresholds];
    if (!thresholds) return 'good';
    
    if (value <= thresholds.good) {
      return 'good';
    } else if (value <= thresholds.needsImprovement) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  };

  if (!metrics) {
    return (
      <div className={`performance-monitor ${className}`}>
        <div className="performance-loading">
          Collecting performance metrics...
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-monitor ${className}`}>
      {warnings.length > 0 && (
        <div className="performance-warnings">
          <h4>Performance Warnings</h4>
          <ul>
            {warnings.map((warning) => (
              <li key={warning} className="warning-item">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="performance-summary">
        <div className="metric-group">
          <h4>Core Web Vitals</h4>
          <div className="metrics-grid">
            <div className={`metric metric--${getMetricStatus('firstContentfulPaint', metrics.firstContentfulPaint)}`}>
              <span className="metric-label">FCP</span>
              <span className="metric-value">
                {formatMetric(metrics.firstContentfulPaint, 'ms')}
              </span>
            </div>
            <div className={`metric metric--${getMetricStatus('largestContentfulPaint', metrics.largestContentfulPaint)}`}>
              <span className="metric-label">LCP</span>
              <span className="metric-value">
                {formatMetric(metrics.largestContentfulPaint, 'ms')}
              </span>
            </div>
            <div className={`metric metric--${getMetricStatus('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}`}>
              <span className="metric-label">CLS</span>
              <span className="metric-value">
                {formatMetric(metrics.cumulativeLayoutShift, '', 3)}
              </span>
            </div>
          </div>
        </div>

        <div className="metric-group">
          <h4>Loading Performance</h4>
          <div className="metrics-grid">
            <div className={`metric metric--${getMetricStatus('loadTime', metrics.loadTime)}`}>
              <span className="metric-label">Load Time</span>
              <span className="metric-value">
                {formatMetric(metrics.loadTime, 'ms')}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">DOM Ready</span>
              <span className="metric-value">
                {formatMetric(metrics.domContentLoaded, 'ms')}
              </span>
            </div>
          </div>
        </div>

        <div className="metric-group">
          <h4>Bundle Analysis</h4>
          <div className="metrics-grid">
            <div className={`metric metric--${getMetricStatus('bundleSize', metrics.bundleSize)}`}>
              <span className="metric-label">Bundle Size</span>
              <span className="metric-value">
                {formatMetric(metrics.bundleSize, 'KB')}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Chunks</span>
              <span className="metric-value">
                {metrics.chunkCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && bundleInfo && (
        <div className="performance-details">
          <h4>Bundle Details</h4>
          <div className="bundle-info">
            <div className="bundle-stat">
              <span>Total Resources:</span>
              <span>{bundleInfo.totalResources}</span>
            </div>
            <div className="bundle-stat">
              <span>JS Resources:</span>
              <span>{bundleInfo.jsResources}</span>
            </div>
            <div className="bundle-stat">
              <span>CSS Resources:</span>
              <span>{bundleInfo.cssResources}</span>
            </div>
            <div className="bundle-stat">
              <span>Transfer Size:</span>
              <span>{formatMetric(bundleInfo.totalTransferSize, 'KB')}</span>
            </div>
            <div className="bundle-stat">
              <span>Decoded Size:</span>
              <span>{formatMetric(bundleInfo.totalDecodedSize, 'KB')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles for the performance monitor
export const performanceMonitorStyles = `
  .performance-monitor {
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    background-color: var(--bg-secondary, #f8fafc);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }

  .performance-loading {
    text-align: center;
    color: var(--text-secondary, #64748b);
    font-size: 14px;
    padding: 20px;
  }

  .performance-warnings {
    background-color: var(--amber-50, #fffbeb);
    border: 1px solid var(--amber-200, #fde68a);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .performance-warnings h4 {
    margin: 0 0 8px 0;
    color: var(--amber-800, #92400e);
    font-size: 14px;
    font-weight: 600;
  }

  .performance-warnings ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .warning-item {
    color: var(--amber-700, #b45309);
    font-size: 12px;
    margin-bottom: 4px;
    padding-left: 16px;
    position: relative;
  }

  .warning-item::before {
    content: '⚠';
    position: absolute;
    left: 0;
    color: var(--amber-600, #d97706);
  }

  .performance-summary {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .metric-group h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .metric {
    background-color: var(--white, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 6px;
    padding: 8px 12px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .metric--good {
    border-color: var(--green-300, #86efac);
    background-color: var(--green-50, #f0fdf4);
  }

  .metric--needs-improvement {
    border-color: var(--amber-300, #fcd34d);
    background-color: var(--amber-50, #fffbeb);
  }

  .metric--poor {
    border-color: var(--red-300, #fca5a5);
    background-color: var(--red-50, #fef2f2);
  }

  .metric-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary, #64748b);
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metric-value {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .metric--good .metric-value {
    color: var(--green-700, #15803d);
  }

  .metric--needs-improvement .metric-value {
    color: var(--amber-700, #b45309);
  }

  .metric--poor .metric-value {
    color: var(--red-700, #b91c1c);
  }

  .performance-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light, #e2e8f0);
  }

  .performance-details h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
  }

  .bundle-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .bundle-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--white, #ffffff);
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .bundle-stat span:first-child {
    color: var(--text-secondary, #64748b);
    font-weight: 500;
  }

  .bundle-stat span:last-child {
    color: var(--text-primary, #1e293b);
    font-weight: 600;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .performance-summary {
      gap: 12px;
    }

    .metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 6px;
    }

    .metric {
      padding: 6px 8px;
    }

    .bundle-info {
      grid-template-columns: 1fr;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .performance-monitor {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .metric,
    .bundle-stat {
      background-color: var(--bg-secondary-dark, #1e293b);
      border-color: var(--border-dark, #374151);
    }

    .metric-label {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .metric-value {
      color: var(--text-primary-dark, #f1f5f9);
    }

    .bundle-stat span:first-child {
      color: var(--text-secondary-dark, #94a3b8);
    }

    .bundle-stat span:last-child {
      color: var(--text-primary-dark, #f1f5f9);
    }
  }
`;

export default PerformanceMonitor;
