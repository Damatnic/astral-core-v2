/**
 * Mock Crisis Stress Testing System
 *
 * Provides mock implementations for crisis stress testing scenarios,
 * load testing configurations, and performance benchmarks for the
 * mental health platform's crisis response systems.
 *
 * @fileoverview Mock crisis stress testing system for development and testing
 * @version 2.0.0
 */

/**
 * Crisis test scenario severity levels
 */
export type CrisisTestSeverity = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Test scenario types
 */
export type TestScenarioType = 
  | 'load-test' 
  | 'stress-test' 
  | 'spike-test' 
  | 'volume-test' 
  | 'endurance-test'
  | 'failover-test';

/**
 * Crisis test scenario interface
 */
export interface CrisisTestScenario {
  id: string;
  name: string;
  description: string;
  type: TestScenarioType;
  severity: CrisisTestSeverity;
  duration: number; // milliseconds
  targetComponents: string[];
  expectedOutcome: string;
  failureConditions: string[];
  recoveryTime: number; // milliseconds
  metadata?: Record<string, any>;
}

/**
 * Load testing configuration
 */
export interface LoadTestConfig {
  virtualUsers: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
  requestsPerSecond: number;
  endpoints: Array<{
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    weight: number; // percentage of requests
    expectedResponseTime: number; // milliseconds
  }>;
  thresholds: {
    responseTime: number;
    errorRate: number; // percentage
    throughput: number; // requests/second
  };
}

/**
 * Performance benchmark interface
 */
export interface PerformanceBenchmark {
  id: string;
  name: string;
  component: string;
  metric: 'response-time' | 'throughput' | 'error-rate' | 'cpu-usage' | 'memory-usage';
  baseline: number;
  target: number;
  threshold: number;
  unit: string;
  timestamp: string;
}

/**
 * Test execution result
 */
export interface TestExecutionResult {
  scenarioId: string;
  executionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'passed' | 'failed' | 'error' | 'timeout';
  metrics: {
    responseTime: {
      min: number;
      max: number;
      avg: number;
      p95: number;
      p99: number;
    };
    throughput: number;
    errorRate: number;
    successRate: number;
  };
  errors: Array<{
    type: string;
    message: string;
    count: number;
    timestamp: string;
  }>;
  logs: string[];
}

/**
 * Crisis stress testing scenarios
 */
export const CRISIS_TEST_SCENARIOS: CrisisTestScenario[] = [
  {
    id: 'scenario-1',
    name: 'High Load Crisis Detection',
    description: 'Test crisis detection under high load conditions',
    type: 'load-test',
    severity: 'critical',
    duration: 30000, // 30 seconds
    targetComponents: ['emergency-button', 'crisis-detection', 'notification-system'],
    expectedOutcome: 'All crisis requests processed within 2 seconds',
    failureConditions: ['Response time > 5 seconds', 'Error rate > 1%'],
    recoveryTime: 5000, // 5 seconds
    metadata: {
      virtualUsers: 1000,
      requestsPerSecond: 100,
      priority: 'immediate'
    }
  },
  {
    id: 'scenario-2',
    name: 'Emergency Contact Failover',
    description: 'Test emergency contact system failover during outages',
    type: 'failover-test',
    severity: 'high',
    duration: 60000, // 1 minute
    targetComponents: ['emergency-contacts', 'notification-service', 'sms-gateway'],
    expectedOutcome: 'Automatic failover to backup systems within 10 seconds',
    failureConditions: ['Failover time > 30 seconds', 'Contact delivery failure'],
    recoveryTime: 10000, // 10 seconds
    metadata: {
      primarySystem: 'twilio',
      backupSystem: 'aws-sns',
      testContacts: ['test@example.com', '+1234567890']
    }
  },
  {
    id: 'scenario-3',
    name: 'AI Crisis Response Stress Test',
    description: 'Test AI crisis response system under extreme load',
    type: 'stress-test',
    severity: 'critical',
    duration: 120000, // 2 minutes
    targetComponents: ['ai-crisis-detection', 'nlp-processor', 'response-generator'],
    expectedOutcome: 'AI responses generated within 3 seconds under 500 concurrent users',
    failureConditions: ['Response time > 10 seconds', 'AI unavailable'],
    recoveryTime: 15000, // 15 seconds
    metadata: {
      maxConcurrentUsers: 500,
      aiModelVersion: 'v2.1',
      languageSupport: ['en', 'es', 'fr', 'de']
    }
  },
  {
    id: 'scenario-4',
    name: 'Safety Plan Access Spike',
    description: 'Test safety plan access during traffic spikes',
    type: 'spike-test',
    severity: 'moderate',
    duration: 45000, // 45 seconds
    targetComponents: ['safety-plan-service', 'database', 'cache-layer'],
    expectedOutcome: 'Safety plans accessible within 1 second during 10x traffic spike',
    failureConditions: ['Database timeout', 'Cache miss > 20%'],
    recoveryTime: 8000, // 8 seconds
    metadata: {
      baselineTraffic: 50,
      spikeMultiplier: 10,
      cacheTtl: 300
    }
  },
  {
    id: 'scenario-5',
    name: 'Multi-Language Crisis Support',
    description: 'Test crisis support across multiple languages simultaneously',
    type: 'volume-test',
    severity: 'high',
    duration: 90000, // 1.5 minutes
    targetComponents: ['translation-service', 'cultural-context', 'crisis-resources'],
    expectedOutcome: 'Crisis support available in all supported languages',
    failureConditions: ['Translation failure', 'Cultural context missing'],
    recoveryTime: 12000, // 12 seconds
    metadata: {
      supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi'],
      translationProvider: 'google-translate',
      fallbackLanguage: 'en'
    }
  },
  {
    id: 'scenario-6',
    name: 'Mobile Crisis App Performance',
    description: 'Test mobile app performance during crisis situations',
    type: 'endurance-test',
    severity: 'moderate',
    duration: 300000, // 5 minutes
    targetComponents: ['mobile-app', 'offline-sync', 'push-notifications'],
    expectedOutcome: 'Mobile app remains responsive with offline capabilities',
    failureConditions: ['App crash', 'Offline sync failure', 'Notification delay > 30s'],
    recoveryTime: 20000, // 20 seconds
    metadata: {
      mobileDevices: ['ios', 'android'],
      networkConditions: ['3g', '4g', 'wifi', 'offline'],
      batteryLevels: [100, 50, 20, 10]
    }
  }
];

