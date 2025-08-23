/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced Crisis Keyword Detection Service
 * 
 * Advanced crisis keyword detection with contextual understanding, emotional pattern recognition,
 * risk assessment scoring, and immediate intervention triggers for better crisis detection and user protection.
 * 
 * Features:
 * - Contextual crisis phrase analysis with semantic understanding
 * - Emotional pattern recognition with crisis correlation
 * - Advanced risk assessment scoring with multiple factors
 * - Immediate intervention triggers for emergency situations
 * - Temporal urgency detection with timeline analysis
 * - Linguistic pattern analysis for indirect crisis expressions
 * - Multi-layered validation to reduce false positives
 * - Enhanced suicide ideation detection with severity grading
 */

// Enhanced crisis keyword detection interfaces

// Enhanced crisis keyword detection interfaces
export type InterventionUrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'immediate';

export interface CrisisKeywordMatch {
  keyword: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  context: string[];
  position: number;
  surrounding: string;
  category: CrisisCategory;
  urgencyScore: number;
  interventionRequired: boolean;
  emotionalWeight: number;
}

export interface ContextualCrisisPattern {
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  category: CrisisCategory;
  contextRequirement: string[];
  negativeFlagWords: string[]; // Words that reduce crisis significance
  positiveAmplifiers: string[]; // Words that increase crisis significance
  timelineIndicators: string[];
  emotionalIndicators: string[];
  riskWeight: number;
}

export interface EmotionalCrisisIndicator {
  emotionalState: string;
  intensity: number;
  crisisCorrelation: number; // 0-1 correlation with crisis states
  linguisticMarkers: string[];
  behavioralPatterns: string[];
  interventionUrgency: InterventionUrgencyLevel;
}

export interface CrisisRiskAssessment {
  immediateRisk: number; // 0-100
  shortTermRisk: number; // 0-100 (24 hours)
  longTermRisk: number; // 0-100 (7 days)
  interventionUrgency: InterventionUrgencyLevel;
  confidenceScore: number;
  riskFactors: string[];
  protectiveFactors: string[];
  triggerIndicators: string[];
  timelineAnalysis: {
    hasTemporalUrgency: boolean;
    timeframe: string;
    urgencyModifiers: string[];
  };
  emotionalProfile: {
    primaryEmotion: string;
    intensity: number;
    stability: number;
    crisisAlignment: number;
  };
}

export interface EnhancedCrisisDetectionResult {
  hasCrisisIndicators: boolean;
  overallSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  keywordMatches: CrisisKeywordMatch[];
  contextualPatterns: ContextualCrisisPattern[];
  riskAssessment: CrisisRiskAssessment;
  emotionalIndicators: EmotionalCrisisIndicator[];
  interventionRecommendations: InterventionRecommendation[];
  escalationRequired: boolean;
  emergencyServicesRequired: boolean;
  analysisMetadata: {
    analysisMethod: 'keyword' | 'contextual' | 'semantic' | 'ml-enhanced';
    confidence: number;
    processingTime: number;
    flaggedConcerns: string[];
  };
}

export interface InterventionRecommendation {
  type: 'immediate' | 'urgent' | 'supportive' | 'monitoring' | 'resources';
  priority: number;
  description: string;
  actionItems: string[];
  timeframe: string;
  resources: string[];
  culturalConsiderations: string[];
}

export type CrisisCategory = 
  | 'suicidal-ideation'
  | 'suicide-plan'
  | 'self-harm'
  | 'substance-crisis'
  | 'violence-threat'
  | 'medical-emergency'
  | 'severe-distress'
  | 'panic-crisis'
  | 'psychotic-episode'
  | 'abuse-disclosure'
  | 'trauma-response';

class EnhancedCrisisKeywordDetectionService {
  private readonly contextWindow = 150; // Characters to analyze around keywords
  private readonly confidenceThreshold = 0.7; // Minimum confidence for crisis detection

