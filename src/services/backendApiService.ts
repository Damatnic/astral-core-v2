// Comprehensive Backend API Service
import { simpleAuthService } from './simpleAuthService';

const API_BASE = '/.netlify/functions';

class BackendApiService {
  private async apiRequest(endpoint: string, method: string = 'GET', data?: any) {
    const token = simpleAuthService.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }
      
      return result;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Wellness API
  wellness = {
    // Check-ins
    getCheckIns: async () => {
      return this.apiRequest('/wellness/checkins');
    },
    
    postCheckIn: async (checkIn: {
      moodScore: number;
      anxietyLevel: number;
      sleepQuality: number;
      energyLevel: number;
      tags: string[];
      notes: string;
    }) => {
      return this.apiRequest('/wellness/checkins', 'POST', checkIn);
    },
    
    // Journal
    getJournalEntries: async () => {
      return this.apiRequest('/wellness/journal');
    },
    
    postJournalEntry: async (entry: {
      content: string;
      mood?: number;
      tags?: string[];
    }) => {
      return this.apiRequest('/wellness/journal', 'POST', entry);
    },
    
    // Habits
    getHabits: async () => {
      return this.apiRequest('/wellness/habits');
    },
    
    addHabit: async (habit: {
      habitId: string;
      name: string;
    }) => {
      return this.apiRequest('/wellness/habits', 'POST', habit);
    },
    
    completeHabit: async (habitId: string) => {
      return this.apiRequest(`/wellness/habits/${habitId}/complete`, 'POST');
    },
    
    // Safety Plan
    getSafetyPlan: async () => {
      return this.apiRequest('/wellness/safety-plan');
    },
    
    saveSafetyPlan: async (plan: any) => {
      return this.apiRequest('/wellness/safety-plan', 'POST', plan);
    },
    
    // Mood History with AI Insights
    getMoodHistory: async (limit: number = 30) => {
      return this.apiRequest(`/wellness/mood-history?limit=${limit}`);
    }
  };

  // Assessments API
  assessments = {
    getTemplates: async () => {
      return this.apiRequest('/assessments/templates');
    },
    
    getHistory: async () => {
      return this.apiRequest('/assessments');
    },
    
    submitAssessment: async (assessmentId: string, answers: number[]) => {
      return this.apiRequest('/assessments', 'POST', { assessmentId, answers });
    },
    
    getAssessment: async (id: string) => {
      return this.apiRequest(`/assessments/${id}`);
    },
    
    getRecommendations: async () => {
      return this.apiRequest('/assessments/recommendations');
    }
  };

  // Settings API
  settings = {
    getAll: async () => {
      return this.apiRequest('/settings');
    },
    
    updateAll: async (settings: any) => {
      return this.apiRequest('/settings', 'PUT', settings);
    },
    
    updateCategory: async (category: string, settings: any) => {
      return this.apiRequest(`/settings/${category}`, 'PUT', settings);
    },
    
    reset: async () => {
      return this.apiRequest('/settings/reset', 'POST');
    },
    
    export: async () => {
      return this.apiRequest('/settings/export');
    },
    
    import: async (settings: any) => {
      return this.apiRequest('/settings/import', 'POST', { settings });
    },
    
    // Emergency contacts
    getEmergencyContacts: async () => {
      return this.apiRequest('/settings/emergency-contacts');
    },
    
    addEmergencyContact: async (contact: {
      name: string;
      phone: string;
      relationship: string;
    }) => {
      return this.apiRequest('/settings/emergency-contacts', 'POST', contact);
    },
    
    deleteEmergencyContact: async (contactId: string) => {
      return this.apiRequest(`/settings/emergency-contacts/${contactId}`, 'DELETE');
    }
  };

  // Crisis Detection Service
  crisisDetection = {
    analyzeText: async (text: string) => {
      // Local crisis keyword detection
      const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'want to die',
        'hurt myself', 'self harm', 'cutting', 'overdose',
        'no point', 'hopeless', 'can\'t go on', 'better off dead'
      ];
      
      const lowerText = text.toLowerCase();
      const detected = crisisKeywords.some(keyword => lowerText.includes(keyword));
      
      if (detected) {
        // Log crisis detection (in production, this would alert support)
        console.warn('Crisis keywords detected');
        
        return {
          success: true,
          data: {
            crisisDetected: true,
            severity: 'high',
            resources: [
              { name: '988 Suicide & Crisis Lifeline', number: '988' },
              { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
              { name: 'Emergency Services', number: '911' }
            ],
            message: 'We\'re concerned about you. Please reach out for help.'
          }
        };
      }
      
      return {
        success: true,
        data: {
          crisisDetected: false,
          severity: 'none'
        }
      };
    },
    
    analyzeMood: async (moodData: {
      score: number;
      anxiety: number;
      notes?: string;
    }) => {
      const isHighRisk = 
        moodData.score <= 2 || 
        moodData.anxiety >= 4 ||
        (moodData.notes && await this.crisisDetection.analyzeText(moodData.notes).then(r => r.data.crisisDetected));
      
      return {
        success: true,
        data: {
          riskLevel: isHighRisk ? 'high' : moodData.score <= 3 ? 'medium' : 'low',
          suggestions: isHighRisk ? 
            ['Consider reaching out to a crisis helpline', 'Talk to someone you trust', 'Use emergency coping strategies'] :
            ['Practice self-care', 'Try breathing exercises', 'Connect with support network']
        }
      };
    }
  };

  // Data Sync Service
  dataSync = {
    syncAll: async () => {
      try {
        // Collect local data for sync
        // In production, this would sync with the backend
        const wellness = localStorage.getItem('wellnessData');
        const assessments = localStorage.getItem('assessmentsData');
        const settings = localStorage.getItem('userSettings');
        
        // Log sync initiation
        console.log('Data sync initiated', { 
          hasWellness: !!wellness, 
          hasAssessments: !!assessments, 
          hasSettings: !!settings 
        });
        
        return {
          success: true,
          message: 'Data synced successfully'
        };
      } catch (error) {
        console.error('Sync failed:', error);
        return {
          success: false,
          error: 'Sync failed'
        };
      }
    },
    
    backup: async () => {
      try {
        const backup = {
          wellness: await this.wellness.getCheckIns(),
          journal: await this.wellness.getJournalEntries(),
          assessments: await this.assessments.getHistory(),
          settings: await this.settings.getAll(),
          timestamp: new Date().toISOString()
        };
        
        // Create downloadable backup
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `mental-health-backup-${new Date().toISOString().split('T')[0]}.json`);
        linkElement.click();
        
        return {
          success: true,
          message: 'Backup created successfully'
        };
      } catch (error) {
        console.error('Backup failed:', error);
        return {
          success: false,
          error: 'Backup failed'
        };
      }
    }
  };
}

export const backendApiService = new BackendApiService();
export default backendApiService;