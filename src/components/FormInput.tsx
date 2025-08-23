import React, { useState, useRef, useEffect } from 'react';
import { useFormAnimations } from '../hooks/useAnimations';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface FormInputProps {
  id: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  validationRules?: ValidationRule[];
  realTimeValidation?: boolean;
  showCharacterCount?: boolean;
  floatingLabel?: boolean;
  helpText?: string;
  className?: string;
  'aria-describedby'?: string;
}

// Validation helper functions
const validateRequired = (value: string, required: boolean): { isValid: boolean; message: string } => {
  if (required && !value.trim()) {
    return { isValid: false, message: 'This field is required' };
  }
  return { isValid: true, message: '' };
};

const validateLength = (value: string, minLength?: number, maxLength?: number): { isValid: boolean; message: string } => {
  if (minLength && value.length < minLength && value.length > 0) {
    return { isValid: false, message: `Minimum ${minLength} characters required` };
  }
  if (maxLength && value.length > maxLength) {
    return { isValid: false, message: `Maximum ${maxLength} characters allowed` };
  }
  return { isValid: true, message: '' };
};

const validatePattern = (value: string, pattern?: string): { isValid: boolean; message: string } => {
  if (pattern && value && !new RegExp(pattern).test(value)) {
    return { isValid: false, message: 'Please enter a valid format' };
  }
  return { isValid: true, message: '' };
};

const validateEmail = (value: string): { isValid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

const validateCustomRules = (value: string, rules: ValidationRule[]): { isValid: boolean; message: string } => {
  for (const rule of rules) {
    if (value && !rule.test(value)) {
      return { isValid: false, message: rule.message };
    }
  }
  return { isValid: true, message: '' };
};

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  validationRules = [],
  realTimeValidation = false,
  showCharacterCount = false,
  floatingLabel = false,
  helpText,
  className = '',
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { showFieldError, showFieldSuccess, clearFieldState } = useFormAnimations();

  const hasValue = value.length > 0;
  const shouldShowValidation = isTouched || (realTimeValidation && hasValue);

  // Validate input with reduced complexity
  const validateInput = (inputValue: string): { isValid: boolean; message: string; state: typeof validationState } => {
    if (!shouldShowValidation) {
      return { isValid: true, message: '', state: 'idle' };
    }

    // Run all validations
    const requiredResult = validateRequired(inputValue, required);
    if (!requiredResult.isValid) {
      return { ...requiredResult, state: 'error' };
    }

    const lengthResult = validateLength(inputValue, minLength, maxLength);
    if (!lengthResult.isValid) {
      return { ...lengthResult, state: 'error' };
    }

    const patternResult = validatePattern(inputValue, pattern);
    if (!patternResult.isValid) {
      return { ...patternResult, state: 'error' };
    }

    if (type === 'email') {
      const emailResult = validateEmail(inputValue);
      if (!emailResult.isValid) {
        return { ...emailResult, state: 'error' };
      }
    }

    const customRulesResult = validateCustomRules(inputValue, validationRules);
    if (!customRulesResult.isValid) {
      return { ...customRulesResult, state: 'error' };
    }

    // Success state
    if (inputValue && (required || validationRules.length > 0)) {
      return { isValid: true, message: 'Looks good!', state: 'success' };
    }

    return { isValid: true, message: '', state: 'idle' };
  };

  // Update validation on value change
  useEffect(() => {
    const validation = validateInput(value);
    setValidationState(validation.state);
    setValidationMessage(validation.message);

    if (validation.state === 'error') {
      showFieldError(id, validation.message);
    } else if (validation.state === 'success') {
      showFieldSuccess(id);
    } else {
      clearFieldState(id);
    }
  }, [value, isTouched, realTimeValidation, id, showFieldError, showFieldSuccess, clearFieldState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setIsTouched(true);
    onBlur?.();
  };

  // Character count calculations
  const charactersUsed = value.length;
  const isNearLimit = Boolean(maxLength && charactersUsed > maxLength * 0.8);
  const isOverLimit = Boolean(maxLength && charactersUsed > maxLength);

  // CSS classes with therapeutic design
  const formGroupClasses = [
    'form-group',
    'smooth-transition',
    validationState !== 'idle' ? validationState : '',
    floatingLabel ? 'floating-label' : '',
    hasValue ? 'has-value' : '',
    label ? 'has-label' : '',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'glass-input',
    'form-input',
    'enhanced-input',
    'smooth-transition'
  ].filter(Boolean).join(' ');

  // Unique IDs for accessibility
  const messageId = `${id}-message`;
  const helpTextId = `${id}-help`;
  const counterId = `${id}-counter`;

  const describedBy = [
    ariaDescribedBy,
    validationMessage ? messageId : null,
    helpText ? helpTextId : null,
    showCharacterCount && maxLength ? counterId : null
  ].filter(Boolean).join(' ');

  return (
    <FormInputWrapper
      formGroupClasses={formGroupClasses}
      id={id}
      label={label}
      floatingLabel={floatingLabel}
      required={required}
      inputRef={inputRef}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={floatingLabel ? ' ' : placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      inputClasses={inputClasses}
      describedBy={describedBy}
      validationState={validationState}
      helpText={helpText}
      helpTextId={helpTextId}
      validationMessage={validationMessage}
      messageId={messageId}
      showCharacterCount={showCharacterCount}
      counterId={counterId}
      charactersUsed={charactersUsed}
      isNearLimit={isNearLimit}
      isOverLimit={isOverLimit}
    />
  );
};

// Wrapper component to reduce complexity
interface FormInputWrapperProps {
  formGroupClasses: string;
  id: string;
  label?: string;
  floatingLabel: boolean;
  required: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  disabled: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  inputClasses: string;
  describedBy: string;
  validationState: 'idle' | 'success' | 'error' | 'warning';
  helpText?: string;
  helpTextId: string;
  validationMessage: string;
  messageId: string;
  showCharacterCount: boolean;
  counterId: string;
  charactersUsed: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
}

const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  formGroupClasses,
  id,
  label,
  floatingLabel,
  required,
  inputRef,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  inputClasses,
  describedBy,
  validationState,
  helpText,
  helpTextId,
  validationMessage,
  messageId,
  showCharacterCount,
  counterId,
  charactersUsed,
  isNearLimit,
  isOverLimit,
}) => {
  return (
    <div className={formGroupClasses}>
      {/* Label (non-floating) */}
      {label && !floatingLabel && (
        <label htmlFor={id} className={required ? 'form-label required' : 'form-label'}>
          {label}
        </label>
      )}

      {/* Input container with glass morphism */}
      <div className="form-input-container smooth-transition">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
          aria-describedby={describedBy || undefined}
          aria-invalid={validationState === 'error'}
        />

        {/* Floating label */}
        {label && floatingLabel && (
          <label htmlFor={id} className={required ? 'form-label required' : 'form-label'}>
            {label}
          </label>
        )}

        {/* Validation icon with animation */}
        <div className="animate-breathe">
          <ValidationIcon validationState={validationState} />
        </div>
      </div>

      {/* Help text with glass styling */}
      {helpText && (
        <div id={helpTextId} className="form-message info show glass-card smooth-transition">
          <div className="form-message-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="form-message-text">{helpText}</span>
        </div>
      )}

      {/* Validation message */}
      <ValidationMessage
        validationMessage={validationMessage}
        messageId={messageId}
        validationState={validationState}
      />

      {/* Character count */}
      <CharacterCount
        showCharacterCount={showCharacterCount}
        maxLength={maxLength}
        counterId={counterId}
        charactersUsed={charactersUsed}
        isNearLimit={isNearLimit}
        isOverLimit={isOverLimit}
      />
    </div>
  );
};

