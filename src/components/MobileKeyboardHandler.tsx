/**
 * Mobile Keyboard Handler Component
 * 
 * Handles mobile virtual keyboard behavior to prevent layout breaking
 * and ensure proper chat input positioning on iOS Safari and Android Chrome.
 * 
 * Key features:
 * - Dynamic viewport height adjustment using CSS viewport units
 * - Safe area inset support for iPhone notch/home indicator
 * - Keyboard state detection and layout adjustment
 * - Touch event optimization for mobile inputs
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

// Hook for detecting mobile viewport changes
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    const updateViewportHeight = () => {
      // Use the new CSS viewport units for better mobile support
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // For older browsers, also set a custom property
      document.documentElement.style.setProperty('--mobile-vh', `${window.innerHeight}px`);
      setViewportHeight(window.innerHeight);
    };

    const detectKeyboard = () => {
      const currentHeight = window.innerHeight;
      const windowHeight = window.screen.height;
      
      // Threshold for keyboard detection (adjust based on testing)
      const keyboardThreshold = windowHeight * 0.25;
      
      if (windowHeight - currentHeight > keyboardThreshold) {
        // Keyboard is likely open
        const calculatedKeyboardHeight = windowHeight - currentHeight;
        setKeyboardHeight(calculatedKeyboardHeight);
        setIsKeyboardOpen(true);
        document.documentElement.style.setProperty('--keyboard-height', `${calculatedKeyboardHeight}px`);
        document.documentElement.style.setProperty('--is-keyboard-open', '1');
        document.body.classList.add('keyboard-open');
      } else {
        // Keyboard is likely closed
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.style.setProperty('--is-keyboard-open', '0');
        document.body.classList.remove('keyboard-open');
      }
    };

    checkMobile();
    updateViewportHeight();
    detectKeyboard();

    // Event listeners
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('resize', detectKeyboard);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateViewportHeight();
        detectKeyboard();
      }, 500); // Delay to allow orientation change to complete
    });

    // Visual viewport API support for better keyboard detection
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        if (window.visualViewport) {
          const heightDiff = window.innerHeight - window.visualViewport.height;
          if (heightDiff > 150) { // Keyboard threshold
            setKeyboardHeight(heightDiff);
            setIsKeyboardOpen(true);
            document.documentElement.style.setProperty('--keyboard-height', `${heightDiff}px`);
            document.body.classList.add('keyboard-open');
          } else {
            setKeyboardHeight(0);
            setIsKeyboardOpen(false);
            document.documentElement.style.setProperty('--keyboard-height', '0px');
            document.body.classList.remove('keyboard-open');
          }
        }
      };

      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('resize', detectKeyboard);
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      };
    }

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('resize', detectKeyboard);
    };
  }, []);

  const scrollIntoView = useCallback((element: HTMLElement, options: ScrollIntoViewOptions = {}) => {
    if (!isMobile) return;
    
    const defaultOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      ...options
    };
    
    element.scrollIntoView(defaultOptions);
  }, [isMobile]);

  return {
    isMobile,
    isKeyboardOpen,
    viewportHeight,
    keyboardHeight,
    scrollIntoView
  };
};

// Enhanced mobile input component with proper focus handling
interface MobileAppInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  type?: string;
}

export const MobileAppInput: React.FC<MobileAppInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...",
  className = "",
  containerStyle = {},
  style = {},
  autoFocus = false,
  type = "text"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile, scrollIntoView } = useMobileViewport();

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!isMobile) return;

    // Add mobile-focused class for styling
    e.target.classList.add('mobile-focused');
    
    // Scroll input into view with delay to account for keyboard animation
    setTimeout(() => {
      if (inputRef.current) {
        scrollIntoView(inputRef.current, { block: 'end' });
      }
    }, 300);
  }, [isMobile, scrollIntoView]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.classList.remove('mobile-focused');
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    // Ensure input focuses properly on touch
    if (isMobile && inputRef.current && inputRef.current !== document.activeElement) {
      e.preventDefault();
      inputRef.current.focus();
    }
  }, [isMobile]);

  return (
    <div style={{ flexGrow: 1, marginBottom: 0, ...containerStyle }}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onTouchStart={handleTouchStart}
        placeholder={placeholder}
        className={`chat-input ${className}`}
        autoFocus={autoFocus}
        style={{
          fontSize: '16px', // Prevent zoom on iOS Safari
          padding: '12px 16px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
          minHeight: '44px', // WCAG touch target size
          width: '100%',
          outline: 'none',
          transition: 'all 0.2s ease',
          // Enhanced mobile optimizations
          WebkitTapHighlightColor: 'transparent', // Remove tap highlights
          WebkitAppearance: 'none', // Remove native styling
          WebkitUserSelect: 'text', // Allow text selection
          resize: 'none', // Prevent textarea resize
          // Prevent zoom on focus for iOS Safari
          WebkitTextSizeAdjust: '100%',
          ...style
        }}
        // Accessibility and mobile optimization attributes
        aria-label={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck="true"
        // Enhanced mobile input attributes
        inputMode="text"
        enterKeyHint="send"
        data-mobile-input="true"
      />
    </div>
  );
};

// Mobile-optimized chat composer component
interface MobileChatComposerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileChatComposer: React.FC<MobileChatComposerProps> = ({
  children,
  className = "",
  style = {}
}) => {
  const { isMobile } = useMobileViewport();

  const composerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: isMobile ? 0 : '280px', // Full width on mobile, account for sidebar on desktop
    right: 0,
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border-color)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    // Safe area adjustments for iPhone
    paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
    // Smooth transition when keyboard appears
    transition: 'transform 0.2s ease-out',
    ...style
  };

  return (
    <div 
      className={`chat-composer ${className} ${isMobile ? 'mobile-composer' : ''}`}
      style={composerStyle}
    >
      {children}
    </div>
  );
};

// Provider component for mobile keyboard context
interface MobileKeyboardProviderProps {
  children: React.ReactNode;
}

export const MobileKeyboardProvider: React.FC<MobileKeyboardProviderProps> = ({ children }) => {
  useEffect(() => {
    // Set viewport meta tag for proper mobile scaling
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Updated viewport configuration for better mobile keyboard handling
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    // Add CSS custom properties for safe areas
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --mobile-vh: 100vh;
        --keyboard-height: 0px;
        --is-keyboard-open: 0;
      }

      /* Support for CSS environment variables (safe areas) */
      @supports (padding: max(0px)) {
        .mobile-safe-area {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }
      }

      /* Mobile keyboard adjustments */
      @media (max-width: 768px) {
        /* Ensure all inputs use safe font sizes to prevent zoom */
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="search"],
        input[type="tel"],
        input[type="url"],
        textarea,
        select {
          font-size: 16px !important; /* Prevent iOS Safari zoom */
          -webkit-text-size-adjust: 100%;
        }

        /* Enhanced chat layout */
        .chat-view {
          height: 100vh;
          height: var(--mobile-vh, 100vh);
          position: relative;
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          padding-bottom: calc(140px + var(--keyboard-height, 0px));
          -webkit-overflow-scrolling: touch;
          /* Enhanced scrolling performance */
          scroll-behavior: smooth;
          overscroll-behavior: contain;
        }

        .keyboard-open .chat-messages {
          padding-bottom: calc(140px + var(--keyboard-height, 0px) + 20px);
        }

        .mobile-focused {
          position: relative;
          z-index: 1001;
        }

        .chat-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        /* Mobile composer improvements */
        .mobile-composer {
          /* Ensure composer stays above keyboard */
          transform: translateY(calc(-1 * var(--keyboard-height, 0px)));
          /* Smooth animation */
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced touch targets for mobile */
        button,
        .touchable {
          min-height: 44px !important;
          min-width: 44px !important;
          touch-action: manipulation;
        }

        /* Prevent text selection on UI elements */
        .ui-element {
          -webkit-user-select: none;
          user-select: none;
        }

        /* Allow text selection in content areas */
        .selectable-text {
          -webkit-user-select: text;
          user-select: text;
        }
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
};

export default MobileKeyboardProvider;
