/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCulturalContext, getCrisisTranslation } from '../i18n/index';

interface CrisisKeyword {
  word: string;
  weight: number;
  cultural_context?: string[];
}

interface LanguageCrisisPatterns {
  language: string;
  urgent_keywords: CrisisKeyword[];
  moderate_keywords: CrisisKeyword[];
  cultural_expressions: CrisisKeyword[];
  help_seeking_phrases: CrisisKeyword[];
}

/**
 * Multilingual AI Crisis Detection Service
 * Detects crisis indicators across multiple languages with cultural context awareness
 */
class MultilingualCrisisDetectionService {
  private crisisPatterns: Map<string, LanguageCrisisPatterns> = new Map();
  private initialized = false;

  constructor() {
    this.initializeCrisisPatterns();
  }

  private initializeCrisisPatterns() {
    // English crisis patterns
    this.crisisPatterns.set('en', {
      language: 'en',
      urgent_keywords: [
        { word: 'suicide', weight: 10 },
        { word: 'suicidal', weight: 10 },
        { word: 'kill myself', weight: 10 },
        { word: 'end it all', weight: 9 },
        { word: 'end it', weight: 9 },
        { word: 'want to die', weight: 9 },
        { word: 'no way out', weight: 8 },
        { word: 'can\'t go on', weight: 8 },
        { word: 'self harm', weight: 8 },
        { word: 'self-harm', weight: 8 },
        { word: 'ending things', weight: 9 },
        { word: 'done with this shit', weight: 8 },
        { word: 'gonna end it', weight: 9 }
      ],
      moderate_keywords: [
        { word: 'hopeless', weight: 7 },
        { word: 'worthless', weight: 6 },
        { word: 'burden', weight: 6 },
        { word: 'alone', weight: 5 },
        { word: 'trapped', weight: 7 },
        { word: 'pain', weight: 5 },
        { word: 'can\'t take it', weight: 6 },
        { word: 'thinking about', weight: 4 }
      ],
      cultural_expressions: [
        { word: 'rock bottom', weight: 7 },
        { word: 'at the end of my rope', weight: 8 },
        { word: 'drowning', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'done with', weight: 7 },
        { word: 'over it', weight: 6 }
      ],
      help_seeking_phrases: [
        { word: 'need help', weight: 6 },
        { word: 'someone please', weight: 7 },
        { word: 'reach out', weight: 5 }
      ]
    });

    // Spanish crisis patterns - considering Latino/Hispanic cultural expressions
    this.crisisPatterns.set('es', {
      language: 'es',
      urgent_keywords: [
        { word: 'suicidio', weight: 10 },
        { word: 'matarme', weight: 10 },
        { word: 'quitarme la vida', weight: 10 },
        { word: 'quiero morir', weight: 9 },
        { word: 'no puedo más', weight: 8 },
        { word: 'sin salida', weight: 8 },
        { word: 'autolesión', weight: 8 }
      ],
      moderate_keywords: [
        { word: 'sin esperanza', weight: 7 },
        { word: 'inútil', weight: 6 },
        { word: 'carga', weight: 6 },
        { word: 'solo', weight: 5 },
        { word: 'sola', weight: 5 },
        { word: 'atrapado', weight: 7 },
        { word: 'atrapada', weight: 7 },
        { word: 'dolor', weight: 5 }
      ],
      cultural_expressions: [
        { word: 'tocar fondo', weight: 7 },
        { word: 'al límite', weight: 8 },
        { word: 'ahogándome', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'dios mío', weight: 4, cultural_context: ['religious'] },
        { word: 'virgen santa', weight: 4, cultural_context: ['religious'] },
        { word: 'me lleva', weight: 5, cultural_context: ['colloquial'] }
      ],
      help_seeking_phrases: [
        { word: 'necesito ayuda', weight: 6 },
        { word: 'alguien por favor', weight: 7 },
        { word: 'auxilio', weight: 8 },
        { word: 'socorro', weight: 8 }
      ]
    });

    // Portuguese crisis patterns - Brazilian and Portuguese contexts
    this.crisisPatterns.set('pt', {
      language: 'pt',
      urgent_keywords: [
        { word: 'suicídio', weight: 10 },
        { word: 'me matar', weight: 10 },
        { word: 'tirar a vida', weight: 10 },
        { word: 'quero morrer', weight: 9 },
        { word: 'não aguento mais', weight: 8 },
        { word: 'sem saída', weight: 8 },
        { word: 'autolesão', weight: 8 }
      ],
      moderate_keywords: [
        { word: 'sem esperança', weight: 7 },
        { word: 'inútil', weight: 6 },
        { word: 'fardo', weight: 6 },
        { word: 'sozinho', weight: 5 },
        { word: 'sozinha', weight: 5 },
        { word: 'preso', weight: 7 },
        { word: 'presa', weight: 7 },
        { word: 'dor', weight: 5 }
      ],
      cultural_expressions: [
        { word: 'chegar ao fundo do poço', weight: 7 },
        { word: 'no limite', weight: 8 },
        { word: 'me afogando', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'meu deus', weight: 4, cultural_context: ['religious'] },
        { word: 'nossa senhora', weight: 4, cultural_context: ['religious'] },
        { word: 'tô ferrado', weight: 5, cultural_context: ['brazilian_colloquial'] }
      ],
      help_seeking_phrases: [
        { word: 'preciso de ajuda', weight: 6 },
        { word: 'alguém por favor', weight: 7 },
        { word: 'me ajudem', weight: 7 },
        { word: 'socorro', weight: 8 }
      ]
    });

    // Arabic crisis patterns - considering Islamic cultural context
    this.crisisPatterns.set('ar', {
      language: 'ar',
      urgent_keywords: [
        { word: 'انتحار', weight: 10 },
        { word: 'أقتل نفسي', weight: 10 },
        { word: 'أريد أن أموت', weight: 9 },
        { word: 'لا أستطيع المتابعة', weight: 8 },
        { word: 'لا مخرج', weight: 8 },
        { word: 'إيذاء النفس', weight: 8 }
      ],
      moderate_keywords: [
        { word: 'بلا أمل', weight: 7 },
        { word: 'عديم الفائدة', weight: 6 },
        { word: 'عبء', weight: 6 },
        { word: 'وحيد', weight: 5 },
        { word: 'وحيدة', weight: 5 },
        { word: 'محاصر', weight: 7 },
        { word: 'محاصرة', weight: 7 },
        { word: 'ألم', weight: 5 }
      ],
      cultural_expressions: [
        { word: 'وصلت للقاع', weight: 7 },
        { word: 'في الحضيض', weight: 8 },
        { word: 'أغرق', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'يا رب', weight: 4, cultural_context: ['religious'] },
        { word: 'الله يعين', weight: 4, cultural_context: ['religious'] },
        { word: 'حسبي الله', weight: 5, cultural_context: ['religious'] }
      ],
      help_seeking_phrases: [
        { word: 'أحتاج مساعدة', weight: 6 },
        { word: 'أحد من فضلكم', weight: 7 },
        { word: 'ساعدوني', weight: 7 },
        { word: 'النجدة', weight: 8 }
      ]
    });

    // Chinese crisis patterns
    this.crisisPatterns.set('zh', {
      language: 'zh',
      urgent_keywords: [
        { word: '自杀', weight: 10 },
        { word: '杀死自己', weight: 10 },
        { word: '想死', weight: 9 },
        { word: '活不下去', weight: 8 },
        { word: '没有出路', weight: 8 },
        { word: '自伤', weight: 8 }
      ],
      moderate_keywords: [
        { word: '绝望', weight: 7 },
        { word: '无用', weight: 6 },
        { word: '负担', weight: 6 },
        { word: '孤独', weight: 5 },
        { word: '被困', weight: 7 },
        { word: '痛苦', weight: 5 }
      ],
      cultural_expressions: [
        { word: '走投无路', weight: 8 },
        { word: '山穷水尽', weight: 7 },
        { word: '生无可恋', weight: 9, cultural_context: ['traditional'] },
        { word: '度日如年', weight: 6, cultural_context: ['traditional'] }
      ],
      help_seeking_phrases: [
        { word: '需要帮助', weight: 6 },
        { word: '请帮忙', weight: 7 },
        { word: '救救我', weight: 8 }
      ]
    });

    // Vietnamese crisis patterns
    this.crisisPatterns.set('vi', {
      language: 'vi',
      urgent_keywords: [
        { word: 'tự tử', weight: 10 },
        { word: 'giết mình', weight: 10 },
        { word: 'muốn chết', weight: 9 },
        { word: 'không thể tiếp tục', weight: 8 },
        { word: 'không có lối thoát', weight: 8 },
        { word: 'tự hại', weight: 8 }
      ],
      moderate_keywords: [
        { word: 'tuyệt vọng', weight: 7 },
        { word: 'vô dụng', weight: 6 },
        { word: 'gánh nặng', weight: 6 },
        { word: 'cô đơn', weight: 5 },
        { word: 'bị mắc kẹt', weight: 7 },
        { word: 'đau khổ', weight: 5 }
      ],
      cultural_expressions: [
        { word: 'chạm đáy', weight: 7 },
        { word: 'cùng đường', weight: 8 },
        { word: 'chìm đắm', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'trời ơi', weight: 4, cultural_context: ['exclamation'] }
      ],
      help_seeking_phrases: [
        { word: 'cần giúp đỡ', weight: 6 },
        { word: 'ai đó xin hãy', weight: 7 },
        { word: 'cứu giúp', weight: 8 }
      ]
    });

    // Tagalog crisis patterns
    this.crisisPatterns.set('tl', {
      language: 'tl',
      urgent_keywords: [
        { word: 'magpakamatay', weight: 10 },
        { word: 'patayin ang sarili', weight: 10 },
        { word: 'gusto kong mamatay', weight: 9 },
        { word: 'hindi na kaya', weight: 8 },
        { word: 'walang labas', weight: 8 },
        { word: 'saktan ang sarili', weight: 8 }
      ],
      moderate_keywords: [
        { word: 'walang pag-asa', weight: 7 },
        { word: 'walang silbi', weight: 6 },
        { word: 'pabigat', weight: 6 },
        { word: 'mag-isa', weight: 5 },
        { word: 'nakulong', weight: 7 },
        { word: 'sakit', weight: 5 }
      ],
      cultural_expressions: [
        { word: 'nasa ilalim na', weight: 7 },
        { word: 'wala na talaga', weight: 8 },
        { word: 'nalulunod', weight: 6, cultural_context: ['metaphorical'] },
        { word: 'diyos ko', weight: 4, cultural_context: ['religious'] },
        { word: 'mama mary', weight: 4, cultural_context: ['religious'] }
      ],
      help_seeking_phrases: [
        { word: 'kailangan ng tulong', weight: 6 },
        { word: 'tulong naman', weight: 7 },
        { word: 'saklolo', weight: 8 }
      ]
    });

    this.initialized = true;
  }

