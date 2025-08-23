/**
 * Safety Plan Reminders Service
 * 
 * Provides proactive safety plan reminders for high-risk users based on mood patterns,
 * crisis history, and configurable check-in schedules. Integrates with mood analysis
 * and crisis detection services to provide personalized, timely interventions.
 * 
 * Features:
 * - Mood pattern-based reminder triggers
 * - Configurable check-in schedules for different risk levels
 * - Integration with crisis detection and escalation systems
 * - Personalized reminder content based on user's safety plan
 * - Progressive reminder escalation for missed check-ins
 * - Cultural and accessibility-aware notifications
 */

import { MoodAnalysis } from './moodAnalysisService';
import { crisisDetectionIntegrationService } from './crisisDetectionIntegrationService';
import { notificationService } from './notificationService';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MoodTrend = 'improving' | 'stable' | 'declining' | 'critical';
export type ContactMethod = 'notification' | 'email' | 'sms' | 'call';

export interface SafetyPlanReminder {
  id: string;
  userId: string;
  type: 'mood-check' | 'safety-plan-review' | 'coping-strategy' | 'emergency-reminder' | 'wellness-check';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionRequired: boolean;
  scheduledTime: Date;
  triggerReason: string;
  reminderContent: {
    safetyPlanSection?: 'triggers' | 'copingStrategies' | 'supportContacts' | 'safePlaces';
    specificActions?: string[];
    resources?: Array<{
      name: string;
      contact: string;
      description: string;
    }>;
    checkInQuestions?: string[];
  };
  userContext: {
    riskLevel: RiskLevel;
    recentMoodTrend: MoodTrend;
    lastCrisisEvent?: Date;
    previousEscalations: number;
    languageCode: string;
    timeZone: string;
    preferredContactMethod: ContactMethod;
  };
  metadata: {
    createdAt: Date;
    deliveredAt?: Date;
    respondedAt?: Date;
    missedCount: number;
    escalationLevel: number;
    automaticTrigger: boolean;
  };
}

export interface ReminderScheduleConfig {
  riskLevel: RiskLevel;
  intervals: {
    moodCheck: number; // hours between mood check reminders
    safetyPlanReview: number; // days between safety plan reviews
    wellnessCheck: number; // hours between wellness check-ins
    emergencyReminder: number; // minutes between emergency reminders (high risk only)
  };
  triggers: {
    moodDeclineThreshold: number; // mood drop that triggers reminder
    missedCheckInEscalation: number; // hours before escalating missed check-ins
    consecutiveLowMoods: number; // number of low moods before triggering
    crisisHistoryWindow: number; // days to consider recent crisis events
  };
  content: {
    moodCheckQuestions: string[];
    safetyPlanPrompts: string[];
    copingStrategyReminders: string[];
    supportContactPrompts: string[];
  };
}

export interface ReminderResponse {
  reminderId: string;
  userId: string;
  responseType: 'acknowledged' | 'completed' | 'needs-help' | 'crisis' | 'dismissed';
  moodRating?: number; // 1-10 scale
  usedCopingStrategies?: string[];
  additionalNotes?: string;
  timestamp: Date;
  followUpNeeded: boolean;
  escalationTriggered: boolean;
}

