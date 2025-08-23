/**
 * Mock for Crisis Detection Service
 */

import { CrisisDetectionResult } from '../../types';

const defaultResult: CrisisDetectionResult = {
  hasCrisisIndicators: false,
  severityLevel: 'none',
  riskFactors: [],
  protectiveFactors: [],
  recommendedActions: [],
  immediateActionRequired: false,
  confidence: 0.9,
  escalationRequired: false,
  emergencyServices: false,
  culturalFactors: [],
  supportLanguage: 'en'
};

// Helper to analyze text and return appropriate results
const analyzeTextMock = (text: string): CrisisDetectionResult => {
  const lowerText = text.toLowerCase();
  
  // Critical crisis patterns - include gun/weapon mentions
  if (lowerText.includes('kill myself') || 
      lowerText.includes('end it all') || 
      lowerText.includes('suicide') ||
      lowerText.includes('plan to die') ||
      lowerText.includes('method to end') ||
      (lowerText.includes('gun') && lowerText.includes('myself')) ||
      (lowerText.includes('use it') && lowerText.includes('myself'))) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'critical',
      riskFactors: ['suicide_ideation', 'immediate_risk'],
      recommendedActions: ['call_emergency', 'immediate_intervention', 'crisis_hotline'],
      immediateActionRequired: true,
      confidence: 0.95,
      escalationRequired: true,
      emergencyServices: true
    };
  }
  
  // Self-harm indicators
  if (lowerText.includes('cutting') || 
      lowerText.includes('self-harm') || 
      lowerText.includes('hurt myself')) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'high',
      riskFactors: ['self_harm', 'emotional_distress'],
      recommendedActions: ['Provide crisis resources', 'Connect with counselor', 'Share coping strategies'],
      immediateActionRequired: false,
      confidence: 0.85
    };
  }
  
  // Substance abuse
  if (lowerText.includes('overdose') || 
      lowerText.includes('drinking heavily') || 
      lowerText.includes('using drugs')) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'high',
      riskFactors: ['substance_abuse', 'impaired_judgment'],
      recommendedActions: ['Substance abuse resources', 'Medical attention', 'Support groups'],
      immediateActionRequired: false,
      confidence: 0.8
    };
  }
  
  // Protective factors - family responsibilities
  if ((lowerText.includes('ending it') || lowerText.includes('end it all')) &&
      (lowerText.includes('but') || lowerText.includes('never')) &&
      (lowerText.includes('family') || lowerText.includes('kids') || lowerText.includes('children'))) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'high',
      riskFactors: ['suicide_ideation'],
      protectiveFactors: ['family_support', 'life_responsibilities'],
      recommendedActions: ['Provide suicide prevention resources', 'Share safety planning tools', 'Connect with crisis hotline', 'Schedule follow-up check-in'],
      immediateActionRequired: false,
      confidence: 0.85
    };
  }
  
  // Help-seeking behavior
  if (lowerText.includes('suicidal thoughts') && 
      (lowerText.includes('need help') || lowerText.includes('want to get better') || 
       lowerText.includes('looking for help'))) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'high',
      riskFactors: ['suicide_ideation'],
      protectiveFactors: ['help_seeking'],
      recommendedActions: ['Provide suicide prevention resources', 'Share safety planning tools', 'Connect with crisis hotline', 'Schedule follow-up check-in', 'Provide comprehensive resource list', 'Connect with peer support', 'Facilitate connection to requested support resources'],
      immediateActionRequired: false,
      confidence: 0.85
    };
  }
  
  // Depression/anxiety with protective factors
  if ((lowerText.includes('depressed') || lowerText.includes('anxious')) &&
      (lowerText.includes('but') || lowerText.includes('however') || 
       lowerText.includes('family') || lowerText.includes('support') ||
       lowerText.includes('therapy') || lowerText.includes('help'))) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'moderate',
      riskFactors: ['depression', 'anxiety'],
      protectiveFactors: lowerText.includes('family') ? ['family_support', 'life_responsibilities'] : 
                         lowerText.includes('therapy') ? ['help_seeking', 'professional_support'] :
                         ['social_support'],
      recommendedActions: lowerText.includes('therapy') ? 
        ['professional_support', 'Continue therapy', 'Monitor mood'] :
        ['Connect with support', 'Share coping strategies', 'Monitor wellbeing'],
      confidence: 0.75
    };
  }
  
  // High-risk but not immediate - thoughts about dying
  if (lowerText.includes('hopeless') || 
      lowerText.includes('worthless') || 
      lowerText.includes('no reason to live') ||
      lowerText.includes('thoughts about dying') ||
      lowerText.includes('constant thoughts about')) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'high',
      riskFactors: ['hopelessness', 'depression'],
      recommendedActions: ['professional_support', 'crisis_hotline', 'Safety planning'],
      immediateActionRequired: false,
      confidence: 0.8
    };
  }
  
  // Special characters and emojis with crisis content - including 'want to die'
  if ((lowerText.includes('😢') || lowerText.includes('💔') || lowerText.includes('⚰️')) ||
      (lowerText.includes('want to die') || lowerText.includes('i want to die'))) {
    return {
      ...defaultResult,
      hasCrisisIndicators: true,
      severityLevel: 'moderate',
      riskFactors: ['emotional_distress'],
      recommendedActions: ['Emotional support', 'Check in regularly', 'Share resources'],
      confidence: 0.7
    };
  }
  
  // Past tense recovery - no crisis
  if (lowerText.includes('used to') || 
      lowerText.includes('recovered') || 
      lowerText.includes('past')) {
    return defaultResult;
  }
  
  // Casual mentions - no crisis
  if (lowerText.includes('movie') || 
      lowerText.includes('book') || 
      lowerText.includes('news')) {
    return defaultResult;
  }
  
  // Default - no crisis detected
  return defaultResult;
};

export const astralCoreCrisisDetection = {
  analyzeText: jest.fn((text: string) => Promise.resolve(analyzeTextMock(text))),
  analyzeCrisisContent: jest.fn((text: string) => analyzeTextMock(text)), // Synchronous version
  analyzeConversation: jest.fn(() => Promise.resolve(defaultResult)),
  analyzeMoodPattern: jest.fn(() => Promise.resolve(defaultResult)),
  getEmergencyResources: jest.fn(() => Promise.resolve({
    hotlines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', available247: true },
      { name: 'Crisis Text Line', number: 'Text HOME to 741741', available247: true }
    ],
    localResources: [],
    onlineResources: []
  })),
  getCopingStrategies: jest.fn(() => Promise.resolve([
    'Deep breathing exercises',
    'Grounding techniques',
    'Call a trusted friend',
    'Use safety plan'
  ])),
  triggerEmergencyProtocol: jest.fn(() => Promise.resolve({
    notified: ['emergency_contact', 'crisis_team'],
    actions: ['location_shared', 'resources_sent']
  })),
  supportedLanguages: ['en', 'es', 'fr', 'zh', 'ar', 'hi'],
  validateCrisisIndicators: jest.fn(() => true),
  assessRiskLevel: jest.fn((factors: string[]) => {
    if (factors.includes('suicide_ideation')) return 'critical';
    if (factors.includes('self_harm')) return 'high';
    if (factors.includes('depression')) return 'moderate';
    return 'low';
  })
};

export const CrisisDetectionService = jest.fn().mockImplementation(() => astralCoreCrisisDetection);

export default astralCoreCrisisDetection;