  /**
   * Analyze text for crisis indicators in the specified language
   */
  analyzeCrisisRisk(text: string, language: string = 'en'): {
    riskLevel: 'low' | 'moderate' | 'high' | 'urgent';
    score: number;
    detectedKeywords: string[];
    culturalContext: string[];
    recommendedResponse: string;
  } {
    if (!this.initialized) {
      this.initializeCrisisPatterns();
    }

    const patterns = this.crisisPatterns.get(language) || this.crisisPatterns.get('en')!;
    const culturalContext = getCulturalContext(language);
    
    let totalScore = 0;
    const detectedKeywords: string[] = [];
    const culturalContexts: string[] = [];
    
    const normalizedText = text.toLowerCase();

    // Check urgent keywords
    patterns.urgent_keywords.forEach(keyword => {
      if (normalizedText.includes(keyword.word.toLowerCase())) {
        totalScore += keyword.weight;
        detectedKeywords.push(keyword.word);
        if (keyword.cultural_context) {
          culturalContexts.push(...keyword.cultural_context);
        }
      }
    });

    // Check moderate keywords
    patterns.moderate_keywords.forEach(keyword => {
      if (normalizedText.includes(keyword.word.toLowerCase())) {
        totalScore += keyword.weight;
        detectedKeywords.push(keyword.word);
        if (keyword.cultural_context) {
          culturalContexts.push(...keyword.cultural_context);
        }
      }
    });

    // Check cultural expressions
    patterns.cultural_expressions.forEach(keyword => {
      if (normalizedText.includes(keyword.word.toLowerCase())) {
        totalScore += keyword.weight;
        detectedKeywords.push(keyword.word);
        if (keyword.cultural_context) {
          culturalContexts.push(...keyword.cultural_context);
        }
      }
    });

    // Check help-seeking phrases
    patterns.help_seeking_phrases.forEach(keyword => {
      if (normalizedText.includes(keyword.word.toLowerCase())) {
        totalScore += keyword.weight * 0.8; // Slightly lower weight for help-seeking
        detectedKeywords.push(keyword.word);
        if (keyword.cultural_context) {
          culturalContexts.push(...keyword.cultural_context);
        }
      }
    });

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'urgent';
    if (totalScore >= 10) {
      riskLevel = 'urgent';
    } else if (totalScore >= 7) {
      riskLevel = 'high';
    } else if (totalScore >= 4) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    // Get culturally appropriate response
    const recommendedResponse = this.getRecommendedResponse(riskLevel, language, culturalContext);

    return {
      riskLevel,
      score: totalScore,
      detectedKeywords,
      culturalContext: [...new Set(culturalContexts)],
      recommendedResponse
    };
  }

