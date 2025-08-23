import React, { createContext, useContext, ReactNode } from 'react';
import { Helper } from '../types';

// Default mock values for AuthContext
export const mockAuthContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  helperProfile: null,
  isNewUser: false,
  isLoading: false,
  login: jest.fn(() => Promise.resolve()),
  logout: jest.fn(() => Promise.resolve()),
  reloadProfile: jest.fn(() => Promise.resolve()),
  updateHelperProfile: jest.fn(),
  userToken: 'test-token',
  isAnonymous: false,
  authState: {
    isAuthenticated: false,
    user: null,
    helperProfile: null,
    userToken: 'test-token'
  },
  register: jest.fn(() => Promise.resolve()),
};

// Mock ThemeContext value
export const mockThemeContextValue = {
  theme: 'light' as const,
  themeConfig: {
    colors: {
      bgPrimary: '#f7f9fc',
      bgSecondary: '#FFFFFF',
      bgTertiary: '#eef2f7',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
      accentPrimary: '#3498db',
      accentPrimaryHover: '#2980b9',
      accentPrimaryText: '#ffffff',
      accentDanger: '#e74c3c',
      accentSuccess: '#2ecc71',
      borderColor: '#e0e6ed',
    },
    spacing: { 
      xs: '0.25rem', 
      sm: '0.5rem', 
      md: '1rem', 
      lg: '1.5rem', 
      xl: '2.5rem' 
    },
    radius: { 
      sm: '4px', 
      md: '8px', 
      lg: '12px' 
    },
  },
  toggleTheme: jest.fn(),
};

// Mock NotificationContext value
export const mockNotificationContextValue = {
  toasts: [],
  addToast: jest.fn(),
  removeToast: jest.fn(),
  confirmationModal: null,
  showConfirmationModal: jest.fn(),
  hideConfirmationModal: jest.fn(),
};

// ========================================
// AUTH CONTEXT MOCK
// ========================================
export interface MockAuthContextType {
  isAuthenticated: boolean;
  user: any;
  helperProfile: Helper | null;
  isNewUser: boolean;
  isLoading: boolean;
  login: jest.Mock;
  logout: jest.Mock;
  reloadProfile: jest.Mock;
  updateHelperProfile: jest.Mock;
  userToken: string | null;
  isAnonymous?: boolean;
  authState?: any;
  register?: jest.Mock;
}

const MockAuthContext = createContext<MockAuthContextType>(mockAuthContextValue as MockAuthContextType);

export const MockAuthProvider: React.FC<{ children: ReactNode; value?: Partial<MockAuthContextType> }> = ({ 
  children, 
  value = {} 
}) => {
  const contextValue = { ...mockAuthContextValue, ...value } as MockAuthContextType;
  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

// ========================================
// NOTIFICATION CONTEXT MOCK
// ========================================
export interface MockNotificationContextType {
  toasts: any[];
  addToast: jest.Mock;
  removeToast: jest.Mock;
  confirmationModal: any | null;
  showConfirmationModal: jest.Mock;
  hideConfirmationModal: jest.Mock;
}

const MockNotificationContext = createContext<MockNotificationContextType>(mockNotificationContextValue as MockNotificationContextType);

export const MockNotificationProvider: React.FC<{ children: ReactNode; value?: Partial<MockNotificationContextType> }> = ({ 
  children, 
  value = {} 
}) => {
  const contextValue = { ...mockNotificationContextValue, ...value } as MockNotificationContextType;
  return (
    <MockNotificationContext.Provider value={contextValue}>
      {children}
    </MockNotificationContext.Provider>
  );
};

// ========================================
// THEME CONTEXT MOCK
// ========================================
export interface MockThemeContextType {
  theme: 'light' | 'dark';
  themeConfig: any;
  toggleTheme: jest.Mock;
}

const MockThemeContext = createContext<MockThemeContextType>(mockThemeContextValue as MockThemeContextType);

export const MockThemeProvider: React.FC<{ children: ReactNode; value?: Partial<MockThemeContextType> }> = ({ 
  children, 
  value = {} 
}) => {
  const contextValue = { ...mockThemeContextValue, ...value } as MockThemeContextType;
  return (
    <MockThemeContext.Provider value={contextValue}>
      {children}
    </MockThemeContext.Provider>
  );
};

// ========================================
// COMBINED PROVIDERS
// ========================================
export interface AllProvidersProps {
  children: ReactNode;
  authValue?: Partial<MockAuthContextType>;
  notificationValue?: Partial<MockNotificationContextType>;
  themeValue?: Partial<MockThemeContextType>;
}

/**
 * Wraps children with all mock context providers
 * Allows overriding specific context values for testing
 */
export const AllMockProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  authValue = {}, 
  notificationValue = {}, 
  themeValue = {} 
}) => {
  return (
    <MockThemeProvider value={themeValue}>
      <MockNotificationProvider value={notificationValue}>
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      </MockNotificationProvider>
    </MockThemeProvider>
  );
};

