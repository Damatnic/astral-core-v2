/**
 * Performance and Timing Mock Utilities
 * Provides comprehensive mocking for performance APIs and timing functions
 */

// Performance API Mock
export const mockPerformanceAPI = () => {
  const performanceNow = jest.fn(() => Date.now());
  const performanceMark = jest.fn();
  const performanceMeasure = jest.fn();
  const performanceGetEntriesByType = jest.fn(() => []);
  const performanceGetEntriesByName = jest.fn(() => []);
  const performanceClearMarks = jest.fn();
  const performanceClearMeasures = jest.fn();
  const performanceObserve = jest.fn();
  const performanceDisconnect = jest.fn();

  const mockPerformance = {
    now: performanceNow,
    mark: performanceMark,
    measure: performanceMeasure,
    getEntriesByType: performanceGetEntriesByType,
    getEntriesByName: performanceGetEntriesByName,
    clearMarks: performanceClearMarks,
    clearMeasures: performanceClearMeasures,
    navigation: {
      type: 0,
      redirectCount: 0
    },
    timing: {
      navigationStart: Date.now() - 1000,
      fetchStart: Date.now() - 900,
      domainLookupStart: Date.now() - 800,
      domainLookupEnd: Date.now() - 700,
      connectStart: Date.now() - 600,
      connectEnd: Date.now() - 500,
      requestStart: Date.now() - 400,
      responseStart: Date.now() - 300,
      responseEnd: Date.now() - 200,
      domLoading: Date.now() - 150,
      domInteractive: Date.now() - 100,
      domContentLoadedEventStart: Date.now() - 50,
      domContentLoadedEventEnd: Date.now() - 40,
      domComplete: Date.now() - 30,
      loadEventStart: Date.now() - 20,
      loadEventEnd: Date.now() - 10
    },
    memory: {
      jsHeapSizeLimit: 2147483648,
      totalJSHeapSize: 10485760,
      usedJSHeapSize: 5242880
    }
  };

  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    configurable: true,
    writable: true
  });

  return {
    performanceNow,
    performanceMark,
    performanceMeasure,
    performanceGetEntriesByType,
    performanceGetEntriesByName,
    performanceClearMarks,
    performanceClearMeasures,
    mockPerformance
  };
};

// PerformanceObserver Mock
export class MockPerformanceObserver {
  callback: PerformanceObserverCallback;
  entryTypes: string[] = [];
  
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }
  
  observe(options: { entryTypes: string[] }) {
    this.entryTypes = options.entryTypes;
  }
  
  disconnect() {
    this.entryTypes = [];
  }
  
  takeRecords() {
    return [];
  }
  
  // Helper to trigger observations in tests
  trigger(entries: PerformanceEntry[]) {
    const list = {
      getEntries: () => entries,
      getEntriesByType: (type: string) => entries.filter(e => e.entryType === type),
      getEntriesByName: (name: string) => entries.filter(e => e.name === name)
    };
    this.callback(list as PerformanceObserverEntryList, this);
  }
}

// Request Animation Frame Mock with Fake Timers Support
export const mockRequestAnimationFrame = () => {
  let rafCallbacks: Array<{ id: number; callback: FrameRequestCallback; timestamp: number }> = [];
  let rafId = 0;

  const requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    const id = ++rafId;
    const timestamp = performance.now();
    rafCallbacks.push({ id, callback, timestamp });
    
    // Use setTimeout with 16ms delay (60fps)
    setTimeout(() => {
      const index = rafCallbacks.findIndex(c => c.id === id);
      if (index !== -1) {
        const cb = rafCallbacks[index];
        rafCallbacks.splice(index, 1);
        cb.callback(cb.timestamp);
      }
    }, 16);
    
    return id;
  });

  const cancelAnimationFrame = jest.fn((id: number) => {
    const index = rafCallbacks.findIndex(c => c.id === id);
    if (index !== -1) {
      rafCallbacks.splice(index, 1);
    }
  });

  // Helper to flush all pending animation frames
  const flushAnimationFrames = () => {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach(({ callback, timestamp }) => {
      callback(timestamp);
    });
  };

  global.requestAnimationFrame = requestAnimationFrame;
  global.cancelAnimationFrame = cancelAnimationFrame;

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flushAnimationFrames
  };
};

// Intersection Observer Mock
export class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();
  options: IntersectionObserverInit;
  
  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.options = options;
  }
  
  observe(element: Element) {
    this.elements.add(element);
  }
  
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  
  disconnect() {
    this.elements.clear();
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  
  // Helper to trigger intersection changes in tests
  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: entry.boundingClientRect || {} as DOMRectReadOnly,
      intersectionRatio: entry.intersectionRatio || 0,
      intersectionRect: entry.intersectionRect || {} as DOMRectReadOnly,
      isIntersecting: entry.isIntersecting || false,
      rootBounds: entry.rootBounds || null,
      target: entry.target || document.createElement('div'),
      time: entry.time || performance.now()
    })) as IntersectionObserverEntry[];
    
    this.callback(fullEntries, this);
  }
}

