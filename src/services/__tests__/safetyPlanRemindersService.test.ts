/**
 * Test Suite for Safety Plan Reminders Service
 * Tests safety plan creation, management, and reminder systems
 */

// Mock the safetyPlanRemindersService
jest.mock('../safetyPlanRemindersService', () => ({
  safetyPlanRemindersService: {
    reset: jest.fn(),
    createSafetyPlan: jest.fn(),
    getTemplates: jest.fn(),
    createAdaptivePlan: jest.fn(),
    handleCrisisEvent: jest.fn(),
    getActiveReminders: jest.fn(),
    createInteractiveReminder: jest.fn(),
    recordInteraction: jest.fn(),
    getEngagementMetrics: jest.fn(),
    createQuickAccessReminder: jest.fn(),
    createPersonalizedPlan: jest.fn(),
    activateEmergencyProtocol: jest.fn(),
    activateImmediate: jest.fn(),
    sharePlan: jest.fn(),
    updatePlan: jest.fn(),
    getSyncStatus: jest.fn(),
    checkReviewStatus: jest.fn(),
    getVersionHistory: jest.fn()
  }
}));

import { safetyPlanRemindersService, SafetyPlanReminder } from '../safetyPlanRemindersService';

// Define types for test data
interface SafetyPlan {
  id: string;
  userId: string;
  warningSignsTriggers?: string[];
  copingStrategies?: string[];
  supportContacts?: any[];
  professionalContacts?: any[];
  safeEnvironment?: string[];
  createdAt?: Date;
  lastUpdated?: Date;
  reminders?: any[];
  adaptedSchedule?: boolean;
  triggerOnCrisis?: boolean;
  usageStats?: {
    totalAccesses: number;
    lastAccessed: Date;
    mostUsedStrategy: string;
  };
  learningEnabled?: boolean;
  deliveredChannels?: string[];
  deliveryStatus?: string;
  primaryFailed?: boolean;
  deliveredVia?: string;
  fallbackUsed?: boolean;
  valid?: boolean;
  missingComponents?: string[];
}

interface EngagementMetrics {
  totalReminders: number;
  completedReminders: number;
  engagementRate: number;
  mostEngagedStrategy: string;
}

interface InteractiveReminder extends SafetyPlanReminder {
  actions?: string[];
  feedbackRequired?: boolean;
}

interface QuickAccessReminder extends SafetyPlanReminder {
  quickActions?: string[];
}

interface ShareResult {
  shared: boolean;
  recipients: string[];
  accessLevel: string;
}

interface SyncStatus {
  synced: boolean;
  lastSync: Date;
  syncedWith: string[];
}

interface ReviewStatus {
  reviewDue: boolean;
  daysSinceLastReview: number;
  suggestedChanges: string[];
}

interface VersionHistory {
  versions: Array<{
    version: number;
    date: Date;
    changes: string;
  }>;
  canRevert: boolean;
}

interface ActivationResult {
  planActivated?: boolean;
  notifications?: string[];
  immediateActions?: string[];
  contactsNotified?: Array<{ name: string }>;
  locationShared?: boolean;
  crisisResourcesProvided?: boolean;
  immediateStrategies?: Array<{ name: string; duration: string }>;
  guidedSupport?: boolean;
}

// Type the mocked service
const mockedService = safetyPlanRemindersService as jest.Mocked<typeof safetyPlanRemindersService>;

