/**
 * Crisis Intervention Workflow Service
 *
 * Comprehensive crisis intervention system that orchestrates multi-step
 * intervention protocols based on crisis severity and user needs.
 */

import { crisisDetectionService, CrisisAnalysisResult } from './crisisDetectionService';
import { notificationService } from './notificationService';
import { emergencyContactService } from './emergencyContactService';

export interface InterventionWorkflow {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'initiated' | 'active' | 'escalated' | 'resolved' | 'monitoring';
  severityLevel: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  interventionSteps: InterventionStep[];
  resources: CrisisResource[];
  escalationPath: EscalationPath[];
  timeline: InterventionTimeline;
  outcomes: InterventionOutcome[];
  assignedCounselor?: string;
  emergencyContacts: string[];
  culturalConsiderations?: CulturalConsiderations;
  accessibilityNeeds?: AccessibilityNeeds;
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
  estimatedDuration?: number; // minutes
  dependencies?: string[]; // step IDs
}

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'chat' | 'emergency' | 'professional' | 'peer' | 'educational';
  availability: '24/7' | 'business-hours' | 'on-demand';
  contact: string;
  description: string;
  language: string[];
  culturalSpecialty?: string[];
  accessibilityFeatures?: string[];
  estimatedResponseTime?: string;
  cost?: 'free' | 'insurance' | 'paid';
}

export interface EscalationPath {
  id: string;
  fromSeverity: InterventionWorkflow['severityLevel'];
  toSeverity: InterventionWorkflow['severityLevel'];
  triggers: string[];
  automaticEscalation: boolean;
  requiredApproval?: string; // role or user ID
  actions: EscalationAction[];
  notificationTargets: string[];
  timeThreshold?: number; // minutes
}

export interface EscalationAction {
  type: 'notify' | 'assign' | 'resource' | 'emergency' | 'escalate';
  target: string;
  message?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
}

export interface InterventionTimeline {
  events: TimelineEvent[];
  milestones: Milestone[];
  checkpoints: Checkpoint[];
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'step-started' | 'step-completed' | 'escalation' | 'contact' | 'resource-provided' | 'outcome';
  description: string;
  actor: string; // user ID or system
  metadata?: Record<string, any>;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetTime: Date;
  achievedTime?: Date;
  status: 'pending' | 'achieved' | 'missed';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface Checkpoint {
  id: string;
  scheduledTime: Date;
  completedTime?: Date;
  type: 'wellness-check' | 'follow-up' | 'assessment' | 'resource-review';
  assignedTo: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  notes?: string;
  outcome?: CheckpointOutcome;
}

export interface CheckpointOutcome {
  riskLevel: 'decreased' | 'stable' | 'increased';
  nextAction: 'continue' | 'escalate' | 'de-escalate' | 'close';
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface InterventionOutcome {
  id: string;
  timestamp: Date;
  type: 'resolution' | 'escalation' | 'transfer' | 'follow-up-scheduled';
  description: string;
  effectiveness: 'very-effective' | 'effective' | 'somewhat-effective' | 'ineffective';
  userFeedback?: string;
  counselorNotes?: string;
  resourcesUsed: string[];
  nextSteps: string[];
}

export interface CulturalConsiderations {
  language: string;
  culturalBackground?: string;
  religiousConsiderations?: string[];
  familyInvolvementPreference: 'high' | 'medium' | 'low' | 'none';
  culturallySpecificResources: boolean;
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
}

export interface AccessibilityNeeds {
  screenReader: boolean;
  largeText: boolean;
  highContrast: boolean;
  audioSupport: boolean;
  simplifiedLanguage: boolean;
  visualAids: boolean;
  communicationAssistance: boolean;
}

export interface WorkflowMetrics {
  averageResolutionTime: number;
  escalationRate: number;
  resourceUtilization: Record<string, number>;
  outcomeDistribution: Record<string, number>;
  userSatisfactionScore: number;
  counselorWorkload: Record<string, number>;
}

class CrisisInterventionWorkflowService {
  private activeWorkflows: Map<string, InterventionWorkflow> = new Map();
  private workflowTemplates: Map<string, Partial<InterventionWorkflow>> = new Map();
  private metrics: WorkflowMetrics = {
    averageResolutionTime: 0,
    escalationRate: 0,
    resourceUtilization: {},
    outcomeDistribution: {},
    userSatisfactionScore: 0,
    counselorWorkload: {}
  };

