import { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from "react"
import { WebAuthSession } from "../services/webAuthService"
import { ApiClient } from "../utils/ApiClient"
import { Helper } from "../types"
import { AuthUser, JWTPayload, DemoUser } from "../types/auth.types"
import { useNotification } from "./NotificationContext"
import { localStorageService } from "../services/localStorageService"
import { logger } from "../utils/logger"

// Auth0 Configuration (Optional)
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || ""
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || ""
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || ""
const REDIRECT_URI = AUTH0_DOMAIN ? WebAuthSession.makeRedirectUri() : ""
export interface OptionalAuthContextType {
  isAuthenticated: boolean
  isAnonymous: boolean
  user: AuthUser | null
  helperProfile: Helper | null
  isNewUser: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  register: (email?: string, password?: string, name?: string) => Promise<void>
  reloadProfile: () => Promise<void>
  updateHelperProfile: (updatedProfile: Helper) => void
  userToken: string | null
  anonymousId: string | null
  authState?: {
    isAuthenticated: boolean
    isAnonymous: boolean
    user: AuthUser | null
    helperProfile: Helper | null
    userToken: string | null
    anonymousId: string | null
  }
}

// Global state object
export const authState: {
  isAuthenticated: boolean
  isAnonymous: boolean
  user: AuthUser | null
  helperProfile: Helper | null
  userToken: string | null
  anonymousId: string | null
}={
  isAuthenticated: false,
  isAnonymous: true,
  user: null,
  helperProfile: null,
  userToken: null,
  anonymousId: null
}

const OptionalAuthContext = createContext<OptionalAuthContextType | undefined>(undefined);

export { OptionalAuthContext }

// Helper to decode JWT payload
const jwtDecode = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if(!base64Url) {
      logger.error("Invalid JWT: Missing payload part.", undefined, "OptionalAuthContext");
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    logger.error("Failed to decode JWT", e, "OptionalAuthContext");
    return null;
  }
};

