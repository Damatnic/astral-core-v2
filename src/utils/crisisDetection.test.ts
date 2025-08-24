/**
 * Crisis Detection Test Suite
 * 
 * Comprehensive tests for crisis keyword detection, severity assessment,
 * and resource matching functionality.
 * 
 * @fileoverview Tests for crisis detection utility functions
 * @version 2.0.0
 */

import {
  detectCrisisKeywords,
  detectCrisisPatterns,
  calculateCrisisSeverity,
  analyzeCrisisText,
  generateCrisisRecommendations,
  validateCrisisConfig,
  CRISIS_KEYWORDS,
  DEFAULT_CRISIS_CONFIG,
  EMERGENCY_CONTACTS
} from './crisisDetection';

import { CrisisLevel, CrisisIndicator, CrisisDetectionResult } from '../types';

describe('Crisis Detection Utilities', () => {
  describe('detectCrisisKeywords', () => {
    describe('suicide keyword detection', () => {
      it('should detect direct suicide keywords', () => {
        const suicideTexts = [
          'I want to kill myself',
          'thinking about suicide',
          'my life is not worth living',
          'I would be better off dead',
          'I want to die',
          'I wish I was dead'
        ];

        suicideTexts.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('keyword');
          expect(indicators[0].severity).toBeGreaterThanOrEqual(6);
        });
      });

      it('should detect variations and case insensitive matches', () => {
        const variations = [
          'KILL MYSELF',
          'Kill Myself',
          'end my life',
          'END MY LIFE'
        ];

        variations.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBeGreaterThan(0);
        });
      });
    });

    describe('self-harm keyword detection', () => {
      it('should detect self-harm keywords', () => {
        const selfHarmTexts = [
          'I want to hurt myself',
          'thinking about self harm',
          'I have been cutting',
          'I want to harm myself',
          'I keep punishing myself'
        ];

        selfHarmTexts.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('keyword');
          expect(indicators[0].severity).toBeGreaterThanOrEqual(4);
        });
      });
    });

    describe('hopelessness keyword detection', () => {
      it('should detect hopelessness expressions', () => {
        const hopelessTexts = [
          'no hope left',
          'feeling hopeless',
          'everything is pointless',
          'nothing matters anymore',
          'I give up',
          'no future for me'
        ];

        hopelessTexts.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('keyword');
        });
      });
    });

    describe('isolation keyword detection', () => {
      it('should detect isolation and worthlessness', () => {
        const isolationTexts = [
          'I am alone',
          'nobody cares about me',
          'I have no friends',
          'feeling isolated',
          'I am worthless',
          'I am useless'
        ];

        isolationTexts.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('keyword');
        });
      });
    });

    describe('non-crisis text', () => {
      it('should not detect crisis in normal text', () => {
        const normalTexts = [
          'I had a great day today',
          'Looking forward to the weekend',
          'Just finished a good book',
          'The weather is nice',
          'Planning my vacation'
        ];

        normalTexts.forEach(text => {
          const indicators = detectCrisisKeywords(text);
          expect(indicators.length).toBe(0);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty or null input', () => {
        expect(detectCrisisKeywords('')).toEqual([]);
        expect(detectCrisisKeywords(null as any)).toEqual([]);
        expect(detectCrisisKeywords(undefined as any)).toEqual([]);
      });

      it('should handle very long text', () => {
        const longText = 'I want to kill myself. ' + 'This is filler text. '.repeat(1000);
        const indicators = detectCrisisKeywords(longText);
        expect(indicators.length).toBeGreaterThan(0);
      });
    });
  });

  describe('detectCrisisPatterns', () => {
    describe('method inquiry patterns', () => {
      it('should detect searches for harmful methods', () => {
        const methodTexts = [
          'how to kill myself',
          'ways to die',
          'methods of suicide',
          'how to hurt myself',
          'ways to end it all'
        ];

        methodTexts.forEach(text => {
          const indicators = detectCrisisPatterns(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('pattern');
          expect(indicators[0].severity).toBeGreaterThanOrEqual(8);
        });
      });
    });

    describe('goodbye message patterns', () => {
      it('should detect goodbye messages', () => {
        const goodbyeTexts = [
          'goodbye everyone',
          'this is goodbye',
          'final message to all',
          'goodbye cruel world',
          'my final words'
        ];

        goodbyeTexts.forEach(text => {
          const indicators = detectCrisisPatterns(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('pattern');
          expect(indicators[0].severity).toBe(10);
        });
      });
    });

    describe('time reference patterns', () => {
      it('should detect time-specific crisis references', () => {
        const timeTexts = [
          'tonight it will be over',
          'by tomorrow I will be gone',
          'won\'t be here much longer',
          'by morning I will be dead'
        ];

        timeTexts.forEach(text => {
          const indicators = detectCrisisPatterns(text);
          expect(indicators.length).toBeGreaterThan(0);
          expect(indicators[0].type).toBe('pattern');
          expect(indicators[0].severity).toBeGreaterThanOrEqual(7);
        });
      });
    });

    describe('non-pattern text', () => {
      it('should not detect patterns in normal text', () => {
        const normalTexts = [
          'How to cook dinner',
          'Ways to improve my skills',
          'Methods for studying',
          'Goodbye for now',
          'See you tomorrow'
        ];

        normalTexts.forEach(text => {
          const indicators = detectCrisisPatterns(text);
          expect(indicators.length).toBe(0);
        });
      });
    });
  });

  describe('calculateCrisisSeverity', () => {
    it('should return none level for empty indicators', () => {
      const result = calculateCrisisSeverity([]);
      expect(result.level).toBe('none');
      expect(result.score).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it('should calculate immediate level for high severity', () => {
      const indicators: CrisisIndicator[] = [
        {
          type: 'keyword',
          severity: 10,
          confidence: 0.9,
          description: 'Direct suicide reference'
        },
        {
          type: 'pattern',
          severity: 9,
          confidence: 0.8,
          description: 'Method inquiry'
        }
      ];

      const result = calculateCrisisSeverity(indicators);
      expect(result.level).toBe('immediate');
      expect(result.score).toBeGreaterThan(15);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should calculate high level for moderate severity', () => {
      const indicators: CrisisIndicator[] = [
        {
          type: 'keyword',
          severity: 6,
          confidence: 0.7,
          description: 'Hopelessness'
        },
        {
          type: 'keyword',
          severity: 8,
          confidence: 0.8,
          description: 'Self-harm reference'
        }
      ];

      const result = calculateCrisisSeverity(indicators);
      expect(result.level).toBe('high');
      expect(result.score).toBeGreaterThanOrEqual(10);
    });

    it('should calculate moderate level for lower severity', () => {
      const indicators: CrisisIndicator[] = [
        {
          type: 'keyword',
          severity: 4,
          confidence: 0.6,
          description: 'Isolation'
        },
        {
          type: 'keyword',
          severity: 3,
          confidence: 0.5,
          description: 'Distress'
        }
      ];

      const result = calculateCrisisSeverity(indicators);
      expect(result.level).toBe('moderate');
      expect(result.score).toBeLessThan(15);
    });
  });

  describe('analyzeCrisisText', () => {
    it('should perform comprehensive analysis', () => {
      const text = 'I want to kill myself tonight. I have no hope left.';
      const result = analyzeCrisisText(text);

      expect(result.crisisLevel).not.toBe('none');
      expect(result.indicators.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.textLength).toBe(text.length);
      expect(result.metadata.analysisTime).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const result = analyzeCrisisText('');
      expect(result.crisisLevel).toBe('none');
      expect(result.indicators.length).toBe(0);
      expect(result.metadata.textLength).toBe(0);
    });

    it('should truncate very long text', () => {
      const longText = 'I want to kill myself. ' + 'x'.repeat(20000);
      const result = analyzeCrisisText(longText, { maxAnalysisLength: 1000 });
      
      expect(result.metadata.textLength).toBe(1000);
    });

    it('should respect configuration options', () => {
      const text = 'I want to hurt myself';
      const config = {
        enableKeywordDetection: false,
        enablePatternMatching: true,
        enableSentimentAnalysis: false,
        severityThreshold: 8,
        confidenceThreshold: 0.8,
        maxAnalysisLength: 5000
      };

      const result = analyzeCrisisText(text, config);
      expect(result.metadata.config).toEqual(config);
    });
  });

  describe('generateCrisisRecommendations', () => {
    it('should provide immediate intervention for immediate crisis', () => {
      const recommendations = generateCrisisRecommendations('immediate', []);
      
      expect(recommendations).toContain('IMMEDIATE INTERVENTION REQUIRED');
      expect(recommendations).toContain('Contact emergency services (911)');
      expect(recommendations).toContain('988 Suicide & Crisis Lifeline');
    });

    it('should provide high priority recommendations for high crisis', () => {
      const recommendations = generateCrisisRecommendations('high', []);
      
      expect(recommendations).toContain('HIGH PRIORITY');
      expect(recommendations).toContain('urgent mental health appointment');
      expect(recommendations).toContain('988 Suicide & Crisis Lifeline');
    });

    it('should provide moderate recommendations for moderate crisis', () => {
      const recommendations = generateCrisisRecommendations('moderate', []);
      
      expect(recommendations).toContain('Schedule mental health appointment within 1-2 days');
      expect(recommendations).toContain('coping strategies');
    });

    it('should provide low-level recommendations for low crisis', () => {
      const recommendations = generateCrisisRecommendations('low', []);
      
      expect(recommendations).toContain('Consider scheduling mental health check-in');
      expect(recommendations).toContain('emotional support');
    });

    it('should provide basic recommendations for no crisis', () => {
      const recommendations = generateCrisisRecommendations('none', []);
      
      expect(recommendations).toContain('Continue providing supportive communication');
    });

    it('should add specific recommendations based on indicators', () => {
      const indicators: CrisisIndicator[] = [
        {
          type: 'keyword',
          severity: 4,
          confidence: 0.7,
          description: 'Social isolation',
          details: { category: 'isolation' }
        }
      ];

      const recommendations = generateCrisisRecommendations('moderate', indicators);
      expect(recommendations).toContain('reducing isolation and building connections');
    });

    it('should add self-harm specific recommendations', () => {
      const indicators: CrisisIndicator[] = [
        {
          type: 'keyword',
          severity: 8,
          confidence: 0.8,
          description: 'Self-harm behaviors',
          details: { category: 'selfHarm' }
        }
      ];

      const recommendations = generateCrisisRecommendations('high', indicators);
      expect(recommendations).toContain('Address self-harm behaviors with professional help');
    });
  });

  describe('validateCrisisConfig', () => {
    it('should return default config for empty input', () => {
      const result = validateCrisisConfig({});
      expect(result).toEqual(DEFAULT_CRISIS_CONFIG);
    });

    it('should merge partial config with defaults', () => {
      const partialConfig = {
        enableKeywordDetection: false,
        severityThreshold: 7
      };

      const result = validateCrisisConfig(partialConfig);
      expect(result.enableKeywordDetection).toBe(false);
      expect(result.severityThreshold).toBe(7);
      expect(result.enablePatternMatching).toBe(DEFAULT_CRISIS_CONFIG.enablePatternMatching);
    });

    it('should clamp values to valid ranges', () => {
      const invalidConfig = {
        severityThreshold: 15, // Should be clamped to 10
        confidenceThreshold: 1.5, // Should be clamped to 1
        maxAnalysisLength: 50 // Should be clamped to 100
      };

      const result = validateCrisisConfig(invalidConfig);
      expect(result.severityThreshold).toBe(10);
      expect(result.confidenceThreshold).toBe(1);
      expect(result.maxAnalysisLength).toBe(100);
    });

    it('should handle negative values', () => {
      const invalidConfig = {
        severityThreshold: -5,
        confidenceThreshold: -0.5,
        maxAnalysisLength: -100
      };

      const result = validateCrisisConfig(invalidConfig);
      expect(result.severityThreshold).toBe(0);
      expect(result.confidenceThreshold).toBe(0);
      expect(result.maxAnalysisLength).toBe(100);
    });
  });

  describe('Crisis Keywords Database', () => {
    it('should have all required keyword categories', () => {
      expect(CRISIS_KEYWORDS).toHaveProperty('suicide');
      expect(CRISIS_KEYWORDS).toHaveProperty('selfHarm');
      expect(CRISIS_KEYWORDS).toHaveProperty('hopelessness');
      expect(CRISIS_KEYWORDS).toHaveProperty('isolation');
      expect(CRISIS_KEYWORDS).toHaveProperty('distress');
      expect(CRISIS_KEYWORDS).toHaveProperty('depression');
    });

    it('should have properly structured keyword categories', () => {
      Object.values(CRISIS_KEYWORDS).forEach(category => {
        expect(category).toHaveProperty('keywords');
        expect(category).toHaveProperty('weight');
        expect(category).toHaveProperty('category');
        expect(category).toHaveProperty('description');
        expect(Array.isArray(category.keywords)).toBe(true);
        expect(typeof category.weight).toBe('number');
        expect(typeof category.description).toBe('string');
      });
    });

    it('should have keywords in descending severity order', () => {
      const categories = Object.values(CRISIS_KEYWORDS);
      for (let i = 0; i < categories.length - 1; i++) {
        expect(categories[i].weight).toBeGreaterThanOrEqual(categories[i + 1].weight);
      }
    });
  });

  describe('Emergency Contacts', () => {
    it('should have all required emergency contacts', () => {
      expect(EMERGENCY_CONTACTS).toHaveProperty('suicide_lifeline');
      expect(EMERGENCY_CONTACTS).toHaveProperty('crisis_text_line');
      expect(EMERGENCY_CONTACTS).toHaveProperty('emergency');
    });

    it('should have properly structured contact information', () => {
      Object.values(EMERGENCY_CONTACTS).forEach(contact => {
        expect(contact).toHaveProperty('name');
        expect(contact).toHaveProperty('available');
        expect(typeof contact.name).toBe('string');
        expect(typeof contact.available).toBe('string');
      });
    });

    it('should have 24/7 availability for critical contacts', () => {
      expect(EMERGENCY_CONTACTS.suicide_lifeline.available).toBe('24/7');
      expect(EMERGENCY_CONTACTS.crisis_text_line.available).toBe('24/7');
      expect(EMERGENCY_CONTACTS.emergency.available).toBe('24/7');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex crisis scenarios', () => {
      const complexText = `
        I've been feeling really hopeless lately. Nobody cares about me anymore.
        I keep thinking about suicide and how to kill myself. Tonight might be the night.
        I have a plan and I've been researching methods. This is my final message.
        Goodbye everyone, I won't be here much longer.
      `;

      const result = analyzeCrisisText(complexText);
      
      expect(result.crisisLevel).toBe('immediate');
      expect(result.indicators.length).toBeGreaterThan(5);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.recommendations).toContain('IMMEDIATE INTERVENTION REQUIRED');
    });

    it('should provide appropriate response for mild distress', () => {
      const mildText = `
        I've been feeling a bit down lately and overwhelmed with work.
        Sometimes I feel alone but I know I have friends who care.
        Just having a tough time right now.
      `;

      const result = analyzeCrisisText(mildText);
      
      expect(result.crisisLevel).toBeOneOf(['low', 'moderate', 'none']);
      expect(result.recommendations).not.toContain('IMMEDIATE INTERVENTION REQUIRED');
    });
  });

  describe('Performance Tests', () => {
    it('should analyze text quickly', () => {
      const text = 'I want to kill myself' + ' and hurt myself'.repeat(100);
      const startTime = Date.now();
      
      analyzeCrisisText(text);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent analysis', async () => {
      const texts = [
        'I want to kill myself',
        'I am feeling hopeless',
        'Nobody cares about me',
        'I want to hurt myself',
        'This is my goodbye message'
      ];

      const promises = texts.map(text => 
        Promise.resolve(analyzeCrisisText(text))
      );

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toHaveProperty('crisisLevel');
        expect(result).toHaveProperty('indicators');
        expect(result).toHaveProperty('recommendations');
      });
    });
  });
});
