import React, { useEffect, useRef } from 'react';
import { useMobileViewport, mobileUtils } from '../utils/mobileViewportManager';

interface MobileViewportProviderProps {
  children: React.ReactNode;
  enableHapticFeedback?: boolean;
  preventZoom?: boolean;
  optimizeInputs?: boolean;
}

/**
 * Enhanced Mobile Viewport Provider
 * Provides comprehensive mobile viewport management and UX enhancements
 */
export const MobileViewportProvider: React.FC<MobileViewportProviderProps> = ({
  children,
  enableHapticFeedback = true,
  preventZoom = true,
  optimizeInputs = true,
}) => {
  const viewport = useMobileViewport();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mobile optimizations
    if (preventZoom) {
      mobileUtils.preventZoom();
    }

    if (optimizeInputs) {
      mobileUtils.optimizeInputs();
    }

    // Add touch feedback to interactive elements
    if (enableHapticFeedback) {
      const interactiveElements = document.querySelectorAll(
        'button, .btn, [role="button"], .card, .touch-feedback'
      );
      
      interactiveElements.forEach(element => {
        if (element instanceof HTMLElement) {
          mobileUtils.addTouchFeedback(element);
          
          // Add haptic feedback for important actions
          if (element.classList.contains('primary') || 
              element.classList.contains('emergency') ||
              element.classList.contains('send-btn')) {
            mobileUtils.enableHapticFeedback(element, 'medium');
          } else {
            mobileUtils.enableHapticFeedback(element, 'light');
          }
        }
      });
    }

    // Add global keyboard event handling
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Handle escape key for modals
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.mobile-modal.active');
        if (activeModal) {
          // Trigger modal close
          const closeButton = activeModal.querySelector('[data-dismiss="modal"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);

    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [enableHapticFeedback, preventZoom, optimizeInputs]);

  // Handle viewport changes
  useEffect(() => {
    if (containerRef.current) {
      // Add appropriate classes based on viewport state
      containerRef.current.classList.toggle('keyboard-open', viewport.isKeyboardOpen);
      containerRef.current.classList.toggle('landscape', viewport.orientation === 'landscape');
      containerRef.current.classList.toggle('portrait', viewport.orientation === 'portrait');
      
      // Update accessibility attributes
      containerRef.current.setAttribute('aria-orientation', viewport.orientation);
      
      if (viewport.isKeyboardOpen) {
        containerRef.current.setAttribute('aria-describedby', 'keyboard-active');
      } else {
        containerRef.current.removeAttribute('aria-describedby');
      }
    }

    // Announce orientation changes to screen readers
    if (document.querySelector('#viewport-announcer')) {
      const announcer = document.querySelector('#viewport-announcer');
      if (announcer instanceof HTMLElement) {
        announcer.textContent = viewport.orientation === 'landscape' 
          ? 'Switched to landscape orientation' 
          : 'Switched to portrait orientation';
      }
    }
  }, [viewport.isKeyboardOpen, viewport.orientation]);

  // Style objects for esbuild compatibility
  const srOnlyStyle: React.CSSProperties = { 
    position: 'absolute', 
    left: '-10000px', 
    width: '1px', 
    height: '1px', 
    overflow: 'hidden' 
  };

  return (
    <div 
      ref={containerRef}
      className="mobile-viewport-container"
      data-keyboard-height={viewport.keyboardHeight}
      data-orientation={viewport.orientation}
    >
      {/* Screen reader announcements */}
      <div id="viewport-announcer" aria-live="polite" aria-atomic="true" style={srOnlyStyle} />
      
      {/* Keyboard active indicator for screen readers */}
      {viewport.isKeyboardOpen && (
        <div id="keyboard-active" style={srOnlyStyle}>
          Virtual keyboard is active
        </div>
      )}
      
      {children}
    </div>
  );
};

/**
 * Mobile-optimized Form Container
 */
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  autoAdjustViewport?: boolean;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className = '',
  autoAdjustViewport = true,
}) => {
  const viewport = useMobileViewport();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Blur active input to close keyboard
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.blur();
    }

    // Small delay to allow keyboard to close
    setTimeout(() => {
      onSubmit?.(e);
    }, 150);
  };

  useEffect(() => {
    if (autoAdjustViewport && formRef.current) {
      const inputs = formRef.current.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        const handleFocus = () => {
          if (viewport.isKeyboardOpen) {
            setTimeout(() => {
              // Use native scrollIntoView as fallback
              (input as HTMLElement).scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }, 300); // Wait for keyboard animation
          }
        };

        input.addEventListener('focus', handleFocus);
        
        // Cleanup
        return () => {
          input.removeEventListener('focus', handleFocus);
        };
      });
    }
  }, [autoAdjustViewport, viewport]);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className={`mobile-form ${className}`}
      noValidate
    >
      {children}
    </form>
  );
};

/**
 * Mobile-optimized Input Field
 */
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  floatingLabel?: boolean;
  helpText?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  floatingLabel = false,
  helpText,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  const containerClass = floatingLabel 
    ? 'mobile-input-container mobile-input-floating' 
    : 'mobile-input-container';

  const inputClassName = ['mobile-input', className, error && 'error'].filter(Boolean).join(' ');
  const ariaDescribedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={containerClass}>
      <input id={inputId} className={inputClassName} aria-invalid={error ? 'true' : 'false'} aria-describedby={ariaDescribedBy} {...rest} />
      
      {label && (
        <label htmlFor={inputId}>
          {label}
          {rest.required && <span aria-label="required"> *</span>}
        </label>
      )}
      
      {helpText && (
        <div id={helpId} className="mobile-input-help">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="mobile-input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Mobile-optimized Modal Dialog
 */
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'medium',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Focus management
      const firstFocusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      firstFocusableElement?.focus();
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`mobile-modal active ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `modal-title-${Date.now()}` : undefined}
    >
      <div className="mobile-modal-backdrop" />
      
      <div 
        ref={modalRef}
        className={`mobile-modal-content mobile-modal-${size}`}
        role="document"
      >
        {title && (
          <div className="mobile-modal-header">
            <h2 id={`modal-title-${Date.now()}`} className="mobile-modal-title">
              {title}
            </h2>
            <button 
              type="button"
              className="mobile-modal-close"
              onClick={onClose}
              aria-label="Close modal"
              data-dismiss="modal"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="mobile-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for mobile-specific interactions
 */
export const useMobileInteractions = () => {
  const viewport = useMobileViewport();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToElement = (element: HTMLElement, options?: {
    behavior?: 'smooth' | 'auto';
    block?: 'start' | 'center' | 'end' | 'nearest';
    offset?: number;
  }) => {
    // Use native scrollIntoView as fallback
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      ...options
    });
  };

  const closeKeyboard = () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.blur();
    }
  };

  const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  return {
    viewport,
    scrollToTop,
    scrollToElement,
    closeKeyboard,
    hapticFeedback,
    isKeyboardOpen: viewport.isKeyboardOpen,
    isPortrait: viewport.orientation === 'portrait',
    isLandscape: viewport.orientation === 'landscape',
  };
};

export default {
  MobileViewportProvider,
  MobileForm,
  MobileInput,
  MobileModal,
  useMobileInteractions,
};
