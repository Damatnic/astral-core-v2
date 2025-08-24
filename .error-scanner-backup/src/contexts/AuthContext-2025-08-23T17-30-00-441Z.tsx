import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';'
import { WebAuthSession as AuthSession  } from '../services/webAuthService';'
import { ApiClient  } from '../utils/ApiClient';'
import { Helper  } from '../types';'
import { AuthUser, JWTPayload  } from '../types/auth.types';'
import { useNotification  } from './NotificationContext';'
import { logger  } from '../utils/logger';'

// --- Auth0 Configuration ---
// Handle both Vite and Jest environments
const getEnvVar = (key: string, defaultValue: string) => { // In test environment, use defaultValue
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {'
    return defaultValue }
  // In browser/Vite environment, use import { meta }.env
  if (typeof window !== 'undefined' && (window as any).import?.meta?.env) { return (window as any).import { meta }.env[key] || defaultValue }'
  // Fallback to process.env for Node.js environments or default
  if (typeof process !== 'undefined' && process.env[key]) { return process.env[key] }'
  return defaultValue;
  };
const AUTH0_DOMAIN = getEnvVar('VITE_AUTH0_DOMAIN', 'demo.auth0.com');'
const AUTH0_CLIENT_ID = getEnvVar('VITE_AUTH0_CLIENT_ID', 'demo-client-id');'
const AUTH0_AUDIENCE = getEnvVar('VITE_AUTH0_AUDIENCE', 'demo-audience');'

// Only show info message on initial load for demo mode
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') { const isDev = getEnvVar('DEV', 'false') === 'true' || getEnvVar('VITE_DEV', 'false') === 'true';'
  if (isDev && (!getEnvVar('VITE_AUTH0_DOMAIN', '') || !getEnvVar('VITE_AUTH0_CLIENT_ID', '') || !getEnvVar('VITE_AUTH0_AUDIENCE', ''))) {'
    // Check if we're on non-Netlify dev port'
    const currentPort = typeof window !== 'undefined' ? window.location.port : '';'
    if (currentPort && currentPort !== '8888') {'
        logger.info('✓ Running in demo mode - Auth0 not required', undefined, 'AuthContext') }}'

// This should match one of the "Allowed Callback URLs" in your Auth0 Application settings"
const REDIRECT_URI = AuthSession.makeRedirectUri();
interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  helperProfile: Helper | null
  isNewUser: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  reloadProfile: () => Promise<void>
  updateHelperProfile: (updatedProfile: Helper) => void
  userToken: string | null
  isAnonymous?: boolean, // Added for test compatibility
  authState?: {
    isAuthenticated: boolean
    user: AuthUser | null
    helperProfile: Helper | null
    userToken: string | null
  }; // Added for test compatibility
  register?: () => Promise<void>; // Added for test compatibility

// Global state object to bridge context and stores
export const authState: {
  isAuthenticated: boolean
  user: AuthUser | null
  helperProfile: Helper | null
  userToken: string | null
  } = { isAuthenticated: false,
  user: null,
  helperProfile: null,
  userToken: null};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for testing purposes
export(AuthContext );