// Sub-components to reduce complexity
const ValidationIcon: React.FC<{ validationState: string }> = ({ validationState }) => {
  if (validationState === 'idle') return null;

  return (
    <div className="form-validation-icon">
      {validationState === 'success' && (
        <svg className="success-checkmark" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {validationState === 'error' && (
        <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {validationState === 'warning' && (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
};

interface ValidationMessageProps {
  validationMessage: string;
  messageId: string;
  validationState: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  validationMessage,
  messageId,
  validationState,
}) => {
  if (!validationMessage) return null;

  return (
    <div id={messageId} className={`form-message ${validationState} show glass-card smooth-transition animate-float`} role="alert">
      <div className="form-message-icon">
        {validationState === 'success' && (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {validationState === 'error' && (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="form-message-text">{validationMessage}</span>
    </div>
  );
};

interface CharacterCountProps {
  showCharacterCount: boolean;
  maxLength?: number;
  counterId: string;
  charactersUsed: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
}

const CharacterCount: React.FC<CharacterCountProps> = ({
  showCharacterCount,
  maxLength,
  counterId,
  charactersUsed,
  isNearLimit,
  isOverLimit,
}) => {
  if (!showCharacterCount || !maxLength) return null;

  const charactersRemaining = maxLength - charactersUsed;

  return (
    <div 
      id={counterId}
      className={[
        'form-character-count',
        'glass-card',
        'smooth-transition',
        isNearLimit && 'near-limit animate-glow',
        isOverLimit && 'over-limit animate-breathe'
      ].filter(Boolean).join(' ')}
    >
      <span>{charactersUsed}/{maxLength} characters</span>
      <span>{charactersRemaining} remaining</span>
    </div>
  );
};

export default FormInput;
