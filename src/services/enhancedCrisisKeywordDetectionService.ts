/**
 * Enhanced Crisis Keyword Detection Service
 *
 * Advanced crisis keyword detection with contextual understanding, emotional pattern recognition,
 * risk assessment scoring, and immediate intervention triggers for better crisis detection and user protection.
 */

import { crisisDetectionService, CrisisAnalysisResult } from './crisisDetectionService';
import { notificationService } from './notificationService';

export type InterventionUrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'immediate';

export type CrisisCategory = 
  | 'suicide-ideation'
  | 'self-harm'
  | 'violence'
  | 'substance-abuse'
  | 'mental-health-emergency'
  | 'domestic-violence'
  | 'child-abuse'
  | 'sexual-assault'
  | 'eating-disorder'
  | 'panic-attack';

export interface CrisisKeywordMatch {
  keyword: string;
  confidence: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  context: string[];
  position: number;
  surrounding: string;
  category: CrisisCategory;
  urgencyScore: number; // 0-10
  interventionRequired: boolean;
  emotionalWeight: number; // 0-1
  temporalIndicators: TemporalIndicator[];
  linguisticPatterns: LinguisticPattern[];
}

export interface TemporalIndicator {
  type: 'immediate' | 'near-future' | 'planning' | 'past-experience';
  keywords: string[];
  urgencyMultiplier: number;
  timeframe?: string;
}

export interface LinguisticPattern {
  pattern: string;
  type: 'direct' | 'indirect' | 'metaphorical' | 'coded';
  confidence: number;
  culturalContext?: string[];
}

export interface ContextualCrisisPattern {
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  category: CrisisCategory;
  contextRequirement: string[];
  negativeFlagWords: string[]; // Words that reduce crisis significance
  positiveIndicators: string[]; // Words that increase crisis significance
  temporalWeight: number; // How time-sensitive this pattern is
  culturalSensitivity: CulturalSensitivity;
}

export interface CulturalSensitivity {
  language: string;
  culturalContext: string[];
  alternativeExpressions: string[];
  falsePositiveReduction: string[];
}

export interface EmotionalPattern {
  emotion: 'despair' | 'hopelessness' | 'rage' | 'panic' | 'numbness' | 'isolation';
  indicators: string[];
  intensity: number; // 0-10
  progression: 'escalating' | 'stable' | 'de-escalating';
  crisisCorrelation: number; // 0-1
}

export interface RiskAssessmentFactors {
  immediateRisk: number; // 0-1
  planSpecificity: number; // 0-1
  meansAccess: number; // 0-1
  socialSupport: number; // 0-1 (inverted - lower is worse)
  previousAttempts: number; // 0-1
  mentalHealthStatus: number; // 0-1
  substanceUse: number; // 0-1
  recentLosses: number; // 0-1
  impulsivity: number; // 0-1
  hopelessness: number; // 0-1
}

export interface EnhancedCrisisDetectionResult {
  overallRiskScore: number; // 0-1
  confidence: number; // 0-1
  urgencyLevel: InterventionUrgencyLevel;
  primaryCategory: CrisisCategory;
  secondaryCategories: CrisisCategory[];
  keywordMatches: CrisisKeywordMatch[];
  emotionalPatterns: EmotionalPattern[];
  contextualPatterns: ContextualCrisisPattern[];
  riskFactors: RiskAssessmentFactors;
  interventionRecommendations: InterventionRecommendation[];
  immediateActions: ImmediateAction[];
  culturalConsiderations: CulturalConsideration[];
  timeToIntervention: number; // minutes
  followUpRequired: boolean;
  escalationTriggers: EscalationTrigger[];
}

export interface InterventionRecommendation {
  type: 'immediate-contact' | 'safety-plan' | 'resource-provision' | 'professional-referral' | 'peer-support';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resources: string[];
  timeframe: string;
  requiredPersonnel: string[];
}

export interface ImmediateAction {
  action: 'emergency-services' | 'crisis-hotline' | 'safety-check' | 'remove-means' | 'continuous-monitoring';
  urgency: 'immediate' | 'within-5min' | 'within-15min' | 'within-1hour';
  description: string;
  responsibility: 'system' | 'counselor' | 'emergency-services' | 'family';
  verification: boolean; // Whether completion needs verification
}

export interface CulturalConsideration {
  aspect: 'language' | 'religious' | 'family-dynamics' | 'stigma' | 'help-seeking-patterns';
  consideration: string;
  impact: 'low' | 'medium' | 'high';
  adaptations: string[];
}

