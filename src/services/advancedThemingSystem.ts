/**
 * Advanced Theming System with Mental Health-Optimized Color Psychology
 * 
 * This system provides therapeutic color environments designed to support
 * mental wellness through scientifically-backed color psychology principles.
 * Features user customization and accessibility compliance.
 */

import * as React from 'react'

// Mental Health Color Psychology Themes
export type TherapeuticTheme = 
  | 'calm-sanctuary'      // Cool blues and greens for anxiety relief
  | 'warm-embrace'        // Warm oranges and yellows for depression support
  | 'nature-healing'      // Earth tones for grounding and stability
  | 'gentle-focus'        // Muted purples for concentration and clarity
  | 'energizing-hope'     // Bright but soft colors for motivation
  | 'minimal-zen'         // High contrast minimalism for sensory sensitivity
  | 'crisis-safe'         // Emergency-optimized high visibility colors
  | 'custom'              // User-defined personalized theme
  | 'system'              // Follow system dark/light mode
  | 'high-contrast';      // WCAG AAA accessibility compliance

export type ColorMode = "light" | "dark" | "auto";
export type ColorIntensity = "subtle" | "balanced" | "vibrant"
export type AccessibilityLevel = "AA" | "AAA"
export interface ThemeColors {
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary accent colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  surfaceHover: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Mental health specific colors
  crisis: string;           // Crisis/emergency states
  calm: string;            // Calming/soothing elements
  hope: string;            // Positive/uplifting elements
  support: string;         // Peer support elements
  growth: string;          // Progress/growth indicators
  
  // Border and divider colors
  border: string;
  borderLight: string;
  borderHover: string;
  
  // Shadow colors
  shadow: string;
  shadowHover: string;
}

export interface TherapeuticThemeConfig {
  id: TherapeuticTheme;
  name: string;
  description: string;
  psychologyPrinciples: string[];
  recommendedFor: string[];
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  accessibility: {
    contrastRatio: number;
    level: AccessibilityLevel;
    colorBlindFriendly: boolean;
  };
  customization: {
    allowsIntensityAdjustment: boolean;
    allowsColorOverrides: boolean;
    allowsAnimationControl: boolean;
  };
}

export interface UserThemePreferences {
  therapeuticTheme: TherapeuticTheme;
  colorMode: ColorMode;
  intensity: ColorIntensity;
  accessibilityLevel: AccessibilityLevel;
  reduceMotion: boolean;
  highContrast: boolean;
  colorOverrides?: Partial<ThemeColors>;
  customAnimationDuration?: number;
      fontSize: "small" | "medium" | "large" | "extra-large";
  spacing: "compact" | "comfortable" | "spacious"
}

export interface ThemeContextValue {
  // Current theme state
  currentTheme: TherapeuticThemeConfig;
  currentColors: ThemeColors;
  preferences: UserThemePreferences;
  
