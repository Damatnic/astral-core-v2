/**
 * Cultural Context Service
 * 
 * Provides cultural context information for privacy-preserving analytics
 * and culturally-sensitive crisis intervention analysis.
 * 
 * @license Apache-2.0
 */

export interface CulturalContext {
  region: string;
  mentalHealthStigma: 'low' | 'medium' | 'high';
  familyInvolvement: 'individual' | 'family-centered' | 'community-based';
  crisisEscalation: 'direct' | 'gradual' | 'authority-based';
  communicationStyle: 'direct' | 'indirect' | 'contextual';
}

class CulturalContextService {
  private readonly culturalContexts: Record<string, CulturalContext> = {
    'en': {
      region: 'Western',
      mentalHealthStigma: 'medium',
      familyInvolvement: 'individual',
      crisisEscalation: 'direct',
      communicationStyle: 'direct'
    },
    'es': {
      region: 'Hispanic/Latino',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'gradual',
      communicationStyle: 'contextual'
    },
    'pt-BR': {
      region: 'Brazilian',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'gradual',
      communicationStyle: 'contextual'
    },
    'pt': {
      region: 'Portuguese',
      mentalHealthStigma: 'medium',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'gradual',
      communicationStyle: 'contextual'
    },
    'ar': {
      region: 'Arabic',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'authority-based',
      communicationStyle: 'indirect'
    },
    'zh': {
      region: 'Chinese',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'gradual',
      communicationStyle: 'indirect'
    },
    'vi': {
      region: 'Vietnamese',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'authority-based',
      communicationStyle: 'indirect'
    },
    'tl': {
      region: 'Filipino',
      mentalHealthStigma: 'high',
      familyInvolvement: 'family-centered',
      crisisEscalation: 'gradual',
      communicationStyle: 'contextual'
    }
  };

  /**
   * Get cultural context for a language
   */
  getCulturalContext(language: string): CulturalContext {
    return this.culturalContexts[language] || this.culturalContexts['en'];
  }

  /**
   * Get all supported cultural contexts
   */
  getAllCulturalContexts(): Record<string, CulturalContext> {
    return { ...this.culturalContexts };
  }

  /**
   * Get cultural regions list
   */
  getCulturalRegions(): string[] {
    return [...new Set(Object.values(this.culturalContexts).map(c => c.region))];
  }
}

export default CulturalContextService;
export const culturalContextService = new CulturalContextService();
