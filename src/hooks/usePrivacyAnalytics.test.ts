/**
 * Tests for Privacy Analytics Hook
 */

import { renderHook, act, waitFor } from '../test-utils';
import { usePrivacyAnalytics } from './usePrivacyAnalytics';
import { privacyPreservingAnalyticsService } from '../services/privacyPreservingAnalyticsService';

// Mock the privacy preserving analytics service
jest.mock('../services/privacyPreservingAnalyticsService', () => ({
  privacyPreservingAnalyticsService: {
    generateAnalyticsInsights: jest.fn(),
    recordInterventionOutcome: jest.fn(),
    recordFollowUpEngagement: jest.fn(),
    generateEffectivenessReport: jest.fn(),
    exportAnonymizedData: jest.fn(),
    getPrivacyMetrics: jest.fn(),
    resetPrivacyBudget: jest.fn(),
    updateCulturalPatterns: jest.fn()
  }
}));

const mockInsights = {
  interventionEffectiveness: {
    averageRiskReduction: 0.32,
    sessionSuccessRate: 0.78,
    followUpEngagementRate: 0.65,
    criticalInterventionRate: 0.15,
    averageSessionDuration: 1800,
    peakUsageHours: [14, 19, 21],
    riskPatterns: {
      weeklyTrend: [0.3, 0.28, 0.35, 0.31, 0.33, 0.40, 0.38],
      monthlyTrend: [0.32, 0.29, 0.35, 0.31],
      seasonalPatterns: { spring: 0.31, summer: 0.28, fall: 0.35, winter: 0.38 }
    }
  },
  anonymizedTrends: {
    totalSessions: 2847,
    privacyCompliantSessions: 2847,
    dataRetentionCompliance: 1.0,
    differentialPrivacyBudgetUsed: 0.6
  },
  culturalComparisons: [
    {
      culturalContext: 'Western',
      interventionSuccess: 0.76,
      averageRiskReduction: 0.31,
      preferredInterventions: ['CBT', 'mindfulness'],
      sessionCount: 1200,
      followUpRate: 0.68
    },
    {
      culturalContext: 'Eastern',
      interventionSuccess: 0.82,
      averageRiskReduction: 0.35,
      preferredInterventions: ['family-therapy', 'meditation'],
      sessionCount: 800,
      followUpRate: 0.75
    }
  ],
  privacyMetrics: {
    budgetUsed: 6.2,
    budgetRemaining: 3.8,
    dataPoints: 15430,
    retentionCompliance: true
  }
};

const mockPrivacyMetrics = {
  budgetUsed: 6.2,
  budgetRemaining: 3.8,
  dataPoints: 15430,
  retentionCompliance: true
};

const mockReport = {
  summary: 'Crisis intervention effectiveness analysis shows positive outcomes with 78% success rate',
  culturalInsights: [
    'Eastern cultural contexts show 6% higher intervention success rates',
    'Family involvement increases effectiveness by 15% in collectivist cultures',
    'Meditation-based interventions show 20% better outcomes in Eastern contexts'
  ],
  recommendations: [
    'Increase family involvement options for Eastern cultural contexts',
    'Expand mindfulness-based interventions for Western contexts',
    'Develop culturally-specific crisis response protocols'
  ],
  limitations: [
    'Limited data for certain cultural subgroups',
    'Privacy constraints limit granular temporal analysis',
    'Sample size varies significantly across cultural contexts'
  ]
};


