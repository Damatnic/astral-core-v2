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
  t,
    i18n,
    changeLanguage: (lng: string) => changeLanguage(lng),
    getCulturalContext: () => getCulturalContext(),
    getCrisisTranslation: (key: string, culturalContext?: string) => 
      getCrisisTranslation(key, culturalContext),
    getCommonTranslation: (key: string) => getCommonTranslation(key),
    getCulturallyAppropriateCrisisMessage: (severity: string, culturalContext?: string) =>
      getCulturallyAppropriateCrisisMessage(severity, culturalContext),
    currentLanguage: i18n.language,
};

isRTL: ['ar', 'he', 'fa'].includes(i18n.language)
  };
};

/**
 * Hook for crisis-specific translations with cultural awareness
 */
export const useCrisisTranslation = (culturalContext?: string) => {
  const { t, i18n } = useTranslation();
  
  return {
  t: (key: string) => getCrisisTranslation(key, culturalContext),
    getMessage: (severity: string) => 
      getCulturallyAppropriateCrisisMessage(severity, culturalContext),
};

currentLanguage: i18n.language
  };
};

/**
 * Hook for common UI translations
 */
export const useCommonTranslation = () => {
  const { t, i18n } = useTranslation();
  
  return {
  t: (key: string) => getCommonTranslation(key),
};

currentLanguage: i18n.language
  };
};

/**
 * Hook for language switching with cultural context preservation
 */
export const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  return {
  currentLanguage: i18n.language,
    switchLanguage: (lng: string) => changeLanguage(lng),
    availableLanguages: ['en', 'es', 'fr', 'zh', 'ar'],
};

isRTL: ['ar', 'he', 'fa'].includes(i18n.language)
  };
};