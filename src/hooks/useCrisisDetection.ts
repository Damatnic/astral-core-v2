/**
 * Crisis Detection Hook
 *
 * React hook for integrating crisis detection with real-time analysis,
 * escalation workflows, and UI state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { crisisDetectionService, CrisisAnalysisResult, CrisisEscalationAction } from '../services/crisisDetectionService';

export interface CrisisDetectionState {
  isAnalyzing: boolean;
  lastAnalysis: CrisisAnalysisResult | null;
  escalationActions: CrisisEscalationAction[];
  alertShown: boolean;
  analysisHistory: CrisisAnalysisResult[];
}

export interface CrisisDetectionOptions {
  autoAnalyze?: boolean;
  minAnalysisLength?: number;
  maxHistorySize?: number;
  debounceMs?: number;
  onCrisisDetected?: (result: CrisisAnalysisResult) => void;
  onEscalationRequired?: (actions: CrisisEscalationAction[]) => void;
  onAlertShown?: (alert: CrisisAlert) => void;
  enableRealTimeAnalysis?: boolean;
  confidenceThreshold?: number;
}

export interface CrisisAlert {
  show: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actions: string[];
  resources: string[];
  emergencyMode: boolean;
  timestamp: number;
}

const DEFAULT_OPTIONS: Required<Omit<CrisisDetectionOptions, 
  'onCrisisDetected' | 'onEscalationRequired' | 'onAlertShown'>> = {
  autoAnalyze: true,
  minAnalysisLength: 10,
  maxHistorySize: 50,
  debounceMs: 1000,
  enableRealTimeAnalysis: true,
  confidenceThreshold: 0.7
};

/**
 * Hook for crisis detection and management
 */
