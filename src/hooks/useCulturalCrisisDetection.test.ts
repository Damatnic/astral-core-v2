/**
 * Tests for Cultural Crisis Detection Hook
 */

import { renderHook, act, waitFor } from '../test-utils';
import { useCulturalCrisisDetection } from './useCulturalCrisisDetection';
import { culturalCrisisDetectionService } from '../services/culturalCrisisDetectionService';

// Mock the cultural crisis detection service
jest.mock('../services/culturalCrisisDetectionService', () => ({
  culturalCrisisDetectionService: {
    analyzeCrisisWithCulturalContext: jest.fn(),
    updateCulturalPatterns: jest.fn(),
    getCulturalMetrics: jest.fn()
  },
  FamilyInvolvementLevel: {
    NONE: 'none',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  }
}));

const mockAnalysisResult = {
  hasCrisisIndicators: false,
  culturallyAdjustedRisk: {
    originalRisk: 30,
    adjustedRisk: 25,
    culturalFactors: ['western-individualistic-adjustment']
  },
  culturalBiasAdjustments: [
    {
      factor: 'Western individualistic bias',
      originalValue: 30,
      adjustedValue: 25,
      confidence: 0.85
    }
  ],
  culturalInterventions: {
    familyInvolvement: 'medium' as const,
    communityApproach: false,
    religiousConsideration: false,
    culturalResources: ['Western counseling approaches'],
    languageSpecificResources: ['English mental health resources']
  },
  culturalIndicators: [
    {
      phrase: 'feeling isolated',
      culturalRelevance: 0.8,
      culturalRegions: ['Western', 'English-speaking']
    }
  ],
  culturalContext: 'Western',
  realTimeRisk: {
    immediateRisk: 25,
    recommendedInterventions: [
      {
        priority: 3,
        description: 'Connect with culturally appropriate counselor'
      }
    ]
  }
};


