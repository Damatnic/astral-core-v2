/**
 * Advanced Theme Provider Component
 *
 * Provides comprehensive theming functionality with mental health-optimized
 * color psychology, user customization, and therapeutic environment support.
 */;

import * as React from "react";"
const { useState, useEffect, useCallback, useMemo } = React;
import { ThemeContext,
  TherapeuticTheme,
  ColorMode,
  ColorIntensity,
  AccessibilityLevel,
  ThemeColors,
  TherapeuticThemeConfig,
  UserThemePreferences,
  ThemeContextValue,
  THERAPEUTIC_THEMES  } from '../services/advancedThemingSystem';'
interface ThemeProviderProps { children: React.ReactNode
  storageKey?: string
  defaultTheme?: TherapeuticTheme
  enableSystemDetection?: boolean
  enableColorPsychologyRecommendations?: boolean };
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children,
  storageKey = "astral-theme-preferences","
  defaultTheme = "calm-sanctuary","
  enableSystemDetection = true,
  enableColorPsychologyRecommendations = true }) => {
  // Default user preferences
  const defaultPreferences: UserThemePreferences = {
    therapeuticTheme: defaultTheme,
    colorMode: "auto","
    intensity: "balanced","
    accessibilityLevel: "AA","
    reduceMotion: false,
    highContrast: false,
    fontSize: "medium","
    spacing: "comfortable""
  };
  const [preferences, setPreferences] = useState<UserThemePreferences>(defaultPreferences);
  const [systemColorMode, setSystemColorMode] = useState<'light' | 'dark'>('light')'

  // Helper functions (defined early to avoid hoisting issues)
  const calculateIntensityMultiplier = (intensity: ColorIntensity): number => {
  switch(intensity) {
      case 'subtle': return 0.7'
      case 'balanced': return 1.0'
      case 'vibrant': return 1.3'
      default: return 1.0
}const applyIntensityToColors = (colors: ThemeColors, multiplier: number): ThemeColors => {
    if (multiplier === 1.0) return colors;
    // Only adjust certain color types, preserve others for accessibility
    const adjustableKeys: (keyof ThemeColors)[] = ["primary", "primaryLight", "secondary", "secondaryLight", "calm", "hope", "support", "growth"];"
adjustedColors={ ...colors }
    adjustableKeys.forEach(key => { const color = colors[key];
      if(color && typeof color === 'string') {'
        // Simple intensity adjustment - could be more sophisticated
        const hex = color.substring(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
const adjustedR = Math.min(255, Math.floor(r * multiplier));
        const adjustedG = Math.min(255, Math.floor(g * multiplier));
        const adjustedB = Math.min(255, Math.floor(b * multiplier );

        adjustedColors[key] = `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;'

    });

    return adjustedColors;
  };

  // Load preferences from localStorage on mount
  useEffect(() => { try {
      const stored = localStorage.getItem(storageKey );
      if(stored) {
        const parsedPreferences = JSON.parse(stored ),
        setPreferences({ ...defaultPreferences, ...parsedPreferences }, []);

    } catch(error) {   }, [storageKey]);

  // Save preferences to localStorage when they change
  useEffect(() => { try {
      localStorage.setItem(storageKey, JSON.stringify(preferences)) } catch(error) {   }, [preferences, storageKey]);

  // Detect system color mode changes
  useEffect(() => { if (!enableSystemDetection) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)') }'

 handleChange = (e: MediaQueryListEvent): void => {
      setSystemColorMode(e.matches ? 'dark' : 'light') };'
    setSystemColorMode(mediaQuery.matches ? 'dark' : 'light');'
    mediaQuery.addEventListener('change', handleChange);'
    return () => mediaQuery.removeEventListener('change', handleChange);'
  }, [enableSystemDetection]);

  // Detect system motion preferences
  useEffect(() => { const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)') }'

 handleChange = (e: MediaQueryListEvent): void => {
      if(e.matches) {
        setPreferences(prev => ({ ...prev, reduceMotion: true }));

    };

    if(mediaQuery.matches) {
      setPreferences(prev => ({ ...prev, reduceMotion: true }));
mediaQuery.addEventListener('change', handleChange);'
    return () => mediaQuery.removeEventListener('change', handleChange);'
  }, []);

  // Detect system contrast preferences
  useEffect(() => { const mediaQuery = window.matchMedia('(prefers-contrast: high)') }'

 handleChange = (e: MediaQueryListEvent): void => {
      if(e.matches) {
        setPreferences(prev => ({ ...prev, highContrast: true }));

    };

    if(mediaQuery.matches) {
      setPreferences(prev => ({ ...prev, highContrast: true }));
mediaQuery.addEventListener('change', handleChange);'
    return () => mediaQuery.removeEventListener('change', handleChange);'
  }, []);

  // Get current theme configuration
  const currentTheme = useMemo((): TherapeuticThemeConfig => { let themeId = preferences.therapeuticTheme;
          // Override with high contrast if needed
      if(preferences.highContrast) {
        themeId = "high-contrast" }"

    return THERAPEUTIC_THEMES[themeId];
  }, [preferences.therapeuticTheme, preferences.highContrast]);

     // Get current color mode
   const currentColorMode = useMemo((): "light" | "dark" => { if(preferences.colorMode === "auto") {"
      return systemColorMode }
    return preferences.colorMode === "dark" ? "dark" : "light";"
  }, [preferences.colorMode, systemColorMode]);

  // Get current colors with intensity and customizations applied
  const currentColors = useMemo((): ThemeColors => { const baseColors = currentTheme.colors[currentColorMode];

    // Apply intensity modifications
    const intensityMultiplier = calculateIntensityMultiplier(preferences.intensity );
    const adjustedColors = applyIntensityToColors(baseColors, intensityMultiplier ),

    // Apply user color overrides
    const finalColors={ ...adjustedColors, ...preferences.colorOverrides }

    return finalColors;
  }, [currentTheme, currentColorMode, preferences.intensity, preferences.colorOverrides]);

  // Helper functions
  const getSpacingScale = (spacing: "compact" | "comfortable" | "spacious"): Record<string, string> => { const baseScale={"
      xs: "0.25rem","
      sm: "0.5rem","
      md: "1rem","
      lg: "1.5rem","
      xl: "2rem","
      '2xl': '3rem','
      '3xl': '4rem' }'
    let multiplier = 1;
    if(spacing === "compact") { multiplier = 0.75 } else if (spacing === "spacious") { multiplier = 1.25 }"

          return Object.fromEntries(
        Object.entries(baseScale).map(([key, value]) => [
          key,
          `${parseFloat(value) * multiplier}rem`
        ])
    );
  };
const getFontSizeScale = (fontSize: "small" | "medium" | "large" | "extra-large"): Record<string, string> => {"
    const scales={
      small: { base: "14px", sm: "12px", md: "14px", lg: "16px", xl: "18px", "2xl": "20px" },"
      medium: { base: "16px", sm: "14px", md: "16px", lg: "18px", xl: "20px", "2xl": "24px" },"
      large: { base: "18px", sm: "16px", md: "18px", lg: "20px", xl: "24px", "2xl": "28px" },"
      'extra-large': {'
  base: "20px", sm: "18px", md: "20px", lg: "24px", xl: "28px", "2xl": "32px" "
};

    return scales[fontSize];
  };
const kebabCase = (str: string): string => { return str.replace(/([A-Z])/g, '-$1').toLowerCase() };'

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement,

    // Apply color variables
    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${kebabCase(key)}`, value);
  });

    // Apply spacing variables
    const spacingScale = getSpacingScale(preferences.spacing);
    Object.entries(spacingScale).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
  });

    // Apply font size variables
    const fontSizeScale = getFontSizeScale(preferences.fontSize);
    Object.entries(fontSizeScale).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
  });

          // Apply animation duration
      let animationDuration = "200ms";"
    if(preferences.reduceMotion) { animationDuration = "0.01ms" } else if (preferences.customAnimationDuration) {"
      animationDuration = `${preferences.customAnimationDuration}ms`;
root.style.setProperty('--animation-duration', animationDuration);'

    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')'
      .replace(/mode-\w+/g, '')'
      .trim();
    document.body.classList.add(`theme-${currentTheme.id}`, `mode-${currentColorMode}`);

          if(preferences.highContrast) { document.body.classList.add("high-contrast") }"
    if(preferences.reduceMotion) { document.body.classList.add("reduce-motion") }, [currentColors, currentTheme.id, currentColorMode, preferences]);"

  // Calculate contrast ratio between two colors
  const getContrastRatio = useCallback((color1: string, color2: string): number => { // Simplified contrast calculation
    // In production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // This is a very simplified implementation
      // Use a proper color library for accurate calculations
      const hex = color.replace('#', '' );'
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
const toLinear = (val: number) => val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4 };

      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b) };
