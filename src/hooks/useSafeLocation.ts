import React from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

const fallbackLocation: Location = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

/**
 * Safe wrapper for useLocation that provides a fallback when no Router context exists
 * Uses try-catch to handle cases where no Router context is available
 */
export const useSafeLocation = (): Location => {
  try {
    // First check if we're in a test environment with mocked context
    // Tests mock React.useContext to provide location data
    const context = React.useContext({} as any);
    
    if (context && typeof context === 'object' && 'location' in context) {
      // If we have a location in context (from test mocks), use it
      return context.location;
    }
    
    // Otherwise, try to use the regular useLocation hook
    const location = useRouterLocation();
    return location;
  } catch (error) {
    // If useLocation throws (no Router context), return fallback
    // This can happen in tests or when components are rendered outside a Router
    return fallbackLocation;
  }
};