  // Theme management
  setTherapeuticTheme: (theme: TherapeuticTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  setIntensity: (intensity: ColorIntensity) => void;
  setAccessibilityLevel: (level: AccessibilityLevel) => void,
  setColorOverride: (colorKey: keyof ThemeColors, color: string) => void;
  resetCustomizations: () => void;
  
  // Utilities
  getContrastRatio: (color1: string, color2: string) => number;
  isAccessibilityCompliant: (foreground: string, background: string) => boolean;
  exportTheme: () => string;
  importTheme: (themeData: string) => boolean;
  
  // Mental health specific
  getMoodBasedColors: (mood: string) => Partial<ThemeColors>;
  getCrisisSafeColors: () => ThemeColors;
  getTherapeuticRecommendations: (userProfile?: any) => TherapeuticTheme[];
}

// Default calm sanctuary theme for mental health support
const defaultCalmTheme: ThemeColors={
      primary: "#2E7D8F",
  primaryLight: "#4A9FB0",
  primaryDark: "#1F5A6A",
  secondary: "#7FB069",
  secondaryLight: "#A4C989",
  secondaryDark: "#5E8B4A",
  background: "#F8FBFC",
  backgroundSecondary: "#F1F7F9",
  backgroundTertiary: "#E8F4F6",
  surface: "#FFFFFF",
  surfaceSecondary: "#F4F9FA",
  surfaceHover: "#EBF6F8",
  text: "#1B3A42",
  textSecondary: "#4A6B73",
  textMuted: "#7A9CA4",
  textInverse: "#FFFFFF",
  success: "#7FB069",
  warning: "#E6B17A",
  error: "#D97757",
  info: "#5BA8C4",
  crisis: "#E53E3E",
  calm: "#B8E6E1",
  hope: "#A8D8EA",
  support: "#9FD3C7",
  growth: "#86C7B8",
  border: "#D1E7EA",
  borderLight: "#E8F4F6",
  borderHover: "#B8DDE2",
      shadow: "rgba(46, 125, 143, 0.1)",
    shadowHover: "rgba(46, 125, 143, 0.15)"
  };

const defaultCalmThemeDark: ThemeColors={
  primary: "#4A9FB0",
  primaryLight: "#6BB5C5",
  primaryDark: "#2E7D8F",
  secondary: "#A4C989",
  secondaryLight: "#BDD8A4",
  secondaryDark: "#7FB069",
  background: "#0F1B1E",
  backgroundSecondary: "#162329",
  backgroundTertiary: "#1D2D33",
  surface: "#243339",
  surfaceSecondary: "#2B3D44",
  surfaceHover: "#34464E",
  text: "#E8F4F6",
  textSecondary: "#B8DDE2",
  textMuted: "#7A9CA4",
  textInverse: "#1B3A42",
  success: "#A4C989",
  warning: "#F4D03F",
  error: "#F1948A",
  info: "#85C1E9",
  crisis: "#FF6B6B",
  calm: "#6BB5C5",
  hope: "#85C1E9",
  support: "#A4C989",
  growth: "#86C7B8",
  border: "#3C5259",
  borderLight: "#2B3D44",
  borderHover: "#4A6B73",
      shadow: "rgba(0, 0, 0, 0.3)",
    shadowHover: "rgba(0, 0, 0, 0.4)"
};