export function useCrisisDetection(options: CrisisDetectionOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<CrisisDetectionState>({
    isAnalyzing: false,
    lastAnalysis: null,
    escalationActions: [],
    alertShown: false,
    analysisHistory: []
  });

  const [alert, setAlert] = useState<CrisisAlert>({
    show: false,
    severity: 'none',
    message: '',
    actions: [],
    resources: [],
    emergencyMode: false,
    timestamp: Date.now()
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisCountRef = useRef(0);

  /**
   * Create crisis alert based on analysis result
   */
  const createCrisisAlert = useCallback((result: CrisisAnalysisResult): CrisisAlert => {
    let severity: CrisisAlert['severity'] = 'none';
    let message = '';
    let actions: string[] = [];
    let resources: string[] = [];
    let emergencyMode = false;

    if (result.riskLevel >= 8) {
      severity = 'critical';
      message = 'Critical mental health crisis detected. Immediate professional help is strongly recommended.';
      actions = [
        'Call 911 for immediate emergency assistance',
        'Contact 988 Suicide & Crisis Lifeline',
        'Go to nearest emergency room',
        'Contact trusted friend or family member'
      ];
      resources = [
        '911 - Emergency Services',
        '988 - Suicide & Crisis Lifeline',
        'Crisis Text Line: Text HOME to 741741',
        'National Suicide Prevention Lifeline: 1-800-273-8255'
      ];
      emergencyMode = true;
    } else if (result.riskLevel >= 6) {
      severity = 'high';
      message = 'High-risk mental health concerns detected. Professional support is recommended.';
      actions = [
        'Contact mental health professional',
        'Call 988 Suicide & Crisis Lifeline',
        'Reach out to support system',
        'Use crisis coping strategies'
      ];
      resources = [
        '988 - Suicide & Crisis Lifeline',
        'Crisis Text Line: Text HOME to 741741',
        'National Alliance on Mental Illness: 1-800-950-NAMI',
        'Your local mental health crisis center'
      ];
    } else if (result.riskLevel >= 4) {
      severity = 'medium';
      message = 'Elevated mental health concerns detected. Consider additional support and monitoring.';
      actions = [
        'Practice self-care strategies',
        'Reach out to trusted friend or family',
        'Consider speaking with counselor',
        'Use coping techniques'
      ];
      resources = [
        'Crisis Text Line: Text HOME to 741741',
        'National Alliance on Mental Illness: 1-800-950-NAMI',
        'Substance Abuse and Mental Health Services: 1-800-662-4357',
        'Your support network'
      ];
    } else if (result.riskLevel >= 2) {
      severity = 'low';
      message = 'Some mental health concerns noted. Continue monitoring and practice self-care.';
      actions = [
        'Practice mindfulness and self-care',
        'Stay connected with support system',
        'Monitor mood and thoughts',
        'Engage in healthy activities'
      ];
      resources = [
        'Self-care activities',
        'Mindfulness apps',
        'Support groups',
        'Mental health resources'
      ];
    }

    return {
      show: severity !== 'none',
      severity,
      message,
      actions,
      resources,
      emergencyMode,
      timestamp: Date.now()
    };
  }, []);

  /**
   * Handle crisis detection result
   */
  const handleCrisisResult = useCallback((result: CrisisAnalysisResult) => {
    // Update state with new analysis
    setState(prev => {
      const newHistory = [...prev.analysisHistory, result].slice(-opts.maxHistorySize);
      
      return {
        ...prev,
        lastAnalysis: result,
        analysisHistory: newHistory,
        alertShown: result.riskLevel >= 2
      };
    });

    // Create and show alert if needed
    if (result.riskLevel >= 2) {
      const crisisAlert = createCrisisAlert(result);
      setAlert(crisisAlert);
      
      if (options.onAlertShown) {
        options.onAlertShown(crisisAlert);
      }
    }

    // Handle escalation actions
    if (result.escalationRequired && result.escalationActions) {
      setState(prev => ({ ...prev, escalationActions: result.escalationActions || [] }));
      
      if (options.onEscalationRequired) {
        options.onEscalationRequired(result.escalationActions);
      }
    }

    // Notify crisis detection callback
    if (options.onCrisisDetected && result.riskLevel >= 3) {
      options.onCrisisDetected(result);
    }

    analysisCountRef.current += 1;
  }, [opts.maxHistorySize, createCrisisAlert, options]);

  /**
   * Perform crisis analysis on text
   */
  const analyzeForCrisis = useCallback(async (
    text: string,
    context?: any
  ): Promise<CrisisAnalysisResult | null> => {
    if (!text || text.length < opts.minAnalysisLength) {
      return null;
    }

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const result = await crisisDetectionService.analyzeForCrisis(text, context);
      
      if (result && result.confidence >= opts.confidenceThreshold) {
        handleCrisisResult(result);
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('Crisis analysis failed:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [opts.minAnalysisLength, opts.confidenceThreshold, handleCrisisResult]);

  /**
   * Debounced analysis for real-time processing
   */
  const debouncedAnalyze = useCallback((text: string, context?: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      analyzeForCrisis(text, context);
    }, opts.debounceMs);
  }, [analyzeForCrisis, opts.debounceMs]);

  /**
   * Main analyze function
   */
  const analyze = useCallback((
    text: string, 
    context?: any, 
    immediate = false
  ): Promise<CrisisAnalysisResult | null> => {
    if (immediate || !opts.autoAnalyze) {
      return analyzeForCrisis(text, context);
    } else if (opts.enableRealTimeAnalysis) {
      debouncedAnalyze(text, context);
      return Promise.resolve(null);
    }
    
    return Promise.resolve(null);
  }, [analyzeForCrisis, debouncedAnalyze, opts.autoAnalyze, opts.enableRealTimeAnalysis]);

  /**
   * Dismiss the current crisis alert
   */
  const dismissAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
    setState(prev => ({ ...prev, alertShown: false }));
  }, []);

  /**
   * Clear analysis history
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysisHistory: [],
      escalationActions: [],
      alertShown: false
    }));
    setAlert({
      show: false,
      severity: 'none',
      message: '',
      actions: [],
      resources: [],
      emergencyMode: false,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Get current risk level
   */
  const getCurrentRiskLevel = useCallback((): number => {
    return state.lastAnalysis?.riskLevel || 0;
  }, [state.lastAnalysis]);

  /**
   * Check if immediate intervention is needed
   */
  const needsImmediateIntervention = useCallback((): boolean => {
    return state.lastAnalysis?.immediateAction || false;
  }, [state.lastAnalysis]);

  /**
   * Get risk trend over recent analyses
   */
  const getRiskTrend = useCallback(): 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' => {
    const recentAnalyses = state.analysisHistory.slice(-5);
    
    if (recentAnalyses.length < 3) {
      return 'insufficient_data';
    }

    const riskLevels = recentAnalyses.map(a => a.riskLevel);
    const first = riskLevels[0];
    const last = riskLevels[riskLevels.length - 1];
    const difference = last - first;

    if (difference > 1) return 'increasing';
    if (difference < -1) return 'decreasing';
    return 'stable';
  }, [state.analysisHistory]);

  /**
   * Get analysis statistics
   */
  const getAnalysisStats = useCallback() => {
    const { analysisHistory } = state;
    
    if (analysisHistory.length === 0) {
      return {
        totalAnalyses: 0,
        averageRiskLevel: 0,
        highRiskCount: 0,
        averageConfidence: 0
      };
    }

    const totalAnalyses = analysisHistory.length;
    const averageRiskLevel = analysisHistory.reduce((sum, a) => sum + a.riskLevel, 0) / totalAnalyses;
    const highRiskCount = analysisHistory.filter(a => a.riskLevel >= 6).length;
    const averageConfidence = analysisHistory.reduce((sum, a) => sum + a.confidence, 0) / totalAnalyses;

    return {
      totalAnalyses,
      averageRiskLevel,
      highRiskCount,
      averageConfidence
    };
  }, [state.analysisHistory]);

  /**
   * Execute escalation action
   */
  const executeEscalationAction = useCallback(async (actionId: string): Promise<boolean> => {
    const action = state.escalationActions.find(a => a.id === actionId);
    if (!action) return false;

    try {
      const success = await crisisDetectionService.executeEscalationAction(action);
      
      if (success) {
        // Remove executed action from list
        setState(prev => ({
          ...prev,
          escalationActions: prev.escalationActions.filter(a => a.id !== actionId)
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Failed to execute escalation action:', error);
      return false;
    }
  }, [state.escalationActions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    alert,
    
    // Actions
    analyze,
    dismissAlert,
    clearHistory,
    executeEscalationAction,
    
    // Computed values
    currentRiskLevel: getCurrentRiskLevel(),
    needsImmediateIntervention: needsImmediateIntervention(),
    riskTrend: getRiskTrend(),
    analysisStats: getAnalysisStats(),
    analysisCount: analysisCountRef.current,
    
    // Flags
    isHighRisk: getCurrentRiskLevel() >= 6,
    isCriticalRisk: getCurrentRiskLevel() >= 8,
    hasEscalationActions: state.escalationActions.length > 0
  };
}
