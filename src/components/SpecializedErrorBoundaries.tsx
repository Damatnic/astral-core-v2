/**
 * Specialized Error Boundary Components
 * 
 * Context-specific error boundaries for different areas of the 
 * Astral Core mental health platform.
 */

import React from 'react';
import ErrorBoundary, { ErrorBoundaryConfig, ErrorFallbackProps } from './ErrorBoundary';

// Fallback components
const CommunicationFallback: React.FC<ErrorFallbackProps> = ({ 
  resetErrorBoundary, 
  retryCount, 
  config 
}) => (
  <div className="communication-error">
    <h3>Communication Issue</h3>
    <p>We're having trouble with the chat service.</p>
    {retryCount < (config.maxRetries || 3) && (
      <button onClick={resetErrorBoundary}>
        Try Reconnecting
      </button>
    )}
    <p className="offline-note">
      You can still access crisis resources if needed.
    </p>
  </div>
);

const FormFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="form-error">
    <h4>Form Error</h4>
    <p>There was an issue with this form. Please try again.</p>
    <button onClick={resetErrorBoundary}>
      Reset Form
    </button>
    <details>
      <summary>Technical Details</summary>
      <p>{error.message}</p>
    </details>
  </div>
);

const DashboardFallback: React.FC<ErrorFallbackProps> = ({ 
  resetErrorBoundary 
}) => (
  <div className="dashboard-error">
    <h3>Dashboard Unavailable</h3>
    <p>Some dashboard features are temporarily unavailable.</p>
    <button onClick={resetErrorBoundary}>
      Refresh Dashboard
    </button>
    <p>Core features like crisis support remain available.</p>
  </div>
);

const AdminFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="admin-error">
    <h3>Admin Panel Error</h3>
    <p>The admin interface encountered an error.</p>
    <div className="admin-error-actions">
      <button onClick={resetErrorBoundary}>
        Try Again
      </button>
      <button onClick={() => window.location.href = '/admin'}>
        Return to Admin Home
      </button>
    </div>
    <details className="error-details">
      <summary>Error Details</summary>
      <pre>{error.message}</pre>
    </details>
  </div>
);

const PageFallback: React.FC<ErrorFallbackProps & { pageName?: string }> = ({ 
  resetErrorBoundary,
  pageName = 'page'
}) => (
  <div className="page-error">
    <h2>Page Error</h2>
    <p>This {pageName} couldn't load properly.</p>
    <div className="page-error-actions">
      <button onClick={resetErrorBoundary} className="primary">
        Try Again
      </button>
      <button onClick={() => window.location.href = '/'} className="secondary">
        Go to Home
      </button>
    </div>
    <div className="help-note">
      <p>If you're in crisis, <a href="/crisis">click here for immediate support</a>.</p>
    </div>
  </div>
);

const NetworkFallback: React.FC<ErrorFallbackProps & { isOnline: boolean }> = ({ 
  resetErrorBoundary, 
  retryCount, 
  config,
  isOnline 
}) => (
  <div className="network-error">
    <h3>
      {isOnline ? 'Connection Issue' : 'You\'re Offline'}
    </h3>
    <p>
      {isOnline 
        ? 'We\'re having trouble reaching our servers.'
        : 'Some features are limited while offline.'
      }
    </p>
    {isOnline && retryCount < (config.maxRetries || 3) && (
      <button onClick={resetErrorBoundary}>
        Try Again
      </button>
    )}
    <div className="offline-features">
      <p>Available offline:</p>
      <ul>
        <li>Crisis contact information</li>
        <li>Safety plan (if saved)</li>
        <li>Cached resources</li>
      </ul>
    </div>
  </div>
);

const DevFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetErrorBoundary 
}) => (
  <div className="dev-error" style={{ 
    background: '#ff000010', 
    border: '2px solid #ff0000', 
    padding: '20px', 
    margin: '10px' 
  }}>
    <h3 style={{ color: '#ff0000' }}>Development Error</h3>
    <details open>
      <summary>Error Details</summary>
      <pre style={{ background: '#000', color: '#fff', padding: '10px' }}>
        {error.message}
      </pre>
      <pre style={{ background: '#000', color: '#fff', padding: '10px' }}>
        {error.stack}
      </pre>
    </details>
    <details>
      <summary>Component Stack</summary>
      <pre style={{ background: '#000', color: '#fff', padding: '10px' }}>
        {errorInfo?.componentStack}
      </pre>
    </details>
    <button onClick={resetErrorBoundary} style={{ marginTop: '10px' }}>
      Reset Component
    </button>
  </div>
);

