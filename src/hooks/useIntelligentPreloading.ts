/**
 * React Hook for Intelligent Preloading
 * 
 * Provides seamless integration with the intelligent preloading engine
 * for user behavior tracking and predictive resource loading
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IntelligentPreloadingEngine } from '../services/intelligentPreloading';

interface UseIntelligentPreloadingOptions {
  enabled?: boolean;
  maxPredictions?: number;
  minConfidence?: number;
  trackUserBehavior?: boolean;
}

interface PreloadingState {
  isActive: boolean;
  currentPredictions: number;
  totalResourcesPreloaded: number;
  lastPredictionTime: number | null;
}

export const useIntelligentPreloading = (
  options: UseIntelligentPreloadingOptions = {}
) => {
  const {
    enabled = true,
    maxPredictions = 10,
    minConfidence = 0.3,
    trackUserBehavior = true
  } = options;

  const location = useLocation();
  
  const engineRef = useRef<IntelligentPreloadingEngine>();
  
  const [preloadingState, setPreloadingState] = useState<PreloadingState>({
    isActive: false,
    currentPredictions: 0,
    totalResourcesPreloaded: 0,
    lastPredictionTime: null
  });

  // Initialize preloading engine
  useEffect(() => {
    if (!enabled) return;

    if (!engineRef.current) {
      engineRef.current = new IntelligentPreloadingEngine();
      engineRef.current.startNewSession();
      
      setPreloadingState(prev => ({
        ...prev,
        isActive: true
      }));
    }
  }, [enabled]);

  // Track route changes
  useEffect(() => {
    if (!enabled || !engineRef.current || !trackUserBehavior) return;

    const trackRoute = async () => {
      await engineRef.current!.trackRouteNavigation(
        location.pathname,
        1000, // Default time spent on route
        [], // No interactions tracked yet
        undefined // No emotional context
      );

      // Trigger predictions for new route
      triggerPredictions();
    };

    trackRoute();
  }, [location.pathname, enabled, trackUserBehavior]);

  // Trigger intelligent preloading predictions
  const triggerPredictions = useCallback(async () => {
    if (!engineRef.current || !enabled) return;

    try {
      const predictions = await engineRef.current.generatePredictions();
      
      // Filter by confidence threshold
      const filteredPredictions = predictions
        .filter(p => p.confidence >= minConfidence)
        .slice(0, maxPredictions);

      // Update state
      setPreloadingState(prev => ({
        ...prev,
        currentPredictions: filteredPredictions.length,
        totalResourcesPreloaded: prev.totalResourcesPreloaded + filteredPredictions.length,
        lastPredictionTime: Date.now()
      }));

      // Log prediction results for debugging
      if (process.env.NODE_ENV === 'development') {
        console.group('🧠 Intelligent Preloading Results');
        console.log(`Generated ${predictions.length} predictions, executing ${filteredPredictions.length}`);
        filteredPredictions.forEach(p => {
          console.log(`📦 ${p.resource} (${(p.confidence * 100).toFixed(1)}% confidence, ${p.priority} priority)`);
        });
        console.groupEnd();
      }
    } catch (error) {
      console.error('Intelligent preloading failed:', error);
    }
  }, [enabled, minConfidence, maxPredictions]);

  // Force predictions (useful for manual triggers)
  const forcePredictions = useCallback(() => {
    triggerPredictions();
  }, [triggerPredictions]);

  // Track user interaction for behavior analysis
  const trackInteraction = useCallback((
    action: string,
    target?: string,
    metadata?: Record<string, any>
  ) => {
    if (!engineRef.current || !enabled || !trackUserBehavior) return;

    // For now, log the interaction for future enhancement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 User Interaction:', { action, target, metadata, route: location.pathname });
    }

    // Trigger new predictions after significant interactions
    if (['click', 'form_submit', 'modal_open'].includes(action)) {
      setTimeout(triggerPredictions, 100);
    }
  }, [enabled, trackUserBehavior, location.pathname, triggerPredictions]);

  return {
    // State
    preloadingState,
    isEnabled: enabled,
    isActive: preloadingState.isActive,
    
    // Actions
    trackInteraction,
    forcePredictions,
    
    // Engine access (for advanced usage)
    engine: engineRef.current
  };
};

// Higher-order component for automatic interaction tracking
export const withIntelligentPreloading = <P extends object>(
  Component: React.ComponentType<P>,
  trackingOptions?: {
    trackClicks?: boolean;
  }
) => {
  const { trackClicks = true } = trackingOptions || {};

  return (props: P) => {
    const { trackInteraction } = useIntelligentPreloading();

    const enhancedProps = {
      ...props,
      onClick: trackClicks ? (e: React.MouseEvent) => {
        trackInteraction('click', (e.target as HTMLElement)?.tagName);
        if ((props as any).onClick) {
          (props as any).onClick(e);
        }
      } : (props as any).onClick,
    };

    return React.createElement(Component, enhancedProps);
  };
};

export default useIntelligentPreloading;
