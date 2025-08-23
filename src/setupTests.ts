/**
 * Global test setup file
 * This file is automatically run before all tests
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import { setupDOM, cleanupDOM } from './test-utils/setupDom';
import { setupPerformanceMocks, cleanupPerformanceMocks } from './test-utils/performanceMocks';
// import { cleanupContainers } from './test-utils';

// Setup text encoding/decoding
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock TouchEvent for touch gesture tests
class MockTouchEvent extends Event {
  touches: Touch[];
  targetTouches: Touch[];
  changedTouches: Touch[];

  constructor(type: string, init?: any) {
    super(type, init);
    this.touches = init?.touches || [];
    this.targetTouches = init?.targetTouches || [];
    this.changedTouches = init?.changedTouches || [];
  }
}

// Make TouchEvent available globally
(global as any).TouchEvent = MockTouchEvent;

// Mock Response and Request for service worker and fetch tests
class MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Map<string, string>;
  body: any;
  
  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Map();
    
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          this.headers.set(key, value);
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          this.headers.set(key, value);
        });
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
    }
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
  
  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: Array.from(this.headers.entries())
    });
  }
}

class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  body: any;
  
  constructor(input: string | Request, init?: RequestInit) {
    if (typeof input === 'string') {
      this.url = input;
    } else {
      this.url = input.url;
      this.method = input.method;
    }
    
    this.method = init?.method || 'GET';
    this.headers = new Map();
    this.body = init?.body;
    
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          this.headers.set(key, value);
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          this.headers.set(key, value);
        });
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
    }
  }
  
  clone() {
    return new MockRequest(this.url, {
      method: this.method,
      headers: Array.from(this.headers.entries()),
      body: this.body
    });
  }
}

// Headers mock
class MockHeaders {
  private headers: Map<string, string> = new Map();
  
  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value);
        });
      } else if (init instanceof MockHeaders) {
        init.forEach((value, key) => {
          this.headers.set(key.toLowerCase(), value);
        });
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string);
        });
      }
    }
  }
  
  append(key: string, value: string) {
    this.headers.set(key.toLowerCase(), value);
  }
  
  delete(key: string) {
    this.headers.delete(key.toLowerCase());
  }
  
  get(key: string) {
    return this.headers.get(key.toLowerCase()) || null;
  }
  
  has(key: string) {
    return this.headers.has(key.toLowerCase());
  }
  
  set(key: string, value: string) {
    this.headers.set(key.toLowerCase(), value);
  }
  
  forEach(callback: (value: string, key: string, headers: MockHeaders) => void) {
    this.headers.forEach((value, key) => {
      callback(value, key, this);
    });
  }
  
  entries() {
    return this.headers.entries();
  }
  
  keys() {
    return this.headers.keys();
  }
  
  values() {
    return this.headers.values();
  }
}

// Add to global
(global as any).Response = MockResponse;
(global as any).Request = MockRequest;
(global as any).Headers = MockHeaders;

// Import service mocks
import { setupDefaultMocks } from './__mocks__/services';

// Mock the logger to avoid import.meta issues
jest.mock('./utils/logger');

// Mock envConfig to avoid import.meta issues
jest.mock('./utils/envConfig');

// Mock services that use envConfig
jest.mock('./services/notificationService');
jest.mock('./services/authService');

// Mock crisis stress testing hook to prevent stress testing during tests
jest.mock('./hooks/useCrisisStressTesting', () => ({
  useCrisisStressTesting: jest.fn(() => ({
    state: {
      isTestingActive: false,
      currentTest: null,
      testResults: [],
      failoverResults: [],
      emergencyStatus: { active: false },
      testConfig: {
        maxConcurrentUsers: 10,
        testDuration: 1,
        rampUpTime: 0,
        scenarios: [],
        failureThresholds: {
          responseTime: 1000,
          errorRate: 0.01,
          availability: 0.99
        },
        emergencyBreakConditions: []
      },
      selectedScenarios: []
    },
    actions: {
      runStressTests: jest.fn(() => Promise.resolve()),
      runFailoverTests: jest.fn(() => Promise.resolve()),
      emergencyStop: jest.fn(),
      clearEmergencyStatus: jest.fn(),
      updateTestConfig: jest.fn(),
      toggleScenario: jest.fn(),
      clearResults: jest.fn(),
      exportResults: jest.fn(() => '{}')
    },
    stats: {
      total: 0,
      successful: 0,
      failed: 0,
      critical: 0,
      avgResponseTime: 0,
      avgAvailability: 1,
      safetyScore: 100
    }
  }))
}));

// Mock crisis stress testing system to prevent it from running during tests
jest.mock('./services/crisisStressTestingSystem', () => ({
  crisisStressTestingSystem: {
    runCrisisStressTests: jest.fn(() => Promise.resolve([
      {
        testId: 'mock-test-1',
        timestamp: Date.now(),
        scenario: {
          id: 'mock-scenario',
          name: 'Mock Test Scenario',
          description: 'Mock test scenario for testing',
          severity: 'low',
          duration: 100,
          targetComponents: ['mock-component'],
          expectedOutcome: 'Mock success',
          failureConditions: [],
          recoveryTime: 50
        },
        success: true,
        responseTime: 50,
        errorRate: 0,
        availability: 1,
        failurePoints: [],
        recoveryTime: 25,
        impactAssessment: {
          userImpact: 'none',
          businessImpact: 'none',
          safetyImpact: 'none'
        },
        recommendations: [],
        emergencyProcedures: []
      }
    ])),
    runEmergencyFailoverTests: jest.fn(() => Promise.resolve([
      {
        id: 'crisis-chat-server-failover',
        component: 'crisis-chat',
        failureType: 'server',
        simulatedFailure: 'Primary chat server becomes unresponsive',
        expectedFallback: 'Automatic failover to backup chat server',
        maxFailoverTime: 2000,
        testResult: {
          actualFailoverTime: 500,
          fallbackWorked: true,
          userExperience: 'Seamless - user unaware of failover',
          dataIntegrity: true
        }
      },
      {
        id: 'ai-service-failover',
        component: 'ai-crisis-detection',
        failureType: 'service',
        simulatedFailure: 'AI service API becomes unavailable',
        expectedFallback: 'Fallback to rule-based detection',
        maxFailoverTime: 1000,
        testResult: {
          actualFailoverTime: 300,
          fallbackWorked: true,
          userExperience: 'Minimal disruption',
          dataIntegrity: true
        }
      },
      {
        id: 'database-connection-failover',
        component: 'crisis-resources',
        failureType: 'database',
        simulatedFailure: 'Database connection lost',
        expectedFallback: 'Serve cached crisis resources',
        maxFailoverTime: 500,
        testResult: {
          actualFailoverTime: 200,
          fallbackWorked: true,
          userExperience: 'No disruption',
          dataIntegrity: true
        }
      },
      {
        id: 'api-rate-limit-failover',
        component: 'emergency-services',
        failureType: 'service',
        simulatedFailure: 'API rate limit exceeded',
        expectedFallback: 'Queue and retry with backoff',
        maxFailoverTime: 3000,
        testResult: {
          actualFailoverTime: 1500,
          fallbackWorked: true,
          userExperience: 'Brief delay but service continues',
          dataIntegrity: true
        }
      },
      {
        id: 'network-partition-failover',
        component: 'emergency-button',
        failureType: 'network',
        simulatedFailure: 'Complete network connectivity loss',
        expectedFallback: 'Local emergency protocol activation',
        maxFailoverTime: 100,
        testResult: {
          actualFailoverTime: 50,
          fallbackWorked: true,
          userExperience: 'Seamless - local fallback activated',
          dataIntegrity: true
        }
      }
    ])),
  },
  CrisisStressTestingSystem: jest.fn().mockImplementation(() => ({
    runCrisisStressTests: jest.fn(() => Promise.resolve([])),
    runEmergencyFailoverTests: jest.fn(() => Promise.resolve([]))
  })),
  CRISIS_COMPONENTS: {
    EMERGENCY_BUTTON: 'emergency-button',
    CRISIS_CHAT: 'crisis-chat',
    HOTLINE_INTEGRATION: 'hotline-integration',
    EMERGENCY_CONTACTS: 'emergency-contacts',
    CRISIS_RESOURCES: 'crisis-resources',
    AI_CRISIS_DETECTION: 'ai-crisis-detection',
    CRISIS_ALERTS: 'crisis-alerts',
    EMERGENCY_SERVICES: 'emergency-services',
    SAFETY_PLAN: 'safety-plan',
    CRISIS_INTERVENTION: 'crisis-intervention'
  },
  CRISIS_TEST_SCENARIOS: [],
  EMERGENCY_FAILOVER_TESTS: []
}));

// Automatically mock commonly used services
jest.mock('./services/crisisDetectionService', () => {
  const mockAnalyzeCrisisContent = jest.fn(() => ({
    hasCrisisIndicators: false,
    severityLevel: 'none',
    detectedCategories: [],
    confidence: 0.1,
    recommendedActions: [],
    escalationRequired: false,
    emergencyServices: false,
    riskFactors: [],
    protectiveFactors: [],
    analysisDetails: {
      triggeredKeywords: [],
      sentimentScore: 0,
      contextualFactors: [],
      urgencyLevel: 0
    }
  }));
  
  const mockService = {
    analyzeCrisisContent: mockAnalyzeCrisisContent,
    analyzeMessageRisk: jest.fn(() => ({
      riskLevel: 'low',
      indicators: [],
      confidence: 0.1
    })),
    detectCrisis: jest.fn(() => ({
      isInCrisis: false,
      severity: 'none',
      confidence: 0,
      keywords: []
    })),
    getEscalationActions: jest.fn(() => ({
      type: 'support',
      description: 'Monitor and provide support',
      contacts: [],
      resources: [],
      timeline: 'Ongoing'
    })),
    generateCrisisResponse: jest.fn(() => ({
      message: 'Support message',
      actions: [],
      resources: [],
      followUp: []
    })),
    reset: jest.fn()
  };
  
  return {
    enhancedCrisisDetectionService: mockService,
    crisisDetectionService: mockService,
    astralCoreCrisisDetection: mockService,
    default: mockService
  };
});

jest.mock('./services/aiModerationService', () => ({
  aiModerationService: {
    moderateMessage: jest.fn(() => ({
      safe: true,
      category: null,
      escalate: false
    })),
    generateSafeResponse: jest.fn(() => 'Content has been moderated for safety.'),
    sanitizeForDisplay: jest.fn((text) => text),
    needsHumanIntervention: jest.fn(() => false)
  }
}));

jest.mock('./services/coreWebVitalsService', () => ({
  coreWebVitalsService: {
    initialize: jest.fn(() => Promise.resolve()),
    generateReport: jest.fn(() => Promise.resolve({
      timestamp: Date.now(),
      url: 'http://localhost',
      metrics: { lcp: 1200, fid: 80, cls: 0.05 },
      grade: 'A'
    })),
    getPerformanceSummary: jest.fn(() => ({
      overall: 'good',
      metrics: {},
      recommendations: []
    }))
  }
}));

jest.mock('./services/privacyPreservingAnalyticsService', () => ({
  privacyPreservingAnalyticsService: {
    initialize: jest.fn(() => Promise.resolve()),
    trackEvent: jest.fn(() => Promise.resolve()),
    trackPageView: jest.fn(() => Promise.resolve()),
    flush: jest.fn(() => Promise.resolve()),
    trackMoodEntry: jest.fn(() => Promise.resolve()),
    trackCrisisInteraction: jest.fn(() => Promise.resolve()),
    trackFeatureUsage: jest.fn(() => Promise.resolve()),
    trackSafetyPlanUsage: jest.fn(() => Promise.resolve()),
    trackResourceAccess: jest.fn(() => Promise.resolve()),
    trackUserEngagement: jest.fn(() => Promise.resolve()),
    recordInterventionOutcome: jest.fn(() => Promise.resolve()),
    getAnonymizedInsights: jest.fn(() => Promise.resolve({
      totalEvents: 0,
      eventTypes: {},
      timeDistribution: {},
      userSegments: {}
    })),
    getUserAnalytics: jest.fn(() => Promise.resolve({
      userId: 'anonymous',
      events: [],
      insights: {}
    })),
    clearAnalytics: jest.fn(() => Promise.resolve()),
    exportAnalytics: jest.fn(() => Promise.resolve({})),
    setUserConsent: jest.fn(() => Promise.resolve()),
    getUserConsent: jest.fn(() => Promise.resolve(true))
  }
}));

jest.mock('./services/enhancedOfflineService', () => ({
  enhancedOfflineService: {
    initialize: jest.fn(() => Promise.resolve()),
    isOnline: jest.fn(() => true),
    getOfflineCapabilities: jest.fn(() => ({
      canCache: true,
      canSync: true
    })),
    addToSyncQueue: jest.fn(),
    processSyncQueue: jest.fn(() => Promise.resolve()),
    onStatusChange: jest.fn(),
    getCrisisResources: jest.fn(() => Promise.resolve([])),
    getAvailableContent: jest.fn(() => Promise.resolve([])),
    syncCrisisData: jest.fn(() => Promise.resolve()),
    clearOfflineData: jest.fn(() => Promise.resolve())
  }
}));

jest.mock('./services/peerSupportNetworkService', () => ({
  peerSupportNetworkService: {
    initialize: jest.fn(() => Promise.resolve()),
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    getActiveConnections: jest.fn(() => [])
  }
}));

// Fix for React 18 act() warnings
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Ensure document.body exists for React 18 createRoot
if (typeof document !== 'undefined') {
  if (!document.body) {
    const body = document.createElement('body');
    if (document.documentElement) {
      document.documentElement.appendChild(body);
    }
  }
}

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      canvas: {
        width: 300,
        height: 150
      },
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      arc: jest.fn(),
      arcTo: jest.fn(),
      rect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      clip: jest.fn(),
      isPointInPath: jest.fn(() => false),
      isPointInStroke: jest.fn(() => false),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createPattern: jest.fn(() => null),
      createImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(),
        width: 0,
        height: 0
      })),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(),
        width: 0,
        height: 0
      })),
      putImageData: jest.fn(),
      drawImage: jest.fn(),
      getLineDash: jest.fn(() => []),
      setLineDash: jest.fn()
    };
  }
  return null;
}) as any;

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  if (callback) {
    callback(new Blob(['mock'], { type: 'image/png' }));
  }
}) as any;

// Mock Blob with text() method
const OriginalBlob = global.Blob;
global.Blob = class MockBlob extends OriginalBlob {
  constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
    super(parts, options);
  }
  
  text(): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(this);
    });
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(this);
    });
  }
} as any;

// Mock FileReader
(global as any).FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  readAsText(blob: Blob): void {
    // Handle Blob created by the actual implementation
    if (blob instanceof Blob) {
      // Use the Blob constructor's internal structure to get the content
      const blobParts = (blob as any)[Symbol.for('nodejs.util.inspect.custom')] ? 
        [(blob as any).toString()] : 
        (blob as any)._parts || (blob as any).parts || [blob];
      
      // Try to extract the text content from the blob
      Promise.resolve().then(() => {
        try {
          // If it's an actual Blob with arrayBuffer method
          if (typeof blob.arrayBuffer === 'function') {
            blob.arrayBuffer().then(buffer => {
              this.result = new TextDecoder().decode(buffer);
              if (this.onload) this.onload();
            });
          } else {
            // Fallback for mock blobs
            const text = blobParts.map((part: any) => {
              if (typeof part === 'string') return part;
              if (part instanceof ArrayBuffer) return new TextDecoder().decode(part);
              return String(part);
            }).join('');
            this.result = text;
            if (this.onload) this.onload();
          }
        } catch (e) {
          // Fallback to mock data
          this.result = 'mock file content';
          if (this.onload) this.onload();
        }
      });
    } else {
      this.result = 'mock file content';
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  }
  
  readAsArrayBuffer(blob: Blob): void {
    const parts = (blob as any)._parts || [(blob as any).parts] || [new ArrayBuffer(0)];
    const buffer = parts[0] instanceof ArrayBuffer ? parts[0] : new TextEncoder().encode(String(parts[0])).buffer;
    this.result = buffer;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  
  readAsDataURL(blob: Blob): void {
    this.result = 'data:application/octet-stream;base64,mock';
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock Image
(global as any).Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 0;
  height = 0;
  complete = false;
  naturalWidth = 0;
  naturalHeight = 0;

  constructor() {
    setTimeout(() => {
      this.width = 100;
      this.height = 100;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      this.complete = true;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Mock ResizeObserver
(global as any).ResizeObserver = class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(_callback: ResizeObserverCallback) {}
};

// Mock IntersectionObserver
(global as any).IntersectionObserver = class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
};

// Mock MutationObserver
(global as any).MutationObserver = class MockMutationObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
  constructor(_callback: MutationCallback) {}
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
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
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost/',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: jest.fn(() => 'http://localhost/')
} as any;

// Mock window methods
window.open = jest.fn();
window.alert = jest.fn();
window.confirm = jest.fn(() => true);
window.prompt = jest.fn(() => 'mocked prompt');
window.scrollTo = jest.fn();

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn(cb => {
  setTimeout(cb, 0);
  return 0;
});
window.cancelAnimationFrame = jest.fn();

// Ensure timer functions are available in the global scope
// Store original functions before any mocking
const originalSetInterval = setInterval;
const originalClearInterval = clearInterval;
const originalSetTimeout = setTimeout;
const originalClearTimeout = clearTimeout;

// Always ensure these are available globally
global.setInterval = global.setInterval || originalSetInterval;
global.clearInterval = global.clearInterval || originalClearInterval;
global.setTimeout = global.setTimeout || originalSetTimeout;
global.clearTimeout = global.clearTimeout || originalClearTimeout;

// Also ensure they're on window
if (typeof window !== 'undefined') {
  window.setInterval = window.setInterval || originalSetInterval;
  window.clearInterval = window.clearInterval || originalClearInterval;
  window.setTimeout = window.setTimeout || originalSetTimeout;
  window.clearTimeout = window.clearTimeout || originalClearTimeout;
}

// Mock performance API
if (!window.performance) {
  (window as any).performance = {};
}
window.performance = {
  ...window.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  navigation: {
    type: 0,
    redirectCount: 0
  } as any,
  timing: {} as any
} as any;

// Mock Web Audio API
(window as any).AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 }
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1 }
  })),
  destination: {}
}));

// Mock Notification API
(window as any).Notification = {
  permission: 'default',
  requestPermission: jest.fn(() => Promise.resolve('granted'))
};

// Mock navigator APIs
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 0,
          longitude: 0,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }
});

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: {
        scriptURL: '/sw.js',
        state: 'activated'
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn()
    })),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: {
        scriptURL: '/sw.js',
        state: 'activated'
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn()
    }),
    controller: {
      scriptURL: '/sw.js',
      state: 'activated',
      postMessage: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getRegistration: jest.fn(() => Promise.resolve(null))
  },
  writable: true
});

// Headers class is already defined above, just reassign it
(global as any).Headers = MockHeaders;

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    headers: new MockHeaders(),
    clone: () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new MockHeaders()
    })
  } as Response)
);

// Mock crypto
if (!global.crypto) {
  (global as any).crypto = {};
}
global.crypto.randomUUID = () => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid as `${string}-${string}-${string}-${string}-${string}`;
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock DOM methods that tests commonly use
if (!Element.prototype.getBoundingClientRect || Element.prototype.getBoundingClientRect.toString().includes('[native code]')) {
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0
  } as DOMRect));
}

// Don't override these critical DOM methods as they break createElement
// Element.prototype.closest = jest.fn(() => null);
// Element.prototype.matches = jest.fn(() => false);
// Element.prototype.querySelector = jest.fn(() => null);
// Element.prototype.querySelectorAll = jest.fn(() => [] as any);

// Ensure document is available globally
if (typeof global.document === 'undefined' && typeof document !== 'undefined') {
  global.document = document;
}

// Mock comprehensive window.getComputedStyle with getPropertyValue
const createMockComputedStyle = () => {
  const getPropertyValue = jest.fn((property: string) => {
    // Return default values for commonly accessed CSS properties
    switch (property) {
      case 'display':
        return 'block';
      case 'visibility':
        return 'visible';
      case 'opacity':
        return '1';
      case 'color':
        return 'rgb(0, 0, 0)';
      case 'background-color':
        return 'rgba(0, 0, 0, 0)';
      case 'font-size':
        return '16px';
      case 'font-family':
        return 'serif';
      case 'width':
        return 'auto';
      case 'height':
        return 'auto';
      case 'margin':
      case 'margin-top':
      case 'margin-right':
      case 'margin-bottom':
      case 'margin-left':
        return '0px';
      case 'padding':
      case 'padding-top':
      case 'padding-right':
      case 'padding-bottom':
      case 'padding-left':
        return '0px';
      case 'border':
      case 'border-top':
      case 'border-right':
      case 'border-bottom':
      case 'border-left':
        return 'none';
      case 'border-style':
        return 'none';
      case 'outline':
        return 'none';
      case 'box-shadow':
        return 'none';
      case 'transform':
        return 'none';
      case 'transition':
        return 'none';
      case 'position':
        return 'static';
      case 'top':
      case 'right':
      case 'bottom':
      case 'left':
        return 'auto';
      case 'z-index':
        return 'auto';
      case 'overflow':
      case 'overflow-x':
      case 'overflow-y':
        return 'visible';
      default:
        return '';
    }
  });

  return {
    getPropertyValue,
    // Add commonly accessed CSS properties as direct properties
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    fontSize: '16px',
    fontFamily: 'serif',
    width: 'auto',
    height: 'auto',
    margin: '0px',
    marginTop: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    padding: '0px',
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    border: 'none',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    borderStyle: 'none',
    outline: 'none',
    boxShadow: 'none',
    transform: 'none',
    transition: 'none',
    position: 'static',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    zIndex: 'auto',
    overflow: 'visible',
    overflowX: 'visible',
    overflowY: 'visible'
  };
};

window.getComputedStyle = jest.fn((element: Element, pseudoElt?: string | null) => {
  return createMockComputedStyle() as any;
});

// Also mock it on the global object for broader compatibility
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn((element: Element, pseudoElt?: string | null) => {
    return createMockComputedStyle() as any;
  })
});

// Mock additional Element/Node methods that might be accessed
// BUT DO NOT MOCK appendChild, removeChild etc - these break React rendering!
Element.prototype.insertAdjacentElement = jest.fn();
Element.prototype.insertAdjacentHTML = jest.fn();
Element.prototype.insertAdjacentText = jest.fn();
// DO NOT MOCK THESE - they break React 18 rendering:
// Node.prototype.appendChild = jest.fn();
// Node.prototype.removeChild = jest.fn();
// Node.prototype.insertBefore = jest.fn();
// Node.prototype.replaceChild = jest.fn();
// Node.prototype.cloneNode = jest.fn(() => ({} as Node));

// Mock focus/blur methods
HTMLElement.prototype.focus = jest.fn();
HTMLElement.prototype.blur = jest.fn();
HTMLElement.prototype.click = jest.fn();

// Mock form element methods
HTMLInputElement.prototype.setSelectionRange = jest.fn();
HTMLInputElement.prototype.select = jest.fn();
HTMLTextAreaElement.prototype.setSelectionRange = jest.fn();
HTMLTextAreaElement.prototype.select = jest.fn();

// Mock console methods to reduce noise
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Setup performance mocks
  setupPerformanceMocks();
  
  console.error = jest.fn((message, ...args) => {
    // Filter out known React warnings
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') ||
       message.includes('ReactDOM.render') ||
       message.includes('act()'))
    ) {
      return;
    }
    originalError(message, ...args);
  });

  console.warn = jest.fn((message, ...args) => {
    // Filter out known warnings
    if (
      typeof message === 'string' &&
      (message.includes('componentWill') ||
       message.includes('findDOMNode'))
    ) {
      return;
    }
    originalWarn(message, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  cleanupPerformanceMocks();
});

// Ensure DOM root element exists initially for React 18
if (typeof document !== 'undefined') {
  // Always ensure body exists first
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }
  
  // Don't add a root element here - let tests create their own containers
  // This prevents conflicts with React Testing Library
}

// Setup before each test
beforeEach(() => {
  // Use our centralized DOM setup
  setupDOM();
  
  // Setup default mocks
  setupDefaultMocks();
  
  // Reset all localStorage mocks - check if they are jest mocks first
  if (typeof localStorage.getItem === 'function' && 'mockClear' in localStorage.getItem) {
    (localStorage.getItem as jest.Mock).mockClear();
  }
  if (typeof localStorage.setItem === 'function' && 'mockClear' in localStorage.setItem) {
    (localStorage.setItem as jest.Mock).mockClear();
  }
  if (typeof localStorage.removeItem === 'function' && 'mockClear' in localStorage.removeItem) {
    (localStorage.removeItem as jest.Mock).mockClear();
  }
  if (typeof localStorage.clear === 'function' && 'mockClear' in localStorage.clear) {
    (localStorage.clear as jest.Mock).mockClear();
  }
  if (typeof localStorage.key === 'function' && 'mockClear' in localStorage.key) {
    (localStorage.key as jest.Mock).mockClear();
  }
  
  // Reset timer mocks
  jest.clearAllTimers();
});

// Cleanup after each test
afterEach(async () => {
  // Cleanup React components first (wait for async cleanup)
  await cleanup();
  
  // Clean up custom containers
  // cleanupContainers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Run pending timers before clearing them
  if (typeof setTimeout !== 'undefined' && jest.isMockFunction(setTimeout)) {
    jest.runOnlyPendingTimers();
  }
  
  // Clear timers
  jest.clearAllTimers();
  
  // If using fake timers, ensure they're reset
  if (typeof setTimeout !== 'undefined' && jest.isMockFunction(setTimeout)) {
    jest.useRealTimers();
  }
  
  // Clean up DOM for next test using our utility
  cleanupDOM();
});

// Mock Cache API
const mockCache = {
  match: jest.fn(() => Promise.resolve(undefined)),
  matchAll: jest.fn(() => Promise.resolve([])),
  add: jest.fn(() => Promise.resolve()),
  addAll: jest.fn(() => Promise.resolve()),
  put: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve(true)),
  keys: jest.fn(() => Promise.resolve([]))
};

const mockCaches = {
  open: jest.fn(() => Promise.resolve(mockCache)),
  has: jest.fn(() => Promise.resolve(false)),
  delete: jest.fn(() => Promise.resolve(true)),
  keys: jest.fn(() => Promise.resolve([])),
  match: jest.fn(() => Promise.resolve(undefined))
};

(global as any).caches = mockCaches;

// Increase default timeout for async tests
jest.setTimeout(10000);

// Export commonly used utilities
export { localStorageMock, sessionStorageMock };