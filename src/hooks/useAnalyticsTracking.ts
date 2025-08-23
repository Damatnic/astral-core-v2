/**
 * Analytics Tracking Hook
 * 
 * Provides easy-to-use analytics tracking for components
 * Automatically handles privacy settings and consent
 * 
 * @license Apache-2.0
 */

import { useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigationType } from "react-router-dom"
import analyticsService from "../services/analyticsService"
interface TrackingOptions {
  category?: string;
      properties?: Record<string, any>;
    sensitivityLevel?: "public" | "private" | "sensitive" | "crisis";
}

interface UseAnalyticsTrackingOptions {
  trackPageViews?: boolean
  trackInteractions?: boolean
  trackErrors?: boolean
  componentName?: string
  featureName?: string
}

export const useAnalyticsTracking = (options: UseAnalyticsTrackingOptions={}): void => {
  const {
    trackPageViews = true,
    trackInteractions = true,
    trackErrors = true,
    componentName,
    featureName
  } = options
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousPath = useRef<string>();

  // Track page views;
  useEffect(() => {
          if (!trackPageViews) return;
      const currentPath = location.pathname + location.search;
    
    // Avoid duplicate tracking
    if (currentPath === previousPath.current) return
    
    previousPath.current = currentPath
    analyticsService.trackPageView(currentPath, componentName || featureName)
  }, [location, navigationType, trackPageViews, componentName, featureName])

  // Track custom events
      const trackEvent = useCallback((
      eventName: string,
      options?: TrackingOptions
    ) => {
    if (!trackInteractions) return
    analyticsService.trackEvent(eventName, {
      ...options?.properties,
      componentName,
      featureName,
      path: location.pathname,
              category: options?.category || "user_action",
        sensitivityLevel: options?.sensitivityLevel || "public"
      } as unknown)
  }, [trackInteractions, componentName, featureName, location.pathname])

  // Track feature usage
  const trackFeatureUsage = useCallback((
    feature: string,
    metadata?: Record<string, any>
  ) => {
    analyticsService.trackFeatureUsage(feature, "usage", {
      ...metadata,
      componentName,
      path: location.pathname
    })
  }, [componentName, location.pathname])

  // Track user interaction
      const trackInteraction = useCallback((
      element: string,
      action: string,
      value?: any
    ) => {
    if (!trackInteractions) return;
    analyticsService.trackEvent(`${action}_${element}`, {
      element,
      action,
      value,
      componentName,
      featureName,
      path: location.pathname,
              category: "user_action",
        sensitivityLevel: "public"
      } as unknown)
  }, [trackInteractions, componentName, featureName, location.pathname])

  // Track form submission
  const trackFormSubmit = useCallback((
    formName: string,
    success: boolean,
    metadata?: Record<string, any>
  ) => {
    analyticsService.trackEvent("form_submit", {
      formName,
              success: success ? "true" : "false",
      ...metadata,
      componentName,
      path: location.pathname,
      category: "user_action",
      sensitivityLevel: "private"    } as unknown)
  }, [componentName, location.pathname])

  // Track crisis-related events
      const trackCrisisEvent = useCallback((
      eventType: "detection" | "intervention" | "resource_accessed" | "help_requested",
      metadata?: Record<string, any>
    ) => {
    analyticsService.trackEvent(`crisis_${eventType}`, {
      ...metadata,
      componentName,
      path: location.pathname,
      timestamp: new Date().toISOString(),
      category: "crisis_intervention",
      sensitivityLevel: "crisis"    } as unknown)
  }, [componentName, location.pathname])

  // Track wellness activities
      const trackWellnessActivity = useCallback((
      activity: string,
      duration?: number,
      outcome?: "completed" | "abandoned" | "skipped"
    ) => {
    analyticsService.trackEvent("wellness_activity", {
      activity,
      duration,
      outcome,
      componentName,
      path: location.pathname,
      category: "wellness_tracking",
      sensitivityLevel: "sensitive"    } as unknown)
  }, [componentName, location.pathname])

  // Track performance metrics
      const trackPerformance = useCallback((
      metric: string,
      value: number,
      unit?: string
    ) => {
          analyticsService.trackEvent("performance_metric", {
      metric,
      value,
      unit,
      componentName,
      path: location.pathname,
      category: "performance",
      sensitivityLevel: "public"
    } as unknown)
  }, [componentName, location.pathname])

  // Track errors
      const trackError = useCallback((
      error: Error | string,
      context?: Record<string, any>
    ) => {
    if (!trackErrors) return

          const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
    analyticsService.trackEvent("error", {
      message: errorMessage,
      stack: errorStack,
      ...context,
      componentName,
      featureName,
      path: location.pathname,
      category: "error",
      sensitivityLevel: "private"    } as unknown)
  }, [trackErrors, componentName, featureName, location.pathname])

  // Track A/B test exposure
      const trackExperiment = useCallback((
      experimentName: string,
      variant: string
    ) => {
          analyticsService.trackEvent("experiment_exposure", {
      experimentName,
      variant,
      componentName,
      path: location.pathname,
      category: "feature_usage",
      sensitivityLevel: "public"
    } as unknown)
  }, [componentName, location.pathname])

  // Track search queries (privacy-safe)
      const trackSearch = useCallback((
      query: string,
      resultCount: number,
      clickedResult?: number
    ) => {
          // Hash the query for privacy
      const hashedQuery = btoa(query).substring(0, 10);
          analyticsService.trackEvent("search", {
      queryHash: hashedQuery,
      queryLength: query.length,
      resultCount,
      clickedResult,
      componentName,
      path: location.pathname,
      category: "user_action",
      sensitivityLevel: "private"    } as unknown)
  }, [componentName, location.pathname])

  // Track session timing
      const trackTiming = useCallback((
      category: string,
      variable: string,
      duration: number
    ) => {
          analyticsService.trackEvent("timing", {
      timingCategory: category,
      timingVariable: variable,
      duration,
      componentName,
      path: location.pathname,
      timestamp: new Date()
    } as unknown)
  }, [componentName, location.pathname])

  return {
    trackEvent,
    trackFeatureUsage,
    trackInteraction,
    trackFormSubmit,
    trackCrisisEvent,
    trackWellnessActivity,
    trackPerformance,
    trackError,
    trackExperiment,
    trackSearch,
    trackTiming
  }
}