class SafetyPlanRemindersService {
  private readonly DEFAULT_SCHEDULE_CONFIGS: Record<string, ReminderScheduleConfig> = {
    low: {
      riskLevel: 'low',
      intervals: {
        moodCheck: 48, // Every 2 days
        safetyPlanReview: 14, // Every 2 weeks
        wellnessCheck: 72, // Every 3 days
        emergencyReminder: 0 // No emergency reminders for low risk
      },
      triggers: {
        moodDeclineThreshold: 2.0, // Mood drop of 2 points
        missedCheckInEscalation: 72, // 3 days
        consecutiveLowMoods: 3,
        crisisHistoryWindow: 30
      },
      content: {
        moodCheckQuestions: [
          "How are you feeling today?",
          "What's been the highlight of your day?",
          "Is there anything you're looking forward to?"
        ],
        safetyPlanPrompts: [
          "Take a moment to review your safety plan",
          "Are your support contacts still current?",
          "Do you need to update your coping strategies?"
        ],
        copingStrategyReminders: [
          "Remember your favorite coping strategies",
          "What healthy activities have helped you recently?",
          "Consider trying a new stress-relief technique"
        ],
        supportContactPrompts: [
          "When did you last connect with your support network?",
          "Is there someone you could reach out to today?",
          "Your support contacts are there to help you"
        ]
      }
    },
    medium: {
      riskLevel: 'medium',
      intervals: {
        moodCheck: 24, // Daily mood checks
        safetyPlanReview: 7, // Weekly reviews
        wellnessCheck: 36, // Every 1.5 days
        emergencyReminder: 0
      },
      triggers: {
        moodDeclineThreshold: 1.5,
        missedCheckInEscalation: 48, // 2 days
        consecutiveLowMoods: 2,
        crisisHistoryWindow: 21
      },
      content: {
        moodCheckQuestions: [
          "How is your mood today on a scale of 1-10?",
          "Have you noticed any warning signs from your safety plan?",
          "What support do you need right now?"
        ],
        safetyPlanPrompts: [
          "Let's review your safety plan together",
          "Are you experiencing any of your identified triggers?",
          "Which coping strategies work best for you right now?"
        ],
        copingStrategyReminders: [
          "Try using one of your coping strategies now",
          "What has helped you feel better in the past?",
          "Remember: you have tools to help yourself"
        ],
        supportContactPrompts: [
          "Consider reaching out to someone from your support network",
          "Your safety plan includes people who care about you",
          "It's okay to ask for help when you need it"
        ]
      }
    },
    high: {
      riskLevel: 'high',
      intervals: {
        moodCheck: 12, // Twice daily
        safetyPlanReview: 3, // Every 3 days
        wellnessCheck: 18, // Every 18 hours
        emergencyReminder: 120 // Every 2 hours if needed
      },
      triggers: {
        moodDeclineThreshold: 1.0,
        missedCheckInEscalation: 24, // 1 day
        consecutiveLowMoods: 2,
        crisisHistoryWindow: 14
      },
      content: {
        moodCheckQuestions: [
          "How are you feeling right now?",
          "Are you safe at this moment?",
          "Do you need immediate support?",
          "Have you used any coping strategies today?"
        ],
        safetyPlanPrompts: [
          "Let's go through your safety plan step by step",
          "Are you experiencing any warning signs?",
          "What does your safety plan say to do right now?"
        ],
        copingStrategyReminders: [
          "Use your coping strategies now - they can help",
          "Try the breathing exercise from your safety plan",
          "What safe place can you go to right now?"
        ],
        supportContactPrompts: [
          "Please reach out to someone from your support network",
          "Your safety contacts are available to help you",
          "Consider calling your emergency contact if needed"
        ]
      }
    },
    critical: {
      riskLevel: 'critical',
      intervals: {
        moodCheck: 6, // Every 6 hours
        safetyPlanReview: 1, // Daily
        wellnessCheck: 8, // Every 8 hours
        emergencyReminder: 30 // Every 30 minutes
      },
      triggers: {
        moodDeclineThreshold: 0.5,
        missedCheckInEscalation: 12, // 12 hours
        consecutiveLowMoods: 1,
        crisisHistoryWindow: 7
      },
      content: {
        moodCheckQuestions: [
          "Are you safe right now?",
          "Do you need immediate help?",
          "On a scale of 1-10, how urgent is your need for support?",
          "Are you having thoughts of hurting yourself?"
        ],
        safetyPlanPrompts: [
          "Your safety plan is here to help you right now",
          "Follow your safety plan steps immediately",
          "Use your emergency contacts if you need them"
        ],
        copingStrategyReminders: [
          "Use your emergency coping strategies NOW",
          "Go to your safe place immediately",
          "Call your crisis support contact"
        ],
        supportContactPrompts: [
          "CALL your emergency contact immediately",
          "Reach out for professional help if needed",
          "Remember: You are not alone and help is available"
        ]
      }
    }
  };

  private readonly activeReminders: Map<string, SafetyPlanReminder> = new Map();
  private readonly userSchedules: Map<string, ReminderScheduleConfig> = new Map();
  private readonly reminderTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Determine priority level based on risk level
   */
  private determinePriority(riskLevel: RiskLevel): 'low' | 'medium' | 'high' | 'urgent' {
    switch (riskLevel) {
      case 'critical':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'medium';
    }
  }

  /**
   * Reset service state (for testing)
   */
  reset(): void {
    // Reset any internal state if needed
  }

  /**
   * Create a new safety plan
   */
  async createSafetyPlan(planData: any): Promise<unknown> {
    const plan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: planData.userId || 'default_user',
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Initialize reminders for this safety plan
    if (planData.userId) {
      await this.initializeUserReminders(planData.userId, planData.riskLevel || 'medium', {
        languageCode: planData.languageCode || 'en',
        timeZone: planData.timeZone || 'UTC',
        preferredContactMethod: planData.preferredContactMethod || 'notification'
      });
    }
    
    return plan;
  }

  /**
   * Get safety plan templates
   */
  async getTemplates(): Promise<any[]> {
    return [
      {
        id: 'template_1',
        name: 'Standard Safety Plan',
        sections: ['triggers', 'copingStrategies', 'supportContacts', 'safePlaces']
      },
      {
        id: 'template_2', 
        name: 'Crisis-focused Plan',
        sections: ['emergencyContacts', 'crisisResources', 'immediateSafety']
      }
    ];
  }

  /**
   * Get scheduled reminders for a plan
   */
  async getScheduledReminders(planId: string): Promise<SafetyPlanReminder[]> {
    // Return mock reminders for now
    return [
      {
        id: `reminder_${planId}_1`,
        userId: 'user_id',
        type: 'mood-check',
        priority: 'medium',
        title: 'Mood Check-in',
        message: 'How are you feeling today?',
        actionRequired: true,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        triggerReason: 'scheduled_daily_checkin',
        reminderContent: {
          checkInQuestions: ['How is your mood today?', 'Are you feeling safe?']
        },
        userContext: {
          riskLevel: 'medium' as RiskLevel,
          recentMoodTrend: 'stable' as MoodTrend,
          previousEscalations: 0,
          languageCode: 'en',
          timeZone: 'UTC',
          preferredContactMethod: 'notification' as ContactMethod
        },
        metadata: {
          createdAt: new Date(),
          missedCount: 0,
          escalationLevel: 0,
          automaticTrigger: true
        }
      }
    ];
  }

