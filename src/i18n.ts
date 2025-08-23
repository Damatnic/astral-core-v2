/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Legacy i18n file - functionality moved to src/i18n/index.ts
 * This file is kept for backward compatibility
 */

import { useI18n } from './i18n/hooks';
export { useI18n };

// Re-export main functions for backward compatibility
import i18nInstance, { 
  changeLanguage as changeLanguageFunction,
  getCulturalContext,
  isRTLLanguage,
  getCrisisTranslation,
  getCommonTranslation,
  getCulturallyAppropriateCrisisMessage
} from './i18n/index';

export { 
  i18nInstance as i18n,
  getCulturalContext,
  isRTLLanguage,
  getCrisisTranslation,
  getCommonTranslation,
  getCulturallyAppropriateCrisisMessage
};

export { changeLanguageFunction as changeLanguage };

// Default export for backward compatibility
export default i18nInstance;

// Legacy translation objects for backward compatibility
export const en = {
  share: 'Share',
  my_activity: 'My Activity',
  ai_chat: 'Chat with AI',
  my_safety_plan: 'My Safety Plan',
  community_feed: 'Community Feed',
  reflections: 'Reflections',
  get_help_now: 'Get Help Now',
  quiet_space: 'Quiet Space',
  wellness_videos: 'Wellness Videos',
  moderation_history: 'Moderation History',
  guidelines: 'Guidelines',
  legal: 'Legal',
  helper_login: 'Helper Login',
  settings: 'Settings',
  donate: 'Donate'
};

export const es = {
  share: 'Compartir',
  my_activity: 'Mi Actividad',
  ai_chat: 'Chatear con IA',
  my_safety_plan: 'Mi Plan de Seguridad',
  community_feed: 'Feed Comunitario',
  reflections: 'Reflexiones',
  get_help_now: 'Ayuda Ahora',
  quiet_space: 'Espacio Tranquilo',
  wellness_videos: 'Videos de Bienestar',
  moderation_history: 'Historial de Moderación',
  guidelines: 'Normas',
  legal: 'Legal',
  helper_login: 'Acceso de Ayudante',
  settings: 'Ajustes',
  donate: 'Donar'
};

// Legacy locale setter function
export const setLocale = (locale: string) => {
  changeLanguageFunction(locale);
};