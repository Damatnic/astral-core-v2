/**
 * Authentication Type Definitions
 * Centralized type definitions for authentication across the application
 */;

import { Helper } from '../types';

/**
 * JWT Token Payload
 * Standard JWT claims plus custom user data
 */;
export interface JWTPayload {
  // Standard JWT claims
  sub: string;  // Subject (user ID)
  exp: number;  // Expiration time (Unix timestamp)
  iat?: number; // Issued at (Unix timestamp)
  iss?: string; // Issuer
  aud?: string; // Audience
  
  // Custom user claims
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  roles?: string[];
  helperProfile?: Helper;
  userType?: 'seeker' | 'helper' | 'admin' | 'moderator';
  isEmailVerified?: boolean;
  
  // Auth0 specific claims
  'https://astralcore.com/roles'?: string[];
  'https://astralcore.com/permissions'?: string[];
}

/**
 * Authenticated User
 * User data available after successful authentication
 */;
export interface AuthUser extends JWTPayload {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  roles?: string[];
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Demo User
 * Structure for demo/test users
 */;
export interface DemoUser {
  id: string;
  email: string;
  name: string;
  userType: 'seeker' | 'helper';
  helperProfile?: Helper;
  role?: string;
}

/**
 * Auth State
 * Global authentication state
 */;
export interface AuthState {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  user: AuthUser | null;
  helperProfile: Helper | null;
  userToken: string | null;
  anonymousId: string | null;
}

/**
 * Session Data
 * Session information for authenticated users
 */;
export interface SessionData {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  lastActivity?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Wellness Data
 * User wellness tracking data
 */;
export interface WellnessData {
  userId: string;
  moodHistory: Array<{
    mood: string;
    timestamp: string;
    notes?: string;
  }>;
  activities: Array<{
    type: string;
    duration: number;
    timestamp: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    targetDate?: string;
  }>;
}

 * Authentication Type Definitions
 * Centralized type definitions for authentication across the application
 */;

import { Helper } from '../types';

/**
 * JWT Token Payload
 * Standard JWT claims plus custom user data
 */;
export interface JWTPayload {
  // Standard JWT claims
  sub: string;  // Subject (user ID)
  exp: number;  // Expiration time (Unix timestamp)
  iat?: number; // Issued at (Unix timestamp)
  iss?: string; // Issuer
  aud?: string; // Audience
  
  // Custom user claims
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  roles?: string[];
  helperProfile?: Helper;
  userType?: 'seeker' | 'helper' | 'admin' | 'moderator';
  isEmailVerified?: boolean;
  
  // Auth0 specific claims
  'https://astralcore.com/roles'?: string[];
  'https://astralcore.com/permissions'?: string[];
}

/**
 * Authenticated User
 * User data available after successful authentication
 */;
export interface AuthUser extends JWTPayload {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  roles?: string[];
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Demo User
 * Structure for demo/test users
 */;
export interface DemoUser {
  id: string;
  email: string;
  name: string;
  userType: 'seeker' | 'helper';
  helperProfile?: Helper;
  role?: string;
}

/**
 * Auth State
 * Global authentication state
 */;
export interface AuthState {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  user: AuthUser | null;
  helperProfile: Helper | null;
  userToken: string | null;
  anonymousId: string | null;
}

/**
 * Session Data
 * Session information for authenticated users
 */;
export interface SessionData {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  lastActivity?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Wellness Data
 * User wellness tracking data
 */;
export interface WellnessData {
  userId: string;
  moodHistory: Array<{
    mood: string;
    timestamp: string;
    notes?: string;
  }>;
  activities: Array<{
    type: string;
    duration: number;
    timestamp: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    targetDate?: string;
  }>;
}