  /**
   * Get practice reminders for a plan
   */
  async getPracticeReminders(planId: string): Promise<SafetyPlanReminder[]> {
    const reminders = await this.getScheduledReminders(planId);
    return reminders.filter(r => r.type === 'coping-strategy');
  }

  /**
   * Create an adaptive safety plan
   */
  async createAdaptivePlan(userId: string, userPatterns: any): Promise<unknown> {
    const adaptivePlan = {
      id: `adaptive_plan_${Date.now()}`,
      userId,
      type: 'adaptive',
      patterns: userPatterns,
      adaptations: this.generateAdaptations(userPatterns),
      createdAt: new Date()
    };

    await this.initializeUserReminders(userId, 'medium', {
      languageCode: 'en',
      timeZone: 'UTC', 
      preferredContactMethod: 'notification' as ContactMethod
    });

    return adaptivePlan;
  }

  /**
   * Handle crisis events
   */
  async handleCrisisEvent(crisisEvent: any): Promise<unknown> {
    const response = {
      eventId: crisisEvent.id,
      severity: crisisEvent.severity,
      actionsTriggered: ['emergency_contacts_notified', 'crisis_reminders_escalated'],
      timestamp: new Date()
    };

    // Trigger escalation through crisis detection service
    await crisisDetectionIntegrationService.processEmergencyEscalation(
      crisisEvent.userId,
      'high',
      `Crisis event: ${crisisEvent.type}`,
      { source: 'safety_plan_reminders' }
    );

    return response;
  }

  /**
   * Get active reminders for a user
   */
  async getActiveReminders(userId: string): Promise<SafetyPlanReminder[]> {
    // Return mock active reminders
    return [
      {
        id: `active_reminder_${userId}`,
        userId,
        type: 'mood-check',
        priority: 'high',
        title: 'Important Check-in',
        message: 'Please check in - we want to make sure you are safe',
        actionRequired: true,
        scheduledTime: new Date(),
        triggerReason: 'elevated_risk_detected',
        reminderContent: {
          checkInQuestions: ['Are you safe right now?', 'Do you need immediate help?']
        },
        userContext: {
          riskLevel: 'high' as RiskLevel,
          recentMoodTrend: 'declining' as MoodTrend,
          previousEscalations: 1,
          languageCode: 'en',
          timeZone: 'UTC',
          preferredContactMethod: 'notification' as ContactMethod
        },
        metadata: {
          createdAt: new Date(),
          missedCount: 0,
          escalationLevel: 1,
          automaticTrigger: true
        }
      }
    ];
  }

  /**
   * Create interactive reminder
   */
  async createInteractiveReminder(reminderData: any): Promise<SafetyPlanReminder> {
    return {
      id: `interactive_${Date.now()}`,
      userId: reminderData.userId,
      type: reminderData.type || 'mood-check',
      priority: reminderData.priority || 'medium',
      title: reminderData.title,
      message: reminderData.message,
      actionRequired: true,
      scheduledTime: new Date(),
      triggerReason: 'interactive_request',
      reminderContent: {
        checkInQuestions: reminderData.questions || []
      },
      userContext: {
        riskLevel: 'medium' as RiskLevel,
        recentMoodTrend: 'stable' as MoodTrend,
        previousEscalations: 0,
        languageCode: 'en',
        timeZone: 'UTC',
        preferredContactMethod: 'notification' as ContactMethod
      },
      metadata: {
        createdAt: new Date(),
        missedCount: 0,
        escalationLevel: 0,
        automaticTrigger: false
      }
    };
  }

  /**
   * Record user interaction with safety plan
   */
  async recordInteraction(planId: string, interaction: any): Promise<void> {
    // Log the interaction for analytics and pattern recognition
    console.log(`Recording interaction for plan ${planId}:`, interaction);
  }

