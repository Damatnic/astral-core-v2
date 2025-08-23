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

import React, { useState } from 'react';
import { useEnhancedCrisisDetection } from '../hooks/useEnhancedCrisisDetection';
import { CrisisDetectionDashboard } from '../components/CrisisDetectionDashboard';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';

// Example: Integrating enhanced crisis detection into a chat component
export const EnhancedChatWithCrisisDetection: React.FC<{
  userId?: string;
  languageCode?: string;
  culturalContext?: string;
}> = ({ userId, languageCode = 'en', culturalContext }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const {
    isAnalyzing,
    lastAnalysis,
    crisisAlert,
    analyzeText,
    dismissAlert,
    currentRiskLevel,
    currentEmotionalState,
    getPersonalizedInterventions
  } = useEnhancedCrisisDetection({
    enableMLFeatures: true,
    languageCode,
    culturalContext,
    userId,
    onCrisisDetected: (analysis) => {
      console.log('🚨 Crisis detected:', analysis);
      // Automatically escalate or show resources
    },
    onRiskEscalation: (riskLevel) => {
      console.log('📈 Risk escalation detected:', riskLevel);
      // Trigger additional monitoring or alerts
    }
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add message to chat
    setChatHistory(prev => [...prev, message]);

    // Analyze message for crisis indicators
    const analysis = await analyzeText(message, { 
      immediate: true, 
      trackHistory: true 
    });

    if (analysis?.hasCrisisIndicators) {
      console.log('Crisis analysis result:', analysis);
      // Handle crisis detection UI updates
    }

    setMessage('');
  };

  return (
    <div className="enhanced-chat-demo">
      <Card>
        <h3>Enhanced Chat with AI Crisis Detection</h3>
        
        {/* Crisis Alert Display */}
        {crisisAlert.show && (
          <div className={`crisis-alert crisis-alert-${crisisAlert.severity}`}>
            <div className="crisis-alert-content">
              <p><strong>🚨 Crisis Alert:</strong> {crisisAlert.severity} risk detected</p>
              <p>Emotional state: {crisisAlert.emotionalState}</p>
              <p>Risk level: {crisisAlert.riskLevel}%</p>
              {crisisAlert.interventions.length > 0 && (
                <div>
                  <strong>Recommended actions:</strong>
                  <ul>
                    {crisisAlert.interventions.slice(0, 2).map((intervention, index) => (
                      <li key={index}>{intervention}</li>
                    ))}
                  </ul>
                </div>
              )}
              <AppButton onClick={dismissAlert} variant="secondary" size="sm">
                Dismiss
              </AppButton>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="chat-interface">
          <div className="chat-history">
            {chatHistory.map((msg, index) => (
              <div key={index} className="chat-message">
                {msg}
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div className="chat-controls">
              <AppButton 
                onClick={handleSendMessage} 
                disabled={isAnalyzing || !message.trim()}
                variant="primary"
              >
                {isAnalyzing ? 'Analyzing...' : 'Send Message'}
              </AppButton>
            </div>
          </div>
        </div>

        {/* Real-time Analysis Display */}
        {lastAnalysis && (
          <div className="analysis-summary">
            <h4>Real-time Analysis</h4>
            <div className="analysis-metrics">
              <div>Risk Level: <strong style={{ color: currentRiskLevel > 60 ? '#dc2626' : '#059669' }}>
                {currentRiskLevel}%
              </strong></div>
              <div>Emotional State: <strong>{currentEmotionalState}</strong></div>
              <div>ML Confidence: <strong>{Math.round((lastAnalysis.mlConfidence || 0) * 100)}%</strong></div>
              <div>Cultural Context: <strong>{lastAnalysis.culturalContext}</strong></div>
            </div>
            
            {getPersonalizedInterventions().length > 0 && (
              <div className="interventions-preview">
                <h5>Recommended Interventions:</h5>
                <ul>
                  {getPersonalizedInterventions().slice(0, 3).map((intervention, index) => (
                    <li key={index}>
                      {intervention.type}: {intervention.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// Example: Crisis Detection Dashboard Integration
export const CrisisMonitoringView: React.FC<{
  userId?: string;
  languageCode?: string;
}> = ({ userId, languageCode = 'en' }) => {
  return (
    <div className="crisis-monitoring-view">
      <h2>Crisis Detection & Monitoring</h2>
      <CrisisDetectionDashboard
        userId={userId}
        languageCode={languageCode}
        onCrisisDetected={(analysis) => {
          console.log('Dashboard crisis detection:', analysis);
          // Handle crisis detection from dashboard
        }}
        onInterventionTriggered={(intervention) => {
          console.log('Intervention triggered:', intervention);
          // Handle intervention activation
        }}
      />
    </div>
  );
};

// Example: Text analysis utility for posts
export const analyzePostForCrisis = async (
  postText: string,
  userId: string,
  languageCode: string = 'en'
) => {
  const { enhancedAICrisisDetectionService } = await import('../services/enhancedAiCrisisDetectionService');
  
  try {
    const analysis = await enhancedAICrisisDetectionService.analyzeCrisisWithML(
      postText,
      { userId, languageCode }
    );

    return {
      hasCrisis: analysis.hasCrisisIndicators,
      riskLevel: analysis.realTimeRisk?.immediateRisk || 0,
      interventionUrgency: analysis.realTimeRisk?.interventionUrgency || 'low',
      emotionalState: analysis.emotionalState,
      recommendations: analysis.realTimeRisk?.recommendedInterventions || [],
      culturallyAdapted: (analysis.biasAdjustments?.length || 0) > 0,
      confidence: analysis.mlConfidence
    };
  } catch (error) {
    console.error('Crisis analysis failed:', error);
    return {
      hasCrisis: false,
      riskLevel: 0,
      interventionUrgency: 'none',
      emotionalState: null,
      recommendations: [],
      culturallyAdapted: false,
      confidence: 0
    };
  }
};

// Example: Helper function for crisis intervention workflow
export const triggerCrisisIntervention = async (
  analysis: any,
  _userContext: {
    userId: string;
    languageCode: string;
    culturalContext?: string;
    preferredContactMethod?: string;
  }
) => {
  const { interventionUrgency } = analysis.realTimeRisk;

  switch (interventionUrgency) {
    case 'immediate':
      // Trigger emergency protocols
      console.log('🚨 EMERGENCY: Immediate intervention required');
      return {
        action: 'emergency',
        message: 'Emergency services contact required',
        contacts: ['911', '988'],
        nextSteps: ['Contact emergency services', 'Alert crisis team', 'Begin safety protocol']
      };

    case 'high':
      // Escalate to crisis counselor
      console.log('⚠️ HIGH RISK: Crisis counselor needed');
      return {
        action: 'escalate',
        message: 'Crisis counselor intervention needed',
        contacts: ['Crisis hotline', 'Platform crisis team'],
        nextSteps: ['Connect with crisis counselor', 'Enhanced monitoring', 'Safety planning']
      };

    case 'medium':
      // Enhanced support and monitoring
      console.log('📊 MEDIUM RISK: Enhanced support recommended');
      return {
        action: 'support',
        message: 'Enhanced support and monitoring recommended',
        contacts: ['Peer supporters', 'Mental health resources'],
        nextSteps: ['Peer support connection', 'Resource sharing', 'Follow-up scheduling']
      };

    case 'low':
      // Provide resources and gentle check-in
      console.log('ℹ️ LOW RISK: Resources and support available');
      return {
        action: 'resources',
        message: 'Resources and support available',
        contacts: ['Peer support', 'Self-help resources'],
        nextSteps: ['Share resources', 'Schedule check-in', 'Monitor engagement']
      };

    default:
      return {
        action: 'none',
        message: 'No immediate intervention required',
        contacts: [],
        nextSteps: ['Continue monitoring']
      };
  }
};

export default {
  EnhancedChatWithCrisisDetection,
  CrisisMonitoringView,
  analyzePostForCrisis,
  triggerCrisisIntervention
};