export const OptionalAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [helperProfile, setHelperProfile] = useState<Helper | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { addToast } = useNotification()

  // Initialize Auth0 discovery only if configured
  const discovery = WebAuthSession.useAutoDiscovery(`https://${AUTH0_DOMAIN || 'example.com'}`);
  const [request, response, promptAsync] = WebAuthSession.useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      responseType: WebAuthSession.ResponseType.Token,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        audience: AUTH0_AUDIENCE
      }
    },
    !!AUTH0_DOMAIN
  );

  const fetchHelperProfile = useCallback(async (auth0UserId: string) => {
    if (!auth0UserId) return
    try {
      const profile = await ApiClient.helpers.getProfile(auth0UserId);
      if(profile) {
        setHelperProfile(profile)
        setIsNewUser(false)
      } else {
        setHelperProfile(null)
        setIsNewUser(true)
      }
    } catch(error) {
      logger.error("Failed to fetch helper profile", error, "OptionalAuthContext")
      setHelperProfile(null)
      setIsNewUser(true)
    }
  }, [])

  const setAuthData = useCallback(async (accessToken: string | null) => {
    if(accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
      const decodedToken = jwtDecode(accessToken);
      if (decodedToken) {
        setUser({
          ...decodedToken,
          id: decodedToken.sub,
          email: decodedToken.email || ''
        } as AuthUser);
      }
      setIsAnonymous(false);
      if(decodedToken?.sub) {
        await fetchHelperProfile(decodedToken.sub);
      }
    } else {
      sessionStorage.removeItem("accessToken");
      setUser(null);
      setHelperProfile(null);
      setIsNewUser(false);
      setIsAnonymous(true);
    }
  }, [fetchHelperProfile]);

  // Initialize anonymous user on mount
  useEffect(() => {
    // Generate or retrieve anonymous ID
    let anonId = localStorageService.getAnonymousId();
    if(!anonId) {
      anonId = crypto.randomUUID();
      localStorageService.setAnonymousId(anonId);
    }
    setAnonymousId(anonId);
    
    // Generate or retrieve user token for anonymous users
    let token = localStorage.getItem("userToken");
    if(!token) {
      token = crypto.randomUUID();
      localStorage.setItem("userToken", token);
    }
    setUserToken(token);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true)
    // Check if this is a demo user logout
    const demoUser = localStorage.getItem("demo_user");
    if(demoUser) {
      localStorage.removeItem("demo_user");
      localStorage.removeItem("demo_token")
    }
    
    // Clear auth state but maintain anonymous access
    await setAuthData(null)
    
    // Reset to anonymous state
    setIsAnonymous(true)
    
    // Update global auth state
    authState.isAuthenticated = false
    authState.isAnonymous = true
    authState.user = null
    authState.helperProfile = null
    setIsLoading(false)
    
    // If Auth0 is configured and user was authenticated, perform Auth0 logout
    if(discovery?.endSessionEndpoint && !isAnonymous) {
      const logoutUrl = `${discovery.endSessionEndpoint}?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
      window.location.assign(logoutUrl);
    }
  }, [discovery, setAuthData, isAnonymous])

  // Load existing session on mount
  useEffect(() => {
    const loadToken = async () => {
      logger.debug("Starting token load", undefined, "OptionalAuthContext");
      setIsLoading(true)
      try {
        // Check for demo user first
        const demoUser = localStorage.getItem("demo_user");
        const demoToken = localStorage.getItem("demo_token");
        if(demoUser && demoToken) {
          logger.debug("Loading demo user", undefined, "OptionalAuthContext");
          const userData = JSON.parse(demoUser) as DemoUser
          setUser({
            ...userData,
            sub: userData.id,
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
            email: userData.email
          } as AuthUser)
          setUserToken(demoToken)
          setIsAnonymous(false);
          
          if(userData.helperProfile) {
            setHelperProfile(userData.helperProfile)
            setIsNewUser(false)
          } else {
            setHelperProfile(null)
            setIsNewUser(userData.userType === "helper")
          }
          authState.isAuthenticated = true
          authState.isAnonymous = false
          authState.user = {
            ...userData,
            sub: userData.id,
            exp: Math.floor(Date.now() / 1000) + 86400,
            email: userData.email
          } as AuthUser
          authState.helperProfile = userData.helperProfile || null
          authState.userToken = demoToken
          setIsLoading(false);
          return;
        }
        
        // Check for existing auth token
        const storedToken = sessionStorage.getItem("accessToken");
        if(storedToken) {
          const decodedToken = jwtDecode(storedToken);
          if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            await setAuthData(storedToken)
            setIsAnonymous(false)
          } else {
            // Token expired, clear it
            await setAuthData(null)
          }
        }
        
        // If no auth, remain anonymous
        logger.debug("No authentication found, using anonymous mode", undefined, "OptionalAuthContext");
      } catch(error) {
        logger.error("Error during token loading:", error, "OptionalAuthContext");
        // Default to anonymous mode on error
        await setAuthData(null);
      } finally {
        logger.debug("Token load complete", undefined, "OptionalAuthContext");
        setIsLoading(false)
      }
    }
    loadToken()
  }, [setAuthData])

  // Handle Auth0 response
  useEffect(() => {
    if(response?.type === "success") {
      setAuthData(response.params.access_token)
    } else if(response?.type === "error") {
      addToast("Authentication error: " + (response.params.error_description || response.error?.message), "error");
      logger.error("Authentication error", response.error, "OptionalAuthContext");
    }
  }, [response, setAuthData, addToast])

  const login = useCallback(async () => {
    // If Auth0 is not configured, show a message
    if(!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
      addToast("Login is optional. You can use all features without signing in!", "info");
      return;
    }
    
    if(!request) {
      const errorMessage = "Authentication service is not configured correctly.";
      logger.error(errorMessage, undefined, "OptionalAuthContext");
      addToast(errorMessage, "error");
      return;
    }
    
    await promptAsync?.();
  }, [request, promptAsync, addToast]);

  const register = useCallback(async () => {
    // For anonymous mode, registration is optional
    if(!AUTH0_DOMAIN) {
      addToast("Registration is optional. You can use all features without an account!", "info");
      return;
    }
    
    // If Auth0 is configured, redirect to Auth0 signup
    await login();
  }, [login, addToast])

  const reloadProfile = useCallback(async () => {
    if(user && typeof user === 'object' && 'sub' in user && user.sub) {
      await fetchHelperProfile(user.sub as string)
    }
  }, [user, fetchHelperProfile])
  
  const updateHelperProfile = useCallback((updatedProfile: Helper) => {
    setHelperProfile(updatedProfile)
  }, [])

  const value = useMemo(() => ({
    isAuthenticated: !!user && !isAnonymous,
    isAnonymous,
    user,
    helperProfile,
    isNewUser,
    isLoading,
    login,
    logout,
    register,
    reloadProfile,
    updateHelperProfile,
    userToken,
    anonymousId,
    authState: {
      isAuthenticated: !!user && !isAnonymous, 
      isAnonymous,
      user, 
      helperProfile, 
      userToken,
      anonymousId
    }
  }), [user, isAnonymous, helperProfile, isNewUser, isLoading, login, logout, register, reloadProfile, updateHelperProfile, userToken, anonymousId])

  // Sync with global state object
  useEffect(() => {
    authState.isAuthenticated = value.isAuthenticated;
    authState.isAnonymous = value.isAnonymous;
    authState.user = value.user;
    authState.helperProfile = value.helperProfile;
    authState.userToken = value.userToken;
    authState.anonymousId = value.anonymousId;
  }, [value])

  return <OptionalAuthContext.Provider value={value}>{children}</OptionalAuthContext.Provider>;
}

export const useOptionalAuth = (): OptionalAuthContextType => {
  const context = useContext(OptionalAuthContext);
  if(context === undefined) {
    throw new Error("useOptionalAuth must be used within an OptionalAuthProvider");
  }
  return context;
}
  }), [user, isAnonymous, helperProfile, isNewUser, isLoading, login, logout, register, reloadProfile, updateHelperProfile, userToken, anonymousId])

  // Sync with global state object
  useEffect(() => {
    authState.isAuthenticated = value.isAuthenticated;
    authState.isAnonymous = value.isAnonymous;
    authState.user = value.user;
    authState.helperProfile = value.helperProfile;
    authState.userToken = value.userToken;
    authState.anonymousId = value.anonymousId;
  }, [value])

  return <OptionalAuthContext.Provider value={value}>{children}</OptionalAuthContext.Provider>;
}

export const useOptionalAuth = (): OptionalAuthContextType => {
  const context = useContext(OptionalAuthContext);
  if(context === undefined) {
    throw new Error("useOptionalAuth must be used within an OptionalAuthProvider");
  }
  return context;
}