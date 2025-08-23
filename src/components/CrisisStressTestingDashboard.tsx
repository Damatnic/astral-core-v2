/**
 * Crisis Stress Testing Dashboard
 * 
 * React component for managing and monitoring crisis intervention stress tests
 * with real-time results and emergency protocols activation.
 */

import React, { useState, useCallback } from 'react';
import { 
  crisisStressTestingSystem,
  CrisisStressTestConfig,
  CrisisTestResult,
  CRISIS_TEST_SCENARIOS,
  EmergencyFailoverTest
} from '../services/crisisStressTestingSystem';

interface CrisisStressTestingDashboardProps {
  onEmergencyBreak?: (reason: string) => void;
  onTestComplete?: (results: CrisisTestResult[]) => void;
  className?: string;
}

export const CrisisStressTestingDashboard: React.FC<CrisisStressTestingDashboardProps> = ({
  onEmergencyBreak,
  onTestComplete,
  className = ''
}) => {
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [testResults, setTestResults] = useState<CrisisTestResult[]>([]);
  const [failoverResults, setFailoverResults] = useState<EmergencyFailoverTest[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    CRISIS_TEST_SCENARIOS.map(s => s.id)
  );
  const [testConfig, setTestConfig] = useState<CrisisStressTestConfig>({
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
  });
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [emergencyStatus, setEmergencyStatus] = useState<{
    active: boolean;
    reason?: string;
    timestamp?: number;
  }>({ active: false });

  // Run crisis stress tests
  const runStressTests = useCallback(async () => {
    if (isTestingActive) return;

    setIsTestingActive(true);
    setTestResults([]);
    setFailoverResults([]);
    setEmergencyStatus({ active: false });
    setCurrentTest('Initializing...');

    try {
      // Filter scenarios based on selection
      const configWithSelectedScenarios = {
        ...testConfig,
        scenarios: testConfig.scenarios.filter(s => selectedScenarios.includes(s.id))
      };

      const results = await crisisStressTestingSystem.runCrisisStressTests(configWithSelectedScenarios);
      
      setTestResults(results);
      onTestComplete?.(results);
      setCurrentTest(null);
      
      // Check for any critical failures
      const criticalFailures = results.filter(r => 
        r.impactAssessment.safetyImpact === 'life-threatening'
      );
      
      if (criticalFailures.length > 0) {
        const reason = `${criticalFailures.length} critical safety failures detected`;
        setEmergencyStatus({ 
          active: true, 
          reason, 
          timestamp: Date.now() 
        });
        onEmergencyBreak?.(reason);
      }
      
    } catch (error) {
      console.error('Crisis stress testing failed:', error);
      const reason = `Testing system failure: ${error instanceof Error ? error.message : String(error)}`;
      setEmergencyStatus({ 
        active: true, 
        reason, 
        timestamp: Date.now() 
      });
      onEmergencyBreak?.(reason);
    } finally {
      setIsTestingActive(false);
      setCurrentTest(null);
    }
  }, [isTestingActive, testConfig, selectedScenarios, onTestComplete, onEmergencyBreak]);

  // Handle scenario selection
  const handleScenarioToggle = useCallback((scenarioId: string, checked: boolean) => {
    if (checked) {
      setSelectedScenarios(prev => [...prev, scenarioId]);
    } else {
      setSelectedScenarios(prev => prev.filter(id => id !== scenarioId));
    }
  }, []);

  // Emergency stop function
  const emergencyStop = useCallback(() => {
    setIsTestingActive(false);
    setCurrentTest('Emergency stop activated');
    setEmergencyStatus({ 
      active: true, 
      reason: 'Manual emergency stop', 
      timestamp: Date.now() 
    });
    onEmergencyBreak?.('Manual emergency stop activated');
  }, [onEmergencyBreak]);

  // Clear emergency status
  const clearEmergencyStatus = useCallback(() => {
    setEmergencyStatus({ active: false });
  }, []);

  // Get test statistics
  const getTestStats = useCallback(() => {
    if (testResults.length === 0) return null;

    const successful = testResults.filter(r => r.success).length;
    const critical = testResults.filter(r => r.impactAssessment.safetyImpact === 'life-threatening').length;
    const avgResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length;
    const avgAvailability = testResults.reduce((sum, r) => sum + r.availability, 0) / testResults.length;

    return {
      total: testResults.length,
      successful,
      failed: testResults.length - successful,
      critical,
      avgResponseTime: Math.round(avgResponseTime),
      avgAvailability: Math.round(avgAvailability * 100)
    };
  }, [testResults]);

  const stats = getTestStats();

  return (
    <div className={`crisis-stress-testing-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>🚨 Crisis Intervention Stress Testing</h2>
        <div className="header-actions">
          {isTestingActive ? (
            <button 
              className="emergency-stop-btn"
              onClick={emergencyStop}
              disabled={!isTestingActive}
            >
              🛑 EMERGENCY STOP
            </button>
          ) : (
            <button 
              className="run-tests-btn"
              onClick={runStressTests}
              disabled={isTestingActive || selectedScenarios.length === 0}
            >
              ▶️ Run Crisis Tests
            </button>
          )}
        </div>
      </div>

      {/* Emergency Status Alert */}
      {emergencyStatus.active && (
        <div className="emergency-alert">
          <div className="alert-content">
            <span className="alert-icon">🚨</span>
            <div className="alert-text">
              <strong>EMERGENCY STATUS ACTIVE</strong>
              <p>{emergencyStatus.reason}</p>
              {emergencyStatus.timestamp && (
                <small>Triggered: {new Date(emergencyStatus.timestamp).toLocaleString()}</small>
              )}
            </div>
            <button className="clear-alert-btn" onClick={clearEmergencyStatus}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Current Test Status */}
      {isTestingActive && (
        <div className="current-test-status">
          <div className="status-indicator">
            <div className="spinner"></div>
            <span>Testing in progress: {currentTest || 'Running crisis scenarios...'}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      )}

      {/* Test Configuration */}
      <div className="test-configuration">
        <h3>Test Configuration</h3>
        
        <div className="config-section">
          <label htmlFor="max-concurrent-users">Max Concurrent Users:</label>
          <input
            id="max-concurrent-users"
            type="number"
            value={testConfig.maxConcurrentUsers}
            onChange={(e) => setTestConfig(prev => ({
              ...prev,
              maxConcurrentUsers: parseInt(e.target.value)
            }))}
            min="100"
            max="10000"
            step="100"
            disabled={isTestingActive}
          />
        </div>

        <div className="config-section">
          <label htmlFor="test-duration">Test Duration (seconds):</label>
          <input
            id="test-duration"
            type="number"
            value={testConfig.testDuration}
            onChange={(e) => setTestConfig(prev => ({
              ...prev,
              testDuration: parseInt(e.target.value)
            }))}
            min="60"
            max="3600"
            step="30"
            disabled={isTestingActive}
          />
        </div>

        <div className="config-section">
          <label htmlFor="response-threshold">Response Time Threshold (ms):</label>
          <input
            id="response-threshold"
            type="number"
            value={testConfig.failureThresholds.responseTime}
            onChange={(e) => setTestConfig(prev => ({
              ...prev,
              failureThresholds: {
                ...prev.failureThresholds,
                responseTime: parseInt(e.target.value)
              }
            }))}
            min="100"
            max="5000"
            step="100"
            disabled={isTestingActive}
          />
        </div>
      </div>

      {/* Test Scenario Selection */}
      <div className="scenario-selection">
        <h3>Crisis Test Scenarios</h3>
        <div className="scenario-grid">
          {CRISIS_TEST_SCENARIOS.map(scenario => (
            <div key={scenario.id} className="scenario-card">
              <div className="scenario-header">
                <input
                  type="checkbox"
                  id={scenario.id}
                  checked={selectedScenarios.includes(scenario.id)}
                  onChange={(e) => handleScenarioToggle(scenario.id, e.target.checked)}
                  disabled={isTestingActive}
                />
                <label htmlFor={scenario.id} className="scenario-name">
                  {scenario.name}
                </label>
                <span className={`severity-badge severity-${scenario.severity}`}>
                  {scenario.severity.toUpperCase()}
                </span>
              </div>
              <p className="scenario-description">{scenario.description}</p>
              <div className="scenario-details">
                <small>Duration: {scenario.duration / 1000}s</small>
                <small>Recovery: {scenario.recoveryTime}ms</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results Summary */}
      {stats && (
        <div className="test-results-summary">
          <h3>Test Results Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tests</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats.successful}</div>
              <div className="stat-label">Successful</div>
            </div>
            <div className="stat-card failed">
              <div className="stat-value">{stats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card critical">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">Critical Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgResponseTime}ms</div>
              <div className="stat-label">Avg Response</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgAvailability}%</div>
              <div className="stat-label">Avg Availability</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Test Results */}
      {testResults.length > 0 && (
        <div className="detailed-results">
          <h3>Detailed Test Results</h3>
          <div className="results-table">
            {testResults.map((result) => (
              <div key={result.testId} className={result.success ? 'result-row success' : 'result-row failed'}>
                <div className="result-header">
                  <span className="test-name">{result.scenario.name}</span>
                  <span className={result.success ? 'status-badge success' : 'status-badge failed'}>
                    {result.success ? '✅ PASSED' : '❌ FAILED'}
                  </span>
                  <span className={`safety-impact safety-${result.impactAssessment.safetyImpact}`}>
                    Safety: {result.impactAssessment.safetyImpact.toUpperCase()}
                  </span>
                </div>
                
                <div className="result-metrics">
                  <div className="metric">
                    <span className="metric-label">Response Time:</span>
                    <span className={result.responseTime > result.scenario.recoveryTime ? 'over-threshold' : ''}>
                      {result.responseTime}ms
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Availability:</span>
                    <span className={result.availability < 0.99 ? 'below-threshold' : ''}>
                      {(result.availability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Error Rate:</span>
                    <span className={result.errorRate > 0.01 ? 'above-threshold' : ''}>
                      {(result.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {result.failurePoints.length > 0 && (
                  <div className="failure-points">
                    <strong>Failure Points:</strong>
                    <ul>
                      {result.failurePoints.map((point, idx) => (
                        <li key={`failure-${result.testId}-${idx}`}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="recommendations">
                    <strong>Recommendations:</strong>
                    <ul>
                      {result.recommendations.map((rec, idx) => (
                        <li key={`rec-${result.testId}-${idx}`}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.emergencyProcedures.length > 0 && (
                  <div className="emergency-procedures">
                    <strong>🚨 Emergency Procedures:</strong>
                    <ul>
                      {result.emergencyProcedures.map((proc, idx) => (
                        <li key={`proc-${result.testId}-${idx}`}>{proc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failover Test Results */}
      {failoverResults.length > 0 && (
        <div className="failover-results">
          <h3>Emergency Failover Test Results</h3>
          <div className="failover-grid">
            {failoverResults.map(test => (
              <div key={test.id} className="failover-card">
                <div className="failover-header">
                  <span className="component-name">{test.component}</span>
                  <span className={test.testResult?.fallbackWorked ? 'failover-status success' : 'failover-status failed'}>
                    {test.testResult?.fallbackWorked ? '✅ SUCCESS' : '❌ FAILED'}
                  </span>
                </div>
                <div className="failover-details">
                  <p><strong>Failure Type:</strong> {test.failureType}</p>
                  <p><strong>Simulated:</strong> {test.simulatedFailure}</p>
                  <p><strong>Expected:</strong> {test.expectedFallback}</p>
                  {test.testResult && (
                    <>
                      <p><strong>Failover Time:</strong> {test.testResult.actualFailoverTime}ms 
                        (max: {test.maxFailoverTime}ms)</p>
                      <p><strong>User Experience:</strong> {test.testResult.userExperience}</p>
                      <p><strong>Data Integrity:</strong> {test.testResult.dataIntegrity ? '✅' : '❌'}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisStressTestingDashboard;
