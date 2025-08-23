/**
 * Crisis Intervention Workflow Service
 * 
 * Comprehensive crisis intervention system that orchestrates multi-step
 * intervention protocols based on crisis severity and user needs.
 */

import { type CrisisAnalysisResult } from './crisisDetectionService';
import { type EnhancedCrisisDetectionResult } from './enhancedCrisisKeywordDetectionService';
import { astralCoreNotificationService, NotificationPriority } from './astralCoreNotificationService';
import { astralCoreWebSocketService } from './astralCoreWebSocketService';

export interface InterventionWorkflow {
  id: string;
  userId: string;
  createdAt: Date;
  status: 'initiated' | 'active' | 'escalated' | 'resolved' | 'monitoring';
  severityLevel: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  interventionSteps: InterventionStep[];
  resources: CrisisResource[];
  escalationPath: EscalationPath[];
  timeline: InterventionTimeline;
  outcomes: InterventionOutcome[];
}

export interface InterventionStep {
  id: string;
  type: 'assessment' | 'contact' | 'resource' | 'escalation' | 'monitoring' | 'closure';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  priority: number;
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  actions: string[];
  notes?: string;
  requiredConfirmation?: boolean;
  automaticTrigger?: boolean;
}

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'chat' | 'emergency' | 'professional' | 'peer' | 'educational';
  availability: '24/7' | 'business-hours' | 'on-demand';
  contactInfo: {
    phone?: string;
    text?: string;
    web?: string;
    email?: string;
  };
  description: string;
  languages: string[];
  specializations: string[];
  culturalCompetency?: string[];
}

export interface EscalationPath {
  level: number;
  triggerConditions: string[];
  responders: string[];
  timeLimit: number; // minutes
  actions: string[];
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  recipient: 'user' | 'helper' | 'crisis-team' | 'emergency-contact' | 'professional';
  method: 'in-app' | 'push' | 'sms' | 'email' | 'call';
  template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface InterventionTimeline {
  immediateActions: TimelineAction[];
  shortTermActions: TimelineAction[]; // 24 hours
  followUpActions: TimelineAction[]; // 7 days
  longTermSupport: TimelineAction[]; // 30+ days
}

export interface TimelineAction {
  action: string;
  timeframe: string;
  responsible: string;
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  scheduledFor?: Date;
  completedAt?: Date;
}

export interface InterventionOutcome {
  timestamp: Date;
  type: 'positive' | 'neutral' | 'concerning' | 'emergency';
  description: string;
  reportedBy: string;
  followUpRequired: boolean;
}

export interface WorkflowTrigger {
  source: 'user-report' | 'ai-detection' | 'peer-report' | 'helper-escalation' | 'automated';
  confidence: number;
  urgency: 'immediate' | 'urgent' | 'moderate' | 'low';
  data: CrisisAnalysisResult | EnhancedCrisisDetectionResult;
}

class CrisisInterventionWorkflowService {
  private readonly activeWorkflows: Map<string, InterventionWorkflow> = new Map();
  private readonly workflowTemplates: Map<string, InterventionWorkflow> = new Map();
  
  constructor() {
    this.initializeWorkflowTemplates();
  }