  private getRecommendedResponse(
    riskLevel: 'low' | 'moderate' | 'high' | 'urgent',
    _language: string,
    culturalContext: any
  ): string {
    const baseKey = `messages.${riskLevel}_risk_response`;
    
    // Use cultural context to select appropriate response
    if (culturalContext.crisisEscalationPreference === 'family') {
      return getCrisisTranslation(`${baseKey}_family_context`) || 
             getCrisisTranslation(baseKey);
    } else if (culturalContext.crisisEscalationPreference === 'community') {
      return getCrisisTranslation(`${baseKey}_community_context`) || 
             getCrisisTranslation(baseKey);
    } else {
      return getCrisisTranslation(`${baseKey}_professional_context`) || 
             getCrisisTranslation(baseKey);
    }
  }

  /**
   * Add custom crisis patterns for a language
   */
  addCustomPatterns(language: string, patterns: Partial<LanguageCrisisPatterns>) {
    const existing = this.crisisPatterns.get(language) || {
      language,
      urgent_keywords: [],
      moderate_keywords: [],
      cultural_expressions: [],
      help_seeking_phrases: []
    };

    this.crisisPatterns.set(language, {
      ...existing,
      ...patterns
    });
  }

  /**
   * Get supported languages for crisis detection
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.crisisPatterns.keys());
  }

  /**
   * Detect crisis with language auto-detection
   */
  async detectCrisis(text: string, language?: string): Promise<{
    riskLevel: string;
    confidence: number;
    triggers: string[];
    culturalRecommendations: string[];
    detectedLanguage: string;
    languageConfidence: number;
  }> {
    const detectedLanguage = language || await this.detectLanguage(text);
    const result = this.analyzeCrisisRisk(text, detectedLanguage);
    
    // Calculate confidence ensuring minimum value for non-empty text
    let confidence = result.score / 10; // Normalize score to 0-1
    if (text.trim().length > 0 && confidence === 0) {
      // If we have text but no keywords detected, still assign a minimal confidence
      confidence = 0.1;
    }
    
    return {
      riskLevel: result.riskLevel,
      confidence,
      triggers: result.detectedKeywords,
      culturalRecommendations: [result.recommendedResponse],
      detectedLanguage,
      languageConfidence: 0.9 // Simplified for now
    };
  }

