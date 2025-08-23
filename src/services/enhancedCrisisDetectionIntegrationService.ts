/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced Crisis Detection Integration Service
 * 
 * Integrates enhanced crisis keyword detection with existing AI crisis detection
 * to provide comprehensive crisis analysis with improved accuracy and contextual understanding.
 * Now includes automatic crisis escalation workflow integration for severe cases.
 */

import { enhancedAICrisisDetectionService, MLCrisisAnalysisResult } from './enhancedAiCrisisDetectionService';
import { enhancedCrisisKeywordDetectionService, EnhancedCrisisDetectionResult } from './enhancedCrisisKeywordDetectionService';
import { culturalCrisisDetectionService, CulturalCrisisAnalysisResult } from './culturalCrisisDetectionService';
import { crisisEscalationWorkflowService, EscalationTrigger, EscalationTier } from './crisisEscalationWorkflowService';

export type IntegratedInterventionUrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'immediate';
export type CrisisSeverityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export interface ComprehensiveCrisisAnalysisResult {
  // Overall assessment
  hasCrisisIndicators: boolean;
  overallSeverity: CrisisSeverityLevel;
  confidenceScore: number;
  
  // Risk assessment
  immediateRisk: number; // 0-100
  shortTermRisk: number; // 0-100
  longTermRisk: number; // 0-100
  interventionUrgency: IntegratedInterventionUrgencyLevel;
  
  // Analysis components
  keywordAnalysis: EnhancedCrisisDetectionResult;
  aiAnalysis: MLCrisisAnalysisResult;
  culturalAnalysis?: CulturalCrisisAnalysisResult;
  
  // Consolidated recommendations
  interventionRecommendations: ConsolidatedInterventionRecommendation[];
  escalationRequired: boolean;
  emergencyServicesRequired: boolean;
  
  // Crisis escalation workflow data
  escalationWorkflow?: {
    escalationId?: string;
    recommendedTier: EscalationTier;
    triggerReason: EscalationTrigger;
    escalationInitiated: boolean;
    escalationError?: string;
  };
  
  // Supporting data
  triggeredIndicators: string[];
  riskFactors: string[];
  protectiveFactors: string[];
  emotionalProfile: {
    primaryEmotion: string;
    intensity: number;
    stability: number;
    crisisAlignment: number;
  };
  
  // Analysis metadata
  analysisMetadata: {
    methodsUsed: string[];
    processingTime: number;
    confidenceBreakdown: {
      keyword: number;
      ai: number;
      cultural?: number;
      overall: number;
    };
    flaggedConcerns: string[];
    analysisVersion: string;
  };
}

export interface ConsolidatedInterventionRecommendation {
  type: 'immediate' | 'urgent' | 'supportive' | 'monitoring' | 'resources' | 'cultural';
  priority: number;
  confidence: number;
  description: string;
  actionItems: string[];
  timeframe: string;
  resources: string[];
  culturalConsiderations: string[];
  source: 'keyword' | 'ai' | 'cultural' | 'integrated';
}

class EnhancedCrisisDetectionIntegrationService {
  private readonly analysisVersion = '2.0.0';
  
