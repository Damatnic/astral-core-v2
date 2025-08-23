/**
 * Error Handling Service for Astral Core
 * Centralized error management with user-friendly messaging and crisis support
 */

import { astralCoreNotificationService, NotificationType, NotificationPriority, Notification } from './astralCoreNotificationService';
import { apiClient } from './apiClient';
import { getEnvVar, isProd, isDev } from '../utils/envConfig';

// Error Types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  API = 'api',
  BROWSER = 'browser',
  STORAGE = 'storage',
  CRISIS = 'crisis',
  RATE_LIMIT = 'rate_limit',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AstralCoreError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  details?: any;
  stack?: string;
  timestamp: Date;
  context?: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  retryAfter?: number;
  helpUrl?: string;
  actions?: ErrorAction[];
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
  destructive?: boolean;
}

export interface ErrorHandlerOptions {
  notify?: boolean;
  log?: boolean;
  report?: boolean;
  fallback?: () => void;
  retry?: () => Promise<void>;
  suppressConsole?: boolean;
}

// Error Messages for users
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  // Network errors
  'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
  'TIMEOUT': 'The request took too long. Please try again.',
  'OFFLINE': 'You appear to be offline. Some features may be limited.',
  
  // Authentication errors
  'AUTH_REQUIRED': 'Please sign in to continue.',
  'SESSION_EXPIRED': 'Your session has expired. Please sign in again.',
  'INVALID_CREDENTIALS': 'Invalid username or password. Please try again.',
  'ACCOUNT_LOCKED': 'Your account has been temporarily locked. Please try again later.',
  
  // Authorization errors
  'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
  'SUBSCRIPTION_REQUIRED': 'This feature requires a subscription.',
  
  // Validation errors
  'INVALID_INPUT': 'Please check your input and try again.',
  'REQUIRED_FIELD': 'Please fill in all required fields.',
  'INVALID_FORMAT': 'Please check the format of your input.',
  
  // Crisis errors
  'CRISIS_SERVICE_UNAVAILABLE': 'Crisis services are temporarily unavailable. Please call 988 for immediate help.',
  'CRISIS_TIMEOUT': 'Unable to connect to crisis services. Please call 988 or 911 if you need immediate help.',
  
  // Rate limiting
  'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
  
  // Storage errors
  'STORAGE_FULL': 'Your device storage is full. Please free up some space.',
  'STORAGE_UNAVAILABLE': 'Unable to save data locally. Some features may not work offline.',
  
  // Maintenance
  'MAINTENANCE_MODE': 'Astral Core is undergoing maintenance. We\'ll be back shortly.',
  
  // Generic
  'UNKNOWN_ERROR': 'Something went wrong. Please try again.',
  'SERVER_ERROR': 'We\'re experiencing technical difficulties. Please try again later.',
};

// Crisis-related error codes that need special handling
const CRISIS_ERROR_CODES = [
  'CRISIS_ALERT_FAILED',
  'SOS_FAILED',
  'EMERGENCY_CONTACT_FAILED',
  'CRISIS_SERVICE_UNAVAILABLE',
  'CRISIS_TIMEOUT',
];

/**
 * Astral Core Error Service
 */
class AstralCoreErrorService {
  private errorLog: AstralCoreError[] = [];
  private readonly maxLogSize = 100;
  private readonly reportingEnabled: boolean;
  private readonly errorListeners: Map<string, (error: AstralCoreError) => void> = new Map();
  private globalHandlersSetup = false;
  private readonly sessionId: string;
  private batchReportTimer: NodeJS.Timeout | null = null;
  private errorBatch: AstralCoreError[] = [];

  constructor() {
    // Enable error reporting in production, optional in development
    this.reportingEnabled = getEnvVar('NODE_ENV') === 'production' || getEnvVar('VITE_DEBUG_MODE') === 'true';
    this.sessionId = this.generateSessionId();
    this.setupGlobalHandlers();
  }

  /**
   * Handle error with options
   */
  handle(
    error: Error | AstralCoreError,
    options: ErrorHandlerOptions = {}
  ): AstralCoreError {
    const {
      notify = true,
      log = true,
      report = true,
      fallback,
      retry,
      suppressConsole = false,
    } = options;

    // Convert to AstralCoreError
    const astralError = this.normalizeError(error);

    // Check if crisis error
    if (this.isCrisisError(astralError)) {
      this.handleCrisisError(astralError);
    }

    // Log error
    if (log) {
      this.logError(astralError, suppressConsole);
    }

    // Show notification
    if (notify && this.shouldNotifyUser(astralError)) {
      this.notifyUser(astralError);
    }

    // Report to server
    if (report && this.reportingEnabled) {
      this.reportError(astralError);
    }

    // Execute fallback
    if (fallback) {
      try {
        fallback();
      } catch (fallbackError) {
        console.error('Astral Core: Fallback failed', fallbackError);
      }
    }

    // Set up retry
    if (retry && astralError.retryable) {
      this.setupRetry(astralError, retry);
    }

    // Emit to listeners
    this.emitError(astralError);

    return astralError;
  }

