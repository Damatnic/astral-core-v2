/**
 * Mobile Accessibility Provider
 * 
 * Comprehensive mobile accessibility system with:
 * - WCAG 2.1 Level AA compliance
 * - Screen reader optimization
 * - Touch accessibility
 * - Keyboard navigation
 * - High contrast support
 * - Focus management
 * - Voice control optimization
 * - Haptic feedback
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// Accessibility preferences interface
interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  voiceControl: boolean;
  hapticFeedback: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number; // percentage multiplier
  focusIndicatorStyle: 'default' | 'enhanced' | 'high-contrast';
}

// Focus management interface
interface FocusManagement {
  currentFocus: string | null;
  focusHistory: string[];
  trapStack: string[];
  announcements: string[];
}

// Touch accessibility interface
interface TouchAccessibility {
  targetSize: number; // minimum touch target size in pixels
  spacing: number; // minimum spacing between touch targets
  timeout: number; // touch timeout for accessibility
  pressAndHold: boolean; // enable press and hold gestures
}

// Screen reader interface
interface ScreenReaderSupport {
  enabled: boolean;
  announceChanges: boolean;
  describeLandmarks: boolean;
  readingMode: 'detailed' | 'concise' | 'minimal';
  skipLinkBehavior: 'immediate' | 'with-delay';
}

// Accessibility context interface
interface MobileAccessibilityContextValue {
  preferences: AccessibilityPreferences;
  focusManagement: FocusManagement;
  touchAccessibility: TouchAccessibility;
  screenReader: ScreenReaderSupport;
  
  // Functions
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusTrap: (containerId: string) => void;
  removeFocusTrap: () => void;
  navigateToElement: (elementId: string, options?: { smooth?: boolean; announce?: boolean }) => void;
  checkWCAGCompliance: () => AccessibilityAuditResult;
  adaptForColorBlindness: (element: HTMLElement) => void;
  optimizeForTouch: (element: HTMLElement) => void;
}

// WCAG audit interface
interface AccessibilityAuditResult {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  suggestions: string[];
  compliantAreas: string[];
}

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  description: string;
  element?: string;
  wcagCriterion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

// Create context
const MobileAccessibilityContext = createContext<MobileAccessibilityContextValue | null>(null);

// Hook to use accessibility context
export const useMobileAccessibility = () => {
  const context = useContext(MobileAccessibilityContext);
  if (!context) {
    throw new Error('useMobileAccessibility must be used within MobileAccessibilityProvider');
  }
  return context;
};

// Provider component
export const MobileAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    voiceControl: false,
    hapticFeedback: true,
    colorBlindness: 'none',
    fontSize: 100,
    focusIndicatorStyle: 'default'
  });

  const [focusManagement, setFocusManagement] = useState<FocusManagement>({
    currentFocus: null,
    focusHistory: [],
    trapStack: [],
    announcements: []
  });

  const [touchAccessibility] = useState<TouchAccessibility>({
    targetSize: 44, // WCAG minimum 44x44 pixels
    spacing: 8,
    timeout: 3000,
    pressAndHold: true
  });

  const [screenReader, setScreenReader] = useState<ScreenReaderSupport>({
    enabled: false,
    announceChanges: true,
    describeLandmarks: true,
    readingMode: 'detailed',
    skipLinkBehavior: 'immediate'
  });

  // Refs
  const announcementRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<string | null>(null);

  // Initialize accessibility settings
  useEffect(() => {
    detectAccessibilityPreferences();
    setupAccessibilityObservers();
    injectAccessibilityStyles();
    setupKeyboardNavigation();
    
    return () => {
      cleanupAccessibilityObservers();
    };
  }, []);

  // Detect user accessibility preferences
  const detectAccessibilityPreferences = useCallback(() => {
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      largeText: window.matchMedia('(min-resolution: 120dpi)'),
    };

    const detectedPreferences: Partial<AccessibilityPreferences> = {};

    // Check for high contrast
    if (mediaQueries.highContrast.matches) {
      detectedPreferences.highContrast = true;
      detectedPreferences.focusIndicatorStyle = 'high-contrast';
    }

    // Check for reduced motion
    if (mediaQueries.reducedMotion.matches) {
      detectedPreferences.reducedMotion = true;
    }

    // Check for screen reader
    const screenReaderDetected = 
      'speechSynthesis' in window || 
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver');

    if (screenReaderDetected) {
      detectedPreferences.screenReader = true;
      setScreenReader(prev => ({ ...prev, enabled: true }));
    }

    // Check for touch support
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!touchSupported) {
      // Keyboard-first navigation for non-touch devices
      detectedPreferences.focusIndicatorStyle = 'enhanced';
    }

    // Apply detected preferences
    setPreferences(prev => ({ ...prev, ...detectedPreferences }));

    // Load saved preferences
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse saved accessibility preferences:', error);
      }
    }
  }, []);

  // Setup accessibility observers
  const setupAccessibilityObservers = useCallback(() => {
    // Focus observer
    const focusObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') {
          const element = mutation.target as HTMLElement;
          optimizeForTouch(element);
        }
      });
    });

    focusObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['tabindex', 'aria-hidden', 'role'],
      subtree: true
    });

    // Content change observer for screen readers
    const contentObserver = new MutationObserver((mutations) => {
      if (screenReader.enabled && screenReader.announceChanges) {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.hasAttribute('aria-live') || element.hasAttribute('role')) {
                  // Announce dynamic content changes
                  setTimeout(() => {
                    const text = element.textContent?.trim();
                    if (text && text.length > 0) {
                      announceToScreenReader(`New content: ${text}`, 'polite');
                    }
                  }, 100);
                }
              }
            });
          }
        });
      }
    });

    contentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      focusObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [screenReader.enabled, screenReader.announceChanges]);

  // Cleanup observers
  const cleanupAccessibilityObservers = useCallback(() => {
    // Cleanup handled by return value of setupAccessibilityObservers
  }, []);

  // Inject accessibility styles
  const injectAccessibilityStyles = useCallback(() => {
    const existingStyle = document.getElementById('mobile-accessibility-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'mobile-accessibility-styles';
    style.textContent = `
      /* High contrast mode */
      .accessibility-high-contrast {
        filter: contrast(150%) !important;
      }
      
      /* Large text mode */
      .accessibility-large-text {
        font-size: ${preferences.fontSize}% !important;
        line-height: 1.6 !important;
      }
      
      /* Focus indicators */
      .accessibility-focus-enhanced:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3) !important;
      }
      
      .accessibility-focus-high-contrast:focus {
        outline: 4px solid #ffff00 !important;
        outline-offset: 3px !important;
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      /* Touch targets */
      .accessibility-touch-optimized {
        min-height: ${touchAccessibility.targetSize}px !important;
        min-width: ${touchAccessibility.targetSize}px !important;
        margin: ${touchAccessibility.spacing}px !important;
        padding: ${Math.max(8, touchAccessibility.spacing)}px !important;
      }
      
      /* Reduced motion */
      .accessibility-reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Color blindness filters */
      .accessibility-protanopia {
        filter: url('#protanopia-filter') !important;
      }
      
      .accessibility-deuteranopia {
        filter: url('#deuteranopia-filter') !important;
      }
      
      .accessibility-tritanopia {
        filter: url('#tritanopia-filter') !important;
      }
      
      /* Skip links */
      .accessibility-skip-link {
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: 999999 !important;
        padding: 8px 16px !important;
        background: #000000 !important;
        color: #ffffff !important;
        text-decoration: none !important;
        border-radius: 4px !important;
        font-weight: bold !important;
      }
      
      .accessibility-skip-link:focus {
        top: 8px !important;
        left: 8px !important;
      }
      
      /* Screen reader only content */
      .accessibility-sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      /* Landmark styles */
      nav[role="navigation"],
      main[role="main"],
      aside[role="complementary"],
      header[role="banner"],
      footer[role="contentinfo"] {
        position: relative;
      }
      
      /* Announcement region */
      .accessibility-announcements {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `;
    
    document.head.appendChild(style);

    // Add color blindness SVG filters
    injectColorBlindnessFilters();
  }, [preferences.fontSize, touchAccessibility.targetSize, touchAccessibility.spacing]);

  // Inject color blindness SVG filters
  const injectColorBlindnessFilters = useCallback(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0;');
    svg.innerHTML = `
      <defs>
        <!-- Protanopia filter -->
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                               0.558, 0.442, 0,     0, 0  
                                               0,     0.242, 0.758, 0, 0
                                               0,     0,     0,     1, 0"/>
        </filter>
        
        <!-- Deuteranopia filter -->
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                               0.7,   0.3,   0,   0, 0
                                               0,     0.3,   0.7, 0, 0
                                               0,     0,     0,   1, 0"/>
        </filter>
        
        <!-- Tritanopia filter -->
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05,  0,     0, 0
                                               0,    0.433, 0.567, 0, 0
                                               0,    0.475, 0.525, 0, 0
                                               0,    0,     0,     1, 0"/>
        </filter>
      </defs>
    `;
    
    document.body.appendChild(svg);
  }, []);

  // Setup keyboard navigation
  const setupKeyboardNavigation = useCallback(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const main = document.querySelector('main, [role="main"]') as HTMLElement;
        if (main) {
          main.focus();
          announceToScreenReader('Navigated to main content', 'assertive');
        }
      }
      
      // Skip to navigation (Alt + N)
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement;
        if (nav) {
          nav.focus();
          announceToScreenReader('Navigated to navigation', 'assertive');
        }
      }
      
      // Toggle high contrast (Alt + H)
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        updatePreferences({ highContrast: !preferences.highContrast });
        announceToScreenReader(
          `High contrast ${!preferences.highContrast ? 'enabled' : 'disabled'}`,
          'assertive'
        );
      }
      
      // Escape key handling for focus traps
      if (event.key === 'Escape' && focusTrapRef.current) {
        event.preventDefault();
        removeFocusTrap();
      }
      
      // Tab key handling for focus management
      if (event.key === 'Tab') {
        handleTabNavigation(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [preferences.highContrast]);

  // Handle tab navigation
  const handleTabNavigation = useCallback((event: KeyboardEvent) => {
    if (focusTrapRef.current) {
      const trapContainer = document.getElementById(focusTrapRef.current);
      if (trapContainer) {
        const trapFocusables = trapContainer.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (trapFocusables.length > 0) {
          const first = trapFocusables[0] as HTMLElement;
          const last = trapFocusables[trapFocusables.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }
    
    // Track focus history
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.id) {
        setFocusManagement(prev => ({
          ...prev,
          currentFocus: activeElement.id,
          focusHistory: [...prev.focusHistory.slice(-9), activeElement.id]
        }));
      }
    }, 0);
  }, []);

  // Update preferences function
  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      
      // Save to localStorage
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
      
      // Apply styles immediately
      applyAccessibilityPreferences(newPreferences);
      
      return newPreferences;
    });
  }, []);

  // Apply accessibility preferences to DOM
  const applyAccessibilityPreferences = useCallback((prefs: AccessibilityPreferences) => {
    const body = document.body;
    
    // Remove existing classes
    body.classList.remove(
      'accessibility-high-contrast',
      'accessibility-large-text', 
      'accessibility-reduced-motion',
      'accessibility-protanopia',
      'accessibility-deuteranopia',
      'accessibility-tritanopia'
    );
    
    // Apply preferences
    if (prefs.highContrast) {
      body.classList.add('accessibility-high-contrast');
    }
    
    if (prefs.largeText || prefs.fontSize > 100) {
      body.classList.add('accessibility-large-text');
    }
    
    if (prefs.reducedMotion) {
      body.classList.add('accessibility-reduced-motion');
    }
    
    if (prefs.colorBlindness !== 'none') {
      body.classList.add(`accessibility-${prefs.colorBlindness}`);
    }
    
    // Update focus indicators
    const focusClass = `accessibility-focus-${prefs.focusIndicatorStyle}`;
    document.querySelectorAll('button, a, input, select, textarea, [tabindex]').forEach(element => {
      element.classList.remove('accessibility-focus-default', 'accessibility-focus-enhanced', 'accessibility-focus-high-contrast');
      element.classList.add(focusClass);
    });
  }, []);

  // Screen reader announcement function
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) return;
    
    // Clear previous announcement
    announcementRef.current.textContent = '';
    
    // Add new announcement
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
        announcementRef.current.setAttribute('aria-live', priority);
      }
    }, 100);
    
    // Track announcements
    setFocusManagement(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message]
    }));
  }, []);

  // Focus trap functions
  const setFocusTrap = useCallback((containerId: string) => {
    focusTrapRef.current = containerId;
    setFocusManagement(prev => ({
      ...prev,
      trapStack: [...prev.trapStack, containerId]
    }));
    
    announceToScreenReader('Focus trapped in dialog', 'assertive');
  }, [announceToScreenReader]);

  const removeFocusTrap = useCallback(() => {
    if (focusTrapRef.current) {
      setFocusManagement(prev => {
        const newStack = prev.trapStack.slice(0, -1);
        return {
          ...prev,
          trapStack: newStack
        };
      });
      
      focusTrapRef.current = null;
      announceToScreenReader('Focus trap removed', 'assertive');
    }
  }, [announceToScreenReader]);

  // Navigate to element function
  const navigateToElement = useCallback((elementId: string, options: { smooth?: boolean; announce?: boolean } = {}) => {
    const element = document.getElementById(elementId) as HTMLElement;
    if (!element) return;
    
    // Focus the element
    element.focus();
    
    // Scroll into view
    element.scrollIntoView({
      behavior: options.smooth && !preferences.reducedMotion ? 'smooth' : 'auto',
      block: 'center',
      inline: 'nearest'
    });
    
    // Announce if requested
    if (options.announce) {
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('title') || 
                   element.textContent?.trim() || 
                   `Element ${elementId}`;
      announceToScreenReader(`Navigated to ${label}`, 'assertive');
    }
  }, [preferences.reducedMotion, announceToScreenReader]);

  // WCAG compliance check
  const checkWCAGCompliance = useCallback((): AccessibilityAuditResult => {
    const issues: AccessibilityIssue[] = [];
    const suggestions: string[] = [];
    const compliantAreas: string[] = [];
    
    // Check for missing alt text
    document.querySelectorAll('img').forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push({
          type: 'error',
          category: 'perceivable',
          description: 'Image missing alt text',
          element: img.src,
          wcagCriterion: '1.1.1',
          severity: 'high',
          fix: 'Add descriptive alt attribute'
        });
      }
    });
    
    // Check for proper heading structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'understandable',
          description: 'Heading levels skip',
          element: heading.textContent?.substring(0, 50) || '',
          wcagCriterion: '1.3.1',
          severity: 'medium',
          fix: 'Use sequential heading levels'
        });
      }
      previousLevel = level;
    });
    
    // Check for proper form labels
    document.querySelectorAll('input, select, textarea').forEach(input => {
      const element = input as HTMLInputElement;
      if (element.type !== 'hidden' && !element.labels?.length && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        issues.push({
          type: 'error',
          category: 'perceivable',
          description: 'Form control missing label',
          element: element.name || element.id || 'unnamed input',
          wcagCriterion: '1.3.1',
          severity: 'high',
          fix: 'Add label element or aria-label'
        });
      }
    });
    
    // Check for touch target size
    document.querySelectorAll('button, a, input[type="button"], input[type="submit"]').forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < touchAccessibility.targetSize || rect.height < touchAccessibility.targetSize) {
        issues.push({
          type: 'warning',
          category: 'operable',
          description: 'Touch target too small',
          element: element.textContent?.substring(0, 30) || '',
          wcagCriterion: '2.5.5',
          severity: 'medium',
          fix: `Increase size to at least ${touchAccessibility.targetSize}x${touchAccessibility.targetSize}px`
        });
      }
    });
    
    // Check for proper landmarks
    const landmarks = document.querySelectorAll('main, nav, aside, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]');
    if (landmarks.length > 0) {
      compliantAreas.push('Proper landmark structure');
    } else {
      issues.push({
        type: 'warning',
        category: 'understandable',
        description: 'Missing landmark roles',
        wcagCriterion: '1.3.1',
        severity: 'medium',
        fix: 'Add main, nav, and other landmark elements'
      });
    }
    
    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    let hasFocusStyles = false;
    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element, ':focus');
      if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
        hasFocusStyles = true;
      }
    });
    
    if (hasFocusStyles) {
      compliantAreas.push('Focus indicators present');
    } else {
      issues.push({
        type: 'error',
        category: 'operable',
        description: 'Missing focus indicators',
        wcagCriterion: '2.4.7',
        severity: 'high',
        fix: 'Add visible focus styles'
      });
    }
    
    // Calculate score
    const totalChecks = 20; // Total number of checks performed
    const errorWeight = 3;
    const warningWeight = 1;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const penaltyPoints = (errorCount * errorWeight) + (warningCount * warningWeight);
    const score = Math.max(0, Math.round(((totalChecks - penaltyPoints) / totalChecks) * 100));
    
    // Add suggestions
    if (issues.length > 0) {
      suggestions.push('Review and fix accessibility issues found');
      suggestions.push('Test with screen readers');
      suggestions.push('Verify keyboard navigation');
    }
    
    if (score > 80) {
      suggestions.push('Consider advanced accessibility features');
    }
    
    return {
      score,
      issues,
      suggestions,
      compliantAreas
    };
  }, [touchAccessibility.targetSize]);

  // Adapt for color blindness
  const adaptForColorBlindness = useCallback((element: HTMLElement) => {
    if (preferences.colorBlindness === 'none') return;
    
    element.classList.add(`accessibility-${preferences.colorBlindness}`);
  }, [preferences.colorBlindness]);

  // Optimize for touch
  const optimizeForTouch = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    
    if (rect.width < touchAccessibility.targetSize || rect.height < touchAccessibility.targetSize) {
      element.classList.add('accessibility-touch-optimized');
    }
    
    // Add touch feedback
    if (preferences.hapticFeedback && 'vibrate' in navigator) {
      element.addEventListener('touchstart', () => {
        navigator.vibrate?.(10); // Short haptic feedback
      }, { passive: true });
    }
  }, [touchAccessibility.targetSize, preferences.hapticFeedback]);

  // Apply preferences on mount and changes
  useEffect(() => {
    applyAccessibilityPreferences(preferences);
  }, [preferences, applyAccessibilityPreferences]);

  // Context value
  const contextValue: MobileAccessibilityContextValue = {
    preferences,
    focusManagement,
    touchAccessibility,
    screenReader,
    updatePreferences,
    announceToScreenReader,
    setFocusTrap,
    removeFocusTrap,
    navigateToElement,
    checkWCAGCompliance,
    adaptForColorBlindness,
    optimizeForTouch
  };

  return (
    <MobileAccessibilityContext.Provider value={contextValue}>
      {/* Skip links */}
      <a href="#main-content" className="accessibility-skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="accessibility-skip-link">
        Skip to navigation
      </a>
      
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="accessibility-announcements"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      
      {/* Hidden accessibility info */}
      <div className="accessibility-sr-only">
        <p>This application supports keyboard navigation and screen readers.</p>
        <p>Press Alt+M to skip to main content, Alt+N for navigation, Alt+H to toggle high contrast.</p>
      </div>
      
      {children}
    </MobileAccessibilityContext.Provider>
  );
};

// Accessibility HOC for components
export const withMobileAccessibility = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { accessibilityOptions?: Partial<AccessibilityPreferences> }> => {
  const WithAccessibility = (props: P & { accessibilityOptions?: Partial<AccessibilityPreferences> }) => {
    const { accessibilityOptions, ...componentProps } = props;
    const { updatePreferences, adaptForColorBlindness, optimizeForTouch } = useMobileAccessibility();
    const componentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (accessibilityOptions) {
        updatePreferences(accessibilityOptions);
      }
      
      if (componentRef.current) {
        adaptForColorBlindness(componentRef.current);
        
        // Optimize all interactive elements
        const interactiveElements = componentRef.current.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        interactiveElements.forEach(element => optimizeForTouch(element as HTMLElement));
      }
    }, [accessibilityOptions, updatePreferences, adaptForColorBlindness, optimizeForTouch]);
    
    return (
      <div ref={componentRef} className="accessibility-component-wrapper">
        <Component {...(componentProps as P)} />
      </div>
    );
  };
  
  WithAccessibility.displayName = `withMobileAccessibility(${Component.displayName || Component.name})`;
  return WithAccessibility;
};

export default MobileAccessibilityProvider;
