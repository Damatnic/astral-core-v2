import { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { WebAuthSession } from '../services/webAuthService';
import { ApiClient } from '../utils/ApiClient';
import { Helper } from '../types';
import { AuthUser, JWTPayload, DemoUser } from '../types/auth.types';
import { useNotification } from './NotificationContext';
import { localStorageService } from '../services/localStorageService';
import { logger } from '../utils/logger';

// Auth0 Configuration (Optional)
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || '';

// Demo users for development/testing
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-seeker-1',
    email: 'demo@seeker.com',
    name: 'Demo Seeker',
    role: 'seeker',
    isDemo: true
  },
  {
    id: 'demo-helper-1',
    email: 'demo@helper.com',
    name: 'Demo Helper',
    role: 'helper',
    isDemo: true
  }
];

interface OptionalAuthContextType {
  // Auth state
  isAuthenticated: boolean;
  isAnonymous: boolean;
  user: AuthUser | null;
  userToken: string | null;
  anonymousId: string | null;
  
  // Helper-specific state
  helperProfile: Helper | null;
  isHelper: boolean;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  
  // Auth methods
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  
  // Anonymous methods
  enableAnonymousMode: () => void;
  convertAnonymousToUser: (userData: RegisterData) => Promise<void>;
  
  // Helper methods
  applyAsHelper: (helperData: HelperApplicationData) => Promise<void>;
  updateHelperProfile: (updates: Partial<Helper>) => Promise<void>;
  
  // Demo methods
  loginAsDemo: (userType: 'seeker' | 'helper') => Promise<void>;
  
  // Utility methods
  refreshAuth: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  acceptedTerms: boolean;
}

interface HelperApplicationData {
  qualifications: string;
  experience: string;
  specializations: string[];
  availability: string;
  motivation: string;
}

const OptionalAuthContext = createContext<OptionalAuthContextType | null>(null);

