import React, { forwardRef } from 'react';

export interface AppTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const AppTextArea = forwardRef<HTMLTextAreaElement, AppTextAreaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`form-textarea${error ? ' error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${textareaId}-error`} className="form-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${textareaId}-helper`} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
});

AppTextArea.displayName = 'AppTextArea';

export default AppTextArea;