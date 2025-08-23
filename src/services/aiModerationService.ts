/**
 * AI Content Moderation Service
 * 
 * Provides content filtering, safety checks, and appropriate response generation
 * for mental health chat interactions.
 */

interface ModerationResult {
  safe: boolean;
  reason?: string;
  category?: 'harmful' | 'crisis' | 'spam' | 'inappropriate' | 'manipulation';
  suggestedResponse?: string;
  escalate?: boolean;
}

interface SafetyFilter {
  pattern: RegExp;
  category: ModerationResult['category'];
  severity: 'low' | 'medium' | 'high';
  response: string;
}

class AIModerationService {
  private safetyFilters: SafetyFilter[] = [
    // Harmful content
    {
      pattern: /\b(how to|ways to|methods? (of|to)|instructions? (for|to))\s+(kill|harm|hurt|end)\s+(myself|yourself|others?|someone)/i,
      category: 'harmful',
      severity: 'high',
      response: "I'm very concerned about what you're asking. I can't provide information that could be harmful. If you're having thoughts of self-harm, please reach out to the 988 Suicide & Crisis Lifeline or emergency services at 911."
    },
    {
      pattern: /\b(suicide|self[- ]?harm|cutting|overdose)\s+(methods?|techniques?|ways?|instructions?)/i,
      category: 'harmful',
      severity: 'high',
      response: "I understand you're going through something incredibly difficult, but I can't provide that type of information. Your life has value, and there is help available. Please contact the 988 Suicide & Crisis Lifeline for immediate support."
    },
    
    // Crisis situations requiring immediate attention
    {
      pattern: /\b(going to|about to|planning to|will)\s+(kill|end|hurt)\s+(myself|my life)/i,
      category: 'crisis',
      severity: 'high',
      response: "I'm extremely concerned about your safety right now. This is a crisis situation, and you need immediate help. Please call 911 or the 988 Suicide & Crisis Lifeline immediately. You don't have to go through this alone."
    },
    {
      pattern: /\b(goodbye|final|last)\s+(message|words?|note)/i,
      category: 'crisis',
      severity: 'high',
      response: "Your message deeply concerns me. This sounds like you may be saying goodbye, and I want you to know that your life matters. Please reach out for immediate help: Call 988 for the Suicide & Crisis Lifeline or 911 for emergency services. There are people who want to help you through this."
    },
    
    // Inappropriate content
    {
      pattern: /\b(sexual|explicit|nude|porn)/i,
      category: 'inappropriate',
      severity: 'medium',
      response: "I'm here to provide mental health support in a safe and appropriate way. Let's focus on how I can help you with your emotional wellbeing. What's on your mind today?"
    },
    {
      pattern: /\b(fuck|shit|damn|hell)\s+(you|off|this)/i,
      category: 'inappropriate',
      severity: 'low',
      response: "I can sense you're feeling frustrated or angry. Those are valid emotions. Would you like to talk about what's causing these feelings?"
    },
    
    // Manipulation attempts
    {
      pattern: /\b(ignore|forget|disregard)\s+(your|all|previous)\s+(instructions?|rules?|guidelines?)/i,
      category: 'manipulation',
      severity: 'medium',
      response: "I'm designed to provide mental health support within safe and ethical guidelines. How can I help support your wellbeing today?"
    },
    {
      pattern: /\b(pretend|act like|roleplay)\s+(you('re|\s+are)|as)\s+(a\s+)?(therapist|counselor|doctor|psychiatrist)/i,
      category: 'manipulation',
      severity: 'medium',
      response: "I'm an AI support companion, not a licensed mental health professional. While I can offer emotional support and coping strategies, I cannot provide therapy or medical advice. Would you like help finding professional resources?"
    },
    
    // Spam patterns
    {
      pattern: /(.)\1{10,}/,  // Repeated characters
      category: 'spam',
      severity: 'low',
      response: "I'm having trouble understanding your message. Could you rephrase what you'd like to talk about?"
    }
  ];
  
  private contextualFactors = {
    // Factors that might indicate genuine distress vs harmful intent
    distressIndicators: [
      'help', 'please', 'scared', 'afraid', 'lonely', 'pain', 'suffering',
      'can\'t', 'don\'t know', 'confused', 'lost', 'overwhelmed'
    ],
    
    // Protective factors that suggest help-seeking
    protectiveIndicators: [
      'support', 'advice', 'guidance', 'cope', 'manage', 'deal with',
      'get through', 'feel better', 'improve', 'resources'
    ]
  };
  
  /**
   * Moderate a message for safety and appropriateness
   */
  public moderateMessage(message: string): ModerationResult {
    if (!message || typeof message !== 'string') {
      return { safe: false, reason: 'Invalid message format' };
    }
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check for empty or very short messages
    if (normalizedMessage.length < 2) {
      return { safe: false, reason: 'Message too short', category: 'spam' };
    }
    
    // Check for excessive length (potential spam)
    if (normalizedMessage.length > 5000) {
      return { safe: false, reason: 'Message too long', category: 'spam' };
    }
    
    // Check against safety filters
    for (const filter of this.safetyFilters) {
      if (filter.pattern.test(normalizedMessage)) {
        // Check for contextual factors
        const hasProtectiveIndicators = this.contextualFactors.protectiveIndicators.some(
          indicator => normalizedMessage.includes(indicator)
        );
        
        // If high severity and no protective factors, escalate
        const shouldEscalate = filter.severity === 'high' && 
                               !hasProtectiveIndicators &&
                               filter.category === 'crisis';
        
        return {
          safe: false,
          reason: `Content matches ${filter.category} filter`,
          category: filter.category,
          suggestedResponse: filter.response,
          escalate: shouldEscalate
        };
      }
    }
    
    // Check for repetitive spam
    const words = normalizedMessage.split(/\s+/);
    if (words.length > 5) {
      const uniqueWords = new Set(words);
      const uniqueRatio = uniqueWords.size / words.length;
      
      if (uniqueRatio < 0.3) {
        return {
          safe: false,
          reason: 'Message appears to be spam',
          category: 'spam',
          suggestedResponse: 'Could you please share what\'s on your mind in your own words?'
        };
      }
    }
    
    return { safe: true };
  }
  
  /**
   * Generate a safe response for filtered content
   */
  public generateSafeResponse(moderationResult: ModerationResult): string {
    if (moderationResult.suggestedResponse) {
      return moderationResult.suggestedResponse;
    }
    
    switch (moderationResult.category) {
      case 'harmful':
        return "I'm concerned about your wellbeing. If you're having thoughts of self-harm, please reach out to the 988 Suicide & Crisis Lifeline. I'm here to provide emotional support - would you like to talk about what you're feeling?";
      
      case 'crisis':
        return "This sounds like an emergency situation. Please contact 911 or the 988 Suicide & Crisis Lifeline immediately for help. Your life is valuable, and there are people who want to support you.";
      
      case 'inappropriate':
        return "Let's keep our conversation focused on supporting your mental health and wellbeing. What would you like to talk about today?";
      
      case 'spam':
        return "I'm having trouble understanding your message. Could you tell me more about what you're experiencing or feeling?";
      
      case 'manipulation':
        return "I'm here to provide emotional support within my capabilities as an AI companion. How can I best support you today?";
      
      default:
        return "I want to make sure I'm providing appropriate support. Could you help me understand what you need right now?";
    }
  }
  
  /**
   * Check if a conversation needs human intervention
   */
  public needsHumanIntervention(messages: Array<{ text: string; sender: 'user' | 'ai' }>): boolean {
    // Check recent user messages for crisis indicators
    const recentUserMessages = messages
      .filter(m => m.sender === 'user')
      .slice(-5); // Last 5 user messages
    
    let crisisCount = 0;
    let harmfulCount = 0;
    
    for (const message of recentUserMessages) {
      const moderation = this.moderateMessage(message.text);
      if (moderation.category === 'crisis') crisisCount++;
      if (moderation.category === 'harmful') harmfulCount++;
    }
    
    // Escalate if multiple crisis/harmful messages
    return crisisCount >= 2 || harmfulCount >= 3;
  }
  
  /**
   * Sanitize user input for display
   */
  public sanitizeForDisplay(text: string): string {
    // Remove potential XSS attempts
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}

// Export singleton instance
export const aiModerationService = new AIModerationService();

export default aiModerationService;