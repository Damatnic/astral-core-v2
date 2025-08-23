/**
 * Privacy-Preserving Analytics Integration Examples
 * 
 * Demonstrates how to integrate the privacy-preserving analytics system
 * with existing crisis intervention components while maintaining HIPAA compliance.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrivacyAnalytics } from '../hooks/usePrivacyAnalytics';
import { PrivacyAnalyticsDashboard } from '../components/PrivacyAnalyticsDashboard';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';

// Example 1: Enhanced AI Chat with Analytics Integration
export const EnhancedAIChatWithAnalytics: React.FC<{
  sessionId: string;
  userToken: string;
  language: string;
  onSessionEnd: () => void;
}> = ({ sessionId, userToken, language, onSessionEnd }) => {
  const { t } = useTranslation();
  const { recordIntervention } = usePrivacyAnalytics();
  const [sessionStart] = useState(Date.now());
  const [initialRiskLevel, setInitialRiskLevel] = useState<number | null>(null);
  const [finalRiskLevel, setFinalRiskLevel] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<number | null>(null);

  // Record intervention outcome when session ends
  const handleSessionEnd = async () => {
    if (initialRiskLevel !== null && finalRiskLevel !== null) {
      const sessionDuration = (Date.now() - sessionStart) / (1000 * 60); // minutes
      
      await recordIntervention({
        sessionId,
        userToken,
        language,
        interventionType: 'ai-chat',
        initialRiskLevel,
        finalRiskLevel,
        sessionDuration,
        feedback: feedback || undefined
      });
    }
    
    onSessionEnd();
  };

  return (
    <div className="enhanced-ai-chat">
      <div className="chat-interface">
        {/* AI Chat Interface would go here */}
        <div className="chat-placeholder">
          <p>{t('aiChat.interface.placeholder')}</p>
        </div>
      </div>
      
      <div className="risk-assessment">
        <h4>{t('analytics.riskAssessment.title')}</h4>
        <div className="risk-inputs">
          <label>
            {t('analytics.riskAssessment.initial')}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={initialRiskLevel || 0}
              onChange={(e) => setInitialRiskLevel(parseFloat(e.target.value))}
            />
            <span>{initialRiskLevel?.toFixed(1) || '0.0'}</span>
          </label>
          
          <label>
            {t('analytics.riskAssessment.final')}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={finalRiskLevel || 0}
              onChange={(e) => setFinalRiskLevel(parseFloat(e.target.value))}
            />
            <span>{finalRiskLevel?.toFixed(1) || '0.0'}</span>
          </label>
        </div>
      </div>
      
      <div className="feedback-section">
        <h4>{t('analytics.feedback.title')}</h4>
        <div className="feedback-buttons">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              className={`feedback-button ${feedback === rating ? 'selected' : ''}`}
              onClick={() => setFeedback(rating)}
            >
              {rating}⭐
            </button>
          ))}
        </div>
      </div>
      
      <div className="session-actions">
        <AppButton 
          onClick={handleSessionEnd}
          variant="primary"
          disabled={initialRiskLevel === null || finalRiskLevel === null}
        >
          {t('aiChat.actions.endSession')}
        </AppButton>
      </div>
    </div>
  );
};

// Example 2: Crisis Resources with Follow-up Tracking
export const CrisisResourcesWithTracking: React.FC<{
  userToken: string;
  sessionId: string;
  language: string;
}> = ({ userToken, sessionId, language }) => {
  const { t } = useTranslation();
  const { recordIntervention, recordFollowUp } = usePrivacyAnalytics();
  const [hasViewedResources, setHasViewedResources] = useState(false);

  // Record resource access
  const handleResourceAccess = async () => {
    setHasViewedResources(true);
    
    // Record intervention with estimated risk levels
    await recordIntervention({
      sessionId,
      userToken,
      language,
      interventionType: 'crisis-resources',
      initialRiskLevel: 0.7, // Assumed high risk for crisis resources
      finalRiskLevel: 0.5, // Assumed moderate reduction from resources
      sessionDuration: 5, // Estimated average time spent
    });
  };

  // Record follow-up engagement
  const handleFollowUpEngagement = async () => {
    await recordFollowUp(userToken, sessionId);
  };

  useEffect(() => {
    if (hasViewedResources) {
      // Set up follow-up tracking after 24 hours
      const followUpTimer = setTimeout(() => {
        handleFollowUpEngagement();
      }, 24 * 60 * 60 * 1000);

      return () => clearTimeout(followUpTimer);
    }
  }, [hasViewedResources]);

  return (
    <div className="crisis-resources-with-tracking">
      <div className="crisis-resources">
        <h3>{t('crisis.resources.title')}</h3>
        {/* Crisis resources content would go here */}
        <div className="resources-placeholder">
          <p>{t('crisis.resources.content')}</p>
        </div>
      </div>
      
      <div className="resource-actions">
        <AppButton 
          onClick={handleResourceAccess}
          variant="primary"
        >
          {t('crisis.resources.viewResources')}
        </AppButton>
      </div>
      
      {hasViewedResources && (
        <div className="follow-up-notice">
          <p>{t('analytics.followUp.notice')}</p>
        </div>
      )}
    </div>
  );
};