// Crisis intervention error boundary with highest priority
export const CrisisErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    isCrisisContext: true,
    reportErrors: true,
    enableRetry: true,
    maxRetries: 5,
    autoRetry: true,
    retryDelay: 1000,
    crisisContactInfo: {
      phone: '988',
      text: '741741',
      chat: 'https://suicidepreventionlifeline.org/chat/'
    },
    showErrorDetails: false,
    allowErrorDismiss: false,
    isDevelopment: process.env.NODE_ENV === 'development'
  };

  return (
    <ErrorBoundary
      {...config}
      onError={(error, _errorInfo, errorId) => {
        // Immediate logging for crisis errors
        console.error('CRISIS ERROR:', errorId, error.message);
        
        // Store for offline reporting
        localStorage.setItem('last_crisis_error', JSON.stringify({
          id: errorId,
          timestamp: new Date().toISOString(),
          error: error.message
        }));
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Authentication flow error boundary
export const AuthErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 2000,
    redirectOnError: '/login',
    showErrorDetails: false,
    allowErrorDismiss: true
  };

  return (
    <ErrorBoundary
      {...config}
      onError={(error) => {
        // Clear potentially corrupted auth data
        if (error.message.includes('auth') || error.message.includes('token')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_session');
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Communication error boundary
export const CommunicationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 3,
    autoRetry: false,
    showErrorDetails: false,
    allowErrorDismiss: true
  };

  return (
    <ErrorBoundary {...config} fallback={CommunicationFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Form/Input error boundary
export const FormErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 2,
    showErrorDetails: true,
    allowErrorDismiss: true
  };

  return (
    <ErrorBoundary {...config} fallback={FormFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Dashboard/Analytics error boundary
export const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 2,
    showErrorDetails: false,
    allowErrorDismiss: true
  };

  return (
    <ErrorBoundary {...config} fallback={DashboardFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Admin panel error boundary
export const AdminErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 2,
    showErrorDetails: true,
    allowErrorDismiss: false,
    redirectOnError: '/admin'
  };

  return (
    <ErrorBoundary {...config} fallback={AdminFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ 
  children: React.ReactNode;
  pageName?: string;
}> = ({ children, pageName = 'page' }) => {
  const config: ErrorBoundaryConfig = {
    reportErrors: true,
    enableRetry: true,
    maxRetries: 2,
    showErrorDetails: false,
    allowErrorDismiss: false,
    redirectOnError: '/'
  };

  const PageFallbackWithName: React.FC<ErrorFallbackProps> = (props) => (
    <PageFallback {...props} pageName={pageName} />
  );

  return (
    <ErrorBoundary {...config} fallback={PageFallbackWithName}>
      {children}
    </ErrorBoundary>
  );
};

// Network-aware error boundary
export const NetworkErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const config: ErrorBoundaryConfig = {
    reportErrors: isOnline,
    enableRetry: true,
    maxRetries: isOnline ? 3 : 1,
    autoRetry: isOnline,
    retryDelay: isOnline ? 2000 : 5000,
    showErrorDetails: false,
    allowErrorDismiss: true
  };

  const NetworkFallbackWithState: React.FC<ErrorFallbackProps> = (props) => (
    <NetworkFallback {...props} isOnline={isOnline} />
  );

  return (
    <ErrorBoundary {...config} fallback={NetworkFallbackWithState}>
      {children}
    </ErrorBoundary>
  );
};

// Development-only error boundary with detailed debugging
export const DevErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  const config: ErrorBoundaryConfig = {
    reportErrors: false,
    enableRetry: true,
    maxRetries: 0,
    showErrorDetails: true,
    allowErrorDismiss: true,
    isDevelopment: true,
    logToConsole: true
  };

  return (
    <ErrorBoundary {...config} fallback={DevFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Higher-order component for automatic error boundary wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  boundaryType: 'crisis' | 'auth' | 'communication' | 'form' | 'dashboard' | 'admin' | 'page' | 'network' = 'page'
) => {
  const WrappedComponent = (props: P) => {
    const ErrorBoundaryComponent = {
      crisis: CrisisErrorBoundary,
      auth: AuthErrorBoundary,
      communication: CommunicationErrorBoundary,
      form: FormErrorBoundary,
      dashboard: DashboardErrorBoundary,
      admin: AdminErrorBoundary,
      page: PageErrorBoundary,
      network: NetworkErrorBoundary
    }[boundaryType];

    return (
      <ErrorBoundaryComponent>
        <Component {...props} />
      </ErrorBoundaryComponent>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Named export for the full object (for existing imports)
export const SpecializedErrorBoundariesBundle = {
  CrisisErrorBoundary,
  AuthErrorBoundary,
  CommunicationErrorBoundary,
  FormErrorBoundary,
  DashboardErrorBoundary,
  AdminErrorBoundary,
  PageErrorBoundary,
  NetworkErrorBoundary,
  DevErrorBoundary,
  withErrorBoundary
};

// Export the most used boundary as default for lazy loading
export default CrisisErrorBoundary;
