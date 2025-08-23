import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import simpleAuthService from '../services/simpleAuthService';
import { useNotification } from './NotificationContext';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  userToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const { addToast } = useNotification();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if we have a valid token
        const isValid = await simpleAuthService.verifyToken();
        if (isValid) {
          const currentUser = await simpleAuthService.getCurrentUser();
          setUser(currentUser);
          setUserToken(simpleAuthService.getToken());
        }
      } catch (error) {
        logger.error('Auth check failed:', error, 'SimpleAuthContext');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = simpleAuthService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setUserToken(simpleAuthService.getToken());
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await simpleAuthService.login(email, password);
      
      if (response.success) {
        setUser(response.user || null);
        setUserToken(simpleAuthService.getToken());
        addToast('Successfully logged in!', 'success');
        return true;
      } else {
        addToast(response.error || 'Login failed', 'error');
        return false;
      }
    } catch (error) {
      addToast((error as Error).message || 'Login failed', 'error');
      return false;
    }
  }, [addToast]);

  const register = useCallback(async (
    email: string, 
    password: string, 
    name: string, 
    role = 'seeker'
  ): Promise<boolean> => {
    try {
      const response = await simpleAuthService.register(email, password, name, role);
      
      if (response.success) {
        setUser(response.user || null);
        setUserToken(simpleAuthService.getToken());
        addToast('Account created successfully!', 'success');
        return true;
      } else {
        addToast(response.error || 'Registration failed', 'error');
        return false;
      }
    } catch (error) {
      addToast((error as Error).message || 'Registration failed', 'error');
      return false;
    }
  }, [addToast]);

  const logout = useCallback(async () => {
    try {
      await simpleAuthService.logout();
      setUser(null);
      setUserToken(null);
      addToast('Successfully logged out', 'success');
    } catch (error) {
      logger.error('Logout error:', error, 'SimpleAuthContext');
      // Still clear local state even if API call fails
      setUser(null);
      setUserToken(null);
    }
  }, [addToast]);

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout,
    userToken,
  }), [user, isLoading, login, register, logout, userToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSimpleAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Export context for testing
export { AuthContext };

// Default export
export default SimpleAuthProvider;