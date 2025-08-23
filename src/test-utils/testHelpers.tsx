/**
 * Common test helpers for handling async operations and state updates
 */

import { act, waitFor } from '@testing-library/react';

/**
 * Wraps an async function with act() to handle React state updates properly
 */
export const actAsync = async (fn: () => Promise<void> | void) => {
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
) => {
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
export const flushPromises = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * Advances timers and flushes promises with act() wrapping
 */
export const advanceTimersWithAct = async (ms?: number) => {
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
export const nextTick = async () => {
  await act(async () => {
    await new Promise(resolve => process.nextTick(resolve));
  });
};

/**
 * Helper to simulate user interaction with proper act() wrapping
 */
export const simulateUserAction = async (
  _element: HTMLElement,
  action: () => void
) => {
  await act(async () => {
    action();
    await flushPromises();
  });
};

/**
 * Helper to wait for component to be ready after mount
 */
export const waitForComponentReady = async (timeout = 1000) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  await waitFor(() => true, { timeout });
};

/**
 * Helper to handle async state updates in hooks
 */
export const updateHookState = async <T,>(
  hookResult: { current: T },
  updater: (current: T) => void | Promise<void>
) => {
  await act(async () => {
    await updater(hookResult.current);
    await flushPromises();
  });
};

/**
 * Helper to mock and wait for API calls
 */
export const mockApiCall = async <T,>(
  mockFn: jest.Mock,
  returnValue: T,
  delay = 0
) => {
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
 * Helper to setup and cleanup fake timers
 */
export const useFakeTimers = () => {
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
 * Helper to mock console methods for cleaner test output
 */
export const mockConsole = () => {
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
    }
  };
};

/**
 * Helper to create a test wrapper with providers
 */
export const createTestWrapper = (
  providers: React.ComponentType<{ children: React.ReactNode }>[]
) => {
  return ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      <>{children}</>
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
) => {
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
) => {
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
export const cleanupTest = async () => {
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
  cleanupTest
};