  /**
   * Simple language detection (mock implementation)
   */
  private async detectLanguage(text: string): Promise<string> {
    const textLower = text.toLowerCase();
    
    // More comprehensive language detection
    // Chinese characters
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    
    // Arabic characters
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    
    // Hebrew characters
    if (/[\u0590-\u05ff]/.test(text)) return 'he';
    
    // Cyrillic (Russian)
    if (/[\u0400-\u04ff]/.test(text)) return 'ru';
    
    // Hindi/Devanagari
    if (/[\u0900-\u097f]/.test(text)) return 'hi';
    
    // Spanish indicators - check for common Spanish words and patterns
    if (/\b(quiero|terminar|vida|morir|puedo|más|muy|triste)\b/.test(textLower) ||
        /[áéíóúñü]/.test(textLower)) {
      return 'es';
    }
    
    // French indicators - check for common French words and patterns
    if (/\b(je|veux|mourir|plus|vivre|mal)\b/.test(textLower) ||
        /[àâäéèêëîïôöùûüÿç]/.test(textLower)) {
      return 'fr';
    }
    
    // German indicators
    if (/\b(ich|nicht|mehr|leben|will|sterben)\b/.test(textLower) ||
        /[äöüß]/.test(textLower)) {
      return 'de';
    }
    
    // Portuguese indicators
    if (/\b(não|aguento|mais|quero|morrer)\b/.test(textLower) ||
        /[ãõáéíóúâê]/.test(textLower)) {
      return 'pt';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Reset service state for testing
   */
  reset(): void {
    this.initialized = false;
    this.initializeCrisisPatterns();
    this.initialized = true;
  }
}

export const multilingualCrisisDetectionService = new MultilingualCrisisDetectionService();
export default multilingualCrisisDetectionService;
