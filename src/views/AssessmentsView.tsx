import React, { useState } from 'react';
import { ActiveView } from '../types';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { culturalContextService } from '../services/culturalContextService';

export const AssessmentsView: React.FC<{
    setActiveView?: (view: ActiveView) => void;
}> = ({ setActiveView }) => {
    const [showCulturalOption, setShowCulturalOption] = useState(false);
    const [selectedCulturalContext, setSelectedCulturalContext] = useState(
        culturalContextService.getCulturalContext('en').region
    );

    const startAssessment = (type: 'phq-9' | 'gad-7', cultural: boolean = false) => {
        setActiveView?.({
            view: 'assessment-detail',
            params: {
                type,
                ...(cultural && {
                    culturalContext: selectedCulturalContext,
                    cultural: true
                })
            }
        });
    };

    // Style objects for esbuild compatibility
    const culturalCardStyle: React.CSSProperties = { marginBottom: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' };
    const culturalContentStyle: React.CSSProperties = { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' };
    const culturalIconStyle: React.CSSProperties = { fontSize: '1.25rem', marginTop: '0.125rem' };
    const culturalTextContainerStyle: React.CSSProperties = { flex: 1 };
    const culturalTitleStyle: React.CSSProperties = { margin: '0 0 0.5rem 0', color: '#1e40af' };
    const culturalDescriptionStyle: React.CSSProperties = { color: '#1e40af', fontSize: '0.875rem', margin: '0 0 1rem 0' };
    const culturalButtonStyle: React.CSSProperties = { fontSize: '0.875rem' };
    const culturalSelectionCardStyle: React.CSSProperties = { marginBottom: '1rem', backgroundColor: '#f8fafc' };
    const culturalSelectionTitleStyle: React.CSSProperties = { margin: '0 0 1rem 0', fontSize: '1rem' };
    const culturalButtonGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' };
    const culturalContextButtonStyle: React.CSSProperties = { fontSize: '0.875rem', padding: '0.5rem' };
    const culturalSelectionDescriptionStyle: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 };
    const assessmentListStyle: React.CSSProperties = { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' };
    const assessmentTitleStyle: React.CSSProperties = { margin: 0 };
    const assessmentDescriptionStyle: React.CSSProperties = { color: 'var(--text-secondary)' };
    const culturalBadgeContainerStyle: React.CSSProperties = { marginTop: '0.5rem', display: 'flex', gap: '0.5rem' };
    const culturalBadgeStyle: React.CSSProperties = { 
        fontSize: '0.75rem', 
        backgroundColor: '#e0f2fe', 
        color: '#0369a1', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '0.25rem' 
    };
    const assessmentButtonContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
    const culturalAssessmentButtonStyle: React.CSSProperties = { fontSize: '0.875rem' };
    const hrStyle: React.CSSProperties = { margin: '1rem 0', border: 'none', borderBottom: '1px solid var(--border-color)' };

    return (
        <>
            <ViewHeader
                title="Mental Health Assessments"
                subtitle="Private, evidence-based tools to help you understand your well-being."
            />

            {/* Cultural Assessment Option */}
            <Card style={culturalCardStyle}>
                <div style={culturalContentStyle}>
                    <span style={culturalIconStyle}>🌍</span>
                    <div style={culturalTextContainerStyle}>
                        <h3 style={culturalTitleStyle}>
                            Culturally-Adapted Assessments Available
                        </h3>
                        <p style={culturalDescriptionStyle}>
                            Get assessments adapted for your cultural context that respect cultural differences in mental health expression.
                        </p>
                        <AppButton
                            variant="secondary"
                            onClick={() => setShowCulturalOption(!showCulturalOption)}
                            style={culturalButtonStyle}
                        >
                            {showCulturalOption ? 'Hide' : 'Show'} Cultural Options
                        </AppButton>
                    </div>
                </div>
            </Card>

            {/* Cultural Context Selection */}
            {showCulturalOption && (
                <Card style={culturalSelectionCardStyle}>
                    <h3 style={culturalSelectionTitleStyle}>
                        Select Cultural Context
                    </h3>
                    <div style={culturalButtonGridStyle}>
                        {culturalContextService.getCulturalRegions().map(context => (
                            <AppButton
                                key={context}
                                variant={context === selectedCulturalContext ? 'primary' : 'secondary'}
                                onClick={() => setSelectedCulturalContext(context)}
                                style={culturalContextButtonStyle}
                            >
                                {context}
                            </AppButton>
                        ))}
                    </div>
                    <p style={culturalSelectionDescriptionStyle}>
                        Cultural adaptations include language-specific mental health expressions, cultural bias reduction, and culturally-appropriate recommendations.
                    </p>
                </Card>
            )}

            <Card>
                <h2>Available Assessments</h2>
                <p>These are standardized, confidential screening tools. They are not a diagnosis but can be a helpful starting point for self-awareness or a conversation with a professional.</p>
                <div className="assessment-list" style={assessmentListStyle}>
                    <div className="setting-item">
                        <div>
                            <h3 style={assessmentTitleStyle}>PHQ-9 (Depression)</h3>
                            <p style={assessmentDescriptionStyle}>Screens for and measures the severity of depression.</p>
                            {showCulturalOption && (
                                <div style={culturalBadgeContainerStyle}>
                                    <span style={culturalBadgeStyle}>
                                        Cultural Adaptation: {selectedCulturalContext}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={assessmentButtonContainerStyle}>
                            <AppButton onClick={() => startAssessment('phq-9', false)}>
                                Standard Assessment
                            </AppButton>
                            {showCulturalOption && (
                                <AppButton 
                                    variant="secondary" 
                                    onClick={() => startAssessment('phq-9', true)}
                                    style={culturalAssessmentButtonStyle}
                                >
                                    Cultural Assessment ({selectedCulturalContext})
                                </AppButton>
                            )}
                        </div>
                    </div>
                     <hr style={hrStyle}/>
                    <div className="setting-item">
                        <div>
                            <h3 style={assessmentTitleStyle}>GAD-7 (Anxiety)</h3>
                            <p style={assessmentDescriptionStyle}>Screens for and measures the severity of generalized anxiety disorder.</p>
                            {showCulturalOption && (
                                <div style={culturalBadgeContainerStyle}>
                                    <span style={culturalBadgeStyle}>
                                        Cultural Adaptation: {selectedCulturalContext}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={assessmentButtonContainerStyle}>
                            <AppButton onClick={() => startAssessment('gad-7', false)}>
                                Standard Assessment
                            </AppButton>
                            {showCulturalOption && (
                                <AppButton 
                                    variant="secondary" 
                                    onClick={() => startAssessment('gad-7', true)}
                                    style={culturalAssessmentButtonStyle}
                                >
                                    Cultural Assessment ({selectedCulturalContext})
                                </AppButton>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
            <Card>
                 <div className="setting-item">
                     <p>View your past assessment results to track your progress over time.</p>
                     <AppButton variant="secondary" onClick={() => setActiveView?.({ view: 'assessment-history' })}>View History</AppButton>
                </div>
            </Card>
        </>
    );
};

export default AssessmentsView;