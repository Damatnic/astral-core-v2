/**
 * Mobile Form Optimization System
 * 
 * Comprehensive mobile form components with:
 * - Proper input types (tel, email, url, number)
 * - Enhanced validation feedback
 * - Touch-friendly layouts
 * - Floating labels
 * - Real-time validation
 * - Mobile-specific UX patterns
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
// Import types and utilities (will be resolved when workspace is ready)
// import { useMobileViewport } from '../utils/mobileViewportManager';
// import { getSecurityService, ValidationRules } from '../services/securityService';

// Temporary mock implementations for development
const useMobileViewport = () => ({
  isMobile: window.innerWidth <= 768,
  scrollIntoView: (element: HTMLElement, _options: any) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

const getSecurityService = () => ({
  validateInput: (_value: string, _rules: any) => ({ isValid: true, errors: [] })
});

const ValidationRules = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 254 },
  password: { required: true, minLength: 8, maxLength: 128 },
  username: { required: true, minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
  post: { required: true, minLength: 1, maxLength: 2000 },
  comment: { required: true, minLength: 1, maxLength: 500 }
};

// Enhanced input type detection for mobile keyboards
const INPUT_TYPES = {
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
  tel: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  url: { type: 'url', inputMode: 'url', autoComplete: 'url' },
  number: { type: 'number', inputMode: 'numeric', autoComplete: 'off' },
  password: { type: 'password', inputMode: 'text', autoComplete: 'current-password' },
  newPassword: { type: 'password', inputMode: 'text', autoComplete: 'new-password' },
  text: { type: 'text', inputMode: 'text', autoComplete: 'off' },
  search: { type: 'search', inputMode: 'search', autoComplete: 'off' },
  name: { type: 'text', inputMode: 'text', autoComplete: 'name' },
  username: { type: 'text', inputMode: 'text', autoComplete: 'username' },
  date: { type: 'date', inputMode: 'none', autoComplete: 'bday' },
  time: { type: 'time', inputMode: 'none', autoComplete: 'off' },
} as const;

type InputTypeKey = keyof typeof INPUT_TYPES;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface MobileFormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  inputType?: InputTypeKey;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean | string;
  };
  helpText?: string;
  floatingLabel?: boolean;
  formatValue?: (value: string) => string;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showValidationIcon?: boolean;
  autoFormat?: boolean;
  containerClassName?: string;
}

export const MobileFormInput: React.FC<MobileFormInputProps> = ({
  label,
  inputType = 'text',
  validation,
  helpText,
  floatingLabel = true,
  formatValue,
  onValidationChange,
  showValidationIcon = true,
  autoFormat = true,
  containerClassName = '',
  className = '',
  value,
  onChange,
  onBlur,
  onFocus,
  ...rest
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const viewport = useMobileViewport();
  const securityService = getSecurityService();

  // Generate unique IDs
  const inputId = rest.id || `mobile-input-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  // Get input configuration
  const inputConfig = INPUT_TYPES[inputType];

  // Auto-formatting functions
  const formatters = {
    tel: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
      return cleaned;
    },
    number: (value: string) => {
      return value.replace(/[^\d.-]/g, '');
    },
    email: (value: string) => value.toLowerCase().trim(),
    url: (value: string) => {
      const trimmed = value.trim();
      if (trimmed && !trimmed.startsWith('http')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    },
  };

  // Validation function
  const validateInput = useCallback((value: string): ValidationResult => {
    if (!validation) return { isValid: true, errors: [] };

    const errors: string[] = [];

    // Required validation
    if (validation.required && !value.trim()) {
      errors.push(`${label} is required`);
    }

    if (value.trim()) {
      // Length validations
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${label} must be at least ${validation.minLength} characters`);
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`${label} must be no more than ${validation.maxLength} characters`);
      }

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(value)) {
        const patternMessages: Record<string, string> = {
          email: 'Please enter a valid email address',
          tel: 'Please enter a valid phone number',
          url: 'Please enter a valid URL',
        };
        errors.push(patternMessages[inputType] || `${label} format is invalid`);
      }

      // Security validation
      const securityResult = securityService.validateInput(value, {
        required: validation.required,
        minLength: validation.minLength,
        maxLength: validation.maxLength,
        pattern: validation.pattern,
      });

      if (!securityResult.isValid) {
        errors.push(...securityResult.errors);
      }

      // Custom validation
      if (validation.custom) {
        const customResult = validation.custom(value);
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else if (!customResult) {
          errors.push(`${label} is invalid`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [validation, label, inputType, securityService]);

  // Debounced validation
  useEffect(() => {
    if (!isTouched) return;

    const timeoutId = setTimeout(() => {
      setIsValidating(true);
      const result = validateInput(localValue as string);
      setValidationResult(result);
      onValidationChange?.(result.isValid, result.errors);
      setIsValidating(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue, isTouched, validateInput, onValidationChange]);

  // Handle value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Auto-format if enabled
    if (autoFormat && formatters[inputType as keyof typeof formatters]) {
      newValue = formatters[inputType as keyof typeof formatters](newValue);
    }

    // Apply custom formatter
    if (formatValue) {
      newValue = formatValue(newValue);
    }

    setLocalValue(newValue);
    
    // Create synthetic event with formatted value
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: newValue },
    };
    
    onChange?.(syntheticEvent);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Mobile viewport handling
    if (viewport.isMobile) {
      setTimeout(() => {
        viewport.scrollIntoView(inputRef.current!, {
          behavior: 'smooth',
          block: 'center',
          respectKeyboard: true,
          offset: 20,
        });
      }, 300);
    }

    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    
    // Final validation on blur
    const result = validateInput(e.target.value);
    setValidationResult(result);
    onValidationChange?.(result.isValid, result.errors);

    onBlur?.(e);
  };

  // Determine input state classes
  const hasValue = localValue && localValue.toString().length > 0;
  const showFloatingLabel = floatingLabel && (isFocused || hasValue);
  const hasErrors = isTouched && !validationResult.isValid;

  const containerClasses = [
    'mobile-form-input-container',
    floatingLabel ? 'floating-label' : '',
    hasErrors ? 'error' : '',
    validationResult.isValid && isTouched ? 'valid' : '',
    isFocused ? 'focused' : '',
    containerClassName,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'mobile-form-input',
    className,
    hasErrors ? 'error' : '',
    validationResult.isValid && isTouched ? 'valid' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="mobile-input-wrapper">
        <input
          ref={inputRef}
          id={inputId}
          className={inputClasses}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={hasErrors}
          aria-describedby={[
            hasErrors ? errorId : '',
            helpText ? helpId : '',
          ].filter(Boolean).join(' ') || undefined}
          style={{
            fontSize: '16px', // Prevent zoom on iOS
          }}
          {...inputConfig}
          {...rest}
        />
        
        {floatingLabel ? (
          <label 
            htmlFor={inputId}
            className={`mobile-floating-label ${showFloatingLabel ? 'active' : ''}`}
          >
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        ) : (
          <label htmlFor={inputId} className="mobile-static-label">
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        )}

        {/* Validation Icon */}
        {showValidationIcon && isTouched && (
          <div className="mobile-validation-icon">
            {isValidating ? (
              <div className="validation-spinner" />
            ) : validationResult.isValid ? (
              <div className="validation-success">✓</div>
            ) : (
              <div className="validation-error">⚠</div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="mobile-input-help">
          {helpText}
        </div>
      )}

      {/* Error Messages */}
      {hasErrors && (
        <div id={errorId} className="mobile-input-errors" role="alert">
          {validationResult.errors.map((error, index) => (
            <div key={index} className="mobile-input-error">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced TextArea component for mobile
interface MobileFormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => boolean | string;
  };
  helpText?: string;
  floatingLabel?: boolean;
  showCharacterCount?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  autoResize?: boolean;
  containerClassName?: string;
}

export const MobileFormTextArea: React.FC<MobileFormTextAreaProps> = ({
  label,
  validation,
  helpText,
  floatingLabel = true,
  showCharacterCount = true,
  onValidationChange,
  autoResize = true,
  containerClassName = '',
  className = '',
  value,
  onChange,
  onBlur,
  onFocus,
  maxLength,
  ...rest
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const viewport = useMobileViewport();
  const securityService = getSecurityService();

  const inputId = rest.id || `mobile-textarea-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [autoResize]);

  useEffect(() => {
    adjustHeight();
  }, [localValue, adjustHeight]);

  // Validation function
  const validateTextArea = useCallback((value: string): ValidationResult => {
    if (!validation) return { isValid: true, errors: [] };

    const errors: string[] = [];

    if (validation.required && !value.trim()) {
      errors.push(`${label} is required`);
    }

    if (value.trim()) {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${label} must be at least ${validation.minLength} characters`);
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`${label} must be no more than ${validation.maxLength} characters`);
      }

      // Security validation
      const securityResult = securityService.validateInput(value, {
        required: validation.required,
        minLength: validation.minLength,
        maxLength: validation.maxLength,
      });

      if (!securityResult.isValid) {
        errors.push(...securityResult.errors);
      }

      if (validation.custom) {
        const customResult = validation.custom(value);
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else if (!customResult) {
          errors.push(`${label} is invalid`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [validation, label, securityService]);

  // Debounced validation
  useEffect(() => {
    if (!isTouched) return;

    const timeoutId = setTimeout(() => {
      const result = validateTextArea(localValue as string);
      setValidationResult(result);
      onValidationChange?.(result.isValid, result.errors);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue, isTouched, validateTextArea, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    
    if (viewport.isMobile) {
      setTimeout(() => {
        viewport.scrollIntoView(textareaRef.current!, {
          behavior: 'smooth',
          block: 'center',
          respectKeyboard: true,
          offset: 20,
        });
      }, 300);
    }

    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    
    const result = validateTextArea(e.target.value);
    setValidationResult(result);
    onValidationChange?.(result.isValid, result.errors);

    onBlur?.(e);
  };

  const hasValue = localValue && localValue.toString().length > 0;
  const showFloatingLabel = floatingLabel && (isFocused || hasValue);
  const hasErrors = isTouched && !validationResult.isValid;
  const characterCount = (localValue as string).length;

  const containerClasses = [
    'mobile-form-textarea-container',
    floatingLabel ? 'floating-label' : '',
    hasErrors ? 'error' : '',
    validationResult.isValid && isTouched ? 'valid' : '',
    isFocused ? 'focused' : '',
    containerClassName,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="mobile-textarea-wrapper">
        <textarea
          ref={textareaRef}
          id={inputId}
          className={`mobile-form-textarea ${className}`}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={hasErrors}
          aria-describedby={[
            hasErrors ? errorId : '',
            helpText ? helpId : '',
          ].filter(Boolean).join(' ') || undefined}
          style={{
            fontSize: '16px', // Prevent zoom on iOS
            minHeight: autoResize ? '44px' : undefined,
          }}
          maxLength={maxLength}
          {...rest}
        />
        
        {floatingLabel ? (
          <label 
            htmlFor={inputId}
            className={`mobile-floating-label ${showFloatingLabel ? 'active' : ''}`}
          >
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        ) : (
          <label htmlFor={inputId} className="mobile-static-label">
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        )}
      </div>

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="mobile-character-count">
          <span className={characterCount > maxLength * 0.9 ? 'warning' : ''}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="mobile-input-help">
          {helpText}
        </div>
      )}

      {/* Error Messages */}
      {hasErrors && (
        <div id={errorId} className="mobile-input-errors" role="alert">
          {validationResult.errors.map((error, index) => (
            <div key={index} className="mobile-input-error">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Select component for mobile
interface MobileFormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    required?: boolean;
  };
  helpText?: string;
  floatingLabel?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  containerClassName?: string;
}

export const MobileFormSelect: React.FC<MobileFormSelectProps> = ({
  label,
  options,
  validation,
  helpText,
  floatingLabel = true,
  onValidationChange,
  containerClassName = '',
  className = '',
  value,
  onChange,
  onBlur,
  onFocus,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] });

  const selectRef = useRef<HTMLSelectElement>(null);

  const inputId = rest.id || `mobile-select-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const validateSelect = useCallback((value: string): ValidationResult => {
    if (!validation) return { isValid: true, errors: [] };

    const errors: string[] = [];

    if (validation.required && (!value || value === '')) {
      errors.push(`${label} is required`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [validation, label]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e);
    
    if (isTouched) {
      const result = validateSelect(e.target.value);
      setValidationResult(result);
      onValidationChange?.(result.isValid, result.errors);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    
    const result = validateSelect(e.target.value);
    setValidationResult(result);
    onValidationChange?.(result.isValid, result.errors);

    onBlur?.(e);
  };

  const hasValue = value && value !== '';
  const showFloatingLabel = floatingLabel && (isFocused || hasValue);
  const hasErrors = isTouched && !validationResult.isValid;

  const containerClasses = [
    'mobile-form-select-container',
    floatingLabel ? 'floating-label' : '',
    hasErrors ? 'error' : '',
    validationResult.isValid && isTouched ? 'valid' : '',
    isFocused ? 'focused' : '',
    containerClassName,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="mobile-select-wrapper">
        <select
          ref={selectRef}
          id={inputId}
          className={`mobile-form-select ${className}`}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={hasErrors}
          aria-describedby={[
            hasErrors ? errorId : '',
            helpText ? helpId : '',
          ].filter(Boolean).join(' ') || undefined}
          style={{
            fontSize: '16px', // Prevent zoom on iOS
          }}
          {...rest}
        >
          <option value="" disabled>
            Select {label.toLowerCase()}...
          </option>
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {floatingLabel ? (
          <label 
            htmlFor={inputId}
            className={`mobile-floating-label ${showFloatingLabel ? 'active' : ''}`}
          >
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        ) : (
          <label htmlFor={inputId} className="mobile-static-label">
            {label}
            {validation?.required && <span className="required-asterisk"> *</span>}
          </label>
        )}

        <div className="mobile-select-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 9L1 4h10z"/>
          </svg>
        </div>
      </div>

      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="mobile-input-help">
          {helpText}
        </div>
      )}

      {/* Error Messages */}
      {hasErrors && (
        <div id={errorId} className="mobile-input-errors" role="alert">
          {validationResult.errors.map((error, index) => (
            <div key={index} className="mobile-input-error">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Form container with validation state management
interface MobileFormContainerProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  autoValidate?: boolean;
}

export const MobileFormContainer: React.FC<MobileFormContainerProps> = ({
  children,
  onSubmit,
  onValidationChange,
  className = '',
  autoValidate = true,
}) => {
  const [fieldValidations, setFieldValidations] = useState<Map<string, boolean>>(new Map());
  const formRef = useRef<HTMLFormElement>(null);

  const handleFieldValidation = useCallback((fieldId: string, isValid: boolean) => {
    setFieldValidations(prev => {
      const newMap = new Map(prev);
      newMap.set(fieldId, isValid);
      return newMap;
    });
  }, []);

  // Check overall form validity
  useEffect(() => {
    if (autoValidate && onValidationChange) {
      const allValid = Array.from(fieldValidations.values()).every(valid => valid);
      onValidationChange(allValid && fieldValidations.size > 0);
    }
  }, [fieldValidations, autoValidate, onValidationChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Blur active input to trigger final validation
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
      activeElement.blur();
    }

    // Small delay to allow validation to complete
    setTimeout(() => {
      onSubmit?.(e);
    }, 100);
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className={`mobile-form-container ${className}`}
      noValidate
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && 
            (child.type === MobileFormInput || 
             child.type === MobileFormTextArea || 
             child.type === MobileFormSelect)) {
          
          const fieldId = child.props.id || `field-${Math.random().toString(36).substring(2, 9)}`;
          
          return React.cloneElement(child, {
            ...child.props,
            id: fieldId,
            onValidationChange: (isValid: boolean, errors: string[]) => {
              handleFieldValidation(fieldId, isValid);
              child.props.onValidationChange?.(isValid, errors);
            },
          });
        }
        return child;
      })}
    </form>
  );
};

// Pre-configured validation rules
export const MobileFormValidation = {
  email: {
    required: true,
    pattern: ValidationRules.email.pattern,
    maxLength: ValidationRules.email.maxLength,
  },
  password: {
    required: true,
    minLength: ValidationRules.password.minLength,
    maxLength: ValidationRules.password.maxLength,
  },
  username: {
    required: true,
    minLength: ValidationRules.username.minLength,
    maxLength: ValidationRules.username.maxLength,
    pattern: ValidationRules.username.pattern,
  },
  post: {
    required: true,
    minLength: ValidationRules.post.minLength,
    maxLength: ValidationRules.post.maxLength,
  },
  comment: {
    required: true,
    minLength: ValidationRules.comment.minLength,
    maxLength: ValidationRules.comment.maxLength,
  },
  tel: {
    required: true,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
  },
  url: {
    required: false,
    pattern: /^https?:\/\/.+\..+/,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-'\.]+$/,
  },
};

// Named export for the full object (for existing imports)
export const MobileFormComponentsBundle = {
  MobileFormInput,
  MobileFormTextArea,
  MobileFormSelect,
  MobileFormContainer,
  MobileFormValidation,
};

// Export the main container component as default for lazy loading
export default MobileFormContainer;
