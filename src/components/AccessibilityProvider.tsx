/**
 * Accessibility Provider Component
 * Provides comprehensive accessibility features and ARIA support throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AnyObject } from '../types/common';

interface AccessibilityState {
  // Screen reader
  screenReaderEnabled: boolean;
  announcements: string[];
  
  // Keyboard navigation
  keyboardNavigationEnabled: boolean;
  focusVisible: boolean;
  skipLinks: boolean;
  
  // Visual accessibility
  highContrastMode: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  
  // Cognitive accessibility
  simpleLanguage: boolean;
  readingGuide: boolean;
  focusMode: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  // Screen reader functions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
  
  // Settings functions
  toggleScreenReader: () => void;
  toggleKeyboardNavigation: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: AccessibilityState['fontSize']) => void;
  toggleSimpleLanguage: () => void;
  toggleReadingGuide: () => void;
  toggleFocusMode: () => void;
  
  // ARIA helpers
  getAriaLabel: (key: string, params?: AnyObject) => string;
  getAriaDescribedBy: (key: string) => string;
  getLiveRegionProps: (priority?: 'polite' | 'assertive') => Record<string, string>;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// ARIA label templates
const ariaLabels: Record<string, string | ((params: AnyObject) => string)> = {
  // Navigation
  'nav.main': 'Main navigation',
  'nav.sidebar': 'Sidebar navigation',
  'nav.breadcrumb': 'Breadcrumb navigation',
  'nav.pagination': 'Pagination navigation',
  'nav.menu.open': 'Open navigation menu',
  'nav.menu.close': 'Close navigation menu',
  
  // Buttons
  'button.submit': 'Submit form',
  'button.cancel': 'Cancel action',
  'button.delete': (params) => `Delete ${params.item || 'item'}`,
  'button.edit': (params) => `Edit ${params.item || 'item'}`,
  'button.save': 'Save changes',
  'button.close': 'Close dialog',
  'button.help': 'Get help',
  'button.settings': 'Open settings',
  'button.profile': 'View profile',
  'button.logout': 'Logout from account',
  
  // Crisis
  'crisis.alert': 'Crisis support available',
  'crisis.button': 'Get immediate crisis help',
  'crisis.resources': 'View crisis resources',
  'crisis.call': (params) => `Call ${params.service || 'crisis hotline'}`,
  
  // Forms
  'form.email': 'Email address',
  'form.password': 'Password',
  'form.search': 'Search',
  'form.message': 'Type your message',
  'form.required': (params) => `${params.field} is required`,
  'form.error': (params) => `Error: ${params.message}`,
  'form.success': (params) => `Success: ${params.message}`,
  
  // Chat
  'chat.input': 'Type a message',
  'chat.send': 'Send message',
  'chat.attach': 'Attach file',
  'chat.emoji': 'Add emoji',
  'chat.history': 'Chat history',
  
  // Status
  'status.online': (params) => `${params.count || 0} users online`,
  'status.typing': (params) => `${params.user} is typing`,
  'status.loading': 'Loading content',
  'status.error': 'An error occurred',
  
  // Interactive elements
  'toggle.theme': (params) => `Switch to ${params.theme} theme`,
  'toggle.sound': (params) => `Turn sound ${params.enabled ? 'off' : 'on'}`,
  'toggle.notifications': (params) => `Turn notifications ${params.enabled ? 'off' : 'on'}`,
  
  // Content
  'content.expand': 'Expand content',
  'content.collapse': 'Collapse content',
  'content.more': 'Show more',
  'content.less': 'Show less',
  'content.page': (params) => `Page ${params.current} of ${params.total}`,
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load accessibility preferences:', e);
      }
    }
    
    // Default state
    return {
      screenReaderEnabled: false,
      announcements: [],
      keyboardNavigationEnabled: true,
      focusVisible: false,
      skipLinks: true,
      highContrastMode: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      fontSize: 'medium',
      simpleLanguage: false,
      readingGuide: false,
      focusMode: false,
    };
  });

  // Save preferences to localStorage
  useEffect(() => {
    const { announcements, ...preferences } = state;
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
  }, [state]);

  // Apply accessibility classes to body
  useEffect(() => {
    const classes = [];
    
    if (state.highContrastMode) classes.push('high-contrast');
    if (state.reducedMotion) classes.push('reduced-motion');
    if (state.keyboardNavigationEnabled) classes.push('keyboard-nav');
    if (state.focusVisible) classes.push('focus-visible');
    if (state.simpleLanguage) classes.push('simple-language');
    if (state.readingGuide) classes.push('reading-guide');
    if (state.focusMode) classes.push('focus-mode');
    
    classes.push(`font-size-${state.fontSize}`);
    
    // Remove old classes and add new ones
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('font-size-') && 
               !['high-contrast', 'reduced-motion', 'keyboard-nav', 
                 'focus-visible', 'simple-language', 'reading-guide', 
                 'focus-mode'].includes(c))
      .concat(classes)
      .join(' ');
  }, [state]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!state.keyboardNavigationEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Show focus indicators when Tab is pressed
      if (e.key === 'Tab') {
        setState(prev => ({ ...prev, focusVisible: true }));
      }
      
      // Skip to main content with Alt+S
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const main = document.querySelector('main');
        if (main) {
          (main as HTMLElement).focus();
          announce('Skipped to main content');
        }
      }
      
      // Toggle high contrast with Alt+H
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        toggleHighContrast();
      }
    };

    const handleMouseDown = () => {
      // Hide focus indicators when mouse is used
      setState(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [state.keyboardNavigationEnabled]);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements, message],
    }));

    // Clear announcement after delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a !== message),
      }));
    }, priority === 'assertive' ? 1000 : 3000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setState(prev => ({ ...prev, announcements: [] }));
  }, []);

  // Toggle functions
  const toggleScreenReader = useCallback(() => {
    setState(prev => {
      const enabled = !prev.screenReaderEnabled;
      announce(enabled ? 'Screen reader mode enabled' : 'Screen reader mode disabled');
      return { ...prev, screenReaderEnabled: enabled };
    });
  }, [announce]);

  const toggleKeyboardNavigation = useCallback(() => {
    setState(prev => ({ ...prev, keyboardNavigationEnabled: !prev.keyboardNavigationEnabled }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setState(prev => {
      const enabled = !prev.highContrastMode;
      announce(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
      return { ...prev, highContrastMode: enabled };
    });
  }, [announce]);

  const toggleReducedMotion = useCallback(() => {
    setState(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const setFontSize = useCallback((fontSize: AccessibilityState['fontSize']) => {
    setState(prev => ({ ...prev, fontSize }));
    announce(`Font size set to ${fontSize}`);
  }, [announce]);

  const toggleSimpleLanguage = useCallback(() => {
    setState(prev => ({ ...prev, simpleLanguage: !prev.simpleLanguage }));
  }, []);

  const toggleReadingGuide = useCallback(() => {
    setState(prev => ({ ...prev, readingGuide: !prev.readingGuide }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState(prev => ({ ...prev, focusMode: !prev.focusMode }));
  }, []);

  // ARIA helpers
  const getAriaLabel = useCallback((key: string, params?: AnyObject): string => {
    const label = ariaLabels[key];
    if (!label) return key;
    
    if (typeof label === 'function') {
      return label(params || {});
    }
    
    return label;
  }, []);

  const getAriaDescribedBy = useCallback((key: string): string => {
    return `${key}-description`;
  }, []);

  const getLiveRegionProps = useCallback((priority: 'polite' | 'assertive' = 'polite'): Record<string, string> => {
    return {
      'role': 'status',
      'aria-live': priority,
      'aria-atomic': 'true',
    };
  }, []);

  const value: AccessibilityContextValue = {
    ...state,
    announce,
    clearAnnouncements,
    toggleScreenReader,
    toggleKeyboardNavigation,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleSimpleLanguage,
    toggleReadingGuide,
    toggleFocusMode,
    getAriaLabel,
    getAriaDescribedBy,
    getLiveRegionProps,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip links for keyboard navigation */}
      {state.skipLinks && (
        <div className="skip-links" role="navigation" aria-label="Skip links">
          <a href="#main" className="skip-link">Skip to main content</a>
          <a href="#nav" className="skip-link">Skip to navigation</a>
          <a href="#footer" className="skip-link">Skip to footer</a>
        </div>
      )}
      
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      
      {/* Reading guide overlay */}
      {state.readingGuide && <div className="reading-guide" aria-hidden="true" />}
      
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility-enhanced button component
export const AccessibleButton: React.FC<{
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({
  label,
  onClick,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ariaControls,
  disabled = false,
  className = '',
  children,
}) => {
  const { getAriaLabel } = useAccessibility();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`accessible-button ${className}`}
      aria-label={ariaLabel || getAriaLabel(label)}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-disabled={disabled}
    >
      {children || label}
    </button>
  );
};

// Accessibility-enhanced link component
export const AccessibleLink: React.FC<{
  href: string;
  label: string;
  ariaLabel?: string;
  external?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({
  href,
  label,
  ariaLabel,
  external = false,
  className = '',
  children,
}) => {
  const { getAriaLabel } = useAccessibility();
  
  return (
    <a
      href={href}
      className={`accessible-link ${className}`}
      aria-label={ariaLabel || getAriaLabel(label)}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children || label}
      {external && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
};

export default AccessibilityProvider;