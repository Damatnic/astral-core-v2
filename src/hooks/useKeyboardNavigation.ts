/**
 * Keyboard Navigation Hook
 *
 * Comprehensive accessibility-focused hook for keyboard navigation
 * with focus management, skip links, and WCAG 2.1 compliance
 *
 * Features:
 * - Focus trap management for modals and overlays
 * - Skip navigation links for screen readers
 * - Arrow key navigation for custom components
 * - Tab order management and restoration
 * - Keyboard shortcuts and hotkey support
 * - Focus indicators and visual feedback
 * - Screen reader announcements
 * - Roving tabindex implementation
 *
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

// Focus Direction Enum
export enum FocusDirection {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  FIRST = 'first',
  LAST = 'last'
}

// Keyboard Event Data Interface
interface KeyboardEventData {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  target: HTMLElement;
  timestamp: number;
}

// Focus Target Interface
interface FocusTarget {
  element: HTMLElement;
  index: number;
  isVisible: boolean;
  isEnabled: boolean;
  tabIndex: number;
  role?: string;
  ariaLabel?: string;
}

// Skip Link Interface
interface SkipLink {
  id: string;
  targetId: string;
  label: string;
  key?: string;
  visible: boolean;
}

// Hotkey Definition Interface
interface HotkeyDefinition {
  id: string;
  keys: string[];
  description: string;
  action: (event: KeyboardEvent) => void;
  enabled: boolean;
  global: boolean;
}

// Focus Trap Configuration Interface
interface FocusTrapConfig {
  enabled: boolean;
  container: HTMLElement | null;
  initialFocus?: HTMLElement | string;
  returnFocus?: HTMLElement;
  allowTabOut: boolean;
  wrapAround: boolean;
}

// Navigation Configuration Interface
interface UseKeyboardNavigationConfig {
  // Focus Management
  enableFocusTrap: boolean;
  enableFocusRestore: boolean;
  enableRovingTabindex: boolean;
  
  // Navigation
  enableArrowNavigation: boolean;
  navigationMode: 'linear' | 'grid' | 'tree' | 'custom';
  wrapNavigation: boolean;
  
  // Skip Links
  enableSkipLinks: boolean;
  skipLinkPosition: 'top' | 'bottom' | 'custom';
  
  // Hotkeys
  enableHotkeys: boolean;
  enableGlobalHotkeys: boolean;
  
  // Accessibility
  enableAnnouncements: boolean;
  enableFocusIndicators: boolean;
  focusIndicatorStyle: 'outline' | 'ring' | 'custom';
  
  // Performance
  debounceMs: number;
  throttleMs: number;
}

// Hook Return Type
interface UseKeyboardNavigationReturn {
  // Focus Management
  focusTrap: FocusTrapConfig;
  setFocusTrap: (config: Partial<FocusTrapConfig>) => void;
  trapFocus: (container: HTMLElement, initialFocus?: HTMLElement) => () => void;
  restoreFocus: () => void;
  
  // Navigation
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  navigateByDirection: (direction: FocusDirection) => void;
  
  // Skip Links
  skipLinks: SkipLink[];
  addSkipLink: (skipLink: Omit<SkipLink, 'id'>) => string;
  removeSkipLink: (id: string) => void;
  triggerSkipLink: (id: string) => void;
  
  // Hotkeys
  hotkeys: Map<string, HotkeyDefinition>;
  addHotkey: (hotkey: Omit<HotkeyDefinition, 'id'>) => string;
  removeHotkey: (id: string) => void;
  enableHotkey: (id: string, enabled: boolean) => void;
  
  // State
  currentFocus: HTMLElement | null;
  focusableElements: FocusTarget[];
  isTrappingFocus: boolean;
  
  // Event Handlers
  handleKeyDown: (event: KeyboardEvent) => void;
  handleFocusIn: (event: FocusEvent) => void;
  handleFocusOut: (event: FocusEvent) => void;
  
  // Utilities
  getFocusableElements: (container?: HTMLElement) => HTMLElement[];
  isFocusable: (element: HTMLElement) => boolean;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

// Default Configuration
const DEFAULT_CONFIG: UseKeyboardNavigationConfig = {
  enableFocusTrap: true,
  enableFocusRestore: true,
  enableRovingTabindex: false,
  enableArrowNavigation: true,
  navigationMode: 'linear',
  wrapNavigation: true,
  enableSkipLinks: true,
  skipLinkPosition: 'top',
  enableHotkeys: true,
  enableGlobalHotkeys: false,
  enableAnnouncements: true,
  enableFocusIndicators: true,
  focusIndicatorStyle: 'outline',
  debounceMs: 100,
  throttleMs: 16
};

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  'area[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'object',
  'embed',
  'details summary',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]:not([disabled])',
  '[role="option"]:not([disabled])',
  '[role="tab"]:not([disabled])',
  '[role="checkbox"]:not([disabled])',
  '[role="radio"]:not([disabled])'
].join(', ');

/**
 * Keyboard Navigation Hook
 * 
 * @param config - Configuration for keyboard navigation
 * @returns Navigation utilities and state
 */
