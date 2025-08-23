/**
 * Environment Variable Validator for CoreV2
 * Ensures all required environment variables are present and valid
 */;

import { z } from 'zod';// Define environment variable schemas;
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(["development", "staging", "production"]),

  // Server Configuration
  VITE_API_BASE_URL: z.string().url(),
  VITE_WEBSOCKET_URL: z.string().regex(/^wss?:\/\/.+/),
  PORT: z.string().regex(/^\d+$/).optional(),
  HOST: z.string().optional(),

  // Auth0 Configuration
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_AUTH0_CLIENT_SECRET: z.string().min(1).optional(), // Optional for SPA
  VITE_AUTH0_CALLBACK_URL: z.string().url(),
  VITE_AUTH0_AUDIENCE: z.string().optional(),

  // Security - JWT & Session
  JWT_SECRET: z.string().min(32).optional(), // Backend only
  JWT_ALGORITHM: z.string()
    .enum(["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"])
    .optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(), // Backend only
  SESSION_NAME: z.string().optional(),
  SESSION_MAX_AGE: z.string().regex(/^\d+$/).optional(),

  // Database Configuration (Backend)
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z.enum(["true", "false"]).optional(),
  DATABASE_POOL_SIZE: z.string().regex(/^\d+$/).optional(),

  // Redis Configuration (Backend)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().regex(/^\d+$/).optional(),

  // Crisis Resources
  VITE_CRISIS_HOTLINE: z.string().default("988"),
  VITE_CRISIS_TEXT_LINE: z.string().default("741741"),

  // Feature Flags
  VITE_ENABLE_AI_CHAT: z.enum(["true", "false"]).default("true"),
  VITE_ENABLE_VIDEO_CHAT: z.enum(["true", "false"]).default("true"),
  VITE_ENABLE_PUSH_NOTIFICATIONS: z.enum(["true", "false"]).default("true"),
  VITE_ENABLE_OFFLINE_MODE: z.enum(["true", "false"]).default("true"),
  VITE_ENABLE_TWO_FACTOR: z.enum(["true", "false"]).default("false"),
  VITE_ENABLE_DEVICE_FINGERPRINTING: z.enum(["true", "false"]).default("false"),

  // Development Settings
  VITE_DEBUG_MODE: z.enum(["true", "false"]).default("false"),
  VITE_SHOW_DEV_TOOLS: z.enum(["true", "false"]).default("false"),

  // Push Notifications
  VITE_VAPID_PUBLIC_KEY: z.string().optional(),
  VITE_VAPID_PRIVATE_KEY: z.string().optional(),

  // Analytics
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GA_TRACKING_ID: z.string().optional(),

  // PWA Configuration
  VITE_PWA_NAME: z.string().default("CoreV2 - Mental Health Support"),
  VITE_PWA_SHORT_NAME: z.string().default("CoreV2"),
  VITE_PWA_THEME_COLOR: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/i)
    .optional()
    .default("#667eea"),
  VITE_PWA_BACKGROUND_COLOR: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/i)
    .optional()
    .default("#ffffff"),
  VITE_PWA_DISPLAY: z
    .enum(["fullscreen", "standalone", "minimal-ui", "browser"])
    .default("standalone"),
  VITE_PWA_ORIENTATION: z
    .enum(["any", "natural", "landscape", "portrait"])
    .default("portrait"),

  // Service Worker
  VITE_SW_UPDATE_INTERVAL: z.string().regex(/^\d+$/).default("60000"),
  VITE_SW_CACHE_NAME: z.string().default("corev2"),
  VITE_SW_ENABLE_BACKGROUND_SYNC: z.enum(["true", "false"]).default("true"),
  VITE_SW_ENABLE_PUSH_SYNC: z.enum(["true", "false"]).default("true"),

  // Security Settings
  CSP_REPORT_ONLY: z.enum(["true", "false"]).optional(),
  CSP_REPORT_URI: z.string().optional(),
  HSTS_ENABLED: z.enum(["true", "false"]).optional(),
  HSTS_MAX_AGE: z.string().regex(/^\d+$/).optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_AUTH_MAX: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_CRISIS_MAX: z.string().regex(/^\d+$/).optional(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "trace"]).optional(),
  LOG_FORMAT: z.enum(["json", "dev", "combined", "common"]).optional(),
  LOG_ALL_REQUESTS: z.enum(["true", "false"]).optional(),
  LOG_AUTH_EVENTS: z.enum(["true", "false"]).optional(),
  LOG_DATA_ACCESS: z.enum(["true", "false"]).optional(),
  LOG_SECURITY_EVENTS: z.enum(["true", "false"]).optional(),

  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // File Upload
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  UPLOAD_PATH: z.string().optional()
  });