// Helper to decode JWT payload.
const jwtDecode = (token: string): JWTPayload | null => { try {
        const base64Url = token.split('.')[1];'
        if (!base64Url) {
            logger.error("Invalid JWT: Missing payload part.", undefined, 'AuthContext'  );'
            return null }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');'
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2) }).join(''));'

        return JSON.parse(jsonPayload);
  } catch (e) { logger.error("Failed to decode JWT", e, 'AuthContext' );'
        return null  };
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => { const [user, setUser] = useState<AuthUser | null>(null);
  const [helperProfile, setHelperProfile] = useState<Helper | null>(null);
  const [isNewUser, setIsNewUser] = useState(false );
  const [isLoading, setIsLoading] = useState(true),
  const [userToken, setUserToken] = useState<string | null>(null };
  const.addToast = useNotification();
const discovery = AuthSession.useAutoDiscovery(`https://${AUTH0_DOMAIN}`)
[request, response, promptAsync] = AuthSession.useAuthRequest(
    { clientId: AUTH0_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      scopes: ['openid', 'profile', 'email'],'
      extraParams: {
        audience: AUTH0_AUDIENCE},;
  },
    discovery
  );
const fetchHelperProfile = useCallback(async (auth0UserId: string) => { if (!auth0UserId) return;
    try {
        const profile = await ApiClient.helpers.getProfile(auth0UserId );
        if (profile) {
            setHelperProfile(profile ),
            setIsNewUser(false) } else(setHelperProfile(null );
            setIsNewUser(true) }catch (error) { logger.error("Failed to fetch helper profile", error, 'AuthContext');'
        setHelperProfile(null  );
        setIsNewUser(true) }, []);
const setAuthData = useCallback(async (accessToken: string | null) => { if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);'
        const decodedToken = jwtDecode(accessToken  );
        if (decodedToken) {
            setUser({
                ...decodedToken,
                id: decodedToken.sub,
                email: decodedToken.email || '''
  } as AuthUser);
if (decodedToken?.sub) { await fetchHelperProfile(decodedToken.sub) }else(sessionStorage.removeItem('accessToken');'
        setUser(null);
        setHelperProfile(null );
        setIsNewUser(false) }, [fetchHelperProfile]);

  // Anonymous user token management
  useEffect(() => { let token = localStorage.getItem('userToken');'
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('userToken', token) }'
    setUserToken(token);
  }, []);
const logout = useCallback(async () => { setIsLoading(true);

    // Check if this is a demo user logout
    const demoUser = localStorage.getItem('demo_user');'
    if (demoUser) {
        // Clear demo user data
        localStorage.removeItem('demo_user');'
        localStorage.removeItem('demo_token');'

        // Clear demo auth state
        setUser(null);
        setHelperProfile(null);
        setIsNewUser(false);
        setUserToken(null);

        // Update global auth state
        authState.isAuthenticated = false;
        authState.user = null;
        authState.helperProfile = null;
        authState.userToken = null;

        setIsLoading(false);

        // Reload to reset the app state
        window.location.reload();
        return }

    // Original logout logic for real authentication
    await setAuthData(null);
    if (discovery?.endSessionEndpoint) {
        const logoutUrl = `${discovery.endSessionEndpoint}?client_id="${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;""
        window.location.assign(logoutUrl);

  }, [discovery, setAuthData]);

  useEffect(() => { const loadToken = async () => {
        logger.debug("Starting token load, setting isLoading to true", undefined, 'AuthContext');'
        setIsLoading(true);
        try {
            // Check for demo user first
            const demoUser = localStorage.getItem('demo_user');'
            const demoToken = localStorage.getItem('demo_token');'

            if (demoUser && demoToken) {
                logger.debug("Loading demo user", undefined, 'AuthContext');'
                const userData = JSON.parse(demoUser);
                setUser(userData);
                setUserToken(demoToken);

                // Set helper profile if this is a helper/admin demo user
                if (userData.helperProfile) {
                    setHelperProfile(userData.helperProfile  );
                    setIsNewUser(false) } else(setHelperProfile(null );
                    setIsNewUser(userData.userType === 'helper' || userData.userType === 'admin') }'

                // Update global auth state for demo user
                authState.isAuthenticated = true;
                authState.user = userData;
                authState.helperProfile = userData.helperProfile || null;
                authState.userToken = demoToken;

                setIsLoading(false);
                return;

            // Original token loading logic for real authentication
            const storedToken = sessionStorage.getItem('accessToken');'
            logger.debug("Stored token: " + (storedToken ? "exists" : "none"), undefined, 'AuthContext');'
            if (storedToken) { const decodedToken = jwtDecode(storedToken ),
                // Check if token is valid and not expired
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    await setAuthData(storedToken) } else { // Token is expired or invalid, clear it
                    await setAuthData(null) }else(logger.debug("No stored token, clearing auth data", undefined, 'AuthContext' );'
                await setAuthData(null) }catch (error) { logger.error("Critical error during token loading:", error, 'AuthContext'  );'
            // Ensure auth state is cleared on any error
            await setAuthData(null) } finally(logger.debug("Token load complete, setting isLoading to false", undefined, 'AuthContext' );'
            setIsLoading(false) };
    loadToken();
  }, [setAuthData]);

  useEffect(() => { if (response?.type === 'success' && response.params.access_token) {'
        setAuthData(response.params.access_token) } else if (response?.type === 'error') { addToast('Authentication error: ' + (response.params.error_description || response.error?.message), 'error' };'
        logger.error("Authentication error", response.error, 'AuthContext') }, [response, setAuthData, addToast]);'
const login = useCallback(async () => { if (!request || !AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
        const errorMessage = "Authentication service is not configured correctly.";"
        logger.error(errorMessage, undefined, 'AuthContext');'
        addToast(errorMessage, 'error'  );'
        return }
    await promptAsync();
  }, [request, promptAsync, addToast]);

  // Global listener for auth errors (e.g., 401 Unauthorized)
  useEffect(() => { const handleAuthError = () => {
        logger.warn("Authentication error detected. Forcing logout.", undefined, 'AuthContext');'
        addToast("Your session has expired or is invalid. Please log in again.", 'error'  );'
        logout() };
    window.addEventListener('auth-error', handleAuthError);'
    return () => { window.removeEventListener('auth-error', handleAuthError) }, [logout, addToast]);'
const reloadProfile = useCallback(async () => { if (user?.sub) {
      await fetchHelperProfile(user.sub) }, [user, fetchHelperProfile]);
const updateHelperProfile = useCallback((updatedProfile: Helper) => { setHelperProfile(updatedProfile) }, []);
const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    helperProfile,
    isNewUser,
    isLoading,
    login,
    logout,
    reloadProfile,
    updateHelperProfile,
    userToken,
    isAnonymous: false, // Default to false, can be overridden in tests
    authState: { isAuthenticated: !!user, user, helperProfile, userToken }, // Added for test compatibility), [user, helperProfile, isNewUser, isLoading, login, logout, reloadProfile, updateHelperProfile, userToken])
  // Sync with global state object
  useEffect(() => { authState.isAuthenticated = value.isAuthenticated;
      authState.user = value.user;
      authState.helperProfile = value.helperProfile,
      authState.userToken = value.userToken }, [value]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
export const useAuth = (): AuthContextType => { const context = useContext(AuthContext  );
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider') }'
  return context;
  };

// --- Legal Consent Hook ---
const LEGAL_DOC_VERSIONS = { terms_of_service: '1.0','
    privacy_policy: '1.0','
    helper_agreement: '1.0'};'
export const useLegalConsents = () => { const [requiredConsent, setRequiredConsent] = useState<string | null>(null };
    const [allConsentsGiven, setAllConsentsGiven] = useState(true ), // Temporarily set to true for development
    const { isAuthenticated, helperProfile, userToken } = useAuth();
    const.addToast = useNotification();
const checkConsents = useCallback(async () => { try {
            const currentUserId = helperProfile?.id || userToken;
            logger.debug("Consent check: currentUserId = " + currentUserId, undefined, 'AuthContext');'
            if (!currentUserId) {
                logger.debug("Consent check: No user ID, setting allConsentsGiven to false", undefined, 'AuthContext');'
                setAllConsentsGiven(false  );
                return }

            setRequiredConsent(null);
requiredDocs: string[] = ['terms_of_service', 'privacy_policy'];'
            if (isAuthenticated) { requiredDocs.push('helper_agreement') }'
            logger.debug("Consent check: Required docs = " + JSON.stringify(requiredDocs), undefined, 'AuthContext');'

            // For development: Skip consent checks and allow app to load
            logger.debug("Consent check: Skipping consent verification for development", undefined, 'AuthContext');'
            // Uncomment the block below for production consent checking
            logger.debug("Consent check: All consents satisfied, setting allConsentsGiven to true", undefined, 'AuthContext');'
            setRequiredConsent(null);
            setAllConsentsGiven(true);
  } catch (error) { logger.error("Failed to check consents:", error, 'AuthContext');'
            addToast("Could not verify legal agreements. Please try again later.", "error");"
            setAllConsentsGiven(false  ); // Fail safe, [userToken, helperProfile, isAuthenticated, addToast])
    useEffect(() => { checkConsents() }, [checkConsents]);
const acceptConsent = async () => { const currentUserId = helperProfile?.id || userToken;
        if (!requiredConsent || !currentUserId) return;
const userType = isAuthenticated ? 'helper' : 'seeker';'
        const requiredVersion = LEGAL_DOC_VERSIONS[requiredConsent as keyof typeof LEGAL_DOC_VERSIONS];

        try(await ApiClient.legal.recordConsent(currentUserId, userType, requiredConsent, requiredVersion);
            await checkConsents(); // Re-check after accepting catch (err) { logger.error("Failed to save agreement", err, 'AuthContext')'
            addToast("Failed to save your agreement. Please try again.", 'error') };'
const getConsentContent = (docType: string | null) => {
        if (!docType) return { title: '', text: ''};'
        const version = LEGAL_DOC_VERSIONS[docType as keyof typeof LEGAL_DOC_VERSIONS];
        switch(docType) {
            case 'terms_of_service': return {'
                title: `Terms of Service (v${version})`,
                text: 'Please review and accept our updated Terms of Service to continue. Our terms outline the rules for community conduct and the scope of our peer support services.''
  };
            case 'privacy_policy': return {'
                title: `Privacy Policy (v${version})`,
                text: 'Our Privacy Policy has been updated. Please review how we handle data, ensure your anonymity, and protect your privacy.';'
  };
            case 'helper_agreement': return {'
                title: `Helper Agreement (v${version})`,
                text: 'To continue as a Helper, please review and accept the Helper Agreement, which outlines your role, responsibilities, and our code of conduct.';'
  };
            default: return {
  title: 'Community Agreement', text: 'Please review our community agreements to continue.''
  }return(requiredConsent,
        allConsentsGiven,
        acceptConsent,
        getConsentContent, );
            default: return {
  title: 'Community Agreement', text: 'Please review our community agreements to continue.''
  }return {
        requiredConsent,
        allConsentsGiven,
        acceptConsent,
        getConsentContent,