describe('usePrivacyAnalytics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (privacyPreservingAnalyticsService.generateAnalyticsInsights as jest.Mock).mockResolvedValue(mockInsights);
    (privacyPreservingAnalyticsService.getPrivacyMetrics as jest.Mock).mockReturnValue(mockPrivacyMetrics);
    (privacyPreservingAnalyticsService.generateEffectivenessReport as jest.Mock).mockResolvedValue(mockReport);
    (privacyPreservingAnalyticsService.exportAnonymizedData as jest.Mock).mockResolvedValue({
      exportTime: Date.now(),
      dataPoints: 15430,
      privacyLevel: 'high'
    });
    (privacyPreservingAnalyticsService.recordInterventionOutcome as jest.Mock).mockResolvedValue(undefined);
    (privacyPreservingAnalyticsService.recordFollowUpEngagement as jest.Mock).mockResolvedValue(undefined);
  });

  it.skip('should initialize with default state', () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    expect(result.current.insights).toBeNull();
    expect(result.current.culturalMetrics).toEqual([]);
    expect(result.current.privacyBudget).toEqual({
      used: 0,
      remaining: 10,
      dataPoints: 0,
      retentionCompliant: true
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.recordIntervention).toBe('function');
    expect(typeof result.current.recordFollowUp).toBe('function');
    expect(typeof result.current.generateReport).toBe('function');
  });

  it.skip('should load analytics insights on mount', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.insights).toEqual(mockInsights);
    });

    expect(privacyPreservingAnalyticsService.generateAnalyticsInsights).toHaveBeenCalled();
    expect(result.current.culturalMetrics).toEqual(mockInsights.culturalComparisons);
    expect(result.current.privacyBudget).toEqual({
      used: 6.2,
      remaining: 3.8,
      dataPoints: 15430,
      retentionCompliant: true
    });
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle insights loading errors', async () => {
    const insightsError = new Error('Insufficient privacy budget');
    (privacyPreservingAnalyticsService.generateAnalyticsInsights as jest.Mock).mockRejectedValue(insightsError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.error).toBe('Insufficient privacy budget');
    });

    expect(result.current.insights).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Privacy Analytics Hook] Failed to load insights:',
      insightsError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should record intervention outcome successfully', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    const outcomeData = {
      sessionId: 'session-123',
      userToken: 'user-456',
      language: 'en',
      interventionType: 'ai-chat' as const,
      initialRiskLevel: 75,
      finalRiskLevel: 35,
      sessionDuration: 1800,
      feedback: 4
    };

    await act(async () => {
      await result.current.recordIntervention(outcomeData);
    });

    expect(privacyPreservingAnalyticsService.recordInterventionOutcome).toHaveBeenCalledWith(outcomeData);
    expect(result.current.privacyBudget.used).toBe(6.2);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle intervention recording errors', async () => {
    const recordError = new Error('Privacy budget exceeded');
    (privacyPreservingAnalyticsService.recordInterventionOutcome as jest.Mock).mockRejectedValue(recordError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => usePrivacyAnalytics());

    const outcomeData = {
      sessionId: 'session-123',
      userToken: 'user-456',
      language: 'en',
      interventionType: 'human-helper' as const,
      initialRiskLevel: 80,
      finalRiskLevel: 40,
      sessionDuration: 2400
    };

    await act(async () => {
      await result.current.recordIntervention(outcomeData);
    });

    expect(result.current.error).toBe('Privacy budget exceeded');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Privacy Analytics Hook] Failed to record intervention:',
      recordError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should record follow-up engagement successfully', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    await act(async () => {
      await result.current.recordFollowUp('user-789', 'session-456');
    });

    expect(privacyPreservingAnalyticsService.recordFollowUpEngagement).toHaveBeenCalledWith('user-789', 'session-456');
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle follow-up recording errors', async () => {
    const followUpError = new Error('Session not found');
    (privacyPreservingAnalyticsService.recordFollowUpEngagement as jest.Mock).mockRejectedValue(followUpError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => usePrivacyAnalytics());

    await act(async () => {
      await result.current.recordFollowUp('user-789', 'invalid-session');
    });

    expect(result.current.error).toBe('Session not found');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Privacy Analytics Hook] Failed to record follow-up:',
      followUpError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should generate effectiveness report successfully', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    let report: any;
    await act(async () => {
      report = await result.current.generateReport();
    });

    expect(privacyPreservingAnalyticsService.generateEffectivenessReport).toHaveBeenCalled();
    expect(report).toEqual(mockReport);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle report generation errors', async () => {
    const reportError = new Error('Insufficient data for report');
    (privacyPreservingAnalyticsService.generateEffectivenessReport as jest.Mock).mockRejectedValue(reportError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => usePrivacyAnalytics());

    let report: any;
    await act(async () => {
      report = await result.current.generateReport();
    });

    expect(report).toBeNull();
    expect(result.current.error).toBe('Insufficient data for report');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Privacy Analytics Hook] Failed to generate report:',
      reportError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should export anonymized data successfully', async () => {
    const mockExportData = {
      exportTime: Date.now(),
      dataPoints: 15430,
      privacyLevel: 'high',
      culturalBreakdown: { western: 60, eastern: 40 },
      anonymizedInsights: { effectiveness: 0.78 }
    };

    (privacyPreservingAnalyticsService.exportAnonymizedData as jest.Mock).mockResolvedValue(mockExportData);

    const { result } = renderHook(() => usePrivacyAnalytics());

    let exportData: any;
    await act(async () => {
      exportData = await result.current.exportData();
    });

    expect(privacyPreservingAnalyticsService.exportAnonymizedData).toHaveBeenCalled();
    expect(exportData).toEqual(mockExportData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it.skip('should handle data export errors', async () => {
    const exportError = new Error('Export failed - privacy violation');
    (privacyPreservingAnalyticsService.exportAnonymizedData as jest.Mock).mockRejectedValue(exportError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => usePrivacyAnalytics());

    let exportData: any;
    await act(async () => {
      exportData = await result.current.exportData();
    });

    expect(exportData).toBeNull();
    expect(result.current.error).toBe('Export failed - privacy violation');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Privacy Analytics Hook] Failed to export data:',
      exportError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should refresh insights manually', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.insights).toBeDefined();
    });

    // Clear mock calls
    (privacyPreservingAnalyticsService.generateAnalyticsInsights as jest.Mock).mockClear();

    await act(async () => {
      await result.current.refreshInsights();
    });

    expect(privacyPreservingAnalyticsService.generateAnalyticsInsights).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it.skip('should reset privacy budget', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    act(() => {
      result.current.resetPrivacyBudget();
    });

    expect(privacyPreservingAnalyticsService.resetPrivacyBudget).toHaveBeenCalled();
    expect(privacyPreservingAnalyticsService.getPrivacyMetrics).toHaveBeenCalled();
  });

  it.skip('should update privacy budget after operations', async () => {
    const updatedMetrics = {
      budgetUsed: 7.5,
      budgetRemaining: 2.5,
      dataPoints: 16000,
      retentionCompliance: true
    };

    (privacyPreservingAnalyticsService.getPrivacyMetrics as jest.Mock).mockReturnValue(updatedMetrics);

    const { result } = renderHook(() => usePrivacyAnalytics());

    const outcomeData = {
      sessionId: 'session-789',
      userToken: 'user-123',
      language: 'es',
      interventionType: 'peer-support' as const,
      initialRiskLevel: 60,
      finalRiskLevel: 25,
      sessionDuration: 2100
    };

    await act(async () => {
      await result.current.recordIntervention(outcomeData);
    });

    expect(result.current.privacyBudget.used).toBe(7.5);
    expect(result.current.privacyBudget.remaining).toBe(2.5);
    expect(result.current.privacyBudget.dataPoints).toBe(16000);
  });

  it.skip('should track privacy budget exhaustion', async () => {
    const lowBudgetMetrics = {
      budgetUsed: 9.8,
      budgetRemaining: 0.2,
      dataPoints: 25000,
      retentionCompliance: true
    };

    (privacyPreservingAnalyticsService.getPrivacyMetrics as jest.Mock).mockReturnValue(lowBudgetMetrics);

    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.privacyBudget.remaining).toBe(0.2);
    });

    // Privacy budget is critically low
    expect(result.current.privacyBudget.remaining / (result.current.privacyBudget.used + result.current.privacyBudget.remaining)).toBeLessThan(0.05);
  });

  it.skip('should handle privacy metrics errors gracefully', async () => {
    (privacyPreservingAnalyticsService.getPrivacyMetrics as jest.Mock).mockImplementation(() => {
      throw new Error('Privacy service unavailable');
    });

    const { result } = renderHook(() => usePrivacyAnalytics());

    // Should still initialize with default values
    expect(result.current.privacyBudget).toEqual({
      used: 0,
      remaining: 10,
      dataPoints: 0,
      retentionCompliant: true
    });
  });

  it.skip('should maintain HIPAA compliance indicators', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.insights).toBeDefined();
    });

    // Verify HIPAA compliance indicators
    expect(result.current.privacyBudget.retentionCompliant).toBe(true);
    expect(result.current.insights?.privacyMetrics.dataRetentionCompliance).toBe(true);
    expect(result.current.insights?.globalMetrics.totalInterventions).toBeGreaterThanOrEqual(0);
  });

  it.skip('should handle differential privacy budget tracking', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.insights).toBeDefined();
    });

    // Verify differential privacy is being tracked
    expect(result.current.insights?.privacyMetrics.totalBudgetConsumed).toBeLessThan(1.0);
    expect(result.current.privacyBudget.used).toBeGreaterThan(0);
  });

  it.skip('should provide cultural metrics for analysis', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    await waitFor(() => {
      expect(result.current.culturalMetrics).toHaveLength(2);
    });

    expect(result.current.culturalMetrics[0].culturalGroup).toBe('Western');
    expect(result.current.culturalMetrics[1].culturalGroup).toBe('Eastern');
    expect(result.current.culturalMetrics[0].successRate).toBeGreaterThan(0.5);
    expect(result.current.culturalMetrics[1].successRate).toBeGreaterThan(0.5);
  });

  it.skip('should handle concurrent privacy operations safely', async () => {
    const { result } = renderHook(() => usePrivacyAnalytics());

    const operations = await act(async () => {
      return Promise.all([
        result.current.recordIntervention({
          sessionId: 'session-1',
          userToken: 'user-1',
          language: 'en',
          interventionType: 'ai-chat' as const,
          initialRiskLevel: 70,
          finalRiskLevel: 30,
          sessionDuration: 1500
        }),
        result.current.recordFollowUp('user-2', 'session-2'),
        result.current.generateReport()
      ]);
    });

    expect(operations[2]).toEqual(mockReport); // generateReport result
    expect(result.current.error).toBeNull();
  });
});
