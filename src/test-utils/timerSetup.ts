/**
 * Timer Setup for Tests
 * Configures fake timers and promise handling for tests
 */

export interface TimerHelpers {
  advanceAndFlush: (ms: number) => Promise<void>;
  runAllAndFlush: () => Promise<void>;
  flushPromises: () => Promise<void>;
  tickAsync: (ms?: number) => Promise<void>;
}

/**
 * Setup fake timers with proper promise handling
 */
export const setupFakeTimers = (): TimerHelpers => {
  jest.useFakeTimers();

  // Flush all pending promises
  const flushPromises = async (): Promise<void> => {
    await new Promise(process.nextTick);
    await new Promise(resolve => setImmediate(resolve));
  };

  // Advance timers and flush promises
  const advanceAndFlush = async (ms: number): Promise<void> => {
    jest.advanceTimersByTime(ms);
    await flushPromises();
  };

  // Run all timers and flush promises
  const runAllAndFlush = async (): Promise<void> => {
    jest.runAllTimers();
    await flushPromises();
  };

  // Tick with optional time and flush
  const tickAsync = async (ms: number = 0): Promise<void> => {
    if (ms > 0) {
      jest.advanceTimersByTime(ms);
    }
    await flushPromises();
  };

  return {
    advanceAndFlush,
    runAllAndFlush,
    flushPromises,
    tickAsync
  };
};

/**
 * Setup debounce/throttle test helpers
 */
export const setupDebounceTest = () => {
  const timers = setupFakeTimers();
  
  const testDebounce = async (fn: Function, delay: number, calls: number[]) => {
    const spy = jest.fn(fn);
    
    // Make calls at specified times
    for (const callTime of calls) {
      await timers.advanceAndFlush(callTime);
      spy();
    }
    
    // Advance past the debounce delay
    await timers.advanceAndFlush(delay + 100);
    
    return spy;
  };
  
  const testThrottle = async (fn: Function, delay: number, calls: number[]) => {
    const spy = jest.fn(fn);
    
    // Make calls at specified times
    for (const callTime of calls) {
      await timers.advanceAndFlush(callTime);
      spy();
    }
    
    // Advance to ensure all throttled calls complete
    await timers.advanceAndFlush(delay + 100);
    
    return spy;
  };
  
  return {
    ...timers,
    testDebounce,
    testThrottle
  };
};

/**
 * Clean up timers after test
 */
export const cleanupTimers = () => {
  jest.clearAllTimers();
  jest.useRealTimers();
};

/**
 * Mock setTimeout and setInterval with tracking
 */
export const mockTimersWithTracking = () => {
  const timeouts: Array<{ id: number; callback: Function; delay: number; timestamp: number }> = [];
  const intervals: Array<{ id: number; callback: Function; delay: number; timestamp: number }> = [];
  let nextId = 1;

  const mockSetTimeout = jest.fn((callback: Function, delay: number = 0) => {
    const id = nextId++;
    timeouts.push({ id, callback, delay, timestamp: Date.now() });
    return id;
  });

  const mockClearTimeout = jest.fn((id: number) => {
    const index = timeouts.findIndex(t => t.id === id);
    if (index > -1) timeouts.splice(index, 1);
  });

  const mockSetInterval = jest.fn((callback: Function, delay: number = 0) => {
    const id = nextId++;
    intervals.push({ id, callback, delay, timestamp: Date.now() });
    return id;
  });

  const mockClearInterval = jest.fn((id: number) => {
    const index = intervals.findIndex(i => i.id === id);
    if (index > -1) intervals.splice(index, 1);
  });

  global.setTimeout = mockSetTimeout as any;
  global.clearTimeout = mockClearTimeout as any;
  global.setInterval = mockSetInterval as any;
  global.clearInterval = mockClearInterval as any;

  return {
    mockSetTimeout,
    mockClearTimeout,
    mockSetInterval,
    mockClearInterval,
    timeouts,
    intervals,
    executeTimeouts: (upToTime?: number) => {
      const now = upToTime || Date.now();
      const toExecute = timeouts.filter(t => t.timestamp + t.delay <= now);
      toExecute.forEach(t => {
        t.callback();
        const index = timeouts.indexOf(t);
        if (index > -1) timeouts.splice(index, 1);
      });
    },
    executeIntervals: (count: number = 1) => {
      intervals.forEach(i => {
        for (let n = 0; n < count; n++) {
          i.callback();
        }
      });
    },
    reset: () => {
      timeouts.length = 0;
      intervals.length = 0;
      nextId = 1;
    }
  };
};