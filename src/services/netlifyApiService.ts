/**
 * Netlify API Service for CoreV2
 * Handles communication with Netlify Functions backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/.netlify/functions';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    locale?: string;
    timezone?: string;
  };
}

interface MoodEntry {
  id: string;
  user_id: string;
  mood_value: number;
  mood_label: string;
  notes?: string;
  activities?: string[];
  location?: any;
  weather?: any;
  encrypted_data?: string;
  created_at: string;
}

interface WellnessAssessment {
  id: string;
  user_id: string;
  assessment_type: string;
  responses: Record<string, number>;
  score: number;
  risk_level: string;
  recommendations: string[];
  created_at: string;
}

interface CrisisLog {
  id: string;
  user_id?: string;
  action_type: string;
  resource_accessed?: string;
  severity_level?: string;
  location?: any;
  session_id?: string;
  created_at: string;
}

class NetlifyApiService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token && !endpoint.includes('api-auth')) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !endpoint.includes('api-auth')) {
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============= Auth Methods =============
  async login(auth0Data: { auth0_id: string; email: string; name?: string }): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('api-auth', {
      method: 'POST',
      body: JSON.stringify(auth0Data),
    });
    
    this.setToken(result.token);
    
    // Store user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(result.user));
    }
    
    return result;
  }

  async logout() {
    this.clearToken();
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // ============= Mood Tracking =============
  async getMoodEntries(limit = 30): Promise<MoodEntry[]> {
    return this.request<MoodEntry[]>(`api-mood?limit=${limit}`);
  }

  async createMoodEntry(data: {
    mood_value: number;
    mood_label: string;
    notes?: string;
    activities?: string[];
    encrypted_data?: string;
  }): Promise<MoodEntry> {
    return this.request<MoodEntry>('api-mood', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMoodEntry(id: string, data: Partial<MoodEntry>): Promise<MoodEntry> {
    return this.request<MoodEntry>(`api-mood/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMoodEntry(id: string): Promise<void> {
    return this.request<void>(`api-mood/${id}`, {
      method: 'DELETE',
    });
  }

  // ============= Wellness Assessments =============
  async getWellnessAssessments(type?: string, limit = 10): Promise<WellnessAssessment[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit.toString());
    return this.request<WellnessAssessment[]>(`api-wellness?${params}`);
  }

  async submitWellnessAssessment(data: {
    assessment_type: string;
    responses: Record<string, number>;
  }): Promise<WellnessAssessment> {
    return this.request<WellnessAssessment>('api-wellness', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssessmentHistory(type: string): Promise<WellnessAssessment[]> {
    return this.request<WellnessAssessment[]>(`api-wellness/history?type=${type}`);
  }

  // ============= Crisis Support =============
  async logCrisisAction(data: {
    action_type: string;
    resource_accessed?: string;
    severity_level?: string;
    location?: any;
  }): Promise<CrisisLog> {
    return this.request<CrisisLog>('api-crisis', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        session_id: this.getSessionId(),
      }),
    });
  }

  async getCrisisHistory(limit = 10): Promise<CrisisLog[]> {
    return this.request<CrisisLog[]>(`api-crisis?limit=${limit}`);
  }

  // ============= Analytics =============
  async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      await this.request('api-analytics', {
        method: 'POST',
        body: JSON.stringify({
          event_name: eventName,
          event_properties: properties,
          session_id: this.getSessionId(),
        }),
      });
    } catch (error) {
      // Don't throw on analytics errors
      console.error('Failed to track event:', error);
    }
  }

  async getAnalyticsSummary(days = 30): Promise<unknown> {
    return this.request(`api-analytics/summary?days=${days}`);
  }

  // ============= User Preferences =============
  async getUserPreferences(): Promise<unknown> {
    return this.request('api-preferences');
  }

  async updateUserPreferences(preferences: any): Promise<unknown> {
    return this.request('api-preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // ============= Resources =============
  async getResources(type?: string, locale?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (locale) params.append('locale', locale);
    return this.request(`api-resources?${params}`);
  }

  async trackResourceAccess(resourceId: string, duration?: number) {
    try {
      await this.request('api-resources/track', {
        method: 'POST',
        body: JSON.stringify({
          resource_id: resourceId,
          duration_seconds: duration,
          session_id: this.getSessionId(),
        }),
      });
    } catch (error) {
      console.error('Failed to track resource access:', error);
    }
  }

  // ============= AI Support =============
  async sendAIMessage(message: string, context?: any): Promise<unknown> {
    return this.request('api-ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        session_id: this.getSessionId(),
      }),
    });
  }

  async getAIConversationHistory(): Promise<any[]> {
    return this.request('api-ai/history');
  }

  // ============= Helper Methods =============
  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get auth headers for external requests
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const netlifyApiService = new NetlifyApiService();
export default netlifyApiService;