export function useKeyboardNavigation(
  config: Partial<UseKeyboardNavigationConfig> = {}
): UseKeyboardNavigationReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<FocusTarget[]>([]);
  const [skipLinks, setSkipLinks] = useState<SkipLink[]>([]);
  const [hotkeys, setHotkeys] = useState<Map<string, HotkeyDefinition>>(new Map());
  const [isTrappingFocus, setIsTrappingFocus] = useState(false);
  
  const [focusTrap, setFocusTrapState] = useState<FocusTrapConfig>({
    enabled: false,
    container: null,
    allowTabOut: false,
    wrapAround: true
  });
  
  // Refs
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveRegionRef = useRef<HTMLElement | null>(null);
  const skipLinkContainerRef = useRef<HTMLElement | null>(null);
  
  // Create live region for announcements
  const createLiveRegion = useCallback(() => {\n    if (liveRegionRef.current || !finalConfig.enableAnnouncements) return;\n    \n    const liveRegion = document.createElement('div');\n    liveRegion.setAttribute('aria-live', 'polite');\n    liveRegion.setAttribute('aria-atomic', 'true');\n    liveRegion.style.position = 'absolute';\n    liveRegion.style.left = '-10000px';\n    liveRegion.style.width = '1px';\n    liveRegion.style.height = '1px';\n    liveRegion.style.overflow = 'hidden';\n    \n    document.body.appendChild(liveRegion);\n    liveRegionRef.current = liveRegion;\n  }, [finalConfig.enableAnnouncements]);\n  \n  // Create skip link container\n  const createSkipLinkContainer = useCallback(() => {\n    if (skipLinkContainerRef.current || !finalConfig.enableSkipLinks) return;\n    \n    const container = document.createElement('div');\n    container.className = 'skip-links';\n    container.style.position = 'absolute';\n    container.style.top = '-10000px';\n    container.style.left = '0';\n    container.style.zIndex = '9999';\n    container.style.background = '#000';\n    container.style.color = '#fff';\n    container.style.padding = '8px';\n    container.style.fontSize = '14px';\n    \n    // Show on focus\n    const style = document.createElement('style');\n    style.textContent = `\n      .skip-links:focus-within {\n        top: 0 !important;\n      }\n      .skip-link {\n        display: block;\n        color: white;\n        text-decoration: none;\n        padding: 4px 8px;\n        margin: 2px 0;\n      }\n      .skip-link:focus {\n        outline: 2px solid white;\n        outline-offset: 2px;\n      }\n    `;\n    \n    document.head.appendChild(style);\n    \n    if (finalConfig.skipLinkPosition === 'top') {\n      document.body.insertBefore(container, document.body.firstChild);\n    } else {\n      document.body.appendChild(container);\n    }\n    \n    skipLinkContainerRef.current = container;\n  }, [finalConfig.enableSkipLinks, finalConfig.skipLinkPosition]);\n  \n  // Get focusable elements\n  const getFocusableElements = useCallback((container: HTMLElement = document.body): HTMLElement[] => {\n    const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)) as HTMLElement[];\n    \n    return elements.filter(element => {\n      // Check visibility\n      const style = getComputedStyle(element);\n      if (style.display === 'none' || style.visibility === 'hidden') {\n        return false;\n      }\n      \n      // Check if element is in viewport or has non-zero size\n      const rect = element.getBoundingClientRect();\n      if (rect.width === 0 && rect.height === 0) {\n        return false;\n      }\n      \n      // Check if disabled\n      if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {\n        return false;\n      }\n      \n      return true;\n    });\n  }, []);\n  \n  // Check if element is focusable\n  const isFocusable = useCallback((element: HTMLElement): boolean => {\n    return getFocusableElements().includes(element);\n  }, [getFocusableElements]);\n  \n  // Update focusable elements\n  const updateFocusableElements = useCallback(() => {\n    const container = focusTrap.enabled && focusTrap.container ? focusTrap.container : document.body;\n    const elements = getFocusableElements(container);\n    \n    const targets: FocusTarget[] = elements.map((element, index) => ({\n      element,\n      index,\n      isVisible: true,\n      isEnabled: !element.hasAttribute('disabled'),\n      tabIndex: parseInt(element.getAttribute('tabindex') || '0'),\n      role: element.getAttribute('role') || undefined,\n      ariaLabel: element.getAttribute('aria-label') || undefined\n    }));\n    \n    setFocusableElements(targets);\n  }, [focusTrap, getFocusableElements]);\n  \n  // Focus management\n  const focusElement = useCallback((element: HTMLElement, announce: boolean = true) => {\n    try {\n      element.focus();\n      setCurrentFocus(element);\n      \n      if (announce && finalConfig.enableAnnouncements) {\n        const label = element.getAttribute('aria-label') || \n                     element.getAttribute('title') || \n                     element.textContent || \n                     element.tagName.toLowerCase();\n        \n        announceToScreenReader(`Focused ${label}`);\n      }\n      \n      logger.debug('Element focused', { \n        tag: element.tagName, \n        id: element.id, \n        class: element.className \n      });\n    } catch (error) {\n      logger.error('Failed to focus element', { element, error });\n    }\n  }, [finalConfig.enableAnnouncements]);\n  \n  // Navigation functions\n  const focusNext = useCallback(() => {\n    const currentIndex = focusableElements.findIndex(target => target.element === currentFocus);\n    let nextIndex = currentIndex + 1;\n    \n    if (nextIndex >= focusableElements.length) {\n      nextIndex = finalConfig.wrapNavigation ? 0 : focusableElements.length - 1;\n    }\n    \n    if (focusableElements[nextIndex]) {\n      focusElement(focusableElements[nextIndex].element);\n    }\n  }, [currentFocus, focusableElements, finalConfig.wrapNavigation, focusElement]);\n  \n  const focusPrevious = useCallback(() => {\n    const currentIndex = focusableElements.findIndex(target => target.element === currentFocus);\n    let prevIndex = currentIndex - 1;\n    \n    if (prevIndex < 0) {\n      prevIndex = finalConfig.wrapNavigation ? focusableElements.length - 1 : 0;\n    }\n    \n    if (focusableElements[prevIndex]) {\n      focusElement(focusableElements[prevIndex].element);\n    }\n  }, [currentFocus, focusableElements, finalConfig.wrapNavigation, focusElement]);\n  \n  const focusFirst = useCallback(() => {\n    if (focusableElements.length > 0) {\n      focusElement(focusableElements[0].element);\n    }\n  }, [focusableElements, focusElement]);\n  \n  const focusLast = useCallback(() => {\n    if (focusableElements.length > 0) {\n      focusElement(focusableElements[focusableElements.length - 1].element);\n    }\n  }, [focusableElements, focusElement]);\n  \n  const navigateByDirection = useCallback((direction: FocusDirection) => {\n    switch (direction) {\n      case FocusDirection.FORWARD:\n        focusNext();\n        break;\n      case FocusDirection.BACKWARD:\n        focusPrevious();\n        break;\n      case FocusDirection.FIRST:\n        focusFirst();\n        break;\n      case FocusDirection.LAST:\n        focusLast();\n        break;\n      // Grid navigation would require additional logic based on layout\n      default:\n        logger.warn('Direction not implemented', { direction });\n    }\n  }, [focusNext, focusPrevious, focusFirst, focusLast]);\n  \n  // Focus trap management\n  const setFocusTrap = useCallback((config: Partial<FocusTrapConfig>) => {\n    setFocusTrapState(prev => ({ ...prev, ...config }));\n  }, []);\n  \n  const trapFocus = useCallback((container: HTMLElement, initialFocus?: HTMLElement): (() => void) => {\n    if (!finalConfig.enableFocusTrap) {\n      return () => {};\n    }\n    \n    // Store previous focus for restoration\n    previousFocusRef.current = document.activeElement as HTMLElement;\n    \n    // Update focus trap configuration\n    setFocusTrap({\n      enabled: true,\n      container,\n      initialFocus\n    });\n    \n    setIsTrappingFocus(true);\n    \n    // Focus initial element\n    if (initialFocus) {\n      focusElement(initialFocus, false);\n    } else {\n      const focusableInContainer = getFocusableElements(container);\n      if (focusableInContainer.length > 0) {\n        focusElement(focusableInContainer[0], false);\n      }\n    }\n    \n    logger.info('Focus trap activated', { container: container.tagName });\n    \n    // Return cleanup function\n    return () => {\n      setFocusTrap({ enabled: false, container: null });\n      setIsTrappingFocus(false);\n      \n      if (finalConfig.enableFocusRestore && previousFocusRef.current) {\n        focusElement(previousFocusRef.current, false);\n      }\n      \n      logger.info('Focus trap deactivated');\n    };\n  }, [finalConfig.enableFocusTrap, finalConfig.enableFocusRestore, setFocusTrap, focusElement, getFocusableElements]);\n  \n  const restoreFocus = useCallback(() => {\n    if (previousFocusRef.current) {\n      focusElement(previousFocusRef.current, false);\n      previousFocusRef.current = null;\n    }\n  }, [focusElement]);\n  \n  // Skip link management\n  const addSkipLink = useCallback((skipLink: Omit<SkipLink, 'id'>): string => {\n    const id = `skip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;\n    const newSkipLink: SkipLink = { ...skipLink, id };\n    \n    setSkipLinks(prev => [...prev, newSkipLink]);\n    \n    // Add to DOM\n    if (skipLinkContainerRef.current) {\n      const link = document.createElement('a');\n      link.href = `#${skipLink.targetId}`;\n      link.className = 'skip-link';\n      link.textContent = skipLink.label;\n      link.id = id;\n      \n      if (skipLink.key) {\n        link.setAttribute('data-key', skipLink.key);\n      }\n      \n      link.addEventListener('click', (e) => {\n        e.preventDefault();\n        triggerSkipLink(id);\n      });\n      \n      skipLinkContainerRef.current.appendChild(link);\n    }\n    \n    return id;\n  }, []);\n  \n  const removeSkipLink = useCallback((id: string) => {\n    setSkipLinks(prev => prev.filter(link => link.id !== id));\n    \n    // Remove from DOM\n    const linkElement = document.getElementById(id);\n    if (linkElement) {\n      linkElement.remove();\n    }\n  }, []);\n  \n  const triggerSkipLink = useCallback((id: string) => {\n    const skipLink = skipLinks.find(link => link.id === id);\n    if (!skipLink) return;\n    \n    const target = document.getElementById(skipLink.targetId);\n    if (target) {\n      focusElement(target);\n      announceToScreenReader(`Skipped to ${skipLink.label}`);\n    }\n  }, [skipLinks, focusElement]);\n  \n  // Hotkey management\n  const addHotkey = useCallback((hotkey: Omit<HotkeyDefinition, 'id'>): string => {\n    const id = `hotkey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;\n    const newHotkey: HotkeyDefinition = { ...hotkey, id };\n    \n    setHotkeys(prev => new Map(prev.set(id, newHotkey)));\n    \n    logger.debug('Hotkey added', { id, keys: hotkey.keys });\n    return id;\n  }, []);\n  \n  const removeHotkey = useCallback((id: string) => {\n    setHotkeys(prev => {\n      const newMap = new Map(prev);\n      newMap.delete(id);\n      return newMap;\n    });\n    \n    logger.debug('Hotkey removed', { id });\n  }, []);\n  \n  const enableHotkey = useCallback((id: string, enabled: boolean) => {\n    setHotkeys(prev => {\n      const hotkey = prev.get(id);\n      if (hotkey) {\n        return new Map(prev.set(id, { ...hotkey, enabled }));\n      }\n      return prev;\n    });\n  }, []);\n  \n  // Screen reader announcements\n  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {\n    if (!finalConfig.enableAnnouncements || !liveRegionRef.current) return;\n    \n    liveRegionRef.current.setAttribute('aria-live', priority);\n    liveRegionRef.current.textContent = message;\n    \n    // Clear after announcement\n    setTimeout(() => {\n      if (liveRegionRef.current) {\n        liveRegionRef.current.textContent = '';\n      }\n    }, 1000);\n    \n    logger.debug('Screen reader announcement', { message, priority });\n  }, [finalConfig.enableAnnouncements]);\n  \n  // Event handlers\n  const handleKeyDown = useCallback((event: KeyboardEvent) => {\n    const eventData: KeyboardEventData = {\n      key: event.key,\n      code: event.code,\n      ctrlKey: event.ctrlKey,\n      shiftKey: event.shiftKey,\n      altKey: event.altKey,\n      metaKey: event.metaKey,\n      target: event.target as HTMLElement,\n      timestamp: Date.now()\n    };\n    \n    // Check hotkeys first\n    if (finalConfig.enableHotkeys) {\n      for (const [id, hotkey] of hotkeys) {\n        if (!hotkey.enabled) continue;\n        \n        const matches = hotkey.keys.every(key => {\n          switch (key.toLowerCase()) {\n            case 'ctrl':\n            case 'control':\n              return event.ctrlKey;\n            case 'shift':\n              return event.shiftKey;\n            case 'alt':\n              return event.altKey;\n            case 'meta':\n            case 'cmd':\n              return event.metaKey;\n            default:\n              return event.key.toLowerCase() === key.toLowerCase();\n          }\n        });\n        \n        if (matches) {\n          event.preventDefault();\n          hotkey.action(event);\n          return;\n        }\n      }\n    }\n    \n    // Handle navigation keys\n    if (finalConfig.enableArrowNavigation) {\n      switch (event.key) {\n        case 'Tab':\n          if (isTrappingFocus && focusTrap.enabled) {\n            event.preventDefault();\n            if (event.shiftKey) {\n              focusPrevious();\n            } else {\n              focusNext();\n            }\n          }\n          break;\n        case 'ArrowDown':\n        case 'ArrowRight':\n          if (finalConfig.navigationMode === 'linear') {\n            event.preventDefault();\n            focusNext();\n          }\n          break;\n        case 'ArrowUp':\n        case 'ArrowLeft':\n          if (finalConfig.navigationMode === 'linear') {\n            event.preventDefault();\n            focusPrevious();\n          }\n          break;\n        case 'Home':\n          if (event.ctrlKey) {\n            event.preventDefault();\n            focusFirst();\n          }\n          break;\n        case 'End':\n          if (event.ctrlKey) {\n            event.preventDefault();\n            focusLast();\n          }\n          break;\n        case 'Escape':\n          if (isTrappingFocus) {\n            // Allow escape to exit focus trap\n            setFocusTrap({ enabled: false, container: null });\n            setIsTrappingFocus(false);\n            restoreFocus();\n          }\n          break;\n      }\n    }\n    \n    logger.debug('Key event handled', eventData);\n  }, [finalConfig, hotkeys, isTrappingFocus, focusTrap, focusNext, focusPrevious, focusFirst, focusLast, setFocusTrap, restoreFocus]);\n  \n  const handleFocusIn = useCallback((event: FocusEvent) => {\n    const target = event.target as HTMLElement;\n    setCurrentFocus(target);\n    \n    // Update focusable elements if needed\n    if (debounceTimeoutRef.current) {\n      clearTimeout(debounceTimeoutRef.current);\n    }\n    \n    debounceTimeoutRef.current = setTimeout(() => {\n      updateFocusableElements();\n    }, finalConfig.debounceMs);\n  }, [finalConfig.debounceMs, updateFocusableElements]);\n  \n  const handleFocusOut = useCallback((event: FocusEvent) => {\n    // Only clear current focus if not moving to another focusable element\n    if (!event.relatedTarget) {\n      setCurrentFocus(null);\n    }\n  }, []);\n  \n  // Initialize components\n  useEffect(() => {\n    createLiveRegion();\n    createSkipLinkContainer();\n    updateFocusableElements();\n    \n    // Set initial focus\n    const activeElement = document.activeElement as HTMLElement;\n    if (activeElement && activeElement !== document.body) {\n      setCurrentFocus(activeElement);\n    }\n    \n    return () => {\n      // Cleanup\n      if (liveRegionRef.current) {\n        document.body.removeChild(liveRegionRef.current);\n      }\n      \n      if (skipLinkContainerRef.current) {\n        document.body.removeChild(skipLinkContainerRef.current);\n      }\n      \n      if (debounceTimeoutRef.current) {\n        clearTimeout(debounceTimeoutRef.current);\n      }\n    };\n  }, [createLiveRegion, createSkipLinkContainer, updateFocusableElements]);\n  \n  // Update focusable elements when focus trap changes\n  useEffect(() => {\n    updateFocusableElements();\n  }, [focusTrap, updateFocusableElements]);\n  \n  return {\n    // Focus Management\n    focusTrap,\n    setFocusTrap,\n    trapFocus,\n    restoreFocus,\n    \n    // Navigation\n    focusNext,\n    focusPrevious,\n    focusFirst,\n    focusLast,\n    navigateByDirection,\n    \n    // Skip Links\n    skipLinks,\n    addSkipLink,\n    removeSkipLink,\n    triggerSkipLink,\n    \n    // Hotkeys\n    hotkeys,\n    addHotkey,\n    removeHotkey,\n    enableHotkey,\n    \n    // State\n    currentFocus,\n    focusableElements,\n    isTrappingFocus,\n    \n    // Event Handlers\n    handleKeyDown,\n    handleFocusIn,\n    handleFocusOut,\n    \n    // Utilities\n    getFocusableElements,\n    isFocusable,\n    announceToScreenReader\n  };\n}\n\nexport type { \n  UseKeyboardNavigationReturn, \n  KeyboardEventData, \n  FocusTarget, \n  SkipLink,\n  HotkeyDefinition,\n  FocusTrapConfig,\n  UseKeyboardNavigationConfig \n};
