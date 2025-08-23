import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  enableArrowKeys?: boolean;
  enableHomeEnd?: boolean;
  enableEscape?: boolean;
  enableEnterSpace?: boolean;
  wrap?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onNavigate?: (index: number, element: HTMLElement) => void;
  onActivate?: (index: number, element: HTMLElement) => void;
  onEscape?: () => void;
  selector?: string;
  autoFocus?: boolean;
  /** Trap focus within the container for modals */
  trapFocus?: boolean;
  /** Handle Tab key for focus trapping */
  handleTab?: boolean;
  /** Restore focus to trigger element on unmount */
  restoreFocus?: boolean;
  /** Prevent tab cycling outside container */
  preventTabOutside?: boolean;
}

export interface ModalKeyboardNavigationHook {
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  getFocusableElements: () => HTMLElement[];
  trapFocusInContainer: (enabled: boolean) => void;
}

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
): ModalKeyboardNavigationHook => {
  const {
    enableArrowKeys = true,
    enableHomeEnd = true,
    enableEscape = true,
    enableEnterSpace = true,
    wrap = true,
    orientation = 'both',
    onNavigate,
    onActivate,
    onEscape,
    selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    autoFocus = false,
    trapFocus = false
    // Note: handleTab, restoreFocus, preventTabOutside are reserved for future use
  } = options;

  const focusTrapEnabled = useRef<boolean>(trapFocus);

  const currentIndexRef = useRef(0);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(selector)
    ).filter((element) => {
      const el = element as HTMLElement;
      const isDisabled = (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement).disabled;
      return !isDisabled && el.offsetParent !== null;
    }) as HTMLElement[];
  }, [containerRef, selector]);

  const focusElement = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const targetIndex = wrap 
      ? ((index % elements.length) + elements.length) % elements.length
      : Math.max(0, Math.min(index, elements.length - 1));

    const element = elements[targetIndex];
    if (element) {
      element.focus();
      currentIndexRef.current = targetIndex;
      onNavigate?.(targetIndex, element);
    }
  }, [getFocusableElements, wrap, onNavigate]);

  const activateElement = useCallback((index: number) => {
    const elements = getFocusableElements();
    const element = elements[index];
    if (element) {
      if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
        element.click();
      } else if (element.tagName === 'A') {
        element.click();
      } else if (element.tagName === 'INPUT') {
        const input = element as HTMLInputElement;
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.click();
        }
      }
      onActivate?.(index, element);
    }
  }, [getFocusableElements, onActivate]);

  const handleArrowKeys = useCallback((event: KeyboardEvent, currentIndex: number): { handled: boolean; newIndex: number } => {
    if (!enableArrowKeys) return { handled: false, newIndex: currentIndex };

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          return { handled: true, newIndex: currentIndex + 1 };
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          return { handled: true, newIndex: currentIndex - 1 };
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          return { handled: true, newIndex: currentIndex + 1 };
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          return { handled: true, newIndex: currentIndex - 1 };
        }
        break;
    }
    
    return { handled: false, newIndex: currentIndex };
  }, [enableArrowKeys, orientation]);

  const handleHomeEndKeys = useCallback((event: KeyboardEvent, currentIndex: number, elementsLength: number): { handled: boolean; newIndex: number } => {
    if (!enableHomeEnd) return { handled: false, newIndex: currentIndex };

    switch (event.key) {
      case 'Home':
        event.preventDefault();
        return { handled: true, newIndex: 0 };
      case 'End':
        event.preventDefault();
        return { handled: true, newIndex: elementsLength - 1 };
    }
    
    return { handled: false, newIndex: currentIndex };
  }, [enableHomeEnd]);

  const handleActivationKeys = useCallback((event: KeyboardEvent, currentIndex: number, currentElement: HTMLElement, elements: HTMLElement[]): boolean => {
    if (!enableEnterSpace) return false;

    if ((event.key === 'Enter' || event.key === ' ') && currentElement && elements.includes(currentElement)) {
      event.preventDefault();
      activateElement(currentIndex);
      return true;
    }
    
    return false;
  }, [enableEnterSpace, activateElement]);

  const handleEscapeKey = useCallback((event: KeyboardEvent): boolean => {
    if (enableEscape && event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return true;
    }
    return false;
  }, [enableEscape, onEscape]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;

    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = elements.indexOf(currentElement);
    currentIndexRef.current = Math.max(0, currentIndex);

    // Handle arrow keys
    const arrowResult = handleArrowKeys(event, currentIndex);
    if (arrowResult.handled) {
      focusElement(arrowResult.newIndex);
      return;
    }

    // Handle home/end keys
    const homeEndResult = handleHomeEndKeys(event, currentIndex, elements.length);
    if (homeEndResult.handled) {
      focusElement(homeEndResult.newIndex);
      return;
    }

    // Handle activation keys
    if (handleActivationKeys(event, currentIndex, currentElement, elements)) {
      return;
    }

    // Handle escape key
    handleEscapeKey(event);
  }, [
    containerRef,
    getFocusableElements,
    focusElement,
    handleArrowKeys,
    handleHomeEndKeys,
    handleActivationKeys,
    handleEscapeKey
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        elements[0].focus();
      }
    }
  }, [autoFocus, containerRef, getFocusableElements]);

  return {
    focusFirst: () => focusElement(0),
    focusLast: () => focusElement(getFocusableElements().length - 1),
    focusNext: () => focusElement(currentIndexRef.current + 1),
    focusPrevious: () => focusElement(currentIndexRef.current - 1),
    getFocusableElements,
    trapFocusInContainer: (enabled: boolean) => {
      focusTrapEnabled.current = enabled;
    }
  };
};