/**
 * Load testing configurations
 */
export const LOAD_TEST_CONFIGS: Record<string, LoadTestConfig> = {
  'crisis-detection': {
    virtualUsers: 1000,
    rampUpTime: 30,
    testDuration: 300,
    requestsPerSecond: 100,
    endpoints: [
      { path: '/api/crisis-detect', method: 'POST', weight: 40, expectedResponseTime: 2000 },
      { path: '/api/crisis-resources', method: 'GET', weight: 30, expectedResponseTime: 1000 },
      { path: '/api/emergency-contacts', method: 'GET', weight: 20, expectedResponseTime: 500 },
      { path: '/api/safety-plan', method: 'GET', weight: 10, expectedResponseTime: 800 }
    ],
    thresholds: {
      responseTime: 5000,
      errorRate: 1,
      throughput: 95
    }
  },
  'helper-matching': {
    virtualUsers: 500,
    rampUpTime: 60,
    testDuration: 600,
    requestsPerSecond: 50,
    endpoints: [
      { path: '/api/helpers/search', method: 'POST', weight: 50, expectedResponseTime: 3000 },
      { path: '/api/helpers/connect', method: 'POST', weight: 30, expectedResponseTime: 2000 },
      { path: '/api/chat/init', method: 'POST', weight: 20, expectedResponseTime: 1500 }
    ],
    thresholds: {
      responseTime: 8000,
      errorRate: 2,
      throughput: 48
    }
  },
  'mood-tracking': {
    virtualUsers: 2000,
    rampUpTime: 45,
    testDuration: 240,
    requestsPerSecond: 200,
    endpoints: [
      { path: '/api/mood/entry', method: 'POST', weight: 60, expectedResponseTime: 1000 },
      { path: '/api/mood/history', method: 'GET', weight: 25, expectedResponseTime: 1500 },
      { path: '/api/mood/analytics', method: 'GET', weight: 15, expectedResponseTime: 2000 }
    ],
    thresholds: {
      responseTime: 3000,
      errorRate: 0.5,
      throughput: 190
    }
  }
};

/**
 * Performance benchmarks
 */
