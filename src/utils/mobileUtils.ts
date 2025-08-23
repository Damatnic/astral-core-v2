/**
 * Mobile Viewport Height Handler
 * Fixes viewport height issues on mobile browsers where
 * 100vh doesn't account for address bar changes
 */

export const initMobileViewport = () => {
  const setViewportHeight = () => {
    // Calculate the actual viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Set mobile-specific viewport height for keyboard handling
    const mobileVh = window.visualViewport 
      ? window.visualViewport.height * 0.01
      : window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--mobile-vh', `${mobileVh * 100}px`);
  };

  // Set initial viewport height
  setViewportHeight();

  // Update on resize (orientation changes, keyboard open/close)
  window.addEventListener('resize', setViewportHeight);
  
  // Use Visual Viewport API if available (better for mobile)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight);
    window.visualViewport.addEventListener('scroll', setViewportHeight);
  }

  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });

  return () => {
    window.removeEventListener('resize', setViewportHeight);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', setViewportHeight);
      window.visualViewport.removeEventListener('scroll', setViewportHeight);
    }
    window.removeEventListener('orientationchange', setViewportHeight);
  };
};

/**
 * Enhanced focus handling for mobile inputs
 */
export const enhanceMobileFocus = () => {
  const inputs = document.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    // Type guard to ensure it's an HTML element with addEventListener
    if (!(input instanceof HTMLElement) || typeof input.addEventListener !== 'function') {
      return;
    }
    
    // Prevent zoom on iOS by ensuring 16px font size
    if (window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad')) {
      const computedStyle = window.getComputedStyle(input);
      if (computedStyle && computedStyle.fontSize) {
        const fontSize = parseFloat(computedStyle.fontSize);
        
        if (fontSize < 16 && input.style) {
          input.style.fontSize = '16px';
        }
      }
    }

    // Better focus handling
    input.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      
      // Add visual focus class
      target.classList.add('mobile-input-focused');
      
      // Scroll into view after keyboard animation
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    });

    input.addEventListener('blur', (e) => {
      const target = e.target as HTMLElement;
      target.classList.remove('mobile-input-focused');
    });
  });
};

/**
 * Detect mobile device
 */
export const isMobileDevice = (): boolean => {
  const userAgent = window.navigator.userAgent;
  const hasMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasSmallScreen = window.innerWidth <= 768;
  const hasTouchSupport = 'ontouchstart' in window;
  
  // If it's a desktop user agent with large screen, it's not mobile even if touch is supported
  if (!hasMobileUserAgent && window.innerWidth > 768) {
    return false;
  }
  
  return hasMobileUserAgent || hasSmallScreen || hasTouchSupport;
};

/**
 * Detect if virtual keyboard is open
 */
export const isVirtualKeyboardOpen = (): boolean => {
  if (window.visualViewport && typeof window.visualViewport.height === 'number') {
    return window.visualViewport.height < window.innerHeight * 0.8;
  }
  
  // Fallback detection
  if (window.screen && typeof window.screen.height === 'number') {
    const heightDifference = window.screen.height - window.innerHeight;
    return heightDifference > 150;
  }
  
  return false;
};

/**
 * Touch feedback utilities
 */
export const addTouchFeedback = (element: HTMLElement) => {
  let touchStartTime: number;

  element.addEventListener('touchstart', () => {
    touchStartTime = Date.now();
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
  });

  element.addEventListener('touchend', () => {
    const touchDuration = Date.now() - touchStartTime;
    
    // Only apply feedback for quick taps
    if (touchDuration < 300) {
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    } else {
      element.style.transform = 'scale(1)';
    }
  });

  element.addEventListener('touchcancel', () => {
    element.style.transform = 'scale(1)';
  });
};

/**
 * Initialize all mobile enhancements
 */
export const initMobileEnhancements = () => {
  // Always return a cleanup function, even for non-mobile devices
  if (!isMobileDevice()) {
    return () => {}; // No-op cleanup function
  }

  // Initialize viewport height handling
  const cleanupViewport = initMobileViewport();

  // Enhance input focus behavior
  enhanceMobileFocus();

  // Add touch feedback to buttons
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  buttons.forEach(button => {
    if (button instanceof HTMLElement) {
      addTouchFeedback(button);
    }
  });

  // Return cleanup function
  return cleanupViewport;
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileEnhancements);
  } else {
    initMobileEnhancements();
  }
}

export default {
  initMobileViewport,
  enhanceMobileFocus,
  isMobileDevice,
  isVirtualKeyboardOpen,
  addTouchFeedback,
  initMobileEnhancements,
};
