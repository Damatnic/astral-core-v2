/**
 * Auth0 Service for CoreV2
 * Handles authentication, authorization, and token management
 */

import { Auth0Client } from '@auth0/auth0-spa-js';
import { User, Helper } from '../types';
import { isProduction } from '../utils/envValidator';

import { ENV } from '../utils/envConfig';

// Auth0 configuration with fallbacks for development
const auth0Config = {
  domain: ENV.AUTH0_DOMAIN,
  clientId: ENV.AUTH0_CLIENT_ID,
  redirectUri: ENV.AUTH0_CALLBACK_URL,
  audience: ENV.AUTH0_AUDIENCE,
  scope: 'openid profile email offline_access',
  useRefreshTokens: true,
  cacheLocation: 'localstorage' as const,
  ...(isProduction() && {
    cacheLocation: 'memory' as const, // More secure in production
  }),
};

// User roles
export enum UserRole {
  USER = 'user',
  HELPER = 'helper',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  CRISIS_RESPONDER = 'crisis_responder',
}

// Token storage keys
const TOKEN_STORAGE_KEY = 'corev2_auth_token';
const REFRESH_TOKEN_KEY = 'corev2_refresh_token';
const USER_STORAGE_KEY = 'corev2_user';

class Auth0Service {
  private auth0Client: Auth0Client | null = null;
  private currentUser: User | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize Auth0 client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.auth0Client = new Auth0Client(auth0Config);
      
      // Check if user is already authenticated
      const isAuthenticated = await this.auth0Client.isAuthenticated();
      
