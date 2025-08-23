/**
 * Optimized Router Configuration
 * Implements route-based code splitting with intelligent preloading
 */

import React, { Suspense, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AuthGuard } from './auth/AuthGuard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { UserRole } from '../services/auth0Service';

// Performance monitoring
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  requiresAuth?: boolean;
  roles?: string[];
  preload?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  chunkName?: string;
}

// Route Components with optimized chunking
const routeComponents = {
  // Critical routes - immediate loading
  CrisisView: React.lazy(() =>
    import(/* webpackChunkName: "crisis-critical" */ '../views/CrisisView')
  ),
  CrisisResourcesView: React.lazy(() =>
    import(/* webpackChunkName: "crisis-critical" */ '../views/CrisisResourcesView')
  ),
  SafetyPlanView: React.lazy(() =>
    import(/* webpackChunkName: "crisis-critical" */ '../views/SafetyPlanView')
  ),
  
  // Core routes - high priority
  DashboardView: React.lazy(() =>
    import(/* webpackChunkName: "core-app" */ '../views/DashboardView')
  ),
  LoginView: React.lazy(() =>
    import(/* webpackChunkName: "auth" */ '../views/LoginView')
  ),
  
  // Community features - medium priority
  CommunityView: React.lazy(() =>
    import(/* webpackChunkName: "community" */ '../views/CommunityView')
  ),
  FeedView: React.lazy(() =>
    import(/* webpackChunkName: "community" */ '../views/FeedView')
  ),
  ChatView: React.lazy(() =>
    import(/* webpackChunkName: "communication" */ '../views/ChatView')
  ),
  AIChatView: React.lazy(() =>
    import(/* webpackChunkName: "communication" */ '../views/AIChatView')
  ),
  PeerSupportView: React.lazy(() =>
    import(/* webpackChunkName: "community" */ '../views/PeerSupportView')
  ),
  
  // Wellness features - medium priority
  WellnessView: React.lazy(() =>
    import(/* webpackChunkName: "wellness" */ '../views/WellnessView')
  ),
  AssessmentsView: React.lazy(() =>
    import(/* webpackChunkName: "wellness" */ '../views/AssessmentsView')
  ),
  ReflectionsView: React.lazy(() =>
    import(/* webpackChunkName: "wellness" */ '../views/ReflectionsView')
  ),
  QuietSpaceView: React.lazy(() =>
    import(/* webpackChunkName: "wellness" */ '../views/QuietSpaceView')
  ),
  
  // User management - low priority
  ProfileView: React.lazy(() =>
    import(/* webpackChunkName: "user-management" */ '../views/ProfileView')
  ),
  SettingsView: React.lazy(() =>
    import(/* webpackChunkName: "user-management" */ '../views/SettingsView')
  ),
  
  // Helper/Admin features - low priority
  HelperDashboardView: React.lazy(() =>
    import(/* webpackChunkName: "helper-admin" */ '../views/HelperDashboardView')
  ),
  AdminDashboardView: React.lazy(() =>
    import(/* webpackChunkName: "helper-admin" */ '../views/AdminDashboardView')
  ),
  ModerationDashboardView: React.lazy(() =>
    import(/* webpackChunkName: "helper-admin" */ '../views/ModerationDashboardView')
  ),
  
  // Static pages - lowest priority
  AboutView: React.lazy(() =>
    import(/* webpackChunkName: "static" */ '../views/AboutView')
  ),
  HelpView: React.lazy(() =>
    import(/* webpackChunkName: "static" */ '../views/HelpView')
  ),
  LegalView: React.lazy(() =>
    import(/* webpackChunkName: "static" */ '../views/LegalView')
  ),
  Custom404Page: React.lazy(() =>
    import(/* webpackChunkName: "static" */ '../components/Custom404Page')
  ),
};