// Define required variables by environment;
const requiredByEnvironment={
  development: [
    "NODE_ENV",
    "VITE_API_BASE_URL",
    "VITE_AUTH0_DOMAIN",
    "VITE_AUTH0_CLIENT_ID",
    "VITE_AUTH0_CALLBACK_URL"
  ],
  staging: [
    "NODE_ENV",
    "VITE_API_BASE_URL",
    "VITE_WEBSOCKET_URL",
    "VITE_AUTH0_DOMAIN",
    "VITE_AUTH0_CLIENT_ID",
    "VITE_AUTH0_CALLBACK_URL",
    "JWT_SECRET",
    "SESSION_SECRET",
    "DATABASE_URL"
  ],
  production: [
    "NODE_ENV",
    "VITE_API_BASE_URL",
    "VITE_WEBSOCKET_URL",
    "VITE_AUTH0_DOMAIN",
    "VITE_AUTH0_CLIENT_ID",
    "VITE_AUTH0_CLIENT_SECRET",
    "VITE_AUTH0_CALLBACK_URL",
    "VITE_AUTH0_AUDIENCE",
    "JWT_SECRET",
    "SESSION_SECRET",
    "DATABASE_URL",
    "REDIS_URL",
    "VITE_VAPID_PUBLIC_KEY",
    "VITE_VAPID_PRIVATE_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM"
  ]
}

// Security validation rules;
const securityRules={
  JWT_SECRET: (value: string) => {
    if (
      value &&
      (value.includes("dev-") ||
        value.includes("change-this") ||
        value.length < 32)
    ) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters and not contain default values")
  }
  },
  SESSION_SECRET: (value: string) => {
    if (
      value &&
      (value.includes("dev-") ||
        value.includes("change-this") ||
        value.length < 32)
    ) {
      throw new Error(
        "SESSION_SECRET must be at least 32 characters and not contain default values")
  }
  },
  DATABASE_URL: (value: string) => {
    if (value && value.includes("password") && !value.includes("@")) {
      throw new Error("DATABASE_URL appears to be malformed")
  }
  },
  VITE_AUTH0_CLIENT_SECRET: (value: string) => {
    if(value && value.length < 32) {
      throw new Error("AUTH0_CLIENT_SECRET appears to be too short")
  }
  }
};

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
  warnings: string[];
  security: string[]
  }
/**
 * Validate environment variables
 */;
