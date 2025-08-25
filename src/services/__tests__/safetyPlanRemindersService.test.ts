/**
 * Test Suite for Safety Plan Reminders Service
 *
 * Comprehensive tests for safety plan creation, management, and reminder systems
 * including mood-based triggers, crisis escalation, and cultural adaptations.
 *
 * @fileoverview Tests for safetyPlanRemindersService
 * @version 2.0.0
 */

import { safetyPlanRemindersService } from '../safetyPlanRemindersService';
import { moodAnalysisService } from '../moodAnalysisService';
import { crisisDetectionIntegrationService } from '../crisisDetectionIntegrationService';

// Mock dependencies
jest.mock('../safetyPlanRemindersService', () => ({
  safetyPlanRemindersService: {
    reset: jest.fn(),
    createSafetyPlan: jest.fn(),
    getTemplates: jest.fn(),
    createAdaptivePlan: jest.fn(),
    handleCrisisEvent: jest.fn(),
    getActiveReminders: jest.fn(),
    createInteractiveReminder: jest.fn(),
    scheduleCheckIn: jest.fn(),
    processCheckInResponse: jest.fn(),
    escalateReminder: jest.fn(),
    getUserRiskLevel: jest.fn(),
    getPersonalizedContent: jest.fn(),
    trackReminderEffectiveness: jest.fn(),
    generateReminderReport: jest.fn(),
    updateReminderFrequency: jest.fn(),
    pauseReminders: jest.fn(),
    resumeReminders: jest.fn(),
    archiveOldReminders: jest.fn(),
    exportReminderData: jest.fn(),
    importReminderData: jest.fn()
  }
}));

jest.mock('../moodAnalysisService', () => ({
  moodAnalysisService: {
    analyzeMood: jest.fn(),
    getMoodHistory: jest.fn(),
    detectMoodPatterns: jest.fn(),
    getMoodTrends: jest.fn()
  }
}));

jest.mock('../crisisDetectionIntegrationService', () => ({
  crisisDetectionIntegrationService: {
    assessRiskLevel: jest.fn(),
    triggerCrisisResponse: jest.fn(),
    notifyEmergencyContacts: jest.fn(),
    escalateToProfessional: jest.fn()
  }
}));

// Test data
const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  riskLevel: 'moderate' as const,
  preferences: {
    reminderFrequency: 'daily' as const,
    preferredTime: '09:00',
    culturalContext: 'western' as const,
    language: 'en'
  }
};

