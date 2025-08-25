/**
 * Global Test Setup
 * 
 * This file is automatically run before all tests by Jest/Vitest.
 * Sets up global test environment, mocks, and utilities for the
 * mental health platform test suite.
 * 
 * @fileoverview Global test setup and configuration
 * @version 2.0.0
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Setup text encoding/decoding for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

/**
 * Mock TouchEvent for touch gesture tests
 */
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

/**
 * Mock Response interface for fetch tests
 */
interface MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Map<string, string>;
  body: any;
  
  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Map(Object.entries(init?.headers || {}));
  }
  
  json(): Promise<any> {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
  }
  
  text(): Promise<string> {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
  }
  
  blob(): Promise<Blob> {
    return Promise.resolve(new Blob([this.body]));
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    const str = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
      view[i] = str.charCodeAt(i);
    }
    return Promise.resolve(buffer);
  }
}

/**
 * Mock Request interface for fetch tests
 */
interface MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  body: any;
  
  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this.body = init?.body;
  }
}

// Make Response and Request available globally
(global as any).Response = MockResponse;
(global as any).Request = MockRequest;

/**
 * Mock fetch function for API tests
 */
const mockFetch = jest.fn((url: string, options?: RequestInit) => {
  // Default successful response
  return Promise.resolve(new MockResponse({ success: true, data: {} }, { status: 200 }));
});

global.fetch = mockFetch;

/**
 * Mock IntersectionObserver for component visibility tests
 */
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
global.IntersectionObserver = mockIntersectionObserver;

/**
 * Mock ResizeObserver for responsive component tests
 */
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
global.ResizeObserver = mockResizeObserver;

/**
 * Mock MutationObserver for DOM change tests
 */
const mockMutationObserver = jest.fn();
mockMutationObserver.mockReturnValue({
  observe: () => null,
  disconnect: () => null,
  takeRecords: () => [],
});
global.MutationObserver = mockMutationObserver;

/**
 * Mock window.matchMedia for responsive design tests
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mock window.scrollTo for scroll behavior tests
 */
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

/**
 * Mock window.localStorage for storage tests
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

/**
 * Mock window.sessionStorage for session storage tests
 */
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: sessionStorageMock,
});

/**
 * Mock Geolocation API for location-based tests
 */
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation,
});

/**
 * Mock Notification API for notification tests
 */
const mockNotification = jest.fn().mockImplementation((title, options) => ({
  title,
  ...options,
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
mockNotification.permission = 'granted';
mockNotification.requestPermission = jest.fn().mockResolvedValue('granted');
global.Notification = mockNotification;

/**
 * Mock WebSocket for real-time communication tests
 */
const mockWebSocket = jest.fn().mockImplementation((url) => ({
  url,
  readyState: WebSocket.OPEN,
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
}));
global.WebSocket = mockWebSocket;

/**
 * Mock AudioContext for audio-related tests
 */
const mockAudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 },
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1 },
  }),
  destination: {},
  close: jest.fn(),
  resume: jest.fn(),
  suspend: jest.fn(),
}));
global.AudioContext = mockAudioContext;
global.webkitAudioContext = mockAudioContext;

/**
 * Mock MediaDevices for camera/microphone tests
 */
const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn(),
      getSettings: () => ({}),
    }],
  }),
  enumerateDevices: jest.fn().mockResolvedValue([]),
};
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: mockMediaDevices,
});

/**
 * Mock Canvas API for chart/visualization tests
 */
const mockCanvas = {
  getContext: jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn().mockReturnValue({ data: new Array(4) }),
    putImageData: jest.fn(),
    createImageData: jest.fn().mockReturnValue({}),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 0 }),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  }),
  toDataURL: jest.fn(),
  getBoundingClientRect: jest.fn().mockReturnValue({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  }),
};

HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL;
HTMLCanvasElement.prototype.getBoundingClientRect = mockCanvas.getBoundingClientRect;

/**
 * Mock performance.now() for timing tests
 */
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn().mockReturnValue(Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue([]),
    getEntriesByType: jest.fn().mockReturnValue([]),
  },
});

/**
 * Mock crypto API for security tests
 */
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn().mockReturnValue('mock-uuid-1234-5678-9012'),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
  },
});

/**
 * Mock URL.createObjectURL for file handling tests
 */
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-object-url');
global.URL.revokeObjectURL = jest.fn();

/**
 * Mock FileReader for file upload tests
 */
const mockFileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  readAsBinaryString: jest.fn(),
  onload: null,
  onerror: null,
  onprogress: null,
  result: null,
  error: null,
  readyState: 0,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
}));
global.FileReader = mockFileReader;

/**
 * Setup and cleanup for each test
 */
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.clear.mockClear();
  sessionStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  
  // Reset fetch mock to default behavior
  mockFetch.mockResolvedValue(
    new MockResponse({ success: true, data: {} }, { status: 200 })
  );
});

afterEach(() => {
  // Cleanup DOM after each test
  cleanup();
  
  // Clear any timers
  jest.clearAllTimers();
});

/**
 * Global error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Suppress console warnings in tests unless specifically testing them
 */
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
  if (process.env.NODE_ENV === 'test' && !process.env.SHOW_CONSOLE_WARNINGS) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args) => {
  if (process.env.NODE_ENV === 'test' && !process.env.SHOW_CONSOLE_ERRORS) {
    return;
  }
  originalConsoleError(...args);
};

/**
 * Export utility functions for tests
 */
export const testUtils = {
  mockFetch,
  mockIntersectionObserver,
  mockResizeObserver,
  mockMutationObserver,
  localStorageMock,
  sessionStorageMock,
  mockGeolocation,
  mockNotification,
  mockWebSocket,
  mockAudioContext,
  mockMediaDevices,
  mockCanvas,
  mockFileReader,
  
  // Utility functions
  createMockResponse: (data: any, status = 200) => new MockResponse(data, { status }),
  createMockRequest: (url: string, options?: RequestInit) => new MockRequest(url, options),
  
  // Test environment helpers
  enableConsoleWarnings: () => { process.env.SHOW_CONSOLE_WARNINGS = 'true'; },
  disableConsoleWarnings: () => { delete process.env.SHOW_CONSOLE_WARNINGS; },
  enableConsoleErrors: () => { process.env.SHOW_CONSOLE_ERRORS = 'true'; },
  disableConsoleErrors: () => { delete process.env.SHOW_CONSOLE_ERRORS; },
  
  // Mock data generators
  generateMockUser: () => ({
    id: 'mock-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'Starkeeper',
    createdAt: new Date().toISOString(),
  }),
  
  generateMockAssessment: () => ({
    id: 'mock-assessment-123',
    type: 'phq-9',
    score: 8,
    answers: [1, 2, 1, 1, 0, 1, 1, 1, 0],
    completedAt: new Date().toISOString(),
    interpretation: 'Mild depression symptoms',
    severity: 'mild',
    recommendations: ['Consider lifestyle changes', 'Monitor symptoms'],
  }),
  
  generateMockChatMessage: () => ({
    id: 'mock-message-123',
    chatId: 'mock-chat-123',
    senderId: 'mock-user-123',
    content: 'Test message',
    type: 'text',
    timestamp: Date.now(),
    status: 'sent',
  }),
};

export default testUtils;