  /**
   * Create custom error
   */
  createError(
    code: string,
    message?: string,
    details?: any,
    type: ErrorType = ErrorType.UNKNOWN
  ): AstralCoreError {
    return {
      id: this.generateErrorId(),
      type,
      severity: this.determineSeverity(code, type),
      code,
      message: message || code,
      userMessage: this.getUserMessage(code),
      details,
      timestamp: new Date(),
      recoverable: this.isRecoverable(code, type),
      retryable: this.isRetryable(code, type),
      context: this.getErrorContext(),
    };
  }

  /**
   * Handle network error
   */
  handleNetworkError(error: any, endpoint?: string): AstralCoreError {
    return this.handle(error, {
      notify: true,
      retry: async () => {
        // Retry network request
        if (endpoint) {
          await apiClient.get(endpoint);
        }
      },
    });
  }

  /**
   * Handle authentication error
   */
  handleAuthError(error: unknown): AstralCoreError {
    const astralError = this.handle(error as Error | AstralCoreError, {
      notify: true,
      fallback: () => {
        // Redirect to login
        window.location.href = '/login';
      },
    });

    // Clear auth state
    localStorage.removeItem('astralcore_auth_token');
    sessionStorage.clear();

    return astralError;
  }

  /**
   * Handle validation error
   */
  handleValidationError(
    errors: Record<string, string[]>,
    formName?: string
  ): AstralCoreError {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    return this.handle(
      this.createError(
        'VALIDATION_ERROR',
        errorMessages,
        { errors, formName },
        ErrorType.VALIDATION
      ),
      {
        notify: false, // Don't notify for validation errors
        log: false,
        report: false,
      }
    );
  }