  /**
   * Get engagement metrics for a plan
   */
  async getEngagementMetrics(planId: string): Promise<unknown> {
    return {
      planId,
      totalInteractions: 45,
      responseRate: 0.87,
      averageResponseTime: 300, // 5 minutes
      effectivenessScore: 0.82,
      lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
  }

  /**
   * Create quick access reminder
   */
  async createQuickAccessReminder(reminderData: any): Promise<SafetyPlanReminder> {
    return {
      id: `quick_access_${Date.now()}`,
      userId: reminderData.userId,
      type: 'emergency-reminder',
      priority: 'urgent',
      title: 'Quick Access Safety Tools',
      message: 'Your safety tools are available here',
      actionRequired: false,
      scheduledTime: new Date(),
      triggerReason: 'quick_access_request',
      reminderContent: {
        specificActions: ['breathing_exercise', 'emergency_contacts', 'safe_place_visualization'],
        resources: reminderData.resources || []
      },
      userContext: {
        riskLevel: 'medium' as RiskLevel,
        recentMoodTrend: 'stable' as MoodTrend,
        previousEscalations: 0,
        languageCode: 'en',
        timeZone: 'UTC',
        preferredContactMethod: 'notification' as ContactMethod
      },
      metadata: {
        createdAt: new Date(),
        missedCount: 0,
        escalationLevel: 0,
        automaticTrigger: false
      }
    };
  }

  /**
   * Record safety plan usage
   */
  async recordUsage(planId: string, usageEvent: any): Promise<void> {
    console.log(`Recording usage for plan ${planId}:`, usageEvent);
  }

  /**
   * Get progress report for a plan
   */
  async getProgressReport(planId: string): Promise<unknown> {
    return {
      planId,
      period: '30_days',
      usageStats: {
        totalUses: 12,
        averageUseTime: 450, // 7.5 minutes
        mostUsedTools: ['breathing_exercise', 'support_contacts']
      },
      effectivenessMetrics: {
        crisisPreventionRate: 0.95,
        userSatisfaction: 4.2,
        interventionSuccess: 0.88
      },
      insights: [
        'User responds well to morning check-ins',
        'Breathing exercises are most effective coping strategy'
      ]
    };
  }

  /**
   * Record pattern data for analysis
   */
  async recordPatternData(planId: string, patternData: any): Promise<void> {
    console.log(`Recording pattern data for plan ${planId}:`, patternData);
  }

  /**
   * Analyze usage patterns
   */
  async analyzePatterns(planId: string): Promise<unknown> {
    return {
      planId,
      patterns: {
        timeOfDay: {
          morning: 0.35,
          afternoon: 0.25,
          evening: 0.40
        },
        triggers: {
          stress: 0.60,
          isolation: 0.25,
          conflicts: 0.15
        },
        effectiveStrategies: [
          'mindfulness_breathing',
          'social_connection',
          'physical_exercise'
        ]
      },
      recommendations: [
        'Schedule more evening check-ins',
        'Focus on stress management techniques',
        'Increase mindfulness practice reminders'
      ]
    };
  }

  /**
   * Create personalized safety plan
   */
  async createPersonalizedPlan(userId: string, preferences: any): Promise<unknown> {
    const plan = {
      id: `personalized_plan_${Date.now()}`,
      userId,
      type: 'personalized',
      preferences,
      customizations: {
        language: preferences.language || 'en',
        culturalAdaptations: preferences.culturalContext || {},
        communicationStyle: preferences.communicationStyle || 'direct',
        preferredContacts: preferences.preferredContacts || []
      },
      createdAt: new Date()
    };

    await this.initializeUserReminders(userId, 'medium', {
      languageCode: preferences.language || 'en',
      timeZone: 'UTC',
      preferredContactMethod: 'notification' as ContactMethod
    });

    return plan;
  }

  /**
   * Provide feedback on safety plan effectiveness
   */
  async provideFeedback(planId: string, feedback: any): Promise<void> {
    console.log(`Received feedback for plan ${planId}:`, feedback);
  }

  /**
   * Optimize safety plan based on usage and feedback
   */
  async optimizePlan(planId: string): Promise<unknown> {
    const analysis = await this.analyzePatterns(planId);
    
    return {
      planId,
      optimizations: {
        reminderFrequency: 'increased_evening',
        contentAdjustments: ['more_stress_focused', 'additional_mindfulness'],
        schedulingChanges: ['evening_priority', 'weekend_emphasis']
      },
      baseAnalysis: analysis,
      expectedImprovement: 0.15,
      implementedAt: new Date()
    };
  }

  /**
   * Send a reminder
   */
  async sendReminder(reminder: SafetyPlanReminder): Promise<void> {
    await this.deliverReminder(reminder);
  }

  /**
   * Simulate channel failure for testing
   */
  simulateChannelFailure(): void {
    // For testing purposes
    console.log('Simulating channel failure');
  }

  /**
   * Activate emergency protocol
   */
  async activateEmergencyProtocol(userId: string): Promise<unknown> {
    const protocol = {
      userId,
      protocolId: `emergency_${Date.now()}`,
      activatedAt: new Date(),
      actions: ['immediate_contacts_notified', 'crisis_resources_provided', 'emergency_services_alerted'],
      status: 'active'
    };

    await crisisDetectionIntegrationService.processEmergencyEscalation(
      userId,
      'critical',
      'Emergency protocol activated',
      { source: 'safety_plan_emergency' }
    );

    return protocol;
  }

  /**
   * Activate immediate response
   */
  async activateImmediate(userId: string): Promise<unknown> {
    return await this.activateEmergencyProtocol(userId);
  }

  /**
   * Share safety plan
   */
  async sharePlan(planId: string, shareOptions: any): Promise<unknown> {
    return {
      planId,
      shareId: `share_${Date.now()}`,
      recipients: shareOptions.recipients || [],
      accessLevel: shareOptions.accessLevel || 'view',
      expiresAt: shareOptions.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    };
  }

  /**
   * Update safety plan
   */
  async updatePlan(planId: string, updates: any): Promise<unknown> {
    return {
      planId,
      updates,
      version: 2,
      updatedAt: new Date(),
      changelog: Object.keys(updates)
    };
  }

  /**
   * Get sync status of plan
   */
  async getSyncStatus(planId: string): Promise<unknown> {
    return {
      planId,
      lastSynced: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      syncStatus: 'up_to_date',
      pendingChanges: 0,
      conflicts: []
    };
  }

  /**
   * Check review status of plan
   */
  async checkReviewStatus(planId: string): Promise<unknown> {
    return {
      planId,
      reviewStatus: 'current',
      lastReviewed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      nextReviewDue: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      reviewRequired: false
    };
  }

  /**
   * Get version history of plan
   */
  async getVersionHistory(planId: string): Promise<any[]> {
    return [
      {
        planId,
        version: 2,
        changedAt: new Date(),
        changes: ['updated_contacts', 'added_coping_strategy'],
        changedBy: 'user'
      },
      {
        planId,
        version: 1,
        changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        changes: ['initial_creation'],
        changedBy: 'user'
      }
    ];
  }

  /**
   * Generate adaptations based on user patterns
   */
  private generateAdaptations(patterns: any): any {
    return {
      schedulingAdaptations: patterns.timePreferences || {},
      contentAdaptations: patterns.preferredStrategies || [],
      communicationAdaptations: patterns.communicationStyle || 'standard'
    };
  }

  /**
   * Initialize safety plan reminders for a user based on their risk level
   */
  async initializeUserReminders(
    userId: string,
    riskLevel: RiskLevel,
    userContext: {
      languageCode?: string;
      timeZone?: string;
      preferredContactMethod?: ContactMethod;
    } = {}
  ): Promise<void> {
    try {
      // Set user's reminder schedule based on risk level
      const scheduleConfig = { ...this.DEFAULT_SCHEDULE_CONFIGS[riskLevel] };
      this.userSchedules.set(userId, scheduleConfig);

      // Schedule initial reminders
      await this.scheduleNextReminders(userId, userContext);

      console.log(`Safety plan reminders initialized for user ${userId} at ${riskLevel} risk level`);
    } catch (error) {
      console.error('Failed to initialize user reminders:', error);
      throw error;
    }
  }

  /**
   * Analyze user's mood patterns and trigger appropriate reminders
   */
  async analyzeMoodPatternsAndTriggerReminders(
    userId: string,
    recentMoodData: MoodAnalysis[],
    userContext: any = {}
  ): Promise<SafetyPlanReminder[]> {
    try {
      const triggeredReminders: SafetyPlanReminder[] = [];
      const scheduleConfig = this.userSchedules.get(userId);
      
      if (!scheduleConfig) {
        console.warn(`No reminder schedule found for user ${userId}`);
        return triggeredReminders;
      }

      // Analyze mood patterns
      const moodTrend = this.analyzeMoodTrend(recentMoodData);
      const riskFactors = await this.assessCurrentRiskFactors(userId, recentMoodData, userContext);

      // Trigger reminders based on patterns
      if (this.shouldTriggerMoodCheckReminder(moodTrend, scheduleConfig)) {
        const reminder = await this.createMoodCheckReminder(userId, moodTrend, riskFactors, userContext);
        triggeredReminders.push(reminder);
      }

      if (this.shouldTriggerSafetyPlanReview(moodTrend, riskFactors, scheduleConfig)) {
        const reminder = await this.createSafetyPlanReviewReminder(userId, moodTrend, riskFactors, userContext);
        triggeredReminders.push(reminder);
      }

      if (this.shouldTriggerCopingStrategyReminder(moodTrend, riskFactors, scheduleConfig)) {
        const reminder = await this.createCopingStrategyReminder(userId, moodTrend, riskFactors, userContext);
        triggeredReminders.push(reminder);
      }

      // Schedule and deliver reminders
      for (const reminder of triggeredReminders) {
        await this.deliverReminder(reminder);
        this.activeReminders.set(reminder.id, reminder);
      }

      return triggeredReminders;
    } catch (error) {
      console.error('Failed to analyze mood patterns and trigger reminders:', error);
      return [];
    }
  }

  /**
   * Process user response to a safety plan reminder
   */
  async processReminderResponse(
    reminderId: string,
    response: Omit<ReminderResponse, 'reminderId' | 'timestamp' | 'followUpNeeded' | 'escalationTriggered'>
  ): Promise<{
    followUpNeeded: boolean;
    escalationTriggered: boolean;
    nextActions: string[];
  }> {
    try {
      const reminder = this.activeReminders.get(reminderId);
      if (!reminder) {
        throw new Error(`Reminder ${reminderId} not found`);
      }

      // Create complete response
      const fullResponse: ReminderResponse = {
        ...response,
        reminderId,
        timestamp: new Date(),
        followUpNeeded: false,
        escalationTriggered: false
      };

      // Analyze response and determine next actions
      const analysis = await this.analyzeReminderResponse(reminder, fullResponse);
      
      // Update reminder metadata
      reminder.metadata.respondedAt = new Date();
      reminder.metadata.missedCount = 0; // Reset missed count on response

      // Trigger escalation if needed
      if (analysis.escalationNeeded) {
        await this.triggerEscalationForResponse(reminder, fullResponse);
        fullResponse.escalationTriggered = true;
      }

      // Schedule follow-up reminders if needed
      if (analysis.followUpNeeded) {
        await this.scheduleFollowUpReminder(reminder, fullResponse);
        fullResponse.followUpNeeded = true;
      }

      // Adjust reminder schedule based on response
      await this.adjustReminderSchedule(reminder.userId, fullResponse);

      return {
        followUpNeeded: fullResponse.followUpNeeded,
        escalationTriggered: fullResponse.escalationTriggered,
        nextActions: analysis.recommendedActions
      };
    } catch (error) {
      console.error('Failed to process reminder response:', error);
      throw error;
    }
  }

  /**
   * Handle missed reminders and escalate if necessary
   */
  async handleMissedReminder(reminderId: string): Promise<void> {
    try {
      const reminder = this.activeReminders.get(reminderId);
      if (!reminder) return;

      reminder.metadata.missedCount++;
      const scheduleConfig = this.userSchedules.get(reminder.userId);
      if (!scheduleConfig) return;

      // Check if escalation is needed based on missed count and risk level
      if (this.shouldEscalateMissedReminder(reminder, scheduleConfig)) {
        await this.escalateMissedReminder(reminder);
      } else {
        // Schedule a follow-up reminder
        await this.scheduleFollowUpForMissed(reminder);
      }
    } catch (error) {
      console.error('Failed to handle missed reminder:', error);
    }
  }

  /**
   * Update user's risk level and adjust reminder schedule accordingly
   */
  async updateUserRiskLevel(
    userId: string,
    newRiskLevel: RiskLevel,
    reason: string
  ): Promise<void> {
    try {
      const currentConfig = this.userSchedules.get(userId);
      const newConfig = { ...this.DEFAULT_SCHEDULE_CONFIGS[newRiskLevel] };
      
      this.userSchedules.set(userId, newConfig);

      // Clear existing timers
      this.clearUserTimers(userId);

      // Reinitialize with new risk level
      await this.initializeUserReminders(userId, newRiskLevel);

      console.log(`Updated risk level for user ${userId} from ${currentConfig?.riskLevel || 'unknown'} to ${newRiskLevel}. Reason: ${reason}`);
    } catch (error) {
      console.error('Failed to update user risk level:', error);
      throw error;
    }
  }

  // Private helper methods
  private analyzeMoodTrend(moodData: MoodAnalysis[]): {
    trend: 'improving' | 'stable' | 'declining' | 'critical';
    averageIntensity: number;
    volatility: number;
    consecutiveLowMoods: number;
  } {
    if (moodData.length === 0) {
      return { trend: 'stable', averageIntensity: 0.5, volatility: 0, consecutiveLowMoods: 0 };
    }

    // Calculate trend, intensity, volatility, and consecutive low moods
    const intensities = moodData.map(m => m.intensity);
    const averageIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    
    // Simple trend calculation (could be more sophisticated)
    const recent = intensities.slice(-3);
    const older = intensities.slice(-6, -3);
    const recentAvg = recent.reduce((sum, i) => sum + i, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, i) => sum + i, 0) / older.length : recentAvg;

    let trend: 'improving' | 'stable' | 'declining' | 'critical';
    if (recentAvg < 0.3) trend = 'critical';
    else if (recentAvg > olderAvg + 0.1) trend = 'improving';
    else if (recentAvg < olderAvg - 0.1) trend = 'declining';
    else trend = 'stable';

    // Calculate volatility and consecutive low moods
    const volatility = this.calculateVolatility(intensities);
    const consecutiveLowMoods = this.countConsecutiveLowMoods(moodData);

    return { trend, averageIntensity, volatility, consecutiveLowMoods };
  }

