import { renderHook, act, waitFor } from '../test-utils';
import { useCrisisDetection } from './useCrisisDetection';
import { crisisDetectionService } from '../services/crisisDetectionService';

// Mock the crisis detection service
jest.mock('../services/crisisDetectionService', () => ({
  crisisDetectionService: {
    analyzeCrisisContent: jest.fn(),
    getEscalationActions: jest.fn(),
    generateCrisisResponse: jest.fn()
  }
}));


describe('useCrisisDetection Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockAnalysisResult = {
    hasCrisisIndicators: true,
    severityLevel: 'high' as const,
    detectedCategories: ['suicidal', 'self-harm'],
    confidence: 0.85,
    recommendedActions: ['immediate_support', 'crisis_resources'],
    escalationRequired: true,
    emergencyServices: false,
    riskFactors: ['isolation', 'hopelessness'],
    protectiveFactors: ['family_support'],
    analysisDetails: {
      triggeredKeywords: ['hurt myself', 'no point'],
      sentimentScore: -0.8,
      contextualFactors: ['recent_loss'],
      urgencyLevel: 8
    }
  };

  const mockEscalationActions = [
    { type: 'immediate_response', description: 'Provide immediate support' },
    { type: 'resource_sharing', description: 'Share crisis resources' }
  ];

  const mockCrisisResponse = {
    message: 'I understand you\'re going through a difficult time. You\'re not alone.',
    actions: ['Talk to someone now', 'Call crisis hotline'],
    resources: ['988 Suicide & Crisis Lifeline', 'Crisis Text Line']
  };

  it.skip('should initialize with default state', () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.lastAnalysis).toBeNull();
    expect(result.current.escalationActions).toEqual([]);
    expect(result.current.analysisHistory).toEqual([]);
    expect(result.current.crisisAlert.show).toBe(false);
    expect(result.current.hasCrisisIndicators).toBe(false);
    expect(result.current.requiresEscalation).toBe(false);
    expect(result.current.isEmergency).toBe(false);
    expect(result.current.currentSeverity).toBe('none');
    expect(result.current.analysisCount).toBe(0);
  });

  it.skip('should analyze text for crisis indicators', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);
    (crisisDetectionService.generateCrisisResponse as jest.Mock).mockReturnValue(mockCrisisResponse);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      const analysisResult = await result.current.analyzeText('I want to hurt myself');
      expect(analysisResult).toEqual(mockAnalysisResult);
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.lastAnalysis).toEqual(mockAnalysisResult);
    expect(result.current.escalationActions).toEqual(mockEscalationActions);
    expect(result.current.hasCrisisIndicators).toBe(true);
    expect(result.current.requiresEscalation).toBe(true);
    expect(result.current.currentSeverity).toBe('high');
    expect(result.current.analysisCount).toBe(1);
  });

  it.skip('should return safe result for short text', async () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      const analysisResult = await result.current.analyzeText('hi');
      
      expect(analysisResult.hasCrisisIndicators).toBe(false);
      expect(analysisResult.severityLevel).toBe('none');
      expect(analysisResult.confidence).toBe(0);
    });

    expect(crisisDetectionService.analyzeCrisisContent).not.toHaveBeenCalled();
  });

  it.skip('should handle analysis errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockImplementation(() => {
      throw new Error('Analysis failed');
    });

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      try {
        await result.current.analyzeText('test message with enough length');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Crisis analysis failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it.skip('should show crisis alert for high severity', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);
    (crisisDetectionService.generateCrisisResponse as jest.Mock).mockReturnValue(mockCrisisResponse);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('I want to end it all');
    });

    expect(result.current.crisisAlert.show).toBe(true);
    expect(result.current.crisisAlert.severity).toBe('high');
    expect(result.current.crisisAlert.message).toBe(mockCrisisResponse.message);
    expect(result.current.crisisAlert.actions).toEqual(mockCrisisResponse.actions);
    expect(result.current.crisisAlert.resources).toEqual(mockCrisisResponse.resources);
  });

  it.skip('should call onCrisisDetected callback', async () => {
    const mockOnCrisisDetected = jest.fn();
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);

    const { result } = renderHook(() => 
      useCrisisDetection({ onCrisisDetected: mockOnCrisisDetected })
    );
    
    await act(async () => {
      await result.current.analyzeText('I want to hurt myself');
    });

    expect(mockOnCrisisDetected).toHaveBeenCalledWith(mockAnalysisResult);
  });

  it.skip('should call onEscalationRequired callback', async () => {
    const mockOnEscalationRequired = jest.fn();
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);

    const { result } = renderHook(() => 
      useCrisisDetection({ onEscalationRequired: mockOnEscalationRequired })
    );
    
    await act(async () => {
      await result.current.analyzeText('I want to hurt myself');
    });

    expect(mockOnEscalationRequired).toHaveBeenCalledWith(mockEscalationActions);
  });

  it.skip('should debounce text analysis', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);

    const { result } = renderHook(() => 
      useCrisisDetection({ debounceMs: 500 })
    );
    
    // Call debounced analysis multiple times quickly
    act(() => {
      result.current.analyzeTextDebounced('first message that is long enough');
      result.current.analyzeTextDebounced('second message that is long enough');
      result.current.analyzeTextDebounced('third message that is long enough');
    });

    // Should not have analyzed yet
    expect(crisisDetectionService.analyzeCrisisContent).not.toHaveBeenCalled();

    // Advance timer to trigger debounced analysis
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Should have analyzed only once with the last message
    await waitFor(() => {
      expect(crisisDetectionService.analyzeCrisisContent).toHaveBeenCalledTimes(1);
      expect(crisisDetectionService.analyzeCrisisContent).toHaveBeenCalledWith(
        'third message that is long enough'
      );
    });
  });

  it.skip('should monitor text input when auto-analyze is enabled', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);

    const { result } = renderHook(() => 
      useCrisisDetection({ autoAnalyze: true, minAnalysisLength: 5, debounceMs: 100 })
    );
    
    act(() => {
      result.current.monitorTextInput('I need help right now');
    });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(crisisDetectionService.analyzeCrisisContent).toHaveBeenCalledWith(
        'I need help right now'
      );
    });
  });

  it.skip('should not monitor when auto-analyze is disabled', () => {
    const { result } = renderHook(() => 
      useCrisisDetection({ autoAnalyze: false })
    );
    
    act(() => {
      result.current.monitorTextInput('I need help right now');
    });

    expect(crisisDetectionService.analyzeCrisisContent).not.toHaveBeenCalled();
  });

  it.skip('should dismiss crisis alert', () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    // Manually set alert to show for testing
    act(() => {
      result.current.crisisAlert.show = true;
    });

    act(() => {
      result.current.dismissAlert();
    });

    expect(result.current.crisisAlert.show).toBe(false);
  });

  it.skip('should maintain analysis history with size limit', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue([]);

    const maxHistorySize = 3;
    const { result } = renderHook(() => 
      useCrisisDetection({ maxHistorySize })
    );
    
    // Perform multiple analyses
    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        await result.current.analyzeText(`message ${i} that is long enough for analysis`);
      });
    }

    // Should keep only the last 3 analyses
    expect(result.current.analysisHistory).toHaveLength(maxHistorySize);
    expect(result.current.analysisCount).toBe(5);
  });

  it.skip('should get crisis status from recent analyses', async () => {
    const safeResult = { 
      ...mockAnalysisResult, 
      hasCrisisIndicators: false, 
      severityLevel: 'none' as const 
    };
    
    (crisisDetectionService.analyzeCrisisContent as jest.Mock)
      .mockReturnValueOnce(safeResult)
      .mockReturnValueOnce(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('safe message that is long enough');
      await result.current.analyzeText('dangerous message that is long enough');
    });

    const crisisStatus = result.current.getCrisisStatus();
    
    expect(crisisStatus.hasCrisisIndicators).toBe(true);
    expect(crisisStatus.maxSeverity).toBe('high');
    expect(crisisStatus.analysisCount).toBe(2);
    expect(crisisStatus.escalationRequired).toBe(true);
  });

  it.skip('should clear analysis history', async () => {
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(mockAnalysisResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('test message that is long enough');
    });

    expect(result.current.analysisHistory).toHaveLength(1);
    expect(result.current.lastAnalysis).not.toBeNull();

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.analysisHistory).toHaveLength(0);
    expect(result.current.lastAnalysis).toBeNull();
    expect(result.current.escalationActions).toHaveLength(0);
    expect(result.current.analysisCount).toBe(0);
  });

  it.skip('should get crisis resources based on detected categories', async () => {
    const suicidalResult = {
      ...mockAnalysisResult,
      detectedCategories: ['suicidal'],
      emergencyServices: true
    };
    
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(suicidalResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('I want to kill myself');
    });

    const resources = result.current.getCrisisResources();
    
    expect(resources.emergencyServices).toBe(true);
    expect(resources.hotlines).toContainEqual(
      expect.objectContaining({ name: '988 Suicide & Crisis Lifeline' })
    );
    expect(resources.resources).toContain('Suicide Prevention Resource Center');
    expect(resources.resources).toContain('Safety Planning Guide');
  });

  it.skip('should get default resources when no crisis detected', () => {
    const { result } = renderHook(() => useCrisisDetection());
    
    const resources = result.current.getCrisisResources();
    
    expect(resources.emergencyServices).toBe(false);
    expect(resources.hotlines).toHaveLength(2);
    expect(resources.resources).toHaveLength(0);
  });

  it.skip('should handle self-harm category resources', async () => {
    const selfHarmResult = {
      ...mockAnalysisResult,
      detectedCategories: ['self-harm'],
      emergencyServices: false
    };
    
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(selfHarmResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('I cut myself to feel better');
    });

    const resources = result.current.getCrisisResources();
    
    expect(resources.resources).toContain('Self-Injury Outreach & Support');
    expect(resources.resources).toContain('To Write Love on Her Arms');
    expect(resources.resources).toContain('Alternative Coping Strategies');
  });

  it.skip('should handle substance abuse category resources', async () => {
    const substanceResult = {
      ...mockAnalysisResult,
      detectedCategories: ['substance-abuse'],
      emergencyServices: false
    };
    
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(substanceResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('I cannot stop drinking');
    });

    const resources = result.current.getCrisisResources();
    
    expect(resources.resources).toContain('SAMHSA National Helpline: 1-800-662-4357');
    expect(resources.resources).toContain('Narcotics Anonymous');
    expect(resources.resources).toContain('Alcoholics Anonymous');
  });

  it.skip('should clean up debounce timer on unmount', () => {
    const { unmount } = renderHook(() => useCrisisDetection());
    
    // This should not throw any errors
    unmount();
  });

  it.skip('should handle emergency mode in crisis alert', async () => {
    const emergencyResult = {
      ...mockAnalysisResult,
      emergencyServices: true
    };
    
    (crisisDetectionService.analyzeCrisisContent as jest.Mock).mockReturnValue(emergencyResult);
    (crisisDetectionService.getEscalationActions as jest.Mock).mockReturnValue(mockEscalationActions);
    (crisisDetectionService.generateCrisisResponse as jest.Mock).mockReturnValue(mockCrisisResponse);

    const { result } = renderHook(() => useCrisisDetection());
    
    await act(async () => {
      await result.current.analyzeText('I have a gun and I am going to use it');
    });

    expect(result.current.crisisAlert.emergencyMode).toBe(true);
    expect(result.current.isEmergency).toBe(true);
  });

  it.skip('should respect minimum analysis length configuration', async () => {
    const { result } = renderHook(() => 
      useCrisisDetection({ minAnalysisLength: 20 })
    );
    
    await act(async () => {
      const shortResult = await result.current.analyzeText('short');
      expect(shortResult.hasCrisisIndicators).toBe(false);
    });

    expect(crisisDetectionService.analyzeCrisisContent).not.toHaveBeenCalled();
  });
});