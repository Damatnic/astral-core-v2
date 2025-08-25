/**
 * Cultural Context Service
 *
 * Comprehensive cultural adaptation service for mental health platform.
 * Provides culturally-sensitive content, localized resources, and
 * culturally-aware assessment tools for diverse user populations.
 *
 * @fileoverview Cultural context service with localized mental health resources
 * @version 2.0.0
 */

import { logger } from '../utils/logger';
import { secureStorage } from './secureStorageService';

export type CulturalContext = 
  | 'western-individualistic'
  | 'eastern-collectivistic'
  | 'latin-american'
  | 'african'
  | 'indigenous'
  | 'middle-eastern'
  | 'south-asian'
  | 'east-asian'
  | 'nordic'
  | 'mediterranean'
  | 'multicultural';

export type LanguageCode = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' 
  | 'ar' | 'hi' | 'th' | 'vi' | 'nl' | 'sv' | 'no' | 'da' | 'fi';

export type CulturalDimension = 
  | 'individualism-collectivism'
  | 'power-distance'
  | 'uncertainty-avoidance'
  | 'masculinity-femininity'
  | 'long-term-orientation'
  | 'indulgence-restraint'
  | 'emotional-expression'
  | 'help-seeking-behavior';

export interface CulturalProfile {
  userId: string;
  primaryContext: CulturalContext;
  secondaryContexts: CulturalContext[];
  preferredLanguage: LanguageCode;
  fallbackLanguages: LanguageCode[];
  culturalDimensions: Record<CulturalDimension, number>; // 0-100 scale
  religiousAffiliation?: string;
  generationStatus?: 'first' | 'second' | 'third-plus';
  acculturationLevel?: 'low' | 'medium' | 'high' | 'bicultural';
  preferences: CulturalPreferences;
  lastUpdated: Date;
}

export interface CulturalPreferences {
  familyInvolvement: 'minimal' | 'moderate' | 'high';
  communitySupport: 'individual' | 'group' | 'community-based';
  spiritualIntegration: 'secular' | 'spiritual' | 'religious';
  communicationStyle: 'direct' | 'indirect' | 'context-dependent';
  authorityRelation: 'egalitarian' | 'hierarchical' | 'respectful';
  emotionalExpression: 'open' | 'reserved' | 'culturally-appropriate';
  treatmentApproach: 'western-clinical' | 'traditional-healing' | 'integrated';
  privacyConcerns: 'individual' | 'family' | 'community';
}

export interface CulturalResource {
  id: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'assessment' | 'contact';
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  content: Record<LanguageCode, any>;
  culturalContexts: CulturalContext[];
  targetAudience: {
    ageRange?: [number, number];
    gender?: 'male' | 'female' | 'non-binary' | 'all';
    generation?: 'first' | 'second' | 'third-plus' | 'all';
  };
  tags: string[];
  credibility: {
    source: string;
    culturalReviewer: string;
    lastReviewed: Date;
    communityRating?: number;
  };
  accessibility: {
    readingLevel: number;
    audioAvailable: boolean;
    visualAids: boolean;
    signLanguage: boolean;
  };
}

export interface CulturalAdaptation {
  assessmentId: string;
  originalQuestions: AssessmentQuestion[];
  adaptedQuestions: Record<CulturalContext, AssessmentQuestion[]>;
  culturalNorms: Record<CulturalContext, {
    scoreAdjustments: number[];
    interpretationGuidelines: string;
    culturalFactors: string[];
  }>;
  validationData: {
    sampleSize: number;
    reliability: number;
    validity: number;
    culturalEquivalence: number;
  };
}

export interface AssessmentQuestion {
  id: string;
  text: Record<LanguageCode, string>;
  type: 'likert' | 'multiple-choice' | 'open-ended' | 'rating';
  options?: Record<LanguageCode, string[]>;
  culturalNotes?: Record<CulturalContext, string>;
  sensitivityLevel: 'low' | 'medium' | 'high';
}

export interface CulturalInsight {
  context: CulturalContext;
  dimension: CulturalDimension;
  insight: string;
  implications: string[];
  recommendations: string[];
  sources: string[];
}

export interface LocalizedContent {
  key: string;
  translations: Record<LanguageCode, string>;
  culturalAdaptations: Record<CulturalContext, {
    content: string;
    explanation?: string;
    alternatives?: string[];
  }>;
  lastUpdated: Date;
}