// Hook for managing focus traps (modal dialogs, etc.)
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true,
  options: { 
    autoFocus?: boolean;
    restoreFocus?: boolean;
    fallbackFocus?: string;
  } = {}
) => {
  const {
    autoFocus = true,
    restoreFocus = true,
    fallbackFocus = 'button'
  } = options;

  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      const el = element as HTMLElement;
      return el.offsetParent !== null;
    }) as HTMLElement[];
  }, [containerRef]);

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        // Tab
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, containerRef, getFocusableElements]);

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;

      // Focus the first focusable element in the container
      if (autoFocus && containerRef.current) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          // Fallback: focus the container or a specific element
          const fallback = containerRef.current.querySelector(fallbackFocus) as HTMLElement;
          if (fallback) {
            fallback.focus();
          } else {
            containerRef.current.focus();
          }
        }
      }

      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);

        // Restore focus to the previously focused element
        if (restoreFocus && lastFocusedElement.current) {
          lastFocusedElement.current.focus();
        }
      };
    }
  }, [isActive, autoFocus, restoreFocus, fallbackFocus, containerRef, getFocusableElements, handleTabKey]);

  return {
    focusFirst: () => {
      const elements = getFocusableElements();
      if (elements.length > 0) elements[0].focus();
    },
    focusLast: () => {
      const elements = getFocusableElements();
      if (elements.length > 0) elements[elements.length - 1].focus();
    }
  };
};

// Hook for skip navigation links
export const useSkipNavigation = () => {
  const skipToMain = useCallback(() => {
    const main = document.querySelector('main, [role="main"], #main-content') as HTMLElement;
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = 'Skipped to main content';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement;
    if (nav) {
      const firstLink = nav.querySelector('a, button') as HTMLElement;
      if (firstLink) {
        firstLink.focus();
        firstLink.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'sr-only';
        announcement.textContent = 'Skipped to navigation';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    }
  }, []);

  return { skipToMain, skipToNavigation };
};

// Hook for roving tabindex pattern (for toolbars, menus, etc.)
export const useRovingTabindex = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    selector?: string;
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    defaultIndex?: number;
  } = {}
) => {
  const {
    selector = '[role="menuitem"], [role="tab"], button',
    orientation = 'horizontal',
    wrap = true,
    defaultIndex = 0
  } = options;

  const currentIndexRef = useRef(defaultIndex);

  const updateTabindexes = useCallback(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll(selector)
    );

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      if (index === currentIndexRef.current) {
        htmlElement.setAttribute('tabindex', '0');
      } else {
        htmlElement.setAttribute('tabindex', '-1');
      }
    });
  }, [containerRef, selector]);

  const setActiveIndex = useCallback((index: number) => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll(selector)
    );

    if (elements.length === 0) return;

    const newIndex = wrap
      ? ((index % elements.length) + elements.length) % elements.length
      : Math.max(0, Math.min(index, elements.length - 1));

    currentIndexRef.current = newIndex;
    updateTabindexes();
    (elements[newIndex] as HTMLElement)?.focus();
  }, [containerRef, selector, wrap, updateTabindexes]);

  useEffect(() => {
    updateTabindexes();
  }, [updateTabindexes]);

  const navigationOptions = {
    enableArrowKeys: true,
    enableHomeEnd: true,
    enableEnterSpace: false,
    enableEscape: false,
    wrap,
    orientation,
    selector,
    onNavigate: (index: number) => {
      currentIndexRef.current = index;
      updateTabindexes();
    }
  };

  useKeyboardNavigation(containerRef, navigationOptions);

  return {
    setActiveIndex,
    getCurrentIndex: () => currentIndexRef.current
  };
};

// Utility for announcing keyboard shortcuts
export const announceKeyboardShortcut = (shortcut: string, action: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Keyboard shortcut: ${shortcut} for ${action}`;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 2000);
};

// Global keyboard shortcuts manager
export const useGlobalKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.metaKey && 'meta',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardNavigation;
