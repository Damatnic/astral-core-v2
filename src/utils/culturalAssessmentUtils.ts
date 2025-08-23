/**
 * Cultural Assessment Utilities
 * 
 * Utilities for culturally-adapted mental health assessments including
 * question generation, scoring algorithms, and recommendation systems
 * that respect cultural differences in mental health expression.
 */

import { culturalAssessmentService } from '../services/culturalAssessmentService';

// Assessment utilities interface
export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { text: string; value: number }[];
}

export interface AssessmentResult {
  score: number;
  severity: string;
  recommendation: string;
  color?: string;
}

export interface CulturalAssessmentResult extends AssessmentResult {
  culturalContext: string;
  culturalFactors: {
    expressionStyle: 'direct' | 'indirect' | 'somatic' | 'metaphorical';
    stigmaLevel: number;
    familyInvolvement: 'individual' | 'family-inclusive' | 'community-oriented';
    helpSeekingStyle: 'professional' | 'informal' | 'religious' | 'traditional';
  };
  recommendations: {
    primary: string;
    cultural: string[];
    resources: string[];
    familyGuidance?: string;
  };
  privacyMetadata?: {
    culturallyAdjusted: boolean;
    culturalConfidenceScore: number;
    biasReductionApplied: boolean;
  };
}

/**
 * Get culturally-adapted PHQ-9 questions
 */
export async function getCulturalPhq9Questions(
  languageCode: string = 'en',
  culturalContext?: string
): Promise<AssessmentQuestion[]> {
  try {
    const culturalQuestions = await culturalAssessmentService.getCulturalAssessmentQuestions(
      'phq-9',
      languageCode,
      culturalContext
    );
    
    // Convert cultural questions to standard format for existing components
    return culturalQuestions.map(q => ({
      id: q.id,
      text: q.culturalAdaptations[culturalContext]?.text || 
            q.culturalAdaptations['Western']?.text || 
            q.text,
      options: q.options
    }));
  } catch (error) {
    console.error('[Assessment Utils] Failed to get cultural PHQ-9 questions:', error);
    // Fallback to standard questions
    return getStandardPhq9Questions();
  }
}

/**
 * Get culturally-adapted GAD-7 questions
 */
export async function getCulturalGad7Questions(
  languageCode: string = 'en',
  culturalContext?: string
): Promise<AssessmentQuestion[]> {
  try {
    const culturalQuestions = await culturalAssessmentService.getCulturalAssessmentQuestions(
      'gad-7',
      languageCode,
      culturalContext
    );
    
    // Convert cultural questions to standard format for existing components
    return culturalQuestions.map(q => ({
      id: q.id,
      text: q.culturalAdaptations[culturalContext]?.text || 
            q.culturalAdaptations['Western']?.text || 
            q.text,
      options: q.options
    }));
  } catch (error) {
    console.error('[Assessment Utils] Failed to get cultural GAD-7 questions:', error);
    // Fallback to standard questions
    return getStandardGad7Questions();
  }
}

/**
 * Calculate culturally-adjusted PHQ-9 result
 */
export async function getCulturalPhq9Result(
  scores: number[],
  languageCode: string = 'en',
  culturalContext?: string,
  textualAnswers?: string[]
): Promise<CulturalAssessmentResult> {
  try {
    const result = await culturalAssessmentService.calculateCulturalAssessmentResult(
      'phq-9',
      scores,
      textualAnswers || scores.map(String),
      languageCode,
      culturalContext
    );
    
    return {
      score: result.score,
      severity: result.severity,
      recommendation: result.recommendation,
      color: getSeverityColor(result.severity),
      culturalContext: result.culturalContext,
      culturalFactors: result.culturalFactors,
      recommendations: result.recommendations,
      privacyMetadata: result.privacyMetadata
    };
  } catch (error) {
    console.error('[Assessment Utils] Failed to get cultural PHQ-9 result:', error);
    // Fallback to standard calculation
    return {
      ...getStandardPhq9Result(scores),
      culturalContext: 'Western',
      culturalFactors: {
        expressionStyle: 'direct',
        stigmaLevel: 0.5,
        familyInvolvement: 'individual',
        helpSeekingStyle: 'professional'
      },
      recommendations: {
        primary: getStandardPhq9Result(scores).recommendation,
        cultural: [],
        resources: ['Crisis Text Line: Text HOME to 741741', 'National Suicide Prevention Lifeline: 988']
      }
    };
  }
}

/**
 * Calculate culturally-adjusted GAD-7 result
 */
export async function getCulturalGad7Result(
  scores: number[],
  languageCode: string = 'en',
  culturalContext?: string,
  textualAnswers?: string[]
): Promise<CulturalAssessmentResult> {
  try {
    const result = await culturalAssessmentService.calculateCulturalAssessmentResult(
      'gad-7',
      scores,
      textualAnswers || scores.map(String),
      languageCode,
      culturalContext
    );
    
    return {
      score: result.score,
      severity: result.severity,
      recommendation: result.recommendation,
      color: getSeverityColor(result.severity),
      culturalContext: result.culturalContext,
      culturalFactors: result.culturalFactors,
      recommendations: result.recommendations,
      privacyMetadata: result.privacyMetadata
    };
  } catch (error) {
    console.error('[Assessment Utils] Failed to get cultural GAD-7 result:', error);
    // Fallback to standard calculation
    return {
      ...getStandardGad7Result(scores),
      culturalContext: 'Western',
      culturalFactors: {
        expressionStyle: 'direct',
        stigmaLevel: 0.5,
        familyInvolvement: 'individual',
        helpSeekingStyle: 'professional'
      },
      recommendations: {
        primary: getStandardGad7Result(scores).recommendation,
        cultural: [],
        resources: ['Crisis Text Line: Text HOME to 741741', 'National Suicide Prevention Lifeline: 988']
      }
    };
  }
}

