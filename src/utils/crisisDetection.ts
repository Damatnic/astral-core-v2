/**
 * Crisis Detection Utility
 * Detects potential crisis situations in user content
 * IMPORTANT: This augments but NEVER replaces human judgment
 */

// Crisis keywords that may indicate someone needs immediate help
const CRISIS_KEYWORDS = [
  // Suicide-related
  'suicide', 'suicidal', 'kill myself', 'end my life', 'not worth living',
  'better off dead', 'want to die', 'wish i was dead', 'cant go on',
  'no point in living', 'goodbye forever', 'last goodbye', 'final goodbye',
  'end it all', 'cant take this anymore', "can't take this anymore",
  'nobody would miss me', 'goodbye letters',
  
  // Self-harm
  'self harm', 'self-harm', 'cutting', 'hurt myself', 'harm myself',
  'punish myself', 'punishing myself', 'bleeding', 'overdose', 'pills to sleep',
  
  // Immediate danger
  'about to', 'going to do it', 'tonight is the night', 'made up my mind',
  'have a plan', 'have the means', 'wrote a note', 'saying goodbye',
  'about to do it', 'wrote my goodbye', 'i have made up my mind',
  
  // Severe distress
  'cant breathe', "can't breathe", 'panic attack', 'heart racing', 'heart is racing',
  'losing my mind', 'going crazy', 'cant stop crying', "can't stop crying",
  'havent slept', "haven't slept", 'havent eaten', "haven't eaten",
  'drowning and cant breathe', "drowning and can't breathe", 'i am losing my mind'
];

// Phrases that might indicate past tense or recovery
const PAST_TENSE_MODIFIERS = [
  'used to', 'in the past', 'years ago', 'when i was',
  'recovered from', 'got through', 'survived', 'overcame'
];

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
  isPastTense: boolean;
}

/**
 * Analyzes text for potential crisis indicators
 * @param text - The text to analyze
 * @returns Crisis detection result
 */
export const detectCrisis = (text: string): CrisisDetectionResult => {
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];
  
  // Check for crisis keywords
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
    }
  }
  
  // Check if it's past tense
  const isPastTense = PAST_TENSE_MODIFIERS.some(modifier => 
    lowerText.includes(modifier)
  );
  
  // Check for medical/academic context
  const medicalContextIndicators = [
    'patient', 'study', 'studies', 'research', 'statistics', 
    'according to', 'history of', 'character', 'movie', 'book'
  ];
  const isMedicalContext = medicalContextIndicators.some(indicator => 
    lowerText.includes(indicator)
  );
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (detectedKeywords.length > 0) {
    // High severity for immediate danger or explicit suicide mentions
    const highSeverityKeywords = [
      'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
      'about to', 'going to do it', 'tonight is the night', 
      'made up my mind', 'have a plan', 'have the means', 'wrote a note',
      'about to do it', 'wrote my goodbye', 'goodbye letters',
      'i have made up my mind', 'i wrote a note'
    ];
    
    // Medium severity indicators
    const mediumSeverityKeywords = [
      'want to die', 'wish i was dead', 'better off dead',
      'self harm', 'self-harm', 'cutting', 'hurt myself', 'harm myself',
      'not worth living', 'punish myself', 'punishing myself',
      'nobody would miss me', 'cant take this anymore', "can't take this anymore"
    ];
    
    // Check for immediate danger phrases (should always be high severity)
    const hasImmediateDanger = highSeverityKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    if (hasImmediateDanger || detectedKeywords.length >= 3) {
      severity = 'high';
    } else if (detectedKeywords.length >= 2 || 
               detectedKeywords.some(k => mediumSeverityKeywords.includes(k))) {
      severity = 'medium';
    }
  }
  
  // Reduce severity if past tense or medical context
  if ((isPastTense || isMedicalContext) && severity === 'high') {
    severity = 'medium';
  } else if ((isPastTense || isMedicalContext) && severity === 'medium') {
    severity = 'low';
  }
  
  return {
    isCrisis: detectedKeywords.length > 0 && !isPastTense,
    severity,
    keywords: detectedKeywords,
    isPastTense
  };
};

/**
 * Get appropriate crisis resources based on location
 * @param country - User's country (if known)
 * @returns Crisis helpline information
 */
export const getCrisisResources = (country?: string | null) => {
  const resources = {
    US: {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      text: 'Text HOME to 741741',
      url: 'https://988lifeline.org'
    },
    UK: {
      name: 'Samaritans',
      number: '116 123',
      text: 'Text SHOUT to 85258',
      url: 'https://www.samaritans.org'
    },
    CA: {
      name: 'Talk Suicide Canada',
      number: '1-833-456-4566',
      text: 'Text 45645',
      url: 'https://talksuicide.ca'
    },
    AU: {
      name: 'Lifeline Australia',
      number: '13 11 14',
      text: 'Text 0477 13 11 14',
      url: 'https://www.lifeline.org.au'
    },
    DEFAULT: {
      name: 'International Crisis Lines',
      number: 'findahelpline.com',
      text: 'Visit website for local resources',
      url: 'https://findahelpline.com'
    }
  };
  
  // Handle null, undefined, empty string, and case-insensitive country codes
  if (!country) return resources.DEFAULT;
  const upperCountry = country.toUpperCase();
  return resources[upperCountry as keyof typeof resources] || resources.DEFAULT;
};
