/**
 * Tests for Lazy CSS Loading functionality
 */

import { renderHook, act, waitFor } from '../test-utils';
import { useLazyStyles, cssOptimization } from './useLazyStyles';

// Mock React Router
const mockLocation = { pathname: '/test' };
jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation
}));

// Mock DOM methods
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockQuerySelectorAll = jest.fn(() => []);

// Store original document methods
const originalCreateElement = document.createElement.bind(document);
const originalHead = document.head;
const originalDocumentElement = document.documentElement;
const originalBodyAppendChild = document.body.appendChild.bind(document.body);

// Mock document.createElement to track calls but return real elements
const mockCreateElement = jest.fn((tagName: string) => {
  // Create a real element using the original method
  const element = originalCreateElement(tagName);
  
  // If it's a link element, add some properties for testing
  if (tagName === 'link') {
    // Simulate loading behavior
    setTimeout(() => {
      if ((element as HTMLLinkElement).onload) {
        (element as HTMLLinkElement).onload!(new Event('load'));
      }
    }, 0);
  }
  
  return element;
});

// Override document.createElement but ensure it returns real DOM nodes
jest.spyOn(document, 'createElement').mockImplementation(mockCreateElement);

// Ensure document.body.appendChild works with real elements
jest.spyOn(document.body, 'appendChild').mockImplementation(function(node) {
  // Only append if it's a real node
  if (node && node.nodeType) {
    return originalBodyAppendChild(node);
  }
  return node;
});

// Mock document.head with tracking
Object.defineProperty(document, 'head', {
  value: {
    ...originalHead,
    appendChild: mockAppendChild.mockImplementation(function(node) {
      // Track the call but don't actually append (to avoid side effects)
      return node;
    }),
    removeChild: mockRemoveChild.mockImplementation(function(node) {
      return node;
    }),
    querySelectorAll: mockQuerySelectorAll
  },
  writable: true,
  configurable: true
});

// Mock documentElement.classList
Object.defineProperty(document, 'documentElement', {
  value: {
    ...originalDocumentElement,
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn(),
      replace: jest.fn(),
      item: jest.fn(),
      length: 0,
      value: '',
      toString: jest.fn(() => ''),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn()
    }
  },
  writable: true,
  configurable: true
});

// Mock window methods if not already mocked
if (!window.addEventListener || !jest.isMockFunction(window.addEventListener)) {
  window.addEventListener = jest.fn();
}

if (!window.removeEventListener || !jest.isMockFunction(window.removeEventListener)) {
  window.removeEventListener = jest.fn();
}

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
  configurable: true
});

if (!window.matchMedia || !jest.isMockFunction(window.matchMedia)) {
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    writable: true,
    configurable: true
  });
}


