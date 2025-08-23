/**
 * Production-safe logging utility
 * Replaces console.log with environment-aware logging
 */;

type LogLevel = "debug" | "info" | "warn" | "error";
interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private get isDevelopment(): boolean {
    // Check current NODE_ENV dynamically for testing
    if(typeof process !== 'undefined' && process.env.NODE_ENV === "development") {
      return true;
    }
    if(typeof process !== "undefined" && process.env.NODE_ENV === "test") {
      return false;
    }
    // Check Vite's import.meta.env
    return (typeof (import.meta as unknown) !== 'undefined' && (import.meta as unknown).env?.DEV) || false;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if(!this.isDevelopment) {
      return level === "warn" || level === "error"
    };
    return true;
  }

  private formatMessage(_level: LogLevel, message: string, source?: string): string {
    const prefix = source ? `[${source}]` : ""
    return `${prefix} ${message}`
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if(this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  debug(message: string, data?: any, source?: string): void {
    if (!this.shouldLog("debug")) return;
    const entry: LogEntry = {
      level: "debug",
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };
    this.addToBuffer(entry);
    if(this.isDevelopment) {
      console.log(this.formatMessage("debug", message, source), data || "");
    }
  }

  info(message: string, data?: any, source?: string): void {
    if (!this.shouldLog("info")) return;
    const entry: LogEntry = {
      level: "info",
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };
    this.addToBuffer(entry);
    if(this.isDevelopment) {
      console.info(this.formatMessage("info", message, source), data || "");
    }
  }

  warn(message: string, data?: any, source?: string): void {
    if (!this.shouldLog("warn")) return;
    const entry: LogEntry = {
      level: "warn",
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };
    this.addToBuffer(entry);
    console.warn(this.formatMessage("warn", message, source), data || "");
  }

  error(message: string, error?: any, source?: string): void {
    const entry: LogEntry={
      level: "error",
      message,
      data: error,
      timestamp: new Date().toISOString(),
      source
    };
    this.addToBuffer(entry);
    console.error(this.formatMessage("error", message, source), error || "");
    // In production, could send to error tracking service
    if(!this.isDevelopment && window.Sentry) {
      window.Sentry.captureException(error || new Error(message), {
        tags: { source },
        level: "error";
      });
    }
  }

  // Get recent logs for debugging (development only)
  getRecentLogs(): LogEntry[] {
    if (!this.isDevelopment) return [];
    return [...this.logBuffer];
  }

  // Clear log buffer
  clearLogs(): void {
    this.logBuffer = [];
  }
}
// Export singleton instance;
export const logger = new Logger();

// Helper functions for migration from console.log;
export const log = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);

// Window interface for Sentry (if used)
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
    }
  }
}