// Route configuration with metadata
const routeConfig: RouteConfig[] = [
  // Public routes
  { path: '/login', component: routeComponents.LoginView, requiresAuth: false, priority: 'high' },
  { path: '/about', component: routeComponents.AboutView, requiresAuth: false, priority: 'low' },
  { path: '/legal', component: routeComponents.LegalView, requiresAuth: false, priority: 'low' },
  { path: '/help', component: routeComponents.HelpView, requiresAuth: false, priority: 'low' },
  
  // Crisis routes (always accessible)
  { path: '/crisis', component: routeComponents.CrisisView, requiresAuth: false, priority: 'critical', preload: true },
  { path: '/crisis-resources', component: routeComponents.CrisisResourcesView, requiresAuth: false, priority: 'critical', preload: true },
  
  // Protected routes
  { path: '/', component: routeComponents.DashboardView, requiresAuth: true, priority: 'high', preload: true },
  { path: '/dashboard', component: routeComponents.DashboardView, requiresAuth: true, priority: 'high' },
  { path: '/profile', component: routeComponents.ProfileView, requiresAuth: true, priority: 'low' },
  { path: '/settings', component: routeComponents.SettingsView, requiresAuth: true, priority: 'low' },
  { path: '/feed', component: routeComponents.FeedView, requiresAuth: true, priority: 'medium' },
  { path: '/community', component: routeComponents.CommunityView, requiresAuth: true, priority: 'medium' },
  { path: '/chat', component: routeComponents.ChatView, requiresAuth: true, priority: 'medium' },
  { path: '/ai-chat', component: routeComponents.AIChatView, requiresAuth: true, priority: 'medium' },
  { path: '/assessments', component: routeComponents.AssessmentsView, requiresAuth: true, priority: 'medium' },
  { path: '/wellness', component: routeComponents.WellnessView, requiresAuth: true, priority: 'medium' },
  { path: '/reflections', component: routeComponents.ReflectionsView, requiresAuth: true, priority: 'medium' },
  { path: '/safety-plan', component: routeComponents.SafetyPlanView, requiresAuth: true, priority: 'critical', preload: true },
  { path: '/quiet-space', component: routeComponents.QuietSpaceView, requiresAuth: true, priority: 'medium' },
  { path: '/peer-support', component: routeComponents.PeerSupportView, requiresAuth: true, priority: 'medium' },
  
  // Role-specific routes
  { path: '/helper/*', component: routeComponents.HelperDashboardView, requiresAuth: true, roles: ['helper'], priority: 'low' },
  { path: '/admin/*', component: routeComponents.AdminDashboardView, requiresAuth: true, roles: ['admin'], priority: 'low' },
  { path: '/moderation/*', component: routeComponents.ModerationDashboardView, requiresAuth: true, roles: ['moderator'], priority: 'low' },
];

// Route performance tracker
class RoutePerformanceTracker {
  private readonly metrics: Map<string, any> = new Map();
  
  trackRouteChange(path: string) {
    const startTime = performance.now();
    
    // Mark navigation start
    performance.mark(`route-${path}-start`);
    
    // Store metrics
    this.metrics.set(path, {
      startTime,
      path,
      timestamp: new Date().toISOString(),
    });
  }
  
  trackRouteComplete(path: string) {
    const metric = this.metrics.get(path);
    if (!metric) return;
    
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    // Mark navigation end
    performance.mark(`route-${path}-end`);
    
    // Create performance measure
    try {
      performance.measure(
        `route-${path}`,
        `route-${path}-start`,
        `route-${path}-end`
      );
    } catch (e) {
      console.warn('Failed to measure route performance:', e);
    }
    
    // Log performance data
    console.log(`Route ${path} loaded in ${duration.toFixed(2)}ms`);
    
    // Send to analytics if needed
    this.sendAnalytics({
      ...metric,
      duration,
      endTime,
    });
    
    // Clean up
    this.metrics.delete(path);
  }
  
  private sendAnalytics(data: any) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'route_performance', {
        path: data.path,
        duration: data.duration,
        category: 'Performance',
      });
    }
  }
}

