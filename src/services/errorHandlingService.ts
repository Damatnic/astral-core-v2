/**
 * Error Handling Service for Astral Core
 * Provides centralized error management, logging, and recovery strategies
 */

import * as Sentry from '@sentry/react';
import apiService from './apiService';
import notificationService from './notificationService';
import { ENV } from '../utils/envConfig';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'auth' | 'validation' | 'system' | 'crisis' | 'user' | 'unknown';

export interface ErrorDetails {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  code?: string;
  statusCode?: number;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  recoverable?: boolean;
  retryable?: boolean;
  userMessage?: string;
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'reload' | 'ignore';
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: any;
  redirectUrl?: string;
}

export interface ErrorReport {
  id: string;
  error: ErrorDetails;
  reported: boolean;
  reportedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  recovery?: ErrorRecoveryStrategy;
}

class ErrorHandlingService {
  private errorQueue: ErrorDetails[] = [];
  private errorReports: Map<string, ErrorReport> = new Map();
  private retryHandlers: Map<string, NodeJS.Timeout> = new Map();
  private isOnline: boolean = navigator.onLine;
  private sessionId: string;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  private sentryInitialized: boolean = false;
  private errorListeners: Set<(error: ErrorDetails) => void> = new Set();
  private maxQueueSize: number = 100;
  private errorStats = {
    total: 0,
    byCategory: new Map<ErrorCategory, number>(),
    bySeverity: new Map<ErrorSeverity, number>(),
    recovered: 0,
    reported: 0
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSentry();
    this.setupEventListeners();
    this.loadQueuedErrors();
  }

  /**
   * Initialize Sentry error tracking
   */
  private initializeSentry() {
    const sentryDsn = ENV.SENTRY_DSN;
    
    if (sentryDsn && !this.isDevelopment) {
      Sentry.init({
        dsn: sentryDsn,
        environment: ENV.ENV || 'production',
        integrations: [],
        tracesSampleRate: 0.1,
        beforeSend: (event, hint) => {
          // Sanitize event for HIPAA compliance
          return this.sanitizeErrorEvent(event, hint);
        }
      });
      
      this.sentryInitialized = true;
      console.log('Sentry error tracking initialized');
    }
  }

  /**
   * Sanitize error events to ensure HIPAA compliance
   */
  private sanitizeErrorEvent(event: any, _hint: any): any {
    // Remove any potential PII from the error
    if (event.user) {
      event.user = {
        id: event.user.id || 'anonymous',
        // Remove email, username, and other PII
      };
    }

    // Sanitize request data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      
      // Remove sensitive data from URL
      if (event.request.url) {
        event.request.url = this.sanitizeUrl(event.request.url);
      }
    }

