import React from 'react';

// Simple alert triangle icon component
const AlertTriangleIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17 .01 0"/>
  </svg>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  showRetry = true,
  className = "",
  isRetrying = false
}) => {
  return (
    <div className={`error-state ${className}`} role="alert" aria-live="polite">
      <div className="error-state-icon" aria-hidden="true">
        <AlertTriangleIcon />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      {showRetry && onRetry && (
        <div className="error-state-actions">
          <button 
            className="retry-button"
            onClick={onRetry}
            disabled={isRetrying}
            aria-label="Retry the previous action"
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
