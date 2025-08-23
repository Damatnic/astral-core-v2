/**
 * Enhanced Crisis Detection Service
 * 
 * Advanced crisis keyword detection with contextual analysis, sentiment patterns,
 * escalation workflows, and integration with professional services.
 */

interface CrisisIndicator {
  keyword: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string[];
  category: 'suicidal' | 'self-harm' | 'substance-abuse' | 'violence' | 'emergency' | 'general-distress';
  immediateAction: boolean;
}

interface CrisisAnalysisResult {
  hasCrisisIndicators: boolean;
  severityLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detectedCategories: string[];
  confidence: number;
  recommendedActions: string[];
  escalationRequired: boolean;
  emergencyServices: boolean;
  riskFactors: string[];
  protectiveFactors: string[];
  analysisDetails: {
    triggeredKeywords: CrisisIndicator[];
    sentimentScore: number;
    contextualFactors: string[];
    urgencyLevel: number;
  };
}

interface CrisisEscalationAction {
  type: 'immediate' | 'urgent' | 'monitor' | 'support';
  description: string;
  contacts: string[];
  resources: string[];
  timeline: string;
}

class EnhancedCrisisDetectionService {
  // Critical immediate danger keywords
  private criticalKeywords: CrisisIndicator[] = [
    // Immediate suicidal intent
    { keyword: 'killing myself', severity: 'critical', context: ['tonight', 'today', 'now', 'ready'], category: 'suicidal', immediateAction: true },
    { keyword: 'end my life', severity: 'critical', context: ['tonight', 'today', 'now', 'planning'], category: 'suicidal', immediateAction: true },
    { keyword: 'suicide plan', severity: 'critical', context: ['have', 'made', 'ready', 'tonight'], category: 'suicidal', immediateAction: true },
    { keyword: 'have a plan', severity: 'critical', context: ['kill', 'suicide', 'die', 'end'], category: 'suicidal', immediateAction: true },
    { keyword: 'take my own life', severity: 'critical', context: ['going to', 'want to', 'ready to'], category: 'suicidal', immediateAction: true },
    { keyword: 'use it on myself', severity: 'critical', context: ['gun', 'knife', 'going to'], category: 'suicidal', immediateAction: true },
    { keyword: 'have a gun', severity: 'critical', context: ['use', 'myself', 'end'], category: 'suicidal', immediateAction: true },
    { keyword: 'gun and', severity: 'critical', context: ['myself', 'use it', 'going to'], category: 'suicidal', immediateAction: true },
    { keyword: 'better off dead', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    
    // High-risk suicidal ideation
    { keyword: 'wants to die', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'want to die', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'suicidal thoughts', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'thoughts about dying', severity: 'high', context: ['constant', 'having', 'been having'], category: 'suicidal', immediateAction: false },
    { keyword: 'thinking about dying', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'kill myself', severity: 'high', context: ['want to', 'thinking about', 'might'], category: 'suicidal', immediateAction: false },
    { keyword: 'end it all', severity: 'high', context: ['want to', 'thinking about', 'need to'], category: 'suicidal', immediateAction: false },
    { keyword: 'ending it all', severity: 'high', context: ['think about', 'thinking about', 'sometimes'], category: 'suicidal', immediateAction: false },
    { keyword: 'want to end it all', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'end it', severity: 'high', context: ['want to', 'need to', 'going to'], category: 'suicidal', immediateAction: false },
    
    // Self-harm indicators
    { keyword: 'cutting myself', severity: 'high', context: ['started', 'been', 'tonight'], category: 'self-harm', immediateAction: true },
    { keyword: 'cut myself', severity: 'high', context: ['started', 'been', 'yesterday', 'today'], category: 'self-harm', immediateAction: true },
    { keyword: 'hurting myself', severity: 'medium', context: ['been', 'started', 'want to'], category: 'self-harm', immediateAction: false },
    { keyword: 'hurt myself', severity: 'medium', context: ['been', 'started', 'want to'], category: 'self-harm', immediateAction: false },
    { keyword: 'self harm', severity: 'medium', context: ['urges', 'thoughts', 'relapse'], category: 'self-harm', immediateAction: false },
    { keyword: 'self-harm', severity: 'medium', context: ['urges', 'thoughts', 'relapse'], category: 'self-harm', immediateAction: false },
    
    // Violence indicators
    { keyword: 'hurt someone', severity: 'critical', context: ['going to', 'want to', 'planning'], category: 'violence', immediateAction: true },
    { keyword: 'kill someone', severity: 'critical', context: ['going to', 'want to', 'thinking'], category: 'violence', immediateAction: true },
    
    // Emergency situations
    { keyword: 'overdose', severity: 'critical', context: ['took', 'taking', 'just'], category: 'emergency', immediateAction: true },
    { keyword: 'pills', severity: 'critical', context: ['took all', 'whole bottle', 'too many', 'bottle of'], category: 'emergency', immediateAction: true },
    { keyword: 'bottle of pills', severity: 'critical', context: ['took', 'just took', 'swallowed'], category: 'emergency', immediateAction: true },
    { keyword: 'took a bottle', severity: 'critical', context: [], category: 'emergency', immediateAction: true },
    { keyword: 'bleeding', severity: 'high', context: ['wont stop', 'too much', 'heavily'], category: 'emergency', immediateAction: true },
    
    // Substance abuse
    { keyword: 'overdosing', severity: 'critical', context: ['think', 'might be', 'am'], category: 'substance-abuse', immediateAction: true },
    { keyword: 'drinking to die', severity: 'critical', context: ['hoping', 'trying', 'want'], category: 'substance-abuse', immediateAction: true },
    { keyword: 'using to escape', severity: 'medium', context: ['pain', 'everything', 'life'], category: 'substance-abuse', immediateAction: false },
    { keyword: 'drinking heavily', severity: 'medium', context: ['cope', 'deal', 'escape'], category: 'substance-abuse', immediateAction: false },
    { keyword: 'drinking', severity: 'low', context: ['heavily', 'to cope', 'too much'], category: 'substance-abuse', immediateAction: false },
    
    // General severe distress
    { keyword: 'cant take it anymore', severity: 'high', context: ['just', 'really', 'literally'], category: 'general-distress', immediateAction: false },
    { keyword: 'cant take it', severity: 'high', context: [], category: 'general-distress', immediateAction: false },
    { keyword: 'giving up', severity: 'medium', context: ['completely', 'totally', 'just'], category: 'general-distress', immediateAction: false },
    { keyword: 'hopeless', severity: 'medium', context: ['completely', 'totally', 'feeling so'], category: 'general-distress', immediateAction: false },
    { keyword: 'life isnt worth living', severity: 'high', context: [], category: 'general-distress', immediateAction: false },
    { keyword: 'no point in going on', severity: 'high', context: [], category: 'general-distress', immediateAction: false },
    { keyword: 'cant breathe', severity: 'medium', context: ['panic', 'heart racing', 'dying'], category: 'general-distress', immediateAction: false },
    { keyword: 'going to die', severity: 'medium', context: ['think', 'feel like', 'heart'], category: 'general-distress', immediateAction: false },
    { keyword: 'panic', severity: 'medium', context: ['attack', 'cant breathe', 'dying'], category: 'general-distress', immediateAction: false },
    { keyword: 'heart is racing', severity: 'low', context: ['panic', 'scared', 'dying'], category: 'general-distress', immediateAction: false },
    { keyword: 'I think Im going to die', severity: 'medium', context: [], category: 'general-distress', immediateAction: false },
    { keyword: 'feel suicidal', severity: 'high', context: [], category: 'suicidal', immediateAction: false },
    { keyword: 'help urgently', severity: 'medium', context: [], category: 'general-distress', immediateAction: false },
    { keyword: 'need help', severity: 'low', context: ['urgently', 'now', 'please'], category: 'general-distress', immediateAction: false }
  ];

  // Context modifiers that increase urgency
  private urgencyModifiers = [
    'tonight', 'today', 'now', 'right now', 'immediately', 'soon', 'later today',
    'this evening', 'in a few hours', 'before morning', 'cant wait', 'ready to'
  ];

  // Enhanced protective factors that can reduce crisis risk
  private protectiveFactorsList = {
    ambivalence: ['but', 'except', 'although', 'however', 'maybe', 'not sure', 'part of me'],
    life_responsibilities: ['family', 'children', 'kids', 'pet', 'job', 'work', 'responsibility', 'parents', 'spouse'],
    professional_support: ['therapist', 'counselor', 'doctor', 'psychiatrist', 'medication', 'treatment', 'therapy'],
    future_orientation: ['tomorrow', 'future', 'plans', 'hope', 'goals', 'dreams', 'looking forward'],
    social_connection: ['friends', 'loved ones', 'support', 'community', 'church', 'group', 'team'],
    coping_strategies: ['meditation', 'exercise', 'music', 'art', 'writing', 'breathing', 'walk', 'cope'],
    reasons_for_living: ['meaning', 'purpose', 'belief', 'faith', 'values', 'important to me'],
    help_seeking: ['want help', 'need support', 'reaching out', 'asking for help', 'want to get better'],
    past_recovery: ['not anymore', 'used to', 'in the past', 'got better', 'recovered', 'past that', 'years ago', 'long ago', 'overcome', 'therapy helped', 'helped me']
  };

  /**
   * Analyze text for crisis indicators using advanced pattern matching
   */
  public analyzeCrisisContent(text: string): CrisisAnalysisResult {
    // Input validation - handle null, undefined, and non-string inputs
    if (!text || typeof text !== 'string') {
      return {
        hasCrisisIndicators: false,
        severityLevel: 'none',
        detectedCategories: [],
        confidence: 0,
        recommendedActions: [],
        escalationRequired: false,
        emergencyServices: false,
        riskFactors: [],
        protectiveFactors: [],
        analysisDetails: {
          triggeredKeywords: [],
          sentimentScore: 0,
          contextualFactors: [],
          urgencyLevel: 0
        }
      };
    }

    const normalizedText = text.toLowerCase().trim();
    const triggeredKeywords: CrisisIndicator[] = [];
    const detectedCategories = new Set<string>();
    let maxSeverity = 'none';
    let escalationRequired = false;
    let emergencyServices = false;
    let urgencyLevel = 0;

    // Analyze each crisis indicator
    for (const indicator of this.criticalKeywords) {
      if (this.matchesIndicator(normalizedText, indicator)) {
        triggeredKeywords.push(indicator);
        detectedCategories.add(indicator.category);
        
        // Update max severity
        if (this.getSeverityWeight(indicator.severity) > this.getSeverityWeight(maxSeverity)) {
          maxSeverity = indicator.severity;
        }
        
        // Check for immediate action requirements
        if (indicator.immediateAction) {
          escalationRequired = true;
          if (indicator.severity === 'critical') {
            emergencyServices = true;
          }
        }
        
        // Calculate urgency based on context
        urgencyLevel += this.calculateUrgency(normalizedText, indicator);
      }
    }

    // Analyze sentiment and context
    const sentimentScore = this.analyzeSentiment(normalizedText);
    const contextualFactors = this.analyzeContextualFactors(normalizedText);
    const riskFactors = this.identifyRiskFactors(normalizedText);
    const identifiedProtectiveFactors = this.identifyProtectiveFactors(normalizedText);

    // Adjust severity based on context
    // Set escalation if high urgency, but only escalate severity for very high urgency
    if (urgencyLevel > 4 && maxSeverity !== 'none') {
      escalationRequired = true;
      if (urgencyLevel > 7) {
        maxSeverity = this.escalateSeverity(maxSeverity);
      }
    }
    
    // Check if this is a past recovery story - should not flag as crisis
    if (identifiedProtectiveFactors.includes('past_recovery')) {
      // Past recovery stories should not trigger crisis unless there's new immediate danger
      const hasImmediateDanger = triggeredKeywords.some(k => k.immediateAction || k.severity === 'critical');
      if (!hasImmediateDanger) {
        // Clear crisis indicators for past recovery stories
        return {
          hasCrisisIndicators: false,
          severityLevel: 'none',
          detectedCategories: [],
          confidence: 0,
          recommendedActions: [],
          escalationRequired: false,
          emergencyServices: false,
          riskFactors: [],
          protectiveFactors: identifiedProtectiveFactors,
          analysisDetails: {
            triggeredKeywords: [],
            sentimentScore,
            contextualFactors,
            urgencyLevel: 0
          }
        };
      }
    }
    
    // Apply protective factors to reduce severity (if not emergency)
    const protectiveScore = this.calculateProtectiveFactorScore(identifiedProtectiveFactors);
    if (protectiveScore > 0 && maxSeverity !== 'critical' && !emergencyServices) {
      // Reduce urgency based on protective factors
      urgencyLevel = Math.max(0, urgencyLevel * (1 - protectiveScore * 0.5));
      
      // Consider reducing severity if strong protective factors present
      if (protectiveScore > 0.4 && maxSeverity !== 'none') {
        const originalSeverity = maxSeverity;
        maxSeverity = this.reduceSeverity(maxSeverity);
        
        // Log when protective factors reduce severity for transparency
        if (originalSeverity !== maxSeverity) {
          console.log(`[Crisis Detection] Severity reduced from ${originalSeverity} to ${maxSeverity} due to protective factors:`, identifiedProtectiveFactors);
        }
      }
      
      // Reduce escalation requirement if protective factors are strong
      if (protectiveScore > 0.5 && escalationRequired && maxSeverity !== 'high') {
        escalationRequired = false;
      }
    }

    // Generate recommended actions (now accounting for protective factors)
    const recommendedActions = this.generateRecommendedActions({
      severityLevel: maxSeverity,
      categories: Array.from(detectedCategories),
      urgencyLevel,
      emergencyServices,
      escalationRequired,
      protectiveFactors: identifiedProtectiveFactors
    });

    // Calculate confidence score (now includes protective factors)
    const confidence = this.calculateConfidence({
      triggeredKeywords: triggeredKeywords.length,
      severityLevel: maxSeverity,
      urgencyLevel,
      sentimentScore,
      contextualFactors: contextualFactors.length,
      protectiveFactors: identifiedProtectiveFactors.length
    });

    return {
      hasCrisisIndicators: triggeredKeywords.length > 0,
      severityLevel: maxSeverity as CrisisAnalysisResult['severityLevel'],
      detectedCategories: Array.from(detectedCategories),
      confidence,
      recommendedActions,
      escalationRequired,
      emergencyServices,
      riskFactors,
      protectiveFactors: identifiedProtectiveFactors,
      analysisDetails: {
        triggeredKeywords,
        sentimentScore,
        contextualFactors,
        urgencyLevel
      }
    };
  }

  /**
   * Check if text matches a crisis indicator with context awareness
   */
  private matchesIndicator(text: string, indicator: CrisisIndicator): boolean {
    // Handle special characters and variations in the keyword
    const normalizedKeyword = indicator.keyword.replace(/[!.,;?]/g, '').toLowerCase();
    const normalizedText = text.replace(/[!.,;?#]/g, '').toLowerCase();
    
    // Check for keyword match (handle k!ll -> kill type variations)
    const keywordVariations = [
      normalizedKeyword,
      normalizedKeyword.replace(/!/g, 'i'),
      normalizedKeyword.replace(/0/g, 'o'),
      normalizedKeyword.replace(/1/g, 'i'),
      normalizedKeyword.replace(/3/g, 'e'),
      normalizedKeyword.replace(/[@]/g, 'a')
    ];
    
    // Also check for common misspellings
    if (normalizedKeyword.includes('kill')) {
      keywordVariations.push(normalizedKeyword.replace('kill', 'kll'));
    }
    
    let keywordFound = false;
    let keywordIndex = -1;
    
    for (const variation of keywordVariations) {
      if (normalizedText.includes(variation)) {
        keywordFound = true;
        keywordIndex = normalizedText.indexOf(variation);
        break;
      }
    }
    
    if (!keywordFound) {
      return false;
    }

    // If no context required, return true
    if (indicator.context.length === 0) {
      return true;
    }

    // Check if any context words appear near the keyword
    const surroundingText = normalizedText.substring(
      Math.max(0, keywordIndex - 50),
      Math.min(normalizedText.length, keywordIndex + normalizedKeyword.length + 50)
    );

    return indicator.context.some(context => surroundingText.includes(context));
  }

  /**
   * Calculate urgency level based on time indicators and context
   */
  private calculateUrgency(text: string, indicator: CrisisIndicator): number {
    let urgency = 0;

    // Base urgency from severity
    switch (indicator.severity) {
      case 'critical': urgency += 4; break;
      case 'high': urgency += 3; break;
      case 'medium': urgency += 2; break;
      case 'low': urgency += 1; break;
    }

    // Check for urgency modifiers
    const urgencyWords = this.urgencyModifiers.filter(modifier => text.includes(modifier));
    urgency += urgencyWords.length * 2;

    // Immediate action indicators
    if (indicator.immediateAction) {
      urgency += 3;
    }

    return urgency;
  }

  /**
   * Analyze sentiment to gauge emotional state
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = ['hope', 'better', 'help', 'support', 'love', 'care', 'tomorrow', 'future'];
    const negativeWords = ['hopeless', 'worthless', 'alone', 'empty', 'dark', 'pain', 'suffering', 'burden'];
    
    let sentiment = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) sentiment += 1;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) sentiment -= 1;
    });
    
    return sentiment;
  }

  /**
   * Analyze contextual factors that may affect crisis level
   */
  private analyzeContextualFactors(text: string): string[] {
    const factors: string[] = [];
    
    // Isolation indicators
    if (/\b(alone|lonely|no one|nobody)\b/.test(text)) {
      factors.push('social_isolation');
    }
    
    // Time-based urgency
    if (/\b(tonight|today|now|soon)\b/.test(text)) {
      factors.push('immediate_timeframe');
    }
    
    // Method references
    if (/\b(pills|knife|gun|rope|bridge|jump)\b/.test(text)) {
      factors.push('method_reference');
    }
    
    // Support system
    if (/\b(family|friends|therapist|doctor|help)\b/.test(text)) {
      factors.push('support_available');
    }
    
    return factors;
  }

  /**
   * Identify risk factors that increase danger
   */
  private identifyRiskFactors(text: string): string[] {
    const riskFactors: string[] = [];
    
    if (/\b(drinking|drugs|alcohol|high|drunk)\b/.test(text)) {
      riskFactors.push('substance_use');
    }
    
    if (/\b(plan|method|when|how|where)\b/.test(text)) {
      riskFactors.push('specific_planning');
    }
    
    if (/\b(alone|isolated|no one knows)\b/.test(text)) {
      riskFactors.push('isolation');
    }
    
    if (/\b(failed|worthless|burden|waste)\b/.test(text)) {
      riskFactors.push('negative_self_perception');
    }
    
    return riskFactors;
  }

  /**
   * Identify protective factors that may reduce risk
   */
  private identifyProtectiveFactors(text: string): string[] {
    const factors: string[] = [];
    const normalizedText = text.toLowerCase();
    
    // Check for past tense recovery FIRST - this should negate crisis indicators
    const pastTensePatterns = [
      /used to (have|feel|think about) suicidal/,
      /had suicidal thoughts (years|long) ago/,
      /(overcame|overcome|recovered from) (suicidal|self-harm|depression)/,
      /no longer (suicidal|want to die|feel)/,
      /therapy helped me (overcome|get through|recover)/
    ];
    
    for (const pattern of pastTensePatterns) {
      if (pattern.test(normalizedText)) {
        if (!factors.includes('past_recovery')) {
          factors.push('past_recovery');
        }
        break;
      }
    }
    
    // Check each protective factor category
    for (const [factorName, keywords] of Object.entries(this.protectiveFactorsList)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          if (!factors.includes(factorName)) {
            factors.push(factorName);
          }
          break; // Move to next factor category once one keyword is found
        }
      }
    }
    
    // Special check for ambivalence with 'would never actually' pattern
    if (/would\s+never\s+actually|never\s+actually/.test(normalizedText)) {
      if (!factors.includes('ambivalence')) {
        factors.push('ambivalence');
      }
    }
    
    return factors;
  }
  
  /**
   * Calculate the protective factor score (0-1) that reduces risk
   */
  private calculateProtectiveFactorScore(protectiveFactors: string[]): number {
    if (protectiveFactors.length === 0) return 0;
    
    // Weight different protective factors
    const weights: Record<string, number> = {
      professional_support: 0.25,  // Already getting help is very protective
      help_seeking: 0.20,          // Wanting help is protective
      life_responsibilities: 0.15, // Having responsibilities to others
      social_connection: 0.15,     // Having support network
      future_orientation: 0.10,    // Having future plans
      coping_strategies: 0.10,     // Having ways to cope
      reasons_for_living: 0.15,    // Having meaning/purpose
      ambivalence: 0.10,          // Uncertainty about harming self
      past_recovery: 0.75         // Past tense strongly indicates recovery - should mostly negate current crisis
    };
    
    let totalScore = 0;
    for (const factor of protectiveFactors) {
      totalScore += weights[factor] || 0.05;
    }
    
    // Cap at 0.7 to avoid completely negating high-risk situations
    return Math.min(totalScore, 0.7);
  }

  /**
   * Generate specific recommended actions based on analysis
   */
  private generateRecommendedActions(params: {
    severityLevel: string;
    categories: string[];
    urgencyLevel: number;
    emergencyServices: boolean;
    escalationRequired: boolean;
    protectiveFactors?: string[];
  }): string[] {
    const actions: string[] = [];

    if (params.emergencyServices) {
      actions.push('IMMEDIATE: Contact emergency services (911)');
      actions.push('IMMEDIATE: Do not leave user alone');
      actions.push('IMMEDIATE: Activate crisis intervention protocol');
    }

    if (params.escalationRequired) {
      actions.push('Escalate to crisis counselor immediately');
      actions.push('Initiate suicide risk assessment');
      actions.push('Contact designated emergency contacts');
    }

    if (params.categories.includes('suicidal')) {
      actions.push('Provide suicide prevention resources');
      actions.push('Share safety planning tools');
      actions.push('Connect with crisis hotline');
    }

    if (params.categories.includes('self-harm')) {
      actions.push('Offer self-harm alternatives');
      actions.push('Provide coping strategies');
      actions.push('Connect with self-harm support resources');
    }

    if (params.severityLevel === 'medium' || params.severityLevel === 'high') {
      actions.push('Schedule follow-up check-in');
      actions.push('Provide comprehensive resource list');
      actions.push('Connect with peer support');
    }
    
    // Add actions based on protective factors
    if (params.protectiveFactors && params.protectiveFactors.length > 0) {
      if (params.protectiveFactors.includes('professional_support')) {
        actions.push('Encourage continued engagement with current treatment');
      }
      if (params.protectiveFactors.includes('help_seeking')) {
        actions.push('Facilitate connection to requested support resources');
      }
      if (params.protectiveFactors.includes('life_responsibilities')) {
        actions.push('Reinforce importance of responsibilities and connections');
      }
      if (params.protectiveFactors.includes('coping_strategies')) {
        actions.push('Support and expand existing coping mechanisms');
      }
      if (params.protectiveFactors.includes('social_connection')) {
        actions.push('Encourage reaching out to support network');
      }
    }

    return actions;
  }

  /**
   * Calculate confidence in crisis detection
   */
  private calculateConfidence(params: {
    triggeredKeywords: number;
    severityLevel: string;
    urgencyLevel: number;
    sentimentScore: number;
    contextualFactors: number;
    protectiveFactors?: number;
  }): number {
    let confidence = 0;

    // Base confidence from keyword matches
    confidence += Math.min(params.triggeredKeywords * 20, 60);

    // Severity level contribution
    const severityWeights = { 'critical': 30, 'high': 20, 'medium': 15, 'low': 10, 'none': 0 };
    confidence += severityWeights[params.severityLevel as keyof typeof severityWeights] || 0;

    // Urgency level contribution
    confidence += Math.min(params.urgencyLevel * 5, 20);

    // Contextual factors
    confidence += Math.min(params.contextualFactors * 3, 10);

    // Sentiment analysis
    if (params.sentimentScore < -2) {
      confidence += 10;
    }
    
    // Protective factors increase confidence in our assessment
    if (params.protectiveFactors && params.protectiveFactors > 0) {
      confidence += Math.min(params.protectiveFactors * 2, 10);
    }

    return Math.min(confidence, 100);
  }

  /**
   * Get numeric weight for severity level
   */
  private getSeverityWeight(severity: string): number {
    const weights = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return weights[severity as keyof typeof weights] || 0;
  }

  /**
   * Escalate severity level based on context
   */
  private escalateSeverity(currentSeverity: string): string {
    const escalationMap = {
      'low': 'medium',
      'medium': 'high',
      'high': 'critical',
      'critical': 'critical'
    };
    return escalationMap[currentSeverity as keyof typeof escalationMap] || currentSeverity;
  }

  /**
   * Reduce severity level based on protective factors
   */
  private reduceSeverity(currentSeverity: string): string {
    const reductionMap = {
      'critical': 'high',  // Critical rarely gets reduced
      'high': 'medium',
      'medium': 'low',
      'low': 'low'
    };
    return reductionMap[currentSeverity as keyof typeof reductionMap] || currentSeverity;
  }

  /**
   * Get escalation actions based on severity and categories
   */
  public getEscalationActions(analysisResult: CrisisAnalysisResult): CrisisEscalationAction[] {
    const actions: CrisisEscalationAction[] = [];

    if (analysisResult.emergencyServices) {
      actions.push({
        type: 'immediate',
        description: 'Contact emergency services immediately - active suicide attempt or imminent danger',
        contacts: ['911', '988 Suicide & Crisis Lifeline', 'Local emergency services'],
        resources: ['Crisis intervention team', 'Emergency psychiatric services', 'Mobile crisis unit'],
        timeline: 'Within 5 minutes'
      });
    }

    if (analysisResult.escalationRequired) {
      actions.push({
        type: 'urgent',
        description: 'Escalate to crisis counselor - high risk situation requiring immediate professional intervention',
        contacts: ['Crisis hotline counselor', 'Platform crisis team', 'Mental health professionals'],
        resources: ['Suicide risk assessment', 'Safety planning', 'Crisis counseling'],
        timeline: 'Within 15 minutes'
      });
    }

    if (analysisResult.severityLevel === 'high' || analysisResult.severityLevel === 'medium') {
      actions.push({
        type: 'monitor',
        description: 'Implement enhanced monitoring and support protocols',
        contacts: ['Peer support team', 'Regular check-in coordinator', 'Mental health navigator'],
        resources: ['Increased check-ins', 'Safety plan review', 'Additional coping resources'],
        timeline: 'Within 1 hour'
      });
    }

    if (analysisResult.hasCrisisIndicators) {
      actions.push({
        type: 'support',
        description: 'Provide immediate emotional support and resource connection',
        contacts: ['Peer supporters', 'Crisis chat volunteers', 'Mental health advocates'],
        resources: ['Crisis chat', 'Emotional support', 'Resource navigation', 'Coping strategies'],
        timeline: 'Immediately available'
      });
    }

    return actions;
  }

  /**
   * Generate crisis response for different user types
   */
  public generateCrisisResponse(analysisResult: CrisisAnalysisResult, userType: 'seeker' | 'helper'): {
    message: string;
    actions: string[];
    resources: string[];
    followUp: string[];
  } {
    const isSeeker = userType === 'seeker';
    
    if (analysisResult.emergencyServices) {
      return {
        message: isSeeker 
          ? "I'm very concerned about your safety right now. You mentioned thoughts or plans that suggest immediate danger. Please reach out for emergency help immediately."
          : "The person you're helping has indicated immediate danger. This requires emergency intervention. Do not attempt to handle this alone.",
        actions: [
          'Call 911 immediately',
          'Contact 988 Suicide & Crisis Lifeline: 988',
          'Text HOME to 741741 for Crisis Text Line',
          isSeeker ? 'Stay with someone or go to emergency room' : 'Ensure the person is not left alone'
        ],
        resources: [
          '988 Suicide & Crisis Lifeline',
          'National Crisis Text Line: Text HOME to 741741',
          'Emergency Services: 911',
          'Crisis Chat: suicidepreventionlifeline.org/chat'
        ],
        followUp: [
          'Emergency services contacted',
          'Safety assessment completed',
          'Crisis intervention activated',
          'Professional follow-up scheduled'
        ]
      };
    }

    if (analysisResult.escalationRequired) {
      return {
        message: isSeeker
          ? "I can see you're going through something very difficult right now. Your safety is important, and I want to connect you with people who can provide immediate help."
          : "The situation you're dealing with requires immediate professional support. Please help connect this person with crisis resources.",
        actions: [
          'Contact crisis hotline: 988',
          'Reach out to a mental health professional',
          'Connect with crisis chat support',
          'Contact trusted friend or family member'
        ],
        resources: [
          '988 Suicide & Crisis Lifeline',
          'Crisis Text Line: 741741',
          'Local crisis services',
          'Mental health emergency services'
        ],
        followUp: [
          'Crisis counselor consultation',
          'Safety plan development',
          'Regular check-ins scheduled',
          'Professional referral provided'
        ]
      };
    }

    // Medium/High severity response
    return {
      message: isSeeker
        ? "I notice you're struggling with some difficult thoughts and feelings. You don't have to go through this alone - there are people and resources available to help."
        : "The person you're supporting is showing signs of distress that may need additional support. Consider connecting them with professional resources.",
      actions: [
        'Talk to someone you trust',
        'Consider contacting a counselor or therapist',
        'Use coping strategies from your safety plan',
        'Reach out to support networks'
      ],
      resources: [
        'Mental health professionals',
        'Support groups',
        'Crisis resources',
        'Peer support networks'
      ],
      followUp: [
        'Schedule regular check-ins',
        'Review and update safety plan',
        'Connect with ongoing support',
        'Monitor mood and symptoms'
      ]
    };
  }
}

// Create singleton instance
class AstralCoreCrisisDetectionService extends EnhancedCrisisDetectionService {}

// Singleton instance for Astral Core
export const astralCoreCrisisDetection = new AstralCoreCrisisDetectionService();
export const crisisDetectionService = astralCoreCrisisDetection; // Backward compatibility
export const enhancedCrisisDetectionService = astralCoreCrisisDetection; // Alias for components using this name
export default astralCoreCrisisDetection;
export type { CrisisAnalysisResult, CrisisIndicator, CrisisEscalationAction };
