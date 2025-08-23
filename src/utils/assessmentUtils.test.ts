/**
 * @jest-environment jsdom
 */

import {
  AssessmentQuestion,
  AssessmentResult,
  phq9Questions,
  gad7Questions,
  getPhq9Result,
  getGad7Result,
} from './assessmentUtils';

describe('assessmentUtils', () => {
  describe('PHQ-9 Questions', () => {
    test('should have exactly 9 questions for PHQ-9', () => {
      expect(phq9Questions).toHaveLength(9);
    });

    test('should have proper structure for each PHQ-9 question', () => {
      phq9Questions.forEach((question, index) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('options');

        expect(question.id).toBe(`phq9-${index + 1}`);
        expect(typeof question.text).toBe('string');
        expect(question.text.length).toBeGreaterThan(0);
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options).toHaveLength(4);
      });
    });

    test('should have consistent option structure for PHQ-9', () => {
      const expectedValues = [0, 1, 2, 3];
      const expectedTexts = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

      phq9Questions.forEach(question => {
        question.options.forEach((option, index) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('text');
          expect(option.value).toBe(expectedValues[index]);
          expect(option.text).toBe(expectedTexts[index]);
        });
      });
    });

    test('should have valid PHQ-9 question content', () => {
      const expectedQuestionContent = [
        'Little interest or pleasure in doing things',
        'Feeling down, depressed, or hopeless',
        'Trouble falling or staying asleep, or sleeping too much',
        'Feeling tired or having little energy',
        'Poor appetite or overeating',
        'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
        'Trouble concentrating on things, such as reading the newspaper or watching television',
        'Moving or speaking so slowly that other people could have noticed or being so fidgety or restless that you have been moving around a lot more than usual',
        'Thoughts that you would be better off dead, or of hurting yourself'
      ];

      expectedQuestionContent.forEach((expectedText, index) => {
        expect(phq9Questions[index].text).toBe(expectedText);
      });
    });

    test('should have unique IDs for PHQ-9 questions', () => {
      const ids = phq9Questions.map(q => q.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);
    });
  });

  describe('GAD-7 Questions', () => {
    test('should have exactly 7 questions for GAD-7', () => {
      expect(gad7Questions).toHaveLength(7);
    });

    test('should have proper structure for each GAD-7 question', () => {
      gad7Questions.forEach((question, index) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('options');

        expect(question.id).toBe(`gad7-${index + 1}`);
        expect(typeof question.text).toBe('string');
        expect(question.text.length).toBeGreaterThan(0);
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options).toHaveLength(4);
      });
    });

    test('should have consistent option structure for GAD-7', () => {
      const expectedValues = [0, 1, 2, 3];
      const expectedTexts = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

      gad7Questions.forEach(question => {
        question.options.forEach((option, index) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('text');
          expect(option.value).toBe(expectedValues[index]);
          expect(option.text).toBe(expectedTexts[index]);
        });
      });
    });

    test('should have valid GAD-7 question content', () => {
      const expectedQuestionContent = [
        'Feeling nervous, anxious, or on edge',
        'Not being able to stop or control worrying',
        'Worrying too much about different things',
        'Trouble relaxing',
        'Being so restless that it is hard to sit still',
        'Becoming easily annoyed or irritable',
        'Feeling afraid, as if something awful might happen'
      ];

      expectedQuestionContent.forEach((expectedText, index) => {
        expect(gad7Questions[index].text).toBe(expectedText);
      });
    });

    test('should have unique IDs for GAD-7 questions', () => {
      const ids = gad7Questions.map(q => q.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);
    });
  });

  describe('getPhq9Result', () => {
    test('should classify minimal depression (0-4)', () => {
      const testCases = [0, 2, 4];
      
      testCases.forEach(score => {
        const result = getPhq9Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Minimal Depression');
        expect(result.recommendation).toContain('minimal depression');
        expect(result.recommendation).toContain('monitoring');
        expect(result.recommendation).toContain('healthy lifestyle');
      });
    });

    test('should classify mild depression (5-9)', () => {
      const testCases = [5, 7, 9];
      
      testCases.forEach(score => {
        const result = getPhq9Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Mild Depression');
        expect(result.recommendation).toContain('mild depression');
        expect(result.recommendation).toContain('mental health professional');
        expect(result.recommendation).toContain('support and guidance');
      });
    });

    test('should classify moderate depression (10-14)', () => {
      const testCases = [10, 12, 14];
      
      testCases.forEach(score => {
        const result = getPhq9Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Moderate Depression');
        expect(result.recommendation).toContain('moderate depression');
        expect(result.recommendation).toContain('healthcare provider');
        expect(result.recommendation).toContain('treatment options');
      });
    });

    test('should classify moderately severe depression (15-19)', () => {
      const testCases = [15, 17, 19];
      
      testCases.forEach(score => {
        const result = getPhq9Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Moderately Severe Depression');
        expect(result.recommendation).toContain('moderately severe depression');
        expect(result.recommendation).toContain('professional help soon');
        expect(result.recommendation).toContain('evaluation and treatment');
      });
    });

    test('should classify severe depression (20+)', () => {
      const testCases = [20, 22, 25, 27]; // Max possible is 27
      
      testCases.forEach(score => {
        const result = getPhq9Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Severe Depression');
        expect(result.recommendation).toContain('severe depression');
        expect(result.recommendation).toContain('strongly recommend');
        expect(result.recommendation).toContain('immediately');
        expect(result.recommendation).toContain('mental health professional');
      });
    });

    test('should handle boundary cases correctly', () => {
      const boundaryTests = [
        { score: 4, expectedSeverity: 'Minimal Depression' },
        { score: 5, expectedSeverity: 'Mild Depression' },
        { score: 9, expectedSeverity: 'Mild Depression' },
        { score: 10, expectedSeverity: 'Moderate Depression' },
        { score: 14, expectedSeverity: 'Moderate Depression' },
        { score: 15, expectedSeverity: 'Moderately Severe Depression' },
        { score: 19, expectedSeverity: 'Moderately Severe Depression' },
        { score: 20, expectedSeverity: 'Severe Depression' },
      ];

      boundaryTests.forEach(({ score, expectedSeverity }) => {
        const result = getPhq9Result(score);
        expect(result.severity).toBe(expectedSeverity);
        expect(result.score).toBe(score);
      });
    });

    test('should handle edge cases and invalid inputs', () => {
      // Negative scores (though shouldn't happen in real use)
      const negativeResult = getPhq9Result(-1);
      expect(negativeResult.severity).toBe('Minimal Depression');
      expect(negativeResult.score).toBe(-1);

      // Very high scores
      const highResult = getPhq9Result(100);
      expect(highResult.severity).toBe('Severe Depression');
      expect(highResult.score).toBe(100);

      // Zero score
      const zeroResult = getPhq9Result(0);
      expect(zeroResult.severity).toBe('Minimal Depression');
      expect(zeroResult.score).toBe(0);
    });

    test('should return AssessmentResult with all required properties', () => {
      const result = getPhq9Result(10);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendation');
      
      expect(typeof result.score).toBe('number');
      expect(typeof result.severity).toBe('string');
      expect(typeof result.recommendation).toBe('string');
      
      expect(result.severity.length).toBeGreaterThan(0);
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('getGad7Result', () => {
    test('should classify minimal anxiety (0-4)', () => {
      const testCases = [0, 2, 4];
      
      testCases.forEach(score => {
        const result = getGad7Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Minimal Anxiety');
        expect(result.recommendation).toContain('minimal anxiety');
        expect(result.recommendation).toContain('stress management');
        expect(result.recommendation).toContain('healthy coping strategies');
      });
    });

    test('should classify mild anxiety (5-9)', () => {
      const testCases = [5, 7, 9];
      
      testCases.forEach(score => {
        const result = getGad7Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Mild Anxiety');
        expect(result.recommendation).toContain('mild anxiety');
        expect(result.recommendation).toContain('relaxation techniques');
        expect(result.recommendation).toContain('mental health professional');
      });
    });

    test('should classify moderate anxiety (10-14)', () => {
      const testCases = [10, 12, 14];
      
      testCases.forEach(score => {
        const result = getGad7Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Moderate Anxiety');
        expect(result.recommendation).toContain('moderate anxiety');
        expect(result.recommendation).toContain('healthcare provider');
        expect(result.recommendation).toContain('treatment options');
        expect(result.recommendation).toContain('coping strategies');
      });
    });

    test('should classify severe anxiety (15+)', () => {
      const testCases = [15, 18, 21]; // Max possible is 21
      
      testCases.forEach(score => {
        const result = getGad7Result(score);
        
        expect(result.score).toBe(score);
        expect(result.severity).toBe('Severe Anxiety');
        expect(result.recommendation).toContain('severe anxiety');
        expect(result.recommendation).toContain('professional help soon');
        expect(result.recommendation).toContain('evaluation and treatment');
        expect(result.recommendation).toContain('quality of life');
      });
    });

    test('should handle boundary cases correctly', () => {
      const boundaryTests = [
        { score: 4, expectedSeverity: 'Minimal Anxiety' },
        { score: 5, expectedSeverity: 'Mild Anxiety' },
        { score: 9, expectedSeverity: 'Mild Anxiety' },
        { score: 10, expectedSeverity: 'Moderate Anxiety' },
        { score: 14, expectedSeverity: 'Moderate Anxiety' },
        { score: 15, expectedSeverity: 'Severe Anxiety' },
      ];

      boundaryTests.forEach(({ score, expectedSeverity }) => {
        const result = getGad7Result(score);
        expect(result.severity).toBe(expectedSeverity);
        expect(result.score).toBe(score);
      });
    });

    test('should handle edge cases and invalid inputs', () => {
      // Negative scores
      const negativeResult = getGad7Result(-1);
      expect(negativeResult.severity).toBe('Minimal Anxiety');
      expect(negativeResult.score).toBe(-1);

      // Very high scores
      const highResult = getGad7Result(100);
      expect(highResult.severity).toBe('Severe Anxiety');
      expect(highResult.score).toBe(100);

      // Zero score
      const zeroResult = getGad7Result(0);
      expect(zeroResult.severity).toBe('Minimal Anxiety');
      expect(zeroResult.score).toBe(0);
    });

    test('should return AssessmentResult with all required properties', () => {
      const result = getGad7Result(8);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('recommendation');
      
      expect(typeof result.score).toBe('number');
      expect(typeof result.severity).toBe('string');
      expect(typeof result.recommendation).toBe('string');
      
      expect(result.severity.length).toBeGreaterThan(0);
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('Assessment scoring calculation', () => {
    test('should have correct maximum possible scores', () => {
      // PHQ-9 has 9 questions, each with max score of 3
      const maxPhq9Score = phq9Questions.length * 3;
      expect(maxPhq9Score).toBe(27);

      // GAD-7 has 7 questions, each with max score of 3
      const maxGad7Score = gad7Questions.length * 3;
      expect(maxGad7Score).toBe(21);
    });

    test('should have valid score ranges for all categories', () => {
      // Test all possible PHQ-9 scores
      for (let score = 0; score <= 27; score++) {
        const result = getPhq9Result(score);
        expect(result.score).toBe(score);
        expect(['Minimal Depression', 'Mild Depression', 'Moderate Depression', 'Moderately Severe Depression', 'Severe Depression']).toContain(result.severity);
      }

      // Test all possible GAD-7 scores
      for (let score = 0; score <= 21; score++) {
        const result = getGad7Result(score);
        expect(result.score).toBe(score);
        expect(['Minimal Anxiety', 'Mild Anxiety', 'Moderate Anxiety', 'Severe Anxiety']).toContain(result.severity);
      }
    });

    test('should calculate actual assessment scores from answers', () => {
      // Test PHQ-9 scoring
      const phq9Answers = [0, 1, 2, 3, 0, 1, 2, 3, 1]; // Sum = 13
      const phq9Score = phq9Answers.reduce((sum, answer) => sum + answer, 0);
      expect(phq9Score).toBe(13);

      const phq9Result = getPhq9Result(phq9Score);
      expect(phq9Result.severity).toBe('Moderate Depression');

      // Test GAD-7 scoring
      const gad7Answers = [2, 2, 1, 3, 0, 1, 2]; // Sum = 11
      const gad7Score = gad7Answers.reduce((sum, answer) => sum + answer, 0);
      expect(gad7Score).toBe(11);

      const gad7Result = getGad7Result(gad7Score);
      expect(gad7Result.severity).toBe('Moderate Anxiety');
    });
  });

  describe('Assessment question validation', () => {
    test('should have proper TypeScript interfaces', () => {
      // Test AssessmentQuestion interface compliance
      const sampleQuestion: AssessmentQuestion = phq9Questions[0];
      expect(typeof sampleQuestion.id).toBe('string');
      expect(typeof sampleQuestion.text).toBe('string');
      expect(Array.isArray(sampleQuestion.options)).toBe(true);
      
      sampleQuestion.options.forEach(option => {
        expect(typeof option.value).toBe('number');
        expect(typeof option.text).toBe('string');
      });
    });

    test('should have proper AssessmentResult interface compliance', () => {
      const sampleResult: AssessmentResult = getPhq9Result(10);
      expect(typeof sampleResult.score).toBe('number');
      expect(typeof sampleResult.severity).toBe('string');
      expect(typeof sampleResult.recommendation).toBe('string');
    });

    test('should ensure all question options have ascending values', () => {
      [...phq9Questions, ...gad7Questions].forEach(question => {
        for (let i = 1; i < question.options.length; i++) {
          expect(question.options[i].value).toBeGreaterThan(question.options[i - 1].value);
        }
      });
    });

    test('should ensure all question options start with value 0', () => {
      [...phq9Questions, ...gad7Questions].forEach(question => {
        expect(question.options[0].value).toBe(0);
      });
    });
  });

  describe('Clinical validity and guidelines', () => {
    test('should follow PHQ-9 clinical scoring guidelines', () => {
      // Based on standard PHQ-9 interpretation guidelines
      const clinicalCategories = [
        { range: [0, 4], severity: 'Minimal Depression', description: 'no significant depression' },
        { range: [5, 9], severity: 'Mild Depression', description: 'mild depression symptoms' },
        { range: [10, 14], severity: 'Moderate Depression', description: 'moderate depression requiring intervention' },
        { range: [15, 19], severity: 'Moderately Severe Depression', description: 'moderately severe requiring treatment' },
        { range: [20, 27], severity: 'Severe Depression', description: 'severe depression requiring immediate attention' }
      ];

      clinicalCategories.forEach(({ range, severity }) => {
        const [min, max] = range;
        
        // Test boundary values
        expect(getPhq9Result(min).severity).toBe(severity);
        expect(getPhq9Result(max).severity).toBe(severity);
        
        // Test middle values
        const mid = Math.floor((min + max) / 2);
        expect(getPhq9Result(mid).severity).toBe(severity);
      });
    });

    test('should follow GAD-7 clinical scoring guidelines', () => {
      // Based on standard GAD-7 interpretation guidelines
      const clinicalCategories = [
        { range: [0, 4], severity: 'Minimal Anxiety', description: 'no significant anxiety' },
        { range: [5, 9], severity: 'Mild Anxiety', description: 'mild anxiety symptoms' },
        { range: [10, 14], severity: 'Moderate Anxiety', description: 'moderate anxiety requiring intervention' },
        { range: [15, 21], severity: 'Severe Anxiety', description: 'severe anxiety requiring treatment' }
      ];

      clinicalCategories.forEach(({ range, severity }) => {
        const [min, max] = range;
        
        // Test boundary values
        expect(getGad7Result(min).severity).toBe(severity);
        expect(getGad7Result(max).severity).toBe(severity);
        
        // Test middle values
        const mid = Math.floor((min + max) / 2);
        expect(getGad7Result(mid).severity).toBe(severity);
      });
    });

    test('should provide appropriate clinical recommendations', () => {
      // Minimal levels should encourage self-monitoring
      expect(getPhq9Result(2).recommendation).toMatch(/monitor/i);
      expect(getGad7Result(2).recommendation).toMatch(/stress management/i);

      // Mild levels should suggest professional consultation
      expect(getPhq9Result(7).recommendation).toMatch(/mental health professional/i);
      expect(getGad7Result(7).recommendation).toMatch(/mental health professional/i);

      // Moderate levels should recommend treatment
      expect(getPhq9Result(12).recommendation).toMatch(/healthcare provider.*treatment/i);
      expect(getGad7Result(12).recommendation).toMatch(/healthcare provider.*treatment/i);

      // Severe levels should indicate urgency
      expect(getPhq9Result(22).recommendation).toMatch(/strongly recommend.*immediately/i);
      expect(getGad7Result(18).recommendation).toMatch(/professional help soon/i);
    });
  });

  describe('Integration and usage scenarios', () => {
    test('should handle typical assessment workflow', () => {
      // Simulate user taking PHQ-9 assessment
      const userAnswers = [1, 2, 1, 2, 0, 1, 1, 0, 0]; // Total: 8
      const totalScore = userAnswers.reduce((sum, answer) => sum + answer, 0);
      
      expect(totalScore).toBe(8);
      
      const result = getPhq9Result(totalScore);
      expect(result.severity).toBe('Mild Depression');
      expect(result.recommendation).toContain('mild depression');
      
      // Verify the assessment can be stored/serialized
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(result);
    });

    test('should handle assessment comparison over time', () => {
      const assessmentHistory = [
        { date: '2024-01-01', score: 15 },
        { date: '2024-01-15', score: 12 },
        { date: '2024-02-01', score: 8 },
        { date: '2024-02-15', score: 5 },
      ];

      const results = assessmentHistory.map(assessment => ({
        ...assessment,
        result: getPhq9Result(assessment.score)
      }));

      // Should show improvement over time
      expect(results[0].result.severity).toBe('Moderately Severe Depression');
      expect(results[1].result.severity).toBe('Moderate Depression');
      expect(results[2].result.severity).toBe('Mild Depression');
      expect(results[3].result.severity).toBe('Mild Depression');

      // Each assessment should be independent
      results.forEach(({ score, result }) => {
        expect(result.score).toBe(score);
      });
    });

    test('should support both assessment types in same system', () => {
      const userScenarios = [
        { phq9Score: 6, gad7Score: 12, expectedPhq9: 'Mild Depression', expectedGad7: 'Moderate Anxiety' },
        { phq9Score: 16, gad7Score: 7, expectedPhq9: 'Moderately Severe Depression', expectedGad7: 'Mild Anxiety' },
        { phq9Score: 3, gad7Score: 2, expectedPhq9: 'Minimal Depression', expectedGad7: 'Minimal Anxiety' },
      ];

      userScenarios.forEach(({ phq9Score, gad7Score, expectedPhq9, expectedGad7 }) => {
        const phq9Result = getPhq9Result(phq9Score);
        const gad7Result = getGad7Result(gad7Score);

        expect(phq9Result.severity).toBe(expectedPhq9);
        expect(gad7Result.severity).toBe(expectedGad7);

        // Both assessments should be independent
        expect(phq9Result.score).toBe(phq9Score);
        expect(gad7Result.score).toBe(gad7Score);
      });
    });
  });

  describe('Performance and memory considerations', () => {
    test('should handle rapid assessment calculations efficiently', () => {
      const startTime = performance.now();

      // Simulate many rapid assessments
      for (let i = 0; i <= 1000; i++) {
        const phq9Score = i % 28; // 0-27
        const gad7Score = i % 22; // 0-21
        
        getPhq9Result(phq9Score);
        getGad7Result(gad7Score);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 2000 assessments quickly (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should not mutate original question arrays', () => {
      const originalPhq9 = JSON.parse(JSON.stringify(phq9Questions));
      const originalGad7 = JSON.parse(JSON.stringify(gad7Questions));

      // Perform operations
      getPhq9Result(10);
      getGad7Result(8);

      // Arrays should remain unchanged
      expect(phq9Questions).toEqual(originalPhq9);
      expect(gad7Questions).toEqual(originalGad7);
    });

    test('should create new result objects each time', () => {
      const result1 = getPhq9Result(10);
      const result2 = getPhq9Result(10);

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different object references
    });
  });
});