import React, { useEffect } from 'react';
import { ActiveView } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { useAssessmentStore } from '../stores/assessmentStore';
import { getPhq9Result, getGad7Result } from '../utils/assessmentUtils';
import { formatTimeAgo } from '../utils/formatTimeAgo';


export const AssessmentHistoryView: React.FC<{
    setActiveView: (view: ActiveView) => void;
}> = ({ setActiveView }) => {
    const { history, isLoading, fetchHistory } = useAssessmentStore();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const getResultDetails = (assessment: typeof history[0]) => {
        if (assessment.type === 'phq-9') {
            return { name: 'PHQ-9 (Depression)', result: getPhq9Result(assessment.score) };
        }
        if (assessment.type === 'gad-7') {
            return { name: 'GAD-7 (Anxiety)', result: getGad7Result(assessment.score) };
        }
        return { name: 'Unknown Assessment', result: { severity: 'N/A' } };
    };

    return (
        <>
            <ViewHeader title="Assessment History">
                 <AppButton variant="secondary" onClick={() => setActiveView({ view: 'assessments' })}>Back to Assessments</AppButton>
            </ViewHeader>
            <Card>
                {isLoading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
                ) : history.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {history.map(assessment => {
                            const { name, result } = getResultDetails(assessment);
                            return (
                                <li key={assessment.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                    <div className="setting-item">
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem' }}>{name} Result</h3>
                                            <small>Taken {formatTimeAgo(assessment.timestamp)}</small>
                                        </div>
                                         <div style={{textAlign: 'right'}}>
                                            <p>Score: <strong>{assessment.score}</strong></p>
                                            <p>Severity: <strong>{result.severity}</strong></p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="empty-state">
                        <h2>No History Found</h2>
                        <p>Your completed assessment results will appear here.</p>
                        <AppButton onClick={() => setActiveView({ view: 'assessments' })}>Take an Assessment</AppButton>
                    </div>
                )}
            </Card>
        </>
    );
};

export default AssessmentHistoryView;