const mockSafetyPlan = {
  id: 'plan123',
  userId: 'user123',
  title: 'My Safety Plan',
  warningSigns: ['feeling hopeless', 'social withdrawal'],
  copingStrategies: ['deep breathing', 'call friend'],
  emergencyContacts: [
    { name: 'Crisis Hotline', phone: '988', type: 'crisis' as const },
    { name: 'Friend', phone: '555-0123', type: 'personal' as const }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

const mockMoodAnalysis = {
  primary: 'anxious' as const,
  secondary: 'sad' as const,
  intensity: 0.7,
  confidence: 0.85,
  keywords: ['worried', 'stressed'],
  suggestions: ['try breathing exercises'],
  timestamp: Date.now()
};

const mockReminder = {
  id: 'reminder123',
  userId: 'user123',
  safetyPlanId: 'plan123',
  type: 'check-in' as const,
  title: 'Daily Check-in',
  message: 'How are you feeling today?',
  scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  frequency: 'daily' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
  responses: []
};

describe('SafetyPlanRemindersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    (safetyPlanRemindersService.reset as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Safety Plan Management', () => {
    it('should create a new safety plan', async () => {
      (safetyPlanRemindersService.createSafetyPlan as jest.Mock).mockResolvedValue(mockSafetyPlan);

      const result = await safetyPlanRemindersService.createSafetyPlan(
        mockUser.id,
        'My Safety Plan',
        mockSafetyPlan.warningSigns,
        mockSafetyPlan.copingStrategies,
        mockSafetyPlan.emergencyContacts
      );

      expect(safetyPlanRemindersService.createSafetyPlan).toHaveBeenCalledWith(
        mockUser.id,
        'My Safety Plan',
        mockSafetyPlan.warningSigns,
        mockSafetyPlan.copingStrategies,
        mockSafetyPlan.emergencyContacts
      );
      expect(result).toEqual(mockSafetyPlan);
    });

    it('should get safety plan templates', async () => {
      const mockTemplates = [
        {
          id: 'template1',
          name: 'Basic Safety Plan',
          description: 'A simple safety plan template',
          sections: ['warning-signs', 'coping-strategies', 'contacts']
        }
      ];

      (safetyPlanRemindersService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await safetyPlanRemindersService.getTemplates();

      expect(safetyPlanRemindersService.getTemplates).toHaveBeenCalled();
      expect(result).toEqual(mockTemplates);
    });

    it('should create adaptive safety plan based on user data', async () => {
      const mockAdaptivePlan = { ...mockSafetyPlan, title: 'Adaptive Safety Plan' };
      (safetyPlanRemindersService.createAdaptivePlan as jest.Mock).mockResolvedValue(mockAdaptivePlan);

      const result = await safetyPlanRemindersService.createAdaptivePlan(mockUser.id, {
        moodHistory: [mockMoodAnalysis],
        riskFactors: ['isolation', 'stress'],
        preferences: mockUser.preferences
      });

      expect(safetyPlanRemindersService.createAdaptivePlan).toHaveBeenCalledWith(mockUser.id, {
        moodHistory: [mockMoodAnalysis],
        riskFactors: ['isolation', 'stress'],
        preferences: mockUser.preferences
      });
      expect(result).toEqual(mockAdaptivePlan);
    });
  });

  describe('Crisis Event Handling', () => {
    it('should handle crisis event and trigger appropriate responses', async () => {
      const mockCrisisEvent = {
        userId: mockUser.id,
        severity: 'high' as const,
        triggers: ['mood-decline', 'keyword-detection'],
        timestamp: Date.now()
      };

      const mockResponse = {
        actionsTriggered: ['emergency-contacts', 'professional-escalation'],
        remindersScheduled: 2,
        success: true
      };

      (safetyPlanRemindersService.handleCrisisEvent as jest.Mock).mockResolvedValue(mockResponse);

      const result = await safetyPlanRemindersService.handleCrisisEvent(mockCrisisEvent);

      expect(safetyPlanRemindersService.handleCrisisEvent).toHaveBeenCalledWith(mockCrisisEvent);
      expect(result).toEqual(mockResponse);
    });

    it('should escalate reminder when user does not respond', async () => {
      const mockEscalation = {
        reminderId: mockReminder.id,
        escalationLevel: 2,
        actionsTriggered: ['supervisor-notification'],
        nextReminderIn: 1800000 // 30 minutes
      };

      (safetyPlanRemindersService.escalateReminder as jest.Mock).mockResolvedValue(mockEscalation);

      const result = await safetyPlanRemindersService.escalateReminder(mockReminder.id, 2);

      expect(safetyPlanRemindersService.escalateReminder).toHaveBeenCalledWith(mockReminder.id, 2);
      expect(result).toEqual(mockEscalation);
    });
  });

  describe('Reminder Management', () => {
    it('should get active reminders for user', async () => {
      const mockActiveReminders = [mockReminder];
      (safetyPlanRemindersService.getActiveReminders as jest.Mock).mockResolvedValue(mockActiveReminders);

      const result = await safetyPlanRemindersService.getActiveReminders(mockUser.id);

      expect(safetyPlanRemindersService.getActiveReminders).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockActiveReminders);
    });

    it('should create interactive reminder', async () => {
      const mockInteractiveReminder = {
        ...mockReminder,
        type: 'interactive' as const,
        questions: [
          { id: 'q1', text: 'How is your mood today?', type: 'scale' as const },
          { id: 'q2', text: 'Any concerning thoughts?', type: 'yes-no' as const }
        ]
      };

      (safetyPlanRemindersService.createInteractiveReminder as jest.Mock).mockResolvedValue(mockInteractiveReminder);

      const result = await safetyPlanRemindersService.createInteractiveReminder(
        mockUser.id,
        mockSafetyPlan.id,
        'Interactive Check-in',
        mockInteractiveReminder.questions
      );

      expect(safetyPlanRemindersService.createInteractiveReminder).toHaveBeenCalledWith(
        mockUser.id,
        mockSafetyPlan.id,
        'Interactive Check-in',
        mockInteractiveReminder.questions
      );
      expect(result).toEqual(mockInteractiveReminder);
    });

    it('should schedule check-in reminder', async () => {
      const mockScheduledReminder = {
        ...mockReminder,
        scheduledTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      (safetyPlanRemindersService.scheduleCheckIn as jest.Mock).mockResolvedValue(mockScheduledReminder);

      const result = await safetyPlanRemindersService.scheduleCheckIn(
        mockUser.id,
        mockSafetyPlan.id,
        'daily',
        '09:00'
      );

      expect(safetyPlanRemindersService.scheduleCheckIn).toHaveBeenCalledWith(
        mockUser.id,
        mockSafetyPlan.id,
        'daily',
        '09:00'
      );
      expect(result).toEqual(mockScheduledReminder);
    });

    it('should process check-in response', async () => {
      const mockResponse = {
        reminderId: mockReminder.id,
        responses: {
          mood: 'good',
          concerns: 'none',
          needsSupport: false
        },
        timestamp: Date.now()
      };

      const mockProcessResult = {
        riskLevel: 'low' as const,
        nextReminderScheduled: true,
        recommendedActions: ['continue-current-plan'],
        success: true
      };

      (safetyPlanRemindersService.processCheckInResponse as jest.Mock).mockResolvedValue(mockProcessResult);

      const result = await safetyPlanRemindersService.processCheckInResponse(mockResponse);

      expect(safetyPlanRemindersService.processCheckInResponse).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockProcessResult);
    });
  });

  describe('Risk Assessment', () => {
    it('should get user risk level', async () => {
      const mockRiskAssessment = {
        level: 'moderate' as const,
        factors: ['mood-decline', 'missed-checkins'],
        score: 0.6,
        recommendations: ['increase-checkin-frequency'],
        lastUpdated: Date.now()
      };

      (safetyPlanRemindersService.getUserRiskLevel as jest.Mock).mockResolvedValue(mockRiskAssessment);

      const result = await safetyPlanRemindersService.getUserRiskLevel(mockUser.id);

      expect(safetyPlanRemindersService.getUserRiskLevel).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockRiskAssessment);
    });

    it('should update reminder frequency based on risk level', async () => {
      const mockUpdatedFrequency = {
        userId: mockUser.id,
        oldFrequency: 'daily' as const,
        newFrequency: 'twice-daily' as const,
        reason: 'increased-risk',
        effectiveDate: new Date().toISOString()
      };

      (safetyPlanRemindersService.updateReminderFrequency as jest.Mock).mockResolvedValue(mockUpdatedFrequency);

      const result = await safetyPlanRemindersService.updateReminderFrequency(
        mockUser.id,
        'twice-daily',
        'increased-risk'
      );

      expect(safetyPlanRemindersService.updateReminderFrequency).toHaveBeenCalledWith(
        mockUser.id,
        'twice-daily',
        'increased-risk'
      );
      expect(result).toEqual(mockUpdatedFrequency);
    });
  });

  describe('Personalization', () => {
    it('should get personalized content', async () => {
      const mockPersonalizedContent = {
        greeting: 'Good morning, Test User',
        copingStrategies: ['Try your breathing exercise', 'Listen to calming music'],
        motivationalMessage: 'You are doing great!',
        culturalAdaptations: ['mindfulness-based'],
        languageCode: 'en'
      };

      (safetyPlanRemindersService.getPersonalizedContent as jest.Mock).mockResolvedValue(mockPersonalizedContent);

      const result = await safetyPlanRemindersService.getPersonalizedContent(
        mockUser.id,
        'check-in',
        mockUser.preferences
      );

      expect(safetyPlanRemindersService.getPersonalizedContent).toHaveBeenCalledWith(
        mockUser.id,
        'check-in',
        mockUser.preferences
      );
      expect(result).toEqual(mockPersonalizedContent);
    });
  });

  describe('Analytics and Reporting', () => {
    it('should track reminder effectiveness', async () => {
      const mockEffectivenessData = {
        reminderId: mockReminder.id,
        responseRate: 0.85,
        averageResponseTime: 300000, // 5 minutes
        userFeedbackScore: 4.2,
        improvementMetrics: {
          moodImprovement: 0.3,
          engagementIncrease: 0.15
        }
      };

      (safetyPlanRemindersService.trackReminderEffectiveness as jest.Mock).mockResolvedValue(mockEffectivenessData);

      const result = await safetyPlanRemindersService.trackReminderEffectiveness(mockReminder.id);

      expect(safetyPlanRemindersService.trackReminderEffectiveness).toHaveBeenCalledWith(mockReminder.id);
      expect(result).toEqual(mockEffectivenessData);
    });

    it('should generate reminder report', async () => {
      const mockReport = {
        userId: mockUser.id,
        period: '30-days',
        totalReminders: 30,
        respondedReminders: 25,
        responseRate: 0.83,
        averageMoodScore: 3.2,
        crisisEvents: 1,
        effectiveStrategies: ['breathing-exercises', 'social-connection'],
        recommendations: ['maintain-current-frequency'],
        generatedAt: new Date().toISOString()
      };

      (safetyPlanRemindersService.generateReminderReport as jest.Mock).mockResolvedValue(mockReport);

      const result = await safetyPlanRemindersService.generateReminderReport(mockUser.id, '30-days');

      expect(safetyPlanRemindersService.generateReminderReport).toHaveBeenCalledWith(mockUser.id, '30-days');
      expect(result).toEqual(mockReport);
    });
  });

  describe('Reminder Control', () => {
    it('should pause reminders', async () => {
      const mockPauseResult = {
        userId: mockUser.id,
        pausedAt: new Date().toISOString(),
        pauseDuration: '7-days',
        affectedReminders: 5,
        success: true
      };

      (safetyPlanRemindersService.pauseReminders as jest.Mock).mockResolvedValue(mockPauseResult);

      const result = await safetyPlanRemindersService.pauseReminders(mockUser.id, '7-days', 'user-request');

      expect(safetyPlanRemindersService.pauseReminders).toHaveBeenCalledWith(mockUser.id, '7-days', 'user-request');
      expect(result).toEqual(mockPauseResult);
    });

    it('should resume reminders', async () => {
      const mockResumeResult = {
        userId: mockUser.id,
        resumedAt: new Date().toISOString(),
        reactivatedReminders: 5,
        nextReminderTime: new Date(Date.now() + 3600000).toISOString(),
        success: true
      };

      (safetyPlanRemindersService.resumeReminders as jest.Mock).mockResolvedValue(mockResumeResult);

      const result = await safetyPlanRemindersService.resumeReminders(mockUser.id);

      expect(safetyPlanRemindersService.resumeReminders).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockResumeResult);
    });
  });

  describe('Data Management', () => {
    it('should archive old reminders', async () => {
      const mockArchiveResult = {
        archivedCount: 15,
        oldestArchived: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        storageFreed: 1024000, // 1MB
        success: true
      };

      (safetyPlanRemindersService.archiveOldReminders as jest.Mock).mockResolvedValue(mockArchiveResult);

      const result = await safetyPlanRemindersService.archiveOldReminders(30); // 30 days

      expect(safetyPlanRemindersService.archiveOldReminders).toHaveBeenCalledWith(30);
      expect(result).toEqual(mockArchiveResult);
    });

    it('should export reminder data', async () => {
      const mockExportData = {
        userId: mockUser.id,
        reminders: [mockReminder],
        safetyPlans: [mockSafetyPlan],
        responses: [],
        exportedAt: new Date().toISOString(),
        format: 'json'
      };

      (safetyPlanRemindersService.exportReminderData as jest.Mock).mockResolvedValue(mockExportData);

      const result = await safetyPlanRemindersService.exportReminderData(mockUser.id, 'json');

      expect(safetyPlanRemindersService.exportReminderData).toHaveBeenCalledWith(mockUser.id, 'json');
      expect(result).toEqual(mockExportData);
    });

    it('should import reminder data', async () => {
      const mockImportData = {
        userId: mockUser.id,
        reminders: [mockReminder],
        safetyPlans: [mockSafetyPlan],
        responses: []
      };

      const mockImportResult = {
        importedReminders: 1,
        importedSafetyPlans: 1,
        importedResponses: 0,
        duplicatesSkipped: 0,
        errors: [],
        success: true
      };

      (safetyPlanRemindersService.importReminderData as jest.Mock).mockResolvedValue(mockImportResult);

      const result = await safetyPlanRemindersService.importReminderData(mockImportData);

      expect(safetyPlanRemindersService.importReminderData).toHaveBeenCalledWith(mockImportData);
      expect(result).toEqual(mockImportResult);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockError = new Error('Service unavailable');
      (safetyPlanRemindersService.createSafetyPlan as jest.Mock).mockRejectedValue(mockError);

      await expect(
        safetyPlanRemindersService.createSafetyPlan(
          mockUser.id,
          'Test Plan',
          [],
          [],
          []
        )
      ).rejects.toThrow('Service unavailable');
    });

    it('should validate input parameters', async () => {
      const invalidUserId = '';
      (safetyPlanRemindersService.createSafetyPlan as jest.Mock).mockRejectedValue(
        new Error('Invalid user ID')
      );

      await expect(
        safetyPlanRemindersService.createSafetyPlan(
          invalidUserId,
          'Test Plan',
          [],
          [],
          []
        )
      ).rejects.toThrow('Invalid user ID');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with mood analysis service', async () => {
      (moodAnalysisService.analyzeMood as jest.Mock).mockResolvedValue(mockMoodAnalysis);
      (safetyPlanRemindersService.createAdaptivePlan as jest.Mock).mockResolvedValue(mockSafetyPlan);

      // Simulate workflow that uses mood analysis
      const moodResult = await moodAnalysisService.analyzeMood('I feel really anxious today');
      const adaptivePlan = await safetyPlanRemindersService.createAdaptivePlan(mockUser.id, {
        moodHistory: [moodResult],
        riskFactors: ['anxiety'],
        preferences: mockUser.preferences
      });

      expect(moodAnalysisService.analyzeMood).toHaveBeenCalledWith('I feel really anxious today');
      expect(safetyPlanRemindersService.createAdaptivePlan).toHaveBeenCalledWith(mockUser.id, {
        moodHistory: [moodResult],
        riskFactors: ['anxiety'],
        preferences: mockUser.preferences
      });
      expect(adaptivePlan).toEqual(mockSafetyPlan);
    });

    it('should integrate with crisis detection service', async () => {
      const mockRiskAssessment = { level: 'high', score: 0.8, factors: ['severe-mood-decline'] };
      (crisisDetectionIntegrationService.assessRiskLevel as jest.Mock).mockResolvedValue(mockRiskAssessment);
      (safetyPlanRemindersService.handleCrisisEvent as jest.Mock).mockResolvedValue({ success: true });

      // Simulate crisis detection workflow
      const riskLevel = await crisisDetectionIntegrationService.assessRiskLevel(mockUser.id);
      if (riskLevel.level === 'high') {
        const crisisResponse = await safetyPlanRemindersService.handleCrisisEvent({
          userId: mockUser.id,
          severity: 'high',
          triggers: ['mood-decline'],
          timestamp: Date.now()
        });
        expect(crisisResponse.success).toBe(true);
      }

      expect(crisisDetectionIntegrationService.assessRiskLevel).toHaveBeenCalledWith(mockUser.id);
      expect(safetyPlanRemindersService.handleCrisisEvent).toHaveBeenCalled();
    });
  });
});
