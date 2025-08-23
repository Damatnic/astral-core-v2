/**
 * Mobile Form State Management Hook
 * 
 * Comprehensive form state management with:
 * - Real-time validation
 * - Field state tracking
 * - Form submission handling
 * - Mobile-specific optimizations
 */

import { useState, useCallback, useRef } from 'react';

export interface FormField {
  value: string;
  isValid: boolean;
  errors: string[];
  isTouched: boolean;
  isValidating: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export interface UseFormOptions {
  initialValues?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => Promise<void> | void;
  onFieldChange?: (fieldName: string, value: string) => void;
}

export const useMobileForm = (options: UseFormOptions = {}) => {
  const {
    initialValues = {},
    onSubmit,
    onFieldChange,
  } = options;

  const [formState, setFormState] = useState<FormState>(() => {
    const fields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      fields[key] = {
        value: initialValues[key] || '',
        isValid: true,
        errors: [],
        isTouched: false,
        isValidating: false,
      };
    });

    return {
      fields,
      isValid: true,
      isSubmitting: false,
      submitCount: 0,
    };
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Update field value
  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          value,
        },
      },
    }));

    onFieldChange?.(fieldName, value);
  }, [onFieldChange]);

  // Update field validation state
  const setFieldValidation = useCallback((
    fieldName: string, 
    isValid: boolean, 
    errors: string[] = []
  ) => {
    setFormState(prev => {
      const newFields = {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          isValid,
          errors,
          isValidating: false,
        },
      };

      // Calculate overall form validity
      const allValid = Object.values(newFields).every(field => field.isValid);

      return {
        ...prev,
        fields: newFields,
        isValid: allValid,
      };
    });
  }, []);

  // Mark field as touched
  const setFieldTouched = useCallback((fieldName: string, touched = true) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          isTouched: touched,
        },
      },
    }));
  }, []);

  // Set field validating state
  const setFieldValidating = useCallback((fieldName: string, validating = true) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          isValidating: validating,
        },
      },
    }));
  }, []);

  // Get field props for form components
  const getFieldProps = useCallback((fieldName: string) => {
    const field = formState.fields[fieldName] || {
      value: '',
      isValid: true,
      errors: [],
      isTouched: false,
      isValidating: false,
    };

    return {
      value: field.value,
      error: field.isTouched && !field.isValid ? field.errors[0] : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: () => {
        setFieldTouched(fieldName, true);
      },
      onValidationChange: (isValid: boolean, errors: string[]) => {
        setFieldValidation(fieldName, isValid, errors);
      },
    };
  }, [formState.fields, setFieldValue, setFieldTouched, setFieldValidation]);

  // Reset form
  const resetForm = useCallback(() => {
    const fields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      fields[key] = {
        value: initialValues[key] || '',
        isValid: true,
        errors: [],
        isTouched: false,
        isValidating: false,
      };
    });

    setFormState({
      fields,
      isValid: true,
      isSubmitting: false,
      submitCount: 0,
    });
  }, [initialValues]);

  // Submit form
  const submitForm = useCallback(async () => {
    if (!onSubmit || formState.isSubmitting) return;

    // Mark all fields as touched to show validation errors
    const touchedFields = { ...formState.fields };
    Object.keys(touchedFields).forEach(key => {
      touchedFields[key] = { ...touchedFields[key], isTouched: true };
    });

    setFormState(prev => ({
      ...prev,
      fields: touchedFields,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    try {
      // Get form values
      const values: Record<string, string> = {};
      Object.keys(formState.fields).forEach(key => {
        values[key] = formState.fields[key].value;
      });

      // Only submit if form is valid
      if (formState.isValid) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [onSubmit, formState]);

  // Handle form submit event
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  }, [submitForm]);

  // Get all form values
  const getValues = useCallback(() => {
    const values: Record<string, string> = {};
    Object.keys(formState.fields).forEach(key => {
      values[key] = formState.fields[key].value;
    });
    return values;
  }, [formState.fields]);

  // Get form errors
  const getErrors = useCallback(() => {
    const errors: Record<string, string[]> = {};
    Object.keys(formState.fields).forEach(key => {
      const field = formState.fields[key];
      if (field.isTouched && !field.isValid) {
        errors[key] = field.errors;
      }
    });
    return errors;
  }, [formState.fields]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string) => {
    const field = formState.fields[fieldName];
    return field ? field.isTouched && !field.isValid : false;
  }, [formState.fields]);

  // Get field error message
  const getFieldError = useCallback((fieldName: string) => {
    const field = formState.fields[fieldName];
    if (field && field.isTouched && !field.isValid && field.errors.length > 0) {
      return field.errors[0];
    }
    return undefined;
  }, [formState.fields]);

  return {
    // Form state
    formState,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,

    // Field management
    setFieldValue,
    setFieldValidation,
    setFieldTouched,
    setFieldValidating,
    getFieldProps,

    // Form actions
    resetForm,
    submitForm,
    handleSubmit,

    // Getters
    getValues,
    getErrors,
    hasFieldError,
    getFieldError,

    // Form ref
    formRef,
  };
};

// Validation helpers
export const createMobileFormValidator = (rules: Record<string, any>) => {
  return (fieldName: string, value: string) => {
    const rule = rules[fieldName];
    if (!rule) return { isValid: true, errors: [] };

    const errors: string[] = [];

    // Required validation
    if (rule.required && !value.trim()) {
      errors.push(`${fieldName} is required`);
    }

    if (value.trim()) {
      // Length validations
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} must be no more than ${rule.maxLength} characters`);
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || `${fieldName} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else if (!customResult) {
          errors.push(`${fieldName} is invalid`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

// Common validation patterns
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
    maxLength: 254,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      return true;
    },
  },
  confirmPassword: (passwordField: string) => ({
    required: true,
    custom: (value: string, formValues: Record<string, string>) => {
      if (value !== formValues[passwordField]) {
        return 'Passwords do not match';
      }
      return true;
    },
  }),
  phone: {
    required: false,
    pattern: /^[+]?[1-9][\d\s\-\(\)]{8,15}$/,
    message: 'Please enter a valid phone number',
  },
  url: {
    required: false,
    pattern: /^https?:\/\/.+\..+/,
    message: 'Please enter a valid URL (including http:// or https://)',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-'.]+$/,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username can only contain letters, numbers, and underscores',
  },
  zipCode: {
    required: false,
    pattern: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid ZIP code',
  },
  creditCard: {
    required: true,
    pattern: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
    message: 'Please enter a valid credit card number',
  },
};

export default useMobileForm;