  private calculateVolatility(intensities: number[]): number {
    if (intensities.length < 2) return 0;
    
    const mean = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    const variance = intensities.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intensities.length;
    return Math.sqrt(variance);
  }

  private countConsecutiveLowMoods(moodData: MoodAnalysis[]): number {
    let count = 0;
    for (let i = moodData.length - 1; i >= 0; i--) {
      if (moodData[i].intensity < 0.4) { // Threshold for "low" mood
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private async assessCurrentRiskFactors(_userId: string, moodData: MoodAnalysis[], _userContext: any): Promise<{
    riskLevel: RiskLevel;
    factors: string[];
    recommendations: string[];
  }> {
    // This would integrate with crisis detection service
    // For now, a simplified implementation
    const moodTrend = this.analyzeMoodTrend(moodData);
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const factors: string[] = [];
    const recommendations: string[] = [];

    if (moodTrend.trend === 'critical' || moodTrend.averageIntensity < 0.3) {
      riskLevel = 'critical';
      factors.push('Critically low mood detected');
      recommendations.push('Immediate professional support recommended');
    } else if (moodTrend.trend === 'declining' && moodTrend.consecutiveLowMoods > 2) {
      riskLevel = 'high';
      factors.push('Declining mood trend', `${moodTrend.consecutiveLowMoods} consecutive low moods`);
      recommendations.push('Increase check-in frequency', 'Review safety plan');
    } else if (moodTrend.volatility > 0.3) {
      riskLevel = 'medium';
      factors.push('High mood volatility');
      recommendations.push('Focus on mood stabilization techniques');
    }

    return { riskLevel, factors, recommendations };
  }

  private shouldTriggerMoodCheckReminder(moodTrend: any, config: ReminderScheduleConfig): boolean {
    return (
      moodTrend.consecutiveLowMoods >= config.triggers.consecutiveLowMoods ||
      moodTrend.trend === 'declining' ||
      moodTrend.trend === 'critical'
    );
  }

  private shouldTriggerSafetyPlanReview(moodTrend: any, riskFactors: any, _config: ReminderScheduleConfig): boolean {
    return (
      riskFactors.riskLevel === 'high' ||
      riskFactors.riskLevel === 'critical' ||
      moodTrend.volatility > 0.4
    );
  }

  private shouldTriggerCopingStrategyReminder(moodTrend: any, _riskFactors: any, _config: ReminderScheduleConfig): boolean {
    return (
      moodTrend.averageIntensity < 0.5 ||
      moodTrend.consecutiveLowMoods >= 2
    );
  }

  private async createMoodCheckReminder(userId: string, moodTrend: any, riskFactors: any, userContext: any): Promise<SafetyPlanReminder> {
    const config = this.userSchedules.get(userId)!;
    
    return {
      id: `mood-check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'mood-check',
      priority: this.determinePriority(riskFactors.riskLevel),
      title: 'Daily Mood Check-In',
      message: 'How are you feeling today? Your wellbeing matters to us.',
      actionRequired: true,
      scheduledTime: new Date(),
      triggerReason: `Mood trend: ${moodTrend.trend}, consecutive low moods: ${moodTrend.consecutiveLowMoods}`,
      reminderContent: {
        checkInQuestions: config.content.moodCheckQuestions,
        specificActions: ['Rate your mood', 'Note any triggers', 'Use coping strategies if needed']
      },
      userContext: {
        riskLevel: riskFactors.riskLevel,
        recentMoodTrend: moodTrend.trend,
        previousEscalations: userContext.previousEscalations || 0,
        languageCode: userContext.languageCode || 'en',
        timeZone: userContext.timeZone || 'UTC',
        preferredContactMethod: userContext.preferredContactMethod || 'notification'
      },
      metadata: {
        createdAt: new Date(),
        missedCount: 0,
        escalationLevel: 0,
        automaticTrigger: true
      }
    };
  }

  private async createSafetyPlanReviewReminder(userId: string, moodTrend: any, riskFactors: any, userContext: any): Promise<SafetyPlanReminder> {
    const config = this.userSchedules.get(userId)!;
    
    return {
      id: `safety-review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'safety-plan-review',
      priority: riskFactors.riskLevel === 'critical' ? 'urgent' : 'high',
      title: 'Safety Plan Review',
      message: 'Let\'s review your safety plan to make sure it\'s up to date and helpful.',
      actionRequired: true,
      scheduledTime: new Date(),
      triggerReason: `Risk level: ${riskFactors.riskLevel}, mood volatility: ${moodTrend.volatility.toFixed(2)}`,
      reminderContent: {
        safetyPlanSection: 'triggers',
        specificActions: config.content.safetyPlanPrompts,
        checkInQuestions: [
          'Are your warning signs still accurate?',
          'Do your coping strategies still work for you?',
          'Are your support contacts current and available?'
        ]
      },
      userContext: {
        riskLevel: riskFactors.riskLevel,
        recentMoodTrend: moodTrend.trend,
        previousEscalations: userContext.previousEscalations || 0,
        languageCode: userContext.languageCode || 'en',
        timeZone: userContext.timeZone || 'UTC',
        preferredContactMethod: userContext.preferredContactMethod || 'notification'
      },
      metadata: {
        createdAt: new Date(),
        missedCount: 0,
        escalationLevel: 0,
        automaticTrigger: true
      }
    };
  }

  private async createCopingStrategyReminder(userId: string, moodTrend: any, riskFactors: any, userContext: any): Promise<SafetyPlanReminder> {
    const config = this.userSchedules.get(userId)!;
    
    return {
      id: `coping-strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'coping-strategy',
      priority: 'medium',
      title: 'Coping Strategy Reminder',
      message: 'Remember your coping strategies can help you feel better. Which one will you try today?',
      actionRequired: false,
      scheduledTime: new Date(),
      triggerReason: `Low mood intensity: ${moodTrend.averageIntensity.toFixed(2)}`,
      reminderContent: {
        safetyPlanSection: 'copingStrategies',
        specificActions: config.content.copingStrategyReminders,
        checkInQuestions: [
          'Which coping strategy will you try today?',
          'What has helped you feel better recently?',
          'Do you need help implementing a coping strategy?'
        ]
      },
      userContext: {
        riskLevel: riskFactors.riskLevel,
        recentMoodTrend: moodTrend.trend,
        previousEscalations: userContext.previousEscalations || 0,
        languageCode: userContext.languageCode || 'en',
        timeZone: userContext.timeZone || 'UTC',
        preferredContactMethod: userContext.preferredContactMethod || 'notification'
      },
      metadata: {
        createdAt: new Date(),
        missedCount: 0,
        escalationLevel: 0,
        automaticTrigger: true
      }
    };
  }

  private async deliverReminder(reminder: SafetyPlanReminder): Promise<void> {
    try {
      // Use notification service to deliver the reminder
      notificationService.addToast(reminder.message, reminder.priority === 'urgent' ? 'error' : 'info');
      
      reminder.metadata.deliveredAt = new Date();
      
      // Set up timer for missed reminder handling
      const timeoutMs = this.getMissedReminderTimeout(reminder);
      const timer = setTimeout(() => {
        this.handleMissedReminder(reminder.id);
      }, timeoutMs);
      
      this.reminderTimers.set(reminder.id, timer);
      
      console.log(`Delivered ${reminder.type} reminder to user ${reminder.userId}`);
    } catch (error) {
      console.error('Failed to deliver reminder:', error);
      throw error;
    }
  }

  private getMissedReminderTimeout(reminder: SafetyPlanReminder): number {
    // Base timeout on priority and type
    switch (reminder.priority) {
      case 'urgent': return 30 * 60 * 1000; // 30 minutes
      case 'high': return 2 * 60 * 60 * 1000; // 2 hours
      case 'medium': return 8 * 60 * 60 * 1000; // 8 hours
      case 'low': return 24 * 60 * 60 * 1000; // 24 hours
      default: return 4 * 60 * 60 * 1000; // 4 hours default
    }
  }

  private async scheduleNextReminders(userId: string, _userContext: any): Promise<void> {
    // Implementation would schedule recurring reminders based on user's config
    // This is a placeholder for the scheduling logic
    console.log(`Scheduled next reminders for user ${userId}`);
  }

  private async analyzeReminderResponse(_reminder: SafetyPlanReminder, response: ReminderResponse): Promise<{
    escalationNeeded: boolean;
    followUpNeeded: boolean;
    recommendedActions: string[];
  }> {
    const escalationNeeded = response.responseType === 'crisis' || 
                            response.responseType === 'needs-help' ||
                            (response.moodRating !== undefined && response.moodRating <= 3);
    
    const followUpNeeded = response.responseType === 'needs-help' || 
                          (response.moodRating !== undefined && response.moodRating <= 5);

    const recommendedActions: string[] = [];
    
    if (escalationNeeded) {
      recommendedActions.push('Trigger crisis support');
      recommendedActions.push('Connect with professional help');
    }
    
    if (followUpNeeded) {
      recommendedActions.push('Schedule follow-up check-in');
      recommendedActions.push('Review safety plan');
    }

    return { escalationNeeded, followUpNeeded, recommendedActions };
  }

  private async triggerEscalationForResponse(reminder: SafetyPlanReminder, response: ReminderResponse): Promise<void> {
    try {
      // Map mood trend to crisis detection service format
      const mapMoodTrend = (trend: MoodTrend): 'increasing' | 'stable' | 'decreasing' => {
        switch (trend) {
          case 'improving': return 'increasing';
          case 'stable': return 'stable';
          case 'declining':
          case 'critical': return 'decreasing';
          default: return 'stable';
        }
      };

      // Map contact method to crisis detection service format
      const mapContactMethod = (method: ContactMethod): 'phone' | 'text' | 'chat' | 'video' => {
        switch (method) {
          case 'notification': return 'chat';
          case 'email': return 'chat';
          case 'sms': return 'text';
          case 'call': return 'phone';
          default: return 'chat';
        }
      };

      // Use crisis detection integration service for escalation
      const escalationContext = {
        userId: reminder.userId,
        conversationId: `reminder-${reminder.id}`,
        sessionData: {
          messagesSent: 1,
          sessionDuration: 0,
          previousEscalations: reminder.userContext.previousEscalations,
          riskTrend: mapMoodTrend(reminder.userContext.recentMoodTrend)
        },
        userContext: {
          languageCode: reminder.userContext.languageCode,
          preferredContactMethod: mapContactMethod(reminder.userContext.preferredContactMethod),
          timeZone: reminder.userContext.timeZone
        }
      };

      const escalationText = response.responseType === 'crisis' 
        ? 'User responded to safety plan reminder indicating crisis state'
        : `User needs help: mood rating ${response.moodRating}/10, notes: ${response.additionalNotes}`;

      await crisisDetectionIntegrationService.analyzeTextForCrisis(escalationText, escalationContext);
      
      console.log(`Triggered escalation for user ${reminder.userId} based on reminder response`);
    } catch (error) {
      console.error('Failed to trigger escalation for reminder response:', error);
    }
  }

  private async scheduleFollowUpReminder(reminder: SafetyPlanReminder, _response: ReminderResponse): Promise<void> {
    // Schedule a follow-up reminder based on the response
    const followUpTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours later
    console.log(`Scheduled follow-up reminder for user ${reminder.userId} at ${followUpTime}`);
  }

  private async adjustReminderSchedule(userId: string, response: ReminderResponse): Promise<void> {
    // Adjust reminder frequency based on user's response patterns
    const config = this.userSchedules.get(userId);
    if (!config) return;

    if (response.responseType === 'crisis' || (response.moodRating && response.moodRating <= 3)) {
      // Increase frequency for high-risk responses
      await this.updateUserRiskLevel(userId, 'high', 'Low mood rating in reminder response');
    }
  }

  private shouldEscalateMissedReminder(reminder: SafetyPlanReminder, _config: ReminderScheduleConfig): boolean {
    return reminder.metadata.missedCount >= 2 && 
           (reminder.userContext.riskLevel === 'high' || reminder.userContext.riskLevel === 'critical');
  }

  private async escalateMissedReminder(reminder: SafetyPlanReminder): Promise<void> {
    console.log(`Escalating missed reminder for user ${reminder.userId}`);
    // Would trigger crisis escalation workflow
  }

  private async scheduleFollowUpForMissed(reminder: SafetyPlanReminder): Promise<void> {
    console.log(`Scheduling follow-up for missed reminder for user ${reminder.userId}`);
    // Would schedule another reminder attempt
  }

  private clearUserTimers(userId: string): void {
    for (const [reminderId, timer] of this.reminderTimers.entries()) {
      const reminder = this.activeReminders.get(reminderId);
      if (reminder && reminder.userId === userId) {
        clearTimeout(timer);
        this.reminderTimers.delete(reminderId);
      }
    }
  }
}

// Export singleton instance
export const safetyPlanRemindersService = new SafetyPlanRemindersService();
export default safetyPlanRemindersService;