  /**
   * Handle critical error
   */
  handleCriticalError(error: unknown): AstralCoreError {
    const astralError = this.handle(error as Error | AstralCoreError, {
      notify: true,
      report: true,
    });

    // Show critical error UI
    this.showCriticalErrorUI(astralError);

    // Save error state for recovery
    this.saveErrorState(astralError);

    return astralError;
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error log
   */
  getErrorLog(): AstralCoreError[] {
    return [...this.errorLog];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AstralCoreError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Subscribe to errors
   */
  onError(callback: (error: AstralCoreError) => void): string {
    const listenerId = this.generateListenerId();
    this.errorListeners.set(listenerId, callback);
    return listenerId;
  }

  /**
   * Unsubscribe from errors
   */
  offError(listenerId: string): void {
    this.errorListeners.delete(listenerId);
  }

  /**
   * Check if error is recoverable
   */
  isRecoverableError(error: AstralCoreError): boolean {
    return error.recoverable;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (this.globalHandlersSetup) return;

    // Window error handler
    window.addEventListener('error', (event) => {
      const error = event.error || new Error(event.message);
      this.handle(error);
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error('Unhandled Promise Rejection');
      this.handle(error);
    });

    // Network status handler
    window.addEventListener('offline', () => {
      this.handle(
        this.createError('OFFLINE', 'Network connection lost', null, ErrorType.NETWORK),
        { notify: true, log: false, report: false }
      );
    });

    window.addEventListener('online', () => {
      astralCoreNotificationService.show({
        type: NotificationType.SYSTEM_ALERT,
        priority: NotificationPriority.NORMAL,
        title: 'Connection Restored',
        body: 'You\'re back online!',
      });
    });

    this.globalHandlersSetup = true;
  }

  /**
   * Normalize error to AstralCoreError
   */
  private normalizeError(error: unknown): AstralCoreError {
    if (this.isAstralError(error)) {
      return error;
    }

    const errorObj = error as any;
    const type = this.determineErrorType(errorObj);
    const code = errorObj?.code || errorObj?.name || 'UNKNOWN_ERROR';
    const message = errorObj?.message || 'An unknown error occurred';

    return {
      id: this.generateErrorId(),
      type,
      severity: this.determineSeverity(code, type),
      code,
      message,
      userMessage: this.getUserMessage(code),
      details: errorObj?.details || error,
      stack: errorObj?.stack,
      timestamp: new Date(),
      recoverable: this.isRecoverable(code, type),
      retryable: this.isRetryable(code, type),
      context: this.getErrorContext(),
    };
  }

  /**
   * Check if error is AstralCoreError
   */
  private isAstralError(error: unknown): error is AstralCoreError {
    const e = error as any;
    return e?.id && 
           e?.type && 
           e?.severity &&
           e?.code &&
           e?.timestamp;
  }

  /**
   * Determine error type
   */
  private determineErrorType(error: any): ErrorType {
    if (error?.code) {
      const code = String(error.code);
      if (code.includes('AUTH')) return ErrorType.AUTHENTICATION;
      if (code.includes('PERM')) return ErrorType.AUTHORIZATION;
      if (error.code.includes('NETWORK')) return ErrorType.NETWORK;
      if (error.code.includes('CRISIS')) return ErrorType.CRISIS;
      if (error.code.includes('RATE')) return ErrorType.RATE_LIMIT;
      if (error.code.includes('VALID')) return ErrorType.VALIDATION;
      if (error.code.includes('STORAGE')) return ErrorType.STORAGE;
    }

    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    if (error.status) {
      if (error.status === 401) return ErrorType.AUTHENTICATION;
      if (error.status === 403) return ErrorType.AUTHORIZATION;
      if (error.status === 429) return ErrorType.RATE_LIMIT;
      if (error.status >= 400 && error.status < 500) return ErrorType.VALIDATION;
      if (error.status >= 500) return ErrorType.API;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(code: string, type: ErrorType): ErrorSeverity {
    // Crisis errors are always critical
    if (CRISIS_ERROR_CODES.includes(code) || type === ErrorType.CRISIS) {
      return ErrorSeverity.CRITICAL;
    }

    // Authentication/Authorization errors are high
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.AUTHORIZATION) {
      return ErrorSeverity.HIGH;
    }

    // Network and API errors are medium
    if (type === ErrorType.NETWORK || type === ErrorType.API) {
      return ErrorSeverity.MEDIUM;
    }

    // Validation errors are low
    if (type === ErrorType.VALIDATION) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Get user-friendly message
   */
  private getUserMessage(code: string): string {
    return USER_FRIENDLY_MESSAGES[code] || USER_FRIENDLY_MESSAGES['UNKNOWN_ERROR'];
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(code: string, type: ErrorType): boolean {
    const nonRecoverableCodes = [
      'ACCOUNT_DELETED',
      'SERVICE_TERMINATED',
      'CRITICAL_FAILURE',
    ];

    // Crisis errors are generally not automatically recoverable
    if (type === ErrorType.CRISIS) {
      return false;
    }

    return !nonRecoverableCodes.includes(code);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(code: string, type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.RATE_LIMIT,
      ErrorType.API,
    ];

    const nonRetryableCodes = [
      'INVALID_CREDENTIALS',
      'PERMISSION_DENIED',
      'VALIDATION_ERROR',
    ];

    return retryableTypes.includes(type) && !nonRetryableCodes.includes(code);
  }

  /**
   * Get error context
   */
  private getErrorContext(): ErrorContext {
    return {
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
        },
        online: navigator.onLine,
      },
    };
  }

  /**
   * Check if crisis error
   */
  private isCrisisError(error: AstralCoreError): boolean {
    return error.type === ErrorType.CRISIS || 
           CRISIS_ERROR_CODES.includes(error.code);
  }

  /**
   * Handle crisis error
   */
  private handleCrisisError(error: AstralCoreError): void {
    // Show immediate crisis notification
    astralCoreNotificationService.showCrisisAlert(
      'Crisis Service Error',
      'Unable to connect to crisis services. Please call 988 or 911 for immediate help.',
      [
        { action: 'call-988', title: 'Call 988' },
        { action: 'call-911', title: 'Call 911' },
      ]
    );

    // Log with highest priority
    console.error('ASTRAL CORE CRISIS ERROR:', error);

    // Report immediately
    this.reportError(error, true);
  }

  /**
   * Log error
   */
  private logError(error: AstralCoreError, suppressConsole: boolean): void {
    // Add to log
    this.errorLog.push(error);

    // Limit log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging
    if (!suppressConsole && isDev()) {
      let logMethod: keyof Console;
      if (error.severity === ErrorSeverity.CRITICAL) {
        logMethod = 'error';
      } else if (error.severity === ErrorSeverity.HIGH) {
        logMethod = 'warn';
      } else {
        logMethod = 'log';
      }
      
      console[logMethod]('Astral Core Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        context: error.context,
      });
    }
  }

  /**
   * Should notify user
   */
  private shouldNotifyUser(error: AstralCoreError): boolean {
    // Always notify for critical errors
    if (error.severity === ErrorSeverity.CRITICAL) {
      return true;
    }

    // Don't notify for low severity
    if (error.severity === ErrorSeverity.LOW) {
      return false;
    }

    // Check if too many notifications recently
    const recentNotifications = this.errorLog
      .filter(e => Date.now() - e.timestamp.getTime() < 60000)
      .length;

    return recentNotifications < 3;
  }

  /**
   * Notify user of error
   */
  private notifyUser(error: AstralCoreError): void {
    const notificationOptions: Partial<Notification> = {
      type: NotificationType.SYSTEM_ALERT,
      priority: error.severity === ErrorSeverity.CRITICAL ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
      title: 'Error',
      body: error.userMessage,
    };

    // Add actions if available
    if (error.actions && error.actions.length > 0) {
      notificationOptions.actions = error.actions.map(a => ({
        action: a.label.toLowerCase().replace(/\s+/g, '-'),
        title: a.label,
        icon: undefined,
      }));
    }

    astralCoreNotificationService.show(notificationOptions);
  }

  /**
   * Report error to server
   */
  private reportError(error: AstralCoreError, immediate = false): void {
    if (!this.reportingEnabled) return;

    // Add to batch
    this.errorBatch.push(error);

    if (immediate || error.severity === ErrorSeverity.CRITICAL) {
      // Send immediately
      this.sendErrorBatch();
    } else {
      // Batch report
      this.scheduleBatchReport();
    }
  }

  /**
   * Schedule batch report
   */
  private scheduleBatchReport(): void {
    if (this.batchReportTimer) return;

    this.batchReportTimer = setTimeout(() => {
      this.sendErrorBatch();
      this.batchReportTimer = null;
    }, 5000); // Send after 5 seconds
  }

  /**
   * Send error batch to server
   */
  private async sendErrorBatch(): Promise<void> {
    if (this.errorBatch.length === 0) return;

    const batch = [...this.errorBatch];
    this.errorBatch = [];

    try {
      await apiClient.post('/errors/report', {
        errors: batch,
        sessionId: this.sessionId,
        environment: isProd() ? 'production' : 'development',
      });
    } catch (error) {
      console.error('Astral Core: Failed to report errors', error);
      // Don't re-add to batch to avoid infinite loop
    }
  }

  /**
   * Setup retry
   */
  private setupRetry(error: AstralCoreError, retry: () => Promise<void>): void {
    const delay = error.retryAfter || 3000;

    setTimeout(async () => {
      try {
        await retry();
        
        // Notify success
        astralCoreNotificationService.show({
          type: NotificationType.SYSTEM_ALERT,
          priority: NotificationPriority.NORMAL,
          title: 'Success',
          body: 'The operation completed successfully.',
        });
      } catch (retryError) {
        // Handle retry failure
        this.handle(retryError as Error, {
          notify: true,
          retry: undefined, // Don't retry again
        });
      }
    }, delay);
  }

  /**
   * Emit error to listeners
   */
  private emitError(error: AstralCoreError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Astral Core: Error listener failed', listenerError);
      }
    });
  }

  /**
   * Show critical error UI
   */
  private showCriticalErrorUI(error: AstralCoreError): void {
    // Create error overlay
    const overlay = document.createElement('div');
    overlay.className = 'astral-core-critical-error';
    overlay.innerHTML = `
      <div class="error-container">
        <h2>Something went wrong</h2>
        <p>${error.userMessage}</p>
        <div class="error-actions">
          <button onclick="window.location.reload()">Reload Page</button>
          <button onclick="window.location.href='/'">Go Home</button>
        </div>
        <details>
          <summary>Error Details</summary>
          <pre>${JSON.stringify({
            code: error.code,
            message: error.message,
            timestamp: error.timestamp,
          }, null, 2)}</pre>
        </details>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .astral-core-critical-error {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .error-container {
        max-width: 500px;
        padding: 2rem;
        background: #1a1a1a;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      }
      .error-container h2 {
        margin: 0 0 1rem 0;
        color: #ff6b6b;
      }
      .error-container p {
        margin: 0 0 1.5rem 0;
        line-height: 1.6;
      }
      .error-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .error-actions button {
        flex: 1;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        background: #4263eb;
        color: white;
        cursor: pointer;
        font-size: 1rem;
      }
      .error-actions button:hover {
        background: #364fc7;
      }
      details {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #333;
      }
      summary {
        cursor: pointer;
        color: #868e96;
      }
      pre {
        margin: 1rem 0 0 0;
        padding: 1rem;
        background: #0a0a0a;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  /**
   * Save error state for recovery
   */
  private saveErrorState(error: AstralCoreError): void {
    try {
      sessionStorage.setItem('astralcore_last_error', JSON.stringify({
        error,
        state: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (e) {
      console.error('Astral Core: Failed to save error state', e);
    }
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate listener ID
   */
  private generateListenerId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const astralCoreErrorService = new AstralCoreErrorService();

export default astralCoreErrorService;
