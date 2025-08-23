/**
 * Backend Service for CoreV2
 * Handles all API communication with Netlify Functions
 */

import { logger } from '../utils/logger';

// Determine API base URL based on environment
const API_BASE_URL = (typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
  ? 'http://localhost:8888/.netlify/functions/api'
  : ((typeof (import.meta as any) !== 'undefined' && (import.meta as any).env?.DEV) 
    ? 'http://localhost:8888/.netlify/functions/api'
    : '/.netlify/functions/api');

// Helper function for API calls
async function apiCall(
  endpoint: string, 
  method: string = 'GET', 
  body?: any,
  headers?: Record<string, string>
) {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('API Call Failed:', error, 'backendService');
    throw error;
  }
}

// User Management
export const userService = {
  async register(email: string, password: string, role: 'seeker' | 'helper' = 'seeker') {
    return apiCall('/users/register', 'POST', { email, password, role });
  },

  async getProfile() {
    return apiCall('/users/profile');
  },

  async updateProfile(data: unknown) {
    return apiCall('/users/profile', 'PUT', data);
  }
};

// Mood Tracking
export const moodService = {
  async saveMoodEntry(moodData: {
    mood: string;
    score: number;
    notes?: string;
    triggers?: string[];
    activities?: string[];
  }) {
    return apiCall('/mood', 'POST', moodData);
  },

  async getMoodHistory() {
    return apiCall('/mood');
  },

  async getMoodAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    return apiCall(`/mood/analytics?period=${period}`);
  }
};

// Assessments
export const assessmentService = {
  async submitAssessment(type: string, responses: unknown[]) {
    return apiCall('/assessments/submit', 'POST', { type, responses });
  },

  async getAssessmentHistory() {
    return apiCall('/assessments');
  },

  async getLatestAssessment(type: string) {
    return apiCall(`/assessments/latest?type=${type}`);
  }
};

// Safety Planning
export const safetyPlanService = {
  async getSafetyPlan() {
    return apiCall('/safety-plan');
  },

  async saveSafetyPlan(planData: {
    warningSignals: string[];
    copingStrategies: string[];
    distractions: string[];
    supportContacts: Array<{ name: string; phone: string; relationship: string }>;
    professionalContacts: Array<{ name: string; phone: string; role: string }>;
    safeEnvironment: string[];
    reasonsToLive: string[];
  }) {
    return apiCall('/safety-plan', 'POST', planData);
  },

  async updateSafetyPlan(section: string, data: any) {
    return apiCall('/safety-plan', 'PATCH', { section, data });
  }
};

// Journal/Reflections
export const journalService = {
  async saveEntry(entry: {
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
  }) {
    return apiCall('/journal', 'POST', entry);
  },

  async getEntries(limit: number = 20, offset: number = 0) {
    return apiCall(`/journal?limit=${limit}&offset=${offset}`);
  },

  async getEntry(id: string) {
    return apiCall(`/journal/${id}`);
  },

  async updateEntry(id: string, updates: any) {
    return apiCall(`/journal/${id}`, 'PUT', updates);
  },

  async deleteEntry(id: string) {
    return apiCall(`/journal/${id}`, 'DELETE');
  }
};

// Crisis Resources
export const crisisService = {
  async getResources() {
    return apiCall('/crisis/resources');
  },

  async reportCrisis(data: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    triggers?: string[];
    currentLocation?: string;
    needsImmediate: boolean;
  }) {
    return apiCall('/crisis/report', 'POST', data);
  },

  async getEmergencyContacts() {
    return apiCall('/crisis/emergency-contacts');
  }
};

// Peer Support
export const peerSupportService = {
  async findMatch(preferences: any) {
    return apiCall('/peer-support/match', 'POST', preferences);
  },

  async sendMessage(recipientId: string, message: string) {
    return apiCall('/peer-support/message', 'POST', { recipientId, message });
  },

  async getConversations() {
    return apiCall('/peer-support/conversations');
  },

  async reportUser(userId: string, reason: string) {
    return apiCall('/peer-support/report', 'POST', { userId, reason });
  }
};

// Health Check
export const healthService = {
  async checkHealth() {
    return apiCall('/health');
  }
};

// Export all services
export const backendService = {
  user: userService,
  mood: moodService,
  assessment: assessmentService,
  safetyPlan: safetyPlanService,
  journal: journalService,
  crisis: crisisService,
  peerSupport: peerSupportService,
  health: healthService
};

export default backendService;