export interface EscalationTrigger {
  condition: string;
  threshold: number;
  action: string;
  automated: boolean;
  timeframe: number; // minutes
}

export interface DetectionMetrics {
  totalAnalyses: number;
  crisisDetected: number;
  falsePositives: number;
  falseNegatives: number;
  averageResponseTime: number;
  interventionSuccess: number;
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
}

class EnhancedCrisisKeywordDetectionService {
  private crisisPatterns: Map<CrisisCategory, ContextualCrisisPattern[]> = new Map();
  private emotionalPatterns: Map<string, EmotionalPattern> = new Map();
  private culturalPatterns: Map<string, CulturalSensitivity> = new Map();
  private temporalIndicators: TemporalIndicator[] = [];
  private metrics: DetectionMetrics = {
    totalAnalyses: 0,
    crisisDetected: 0,
    falsePositives: 0,
    falseNegatives: 0,
    averageResponseTime: 0,
    interventionSuccess: 0,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0
  };

  constructor() {
    this.initializeCrisisPatterns();
    this.initializeEmotionalPatterns();
    this.initializeCulturalPatterns();
    this.initializeTemporalIndicators();
    this.startMetricsCollection();
  }

  /**
   * Analyze text for enhanced crisis indicators
   */
  async analyzeTextForCrisis(
    text: string,
    userId: string,
    context?: {
      previousMessages?: string[];
      userProfile?: any;
      currentMood?: number;
      recentActivity?: string[];
    }
  ): Promise<EnhancedCrisisDetectionResult> {
    const startTime = Date.now();
    this.metrics.totalAnalyses++;

    try {
      // Pre-process text
      const processedText = this.preprocessText(text);

      // Detect keyword matches
      const keywordMatches = await this.detectCrisisKeywords(processedText, context);

      // Analyze emotional patterns
      const emotionalPatterns = this.analyzeEmotionalPatterns(processedText);

      // Detect contextual patterns
      const contextualPatterns = this.detectContextualPatterns(processedText, context);

      // Assess risk factors
      const riskFactors = this.assessRiskFactors(
        keywordMatches,
        emotionalPatterns,
        contextualPatterns,
        context
      );

      // Calculate overall risk score
      const overallRiskScore = this.calculateOverallRiskScore(
        keywordMatches,
        emotionalPatterns,
        contextualPatterns,
        riskFactors
      );

      // Determine urgency level
      const urgencyLevel = this.determineUrgencyLevel(overallRiskScore, keywordMatches);

      // Generate recommendations
      const interventionRecommendations = this.generateInterventionRecommendations(
        overallRiskScore,
        keywordMatches,
        urgencyLevel
      );

      // Generate immediate actions
      const immediateActions = this.generateImmediateActions(urgencyLevel, keywordMatches);

      // Cultural considerations
      const culturalConsiderations = this.assessCulturalConsiderations(text, context);

      // Escalation triggers
      const escalationTriggers = this.generateEscalationTriggers(overallRiskScore, urgencyLevel);

      const result: EnhancedCrisisDetectionResult = {
        overallRiskScore,
        confidence: this.calculateConfidence(keywordMatches, emotionalPatterns),
        urgencyLevel,
        primaryCategory: this.determinePrimaryCategory(keywordMatches),
        secondaryCategories: this.determineSecondaryCategories(keywordMatches),
        keywordMatches,
        emotionalPatterns,
        contextualPatterns,
        riskFactors,
        interventionRecommendations,
        immediateActions,
        culturalConsiderations,
        timeToIntervention: this.calculateTimeToIntervention(urgencyLevel),
        followUpRequired: overallRiskScore > 0.3,
        escalationTriggers
      };

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(result, responseTime);

      // Trigger immediate actions if necessary
      if (urgencyLevel === 'immediate' || urgencyLevel === 'high') {
        await this.triggerImmediateActions(result, userId);
      }

      return result;

    } catch (error) {
      console.error('Error in enhanced crisis detection:', error);
      
      // Fallback to basic crisis detection
      const basicResult = await crisisDetectionService.analyzeForCrisis(text);
      return this.convertBasicToEnhancedResult(basicResult);
    }
  }