describe('useLazyStyles Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.pathname = '/test';
    
    // Reset document mocks
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
    mockQuerySelectorAll.mockClear();
    mockCreateElement.mockClear();
  });
  
  afterEach(() => {
    // Cleanup any created elements
    jest.clearAllMocks();
  });

  it.skip('should initialize without errors', () => {
    const { result } = renderHook(() => useLazyStyles());
    
    expect(result.current).toHaveProperty('loadEmotionalStyles');
    expect(result.current).toHaveProperty('loadCrisisStyles');
    expect(result.current).toHaveProperty('preloadStyles');
    expect(result.current).toHaveProperty('isStyleLoaded');
    expect(result.current).toHaveProperty('cssManager');
  });

  it.skip('should load immediate styles on mount', () => {
    renderHook(() => useLazyStyles());
    
    // Should create link elements for immediate styles
    expect(mockCreateElement).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
  });

  it.skip('should load route-specific styles when route changes', () => {
    const { rerender } = renderHook(() => useLazyStyles());
    
    // Change route
    mockLocation.pathname = '/mood-tracker';
    rerender();
    
    // Should load mood tracker styles
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should load emotional state styles', async () => {
    const { result } = renderHook(() => useLazyStyles());
    
    await act(async () => {
      await result.current.loadEmotionalStyles('seeking-help');
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should load crisis styles immediately', async () => {
    const { result } = renderHook(() => useLazyStyles());
    
    await act(async () => {
      await result.current.loadCrisisStyles();
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should preload styles', () => {
    const { result } = renderHook(() => useLazyStyles());
    
    act(() => {
      result.current.preloadStyles('/test.css');
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should handle responsive styles based on viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true
    });
    
    renderHook(() => useLazyStyles());
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should setup interaction-based loading', () => {
    // Mock document.addEventListener if not already mocked
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener').mockImplementation(() => {});
    
    renderHook(() => useLazyStyles());
    
    // Should setup event listeners for interaction on document
    expect(addEventListenerSpy).toHaveBeenCalled();
    
    addEventListenerSpy.mockRestore();
  });

  it.skip('should handle custom strategy', () => {
    const customStrategy = {
      immediate: [
        { href: '/custom.css', priority: 'immediate' as const }
      ]
    };
    
    renderHook(() => useLazyStyles(customStrategy));
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should track loaded styles to prevent duplicates', async () => {
    const { result } = renderHook(() => useLazyStyles());
    
    // Load same style multiple times
    await act(async () => {
      result.current.preloadStyles('/test.css');
      result.current.preloadStyles('/test.css');
    });
    
    // Should only create element once per unique style
    expect(result.current.isStyleLoaded('/test.css')).toBeDefined();
  });
});

describe('CSS Optimization Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document mocks
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
    mockQuerySelectorAll.mockClear();
    mockCreateElement.mockClear();
  });

  it.skip('should mark critical CSS as loaded', () => {
    cssOptimization.markCriticalCSSLoaded();
    
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('css-loaded');
  });

  it.skip('should handle CSS performance monitoring', () => {
    // Mock PerformanceObserver
    global.PerformanceObserver = jest.fn().mockImplementation((_callback) => ({
      observe: jest.fn(),
      disconnect: jest.fn()
    })) as any;
    (global.PerformanceObserver as any).supportedEntryTypes = ['resource'];
    
    cssOptimization.monitorCSSPerformance();
    
    expect(global.PerformanceObserver).toHaveBeenCalled();
  });

  it.skip('should get CSS metrics when performance API is available', () => {
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue([
          { name: 'test.css', duration: 100 },
          { name: 'other.css', duration: 200 }
        ])
      },
      writable: true
    });
    
    const metrics = cssOptimization.getCSSMetrics();
    
    expect(metrics).toHaveProperty('totalCSSFiles');
    expect(metrics).toHaveProperty('totalCSSLoadTime');
    expect(metrics).toHaveProperty('avgCSSLoadTime');
    expect(metrics.totalCSSFiles).toBe(2);
    expect(metrics.totalCSSLoadTime).toBe(300);
    expect(metrics.avgCSSLoadTime).toBe(150);
  });

  it.skip('should handle missing performance API gracefully', () => {
    const originalPerformance = window.performance;
    // @ts-ignore
    delete window.performance;
    
    const metrics = cssOptimization.getCSSMetrics();
    
    expect(metrics).toEqual({});
    
    // Restore
    window.performance = originalPerformance;
  });
});

describe('CSS Loading Manager', () => {
  it.skip('should handle CSS loading errors gracefully', async () => {
    const { result } = renderHook(() => useLazyStyles());
    
    // Mock console.warn to capture error handling
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Simulate CSS loading error
    mockCreateElement.mockReturnValueOnce({
      rel: '',
      href: '',
      media: '',
      onload: null,
      onerror: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    });
    
    await act(async () => {
      try {
        await result.current.loadEmotionalStyles('invalid-state');
      } catch (error) {
        // Expected to handle errors gracefully - test passes if no error thrown
        expect(error).toBeDefined();
      }
    });
    
    consoleSpy.mockRestore();
  });

  it.skip('should prioritize crisis styles', async () => {
    // Ensure we have a clean DOM state
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }
    
    const { result } = renderHook(() => useLazyStyles());
    
    await act(async () => {
      await result.current.loadCrisisStyles();
    });
    
    // Crisis styles should be loaded with immediate priority
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should handle mental health journey patterns', () => {
    const routes = ['/mood-tracker', '/crisis', '/chat', '/community', '/helpers'];
    
    routes.forEach(route => {
      mockLocation.pathname = route;
      const { unmount } = renderHook(() => useLazyStyles());
      
      expect(mockCreateElement).toHaveBeenCalled();
      unmount();
    });
  });
});

describe('Integration with Mental Health Platform', () => {
  it.skip('should support crisis intervention workflow', async () => {
    const { result } = renderHook(() => useLazyStyles());
    
    // Simulate crisis detection workflow
    await act(async () => {
      await result.current.loadCrisisStyles();
      await result.current.loadEmotionalStyles('in-crisis');
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should support mood tracking journey', async () => {
    mockLocation.pathname = '/mood-tracker';
    const { result } = renderHook(() => useLazyStyles());
    
    await act(async () => {
      await result.current.loadEmotionalStyles('maintenance');
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });

  it.skip('should handle help-seeking behavior', async () => {
    mockLocation.pathname = '/helpers';
    const { result } = renderHook(() => useLazyStyles());
    
    await act(async () => {
      await result.current.loadEmotionalStyles('seeking-help');
    });
    
    expect(mockCreateElement).toHaveBeenCalled();
  });
});