      if (isAuthenticated) {
        await this.handleAuthentication();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Auth0:', error);
      throw new Error('Authentication service initialization failed');
    }
  }

  /**
   * Login with redirect
   */
  async login(options?: { 
    screen_hint?: 'signup' | 'login';
    prompt?: 'none' | 'login' | 'consent' | 'select_account';
    connection?: string;
  }): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    await this.auth0Client.loginWithRedirect({
      ...options,
      appState: {
        returnTo: window.location.pathname,
      },
    });
  }

  /**
   * Login with popup
   */
  async loginWithPopup(options?: any): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.loginWithPopup(options);
      await this.handleAuthentication();
    } catch (error) {
      console.error('Popup login failed:', error);
      throw error;
    }
  }

  /**
   * Handle authentication callback
   */
  async handleCallback(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    const result = await this.auth0Client.handleRedirectCallback();
    await this.handleAuthentication();
    
    // Redirect to return URL or home
    const returnTo = result.appState?.returnTo || '/';
    window.history.replaceState({}, document.title, returnTo);
  }

  /**
   * Handle post-authentication tasks
   */
  private async handleAuthentication(): Promise<void> {
    if (!this.auth0Client) return;

    try {
      // Get user profile
      const user = await this.auth0Client.getUser();
      if (!user) return;

      // Get tokens
      const token = await this.auth0Client.getTokenSilently();
      
      // Transform Auth0 user to app user
      this.currentUser = this.transformAuth0User(user);
      
      // Store authentication data securely
      this.storeAuthData(token, this.currentUser);
      
      // Setup token refresh
      this.setupTokenRefresh();
      
      // Emit authentication event
      this.emitAuthEvent('authenticated', this.currentUser);
    } catch (error) {
      console.error('Authentication handling failed:', error);
      throw error;
    }
  }

  /**
   * Transform Auth0 user to app user format
   */
  private transformAuth0User(auth0User: any): User {
    return {
      id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name || auth0User.nickname,
      picture: auth0User.picture,
      roles: this.extractUserRoles(auth0User),
      isEmailVerified: auth0User.email_verified,
      createdAt: auth0User.created_at,
      updatedAt: auth0User.updated_at,
    };
  }

  /**
   * Extract user roles from Auth0 user
   */
  private extractUserRoles(auth0User: any): UserRole[] {
    const namespace = 'https://corev2.com/';
    const roles = auth0User[`${namespace}roles`] || 
                  auth0User.app_metadata?.roles || 
                  [UserRole.USER];
    
    return Array.isArray(roles) ? roles : [roles];
  }

  /**
   * Store authentication data securely
   */
  private storeAuthData(token: string, user: User): void {
    // In production, use more secure storage
    if (isProduction()) {
      // Store in memory only
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      // Development: use localStorage for persistence
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }

    // Refresh token every 10 minutes
    this.tokenRefreshTimer = setInterval(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, logout user
        await this.logout();
      }
    }, 10 * 60 * 1000);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      const token = await this.auth0Client.getTokenSilently();
      
      this.storeAuthData(token, this.currentUser!);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.auth0Client) {
      return null;
    }

    try {
      return await this.auth0Client.getTokenSilently();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get from storage
    const storage = isProduction() ? sessionStorage : localStorage;
    const storedUser = storage.getItem(USER_STORAGE_KEY);
    
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }

    // Try to get from Auth0
    if (this.auth0Client && await this.auth0Client.isAuthenticated()) {
      const auth0User = await this.auth0Client.getUser();
      if (auth0User) {
        this.currentUser = this.transformAuth0User(auth0User);
        return this.currentUser;
      }
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.auth0Client) {
      return false;
    }

    return await this.auth0Client.isAuthenticated();
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: UserRole): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    return user.roles?.includes(role) || false;
  }

  /**
   * Check if user has unknown of the specified roles
   */
  async hasAnyRole(roles: UserRole[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user?.roles) return false;
    
    return roles.some(role => user.roles!.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  async hasAllRoles(roles: UserRole[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user?.roles) return false;
    
    return roles.every(role => user.roles!.includes(role));
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<void> {
    if (!this.auth0Client || !this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Update in Auth0
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`https://${auth0Config.domain}/api/v2/users/${this.currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updates.name,
        picture: updates.picture,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    // Update local user
    this.currentUser = { ...this.currentUser, ...updates };
    this.storeAuthData(token, this.currentUser);
    this.emitAuthEvent('profileUpdated', this.currentUser);
  }

  /**
   * Logout
   */
  async logout(options?: { returnTo?: string }): Promise<void> {
    if (!this.auth0Client) {
      this.clearAuthData();
      return;
    }

    this.clearAuthData();
    this.currentUser = null;
    
    await this.auth0Client.logout({
      logoutParams: {
        returnTo: options?.returnTo || window.location.origin,
      }
    });
    
    this.emitAuthEvent('logout', null);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`https://${auth0Config.domain}/dbconnections/change_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: auth0Config.clientId,
        email,
        connection: 'Username-Password-Authentication',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to request password reset');
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`https://${auth0Config.domain}/api/v2/users/${this.currentUser?.id}/multifactor/guardian`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to enable 2FA');
    }
  }

  /**
   * Emit authentication events
   */
  private emitAuthEvent(type: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`auth:${type}`, { detail: data }));
  }

  /**
   * Subscribe to authentication events
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const handleAuth = (event: CustomEvent) => callback(event.detail);
    const handleLogout = () => callback(null);
    
    window.addEventListener('auth:authenticated', handleAuth as EventListener);
    window.addEventListener('auth:profileUpdated', handleAuth as EventListener);
    window.addEventListener('auth:logout', handleLogout);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('auth:authenticated', handleAuth as EventListener);
      window.removeEventListener('auth:profileUpdated', handleAuth as EventListener);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }

  /**
   * Get Auth0 management API token (admin only)
   */
  async getManagementToken(): Promise<string | null> {
    if (!await this.hasRole(UserRole.ADMIN)) {
      throw new Error('Admin access required');
    }

    const token = await this.getAccessToken();
    if (!token) return null;

    // In production, this should be done server-side
    const response = await fetch(`https://${auth0Config.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: auth0Config.clientId,
        client_secret: ENV.AUTH0_CLIENT_SECRET,
        audience: `https://${auth0Config.domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get management token');
    }

    const data = await response.json();
    return data.access_token;
  }
}

// Export singleton instance
export const auth0Service = new Auth0Service();

// Export for backward compatibility
export const authService = {
  initialize: () => auth0Service.initialize(),
  login: (options?: any) => auth0Service.login(options),
  logout: () => auth0Service.logout(),
  getUser: () => auth0Service.getCurrentUser(),
  isAuthenticated: () => auth0Service.isAuthenticated(),
  getAccessToken: () => auth0Service.getAccessToken(),
  hasRole: (role: UserRole) => auth0Service.hasRole(role),
  updateProfile: (updates: Partial<User>) => auth0Service.updateProfile(updates),
  onAuthStateChange: (callback: (user: User | null) => void) => auth0Service.onAuthStateChange(callback),
  
  // Legacy support for Helper profile
  setUpdater(updater: (profile: Helper) => void) {
    // Convert to new auth system
    auth0Service.onAuthStateChange((user) => {
      if (user?.roles?.includes(UserRole.HELPER)) {
        updater(user as unknown as Helper);
      }
    });
  },
  
  updateHelperProfile(profile: Helper) {
    auth0Service.updateProfile(profile as Partial<User>);
  },
};

export default auth0Service;