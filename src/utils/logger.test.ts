/**
 * Logger Test Suite
 * 
 * Comprehensive tests for the production-safe logging utility
 * including console output, error tracking, and environment handling.
 * 
 * @fileoverview Tests for logger utility functions
 * @version 2.0.0
 */

import { logger, LogLevel, LogEntry } from './logger';

// Mock console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

// Mock Sentry
const mockSentry = {
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn()
};

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Mock console methods
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    // Reset environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      const message = 'Test info message';
      const context = { userId: '123' };

      logger.info(message, context);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.stringContaining(message),
        expect.objectContaining(context)
      );
    });

    it('should log warning messages', () => {
      const message = 'Test warning message';
      const context = { component: 'TestComponent' };

      logger.warn(message, context);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.stringContaining(message),
        expect.objectContaining(context)
      );
    });

    it('should log error messages', () => {
      const message = 'Test error message';
      const error = new Error('Test error');

      logger.error(message, { error });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining(message),
        expect.objectContaining({ error })
      );
    });

    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';

      logger.debug(message);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        expect.stringContaining(message)
      );
    });

    it('should not log debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';

      logger.debug(message);

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Log Levels', () => {
    it('should respect log level hierarchy', () => {
      // Set log level to WARN
      logger.setLevel(LogLevel.WARN);

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.log).not.toHaveBeenCalled(); // debug
      expect(console.info).not.toHaveBeenCalled(); // info
      expect(console.warn).toHaveBeenCalled(); // warn
      expect(console.error).toHaveBeenCalled(); // error
    });

    it('should allow changing log level', () => {
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);

      logger.setLevel(LogLevel.INFO);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('Context and Metadata', () => {
    it('should include timestamp in log entries', () => {
      const message = 'Test message with timestamp';
      
      logger.info(message);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        expect.stringContaining(message),
        expect.any(Object)
      );
    });

    it('should handle nested context objects', () => {
      const context = {
        user: {
          id: '123',
          name: 'Test User',
          preferences: {
            theme: 'dark'
          }
        }
      };

      logger.info('User action', context);

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('User action'),
        expect.objectContaining(context)
      );
    });

    it('should sanitize sensitive data', () => {
      const sensitiveContext = {
        password: 'secret123',
        token: 'bearer-token',
        email: 'user@example.com',
        normalData: 'safe-value'
      };

      logger.info('Login attempt', sensitiveContext);

      const logCall = (console.info as jest.Mock).mock.calls[0];
      const loggedContext = logCall[2];

      expect(loggedContext.password).toBe('[REDACTED]');
      expect(loggedContext.token).toBe('[REDACTED]');
      expect(loggedContext.email).toBe('user@example.com'); // Not sensitive
      expect(loggedContext.normalData).toBe('safe-value');
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      logger.error('Something went wrong', { error });

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Something went wrong'),
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            stack: 'Error stack trace'
          })
        })
      );
    });

    it('should handle non-Error objects as errors', () => {
      const errorLike = { message: 'Custom error', code: 500 };

      logger.error('Custom error occurred', { error: errorLike });

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Custom error occurred'),
        expect.objectContaining({
          error: errorLike
        })
      );
    });

    it('should not crash on circular references', () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;

      expect(() => {
        logger.info('Circular reference test', circular);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('Performance Logging', () => {
    it('should create performance timer', () => {
      const timer = logger.time('test-operation');

      expect(timer).toHaveProperty('end');
      expect(typeof timer.end).toBe('function');
    });

    it('should log performance metrics on timer end', () => {
      const timer = logger.time('test-operation');
      
      // Simulate some work
      setTimeout(() => {
        timer.end();
        
        expect(console.info).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('test-operation completed'),
          expect.objectContaining({
            operation: 'test-operation',
            duration: expect.any(Number)
          })
        );
      }, 10);
    });
  });

  describe('Batch Logging', () => {
    it('should collect log entries when batching is enabled', () => {
      logger.enableBatching();

      logger.info('First message');
      logger.warn('Second message');
      logger.error('Third message');

      // Console should not be called immediately
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();

      // Flush batch
      logger.flushBatch();

      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should auto-flush batch when size limit is reached', () => {
      logger.enableBatching({ maxSize: 2 });

      logger.info('Message 1');
      logger.info('Message 2'); // Should trigger flush
      logger.info('Message 3');

      expect(console.info).toHaveBeenCalledTimes(2); // First 2 messages flushed
    });

    it('should auto-flush batch on interval', (done) => {
      logger.enableBatching({ flushInterval: 100 });

      logger.info('Timed message');

      setTimeout(() => {
        expect(console.info).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });
  });

  describe('Environment Handling', () => {
    it('should adjust behavior in production', () => {
      process.env.NODE_ENV = 'production';

      logger.debug('Debug message');
      logger.info('Info message');

      expect(console.log).not.toHaveBeenCalled(); // Debug disabled
      expect(console.info).toHaveBeenCalled(); // Info enabled
    });

    it('should be more verbose in development', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Debug message');
      logger.info('Info message with context', { data: 'test' });

      expect(console.log).toHaveBeenCalled(); // Debug enabled
      expect(console.info).toHaveBeenCalled(); // Info enabled
    });
  });

  describe('Integration Features', () => {
    it('should create child loggers with context', () => {
      const childLogger = logger.child({ component: 'TestComponent' });

      childLogger.info('Child logger message');

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Child logger message'),
        expect.objectContaining({
          component: 'TestComponent'
        })
      );
    });

    it('should support structured logging', () => {
      logger.structured('user.login', {
        userId: '123',
        timestamp: Date.now(),
        success: true
      });

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('user.login'),
        expect.objectContaining({
          userId: '123',
          success: true
        })
      );
    });

    it('should handle log rotation', () => {
      const logs = logger.getRecentLogs(5);
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Error Cases', () => {
    it('should handle undefined messages gracefully', () => {
      expect(() => {
        logger.info(undefined as any);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('undefined'),
        expect.any(Object)
      );
    });

    it('should handle null context gracefully', () => {
      expect(() => {
        logger.info('Test message', null as any);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalled();
    });

    it('should continue working if console methods are unavailable', () => {
      const originalInfo = console.info;
      console.info = undefined as any;

      expect(() => {
        logger.info('Test message');
      }).not.toThrow();

      console.info = originalInfo;
    });
  });
});
