/**
 * Cultural Crisis Detection Hook
 * 
 * React hook for integrating cultural crisis detection with enhanced AI analysis,
 * cultural bias mitigation, and culturally-appropriate intervention recommendations.
 * 
 * @license Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  culturalCrisisDetectionService, 
  CulturalCrisisAnalysisResult,
  FamilyInvolvementLevel
} from '../services/culturalCrisisDetectionService';

interface CulturalCrisisDetectionState {
  isAnalyzing: boolean;
  lastAnalysis: CulturalCrisisAnalysisResult | null;
  culturallyAdjustedRisk: number;
  biasAdjustments: string[];
  culturalInterventions: {
    familyInvolvement: FamilyInvolvementLevel;
    communityApproach: boolean;
    religiousConsideration: boolean;
    culturalResources: string[];
    languageSpecificResources: string[];
  } | null;
  analysisHistory: CulturalCrisisAnalysisResult[];
  culturalMetrics: {
    totalAnalyses: number;
    biasReductionRate: number;
    culturalAccuracy: number;
  };
}

interface CulturalCrisisDetectionOptions {
  autoAnalyze?: boolean;
  minAnalysisLength?: number;
  maxHistorySize?: number;
  debounceMs?: number;
  languageCode?: string;
  culturalContext?: string;
  userId?: string;
  onCrisisDetected?: (result: CulturalCrisisAnalysisResult) => void;
  onCulturalBiasDetected?: (adjustments: string[]) => void;
  onCulturalInterventionRecommended?: (interventions: any) => void;
}

interface CulturalCrisisAlert {
  show: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  culturallyAdapted: boolean;
  culturalFactors: string[];
  interventions: {
    immediate: string[];
    cultural: string[];
    familyBased: string[];
    communityBased: string[];
  };
  emergencyMode: boolean;
}

export function useCulturalCrisisDetection(options: CulturalCrisisDetectionOptions = {}) {
  const {
    autoAnalyze = true,
    minAnalysisLength = 10,
    maxHistorySize = 50,
    debounceMs = 1000,
    languageCode = 'en',
    culturalContext,
    userId,
    onCrisisDetected,
    onCulturalBiasDetected,
    onCulturalInterventionRecommended
  } = options;

  const [state, setState] = useState<CulturalCrisisDetectionState>({
    isAnalyzing: false,
    lastAnalysis: null,
    culturallyAdjustedRisk: 0,
    biasAdjustments: [],
    culturalInterventions: null,
    analysisHistory: [],
    culturalMetrics: {
      totalAnalyses: 0,
      biasReductionRate: 0.20,
      culturalAccuracy: 0.85
    }
  });

  const [culturalAlert, setCulturalAlert] = useState<CulturalCrisisAlert>({
    show: false,
    severity: 'none',
    message: '',
    culturallyAdapted: false,
    culturalFactors: [],
    interventions: {
      immediate: [],
      cultural: [],
      familyBased: [],
      communityBased: []
    },
    emergencyMode: false
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisRef = useRef<string>('');

  /**
   * Analyze text with cultural context awareness
   */
  const analyzeCulturalCrisis = useCallback(async (
    text: string, 
    options: { 
      immediate?: boolean; 
      trackHistory?: boolean;
      culturalOverride?: string;
    } = {}
  ): Promise<CulturalCrisisAnalysisResult | null> => {
    if (!text || text.length < minAnalysisLength) {
      return null;
    }

    // Avoid analyzing same text repeatedly
    if (!options.immediate && lastAnalysisRef.current === text) {
      return state.lastAnalysis;
    }

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const analysis = await culturalCrisisDetectionService.analyzeCrisisWithCulturalContext(
        text,
        userId,
        languageCode,
        options.culturalOverride || culturalContext
      );

      // Update state with new analysis
      setState(prev => {
        const newHistory = options.trackHistory 
          ? [...prev.analysisHistory, analysis].slice(-maxHistorySize)
          : prev.analysisHistory;

        return {
          ...prev,
          lastAnalysis: analysis,
          culturallyAdjustedRisk: analysis.culturallyAdjustedRisk?.adjustedRisk || 0,
          biasAdjustments: analysis.culturalBiasAdjustments?.map(adj => adj.factor) || [],
          culturalInterventions: analysis.culturalInterventions || null,
          analysisHistory: newHistory,
          culturalMetrics: {
            ...prev.culturalMetrics,
            totalAnalyses: prev.culturalMetrics.totalAnalyses + 1
          }
        };
      });

      // Update cultural alert
      updateCulturalAlert(analysis);

      // Call callbacks
      if (analysis.hasCrisisIndicators && onCrisisDetected) {
        onCrisisDetected(analysis);
      }

      if (analysis.culturalBiasAdjustments?.length > 0 && onCulturalBiasDetected) {
        onCulturalBiasDetected(analysis.culturalBiasAdjustments.map(adj => adj.factor));
      }

      if (analysis.culturalInterventions && onCulturalInterventionRecommended) {
        onCulturalInterventionRecommended(analysis.culturalInterventions);
      }

      lastAnalysisRef.current = text;
      return analysis;

    } catch (error) {
      console.error('[Cultural Crisis Detection Hook] Analysis failed:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [
    minAnalysisLength, 
    userId, 
    languageCode, 
    culturalContext, 
    maxHistorySize,
    onCrisisDetected,
    onCulturalBiasDetected,
    onCulturalInterventionRecommended
  ]);

  /**
   * Debounced analysis for real-time text input
   */
  const analyzeWithDebounce = useCallback((text: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (autoAnalyze) {
        analyzeCulturalCrisis(text, { trackHistory: true });
      }
    }, debounceMs);
  }, [analyzeCulturalCrisis, autoAnalyze, debounceMs]);

  /**
   * Update cultural alert based on analysis result
   */
  const updateCulturalAlert = useCallback((analysis: CulturalCrisisAnalysisResult) => {
    const riskLevel = analysis.culturallyAdjustedRisk?.adjustedRisk || 0;
    let severity: CulturalCrisisAlert['severity'] = 'none';
    let message = '';
    let emergencyMode = false;

    if (riskLevel >= 80) {
      severity = 'critical';
      message = 'Critical crisis indicators detected with cultural adaptations applied';
      emergencyMode = true;
    } else if (riskLevel >= 60) {
      severity = 'high';
      message = 'High-risk crisis patterns identified across cultural contexts';
    } else if (riskLevel >= 40) {
      severity = 'medium';
      message = 'Moderate crisis indicators with cultural considerations';
    } else if (riskLevel >= 20) {
      severity = 'low';
      message = 'Low-level concern detected with cultural sensitivity';
    }

    // Extract cultural factors
    const culturalFactors = [
      ...analysis.culturalBiasAdjustments.map(adj => adj.factor),
      ...analysis.culturalIndicators.map(ind => `${ind.culturalRegions.join(', ')} expression pattern`)
    ];

    // Generate intervention recommendations
    const interventions = {
      immediate: analysis.realTimeRisk?.recommendedInterventions
        ?.filter((i: any) => i.priority <= 2)
        ?.map((i: any) => i.description) || [],
      cultural: analysis.culturalInterventions.culturalResources,
      familyBased: analysis.culturalInterventions.familyInvolvement !== 'none' 
        ? ['Consider family involvement based on cultural preferences']
        : [],
      communityBased: analysis.culturalInterventions.communityApproach
        ? ['Engage community-based support systems']
        : []
    };

    setCulturalAlert({
      show: severity !== 'none',
      severity,
      message,
      culturallyAdapted: analysis.culturalBiasAdjustments.length > 0,
      culturalFactors,
      interventions,
      emergencyMode
    });
  }, []);

  /**
   * Get cultural-specific interventions
   */
  const getCulturalInterventions = useCallback((_culturalRegion?: string): string[] => {
    if (!state.lastAnalysis) return [];
    
    const interventions = state.lastAnalysis.culturalInterventions;
    if (!interventions) return [];
    
    let culturalSupport: string[] = [];

    if (interventions.familyInvolvement === 'high') {
      culturalSupport.push('Family-centered crisis intervention approach recommended');
    }

    if (interventions.communityApproach) {
      culturalSupport.push('Community-based support systems available');
    }

    if (interventions.religiousConsideration) {
      culturalSupport.push('Faith-based counseling and spiritual support options');
    }

    if (interventions.culturalResources) {
      culturalSupport.push(...interventions.culturalResources);
    }
    
    if (interventions.languageSpecificResources) {
      culturalSupport.push(...interventions.languageSpecificResources);
    }

    return culturalSupport;
  }, [state.lastAnalysis]);

  /**
   * Update cultural patterns based on feedback
   */
  const provideCulturalFeedback = useCallback(async (
    text: string,
    actualRisk: number,
    culturallyAppropriate: boolean
  ) => {
    if (!state.lastAnalysis) return;

    await culturalCrisisDetectionService.updateCulturalPatterns({
      text,
      culturalRegion: state.lastAnalysis.culturalContext,
      actualRisk,
      predictedRisk: state.lastAnalysis.culturallyAdjustedRisk?.adjustedRisk || 0,
      culturallyAppropriate
    });

    console.log('[Cultural Crisis Detection] Feedback provided for cultural improvement');
  }, [state.lastAnalysis]);

  /**
   * Get cultural metrics
   */
  const getCulturalMetrics = useCallback(async () => {
    try {
      const metrics = await culturalCrisisDetectionService.getCulturalMetrics(culturalContext);
      setState(prev => ({
        ...prev,
        culturalMetrics: {
          totalAnalyses: metrics.totalAnalyses,
          biasReductionRate: metrics.biasReductionRate,
          culturalAccuracy: metrics.culturalAccuracy
        }
      }));
      return metrics;
    } catch (error) {
      console.error('[Cultural Crisis Detection] Failed to get metrics:', error);
      return null;
    }
  }, [culturalContext]);

  /**
   * Dismiss cultural alert
   */
  const dismissCulturalAlert = useCallback(() => {
    setCulturalAlert(prev => ({ ...prev, show: false }));
  }, []);

  /**
   * Clear analysis history
   */
  const clearAnalysisHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysisHistory: [],
      lastAnalysis: null,
      culturallyAdjustedRisk: 0,
      biasAdjustments: [],
      culturalInterventions: null
    }));
    lastAnalysisRef.current = '';
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Load cultural metrics on mount
  useEffect(() => {
    getCulturalMetrics();
  }, [getCulturalMetrics]);

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    lastAnalysis: state.lastAnalysis,
    culturallyAdjustedRisk: state.culturallyAdjustedRisk,
    biasAdjustments: state.biasAdjustments,
    culturalInterventions: state.culturalInterventions,
    analysisHistory: state.analysisHistory,
    culturalMetrics: state.culturalMetrics,
    culturalAlert,

    // Actions
    analyzeCulturalCrisis,
    analyzeWithDebounce,
    getCulturalInterventions,
    provideCulturalFeedback,
    getCulturalMetrics,
    dismissCulturalAlert,
    clearAnalysisHistory,

    // Computed values
    hasCulturalBias: state.biasAdjustments.length > 0,
    requiresFamilyInvolvement: state.culturalInterventions?.familyInvolvement === 'high',
    needsCommunitySupport: state.culturalInterventions?.communityApproach || false,
    includesReligiousSupport: state.culturalInterventions?.religiousConsideration || false,
    currentCulturalContext: state.lastAnalysis?.culturalContext || culturalContext || 'Western'
  };
}

export default useCulturalCrisisDetection;
