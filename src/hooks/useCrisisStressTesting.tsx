/**
 * Crisis Stress Testing Hook
 * 
 * React hook for managing crisis intervention stress testing state and operations.
 * Provides real-time monitoring and emergency response capabilities.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  crisisStressTestingSystem,
  CrisisStressTestConfig,
  CrisisTestResult,
  EmergencyFailoverTest,
  CRISIS_TEST_SCENARIOS
} from '../services/crisisStressTestingSystem';

export interface CrisisStressTestingState {
  isTestingActive: boolean;
  currentTest: string | null;
  testResults: CrisisTestResult[];
  failoverResults: EmergencyFailoverTest[];
  emergencyStatus: {
    active: boolean;
    reason?: string;
    timestamp?: number;
  };
  testConfig: CrisisStressTestConfig;
  selectedScenarios: string[];
}

export interface CrisisStressTestingActions {
  runStressTests: () => Promise<void>;
  runFailoverTests: () => Promise<void>;
  emergencyStop: () => void;
  clearEmergencyStatus: () => void;
  updateTestConfig: (config: Partial<CrisisStressTestConfig>) => void;
  toggleScenario: (scenarioId: string) => void;
  clearResults: () => void;
  exportResults: () => string;
}

export interface CrisisStressTestingStats {
  total: number;
  successful: number;
  failed: number;
  critical: number;
  avgResponseTime: number;
  avgAvailability: number;
  safetyScore: number;
}

export const useCrisisStressTesting = (
  onEmergencyBreak?: (reason: string) => void,
  onTestComplete?: (results: CrisisTestResult[]) => void
) => {
  const [state, setState] = useState<CrisisStressTestingState>({
    isTestingActive: false,
    currentTest: null,
    testResults: [],
    failoverResults: [],
    emergencyStatus: { active: false },
    testConfig: {
      maxConcurrentUsers: 1000,
      testDuration: 300, // 5 minutes
      rampUpTime: 30, // 30 seconds
      scenarios: CRISIS_TEST_SCENARIOS,
      failureThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.01, // 1%
        availability: 0.99 // 99%
      },
      emergencyBreakConditions: [
        'Critical safety impact detected',
        'System availability below 50%',
        'Emergency features completely unavailable'
      ]
    },
    selectedScenarios: CRISIS_TEST_SCENARIOS.map(s => s.id)
  });

  // Monitor for emergency conditions
  useEffect(() => {
    if (state.testResults.length === 0) return;

    const criticalFailures = state.testResults.filter(r => 
      r.impactAssessment.safetyImpact === 'life-threatening'
    );

    if (criticalFailures.length > 0 && !state.emergencyStatus.active) {
      const reason = `${criticalFailures.length} critical safety failures detected`;
      setState(prev => ({
        ...prev,
        emergencyStatus: { 
          active: true, 
          reason, 
          timestamp: Date.now() 
        }
      }));
      onEmergencyBreak?.(reason);
    }
  }, [state.testResults, state.emergencyStatus.active, onEmergencyBreak]);

  // Run crisis stress tests
  const runStressTests = useCallback(async () => {
    if (state.isTestingActive) return;

    setState(prev => ({
      ...prev,
      isTestingActive: true,
      testResults: [],
      emergencyStatus: { active: false },
      currentTest: 'Initializing crisis stress tests...'
    }));

    try {
      // Filter scenarios based on selection
      const configWithSelectedScenarios = {
        ...state.testConfig,
        scenarios: state.testConfig.scenarios.filter(s => 
          state.selectedScenarios.includes(s.id)
        )
      };

      setState(prev => ({
        ...prev,
        currentTest: 'Running crisis intervention scenarios...'
      }));

      const results = await crisisStressTestingSystem.runCrisisStressTests(
        configWithSelectedScenarios
      );

      setState(prev => ({
        ...prev,
        testResults: results,
        currentTest: null
      }));

      onTestComplete?.(results);

    } catch (error) {
      console.error('Crisis stress testing failed:', error);
      const reason = `Testing system failure: ${error instanceof Error ? error.message : String(error)}`;
      setState(prev => ({
        ...prev,
        emergencyStatus: { 
          active: true, 
          reason, 
          timestamp: Date.now() 
        },
        currentTest: null
      }));
      onEmergencyBreak?.(reason);
    } finally {
      setState(prev => ({
        ...prev,
        isTestingActive: false,
        currentTest: null
      }));
    }
  }, [state.isTestingActive, state.testConfig, state.selectedScenarios, onTestComplete, onEmergencyBreak]);

  // Run emergency failover tests
  const runFailoverTests = useCallback(async () => {
    if (state.isTestingActive) return;

    setState(prev => ({
      ...prev,
      isTestingActive: true,
      failoverResults: [],
      currentTest: 'Testing emergency failover systems...'
    }));

    try {
      const failoverResults = await crisisStressTestingSystem.runEmergencyFailoverTests();
      
      setState(prev => ({
        ...prev,
        failoverResults,
        currentTest: null
      }));

    } catch (error) {
      console.error('Failover testing failed:', error);
      const reason = `Failover testing failure: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setState(prev => ({
        ...prev,
        emergencyStatus: { 
          active: true, 
          reason, 
          timestamp: Date.now() 
        },
        currentTest: null
      }));
      onEmergencyBreak?.(reason);
    } finally {
      setState(prev => ({
        ...prev,
        isTestingActive: false,
        currentTest: null
      }));
    }
  }, [state.isTestingActive, onEmergencyBreak]);

  // Emergency stop function
  const emergencyStop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTestingActive: false,
      currentTest: 'Emergency stop activated',
      emergencyStatus: { 
        active: true, 
        reason: 'Manual emergency stop', 
        timestamp: Date.now() 
      }
    }));
    onEmergencyBreak?.('Manual emergency stop activated');
  }, [onEmergencyBreak]);

  // Clear emergency status
  const clearEmergencyStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      emergencyStatus: { active: false }
    }));
  }, []);

  // Update test configuration
  const updateTestConfig = useCallback((config: Partial<CrisisStressTestConfig>) => {
    setState(prev => ({
      ...prev,
      testConfig: { ...prev.testConfig, ...config }
    }));
  }, []);

  // Toggle scenario selection
  const toggleScenario = useCallback((scenarioId: string) => {
    setState(prev => ({
      ...prev,
      selectedScenarios: prev.selectedScenarios.includes(scenarioId)
        ? prev.selectedScenarios.filter(id => id !== scenarioId)
        : [...prev.selectedScenarios, scenarioId]
    }));
  }, []);

  // Clear all results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      testResults: [],
      failoverResults: [],
      emergencyStatus: { active: false }
    }));
  }, []);

  // Export results as JSON
  const exportResults = useCallback((): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      testConfig: state.testConfig,
      selectedScenarios: state.selectedScenarios,
      testResults: state.testResults,
      failoverResults: state.failoverResults,
      emergencyStatus: state.emergencyStatus,
      statistics: getTestStats()
    };
    return JSON.stringify(exportData, null, 2);
  }, [state]);

  // Calculate test statistics
  const getTestStats = useCallback((): CrisisStressTestingStats | null => {
    if (state.testResults.length === 0) return null;

    const successful = state.testResults.filter(r => r.success).length;
    const critical = state.testResults.filter(r => 
      r.impactAssessment.safetyImpact === 'life-threatening'
    ).length;
    const avgResponseTime = state.testResults.reduce((sum, r) => sum + r.responseTime, 0) / 
      state.testResults.length;
    const avgAvailability = state.testResults.reduce((sum, r) => sum + r.availability, 0) / 
      state.testResults.length;

    // Calculate safety score (0-100) based on success rate and critical failures
    const successRate = successful / state.testResults.length;
    const criticalImpact = critical / state.testResults.length;
    const safetyScore = Math.max(0, Math.round((successRate - criticalImpact * 2) * 100));

    return {
      total: state.testResults.length,
      successful,
      failed: state.testResults.length - successful,
      critical,
      avgResponseTime: Math.round(avgResponseTime),
      avgAvailability: Math.round(avgAvailability * 100),
      safetyScore
    };
  }, [state.testResults]);

  const actions: CrisisStressTestingActions = {
    runStressTests,
    runFailoverTests,
    emergencyStop,
    clearEmergencyStatus,
    updateTestConfig,
    toggleScenario,
    clearResults,
    exportResults
  };

  return {
    state,
    actions,
    stats: getTestStats(),
    isEmergency: state.emergencyStatus.active,
    hasResults: state.testResults.length > 0 || state.failoverResults.length > 0
  };
};

export default useCrisisStressTesting;
