/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import i18n from "i18next"
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Cultural context definitions for mental health terminology
type StigmaLevel = "low" | "medium" | "high";
type InvolvementLevel = "low" | "medium" | "high";
type ReligiousContext = "secular" | "christian" | "islamic" | "buddhist" | "mixed";
type EscalationPreference = "individual" | "family" | "community" | "professional";
type CommunicationStyle = "direct" | "indirect" | "formal" | "familial";

interface CulturalContext {
  region: string;,
  stigmaLevel: StigmaLevel
  familyInvolvement: InvolvementLevel;,
  religiousContext: ReligiousContext
  escalationPreference: EscalationPreference;,
  communicationStyle: CommunicationStyle
};

preferredLanguage: string
}

// Translation resources
const resources = {
  en: {,
  translation: {
  // Common UI elements
      share: "Share",
      my_activity: "My Activity",
      ai_chat: "AI Chat",
      my_safety_plan: "My Safety Plan",
      community_feed: "Community Feed",
      reflections: "Reflections",
      get_help_now: "Get Help Now",
      quiet_space: "Quiet Space",
      wellness_videos: "Wellness Videos",
      moderation_history: "Moderation History",
      guidelines: "Guidelines",
      legal: "Legal",
      helper_login: "Helper Login",
      settings: "Settings",
      donate: "Donate",
      
      // Crisis messages
};

crisis: {,
  immediate_help: "If you're in immediate danger, please call emergency services.",
        support_available: "Support is available 24/7",
        you_matter: "You matter and your life has value",
        not_alone: "You are not alone in this",
};

help_nearby: "Help is nearby and people care about you"
      },
      
      // Common phrases
      common: {,
  loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        back: "Back",
        next: "Next",
};

submit: "Submit"
      }
    }
  },
  es: {,
  translation: {
  // Common UI elements
      share: "Compartir",
      my_activity: "Mi Actividad",
      ai_chat: "Chat con IA",
      my_safety_plan: "Mi Plan de Seguridad",
      community_feed: "Feed de la Comunidad",
      reflections: "Reflexiones",
      get_help_now: "Obtener Ayuda Ahora",
      quiet_space: "Espacio Tranquilo",
      wellness_videos: "Videos de Bienestar",
      moderation_history: "Historial de Moderación",
      guidelines: "Directrices",
      legal: "Legal",
      helper_login: "Acceso para Ayudantes",
      settings: "Configuración",
      donate: "Donar",
      
      // Crisis messages
};

crisis: {,
  immediate_help: "Si estás en peligro inmediato, por favor llama a los servicios de emergencia.",
        support_available: "El apoyo está disponible las 24 horas",
        you_matter: "Importas y tu vida tiene valor",
        not_alone: "No estás solo en esto",
};

help_nearby: "La ayuda está cerca y la gente se preocupa por ti"
      },
      
      // Common phrases
      common: {,
  loading: "Cargando...",
        error: "Ocurrió un error",
        success: "Éxito",
        cancel: "Cancelar",
        save: "Guardar",
        delete: "Eliminar",
        edit: "Editar",
        close: "Cerrar",
        back: "Atrás",
        next: "Siguiente",
};

submit: "Enviar"
      }
    }
  }
};

// Cultural contexts for different regions
const culturalContexts: Record<string, CulturalContext> = {
  "en-US": {
  region: "United States",
    stigmaLevel: "medium",
    familyInvolvement: "low",
    religiousContext: "mixed",
    escalationPreference: "individual",
    communicationStyle: "direct",
};

preferredLanguage: "en"
  },
  "es-ES": {
  region: "Spain",
    stigmaLevel: "medium",
    familyInvolvement: "high",
    religiousContext: "christian",
    escalationPreference: "family",
    communicationStyle: "formal",
};

preferredLanguage: "es"
  },
  "es-MX": {
  region: "Mexico",
    stigmaLevel: "high",
    familyInvolvement: "high",
    religiousContext: "christian",
    escalationPreference: "family",
    communicationStyle: "familial",
};

preferredLanguage: "es"
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
  resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    
};

interpolation: {,
  escapeValue: false, // React already escapes values
    },
    
    detection: {,
  order: ['localStorage', 'navigator', 'htmlTag'],
};

caches: ['localStorage'],
    })
});

// Utility functions
export const getCulturalContext = (language?: string): CulturalContext => { const lang = language || i18n.language || "en-US";
  return culturalContexts[lang] || culturalContexts["en-US"] };

export const getCrisisTranslation = (key: string, culturalContext?: string): string => {
  const context = culturalContext || i18n.language;
  return i18n.t(`crisis.${key}`, { lng: context });
};

export const getCommonTranslation = (key: string): string => {
  return i18n.t(`common.${key}`);
};

export const getCulturallyAppropriateCrisisMessage = (
  severity: string, 
  culturalContext?: string
): string => { const context = getCulturalContext(culturalContext);
  
  // Adjust message based on cultural context
  if (context.communicationStyle === "indirect") {
    return getCrisisTranslation("support_available", culturalContext) } else if (context.familyInvolvement === "high") { return getCrisisTranslation("help_nearby", culturalContext) } else { return getCrisisTranslation("not_alone", culturalContext) }
};

export const changeLanguage = (lng: string): Promise<any> => { return i18n.changeLanguage(lng) };

export default i18n;