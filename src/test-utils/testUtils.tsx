import React, { ReactElement } from 'react';
import { render, RenderOptions, renderHook as renderHookBase, RenderHookOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { ThemeProvider } from '../components/ThemeProvider';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Custom renderHook with providers - properly typed for React 18
const customRenderHook = <TProps = unknown, TResult = unknown>(
  hook: (props?: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) => {
  // For React 18 compatibility, ensure document.body is ready
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }
  
  // Ensure there's a container in the body
  if (!document.body.firstChild) {
    const container = document.createElement('div');
    container.setAttribute('id', 'rtl-root');
    document.body.appendChild(container);
  }
  
  // Use provided wrapper or default to AllTheProviders
  const finalOptions: RenderHookOptions<TProps> = {
    wrapper: AllTheProviders,
    ...options
  };
  
  return renderHookBase(hook, finalOptions);
};

export * from '@testing-library/react';
export { customRender as render };
export { customRenderHook as renderHook };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'seeker',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockAssessment = (overrides = {}) => ({
  id: 'test-assessment-id',
  type: 'PHQ-9',
  score: 10,
  severity: 'moderate',
  completedAt: new Date().toISOString(),
  answers: [],
  ...overrides
});

export const createMockCrisisResource = (overrides = {}) => ({
  id: 'test-resource-id',
  name: 'Crisis Hotline',
  phone: '988',
  availability: '24/7',
  description: 'National Suicide Prevention Lifeline',
  ...overrides
});

export const createMockReflection = (overrides = {}) => ({
  id: 'test-reflection-id',
  content: 'Today I feel grateful for...',
  mood: 'grateful',
  createdAt: new Date().toISOString(),
  reactions: {
    heart: 5,
    support: 3,
    empathy: 2
  },
  ...overrides
});

export const createMockMoodEntry = (overrides = {}) => ({
  id: 'test-mood-id',
  mood: 5,
  energy: 7,
  anxiety: 3,
  notes: 'Feeling better today',
  timestamp: new Date().toISOString(),
  ...overrides
});

// Common test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  const mockLocalStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return mockLocalStorage;
};

export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  const mockSessionStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
  });

  return mockSessionStorage;
};

export const mockFetch = (response: any, options = {}) => {
  const mockFetchFn = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
    ...options
  });

  global.fetch = mockFetchFn;
  return mockFetchFn;
};

export const mockNavigator = () => {
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true
  });

  Object.defineProperty(window.navigator, 'vibrate', {
    writable: true,
    value: jest.fn()
  });

  Object.defineProperty(window.navigator, 'share', {
    writable: true,
    value: jest.fn().mockResolvedValue(undefined)
  });
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
  return mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  });
  window.ResizeObserver = mockResizeObserver as any;
  return mockResizeObserver;
};

export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
};

// Crisis detection test helpers
export const mockCrisisDetection = () => ({
  analyzeText: jest.fn().mockResolvedValue({
    severity: 'none',
    confidence: 0.95,
    keywords: [],
    suggestions: []
  }),
  analyzePattern: jest.fn().mockResolvedValue({
    trend: 'stable',
    riskLevel: 'low'
  })
});

// Auth test helpers
export const mockAuth = () => ({
  user: createMockUser(),
  isAuthenticated: true,
  login: jest.fn().mockResolvedValue(true),
  logout: jest.fn().mockResolvedValue(true),
  register: jest.fn().mockResolvedValue(true),
  updateProfile: jest.fn().mockResolvedValue(true)
});

// WebSocket test helpers
export class MockWebSocket {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  });

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

export const mockWebSocket = () => {
  global.WebSocket = MockWebSocket as any;
  return MockWebSocket;
};

// Service Worker test helpers
export const mockServiceWorker = () => {
  const mockRegistration = {
    installing: null,
    waiting: null,
    active: {
      postMessage: jest.fn()
    },
    update: jest.fn().mockResolvedValue(undefined),
    unregister: jest.fn().mockResolvedValue(true)
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn().mockResolvedValue(mockRegistration),
      ready: Promise.resolve(mockRegistration),
      controller: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
  });

  return mockRegistration;
};

// Performance test helpers
export const mockPerformance = () => {
  const entries: unknown[] = [];
  
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => entries),
      getEntriesByName: jest.fn(() => entries),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      clearResourceTimings: jest.fn()
    }
  });

  return {
    addEntry: (entry: any) => entries.push(entry),
    clearEntries: () => entries.length = 0
  };
};

// Accessibility test helpers
export const expectToBeAccessible = (element: HTMLElement) => {
  // Check for proper ARIA attributes
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  
  interactiveElements.forEach(el => {
    // Check for accessible name
    const hasAriaLabel = el.hasAttribute('aria-label');
    const hasAriaLabelledBy = el.hasAttribute('aria-labelledby');
    const hasText = el.textContent?.trim();
    
    expect(hasAriaLabel || hasAriaLabelledBy || hasText).toBeTruthy();
  });

  // Check for proper heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    expect(level - previousLevel).toBeLessThanOrEqual(1);
    previousLevel = level;
  });
};

// Snapshot testing helpers
export const createSnapshotSerializer = () => ({
  test: (val: any) => val && val._isReactElement,
  print: (val: any, serialize: any) => serialize(val)
});

// Async test helpers
export const flushPromises = () => new Promise(setImmediate);

export const waitForAsync = async (callback: () => boolean, timeout = 1000) => {
  const startTime = Date.now();
  
  while (!callback()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

// Console mock helpers
export const mockConsole = () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };

  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();

  return {
    restore: () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    },
    getLogs: () => (console.log as jest.Mock).mock.calls,
    getWarnings: () => (console.warn as jest.Mock).mock.calls,
    getErrors: () => (console.error as jest.Mock).mock.calls
  };
};

// Additional mock helpers for component tests
export const createMockButtonProps = (overrides = {}) => ({
  onClick: jest.fn(),
  children: 'Test Button',
  variant: 'primary' as const,
  size: 'medium' as const,
  ...overrides
});

export const createMockCrisisAlert = (overrides = {}) => ({
  id: 'test-alert-id',
  severity: 'high',
  message: 'Crisis detected',
  timestamp: new Date().toISOString(),
  ...overrides
});

export const mockWindowMethods = () => ({
  open: jest.fn(),
  close: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn()
});

export const createMockFormInputProps = (overrides = {}) => ({
  label: 'Test Input',
  name: 'testInput',
  value: '',
  onChange: jest.fn(),
  ...overrides
});

export const mockUseFormAnimations = () => ({
  shake: false,
  success: false,
  triggerShake: jest.fn(),
  triggerSuccess: jest.fn()
});

export const createMockModalProps = (overrides = {}) => ({
  isOpen: true,
  onClose: jest.fn(),
  title: 'Test Modal',
  children: 'Modal content',
  ...overrides
});

export const mockHTMLElementMethods = () => {
  HTMLElement.prototype.focus = jest.fn();
  HTMLElement.prototype.blur = jest.fn();
  HTMLElement.prototype.click = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
};

// User event helpers
export const user = {
  click: jest.fn(),
  type: jest.fn(),
  clear: jest.fn(),
  selectOptions: jest.fn(),
  tab: jest.fn()
};