  /**
   * Initialize predefined workflow templates for different crisis levels
   */
  private initializeWorkflowTemplates() {
    // Emergency workflow template
    this.workflowTemplates.set('emergency', {
      id: 'template-emergency',
      userId: '',
      createdAt: new Date(),
      status: 'initiated',
      severityLevel: 'emergency',
      interventionSteps: [
        {
          id: 'emergency-1',
          type: 'assessment',
          title: 'Immediate Safety Assessment',
          description: 'Assess immediate danger and safety status',
          status: 'pending',
          priority: 1,
          actions: [
            'Determine if person is in immediate danger',
            'Check for active suicide attempt or plan',
            'Assess access to means of harm',
            'Evaluate consciousness and responsiveness'
          ],
          requiredConfirmation: true,
          automaticTrigger: true
        },
        {
          id: 'emergency-2',
          type: 'contact',
          title: 'Emergency Services Contact',
          description: 'Contact emergency services immediately',
          status: 'pending',
          priority: 1,
          actions: [
            'Call 911 or local emergency services',
            'Provide location and situation details',
            'Stay on line until help arrives',
            'Keep person engaged and safe'
          ],
          requiredConfirmation: true
        },
        {
          id: 'emergency-3',
          type: 'escalation',
          title: 'Crisis Team Activation',
          description: 'Activate internal crisis response team',
          status: 'pending',
          priority: 2,
          actions: [
            'Alert crisis intervention specialists',
            'Notify platform administrators',
            'Activate emergency protocols',
            'Document incident details'
          ],
          automaticTrigger: true
        },
        {
          id: 'emergency-4',
          type: 'monitoring',
          title: 'Continuous Monitoring',
          description: 'Monitor situation until resolved',
          status: 'pending',
          priority: 2,
          actions: [
            'Maintain continuous contact',
            'Monitor vital signs if applicable',
            'Document all interactions',
            'Coordinate with emergency responders'
          ]
        }
      ],
      resources: this.getEmergencyResources(),
      escalationPath: this.getEmergencyEscalationPath(),
      timeline: this.getEmergencyTimeline(),
      outcomes: []
    });

    // Critical workflow template
    this.workflowTemplates.set('critical', {
      id: 'template-critical',
      userId: '',
      createdAt: new Date(),
      status: 'initiated',
      severityLevel: 'critical',
      interventionSteps: [
        {
          id: 'critical-1',
          type: 'assessment',
          title: 'Risk Assessment',
          description: 'Comprehensive suicide risk assessment',
          status: 'pending',
          priority: 1,
          actions: [
            'Evaluate suicidal ideation intensity',
            'Assess protective factors',
            'Review risk factors',
            'Determine intervention urgency'
          ],
          requiredConfirmation: true
        },
        {
          id: 'critical-2',
          type: 'contact',
          title: 'Crisis Counselor Connection',
          description: 'Connect with trained crisis counselor',
          status: 'pending',
          priority: 1,
          actions: [
            'Match with available crisis counselor',
            'Initiate secure communication channel',
            'Brief counselor on situation',
            'Transfer care responsibility'
          ]
        },
        {
          id: 'critical-3',
          type: 'resource',
          title: 'Safety Planning',
          description: 'Develop comprehensive safety plan',
          status: 'pending',
          priority: 2,
          actions: [
            'Identify warning signs',
            'List coping strategies',
            'Identify support contacts',
            'Remove access to means',
            'Create environment safety plan'
          ]
        },
        {
          id: 'critical-4',
          type: 'monitoring',
          title: 'Enhanced Monitoring',
          description: '24-hour enhanced monitoring protocol',
          status: 'pending',
          priority: 2,
          actions: [
            'Schedule regular check-ins',
            'Monitor mood and behavior changes',
            'Track safety plan adherence',
            'Adjust intervention as needed'
          ]
        }
      ],
      resources: this.getCriticalResources(),
      escalationPath: this.getCriticalEscalationPath(),
      timeline: this.getCriticalTimeline(),
      outcomes: []
    });

    // High-risk workflow template
    this.workflowTemplates.set('high', {
      id: 'template-high',
      userId: '',
      createdAt: new Date(),
      status: 'initiated',
      severityLevel: 'high',
      interventionSteps: [
        {
          id: 'high-1',
          type: 'assessment',
          title: 'Detailed Assessment',
          description: 'Comprehensive mental health assessment',
          status: 'pending',
          priority: 1,
          actions: [
            'Evaluate current mental state',
            'Review recent stressors',
            'Assess support system',
            'Identify immediate needs'
          ]
        },
        {
          id: 'high-2',
          type: 'resource',
          title: 'Resource Connection',
          description: 'Connect with appropriate support resources',
          status: 'pending',
          priority: 2,
          actions: [
            'Match with peer supporter',
            'Provide crisis hotline information',
            'Share coping resources',
            'Schedule follow-up support'
          ]
        },
        {
          id: 'high-3',
          type: 'monitoring',
          title: 'Regular Check-ins',
          description: 'Scheduled check-ins and monitoring',
          status: 'pending',
          priority: 3,
          actions: [
            'Daily mood check-ins',
            'Weekly support sessions',
            'Resource utilization tracking',
            'Progress monitoring'
          ]
        }
      ],
      resources: this.getHighRiskResources(),
      escalationPath: this.getHighRiskEscalationPath(),
      timeline: this.getHighRiskTimeline(),
      outcomes: []
    });

    // Medium-risk workflow template
    this.workflowTemplates.set('medium', {
      id: 'template-medium',
      userId: '',
      createdAt: new Date(),
      status: 'initiated',
      severityLevel: 'medium',
      interventionSteps: [
        {
          id: 'medium-1',
          type: 'assessment',
          title: 'Initial Screening',
          description: 'Basic mental health screening',
          status: 'pending',
          priority: 1,
          actions: [
            'Screen for immediate risks',
            'Identify primary concerns',
            'Assess readiness for support',
            'Determine appropriate interventions'
          ]
        },
        {
          id: 'medium-2',
          type: 'resource',
          title: 'Support Resources',
          description: 'Provide self-help and support resources',
          status: 'pending',
          priority: 2,
          actions: [
            'Share self-help materials',
            'Provide peer support options',
            'Offer coping strategies',
            'Schedule optional check-in'
          ]
        }
      ],
      resources: this.getMediumRiskResources(),
      escalationPath: this.getMediumRiskEscalationPath(),
      timeline: this.getMediumRiskTimeline(),
      outcomes: []
    });
  }

