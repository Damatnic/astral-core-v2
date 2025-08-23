/**
 * Mobile Viewport Manager - Simplified for Demo
 */

import React from 'react';

interface ViewportState {
  width: number;
  height: number;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  orientation: 'portrait' | 'landscape';
}

type ViewportChangeListener = (state: ViewportState) => void;

class MobileViewportManager {
  private listeners: ViewportChangeListener[] = [];
  private currentState: ViewportState;

  constructor() {
    this.currentState = this.getInitialState();
    this.init();
  }

  private getInitialState(): ViewportState {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isKeyboardOpen: false,
      keyboardHeight: 0,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    };
  }

  private init() {
    this.setupViewportListener();
    this.updateCSSVariables();
  }

  private setupViewportListener() {
    if (window.visualViewport) {
      const handleViewportChange = () => {
        this.updateViewportState();
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', () => {
        this.updateViewportState();
      });
    }
  }

  private updateViewportState() {
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const currentWidth = window.visualViewport?.width || window.innerWidth;
    
    // Simple keyboard detection
    const isKeyboardOpen = window.innerHeight - currentHeight > 150;
    
    this.currentState = {
      width: currentWidth,
      height: currentHeight,
      isKeyboardOpen,
      keyboardHeight: isKeyboardOpen ? window.innerHeight - currentHeight : 0,
      orientation: currentWidth > currentHeight ? 'landscape' : 'portrait',
    };

    this.updateCSSVariables();
    this.notifyListeners();
  }

  private updateCSSVariables() {
    const root = document.documentElement;
    
    root.style.setProperty('--viewport-width', `${this.currentState.width}px`);
    root.style.setProperty('--viewport-height', `${this.currentState.height}px`);
    root.style.setProperty('--vh', `${this.currentState.height * 0.01}px`);
    root.style.setProperty('--keyboard-height', `${this.currentState.keyboardHeight}px`);
    root.style.setProperty('--is-keyboard-open', this.currentState.isKeyboardOpen ? '1' : '0');
    
    document.body.classList.toggle('keyboard-open', this.currentState.isKeyboardOpen);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.warn('Viewport listener error:', error);
      }
    });
  }

  public getState(): ViewportState {
    return { ...this.currentState };
  }

  public onViewportChange(listener: ViewportChangeListener): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public isKeyboardVisible(): boolean {
    return this.currentState.isKeyboardOpen;
  }
}

// Create singleton instance
const viewportManager = new MobileViewportManager();

// React hook for easy integration
export const useMobileViewport = () => {
  const [state, setState] = React.useState(viewportManager.getState());

  React.useEffect(() => {
    const unsubscribe = viewportManager.onViewportChange(setState);
    return unsubscribe;
  }, []);

  return state;
};

// Utility functions for common mobile patterns
export const mobileUtils = {
  preventZoom: () => {
    // Prevent pinch zoom
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent double-tap zoom with better detection
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },

  optimizeInputs: () => {
    // Ensure all inputs have proper mobile attributes
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLTextAreaElement;
      
      // Prevent zoom on iOS
      if (!element.style.fontSize || parseFloat(element.style.fontSize) < 16) {
        element.style.fontSize = '16px';
      }

      // Add touch-friendly attributes
      element.setAttribute('touch-action', 'manipulation');
      
      // Optimize input types for mobile keyboards
      if (element.type === 'email') {
        element.setAttribute('inputmode', 'email');
      } else if (element.type === 'tel') {
        element.setAttribute('inputmode', 'tel');
      } else if (element.type === 'url') {
        element.setAttribute('inputmode', 'url');
      } else if (element.type === 'number') {
        element.setAttribute('inputmode', 'numeric');
      }
    });
  },

  addTouchFeedback: (element: HTMLElement) => {
    let touchTimeout: number;

    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active');
      clearTimeout(touchTimeout);
    }, { passive: true });

    element.addEventListener('touchend', () => {
      touchTimeout = window.setTimeout(() => {
        element.classList.remove('touch-active');
      }, 150);
    }, { passive: true });

    element.addEventListener('touchcancel', () => {
      element.classList.remove('touch-active');
      clearTimeout(touchTimeout);
    }, { passive: true });
  },

  enableHapticFeedback: (element: HTMLElement, intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    element.addEventListener('touchstart', () => {
      if (navigator.vibrate) {
        const patterns = {
          light: 10,
          medium: 20,
          heavy: 30
        };
        navigator.vibrate(patterns[intensity]);
      }
    }, { passive: true });
  }
};

export default viewportManager;
