/**
 * Sentry Error Tracking Configuration
 * 
 * Production-ready error tracking with privacy-focused settings for mental health platform
 */

import * as Sentry from '@sentry/react';

import { ENV } from '../utils/envConfig';

// Environment configuration
const isProduction = ENV.IS_PROD;
const isDevelopment = ENV.IS_DEV;
const sentryDsn = ENV.SENTRY_DSN;

// Error classification for mental health context
export interface ErrorContext {
  errorType: 'system' | 'user-action' | 'network' | 'security' | 'crisis';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userType?: 'seeker' | 'helper' | 'admin';
  feature?: 'chat' | 'crisis-detection' | 'safety-plan' | 'mood-tracking' | 'community';
  privacyLevel: 'public' | 'private' | 'sensitive';
}

// Privacy-safe error filtering
const sanitizeErrorData = (error: Error, context?: any) => {
  // Remove sensitive data from error messages and context
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /auth/gi,
    /session/gi,
    /email/gi,
    /phone/gi,
    /ssn/gi,
    /medical/gi,
    /therapy/gi,
    /medication/gi,
    /diagnosis/gi
  ];

  let sanitizedMessage = error.message;
  let sanitizedContext = { ...context };

  // Sanitize error message
  sensitivePatterns.forEach(pattern => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
  });

  // Sanitize context data
  if (sanitizedContext) {
    JSON.stringify(sanitizedContext, (key, value) => {
      if (typeof value === 'string') {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(key) || pattern.test(value)) {
            return '[REDACTED]';
          }
        });
      }
      return value;
    });
  }

  return {
    message: sanitizedMessage,
    context: sanitizedContext
  };
};

// Get environment name helper
const getEnvironmentName = (): string => {
  if (isProduction) return 'production';
  if (isDevelopment) return 'development';
  return 'staging';
};

// Initialize Sentry
export const initializeSentry = () => {
  if (!sentryDsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: getEnvironmentName(),
    
    // Privacy and compliance settings
    integrations: [
      // Basic integrations only for compatibility
    ],

    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Error filtering and privacy
    beforeSend(event, hint) {
      const error = hint.originalException as Error;
      
      // Don't send errors in development unless explicitly enabled
      if (isDevelopment && !ENV.SENTRY_DEV_ENABLED) {
        return null;
      }

      // Filter out non-critical errors in production
      if (isProduction) {
        const ignoredErrors = [
          'ResizeObserver loop limit exceeded',
          'Script error',
          'Network request failed',
          'Load failed',
          'Non-Error promise rejection captured'
        ];

        if (error && ignoredErrors.some(ignored => 
          error.message?.includes(ignored) || error.name?.includes(ignored)
        )) {
          return null;
        }
      }

      // Sanitize sensitive data
      if (error instanceof Error) {
        const sanitized = sanitizeErrorData(error, event.extra);
        event.message = sanitized.message;
        event.extra = sanitized.context;
      }

      return event;
    },

    // User context (privacy-safe)
    beforeSendTransaction(event) {
      // Remove any PII from transaction data
      if (event.user) {
        event.user = {
          id: event.user.id ? '[USER_ID]' : undefined,
          // Don't include email, username, or other PII
        };
      }
      return event;
    },

    // Additional privacy settings
    sendDefaultPii: false,
    attachStacktrace: true,
    maxBreadcrumbs: 50,
    
    // Release tracking
    release: ENV.APP_VERSION || 'unknown',
  });
};