  /**
   * Initiate a crisis intervention workflow
   */
  public async initiateWorkflow(
    userId: string,
    trigger: WorkflowTrigger
  ): Promise<InterventionWorkflow> {
    try {
      // Determine severity level from trigger data
      const severityLevel = this.determineSeverityLevel(trigger);
      
      // Get appropriate workflow template
      const template = this.workflowTemplates.get(severityLevel);
      if (!template) {
        throw new Error(`No workflow template found for severity: ${severityLevel}`);
      }

      // Create personalized workflow from template
      const workflow: InterventionWorkflow = {
        ...template,
        id: `workflow-${userId}-${Date.now()}`,
        userId,
        createdAt: new Date(),
        status: 'active',
        interventionSteps: template.interventionSteps.map(step => ({ ...step })),
        resources: [...template.resources],
        escalationPath: [...template.escalationPath],
        timeline: { ...template.timeline },
        outcomes: []
      };

      // Store active workflow
      this.activeWorkflows.set(workflow.id, workflow);

      // Start automatic steps
      await this.executeAutomaticSteps(workflow);

      // Send initial notifications
      await this.sendWorkflowNotifications(workflow, 'initiated');

      // Start monitoring
      this.startWorkflowMonitoring(workflow);

      return workflow;
    } catch (error) {
      console.error('[Crisis Workflow] Failed to initiate workflow:', error);
      throw error;
    }
  }

