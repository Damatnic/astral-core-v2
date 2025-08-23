/**
 * Authentication Guard Component
 * Protects routes and components based on authentication status and roles
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth0Service, UserRole } from '../../services/auth0Service';
import { User } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  requireAllRoles?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRoles = [],
  requireAllRoles = false,
  fallback = <LoadingSpinner />,
  redirectTo = '/login',
  onUnauthorized,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    
    // Subscribe to auth changes
    const unsubscribe = auth0Service.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      checkAccess(user);
    });

    return unsubscribe;
  }, [requireAuth, requireRoles, requireAllRoles]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication
      const authenticated = await auth0Service.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const currentUser = await auth0Service.getCurrentUser();
        await checkAccess(currentUser);
      } else {
        setHasAccess(!requireAuth);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = async (user: User | null) => {
    // If auth not required, grant access
    if (!requireAuth) {
      setHasAccess(true);
      return;
    }

    // If auth required but no user, deny access
    if (!user) {
      setHasAccess(false);
      return;
    }

    // If no specific roles required, grant access to any authenticated user
    if (requireRoles.length === 0) {
      setHasAccess(true);
      return;
    }

    // Check role requirements
    let roleAccess = false;
    if (requireAllRoles) {
      roleAccess = await auth0Service.hasAllRoles(requireRoles);
    } else {
      roleAccess = await auth0Service.hasAnyRole(requireRoles);
    }

    setHasAccess(roleAccess);
    
    if (!roleAccess && onUnauthorized) {
      onUnauthorized();
    }
  };

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check access
  if (!hasAccess) {
    if (requireAuth && !isAuthenticated) {
      // Save the attempted location for redirect after login
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // User is authenticated but doesn't have required roles
    if (isAuthenticated && requireRoles.length > 0) {
      return <UnauthorizedPage />;
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // Access granted
  return <>{children}</>;
};

/**
 * Hook for checking authentication and authorization
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await auth0Service.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const currentUser = await auth0Service.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const unsubscribe = auth0Service.onAuthStateChange((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  const login = async (options?: any) => {
    await auth0Service.login(options);
  };

  const logout = async () => {
    await auth0Service.logout();
  };

  const hasRole = async (role: UserRole) => {
    return await auth0Service.hasRole(role);
  };

  const hasAnyRole = async (roles: UserRole[]) => {
    return await auth0Service.hasAnyRole(roles);
  };

  const hasAllRoles = async (roles: UserRole[]) => {
    return await auth0Service.hasAllRoles(roles);
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};

/**
 * HOC for protecting components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
): React.FC<P> {
  return (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );
}

/**
 * Role-based component visibility
 */
export const CanAccess: React.FC<{
  roles?: UserRole[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles = [], requireAll = false, children, fallback = null }) => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (roles.length === 0) {
        setHasAccess(true);
        return;
      }

      const access = requireAll
        ? await auth0Service.hasAllRoles(roles)
        : await auth0Service.hasAnyRole(roles);
      
      setHasAccess(access);
    };

    checkAccess();
  }, [roles, requireAll]);

  return <>{hasAccess ? children : fallback}</>;
};

// Unauthorized page component
const UnauthorizedPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">403 - Unauthorized</h1>
    <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
    <button
      onClick={() => window.history.back()}
      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
    >
      Go Back
    </button>
  </div>
);

export default AuthGuard;