// Resize Observer Mock
export class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements: Set<Element> = new Set();
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe(element: Element) {
    this.elements.add(element);
  }
  
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  
  disconnect() {
    this.elements.clear();
  }
  
  // Helper to trigger resize events in tests
  trigger(entries: Partial<ResizeObserverEntry>[]) {
    const fullEntries = entries.map(entry => ({
      borderBoxSize: entry.borderBoxSize || [{ blockSize: 0, inlineSize: 0 }],
      contentBoxSize: entry.contentBoxSize || [{ blockSize: 0, inlineSize: 0 }],
      contentRect: entry.contentRect || {} as DOMRectReadOnly,
      devicePixelContentBoxSize: entry.devicePixelContentBoxSize || [],
      target: entry.target || document.createElement('div')
    })) as ResizeObserverEntry[];
    
    this.callback(fullEntries, this);
  }
}

// Setup all performance mocks
export const setupPerformanceMocks = () => {
  const performanceMocks = mockPerformanceAPI();
  const rafMocks = mockRequestAnimationFrame();
  
  // Mock PerformanceObserver globally
  (global as any).PerformanceObserver = MockPerformanceObserver;
  
  // Mock IntersectionObserver globally
  (global as any).IntersectionObserver = MockIntersectionObserver;
  
  // Mock ResizeObserver globally
  (global as any).ResizeObserver = MockResizeObserver;
  
  return {
    ...performanceMocks,
    ...rafMocks
  };
};

// Cleanup all performance mocks
export const cleanupPerformanceMocks = () => {
  // Restore original values if needed
  if ('performance' in window) {
    delete (window as any).performance;
  }
  
  if ('requestAnimationFrame' in global) {
    delete (global as any).requestAnimationFrame;
  }
  
  if ('cancelAnimationFrame' in global) {
    delete (global as any).cancelAnimationFrame;
  }
  
  if ('PerformanceObserver' in global) {
    delete (global as any).PerformanceObserver;
  }
  
  if ('IntersectionObserver' in global) {
    delete (global as any).IntersectionObserver;
  }
  
  if ('ResizeObserver' in global) {
    delete (global as any).ResizeObserver;
  }
};

// Fake Timers Helper with Promise Support
export const setupFakeTimersWithPromises = () => {
  jest.useFakeTimers();
  
  // Helper to advance timers and flush promises
  const advanceTimersAndFlushPromises = async (ms: number) => {
    jest.advanceTimersByTime(ms);
    // Flush microtasks
    await Promise.resolve();
    // Flush any pending promises
    await new Promise(resolve => setImmediate(resolve));
  };
  
  // Helper to run all timers and flush promises
  const runAllTimersAndFlushPromises = async () => {
    jest.runAllTimers();
    await Promise.resolve();
    await new Promise(resolve => setImmediate(resolve));
  };
  
  return {
    advanceTimersAndFlushPromises,
    runAllTimersAndFlushPromises
  };
};

// Memory measurement mock
export const mockMemoryMeasurement = () => {
  if (!window.performance.memory) {
    Object.defineProperty(window.performance, 'memory', {
      value: {
        jsHeapSizeLimit: 2147483648,
        totalJSHeapSize: 10485760,
        usedJSHeapSize: 5242880
      },
      configurable: true,
      writable: true
    });
  }
  
  return {
    updateMemory: (used: number, total: number, limit: number) => {
      window.performance.memory.usedJSHeapSize = used;
      window.performance.memory.totalJSHeapSize = total;
      window.performance.memory.jsHeapSizeLimit = limit;
    }
  };
};

// Debounce/Throttle test helper
export const createTimingTestHelper = () => {
  const callbacks: Array<{ fn: Function; delay: number; timestamp: number }> = [];
  
  const scheduleCallback = (fn: Function, delay: number) => {
    callbacks.push({ fn, delay, timestamp: Date.now() });
  };
  
  const flushScheduledCallbacks = (upToTime?: number) => {
    const now = upToTime || Date.now();
    const toExecute = callbacks.filter(cb => cb.timestamp + cb.delay <= now);
    toExecute.forEach(cb => {
      cb.fn();
      const index = callbacks.indexOf(cb);
      if (index > -1) callbacks.splice(index, 1);
    });
  };
  
  return {
    scheduleCallback,
    flushScheduledCallbacks,
    clearCallbacks: () => callbacks.length = 0
  };
};