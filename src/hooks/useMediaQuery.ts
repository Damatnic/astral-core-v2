/**
 * useMediaQuery Hook
 * Provides responsive media query detection with SSR support
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media query detection
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  // Initialize with a safe default for SSR
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    // Default to false for SSR
    return false;
  });

  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => {
        mediaQueryList.removeEventListener('change', handleChange);
      };
    } 
    // Legacy browsers
    else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(handleChange);
      return () => {
        mediaQueryList.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
};

/**
 * Preset media queries for common breakpoints
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1440px)');

/**
 * Hook for detecting device orientation
 */
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

/**
 * Hook for detecting high DPI screens
 */
export const useIsRetina = () => useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

/**
 * Hook for detecting reduced motion preference
 */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Hook for detecting dark mode preference
 */
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Hook for detecting touch devices
 */
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    return () => {
      window.removeEventListener('resize', checkTouch);
    };
  }, []);

  return isTouch;
};

export default useMediaQuery;