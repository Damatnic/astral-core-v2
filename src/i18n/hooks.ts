/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTranslation } from "react-i18next";
import {
  getCulturalContext, 
  getCrisisTranslation, 
  getCommonTranslation, 
  getCulturallyAppropriateCrisisMessage,
  changeLanguage
} from './index';
/**
 * Enhanced hook for translations with cultural context awareness
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();
  
  return {
    // Basic translation function
    t,
    
    // Current language
    language: i18n.language,
    
    // Language change function
    changeLanguage,
    
    // Cultural context helpers
    getCulturalContext: () => getCulturalContext(i18n.language),
    
    // Crisis-specific translations
    tCrisis: (key: string, options?: any) => getCrisisTranslation(key, options),
    
    // Common translations
    tCommon: (key: string, options?: any) => getCommonTranslation(key, options),
    
    // Culturally appropriate crisis messaging
    tCrisisContextual: (key: string) => getCulturallyAppropriateCrisisMessage(key, i18n.language),
    
    // Check if current language is RTL
    isRTL: getCulturalContext(i18n.language).rtl,
    
    // Mental health stigma level for current culture
    mentalHealthStigma: getCulturalContext(i18n.language).mentalHealthStigma,
    
    // Crisis escalation preference for current culture
    crisisEscalationPreference: getCulturalContext(i18n.language).crisisEscalationPreference,
    
    // Communication style preference for current culture
    communicationStyle: getCulturalContext(i18n.language).preferredCommunicationStyle,
    
    // Helper function for namespace-specific translations
    tWithNamespace: (namespace: string, key: string, options?: any) => {
      return i18n.t(`${namespace}:${key}`, options);
    }
  }
/**
 * Hook specifically for crisis-related translations and cultural context
 */
export const useCrisisI18n = () => {
  const { t, i18n } = useTranslation("crisis");
  const culturalContext = getCulturalContext(i18n.language);
  
  return {
    // Crisis translation function
    t,
    
    // Current language
    language: i18n.language,
    
    // Cultural context for crisis intervention
    culturalContext,
    
    // Helper functions for crisis messaging
    getCrisisMessage: (key: string, options?: any) => getCrisisTranslation(key, options),
    getContextualCrisisMessage: (key: string) => getCulturallyAppropriateCrisisMessage(key, i18n.language),
    
    // Crisis-specific cultural preferences
    prefersFamilyInvolvement: culturalContext.familyInvolvement === "high",
    prefersCommunitySupport: culturalContext.communitySupport === "high",
    hasHighMentalHealthStigma: culturalContext.mentalHealthStigma === "high",
    
    // Crisis escalation preferences
    shouldInvolveFamily: culturalContext.crisisEscalationPreference === "family",
    shouldInvolveCommunity: culturalContext.crisisEscalationPreference === "community",
    prefersProfessionalSupport: culturalContext.crisisEscalationPreference === "professional",
    
    // Communication style adaptations
    needsIndirectCommunication: culturalContext.preferredCommunicationStyle === "indirect",
    prefersFormalCommunication: culturalContext.preferredCommunicationStyle === "formal",
    respondsToBrotherlyApproach: culturalContext.preferredCommunicationStyle === "familial"
  };

/**
 * Hook for accessibility-aware translations
 */
export const useAccessibilityI18n = () => {
  const { t, i18n } = useTranslation();
  const culturalContext = getCulturalContext(i18n.language);
  
  return {
    // Accessibility translations
    tAccessibility: (key: string, options?: any) => t("accessibility." + key, options),
    
    // Screen reader announcements with cultural context
    announceWithContext: (message: string) => {
      const culturalPrefix = culturalContext.preferredCommunicationStyle === "formal"
        ? t("accessibility.formal_announcement_prefix", { defaultValue: "" })
        : "";
      return culturalPrefix + message;
    },
    
    // RTL-aware aria labels
    getAriaLabel: (key: string, options?: any) => {
      const label = t("accessibility." + key, options);
      return culturalContext.rtl ? label + " (من اليمين إلى اليسار)" : label;
    },
    
    // Crisis-specific accessibility announcements
    announceCrisis: (key: string) => {
      const message = getCrisisTranslation(key);
      const urgencyPrefix = t("accessibility.crisis_announcement_prefix", {
        defaultValue: "Important"
      });
      return urgencyPrefix + message;
    }
  };

export default useI18n;
