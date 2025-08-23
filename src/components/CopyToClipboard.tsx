import React, { useState, useRef, useCallback } from 'react';
import { CheckIcon, CopyIcon } from './icons.dynamic';
import './CopyToClipboard.css';

interface CopyToClipboardProps {
  /** Text content to copy */
  text: string;
  /** Child content to render (optional) */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Callback when copy succeeds/fails */
  onCopy?: (text: string, success: boolean) => void;
  /** Timeout for success message */
  timeout?: number;
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon-only';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Custom button text */
  buttonText?: string;
  /** Show visual feedback */
  showFeedback?: boolean;
  /** Disable the copy functionality */
  disabled?: boolean;
  /** Truncate displayed text */
  truncateLength?: number;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  children,
  className = '',
  onCopy,
  timeout = 2000,
  successMessage = 'Copied!',
  errorMessage = 'Failed to copy',
  variant = 'secondary',
  size = 'md',
  buttonText = 'Copy',
  showFeedback = true,
  disabled = false,
  truncateLength
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const truncateText = useCallback((str: string, length?: number): string => {
    if (!length || str.length <= length) return str;
    return `${str.substring(0, length)}...`;
  }, []);

  const resetCopyState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopyState('idle');
    }, timeout);
  }, [timeout]);

  const handleCopyClick = useCallback(async () => {
    if (disabled || copyState === 'copying') return;

    setCopyState('copying');

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopyState('success');
      onCopy?.(text, true);
      
      // Announce success to screen readers
      if (showFeedback) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `${successMessage} "${truncateText(text, 50)}"`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }

      resetCopyState();
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopyState('error');
      onCopy?.(text, false);
      
      // Announce error to screen readers
      if (showFeedback) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = errorMessage;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }

      resetCopyState();
    }
  }, [text, disabled, copyState, onCopy, successMessage, errorMessage, showFeedback, resetCopyState, truncateText]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCopyClick();
    }
  }, [handleCopyClick]);

  const isLoading = copyState === 'copying';
  const isSuccess = copyState === 'success';
  const isError = copyState === 'error';

  const baseClasses = [
    'copy-to-clipboard',
    `copy-to-clipboard--${variant}`,
    `copy-to-clipboard--${size}`,
    isLoading && 'copy-to-clipboard--loading',
    isSuccess && 'copy-to-clipboard--success',
    isError && 'copy-to-clipboard--error',
    disabled && 'copy-to-clipboard--disabled'
  ].filter(Boolean).join(' ');

  const displayText = truncateLength ? truncateText(text, truncateLength) : text;

  if (children) {
    return (
      <div className={`copy-to-clipboard-wrapper ${className}`}>
        {children}
        <button
          ref={buttonRef}
          type="button"
          className={baseClasses}
          onClick={handleCopyClick}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          aria-label={`Copy text: ${truncateText(text, 50)}`}
          aria-describedby={showFeedback ? 'copy-feedback' : undefined}
          data-copy-state={copyState}
        >
          {isLoading ? (
            <span className="copy-to-clipboard__spinner" aria-hidden="true" />
          ) : isSuccess ? (
            <CheckIcon className="copy-to-clipboard__icon" aria-hidden="true" />
          ) : (
            <CopyIcon className="copy-to-clipboard__icon" aria-hidden="true" />
          )}
          <span className="copy-to-clipboard__text">
            {isLoading ? 'Copying...' : isSuccess ? successMessage : isError ? errorMessage : buttonText}
          </span>
        </button>
        {showFeedback && (
          <output 
            id="copy-feedback" 
            className="copy-to-clipboard__feedback"
            aria-live="polite"
            aria-atomic="true"
          >
            {isSuccess ? successMessage : isError ? errorMessage : ''}
          </output>
        )}
      </div>
    );
  }

  return (
    <div className={`copy-to-clipboard-container ${className}`}>
      <div className="copy-to-clipboard__text-display">
        <code className="copy-to-clipboard__code">{displayText}</code>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={baseClasses}
        onClick={handleCopyClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-label={`Copy text: ${truncateText(text, 50)}`}
        aria-describedby={showFeedback ? 'copy-feedback' : undefined}
        data-copy-state={copyState}
      >
        {isLoading ? (
          <span className="copy-to-clipboard__spinner" aria-hidden="true" />
        ) : isSuccess ? (
          <CheckIcon className="copy-to-clipboard__icon" aria-hidden="true" />
        ) : (
          <CopyIcon className="copy-to-clipboard__icon" aria-hidden="true" />
        )}
        <span className="copy-to-clipboard__text">
          {isLoading ? 'Copying...' : isSuccess ? successMessage : isError ? errorMessage : buttonText}
        </span>
      </button>
      {showFeedback && (
        <output 
          id="copy-feedback" 
          className="copy-to-clipboard__feedback"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSuccess ? successMessage : isError ? errorMessage : ''}
        </output>
      )}
    </div>
  );
};

export { CopyToClipboard };
export default CopyToClipboard;
