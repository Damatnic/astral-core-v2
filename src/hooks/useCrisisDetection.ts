/**
 * Crisis Detection Hook
 * 
 * React hook for integrating enhanced crisis detection with real-time analysis,
 * escalation workflows, and UI state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { crisisDetectionService, CrisisAnalysisResult, CrisisEscalationAction } from '../services/crisisDetectionService';

interface CrisisDetectionState {
  isAnalyzing: boolean;
  lastAnalysis: CrisisAnalysisResult | null;
  escalationActions: CrisisEscalationAction[];
  alertShown: boolean;
  analysisHistory: CrisisAnalysisResult[];
}

interface CrisisDetectionOptions {
  autoAnalyze?: boolean;
  minAnalysisLength?: number;
  maxHistorySize?: number;
  debounceMs?: number;
  onCrisisDetected?: (result: CrisisAnalysisResult) => void;
  onEscalationRequired?: (actions: CrisisEscalationAction[]) => void;
}

interface CrisisAlert {
  show: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actions: string[];
  resources: string[];
  emergencyMode: boolean;
}

export function useCrisisDetection(options: CrisisDetectionOptions = {}) {
  const {
    autoAnalyze = true,
    minAnalysisLength = 10,
    maxHistorySize = 50,
    debounceMs = 500,
    onCrisisDetected,
    onEscalationRequired
  } = options;

  const [state, setState] = useState<CrisisDetectionState>({
    isAnalyzing: false,
    lastAnalysis: null,
    escalationActions: [],
    alertShown: false,
    analysisHistory: []
  });

  const [crisisAlert, setCrisisAlert] = useState<CrisisAlert>({
    show: false,
    severity: 'none',
    message: '',
    actions: [],
    resources: [],
    emergencyMode: false
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const analysisCountRef = useRef(0);

  /**
   * Analyze text for crisis indicators
   */
  const analyzeText = useCallback(async (text: string, userType: 'seeker' | 'helper' = 'seeker'): Promise<CrisisAnalysisResult> => {
    if (!text || text.trim().length < minAnalysisLength) {
      return {
        hasCrisisIndicators: false,
        severityLevel: 'none',
        detectedCategories: [],
        confidence: 0,
        recommendedActions: [],
        escalationRequired: false,
        emergencyServices: false,
        riskFactors: [],
        protectiveFactors: [],
        analysisDetails: {
          triggeredKeywords: [],
          sentimentScore: 0,
          contextualFactors: [],
          urgencyLevel: 0
        }
      };
    }

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Perform crisis analysis
      const result = crisisDetectionService.analyzeCrisisContent(text);
      
      // Get escalation actions if needed
      const escalationActions = result.hasCrisisIndicators 
        ? crisisDetectionService.getEscalationActions(result)
        : [];

      // Update state with results
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        lastAnalysis: result,
        escalationActions,
        analysisHistory: [
          ...prev.analysisHistory.slice(-(maxHistorySize - 1)),
          result
        ]
      }));

      // Handle crisis detection callbacks
      if (result.hasCrisisIndicators && onCrisisDetected) {
        onCrisisDetected(result);
      }

      if (result.escalationRequired && onEscalationRequired) {
        onEscalationRequired(escalationActions);
      }

      // Show crisis alert if needed
      if (result.hasCrisisIndicators && result.severityLevel !== 'none') {
        const response = crisisDetectionService.generateCrisisResponse(result, userType);
        
        if (response) {
          setCrisisAlert({
            show: true,
            severity: result.severityLevel,
            message: response.message || 'Crisis detected - please seek help',
            actions: response.actions || [],
            resources: response.resources || [],
            emergencyMode: result.emergencyServices
          });
        } else {
          setCrisisAlert({
            show: true,
            severity: result.severityLevel,
            message: 'Crisis detected - please seek help',
            actions: [],
            resources: [],
            emergencyMode: result.emergencyServices
          });
        }
      }

      analysisCountRef.current += 1;
      return result;

    } catch (error) {
      console.error('Crisis analysis failed:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      throw error;
    }
  }, [minAnalysisLength, maxHistorySize, onCrisisDetected, onEscalationRequired]);

  /**
   * Analyze text with debouncing for real-time input
   */
  const analyzeTextDebounced = useCallback((text: string, userType: 'seeker' | 'helper' = 'seeker') => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      analyzeText(text, userType).catch(console.error);
    }, debounceMs);
  }, [analyzeText, debounceMs]);

  /**
   * Monitor text input for crisis indicators (for real-time chat/input)
   */
  const monitorTextInput = useCallback((text: string, userType: 'seeker' | 'helper' = 'seeker') => {
    if (!autoAnalyze || !text) return;
    
    // Only analyze if text is long enough and contains potential crisis language
    if (text.length >= minAnalysisLength) {
      analyzeTextDebounced(text, userType);
    }
  }, [autoAnalyze, minAnalysisLength, analyzeTextDebounced]);

  /**
   * Dismiss crisis alert
   */
  const dismissAlert = useCallback(() => {
    setCrisisAlert(prev => ({ ...prev, show: false }));
    setState(prev => ({ ...prev, alertShown: true }));
  }, []);

  /**
   * Get crisis status for current session
   */
  const getCrisisStatus = useCallback(() => {
    const recentAnalyses = state.analysisHistory.slice(-5);
    const hasCrisisIndicators = recentAnalyses.some(analysis => analysis.hasCrisisIndicators);
    const maxSeverity = recentAnalyses.reduce((max, analysis) => {
      const severityLevels: Record<string, number> = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
      const currentLevel = severityLevels[analysis.severityLevel] || 0;
      const maxLevel = severityLevels[max] || 0;
      return currentLevel > maxLevel ? analysis.severityLevel : max;
    }, 'none');

    return {
      hasCrisisIndicators,
      maxSeverity,
      analysisCount: analysisCountRef.current,
      recentAnalyses: recentAnalyses.length,
      escalationRequired: state.escalationActions.length > 0
    };
  }, [state.analysisHistory, state.escalationActions]);

  /**
   * Clear analysis history
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysisHistory: [],
      lastAnalysis: null,
      escalationActions: []
    }));
    analysisCountRef.current = 0;
  }, []);

  /**
   * Get crisis resources based on current analysis
   */
  const getCrisisResources = useCallback(() => {
    const analysis = state.lastAnalysis;
    if (!analysis || !analysis.hasCrisisIndicators) {
      return {
        hotlines: [
          { name: '988 Suicide & Crisis Lifeline', contact: '988', available: '24/7' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' }
        ],
        resources: [],
        emergencyServices: false
      };
    }

    const hotlines = [
      { name: '988 Suicide & Crisis Lifeline', contact: '988', available: '24/7' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
      { name: 'National Suicide Prevention Lifeline', contact: '1-800-273-8255', available: '24/7' }
    ];

    const resources: string[] = [];
    
    if (analysis.detectedCategories.includes('suicidal')) {
      resources.push(
        'Suicide Prevention Resource Center',
        'American Foundation for Suicide Prevention',
        'Safety Planning Guide'
      );
    }

    if (analysis.detectedCategories.includes('self-harm')) {
      resources.push(
        'Self-Injury Outreach & Support',
        'To Write Love on Her Arms',
        'Alternative Coping Strategies'
      );
    }

    if (analysis.detectedCategories.includes('substance-abuse')) {
      resources.push(
        'SAMHSA National Helpline: 1-800-662-4357',
        'Narcotics Anonymous',
        'Alcoholics Anonymous'
      );
    }

    return {
      hotlines,
      resources,
      emergencyServices: analysis.emergencyServices
    };
  }, [state.lastAnalysis]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    lastAnalysis: state.lastAnalysis,
    escalationActions: state.escalationActions,
    analysisHistory: state.analysisHistory,
    crisisAlert,
    
    // Actions
    analyzeText,
    analyzeTextDebounced,
    monitorTextInput,
    dismissAlert,
    clearHistory,
    
    // Computed values
    getCrisisStatus,
    getCrisisResources,
    
    // Utilities
    hasCrisisIndicators: state.lastAnalysis?.hasCrisisIndicators || false,
    requiresEscalation: state.escalationActions.length > 0,
    isEmergency: state.lastAnalysis?.emergencyServices || false,
    currentSeverity: state.lastAnalysis?.severityLevel || 'none',
    analysisCount: analysisCountRef.current
  };
}

export default useCrisisDetection;
