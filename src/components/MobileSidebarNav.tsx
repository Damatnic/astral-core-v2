import React, { useEffect, useRef } from 'react';
import { Helper, ActiveView } from '../types';
import { SeekerSidebar } from './SeekerSidebar';
import { HelperSidebar } from './HelperSidebar';
import { useSwipeNavigation } from '../contexts/SwipeNavigationContext';
import { CloseIcon, MenuIcon  } from './icons.dynamic';

interface MobileSidebarNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onlineHelperCount: number;
  userToken: string | null;
  helperProfile: Helper | null;
}

export const MobileSidebarNav: React.FC<MobileSidebarNavProps> = React.memo(({
  activeView,
  setActiveView,
  isAuthenticated,
  onLogout,
  onlineHelperCount,
  userToken,
  helperProfile,
}) => {
  const { isSidebarOpen, openSidebar, closeSidebar } = useSwipeNavigation();
  const sidebarRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
        // Return focus to hamburger menu
        hamburgerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  // Focus management for accessibility
  useEffect(() => {
    if (isSidebarOpen) {
      // Focus first interactive element in sidebar
      const firstButton = sidebarRef.current?.querySelector('button');
      firstButton?.focus();
    }
  }, [isSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isSidebarOpen]);

  const handleSidebarNavigation = () => {
    closeSidebar();
    // Return focus to hamburger menu for keyboard users
    setTimeout(() => {
      hamburgerRef.current?.focus();
    }, 100);
  };

  const handleOverlayClick = () => {
    closeSidebar();
    hamburgerRef.current?.focus();
  };

  return (
    <>
      {/* Mobile Header with Hamburger Menu */}
      <header className="mobile-header">
        <button 
          ref={hamburgerRef}
          className="sidebar-trigger touch-optimized"
          onClick={openSidebar}
          aria-label="Open navigation menu"
          aria-expanded={isSidebarOpen}
          aria-controls="mobile-sidebar"
          type="button"
        >
          <MenuIcon aria-hidden="true" />
          <span className="sr-only">Menu</span>
        </button>
        
        <div className="mobile-header-title">
          <h1 className="app-title">Astral Core</h1>
          <span className="mobile-subtitle">Peer Support Platform</span>
        </div>
        
        <div className="mobile-header-actions">
          {onlineHelperCount > 0 && (
            <output className="online-indicator" aria-live="polite">
              <div className="online-dot" aria-hidden="true"></div>
              <span className="online-text">
                <span className="sr-only">{onlineHelperCount} helpers online</span>
                <span aria-hidden="true">{onlineHelperCount} online</span>
              </span>
            </output>
          )}
        </div>
      </header>

      {/* Overlay */}
      {isSidebarOpen && (
        <button 
          ref={overlayRef}
          className="mobile-sidebar-overlay"
          onClick={handleOverlayClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOverlayClick();
            }
          }}
          aria-label="Close navigation menu"
          type="button"
        />
      )}

      {/* Mobile Sidebar Panel */}
      <nav 
        ref={sidebarRef}
        id="mobile-sidebar"
        className={`mobile-sidebar ${isSidebarOpen ? 'mobile-sidebar-open' : ''}`}
        aria-hidden={!isSidebarOpen}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-title">
            <h2>Navigation</h2>
            <span className="mobile-sidebar-subtitle">Peer Support</span>
          </div>
          <button 
            className="mobile-sidebar-close touch-optimized"
            onClick={() => {
              closeSidebar();
              hamburgerRef.current?.focus();
            }}
            aria-label="Close navigation menu"
            type="button"
          >
            <CloseIcon aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mobile-sidebar-content">
          {isAuthenticated && helperProfile ? (
            <HelperSidebar
              activeView={activeView}
              setActiveView={setActiveView}
              onLogout={() => {
                onLogout();
                handleSidebarNavigation();
              }}
              helperProfile={helperProfile}
              onlineHelperCount={onlineHelperCount}
              isMobile={true}
              onNavigation={handleSidebarNavigation}
            />
          ) : (
            <SeekerSidebar
              activeView={activeView}
              setActiveView={setActiveView}
              userToken={userToken}
              onlineHelperCount={onlineHelperCount}
              isMobile={true}
              onNavigation={handleSidebarNavigation}
            />
          )}
        </div>

        {/* Mobile Sidebar Footer */}
        <div className="mobile-sidebar-footer">
          <div className="swipe-hint">
            <div className="swipe-indicator-line" aria-hidden="true"></div>
            <span className="hint-text">Swipe left or tap outside to close</span>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="desktop-sidebar" aria-label="Desktop navigation">
        <div className="sidebar-header">
          <h2>Peer Support</h2>
        </div>
        <div className="sidebar-content">
          {isAuthenticated && helperProfile ? (
            <HelperSidebar
              activeView={activeView}
              setActiveView={setActiveView}
              onLogout={onLogout}
              helperProfile={helperProfile}
              onlineHelperCount={onlineHelperCount}
              isMobile={false}
            />
          ) : (
            <SeekerSidebar
              activeView={activeView}
              setActiveView={setActiveView}
              userToken={userToken}
              onlineHelperCount={onlineHelperCount}
              isMobile={false}
            />
          )}
        </div>
      </aside>
    </>
  );
});

MobileSidebarNav.displayName = 'MobileSidebarNav';
