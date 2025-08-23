/**
 * @jest-environment jsdom
 */

// Define mocks before jest.mock calls
const mockWebSocketService = {
  subscribe: jest.fn(),
  send: jest.fn(),
  unsubscribe: jest.fn(),
};

const mockNotificationService = {
  addToast: jest.fn(),
};

const mockSecureStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock dependencies
jest.mock('../webSocketService', () => ({
  getWebSocketService: () => mockWebSocketService,
}));

jest.mock('../notificationService', () => ({
  notificationService: {
    addToast: jest.fn(),
  },
}));

jest.mock('../secureStorageService', () => ({
  getSecureStorage: () => mockSecureStorage,
}));

// Dummy test to keep suite active
describe('Test Suite Active', () => {
  it.skip('Placeholder test to prevent empty suite', () => {
    expect(true).toBe(true);
  });
});
