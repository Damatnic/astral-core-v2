/**
 * Performance Monitor Component
 *
 * Real-time performance monitoring and bundle analysis
 * for the Astral Core mental health platform.
 */

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';

interface PerformanceMetrics {
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

interface PerformanceMonitorProps {
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
  className = ""
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const bundleInfo = usePerformanceMonitoring();

  // Collect performance metrics
  useEffect(() => {
    const collectMetrics = () => {
      if (typeof window === "undefined") return;

      try {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
        const clsEntries = performance.getEntriesByType("layout-shift");

        // Core Web Vitals
        const fcp = paintEntries.find(entry => entry.name === "first-contentful-paint")?.startTime || 0;
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
          onThresholdExceeded?.("lcp", lcp, threshold.lcp || 2500);
        }
        if (cls > (threshold.cls || 0.1)) {
          newWarnings.push(`CLS (${cls.toFixed(3)}) exceeds threshold`);
          onThresholdExceeded?.("cls", cls, threshold.cls || 0.1);
        }
        setWarnings(newWarnings);
      } catch (error) {
        console.warn("Performance metrics collection failed:", error);
      }
    };

    // Collect metrics after page load
    if (document.readyState === "complete") {
      collectMetrics();
    } else {
      window.addEventListener("load", collectMetrics);
    }

    // Periodic updates for dynamic metrics
    const interval = setInterval(collectMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [threshold, onThresholdExceeded, bundleInfo]);

  // Format metrics for display
  const formatMetric = (value: number, unit: string, precision = 0) => {
    if (unit === "ms") {
      return `${value.toFixed(precision)}ms`;
    }
    if (unit === 'KB') {
      return `${(value / 1024).toFixed(precision)}KB`;
    }
    if (unit === "%") {
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
    if (!thresholds) return "good";

    if (value <= thresholds.good) {
      return "good";
    } else if (value <= thresholds.needsImprovement) {
      return 'needs-improvement';
    } else {
      return "poor";
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
        <div className='performance-warnings'>
          <h4>Performance Warnings</h4>
          <ul>
            {warnings.map((warning) => (
              <li key={warning} className='warning-item'>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='performance-summary'>
        <div className='metric-group'>
          <h4>Core Web Vitals</h4>
          <div className="metrics-grid">
            <div className={`metric metric--${getMetricStatus("firstContentfulPaint", metrics.firstContentfulPaint)}`}>
              <span className="metric-label">FCP</span>
              <span className="metric-value">
                {formatMetric(metrics.firstContentfulPaint, "ms")}
              </span>
            </div>
            <div className={`metric metric--${getMetricStatus('largestContentfulPaint', metrics.largestContentfulPaint)}`}>
              <span className='metric-label'>LCP</span>
              <span className='metric-value'>
                {formatMetric(metrics.largestContentfulPaint, 'ms')}
              </span>
            </div>
            <div className={`metric metric--${getMetricStatus('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}`}>
              <span className="metric-label">CLS</span>
              <span className='metric-value'>
                {formatMetric(metrics.cumulativeLayoutShift, "", 3)}
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
            <div className='metric'>
              <span className='metric-label'>DOM Ready</span>
              <span className='metric-value'>
                {formatMetric(metrics.domContentLoaded, "ms")}
              </span>
            </div>
          </div>
        </div>

        <div className="metric-group">
          <h4>Bundle Analysis</h4>
          <div className="metrics-grid">
            <div className={`metric metric--${getMetricStatus("bundleSize", metrics.bundleSize)}`}>
              <span className="metric-label">Bundle Size</span>
              <span className="metric-value">
                {formatMetric(metrics.bundleSize, "KB")}
              </span>
            </div>
            <div className='metric'>
              <span className='metric-label'>Chunks</span>
              <span className='metric-value'>
                {metrics.chunkCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && bundleInfo && (
        <div className="performance-details">
          <h4>Bundle Details</h4>
          <div className='bundle-info'>
            <div className='bundle-stat'>
              <span>Total Resources:</span>
              <span>{bundleInfo.totalResources}</span>
            </div>
            <div className='bundle-stat'>
              <span>JS Resources:</span>
              <span>{bundleInfo.jsResources}</span>
            </div>
            <div className="bundle-stat">
              <span>CSS Resources:</span>
              <span>{bundleInfo.cssResources}</span>
            </div>
            <div className='bundle-stat'>
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

export default PerformanceMonitor;