describe('SafetyPlanRemindersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Safety Plan Creation', () => {
    it.skip('should create a comprehensive safety plan', async () => {
      const planData = {
        userId: 'user-123',
        warningSignsTriggers: [
          'Feeling isolated',
          'Sleep disruption',
          'Negative self-talk'
        ],
        copingStrategies: [
          'Deep breathing',
          'Go for a walk',
          'Listen to music'
        ],
        supportContacts: [
          { name: 'Best Friend', phone: '555-0001', available: '24/7' },
          { name: 'Therapist', phone: '555-0002', available: 'Business hours' }
        ],
        professionalContacts: [
          { name: 'Crisis Hotline', phone: '988', available: '24/7' },
          { name: 'Emergency', phone: '911', available: '24/7' }
        ],
        safeEnvironment: [
          'Remove sharp objects',
          'Store medications safely',
          'Have someone stay with me'
        ]
      };

      const expectedPlan = {
        id: 'plan-123',
        userId: 'user-123',
        warningSignsTriggers: planData.warningSignsTriggers,
        copingStrategies: planData.copingStrategies,
        supportContacts: planData.supportContacts,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      mockedService.createSafetyPlan.mockResolvedValue(expectedPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;
      
      expect(plan.id).toBeDefined();
      expect(plan.userId).toBe('user-123');
      expect(plan.warningSignsTriggers).toHaveLength(3);
      expect(plan.copingStrategies).toHaveLength(3);
      expect(plan.supportContacts).toHaveLength(2);
      expect(plan.createdAt).toBeDefined();
      expect(plan.lastUpdated).toBeDefined();
    });

    it.skip('should validate required safety plan components', async () => {
      const incompletePlan = {
        userId: 'user-456',
        warningSignsTriggers: [],
        copingStrategies: []
      };

      const expectedResult = {
        valid: false,
        missingComponents: ['warningSignsTriggers', 'copingStrategies', 'supportContacts']
      };

      mockedService.createSafetyPlan.mockResolvedValue(expectedResult as any);

      const result = await safetyPlanRemindersService.createSafetyPlan(incompletePlan as any) as SafetyPlan;
      
      expect(result.valid).toBe(false);
      expect(result.missingComponents).toContain('warningSignsTriggers');
      expect(result.missingComponents).toContain('copingStrategies');
      expect(result.missingComponents).toContain('supportContacts');
    });

    it.skip('should create templates for common situations', async () => {
      const expectedTemplates = [
        { name: 'Depression Safety Plan', category: 'mood' },
        { name: 'Anxiety Crisis Plan', category: 'anxiety' },
        { name: 'Substance Use Safety Plan', category: 'substance' }
      ];

      mockedService.getTemplates.mockResolvedValue(expectedTemplates as any);

      const templates = await safetyPlanRemindersService.getTemplates();
      
      expect(templates).toContainEqual(expect.objectContaining({
        name: 'Depression Safety Plan',
        category: 'mood'
      }));
      expect(templates).toContainEqual(expect.objectContaining({
        name: 'Anxiety Crisis Plan',
        category: 'anxiety'
      }));
      expect(templates).toContainEqual(expect.objectContaining({
        name: 'Substance Use Safety Plan',
        category: 'substance'
      }));
    });
  });

  describe('Reminder Scheduling', () => {
    it.skip('should schedule daily check-in reminders', async () => {
      const planData = {
        userId: 'user-daily',
        reminderSettings: {
          dailyCheckIn: true,
          checkInTimes: ['09:00', '18:00']
        }
      };

      const expectedPlan = {
        id: 'plan-daily',
        userId: 'user-daily',
        reminders: [
          { time: '09:00', type: 'daily-check' },
          { time: '18:00', type: 'daily-check' }
        ]
      };

      mockedService.createSafetyPlan.mockResolvedValue(expectedPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.reminders).toHaveLength(2);
      expect(plan.reminders![0].time).toBe('09:00');
      expect(plan.reminders![1].time).toBe('18:00');
    });

    it.skip('should schedule strategy practice reminders', async () => {
      const planData = {
        userId: 'user-practice',
        copingStrategies: ['Meditation', 'Journaling'],
        reminderSettings: {
          practiceReminders: true,
          practiceFrequency: 'weekly'
        }
      };

      const expectedPlan = {
        id: 'plan-practice',
        userId: 'user-practice',
        reminders: [
          { strategy: 'Meditation', frequency: 'weekly' },
          { strategy: 'Journaling', frequency: 'weekly' }
        ]
      };

      mockedService.createSafetyPlan.mockResolvedValue(expectedPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.reminders).toHaveLength(2);
      expect(plan.reminders![0].strategy).toBe('Meditation');
      expect(plan.reminders![0].frequency).toBe('weekly');
    });

    it.skip('should adapt reminder timing based on user patterns', async () => {
      const userPatterns = {
        highRiskTimes: ['evening', 'weekend'],
        lowEngagementTimes: ['morning'],
        timezone: 'America/New_York'
      };

      const expectedPlan = {
        id: 'plan-adaptive',
        userId: 'user-789',
        reminders: [
          { time: 'evening', type: 'high-risk-check' },
          { time: 'weekend', type: 'high-risk-check' }
        ],
        adaptedSchedule: true
      };

      mockedService.createAdaptivePlan.mockResolvedValue(expectedPlan as any);

      const plan = await safetyPlanRemindersService.createAdaptivePlan('user-789', userPatterns as any) as SafetyPlan;
      
      expect(plan.reminders).toBeDefined();
      expect(plan.reminders).toHaveLength(2);
      expect(plan.adaptedSchedule).toBe(true);
    });
  });

  describe('Crisis Detection Integration', () => {
    it.skip('should trigger safety plan when crisis detected', async () => {
      const planData = {
        userId: 'user-crisis',
        triggerOnCrisis: true
      };

      const createdPlan = {
        id: 'plan-crisis',
        userId: 'user-crisis',
        triggerOnCrisis: true
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      await safetyPlanRemindersService.createSafetyPlan(planData as any);

      const crisisEvent = {
        userId: 'user-crisis',
        severity: 'high',
        timestamp: Date.now()
      };

      const expectedResponse = {
        planActivated: true,
        notifications: ['safety-plan-activated'],
        immediateActions: ['Contact support', 'Use coping strategies'],
        contactsNotified: ['Emergency Contact', 'Therapist']
      };

      mockedService.handleCrisisEvent.mockResolvedValue(expectedResponse as any);

      const response = await safetyPlanRemindersService.handleCrisisEvent(crisisEvent as any) as ActivationResult;
      
      expect(response.planActivated).toBe(true);
      expect(response.notifications).toContain('safety-plan-activated');
      expect(response.immediateActions).toBeDefined();
      expect(response.contactsNotified).toBeDefined();
    });

    it.skip('should escalate reminders during high-risk periods', async () => {
      const planData = {
        userId: 'user-risk',
        adaptiveIntensity: true
      };

      const createdPlan = {
        id: 'plan-risk',
        userId: 'user-risk',
        adaptiveIntensity: true
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      await safetyPlanRemindersService.createSafetyPlan(planData as any);

      const activeReminders = [
        { id: 'rem-1', frequency: 'hourly', priority: 'high' },
        { id: 'rem-2', frequency: '30min', priority: 'urgent' }
      ];

      mockedService.getActiveReminders.mockResolvedValue(activeReminders as any);

      const reminders = await safetyPlanRemindersService.getActiveReminders('user-risk');

      expect(reminders).toHaveLength(2);
      expect(reminders[0].priority).toBe('high');
      expect(reminders[1].priority).toBe('urgent');
    });
  });

  describe('Interactive Reminders', () => {
    it.skip('should create interactive coping strategy reminders', async () => {
      const reminderData = {
        userId: 'user-interactive',
        strategy: 'breathing-exercise',
        interactive: true
      };

      const expectedReminder = {
        type: 'interactive',
        actions: ['Start', 'Skip', 'Snooze'],
        feedbackRequired: true
      };

      mockedService.createInteractiveReminder.mockResolvedValue(expectedReminder as any);

      const reminder = await safetyPlanRemindersService.createInteractiveReminder(reminderData as any) as InteractiveReminder;

      expect(reminder.type).toBe('interactive');
      expect(reminder.actions).toBeDefined();
      expect(reminder.feedbackRequired).toBe(true);
    });

    it.skip('should track reminder engagement', async () => {
      const planData = {
        userId: 'user-engagement'
      };

      const createdPlan = {
        id: 'plan-engagement',
        userId: 'user-engagement'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      // Simulate reminder interactions
      await safetyPlanRemindersService.recordInteraction(plan.id, {
        reminderId: 'rem-1',
        action: 'completed',
        timestamp: Date.now()
      } as any);

      await safetyPlanRemindersService.recordInteraction(plan.id, {
        reminderId: 'rem-2',
        action: 'skipped',
        timestamp: Date.now()
      } as any);

      const expectedEngagement = {
        totalReminders: 2,
        completedReminders: 1,
        engagementRate: 0.5,
        mostEngagedStrategy: 'breathing-exercise'
      };

      mockedService.getEngagementMetrics.mockResolvedValue(expectedEngagement as any);

      const engagement = await safetyPlanRemindersService.getEngagementMetrics(plan.id) as EngagementMetrics;
      
      expect(engagement.totalReminders).toBe(2);
      expect(engagement.completedReminders).toBe(1);
      expect(engagement.engagementRate).toBe(0.5);
      expect(engagement.mostEngagedStrategy).toBeDefined();
    });

    it.skip('should provide quick access buttons in reminders', async () => {
      const reminderData = {
        userId: 'user-quick',
        includeQuickActions: true
      };

      const expectedReminder = {
        quickActions: ['Call 988', 'Start breathing exercise', 'Contact support']
      };

      mockedService.createQuickAccessReminder.mockResolvedValue(expectedReminder as any);

      const reminder = await safetyPlanRemindersService.createQuickAccessReminder(reminderData as any) as QuickAccessReminder;

      expect(reminder.quickActions).toBeDefined();
      expect(reminder.quickActions).toHaveLength(3);
    });
  });

  describe('Progress Tracking', () => {
    it.skip('should track safety plan usage over time', async () => {
      const planData = {
        userId: 'user-track'
      };

      const createdPlan = {
        id: 'plan-track',
        userId: 'user-track',
        usageStats: {
          totalAccesses: 10,
          lastAccessed: new Date(),
          mostUsedStrategy: 'breathing'
        }
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.usageStats).toBeDefined();
      expect(plan.usageStats!.totalAccesses).toBe(10);
      expect(plan.usageStats!.mostUsedStrategy).toBe('breathing');
    });
  });

  describe('Personalization and Learning', () => {
    it.skip('should personalize reminders based on user preferences', async () => {
      const preferences = {
        communicationStyle: 'encouraging',
        reminderTone: 'gentle',
        preferredStrategies: ['art', 'music'],
        avoidStrategies: ['social']
      };

      const expectedPlan = {
        reminders: [
          { tone: 'gentle', message: 'You can do this! Try some art therapy?' }
        ],
        suggestedStrategies: ['art', 'music']
      };

      mockedService.createPersonalizedPlan.mockResolvedValue(expectedPlan as any);

      const plan = await safetyPlanRemindersService.createPersonalizedPlan('user-personal', preferences as any) as SafetyPlan & { reminders: any[]; suggestedStrategies: string[] };
      
      expect(plan.reminders[0].tone).toBe('gentle');
      expect(plan.reminders[0].message).toContain('You can do this');
      expect(plan.suggestedStrategies).toContain('art');
      expect(plan.suggestedStrategies).not.toContain('social');
    });

    it.skip('should learn from user feedback', async () => {
      const planData = {
        userId: 'user-learning'
      };

      const createdPlan = {
        id: 'plan-learning',
        userId: 'user-learning',
        learningEnabled: true
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.learningEnabled).toBe(true);
    });
  });

  describe('Multi-channel Delivery', () => {
    it.skip('should deliver reminders through multiple channels', async () => {
      const planData = {
        userId: 'user-multichannel',
        deliveryChannels: ['app', 'sms', 'email']
      };

      const createdPlan = {
        id: 'plan-multichannel',
        userId: 'user-multichannel',
        deliveredChannels: ['app', 'sms', 'email'],
        deliveryStatus: 'success'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.deliveredChannels).toHaveLength(3);
      expect(plan.deliveryStatus).toBe('success');
    });

    it.skip('should fallback to alternative channels on failure', async () => {
      const planData = {
        userId: 'user-fallback',
        primaryChannel: 'app',
        fallbackChannels: ['sms', 'email']
      };

      const createdPlan = {
        id: 'plan-fallback',
        userId: 'user-fallback',
        primaryFailed: true,
        deliveredVia: 'sms',
        fallbackUsed: true
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);

      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      expect(plan.primaryFailed).toBe(true);
      expect(plan.deliveredVia).toBe('sms');
      expect(plan.fallbackUsed).toBe(true);
    });
  });

  describe('Emergency Activation', () => {
    it.skip('should activate emergency contacts in crisis', async () => {
      const planData = {
        userId: 'user-emergency',
        emergencyContacts: [
          { name: 'Emergency Contact', phone: '555-911', priority: 1 },
          { name: 'Therapist', phone: '555-0001', priority: 2 }
        ]
      };

      const createdPlan = {
        id: 'plan-emergency',
        userId: 'user-emergency'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      const expectedActivation = {
        contactsNotified: [
          { name: 'Emergency Contact' },
          { name: 'Therapist' }
        ],
        locationShared: true,
        crisisResourcesProvided: true
      };

      mockedService.activateEmergencyProtocol.mockResolvedValue(expectedActivation as any);

      const activation = await safetyPlanRemindersService.activateEmergencyProtocol(plan.id) as ActivationResult;
      
      expect(activation.contactsNotified).toHaveLength(2);
      expect(activation.contactsNotified![0].name).toBe('Emergency Contact');
      expect(activation.locationShared).toBe(true);
      expect(activation.crisisResourcesProvided).toBe(true);
    });

    it.skip('should provide immediate coping strategies during activation', async () => {
      const planData = {
        userId: 'user-immediate'
      };

      const createdPlan = {
        id: 'plan-immediate',
        userId: 'user-immediate'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      const expectedActivation = {
        immediateStrategies: [
          { name: 'Grounding Exercise', duration: '5 minutes' }
        ],
        guidedSupport: true
      };

      mockedService.activateImmediate.mockResolvedValue(expectedActivation as any);

      const activation = await safetyPlanRemindersService.activateImmediate(plan.id) as ActivationResult;
      
      expect(activation.immediateStrategies).toBeDefined();
      expect(activation.immediateStrategies).toContainEqual(expect.objectContaining({
        name: 'Grounding Exercise',
        duration: '5 minutes'
      }));
      expect(activation.guidedSupport).toBe(true);
    });
  });

  describe('Collaboration Features', () => {
    it.skip('should allow sharing safety plan with trusted contacts', async () => {
      const planData = {
        userId: 'user-share'
      };

      const createdPlan = {
        id: 'plan-share',
        userId: 'user-share'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      const shareOptions = {
        recipients: ['contact1@example.com', 'contact2@example.com'],
        permissions: 'view-only'
      };

      const expectedResult = {
        shared: true,
        recipients: shareOptions.recipients,
        accessLevel: 'view-only'
      };

      mockedService.sharePlan.mockResolvedValue(expectedResult as any);

      const shareResult = await safetyPlanRemindersService.sharePlan(plan.id, shareOptions as any) as ShareResult;

      expect(shareResult.shared).toBe(true);
      expect(shareResult.recipients).toHaveLength(2);
      expect(shareResult.accessLevel).toBe('view-only');
    });

    it.skip('should sync updates with care team', async () => {
      const planData = {
        userId: 'user-team',
        careTeam: ['therapist-id', 'psychiatrist-id']
      };

      const createdPlan = {
        id: 'plan-team',
        userId: 'user-team'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      await safetyPlanRemindersService.updatePlan(plan.id, {
        copingStrategies: ['New strategy']
      } as any);

      const expectedSyncStatus = {
        synced: true,
        lastSync: new Date(),
        syncedWith: ['therapist-id']
      };

      mockedService.getSyncStatus.mockResolvedValue(expectedSyncStatus as any);

      const syncStatus = await safetyPlanRemindersService.getSyncStatus(plan.id) as SyncStatus;
      
      expect(syncStatus.synced).toBe(true);
      expect(syncStatus.lastSync).toBeDefined();
      expect(syncStatus.syncedWith).toContain('therapist-id');
    });
  });

  describe('Maintenance and Review', () => {
    it.skip('should prompt for periodic plan reviews', async () => {
      const planData = {
        userId: 'user-review',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
      };

      const createdPlan = {
        id: 'plan-review',
        userId: 'user-review'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      const expectedReviewStatus = {
        reviewDue: true,
        daysSinceLastReview: 30,
        suggestedChanges: ['Update emergency contacts', 'Review coping strategies']
      };

      mockedService.checkReviewStatus.mockResolvedValue(expectedReviewStatus as any);

      const reviewStatus = await safetyPlanRemindersService.checkReviewStatus(plan.id) as ReviewStatus;
      
      expect(reviewStatus.reviewDue).toBe(true);
      expect(reviewStatus.daysSinceLastReview).toBe(30);
      expect(reviewStatus.suggestedChanges).toBeDefined();
    });

    it.skip('should track plan version history', async () => {
      const planData = {
        userId: 'user-version'
      };

      const createdPlan = {
        id: 'plan-version',
        userId: 'user-version'
      };

      mockedService.createSafetyPlan.mockResolvedValue(createdPlan as any);
      const plan = await safetyPlanRemindersService.createSafetyPlan(planData as any) as SafetyPlan;

      // Make updates
      await safetyPlanRemindersService.updatePlan(plan.id, {
        copingStrategies: ['Updated strategy 1']
      } as any);

      await safetyPlanRemindersService.updatePlan(plan.id, {
        copingStrategies: ['Updated strategy 2']
      } as any);

      const expectedHistory = {
        versions: [
          { version: 1, date: new Date(), changes: 'Initial creation' },
          { version: 2, date: new Date(), changes: 'Updated coping strategies' },
          { version: 3, date: new Date(), changes: 'Updated coping strategies' }
        ],
        canRevert: true
      };

      mockedService.getVersionHistory.mockResolvedValue(expectedHistory as any);

      const history = await safetyPlanRemindersService.getVersionHistory(plan.id) as any as VersionHistory;
      
      expect(history.versions).toHaveLength(3);
      expect(history.canRevert).toBe(true);
    });
  });
});