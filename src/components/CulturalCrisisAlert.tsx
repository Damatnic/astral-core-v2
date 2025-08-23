/**
 * Cultural Crisis Alert Component
 * 
 * Enhanced crisis alert component that integrates cultural awareness and bias mitigation
 * into crisis detection and intervention workflows.
 */

import React, { useState, useEffect } from 'react';
import { CrisisAlert } from './CrisisAlert';
import { useCulturalCrisisDetection } from '../hooks/useCulturalCrisisDetection';
import { useI18n } from '../i18n/hooks';
import './CulturalCrisisAlert.css';

interface CulturalCrisisAlertProps {
  /** Text to analyze for crisis indicators */
  analysisText?: string;
  /** User's language code */
  languageCode?: string;
  /** Cultural context identifier */
  culturalContext?: string;
  /** User ID for personalized detection */
  userId?: string;
  /** Whether to show the alert */
  show?: boolean;
  /** User type - affects recommendations */
  userType?: 'seeker' | 'helper';
  /** Callback when crisis is detected */
  onCrisisDetected?: (result: unknown) => void;
  /** Callback when cultural bias is detected */
  onCulturalBiasDetected?: (adjustments: string[]) => void;
  /** Callback when cultural intervention is recommended */
  onCulturalInterventionRecommended?: (interventions: any) => void;
  /** Emergency call callback */
  onEmergencyCall?: () => void;
  /** Crisis chat callback */
  onCrisisChat?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
}