describe('useCulturalCrisisDetection Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (culturalCrisisDetectionService.getCulturalMetrics as jest.Mock).mockResolvedValue({
      totalAnalyses: 100,
      biasReductionRate: 0.25,
      culturalAccuracy: 0.88
    });
  });

  it.skip('should initialize with default state', async () => {
    const { result } = renderHook(() => useCulturalCrisisDetection());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.lastAnalysis).toBeNull();
    expect(result.current.culturallyAdjustedRisk).toBe(0);
    expect(result.current.biasAdjustments).toEqual([]);
    expect(result.current.culturalInterventions).toBeNull();
    expect(result.current.analysisHistory).toEqual([]);
    expect(result.current.culturalAlert.show).toBe(false);
    expect(result.current.hasCulturalBias).toBe(false);
    expect(result.current.requiresFamilyInvolvement).toBe(false);
  });

  it.skip('should initialize with custom options', async () => {
    const onCrisisDetected = jest.fn();
    const onCulturalBiasDetected = jest.fn();
    const onCulturalInterventionRecommended = jest.fn();

    const options = {
      autoAnalyze: false,
      minAnalysisLength: 20,
      maxHistorySize: 25,
      debounceMs: 2000,
      languageCode: 'es',
      culturalContext: 'Latino',
      userId: 'test-user-123',
      onCrisisDetected,
      onCulturalBiasDetected,
      onCulturalInterventionRecommended
    };

    const { result } = renderHook(() => useCulturalCrisisDetection(options));

    expect(result.current.currentCulturalContext).toBe('Latino');
    // Hook should initialize without errors
    expect(typeof result.current.analyzeCulturalCrisis).toBe('function');
  });

  it.skip('should load cultural metrics on mount', async () => {
    const { result } = renderHook(() => useCulturalCrisisDetection());

    await waitFor(() => {
      expect(culturalCrisisDetectionService.getCulturalMetrics).toHaveBeenCalledWith(undefined);
      expect(result.current.culturalMetrics.totalAnalyses).toBe(100);
      expect(result.current.culturalMetrics.biasReductionRate).toBe(0.25);
      expect(result.current.culturalMetrics.culturalAccuracy).toBe(0.88);
    });
  });

  it.skip('should analyze cultural crisis successfully', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    let analysisResult: any;
    await act(async () => {
      analysisResult = await result.current.analyzeCulturalCrisis('I feel lost and alone in this new culture');
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledWith(
      'I feel lost and alone in this new culture',
      undefined, // userId
      'en',      // languageCode
      undefined  // culturalContext
    );

    expect(analysisResult).toEqual(mockAnalysisResult);
    expect(result.current.lastAnalysis).toEqual(mockAnalysisResult);
    expect(result.current.culturallyAdjustedRisk).toBe(25);
    expect(result.current.biasAdjustments).toContain('Western individualistic bias');
    expect(result.current.hasCulturalBias).toBe(true);
  });

  it.skip('should handle analysis errors gracefully', async () => {
    const analysisError = new Error('Cultural analysis service unavailable');
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockRejectedValue(analysisError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useCulturalCrisisDetection());

    let analysisResult: any;
    await act(async () => {
      analysisResult = await result.current.analyzeCulturalCrisis('Test text');
    });

    expect(analysisResult).toBeNull();
    expect(result.current.isAnalyzing).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Cultural Crisis Detection Hook] Analysis failed:',
      analysisError
    );

    consoleSpy.mockRestore();
  });

  it.skip('should skip analysis for text that is too short', async () => {
    const { result } = renderHook(() => useCulturalCrisisDetection({ minAnalysisLength: 15 }));

    let analysisResult: any;
    await act(async () => {
      analysisResult = await result.current.analyzeCulturalCrisis('Short');
    });

    expect(analysisResult).toBeNull();
    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).not.toHaveBeenCalled();
  });

  it.skip('should avoid analyzing same text repeatedly', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    const testText = 'I feel lost and alone in this new culture';

    // First analysis
    await act(async () => {
      await result.current.analyzeCulturalCrisis(testText);
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledTimes(1);

    // Second analysis with same text (should return cached result)
    let secondResult: any;
    await act(async () => {
      secondResult = await result.current.analyzeCulturalCrisis(testText);
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledTimes(1);
    expect(secondResult).toEqual(mockAnalysisResult);
  });

  it.skip('should track analysis history when enabled', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    await act(async () => {
      await result.current.analyzeCulturalCrisis('First analysis text', { trackHistory: true });
    });

    expect(result.current.analysisHistory).toHaveLength(1);
    expect(result.current.analysisHistory[0]).toEqual(mockAnalysisResult);
  });

  it.skip('should limit analysis history size', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection({ maxHistorySize: 2 }));

    // Add 3 analyses to exceed limit
    await act(async () => {
      await result.current.analyzeCulturalCrisis('First text', { trackHistory: true });
    });
    await act(async () => {
      await result.current.analyzeCulturalCrisis('Second text', { trackHistory: true });
    });
    await act(async () => {
      await result.current.analyzeCulturalCrisis('Third text', { trackHistory: true });
    });

    expect(result.current.analysisHistory).toHaveLength(2);
  });

  it.skip('should call crisis detected callback', async () => {
    const crisisAnalysisResult = {
      ...mockAnalysisResult,
      hasCrisisIndicators: true
    };

    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(crisisAnalysisResult);

    const onCrisisDetected = jest.fn();
    const { result } = renderHook(() => useCulturalCrisisDetection({ onCrisisDetected }));

    await act(async () => {
      await result.current.analyzeCulturalCrisis('Crisis text');
    });

    expect(onCrisisDetected).toHaveBeenCalledWith(crisisAnalysisResult);
  });

  it.skip('should call cultural bias detected callback', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const onCulturalBiasDetected = jest.fn();
    const { result } = renderHook(() => useCulturalCrisisDetection({ onCulturalBiasDetected }));

    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text');
    });

    expect(onCulturalBiasDetected).toHaveBeenCalledWith(['Western individualistic bias']);
  });

  it.skip('should call cultural intervention recommended callback', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const onCulturalInterventionRecommended = jest.fn();
    const { result } = renderHook(() => useCulturalCrisisDetection({ onCulturalInterventionRecommended }));

    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text');
    });

    expect(onCulturalInterventionRecommended).toHaveBeenCalled();
    expect(onCulturalInterventionRecommended).toHaveBeenCalledWith(
      expect.objectContaining({
        familyInvolvement: 'medium',
        communityApproach: false,
        religiousConsideration: false,
        culturalResources: expect.arrayContaining(['Western counseling approaches']),
        languageSpecificResources: expect.arrayContaining(['English mental health resources'])
      })
    );
  });

  it.skip('should update cultural alert based on risk level', async () => {
    const highRiskResult = {
      ...mockAnalysisResult,
      culturallyAdjustedRisk: { ...mockAnalysisResult.culturallyAdjustedRisk, adjustedRisk: 85 }
    };

    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(highRiskResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    await act(async () => {
      await result.current.analyzeCulturalCrisis('High risk text');
    });

    expect(result.current.culturalAlert.show).toBe(true);
    expect(result.current.culturalAlert.severity).toBe('high');
    expect(result.current.culturalAlert.emergencyMode).toBe(true);
    expect(result.current.culturalAlert.culturallyAdapted).toBe(true);
  });

  it.skip('should provide debounced analysis', async () => {
    jest.useFakeTimers('modern');
    
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection({ 
      debounceMs: 500,
      autoAnalyze: true 
    }));

    // Call debounced analysis multiple times quickly
    act(() => {
      result.current.analyzeWithDebounce('Text 1');
      result.current.analyzeWithDebounce('Text 2');
      result.current.analyzeWithDebounce('Text 3');
    });

    // Should not have called service yet
    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledWith(
      'Text 3', // Should use the last text
      undefined,
      'en');

    jest.useRealTimers();
  });

  it.skip('should get cultural interventions', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    // First analyze to set lastAnalysis
    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text');
    });

    const interventions = result.current.getCulturalInterventions();

    expect(interventions).toContain('Family-centered crisis intervention approach recommended');
    expect(interventions).toContain('Western counseling approaches');
    expect(interventions).toContain('English mental health resources');
  });

  it.skip('should provide cultural feedback', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    // First analyze to set lastAnalysis
    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text');
    });

    await act(async () => {
      await result.current.provideCulturalFeedback('Test text', 30, true);
    });

    expect(culturalCrisisDetectionService.updateCulturalPatterns).toHaveBeenCalledWith({
      text: 'Test text',
      culturalRegion: 'Western',
      actualRisk: 30,
      predictedRisk: 25,
      culturallyAppropriate: true
    });
  });

  it.skip('should dismiss cultural alert', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue({
        ...mockAnalysisResult,
        culturallyAdjustedRisk: { ...mockAnalysisResult.culturallyAdjustedRisk, adjustedRisk: 85 }
      });

    const { result } = renderHook(() => useCulturalCrisisDetection());

    // First trigger an alert
    await act(async () => {
      await result.current.analyzeCulturalCrisis('High risk text');
    });

    expect(result.current.culturalAlert.show).toBe(true);

    // Then dismiss it
    act(() => {
      result.current.dismissCulturalAlert();
    });

    expect(result.current.culturalAlert.show).toBe(false);
  });

  it.skip('should clear analysis history', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    // First analyze to populate state
    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text', { trackHistory: true });
    });

    // Wait for state to be updated
    await waitFor(() => {
      expect(result.current.analysisHistory.length).toBeGreaterThan(0);
    });

    expect(result.current.analysisHistory).toHaveLength(1);
    expect(result.current.lastAnalysis).toBeDefined();

    // Then clear
    act(() => {
      result.current.clearAnalysisHistory();
    });

    expect(result.current.analysisHistory).toEqual([]);
    expect(result.current.lastAnalysis).toBeNull();
    expect(result.current.culturallyAdjustedRisk).toBe(0);
    expect(result.current.biasAdjustments).toEqual([]);
    expect(result.current.culturalInterventions).toBeNull();
  });

  it.skip('should compute derived state correctly', async () => {
    const analysisWithHighFamilyInvolvement = {
      ...mockAnalysisResult,
      culturalInterventions: {
        ...mockAnalysisResult.culturalInterventions,
        familyInvolvement: 'high' as const,
        communityApproach: true,
        religiousConsideration: true
      }
    };

    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(analysisWithHighFamilyInvolvement);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text');
    });

    expect(result.current.requiresFamilyInvolvement).toBe(true);
    expect(result.current.needsCommunitySupport).toBe(true);
    expect(result.current.includesReligiousSupport).toBe(true);
    expect(result.current.currentCulturalContext).toBe('Western');
  });

  it.skip('should handle cultural override in analysis', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    await act(async () => {
      await result.current.analyzeCulturalCrisis('Test text', { culturalOverride: 'Asian' });
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledWith(
      'Test text',
      undefined,
      'en',
      'Asian' // Should use override
    );
  });

  it.skip('should handle immediate analysis override', async () => {
    (culturalCrisisDetectionService.analyzeCrisisWithCulturalContext as jest.Mock)
      .mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useCulturalCrisisDetection());

    const testText = 'Test repeated analysis';

    // First analysis
    await act(async () => {
      await result.current.analyzeCulturalCrisis(testText);
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledTimes(1);

    // Second analysis with immediate override should not be skipped
    await act(async () => {
      await result.current.analyzeCulturalCrisis(testText, { immediate: true });
    });

    expect(culturalCrisisDetectionService.analyzeCrisisWithCulturalContext).toHaveBeenCalledTimes(2);
  });

  it.skip('should cleanup debounce timeout on unmount', async () => {
    jest.useFakeTimers('modern');

    const { unmount } = renderHook(() => useCulturalCrisisDetection({ debounceMs: 1000 }));

    unmount();

    // Should not throw errors when cleanup runs
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();

    jest.useRealTimers();
  });
});