export const PERFORMANCE_BENCHMARKS: PerformanceBenchmark[] = [
  {
    id: 'crisis-response-time',
    name: 'Crisis Response Time',
    component: 'crisis-detection-service',
    metric: 'response-time',
    baseline: 1500,
    target: 1000,
    threshold: 2000,
    unit: 'ms',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ai-inference-time',
    name: 'AI Inference Time',
    component: 'ai-crisis-model',
    metric: 'response-time',
    baseline: 800,
    target: 500,
    threshold: 1500,
    unit: 'ms',
    timestamp: new Date().toISOString()
  },
  {
    id: 'notification-throughput',
    name: 'Notification Throughput',
    component: 'notification-service',
    metric: 'throughput',
    baseline: 1000,
    target: 2000,
    threshold: 500,
    unit: 'notifications/minute',
    timestamp: new Date().toISOString()
  },
  {
    id: 'database-query-time',
    name: 'Database Query Time',
    component: 'safety-plan-db',
    metric: 'response-time',
    baseline: 200,
    target: 100,
    threshold: 500,
    unit: 'ms',
    timestamp: new Date().toISOString()
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    component: 'crisis-service',
    metric: 'memory-usage',
    baseline: 512,
    target: 256,
    threshold: 1024,
    unit: 'MB',
    timestamp: new Date().toISOString()
  }
];

/**
 * Mock Crisis Stress Testing System Implementation
 */
export class MockCrisisStressTestingSystem {
  private runningTests: Map<string, TestExecutionResult> = new Map();
  private testHistory: TestExecutionResult[] = [];