class CulturalContextService {
  private culturalProfiles: Map<string, CulturalProfile> = new Map();
  private culturalResources: Map<string, CulturalResource> = new Map();
  private culturalAdaptations: Map<string, CulturalAdaptation> = new Map();
  private localizedContent: Map<string, LocalizedContent> = new Map();
  private culturalInsights: Map<string, CulturalInsight[]> = new Map();
  private initialized = false;

  constructor() {
    this.initializeCulturalData();
  }

  private async initializeCulturalData(): Promise<void> {
    try {
      // Load cultural resources and adaptations
      await this.loadCulturalResources();
      await this.loadCulturalAdaptations();
      await this.loadLocalizedContent();
      await this.loadCulturalInsights();
      
      this.initialized = true;
      logger.info('CulturalContextService initialized');
    } catch (error) {
      logger.error('Failed to initialize CulturalContextService:', error);
    }
  }

  public async createCulturalProfile(
    userId: string,
    profileData: Partial<CulturalProfile>
  ): Promise<CulturalProfile> {
    const profile: CulturalProfile = {
      userId,
      primaryContext: profileData.primaryContext || 'western-individualistic',
      secondaryContexts: profileData.secondaryContexts || [],
      preferredLanguage: profileData.preferredLanguage || 'en',
      fallbackLanguages: profileData.fallbackLanguages || ['en'],
      culturalDimensions: profileData.culturalDimensions || this.getDefaultDimensions(),
      religiousAffiliation: profileData.religiousAffiliation,
      generationStatus: profileData.generationStatus,
      acculturationLevel: profileData.acculturationLevel,
      preferences: profileData.preferences || this.getDefaultPreferences(),
      lastUpdated: new Date()
    };

    this.culturalProfiles.set(userId, profile);
    await this.saveCulturalProfile(profile);
    
    logger.info(`Cultural profile created for user: ${userId}`, {
      context: profile.primaryContext,
      language: profile.preferredLanguage
    });
    
    return profile;
  }

  private getDefaultDimensions(): Record<CulturalDimension, number> {
    return {
      'individualism-collectivism': 50,
      'power-distance': 50,
      'uncertainty-avoidance': 50,
      'masculinity-femininity': 50,
      'long-term-orientation': 50,
      'indulgence-restraint': 50,
      'emotional-expression': 50,
      'help-seeking-behavior': 50
    };
  }

  private getDefaultPreferences(): CulturalPreferences {
    return {
      familyInvolvement: 'moderate',
      communitySupport: 'individual',
      spiritualIntegration: 'secular',
      communicationStyle: 'direct',
      authorityRelation: 'egalitarian',
      emotionalExpression: 'open',
      treatmentApproach: 'western-clinical',
      privacyConcerns: 'individual'
    };
  }

  public async getCulturalProfile(userId: string): Promise<CulturalProfile | null> {
    let profile = this.culturalProfiles.get(userId);
    
    if (!profile) {
      profile = await this.loadCulturalProfile(userId);
      if (profile) {
        this.culturalProfiles.set(userId, profile);
      }
    }
    
    return profile;
  }

  public async updateCulturalProfile(
    userId: string,
    updates: Partial<CulturalProfile>
  ): Promise<CulturalProfile | null> {
    const profile = await this.getCulturalProfile(userId);
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
      lastUpdated: new Date()
    };

    this.culturalProfiles.set(userId, updatedProfile);
    await this.saveCulturalProfile(updatedProfile);
    
