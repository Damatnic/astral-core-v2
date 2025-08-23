/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Crisis Detection Dashboard Component
 * 
 * Real-time crisis monitoring dashboard with ML-powered insights,
 * emotional state tracking, and intervention recommendations.
 */

import React, { useState } from 'react';
import { useEnhancedCrisisDetection } from '../hooks/useEnhancedCrisisDetection';
import { AppButton } from './AppButton';
import { Card } from './Card';
import { Modal } from './Modal';
import { useI18n } from '../i18n/hooks';

interface CrisisDetectionDashboardProps {
  userId?: string;
  languageCode?: string;
  culturalContext?: string;
  onCrisisDetected?: (analysis: any) => void;
  onInterventionTriggered?: (intervention: string) => void;
}

export const CrisisDetectionDashboard: React.FC<CrisisDetectionDashboardProps> = ({
  userId,
  languageCode = 'en',
  culturalContext,
  onCrisisDetected,
  onInterventionTriggered
}) => {
  const { t, tCrisis } = useI18n();
  const [testText, setTestText] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Helper function to get emotion from valence/arousal
  const getEmotionFromState = (emotion: any) => {
    if (emotion.primaryEmotion) return emotion.primaryEmotion;
    // Fallback: derive from valence
    if (emotion.valence > 0.6) return 'happy';
    if (emotion.valence < -0.6) return 'sad';
    if (emotion.arousal > 0.6) return 'anxious';
    return 'neutral';
  };

  const {
    isAnalyzing,
    lastAnalysis,
    emotionalHistory,
    modelMetrics,
    crisisAlert,
    analyzeText,
    dismissAlert,
    clearHistory,
    getEmotionalTrend,
    getRiskPrediction,
    getPersonalizedInterventions,
    currentRiskLevel,
    currentEmotionalState,
    interventionUrgency,
    mlConfidence
  } = useEnhancedCrisisDetection({
    enableMLFeatures: true,
    languageCode,
    culturalContext,
    userId,
    onCrisisDetected,
    onInterventionRecommended: (interventions) => {
      if (interventions.length > 0 && onInterventionTriggered) {
        onInterventionTriggered(interventions[0]);
      }
    }
  });

  const emotionalTrend = getEmotionalTrend();
  const riskPrediction = getRiskPrediction();
  const personalizedInterventions = getPersonalizedInterventions();

  // Handle test text analysis
  const handleTestAnalysis = async () => {
    if (testText.trim()) {
      await analyzeText(testText, { immediate: true, trackHistory: true });
    }
  };

  // Get risk level color
  const getRiskColor = (risk: number): string => {
    if (risk >= 80) return '#dc2626'; // red-600
    if (risk >= 60) return '#ea580c'; // orange-600
    if (risk >= 40) return '#d97706'; // amber-600
    if (risk >= 20) return '#eab308'; // yellow-500
    return '#059669'; // emerald-600
  };

  // Get emotional state emoji
  const getEmotionalEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      anger: '😠', fear: '😨', sadness: '😢', joy: '😊',
      disgust: '🤢', surprise: '😲', contempt: '😤', neutral: '😐'
    };
    return emojiMap[emotion] || '😐';
  };

  return (
    <div className="crisis-detection-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          {tCrisis('crisis_detection_dashboard')}
        </h2>
        <div className="dashboard-controls">
          <AppButton
            onClick={() => setIsTestMode(!isTestMode)}
            variant={isTestMode ? 'secondary' : 'primary'}
            size="sm"
          >
            {isTestMode ? t('common.disable_test_mode') : t('common.enable_test_mode')}
          </AppButton>
          <AppButton
            onClick={clearHistory}
            variant="secondary"
            size="sm"
          >
            {t('common.clear_history')}
          </AppButton>
        </div>
      </div>

      {/* Crisis Alert Banner */}
      {crisisAlert.show && (
        <div className={`crisis-alert crisis-alert-${crisisAlert.severity}`}>
          <div className="crisis-alert-content">
            <div className="crisis-alert-header">
              <span className="crisis-alert-icon">⚠️</span>
              <h3>{tCrisis(`alert.${crisisAlert.severity}_risk_detected`)}</h3>
              <AppButton
                onClick={dismissAlert}
                variant="ghost"
                size="sm"
              >
                ✕
              </AppButton>
            </div>
            <p className="crisis-alert-description">
              {tCrisis('alert.risk_level_description', { level: crisisAlert.riskLevel })}
            </p>
            {crisisAlert.interventions.length > 0 && (
              <div className="crisis-alert-interventions">
                <strong>{tCrisis('alert.recommended_actions')}:</strong>
                <ul>
                  {crisisAlert.interventions.slice(0, 3).map((intervention, index) => (
                    <li key={index}>{intervention}</li>
                  ))}
                </ul>
              </div>
            )}
            {crisisAlert.emergencyMode && (
              <div className="crisis-alert-emergency">
                <AppButton
                  onClick={() => window.open('tel:988', '_self')}
                  variant="danger"
                  size="lg"
                >
                  🚨 {tCrisis('emergency.call_crisis_line')}
                </AppButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Mode */}
      {isTestMode && (
        <Card className="test-mode-card">
          <h3>{t('common.test_mode')}</h3>
          <div className="test-input-group">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder={tCrisis('test.enter_text_to_analyze')}
              rows={4}
              className="test-textarea"
            />
            <AppButton
              onClick={handleTestAnalysis}
              disabled={isAnalyzing || !testText.trim()}
              variant="primary"
            >
              {isAnalyzing ? t('common.analyzing') : tCrisis('test.analyze_text')}
            </AppButton>
          </div>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Current Status */}
        <Card className="status-card">
          <h3>{tCrisis('dashboard.current_status')}</h3>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-label">{tCrisis('dashboard.risk_level')}:</span>
              <div className="risk-indicator">
                <div 
                  className="risk-bar"
                  style={{ 
                    width: `${currentRiskLevel}%`,
                    backgroundColor: getRiskColor(currentRiskLevel)
                  }}
                />
                <span className="risk-value">{currentRiskLevel}%</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">{tCrisis('dashboard.emotional_state')}:</span>
              <span className="emotional-state">
                {getEmotionalEmoji(currentEmotionalState)} {currentEmotionalState}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{tCrisis('dashboard.urgency')}:</span>
              <span className={`urgency-level urgency-${interventionUrgency}`}>
                {tCrisis(`urgency.${interventionUrgency}`)}
              </span>
            </div>
          </div>
        </Card>

        {/* Emotional Trend */}
        <Card className="trend-card">
          <h3>{tCrisis('dashboard.emotional_trend')}</h3>
          {emotionalHistory.length > 0 ? (
            <div className="trend-content">
              <div className="trend-summary">
                <span className="trend-direction">
                  {emotionalTrend.trend === 'improving' ? '📈' : 
                   emotionalTrend.trend === 'deteriorating' ? '📉' : '➡️'}
                </span>
                <span>{tCrisis(`trend.${emotionalTrend.trend}`)}</span>
                <span className="trend-confidence">
                  ({Math.round(emotionalTrend.confidence * 100)}% {t('common.confidence')})
                </span>
              </div>
              <div className="emotion-history">
                {emotionalHistory.slice(-5).map((emotion, index) => (
                  <span key={index} className="emotion-point">
                    {getEmotionalEmoji(getEmotionFromState(emotion))}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-data">{tCrisis('dashboard.no_emotional_data')}</p>
          )}
        </Card>

        {/* Risk Prediction */}
        <Card className="prediction-card">
          <h3>{tCrisis('dashboard.risk_prediction')}</h3>
          {riskPrediction.confidence > 0 ? (
            <div className="prediction-content">
              <div className="prediction-value">
                <span className="prediction-label">{tCrisis('dashboard.predicted_24h_risk')}:</span>
                <span 
                  className="prediction-risk"
                  style={{ color: getRiskColor(riskPrediction.predictedRisk) }}
                >
                  {Math.round(riskPrediction.predictedRisk)}%
                </span>
              </div>
              <div className="prediction-trend">
                <span className="trend-icon">
                  {riskPrediction.trend === 'increasing' ? '⬆️' :
                   riskPrediction.trend === 'decreasing' ? '⬇️' : '➡️'}
                </span>
                <span>{tCrisis(`trend.${riskPrediction.trend}`)}</span>
              </div>
              <div className="prediction-confidence">
                {t('common.confidence')}: {Math.round(riskPrediction.confidence * 100)}%
              </div>
            </div>
          ) : (
            <p className="no-data">{tCrisis('dashboard.insufficient_prediction_data')}</p>
          )}
        </Card>

        {/* Model Performance */}
        <Card className="metrics-card">
          <h3>{tCrisis('dashboard.model_performance')}</h3>
          <div className="metrics-content">
            <div className="metric-item">
              <span className="metric-label">{tCrisis('metrics.accuracy')}:</span>
              <span className="metric-value">{Math.round(modelMetrics.accuracy * 100)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">{tCrisis('metrics.confidence')}:</span>
              <span className="metric-value">{Math.round(mlConfidence * 100)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">{tCrisis('metrics.total_analyses')}:</span>
              <span className="metric-value">{modelMetrics.totalAnalyses}</span>
            </div>
          </div>
        </Card>

        {/* Interventions */}
        <Card className="interventions-card">
          <h3>{tCrisis('dashboard.recommended_interventions')}</h3>
          {personalizedInterventions.length > 0 ? (
            <div className="interventions-list">
              {personalizedInterventions.slice(0, 3).map((intervention, index) => (
                <div key={index} className="intervention-item">
                  <div className="intervention-header">
                    <span className="intervention-type">
                      {intervention.type === 'immediate' ? '🚨' :
                       intervention.type === 'urgent' ? '⚡' :
                       intervention.type === 'supportive' ? '🤝' :
                       intervention.type === 'monitoring' ? '�️' : '�'}
                    </span>
                    <span className="intervention-priority">
                      {tCrisis('dashboard.priority')}: {intervention.priority}
                    </span>
                  </div>
                  <p className="intervention-description">{intervention.description}</p>
                  <div className="intervention-meta">
                    <span className="intervention-timeframe">{intervention.timeframe}</span>
                    <span className="intervention-effectiveness">
                      {Math.round((intervention.priority / 10) * 100)}% {tCrisis('dashboard.effective')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{tCrisis('dashboard.no_interventions_needed')}</p>
          )}
        </Card>
      </div>

      {/* Analysis Details Button */}
      {lastAnalysis && (
        <div className="dashboard-footer">
          <AppButton
            onClick={() => setShowDetailsModal(true)}
            variant="secondary"
          >
            {tCrisis('dashboard.view_detailed_analysis')}
          </AppButton>
        </div>
      )}

      {/* Detailed Analysis Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={tCrisis('dashboard.detailed_analysis')}
        size="lg"
      >
        {lastAnalysis && (
          <div className="analysis-details">
            <div className="analysis-section">
              <h4>{tCrisis('analysis.psychological_assessment')}</h4>
              <div className="assessment-scores">
                <div className="score-item">
                  <span>{tCrisis('assessment.depression')}:</span>
                  <span>{Math.round((lastAnalysis.psychologicalAssessment?.depressionIndicators || 0) * 100)}%</span>
                </div>
                <div className="score-item">
                  <span>{tCrisis('assessment.anxiety')}:</span>
                  <span>{Math.round((lastAnalysis.psychologicalAssessment?.anxietyIndicators || 0) * 100)}%</span>
                </div>
                <div className="score-item">
                  <span>{tCrisis('assessment.suicidal_ideation')}:</span>
                  <span>{Math.round((lastAnalysis.psychologicalAssessment?.suicidalIdeation || 0) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <h4>{tCrisis('analysis.behavioral_patterns')}</h4>
              <div className="pattern-details">
                <p><strong>{tCrisis('patterns.communication_style')}:</strong> {lastAnalysis.behavioralPattern?.communicationStyle || 'Not available'}</p>
                <p><strong>{tCrisis('patterns.help_seeking')}:</strong> {lastAnalysis.behavioralPattern?.helpSeekingBehavior || 'Not available'}</p>
                {(lastAnalysis.behavioralPattern?.escalationTriggers?.length || 0) > 0 && (
                  <p><strong>{tCrisis('patterns.triggers')}:</strong> {lastAnalysis.behavioralPattern?.escalationTriggers?.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="analysis-section">
              <h4>{tCrisis('analysis.bias_adjustments')}</h4>
              {(lastAnalysis.biasAdjustments?.length || 0) > 0 ? (
                <ul>
                  {lastAnalysis.biasAdjustments?.map((adjustment, index) => (
                    <li key={index}>{typeof adjustment === 'string' ? adjustment : adjustment.description || adjustment.type}</li>
                  ))}
                </ul>
              ) : (
                <p>{tCrisis('analysis.no_bias_adjustments')}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CrisisDetectionDashboard;
