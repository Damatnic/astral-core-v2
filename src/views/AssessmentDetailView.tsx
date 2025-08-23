import React, { useState, useMemo } from 'react';
import { ActiveView } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { useAssessmentStore } from '../stores/assessmentStore';
import { useNotification } from '../contexts/NotificationContext';
import { phq9Questions, getPhq9Result, gad7Questions, getGad7Result } from '../utils/assessmentUtils';
import { isError } from '../types/common';

interface AssessmentDetailViewProps {
    type: 'phq-9' | 'gad-7';
    setActiveView: (view: ActiveView) => void;
}

export const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({ type, setActiveView }) => {
    const { submitPhq9Result, submitGad7Result } = useAssessmentStore();
    const { addToast } = useNotification();
    
    const assessmentDetails = useMemo(() => {
        if (type === 'phq-9') {
            return {
                title: 'PHQ-9 Depression Assessment',
                questions: phq9Questions,
                getResult: getPhq9Result,
                submit: submitPhq9Result,
                maxScore: 27,
            };
        } else {
             return {
                title: 'GAD-7 Anxiety Assessment',
                questions: gad7Questions,
                getResult: getGad7Result,
                submit: submitGad7Result,
                maxScore: 21,
            };
        }
    }, [type, submitPhq9Result, submitGad7Result]);
    
    const [answers, setAnswers] = useState<(number | null)[]>(Array(assessmentDetails.questions.length).fill(null));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; severity: string; recommendation: string} | null>(null);

    const handleAnswerChange = (questionIndex: number, value: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.some(a => a === null)) {
            addToast('Please answer all questions.', 'error');
            return;
        }
        setIsSubmitting(true);
        const finalAnswers = answers as number[];
        const score = finalAnswers.reduce((sum, val) => sum + val, 0);

        try {
            await assessmentDetails.submit(score, finalAnswers);
            const resultData = assessmentDetails.getResult(score);
            setResult(resultData);
        } catch (error) {
            const errorMessage = isError(error) ? error.message : 'Failed to submit assessment.';
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (result) {
        const indicatorPosition = (result.score / assessmentDetails.maxScore) * 100;
        return (
             <>
                <ViewHeader title={`${assessmentDetails.title} Result`} />
                <Card>
                    <div className="assessment-result-card" style={{textAlign: 'center'}}>
                        <h2>Your Score: {result.score}</h2>
                        <h3 style={{color: 'var(--text-secondary)'}}>Severity Level: {result.severity}</h3>
                        
                        <div className="severity-meter" title={`Your score: ${result.score} / ${assessmentDetails.maxScore}`}>
                           <div className="severity-meter-indicator" style={{ left: `${indicatorPosition}%` }}></div>
                        </div>
                        <div className="severity-labels">
                            <span>Minimal</span>
                            <span>Mild</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                        </div>
                        
                        <p style={{marginTop: '2rem', fontSize: '1.1rem'}}>{result.recommendation}</p>
                        <hr style={{margin: '1.5rem 0', border: 'none', borderBottom: '1px solid var(--border-color)'}}/>
                        <p style={{color: 'var(--text-secondary)'}}>This is a screening tool, not a diagnosis. We recommend discussing these results with a healthcare professional.</p>
                        <div className="form-actions" style={{justifyContent: 'space-between', marginTop: '2rem'}}>
                            <AppButton variant="secondary" onClick={() => setActiveView({ view: 'assessment-history' })}>View History</AppButton>
                            <AppButton variant="primary" onClick={() => setActiveView({ view: 'assessments' })}>Done</AppButton>
                        </div>
                    </div>
                </Card>
            </>
        );
    }
    
    return (
        <>
            <ViewHeader title={assessmentDetails.title} />
            <Card>
                <p>Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
                {assessmentDetails.questions.map((q, index) => (
                    <div key={q.id} className="form-group assessment-question">
                        <label>{index + 1}. {q.text}</label>
                        <div className="assessment-options">
                            {q.options.map(option => (
                                <div key={option.value} className="radio-group">
                                    <input
                                        type="radio"
                                        id={`q${index}-${option.value}`}
                                        name={`question-${index}`}
                                        value={option.value}
                                        checked={answers[index] === option.value}
                                        onChange={() => handleAnswerChange(index, option.value)}
                                    />
                                    <label htmlFor={`q${index}-${option.value}`}>{option.text}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                 <div className="form-actions">
                    <AppButton variant="secondary" onClick={() => setActiveView({ view: 'assessments' })}>Cancel</AppButton>
                    <AppButton variant="success" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
                        See My Score
                    </AppButton>
                </div>
            </Card>
        </>
    )
};

export default AssessmentDetailView;