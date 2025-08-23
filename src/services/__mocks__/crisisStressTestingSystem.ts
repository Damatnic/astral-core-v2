/**
 * Mock for Crisis Stress Testing System
 */

export const CRISIS_TEST_SCENARIOS = [
  {
    id: 'scenario-1',
    name: 'High Load Crisis Detection',
    description: 'Test crisis detection under high load',
    severity: 'critical' as const,
    duration: 30000,
    targetComponents: ['emergency-button'],
    expectedOutcome: 'All tests pass',
    failureConditions: [],
    recoveryTime: 500
  },
  {
    id: 'scenario-2', 
    name: 'Emergency Response',
    description: 'Test emergency response systems',
    severity: 'critical' as const,
    duration: 30000,
    targetComponents: ['crisis-chat'],
    expectedOutcome: 'All tests pass',
    failureConditions: [],
    recoveryTime: 500
  }
];

export const crisisStressTestingSystem = {
  runCrisisStressTests: jest.fn().mockResolvedValue([]),
  runEmergencyFailoverTests: jest.fn().mockResolvedValue([]),
  scenarios: CRISIS_TEST_SCENARIOS
};

export interface CrisisTestResult {
  id: string;
  scenarioId: string;
  success: boolean;
  responseTime: number;
  availability: number;
  timestamp: number;
  impactAssessment: {
    safetyImpact: 'none' | 'low' | 'moderate' | 'severe' | 'life-threatening';
  };
}

export interface EmergencyFailoverTest {
  id: string;
  systemComponent: string;
  success: boolean;
  failoverTime: number;
  timestamp: number;
}

export interface CrisisStressTestConfig {
  maxConcurrentUsers: number;
  testDuration: number;
  rampUpTime: number;
  scenarios: typeof CRISIS_TEST_SCENARIOS;
  failureThresholds: {
    responseTime: number;
    errorRate: number;
    availability: number;
  };
  emergencyBreakConditions: string[];
}