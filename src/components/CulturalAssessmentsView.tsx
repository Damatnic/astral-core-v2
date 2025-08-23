/**
 * Enhanced Cultural Assessment View
 * 
 * Culturally-adapted mental health assessments that respect cultural
 * differences in mental health expression and help-seeking behaviors.
 * 
 * Features:
 * - Cultural context detection and adaptation
 * - Language-specific mental health expression patterns
 * - Culturally-appropriate recommendations
 * - Privacy-preserving data collection
 * - Integration with existing assessment infrastructure
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { culturalContextService } from '../services/culturalContextService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ActiveView } from '../types';

interface CulturalAssessmentsViewProps {
  setActiveView: (view: ActiveView) => void;
  // Optional props for customization
  defaultLanguage?: string;
  defaultCulturalContext?: string;
}

export const CulturalAssessmentsView: React.FC<CulturalAssessmentsViewProps> = ({
  setActiveView,
  defaultLanguage = 'en',
  defaultCulturalContext
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [culturalContext, setCulturalContext] = useState<string>(
    defaultCulturalContext || culturalContextService.getCulturalContext(defaultLanguage).region
  );
  const [showCulturalSettings, setShowCulturalSettings] = useState(false);
  const [availableContexts, setAvailableContexts] = useState<string[]>([]);

  // Initialize cultural contexts
  useEffect(() => {
    const contexts = culturalContextService.getCulturalRegions();
    setAvailableContexts(contexts);
  }, []);

  // Cultural context selection handler
  const handleCulturalContextChange = useCallback((newContext: string) => {
    setCulturalContext(newContext);
    setShowCulturalSettings(false);
  }, []);

  // Start cultural assessment
  const startCulturalAssessment = useCallback((type: 'phq-9' | 'gad-7') => {
    setIsLoading(true);
    setActiveView({
      view: 'assessment-detail',
      params: {
        type,
        culturalContext,
        language: defaultLanguage,
        cultural: true
      }
    });
  }, [setActiveView, culturalContext, defaultLanguage]);

  return (
    <>
      <ViewHeader title="Cultural Mental Health Assessments">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <AppButton
            variant="secondary"
            onClick={() => setShowCulturalSettings(!showCulturalSettings)}
            style={{ fontSize: '0.875rem' }}
          >
            🌍 {culturalContext}
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => setActiveView({ view: 'assessment-history' })}
          >
            History
          </AppButton>
        </div>
      </ViewHeader>

      {/* Cultural context selection */}
      {showCulturalSettings && (
        <Card style={{ marginBottom: '1rem', backgroundColor: '#f8fafc' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
            Cultural Context
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
            Select your cultural context to receive culturally-appropriate assessments and recommendations.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {availableContexts.map(context => (
              <AppButton
                key={context}
                variant={context === culturalContext ? 'primary' : 'secondary'}
                onClick={() => handleCulturalContextChange(context)}
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              >
                {context}
              </AppButton>
            ))}
          </div>
        </Card>
      )}

      {/* Cultural assessment notice */}
      <Card style={{ marginBottom: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}>ℹ️</span>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
              Culturally-Adapted Assessments
            </h3>
            <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: 0 }}>
              These assessments are adapted for {culturalContext} cultural context to provide more accurate and culturally-sensitive results. Your privacy is protected through advanced privacy-preserving analytics.
            </p>
          </div>
        </div>
      </Card>

      {/* Assessment options */}
      <Card>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>
          Available Assessments
        </h2>

        {/* PHQ-9 Cultural Assessment */}
        <div className="setting-item" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>
              PHQ-9 (Depression)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              Culturally-adapted depression screening that considers cultural expressions of mental health symptoms.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#e0f2fe', 
                color: '#0369a1', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem' 
              }}>
                Cultural Adapted
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#f0fdf4', 
                color: '#166534', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem' 
              }}>
                Privacy Preserved
              </span>
            </div>
          </div>
          <AppButton
            onClick={() => startCulturalAssessment('phq-9')}
            disabled={isLoading}
          >
            Take Assessment
          </AppButton>
        </div>

        {/* GAD-7 Cultural Assessment */}
        <div className="setting-item" style={{ padding: '1rem 0 0 0' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>
              GAD-7 (Anxiety)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              Culturally-adapted anxiety screening that respects cultural differences in anxiety expression and help-seeking behaviors.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#e0f2fe', 
                color: '#0369a1', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem' 
              }}>
                Cultural Adapted
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#f0fdf4', 
                color: '#166534', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem' 
              }}>
                Privacy Preserved
              </span>
            </div>
          </div>
          <AppButton
            onClick={() => startCulturalAssessment('gad-7')}
            disabled={isLoading}
          >
            Take Assessment
          </AppButton>
        </div>
      </Card>

      {/* Cultural considerations notice */}
      <Card style={{ marginTop: '1rem', backgroundColor: '#fefce8', border: '1px solid #fde047' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', color: '#a16207' }}>
          Important Cultural Considerations
        </h3>
        <ul style={{ color: '#a16207', fontSize: '0.875rem', margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            These assessments are adapted to respect cultural differences in mental health expression.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            These are screening tools and not diagnostic instruments. Professional consultation is recommended.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Cultural recommendations may include family involvement based on your cultural preferences.
          </li>
          <li>
            Your responses are protected using advanced privacy-preserving analytics that maintain cultural sensitivity.
          </li>
        </ul>
      </Card>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Loading cultural assessment...
          </p>
        </div>
      )}
    </>
  );
};

export default CulturalAssessmentsView;