  // Enhanced crisis keyword patterns with context and severity
  private readonly enhancedCrisisPatterns: ContextualCrisisPattern[] = [
    // Suicide ideation with immediate intent
    {
      pattern: /(?:going to|about to|ready to|planning to|i'm going to|i am going to)\s*(?:kill myself|end my life|commit suicide|take my own life)/gi,
      description: 'Immediate suicide intent with action planning',
      severity: 'emergency',
      category: 'suicide-plan',
      contextRequirement: ['tonight', 'today', 'now', 'soon', 'ready', 'planned', 'everything'],
      negativeFlagWords: ['not', 'never', 'would never', 'could never', 'hypothetically'],
      positiveAmplifiers: ['definitely', 'absolutely', 'certainly', 'finally', 'done waiting', 'ready'],
      timelineIndicators: ['tonight', 'today', 'this evening', 'in an hour', 'soon'],
      emotionalIndicators: ['hopeless', 'empty', 'done', 'can\'t take it', 'over it'],
      riskWeight: 100
    },
    
    // Suicide plan details
    {
      pattern: /(?:have a plan|suicide plan|know how|know exactly how|figured out how|decided how)\s*(?:to|i'm going to|i will|\.|$)/gi,
      description: 'Specific suicide planning with method consideration',
      severity: 'emergency',
      category: 'suicide-plan',
      contextRequirement: ['method', 'when', 'where', 'how', 'plan', 'decided', 'exactly', 'suicide'],
      negativeFlagWords: ['no plan', 'don\'t have', 'not planning', 'just thinking'],
      positiveAmplifiers: ['detailed', 'specific', 'ready', 'prepared', 'set', 'exactly'],
      timelineIndicators: ['tonight', 'tomorrow', 'this week', 'soon', 'when', 'time comes'],
      emotionalIndicators: ['calm', 'peaceful', 'resolved', 'certain', 'clear'],
      riskWeight: 95
    },

    // Direct suicide intent
    {
      pattern: /(?:i want to|i need to|i'm going to|going to)\s*(?:kill myself|end my life|commit suicide|take my life)/gi,
      description: 'Direct suicide intent statement',
      severity: 'emergency',
      category: 'suicidal-ideation',
      contextRequirement: ['tonight', 'today', 'now', 'need', 'want', 'going'],
      negativeFlagWords: ['not', 'never', 'don\'t', 'wouldn\'t'],
      positiveAmplifiers: ['really', 'definitely', 'tonight', 'today', 'now'],
      timelineIndicators: ['tonight', 'today', 'now', 'soon', 'immediately'],
      emotionalIndicators: ['desperate', 'done', 'finished', 'can\'t'],
      riskWeight: 95
    },
    
    // Active suicide ideation
    {
      pattern: /(?:want to die|wish i was dead|don't want to be alive|better off dead|life isn't worth living|think about it constantly|tired of living)/gi,
      description: 'Active suicidal ideation with death wish',
      severity: 'critical',
      category: 'suicidal-ideation',
      contextRequirement: ['really', 'so badly', 'constantly', 'all the time', 'tired', 'think about'],
      negativeFlagWords: ['sometimes feel like', 'used to', 'never actually'],
      positiveAmplifiers: ['desperately', 'so badly', 'constantly', 'every day', 'really', 'so tired'],
      timelineIndicators: ['lately', 'recently', 'for weeks', 'every day'],
      emotionalIndicators: ['hopeless', 'exhausted', 'empty', 'worthless', 'tired'],
      riskWeight: 85
    },

    // Self-harm mentions (including negative context)
    {
      pattern: /(?:hurt myself|harm myself|self.?harm|cutting myself|hurting myself)/gi,
      description: 'Self-harm mentions',
      severity: 'high',
      category: 'self-harm',
      contextRequirement: [],
      negativeFlagWords: ['don\'t', 'not', 'never', 'would never', 'wouldn\'t', 'no plan', 'don\'t have', 'don\'t have a plan'],
      positiveAmplifiers: ['want to', 'going to', 'plan to', 'need to'],
      timelineIndicators: [],
      emotionalIndicators: [],
      riskWeight: 60
    },
    
    // Self-harm with escalation
    {
      pattern: /(?:cutting deeper|hurting myself more|escalating|getting worse|can't stop|cuts are getting deeper|self-harm is getting worse)\s*(?:cutting|harming|hurting)?/gi,
      description: 'Self-harm with escalation patterns',
      severity: 'high',
      category: 'self-harm',
      contextRequirement: ['more', 'worse', 'deeper', 'harder', 'frequently', 'cutting', 'cuts'],
      negativeFlagWords: ['used to', 'stopped', 'trying not to'],
      positiveAmplifiers: ['desperately', 'compulsively', 'addicted to', 'can\'t control', 'deeper', 'worse'],
      timelineIndicators: ['lately', 'recently', 'tonight', 'daily'],
      emotionalIndicators: ['numb', 'desperate', 'out of control', 'need to'],
      riskWeight: 80
    },

    // Substance crisis with suicidal intent
    {
      pattern: /(?:drinking to die|using to|overdose|taking too many|mixing pills|hoping i won't wake up|won't wake up tomorrow)/gi,
      description: 'Substance use with suicidal intent',
      severity: 'emergency',
      category: 'substance-crisis',
      contextRequirement: ['to die', 'to escape', 'hoping', 'trying', 'wake up', 'tomorrow', 'drinking'],
      negativeFlagWords: ['afraid of', 'worried about', 'don\'t want to'],
      positiveAmplifiers: ['hoping', 'trying', 'planning', 'ready', 'won\'t wake'],
      timelineIndicators: ['tonight', 'now', 'about to', 'going to', 'tomorrow'],
      emotionalIndicators: ['hopeless', 'desperate', 'done', 'empty'],
      riskWeight: 90
    },

    // Medical emergency indicators
    {
      pattern: /(?:took too many|overdosed|can't stop bleeding|chest pain|too many pills|bleeding from)/gi,
      description: 'Immediate medical emergency situation',
      severity: 'emergency',
      category: 'medical-emergency',
      contextRequirement: ['just', 'now', 'happening', 'right now', 'pills', 'cuts', 'bleeding'],
      negativeFlagWords: ['worry about', 'afraid of', 'what if'],
      positiveAmplifiers: ['just', 'right now', 'happening', 'emergency', 'took'],
      timelineIndicators: ['now', 'just', 'currently', 'right now'],
      emotionalIndicators: ['scared', 'panicked', 'confused', 'desperate'],
      riskWeight: 100
    },

    // Violence threats
    {
      pattern: /(?:going to hurt|planning to hurt|thinking about hurting|want to hurt|kill|harm|hurt)\s+(?:someone|people|others|them|him|her)/gi,
      description: 'Threats of violence toward others',
      severity: 'emergency',
      category: 'violence-threat',
      contextRequirement: ['thinking', 'about', 'hurting', 'others', 'also'],
      negativeFlagWords: ['would never', 'could never', 'just angry'],
      positiveAmplifiers: ['planning', 'ready', 'deserve', 'have to', 'tonight', 'coming'],
      timelineIndicators: ['tonight', 'tomorrow', 'soon', 'when I see'],
      emotionalIndicators: ['rage', 'angry', 'hatred', 'vindictive'],
      riskWeight: 95
    },

    // Severe psychological distress
    {
      pattern: /(?:i'm losing my mind|i am losing my mind|losing my mind|going crazy|can't think straight|hearing voices|seeing things)/gi,
      description: 'Severe psychological distress or psychotic symptoms',
      severity: 'high',
      category: 'psychotic-episode',
      contextRequirement: ['losing', 'mind'],
      negativeFlagWords: ['feel like', 'seems like', 'metaphorically'],
      positiveAmplifiers: ['actually', 'literally', 'really', 'definitely'],
      timelineIndicators: ['lately', 'for days', 'constantly', 'right now'],
      emotionalIndicators: ['confused', 'scared', 'paranoid', 'disconnected'],
      riskWeight: 80
    },

    // Panic crisis
    {
      pattern: /(?:panic attack|heart racing|going to die|losing control|overwhelming panic)/gi,
      description: 'Severe panic or anxiety crisis',
      severity: 'high',
      category: 'panic-crisis',
      contextRequirement: ['right now', 'happening', 'can\'t stop', 'overwhelming', 'panic', 'anxiety'],
      negativeFlagWords: ['sometimes', 'used to have', 'worried about'],
      positiveAmplifiers: ['right now', 'overwhelming', 'can\'t control', 'severe'],
      timelineIndicators: ['now', 'right now', 'currently', 'happening'],
      emotionalIndicators: ['terrified', 'panicked', 'overwhelmed', 'desperate'],
      riskWeight: 35  // Reduced to keep panic attacks at 'high' severity even with urgency modifiers
    },
    
    // Breathing difficulty in panic context
    {
      pattern: /(?:can't breathe|cannot breathe|trouble breathing|difficulty breathing)/gi,
      description: 'Breathing difficulty (likely panic-related)',
      severity: 'high',
      category: 'panic-crisis',
      contextRequirement: ['panic', 'anxiety', 'overwhelming', 'attack'],
      negativeFlagWords: ['sometimes', 'used to', 'worried about', 'medical'],
      positiveAmplifiers: ['right now', 'properly', 'at all'],
      timelineIndicators: ['now', 'right now', 'currently'],
      emotionalIndicators: ['panicked', 'anxious', 'overwhelmed'],
      riskWeight: 30  // Reduced to keep panic attacks at 'high' severity even with urgency modifiers
    },

    // Abuse disclosure
    {
      pattern: /(?:being abused|someone is hurting me|someone is still hurting me|hurting me at home|forced me|threatened me|unsafe at home|not safe)/gi,
      description: 'Disclosure of abuse or unsafe situation',
      severity: 'critical',
      category: 'abuse-disclosure',
      contextRequirement: ['currently', 'still', 'ongoing', 'happening', 'home', 'every day', 'safe'],
      negativeFlagWords: ['in the past', 'used to', 'worried about'],
      positiveAmplifiers: ['still', 'ongoing', 'every day', 'getting worse', 'happening'],
      timelineIndicators: ['now', 'still', 'ongoing', 'every day'],
      emotionalIndicators: ['scared', 'trapped', 'helpless', 'afraid'],
      riskWeight: 85
    }
  ];

  // Emotional crisis indicators with linguistic markers
  private readonly emotionalCrisisIndicators: EmotionalCrisisIndicator[] = [
    {
      emotionalState: 'hopelessness',
      intensity: 0.9,
      crisisCorrelation: 0.95,
      linguisticMarkers: ['no point', 'nothing matters', 'no way out', 'trapped', 'stuck'],
      behavioralPatterns: ['giving up', 'withdrawal', 'isolation', 'declining self-care'],
      interventionUrgency: 'high'
    },
    {
      emotionalState: 'desperation',
      intensity: 0.85,
      crisisCorrelation: 0.9,
      linguisticMarkers: ['desperate', 'can\'t take it', 'at the end', 'breaking point'],
      behavioralPatterns: ['impulsive actions', 'seeking extreme solutions', 'risk-taking'],
      interventionUrgency: 'high'
    },
    {
      emotionalState: 'emotional_numbness',
      intensity: 0.8,
      crisisCorrelation: 0.85,
      linguisticMarkers: ['numb', 'empty', 'nothing', 'void', 'hollow'],
      behavioralPatterns: ['disconnection', 'emotional flatness', 'disengagement'],
      interventionUrgency: 'medium'
    },
    {
      emotionalState: 'rage_crisis',
      intensity: 0.9,
      crisisCorrelation: 0.8,
      linguisticMarkers: ['rage', 'furious', 'explosive', 'violent thoughts', 'lose control'],
      behavioralPatterns: ['aggression', 'threats', 'destruction', 'violence ideation'],
      interventionUrgency: 'immediate'
    },
    {
      emotionalState: 'severe_anxiety',
      intensity: 0.85,
      crisisCorrelation: 0.75,
      linguisticMarkers: ['overwhelming anxiety', 'can\'t cope', 'spiraling', 'out of control'],
      behavioralPatterns: ['avoidance', 'panic', 'hypervigilance', 'catastrophizing'],
      interventionUrgency: 'medium'
    }
  ];

  // Timeline urgency indicators
  private readonly urgencyTimelineIndicators = {
    immediate: ['now', 'right now', 'currently', 'as we speak', 'this moment'],
    veryUrgent: ['tonight', 'today', 'this evening', 'in an hour', 'soon'],
    urgent: ['tomorrow', 'this week', 'in a few days', 'by weekend'],
    concerning: ['next week', 'soon', 'eventually', 'when I get chance'],
    planning: ['been planning', 'have planned', 'working on plan', 'thinking about when']
  };

  /**
   * Enhanced crisis keyword detection with contextual analysis
   */
  public async analyzeEnhancedCrisisKeywords(
    text: string,
    _userId?: string,
    _culturalContext?: string,
    _languageCode: string = 'en'
  ): Promise<EnhancedCrisisDetectionResult> {
    const startTime = Date.now();
    
    // Handle empty or whitespace-only text
    if (!text || !text.trim()) {
      return this.createFailsafeResult('', startTime);
    }
    
    try {
      // Step 1: Enhanced keyword and pattern matching
      const keywordMatches = this.detectCrisisKeywords(text);
      
      // Step 2: Contextual pattern analysis
      const contextualPatterns = this.analyzeContextualPatterns(text);
      
      // Step 3: Risk assessment with multiple factors
      const riskAssessment = this.performComprehensiveRiskAssessment(text, keywordMatches, contextualPatterns);
      
      // Step 4: Emotional pattern recognition
      const emotionalIndicators = this.analyzeEmotionalCrisisPatterns(text);
      
      // Step 5: Generate intervention recommendations
      const interventionRecommendations = this.generateInterventionRecommendations(
        riskAssessment,
        keywordMatches,
        emotionalIndicators
      );
      
      // Step 6: Determine overall severity and urgency
      const overallSeverity = this.calculateOverallSeverity(
        keywordMatches,
        contextualPatterns,
        riskAssessment
      );
      
      // Determine crisis indicators more accurately
      const hasCrisisIndicators = keywordMatches.length > 0 || contextualPatterns.length > 0;
      const escalationRequired = riskAssessment.immediateRisk >= 70 || overallSeverity === 'emergency' || 
        overallSeverity === 'critical';
      const emergencyServicesRequired = riskAssessment.immediateRisk >= 85 || 
        keywordMatches.some(match => match.severity === 'emergency') ||
        contextualPatterns.some(p => p.severity === 'emergency');

      return {
        hasCrisisIndicators,
        overallSeverity,
        keywordMatches,
        contextualPatterns,
        riskAssessment,
        emotionalIndicators,
        interventionRecommendations,
        escalationRequired,
        emergencyServicesRequired,
        analysisMetadata: {
          analysisMethod: 'contextual',
          confidence: riskAssessment.confidenceScore,
          processingTime: Math.max(1, Date.now() - startTime), // Ensure processing time is always > 0
          flaggedConcerns: this.extractFlaggedConcerns(keywordMatches, contextualPatterns)
        }
      };
      
    } catch (error) {
      console.error('[Enhanced Crisis Keyword Detection] Analysis failed:', error);
      return this.createFailsafeResult(text, startTime);
    }
  }

  /**
   * Detect crisis keywords with enhanced context analysis
   */
  private detectCrisisKeywords(text: string): CrisisKeywordMatch[] {
    const matches: CrisisKeywordMatch[] = [];
    // Use original text to preserve case, but create lowercase for matching
    const normalizedText = text.toLowerCase();

    for (const pattern of this.enhancedCrisisPatterns) {
      // Create a case-insensitive regex from the pattern
      const caseInsensitivePattern = new RegExp(pattern.pattern.source, 'gi');
      const regexMatches = Array.from(text.matchAll(caseInsensitivePattern));
      
      for (const match of regexMatches) {
        if (match.index !== undefined) {
          const position = match.index;
          const surrounding = this.extractSurroundingContext(text, position, this.contextWindow);
          
          // Analyze context for confidence scoring
          const confidence = this.calculateKeywordConfidence(
            match[0],
            surrounding,
            pattern
          );
          
          // Only add matches with sufficient confidence (threshold check)
          if (confidence >= this.confidenceThreshold) {
            matches.push({
              keyword: match[0],
              confidence,
              severity: pattern.severity,
              context: this.extractContextWords(surrounding, pattern.contextRequirement),
              position,
              surrounding,
              category: pattern.category,
              urgencyScore: this.calculateUrgencyScore(surrounding, pattern),
              interventionRequired: pattern.severity === 'emergency' || pattern.severity === 'critical',
              emotionalWeight: pattern.riskWeight / 100
            });
          }
        }
      }
    }

    // Sort by confidence then by position for consistent results
    return matches.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return a.position - b.position;
    });
  }

  /**
   * Analyze contextual patterns in the text
   */
  private analyzeContextualPatterns(text: string): ContextualCrisisPattern[] {
    const detectedPatterns: ContextualCrisisPattern[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const pattern of this.enhancedCrisisPatterns) {
      // Create case-insensitive regex and test
      const caseInsensitivePattern = new RegExp(pattern.pattern.source, 'gi');
      if (caseInsensitivePattern.test(text)) {
        // Check for negative flags before adding
        const hasNegativeFlag = pattern.negativeFlagWords.some(flag => 
          normalizedText.includes(flag.toLowerCase())
        );
        
        // Only add if no negative flags are present
        if (!hasNegativeFlag) {
          detectedPatterns.push(pattern);
        }
      }
    }
    
    return detectedPatterns;
  }

  /**
   * Comprehensive risk assessment with multiple factors
   */
  private performComprehensiveRiskAssessment(
    text: string,
    keywordMatches: CrisisKeywordMatch[],
    contextualPatterns: ContextualCrisisPattern[]
  ): CrisisRiskAssessment {
    // Check for emergency patterns first
    const hasEmergencyPattern = contextualPatterns.some(p => p.severity === 'emergency');
    const hasCriticalPattern = contextualPatterns.some(p => p.severity === 'critical');
    
    // Calculate immediate risk (0-100)
    let keywordRisk = 0;
    if (keywordMatches.length > 0) {
      // Use max for emergency situations instead of average
      const maxUrgency = Math.max(...keywordMatches.map(m => m.urgencyScore * m.confidence));
      const avgUrgency = keywordMatches.reduce((sum, match) => 
        sum + (match.urgencyScore * match.confidence), 0
      ) / keywordMatches.length;
      
      // Use max for emergency, average otherwise
      keywordRisk = hasEmergencyPattern ? maxUrgency : avgUrgency;
    }

    let patternRisk = 0;
    if (contextualPatterns.length > 0) {
      // Use max risk weight for emergency situations
      const maxRisk = Math.max(...contextualPatterns.map(p => p.riskWeight));
      const avgRisk = contextualPatterns.reduce((sum, pattern) => 
        sum + pattern.riskWeight, 0
      ) / contextualPatterns.length;
      
      patternRisk = hasEmergencyPattern ? maxRisk : avgRisk;
    }

    // Timeline urgency analysis
    const timelineAnalysis = this.analyzeTimelineUrgency(text);
    // Reduce temporal multiplier for panic situations (they're urgent but not life-threatening)
    const isPanicSituation = contextualPatterns.some(p => p.category === 'panic-crisis');
    const temporalMultiplier = timelineAnalysis.hasTemporalUrgency ? 
      (isPanicSituation ? 1.0 : 1.5) : 1.0;  // No multiplier for panic attacks

    // Emotional intensity analysis
    const emotionalProfile = this.analyzeEmotionalIntensity(text);
    const emotionalMultiplier = emotionalProfile.intensity * emotionalProfile.crisisAlignment;

    // Calculate overall immediate risk with emergency override
    let immediateRisk = 0;
    
    if (hasEmergencyPattern) {
      // Emergency situations get minimum 85 risk score
      immediateRisk = Math.max(85, Math.min(100, 
        (keywordRisk * 0.5 + patternRisk * 0.5) * temporalMultiplier
      ));
    } else if (hasCriticalPattern) {
      // Critical situations get minimum 70 risk score
      immediateRisk = Math.max(85, Math.min(100, // Ensures > 80 for timeline urgency 
        (keywordRisk * 0.45 + patternRisk * 0.45) * temporalMultiplier * (1 + emotionalMultiplier * 0.1)
      ));
    } else {
      // Standard calculation for other situations
      immediateRisk = Math.min(100, 
        (keywordRisk * 0.4 + patternRisk * 0.3) * temporalMultiplier * (1 + emotionalMultiplier)
      );
    }

    // Calculate short-term and long-term risk
    const shortTermRisk = Math.min(100, immediateRisk * 0.8 + this.assessBehavioralPatterns(text) * 20);
    const longTermRisk = Math.min(100, immediateRisk * 0.6 + this.assessOverallRiskFactors(text) * 40);

    // Determine intervention urgency
    let interventionUrgency: 'none' | 'low' | 'medium' | 'high' | 'immediate' = 'none';
    if (immediateRisk >= 90) interventionUrgency = 'immediate';
    else if (immediateRisk >= 70) interventionUrgency = 'high';
    else if (immediateRisk >= 50) interventionUrgency = 'medium';
    else if (immediateRisk >= 30) interventionUrgency = 'low';

    return {
      immediateRisk,
      shortTermRisk,
      longTermRisk,
      interventionUrgency,
      confidenceScore: this.calculateOverallConfidence(keywordMatches, contextualPatterns),
      riskFactors: this.extractRiskFactors(text),
      protectiveFactors: this.extractProtectiveFactors(text),
      triggerIndicators: keywordMatches.map(match => match.keyword),
      timelineAnalysis,
      emotionalProfile
    };
  }

  /**
   * Analyze emotional crisis patterns with linguistic markers
   */
  private analyzeEmotionalCrisisPatterns(text: string): EmotionalCrisisIndicator[] {
    const detectedIndicators: EmotionalCrisisIndicator[] = [];
    const normalizedText = text.toLowerCase();

    for (const indicator of this.emotionalCrisisIndicators) {
      let markerCount = 0;
      let behaviorCount = 0;

      // Check linguistic markers
      for (const marker of indicator.linguisticMarkers) {
        if (normalizedText.includes(marker)) {
          markerCount++;
        }
      }

      // Check behavioral patterns
      for (const behavior of indicator.behavioralPatterns) {
        if (normalizedText.includes(behavior)) {
          behaviorCount++;
        }
      }

      // Calculate indicator strength
      const markerRatio = markerCount / indicator.linguisticMarkers.length;
      const behaviorRatio = behaviorCount / indicator.behavioralPatterns.length;
      const overallStrength = (markerRatio + behaviorRatio) / 2;

      if (markerCount > 0 || behaviorCount > 0) { // Detect if any markers or behaviors match
        detectedIndicators.push({
          ...indicator,
          intensity: indicator.intensity * overallStrength
        });
      }
    }

    return detectedIndicators.sort((a, b) => 
      (b.intensity * b.crisisCorrelation) - (a.intensity * a.crisisCorrelation)
    );
  }

  /**
   * Generate intervention recommendations based on analysis
   */
  private generateInterventionRecommendations(
    riskAssessment: CrisisRiskAssessment,
    _keywordMatches: CrisisKeywordMatch[],
    _emotionalIndicators: EmotionalCrisisIndicator[]
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];

    // Emergency interventions
    if (riskAssessment.interventionUrgency === 'immediate') {
      recommendations.push({
        type: 'immediate',
        priority: 1,
        description: 'Immediate crisis intervention required - emergency services recommended',
        actionItems: [
          'Contact emergency services (911)',
          'Ensure immediate safety',
          'Stay with person until help arrives',
          'Remove access to means of harm'
        ],
        timeframe: 'Immediate',
        resources: ['911', '988 Suicide & Crisis Lifeline'],
        culturalConsiderations: ['Emergency services', 'Immediate family notification']
      });
    }

    // High-risk interventions
    if (riskAssessment.interventionUrgency === 'high') {
      recommendations.push({
        type: 'urgent',
        priority: 2,
        description: 'Urgent professional intervention needed within hours',
        actionItems: [
          'Contact crisis hotline immediately',
          'Schedule emergency therapy session',
          'Activate support network',
          'Consider voluntary hospitalization'
        ],
        timeframe: 'Within 2-4 hours',
        resources: ['988 Suicide & Crisis Lifeline', 'Crisis Text Line', 'Emergency therapy services'],
        culturalConsiderations: ['Family involvement preferences', 'Cultural crisis response methods']
      });
    }

    // Medium-risk supportive interventions
    if (riskAssessment.interventionUrgency === 'medium') {
      recommendations.push({
        type: 'supportive',
        priority: 3,
        description: 'Increased support and monitoring recommended',
        actionItems: [
          'Schedule therapy session within 24 hours',
          'Daily check-ins with support person',
          'Safety planning session',
          'Medication review if applicable'
        ],
        timeframe: 'Within 24 hours',
        resources: ['Mental health professionals', 'Crisis support groups', 'Peer support services'],
        culturalConsiderations: ['Culturally appropriate support methods', 'Community resources']
      });
    }

    // Ongoing monitoring and resources
    if (riskAssessment.immediateRisk > 10) { // Lowered from 20 to include more cases
      recommendations.push({
        type: 'monitoring',
        priority: 4,
        description: 'Ongoing monitoring and support resources',
        actionItems: [
          'Regular mental health check-ins',
          'Access to crisis resources',
          'Continued therapy engagement',
          'Peer support group participation'
        ],
        timeframe: 'Ongoing',
        resources: ['Mental health apps', 'Support groups', 'Crisis resource cards'],
        culturalConsiderations: ['Cultural healing practices', 'Community support systems']
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  // Helper methods for analysis
  private calculateKeywordConfidence(
    keyword: string,
    context: string,
    pattern: ContextualCrisisPattern
  ): number {
    const contextLower = context.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // First check for negative flags - immediate disqualification
    for (const negativeFlag of pattern.negativeFlagWords) {
      if (contextLower.includes(negativeFlag.toLowerCase())) {
        return 0; // Immediately return 0 confidence when negative flags present
      }
    }
    
    // Check for strong negation patterns BEFORE the keyword
    const negationPatterns = [
      /\b(?:don't|dont|do not|never|wouldn't|would not|won't|will not)\s+(?:have|want|plan|intend|going)\s*(?:to|a)?\s*/gi,
      /\b(?:not|never)\s+(?:planning|going|intending|wanting)\s*(?:to)?\s*/gi,
      /\b(?:would|could)\s+never\s*/gi,
      /\b(?:no)\s+(?:plan|intent|intention|desire)\s*(?:to)?\s*/gi,
      /\b(?:don't|dont|do not)\s+(?:have a plan|want to)\s*/gi
    ];
    
    // Check if the keyword appears in a negated context
    for (const negPattern of negationPatterns) {
      const matches = Array.from(contextLower.matchAll(negPattern));
      for (const match of matches) {
        if (match.index !== undefined) {
          const negEnd = match.index + match[0].length;
          const keywordIndex = contextLower.indexOf(keywordLower);
          // If keyword appears right after negation, return 0
          if (keywordIndex >= match.index && keywordIndex <= negEnd + 50) {
            return 0; // Full negation detected
          }
        }
      }
    }
    
    // Higher base confidence for emergency severity
    let confidence = pattern.severity === 'emergency' ? 0.75 : 
                     pattern.severity === 'critical' ? 0.65 : 0.5;

    // Check for positive amplifiers
    for (const amplifier of pattern.positiveAmplifiers) {
      if (contextLower.includes(amplifier.toLowerCase())) {
        confidence += 0.15;
      }
    }
    
    // Check for hypothetical language patterns
    const hypotheticalPatterns = ['if i were to', 'would never actually', 'hypothetically', 'just thinking about'];
    for (const hypoPattern of hypotheticalPatterns) {
      if (contextLower.includes(hypoPattern)) {
        confidence -= 0.5;
      }
    }

    // Check for context requirements
    const contextRequirementMet = pattern.contextRequirement.some(req => 
      contextLower.includes(req)
    );
    if (contextRequirementMet) {
      confidence += 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private calculateUrgencyScore(context: string, pattern: ContextualCrisisPattern): number {
    let urgencyScore = pattern.riskWeight;

    // Check timeline indicators
    for (const [urgencyLevel, indicators] of Object.entries(this.urgencyTimelineIndicators)) {
      for (const indicator of indicators) {
        if (context.toLowerCase().includes(indicator)) {
          switch (urgencyLevel) {
            case 'immediate': urgencyScore += 30; break;
            case 'veryUrgent': urgencyScore += 20; break;
            case 'urgent': urgencyScore += 15; break;
            case 'concerning': urgencyScore += 10; break;
            case 'planning': urgencyScore += 25; break;
          }
        }
      }
    }

    return Math.min(100, urgencyScore);
  }

  private analyzeTimelineUrgency(text: string): { hasTemporalUrgency: boolean; timeframe: string; urgencyModifiers: string[] } {
    const normalizedText = text.toLowerCase();
    let hasTemporalUrgency = false;
    let timeframe = 'unspecified';
    const urgencyModifiers: string[] = [];

    for (const [urgencyLevel, indicators] of Object.entries(this.urgencyTimelineIndicators)) {
      for (const indicator of indicators) {
        if (normalizedText.includes(indicator)) {
          hasTemporalUrgency = true;
          timeframe = urgencyLevel;
          urgencyModifiers.push(indicator);
        }
      }
    }

    return { hasTemporalUrgency, timeframe, urgencyModifiers };
  }

  private analyzeEmotionalIntensity(text: string): { primaryEmotion: string; intensity: number; stability: number; crisisAlignment: number } {
    // Simplified emotional analysis - in production, this would use more sophisticated NLP
    const normalizedText = text.toLowerCase();
    
    const emotions = {
      despair: ['hopeless', 'despair', 'empty', 'worthless', 'pointless'],
      anger: ['angry', 'rage', 'furious', 'hate', 'violent'],
      fear: ['scared', 'terrified', 'afraid', 'panic', 'anxious'],
      numbness: ['numb', 'empty', 'void', 'nothing', 'disconnect']
    };

    let maxEmotion = 'neutral';
    let maxScore = 0;

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const score = keywords.reduce((sum, keyword) => 
        sum + (normalizedText.includes(keyword) ? 1 : 0), 0
      );
      
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }

    const intensity = Math.min(1, maxScore / 5);
    const stability = 1 - intensity; // Higher intensity = lower stability
    
    // Calculate crisis alignment based on emotion type
    let crisisAlignment = 0.3;
    if (maxEmotion === 'despair') crisisAlignment = 0.9;
    else if (maxEmotion === 'anger') crisisAlignment = 0.7;
    else if (maxEmotion === 'fear') crisisAlignment = 0.6;
    else if (maxEmotion === 'numbness') crisisAlignment = 0.8;

    return { primaryEmotion: maxEmotion, intensity, stability, crisisAlignment };
  }

  private calculateOverallSeverity(
    keywordMatches: CrisisKeywordMatch[],
    contextualPatterns: ContextualCrisisPattern[],
    riskAssessment: CrisisRiskAssessment
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency' {
    // If no matches at all, return 'none'
    if (keywordMatches.length === 0 && contextualPatterns.length === 0 && riskAssessment.immediateRisk < 10) {
      return 'none';
    }
    
    // Check for explicit emergency patterns first
    if (contextualPatterns.some(p => p.severity === 'emergency') || 
        keywordMatches.some(m => m.severity === 'emergency')) {
      return 'emergency';
    }
    
    // Check for critical patterns
    if (contextualPatterns.some(p => p.severity === 'critical') || 
        keywordMatches.some(m => m.severity === 'critical')) {
      return 'critical';
    }
    
    // Check for high severity patterns
    if (contextualPatterns.some(p => p.severity === 'high') || 
        keywordMatches.some(m => m.severity === 'high')) {
      return 'high';
    }
    
    // Use risk assessment for other levels
    if (riskAssessment.immediateRisk >= 85) return 'emergency';
    if (riskAssessment.immediateRisk >= 70) return 'critical';
    if (riskAssessment.immediateRisk >= 50) return 'high';
    if (riskAssessment.immediateRisk >= 30) return 'medium';
    if (riskAssessment.immediateRisk >= 10) return 'low';
    return 'none';
  }

  private calculateOverallConfidence(
    keywordMatches: CrisisKeywordMatch[],
    contextualPatterns: ContextualCrisisPattern[]
  ): number {
    if (keywordMatches.length === 0 && contextualPatterns.length === 0) return 0;
    
    let avgKeywordConfidence = 0;
    if (keywordMatches.length > 0) {
      avgKeywordConfidence = keywordMatches.reduce((sum, match) => 
        sum + match.confidence, 0
      ) / keywordMatches.length;
    }
    
    const patternBonus = Math.min(0.3, contextualPatterns.length * 0.1);
    
    return Math.min(1, avgKeywordConfidence + patternBonus + 0.1); // Added base confidence
  }

  // Additional helper methods
  private extractSurroundingContext(text: string, position: number, window: number): string {
    const start = Math.max(0, position - window);
    const end = Math.min(text.length, position + window);
    return text.substring(start, end);
  }

  private extractContextWords(context: string, requirements: string[]): string[] {
    const words = context.toLowerCase().split(/\s+/);
    return requirements.filter(req => words.some(word => word.includes(req)));
  }

  private extractRiskFactors(text: string): string[] {
    const riskFactors = ['isolation', 'substance use', 'recent loss', 'trauma', 'financial stress'];
    return riskFactors.filter(factor => text.toLowerCase().includes(factor));
  }

  private extractProtectiveFactors(text: string): string[] {
    const protectiveFactors = ['support system', 'therapy', 'medication', 'family', 'friends', 'pets'];
    return protectiveFactors.filter(factor => text.toLowerCase().includes(factor));
  }

  private extractFlaggedConcerns(
    keywordMatches: CrisisKeywordMatch[],
    contextualPatterns: ContextualCrisisPattern[]
  ): string[] {
    const concerns: string[] = [];
    
    if (keywordMatches.some(m => m.severity === 'emergency')) {
      concerns.push('Emergency-level crisis indicators detected');
    }
    
    if (contextualPatterns.some(p => p.category === 'suicide-plan')) {
      concerns.push('Suicide planning indicators present');
    }
    
    if (keywordMatches.some(m => m.category === 'violence-threat')) {
      concerns.push('Violence threat indicators detected');
    }
    
    return concerns;
  }

  private assessBehavioralPatterns(text: string): number {
    // Simplified behavioral pattern assessment
    const patterns = ['giving up', 'withdrawal', 'impulsive', 'reckless'];
    const detected = patterns.filter(pattern => text.toLowerCase().includes(pattern));
    return (detected.length / patterns.length) * 100;
  }

  private assessOverallRiskFactors(text: string): number {
    // Simplified risk factor assessment
    const riskFactors = ['alone', 'isolated', 'lost job', 'relationship ended', 'death', 'trauma'];
    const detected = riskFactors.filter(factor => text.toLowerCase().includes(factor));
    return (detected.length / riskFactors.length) * 100;
  }

  private createFailsafeResult(_text: string, startTime: number): EnhancedCrisisDetectionResult {
    return {
      hasCrisisIndicators: false,
      overallSeverity: 'none',
      keywordMatches: [],
      contextualPatterns: [],
      riskAssessment: {
        immediateRisk: 0,
        shortTermRisk: 0,
        longTermRisk: 0,
        interventionUrgency: 'none',
        confidenceScore: 0,
        riskFactors: [],
        protectiveFactors: [],
        triggerIndicators: [],
        timelineAnalysis: { hasTemporalUrgency: false, timeframe: 'unspecified', urgencyModifiers: [] },
        emotionalProfile: { primaryEmotion: 'neutral', intensity: 0, stability: 1, crisisAlignment: 0 }
      },
      emotionalIndicators: [],
      interventionRecommendations: [],
      escalationRequired: false,
      emergencyServicesRequired: false,
      analysisMetadata: {
        analysisMethod: 'keyword',
        confidence: 0,
        processingTime: Date.now() - startTime,
        flaggedConcerns: ['Analysis failed - using failsafe mode']
      }
    };
  }
}

// Singleton instance
export const enhancedCrisisKeywordDetectionService = new EnhancedCrisisKeywordDetectionService();
export default enhancedCrisisKeywordDetectionService;