export const CulturalCrisisAlert: React.FC<CulturalCrisisAlertProps> = ({
  analysisText,
  languageCode = 'en',
  culturalContext,
  userId,
  show = false,
  userType = 'seeker',
  onCrisisDetected,
  onCulturalBiasDetected,
  onCulturalInterventionRecommended,
  onEmergencyCall,
  onCrisisChat,
  onDismiss
}) => {
  const { t, language } = useI18n();
  const [alertData, setAlertData] = useState<{
    show: boolean;
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    message: string;
    actions: string[];
    resources: string[];
    emergencyMode: boolean;
    culturalFactors: string[];
    culturallyAdapted: boolean;
  }>({
    show: false,
    severity: 'none',
    message: '',
    actions: [],
    resources: [],
    emergencyMode: false,
    culturalFactors: [],
    culturallyAdapted: false
  });

  // Use cultural crisis detection hook
  const {
    isAnalyzing,
    lastAnalysis,
    culturalAlert,
    analyzeCulturalCrisis,
    getCulturalInterventions,
    dismissCulturalAlert
  } = useCulturalCrisisDetection({
    autoAnalyze: true,
    languageCode: languageCode || language,
    culturalContext,
    userId,
    onCrisisDetected,
    onCulturalBiasDetected,
    onCulturalInterventionRecommended
  });

  // Auto-analyze text when it changes
  useEffect(() => {
    if (analysisText && analysisText.trim().length > 10) {
      analyzeCulturalCrisis(analysisText, { immediate: true, trackHistory: true });
    }
  }, [analysisText, analyzeCulturalCrisis]);

  // Update alert data based on cultural analysis
  useEffect(() => {
    if (culturalAlert.show || show) {
      const severity = culturalAlert.severity !== 'none' ? culturalAlert.severity : 'medium';
      const culturalFactors = culturalAlert.culturalFactors || [];
      const culturallyAdapted = culturalAlert.culturallyAdapted;

      // Get culturally-appropriate message
      let message = '';
      if (culturallyAdapted && culturalFactors.length > 0) {
        message = t('crisis.cultural_alert_message', {
          factors: culturalFactors.join(', '),
          defaultValue: 'Help is available. Your cultural background has been considered in these recommendations.'
        });
      } else {
        message = t('crisis.standard_alert_message', {
          defaultValue: 'Help is available. You are not alone.'
        });
      }

      // Get cultural interventions (returns string array)
      const interventions = getCulturalInterventions();
      const actions: string[] = [];
      const resources: string[] = [];

      // Add cultural indicators as actions
      if (lastAnalysis?.culturalIndicators) {
        lastAnalysis.culturalIndicators.forEach(indicator => {
          // Handle both test mock structure (type) and actual service structure (indicator)
          const indicatorText = (indicator as any).type || indicator.indicator;
          if (indicatorText) {
            actions.push(indicatorText);
          }
        });
      }

      // Add cultural interventions as actions
      if (interventions && interventions.length > 0) {
        actions.push(...interventions);
      }

      // Add language-specific resources
      if (languageCode === 'es') {
        resources.push(t('crisis.resource.spanish_lifeline', { defaultValue: 'Línea Nacional de Prevención del Suicidio: 988' }));
      } else if (languageCode === 'zh') {
        resources.push(t('crisis.resource.chinese_support', { defaultValue: 'Chinese Mental Health Helpline: 1-844-292-4357' }));
      } else if (languageCode === 'ar') {
        resources.push(t('crisis.resource.arabic_support', { defaultValue: 'Arabic Crisis Support: 988 (Arabic available)' }));
      }

      // Always include general resources
      resources.push(
        t('crisis.resource.national_lifeline', { defaultValue: '988 Suicide & Crisis Lifeline' }),
        t('crisis.resource.crisis_text', { defaultValue: 'Crisis Text Line: Text HOME to 741741' })
      );

      setAlertData({
        show: true,
        severity,
        message,
        actions: actions.slice(0, 5), // Limit to 5 actions
        resources: resources.slice(0, 4), // Limit to 4 resources
        emergencyMode: severity === 'critical' || culturalAlert.emergencyMode,
        culturalFactors,
        culturallyAdapted
      });
    } else {
      setAlertData(prev => ({ ...prev, show: false }));
    }
  }, [culturalAlert, show, t, languageCode, getCulturalInterventions]);

  const handleDismiss = () => {
    dismissCulturalAlert();
    setAlertData(prev => ({ ...prev, show: false }));
    onDismiss?.();
  };

  const handleEmergencyCall = () => {
    // Track cultural context in emergency call
    if (lastAnalysis && lastAnalysis.culturalContext) {
      console.log('[Cultural Crisis Alert] Emergency call with cultural context:', lastAnalysis.culturalContext);
    }
    onEmergencyCall?.();
  };

  const handleCrisisChat = () => {
    // Include cultural context in crisis chat
    if (lastAnalysis && lastAnalysis.culturalContext) {
      console.log('[Cultural Crisis Alert] Crisis chat with cultural context:', lastAnalysis.culturalContext);
    }
    onCrisisChat?.();
  };

  // Show loading state while analyzing
  if (isAnalyzing && analysisText) {
    return (
      <output className="cultural-crisis-alert-loading" aria-live="polite">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <span>{t('crisis.analyzing_with_cultural_context', { 
            defaultValue: 'Analyzing with cultural context...' 
          })}</span>
        </div>
      </output>
    );
  }

  // Render the enhanced crisis alert
  return (
    <>
      <CrisisAlert
        show={alertData.show}
        severity={alertData.severity}
        message={alertData.message}
        actions={alertData.actions}
        resources={alertData.resources}
        emergencyMode={alertData.emergencyMode}
        onDismiss={handleDismiss}
        onEmergencyCall={handleEmergencyCall}
        onCrisisChat={handleCrisisChat}
        userType={userType}
      />
      
      {/* Cultural bias indicator */}
      {alertData.culturallyAdapted && alertData.culturalFactors.length > 0 && (
        <aside className="cultural-context-indicator" aria-label="Cultural context information">
          <div className="cultural-indicator-content">
            <span className="cultural-indicator-icon">🌍</span>
            <span className="cultural-indicator-text">
              {t('crisis.cultural_awareness_active', {
                defaultValue: 'Cultural awareness active'
              })}
            </span>
            <div className="cultural-factors-list">
              {alertData.culturalFactors.map((factor, index) => (
                <span key={`cultural-factor-${factor}-${index}`} className="cultural-factor-tag">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default CulturalCrisisAlert;