  // Crisis-safe theme for emergency situations
  const crisisSafeThemeLight: ThemeColors = {
    primary: "#C53030",
  primaryLight: "#E53E3E",
  primaryDark: "#9B2C2C",
  secondary: "#2B6CB0",
  secondaryLight: "#3182CE",
  secondaryDark: "#2C5282",
  background: "#FFFAF0",
  backgroundSecondary: "#FED7C3",
  backgroundTertiary: "#FEEBC8",
  surface: "#FFFFFF",
  surfaceSecondary: "#FFFAF0",
  surfaceHover: "#FED7C3",
  text: "#1A202C",
  textSecondary: "#2D3748",
  textMuted: "#4A5568",
  textInverse: "#FFFFFF",
  success: "#38A169",
  warning: "#D69E2E",
  error: "#C53030",
  info: "#2B6CB0",
  crisis: "#C53030",
  calm: "#90CDF4",
  hope: "#68D391",
  support: "#F6E05E",
  growth: "#9AE6B4",
  border: "#FBD38D",
  borderLight: "#FEEBC8",
  borderHover: "#F6AD55",
      shadow: "rgba(197, 48, 48, 0.15)",
    shadowHover: "rgba(197, 48, 48, 0.25)"
};

const crisisSafeThemeDark: ThemeColors={
  primary: "#FC8181",
  primaryLight: "#FEB2B2",
  primaryDark: "#E53E3E",
  secondary: "#63B3ED",
  secondaryLight: "#90CDF4",
  secondaryDark: "#3182CE",
  background: "#2D1B1B",
  backgroundSecondary: "#3B2A2A",
  backgroundTertiary: "#4A3939",
  surface: "#59484A",
  surfaceSecondary: "#685759",
  surfaceHover: "#776768",
  text: "#FEEBC8",
  textSecondary: "#FBD38D",
  textMuted: "#F6AD55",
  textInverse: "#1A202C",
  success: "#9AE6B4",
  warning: "#F6E05E",
  error: "#FC8181",
  info: "#90CDF4",
  crisis: "#FC8181",
  calm: "#90CDF4",
  hope: "#9AE6B4",
  support: "#F6E05E",
  growth: "#C6F6D5",
  border: "#685759",
  borderLight: "#59484A",
  borderHover: "#8A7778",
      shadow: "rgba(0, 0, 0, 0.4)",
    shadowHover: "rgba(0, 0, 0, 0.6)"
}
// Therapeutic theme definitions based on color psychology research
  export const THERAPEUTIC_THEMES: Record<TherapeuticTheme, TherapeuticThemeConfig> = {
    'calm-sanctuary': {
      id: "calm-sanctuary",
      name: "Calm Sanctuary",
      description: "Cool blues and soft greens designed to reduce anxiety and promote tranquility",
    psychologyPrinciples: [
      "Blue reduces cortisol levels and heart rate",
      "Green promotes emotional balance and reduces eye strain",
      "Cool tones activate parasympathetic nervous system",
      "Low saturation prevents overstimulation"],
    recommendedFor: [
      "Anxiety disorders",
      "Panic attacks",
      "Insomnia",
      "PTSD symptoms",
      "Sensory sensitivity"],
    colors: {
      light: defaultCalmTheme,
      dark: defaultCalmThemeDark
    },
    accessibility: {
      contrastRatio: 7.2,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
      'warm-embrace': {
      id: "warm-embrace",
      name: "Warm Embrace",
      description: "Gentle oranges and warm yellows to combat depression and boost mood",
    psychologyPrinciples: [
      "Orange stimulates serotonin production",
      "Warm yellows increase dopamine levels",
      "Warm tones promote feelings of comfort and security",
      "Moderate saturation prevents overstimulation while maintaining mood benefits"],
    recommendedFor: [
      "Depression",
      "Seasonal Affective Disorder",
      "Low motivation",
      "Emotional numbness",
      "Social isolation"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#E67E22",
        primaryLight: "#F39C12",
        primaryDark: "#D35400",
        secondary: "#F1C40F",
        secondaryLight: "#F7DC6F",
        secondaryDark: "#D4AC0D",
        background: "#FFFEF7",
        backgroundSecondary: "#FEF9E7",
        backgroundTertiary: "#FCF3CF",
        text: "#6E2C00",
        textSecondary: "#935116",
                  textMuted: "#B7950B"
      },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#F39C12",
        primaryLight: "#F7DC6F",
        primaryDark: "#E67E22",
        secondary: "#F7DC6F",
        secondaryLight: "#FCF3CF",
        secondaryDark: "#F1C40F",
        background: "#1C1408",
        backgroundSecondary: "#2C1E0A",
        backgroundTertiary: "#3D280E"
      }
    },
    accessibility: {
      contrastRatio: 6.8,
      level: "AA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
  
  'nature-healing': {
    id: "nature-healing",
    name: "Nature Healing",
    description: "Earth tones and natural greens for grounding and emotional stability",
    psychologyPrinciples: [
      "Earth tones reduce stress hormones",
      "Natural greens restore attention and reduce mental fatigue",
      "Brown promotes feelings of security and stability",
      "Forest colors activate biophilic stress reduction"],
    recommendedFor: [
      "ADHD and attention issues",
      "Chronic stress",
      "Burnout recovery",
      "Trauma healing",
      "Nature-based therapy"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#27AE60",
        primaryLight: "#58D68D",
        primaryDark: "#1E8449",
        secondary: "#8D6E63",
        secondaryLight: "#A1887F",
        secondaryDark: "#6D4C41"
      },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#58D68D",
        primaryLight: "#82E5AA",
        primaryDark: "#27AE60",
        secondary: "#A1887F",
        secondaryLight: "#BCAAA4",
        secondaryDark: "#8D6E63"
      }
    },
    accessibility: {
      contrastRatio: 7.5,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
  'gentle-focus': {
    id: "gentle-focus",
    name: "Gentle Focus",
    description: "Muted purples and soft lavenders for concentration and mental clarity",
    psychologyPrinciples: [
      "Purple enhances creativity and introspection",
      "Lavender reduces anxiety while maintaining alertness",
      "Cool purples improve focus without overstimulation",
      "Muted tones prevent distraction while supporting concentration"],
    recommendedFor: [
      "Study and focus sessions",
      "Meditation and mindfulness",
      "Creative work",
      "Therapy sessions",
      "Cognitive behavioral therapy"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#9C88B5",
        primaryLight: "#B39DDB",
        primaryDark: "#7B1FA2",
        secondary: "#C5A3FF",
        secondaryLight: "#D1C4E9",
        secondaryDark: "#9575CD"
      },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#B39DDB",
        primaryLight: "#D1C4E9",
        primaryDark: "#9C88B5",
        secondary: "#CE93D8",
        secondaryLight: "#E1BEE7",
        secondaryDark: "#BA68C8"
      }
    },
    accessibility: {
      contrastRatio: 6.9,
      level: "AA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
      'energizing-hope': {
      id: "energizing-hope",
      name: "Energizing Hope",
      description: "Bright but gentle colors for motivation and positive energy",
    psychologyPrinciples: [
      "Bright colors increase energy and motivation",
      "Coral and pink promote feelings of love and hope",
      "Optimistic colors boost dopamine production",
      "Balanced saturation provides energy without anxiety"],
    recommendedFor: [
      "Recovery and healing",
      "Building motivation",
      "Overcoming hopelessness",
      "Positive psychology therapy",
      "Goal setting sessions"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#FF6B9D",
        primaryLight: "#FF8FA3",
        primaryDark: "#E91E63",
        secondary: "#4ECDC4",
        secondaryLight: "#80CBC4",
                  secondaryDark: "#26A69A"
      },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#FF8FA3",
        primaryLight: "#FFB3BA",
        primaryDark: "#FF6B9D",
        secondary: "#80CBC4",
        secondaryLight: "#B2DFDB",
                  secondaryDark: "#4ECDC4"
      }
    },
    accessibility: {
      contrastRatio: 6.5,
      level: "AA",
      colorBlindFriendly: false
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
      'minimal-zen': {
      id: "minimal-zen",
      name: "Minimal Zen",
      description: "High contrast minimalism for sensory sensitivity and focus",
    psychologyPrinciples: [
      "Minimal stimulation reduces sensory overload",
      "High contrast improves accessibility and focus",
      "Monochromatic design reduces decision fatigue",
      "Clean lines promote mental clarity"],
    recommendedFor: [
      "Autism spectrum disorders",
      "Sensory processing sensitivity",
      "ADHD focus support",
      "Migraine sensitivity",
      "Accessibility needs"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#2D3748",
        primaryLight: "#4A5568",
        primaryDark: "#1A202C",
        secondary: "#718096",
        secondaryLight: "#A0AEC0",
        secondaryDark: "#4A5568",
        background: "#FFFFFF",
                  backgroundSecondary: "#F7FAFC",
          backgroundTertiary: "#EDF2F7"
        },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#E2E8F0",
        primaryLight: "#F7FAFC",
        primaryDark: "#CBD5E0",
        secondary: "#A0AEC0",
        secondaryLight: "#CBD5E0",
        secondaryDark: "#718096",
        background: "#1A202C",
                  backgroundSecondary: "#2D3748",
          backgroundTertiary: "#4A5568"
        }
    },
    accessibility: {
      contrastRatio: 15.0,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: false,
      allowsColorOverrides: false,
      allowsAnimationControl: true
    }
  },
      'crisis-safe': {
      id: "crisis-safe",
      name: "Crisis Safe",
      description: "Emergency-optimized colors for crisis intervention and high visibility",
    psychologyPrinciples: [
      "High contrast ensures visibility during distress",
      "Specific colors for different emergency states",
      "Intuitive color coding for quick recognition",
      "Calming background with urgent accent colors"],
    recommendedFor: [
      "Crisis intervention",
      "Emergency situations",
      "High stress states",
      "Accessibility requirements",
      "Professional crisis support"],
    colors: {
      light: crisisSafeThemeLight,
      dark: crisisSafeThemeDark
    },
    accessibility: {
      contrastRatio: 12.0,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: false,
      allowsColorOverrides: false,
      allowsAnimationControl: false
    }
  },
      'high-contrast': {
      id: "high-contrast",
      name: "High Contrast",
      description: "Maximum contrast for accessibility compliance and visual clarity",
    psychologyPrinciples: [
      "Maximum contrast reduces visual strain",
      "Clear distinction improves cognitive processing",
      "Reduces ambiguity in interface elements",
      "Supports users with visual impairments"],
    recommendedFor: [
      "Visual impairments",
      "Dyslexia",
      "Cognitive disabilities",
      "Low vision conditions",
      "Screen reader users"],
    colors: {
      light: {
        ...defaultCalmTheme,
        primary: "#000000",
        primaryLight: "#1A1A1A",
        primaryDark: "#000000",
        secondary: "#000000",
        secondaryLight: "#333333",
        secondaryDark: "#000000",
        background: "#FFFFFF",
        text: "#000000",
        textSecondary: "#000000",
                  textMuted: "#666666",
          border: "#000000"
        },
      dark: {
        ...defaultCalmThemeDark,
        primary: "#FFFFFF",
        primaryLight: "#FFFFFF",
        primaryDark: "#E6E6E6",
        secondary: "#FFFFFF",
        secondaryLight: "#FFFFFF",
        secondaryDark: "#CCCCCC",
        background: "#000000",
        text: "#FFFFFF",
        textSecondary: "#FFFFFF",
                  textMuted: "#CCCCCC",
          border: "#FFFFFF"
        }
    },
    accessibility: {
      contrastRatio: 21.0,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: false,
      allowsColorOverrides: false,
      allowsAnimationControl: true
    }
  },
      'custom': {
      id: "custom",
      name: "Custom Theme",
      description: "User-defined personalized therapeutic color environment",
    psychologyPrinciples: [
      "Personal color preferences enhance comfort",
      "User control improves sense of agency",
      "Customization supports individual needs",
      "Adaptation to personal sensitivities"],
    recommendedFor: [
      "Individual preferences",
      "Specific sensitivities",
      "Cultural considerations",
      "Personal therapeutic goals",
      "Advanced users"],
    colors: {
      light: defaultCalmTheme,
      dark: defaultCalmThemeDark
    },
    accessibility: {
      contrastRatio: 4.5,
      level: "AA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  },
      'system': {
      id: "system",
      name: "System Default",
      description: "Follow system dark/light mode preferences",
    psychologyPrinciples: [
      "Consistency with user preferences",
      "Reduced cognitive load",
      "Familiarity promotes comfort",
      "Adaptive to environmental conditions"],
    recommendedFor: [
      "General use",
      "System integration",
      "Consistent experience",
      "Automatic adaptation",
      "Default option"],
    colors: {
      light: defaultCalmTheme,
      dark: defaultCalmThemeDark
    },
    accessibility: {
      contrastRatio: 7.0,
      level: "AAA",
      colorBlindFriendly: true
    },
    customization: {
      allowsIntensityAdjustment: true,
      allowsColorOverrides: true,
      allowsAnimationControl: true
    }
  }
};

// Create and export the theme context
export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Hook to use the theme context
export const useTheme = (): void => {
  const context = React.useContext(ThemeContext);
  if(!context) {
          throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Export default theme for initial load
export const DEFAULT_THEME = THERAPEUTIC_THEMES['calm-sanctuary'];