    return updatedProfile;
  }

  public async getLocalizedContent(
    key: string,
    userId: string,
    fallbackLanguage: LanguageCode = 'en'
  ): Promise<string> {
    const profile = await this.getCulturalProfile(userId);
    const content = this.localizedContent.get(key);
    
    if (!content) {
      logger.warn(`Localized content not found: ${key}`);
      return key; // Return key as fallback
    }

    // Try preferred language
    if (profile?.preferredLanguage && content.translations[profile.preferredLanguage]) {
      return content.translations[profile.preferredLanguage];
    }

    // Try fallback languages
    if (profile?.fallbackLanguages) {
      for (const lang of profile.fallbackLanguages) {
        if (content.translations[lang]) {
          return content.translations[lang];
        }
      }
    }

    // Try default fallback
    if (content.translations[fallbackLanguage]) {
      return content.translations[fallbackLanguage];
    }

    // Return first available translation
    const firstAvailable = Object.values(content.translations)[0];
    return firstAvailable || key;
  }

  public async getCulturallyAdaptedContent(
    key: string,
    userId: string
  ): Promise<{ content: string; explanation?: string; alternatives?: string[] }> {
    const profile = await this.getCulturalProfile(userId);
    const content = this.localizedContent.get(key);
    
    if (!content || !profile) {
      return { content: await this.getLocalizedContent(key, userId) };
    }

    // Check for cultural adaptation
    const adaptation = content.culturalAdaptations[profile.primaryContext];
    if (adaptation) {
      return adaptation;
    }

    // Check secondary contexts
    for (const context of profile.secondaryContexts) {
      const secondaryAdaptation = content.culturalAdaptations[context];
      if (secondaryAdaptation) {
        return secondaryAdaptation;
      }
    }

    // Return localized content without cultural adaptation
    return { content: await this.getLocalizedContent(key, userId) };
  }

  public async getRelevantCulturalResources(
    userId: string,
    resourceType?: CulturalResource['type'],
    limit: number = 10
  ): Promise<CulturalResource[]> {
    const profile = await this.getCulturalProfile(userId);
    if (!profile) return [];

    const allResources = Array.from(this.culturalResources.values());
    
    // Filter by cultural context
    const relevantResources = allResources.filter(resource => {
      const contextMatch = resource.culturalContexts.some(context =>
        context === profile.primaryContext || 
        profile.secondaryContexts.includes(context) ||
        context === 'multicultural'
      );
      
      const typeMatch = !resourceType || resource.type === resourceType;
      
      return contextMatch && typeMatch;
    });

    // Sort by relevance (simplified scoring)
    const scoredResources = relevantResources.map(resource => ({
      resource,
      score: this.calculateResourceRelevance(resource, profile)
    }));

    scoredResources.sort((a, b) => b.score - a.score);
    
    return scoredResources.slice(0, limit).map(item => item.resource);
  }

  private calculateResourceRelevance(
    resource: CulturalResource,
    profile: CulturalProfile
  ): number {
    let score = 0;

    // Primary context match
    if (resource.culturalContexts.includes(profile.primaryContext)) {
      score += 10;
    }

    // Secondary context match
    score += resource.culturalContexts.filter(context =>
      profile.secondaryContexts.includes(context)
    ).length * 5;

    // Language availability
    if (resource.title[profile.preferredLanguage]) {
      score += 8;
    }

    // Community rating
    if (resource.credibility.communityRating) {
      score += resource.credibility.communityRating * 2;
    }

    // Recency
    const daysSinceReview = (Date.now() - resource.credibility.lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - daysSinceReview / 30); // Decay over 30 days

    return score;
  }

  public async adaptAssessmentForCulture(
    assessmentId: string,
    userId: string
  ): Promise<AssessmentQuestion[]> {
    const profile = await this.getCulturalProfile(userId);
    const adaptation = this.culturalAdaptations.get(assessmentId);
    
    if (!profile || !adaptation) {
      return adaptation?.originalQuestions || [];
    }

    // Get adapted questions for user's cultural context
    const adaptedQuestions = adaptation.adaptedQuestions[profile.primaryContext];
    if (adaptedQuestions) {
      return this.localizeQuestions(adaptedQuestions, profile.preferredLanguage);
    }

    // Try secondary contexts
    for (const context of profile.secondaryContexts) {
      const secondaryAdapted = adaptation.adaptedQuestions[context];
      if (secondaryAdapted) {
        return this.localizeQuestions(secondaryAdapted, profile.preferredLanguage);
      }
    }

    // Return original questions localized
    return this.localizeQuestions(adaptation.originalQuestions, profile.preferredLanguage);
  }

  private localizeQuestions(
    questions: AssessmentQuestion[],
    language: LanguageCode
  ): AssessmentQuestion[] {
    return questions.map(question => ({
      ...question,
      text: {
        ...question.text,
        [language]: question.text[language] || question.text.en || Object.values(question.text)[0]
      },
      options: question.options ? {
        ...question.options,
        [language]: question.options[language] || question.options.en || Object.values(question.options)[0]
      } : undefined
    }));
  }

  public async getCulturalInsights(
    userId: string,
    dimension?: CulturalDimension
  ): Promise<CulturalInsight[]> {
    const profile = await this.getCulturalProfile(userId);
    if (!profile) return [];

    const contextInsights = this.culturalInsights.get(profile.primaryContext) || [];
    
    if (dimension) {
      return contextInsights.filter(insight => insight.dimension === dimension);
    }
    
    return contextInsights;
  }

  public async generateCulturalRecommendations(userId: string): Promise<{
    assessmentAdaptations: string[];
    resourceRecommendations: string[];
    communicationGuidelines: string[];
    familyInvolvementSuggestions: string[];
  }> {
    const profile = await this.getCulturalProfile(userId);
    if (!profile) {
      return {
        assessmentAdaptations: [],
        resourceRecommendations: [],
        communicationGuidelines: [],
        familyInvolvementSuggestions: []
      };
    }

    const recommendations = {
      assessmentAdaptations: this.generateAssessmentRecommendations(profile),
      resourceRecommendations: this.generateResourceRecommendations(profile),
      communicationGuidelines: this.generateCommunicationGuidelines(profile),
      familyInvolvementSuggestions: this.generateFamilyInvolvementSuggestions(profile)
    };

    return recommendations;
  }

  private generateAssessmentRecommendations(profile: CulturalProfile): string[] {
    const recommendations: string[] = [];

    if (profile.culturalDimensions['individualism-collectivism'] < 40) {
      recommendations.push('Consider family and community context in assessment responses');
      recommendations.push('Include questions about collective well-being and social harmony');
    }

    if (profile.culturalDimensions['emotional-expression'] < 40) {
      recommendations.push('Be aware that emotional expression may be culturally restrained');
      recommendations.push('Consider non-verbal and indirect indicators of distress');
    }

    if (profile.culturalDimensions['power-distance'] > 60) {
      recommendations.push('Frame questions with appropriate respect for authority figures');
      recommendations.push('Consider hierarchical family and social structures');
    }

    return recommendations;
  }

  private generateResourceRecommendations(profile: CulturalProfile): string[] {
    const recommendations: string[] = [];

    if (profile.preferences.spiritualIntegration !== 'secular') {
      recommendations.push('Include spiritual and religious coping resources');
      recommendations.push('Consider faith-based support networks');
    }

    if (profile.preferences.communitySupport === 'community-based') {
      recommendations.push('Emphasize community-based mental health resources');
      recommendations.push('Include cultural community centers and organizations');
    }

    if (profile.preferences.treatmentApproach === 'integrated') {
      recommendations.push('Combine traditional healing practices with clinical approaches');
      recommendations.push('Respect and validate traditional healing methods');
    }

    return recommendations;
  }

  private generateCommunicationGuidelines(profile: CulturalProfile): string[] {
    const guidelines: string[] = [];

    if (profile.preferences.communicationStyle === 'indirect') {
      guidelines.push('Use indirect communication and allow for context interpretation');
      guidelines.push('Be sensitive to non-verbal cues and silence');
    }

    if (profile.preferences.authorityRelation === 'hierarchical') {
      guidelines.push('Maintain appropriate respect for professional authority');
      guidelines.push('Consider family hierarchy in decision-making');
    }

    if (profile.culturalDimensions['uncertainty-avoidance'] > 60) {
      guidelines.push('Provide clear structure and predictability in interactions');
      guidelines.push('Explain processes and expectations thoroughly');
    }

    return guidelines;
  }

  private generateFamilyInvolvementSuggestions(profile: CulturalProfile): string[] {
    const suggestions: string[] = [];

    if (profile.preferences.familyInvolvement === 'high') {
      suggestions.push('Include family members in treatment planning when appropriate');
      suggestions.push('Consider family dynamics and collective decision-making');
    }

    if (profile.culturalDimensions['individualism-collectivism'] < 40) {
      suggestions.push('Recognize the importance of family and community support');
      suggestions.push('Address potential conflicts between individual and collective needs');
    }

    if (profile.preferences.privacyConcerns === 'family') {
      suggestions.push('Navigate privacy concerns within family contexts');
      suggestions.push('Balance individual confidentiality with family involvement');
    }

    return suggestions;
  }

  private async loadCulturalResources(): Promise<void> {
    // In a real implementation, this would load from a database or API
    // For now, we'll initialize with some sample resources
    const sampleResources: CulturalResource[] = [
      {
        id: 'breathing-exercise-multicultural',
        type: 'exercise',
        title: {
          en: 'Multicultural Breathing Exercise',
          es: 'Ejercicio de Respiración Multicultural',
          zh: '多元文化呼吸练习'
        },
        description: {
          en: 'A breathing exercise adapted for various cultural contexts',
          es: 'Un ejercicio de respiración adaptado para varios contextos culturales',
          zh: '适应各种文化背景的呼吸练习'
        },
        content: {
          en: { /* exercise content */ },
          es: { /* contenido del ejercicio */ },
          zh: { /* 练习内容 */ }
        },
        culturalContexts: ['multicultural', 'western-individualistic', 'eastern-collectivistic'],
        targetAudience: { ageRange: [16, 65], gender: 'all' },
        tags: ['breathing', 'anxiety', 'stress', 'mindfulness'],
        credibility: {
          source: 'Cultural Mental Health Institute',
          culturalReviewer: 'Dr. Maria Rodriguez',
          lastReviewed: new Date('2024-01-01'),
          communityRating: 4.5
        },
        accessibility: {
          readingLevel: 6,
          audioAvailable: true,
          visualAids: true,
          signLanguage: false
        }
      }
    ];

    sampleResources.forEach(resource => {
      this.culturalResources.set(resource.id, resource);
    });
  }

  private async loadCulturalAdaptations(): Promise<void> {
    // Sample cultural adaptation data
    // In a real implementation, this would be loaded from a database
  }

  private async loadLocalizedContent(): Promise<void> {
    // Sample localized content
    const sampleContent: LocalizedContent[] = [
      {
        key: 'welcome_message',
        translations: {
          en: 'Welcome to your mental health journey',
          es: 'Bienvenido a tu viaje de salud mental',
          zh: '欢迎来到您的心理健康之旅'
        },
        culturalAdaptations: {
          'eastern-collectivistic': {
            content: 'Welcome to our shared journey toward wellness and harmony',
            explanation: 'Emphasizes collective well-being'
          },
          'latin-american': {
            content: 'Bienvenido a este espacio de sanación y crecimiento familiar',
            explanation: 'Incorporates family and healing concepts'
          }
        },
        lastUpdated: new Date()
      }
    ];

    sampleContent.forEach(content => {
      this.localizedContent.set(content.key, content);
    });
  }

  private async loadCulturalInsights(): Promise<void> {
    // Sample cultural insights
    const insights: CulturalInsight[] = [
      {
        context: 'eastern-collectivistic',
        dimension: 'individualism-collectivism',
        insight: 'Mental health is often viewed through the lens of family and community harmony',
        implications: [
          'Individual symptoms may be understood as family or community issues',
          'Treatment decisions often involve extended family members',
          'Shame and stigma may be amplified due to community awareness'
        ],
        recommendations: [
          'Include family members in treatment planning when appropriate',
          'Address collective well-being alongside individual symptoms',
          'Provide education about mental health to reduce family stigma'
        ],
        sources: ['Cultural Psychology Research', 'Cross-Cultural Mental Health Studies']
      }
    ];

    insights.forEach(insight => {
      if (!this.culturalInsights.has(insight.context)) {
        this.culturalInsights.set(insight.context, []);
      }
      this.culturalInsights.get(insight.context)!.push(insight);
    });
  }

  private async saveCulturalProfile(profile: CulturalProfile): Promise<void> {
    try {
      await secureStorage.setItem(
        `cultural-profile-${profile.userId}`,
        JSON.stringify(profile)
      );
    } catch (error) {
      logger.error('Failed to save cultural profile:', error);
    }
  }

  private async loadCulturalProfile(userId: string): Promise<CulturalProfile | null> {
    try {
      const saved = await secureStorage.getItem(`cultural-profile-${userId}`);
      if (saved) {
        const profile = JSON.parse(saved);
        profile.lastUpdated = new Date(profile.lastUpdated);
        return profile;
      }
    } catch (error) {
      logger.error('Failed to load cultural profile:', error);
    }
    return null;
  }

  public async clearUserData(userId: string): Promise<void> {
    this.culturalProfiles.delete(userId);
    
    try {
      await secureStorage.removeItem(`cultural-profile-${userId}`);
    } catch (error) {
      logger.error('Failed to clear cultural profile:', error);
    }
  }
}

export const culturalContextService = new CulturalContextService();
export default culturalContextService;