  /**
   * Perform comprehensive crisis analysis using all available detection methods
   */
  public async performComprehensiveCrisisAnalysis(
    text: string,
    userId?: string,
    options: {
      culturalContext?: string;
      languageCode?: string;
      includeCulturalAnalysis?: boolean;
      prioritizeMethod?: 'keyword' | 'ai' | 'balanced';
    } = {}
  ): Promise<ComprehensiveCrisisAnalysisResult> {
    const startTime = Date.now();
    const {
      culturalContext,
      languageCode = 'en',
      includeCulturalAnalysis = true,
      prioritizeMethod = 'balanced'
    } = options;

    try {
      // Run all analysis methods in parallel for efficiency
      const [keywordAnalysis, aiAnalysis, culturalAnalysis] = await Promise.all([
        // Enhanced keyword analysis
        enhancedCrisisKeywordDetectionService.analyzeEnhancedCrisisKeywords(
          text, userId, culturalContext, languageCode
        ),
        
        // AI ML analysis
        enhancedAICrisisDetectionService.analyzeCrisisWithML(
          text, { userId, languageCode, culturalContext }
        ),
        
        // Cultural analysis (if enabled)
        includeCulturalAnalysis && culturalContext ? 
          culturalCrisisDetectionService.analyzeCrisisWithCulturalContext(
            text, userId, languageCode, culturalContext
          ) : Promise.resolve(null)
      ]);

      // Consolidate analysis results
      const consolidatedResult = await this.consolidateAnalysisResults(
        keywordAnalysis,
        aiAnalysis,
        culturalAnalysis,
        prioritizeMethod,
        startTime,
        userId,
        { culturalContext, languageCode }
      );

      return consolidatedResult;

    } catch (error) {
      console.error('[Enhanced Crisis Detection Integration] Analysis failed:', error);
      return this.createFailsafeResult(text, startTime);
    }
  }

  /**
   * Consolidate results from multiple analysis methods and handle crisis escalation
   */
  private async consolidateAnalysisResults(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null,
    prioritizeMethod: 'keyword' | 'ai' | 'balanced',
    startTime: number,
    userId?: string,
    options: {
      culturalContext?: string;
      languageCode?: string;
    } = {}
  ): Promise<ComprehensiveCrisisAnalysisResult> {
    
    // Calculate consolidated risk scores
    const consolidatedRisk = this.calculateConsolidatedRisk(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis,
      prioritizeMethod
    );

    // Helper function to get severity level from AI analysis
    const getAISeverityLevel = (analysis: MLCrisisAnalysisResult): CrisisSeverityLevel => {
      if (!analysis.realTimeRisk) return 'none';
      const risk = analysis.realTimeRisk.immediateRisk;
      if (risk >= 90) return 'emergency';
      if (risk >= 80) return 'critical';
      if (risk >= 60) return 'high';
      if (risk >= 40) return 'medium';
      if (risk >= 20) return 'low';
      return 'none';
    };

    // Helper function to get cultural severity level
    const getCulturalSeverityLevel = (analysis: CulturalCrisisAnalysisResult | null): CrisisSeverityLevel => {
      if (!analysis?.realTimeRisk) return 'none';
      // Use the adjusted risk if available, otherwise use immediate risk
      const risk = analysis.culturallyAdjustedRisk?.adjustedRisk || analysis.realTimeRisk.immediateRisk;
      if (risk >= 90) return 'emergency';
      if (risk >= 80) return 'critical';
      if (risk >= 60) return 'high';
      if (risk >= 40) return 'medium';
      if (risk >= 20) return 'low';
      return 'none';
    };

    // Determine overall severity
    const overallSeverity = this.determineOverallSeverity(
      keywordAnalysis.overallSeverity,
      getAISeverityLevel(aiAnalysis),
      getCulturalSeverityLevel(culturalAnalysis)
    );

    // Calculate overall confidence
    const confidenceBreakdown = this.calculateConfidenceBreakdown(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis
    );

    // Consolidate intervention recommendations
    const interventionRecommendations = this.consolidateInterventionRecommendations(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis
    );

    // Determine escalation requirements
    const escalationRequired = consolidatedRisk.immediateRisk >= 70 || 
      overallSeverity === 'critical' || overallSeverity === 'emergency';
    
    const emergencyServicesRequired = consolidatedRisk.immediateRisk >= 90 || 
      overallSeverity === 'emergency' ||
      keywordAnalysis.emergencyServicesRequired ||
      (aiAnalysis.realTimeRisk?.immediateRisk || 0) >= 90;

    // Extract comprehensive emotional profile
    const emotionalProfile = this.consolidateEmotionalProfile(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis
    );

    // Gather all triggered indicators
    const triggeredIndicators = this.consolidateTriggeredIndicators(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis
    );

    // Consolidate risk and protective factors
    const riskFactors = this.consolidateRiskFactors(keywordAnalysis, aiAnalysis, culturalAnalysis);
    const protectiveFactors = this.consolidateProtectiveFactors(keywordAnalysis, aiAnalysis, culturalAnalysis);

    // Generate flagged concerns
    const flaggedConcerns = this.generateFlaggedConcerns(
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis,
      consolidatedRisk
    );

    // Initialize escalation workflow data
    let escalationWorkflow = undefined;

    // Handle crisis escalation workflow if needed
    if (escalationRequired || emergencyServicesRequired) {
      escalationWorkflow = await this.handleCrisisEscalationWorkflow(
        consolidatedRisk,
        overallSeverity,
        keywordAnalysis,
        aiAnalysis,
        culturalAnalysis,
        userId,
        options
      );
    }

    return {
      hasCrisisIndicators: consolidatedRisk.immediateRisk > 20 || overallSeverity !== 'none',
      overallSeverity,
      confidenceScore: confidenceBreakdown.overall,
      
      immediateRisk: consolidatedRisk.immediateRisk,
      shortTermRisk: consolidatedRisk.shortTermRisk,
      longTermRisk: consolidatedRisk.longTermRisk,
      interventionUrgency: consolidatedRisk.interventionUrgency,
      
      keywordAnalysis,
      aiAnalysis,
      culturalAnalysis: culturalAnalysis || undefined,
      
      interventionRecommendations,
      escalationRequired,
      emergencyServicesRequired,
      
      escalationWorkflow,
      
      triggeredIndicators,
      riskFactors,
      protectiveFactors,
      emotionalProfile,
      
      analysisMetadata: {
        methodsUsed: this.getAnalysisMethodsUsed(culturalAnalysis),
        processingTime: Date.now() - startTime,
        confidenceBreakdown,
        flaggedConcerns,
        analysisVersion: this.analysisVersion
      }
    };
  }