  /**
   * Detect crisis keywords with context
   */
  private async detectCrisisKeywords(
    text: string,
    context?: any
  ): Promise<CrisisKeywordMatch[]> {
    const matches: CrisisKeywordMatch[] = [];
    const words = text.toLowerCase().split(/\s+/);

    // Suicide ideation keywords
    const suicideKeywords = [
      'kill myself', 'end my life', 'suicide', 'want to die', 'better off dead',
      'end it all', 'take my own life', 'don\'t want to live', 'worthless',
      'hopeless', 'no point living', 'tired of living'
    ];

    // Self-harm keywords
    const selfHarmKeywords = [
      'cut myself', 'hurt myself', 'self harm', 'cutting', 'burning myself',
      'punish myself', 'deserve pain', 'make it stop'
    ];

    // Violence keywords
    const violenceKeywords = [
      'kill them', 'hurt someone', 'make them pay', 'revenge', 'destroy',
      'violence', 'weapon', 'gun', 'knife', 'explosive'
    ];

    // Process each category
    this.processKeywordCategory(text, suicideKeywords, 'suicide-ideation', matches);
    this.processKeywordCategory(text, selfHarmKeywords, 'self-harm', matches);
    this.processKeywordCategory(text, violenceKeywords, 'violence', matches);

    // Add contextual analysis
    for (const match of matches) {
      match.temporalIndicators = this.analyzeTemporalIndicators(text, match);
      match.linguisticPatterns = this.analyzeLinguisticPatterns(text, match);
      match.emotionalWeight = this.calculateEmotionalWeight(text, match);
    }

    return matches;
  }