// Example 3: Helper Dashboard with Analytics
export const HelperDashboardWithAnalytics: React.FC<{
  helperRole: 'Helper' | 'Moderator' | 'Admin';
}> = ({ helperRole }) => {
  const { t } = useTranslation();
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="helper-dashboard-with-analytics">
      <div className="dashboard-header">
        <h2>{t('helper.dashboard.title')}</h2>
        <AppButton
          onClick={() => setShowAnalytics(!showAnalytics)}
          variant="secondary"
        >
          {showAnalytics ? t('analytics.actions.hide') : t('analytics.actions.show')}
        </AppButton>
      </div>
      
      {showAnalytics && (
        <Card className="analytics-section">
          <PrivacyAnalyticsDashboard userRole={helperRole} />
        </Card>
      )}
      
      <div className="dashboard-content">
        {/* Regular helper dashboard content would go here */}
        <div className="dashboard-placeholder">
          <p>{t('helper.dashboard.content')}</p>
        </div>
      </div>
    </div>
  );
};

// Example 4: Safety Plan with Outcome Tracking
export const SafetyPlanWithOutcomeTracking: React.FC<{
  userToken: string;
  language: string;
}> = ({ userToken, language }) => {
  const { t } = useTranslation();
  const { recordIntervention } = usePrivacyAnalytics();
  const [sessionId] = useState(`safety-plan-${Date.now()}`);
  const [planCompleted, setPlanCompleted] = useState(false);
  const [sessionStart] = useState(Date.now());

  // Record safety plan completion
  const handlePlanCompletion = async () => {
    setPlanCompleted(true);
    
    const sessionDuration = (Date.now() - sessionStart) / (1000 * 60); // minutes
    
    await recordIntervention({
      sessionId,
      userToken,
      language,
      interventionType: 'safety-plan',
      initialRiskLevel: 0.8, // High risk assumed for safety plan creation
      finalRiskLevel: 0.4, // Significant reduction expected from safety plan
      sessionDuration,
    });
  };

  return (
    <div className="safety-plan-with-tracking">
      <div className="safety-plan-interface">
        <h3>{t('safetyPlan.title')}</h3>
        {/* Safety plan interface would go here */}
        <div className="safety-plan-placeholder">
          <p>{t('safetyPlan.content')}</p>
        </div>
      </div>
      
      <div className="plan-actions">
        <AppButton
          onClick={handlePlanCompletion}
          variant="primary"
          disabled={planCompleted}
        >
          {planCompleted ? t('safetyPlan.completed') : t('safetyPlan.complete')}
        </AppButton>
      </div>
      
      {planCompleted && (
        <div className="completion-notice">
          <p>{t('analytics.outcome.recorded')}</p>
        </div>
      )}
    </div>
  );
};

// Example 5: Admin Analytics Dashboard
export const AdminAnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { 
    privacyBudget, 
    generateReport, 
    exportData, 
    resetPrivacyBudget 
  } = usePrivacyAnalytics();
  
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    const report = await generateReport();
    setReportData(report);
  };

  const handleExportData = async () => {
    await exportData();
  };

  return (
    <div className="admin-analytics-dashboard">
      <div className="admin-header">
        <h2>{t('admin.analytics.title')}</h2>
        <div className="admin-actions">
          <AppButton onClick={handleGenerateReport} variant="primary">
            {t('analytics.actions.generateReport')}
          </AppButton>
          <AppButton onClick={handleExportData} variant="secondary">
            {t('analytics.actions.export')}
          </AppButton>
          <AppButton 
            onClick={resetPrivacyBudget}
            variant="secondary"
            disabled={privacyBudget.used === 0}
          >
            {t('analytics.actions.resetBudget')}
          </AppButton>
        </div>
      </div>
      
      <PrivacyAnalyticsDashboard userRole="Admin" />
      
      {reportData && (
        <Card className="generated-report">
          <h3>{t('analytics.report.generated')}</h3>
          <div className="report-content">
            <h4>{t('analytics.report.summary')}</h4>
            <p>{reportData.summary}</p>
            
            <h4>{t('analytics.report.recommendations')}</h4>
            <ul>
              {reportData.recommendations.map((rec: string, index: number) => (
                <li key={`admin-rec-${rec.slice(0, 15).replace(/\s+/g, '-')}-${index}`}>{rec}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

// Utility function for manual intervention recording
export const useManualInterventionRecording = () => {
  const { recordIntervention } = usePrivacyAnalytics();
  
  const recordManualIntervention = async (
    userToken: string,
    language: string,
    interventionType: 'ai-chat' | 'human-helper' | 'peer-support' | 'crisis-resources' | 'safety-plan',
    initialRisk: number,
    finalRisk: number,
    durationMinutes: number,
    feedback?: number
  ) => {
    const sessionId = `manual-${interventionType}-${Date.now()}`;
    
    await recordIntervention({
      sessionId,
      userToken,
      language,
      interventionType,
      initialRiskLevel: initialRisk,
      finalRiskLevel: finalRisk,
      sessionDuration: durationMinutes,
      feedback
    });
  };
  
  return { recordManualIntervention };
};
