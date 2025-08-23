import React, { useRef, useCallback } from 'react';

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerStyle?: React.CSSProperties;
  enhanced?: boolean;
  floatingLabel?: boolean;
  error?: string;
  helpText?: string;
  mobileOptimized?: boolean;
  variant?: 'glass' | 'neumorph' | 'default';
  animate?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  id,
  className = '',
  containerStyle,
  enhanced = true,
  floatingLabel = false,
  error,
  helpText,
  mobileOptimized = true,
  variant = 'glass',
  animate = true,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formGroupClass = enhanced ? 'form-group-enhanced smooth-transition' : 'form-group';
  
  // Determine input class based on variant
  let inputClass = 'form-control';
  if (enhanced) {
    switch(variant) {
      case 'neumorph':
        inputClass = 'neumorph-input';
        break;
      case 'glass':
      default:
        inputClass = 'form-control-enhanced glass-input';
        break;
    }
  }
  
  const containerClass = enhanced && floatingLabel ? 'form-floating-enhanced' : '';
  const animationClass = animate && enhanced ? 'smooth-transition' : '';
  
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  // Mobile-specific touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    if (!mobileOptimized) return;
    
    // Ensure proper focus on mobile devices
    const target = e.currentTarget;
    if (target && target !== document.activeElement) {
      // Prevent default to avoid double-tap zoom on some devices
      e.preventDefault();
      target.focus();
      
      // Scroll input into view on mobile
      setTimeout(() => {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [mobileOptimized]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (mobileOptimized) {
      // Add mobile-focused class for enhanced styling
      e.currentTarget.classList.add('mobile-focused');
    }
    
    // Call original onFocus if provided
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  }, [mobileOptimized, rest.onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (mobileOptimized) {
      // Remove mobile-focused class
      e.currentTarget.classList.remove('mobile-focused');
    }
    
    // Call original onBlur if provided
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  }, [mobileOptimized, rest.onBlur]);

  // Determine input props with mobile optimizations
  const inputProps = {
    ...rest,
    id: inputId,
    ref: inputRef,
    className: `${inputClass} ${animationClass} ${className} ${error ? 'is-invalid' : ''} ${mobileOptimized ? 'mobile-optimized' : ''}`.trim(),
    'aria-invalid': error ? 'true' as const : 'false' as const,
    'aria-describedby': [
      error ? `${inputId}-error` : '',
      helpText ? `${inputId}-help` : ''
    ].filter(Boolean).join(' ') || undefined,
    style: {
      minHeight: '44px', // WCAG 2.1 AA touch target requirement
      ...rest.style
    },
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...(mobileOptimized && {
      onTouchStart: handleTouchStart,
      style: {
        fontSize: rest.type === 'email' || rest.type === 'text' || rest.type === 'password' ? '16px' : undefined, // Prevent iOS zoom
        minHeight: '44px', // WCAG 2.1 AA touch target requirement  
        ...rest.style
      },
      autoComplete: rest.autoComplete || 'off',
      autoCorrect: 'off',
      autoCapitalize: rest.autoCapitalize || 'none',
      spellCheck: rest.spellCheck !== undefined ? rest.spellCheck : false
    })
  };
  return (
    <div className={`${formGroupClass} ${containerClass}`} style={containerStyle}>
      {!floatingLabel && label && <label htmlFor={inputId}>{label}</label>}
      <input {...inputProps} />
      {floatingLabel && label && <label htmlFor={inputId}>{label}</label>}
      {error && (
        <div id={`${inputId}-error`} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
      {helpText && !error && (
        <div id={`${inputId}-help`} className="form-text">
          {helpText}
        </div>
      )}
    </div>
  );
};

interface AppTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    containerStyle?: React.CSSProperties;
    footer?: React.ReactNode;
    enhanced?: boolean;
    error?: string;
    helpText?: string;
    mobileOptimized?: boolean;
    variant?: 'glass' | 'neumorph' | 'default';
    animate?: boolean;
}

export const AppTextArea: React.FC<AppTextAreaProps> = ({
    label,
    id,
    className = '',
    containerStyle,
    footer,
    enhanced = true,
    error,
    helpText,
    mobileOptimized = true,
    variant = 'glass',
    animate = true,
    ...rest
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formGroupClass = enhanced ? 'form-group-enhanced smooth-transition' : 'form-group';
    
    // Determine textarea class based on variant
    let textareaClass = 'form-control';
    if (enhanced) {
      switch(variant) {
        case 'neumorph':
          textareaClass = 'neumorph-input';
          break;
        case 'glass':
        default:
          textareaClass = 'form-control-enhanced glass-input';
          break;
      }
    }
    
    const animationClass = animate && enhanced ? 'smooth-transition' : '';
    
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 11)}`;

    // Mobile-specific touch event handlers
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLTextAreaElement>) => {
      if (!mobileOptimized) return;
      
      const target = e.currentTarget;
      if (target && target !== document.activeElement) {
        e.preventDefault();
        target.focus();
        
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }, [mobileOptimized]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (mobileOptimized) {
        e.currentTarget.classList.add('mobile-focused');
      }
      
      if (rest.onFocus) {
        rest.onFocus(e);
      }
    }, [mobileOptimized, rest.onFocus]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (mobileOptimized) {
        e.currentTarget.classList.remove('mobile-focused');
      }
      
      if (rest.onBlur) {
        rest.onBlur(e);
      }
    }, [mobileOptimized, rest.onBlur]);

    const textareaProps = {
      ...rest,
      id: textareaId,
      ref: textareaRef,
      className: `${textareaClass} ${animationClass} ${className} ${error ? 'is-invalid' : ''} ${mobileOptimized ? 'mobile-optimized' : ''}`.trim(),
      'aria-invalid': error ? 'true' as const : 'false' as const,
      'aria-describedby': [
        error ? `${textareaId}-error` : '',
        helpText ? `${textareaId}-help` : ''
      ].filter(Boolean).join(' ') || undefined,
      style: {
        minHeight: '44px', // WCAG 2.1 AA touch target requirement
        ...rest.style
      },
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...(mobileOptimized && {
        onTouchStart: handleTouchStart,
        style: {
          fontSize: '16px', // Prevent iOS zoom
          minHeight: '44px', // WCAG 2.1 AA touch target requirement
          ...rest.style
        },
        autoCorrect: 'off',
        spellCheck: rest.spellCheck !== undefined ? rest.spellCheck : true
      })
    };
    
    return (
        <div className={formGroupClass} style={containerStyle}>
            {label && <label htmlFor={textareaId}>{label}</label>}
            <textarea {...textareaProps} />
            {error && (
              <div id={`${textareaId}-error`} className="invalid-feedback" role="alert">
                {error}
              </div>
            )}
            {helpText && !error && (
              <div id={`${textareaId}-help`} className="form-text">
                {helpText}
              </div>
            )}
            {footer && <div className="form-group-footer">{footer}</div>}
        </div>
    );
};