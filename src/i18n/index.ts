/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
// Cultural context definitions for mental health terminology
type StigmaLevel = "low" | "medium" | "high"
type InvolvementLevel = "low" | "medium" | "high"
type ReligiousContext = "secular" | "christian" | "islamic" | "buddhist" | "mixed"
type EscalationPreference = "individual" | "family" | "community" | "professional"
type CommunicationStyle = "direct" | "indirect" | "formal" | "familial"
interface CulturalContext {
  rtl: boolean;
  mentalHealthStigma: StigmaLevel;
  familyInvolvement: InvolvementLevel;
  communitySupport: InvolvementLevel;
  religiousContext: ReligiousContext;
  crisisEscalationPreference: EscalationPreference;
  preferredCommunicationStyle: CommunicationStyle;
}

export const culturalContexts: Record<string, CulturalContext> = {
  en: {
    rtl: false,
    mentalHealthStigma: "medium",
    familyInvolvement: "medium",
    communitySupport: "medium",
    religiousContext: "mixed",
    crisisEscalationPreference: "professional",
    preferredCommunicationStyle: "direct"
  },
  es: {
    rtl: false,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "high",
    religiousContext: "christian",
    crisisEscalationPreference: "family",
    preferredCommunicationStyle: "familial"
  },
  "pt-BR": {
    rtl: false,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "high",
    religiousContext: "christian",
    crisisEscalationPreference: "community",
    preferredCommunicationStyle: "indirect"
  },
  "pt-PT": {
    rtl: false,
    mentalHealthStigma: "medium",
    familyInvolvement: "medium",
    communitySupport: "medium",
    religiousContext: "christian",
    crisisEscalationPreference: "professional",
    preferredCommunicationStyle: "formal"
  },
  ar: {
    rtl: true,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "high",
    religiousContext: "islamic",
    crisisEscalationPreference: "family",
    preferredCommunicationStyle: "indirect"
  },
  zh: {
    rtl: false,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "medium",
    religiousContext: "mixed",
    crisisEscalationPreference: "family",
    preferredCommunicationStyle: "indirect"
  },
  vi: {
    rtl: false,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "high",
    religiousContext: "buddhist",
    crisisEscalationPreference: "community",
    preferredCommunicationStyle: "indirect"
  },
  tl: {
    rtl: false,
    mentalHealthStigma: "high",
    familyInvolvement: "high",
    communitySupport: "high",
    religiousContext: "christian",
    crisisEscalationPreference: "family",
    preferredCommunicationStyle: "familial"
  }
};

// Language resources loaded dynamically
const loadTranslations = async (language: string, namespace: string) => {
  try {
    const module = await import(`./locales/${language}/${namespace}.json`);
    return module.default;
  } catch (error) {

    return {}
}

// Language detection configuration
const detectionOptions = {
  order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"],
  lookupQuerystring: "lng",
  lookupCookie: "astral_language",
  lookupLocalStorage: "astral_language",
  lookupSessionStorage: "astral_language",
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,
  caches: ["localStorage", "cookie"],
  excludeCacheFor: ["cimode"],
  checkWhitelist: true
}

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    // Language detection
    detection: detectionOptions,

    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Default namespace
    defaultNS: "common",
    ns: ["common", "crisis"],

    // React options
    react: {
      useSuspense: false,
      bindI18n: "languageChanged",
      bindI18nStore: "",
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transWrapTextNodes: "",
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "em"]
    },

    // Whitelist of allowed languages
    supportedLngs: ["en", "es", "pt-BR", "pt-PT", "ar", "zh", "vi", "tl"],

    // Load path for dynamic loading
    load: "languageOnly",

    // Preload languages for crisis scenarios
    preload: ["en", "es"],

    // Return empty string for missing keys in development
    returnEmptyString: process.env.NODE_ENV === "development",
    returnObjects: false,

    // Custom options for mental health context
    saveMissing: process.env.NODE_ENV === "development",
    missingKeyHandler: (lngs: readonly string[], ns: string, key: string) => {
      if (process.env.NODE_ENV === "development") {

      }
    },

    // Basic resources to prevent backend errors
    resources: {
      en: {
      common: {
        // Navigation translations
        navigation: {
          share: "Share",
          my_activity: "My Activity",
          ai_chat: "AI Chat",
          my_safety_plan: "My Safety Plan",
          community_feed: "Community Feed",
          reflections: "Reflections",
          wellness_videos: "Wellness Videos",
          get_help_now: "Get Help Now",
          quiet_space: "Quiet Space",
          donate: "Donate",
          moderation_history: "Moderation History",
          guidelines: "Guidelines",
          legal: "Legal",
          helper_login: "Helper Login",
          settings: "Settings"
        },
        // ShareView translations
        share_your_thoughts: "Share Your Thoughts",
        chat_with_ai_prompt: "Chat with your AI companion to draft a post for the community.",
        ai_welcome: "Hi there! I'm Astral, your AI companion. I'm here to help you articulate your thoughts for a post. What's on your mind today?",
        draft_post_from_chat: "Draft Post From Chat",
        chat_with_ai_here: "Chat with the AI here...",
        review_your_post: "Review Your Post",
        review_your_post_subheader: "Your AI companion has drafted this post. Edit it as you see fit before sharing.",
        category: "Category",
        your_anonymous_post: "Your anonymous post",
        back_to_chat: "Back to Chat",
        submit_anonymously: "Submit Anonymously",
        post_shared: "Post shared successfully!",
        post_failed: "Failed to share post. Please try again.",

        // Accessibility translations
        "accessibility.language_changed": "Language changed to {language}",

        // Language names
        "languages.en": "English",
        "languages.es": "Spanish",
        "languages.pt": "Portuguese",
        "languages.ar": "Arabic",
        "languages.zh": "Chinese",
        "languages.vi": "Vietnamese",
        "languages.tl": "Tagalog",

        // Offline translations - flattened to prevent object access issues
        "offline.indicator.ariaLabel": "Offline status indicator",
        "offline.status.initializing": "Initializing...",
        "offline.status.online": "Online",
        "offline.status.offline": "Offline",
        "offline.status.offlineSupported": "Offline (Crisis resources available)",
        "offline.status.offlineUnsupported": "Offline (Limited functionality)",
        "offline.modal.title": "Offline Status",
        "offline.connection.title": "Connection Status",
        "offline.capabilities.title": "Available Features",
        "offline.capabilities.crisisResources": "Crisis resources",
        "offline.capabilities.translations": "Offline translations",
        "offline.capabilities.cultural": "Cultural adaptations",
        "offline.capabilities.aiModels": "Local AI models",
        "offline.storage.title": "Storage Information",
        "offline.storage.used": "Storage used",
        "offline.storage.quota": "Storage quota",
        "offline.network.title": "Network Information",
        "offline.network.type": "Connection type",
        "offline.network.speed": "Connection speed",
        "offline.sync.title": "Sync Status",
        "offline.sync.queued": "Queued items",
        "offline.sync.lastSync": "Last sync",
        "offline.actions.update": "Update offline content",
        "offline.actions.clear": "Clear offline data",
        "offline.help.crisisResources": "Crisis resources available offline",
        "offline.help.sync": "Data will sync when online"
      }
    }
  }
});