  constructor() {
    this.initializeWorkflowTemplates();
    this.startMetricsCollection();
  }

  /**
   * Initialize a new crisis intervention workflow
   */
  async initiateWorkflow(
    userId: string,
    crisisData: CrisisAnalysisResult,
    initialAssessment?: any
  ): Promise<InterventionWorkflow> {
    const workflowId = this.generateWorkflowId();
    const severityLevel = this.determineSeverityLevel(crisisData);
    
    const workflow: InterventionWorkflow = {
      id: workflowId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'initiated',
      severityLevel,
      interventionSteps: await this.generateInterventionSteps(severityLevel, crisisData),
      resources: await this.selectRelevantResources(severityLevel, crisisData),
      escalationPath: this.generateEscalationPath(severityLevel),
      timeline: {
        events: [],
        milestones: [],
        checkpoints: []
      },
      outcomes: [],
      emergencyContacts: await this.getEmergencyContacts(userId),
      culturalConsiderations: await this.getCulturalConsiderations(userId),
      accessibilityNeeds: await this.getAccessibilityNeeds(userId)
    };

    // Add initial timeline event
    this.addTimelineEvent(workflow, {
      type: 'step-started',
      description: 'Crisis intervention workflow initiated',
      actor: 'system'
    });

    // Set up initial milestones
    this.setupMilestones(workflow);

    // Schedule checkpoints based on severity
    this.scheduleCheckpoints(workflow);

    this.activeWorkflows.set(workflowId, workflow);

    // Notify relevant parties
    await this.notifyWorkflowInitiation(workflow);

    // Start the workflow
    await this.activateWorkflow(workflowId);

    return workflow;
  }

