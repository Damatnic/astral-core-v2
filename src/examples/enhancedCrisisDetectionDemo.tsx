/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced AI Crisis Detection Integration Demo
 *
 * This file demonstrates how to integrate the enhanced AI crisis detection
 * into various components throughout the AstralCore application.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useEnhancedCrisisDetection } from '../hooks/useEnhancedCrisisDetection';
import { useCrisisStressTesting } from '../hooks/useCrisisStressTesting';

interface CrisisDetectionDemoProps {
  userId?: string;
  enableRealTimeDetection?: boolean;
  enableStressTesting?: boolean;
}

interface CrisisAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  confidence: number;
  suggestedActions: string[];
}

/**
 * Demo 1: Real-time Crisis Detection in Text Input
 */
export const TextInputCrisisDetection: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    analyzeText,
    getCrisisLevel,
    getSuggestedActions,
    isLoading
  } = useEnhancedCrisisDetection({
    enableRealTimeAnalysis: true,
    confidenceThreshold: 0.7,
    enableContextualAnalysis: true
  });

  const handleTextChange = useCallback(async (text: string) => {
    setInputText(text);
    
    if (text.length > 10) { // Only analyze meaningful text
      setIsAnalyzing(true);
      
      try {
        const analysis = await analyzeText(text);
        const crisisLevel = getCrisisLevel(analysis);
        const suggestedActions = getSuggestedActions(analysis);
        
        if (crisisLevel && crisisLevel !== 'low') {
          const alert: CrisisAlert = {
            id: `alert_${Date.now()}`,
            level: crisisLevel,
            message: `${crisisLevel.toUpperCase()} crisis indicators detected`,
            timestamp: Date.now(),
            confidence: analysis.confidence || 0,
            suggestedActions: suggestedActions || []
          };
          
          setCrisisAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
        }
      } catch (error) {
        console.error('Crisis detection failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [analyzeText, getCrisisLevel, getSuggestedActions]);

  const getCrisisLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      default: return 'text-blue-800 bg-blue-100 border-blue-300';
    }
  };

  return (
    <div className="crisis-text-detection p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Real-time Crisis Detection</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type your message (crisis detection will analyze in real-time):
        </label>
        <textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="I'm feeling really overwhelmed today..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
        
        <div className="flex items-center mt-2">
          {(isAnalyzing || isLoading) && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Analyzing for crisis indicators...
            </div>
          )}
          <div className="ml-auto text-sm text-gray-500">
            {inputText.length}/1000
          </div>
        </div>
      </div>

      {crisisAlerts.length > 0 && (
        <div className="crisis-alerts space-y-3">
          <h4 className="font-medium text-gray-800">Crisis Detection Alerts:</h4>
          {crisisAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border rounded-lg ${getCrisisLevelColor(alert.level)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{alert.message}</span>
                <span className="text-xs opacity-75">
                  {Math.round(alert.confidence * 100)}% confidence
                </span>
              </div>
              
              {alert.suggestedActions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Suggested Actions:</p>
                  <ul className="text-sm space-y-1">
                    {alert.suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-xs opacity-75 mt-2">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {inputText.length > 0 && crisisAlerts.length === 0 && !isAnalyzing && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ No crisis indicators detected. Continue expressing yourself safely.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Demo 2: Crisis Detection Stress Testing Dashboard
 */
export const CrisisDetectionStressTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const {
    runStressTest,
    getTestResults,
    isTestRunning
  } = useCrisisStressTesting({
    enableDetailedLogging: true,
    testScenarios: ['high_volume', 'edge_cases', 'performance'],
    maxConcurrentRequests: 10
  });

  const handleRunStressTest = async () => {
    setIsRunning(true);
    setTestProgress(0);
    setTestResults([]);

    try {
      const progressCallback = (progress: number) => {
        setTestProgress(progress);
      };

      await runStressTest({
        duration: 30000, // 30 seconds
        requestsPerSecond: 5,
        progressCallback
      });

      const results = getTestResults();
      setTestResults(results);
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="crisis-stress-test p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Crisis Detection Stress Testing</h3>
      
      <div className="mb-4">
        <button
          onClick={handleRunStressTest}
          disabled={isRunning || isTestRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running Test...' : 'Run Stress Test'}
        </button>
      </div>

      {isRunning && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Test Progress</span>
            <span className="text-sm font-medium">{Math.round(testProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${testProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="test-results">
          <h4 className="font-medium text-gray-800 mb-3">Test Results:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="metric-card p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700">Success Rate</div>
              <div className="text-xl font-bold text-green-800">
                {testResults[0]?.successRate || '0'}%
              </div>
            </div>
            
            <div className="metric-card p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700">Avg Response Time</div>
              <div className="text-xl font-bold text-blue-800">
                {testResults[0]?.averageResponseTime || '0'}ms
              </div>
            </div>
            
            <div className="metric-card p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-700">Total Requests</div>
              <div className="text-xl font-bold text-purple-800">
                {testResults[0]?.totalRequests || '0'}
              </div>
            </div>
          </div>

          <div className="detailed-results">
            <h5 className="font-medium text-gray-700 mb-2">Detailed Results:</h5>
            <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(testResults[0], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Demo 3: Crisis Detection Configuration Panel
 */
export const CrisisDetectionConfig: React.FC = () => {
  const [config, setConfig] = useState({
    confidenceThreshold: 0.7,
    enableRealTime: true,
    enableContextual: true,
    enableMultiModal: false,
    alertSensitivity: 'medium' as 'low' | 'medium' | 'high'
  });

  const [testPhrase, setTestPhrase] = useState('');
  const [detectionResult, setDetectionResult] = useState<any>(null);

  const { analyzeText, updateConfig } = useEnhancedCrisisDetection({
    enableRealTimeAnalysis: config.enableRealTime,
    confidenceThreshold: config.confidenceThreshold,
    enableContextualAnalysis: config.enableContextual
  });

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    updateConfig(newConfig);
  };

  const testDetection = async () => {
    if (!testPhrase.trim()) return;

    try {
      const result = await analyzeText(testPhrase);
      setDetectionResult(result);
    } catch (error) {
      console.error('Detection test failed:', error);
      setDetectionResult({ error: 'Detection failed' });
    }
  };

  return (
    <div className="crisis-config-panel p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Crisis Detection Configuration</h3>
      
      <div className="config-controls space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Threshold: {config.confidenceThreshold}
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.confidenceThreshold}
            onChange={(e) => handleConfigChange('confidenceThreshold', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Sensitive</span>
            <span>Less Sensitive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableRealTime}
                onChange={(e) => handleConfigChange('enableRealTime', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Real-time Analysis</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableContextual}
                onChange={(e) => handleConfigChange('enableContextual', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Contextual Analysis</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableMultiModal}
                onChange={(e) => handleConfigChange('enableMultiModal', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Multi-modal Detection</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Sensitivity
            </label>
            <select
              value={config.alertSensitivity}
              onChange={(e) => handleConfigChange('alertSensitivity', e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="test-section">
        <h4 className="font-medium text-gray-800 mb-2">Test Detection:</h4>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={testPhrase}
            onChange={(e) => setTestPhrase(e.target.value)}
            placeholder="Enter text to test crisis detection..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={testDetection}
            disabled={!testPhrase.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Test
          </button>
        </div>

        {detectionResult && (
          <div className="test-result p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">Detection Result:</h5>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(detectionResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Demo 4: Crisis Detection Integration Examples
 */
export const CrisisDetectionIntegrationExamples: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<'chat' | 'journal' | 'assessment'>('chat');

  const examples = {
    chat: {
      title: 'Chat Integration',
      description: 'Real-time crisis detection in chat messages',
      code: `
// Chat component with crisis detection
const ChatWithCrisisDetection = () => {
  const { analyzeText, getCrisisLevel } = useEnhancedCrisisDetection();
  
  const handleMessage = async (message) => {
    const analysis = await analyzeText(message);
    const crisisLevel = getCrisisLevel(analysis);
    
    if (crisisLevel === 'high' || crisisLevel === 'critical') {
      // Trigger crisis intervention
      triggerCrisisSupport(analysis);
    }
    
    return analysis;
  };
};`
    },
    journal: {
      title: 'Journal Integration',
      description: 'Crisis detection in journal entries',
      code: `
// Journal component with crisis detection
const JournalWithCrisisDetection = () => {
  const { analyzeText, getSuggestedActions } = useEnhancedCrisisDetection();
  
  const handleJournalSave = async (entry) => {
    const analysis = await analyzeText(entry.content);
    
    if (analysis.crisisLevel > 0.7) {
      // Show supportive resources
      showSupportResources(getSuggestedActions(analysis));
    }
    
    await saveJournalEntry(entry, analysis);
  };
};`
    },
    assessment: {
      title: 'Assessment Integration',
      description: 'Crisis detection in mental health assessments',
      code: `
// Assessment component with crisis detection
const AssessmentWithCrisisDetection = () => {
  const { analyzeText, getCrisisLevel } = useEnhancedCrisisDetection();
  
  const handleAssessmentSubmit = async (responses) => {
    const combinedText = responses.join(' ');
    const analysis = await analyzeText(combinedText);
    
    if (getCrisisLevel(analysis) === 'critical') {
      // Immediate intervention required
      await triggerImmediateCrisisResponse(analysis);
    }
  };
};`
    }
  };

  return (
    <div className="crisis-integration-examples p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Integration Examples</h3>
      
      <div className="example-tabs mb-4">
        <div className="flex space-x-2">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => setSelectedExample(key as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExample === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <div className="example-content">
        <div className="mb-3">
          <h4 className="font-medium text-gray-800">{examples[selectedExample].title}</h4>
          <p className="text-sm text-gray-600">{examples[selectedExample].description}</p>
        </div>
        
        <div className="code-example bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{examples[selectedExample].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Demo Component
 */
const EnhancedCrisisDetectionDemo: React.FC<CrisisDetectionDemoProps> = ({
  userId,
  enableRealTimeDetection = true,
  enableStressTesting = false
}) => {
  return (
    <div className="crisis-detection-demo space-y-8 max-w-6xl mx-auto p-6">
      <div className="header text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Enhanced Crisis Detection Demo
        </h1>
        <p className="text-gray-600">
          Advanced AI-powered crisis detection with real-time analysis and intervention
        </p>
      </div>

      <div className="demo-grid space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Real-time Text Analysis</h2>
          <TextInputCrisisDetection />
        </section>

        {enableStressTesting && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Performance Testing</h2>
            <CrisisDetectionStressTest />
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <CrisisDetectionConfig />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
          <CrisisDetectionIntegrationExamples />
        </section>
      </div>

      <div className="footer text-center mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          This demo showcases the enhanced crisis detection capabilities. 
          All detection is performed with privacy-preserving techniques and HIPAA compliance.
        </p>
      </div>
    </div>
  );
};

export default EnhancedCrisisDetectionDemo;