  /**
   * Calculate consolidated risk scores from multiple analysis methods
   */
  private calculateConsolidatedRisk(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null,
    prioritizeMethod: string
  ): {
    immediateRisk: number;
    shortTermRisk: number;
    longTermRisk: number;
    interventionUrgency: IntegratedInterventionUrgencyLevel;
  } {
    
    // Weight factors based on prioritization method
    const weights = this.getAnalysisWeights(prioritizeMethod);
    
    // Calculate weighted immediate risk
    let immediateRisk = 
      (keywordAnalysis.riskAssessment.immediateRisk * weights.keyword) +
      ((aiAnalysis.realTimeRisk?.immediateRisk || 0) * weights.ai);
    
    if (culturalAnalysis && weights.cultural) {
      immediateRisk += (culturalAnalysis.culturallyAdjustedRisk?.adjustedRisk || 0) * weights.cultural;
    }

    // Calculate short-term and long-term risk (using immediate risk as base since interface doesn't have these)
    const shortTermRisk = Math.min(100, 
      (keywordAnalysis.riskAssessment.shortTermRisk * weights.keyword) +
      ((aiAnalysis.realTimeRisk?.immediateRisk || 0) * weights.ai * 0.8) +
      (culturalAnalysis?.culturallyAdjustedRisk?.adjustedRisk || 0) * (weights.cultural || 0) * 0.8
    );

    const longTermRisk = Math.min(100,
      (keywordAnalysis.riskAssessment.longTermRisk * weights.keyword) +
      ((aiAnalysis.realTimeRisk?.immediateRisk || 0) * weights.ai * 0.6) +
      (culturalAnalysis?.culturallyAdjustedRisk?.adjustedRisk || 0) * (weights.cultural || 0) * 0.6
    );

    // Determine intervention urgency based on highest urgency from any method
    const interventionUrgency = this.determineInterventionUrgency(
      keywordAnalysis.riskAssessment.interventionUrgency,
      aiAnalysis.realTimeRisk?.interventionUrgency?.toString() || 'low',
      immediateRisk
    );

    return {
      immediateRisk: Math.min(100, immediateRisk),
      shortTermRisk,
      longTermRisk,
      interventionUrgency
    };
  }

