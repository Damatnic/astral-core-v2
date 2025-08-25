/**
 * Analytics Tracking Hook
 *
 * Provides easy-to-use analytics tracking for components
 * Automatically handles privacy settings and consent
 *
 * @license Apache-2.0
 */

import { useEffect, useCallback, useRef } from 'react';
import { privacyPreservingAnalyticsService } from '../services/privacyPreservingAnalyticsService';
import { logger } from '../utils/logger';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string | number>;
}

interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
  customDimensions?: Record<string, string | number>;
}

interface UserProperties {
  userId?: string;
  userType?: 'seeker' | 'helper' | 'admin';
  sessionId?: string;
  preferences?: Record<string, any>;
}

interface UseAnalyticsTrackingOptions {
  enableAutoTracking?: boolean;
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackPerformance?: boolean;
  respectDoNotTrack?: boolean;
  consentRequired?: boolean;
}

interface UseAnalyticsTrackingReturn {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (pageData: PageViewData) => void;
  trackUserAction: (action: string, data?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackTiming: (category: string, variable: string, time: number) => void;
  setUserProperties: (properties: UserProperties) => void;
  startSession: () => void;
  endSession: () => void;
  isTrackingEnabled: boolean;
  hasConsent: boolean;
}

export const useAnalyticsTracking = (
  options: UseAnalyticsTrackingOptions = {}
): UseAnalyticsTrackingReturn => {
  const {
    enableAutoTracking = true,
    trackPageViews = true,
    trackUserInteractions = true,
    trackPerformance = false,
    respectDoNotTrack = true,
    consentRequired = true
  } = options;

  const sessionStartTime = useRef<number>(Date.now());
  const lastPageView = useRef<string>('');
  const interactionCount = useRef<number>(0);

  // Check if tracking is enabled based on privacy settings
  const isTrackingEnabled = useCallback(() => {
    if (respectDoNotTrack && navigator.doNotTrack === '1') {
      return false;
    }

    if (consentRequired) {
      return privacyPreservingAnalyticsService.hasUserConsent();
    }

    return true;
  }, [respectDoNotTrack, consentRequired]);

  const hasConsent = isTrackingEnabled();

  // Track page views automatically
  useEffect(() => {
    if (!hasConsent || !trackPageViews || !enableAutoTracking) return;

    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== lastPageView.current) {
      trackPageView({
        path: currentPath,
        title: document.title,
        referrer: document.referrer
      });
      lastPageView.current = currentPath;
    }
  }, [hasConsent, trackPageViews, enableAutoTracking]);

  // Track user interactions automatically
  useEffect(() => {
    if (!hasConsent || !trackUserInteractions || !enableAutoTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target) {
        interactionCount.current++;
        trackUserAction('click', {
          element: target.tagName.toLowerCase(),
          className: target.className,
          id: target.id,
          text: target.textContent?.substring(0, 50) || ''
        });
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (target) {
          trackUserAction('keypress', {
            key: event.key,
            element: target.tagName.toLowerCase(),
            id: target.id
          });
        }
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('keypress', handleKeyPress, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [hasConsent, trackUserInteractions, enableAutoTracking]);

  // Track performance metrics
  useEffect(() => {
    if (!hasConsent || !trackPerformance || !enableAutoTracking) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackTiming('Navigation', 'loadComplete', navEntry.loadEventEnd - navEntry.fetchStart);
          trackTiming('Navigation', 'domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
        } else if (entry.entryType === 'paint') {
          trackTiming('Paint', entry.name, entry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, [hasConsent, trackPerformance, enableAutoTracking]);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!hasConsent) {
      logger.debug('Analytics tracking disabled - event not sent', { event });
      return;
    }

    try {
      privacyPreservingAnalyticsService.trackEvent({
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        customDimensions: event.customDimensions,
        timestamp: new Date().toISOString()
      });

      logger.debug('Analytics event tracked', { event });
    } catch (error) {
      logger.error('Failed to track analytics event', error, { event });
    }
  }, [hasConsent]);

  const trackPageView = useCallback((pageData: PageViewData) => {
    if (!hasConsent) {
      logger.debug('Analytics tracking disabled - page view not sent', { pageData });
      return;
    }

    try {
      privacyPreservingAnalyticsService.trackPageView({
        path: pageData.path,
        title: pageData.title || document.title,
        referrer: pageData.referrer || document.referrer,
        customDimensions: pageData.customDimensions,
        timestamp: new Date().toISOString()
      });

      logger.debug('Page view tracked', { pageData });
    } catch (error) {
      logger.error('Failed to track page view', error, { pageData });
    }
  }, [hasConsent]);

  const trackUserAction = useCallback((action: string, data: Record<string, any> = {}) => {
    if (!hasConsent) return;

    trackEvent({
      category: 'User Interaction',
      action,
      label: data.element || data.component,
      customDimensions: {
        ...data,
        sessionTime: Date.now() - sessionStartTime.current,
        interactionCount: interactionCount.current
      }
    });
  }, [hasConsent, trackEvent]);

  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    if (!hasConsent) return;

    trackEvent({
      category: 'Error',
      action: error.name || 'Unknown Error',
      label: error.message,
      customDimensions: {
        stack: error.stack?.substring(0, 500),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    });
  }, [hasConsent, trackEvent]);

  const trackTiming = useCallback((category: string, variable: string, time: number) => {
    if (!hasConsent) return;

    trackEvent({
      category: 'Performance',
      action: category,
      label: variable,
      value: Math.round(time),
      customDimensions: {
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });
  }, [hasConsent, trackEvent]);

  const setUserProperties = useCallback((properties: UserProperties) => {
    if (!hasConsent) return;

    try {
      privacyPreservingAnalyticsService.setUserProperties({
        userId: properties.userId,
        userType: properties.userType,
        sessionId: properties.sessionId,
        preferences: properties.preferences
      });

      logger.debug('User properties set', { properties });
    } catch (error) {
      logger.error('Failed to set user properties', error, { properties });
    }
  }, [hasConsent]);

  const startSession = useCallback(() => {
    if (!hasConsent) return;

    sessionStartTime.current = Date.now();
    interactionCount.current = 0;

    trackEvent({
      category: 'Session',
      action: 'start',
      customDimensions: {
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  }, [hasConsent, trackEvent]);

  const endSession = useCallback(() => {
    if (!hasConsent) return;

    const sessionDuration = Date.now() - sessionStartTime.current;

    trackEvent({
      category: 'Session',
      action: 'end',
      value: Math.round(sessionDuration / 1000), // Duration in seconds
      customDimensions: {
        interactionCount: interactionCount.current,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }, [hasConsent, trackEvent]);

  // Start session on mount
  useEffect(() => {
    if (hasConsent && enableAutoTracking) {
      startSession();
    }

    // End session on unmount
    return () => {
      if (hasConsent) {
        endSession();
      }
    };
  }, [hasConsent, enableAutoTracking, startSession, endSession]);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    trackTiming,
    setUserProperties,
    startSession,
    endSession,
    isTrackingEnabled: hasConsent,
    hasConsent
  };
};

export default useAnalyticsTracking;
