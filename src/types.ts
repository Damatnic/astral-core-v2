/**
 * Core Types for CoreV2 Mental Health Platform
 * Clean, comprehensive type definitions for the entire application
 */

import { UserRole } from './services/auth0Service';

// ======================== USER TYPES ========================

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  roles?: UserRole[];
  picture?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ======================== DILEMMA TYPES ========================

export type DilemmaStatus = 
  | 'active' 
  | 'in_progress' 
  | 'resolved' 
  | 'direct_request' 
  | 'declined' 
  | 'removed_by_moderator';

export interface Dilemma {
  id: string;
  userToken: string;
  userId?: string;
  title?: string;
  category: string;
  content: string;
  timestamp: string;
  postedAt?: string;
  anonymous?: boolean;
  supportCount: number;
  isSupported: boolean;
  isReported: boolean;
  reportReason?: string;
  status: DilemmaStatus;
  assignedHelperId?: string;
  helperDisplayName?: string;
  resolved_by_seeker?: boolean;
  requestedHelperId?: string;
  summary?: string;
  summaryLoading?: boolean;
  moderation?: {
    action: 'removed' | 'dismissed';
    moderatorId: string;
    timestamp: string;
    flagged?: boolean;
    approved?: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

// ======================== HELPER TYPES ========================

export interface Helper {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  rating?: number;
  isAvailable: boolean;
  profilePicture?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  specializations?: string[];
  languages?: string[];
  timezone?: string;
  responseTime?: string;
  totalSessions?: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
}

// ======================== CHAT TYPES ========================

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  metadata?: {
    crisisDetected?: boolean;
    sentiment?: string;
    topics?: string[];
    provider?: string;
  };
}

export interface AIChatSession {
  id: string;
  userId: string;
  provider: 'openai' | 'claude';
  startTime: Date;
  endTime?: Date;
  messages: AIChatMessage[];
  metadata?: {
    crisisDetectionEnabled?: boolean;
    moderationEnabled?: boolean;
    sessionType?: string;
  };
  lastActivity?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// ======================== ASSESSMENT TYPES ========================

export interface Assessment {
  id: string;
  userId: string;
  type: 'mood' | 'anxiety' | 'depression' | 'stress' | 'general';
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  results?: AssessmentResult;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  required: boolean;
  category?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  answers: AssessmentAnswer[];
  score: number;
  maxScore: number;
  percentageScore: number;
  interpretation: string;
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  followUpRequired: boolean;
  createdAt: string;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | number | boolean;
  points: number;
}

// ======================== WELLNESS TYPES ========================

export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  notes?: string;
  tags?: string[];
  timestamp: string;
  activities?: string[];
  triggers?: string[];
}

export interface WellnessGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'mood' | 'exercise' | 'sleep' | 'meditation' | 'social' | 'other';
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  isCompleted: boolean;
  progress: number; // 0-100 percentage
}

// ======================== CRISIS TYPES ========================

export interface CrisisIndicator {
  keyword: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string[];
  category: 'suicidal' | 'self-harm' | 'substance-abuse' | 'violence' | 'emergency' | 'general-distress';
  immediateAction: boolean;
  triggerPhrases?: string[];
  sentimentScoreThreshold?: number;
}

export interface CrisisAnalysisResult {
  hasCrisisIndicators: boolean;
  severityLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detectedIndicators: CrisisIndicator[];
  suggestedActions: string[];
  timestamp: Date;
  rawText?: string;
  sentimentScore?: number;
  immediateIntervention: boolean;
  recommendedActions: string[];
  emergencyContacts: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isHealthcareProfessional?: boolean;
  notes?: string;
  availableHours?: string;
}

// ======================== NOTIFICATION TYPES ========================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'crisis';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

// ======================== SESSION TYPES ========================

export interface TherapySession {
  id: string;
  userId: string;
  helperId?: string;
  type: 'individual' | 'group' | 'crisis' | 'ai-assisted';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
  feedback?: string;
  followUpRequired: boolean;
  nextSessionAt?: string;
}

// ======================== COMMUNITY TYPES ========================

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'hidden' | 'reported' | 'removed';
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  content: string;
  isAnonymous: boolean;
  likes: number;
  isLiked: boolean;
  parentCommentId?: string;
  replies?: CommunityComment[];
  createdAt: string;
  updatedAt?: string;
}

// ======================== RESOURCE TYPES ========================

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'pdf' | 'external_link' | 'tool';
  category: string;
  tags: string[];
  url?: string;
  content?: string;
  duration?: number; // for videos/audio in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  ratingCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ======================== ANALYTICS TYPES ========================

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string; // Hashed for privacy
  pageUrl?: string;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  featuresUsed: string[];
  lastActiveAt: string;
  engagementScore: number;
  wellnessProgress: number;
  riskAssessment: 'low' | 'moderate' | 'high';
}

// ======================== CONFIGURATION TYPES ========================

export interface AppConfig {
  features: {
    aiChat: boolean;
    crisisDetection: boolean;
    communitySupport: boolean;
    assessments: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  limits: {
    maxFileSize: number;
    maxMessageLength: number;
    dailySessionLimit: number;
  };
  crisis: {
    hotlineNumber: string;
    textLine: string;
    emergencyNumber: string;
  };
}

// ======================== API TYPES ========================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

// ======================== FORM TYPES ========================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ======================== THEME TYPES ========================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  customCSS?: string;
}

// ======================== ACCESSIBILITY TYPES ========================

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  voiceCommands: boolean;
  colorBlindSupport: boolean;
  focusIndicators: boolean;
}

// ======================== UTILITY TYPES ========================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, any>;
}

// ======================== EXPORT ALL ========================

export type {
  UserRole,
};

// Re-export commonly used types for convenience
export type {
  User,
  Dilemma,
  Helper,
  Assessment,
  MoodEntry,
  CrisisAnalysisResult,
  Notification,
  TherapySession,
  CommunityPost,
  Resource,
  ApiResponse,
  FormState,
  ThemeConfig,
  AccessibilitySettings,
};
