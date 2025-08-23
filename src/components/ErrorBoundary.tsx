/**
 * Comprehensive Error Boundary System
 * 
 * Robust error handling for the Astral Core mental health platform
 * with specialized fallback UIs and crisis intervention priority.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';

// Simple icon components to avoid external dependencies
const AlertCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const HeartIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for specialized handling
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'validation'
  | 'crisis-intervention'
  | 'data-corruption'
  | 'ui-rendering'
  | 'service-worker'
  | 'unknown';

// Error boundary configuration
export interface ErrorBoundaryConfig {
  // Fallback component or function
  fallback?: React.ComponentType<ErrorFallbackProps> | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  
  // Error reporting configuration
  reportErrors?: boolean;
  reportingUrl?: string;
  includeErrorInfo?: boolean;
  includeStackTrace?: boolean;
  
  // Recovery options
  enableRetry?: boolean;
  maxRetries?: number;
  autoRetry?: boolean;
  retryDelay?: number;
  
  // Crisis intervention priority
  isCrisisContext?: boolean;
  crisisContactInfo?: {
    phone: string;
    text: string;
    chat: string;
  };
  
  // User experience
  showErrorDetails?: boolean;
  allowErrorDismiss?: boolean;
  redirectOnError?: string;
  
  // Development options
  isDevelopment?: boolean;
  logToConsole?: boolean;
}

// Error information for fallback components
export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetErrorBoundary: () => void;
  severity: ErrorSeverity;
  category: ErrorCategory;
  config: ErrorBoundaryConfig;
  retryCount: number;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
}

// Props for the error boundary component
interface ErrorBoundaryProps extends ErrorBoundaryConfig {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  onRetry?: (retryCount: number) => void;
  onReport?: (errorReport: ErrorReport) => void;
}

// Error report structure
interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: ErrorInfo;
  severity: ErrorSeverity;
  category: ErrorCategory;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  retryCount: number;
  context: {
    isCrisisContext: boolean;
    route: string;
    userState?: any;
  };
}

/**
 * Comprehensive Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      severity: 'low',
      category: 'unknown',
      timestamp: new Date()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const severity = ErrorBoundary.determineSeverity(error);
    const category = ErrorBoundary.categorizeError(error);
    
    return {
      hasError: true,
      error,
      errorId,
      severity,
      category,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report error if enabled
    if (this.props.reportErrors !== false) {
      this.reportError(error, errorInfo);
    }
    
    // Log to console in development
    if (this.props.isDevelopment || this.props.logToConsole) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // Call error callback
    this.props.onError?.(error, errorInfo, this.state.errorId);
    
    // Auto-retry if enabled
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
    
    // Special handling for crisis context
    if (this.props.isCrisisContext) {
      this.handleCrisisError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clean up retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  // Determine error severity based on error characteristics
  static determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Critical errors that affect crisis intervention
    if (
      message.includes('crisis') ||
      message.includes('emergency') ||
      message.includes('suicide') ||
      stack.includes('crisis')
    ) {
      return 'critical';
    }
    
    // High severity errors
    if (
      error.name === 'ChunkLoadError' ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('authentication') ||
      message.includes('unauthorized')
    ) {
      return 'high';
    }
    
    // Medium severity errors
    if (
      message.includes('validation') ||
      message.includes('parse') ||
      message.includes('timeout') ||
      error.name === 'TypeError'
    ) {
      return 'medium';
    }
    
    return 'low';
  }

  // Categorize error for specialized handling
  static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    if (message.includes('crisis') || message.includes('emergency')) {
      return 'crisis-intervention';
    }
    
    if (name.includes('chunkerror') || message.includes('loading')) {
      return 'network';
    }
    
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'authentication';
    }
    
    if (message.includes('validation') || message.includes('schema')) {
      return 'validation';
    }
    
    if (message.includes('serviceworker') || message.includes('sw')) {
      return 'service-worker';
    }
    
    if (name.includes('typeerror') || message.includes('render')) {
      return 'ui-rendering';
    }
    
    if (message.includes('corrupt') || message.includes('malformed')) {
      return 'data-corruption';
    }
    
    return 'unknown';
  }

  // Generate comprehensive error report
  private generateErrorReport(error: Error, errorInfo?: ErrorInfo): ErrorReport {
    return {
      id: this.state.errorId,
      timestamp: this.state.timestamp,
      error: {
        name: error.name,
        message: error.message,
        stack: this.props.includeStackTrace ? error.stack : undefined
      },
      errorInfo: this.props.includeErrorInfo ? errorInfo : undefined,
      severity: this.state.severity,
      category: this.state.category,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      context: {
        isCrisisContext: this.props.isCrisisContext || false,
        route: window.location.pathname,
        userState: this.props.isDevelopment ? {
          // Include additional context in development
          localStorage: Object.keys(localStorage).length,
          sessionStorage: Object.keys(sessionStorage).length,
          online: navigator.onLine
        } : undefined
      }
    };
  }

  // Report error to monitoring service
  private async reportError(error: Error, errorInfo?: ErrorInfo) {
    try {
      const report = this.generateErrorReport(error, errorInfo);
      
      // Call report callback
      this.props.onReport?.(report);
      
      // Send to reporting service if URL provided
      if (this.props.reportingUrl) {
        await fetch(this.props.reportingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report)
        });
      }
      
      // Store locally for offline reporting
      const localReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      localReports.push(report);
      localStorage.setItem('error_reports', JSON.stringify(localReports.slice(-10))); // Keep last 10
      
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  // Special handling for crisis context errors
  private handleCrisisError(error: Error, _errorInfo: ErrorInfo) {
    // Immediate notification for crisis errors
    console.error('CRISIS CONTEXT ERROR:', error.message);
    
    // Store crisis error for special handling
    localStorage.setItem('crisis_error', JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
      context: 'crisis_intervention'
    }));
    
    // Attempt to show crisis resources immediately
    if (this.props.crisisContactInfo) {
      // Could trigger immediate crisis resource modal
      window.dispatchEvent(new CustomEvent('crisis-error', {
        detail: this.props.crisisContactInfo
      }));
    }
  }

  // Schedule automatic retry
  private scheduleRetry() {
    const delay = this.props.retryDelay || (1000 * Math.pow(2, this.state.retryCount)); // Exponential backoff
    
    const timeout = setTimeout(() => {
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1
      }));
      this.resetErrorBoundary();
    }, delay);
    
    this.retryTimeouts.push(timeout);
  }

  // Reset error boundary state
  resetErrorBoundary = () => {
    this.props.onRetry?.(this.state.retryCount);
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  // Redirect to safe route
  private redirectToSafeRoute() {
    const safeRoute = this.props.redirectOnError || '/';
    window.location.href = safeRoute;
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const fallbackProps: ErrorFallbackProps = {
          error: this.state.error,
          errorInfo: this.state.errorInfo!,
          resetErrorBoundary: this.resetErrorBoundary,
          severity: this.state.severity,
          category: this.state.category,
          config: this.props,
          retryCount: this.state.retryCount
        };
        
        if (typeof this.props.fallback === 'function') {
          const fallbackFunction = this.props.fallback as (error: Error, errorInfo: ErrorInfo) => ReactNode;
          return fallbackFunction(this.state.error, this.state.errorInfo!);
        } else {
          const FallbackComponent = this.props.fallback as React.ComponentType<ErrorFallbackProps>;
          return <FallbackComponent {...fallbackProps} />;
        }
      }
      
      // Use default fallback based on severity and category
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  private renderDefaultFallback() {
    const { error, severity, category, retryCount } = this.state;
    const { enableRetry, maxRetries = 3, isCrisisContext, crisisContactInfo } = this.props;
    
    // Crisis context gets special treatment
    if (isCrisisContext || category === 'crisis-intervention') {
      return (
        <CrisisFallbackUI
          error={error!}
          onRetry={enableRetry ? this.resetErrorBoundary : undefined}
          retryCount={retryCount}
          maxRetries={maxRetries}
          crisisContactInfo={crisisContactInfo}
        />
      );
    }
    
    // High severity errors get prominent treatment
    if (severity === 'critical' || severity === 'high') {
      return (
        <HighSeverityFallbackUI
          category={category}
          onRetry={enableRetry ? this.resetErrorBoundary : undefined}
          onRedirect={this.redirectToSafeRoute}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }
    
    // Medium and low severity get standard treatment
    return (
      <StandardFallbackUI
        error={error!}
        severity={severity}
        category={category}
        onRetry={enableRetry ? this.resetErrorBoundary : undefined}
        onDismiss={this.props.allowErrorDismiss ? this.resetErrorBoundary : undefined}
        retryCount={retryCount}
        maxRetries={maxRetries}
        showDetails={this.props.showErrorDetails}
      />
    );
  }
}

// Crisis-specific fallback UI
const CrisisFallbackUI: React.FC<{
  error: Error;
  onRetry?: () => void;
  retryCount: number;
  maxRetries: number;
  crisisContactInfo?: { phone: string; text: string; chat: string };
}> = ({ error, onRetry, retryCount, maxRetries, crisisContactInfo }) => (
  <div className="crisis-error-fallback" role="alert" aria-live="assertive">
    <div className="crisis-error-container">
      <div className="crisis-error-header">
        <HeartIcon size={48} />
        <h1>We're Here to Help</h1>
        <p>
          We're experiencing a technical issue, but your safety is our priority. 
          You can still access crisis support resources.
        </p>
      </div>
      
      {crisisContactInfo && (
        <div className="crisis-contacts">
          <h2>Immediate Support Available</h2>
          <div className="contact-options">
            <a href={`tel:${crisisContactInfo.phone}`} className="contact-button phone">
              <PhoneIcon />
              Call {crisisContactInfo.phone}
            </a>
            <a href={`sms:${crisisContactInfo.text}`} className="contact-button text">
              <AlertCircleIcon />
              Text {crisisContactInfo.text}
            </a>
            <a href={crisisContactInfo.chat} className="contact-button chat">
              <HeartIcon size={20} />
              Online Chat
            </a>
          </div>
        </div>
      )}
      
      <div className="crisis-error-actions">
        {onRetry && retryCount < maxRetries && (
          <button onClick={onRetry} className="retry-button">
            <RefreshIcon />
            Try Again ({maxRetries - retryCount} attempts remaining)
          </button>
        )}
        <button 
          onClick={() => window.location.href = '/crisis'}
          className="crisis-resources-button"
        >
          View Crisis Resources
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>Technical Details</summary>
          <pre>{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);

// High severity fallback UI
const HighSeverityFallbackUI: React.FC<{
  category: ErrorCategory;
  onRetry?: () => void;
  onRedirect: () => void;
  retryCount: number;
  maxRetries: number;
}> = ({ category, onRetry, onRedirect, retryCount, maxRetries }) => (
  <div className="high-severity-error-fallback" role="alert">
  <div className="error-container">
    <AlertCircleIcon />
    <h1>Something Went Wrong</h1>
    <p>
      {category === 'network' && 'We\'re having trouble connecting to our servers.'}
      {category === 'authentication' && 'There was an issue with your session.'}
      {category === 'service-worker' && 'The app needs to refresh to work properly.'}
      {category === 'unknown' && 'An unexpected error occurred.'}
    </p>
    
    <div className="error-actions">
      {onRetry && retryCount < maxRetries && (
        <button onClick={onRetry} className="retry-button primary">
          <RefreshIcon />
          Try Again
        </button>
      )}
      <button onClick={onRedirect} className="home-button secondary">
        <HomeIcon />
        Go to Home
      </button>
    </div>      <div className="error-help">
        <p>If this problem persists, please contact support.</p>
      </div>
    </div>
  </div>
);

// Standard fallback UI for medium/low severity
const StandardFallbackUI: React.FC<{
  error: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails?: boolean;
}> = ({ error, severity, category, onRetry, onDismiss, retryCount, maxRetries, showDetails }) => (
  <div className="standard-error-fallback" role="alert">
  <div className="error-banner">
    <AlertCircleIcon />
    <div className="error-content">
      <h3>
        {severity === 'medium' ? 'Minor Issue' : 'Small Problem'}
      </h3>
      <p>
        {category === 'validation' && 'Please check your input and try again.'}
        {category === 'ui-rendering' && 'This section couldn\'t load properly.'}
        {category === 'unknown' && 'Something didn\'t work as expected.'}
      </p>
    </div>
    
    <div className="error-actions">
      {onRetry && retryCount < maxRetries && (
        <button onClick={onRetry} className="retry-button-small">
          <RefreshIcon />
          Retry
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="dismiss-button">
          ×
        </button>
      )}
    </div>
  </div>    {showDetails && (
      <details className="error-details-small">
        <summary>Technical Details</summary>
        <code>{error.message}</code>
      </details>
    )}
  </div>
);

export default ErrorBoundary;