  /**
   * Execute a crisis test scenario
   */
  async executeScenario(scenarioId: string): Promise<TestExecutionResult> {
    const scenario = CRISIS_TEST_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const executionId = this.generateExecutionId();
    const startTime = new Date().toISOString();

    console.log(`Starting crisis test scenario: ${scenario.name}`);

    // Create initial result
    const result: TestExecutionResult = {
      scenarioId,
      executionId,
      startTime,
      endTime: '',
      duration: 0,
      status: 'passed',
      metrics: {
        responseTime: { min: 0, max: 0, avg: 0, p95: 0, p99: 0 },
        throughput: 0,
        errorRate: 0,
        successRate: 100
      },
      errors: [],
      logs: [`Test started: ${scenario.name}`]
    };

    this.runningTests.set(executionId, result);

    // Simulate test execution
    try {
      await this.simulateTestExecution(scenario, result);
      result.status = 'passed';
      result.logs.push('Test completed successfully');
    } catch (error) {
      result.status = 'failed';
      result.errors.push({
        type: 'execution-error',
        message: error instanceof Error ? error.message : 'Unknown error',
        count: 1,
        timestamp: new Date().toISOString()
      });
      result.logs.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Finalize result
    result.endTime = new Date().toISOString();
    result.duration = new Date(result.endTime).getTime() - new Date(result.startTime).getTime();

    this.runningTests.delete(executionId);
    this.testHistory.push(result);

    return result;
  }

  /**
   * Execute load test configuration
   */
  async executeLoadTest(configName: string): Promise<TestExecutionResult> {
    const config = LOAD_TEST_CONFIGS[configName];
    if (!config) {
      throw new Error(`Load test config ${configName} not found`);
    }

    const executionId = this.generateExecutionId();
    const startTime = new Date().toISOString();

    console.log(`Starting load test: ${configName}`);

    const result: TestExecutionResult = {
      scenarioId: `load-test-${configName}`,
      executionId,
      startTime,
      endTime: '',
      duration: 0,
      status: 'passed',
      metrics: {
        responseTime: { min: 0, max: 0, avg: 0, p95: 0, p99: 0 },
        throughput: 0,
        errorRate: 0,
        successRate: 100
      },
      errors: [],
      logs: [`Load test started: ${configName}`]
    };

    this.runningTests.set(executionId, result);

    try {
      await this.simulateLoadTest(config, result);
      result.status = this.evaluateLoadTestResults(result, config);
    } catch (error) {
      result.status = 'error';
      result.errors.push({
        type: 'load-test-error',
        message: error instanceof Error ? error.message : 'Unknown error',
        count: 1,
        timestamp: new Date().toISOString()
      });
    }

    result.endTime = new Date().toISOString();
    result.duration = new Date(result.endTime).getTime() - new Date(result.startTime).getTime();

    this.runningTests.delete(executionId);
    this.testHistory.push(result);

    return result;
  }

  /**
   * Get running tests
   */
  getRunningTests(): TestExecutionResult[] {
    return Array.from(this.runningTests.values());
  }

  /**
   * Get test history
   */
  getTestHistory(limit: number = 50): TestExecutionResult[] {
    return this.testHistory.slice(-limit);
  }

  /**
   * Get performance benchmarks
   */
  getPerformanceBenchmarks(): PerformanceBenchmark[] {
    return [...PERFORMANCE_BENCHMARKS];
  }

  /**
   * Validate benchmark against result
   */
  validateBenchmark(benchmarkId: string, actualValue: number): boolean {
    const benchmark = PERFORMANCE_BENCHMARKS.find(b => b.id === benchmarkId);
    if (!benchmark) return false;

    return actualValue <= benchmark.threshold;
  }

  // Private helper methods

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateTestExecution(scenario: CrisisTestScenario, result: TestExecutionResult): Promise<void> {
    const steps = Math.floor(scenario.duration / 1000); // 1 second steps
    
    for (let step = 0; step < steps; step++) {
      await this.delay(1000);
      
      // Simulate progress
      result.logs.push(`Step ${step + 1}/${steps}: Testing ${scenario.targetComponents.join(', ')}`);
      
      // Generate mock metrics
      this.updateMockMetrics(result, scenario);
      
      // Simulate potential failures based on scenario
      if (Math.random() < 0.05 && scenario.severity === 'critical') { // 5% chance of error
        throw new Error(`Simulated failure in ${scenario.targetComponents[0]}`);
      }
    }
  }

  private async simulateLoadTest(config: LoadTestConfig, result: TestExecutionResult): Promise<void> {
    const steps = config.testDuration / 10; // 10 second intervals
    
    for (let step = 0; step < steps; step++) {
      await this.delay(10000);
      
      result.logs.push(`Load test progress: ${Math.round((step + 1) / steps * 100)}%`);
      this.updateLoadTestMetrics(result, config);
    }
  }

  private updateMockMetrics(result: TestExecutionResult, scenario: CrisisTestScenario): void {
    // Generate realistic but mock metrics
    const baseResponseTime = scenario.severity === 'critical' ? 500 : 1000;
    const variance = Math.random() * 200;
    
    result.metrics.responseTime.avg = baseResponseTime + variance;
    result.metrics.responseTime.min = Math.max(50, baseResponseTime - 200);
    result.metrics.responseTime.max = baseResponseTime + variance * 2;
    result.metrics.responseTime.p95 = baseResponseTime + variance * 1.5;
    result.metrics.responseTime.p99 = baseResponseTime + variance * 1.8;
    
    result.metrics.throughput = 100 - Math.random() * 10; // 90-100 req/sec
    result.metrics.errorRate = Math.random() * 2; // 0-2% error rate
    result.metrics.successRate = 100 - result.metrics.errorRate;
  }

  private updateLoadTestMetrics(result: TestExecutionResult, config: LoadTestConfig): void {
    const avgExpectedTime = config.endpoints.reduce((sum, ep) => sum + ep.expectedResponseTime * ep.weight / 100, 0);
    const variance = Math.random() * avgExpectedTime * 0.3;
    
    result.metrics.responseTime.avg = avgExpectedTime + variance;
    result.metrics.responseTime.min = Math.max(100, avgExpectedTime - variance);
    result.metrics.responseTime.max = avgExpectedTime + variance * 2;
    result.metrics.responseTime.p95 = avgExpectedTime + variance * 1.5;
    result.metrics.responseTime.p99 = avgExpectedTime + variance * 1.8;
    
    result.metrics.throughput = config.requestsPerSecond * (0.9 + Math.random() * 0.1);
    result.metrics.errorRate = Math.random() * config.thresholds.errorRate;
    result.metrics.successRate = 100 - result.metrics.errorRate;
  }

  private evaluateLoadTestResults(result: TestExecutionResult, config: LoadTestConfig): 'passed' | 'failed' {
    const responseTimePass = result.metrics.responseTime.avg <= config.thresholds.responseTime;
    const errorRatePass = result.metrics.errorRate <= config.thresholds.errorRate;
    const throughputPass = result.metrics.throughput >= config.thresholds.throughput;
    
    if (responseTimePass && errorRatePass && throughputPass) {
      result.logs.push('All thresholds met - Test PASSED');
      return 'passed';
    } else {
      result.logs.push('Some thresholds exceeded - Test FAILED');
      if (!responseTimePass) result.logs.push(`Response time exceeded: ${result.metrics.responseTime.avg}ms > ${config.thresholds.responseTime}ms`);
      if (!errorRatePass) result.logs.push(`Error rate exceeded: ${result.metrics.errorRate}% > ${config.thresholds.errorRate}%`);
      if (!throughputPass) result.logs.push(`Throughput below threshold: ${result.metrics.throughput} < ${config.thresholds.throughput}`);
      return 'failed';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and export singleton instance
export const mockCrisisStressTesting = new MockCrisisStressTestingSystem();

// Export test data for direct access
export { CRISIS_TEST_SCENARIOS, LOAD_TEST_CONFIGS, PERFORMANCE_BENCHMARKS };

export default mockCrisisStressTesting;