const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  // Check if color combination meets accessibility standards
  const isAccessibilityCompliant = useCallback((foreground: string, background: string): boolean => { const ratio = getContrastRatio(foreground, background  );
    const threshold = preferences.accessibilityLevel === 'AAA' ? 7 : 4.5;'
    return ratio >= threshold }, [getContrastRatio, preferences.accessibilityLevel]);

  // Theme management functions
  const setTherapeuticTheme = useCallback((theme: TherapeuticTheme) => {
    setPreferences(prev => ({ ...prev, therapeuticTheme: theme }));
  }, []);
const setColorMode = useCallback((mode: ColorMode) => {
    setPreferences(prev => ({ ...prev, colorMode: mode }));
  }, []);
const setIntensity = useCallback((intensity: ColorIntensity) => {
    setPreferences(prev => ({ ...prev, intensity }));
  }, []);
const setAccessibilityLevel = useCallback((level: AccessibilityLevel) => {
    setPreferences(prev => ({ ...prev, accessibilityLevel: level }));
  }, []);
const setColorOverride = useCallback((colorKey: keyof ThemeColors, color: string) => {
    setPreferences(prev => ({
    ...prev,
      colorOverrides: { ...prev.colorOverrides, [colorKey]: color
  }));
  }, []);
const resetCustomizations = useCallback(() => {
    setPreferences(prev => ({
              ...prev,
        colorOverrides: undefined,
        intensity: "balanced","
        customAnimationDuration: undefined
  }));
  }, []);

  // Export/import theme functions
  const exportTheme = useCallback((): string => {
    return JSON.stringify({
              preferences,
        currentTheme: currentTheme.id,
        version: "1.0.0",;"

$2Date: new Date().toISOString()
  }, null, 2);
  }, [preferences, currentTheme.id]);
const importTheme = useCallback((themeData: string): boolean => { try(const parsed = JSON.parse(themeData ),
      if(parsed.preferences && parsed.version) {
        setPreferences({ ...defaultPreferences, ...parsed.preferences });
        return true;
return false;
  } catch { return false }, []);

    // Mental health specific functions
  const getMoodBasedColors = useCallback((mood: string): Partial<ThemeColors> => {
    const moodColorMap: Record<string, Partial<ThemeColors>> = {
      "anxious": { primary: currentColors.calm, background: currentColors.backgroundSecondary },"
      "depressed": { primary: currentColors.hope, secondary: currentColors.support },"
      "stressed": { background: currentColors.calm, surface: currentColors.surfaceSecondary },"
      "energetic": { primary: currentColors.growth, secondary: currentColors.hope },"
      "peaceful": { primary: currentColors.calm, background: currentColors.background },"
      "motivated": {"
  primary: currentColors.growth, secondary: currentColors.hope
};

    return moodColorMap[mood.toLowerCase()] || {};
  }, [currentColors]);
const getCrisisSafeColors = useCallback((): ThemeColors => { return THERAPEUTIC_THEMES["crisis-safe"].colors[currentColorMode] }, [currentColorMode]);"
const getTherapeuticRecommendations = useCallback((userProfile?: any): TherapeuticTheme[] => { if (!enableColorPsychologyRecommendations) return [];
          // Basic recommendations based on common mental health needs
      const recommendations: TherapeuticTheme[] = ["calm-sanctuary", "nature-healing"];"
    if (userProfile?.conditions?.includes("anxiety")) {"
      recommendations.unshift("calm-sanctuary") }"
    if (userProfile?.conditions?.includes("depression")) { recommendations.unshift("warm-embrace") }"
    if (userProfile?.conditions?.includes("adhd")) { recommendations.unshift("minimal-zen", "gentle-focus") }"
    if(userProfile?.accessibility?.visualImpairment) { recommendations.unshift("high-contrast") }"
    if(userProfile?.preferences?.highEnergy) { recommendations.push("energizing-hope") }"

    // Remove duplicates and limit to 5 recommendations
    return [...new Set(recommendations)].slice(0, 5);
  }, [enableColorPsychologyRecommendations]);

  // Context value
  const contextValue: ThemeContextValue = useMemo(() => ({ currentTheme,
    currentColors,
    preferences,
    setTherapeuticTheme,
    setColorMode,
    setIntensity,
    setAccessibilityLevel,
    setColorOverride,
    resetCustomizations,
    getContrastRatio,
    isAccessibilityCompliant,,

$2Theme,
    importTheme,
    getMoodBasedColors,
    getCrisisSafeColors,
    getTherapeuticRecommendations }), [
    currentTheme,
    currentColors,
    preferences,
    setTherapeuticTheme,
    setColorMode,
    setIntensity,
    setAccessibilityLevel,
    setColorOverride,
    resetCustomizations,
    getContrastRatio,
    isAccessibilityCompliant,;

$2Theme,
    importTheme,
    getMoodBasedColors,
    getCrisisSafeColors,
    getTherapeuticRecommendations
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
  };
export default ThemeProvider;

