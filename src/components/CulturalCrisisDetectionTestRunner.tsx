/**
 * Cultural Crisis Detection Integration Test Runner
 * 
 * Manual test runner for validating cultural crisis detection integration
 * across different scenarios in a live environment.
 */

import React, { useState } from 'react';
import { MoodTracker } from '../components/MoodTracker';
import CulturalCrisisAlert from '../components/CulturalCrisisAlert';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import './CulturalCrisisDetectionTestRunner.css';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  culturalContext?: string;
  languageCode?: string;
  testData: any;
  expectedOutcome: string;
}

const testScenarios: TestScenario[] = [
  // Mood Tracker Tests
  {
    id: 'mood-low-value',
    name: 'Low Mood Value Detection',
    description: 'Test crisis detection with terrible mood (value 1)',
    testData: {
      component: 'MoodTracker',
      mood: { id: 'terrible', value: 1, label: 'Terrible' },
      tags: [],
      note: ''
    },
    expectedOutcome: 'Should trigger cultural crisis alert due to low mood value'
  },
  {
    id: 'mood-concerning-tags',
    name: 'Concerning Tags Detection',
    description: 'Test crisis detection with concerning emotional tags',
    testData: {
      component: 'MoodTracker',
      mood: { id: 'okay', value: 3, label: 'Okay' },
      tags: ['hopeless', 'overwhelmed', 'trapped'],
      note: ''
    },
    expectedOutcome: 'Should trigger cultural crisis alert due to concerning tags'
  },
  {
    id: 'mood-crisis-note',
    name: 'Crisis Language in Note',
    description: 'Test crisis detection from concerning note content',
    testData: {
      component: 'MoodTracker',
      mood: { id: 'okay', value: 3, label: 'Okay' },
      tags: [],
      note: 'I want to hurt myself and end it all'
    },
    expectedOutcome: 'Should trigger cultural crisis alert due to crisis language in note'
  },

  // Cultural Context Tests
  {
    id: 'western-direct',
    name: 'Western Direct Communication',
    description: 'Test with direct Western crisis expression',
    culturalContext: 'western-individualistic',
    languageCode: 'en',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "I want to kill myself, I can't take this anymore"
    },
    expectedOutcome: 'Should detect direct crisis expression with appropriate Western interventions'
  },
  {
    id: 'eastern-indirect',
    name: 'Eastern Indirect Communication',
    description: 'Test with indirect Eastern crisis expression',
    culturalContext: 'eastern-collectivistic',
    languageCode: 'zh',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "I feel like I'm a burden to my family, maybe they'd be better off without me"
    },
    expectedOutcome: 'Should detect indirect crisis expression and adjust for cultural context'
  },
  {
    id: 'latin-expressive',
    name: 'Latin American Expressive Style',
    description: 'Test with expressive Latin American crisis communication',
    culturalContext: 'latin-american',
    languageCode: 'es',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "No puedo más, siento que todo está perdido y mi familia no me entiende"
    },
    expectedOutcome: 'Should detect crisis with family-centered intervention approach'
  },
  {
    id: 'middle-eastern-honor',
    name: 'Middle Eastern Honor Context',
    description: 'Test with honor-focused Middle Eastern expression',
    culturalContext: 'middle-eastern',
    languageCode: 'ar',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "I feel like I have brought shame to my family and community"
    },
    expectedOutcome: 'Should detect crisis with cultural sensitivity to honor concepts'
  },

  // Bias Mitigation Tests
  {
    id: 'bias-adjustment',
    name: 'Cultural Bias Adjustment',
    description: 'Test bias mitigation for cultural expressions',
    culturalContext: 'eastern-collectivistic',
    languageCode: 'zh',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "I have failed my parents' expectations and feel worthless"
    },
    expectedOutcome: 'Should adjust risk score considering cultural context of family expectations'
  },

  // Edge Cases
  {
    id: 'mixed-cultural-signals',
    name: 'Mixed Cultural Signals',
    description: 'Test with mixed cultural communication patterns',
    culturalContext: 'multicultural',
    languageCode: 'en',
    testData: {
      component: 'CulturalCrisisAlert',
      analysisText: "I feel disconnected from both my traditional family values and Western society"
    },
    expectedOutcome: 'Should handle multicultural context appropriately'
  }
];

