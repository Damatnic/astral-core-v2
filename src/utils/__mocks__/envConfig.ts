/**
 * Mock environment configuration for testing
 */

export function getEnvVar(key: string, defaultValue: string = ''): string {
  // Return test defaults
  const testEnv: Record<string, string> = {
    VITE_API_BASE_URL: 'http://localhost:3847/api',
    VITE_AUTH0_DOMAIN: 'test.auth0.com',
    VITE_AUTH0_CLIENT_ID: 'test-client-id',
    VITE_AUTH0_CALLBACK_URL: 'http://localhost/callback',
    VITE_AUTH0_AUDIENCE: 'http://localhost:3847/api',
    VITE_AUTH0_CLIENT_SECRET: 'test-secret',
    VITE_VAPID_PUBLIC_KEY: 'test-vapid-key',
    VITE_WS_URL: 'ws://localhost:3001',
    VITE_SENTRY_DSN: '',
    VITE_SENTRY_DEV_ENABLED: 'false',
    VITE_APP_VERSION: 'test',
    VITE_ENV: 'test',
  };
  
  return testEnv[key] || defaultValue;
}

export function isDev(): boolean {
  return false;
}

export function isProd(): boolean {
  return false;
}

export const ENV = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3847/api',
  
  // Auth0 Configuration
  AUTH0_DOMAIN: 'test.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CALLBACK_URL: 'http://localhost/callback',
  AUTH0_AUDIENCE: 'http://localhost:3847/api',
  AUTH0_CLIENT_SECRET: 'test-secret',
  
  // Push Notifications
  VAPID_PUBLIC_KEY: 'test-vapid-key',
  
  // WebSocket
  WS_URL: 'ws://localhost:3001',
  
  // Sentry
  SENTRY_DSN: '',
  SENTRY_DEV_ENABLED: false,
  
  // App Info
  APP_VERSION: 'test',
  ENV: 'test',
  
  // Flags
  IS_DEV: false,
  IS_PROD: false,
};