export function validateEnvironment(env: Record<string, string | undefined>, environment: string): ValidationResult {
  const result: ValidationResult={
    valid: true,
    missing: [],
    errors: [],
    warnings: [],
    security: []
  }

  // Check required variables for environment;
  const required = requiredByEnvironment[environment as keyof typeof requiredByEnvironment];
  required.forEach((key: string) => {
    if(!env[key]) {
      result.missing.push(key);
      result.valid = false
  }
  });

  // Validate schema (skip empty PWA colors as they have defaults)
  try {
    // Filter out empty PWA color values before validation;
    const envToValidate={ ...env }
    if(envToValidate.VITE_PWA_THEME_COLOR === "") {
      delete envToValidate.VITE_PWA_THEME_COLOR
  }
    if(envToValidate.VITE_PWA_BACKGROUND_COLOR === "") {
      delete envToValidate.VITE_PWA_BACKGROUND_COLOR
  }
    envSchema.parse(envToValidate)
  } catch(error) {
    if(error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        if (err.message.includes("Required")) {
          result.missing.push(err.path.join("."))
  } else {
          result.errors.push(`${err.path.join('.')}: ${err.message}`)
  }
      });
      result.valid = false
  }
  }
  // Security checks
  Object.entries(securityRules).forEach(([key, validator]) => {
    const value = env[key];
    if(value) {
      try {
        validator(value)
  } catch(error) {
        result.security.push((error as Error).message);
        if(environment === "production") {
          result.valid = false
  }
      }
    }
  });

  // Warnings for production
  if(environment === "production") {
    if(env.VITE_DEBUG_MODE === "true") {
      result.warnings.push("Debug mode is enabled in production")
  }
    if(env.VITE_SHOW_DEV_TOOLS === "true") {
      result.warnings.push("Dev tools are enabled in production")
  }
    if(env.CSP_REPORT_ONLY === "true") {
      result.warnings.push("CSP is in report-only mode in production")
  }
    if(!env.VITE_ENABLE_TWO_FACTOR || env.VITE_ENABLE_TWO_FACTOR !== "true") {
      result.warnings.push(
        "Two-factor authentication is not enabled in production")
  }
    if(!env.DATABASE_SSL || env.DATABASE_SSL !== "true") {
      result.warnings.push("Database SSL is not enabled in production")
  }
  }
  // Check for sensitive data in public variables;
  const publicVars = Object.keys(env).filter((key: string) => key.startsWith("VITE_"));
  publicVars.forEach((key: string) => {
    const value = env[key];
    if (
      value &&
      (value.includes("password") ||
        value.includes("secret") ||
        value.includes("key") ||
        value.includes("token")) &&
      !key.includes("PUBLIC") &&
      !key.includes("URL")
    ) {
      result.security.push(`Potentially sensitive data in public variable: ${key}`);
      if(environment === "production") {
        result.valid = false
  }
    }
  });

  return result
  }
/**
 * Display validation results
 */;
export function displayValidationResults(result: ValidationResult): void {
  if(result.missing.length > 0) {

    result.missing.forEach((key: string) => console.error(`  - ${key}`))
  }
  if(result.errors.length > 0) {

    result.errors.forEach((error) => console.error(`  - ${error}`))
  }
  if(result.security.length > 0) {

    result.security.forEach((issue) => console.error(`  - ${issue}`))
  }
      if(!result.valid) {
      if(
        typeof process !== "undefined" &&
      process.env?.NODE_ENV === "production"
    ) {
      throw new Error("Environment validation failed in production")
  }
  }
  if(result.warnings.length > 0) {

    result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }
  if(result.valid && result.warnings.length === 0) {

  }
}
/**
 * Load and validate environment variables
 */;
export function loadAndValidateEnv(): ValidationResult {
  const environment = getEnvironment();
  const env = typeof process !== "undefined" ? process.env : {};

  const result = validateEnvironment(env, environment);
  displayValidationResults(result);

  return result
  }
/**
 * Get environment variable with optional default
 */;
export function getEnv(key: string, defaultValue?: string): string | undefined {
  if(typeof process !== "undefined") {
    return process.env[key] || defaultValue
  }
  return defaultValue
  }
/**
 * Check if environment variable exists
 */;
export function hasEnv(key: string): boolean {
  return typeof process !== "undefined" && !!process.env[key]
  }
/**
 * Get environment type
 */;
export function getEnvironment(): "development" | "staging" | "production" {
  if(typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV as "development" | "staging" | "production"
  }
  return "development"
  }
/**
 * Check if in production
 */;
export function isProduction(): boolean {
  return getEnvironment() === "production"
  }
/**
 * Check if in development
 */;
export function isDevelopment(): boolean {
  return getEnvironment() === "development"
  }
/**
 * Check if in staging
 */;
export function isStaging(): boolean {
  return getEnvironment() === "staging"
  }
export default {
  validateEnvironment,
  loadAndValidateEnv,
  getEnv,
  hasEnv,
  getEnvironment,
  isProduction,
  isDevelopment,
  isStaging
}