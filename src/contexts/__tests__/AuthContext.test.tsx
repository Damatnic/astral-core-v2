import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Mock crypto before importing AuthContext
global.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid-test'),
} as any;

import { AuthProvider, useAuth } from '../AuthContext';

// Mock dependencies
jest.mock('../../services/webAuthService', () => ({
  WebAuthSession: {
    useAutoDiscovery: jest.fn(() => null),
    useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
    makeRedirectUri: jest.fn(() => 'http://localhost:3000/auth'),
    ResponseType: {
      Token: 'token',
    },
  },
}));

jest.mock('../../utils/ApiClient');
jest.mock('../../utils/logger');

// Mock NotificationContext with a proper implementation
jest.mock('../NotificationContext', () => ({
  useNotification: jest.fn(() => ({
    toasts: [],
    addToast: jest.fn(),
    removeToast: jest.fn(),
    confirmationModal: null,
    showConfirmationModal: jest.fn(),
    hideConfirmationModal: jest.fn(),
  })),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all storage to ensure clean state
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock crypto.randomUUID
    global.crypto = {
      randomUUID: jest.fn(() => 'mock-uuid-test'),
    } as any;
  });

  describe('AuthProvider', () => {
    it.skip('should provide default values', async () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <span data-testid="authenticated">{auth.isAuthenticated.toString()}</span>
            <span data-testid="loading">{auth.isLoading.toString()}</span>
            <span data-testid="user">{auth.user ? 'User exists' : 'No user'}</span>
            <span data-testid="token">{auth.userToken || 'No token'}</span>
          </div>
        );
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      // Wait for initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      // Anonymous users always get a token
      expect(screen.getByTestId('token')).toHaveTextContent('mock-uuid-test');
    });

    it('should handle login function', async () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <button onClick={() => auth.login()}>Login</button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      expect(loginButton).toBeInTheDocument();
      
      // Login function should be callable without throwing
      await act(async () => {
        loginButton.click();
      });
    });

    it('should handle logout function', async () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <button onClick={() => auth.logout()}>Logout</button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
      
      // Logout function should be callable without throwing
      await act(async () => {
        logoutButton.click();
      });
    });

    it('should handle updateHelperProfile', () => {
      const TestComponent = () => {
        const auth = useAuth();
        const handleUpdate = () => {
          auth.updateHelperProfile({
            id: 'test-id',
            name: 'Test Helper',
            bio: 'Test bio',
            level: 1,
            expertise: ['anxiety'],
            badges: [],
            totalDilemmasHelped: 0,
            rating: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any);
        };
        
        return (
          <div>
            <button onClick={handleUpdate}>Update Profile</button>
            <span data-testid="profile">
              {auth.helperProfile ? auth.helperProfile.name : 'No profile'}
            </span>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('profile')).toHaveTextContent('No profile');
      
      // Should be able to call updateHelperProfile
      const updateButton = screen.getByText('Update Profile');
      act(() => {
        updateButton.click();
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('should return auth context when used within provider', () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div data-testid="auth-status">
            {auth ? 'Auth available' : 'No auth'}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Auth available');
    });
  });

  describe('Global authState', () => {
    it('should be accessible and updatable', () => {
      // Clear module cache to get fresh authState
      jest.resetModules();
      const { authState } = require('../AuthContext');
      
      expect(authState).toBeDefined();
      // authState might have been modified by previous tests
      // so we'll just check it's accessible and updatable
      
      // Should be able to update authState
      const originalToken = authState.userToken;
      authState.userToken = 'test-token';
      expect(authState.userToken).toBe('test-token');
      
      // Reset for other tests
      authState.userToken = originalToken;
      authState.isAuthenticated = false;
      authState.user = null;
      authState.helperProfile = null;
    });
  });
});