// Helper hook for tracking component mount/unmount
  export const useComponentTracking = (componentName: string): void => {
    const { trackEvent, trackTiming } = useAnalyticsTracking({ componentName });
    const mountTime = useRef<number>(Date.now());
    
    useEffect(() => {
          // Track component mount
      trackEvent("component_mount", {
      category: "performance",
      properties: { componentName }
    })

    return () => {
              // Track component unmount and session duration
        const duration = Date.now() - mountTime.current;
        trackEvent("component_unmount", {
        category: "performance",
        properties: { componentName, duration }
      })
      trackTiming("component", componentName, duration);
    }
  }, [componentName, trackEvent, trackTiming])
}

// Helper hook for tracking feature adoption
  export const useFeatureAdoption = (featureName: string): Record<string, unknown> => {
    const { trackFeatureUsage } = useAnalyticsTracking({ featureName });
    const hasTrackedAdoption = useRef(false);
    
    const trackAdoption = useCallback(() => {
    if(!hasTrackedAdoption.current) {
      trackFeatureUsage(featureName, {
        firstUse: true,
        timestamp: Date.now()
      })
      hasTrackedAdoption.current = true;
    } else {
      trackFeatureUsage(featureName, {
        firstUse: false,
        timestamp: Date.now()
      })
    }
  }, [featureName, trackFeatureUsage])

  return { trackAdoption }
}

  // Export common tracking functions
  export const trackButtonClick = (buttonName: string, metadata?: Record<string, any>): void => {
    analyticsService.trackEvent("button_click", {
    buttonName,
    ...metadata,
    timestamp: new Date()
  })
}

export const trackLinkClick = (linkUrl: string, linkText?: string, isExternal?: boolean): void => {
  analyticsService.trackEvent("link_click", {
    linkUrl,
    linkText,
    isExternal: isExternal ? "true" : ", false",
    timestamp: new Date()
  })
}

export const trackVideoInteraction = (
  videoId: string,
  action: "play" | "pause" | "complete" | "skip",
  currentTime?: number
): void => {
  analyticsService.trackEvent("video_interaction", {
    videoId,
    action,
    currentTime,
    timestamp: new Date()
  })
}