  /**
   * Get analysis weights based on prioritization method
   */
  private getAnalysisWeights(prioritizeMethod: string): {
    keyword: number;
    ai: number;
    cultural?: number;
  } {
    switch (prioritizeMethod) {
      case 'keyword':
        return { keyword: 0.6, ai: 0.3, cultural: 0.1 };
      case 'ai':
        return { keyword: 0.3, ai: 0.6, cultural: 0.1 };
      case 'balanced':
      default:
        return { keyword: 0.4, ai: 0.4, cultural: 0.2 };
    }
  }

  /**
   * Determine overall severity from multiple severity levels
   */
  private determineOverallSeverity(
    keywordSeverity: string,
    aiSeverity: string,
    culturalSeverity?: string
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency' {
    const severityLevels = {
      'none': 0,
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
      'emergency': 5
    };

    const severities = [keywordSeverity, aiSeverity, culturalSeverity].filter(Boolean);
    const maxSeverityValue = Math.max(...severities.map(s => severityLevels[s as keyof typeof severityLevels] || 0));
    
    const severityKeys = Object.keys(severityLevels) as Array<keyof typeof severityLevels>;
    return severityKeys.find(key => severityLevels[key] === maxSeverityValue) || 'none';
  }

  /**
   * Calculate confidence breakdown from all analysis methods
   */
  private calculateConfidenceBreakdown(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): {
    keyword: number;
    ai: number;
    cultural?: number;
    overall: number;
  } {
    const keywordConfidence = keywordAnalysis.analysisMetadata.confidence;
    const aiConfidence = aiAnalysis.mlConfidence;
    const culturalConfidence = culturalAnalysis?.confidence || 0;

    // Calculate weighted overall confidence
    const weights = this.getAnalysisWeights('balanced');
    const safeAiConfidence = aiConfidence || 0;
    const overall = (keywordConfidence * weights.keyword) + 
                   (safeAiConfidence * weights.ai) + 
                   (culturalConfidence * (weights.cultural || 0));

    return {
      keyword: keywordConfidence,
      ai: safeAiConfidence,
      cultural: culturalAnalysis ? culturalConfidence : undefined,
      overall
    };
  }

