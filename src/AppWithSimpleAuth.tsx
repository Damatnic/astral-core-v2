/**
 * App Component with Simple Auth Integration
 * Uses simple JWT auth instead of Auth0
 */

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import { useAnalyticsTracking } from './hooks/useAnalyticsTracking';
import AppRoutesWithAuth from './routes/AppRoutesWithAuth';

// Providers
import { ThemeProvider } from './components/ThemeProvider';
import { OfflineProvider } from './contexts/OfflineProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { SessionProvider } from './contexts/SessionContext';
import { WellnessProvider } from './contexts/WellnessContext';
import { SwipeNavigationProvider } from './contexts/SwipeNavigationContext';

// Components
import { Sidebar } from './components/Sidebar';
import { NetworkBanner } from './components/NetworkBanner';
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate';
import { CrisisAlert as CrisisAlertFixed } from './components/CrisisAlertFixed';
import PWAInstallBanner from './components/PWAInstallBanner';

// Layout component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-layout">
      {/* Mobile menu toggle button - only visible on mobile */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}
      
      {/* Sidebar with mobile state */}
      <div className={isMobileMenuOpen ? 'sidebar-wrapper mobile-open' : 'sidebar-wrapper'}>
        <Sidebar />
      </div>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <main className="app-content">
        {children}
      </main>
      <CrisisAlertFixed />
      <NetworkBanner />
      <ServiceWorkerUpdate />
      <PWAInstallBanner />
    </div>
  );
};

// Main App Component with Simple Auth
const AppWithSimpleAuth: React.FC = () => {
  const { trackEvent } = useAnalyticsTracking({ componentName: 'App' });

  useEffect(() => {
    // Track app initialization
    trackEvent('app_initialized', {
      category: 'performance',
      properties: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        authType: 'simple'
      }
    });
  }, [trackEvent]);

  useEffect(() => {
    // Set up viewport for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
    }

    // Add app-specific classes to body
    document.body.classList.add('astral-core-app');
    
    // Detect and add platform classes
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      document.body.classList.add('platform-mac');
    } else if (platform.includes('win')) {
      document.body.classList.add('platform-windows');
    } else if (platform.includes('linux')) {
      document.body.classList.add('platform-linux');
    }

    // Detect mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.classList.add('is-mobile');
    }

    return () => {
      document.body.classList.remove('astral-core-app', 'platform-mac', 'platform-windows', 'platform-linux', 'is-mobile');
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <SimpleAuthProvider>
            <ThemeProvider>
              <OfflineProvider>
                <SessionProvider>
                  <WellnessProvider>
                    <SwipeNavigationProvider>
                      <AppLayout>
                        <AppRoutesWithAuth />
                      </AppLayout>
                    </SwipeNavigationProvider>
                  </WellnessProvider>
                </SessionProvider>
              </OfflineProvider>
            </ThemeProvider>
          </SimpleAuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppWithSimpleAuth;