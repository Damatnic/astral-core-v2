/**
 * Test Helpers
 *
 * Common test helpers for handling async operations, state updates,
 * and React component testing. Provides utilities for proper act() wrapping,
 * timer management, and testing best practices.
 * 
 * @fileoverview Comprehensive test helpers for React Testing Library
 * @version 2.0.0
 */

import { act, waitFor } from '@testing-library/react';
import React from 'react';

/**
 * Wraps an async function with act() to handle React state updates properly
 */
export const actAsync = async (fn: () => Promise<void> | void): Promise<void> => {
  await act(async () => {
    await fn();
  });
};

/**
 * Waits for a condition with proper act() wrapping
 */
export const waitForWithAct = async (
  callback: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> => {
  return waitFor(
    async () => {
      const result = await callback();
      if (!result) {
        throw new Error('Condition not met');
      }
    },
    options
  );
};

/**
 * Flushes all pending promises and timers
 */
export const flushPromises = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * Advances timers and flushes promises with act() wrapping
 */
export const advanceTimersWithAct = async (ms?: number): Promise<void> => {
  await act(async () => {
    if (ms) {
      jest.advanceTimersByTime(ms);
    } else {
      jest.runAllTimers();
    }
    await flushPromises();
  });
};

/**
 * Helper to wait for next tick with act() wrapping
 */
export const nextTick = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => process.nextTick(resolve));
  });
};

/**
 * Helper to simulate user interaction with proper act() wrapping
 */
export const simulateUserAction = async (
  element: HTMLElement,
  action: () => void
): Promise<void> => {
  await act(async () => {
    action();
    await flushPromises();
  });
};

/**
 * Helper to wait for component to be ready after mount
 */
export const waitForComponentReady = async (timeout = 1000): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  await waitFor(() => true, { timeout });
};

/**
 * Helper to handle async state updates in hooks
 */
export const updateHookState = async <T>(
  hookResult: { current: T },
  updater: (current: T) => void | Promise<void>
): Promise<void> => {
  await act(async () => {
    await updater(hookResult.current);
    await flushPromises();
  });
};

/**
 * Helper to mock and wait for API calls
 */
export const mockApiCall = async <T>(
  mockFn: jest.Mock,
  returnValue: T,
  delay = 0
): Promise<void> => {
  mockFn.mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(returnValue), delay);
      })
  );
  
  if (delay > 0) {
    await act(async () => {
      jest.advanceTimersByTime(delay);
      await flushPromises();
    });
  }
};

/**
 * Timer utilities for testing
 */
export interface TimerUtils {
  advance: (ms: number) => Promise<void>;
  runAll: () => Promise<void>;
  flush: () => Promise<void>;
}

/**
 * Helper to setup and cleanup fake timers
 */
export const useFakeTimers = (): TimerUtils => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  return {
    advance: (ms: number) => advanceTimersWithAct(ms),
    runAll: () => advanceTimersWithAct(),
    flush: () => flushPromises()
  };
};

/**
 * Console utilities for testing
 */
export interface ConsoleUtils {
  expectNoErrors: () => void;
  expectNoWarnings: () => void;
  expectError: (message?: string) => void;
  expectWarning: (message?: string) => void;
}

/**
 * Helper to mock console methods for cleaner test output
 */
export const mockConsole = (): ConsoleUtils => {
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
  };

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
  });

  return {
    expectNoErrors: () => {
      expect(console.error).not.toHaveBeenCalled();
    },
    expectNoWarnings: () => {
      expect(console.warn).not.toHaveBeenCalled();
    },
    expectError: (message?: string) => {
      if (message) {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(message)
        );
      } else {
        expect(console.error).toHaveBeenCalled();
      }
    },
    expectWarning: (message?: string) => {
      if (message) {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(message)
        );
      } else {
        expect(console.warn).toHaveBeenCalled();
      }
    }
  };
};

/**
 * Helper to create a test wrapper with providers
 */
export const createTestWrapper = (
  providers: React.ComponentType<{ children: React.ReactNode }>[]
): React.FC<{ children: React.ReactNode }> => {
  return ({ children }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement
    );
  };
};

/**
 * Helper to wait for loading state to complete
 */
export const waitForLoadingComplete = async (
  getByTestId: (id: string) => HTMLElement,
  loadingTestId = 'loading-spinner',
  timeout = 5000
): Promise<void> => {
  await waitFor(
    () => {
      expect(() => getByTestId(loadingTestId)).toThrow();
    },
    { timeout }
  );
};

/**
 * Helper to test error boundaries
 */
