/**
 * Mock logger for testing
 * Provides no-op implementations to avoid import.meta issues in Jest
 */

class MockLogger {
  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  getRecentLogs = jest.fn(() => []);
  clearLogs = jest.fn();
}

export const logger = new MockLogger();
export const log = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);