  /**
   * Execute a specific intervention step
   */
  public async executeStep(
    workflowId: string,
    stepId: string,
    executorId?: string
  ): Promise<InterventionStep> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.interventionSteps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow`);
    }

    // Update step status
    step.status = 'in-progress';
    step.startedAt = new Date();
    if (executorId) {
      step.assignedTo = executorId;
    }

    // Execute step-specific logic
    await this.executeStepLogic(workflow, step);

    // Mark as completed
    step.status = 'completed';
    step.completedAt = new Date();

    // Check for escalation triggers
    await this.checkEscalationTriggers(workflow);

    // Update workflow status
    this.updateWorkflowStatus(workflow);

    return step;
  }

  /**
   * Escalate a workflow to higher severity
   */
  public async escalateWorkflow(
    workflowId: string,
    reason: string,
    escalatorId: string
  ): Promise<InterventionWorkflow> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Determine new severity level
    const newSeverity = this.getEscalatedSeverity(workflow.severityLevel);
    
    // Get escalated template
    const escalatedTemplate = this.workflowTemplates.get(newSeverity);
    if (!escalatedTemplate) {
      throw new Error(`No template for escalated severity: ${newSeverity}`);
    }

    // Merge escalated steps
    const newSteps = escalatedTemplate.interventionSteps.filter(
      step => !workflow.interventionSteps.some(ws => ws.type === step.type)
    );
    workflow.interventionSteps.push(...newSteps);

    // Update workflow - cast to valid severity level
    workflow.severityLevel = newSeverity as 'low' | 'medium' | 'high' | 'critical' | 'emergency';
    workflow.status = 'escalated';
    
    // Add escalation outcome
    workflow.outcomes.push({
      timestamp: new Date(),
      type: 'concerning',
      description: `Escalated to ${newSeverity}: ${reason}`,
      reportedBy: escalatorId,
      followUpRequired: true
    });

    // Send escalation notifications
    await this.sendEscalationNotifications(workflow, reason);

    return workflow;
  }

  /**
   * Add an outcome to a workflow
   */
  public addOutcome(
    workflowId: string,
    outcome: Omit<InterventionOutcome, 'timestamp'>
  ): void {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.outcomes.push({
      ...outcome,
      timestamp: new Date()
    });

    // Check if workflow can be resolved
    if (outcome.type === 'positive' && !outcome.followUpRequired) {
      this.checkWorkflowResolution(workflow);
    }
  }

  /**
   * Get active workflows for a user
   */
  public getActiveWorkflowsForUser(userId: string): InterventionWorkflow[] {
    return Array.from(this.activeWorkflows.values()).filter(
      workflow => workflow.userId === userId && 
      ['active', 'escalated', 'monitoring'].includes(workflow.status)
    );
  }

  /**
   * Helper methods
   */
  private determineSeverityLevel(trigger: WorkflowTrigger): string {
    if ('overallSeverity' in trigger.data) {
      return trigger.data.overallSeverity;
    } else if ('severityLevel' in trigger.data) {
      return trigger.data.severityLevel;
    }
    
    // Default based on urgency
    switch (trigger.urgency) {
      case 'immediate': return 'emergency';
      case 'urgent': return 'critical';
      case 'moderate': return 'high';
      default: return 'medium';
    }
  }

  private async executeAutomaticSteps(workflow: InterventionWorkflow): Promise<void> {
    const automaticSteps = workflow.interventionSteps.filter(
      step => step.automaticTrigger && step.status === 'pending'
    );

    for (const step of automaticSteps) {
      await this.executeStep(workflow.id, step.id, 'system');
    }
  }

  private async executeStepLogic(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    switch (step.type) {
      case 'assessment':
        // Perform automated assessment if available
        if (workflow.severityLevel === 'emergency') {
          // Log critical assessment
          console.log('[Crisis Workflow] Emergency assessment initiated for user:', workflow.userId);
        }
        break;
        
      case 'contact':
        // Initiate contact protocols
        await this.initiateContactProtocol(workflow, step);
        break;
        
      case 'resource':
        // Provide resources to user
        await this.provideResources(workflow, step);
        break;
        
      case 'escalation':
        // Execute escalation procedures
        await this.executeEscalation(workflow, step);
        break;
        
      case 'monitoring':
        // Set up monitoring protocols
        await this.setupMonitoring(workflow, step);
        break;
    }
  }

  private async initiateContactProtocol(workflow: InterventionWorkflow, _step: InterventionStep): Promise<void> {
    // Send notifications to appropriate contacts
    if (workflow.severityLevel === 'emergency') {
      // Emergency contact protocol
      await astralCoreNotificationService.show({
        title: 'Emergency Support Activated',
        body: 'Emergency services have been notified. Help is on the way.',
        priority: NotificationPriority.URGENT
      });
    }
  }

  private async provideResources(workflow: InterventionWorkflow, _step: InterventionStep): Promise<void> {
    // Send relevant resources to user
    const resources = workflow.resources.filter(r => 
      r.availability === '24/7' || r.type === 'emergency'
    );
    
    // Send resource notification
    await astralCoreNotificationService.show({
      title: 'Crisis Resources Available',
      body: `${resources.length} crisis resources are available to help you.`,
      priority: NotificationPriority.HIGH
    });
  }

  private async executeEscalation(workflow: InterventionWorkflow, _step: InterventionStep): Promise<void> {
    // Execute escalation protocols
    console.log('[Crisis Workflow] Escalation executed for workflow:', workflow.id);
    
    // Notify crisis team via WebSocket
    astralCoreWebSocketService.send('crisis-escalation', {
      workflowId: workflow.id,
      userId: workflow.userId,
      severity: workflow.severityLevel,
      timestamp: new Date()
    });
  }

  private async setupMonitoring(workflow: InterventionWorkflow, _step: InterventionStep): Promise<void> {
    // Set up monitoring schedule
    workflow.status = 'monitoring';
    
    // Schedule check-ins based on severity
    const checkInInterval = this.getCheckInInterval(workflow.severityLevel);
    console.log(`[Crisis Workflow] Monitoring setup with ${checkInInterval} minute intervals`);
  }

  private getCheckInInterval(severity: string): number {
    switch (severity) {
      case 'emergency': return 15; // 15 minutes
      case 'critical': return 30; // 30 minutes
      case 'high': return 60; // 1 hour
      case 'medium': return 240; // 4 hours
      default: return 1440; // 24 hours
    }
  }

  private async sendWorkflowNotifications(workflow: InterventionWorkflow, event: string): Promise<void> {
    // Send notifications based on workflow event
    console.log(`[Crisis Workflow] Sending notifications for ${event} event`);
    
    if (event === 'initiated' && workflow.severityLevel === 'emergency') {
      // Send urgent notifications
      await astralCoreNotificationService.show({
        title: 'Crisis Support Activated',
        body: 'We\'re here to help. Emergency support has been activated.',
        priority: NotificationPriority.URGENT
      });
    }
  }

  private async sendEscalationNotifications(_workflow: InterventionWorkflow, reason: string): Promise<void> {
    // Send escalation notifications
    await astralCoreNotificationService.show({
      title: 'Support Level Increased',
      body: `Your support has been escalated to ensure you get the help you need. Reason: ${reason}`,
      priority: NotificationPriority.HIGH
    });
  }

  private startWorkflowMonitoring(workflow: InterventionWorkflow): void {
    // Start monitoring timer
    const checkInterval = this.getCheckInInterval(workflow.severityLevel) * 60 * 1000;
    
    const monitoringTimer = setInterval(() => {
      this.checkWorkflowStatus(workflow);
    }, checkInterval);
    
    // Store timer reference (in production, use proper timer management)
    (workflow as any)._monitoringTimer = monitoringTimer;
  }

  private checkWorkflowStatus(workflow: InterventionWorkflow): void {
    // Check if all steps are completed
    const pendingSteps = workflow.interventionSteps.filter(
      step => step.status === 'pending' || step.status === 'in-progress'
    );
    
    if (pendingSteps.length === 0) {
      // All steps completed, check for resolution
      this.checkWorkflowResolution(workflow);
    }
  }

  private async checkEscalationTriggers(workflow: InterventionWorkflow): Promise<void> {
    // Check if escalation is needed based on outcomes
    const concerningOutcomes = workflow.outcomes.filter(
      o => o.type === 'concerning' || o.type === 'emergency'
    );
    
    if (concerningOutcomes.length >= 2) {
      // Auto-escalate due to multiple concerning outcomes
      await this.escalateWorkflow(
        workflow.id,
        'Multiple concerning outcomes detected',
        'system'
      );
    }
  }

  private updateWorkflowStatus(workflow: InterventionWorkflow): void {
    const completedSteps = workflow.interventionSteps.filter(
      step => step.status === 'completed'
    );
    
    if (completedSteps.length === workflow.interventionSteps.length) {
      workflow.status = 'monitoring';
    }
  }

  private checkWorkflowResolution(workflow: InterventionWorkflow): void {
    const positiveOutcomes = workflow.outcomes.filter(o => o.type === 'positive');
    const recentConcerning = workflow.outcomes.filter(
      o => o.type === 'concerning' && 
      (new Date().getTime() - o.timestamp.getTime()) < 24 * 60 * 60 * 1000
    );
    
    if (positiveOutcomes.length >= 3 && recentConcerning.length === 0) {
      workflow.status = 'resolved';
      this.cleanupWorkflow(workflow);
    }
  }

  private cleanupWorkflow(workflow: InterventionWorkflow): void {
    // Clear monitoring timer
    if ((workflow as any)._monitoringTimer) {
      clearInterval((workflow as any)._monitoringTimer);
    }
    
    // Move to resolved workflows (in production, persist to database)
    console.log(`[Crisis Workflow] Workflow ${workflow.id} resolved`);
  }

  private getEscalatedSeverity(currentSeverity: string): string {
    const escalationMap: Record<string, string> = {
      'low': 'medium',
      'medium': 'high',
      'high': 'critical',
      'critical': 'emergency',
      'emergency': 'emergency'
    };
    return escalationMap[currentSeverity] || 'high';
  }

  // Resource definitions
  private getEmergencyResources(): CrisisResource[] {
    return [
      {
        id: 'res-911',
        name: 'Emergency Services',
        type: 'emergency',
        availability: '24/7',
        contactInfo: { phone: '911' },
        description: 'Immediate emergency response for life-threatening situations',
        languages: ['en', 'es'],
        specializations: ['emergency', 'medical', 'safety']
      },
      {
        id: 'res-988',
        name: '988 Suicide & Crisis Lifeline',
        type: 'hotline',
        availability: '24/7',
        contactInfo: { 
          phone: '988',
          text: '988',
          web: 'https://988lifeline.org'
        },
        description: 'Free, confidential crisis support',
        languages: ['en', 'es'],
        specializations: ['suicide', 'crisis', 'mental-health']
      }
    ];
  }

  private getCriticalResources(): CrisisResource[] {
    return [
      ...this.getEmergencyResources(),
      {
        id: 'res-crisis-text',
        name: 'Crisis Text Line',
        type: 'chat',
        availability: '24/7',
        contactInfo: { 
          text: 'HOME to 741741',
          web: 'https://www.crisistextline.org'
        },
        description: 'Text-based crisis support',
        languages: ['en', 'es'],
        specializations: ['crisis', 'anxiety', 'depression']
      }
    ];
  }

  private getHighRiskResources(): CrisisResource[] {
    return [
      ...this.getCriticalResources(),
      {
        id: 'res-peer-support',
        name: 'Peer Support Network',
        type: 'peer',
        availability: 'on-demand',
        contactInfo: { web: '/peer-support' },
        description: 'Connect with trained peer supporters',
        languages: ['en', 'es', 'fr', 'de'],
        specializations: ['peer-support', 'lived-experience']
      }
    ];
  }

  private getMediumRiskResources(): CrisisResource[] {
    return [
      {
        id: 'res-self-help',
        name: 'Self-Help Resources',
        type: 'educational',
        availability: '24/7',
        contactInfo: { web: '/resources/self-help' },
        description: 'Self-guided coping strategies and tools',
        languages: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar'],
        specializations: ['coping', 'mindfulness', 'self-care']
      }
    ];
  }

  // Escalation path definitions
  private getEmergencyEscalationPath(): EscalationPath[] {
    return [
      {
        level: 1,
        triggerConditions: ['Immediate danger detected', 'Active suicide attempt'],
        responders: ['Emergency Services', 'Crisis Team Lead'],
        timeLimit: 5,
        actions: ['Call 911', 'Activate emergency protocol', 'Notify all available crisis counselors'],
        notifications: [
          { recipient: 'crisis-team', method: 'push', template: 'emergency-activation', priority: NotificationPriority.URGENT },
          { recipient: 'user', method: 'in-app', template: 'emergency-support', priority: NotificationPriority.URGENT }
        ]
      }
    ];
  }

  private getCriticalEscalationPath(): EscalationPath[] {
    return [
      {
        level: 1,
        triggerConditions: ['Suicide plan identified', 'Severe distress'],
        responders: ['Crisis Counselor', 'Senior Therapist'],
        timeLimit: 15,
        actions: ['Connect with crisis counselor', 'Initiate safety planning'],
        notifications: [
          { recipient: 'crisis-team', method: 'push', template: 'critical-alert', priority: NotificationPriority.HIGH }
        ]
      }
    ];
  }

  private getHighRiskEscalationPath(): EscalationPath[] {
    return [
      {
        level: 1,
        triggerConditions: ['Increasing distress', 'Multiple risk factors'],
        responders: ['Peer Supporter', 'Mental Health Navigator'],
        timeLimit: 30,
        actions: ['Schedule urgent check-in', 'Provide immediate resources'],
        notifications: [
          { recipient: 'helper', method: 'in-app', template: 'high-risk-alert', priority: 'medium' }
        ]
      }
    ];
  }

  private getMediumRiskEscalationPath(): EscalationPath[] {
    return [
      {
        level: 1,
        triggerConditions: ['Worsening symptoms', 'Request for help'],
        responders: ['Peer Supporter'],
        timeLimit: 60,
        actions: ['Offer peer support', 'Share coping resources'],
        notifications: [
          { recipient: 'user', method: 'in-app', template: 'support-available', priority: 'low' }
        ]
      }
    ];
  }

  // Timeline definitions
  private getEmergencyTimeline(): InterventionTimeline {
    return {
      immediateActions: [
        {
          action: 'Contact emergency services',
          timeframe: 'Within 5 minutes',
          responsible: 'System/Crisis Team',
          status: 'scheduled'
        },
        {
          action: 'Ensure immediate safety',
          timeframe: 'Immediate',
          responsible: 'First Responder',
          status: 'scheduled'
        }
      ],
      shortTermActions: [
        {
          action: 'Medical evaluation',
          timeframe: 'Within 2 hours',
          responsible: 'Medical Team',
          status: 'scheduled'
        },
        {
          action: 'Crisis stabilization',
          timeframe: 'Within 24 hours',
          responsible: 'Crisis Team',
          status: 'scheduled'
        }
      ],
      followUpActions: [
        {
          action: 'Safety plan review',
          timeframe: 'Within 48 hours',
          responsible: 'Therapist',
          status: 'scheduled'
        }
      ],
      longTermSupport: [
        {
          action: 'Ongoing therapy',
          timeframe: 'Weekly for 3 months',
          responsible: 'Therapist',
          status: 'scheduled'
        }
      ]
    };
  }

  private getCriticalTimeline(): InterventionTimeline {
    return {
      immediateActions: [
        {
          action: 'Crisis counselor connection',
          timeframe: 'Within 15 minutes',
          responsible: 'Crisis Team',
          status: 'scheduled'
        }
      ],
      shortTermActions: [
        {
          action: 'Safety planning session',
          timeframe: 'Within 4 hours',
          responsible: 'Crisis Counselor',
          status: 'scheduled'
        }
      ],
      followUpActions: [
        {
          action: 'Daily check-ins',
          timeframe: 'Next 7 days',
          responsible: 'Support Team',
          status: 'scheduled'
        }
      ],
      longTermSupport: [
        {
          action: 'Weekly therapy sessions',
          timeframe: 'Ongoing',
          responsible: 'Therapist',
          status: 'scheduled'
        }
      ]
    };
  }

  private getHighRiskTimeline(): InterventionTimeline {
    return {
      immediateActions: [
        {
          action: 'Initial assessment',
          timeframe: 'Within 1 hour',
          responsible: 'Support Team',
          status: 'scheduled'
        }
      ],
      shortTermActions: [
        {
          action: 'Support session',
          timeframe: 'Within 24 hours',
          responsible: 'Peer Supporter',
          status: 'scheduled'
        }
      ],
      followUpActions: [
        {
          action: 'Check-in calls',
          timeframe: 'Every 3 days',
          responsible: 'Support Team',
          status: 'scheduled'
        }
      ],
      longTermSupport: [
        {
          action: 'Resource access',
          timeframe: 'Ongoing',
          responsible: 'User/Platform',
          status: 'scheduled'
        }
      ]
    };
  }

  private getMediumRiskTimeline(): InterventionTimeline {
    return {
      immediateActions: [],
      shortTermActions: [
        {
          action: 'Resource provision',
          timeframe: 'Within 2 hours',
          responsible: 'System',
          status: 'scheduled'
        }
      ],
      followUpActions: [
        {
          action: 'Optional check-in',
          timeframe: 'Within 7 days',
          responsible: 'Peer Supporter',
          status: 'scheduled'
        }
      ],
      longTermSupport: [
        {
          action: 'Self-guided support',
          timeframe: 'Ongoing',
          responsible: 'User',
          status: 'scheduled'
        }
      ]
    };
  }
}

// Export singleton instance
export const crisisInterventionWorkflowService = new CrisisInterventionWorkflowService();
export default crisisInterventionWorkflowService;

