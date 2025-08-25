/**
 * Error Tracking Hook
 *
 * React hook for easy integration of error tracking in components
 */

import { useCallback, useEffect } from 'react';
import ErrorTrackingService, { ErrorContext } from '../services/errorTracking';

interface UseErrorTrackingOptions {
  userType?: "seeker" | 'helper' | "admin";
  sessionId?: string;
  enablePerformanceTracking?: boolean;
  enableUserInteractionTracking?: boolean;
}

interface UseErrorTrackingReturn {
  trackError: (error: Error, context?: ErrorContext) => void;
  trackWarning: (message: string, context?: ErrorContext) => void;
  trackInfo: (message: string, context?: ErrorContext) => void;
  trackUserAction: (action: string, data?: any) => void;
  trackPerformance: (metric: string, value: number) => void;
  setUserContext: (context: Partial<ErrorContext>) => void;
}

export const useErrorTracking = (options: UseErrorTrackingOptions = {}): UseErrorTrackingReturn => {
  const {
    userType = 'seeker',
    sessionId,
    enablePerformanceTracking = false,
    enableUserInteractionTracking = false
  } = options;

  // Initialize error tracking context
  useEffect(() => {
    ErrorTrackingService.setContext({
      userType,
      sessionId,
      component: 'useErrorTracking-hook'
    });
  }, [userType, sessionId]);

  const trackError = useCallback((error: Error, context?: ErrorContext) => {
    ErrorTrackingService.trackError(error, {
      ...context,
      userType,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }, [userType, sessionId]);

  const trackWarning = useCallback((message: string, context?: ErrorContext) => {
    ErrorTrackingService.trackWarning(message, {
      ...context,
      userType,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }, [userType, sessionId]);

  const trackInfo = useCallback((message: string, context?: ErrorContext) => {
    ErrorTrackingService.trackInfo(message, {
      ...context,
      userType,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }, [userType, sessionId]);

  const trackUserAction = useCallback((action: string, data?: any) => {
    if (enableUserInteractionTracking) {
      ErrorTrackingService.trackUserAction(action, {
        ...data,
        userType,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }, [enableUserInteractionTracking, userType, sessionId]);

  const trackPerformance = useCallback((metric: string, value: number) => {
    if (enablePerformanceTracking) {
      ErrorTrackingService.trackPerformance(metric, value, {
        userType,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }, [enablePerformanceTracking, userType, sessionId]);

  const setUserContext = useCallback((context: Partial<ErrorContext>) => {
    ErrorTrackingService.setContext({
      userType,
      sessionId,
      ...context
    });
  }, [userType, sessionId]);

  return {
    trackError,
    trackWarning,
    trackInfo,
    trackUserAction,
    trackPerformance,
    setUserContext
  };
};

export default useErrorTracking;
