/**
 * React Hook for Privacy-Preserving Analytics
 * 
 * Provides easy access to crisis intervention effectiveness analytics
 * while maintaining strict privacy standards and HIPAA compliance.
 * 
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { privacyPreservingAnalyticsService } from '../services/privacyPreservingAnalyticsService';
import type { 
  AnalyticsInsights, 
  CulturalEffectivenessMetrics,
  InterventionOutcome 
} from '../services/privacyPreservingAnalyticsService';

export interface UsePrivacyAnalyticsReturn {
  // Analytics Data
  insights: AnalyticsInsights | null;
  culturalMetrics: CulturalEffectivenessMetrics[];
  
  // Privacy Metrics
  privacyBudget: {
    used: number;
    remaining: number;
    dataPoints: number;
    retentionCompliant: boolean;
  };
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  recordIntervention: (outcomeData: {
    sessionId: string;
    userToken: string;
    language: string;
    interventionType: InterventionOutcome['interventionType'];
    initialRiskLevel: number;
    finalRiskLevel: number;
    sessionDuration: number;
    feedback?: number;
  }) => Promise<void>;
  
  recordFollowUp: (userToken: string, sessionId: string) => Promise<void>;
  
  generateReport: () => Promise<{
    summary: string;
    culturalInsights: string[];
    recommendations: string[];
    limitations: string[];
  } | null>;
  
  exportData: () => Promise<unknown>;
  refreshInsights: () => Promise<void>;
  resetPrivacyBudget: () => void;
}

export const usePrivacyAnalytics = (): UsePrivacyAnalyticsReturn => {
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [culturalMetrics, setCulturalMetrics] = useState<CulturalEffectivenessMetrics[]>([]);
  const [privacyBudget, setPrivacyBudget] = useState({
    used: 0,
    remaining: 10,
    dataPoints: 0,
    retentionCompliant: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update privacy budget from service metrics
   */
  const updatePrivacyBudget = useCallback(() => {
    const privacyMetrics = privacyPreservingAnalyticsService.getPrivacyMetrics();
    setPrivacyBudget({
      used: privacyMetrics.budgetUsed,
      remaining: privacyMetrics.budgetRemaining,
      dataPoints: privacyMetrics.dataPoints,
      retentionCompliant: privacyMetrics.retentionCompliance
    });
  }, []);

  /**
   * Load analytics insights
   */
  const loadInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsInsights = await privacyPreservingAnalyticsService.generateAnalyticsInsights();
      setInsights(analyticsInsights);
      setCulturalMetrics(analyticsInsights.culturalComparisons);
      
      // Update privacy metrics
      updatePrivacyBudget();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics insights');
      console.error('[Privacy Analytics Hook] Failed to load insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Record intervention outcome
   */
  const recordIntervention = useCallback(async (outcomeData: {
    sessionId: string;
    userToken: string;
    language: string;
    interventionType: InterventionOutcome['interventionType'];
    initialRiskLevel: number;
    finalRiskLevel: number;
    sessionDuration: number;
    feedback?: number;
  }) => {
    try {
      await privacyPreservingAnalyticsService.recordInterventionOutcome(outcomeData);
      
      // Update privacy metrics
      updatePrivacyBudget();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record intervention');
      console.error('[Privacy Analytics Hook] Failed to record intervention:', err);
    }
  }, []);

  /**
   * Record follow-up engagement
   */
  const recordFollowUp = useCallback(async (userToken: string, sessionId: string) => {
    try {
      await privacyPreservingAnalyticsService.recordFollowUpEngagement(userToken, sessionId);
      
      // Update privacy metrics
      updatePrivacyBudget();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record follow-up');
      console.error('[Privacy Analytics Hook] Failed to record follow-up:', err);
    }
  }, []);

  /**
   * Generate effectiveness report
   */
  const generateReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const report = await privacyPreservingAnalyticsService.generateEffectivenessReport();
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('[Privacy Analytics Hook] Failed to generate report:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export anonymized data
   */
  const exportData = useCallback(async () => {
    try {
      setIsLoading(true);
      const exportedData = await privacyPreservingAnalyticsService.exportAnonymizedData();
      return exportedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      console.error('[Privacy Analytics Hook] Failed to export data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh insights
   */
  const refreshInsights = useCallback(async () => {
    await loadInsights();
  }, [loadInsights]);

  /**
   * Reset privacy budget
   */
  const resetPrivacyBudget = useCallback(() => {
    privacyPreservingAnalyticsService.resetPrivacyBudget();
    updatePrivacyBudget();
  }, [updatePrivacyBudget]);

  // Load initial insights
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    culturalMetrics,
    privacyBudget,
    isLoading,
    error,
    recordIntervention,
    recordFollowUp,
    generateReport,
    exportData,
    refreshInsights,
    resetPrivacyBudget
  };
};
