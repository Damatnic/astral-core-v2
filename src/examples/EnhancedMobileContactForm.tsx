/**
 * Enhanced Mobile Contact Form Example
 * 
 * Demonstrates comprehensive mobile form optimization with:
 * - Proper input types for mobile keyboards
 * - Real-time validation with visual feedback
 * - Touch-friendly design
 * - Accessibility compliance
 * - Progressive enhancement
 */

import React, { useState } from 'react';
import {
  MobileFormContainer,
  MobileFormInput,
  MobileFormTextArea,
  MobileFormSelect,
} from '../components/MobileFormComponents';
import { useMobileForm, commonValidationRules } from '../hooks/useMobileForm';
import { AppButton } from '../components/AppButton';

const CONTACT_SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Partnership Opportunity' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'sms', label: 'Text Message' },
];

export const EnhancedMobileContactForm: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    getFieldProps,
    isValid,
    isSubmitting,
    handleSubmit,
    resetForm,
    getValues,
  } = useMobileForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: '',
      priority: 'medium',
      contactMethod: 'email',
    },
    onSubmit: async (_values) => {
      try {
        setSubmitStatus('idle');
        setSubmitMessage('');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random success/failure for demo
        if (Math.random() > 0.2) {
          setSubmitStatus('success');
          setSubmitMessage('Thank you! Your message has been sent successfully.');
          resetForm();
        } else {
          throw new Error('Failed to send message. Please try again.');
        }
      } catch (error) {
        setSubmitStatus('error');
        setSubmitMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    },
  });

  const handleReset = () => {
    resetForm();
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  return (
    <div className="mobile-contact-form-wrapper">
      <div className="form-header">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <MobileFormContainer onSubmit={handleSubmit} className="mobile-contact-form">
        {/* Name Field */}
        <MobileFormInput
          label="Full Name"
          inputType="name"
          placeholder="Enter your full name"
          validation={commonValidationRules.name}
          helpText="Please enter your first and last name"
          autoComplete="name"
          {...getFieldProps('name')}
        />

        {/* Email Field */}
        <MobileFormInput
          label="Email Address"
          inputType="email"
          placeholder="Enter your email address"
          validation={commonValidationRules.email}
          helpText="We'll use this to respond to your message"
          autoComplete="email"
          {...getFieldProps('email')}
        />

        {/* Phone Field */}
        <MobileFormInput
          label="Phone Number"
          inputType="tel"
          placeholder="(555) 123-4567"
          validation={{
            required: false,
            pattern: /^[+]?[1-9][\d\s\-()]{8,15}$/,
            custom: (value: string) => {
              if (!value) return true; // Optional field
              const cleaned = value.replace(/\D/g, '');
              return cleaned.length >= 10 || 'Phone number must be at least 10 digits';
            },
          }}
          helpText="Optional - for urgent matters"
          autoComplete="tel"
          autoFormat={true}
          {...getFieldProps('phone')}
        />

        {/* Subject Dropdown */}
        <MobileFormSelect
          label="Subject"
          options={CONTACT_SUBJECTS}
          validation={{ required: true }}
          helpText="Choose the category that best describes your inquiry"
          {...getFieldProps('subject')}
        />

        {/* Priority Level */}
        <MobileFormSelect
          label="Priority Level"
          options={PRIORITY_OPTIONS}
          validation={{ required: true }}
          helpText="How urgent is your request?"
          {...getFieldProps('priority')}
        />

        {/* Preferred Contact Method */}
        <MobileFormSelect
          label="Preferred Contact Method"
          options={CONTACT_METHOD_OPTIONS}
          validation={{ required: true }}
          helpText="How would you like us to respond?"
          {...getFieldProps('contactMethod')}
        />

        {/* Message TextArea */}
        <MobileFormTextArea
          label="Message"
          placeholder="Please describe your inquiry in detail..."
          validation={{
            required: true,
            minLength: 20,
            maxLength: 2000,
            custom: (value: string) => {
              const wordCount = value.trim().split(/\s+/).length;
              return wordCount >= 5 || 'Please provide at least 5 words in your message';
            },
          }}
          helpText="Please provide as much detail as possible (minimum 20 characters)"
          maxLength={2000}
          rows={4}
          autoResize={true}
          showCharacterCount={true}
          {...getFieldProps('message')}
        />

        {/* Submit Status Message */}
        {submitMessage && (
          <div className={`submit-message ${submitStatus}`} role="alert">
            {submitStatus === 'success' && '✓ '}
            {submitStatus === 'error' && '⚠ '}
            {submitMessage}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <AppButton
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            className="submit-button"
            onClick={() => {}} // Submit is handled by form onSubmit
          >
            {isSubmitting ? 'Sending Message...' : 'Send Message'}
          </AppButton>

          <AppButton
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting}
            className="reset-button"
          >
            Reset Form
          </AppButton>
        </div>

        {/* Form Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="form-debug">
            <summary>Form Debug Info</summary>
            <pre>{JSON.stringify(getValues(), null, 2)}</pre>
            <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
            <p>Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
          </details>
        )}
      </MobileFormContainer>

      {/* Form Styling */}
      <style>{`
        .mobile-contact-form-wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .submit-message {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-weight: 600;
          text-align: center;
        }

        .submit-message.success {
          background: rgba(var(--success-color-rgb), 0.1);
          color: var(--success-color);
          border: 2px solid rgba(var(--success-color-rgb), 0.2);
        }

        .submit-message.error {
          background: rgba(var(--danger-color-rgb), 0.1);
          color: var(--danger-color);
          border: 2px solid rgba(var(--danger-color-rgb), 0.2);
        }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .submit-button {
          flex: 2;
          min-height: 48px;
          font-weight: 600;
        }

        .reset-button {
          flex: 1;
          min-height: 48px;
        }

        .form-debug {
          margin-top: 24px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .form-debug summary {
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-debug pre {
          background: var(--bg-tertiary);
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 11px;
        }

        /* Mobile-specific adjustments */
        @media (max-width: 768px) {
          .mobile-contact-form-wrapper {
            padding: 16px;
            border-radius: 12px;
            margin: 16px;
            max-width: calc(100vw - 32px);
          }

          .form-header h2 {
            font-size: 24px;
          }

          .form-header p {
            font-size: 14px;
          }

          .form-actions {
            flex-direction: column;
            gap: 12px;
          }

          .submit-button,
          .reset-button {
            flex: none;
          }
        }

        /* Small phone screens */
        @media (max-width: 374px) {
          .mobile-contact-form-wrapper {
            margin: 8px;
            padding: 12px;
            max-width: calc(100vw - 16px);
          }

          .form-header {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedMobileContactForm;