// AllProviders wrapper for tests - alias for AllMockProviders
export const AllProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AllMockProviders>{children}</AllMockProviders>;
};

// Mock useLegalConsents hook
export const mockUseLegalConsents = () => ({
  requiredConsent: null,
  allConsentsGiven: true,
  acceptConsent: jest.fn(() => Promise.resolve()),
  getConsentContent: jest.fn(() => ({ title: '', text: '' })),
});

// Reset all mock context functions
export const resetAllMockContexts = () => {
  // Reset Auth mocks
  (mockAuthContextValue.login as jest.Mock).mockClear();
  (mockAuthContextValue.logout as jest.Mock).mockClear();
  (mockAuthContextValue.reloadProfile as jest.Mock).mockClear();
  (mockAuthContextValue.updateHelperProfile as jest.Mock).mockClear();
  if (mockAuthContextValue.register) {
    (mockAuthContextValue.register as jest.Mock).mockClear();
  }
  
  // Reset Notification mocks
  (mockNotificationContextValue.addToast as jest.Mock).mockClear();
  (mockNotificationContextValue.removeToast as jest.Mock).mockClear();
  (mockNotificationContextValue.showConfirmationModal as jest.Mock).mockClear();
  (mockNotificationContextValue.hideConfirmationModal as jest.Mock).mockClear();
  
  // Reset Theme mocks
  (mockThemeContextValue.toggleTheme as jest.Mock).mockClear();
};

// Export default mock values for easy jest.mock() usage
export const defaultMockContexts = {
  auth: mockAuthContextValue,
  notification: mockNotificationContextValue,
  theme: mockThemeContextValue,
};

// Create authenticated context value
export const createAuthenticatedContext = (overrides?: Partial<MockAuthContextType>): MockAuthContextType => ({
  ...mockAuthContextValue,
  isAuthenticated: true,
  user: {
    sub: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  helperProfile: {
    id: 'helper-123',
    name: 'Test Helper',
    bio: 'Test bio',
    level: 1,
    expertise: ['anxiety', 'depression'],
    badges: [],
    totalDilemmasHelped: 0,
    rating: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Helper,
  ...overrides,
});

// Create mock for useAuth hook
export const createMockUseAuth = (overrides?: Partial<MockAuthContextType>) => {
  return jest.fn(() => ({
    ...mockAuthContextValue,
    ...overrides,
  }));
};

// Create mock for useTheme hook
export const createMockUseTheme = (theme: 'light' | 'dark' = 'light') => {
  return jest.fn(() => ({
    ...mockThemeContextValue,
    theme,
  }));
};

// Create mock for useNotification hook
export const createMockUseNotification = (overrides?: any) => {
  return jest.fn(() => ({
    ...mockNotificationContextValue,
    ...overrides,
  }));
};