  /**
   * Process keyword category
   */
  private processKeywordCategory(
    text: string,
    keywords: string[],
    category: CrisisCategory,
    matches: CrisisKeywordMatch[]
  ): void {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const surrounding = this.extractSurroundingText(text, match.index, 50);
        const context = this.extractContext(text, match.index);
        
        matches.push({
          keyword,
          confidence: this.calculateKeywordConfidence(keyword, surrounding),
          severity: this.determineSeverity(keyword, category),
          context,
          position: match.index,
          surrounding,
          category,
          urgencyScore: this.calculateUrgencyScore(keyword, surrounding),
          interventionRequired: this.requiresIntervention(keyword, category),
          emotionalWeight: 0, // Will be calculated later
          temporalIndicators: [], // Will be calculated later
          linguisticPatterns: [] // Will be calculated later
        });
      }
    }
  }

  /**
   * Analyze emotional patterns in text
   */
  private analyzeEmotionalPatterns(text: string): EmotionalPattern[] {
    const patterns: EmotionalPattern[] = [];
    
    // Despair indicators
    const despairIndicators = ['hopeless', 'helpless', 'trapped', 'no way out', 'give up'];
    if (this.containsAny(text, despairIndicators)) {
      patterns.push({
        emotion: 'despair',
        indicators: this.findMatchingIndicators(text, despairIndicators),
        intensity: this.calculateEmotionalIntensity(text, despairIndicators),
        progression: this.analyzeEmotionalProgression(text, 'despair'),
        crisisCorrelation: 0.8
      });
    }

    // Hopelessness indicators
    const hopelessnessIndicators = ['no future', 'pointless', 'nothing matters', 'why bother'];
    if (this.containsAny(text, hopelessnessIndicators)) {
      patterns.push({
        emotion: 'hopelessness',
        indicators: this.findMatchingIndicators(text, hopelessnessIndicators),
        intensity: this.calculateEmotionalIntensity(text, hopelessnessIndicators),
        progression: this.analyzeEmotionalProgression(text, 'hopelessness'),
        crisisCorrelation: 0.9
      });
    }

    // Add more emotional pattern analysis...

    return patterns;
  }

  /**
   * Detect contextual crisis patterns
   */
  private detectContextualPatterns(text: string, context?: any): ContextualCrisisPattern[] {
    const patterns: ContextualCrisisPattern[] = [];
    
    for (const [category, categoryPatterns] of this.crisisPatterns) {
      for (const pattern of categoryPatterns) {
        if (pattern.pattern.test(text)) {
          // Check context requirements
          const contextMet = this.checkContextRequirements(text, pattern.contextRequirement);
          const hasNegativeFlags = this.containsAny(text, pattern.negativeFlagWords);
          
          if (contextMet && !hasNegativeFlags) {
            patterns.push(pattern);
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Assess comprehensive risk factors
   */
  private assessRiskFactors(
    keywordMatches: CrisisKeywordMatch[],
    emotionalPatterns: EmotionalPattern[],
    contextualPatterns: ContextualCrisisPattern[],
    context?: any
  ): RiskAssessmentFactors {
    return {
      immediateRisk: this.assessImmediateRisk(keywordMatches),
      planSpecificity: this.assessPlanSpecificity(keywordMatches),
      meansAccess: this.assessMeansAccess(keywordMatches),
      socialSupport: this.assessSocialSupport(context),
      previousAttempts: this.assessPreviousAttempts(context),
      mentalHealthStatus: this.assessMentalHealthStatus(emotionalPatterns),
      substanceUse: this.assessSubstanceUse(keywordMatches),
      recentLosses: this.assessRecentLosses(context),
      impulsivity: this.assessImpulsivity(keywordMatches),
      hopelessness: this.assessHopelessness(emotionalPatterns)
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(
    keywordMatches: CrisisKeywordMatch[],
    emotionalPatterns: EmotionalPattern[],
    contextualPatterns: ContextualCrisisPattern[],
    riskFactors: RiskAssessmentFactors
  ): number {
    let score = 0;

    // Keyword contribution (40%)
    const keywordScore = keywordMatches.reduce((sum, match) => 
      sum + (match.confidence * match.urgencyScore / 10), 0) / Math.max(keywordMatches.length, 1);
    score += keywordScore * 0.4;

    // Emotional pattern contribution (30%)
    const emotionalScore = emotionalPatterns.reduce((sum, pattern) => 
      sum + (pattern.intensity / 10 * pattern.crisisCorrelation), 0) / Math.max(emotionalPatterns.length, 1);
    score += emotionalScore * 0.3;

    // Risk factors contribution (30%)
    const riskScore = Object.values(riskFactors).reduce((sum, factor) => sum + factor, 0) / 10;
    score += riskScore * 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * Determine urgency level
   */
  private determineUrgencyLevel(
    riskScore: number,
    keywordMatches: CrisisKeywordMatch[]
  ): InterventionUrgencyLevel {
    const hasImmediateKeywords = keywordMatches.some(match => 
      match.severity === 'emergency' || match.interventionRequired
    );

    if (hasImmediateKeywords || riskScore >= 0.9) return 'immediate';
    if (riskScore >= 0.7) return 'high';
    if (riskScore >= 0.5) return 'medium';
    if (riskScore >= 0.3) return 'low';
    return 'none';
  }

  /**
   * Generate intervention recommendations
   */
  private generateInterventionRecommendations(
    riskScore: number,
    keywordMatches: CrisisKeywordMatch[],
    urgencyLevel: InterventionUrgencyLevel
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];

    if (urgencyLevel === 'immediate') {
      recommendations.push({
        type: 'immediate-contact',
        priority: 'critical',
        description: 'Immediate crisis intervention contact required',
        resources: ['Crisis Hotline: 988', 'Emergency Services: 911'],
        timeframe: 'Within 5 minutes',
        requiredPersonnel: ['Crisis counselor', 'Emergency services']
      });
    }

    if (urgencyLevel === 'high' || urgencyLevel === 'immediate') {
      recommendations.push({
        type: 'safety-plan',
        priority: 'high',
        description: 'Develop or review safety plan',
        resources: ['Safety planning tools', 'Support contacts'],
        timeframe: 'Within 1 hour',
        requiredPersonnel: ['Mental health professional']
      });
    }

    // Add more recommendations based on risk level and patterns...

    return recommendations;
  }

  /**
   * Generate immediate actions
   */
  private generateImmediateActions(
    urgencyLevel: InterventionUrgencyLevel,
    keywordMatches: CrisisKeywordMatch[]
  ): ImmediateAction[] {
    const actions: ImmediateAction[] = [];

    if (urgencyLevel === 'immediate') {
      actions.push({
        action: 'emergency-services',
        urgency: 'immediate',
        description: 'Contact emergency services immediately',
        responsibility: 'system',
        verification: true
      });

      actions.push({
        action: 'continuous-monitoring',
        urgency: 'immediate',
        description: 'Activate continuous monitoring protocols',
        responsibility: 'system',
        verification: true
      });
    }

    if (urgencyLevel === 'high') {
      actions.push({
        action: 'crisis-hotline',
        urgency: 'within-5min',
        description: 'Connect to crisis hotline',
        responsibility: 'system',
        verification: false
      });
    }

    return actions;
  }

  // Helper methods for analysis

  private preprocessText(text: string): string {
    return text.toLowerCase().trim();
  }

  private extractSurroundingText(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  private extractContext(text: string, position: number): string[] {
    const words = text.split(/\s+/);
    const wordPosition = text.substring(0, position).split(/\s+/).length - 1;
    const start = Math.max(0, wordPosition - 3);
    const end = Math.min(words.length, wordPosition + 4);
    return words.slice(start, end);
  }

  private calculateKeywordConfidence(keyword: string, surrounding: string): number {
    // Implementation of confidence calculation
    return 0.8; // Placeholder
  }

  private determineSeverity(keyword: string, category: CrisisCategory): CrisisKeywordMatch['severity'] {
    // Implementation of severity determination
    return 'high'; // Placeholder
  }

  private calculateUrgencyScore(keyword: string, surrounding: string): number {
    // Implementation of urgency score calculation
    return 7; // Placeholder
  }

  private requiresIntervention(keyword: string, category: CrisisCategory): boolean {
    const highRiskKeywords = ['kill myself', 'suicide', 'end my life', 'want to die'];
    return highRiskKeywords.includes(keyword);
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  }

  private findMatchingIndicators(text: string, indicators: string[]): string[] {
    return indicators.filter(indicator => text.toLowerCase().includes(indicator.toLowerCase()));
  }

  private calculateEmotionalIntensity(text: string, indicators: string[]): number {
    // Implementation of emotional intensity calculation
    return 7; // Placeholder
  }

  private analyzeEmotionalProgression(text: string, emotion: string): EmotionalPattern['progression'] {
    // Implementation of emotional progression analysis
    return 'stable'; // Placeholder
  }

  private checkContextRequirements(text: string, requirements: string[]): boolean {
    return requirements.every(req => text.includes(req));
  }

  private assessImmediateRisk(keywordMatches: CrisisKeywordMatch[]): number {
    return keywordMatches.some(match => match.severity === 'emergency') ? 0.9 : 0.5;
  }

  private assessPlanSpecificity(keywordMatches: CrisisKeywordMatch[]): number {
    // Implementation of plan specificity assessment
    return 0.3; // Placeholder
  }

  private assessMeansAccess(keywordMatches: CrisisKeywordMatch[]): number {
    // Implementation of means access assessment
    return 0.4; // Placeholder
  }

  private assessSocialSupport(context?: any): number {
    // Implementation of social support assessment
    return 0.6; // Placeholder
  }

  private assessPreviousAttempts(context?: any): number {
    // Implementation of previous attempts assessment
    return 0.2; // Placeholder
  }

  private assessMentalHealthStatus(emotionalPatterns: EmotionalPattern[]): number {
    const averageIntensity = emotionalPatterns.reduce((sum, pattern) => 
      sum + pattern.intensity, 0) / Math.max(emotionalPatterns.length, 1);
    return averageIntensity / 10;
  }

  private assessSubstanceUse(keywordMatches: CrisisKeywordMatch[]): number {
    // Implementation of substance use assessment
    return 0.3; // Placeholder
  }

  private assessRecentLosses(context?: any): number {
    // Implementation of recent losses assessment
    return 0.2; // Placeholder
  }

  private assessImpulsivity(keywordMatches: CrisisKeywordMatch[]): number {
    // Implementation of impulsivity assessment
    return 0.4; // Placeholder
  }

  private assessHopelessness(emotionalPatterns: EmotionalPattern[]): number {
    const hopelessnessPattern = emotionalPatterns.find(pattern => pattern.emotion === 'hopelessness');
    return hopelessnessPattern ? hopelessnessPattern.intensity / 10 : 0.3;
  }

  private calculateConfidence(
    keywordMatches: CrisisKeywordMatch[],
    emotionalPatterns: EmotionalPattern[]
  ): number {
    const avgKeywordConfidence = keywordMatches.reduce((sum, match) => 
      sum + match.confidence, 0) / Math.max(keywordMatches.length, 1);
    return Math.min(avgKeywordConfidence + 0.2, 1.0);
  }

  private determinePrimaryCategory(keywordMatches: CrisisKeywordMatch[]): CrisisCategory {
    if (keywordMatches.length === 0) return 'mental-health-emergency';
    
    const categoryCounts = keywordMatches.reduce((counts, match) => {
      counts[match.category] = (counts[match.category] || 0) + match.urgencyScore;
      return counts;
    }, {} as Record<CrisisCategory, number>);

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as CrisisCategory;
  }

  private determineSecondaryCategories(keywordMatches: CrisisKeywordMatch[]): CrisisCategory[] {
    const primaryCategory = this.determinePrimaryCategory(keywordMatches);
    const categories = new Set(keywordMatches.map(match => match.category));
    categories.delete(primaryCategory);
    return Array.from(categories);
  }

  private calculateTimeToIntervention(urgencyLevel: InterventionUrgencyLevel): number {
    switch (urgencyLevel) {
      case 'immediate': return 5;
      case 'high': return 15;
      case 'medium': return 60;
      case 'low': return 240;
      default: return 1440; // 24 hours
    }
  }

  private analyzeTemporalIndicators(text: string, match: CrisisKeywordMatch): TemporalIndicator[] {
    // Implementation of temporal indicator analysis
    return [];
  }

  private analyzeLinguisticPatterns(text: string, match: CrisisKeywordMatch): LinguisticPattern[] {
    // Implementation of linguistic pattern analysis
    return [];
  }

  private calculateEmotionalWeight(text: string, match: CrisisKeywordMatch): number {
    // Implementation of emotional weight calculation
    return 0.7;
  }

  private assessCulturalConsiderations(text: string, context?: any): CulturalConsideration[] {
    // Implementation of cultural considerations assessment
    return [];
  }

  private generateEscalationTriggers(riskScore: number, urgencyLevel: InterventionUrgencyLevel): EscalationTrigger[] {
    const triggers: EscalationTrigger[] = [];

    if (urgencyLevel === 'high') {
      triggers.push({
        condition: 'No response within 15 minutes',
        threshold: 15,
        action: 'Escalate to emergency services',
        automated: true,
        timeframe: 15
      });
    }

    return triggers;
  }

  private async triggerImmediateActions(result: EnhancedCrisisDetectionResult, userId: string): Promise<void> {
    // Notify crisis intervention team
    await notificationService.sendNotification({
      userId: 'crisis-team',
      title: 'Crisis Detected - Immediate Action Required',
      message: `Crisis indicators detected for user ${userId}. Risk score: ${result.overallRiskScore.toFixed(2)}`,
      priority: 'critical',
      type: 'crisis'
    });

    // Log the crisis event
    console.log(`Crisis detected for user ${userId}:`, {
      riskScore: result.overallRiskScore,
      urgencyLevel: result.urgencyLevel,
      primaryCategory: result.primaryCategory
    });
  }

  private convertBasicToEnhancedResult(basicResult: CrisisAnalysisResult): EnhancedCrisisDetectionResult {
    return {
      overallRiskScore: basicResult.riskLevel,
      confidence: basicResult.confidence,
      urgencyLevel: basicResult.riskLevel > 0.7 ? 'high' : basicResult.riskLevel > 0.5 ? 'medium' : 'low',
      primaryCategory: 'mental-health-emergency',
      secondaryCategories: [],
      keywordMatches: [],
      emotionalPatterns: [],
      contextualPatterns: [],
      riskFactors: {
        immediateRisk: basicResult.riskLevel,
        planSpecificity: 0.3,
        meansAccess: 0.3,
        socialSupport: 0.5,
        previousAttempts: 0.2,
        mentalHealthStatus: 0.5,
        substanceUse: 0.3,
        recentLosses: 0.2,
        impulsivity: 0.4,
        hopelessness: 0.4
      },
      interventionRecommendations: [],
      immediateActions: [],
      culturalConsiderations: [],
      timeToIntervention: 60,
      followUpRequired: basicResult.riskLevel > 0.3,
      escalationTriggers: []
    };
  }

  private updateMetrics(result: EnhancedCrisisDetectionResult, responseTime: number): void {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
    
    if (result.urgencyLevel !== 'none') {
      this.metrics.crisisDetected++;
    }
  }

  private initializeCrisisPatterns(): void {
    // Initialize crisis pattern database
  }

  private initializeEmotionalPatterns(): void {
    // Initialize emotional pattern database
  }

  private initializeCulturalPatterns(): void {
    // Initialize cultural pattern database
  }

  private initializeTemporalIndicators(): void {
    // Initialize temporal indicator database
  }

  private startMetricsCollection(): void {
    // Start collecting performance metrics
  }

  /**
   * Get detection metrics
   */
  getMetrics(): DetectionMetrics {
    return { ...this.metrics };
  }
}

export const enhancedCrisisKeywordDetectionService = new EnhancedCrisisKeywordDetectionService();