/**
 * Submit cultural assessment with privacy preservation
 */
export async function submitCulturalAssessment(
  userToken: string,
  type: 'phq-9' | 'gad-7',
  scores: number[],
  answers: string[],
  languageCode: string = 'en',
  culturalContext?: string,
  sessionDuration: number = 300000 // 5 minutes default
) {
  try {
    return await culturalAssessmentService.submitCulturalAssessment({
      userToken,
      type,
      scores,
      answers,
      languageCode,
      culturalContext,
      sessionDuration
    });
  } catch (error) {
    console.error('[Assessment Utils] Failed to submit cultural assessment:', error);
    throw error;
  }
}

// Standard fallback questions and scoring
function getStandardPhq9Questions(): AssessmentQuestion[] {
  return [
    {
      id: 'phq9_1',
      text: 'Little interest or pleasure in doing things',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_2',
      text: 'Feeling down, depressed, or hopeless',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_3',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_4',
      text: 'Feeling tired or having little energy',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_5',
      text: 'Poor appetite or overeating',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_6',
      text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_8',
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'phq9_9',
      text: 'Thoughts that you would be better off dead, or of hurting yourself',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    }
  ];
}

function getStandardGad7Questions(): AssessmentQuestion[] {
  return [
    {
      id: 'gad7_1',
      text: 'Feeling nervous, anxious, or on edge',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_2',
      text: 'Not being able to stop or control worrying',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_3',
      text: 'Worrying too much about different things',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_4',
      text: 'Trouble relaxing',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_5',
      text: 'Being so restless that it is hard to sit still',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_6',
      text: 'Becoming easily annoyed or irritable',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    },
    {
      id: 'gad7_7',
      text: 'Feeling afraid, as if something awful might happen',
      options: [
        { value: 0, text: 'Not at all' },
        { value: 1, text: 'Several days' },
        { value: 2, text: 'More than half the days' },
        { value: 3, text: 'Nearly every day' }
      ]
    }
  ];
}

function getStandardPhq9Result(scores: number[]): AssessmentResult {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  
  if (totalScore <= 4) {
    return {
      score: totalScore,
      severity: 'minimal',
      recommendation: 'Your symptoms suggest minimal depression. Continue with self-care and stress management techniques.',
      color: '#10b981' // green
    };
  } else if (totalScore <= 9) {
    return {
      score: totalScore,
      severity: 'mild',
      recommendation: 'Your symptoms suggest mild depression. Consider self-care practices and monitor your symptoms.',
      color: '#f59e0b' // yellow
    };
  } else if (totalScore <= 14) {
    return {
      score: totalScore,
      severity: 'moderate',
      recommendation: 'Your symptoms suggest moderate depression. Consider speaking with a mental health professional.',
      color: '#f97316' // orange
    };
  } else if (totalScore <= 19) {
    return {
      score: totalScore,
      severity: 'moderately-severe',
      recommendation: 'Your symptoms suggest moderately severe depression. Please consider seeking professional help soon.',
      color: '#dc2626' // red
    };
  } else {
    return {
      score: totalScore,
      severity: 'severe',
      recommendation: 'Your symptoms suggest severe depression. We strongly recommend seeking immediate professional help.',
      color: '#991b1b' // dark red
    };
  }
}

function getStandardGad7Result(scores: number[]): AssessmentResult {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  
  if (totalScore <= 4) {
    return {
      score: totalScore,
      severity: 'minimal',
      recommendation: 'Your symptoms suggest minimal anxiety. Continue with self-care and stress management techniques.',
      color: '#10b981' // green
    };
  } else if (totalScore <= 9) {
    return {
      score: totalScore,
      severity: 'mild',
      recommendation: 'Your symptoms suggest mild anxiety. Consider relaxation techniques and stress management.',
      color: '#f59e0b' // yellow
    };
  } else if (totalScore <= 14) {
    return {
      score: totalScore,
      severity: 'moderate',
      recommendation: 'Your symptoms suggest moderate anxiety. Consider speaking with a mental health professional.',
      color: '#f97316' // orange
    };
  } else {
    return {
      score: totalScore,
      severity: 'severe',
      recommendation: 'Your symptoms suggest severe anxiety. We recommend seeking professional help.',
      color: '#dc2626' // red
    };
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minimal': return '#10b981'; // green
    case 'mild': return '#f59e0b'; // yellow
    case 'moderate': return '#f97316'; // orange
    case 'moderately-severe': return '#dc2626'; // red
    case 'severe': return '#991b1b'; // dark red
    default: return '#6b7280'; // gray
  }
}

/**
 * Format assessment date for display
 */
export function formatAssessmentDate(date: string | Date): string {
  let assessmentDate: Date;
  
  if (typeof date === 'string') {
    // Handle date-only strings (YYYY-MM-DD) by treating them as local dates
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      assessmentDate = new Date(year, month - 1, day);
    } else {
      assessmentDate = new Date(date);
    }
  } else {
    assessmentDate = date;
  }
  
  if (isNaN(assessmentDate.getTime())) {
    return 'Invalid Date';
  }
  
  return assessmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get assessment type display name
 */
export function getAssessmentDisplayName(type: string): string {
  switch (type) {
    case 'phq-9': return 'PHQ-9 (Depression)';
    case 'gad-7': return 'GAD-7 (Anxiety)';
    default: return 'Unknown Assessment';
  }
}
