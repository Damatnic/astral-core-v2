import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useSwipeRef } from '../hooks/useSwipeGesture';

interface SwipeNavigationContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  canSwipeBack: boolean;
  onSwipeBack: () => void;
  registerSwipeArea: (element: HTMLElement) => void;
  unregisterSwipeArea: (element: HTMLElement) => void;
}

const SwipeNavigationContext = createContext<SwipeNavigationContextType | null>(null);

export const useSwipeNavigation = () => {
  const context = useContext(SwipeNavigationContext);
  if (!context) {
    throw new Error('useSwipeNavigation must be used within SwipeNavigationProvider');
  }
  return context;
};

interface SwipeNavigationProviderProps {
  children: React.ReactNode;
  onNavigateBack?: () => void;
  currentPath?: string;
}

export const SwipeNavigationProvider: React.FC<SwipeNavigationProviderProps> = ({
  children,
  onNavigateBack,
  currentPath = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const swipeAreasRef = useRef<Set<HTMLElement>>(new Set());
  
  // Determine if we can swipe back based on navigation history
  const canSwipeBack = Boolean(onNavigateBack && currentPath && currentPath !== '/');

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    document.body.style.overflow = ''; // Restore scroll
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }, [isSidebarOpen, openSidebar, closeSidebar]);

  const onSwipeBack = useCallback(() => {
    if (canSwipeBack && onNavigateBack) {
      onNavigateBack();
    }
  }, [canSwipeBack, onNavigateBack]);

  const registerSwipeArea = useCallback((element: HTMLElement) => {
    swipeAreasRef.current.add(element);
  }, []);

  const unregisterSwipeArea = useCallback((element: HTMLElement) => {
    swipeAreasRef.current.delete(element);
  }, []);

  // Global swipe handlers for edge swipes
  const { ref: globalSwipeRef } = useSwipeRef<HTMLDivElement>({
    threshold: 50,
    velocityThreshold: 0.2,
    onSwipeRight: (gesture) => {
      // Only open sidebar if swipe starts from left edge (< 50px from edge)
      const startX = gesture.distance > 0 ? 0 : 50; // Approximate edge detection
      if (startX < 50 && !isSidebarOpen) {
        openSidebar();
      }
    },
    onSwipeLeft: () => {
      if (isSidebarOpen) {
        closeSidebar();
      } else if (canSwipeBack) {
        onSwipeBack();
      }
    },
  });

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  // Style objects for esbuild compatibility
  const overlayButtonStyle: React.CSSProperties = { border: 'none', padding: 0, background: 'transparent' };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('.sidebar-panel');
      const trigger = document.querySelector('.sidebar-trigger');
      
      if (isSidebarOpen && 
          sidebar && 
          !sidebar.contains(target) && 
          trigger && 
          !trigger.contains(target)) {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSidebarOpen, closeSidebar]);

  const contextValue: SwipeNavigationContextType = React.useMemo(() => ({
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    canSwipeBack,
    onSwipeBack,
    registerSwipeArea,
    unregisterSwipeArea,
  }), [
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    canSwipeBack,
    onSwipeBack,
    registerSwipeArea,
    unregisterSwipeArea,
  ]);

  // Compute classNames outside JSX for esbuild compatibility
  const overlayClassName = 'sidebar-overlay' + (isSidebarOpen ? ' swipe-active' : '');
  const panelClassName = 'sidebar-panel' + (isSidebarOpen ? ' swipe-active' : '');
  
  // Handler function for keydown
  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      closeSidebar();
    }
  };

  return (
    <SwipeNavigationContext.Provider value={contextValue}>
      <div ref={globalSwipeRef} className="swipe-navigation-container">
        {children}
        
        <button 
          className={overlayClassName}
          onClick={closeSidebar}
          onKeyDown={handleOverlayKeyDown}
          aria-hidden={!isSidebarOpen}
          aria-label="Close navigation menu"
          style={overlayButtonStyle}
        />
        
        <nav 
          className={panelClassName}
          aria-label="Navigation menu"
          aria-hidden={!isSidebarOpen}
        >
          <div className="sidebar-header">
            <h2>Navigation</h2>
            <button 
              className="sidebar-close-btn touch-optimized"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>
          <div className="sidebar-content"></div>
        </nav>
      </div>
    </SwipeNavigationContext.Provider>
  );
};

// Hook for components that need to add swipe gesture support
export const useSwipeGestures = (
  element: HTMLElement | null,
  options: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    disabled?: boolean;
  } = {}
) => {
  const { registerSwipeArea, unregisterSwipeArea } = useSwipeNavigation();
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, disabled = false } = options;

  const { ref } = useSwipeRef({
    threshold: 50,
    velocityThreshold: 0.3,
    onSwipeLeft: disabled ? undefined : onSwipeLeft,
    onSwipeRight: disabled ? undefined : onSwipeRight,
    onSwipeUp: disabled ? undefined : onSwipeUp,
    onSwipeDown: disabled ? undefined : onSwipeDown,
  });

  useEffect(() => {
    if (element && !disabled) {
      registerSwipeArea(element);
      return () => unregisterSwipeArea(element);
    }
  }, [element, disabled, registerSwipeArea, unregisterSwipeArea]);

  return { ref };
};

// Higher-order component for adding swipe navigation to any component
export const withSwipeNavigation = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => (
    <SwipeNavigationProvider>
      <Component {...props} />
    </SwipeNavigationProvider>
  );
};
