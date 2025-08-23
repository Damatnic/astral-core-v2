/**
 * Sentry Configuration for Astral Core
 * 
 * Environment variables and initialization setup
 */

import { initializeSentry, ErrorTrackingService } from '../services/errorTrackingService';
import { logger } from '../utils/logger';

// Environment variables configuration
export const sentryConfig = {
  // Get DSN from environment variables
  dsn: process.env.VITE_SENTRY_DSN,
  
  // Development settings
  enableInDevelopment: process.env.VITE_SENTRY_DEV_ENABLED === 'true',
  
  // Release version
  release: process.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment name
  environment: process.env.NODE_ENV || 'development'
};

/**
 * Initialize error tracking for the application
 */
export const initializeErrorTracking = () => {
  // Only initialize if DSN is provided
  if (!sentryConfig.dsn) {
    logger.warn('Sentry DSN not configured. Error tracking disabled.', undefined, 'errorTracking');
    return false;
  }

  // Initialize Sentry
  try {
    initializeSentry();
    
    // Add initial breadcrumb
    ErrorTrackingService.addBreadcrumb(
      'Application initialized',
      'lifecycle',
      'info',
      {
        environment: sentryConfig.environment,
        release: sentryConfig.release
      }
    );

    logger.info('Error tracking initialized successfully', undefined, 'errorTracking');
    return true;
  } catch (error) {
    logger.error('Failed to initialize error tracking:', error, 'errorTracking');
    return false;
  }
};

/**
 * Set user context for error tracking
 */
export const setUserErrorContext = (user: {
  id?: string;
  userType: 'seeker' | 'helper' | 'admin';
  isAuthenticated: boolean;
  sessionStart?: Date;
}) => {
  const sessionDuration = user.sessionStart 
    ? Math.floor((Date.now() - user.sessionStart.getTime()) / 1000)
    : undefined;

  ErrorTrackingService.setUserContext({
    id: user.id,
    userType: user.userType,
    isAuthenticated: user.isAuthenticated,
    sessionDuration
  });

  ErrorTrackingService.addBreadcrumb(
    'User context updated',
    'auth',
    'info',
    {
      user_type: user.userType,
      authenticated: user.isAuthenticated
    }
  );
};

/**
 * Clear user context on logout
 */
export const clearUserErrorContext = () => {
  ErrorTrackingService.clearUserContext();
  
  ErrorTrackingService.addBreadcrumb(
    'User logged out',
    'auth',
    'info'
  );
};

/**
 * Track navigation events
 */
export const trackNavigation = (from: string, to: string, userType?: string) => {
  ErrorTrackingService.addBreadcrumb(
    `Navigation: ${from} → ${to}`,
    'navigation',
    'info',
    {
      from_path: from,
      to_path: to,
      user_type: userType
    }
  );
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (
  feature: string, 
  action: string, 
  userType?: string,
  metadata?: Record<string, any>
) => {
  ErrorTrackingService.addBreadcrumb(
    `Feature: ${feature} - ${action}`,
    'feature',
    'info',
    {
      feature_name: feature,
      action,
      user_type: userType,
      ...metadata
    }
  );
};

/**
 * Track crisis events (with high priority)
 */
export const trackCrisisEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  userType: 'seeker' | 'helper',
  metadata?: Record<string, any>
) => {
  const getLogLevel = (severity: string) => {
    if (severity === 'critical') return 'error';
    if (severity === 'high') return 'warning';
    return 'info';
  };

  ErrorTrackingService.captureMessage(
    `Crisis event: ${event}`,
    getLogLevel(severity),
    {
      errorType: 'crisis',
      severity,
      userType,
      feature: 'crisis-detection',
      privacyLevel: 'sensitive'
    },
    {
      event_type: event,
      ...metadata
    }
  );
};

export default {
  config: sentryConfig,
  initialize: initializeErrorTracking,
  setUserContext: setUserErrorContext,
  clearUserContext: clearUserErrorContext,
  trackNavigation,
  trackFeatureUsage,
  trackCrisisEvent
};
