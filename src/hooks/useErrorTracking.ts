/**
 * Error Tracking Hook
 * 
 * React hook for easy integration of error tracking in components
 */

import { useCallback, useEffect } from 'react';
import ErrorTrackingService, { ErrorContext } from '../services/errorTracking';

interface UseErrorTrackingOptions {
  userType?: 'seeker' | 'helper' | 'admin';
  feature?: ErrorContext['feature'];
  autoTrackMount?: boolean;
}

export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const { userType, feature, autoTrackMount = false } = options;

  // Track component mount if enabled
  useEffect(() => {
    if (autoTrackMount && feature) {
      ErrorTrackingService.addBreadcrumb(
        `Component mounted: ${feature}`,
        'navigation',
        'info',
        { user_type: userType }
      );
    }
  }, [autoTrackMount, feature, userType]);

  /**
   * Track errors with automatic context
   */
  const trackError = useCallback((
    error: Error,
    context: Partial<ErrorContext> = {},
    extra?: Record<string, any>
  ) => {
    const fullContext: ErrorContext = {
      errorType: 'user-action',
      severity: 'medium',
      privacyLevel: 'private',
      userType,
      feature,
      ...context
    };

    ErrorTrackingService.captureError(error, fullContext, extra);
  }, [userType, feature]);

  /**
   * Track crisis-specific errors
   */
  const trackCrisisError = useCallback((
    error: Error,
    crisisContext: {
      detectionResult?: any;
      escalationLevel?: 'low' | 'medium' | 'high' | 'critical';
    } = {},
    extra?: Record<string, any>
  ) => {
    if (!userType || (userType !== 'seeker' && userType !== 'helper')) {
      console.warn('userType must be seeker or helper for crisis error tracking');
      return;
    }

    ErrorTrackingService.captureCrisisError(error, {
      userType: userType as 'seeker' | 'helper',
      ...crisisContext
    }, extra);
  }, [userType]);

  /**
   * Track user actions
   */
  const trackUserAction = useCallback((
    action: string,
    error?: Error,
    extra?: Record<string, any>
  ) => {
    if (error && userType && (userType === 'seeker' || userType === 'helper')) {
      ErrorTrackingService.captureUserActionError(
        error,
        action,
        userType as 'seeker' | 'helper',
        feature,
        extra
      );
    } else {
      ErrorTrackingService.addBreadcrumb(
        `User action: ${action}`,
        'user',
        'info',
        { user_type: userType, feature, ...extra }
      );
    }
  }, [userType, feature]);

  /**
   * Track network errors
   */
  const trackNetworkError = useCallback((
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number,
    extra?: Record<string, any>
  ) => {
    ErrorTrackingService.captureNetworkError(
      error,
      endpoint,
      method,
      statusCode,
      { user_type: userType, feature, ...extra }
    );
  }, [userType, feature]);

  /**
   * Track performance issues
   */
  const trackPerformance = useCallback((
    name: string,
    duration: number,
    threshold: number = 1000,
    context?: Record<string, any>
  ) => {
    ErrorTrackingService.capturePerformanceIssue(
      name,
      duration,
      threshold,
      { user_type: userType, feature, ...context }
    );
  }, [userType, feature]);

  /**
   * Add breadcrumb for debugging
   */
  const addBreadcrumb = useCallback((
    message: string,
    category: string = 'custom',
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    data?: Record<string, any>
  ) => {
    ErrorTrackingService.addBreadcrumb(
      message,
      category,
      level,
      { user_type: userType, feature, ...data }
    );
  }, [userType, feature]);

  /**
   * Track custom messages
   */
  const trackMessage = useCallback((
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    context: Partial<ErrorContext> = {},
    extra?: Record<string, any>
  ) => {
    const fullContext: ErrorContext = {
      errorType: 'system',
      severity: 'low',
      privacyLevel: 'public',
      userType,
      feature,
      ...context
    };

    ErrorTrackingService.captureMessage(message, level, fullContext, extra);
  }, [userType, feature]);

  return {
    trackError,
    trackCrisisError,
    trackUserAction,
    trackNetworkError,
    trackPerformance,
    addBreadcrumb,
    trackMessage
  };
}

export default useErrorTracking;