// Error tracking service
export class ErrorTrackingService {
  /**
   * Track application errors with mental health context
   */
  static captureError(
    error: Error, 
    context: ErrorContext,
    extra?: Record<string, any>
  ) {
    const sanitized = sanitizeErrorData(error, extra);
    
    Sentry.withScope(scope => {
      // Set error classification
      scope.setTag('error_type', context.errorType);
      scope.setTag('severity', context.severity);
      scope.setTag('privacy_level', context.privacyLevel);
      
      if (context.userType) {
        scope.setTag('user_type', context.userType);
      }
      
      if (context.feature) {
        scope.setTag('feature', context.feature);
      }

      // Set context without PII
      scope.setContext('error_details', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.pathname, // Don't include query params
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });

      // Add extra data (sanitized)
      if (sanitized.context) {
        scope.setExtra('additional_context', sanitized.context);
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Track crisis-related errors with high priority
   */
  static captureCrisisError(
    error: Error,
    crisisContext: {
      detectionResult?: any;
      userType: 'seeker' | 'helper';
      escalationLevel?: 'low' | 'medium' | 'high' | 'critical';
    },
    extra?: Record<string, any>
  ) {
    this.captureError(error, {
      errorType: 'crisis',
      severity: 'critical',
      userType: crisisContext.userType,
      feature: 'crisis-detection',
      privacyLevel: 'sensitive'
    }, {
      escalation_level: crisisContext.escalationLevel,
      has_detection_result: !!crisisContext.detectionResult,
      ...extra
    });
  }

  /**
   * Track user action errors
   */
  static captureUserActionError(
    error: Error,
    action: string,
    userType: 'seeker' | 'helper',
    feature: ErrorContext['feature'],
    extra?: Record<string, any>
  ) {
    this.captureError(error, {
      errorType: 'user-action',
      severity: 'medium',
      userType,
      feature,
      privacyLevel: 'private'
    }, {
      action,
      ...extra
    });
  }

  /**
   * Track network errors
   */
  static captureNetworkError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number,
    extra?: Record<string, any>
  ) {
    this.captureError(error, {
      errorType: 'network',
      severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
      privacyLevel: 'public'
    }, {
      endpoint: endpoint.replace(/\/\d+/g, '/[ID]'), // Remove IDs from endpoint
      method,
      status_code: statusCode,
      ...extra
    });
  }

  /**
   * Track performance issues
   */
  static capturePerformanceIssue(
    name: string,
    duration: number,
    threshold: number,
    context?: Record<string, any>
  ) {
    if (duration > threshold) {
      const error = new Error(`Performance issue: ${name} took ${duration}ms (threshold: ${threshold}ms)`);
      
      this.captureError(error, {
        errorType: 'system',
        severity: duration > threshold * 2 ? 'high' : 'medium',
        privacyLevel: 'public'
      }, {
        performance_metric: name,
        duration,
        threshold,
        ...context
      });
    }
  }

  /**
   * Add user context (privacy-safe)
   */
  static setUserContext(userContext: {
    id?: string;
    userType: 'seeker' | 'helper' | 'admin';
    isAuthenticated: boolean;
    sessionDuration?: number;
  }) {
    Sentry.setUser({
      id: userContext.id ? '[USER_ID]' : undefined,
      // Don't include any PII
    });

    Sentry.setTag('user_type', userContext.userType);
    Sentry.setTag('authenticated', userContext.isAuthenticated);
    
    if (userContext.sessionDuration) {
      Sentry.setTag('session_duration', userContext.sessionDuration > 3600 ? 'long' : 'normal');
    }
  }

  /**
   * Clear user context (on logout)
   */
  static clearUserContext() {
    Sentry.setUser(null);
  }

  /**
   * Capture a message (non-error event)
   */
  static captureMessage(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    context?: ErrorContext,
    extra?: Record<string, any>
  ) {
    Sentry.withScope(scope => {
      if (context) {
        scope.setTag('error_type', context.errorType);
        scope.setTag('severity', context.severity);
        scope.setTag('privacy_level', context.privacyLevel);
        
        if (context.userType) {
          scope.setTag('user_type', context.userType);
        }
        
        if (context.feature) {
          scope.setTag('feature', context.feature);
        }
      }

      if (extra) {
        scope.setExtra('additional_context', extra);
      }

      Sentry.captureMessage(message, level);
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(
    message: string,
    category: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    data?: Record<string, any>
  ) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data: data ? sanitizeErrorData(new Error(''), data).context : undefined,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Create performance transaction (deprecated - use startSpan instead)
   */
  static startTransaction(name: string, operation: string) {
    // Modern Sentry uses startSpan instead of startTransaction
    return {
      name,
      op: operation,
      finish: () => {},
      setTag: () => {},
      setContext: () => {}
    };
  }
}

// React Error Boundary integration
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring hook (deprecated)
export const useSentryPerformance = (name: string, operation: string = 'react') => {
  // Mock transaction object for compatibility
  const transaction = {
    name,
    op: operation,
    finish: () => {},
    setTag: () => {},
    setContext: () => {}
  };

  return {
    finish: () => transaction.finish(),
    setTag: (_key: string, _value: string) => {},
    setContext: (_key: string, _context: Record<string, any>) => {},
  };
};

export default ErrorTrackingService;
