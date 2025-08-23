/**
 * Tests for Crisis Stress Testing Hook
 */

// Mock the crisis stress testing system
jest.mock('../services/crisisStressTestingSystem');

import { renderHook, act, waitFor } from '../test-utils';
import { useCrisisStressTesting } from './useCrisisStressTesting';
import { crisisStressTestingSystem, CRISIS_TEST_SCENARIOS } from '../services/crisisStressTestingSystem';

describe('useCrisisStressTesting Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.skip('should initialize with default state', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    expect(result.current.state.isTestingActive).toBe(false);
    expect(result.current.state.currentTest).toBeNull();
    expect(result.current.state.testResults).toEqual([]);
    expect(result.current.state.failoverResults).toEqual([]);
    expect(result.current.state.emergencyStatus.active).toBe(false);
    // Check that scenarios are initialized (they should be scenario-1 and scenario-2)
    expect(result.current.state.selectedScenarios).toEqual(['scenario-1', 'scenario-2']);
    expect(result.current.stats).toBeNull();
    expect(result.current.isEmergency).toBe(false);
    expect(result.current.hasResults).toBe(false);
  });

  it.skip('should initialize with custom callbacks', async () => {
    const onEmergencyBreak = jest.fn();
    const onTestComplete = jest.fn();
    
    const { result } = renderHook(() => useCrisisStressTesting(onEmergencyBreak, onTestComplete));

    expect(result.current.state.isTestingActive).toBe(false);
    // The hook should still initialize properly with callbacks
    expect(typeof result.current.actions.runStressTests).toBe('function');
  });

  it.skip('should run crisis stress tests successfully', async () => {
    const mockResults = [
      {
        id: 'test-1',
        scenarioId: 'scenario-1',
        success: true,
        responseTime: 500,
        availability: 0.99,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'low' as const
        }
      }
    ];

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useCrisisStressTesting());

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    expect(crisisStressTestingSystem.runCrisisStressTests).toHaveBeenCalledWith(
      expect.objectContaining({
        scenarios: expect.any(Array),
        maxConcurrentUsers: 1000,
        testDuration: 300
      })
    );
    
    expect(result.current.state.testResults).toEqual(mockResults);
    expect(result.current.state.isTestingActive).toBe(false);
    expect(result.current.state.currentTest).toBeNull();
    expect(result.current.hasResults).toBe(true);
  });

  it.skip('should handle stress test failures', async () => {
    const testError = new Error('Network failure during testing');
    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockRejectedValue(testError);

    const onEmergencyBreak = jest.fn();
    const { result } = renderHook(() => useCrisisStressTesting(onEmergencyBreak));

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    expect(result.current.state.emergencyStatus.active).toBe(true);
    expect(result.current.state.emergencyStatus.reason).toContain('Testing system failure');
    expect(result.current.isEmergency).toBe(true);
    expect(onEmergencyBreak).toHaveBeenCalledWith(expect.stringContaining('Testing system failure'));
  });

  it.skip('should detect critical safety failures and trigger emergency', async () => {
    const criticalResults = [
      {
        id: 'critical-test',
        scenarioId: 'scenario-1',
        success: false,
        responseTime: 5000,
        availability: 0.30,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'life-threatening' as const
        }
      }
    ];

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(criticalResults);

    const onEmergencyBreak = jest.fn();
    const { result } = renderHook(() => useCrisisStressTesting(onEmergencyBreak));

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    await waitFor(() => {
      expect(result.current.state.emergencyStatus.active).toBe(true);
      expect(result.current.state.emergencyStatus.reason).toContain('critical safety failures detected');
      expect(onEmergencyBreak).toHaveBeenCalled();
    });
  });

  it.skip('should run failover tests successfully', async () => {
    const mockFailoverResults = [
      {
        id: 'failover-1',
        systemComponent: 'crisis-detection',
        success: true,
        failoverTime: 200,
        timestamp: Date.now()
      }
    ];

    (crisisStressTestingSystem.runEmergencyFailoverTests as jest.Mock).mockResolvedValue(mockFailoverResults);

    const { result } = renderHook(() => useCrisisStressTesting());

    await act(async () => {
      await result.current.actions.runFailoverTests();
    });

    expect(crisisStressTestingSystem.runEmergencyFailoverTests).toHaveBeenCalled();
    expect(result.current.state.failoverResults).toEqual(mockFailoverResults);
    expect(result.current.hasResults).toBe(true);
  });

  it.skip('should handle failover test errors', async () => {
    const failoverError = new Error('Failover system unavailable');
    (crisisStressTestingSystem.runEmergencyFailoverTests as jest.Mock).mockRejectedValue(failoverError);

    const onEmergencyBreak = jest.fn();
    const { result } = renderHook(() => useCrisisStressTesting(onEmergencyBreak));

    await act(async () => {
      await result.current.actions.runFailoverTests();
    });

    expect(result.current.state.emergencyStatus.active).toBe(true);
    expect(result.current.state.emergencyStatus.reason).toContain('Failover testing failure');
    expect(onEmergencyBreak).toHaveBeenCalled();
  });

  it.skip('should execute emergency stop', async () => {
    const onEmergencyBreak = jest.fn();
    const { result } = renderHook(() => useCrisisStressTesting(onEmergencyBreak));

    act(() => {
      result.current.actions.emergencyStop();
    });

    expect(result.current.state.isTestingActive).toBe(false);
    expect(result.current.state.emergencyStatus.active).toBe(true);
    expect(result.current.state.emergencyStatus.reason).toBe('Manual emergency stop');
    expect(onEmergencyBreak).toHaveBeenCalledWith('Manual emergency stop activated');
  });

  it.skip('should clear emergency status', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    // First trigger emergency
    act(() => {
      result.current.actions.emergencyStop();
    });

    expect(result.current.state.emergencyStatus.active).toBe(true);

    // Then clear it
    act(() => {
      result.current.actions.clearEmergencyStatus();
    });

    expect(result.current.state.emergencyStatus.active).toBe(false);
    expect(result.current.isEmergency).toBe(false);
  });

  it.skip('should update test configuration', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    const newConfig = {
      maxConcurrentUsers: 2000,
      testDuration: 600
    };

    act(() => {
      result.current.actions.updateTestConfig(newConfig);
    });

    expect(result.current.state.testConfig.maxConcurrentUsers).toBe(2000);
    expect(result.current.state.testConfig.testDuration).toBe(600);
    // Other config values should remain unchanged
    expect(result.current.state.testConfig.rampUpTime).toBe(30);
  });

  it.skip('should toggle scenario selection', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    // Initially all scenarios are selected
    expect(result.current.state.selectedScenarios).toContain('scenario-1');

    act(() => {
      result.current.actions.toggleScenario('scenario-1');
    });

    // Should be deselected now
    expect(result.current.state.selectedScenarios).not.toContain('scenario-1');

    act(() => {
      result.current.actions.toggleScenario('scenario-1');
    });

    // Should be selected again
    expect(result.current.state.selectedScenarios).toContain('scenario-1');
  });

  it.skip('should clear results', async () => {
    const mockResults = [
      {
        id: 'test-1',
        scenarioId: 'scenario-1',
        success: true,
        responseTime: 500,
        availability: 0.99,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'low' as const
        }
      }
    ];

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useCrisisStressTesting());

    // First run tests to get results
    await act(async () => {
      await result.current.actions.runStressTests();
    });

    expect(result.current.state.testResults).toHaveLength(1);

    // Then clear results
    act(() => {
      result.current.actions.clearResults();
    });

    expect(result.current.state.testResults).toEqual([]);
    expect(result.current.state.failoverResults).toEqual([]);
    expect(result.current.state.emergencyStatus.active).toBe(false);
    expect(result.current.hasResults).toBe(false);
  });

  it.skip('should export results as JSON', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    const exportedData = result.current.actions.exportResults();
    const parsedData = JSON.parse(exportedData);

    expect(parsedData).toHaveProperty('timestamp');
    expect(parsedData).toHaveProperty('testConfig');
    expect(parsedData).toHaveProperty('selectedScenarios');
    expect(parsedData).toHaveProperty('testResults');
    expect(parsedData).toHaveProperty('failoverResults');
    expect(parsedData).toHaveProperty('emergencyStatus');
    expect(parsedData).toHaveProperty('statistics');
  });

  it.skip('should calculate test statistics correctly', async () => {
    const mockResults = [
      {
        id: 'test-1',
        scenarioId: 'scenario-1',
        success: true,
        responseTime: 300,
        availability: 0.99,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'low' as const
        }
      },
      {
        id: 'test-2',
        scenarioId: 'scenario-2',
        success: false,
        responseTime: 800,
        availability: 0.85,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'life-threatening' as const
        }
      }
    ];

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useCrisisStressTesting());

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    const stats = result.current.stats;
    expect(stats).toBeDefined();
    expect(stats!.total).toBe(2);
    expect(stats!.successful).toBe(1);
    expect(stats!.failed).toBe(1);
    expect(stats!.critical).toBe(1);
    expect(stats!.avgResponseTime).toBe(550); // (300 + 800) / 2
    expect(stats!.avgAvailability).toBe(92); // Math.round((0.99 + 0.85) / 2 * 100)
    expect(stats!.safetyScore).toBeLessThan(50); // Should be low due to critical failure
  });

  it.skip('should prevent concurrent test execution', async () => {
    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useCrisisStressTesting());

    // Start first test
    const firstTest = act(async () => {
      await result.current.actions.runStressTests();
    });

    // Try to start second test while first is running
    act(() => {
      result.current.actions.runStressTests();
    });

    expect(result.current.state.isTestingActive).toBe(true);
    
    // Wait for first test to complete
    await firstTest;
    
    // Should only have been called once
    expect(crisisStressTestingSystem.runCrisisStressTests).toHaveBeenCalledTimes(1);
  });

  it.skip('should call onTestComplete callback when tests finish', async () => {
    const mockResults = [
      {
        id: 'test-1',
        scenarioId: 'scenario-1',
        success: true,
        responseTime: 500,
        availability: 0.99,
        timestamp: Date.now(),
        impactAssessment: {
          safetyImpact: 'low' as const
        }
      }
    ];

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(mockResults);

    const onTestComplete = jest.fn();
    const { result } = renderHook(() => useCrisisStressTesting(undefined, onTestComplete));

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    expect(onTestComplete).toHaveBeenCalledWith(mockResults);
  });

  it.skip('should filter scenarios based on selection when running tests', async () => {
    const { result } = renderHook(() => useCrisisStressTesting());

    // Deselect scenario-2
    act(() => {
      result.current.actions.toggleScenario('scenario-2');
    });

    const mockResults: unknown[] = [];
    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockResolvedValue(mockResults);

    await act(async () => {
      await result.current.actions.runStressTests();
    });

    expect(crisisStressTestingSystem.runCrisisStressTests).toHaveBeenCalledWith(
      expect.objectContaining({
        scenarios: expect.arrayContaining([
          expect.objectContaining({ id: 'scenario-1' })
        ])
      })
    );

    // Verify scenario-2 was filtered out
    const calledConfig = (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mock.calls[0][0];
    expect(calledConfig.scenarios.find((s: any) => s.id === 'scenario-2')).toBeUndefined();
  });

  it.skip('should set testing status during test execution', async () => {
    let resolveTest: () => void;
    const testPromise = new Promise<any[]>(resolve => {
      resolveTest = () => resolve([]);
    });

    (crisisStressTestingSystem.runCrisisStressTests as jest.Mock).mockReturnValue(testPromise);

    const { result } = renderHook(() => useCrisisStressTesting());

    // Start test
    await act(async () => {
      result.current.actions.runStressTests();
    });

    // Should be in testing state
    expect(result.current.state.isTestingActive).toBe(true);
    expect(result.current.state.currentTest).toContain('Running crisis intervention scenarios');

    // Resolve the test
    await act(async () => {
      resolveTest!();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should be done testing
    expect(result.current.state.isTestingActive).toBe(false);
    expect(result.current.state.currentTest).toBeNull();
  });
});