export const CulturalCrisisDetectionTestRunner: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TestScenario | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (scenario: TestScenario) => {
    setCurrentTest(scenario);
    setIsRunning(true);
    
    console.log(`[Test Runner] Starting test: ${scenario.name}`);
    console.log(`[Test Runner] Description: ${scenario.description}`);
    console.log(`[Test Runner] Expected: ${scenario.expectedOutcome}`);
    
    try {
      // Record test start time
      const startTime = Date.now();
      
      // Set up test environment
      const result = {
        scenario: scenario.name,
        startTime,
        status: 'running',
        culturalContext: scenario.culturalContext,
        languageCode: scenario.languageCode,
        testData: scenario.testData
      };
      
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: result
      }));
      
      // Allow component to render and process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = Date.now();
      const finalResult = {
        ...result,
        endTime,
        duration: endTime - startTime,
        status: 'completed'
      };
      
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: finalResult
      }));
      
      console.log(`[Test Runner] Completed test: ${scenario.name} in ${endTime - startTime}ms`);
      
    } catch (error) {
      console.error(`[Test Runner] Test failed: ${scenario.name}`, error);
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: {
          ...prev[scenario.id],
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        }
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    for (const scenario of testScenarios) {
      await runTest(scenario);
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const renderTestComponent = () => {
    if (!currentTest) return null;

    const { testData, culturalContext, languageCode } = currentTest;

    if (testData.component === 'MoodTracker') {
      return (
        <MoodTracker
          onMoodSubmit={(data) => {
            console.log('[Test] MoodTracker submitted:', data);
            setTestResults(prev => ({
              ...prev,
              [currentTest.id]: {
                ...prev[currentTest.id],
                moodSubmitted: data
              }
            }));
          }}
        />
      );
    }

    if (testData.component === 'CulturalCrisisAlert') {
      return (
        <CulturalCrisisAlert
          analysisText={testData.analysisText}
          show={true}
          culturalContext={culturalContext}
          languageCode={languageCode}
          onCrisisDetected={(result) => {
            console.log('[Test] Crisis detected:', result);
            setTestResults(prev => ({
              ...prev,
              [currentTest.id]: {
                ...prev[currentTest.id],
                crisisDetected: result
              }
            }));
          }}
          onCulturalBiasDetected={(adjustments) => {
            console.log('[Test] Cultural bias detected:', adjustments);
            setTestResults(prev => ({
              ...prev,
              [currentTest.id]: {
                ...prev[currentTest.id],
                biasAdjustments: adjustments
              }
            }));
          }}
          onDismiss={() => {
            console.log('[Test] Crisis alert dismissed');
            setCurrentTest(null);
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="cultural-crisis-test-runner">
      <Card>
        <h2>Cultural Crisis Detection Integration Test Runner</h2>
        <p>Manual testing interface for validating cultural crisis detection across different scenarios.</p>
        
        <div className="test-controls">
          <AppButton 
            onClick={runAllTests} 
            disabled={isRunning}
            variant="primary"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </AppButton>
        </div>
      </Card>

      {/* Individual Test Scenarios */}
      <div className="test-scenarios">
        <h3>Test Scenarios</h3>
        {testScenarios.map((scenario) => {
          const result = testResults[scenario.id];
          return (
            <Card key={scenario.id} className="test-scenario">
              <div className="scenario-header">
                <h4>{scenario.name}</h4>
                <div className="scenario-status">
                  {result?.status && (
                    <span className={`status status-${result.status}`}>
                      {result.status}
                    </span>
                  )}
                </div>
              </div>
              
              <p>{scenario.description}</p>
              
              {scenario.culturalContext && (
                <div className="cultural-context">
                  <strong>Cultural Context:</strong> {scenario.culturalContext} ({scenario.languageCode})
                </div>
              )}
              
              <div className="expected-outcome">
                <strong>Expected:</strong> {scenario.expectedOutcome}
              </div>
              
              <div className="test-actions">
                <AppButton 
                  onClick={() => runTest(scenario)}
                  disabled={isRunning}
                  size="sm"
                  variant="secondary"
                >
                  Run Test
                </AppButton>
              </div>
              
              {result && (
                <div className="test-result">
                  <h5>Result:</h5>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Current Test Display */}
      {currentTest && (
        <Card className="current-test">
          <h3>Currently Testing: {currentTest.name}</h3>
          <div className="test-component">
            {renderTestComponent()}
          </div>
        </Card>
      )}

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card className="test-summary">
          <h3>Test Results Summary</h3>
          <div className="results-grid">
            {Object.entries(testResults).map(([testId, result]) => (
              <div key={testId} className={`result-item result-${result.status}`}>
                <strong>{testScenarios.find(s => s.id === testId)?.name}</strong>
                <span>{result.status}</span>
                {result.duration && <span>{result.duration}ms</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CulturalCrisisDetectionTestRunner;