  /**
   * Activate and begin executing a workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'active';
    workflow.updatedAt = new Date();

    // Start executing the first pending step
    const firstStep = workflow.interventionSteps.find(step => step.status === 'pending');
    if (firstStep) {
      await this.executeStep(workflowId, firstStep.id);
    }

    this.addTimelineEvent(workflow, {
      type: 'step-started',
      description: 'Workflow activated and first step initiated',
      actor: 'system'
    });
  }

  /**
   * Execute a specific intervention step
   */
  async executeStep(workflowId: string, stepId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.interventionSteps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow ${workflowId}`);
    }

    step.status = 'in-progress';
    step.startedAt = new Date();

    this.addTimelineEvent(workflow, {
      type: 'step-started',
      description: `Started step: ${step.title}`,
      actor: step.assignedTo || 'system'
    });

    try {
      switch (step.type) {
        case 'assessment':
          await this.executeAssessmentStep(workflow, step);
          break;
        case 'contact':
          await this.executeContactStep(workflow, step);
          break;
        case 'resource':
          await this.executeResourceStep(workflow, step);
          break;
        case 'escalation':
          await this.executeEscalationStep(workflow, step);
          break;
        case 'monitoring':
          await this.executeMonitoringStep(workflow, step);
          break;
        case 'closure':
          await this.executeClosureStep(workflow, step);
          break;
      }

      step.status = 'completed';
      step.completedAt = new Date();

      this.addTimelineEvent(workflow, {
        type: 'step-completed',
        description: `Completed step: ${step.title}`,
        actor: step.assignedTo || 'system'
      });

      // Check if we should proceed to next step or escalate
      await this.evaluateNextAction(workflowId);

    } catch (error) {
      console.error(`Error executing step ${stepId}:`, error);
      step.notes = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Consider escalation on step failure
      await this.considerEscalation(workflowId, 'step-failure');
    }

    workflow.updatedAt = new Date();
  }

  /**
   * Escalate a workflow to higher severity level
   */
  async escalateWorkflow(
    workflowId: string,
    reason: string,
    targetSeverity?: InterventionWorkflow['severityLevel']
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const currentSeverity = workflow.severityLevel;
    const newSeverity = targetSeverity || this.getNextSeverityLevel(currentSeverity);

    workflow.severityLevel = newSeverity;
    workflow.status = 'escalated';
    workflow.updatedAt = new Date();

    // Add escalation-specific steps
    const escalationSteps = await this.generateEscalationSteps(newSeverity, reason);
    workflow.interventionSteps.push(...escalationSteps);

    // Update resources for new severity level
    const additionalResources = await this.selectRelevantResources(newSeverity, null);
    workflow.resources.push(...additionalResources);

    this.addTimelineEvent(workflow, {
      type: 'escalation',
      description: `Escalated from ${currentSeverity} to ${newSeverity}: ${reason}`,
      actor: 'system'
    });

    // Notify relevant parties about escalation
    await this.notifyEscalation(workflow, reason);

    // Execute immediate escalation actions
    await this.executeEscalationActions(workflow);
  }

  /**
   * Complete and close a workflow
   */
  async completeWorkflow(
    workflowId: string,
    outcome: Omit<InterventionOutcome, 'id' | 'timestamp'>
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const finalOutcome: InterventionOutcome = {
      id: this.generateId(),
      timestamp: new Date(),
      ...outcome
    };

    workflow.outcomes.push(finalOutcome);
    workflow.status = 'resolved';
    workflow.updatedAt = new Date();

    this.addTimelineEvent(workflow, {
      type: 'outcome',
      description: `Workflow completed: ${outcome.type}`,
      actor: 'system'
    });

    // Schedule follow-up if needed
    if (outcome.type === 'follow-up-scheduled') {
      await this.scheduleFollowUp(workflow);
    }

    // Update metrics
    this.updateMetrics(workflow);

    // Archive the workflow
    await this.archiveWorkflow(workflow);

    this.activeWorkflows.delete(workflowId);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): InterventionWorkflow | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get all active workflows for a user
   */
  getUserWorkflows(userId: string): InterventionWorkflow[] {
    return Array.from(this.activeWorkflows.values())
      .filter(workflow => workflow.userId === userId);
  }

  /**
   * Get workflow metrics
   */
  getMetrics(): WorkflowMetrics {
    return { ...this.metrics };
  }

  // Private helper methods

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverityLevel(crisisData: CrisisAnalysisResult): InterventionWorkflow['severityLevel'] {
    if (crisisData.riskLevel >= 0.9) return 'emergency';
    if (crisisData.riskLevel >= 0.7) return 'critical';
    if (crisisData.riskLevel >= 0.5) return 'high';
    if (crisisData.riskLevel >= 0.3) return 'medium';
    return 'low';
  }

  private async generateInterventionSteps(
    severity: InterventionWorkflow['severityLevel'],
    crisisData: CrisisAnalysisResult
  ): Promise<InterventionStep[]> {
    const baseSteps: Partial<InterventionStep>[] = [
      {
        type: 'assessment',
        title: 'Initial Crisis Assessment',
        description: 'Comprehensive assessment of current crisis state',
        priority: 1
      }
    ];

    if (severity === 'emergency' || severity === 'critical') {
      baseSteps.push({
        type: 'contact',
        title: 'Emergency Contact Notification',
        description: 'Notify emergency contacts immediately',
        priority: 2,
        automaticTrigger: true
      });
    }

    baseSteps.push(
      {
        type: 'resource',
        title: 'Provide Crisis Resources',
        description: 'Connect user with appropriate crisis resources',
        priority: 3
      },
      {
        type: 'monitoring',
        title: 'Ongoing Monitoring',
        description: 'Monitor user status and progress',
        priority: 4
      }
    );

    return baseSteps.map((step, index) => ({
      id: this.generateId(),
      status: 'pending' as const,
      actions: [],
      ...step
    } as InterventionStep));
  }

  private async selectRelevantResources(
    severity: InterventionWorkflow['severityLevel'],
    crisisData: CrisisAnalysisResult | null
  ): Promise<CrisisResource[]> {
    // This would typically fetch from a database
    const allResources: CrisisResource[] = [
      {
        id: 'crisis-text-line',
        name: 'Crisis Text Line',
        type: 'chat',
        availability: '24/7',
        contact: 'Text HOME to 741741',
        description: '24/7 crisis support via text message',
        language: ['en', 'es'],
        estimatedResponseTime: '< 5 minutes',
        cost: 'free'
      },
      {
        id: 'suicide-prevention-lifeline',
        name: 'National Suicide Prevention Lifeline',
        type: 'hotline',
        availability: '24/7',
        contact: '988',
        description: '24/7 suicide prevention and crisis support',
        language: ['en', 'es'],
        estimatedResponseTime: '< 2 minutes',
        cost: 'free'
      }
    ];

    // Filter based on severity and other criteria
    return allResources.filter(resource => {
      if (severity === 'emergency' && resource.type === 'emergency') return true;
      if (severity === 'critical' && ['emergency', 'hotline'].includes(resource.type)) return true;
      return true; // Include all resources for lower severity levels
    });
  }

  private generateEscalationPath(severity: InterventionWorkflow['severityLevel']): EscalationPath[] {
    const paths: EscalationPath[] = [];

    if (severity !== 'emergency') {
      paths.push({
        id: this.generateId(),
        fromSeverity: severity,
        toSeverity: this.getNextSeverityLevel(severity),
        triggers: ['no-improvement', 'deterioration', 'new-risk-factors'],
        automaticEscalation: false,
        actions: [
          {
            type: 'notify',
            target: 'crisis-team',
            priority: 'high',
            automated: true
          }
        ],
        notificationTargets: ['crisis-team', 'assigned-counselor'],
        timeThreshold: 60 // 1 hour
      });
    }

    return paths;
  }

  private getNextSeverityLevel(current: InterventionWorkflow['severityLevel']): InterventionWorkflow['severityLevel'] {
    const levels: InterventionWorkflow['severityLevel'][] = ['low', 'medium', 'high', 'critical', 'emergency'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private addTimelineEvent(workflow: InterventionWorkflow, eventData: Omit<TimelineEvent, 'id' | 'timestamp'>): void {
    const event: TimelineEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...eventData
    };
    workflow.timeline.events.push(event);
  }

  private setupMilestones(workflow: InterventionWorkflow): void {
    const milestones: Milestone[] = [
      {
        id: this.generateId(),
        name: 'Initial Contact',
        description: 'First contact with crisis counselor',
        targetTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        status: 'pending',
        importance: 'high'
      },
      {
        id: this.generateId(),
        name: 'Safety Assessment',
        description: 'Complete safety assessment',
        targetTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        status: 'pending',
        importance: 'critical'
      }
    ];

    workflow.timeline.milestones = milestones;
  }

  private scheduleCheckpoints(workflow: InterventionWorkflow): void {
    const checkpoints: Checkpoint[] = [
      {
        id: this.generateId(),
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        type: 'wellness-check',
        assignedTo: 'crisis-counselor',
        status: 'scheduled'
      },
      {
        id: this.generateId(),
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        type: 'follow-up',
        assignedTo: 'assigned-counselor',
        status: 'scheduled'
      }
    ];

    workflow.timeline.checkpoints = checkpoints;
  }

  private async notifyWorkflowInitiation(workflow: InterventionWorkflow): Promise<void> {
    await notificationService.sendNotification({
      userId: workflow.userId,
      title: 'Crisis Support Activated',
      message: 'We\'re here to help. Crisis support resources are being prepared for you.',
      priority: 'high',
      type: 'crisis-support'
    });
  }

  private async executeAssessmentStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for assessment step execution
    step.actions.push('Assessment questionnaire sent');
    step.actions.push('Risk level evaluated');
  }

  private async executeContactStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for contact step execution
    if (workflow.emergencyContacts.length > 0) {
      await emergencyContactService.notifyContacts(workflow.userId, workflow.emergencyContacts);
      step.actions.push('Emergency contacts notified');
    }
  }

  private async executeResourceStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for resource step execution
    step.actions.push('Crisis resources provided to user');
  }

  private async executeEscalationStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for escalation step execution
    step.actions.push('Case escalated to higher severity level');
  }

  private async executeMonitoringStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for monitoring step execution
    step.actions.push('Monitoring protocol activated');
  }

  private async executeClosureStep(workflow: InterventionWorkflow, step: InterventionStep): Promise<void> {
    // Implementation for closure step execution
    step.actions.push('Workflow closure initiated');
  }

  private async evaluateNextAction(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    const nextStep = workflow.interventionSteps.find(step => step.status === 'pending');
    if (nextStep) {
      await this.executeStep(workflowId, nextStep.id);
    }
  }

  private async considerEscalation(workflowId: string, reason: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    // Logic to determine if escalation is needed
    const shouldEscalate = this.shouldEscalate(workflow, reason);
    if (shouldEscalate) {
      await this.escalateWorkflow(workflowId, reason);
    }
  }

  private shouldEscalate(workflow: InterventionWorkflow, reason: string): boolean {
    // Implementation of escalation decision logic
    return reason === 'step-failure' && workflow.severityLevel !== 'emergency';
  }

  private async generateEscalationSteps(
    severity: InterventionWorkflow['severityLevel'],
    reason: string
  ): Promise<InterventionStep[]> {
    return [
      {
        id: this.generateId(),
        type: 'escalation',
        title: 'Emergency Escalation',
        description: `Escalated due to: ${reason}`,
        status: 'pending',
        priority: 1,
        actions: [],
        automaticTrigger: true
      }
    ];
  }

  private async notifyEscalation(workflow: InterventionWorkflow, reason: string): Promise<void> {
    await notificationService.sendNotification({
      userId: workflow.userId,
      title: 'Crisis Support Escalated',
      message: 'Additional crisis support resources have been activated.',
      priority: 'critical',
      type: 'crisis-escalation'
    });
  }

  private async executeEscalationActions(workflow: InterventionWorkflow): Promise<void> {
    // Implementation of escalation actions
    console.log(`Executing escalation actions for workflow ${workflow.id}`);
  }

  private async scheduleFollowUp(workflow: InterventionWorkflow): Promise<void> {
    // Implementation of follow-up scheduling
    console.log(`Scheduling follow-up for workflow ${workflow.id}`);
  }

  private updateMetrics(workflow: InterventionWorkflow): void {
    // Implementation of metrics updating
    const duration = workflow.updatedAt.getTime() - workflow.createdAt.getTime();
    this.metrics.averageResolutionTime = (this.metrics.averageResolutionTime + duration) / 2;
  }

  private async archiveWorkflow(workflow: InterventionWorkflow): Promise<void> {
    // Implementation of workflow archiving
    console.log(`Archiving workflow ${workflow.id}`);
  }

  private async getEmergencyContacts(userId: string): Promise<string[]> {
    // Implementation to fetch user's emergency contacts
    return [];
  }

  private async getCulturalConsiderations(userId: string): Promise<CulturalConsiderations | undefined> {
    // Implementation to fetch user's cultural considerations
    return undefined;
  }

  private async getAccessibilityNeeds(userId: string): Promise<AccessibilityNeeds | undefined> {
    // Implementation to fetch user's accessibility needs
    return undefined;
  }

  private initializeWorkflowTemplates(): void {
    // Initialize workflow templates for different scenarios
  }

  private startMetricsCollection(): void {
    // Start collecting metrics
  }
}

export const crisisInterventionWorkflowService = new CrisisInterventionWorkflowService();
