/**
 * Error Boundary Fallback Component
 */

import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>We've been notified about this error.</p>
      <button onClick={resetError}>Try again</button>
      <details style={{ marginTop: '10px' }}>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
    </div>
  );
};

export default ErrorFallback;
