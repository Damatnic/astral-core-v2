/**
 * Cultural Assessment Utils Test Suite
 * Tests culturally-adapted mental health assessments and scoring
 */

import {
  getCulturalPhq9Questions,
  getCulturalGad7Questions,
  getCulturalPhq9Result,
  getCulturalGad7Result,
  submitCulturalAssessment,
  formatAssessmentDate,
  getAssessmentDisplayName,
  AssessmentQuestion,
  AssessmentResult,
  CulturalAssessmentResult,
} from './culturalAssessmentUtils';

// Mock the cultural assessment service
jest.mock('../services/culturalAssessmentService', () => ({
  culturalAssessmentService: {
    getCulturalAssessmentQuestions: jest.fn(),
    calculateCulturalAssessmentResult: jest.fn(),
    submitCulturalAssessment: jest.fn(),
  },
}));

import { culturalAssessmentService } from '../services/culturalAssessmentService';

const mockCulturalAssessmentService = culturalAssessmentService as jest.Mocked<typeof culturalAssessmentService>;

describe('culturalAssessmentUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCulturalPhq9Questions', () => {
    const mockCulturalQuestions = [
      {
        id: 'phq9_1_cultural',
        text: 'Standard question text',
        culturalAdaptations: {
          'Asian': { 
            text: 'Asian-adapted question text',
            culturalContext: 'Asian cultural context',
            expressionPatterns: ['adapted', 'cultural']
          },
          'Western': { 
            text: 'Western question text',
            culturalContext: 'Western cultural context',
            expressionPatterns: ['standard', 'western']
          },
        },
        sensitivityLevel: 'medium' as const,
        stigmaConsiderations: ['cultural sensitivity', 'stigma awareness'],
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 },
        ],
      },
      {
        id: 'phq9_2_cultural',
        text: 'Another standard question',
        culturalAdaptations: {
          'Asian': { 
            text: 'Asian-adapted question 2',
            culturalContext: 'Asian cultural context',
            expressionPatterns: ['adapted', 'cultural']
          },
          'Western': { 
            text: 'Western question 2',
            culturalContext: 'Western cultural context', 
            expressionPatterns: ['standard', 'western']
          },
        },
        sensitivityLevel: 'medium' as const,
        stigmaConsiderations: ['cultural sensitivity', 'stigma awareness'],
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 },
        ],
      },
    ];

    it('should return cultural PHQ-9 questions with cultural context', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(mockCulturalQuestions);

      const result = await getCulturalPhq9Questions('en', 'Asian');

      expect(mockCulturalAssessmentService.getCulturalAssessmentQuestions).toHaveBeenCalledWith(
        'phq-9',
        'en',
        'Asian'
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'phq9_1_cultural',
        text: 'Asian-adapted question text',
        options: mockCulturalQuestions[0].options,
      });
    });

    it('should fallback to Western adaptation when cultural context not found', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(mockCulturalQuestions);

      const result = await getCulturalPhq9Questions('en', 'Unknown');

      expect(result[0].text).toBe('Western question text');
    });

    it('should use standard text when no cultural adaptations available', async () => {
      const questionsWithoutAdaptations = [{
        ...mockCulturalQuestions[0],
        culturalAdaptations: {},
      }];

      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(questionsWithoutAdaptations);

      const result = await getCulturalPhq9Questions('en', 'Asian');

      expect(result[0].text).toBe('Standard question text');
    });

    it('should use default language code when not provided', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(mockCulturalQuestions);

      await getCulturalPhq9Questions();

      expect(mockCulturalAssessmentService.getCulturalAssessmentQuestions).toHaveBeenCalledWith(
        'phq-9',
        'en',
        undefined
      );
    });

    it('should fallback to standard questions on service failure', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockRejectedValue(new Error('Service failed'));

      const result = await getCulturalPhq9Questions('en', 'Asian');

      expect(result).toHaveLength(9); // Standard PHQ-9 has 9 questions
      expect(result[0].id).toBe('phq9_1');
      expect(console.error).toHaveBeenCalledWith(
        '[Assessment Utils] Failed to get cultural PHQ-9 questions:',
        expect.any(Error)
      );
    });

    it('should handle empty cultural questions response', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue([]);

      const result = await getCulturalPhq9Questions('en', 'Asian');

      expect(result).toHaveLength(0);
    });
  });

  describe('getCulturalGad7Questions', () => {
    const mockGad7Questions = [
      {
        id: 'gad7_1_cultural',
        text: 'Standard GAD-7 question',
        culturalAdaptations: {
          'Latino': { 
            text: 'Latino-adapted GAD-7 question',
            culturalContext: 'Latino cultural context',
            expressionPatterns: ['adapted', 'latino']
          },
          'Western': { 
            text: 'Western GAD-7 question',
            culturalContext: 'Western cultural context',
            expressionPatterns: ['standard', 'western']
          },
        },
        sensitivityLevel: 'medium' as const,
        stigmaConsiderations: ['cultural sensitivity', 'stigma awareness'],
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 },
        ],
      },
    ];

    it('should return cultural GAD-7 questions', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(mockGad7Questions);

      const result = await getCulturalGad7Questions('es', 'Latino');

      expect(mockCulturalAssessmentService.getCulturalAssessmentQuestions).toHaveBeenCalledWith(
        'gad-7',
        'es',
        'Latino'
      );

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Latino-adapted GAD-7 question');
    });

    it('should fallback to standard GAD-7 questions on failure', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockRejectedValue(new Error('Failed'));

      const result = await getCulturalGad7Questions('es', 'Latino');

      expect(result).toHaveLength(7); // Standard GAD-7 has 7 questions
      expect(result[0].id).toBe('gad7_1');
    });
  });

  describe('getCulturalPhq9Result', () => {
    const mockCulturalResult = {
      score: 12,
      severity: 'moderate',
      recommendation: 'Cultural recommendation',
      culturalContext: 'Asian',
      culturalFactors: {
        expressionStyle: 'indirect' as const,
        stigmaLevel: 0.7,
        familyInvolvement: 'family-inclusive' as const,
        helpSeekingStyle: 'traditional' as const,
      },
      recommendations: {
        primary: 'Seek professional help',
        cultural: ['Consider family therapy', 'Explore traditional healing'],
        resources: ['Asian Mental Health Collective', 'Crisis Line'],
        familyGuidance: 'Involve family in treatment decisions',
      },
      privacyMetadata: {
        culturallyAdjusted: true,
        biasReductionApplied: true,
        culturalConfidenceScore: 0.8,
      },
    };

    it('should return cultural PHQ-9 assessment result', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockResolvedValue(mockCulturalResult);

      const scores = [2, 2, 1, 2, 1, 2, 1, 1, 0]; // Total: 12
      const result = await getCulturalPhq9Result(scores, 'en', 'Asian', ['Several days', 'Several days']);

      expect(mockCulturalAssessmentService.calculateCulturalAssessmentResult).toHaveBeenCalledWith(
        'phq-9',
        scores,
        ['Several days', 'Several days'],
        'en',
        'Asian'
      );

      expect(result).toEqual({
        ...mockCulturalResult,
        color: '#f97316', // Orange for moderate
      });
    });

    it('should use score strings as textual answers when not provided', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockResolvedValue(mockCulturalResult);

      const scores = [1, 2, 0];
      await getCulturalPhq9Result(scores, 'en', 'Asian');

      expect(mockCulturalAssessmentService.calculateCulturalAssessmentResult).toHaveBeenCalledWith(
        'phq-9',
        scores,
        ['1', '2', '0'],
        'en',
        'Asian'
      );
    });

    it('should use default language when not provided', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockResolvedValue(mockCulturalResult);

      await getCulturalPhq9Result([1, 2, 1]);

      expect(mockCulturalAssessmentService.calculateCulturalAssessmentResult).toHaveBeenCalledWith(
        'phq-9',
        [1, 2, 1],
        ['1', '2', '1'],
        'en',
        undefined
      );
    });

    it('should fallback to standard calculation on service failure', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Service failed'));

      const scores = [2, 2, 2, 2, 2, 1, 1, 1, 0]; // Total: 13 (moderate)
      const result = await getCulturalPhq9Result(scores, 'en', 'Asian');

      expect(result).toEqual({
        score: 13,
        severity: 'moderate',
        recommendation: expect.stringContaining('moderate depression'),
        color: '#f97316',
        culturalContext: 'Western',
        culturalFactors: {
          expressionStyle: 'direct',
          stigmaLevel: 0.5,
          familyInvolvement: 'individual',
          helpSeekingStyle: 'professional',
        },
        recommendations: {
          primary: expect.stringContaining('moderate depression'),
          cultural: [],
          resources: ['Crisis Text Line: Text HOME to 741741', 'National Suicide Prevention Lifeline: 988'],
        },
      });

      expect(console.error).toHaveBeenCalledWith(
        '[Assessment Utils] Failed to get cultural PHQ-9 result:',
        expect.any(Error)
      );
    });

    it('should handle different severity levels and colors', async () => {
      const severityTests = [
        { severity: 'minimal', expectedColor: '#10b981' },
        { severity: 'mild', expectedColor: '#f59e0b' },
        { severity: 'moderate', expectedColor: '#f97316' },
        { severity: 'moderately-severe', expectedColor: '#dc2626' },
        { severity: 'severe', expectedColor: '#991b1b' },
        { severity: 'unknown', expectedColor: '#6b7280' },
      ];

      for (const { severity, expectedColor } of severityTests) {
        mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockResolvedValue({
          ...mockCulturalResult,
          severity,
        });

        const result = await getCulturalPhq9Result([1], 'en', 'Asian');
        expect(result.color).toBe(expectedColor);
      }
    });
  });

  describe('getCulturalGad7Result', () => {
    const mockGad7Result = {
      score: 8,
      severity: 'mild',
      recommendation: 'Cultural GAD-7 recommendation',
      culturalContext: 'Latino',
      culturalFactors: {
        expressionStyle: 'somatic' as const,
        stigmaLevel: 0.8,
        familyInvolvement: 'community-oriented' as const,
        helpSeekingStyle: 'religious' as const,
      },
      recommendations: {
        primary: 'Consider counseling',
        cultural: ['Explore faith-based support', 'Community involvement'],
        resources: ['Latino Mental Health Resources'],
      },
      privacyMetadata: {
        culturallyAdjusted: true,
        biasReductionApplied: true,
        culturalConfidenceScore: 0.9,
      },
    };

    it('should return cultural GAD-7 assessment result', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockResolvedValue(mockGad7Result);

      const scores = [1, 1, 2, 1, 1, 1, 1]; // Total: 8
      const result = await getCulturalGad7Result(scores, 'es', 'Latino');

      expect(result).toEqual({
        ...mockGad7Result,
        color: '#f59e0b', // Yellow for mild
      });
    });

    it('should fallback to standard GAD-7 calculation on failure', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Failed'));

      const scores = [2, 2, 2, 1]; // Total: 7 (mild)
      const result = await getCulturalGad7Result(scores);

      expect(result.score).toBe(7);
      expect(result.severity).toBe('mild');
      expect(result.culturalContext).toBe('Western');
    });
  });

  describe('submitCulturalAssessment', () => {
    const mockSubmissionResult = {
      id: 'assessment-123',
      userToken: 'user-token',
      type: 'phq-9' as const,
      score: 12,
      answers: [1, 2, 1, 2, 1, 2, 1, 1, 0],
      timestamp: '2024-01-15T10:00:00Z',
      culturalContext: 'Asian',
      languageCode: 'en',
      culturalAdaptationsUsed: ['cultural-bias-reduction', 'expression-pattern-analysis'],
      culturalFactors: {
        expressionStyle: 'indirect' as const,
        stigmaLevel: 0.7,
        familyInvolvement: 'family-inclusive' as const,
        helpSeekingStyle: 'traditional' as const,
      },
      privacyPreserved: true,
    };

    it('should submit cultural assessment with all parameters', async () => {
      mockCulturalAssessmentService.submitCulturalAssessment.mockResolvedValue(mockSubmissionResult);

      const result = await submitCulturalAssessment(
        'user-123',
        'phq-9',
        [1, 2, 1, 2, 1, 2, 1, 1, 0],
        ['Several days', 'More than half'],
        'en',
        'Asian',
        300000
      );

      expect(mockCulturalAssessmentService.submitCulturalAssessment).toHaveBeenCalledWith({
        userToken: 'user-123',
        type: 'phq-9',
        scores: [1, 2, 1, 2, 1, 2, 1, 1, 0],
        answers: ['Several days', 'More than half'],
        languageCode: 'en',
        culturalContext: 'Asian',
        sessionDuration: 300000,
      });

      expect(result).toBe(mockSubmissionResult);
    });

    it('should use default values when optional parameters not provided', async () => {
      mockCulturalAssessmentService.submitCulturalAssessment.mockResolvedValue(mockSubmissionResult);

      await submitCulturalAssessment('user-123', 'gad-7', [1, 1, 1], ['Several days']);

      expect(mockCulturalAssessmentService.submitCulturalAssessment).toHaveBeenCalledWith({
        userToken: 'user-123',
        type: 'gad-7',
        scores: [1, 1, 1],
        answers: ['Several days'],
        languageCode: 'en',
        culturalContext: undefined,
        sessionDuration: 300000,
      });
    });

    it('should throw error on service failure', async () => {
      const serviceError = new Error('Submission failed');
      mockCulturalAssessmentService.submitCulturalAssessment.mockRejectedValue(serviceError);

      await expect(
        submitCulturalAssessment('user-123', 'phq-9', [1, 2, 1], ['Several'])
      ).rejects.toThrow('Submission failed');

      expect(console.error).toHaveBeenCalledWith(
        '[Assessment Utils] Failed to submit cultural assessment:',
        serviceError
      );
    });
  });

  describe('formatAssessmentDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatAssessmentDate(date);

      expect(result).toBe('Jan 15, 2024');
    });

    it('should format date string correctly', () => {
      const result = formatAssessmentDate('2024-01-15T10:30:00Z');

      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different date formats', () => {
      const testDates = [
        { input: '2024-12-25', expected: 'Dec 25, 2024' },
        { input: '2024-01-01', expected: 'Jan 1, 2024' },
        { input: '2024-06-15', expected: 'Jun 15, 2024' },
      ];

      testDates.forEach(({ input, expected }) => {
        const result = formatAssessmentDate(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle invalid date strings', () => {
      const result = formatAssessmentDate('invalid-date');
      expect(result).toMatch(/Invalid Date|NaN/);
    });
  });

  describe('getAssessmentDisplayName', () => {
    it('should return correct display name for PHQ-9', () => {
      const result = getAssessmentDisplayName('phq-9');
      expect(result).toBe('PHQ-9 (Depression)');
    });

    it('should return correct display name for GAD-7', () => {
      const result = getAssessmentDisplayName('gad-7');
      expect(result).toBe('GAD-7 (Anxiety)');
    });

    it('should return unknown for unrecognized assessment type', () => {
      const result = getAssessmentDisplayName('unknown-assessment');
      expect(result).toBe('Unknown Assessment');
    });

    it('should handle empty string', () => {
      const result = getAssessmentDisplayName('');
      expect(result).toBe('Unknown Assessment');
    });

    it('should handle case sensitivity', () => {
      const result = getAssessmentDisplayName('PHQ-9');
      expect(result).toBe('Unknown Assessment');
    });
  });

  describe('standard fallback functions', () => {
    describe('standard PHQ-9 scoring', () => {
      it('should classify minimal depression correctly', () => {
        // Test via fallback scenario
        mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Failed'));
        
        const testScores = [[0, 0, 0, 0, 0, 0, 0, 0, 0]]; // Total: 0
        
        testScores.forEach(async (scores) => {
          const result = await getCulturalPhq9Result(scores);
          expect(result.severity).toBe('minimal');
          expect(result.color).toBe('#10b981');
        });
      });

      it('should classify severe depression correctly', () => {
        mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Failed'));
        
        const scores = [3, 3, 3, 3, 3, 3, 3, 3, 3]; // Total: 27 (severe)
        const result = getCulturalPhq9Result(scores);
        
        result.then(r => {
          expect(r.severity).toBe('severe');
          expect(r.color).toBe('#991b1b');
          expect(r.recommendation).toContain('severe depression');
        });
      });
    });

    describe('standard GAD-7 scoring', () => {
      it('should classify minimal anxiety correctly', () => {
        mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Failed'));
        
        const scores = [0, 0, 1, 0, 1, 1, 1]; // Total: 4 (minimal)
        const result = getCulturalGad7Result(scores);
        
        result.then(r => {
          expect(r.severity).toBe('minimal');
          expect(r.recommendation).toContain('minimal anxiety');
        });
      });

      it('should classify severe anxiety correctly', () => {
        mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Failed'));
        
        const scores = [3, 3, 3, 3, 3]; // Total: 15 (severe)
        const result = getCulturalGad7Result(scores);
        
        result.then(r => {
          expect(r.severity).toBe('severe');
          expect(r.recommendation).toContain('severe anxiety');
        });
      });
    });
  });

  describe('interface compliance', () => {
    it('should match AssessmentQuestion interface', () => {
      const question: AssessmentQuestion = {
        id: 'test-q1',
        text: 'Test question',
        options: [
          { text: 'Option 1', value: 0 },
          { text: 'Option 2', value: 1 },
        ],
      };

      expect(question.id).toBe('test-q1');
      expect(question.text).toBe('Test question');
      expect(question.options).toHaveLength(2);
      expect(question.options[0]).toHaveProperty('text');
      expect(question.options[0]).toHaveProperty('value');
    });

    it('should match AssessmentResult interface', () => {
      const result: AssessmentResult = {
        score: 10,
        severity: 'moderate',
        recommendation: 'Test recommendation',
      };

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendation');
      expect(typeof result.score).toBe('number');
      expect(typeof result.severity).toBe('string');
      expect(typeof result.recommendation).toBe('string');
    });

    it('should match CulturalAssessmentResult interface', () => {
      const result: CulturalAssessmentResult = {
        score: 12,
        severity: 'moderate',
        recommendation: 'Test recommendation',
        color: '#f97316',
        culturalContext: 'Asian',
        culturalFactors: {
          expressionStyle: 'indirect',
          stigmaLevel: 0.7,
          familyInvolvement: 'family-inclusive',
          helpSeekingStyle: 'traditional',
        },
        recommendations: {
          primary: 'Primary recommendation',
          cultural: ['Cultural recommendation 1'],
          resources: ['Resource 1'],
          familyGuidance: 'Family guidance',
        },
      };

      expect(result).toHaveProperty('culturalContext');
      expect(result).toHaveProperty('culturalFactors');
      expect(result).toHaveProperty('recommendations');
      expect(result.culturalFactors).toHaveProperty('expressionStyle');
      expect(result.recommendations).toHaveProperty('primary');
      expect(result.recommendations).toHaveProperty('cultural');
      expect(Array.isArray(result.recommendations.cultural)).toBe(true);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle network timeout gracefully', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      const result = await getCulturalPhq9Result([1, 1, 1]);
      
      expect(result.culturalContext).toBe('Western');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle malformed service responses', async () => {
      mockCulturalAssessmentService.getCulturalAssessmentQuestions.mockResolvedValue(null as any);

      const result = await getCulturalPhq9Questions('en', 'Asian');
      
      expect(result).toHaveLength(9); // Falls back to standard questions
    });

    it('should handle empty scores array', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Empty scores'));

      const result = await getCulturalPhq9Result([]);
      
      expect(result.score).toBe(0);
      expect(result.severity).toBe('minimal');
    });

    it('should handle negative scores', async () => {
      mockCulturalAssessmentService.calculateCulturalAssessmentResult.mockRejectedValue(new Error('Invalid scores'));

      const result = await getCulturalPhq9Result([-1, -2, -1]);
      
      expect(result.score).toBe(-4); // Sum of negative scores
    });
  });
});