export const testErrorBoundary = async (
  renderFn: () => any,
  expectedError: string | RegExp
): Promise<void> => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

  try {
    await act(async () => {
      expect(() => renderFn()).toThrow(expectedError);
    });
  } finally {
    spy.mockRestore();
  }
};

/**
 * Helper to clean up after tests
 */
export const cleanupTest = async (): Promise<void> => {
  await act(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear all timers
    jest.clearAllTimers();

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Flush promises
    await flushPromises();
  });
};

/**
 * Helper to create mock event objects
 */
export const createMockEvent = (
  type: string, 
  properties: Record<string, any> = {}
): Event & Record<string, any> => {
  return {
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    currentTarget: { value: '' },
    ...properties
  } as Event & Record<string, any>;
};

/**
 * Helper to create mock keyboard events
 */
export const createMockKeyboardEvent = (
  key: string,
  properties: Record<string, any> = {}
): KeyboardEvent & Record<string, any> => {
  return {
    ...createMockEvent('keydown'),
    key,
    code: key,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    ...properties
  } as KeyboardEvent & Record<string, any>;
};

/**
 * Helper to create mock mouse events
 */
export const createMockMouseEvent = (
  type: string,
  properties: Record<string, any> = {}
): MouseEvent & Record<string, any> => {
  return {
    ...createMockEvent(type),
    clientX: 0,
    clientY: 0,
    button: 0,
    buttons: 1,
    ...properties
  } as MouseEvent & Record<string, any>;
};

/**
 * Helper to create mock touch events
 */
export const createMockTouchEvent = (
  type: string,
  touches: any[] = []
): TouchEvent & Record<string, any> => {
  return {
    ...createMockEvent(type),
    touches,
    targetTouches: touches,
    changedTouches: touches
  } as TouchEvent & Record<string, any>;
};

/**
 * Helper to mock form submission
 */
export const mockFormSubmit = (formData: Record<string, any>): Event & Record<string, any> => {
  return createMockEvent('submit', {
    target: {
      elements: Object.keys(formData).reduce((acc, key) => {
        acc[key] = { value: formData[key] };
        return acc;
      }, {} as Record<string, any>)
    }
  });
};

/**
 * Helper to wait for element to appear
 */
export const waitForElement = async (
  selector: string,
  timeout = 5000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        resolve(null);
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
};

/**
 * Helper to wait for multiple elements to appear
 */
export const waitForElements = async (
  selectors: string[],
  timeout = 5000
): Promise<(Element | null)[]> => {
  const promises = selectors.map(selector => waitForElement(selector, timeout));
  return Promise.all(promises);
};

/**
 * Helper to simulate network conditions
 */
export const simulateNetworkCondition = (condition: 'online' | 'offline'): void => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: condition === 'online'
  });

  if (condition === 'offline') {
    window.dispatchEvent(new Event('offline'));
  } else {
    window.dispatchEvent(new Event('online'));
  }
};

/**
 * Helper to mock geolocation
 */
export const mockGeolocation = (
  coords: { latitude: number; longitude: number } | null = null
): void => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementation((success, error) => {
      if (coords) {
        success({
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: 1
          }
        });
      } else {
        error({ code: 1, message: 'Permission denied' });
      }
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };

  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
};

/**
 * Helper to mock media queries
 */
export const mockMediaQuery = (query: string, matches = false): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(q => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

/**
 * Helper to mock intersection observer
 */
export const mockIntersectionObserver = (): void => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  (window as any).IntersectionObserver.prototype.observe = jest.fn();
  (window as any).IntersectionObserver.prototype.unobserve = jest.fn();
  (window as any).IntersectionObserver.prototype.disconnect = jest.fn();
};

/**
 * Helper to mock resize observer
 */
export const mockResizeObserver = (): void => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  (window as any).ResizeObserver.prototype.observe = jest.fn();
  (window as any).ResizeObserver.prototype.unobserve = jest.fn();
  (window as any).ResizeObserver.prototype.disconnect = jest.fn();
};

/**
 * Default export with all utilities
 */
export default {
  actAsync,
  waitForWithAct,
  flushPromises,
  advanceTimersWithAct,
  nextTick,
  simulateUserAction,
  waitForComponentReady,
  updateHookState,
  mockApiCall,
  useFakeTimers,
  mockConsole,
  createTestWrapper,
  waitForLoadingComplete,
  testErrorBoundary,
  cleanupTest,
  createMockEvent,
  createMockKeyboardEvent,
  createMockMouseEvent,
  createMockTouchEvent,
  mockFormSubmit,
  waitForElement,
  waitForElements,
  simulateNetworkCondition,
  mockGeolocation,
  mockMediaQuery,
  mockIntersectionObserver,
  mockResizeObserver
};