export const OptionalAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  
  // Helper state
  const [helperProfile, setHelperProfile] = useState<Helper | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Hooks
  const { showNotification } = useNotification();
  
  // Computed values
  const isHelper = useMemo(() => {
    return helperProfile !== null && user?.role === 'helper';
  }, [helperProfile, user]);
  
  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);
  
  const initializeAuth = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // Check for existing session
      const storedToken = localStorageService.getItem('auth_token');
      const storedUser = localStorageService.getItem('user_data');
      const storedAnonymousId = localStorageService.getItem('anonymous_id');
      
      if (storedToken && storedUser) {
        // Validate stored session
        const isValid = await validateStoredSession(storedToken, storedUser);
        if (isValid) {
          setUserToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsAnonymous(false);
          
          // Load helper profile if user is a helper
          if (storedUser.role === 'helper') {
            await loadHelperProfile(storedUser.id);
          }
          
          logger.info('Auth session restored from storage');
        } else {
          // Clear invalid session
          await clearAuthState();
        }
      } else if (storedAnonymousId) {
        // Restore anonymous session
        setAnonymousId(storedAnonymousId);
        setIsAnonymous(true);
        setIsAuthenticated(false);
        logger.info('Anonymous session restored');
      } else {
        // No existing session - start fresh
        logger.info('No existing auth session found');
      }
    } catch (error) {
      logger.error('Failed to initialize auth:', error);
      await clearAuthState();
    } finally {
      setIsInitializing(false);
    }
  }, []);
  
  const validateStoredSession = async (token: string, userData: AuthUser): Promise<boolean> => {
    try {
      // Decode JWT to check expiration
      const payload = decodeJWT(token);
      if (!payload || payload.exp * 1000 < Date.now()) {
        logger.info('Stored token is expired');
        return false;
      }
      
      // Optionally validate with server
      const apiClient = new ApiClient();
      const response = await apiClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.success;
    } catch (error) {
      logger.error('Session validation failed:', error);
      return false;
    }
  };
  
  const decodeJWT = (token: string): JWTPayload | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      logger.error('Failed to decode JWT:', error);
      return null;
    }
  };
  
  const login = useCallback(async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    try {
      setIsLoading(true);
      
      const apiClient = new ApiClient();
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      const { user: userData, token, helper } = response.data;
      
      // Update state
      setUser(userData);
      setUserToken(token);
      setIsAuthenticated(true);
      setIsAnonymous(false);
      
      if (helper) {
        setHelperProfile(helper);
      }
      
      // Persist to storage
      localStorageService.setItem('auth_token', token);
      localStorageService.setItem('user_data', userData);
      localStorageService.removeItem('anonymous_id');
      
      showNotification('Welcome back!', 'success');
      logger.info('User logged in successfully');
      
    } catch (error) {
      logger.error('Login failed:', error);
      showNotification(error instanceof Error ? error.message : 'Login failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);
  
  const register = useCallback(async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const apiClient = new ApiClient();
      const response = await apiClient.post('/auth/register', userData);
      
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      
      const { user: newUser, token } = response.data;
      
      // Update state
      setUser(newUser);
      setUserToken(token);
      setIsAuthenticated(true);
      setIsAnonymous(false);
      
      // Persist to storage
      localStorageService.setItem('auth_token', token);
      localStorageService.setItem('user_data', newUser);
      localStorageService.removeItem('anonymous_id');
      
      showNotification('Account created successfully!', 'success');
      logger.info('User registered successfully');
      
    } catch (error) {
      logger.error('Registration failed:', error);
      showNotification(error instanceof Error ? error.message : 'Registration failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);
  
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint if authenticated
      if (isAuthenticated && userToken) {
        try {
          const apiClient = new ApiClient();
          await apiClient.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
        } catch (error) {
          // Continue with logout even if API call fails
          logger.error('Logout API call failed:', error);
        }
      }
      
      await clearAuthState();
      showNotification('Logged out successfully', 'info');
      logger.info('User logged out');
      
    } catch (error) {
      logger.error('Logout failed:', error);
      showNotification('Logout failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userToken, showNotification]);
  
  const enableAnonymousMode = useCallback(() => {
    const newAnonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setAnonymousId(newAnonymousId);
    setIsAnonymous(true);
    setIsAuthenticated(false);
    setUser(null);
    setUserToken(null);
    setHelperProfile(null);
    
    localStorageService.setItem('anonymous_id', newAnonymousId);
    localStorageService.removeItem('auth_token');
    localStorageService.removeItem('user_data');
    
    logger.info('Anonymous mode enabled:', newAnonymousId);
    showNotification('Browsing anonymously', 'info');
  }, [showNotification]);
  
  const convertAnonymousToUser = useCallback(async (userData: RegisterData) => {
    if (!isAnonymous || !anonymousId) {
      throw new Error('Not in anonymous mode');
    }
    
    try {
      setIsLoading(true);
      
      const apiClient = new ApiClient();
      const response = await apiClient.post('/auth/convert-anonymous', {
        ...userData,
        anonymousId
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Account conversion failed');
      }
      
      const { user: newUser, token } = response.data;
      
      // Update state
      setUser(newUser);
      setUserToken(token);
      setIsAuthenticated(true);
      setIsAnonymous(false);
      setAnonymousId(null);
      
      // Persist to storage
      localStorageService.setItem('auth_token', token);
      localStorageService.setItem('user_data', newUser);
      localStorageService.removeItem('anonymous_id');
      
      showNotification('Account created successfully!', 'success');
      logger.info('Anonymous user converted to registered user');
      
    } catch (error) {
      logger.error('Anonymous conversion failed:', error);
      showNotification(error instanceof Error ? error.message : 'Account conversion failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAnonymous, anonymousId, showNotification]);
  
  const applyAsHelper = useCallback(async (helperData: HelperApplicationData) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be logged in to apply as helper');
    }
    
    try {
      setIsLoading(true);
      
      const apiClient = new ApiClient();
      const response = await apiClient.post('/helpers/apply', helperData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Helper application failed');
      }
      
      showNotification('Helper application submitted successfully!', 'success');
      logger.info('Helper application submitted');
      
    } catch (error) {
      logger.error('Helper application failed:', error);
      showNotification(error instanceof Error ? error.message : 'Helper application failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, userToken, showNotification]);
  
  const updateHelperProfile = useCallback(async (updates: Partial<Helper>) => {
    if (!isHelper || !helperProfile) {
      throw new Error('Must be a helper to update profile');
    }
    
    try {
      setIsLoading(true);
      
      const apiClient = new ApiClient();
      const response = await apiClient.put(`/helpers/${helperProfile.id}`, updates, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Profile update failed');
      }
      
      const updatedProfile = { ...helperProfile, ...updates };
      setHelperProfile(updatedProfile);
      
      showNotification('Profile updated successfully!', 'success');
      logger.info('Helper profile updated');
      
    } catch (error) {
      logger.error('Helper profile update failed:', error);
      showNotification(error instanceof Error ? error.message : 'Profile update failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isHelper, helperProfile, userToken, showNotification]);
  
  const loginAsDemo = useCallback(async (userType: 'seeker' | 'helper') => {
    try {
      setIsLoading(true);
      
      const demoUser = DEMO_USERS.find(u => u.role === userType);
      if (!demoUser) {
        throw new Error('Demo user not found');
      }
      
      // Create demo auth user
      const authUser: AuthUser = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        isDemo: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      // Create demo token (not a real JWT, just for demo)
      const demoToken = `demo_token_${demoUser.id}_${Date.now()}`;
      
      setUser(authUser);
      setUserToken(demoToken);
      setIsAuthenticated(true);
      setIsAnonymous(false);
      
      // If helper demo, create demo helper profile
      if (userType === 'helper') {
        const demoHelperProfile: Helper = {
          id: demoUser.id,
          userId: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          specializations: ['General Support', 'Crisis Intervention'],
          bio: 'Demo helper profile for testing purposes',
          isVerified: true,
          rating: 4.8,
          totalSessions: 150,
          availability: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setHelperProfile(demoHelperProfile);
      }
      
      // Store demo session (but mark as demo)
      localStorageService.setItem('auth_token', demoToken);
      localStorageService.setItem('user_data', { ...authUser, isDemo: true });
      localStorageService.removeItem('anonymous_id');
      
      showNotification(`Logged in as demo ${userType}`, 'success');
      logger.info(`Demo login: ${userType}`);
      
    } catch (error) {
      logger.error('Demo login failed:', error);
      showNotification('Demo login failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);
  
  const refreshAuth = useCallback(async () => {
    if (!userToken) return;
    
    try {
      const apiClient = new ApiClient();
      const response = await apiClient.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (response.success && response.data.token) {
        setUserToken(response.data.token);
        localStorageService.setItem('auth_token', response.data.token);
        logger.info('Auth token refreshed');
      }
    } catch (error) {
      logger.error('Token refresh failed:', error);
      // Don't throw - let the app continue with existing token
    }
  }, [userToken]);
  
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!userToken || !user) return false;
    
    try {
      return await validateStoredSession(userToken, user);
    } catch (error) {
      logger.error('Session validation failed:', error);
      return false;
    }
  }, [userToken, user]);
  
  const loadHelperProfile = useCallback(async (userId: string) => {
    try {
      const apiClient = new ApiClient();
      const response = await apiClient.get(`/helpers/profile/${userId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (response.success && response.data) {
        setHelperProfile(response.data);
        logger.info('Helper profile loaded');
      }
    } catch (error) {
      logger.error('Failed to load helper profile:', error);
      // Don't throw - helper profile is optional
    }
  }, [userToken]);
  
  const clearAuthState = useCallback(async () => {
    setIsAuthenticated(false);
    setIsAnonymous(false);
    setUser(null);
    setUserToken(null);
    setAnonymousId(null);
    setHelperProfile(null);
    
    localStorageService.removeItem('auth_token');
    localStorageService.removeItem('user_data');
    localStorageService.removeItem('anonymous_id');
    
    logger.info('Auth state cleared');
  }, []);
  
  // Auto-refresh token before expiration
  useEffect(() => {
    if (!userToken || !isAuthenticated) return;
    
    const refreshInterval = setInterval(() => {
      refreshAuth();
    }, 15 * 60 * 1000); // Refresh every 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [userToken, isAuthenticated, refreshAuth]);
  
  const contextValue = useMemo<OptionalAuthContextType>(() => ({
    // Auth state
    isAuthenticated,
    isAnonymous,
    user,
    userToken,
    anonymousId,
    
    // Helper state
    helperProfile,
    isHelper,
    
    // Loading states
    isLoading,
    isInitializing,
    
    // Auth methods
    login,
    logout,
    register,
    
    // Anonymous methods
    enableAnonymousMode,
    convertAnonymousToUser,
    
    // Helper methods
    applyAsHelper,
    updateHelperProfile,
    
    // Demo methods
    loginAsDemo,
    
    // Utility methods
    refreshAuth,
    validateSession
  }), [
    isAuthenticated,
    isAnonymous,
    user,
    userToken,
    anonymousId,
    helperProfile,
    isHelper,
    isLoading,
    isInitializing,
    login,
    logout,
    register,
    enableAnonymousMode,
    convertAnonymousToUser,
    applyAsHelper,
    updateHelperProfile,
    loginAsDemo,
    refreshAuth,
    validateSession
  ]);
  
  return (
    <OptionalAuthContext.Provider value={contextValue}>
      {children}
    </OptionalAuthContext.Provider>
  );
};

export const useOptionalAuth = (): OptionalAuthContextType => {
  const context = useContext(OptionalAuthContext);
  if (!context) {
    throw new Error('useOptionalAuth must be used within an OptionalAuthProvider');
  }
  return context;
};

export default OptionalAuthContext;
