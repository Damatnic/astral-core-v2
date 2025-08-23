import React, { ReactElement } from 'react';
import { queries, RenderOptions, RenderHookOptions, configure, cleanup, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import ReactDOM from 'react-dom/client';
import { 
  AllMockProviders,
  MockAuthProvider,
  MockNotificationProvider,
  MockThemeProvider,
  MockAuthContextType,
  MockNotificationContextType,
  MockThemeContextType
} from './test-utils/mockContexts';

// Configure React Testing Library for React 18
configure({ 
  reactStrictMode: false
});

// Simple wrapper for hooks that don't need all providers
const SimpleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Full provider wrapper for components using mock providers to avoid initialization issues
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AllMockProviders>{children}</AllMockProviders>;
};

// Track rendered containers for cleanup
const renderedContainers = new Set<HTMLElement>();

// Custom render that properly handles React 18 rendering
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper' | 'queries'>
) {
  // Ensure we have a document
  if (typeof document === 'undefined') {
    throw new Error('Document is not defined. Check jest configuration.');
  }
  
  // Ensure body exists
  if (!document.body) {
    const body = document.createElement('body');
    if (document.documentElement) {
      document.documentElement.appendChild(body);
    }
  }
  
  // Create container for this render
  const container = document.createElement('div');
  container.setAttribute('data-testid', 'test-container');
  
  // Append container to body
  document.body.appendChild(container);
  
  renderedContainers.add(container);
  
  // Store the root for cleanup
  let root: ReactDOM.Root | null = null;
  
  // Create root and render synchronously within act
  act(() => {
    root = ReactDOM.createRoot(container);
    const Wrapper = options?.wrapper || AllTheProviders;
    const element = <Wrapper>{ui}</Wrapper>;
    root.render(element);
  });
  
  // Create RTL-compatible return object
  const baseElement = options?.baseElement || document.body;
  
  // Make sure screen queries work by adding screen functions
  const boundQueries = Object.entries(queries).reduce((acc, [key, query]) => {
    if (typeof query === 'function') {
      acc[key] = query.bind(null, baseElement);
    }
    return acc;
  }, {} as any);
  
  // Update screen object to use our container
  Object.keys(boundQueries).forEach(key => {
    if ((screen as any)[key]) {
      (screen as any)[key] = boundQueries[key];
    }
  });
  
  // Ensure root was created
  if (!root) {
    throw new Error('Failed to create React root');
  }
  
  const finalRoot = root;
  const Wrapper = options?.wrapper || AllTheProviders;
  
  return {
    container,
    baseElement,
    debug: (el = baseElement) => {
      console.log(require('util').inspect(el, false, null, true));
    },
    unmount: () => {
      act(() => {
        finalRoot.unmount();
      });
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      renderedContainers.delete(container);
    },
    rerender: (newUi: ReactElement) => {
      act(() => {
        const newElement = <Wrapper>{newUi}</Wrapper>;
        finalRoot.render(newElement);
      });
    },
    asFragment: () => {
      const template = document.createElement('template');
      template.innerHTML = container.innerHTML;
      return template.content;
    },
    // Add all query methods bound to container
    ...Object.entries(queries).reduce((acc, [key, query]) => {
      if (typeof query === 'function') {
        acc[key] = query.bind(null, container);
      }
      return acc;
    }, {} as any),
  };
}

// Re-export render from RTL for compatibility
import { render as rtlRender } from '@testing-library/react';

