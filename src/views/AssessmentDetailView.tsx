/**
 * Assessment Detail View
 * Detailed view for taking and reviewing mental health assessments
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ActiveView } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { ProgressBar } from '../components/ProgressBar';
import { useAssessmentStore } from '../stores/assessmentStore';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClipboardIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  InfoIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  TrendingUpIcon,
  BookOpenIcon,
  HeartIcon
} from '../components/icons.dynamic';

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple-choice' | 'yes-no' | 'text';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
  required: boolean;
  category?: string;
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  level: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  interpretation: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  followUpRequired: boolean;
}

export interface AssessmentDetailViewProps {
  type: 'phq-9' | 'gad-7' | 'dass-21' | 'pcl-5' | 'custom';
  assessmentId?: string;
  setActiveView: (view: ActiveView) => void;
}

// PHQ-9 Depression Assessment Questions
const PHQ9_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'phq9-1',
    text: 'Little interest or pleasure in doing things',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'mood'
  },
  {
    id: 'phq9-2',
    text: 'Feeling down, depressed, or hopeless',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'mood'
  },
  {
    id: 'phq9-3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'sleep'
  },
  {
    id: 'phq9-4',
    text: 'Feeling tired or having little energy',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'energy'
  },
  {
    id: 'phq9-5',
    text: 'Poor appetite or overeating',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'appetite'
  },
  {
    id: 'phq9-6',
    text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'self-worth'
  },
  {
    id: 'phq9-7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'concentration'
  },
  {
    id: 'phq9-8',
    text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'psychomotor'
  },
  {
    id: 'phq9-9',
    text: 'Thoughts that you would be better off dead, or of hurting yourself',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'suicidal-ideation'
  }
];

// GAD-7 Anxiety Assessment Questions
const GAD7_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'gad7-1',
    text: 'Feeling nervous, anxious, or on edge',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'anxiety'
  },
  {
    id: 'gad7-2',
    text: 'Not being able to stop or control worrying',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'worry'
  },
  {
    id: 'gad7-3',
    text: 'Worrying too much about different things',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'worry'
  },
  {
    id: 'gad7-4',
    text: 'Trouble relaxing',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'relaxation'
  },
  {
    id: 'gad7-5',
    text: 'Being so restless that it is hard to sit still',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'restlessness'
  },
  {
    id: 'gad7-6',
    text: 'Becoming easily annoyed or irritable',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'irritability'
  },
  {
    id: 'gad7-7',
    text: 'Feeling afraid, as if something awful might happen',
    type: 'scale',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    required: true,
    category: 'fear'
  }
];

const getAssessmentResult = (type: string, answers: Record<string, number>): AssessmentResult => {
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  
  if (type === 'phq-9') {
    let level: AssessmentResult['level'] = 'minimal';
    let interpretation = '';
    let recommendations: string[] = [];
    let riskLevel: AssessmentResult['riskLevel'] = 'low';
    let followUpRequired = false;

    if (totalScore >= 20) {
      level = 'severe';
      interpretation = 'Severe depression. Professional treatment is strongly recommended.';
      recommendations = [
        'Seek immediate professional help',
        'Consider medication evaluation',
        'Regular therapy sessions',
        'Crisis support plan',
        'Family/friend support system'
      ];
      riskLevel = 'critical';
      followUpRequired = true;
    } else if (totalScore >= 15) {
      level = 'moderately-severe';
      interpretation = 'Moderately severe depression. Professional treatment is recommended.';
      recommendations = [
        'Consult with mental health professional',
        'Consider therapy and/or medication',
        'Regular monitoring',
        'Lifestyle modifications',
        'Support group participation'
      ];
      riskLevel = 'high';
      followUpRequired = true;
    } else if (totalScore >= 10) {
      level = 'moderate';
      interpretation = 'Moderate depression. Treatment options should be discussed with a healthcare provider.';
      recommendations = [
        'Speak with healthcare provider',
        'Consider counseling or therapy',
        'Regular exercise and healthy lifestyle',
        'Monitor symptoms',
        'Social support'
      ];
      riskLevel = 'medium';
      followUpRequired = true;
    } else if (totalScore >= 5) {
      level = 'mild';
      interpretation = 'Mild depression. Self-care strategies and monitoring recommended.';
      recommendations = [
        'Self-care and wellness strategies',
        'Regular exercise',
        'Healthy sleep habits',
        'Monitor symptoms',
        'Consider counseling if symptoms persist'
      ];
      riskLevel = 'low';
    } else {
      level = 'minimal';
      interpretation = 'Minimal depression. Continue healthy lifestyle practices.';
      recommendations = [
        'Continue current wellness practices',
        'Regular self-assessment',
        'Maintain healthy lifestyle',
        'Stay connected with support system'
      ];
      riskLevel = 'low';
    }

    return {
      score: totalScore,
      maxScore: 27,
      level,
      interpretation,
      recommendations,
      riskLevel,
      followUpRequired
    };
  }

  // GAD-7 scoring
  let level: AssessmentResult['level'] = 'minimal';
  let interpretation = '';
  let recommendations: string[] = [];
  let riskLevel: AssessmentResult['riskLevel'] = 'low';
  let followUpRequired = false;

  if (totalScore >= 15) {
    level = 'severe';
    interpretation = 'Severe anxiety. Professional treatment is strongly recommended.';
    recommendations = [
      'Seek professional help immediately',
      'Consider medication evaluation',
      'Cognitive-behavioral therapy',
      'Anxiety management techniques',
      'Crisis support plan'
    ];
    riskLevel = 'high';
    followUpRequired = true;
  } else if (totalScore >= 10) {
    level = 'moderate';
    interpretation = 'Moderate anxiety. Professional guidance is recommended.';
    recommendations = [
      'Consult with mental health professional',
      'Learn anxiety management techniques',
      'Regular therapy sessions',
      'Lifestyle modifications',
      'Monitor symptoms'
    ];
    riskLevel = 'medium';
    followUpRequired = true;
  } else if (totalScore >= 5) {
    level = 'mild';
    interpretation = 'Mild anxiety. Self-help strategies and monitoring recommended.';
    recommendations = [
      'Practice relaxation techniques',
      'Regular exercise',
      'Stress management',
      'Monitor symptoms',
      'Consider counseling if symptoms worsen'
    ];
    riskLevel = 'low';
  } else {
    level = 'minimal';
    interpretation = 'Minimal anxiety. Continue healthy practices.';
    recommendations = [
      'Continue current wellness practices',
      'Regular self-assessment',
      'Maintain healthy lifestyle',
      'Stress prevention strategies'
    ];
    riskLevel = 'low';
  }

  return {
    score: totalScore,
    maxScore: 21,
    level,
    interpretation,
    recommendations,
    riskLevel,
    followUpRequired
  };
};

export const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({ 
  type, 
  assessmentId, 
  setActiveView 
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { submitAssessmentResult, getAssessmentHistory } = useAssessmentStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const assessmentConfig = useMemo(() => {
    switch (type) {
      case 'phq-9':
        return {
          title: 'PHQ-9 Depression Assessment',
          description: 'Patient Health Questionnaire-9 for depression screening',
          questions: PHQ9_QUESTIONS,
          timeframe: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
          icon: HeartIcon,
          color: '#3b82f6'
        };
      case 'gad-7':
        return {
          title: 'GAD-7 Anxiety Assessment',
          description: 'Generalized Anxiety Disorder-7 for anxiety screening',
          questions: GAD7_QUESTIONS,
          timeframe: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
          icon: AlertTriangleIcon,
          color: '#f59e0b'
        };
      default:
        return {
          title: 'Mental Health Assessment',
          description: 'Comprehensive mental health evaluation',
          questions: PHQ9_QUESTIONS,
          timeframe: 'Please answer the following questions',
          icon: ClipboardIcon,
          color: '#6b7280'
        };
    }
  }, [type]);

  const currentQuestion = assessmentConfig.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === assessmentConfig.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / assessmentConfig.questions.length) * 100;

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion && answers[currentQuestion.id] !== undefined) {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
      showNotification('Please answer the question', 'An answer is required to continue', 'warning');
    }
  }, [currentQuestion, answers, isLastQuestion, showNotification]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const assessmentResult = getAssessmentResult(type, answers);
      setResult(assessmentResult);
      
      // Submit to store
      await submitAssessmentResult({
        id: assessmentId || `${type}-${Date.now()}`,
        type,
        userId: user?.id || 'anonymous',
        answers,
        result: assessmentResult,
        completedAt: new Date(),
        timeToComplete: Date.now() - startTime
      });

      setShowResults(true);
      
      // Show appropriate notification based on risk level
      if (assessmentResult.riskLevel === 'critical' || assessmentResult.riskLevel === 'high') {
        showNotification(
          'Assessment Complete - Follow-up Recommended',
          'Your results suggest you may benefit from professional support. Please consider reaching out to a mental health professional.',
          'warning'
        );
      } else {
        showNotification(
          'Assessment Complete',
          'Your assessment has been saved. You can view your results and track your progress over time.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      showNotification(
        'Submission Error',
        'There was an error saving your assessment. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [type, answers, assessmentId, user, submitAssessmentResult, showNotification]);

  const [startTime] = useState(Date.now());

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (level: string): string => {
    switch (level) {
      case 'severe': return '#dc2626';
      case 'moderately-severe': return '#ea580c';
      case 'moderate': return '#d97706';
      case 'mild': return '#65a30d';
      case 'minimal': return '#16a34a';
      default: return '#6b7280';
    }
  };

  if (showResults && result) {
    return (
      <div className="assessment-detail-view">
        <ViewHeader 
          title="Assessment Results"
          subtitle={assessmentConfig.title}
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />

        {/* Results Summary */}
        <Card className="results-summary-card">
          <div className="results-header">
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: getSeverityColor(result.level) }}>
                <span className="score-value">{result.score}</span>
                <span className="score-max">/{result.maxScore}</span>
              </div>
              <div className="score-info">
                <h3 style={{ color: getSeverityColor(result.level) }}>
                  {result.level.charAt(0).toUpperCase() + result.level.slice(1).replace('-', ' ')}
                </h3>
                <p className="risk-level" style={{ color: getRiskLevelColor(result.riskLevel) }}>
                  {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                </p>
              </div>
            </div>
          </div>
          
          <div className="interpretation">
            <h4>Interpretation</h4>
            <p>{result.interpretation}</p>
          </div>

          {result.followUpRequired && (
            <div className="follow-up-alert">
              <AlertTriangleIcon className="w-5 h-5" />
              <span>Professional follow-up recommended</span>
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card className="recommendations-card">
          <h3>Recommendations</h3>
          <div className="recommendations-list">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Crisis Resources (if high risk) */}
        {(result.riskLevel === 'critical' || result.riskLevel === 'high') && (
          <Card className="crisis-resources-card">
            <div className="crisis-header">
              <AlertTriangleIcon className="w-6 h-6 text-red-500" />
              <h3>Immediate Support Available</h3>
            </div>
            <div className="crisis-resources">
              <div className="resource-item">
                <strong>National Suicide Prevention Lifeline</strong>
                <p>988 or 1-800-273-8255</p>
                <p>24/7 crisis support</p>
              </div>
              <div className="resource-item">
                <strong>Crisis Text Line</strong>
                <p>Text HOME to 741741</p>
                <p>24/7 text-based crisis support</p>
              </div>
              <div className="resource-item">
                <strong>Emergency Services</strong>
                <p>911</p>
                <p>For immediate medical emergencies</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="results-actions-card">
          <div className="action-buttons">
            <AppButton
              variant="secondary"
              onClick={() => setActiveView('assessments')}
              icon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back to Assessments
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => setActiveView('dashboard')}
              icon={<TrendingUpIcon className="w-4 h-4" />}
            >
              View Progress
            </AppButton>
            {result.followUpRequired && (
              <AppButton
                variant="secondary"
                onClick={() => setActiveView('resources')}
                icon={<BookOpenIcon className="w-4 h-4" />}
              >
                Find Resources
              </AppButton>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="assessment-detail-view">
      <ViewHeader 
        title={assessmentConfig.title}
        subtitle={assessmentConfig.description}
        icon={<assessmentConfig.icon className="w-6 h-6" />}
      />

      {/* Progress Indicator */}
      <Card className="progress-card">
        <div className="progress-header">
          <span>Question {currentQuestionIndex + 1} of {assessmentConfig.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <ProgressBar progress={progress} color={assessmentConfig.color} />
      </Card>

      {/* Assessment Instructions */}
      {currentQuestionIndex === 0 && (
        <Card className="instructions-card">
          <div className="instructions-header">
            <InfoIcon className="w-5 h-5 text-blue-500" />
            <h3>Instructions</h3>
          </div>
          <p>{assessmentConfig.timeframe}</p>
          <div className="privacy-notice">
            <p><strong>Privacy Notice:</strong> Your responses are confidential and will be used only to provide you with personalized insights and recommendations.</p>
          </div>
        </Card>
      )}

      {/* Current Question */}
      <Card className="question-card">
        <div className="question-content">
          <h3 className="question-text">{currentQuestion.text}</h3>
          
          {currentQuestion.type === 'scale' && currentQuestion.scaleLabels && (
            <div className="scale-options">
              {currentQuestion.scaleLabels.map((label, index) => (
                <div
                  key={index}
                  className={`scale-option ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQuestion.id, index)}
                >
                  <div className="scale-radio">
                    <div className="radio-button">
                      {answers[currentQuestion.id] === index && (
                        <div className="radio-selected" />
                      )}
                    </div>
                    <span className="scale-value">{index}</span>
                  </div>
                  <span className="scale-label">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <Card className="navigation-card">
        <div className="nav-buttons">
          <AppButton
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Previous
          </AppButton>
          
          <AppButton
            variant="primary"
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined || isSubmitting}
            loading={isSubmitting}
          >
            {isLastQuestion ? 'Complete Assessment' : 'Next Question'}
          </AppButton>
        </div>
        
        <div className="nav-info">
          <p>You can navigate back to change previous answers at any time.</p>
        </div>
      </Card>
    </div>
  );
};

export default AssessmentDetailView;