// Preload manager for intelligent route preloading
class PreloadManager {
  private readonly preloadedRoutes = new Set<string>();
  private observer: IntersectionObserver | null = null;
  
  constructor() {
    this.setupIntersectionObserver();
    this.setupIdlePreloading();
  }
  
  private setupIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLElement;
            const href = link.getAttribute('href');
            if (href) {
              this.preloadRoute(href);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }
  
  private setupIdlePreloading() {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
    
    requestIdleCallback(() => {
      // Preload critical routes
      routeConfig
        .filter(route => route.preload || route.priority === 'critical')
        .forEach(route => this.preloadRoute(route.path));
    });
  }
  
  preloadRoute(path: string) {
    if (this.preloadedRoutes.has(path)) return;
    
    const route = routeConfig.find(r => r.path === path);
    if (!route) return;
    
    // Trigger component preload
    if ('preload' in route.component && typeof route.component.preload === 'function') {
      route.component.preload();
      this.preloadedRoutes.add(path);
    }
  }
  
  observeLink(element: HTMLElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }
  
  unobserveLink(element: HTMLElement) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }
  
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Custom loading component with route-specific loading states
const RouteLoadingFallback: React.FC<{ route?: string }> = ({ route }) => {
  const [showSlowWarning, setShowSlowWarning] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowWarning(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="route-loading">
      <LoadingSpinner size="large" />
      <p>Loading {route ? `${route}...` : '...'}</p>
      {showSlowWarning && (
        <p className="loading-slow-warning">
          This is taking longer than usual. Please check your connection.
        </p>
      )}
    </div>
  );
};

// Optimized Router Component
export const OptimizedRouter: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const performanceTracker = useRef(new RoutePerformanceTracker());
  const preloadManager = useRef(new PreloadManager());
  
  // Track route changes
  useEffect(() => {
    performanceTracker.current.trackRouteChange(location.pathname);
    
    return () => {
      performanceTracker.current.trackRouteComplete(location.pathname);
    };
  }, [location]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      preloadManager.current.cleanup();
    };
  }, []);
  
  // Preload adjacent routes based on navigation type
  useEffect(() => {
    if (navigationType === 'PUSH') {
      // User is navigating forward, preload likely next routes
      const currentRouteIndex = routeConfig.findIndex(r => r.path === location.pathname);
      if (currentRouteIndex !== -1 && currentRouteIndex < routeConfig.length - 1) {
        const nextRoute = routeConfig[currentRouteIndex + 1];
        if (nextRoute.priority !== 'low') {
          preloadManager.current.preloadRoute(nextRoute.path);
        }
      }
    }
  }, [location, navigationType]);
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback route={location.pathname} />}>
        <Routes>
          {routeConfig.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiresAuth ? (
                  <AuthGuard requireAuth={true} requireRoles={route.roles as UserRole[]}>
                    <route.component />
                  </AuthGuard>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
          
          {/* Fallback route */}
          <Route path="*" element={<routeComponents.Custom404Page />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

// Link component with preloading support
export const OptimizedLink: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
  preload?: boolean;
}> = ({ to, children, className, preload = true }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const preloadManager = useRef(new PreloadManager());
  
  useEffect(() => {
    if (preload && linkRef.current) {
      preloadManager.current.observeLink(linkRef.current);
    }
    
    return () => {
      if (linkRef.current) {
        preloadManager.current.unobserveLink(linkRef.current);
      }
    };
  }, [preload]);
  
  const handleMouseEnter = useCallback(() => {
    if (preload) {
      preloadManager.current.preloadRoute(to);
    }
  }, [to, preload]);
  
  return (
    <a
      ref={linkRef}
      href={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
    >
      {children}
    </a>
  );
};

// Export route configuration for external use
export { routeConfig, RoutePerformanceTracker, PreloadManager };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default OptimizedRouter;