// Load initial translations for supported languages
const initializeTranslations = async () => {
  const supportedLanguages = ["en", "es", "pt", "ar", "zh", "vi", "tl"];
  const namespaces = ["common", "crisis"];

  for (const language of supportedLanguages) {
    for (const namespace of namespaces) {
      const translations = await loadTranslations(language, namespace);
      if (Object.keys(translations).length > 0) {
        i18n.addResourceBundle(language, namespace, translations, true, true);
      }
    }
  }

  // Also load Portuguese variants
  const ptTranslations = {
    common: await loadTranslations("pt", "common"),
    crisis: await loadTranslations("pt", "crisis")
  };
  i18n.addResourceBundle("pt-BR", "common", ptTranslations.common, true, true);
  i18n.addResourceBundle("pt-BR", "crisis", ptTranslations.crisis, true, true);
  i18n.addResourceBundle("pt-PT", "common", ptTranslations.common, true, true);
  i18n.addResourceBundle("pt-PT", "crisis", ptTranslations.crisis, true, true);
}

// Initialize translations on startup
initializeTranslations().catch(error => {
  console.error('Failed to initialize translations:', error);
});

// Cultural context utilities
export const getCulturalContext = (language: string): any => {
  return culturalContexts[language] || culturalContexts.en;
};

export const isRTLLanguage = (language: string): boolean => {
  return getCulturalContext(language).rtl;
};

export const getMentalHealthStigmaLevel = (language: string): string => {
  return getCulturalContext(language).mentalHealthStigma;
};

export const getCrisisEscalationPreference = (language: string): string => {
  return getCulturalContext(language).crisisEscalationPreference;
};

export const getPreferredCommunicationStyle = (language: string): string => {
  return getCulturalContext(language).preferredCommunicationStyle;
};

// Language change utilities with cultural context awareness
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);

  // Apply RTL/LTR styling
  const htmlElement = document.documentElement;
  if (isRTLLanguage(language)) {
    htmlElement.setAttribute("dir", "rtl");
    htmlElement.setAttribute("lang", language);
  } else {
    htmlElement.setAttribute("dir", "ltr");
    htmlElement.setAttribute("lang", language);
  }

  // Store language preference for crisis scenarios
  localStorage.setItem("astral_language", language);
  localStorage.setItem("astral_cultural_context", JSON.stringify(getCulturalContext(language)));

  // Announce language change to screen readers
  const announcement = i18n.t("accessibility.language_changed", { language: i18n.t(`languages.${language}`) });
  const screenReaderAnnouncement = document.createElement("div");
  screenReaderAnnouncement.setAttribute("aria-live", "polite");
  screenReaderAnnouncement.setAttribute("aria-atomic", "true");
  screenReaderAnnouncement.className = "sr-only";
  screenReaderAnnouncement.textContent = announcement;
  document.body.appendChild(screenReaderAnnouncement);
  setTimeout(() => {
    document.body.removeChild(screenReaderAnnouncement);
  }, 3000);
}

// Crisis-specific language utilities with proper typing
export const getCrisisTranslation = (key: string, options?: Record<string, unknown>): string => {
  const result = i18n.t(`crisis:${key}`, options);
  return typeof result === "string" ? result : "";
};

export const getCommonTranslation = (key: string, options?: Record<string, unknown>): string => {
  const result = i18n.t(`common:${key}`, options);
  return typeof result === "string" ? result : "";
};

// Helper function for culturally appropriate crisis messaging
export const getCulturallyAppropriateCrisisMessage = (key: string, language: string = i18n.language): string => {
  const context = getCulturalContext(language);
  const baseMessage = getCrisisTranslation(key);

  // Apply cultural modifications based on context
  switch (context.crisisEscalationPreference) {
    case "family": return getCrisisTranslation(`${key}_family_context`) || baseMessage;
    case "community": return getCrisisTranslation(`${key}_community_context`) || baseMessage;
    case "professional": return getCrisisTranslation(`${key}_professional_context`) || baseMessage;
    default:
      return baseMessage;
  }
};

// Export configured i18n instance
export default i18n;