// Custom renderHook that properly handles React 18 without using RTL's renderHook
const customRenderHook = <TProps = unknown, TResult = unknown>(
  hook: (props?: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) => {
  // Track the hook result
  let result: { current: TResult };
  let error: Error | null = null;
  
  // Create a test component that calls the hook
  const TestComponent: React.FC<{ props?: TProps }> = ({ props }) => {
    try {
      const hookResult = hook(props);
      result = { current: hookResult };
    } catch (e) {
      error = e as Error;
    }
    return null;
  };
  
  // Create wrapper component
  const Wrapper = options?.wrapper || AllTheProviders;
  
  // Ensure document is ready
  if (typeof document === 'undefined') {
    throw new Error('Document is not defined. Check jest configuration.');
  }
  
  if (!document.body) {
    const body = document.createElement('body');
    if (document.documentElement) {
      document.documentElement.appendChild(body);
    }
  }
  
  // Create container
  let container;
  try {
    container = document.createElement('div');
    if (container && typeof container.setAttribute === 'function') {
      container.setAttribute('data-testid', 'hook-test-container');
    }
    document.body.appendChild(container);
  } catch (e) {
    // Fallback if createElement fails
    container = document.body;
  }
  
  renderedContainers.add(container);
  
  // Create root and render
  let root: ReactDOM.Root | null = null;
  
  act(() => {
    root = ReactDOM.createRoot(container);
    root.render(
      <Wrapper>
        <TestComponent props={options?.initialProps} />
      </Wrapper>
    );
  });
  
  if (!root) {
    throw new Error('Failed to create React root for hook test');
  }
  
  const finalRoot = root;
  
  // Check for errors
  if (error) {
    throw error;
  }
  
  // Return hook test result object
  return {
    result: result!,
    rerender: (newProps?: TProps) => {
      act(() => {
        finalRoot.render(
          <Wrapper>
            <TestComponent props={newProps} />
          </Wrapper>
        );
      });
    },
    unmount: () => {
      act(() => {
        finalRoot.unmount();
      });
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      renderedContainers.delete(container);
    },
    // Compatibility methods
    waitForNextUpdate: async () => {
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    },
    waitFor: async (callback: () => void | Promise<void>, options?: { timeout?: number }) => {
      const timeout = options?.timeout || 1000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        try {
          await act(async () => {
            await callback();
          });
          return;
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      throw new Error('waitFor timeout');
    }
  };
};

// Alternative render function that doesn't use providers at all
function renderWithoutProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper' | 'queries'>
) {
  return customRender(ui, {
    ...options,
    wrapper: SimpleWrapper
  });
}

// Clean up all rendered containers
export function cleanupContainers() {
  renderedContainers.forEach(container => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  renderedContainers.clear();
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { customRender as render, rtlRender };
export { renderWithoutProviders };
export { customRenderHook as renderHook };
export { SimpleWrapper, AllTheProviders };

// Re-export mock context providers and utilities
export {
  MockAuthProvider,
  MockNotificationProvider,
  MockThemeProvider,
  AllMockProviders,
  createMockUseAuth,
  createMockUseNotification,
  createMockUseTheme,
  mockUseLegalConsents,
  resetAllMockContexts,
  defaultMockContexts
} from './test-utils/mockContexts';

// Re-export mock context types
export type {
  MockAuthContextType,
  MockNotificationContextType,
  MockThemeContextType,
  AllProvidersProps
} from './test-utils/mockContexts';

// Re-export commonly used testing utilities explicitly for better TypeScript support
export { screen, fireEvent, waitFor, within, act } from '@testing-library/react';

// Import and re-export userEvent properly
import userEventLib from '@testing-library/user-event';
export const userEvent = userEventLib;

// Mock data creators for tests
export const createMockButtonProps = (overrides = {}) => ({
  onClick: jest.fn(),
  children: 'Test Button',
  variant: 'primary' as const,
  ...overrides
});

export const createMockCrisisAlert = (overrides = {}) => ({
  show: true,
  severity: 'high' as const,
  message: 'Test crisis alert',
  onClose: jest.fn(),
  onDismiss: jest.fn(),
  onEmergencyCall: jest.fn(),
  onCrisisChat: jest.fn(),
  ...overrides
});

export const createMockFormInputProps = (overrides = {}) => ({
  id: 'test-input',
  label: 'Test Input',
  name: 'testInput',
  value: '',
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ...overrides
});

export const createMockModalProps = (overrides = {}) => ({
  isOpen: true,
  onClose: jest.fn(),
  title: 'Test Modal',
  children: 'Modal content',
  ...overrides
});

// Mock window methods
export const mockWindowMethods = () => ({
  alert: jest.fn(),
  confirm: jest.fn(),
  prompt: jest.fn(),
  open: jest.fn()
});

// Mock HTML element methods
export const mockHTMLElementMethods = () => ({
  focus: jest.fn(),
  blur: jest.fn(),
  click: jest.fn(),
  scrollIntoView: jest.fn()
});

// Mock form animations hook
export const mockUseFormAnimations = () => ({
  animateError: jest.fn(),
  animateSuccess: jest.fn(),
  animateWarning: jest.fn(),
  showFieldError: jest.fn(),
  showFieldSuccess: jest.fn(),
  clearFieldState: jest.fn(),
  errors: {},
  successFields: new Set()
});

// User event utilities alias
export const user = userEventLib;

// Timer utility functions for tests
export const setupTestTimers = () => {
  jest.useFakeTimers();
  
  // Mock timer functions for test environment
  global.setInterval = jest.fn(global.setInterval);
  global.clearInterval = jest.fn(global.clearInterval);
  global.setTimeout = jest.fn(global.setTimeout);
  global.clearTimeout = jest.fn(global.clearTimeout);
};

export const cleanupTestTimers = () => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
};

// Async utility for handling state updates in tests
export const waitForAsyncUpdates = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
  });
};

// Timer advance utility with proper act wrapping
export const advanceTimersWithAct = (time: number) => {
  act(() => {
    jest.advanceTimersByTime(time);
  });
};

// Helper function to ensure DOM is ready for React 18
export const ensureDOMReady = () => {
  if (typeof document === 'undefined') {
    throw new Error('document is not defined - JSDOM environment may not be configured');
  }
  
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }
  
  return document.body;
};