    // Sanitize breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb: any) => {
        if (breadcrumb.data) {
          // Remove sensitive data from breadcrumb
          breadcrumb.data = this.sanitizeData(breadcrumb.data);
        }
        return breadcrumb;
      });
    }

    // Sanitize extra context
    if (event.extra) {
      event.extra = this.sanitizeData(event.extra);
    }

    return event;
  }

  /**
   * Sanitize URL to remove sensitive parameters
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove sensitive query parameters
      const sensitiveParams = ['token', 'auth', 'key', 'secret', 'password', 'session'];
      sensitiveParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Sanitize data object to remove PII
   */
  private sanitizeData(data: unknown): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'secret', 'auth', 'email', 'phone', 'ssn', 'dob'];
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        (sanitized as any)[key] = '[REDACTED]';
      } else if (typeof (sanitized as any)[key] === 'object') {
        (sanitized as any)[key] = this.sanitizeData((sanitized as any)[key]);
      }
    });
    
    return sanitized;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        category: 'system',
        severity: 'high',
        timestamp: new Date(),
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        category: 'system',
        severity: 'high',
        timestamp: new Date(),
        stack: event.reason?.stack,
        context: {
          promise: event.promise
        }
      });
    });

    // Network status listener
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auth error listener
    window.addEventListener('auth-error', () => {
      this.handleError({
        message: 'Authentication error occurred',
        category: 'auth',
        severity: 'high',
        timestamp: new Date(),
        recoverable: true,
        userMessage: 'Your session has expired. Please log in again.'
      });
    });
  }

  /**
   * Handle an error
   */
  handleError(error: ErrorDetails, recovery?: ErrorRecoveryStrategy): string {
    // Generate error ID
    const errorId = this.generateErrorId();
    
    // Add session and user context
    error.sessionId = this.sessionId;
    error.userId = this.getCurrentUserId();
    
    // Categorize if not provided
    if (!error.category) {
      error.category = this.categorizeError(error);
    }
    
    // Determine severity if not provided
    if (!error.severity) {
      error.severity = this.determineSeverity(error);
    }
    
    // Update statistics
    this.updateErrorStats(error);
    
    // Create error report
    const report: ErrorReport = {
      id: errorId,
      error,
      reported: false,
      resolved: false,
      recovery
    };
    
    this.errorReports.set(errorId, report);
    
    // Log error
    this.logError(error);
    
    // Report to Sentry if critical
    if (error.severity === 'critical' || error.severity === 'high') {
      this.reportToSentry(error);
      report.reported = true;
      report.reportedAt = new Date();
    }
    
    // Handle crisis errors immediately
    if (error.category === 'crisis') {
      this.handleCrisisError(error);
    }
    
    // Notify user if appropriate
    if (error.userMessage) {
      this.notifyUser(error);
    }
    
    // Attempt recovery
    if (recovery) {
      this.attemptRecovery(errorId, error, recovery);
    }
    
    // Queue for reporting if offline
    if (!this.isOnline) {
      this.queueError(error);
    } else {
      this.reportError(error);
    }
    
    // Notify listeners
    this.notifyListeners(error);
    
    return errorId;
  }

  /**
   * Categorize error based on its characteristics
   */
  private categorizeError(error: ErrorDetails): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || error.code === 'NETWORK_ERROR') {
      return 'network';
    }
    
    if (message.includes('auth') || message.includes('unauthorized') || error.statusCode === 401) {
      return 'auth';
    }
    
    if (message.includes('validation') || message.includes('invalid') || error.statusCode === 400) {
      return 'validation';
    }
    
    if (message.includes('crisis') || message.includes('emergency')) {
      return 'crisis';
    }
    
    if (error.statusCode && error.statusCode >= 500) {
      return 'system';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: ErrorDetails): ErrorSeverity {
    // Crisis errors are always critical
    if (error.category === 'crisis') {
      return 'critical';
    }
    
    // Auth errors are high severity
    if (error.category === 'auth') {
      return 'high';
    }
    
    // System errors are high severity
    if (error.category === 'system') {
      return 'high';
    }
    
    // Network errors are medium severity
    if (error.category === 'network') {
      return 'medium';
    }
    
    // Validation errors are low severity
    if (error.category === 'validation') {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(error: ErrorDetails) {
    this.errorStats.total++;
    
    // Update category stats
    const categoryCount = this.errorStats.byCategory.get(error.category) || 0;
    this.errorStats.byCategory.set(error.category, categoryCount + 1);
    
    // Update severity stats
    const severityCount = this.errorStats.bySeverity.get(error.severity) || 0;
    this.errorStats.bySeverity.set(error.severity, severityCount + 1);
  }

  /**
   * Log error to console
   */
  private logError(error: ErrorDetails) {
    const logLevel = this.getLogLevel(error.severity);
    const sanitizedError = this.sanitizeData(error);
    
    console[logLevel](`[${error.category.toUpperCase()}] ${error.message}`, sanitizedError);
    
    if (this.isDevelopment && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Get console log level based on severity
   */
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  /**
   * Report error to Sentry
   */
  private reportToSentry(error: ErrorDetails) {
    if (!this.sentryInitialized) return;
    
    Sentry.captureException(new Error(error.message), {
      level: this.mapSeverityToSentryLevel(error.severity),
      tags: {
        category: error.category,
        sessionId: error.sessionId
      },
      extra: this.sanitizeData(error.context)
    });
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    switch (severity) {
      case 'critical':
        return 'fatal';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Handle crisis-related errors
   */
  private handleCrisisError(error: ErrorDetails) {
    // Show immediate notification
    notificationService.showCrisisNotification(
      'Crisis Support Error',
      error.userMessage || 'We encountered an issue with crisis support. Please call 988 for immediate help.',
      { errorId: error.sessionId }
    );
    
    // Report to backend immediately
    apiService.post('/errors/crisis', {
      error: this.sanitizeData(error),
      timestamp: new Date().toISOString()
    }).catch(console.error);
  }

  /**
   * Notify user about error
   */
  private notifyUser(error: ErrorDetails) {
    const toastType = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warning';
    notificationService.addToast(error.userMessage || 'An error occurred', toastType);
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(errorId: string, error: ErrorDetails, strategy: ErrorRecoveryStrategy) {
    const report = this.errorReports.get(errorId);
    if (!report) return;
    
    switch (strategy.type) {
      case 'retry':
        await this.retryOperation(errorId, error, strategy);
        break;
      
      case 'fallback':
        this.useFallback(errorId, strategy.fallbackValue);
        break;
      
      case 'redirect':
        if (strategy.redirectUrl) {
          window.location.href = strategy.redirectUrl;
        }
        break;
      
      case 'reload':
        window.location.reload();
        break;
      
      case 'ignore':
        report.resolved = true;
        report.resolvedAt = new Date();
        break;
    }
  }

  /**
   * Retry failed operation
   */
  private async retryOperation(errorId: string, error: ErrorDetails, strategy: ErrorRecoveryStrategy) {
    const maxRetries = strategy.maxRetries || 3;
    const retryDelay = strategy.retryDelay || 1000;
    let retryCount = 0;
    
    const retry = () => {
      retryCount++;
      
      if (retryCount > maxRetries) {
        console.error(`Max retries (${maxRetries}) exceeded for error:`, error.message);
        return;
      }
      
      const timeout = setTimeout(() => {
        // Trigger retry event
        window.dispatchEvent(new CustomEvent('error-retry', {
          detail: { errorId, error, attempt: retryCount }
        }));
        
        // Schedule next retry if needed
        if (retryCount < maxRetries) {
          retry();
        }
      }, retryDelay * Math.pow(2, retryCount - 1)); // Exponential backoff
      
      this.retryHandlers.set(errorId, timeout);
    };
    
    retry();
  }

  /**
   * Use fallback value
   */
  private useFallback(errorId: string, fallbackValue: any) {
    const report = this.errorReports.get(errorId);
    if (report) {
      report.resolved = true;
      report.resolvedAt = new Date();
      this.errorStats.recovered++;
    }
    
    // Dispatch fallback event
    window.dispatchEvent(new CustomEvent('error-fallback', {
      detail: { errorId, fallbackValue }
    }));
  }

  /**
   * Queue error for later reporting
   */
  private queueError(error: ErrorDetails) {
    this.errorQueue.push(error);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Save to localStorage
    this.saveQueuedErrors();
  }

  /**
   * Save queued errors to localStorage
   */
  private saveQueuedErrors() {
    try {
      const sanitizedQueue = this.errorQueue.map(error => this.sanitizeData(error));
      localStorage.setItem('error_queue', JSON.stringify(sanitizedQueue));
    } catch (e) {
      console.error('Failed to save error queue:', e);
    }
  }

  /**
   * Load queued errors from localStorage
   */
  private loadQueuedErrors() {
    try {
      const stored = localStorage.getItem('error_queue');
      if (stored) {
        this.errorQueue = JSON.parse(stored);
        
        // Flush queue if online
        if (this.isOnline) {
          this.flushErrorQueue();
        }
      }
    } catch (e) {
      console.error('Failed to load error queue:', e);
    }
  }

  /**
   * Flush error queue
   */
  private async flushErrorQueue() {
    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift()!;
      await this.reportError(error);
    }
    
    // Clear localStorage
    localStorage.removeItem('error_queue');
  }

  /**
   * Report error to backend
   */
  private async reportError(error: ErrorDetails) {
    try {
      await apiService.post('/errors/report', {
        error: this.sanitizeData(error),
        sessionId: this.sessionId,
        timestamp: error.timestamp.toISOString()
      });
      
      this.errorStats.reported++;
    } catch (e) {
      // If reporting fails, queue it
      if (!this.isOnline) {
        this.queueError(error);
      }
    }
  }

  /**
   * Notify error listeners
   */
  private notifyListeners(error: ErrorDetails) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Subscribe to error events
   */
  onError(listener: (error: ErrorDetails) => void): () => void {
    this.errorListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Get error report by ID
   */
  getErrorReport(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      ...this.errorStats,
      byCategory: Object.fromEntries(this.errorStats.byCategory),
      bySeverity: Object.fromEntries(this.errorStats.bySeverity),
      queuedErrors: this.errorQueue.length,
      activeRetries: this.retryHandlers.size
    };
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorReports.clear();
    this.errorQueue = [];
    this.errorStats = {
      total: 0,
      byCategory: new Map(),
      bySeverity: new Map(),
      recovered: 0,
      reported: 0
    };
    localStorage.removeItem('error_queue');
  }

  /**
   * Cancel retry for specific error
   */
  cancelRetry(errorId: string) {
    const timeout = this.retryHandlers.get(errorId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryHandlers.delete(errorId);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | undefined {
    // This would typically get the user ID from auth service
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Create error boundary wrapper
   */
  createErrorBoundary(_fallback: React.ComponentType<{ error: Error; resetError: () => void }>) {
    return Sentry.ErrorBoundary;
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    options?: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      recovery?: ErrorRecoveryStrategy;
      userMessage?: string;
    }
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError({
          message: (error as any).message || 'An error occurred',
          category: options?.category || 'unknown',
          severity: options?.severity || 'medium',
          timestamp: new Date(),
          stack: (error as any).stack,
          userMessage: options?.userMessage,
          recoverable: true,
          retryable: true
        }, options?.recovery);
        
        throw error;
      }
    }) as T;
  }

  /**
   * Test error handling
   */
  testError(category: ErrorCategory = 'system', severity: ErrorSeverity = 'medium') {
    this.handleError({
      message: `Test error: ${category} error with ${severity} severity`,
      category,
      severity,
      timestamp: new Date(),
      userMessage: 'This is a test error notification',
      recoverable: true
    });
  }
}

// Create and export singleton instance
const errorHandlingService = new ErrorHandlingService();

// Export for use in React components
export const useErrorHandler = () => {
  return {
    handleError: (error: Partial<ErrorDetails>, recovery?: ErrorRecoveryStrategy) => 
      errorHandlingService.handleError({
        message: error.message || 'An error occurred',
        category: error.category || 'unknown',
        severity: error.severity || 'medium',
        timestamp: new Date(),
        ...error
      }, recovery),
    onError: (listener: (error: ErrorDetails) => void) => 
      errorHandlingService.onError(listener),
    getErrorStats: () => errorHandlingService.getErrorStats()
  };
};

export default errorHandlingService;