  /**
   * Consolidate intervention recommendations from all methods
   */
  private consolidateInterventionRecommendations(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): ConsolidatedInterventionRecommendation[] {
    const consolidated: ConsolidatedInterventionRecommendation[] = [];

    // Add keyword-based recommendations
    keywordAnalysis.interventionRecommendations.forEach(rec => {
      consolidated.push({
        type: rec.type,
        priority: rec.priority,
        confidence: keywordAnalysis.analysisMetadata.confidence,
        description: rec.description,
        actionItems: rec.actionItems,
        timeframe: rec.timeframe,
        resources: rec.resources,
        culturalConsiderations: rec.culturalConsiderations,
        source: 'keyword'
      });
    });

    // Add AI-based recommendations
    aiAnalysis.realTimeRisk?.recommendedInterventions?.forEach((rec: any) => {
      // Map AI intervention types to consolidated types
      let consolidatedType: 'immediate' | 'urgent' | 'supportive' | 'monitoring' | 'resources' | 'cultural';
      switch (rec.type) {
        case 'emergency':
          consolidatedType = 'immediate';
          break;
        case 'professional':
          consolidatedType = 'urgent';
          break;
        case 'peer':
        case 'family':
          consolidatedType = 'supportive';
          break;
        case 'self-care':
          consolidatedType = 'resources';
          break;
        default:
          consolidatedType = 'supportive';
      }

      consolidated.push({
        type: consolidatedType,
        priority: rec.priority,
        confidence: aiAnalysis.mlConfidence || 0,
        description: rec.description,
        actionItems: [rec.description], // AI recommendations don't have action items, use description
        timeframe: rec.timeframe || 'immediate',
        resources: rec.resources || [],
        culturalConsiderations: rec.culturallyAdapted ? ['Culturally adapted'] : [],
        source: 'ai'
      });
    });

    // Add cultural recommendations if available
    if (culturalAnalysis?.culturalInterventions) {
      consolidated.push({
        type: 'cultural',
        priority: 3,
        confidence: culturalAnalysis.confidence || 0.7,
        description: 'Culturally appropriate intervention approaches',
        actionItems: ['Engage culturally appropriate support systems'],
        timeframe: 'As appropriate',
        resources: culturalAnalysis.culturalInterventions.culturalResources || [],
        culturalConsiderations: culturalAnalysis.culturalInterventions.languageSpecificResources || [],
        source: 'cultural'
      });
    }

    // Sort by priority and confidence
    return consolidated.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Consolidate emotional profile from all analyses
   */
  private consolidateEmotionalProfile(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    _culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): {
    primaryEmotion: string;
    intensity: number;
    stability: number;
    crisisAlignment: number;
  } {
    // Use AI analysis as primary source for emotional profile
    const aiEmotion = aiAnalysis.emotionalState;
    const keywordEmotion = keywordAnalysis.riskAssessment.emotionalProfile;

    return {
      primaryEmotion: aiEmotion.primaryEmotion || keywordEmotion.primaryEmotion,
      intensity: Math.max(aiEmotion.intensity, keywordEmotion.intensity),
      stability: Math.min(1 - aiEmotion.intensity, keywordEmotion.stability),
      crisisAlignment: Math.max(
        keywordEmotion.crisisAlignment,
        // Calculate crisis alignment from AI emotion data
        this.calculateCrisisAlignmentFromAI(aiEmotion)
      )
    };
  }

  /**
   * Calculate crisis alignment from AI emotional state
   */
  private calculateCrisisAlignmentFromAI(emotionalState: any): number {
    // Map AI emotional states to crisis alignment scores
    const crisisEmotions = {
      'sadness': 0.8,
      'despair': 0.95,
      'hopelessness': 0.9,
      'anger': 0.6,
      'fear': 0.5,
      'numbness': 0.7
    };

    const emotion = emotionalState.primaryEmotion?.toLowerCase() || 'neutral';
    return crisisEmotions[emotion as keyof typeof crisisEmotions] || 0.3;
  }

  /**
   * Consolidate triggered indicators from all analyses
   */
  private consolidateTriggeredIndicators(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): string[] {
    const indicators = new Set<string>();

    // Add keyword indicators
    keywordAnalysis.keywordMatches.forEach(match => {
      indicators.add(match.keyword);
    });

    // Add AI indicators
    (aiAnalysis as any).analysisDetails?.triggeredKeywords?.forEach((keyword: any) => {
      indicators.add(keyword.keyword);
    });

    // Add cultural indicators if available (based on available properties)
    if (culturalAnalysis?.culturalBiasAdjustments) {
      culturalAnalysis.culturalBiasAdjustments.forEach(adjustment => {
        indicators.add(adjustment.factor);
      });
    }

    return Array.from(indicators);
  }

  /**
   * Consolidate risk factors from all analyses
   */
  private consolidateRiskFactors(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): string[] {
    const riskFactors = new Set<string>();

    // Add keyword risk factors
    keywordAnalysis.riskAssessment.riskFactors.forEach(factor => {
      riskFactors.add(factor);
    });

    // Add AI risk factors
    aiAnalysis.riskFactors.forEach(factor => {
      riskFactors.add(factor);
    });

    // Add cultural risk factors if available
    if (culturalAnalysis?.riskFactors) {
      culturalAnalysis.riskFactors.forEach(factor => {
        riskFactors.add(factor);
      });
    }

    return Array.from(riskFactors);
  }

  /**
   * Consolidate protective factors from all analyses
   */
  private consolidateProtectiveFactors(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null
  ): string[] {
    const protectiveFactors = new Set<string>();

    // Add keyword protective factors
    keywordAnalysis.riskAssessment.protectiveFactors.forEach(factor => {
      protectiveFactors.add(factor);
    });

    // Add AI protective factors
    (aiAnalysis as any).protectiveFactors?.forEach((factor: any) => {
      protectiveFactors.add(factor);
    });

    // Add cultural protective factors if available
    if ((culturalAnalysis as any)?.protectiveFactors) {
      (culturalAnalysis as any).protectiveFactors.forEach((factor: any) => {
        protectiveFactors.add(factor);
      });
    }

    return Array.from(protectiveFactors);
  }

  /**
   * Determine intervention urgency from multiple sources
   */
  private determineInterventionUrgency(
    keywordUrgency: string,
    aiUrgency: string,
    immediateRisk: number
  ): IntegratedInterventionUrgencyLevel {
    const urgencyLevels = {
      'none': 0,
      'low': 1,
      'medium': 2,
      'high': 3,
      'immediate': 4
    };

    const maxUrgencyValue = Math.max(
      urgencyLevels[keywordUrgency as keyof typeof urgencyLevels] || 0,
      urgencyLevels[aiUrgency as keyof typeof urgencyLevels] || 0
    );

    // Override based on immediate risk score
    if (immediateRisk >= 90) return 'immediate';
    if (immediateRisk >= 70) return 'high';
    if (immediateRisk >= 50) return 'medium';
    if (immediateRisk >= 30) return 'low';

    const urgencyKeys = Object.keys(urgencyLevels) as Array<keyof typeof urgencyLevels>;
    return urgencyKeys.find(key => urgencyLevels[key] === maxUrgencyValue) || 'none';
  }

  /**
   * Generate flagged concerns from consolidated analysis
   */
  private generateFlaggedConcerns(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null,
    consolidatedRisk: any
  ): string[] {
    const concerns = new Set<string>();

    // Add keyword-flagged concerns
    keywordAnalysis.analysisMetadata.flaggedConcerns.forEach(concern => {
      concerns.add(concern);
    });

    // Add AI-specific concerns
    if ((aiAnalysis as any).emergencyServices) {
      concerns.add('Emergency services recommended by AI analysis');
    }

    if (aiAnalysis.realTimeRisk?.immediateRisk && aiAnalysis.realTimeRisk.immediateRisk >= 80) {
      concerns.add('High immediate risk detected by AI analysis');
    }

    // Add cultural concerns if available
    if (culturalAnalysis?.culturalBiasAdjustments && culturalAnalysis.culturalBiasAdjustments.length > 0) {
      concerns.add('Cultural bias adjustments applied');
    }

    // Add consolidated concerns
    if (consolidatedRisk.immediateRisk >= 90) {
      concerns.add('Critical immediate risk requiring emergency intervention');
    }

    return Array.from(concerns);
  }

  /**
   * Get list of analysis methods used
   */
  private getAnalysisMethodsUsed(culturalAnalysis: CulturalCrisisAnalysisResult | null): string[] {
    const methods = ['enhanced-keyword-detection', 'ai-ml-analysis'];
    if (culturalAnalysis) {
      methods.push('cultural-context-analysis');
    }
    return methods;
  }

  /**
   * Create failsafe result when analysis fails
   */
  private createFailsafeResult(_text: string, startTime: number): ComprehensiveCrisisAnalysisResult {
    return {
      hasCrisisIndicators: false,
      overallSeverity: 'none',
      confidenceScore: 0,
      
      immediateRisk: 0,
      shortTermRisk: 0,
      longTermRisk: 0,
      interventionUrgency: 'none',
      
      keywordAnalysis: {} as EnhancedCrisisDetectionResult, // Would need proper failsafe
      aiAnalysis: {} as MLCrisisAnalysisResult, // Would need proper failsafe
      
      interventionRecommendations: [],
      escalationRequired: false,
      emergencyServicesRequired: false,
      
      triggeredIndicators: [],
      riskFactors: [],
      protectiveFactors: [],
      emotionalProfile: {
        primaryEmotion: 'neutral',
        intensity: 0,
        stability: 1,
        crisisAlignment: 0
      },
      
      analysisMetadata: {
        methodsUsed: ['failsafe'],
        processingTime: Date.now() - startTime,
        confidenceBreakdown: {
          keyword: 0,
          ai: 0,
          overall: 0
        },
        flaggedConcerns: ['Analysis failed - using failsafe mode'],
        analysisVersion: this.analysisVersion
      }
    };
  }

  /**
   * Handle crisis escalation workflow based on analysis results
   */
  private async handleCrisisEscalationWorkflow(
    consolidatedRisk: any,
    overallSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency',
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult,
    culturalAnalysis: CulturalCrisisAnalysisResult | null,
    userId?: string,
    options: {
      culturalContext?: string;
      languageCode?: string;
    } = {}
  ): Promise<{
    escalationId?: string;
    recommendedTier: EscalationTier;
    triggerReason: EscalationTrigger;
    escalationInitiated: boolean;
    escalationError?: string;
  }> {
    try {
      // Determine appropriate escalation tier based on risk assessment
      const recommendedTier = this.determineEscalationTier(
        consolidatedRisk.immediateRisk,
        overallSeverity,
        keywordAnalysis,
        aiAnalysis
      );

      // Determine trigger reason for escalation
      const triggerReason = this.determineEscalationTrigger(
        keywordAnalysis,
        aiAnalysis,
        consolidatedRisk.immediateRisk,
        overallSeverity
      );

      // Create comprehensive crisis analysis result for escalation
      const crisisAnalysisResult: ComprehensiveCrisisAnalysisResult = {
        hasCrisisIndicators: true,
        overallSeverity,
        confidenceScore: consolidatedRisk.confidenceScore || 0.8,
        immediateRisk: consolidatedRisk.immediateRisk,
        shortTermRisk: consolidatedRisk.shortTermRisk,
        longTermRisk: consolidatedRisk.longTermRisk,
        interventionUrgency: consolidatedRisk.interventionUrgency,
        keywordAnalysis,
        aiAnalysis,
        culturalAnalysis: culturalAnalysis || undefined,
        interventionRecommendations: [],
        escalationRequired: true,
        emergencyServicesRequired: consolidatedRisk.immediateRisk >= 90,
        triggeredIndicators: [],
        riskFactors: [],
        protectiveFactors: [],
        emotionalProfile: {
          primaryEmotion: 'distressed',
          intensity: consolidatedRisk.immediateRisk / 100,
          stability: 1 - (consolidatedRisk.immediateRisk / 100),
          crisisAlignment: consolidatedRisk.immediateRisk / 100
        },
        analysisMetadata: {
          methodsUsed: ['keyword', 'ai'],
          processingTime: 0,
          confidenceBreakdown: {
            keyword: keywordAnalysis.analysisMetadata.confidence,
            ai: aiAnalysis.confidence,
            overall: consolidatedRisk.confidenceScore || 0.8
          },
          flaggedConcerns: [],
          analysisVersion: this.analysisVersion
        }
      };

      // Only initiate escalation if userId is provided and escalation is needed
      if (userId && (consolidatedRisk.immediateRisk >= 70 || overallSeverity === 'emergency' || overallSeverity === 'critical')) {
        const escalationResponse = await crisisEscalationWorkflowService.initiateCrisisEscalation(
          crisisAnalysisResult,
          userId,
          {
            languageCode: options.languageCode || 'en',
            culturalContext: options.culturalContext,
            timeZone: 'UTC', // Default timezone - could be enhanced with user data
            location: {
              country: 'US', // Default - could be enhanced with user data
              hasGeolocation: false
            }
          },
          {
            conversationId: `conversation-${userId}-${Date.now()}`,
            messagesSent: 1,
            sessionDuration: 0,
            previousEscalations: 0,
            riskTrend: 'increasing'
          }
        );

        return {
          escalationId: escalationResponse.escalationId,
          recommendedTier,
          triggerReason,
          escalationInitiated: escalationResponse.status === 'initiated'
        };
      } else {
        // Return escalation recommendation without initiating
        return {
          recommendedTier,
          triggerReason,
          escalationInitiated: false
        };
      }

    } catch (error) {
      console.error('[Crisis Escalation Integration] Escalation failed:', error);
      return {
        recommendedTier: 'crisis-counselor',
        triggerReason: 'high-risk-threshold',
        escalationInitiated: false,
        escalationError: error instanceof Error ? error.message : 'Unknown escalation error'
      };
    }
  }

  /**
   * Determine appropriate escalation tier based on risk assessment
   */
  private determineEscalationTier(
    immediateRisk: number,
    overallSeverity: string,
    keywordAnalysis: EnhancedCrisisDetectionResult,
    aiAnalysis: MLCrisisAnalysisResult
  ): EscalationTier {
    // Emergency services for immediate danger
    if (immediateRisk >= 90 || overallSeverity === 'emergency' || 
        keywordAnalysis.emergencyServicesRequired || (aiAnalysis as any).emergencyServices) {
      return 'emergency-services';
    }

    // Emergency team for critical situations
    if (immediateRisk >= 80 || overallSeverity === 'critical') {
      return 'emergency-team';
    }

    // Crisis counselor for high-risk situations
    if (immediateRisk >= 60 || overallSeverity === 'high') {
      return 'crisis-counselor';
    }

    // Peer support for moderate risk
    return 'peer-support';
  }

  /**
   * Determine escalation trigger reason
   */
  private determineEscalationTrigger(
    keywordAnalysis: EnhancedCrisisDetectionResult,
    _aiAnalysis: MLCrisisAnalysisResult,
    immediateRisk: number,
    overallSeverity: string
  ): EscalationTrigger {
    // Check for specific crisis categories
    const hasViolenceThreat = keywordAnalysis.keywordMatches.some(match => 
      match.category === 'violence-threat');
    const hasSuicidePlan = keywordAnalysis.keywordMatches.some(match => 
      match.category === 'suicide-plan');
    const hasMedicalEmergency = keywordAnalysis.keywordMatches.some(match => 
      match.category === 'medical-emergency');
    const hasSubstanceCrisis = keywordAnalysis.keywordMatches.some(match => 
      match.category === 'substance-crisis');
    const hasAbuseDisclosure = keywordAnalysis.keywordMatches.some(match => 
      match.category === 'abuse-disclosure');
    
    // Return specific trigger based on crisis type
    if (hasMedicalEmergency) return 'medical-emergency';
    if (hasSuicidePlan || overallSeverity === 'emergency') return 'suicide-attempt';
    if (hasViolenceThreat) return 'violence-threat';
    if (hasSubstanceCrisis) return 'substance-overdose';
    if (hasAbuseDisclosure) return 'abuse-disclosure';
    if (immediateRisk >= 85) return 'immediate-danger';
    if (immediateRisk >= 70) return 'high-risk-threshold';
    
    return 'automated-alert';
  }

}

// Singleton instance
export const enhancedCrisisDetectionIntegrationService = new EnhancedCrisisDetectionIntegrationService();
export default enhancedCrisisDetectionIntegrationService;
