/**
 * Crisis Detection and Escalation Integration Service
 * 
 * Provides a unified interface for components to perform crisis detection
 * with automatic escalation workflow integration for severe cases.
 */

import { aiServiceManager } from './optimizedAIService';

export interface CrisisAnalysisOptions {
  userId?: string;
  conversationId?: string;
  sessionData?: {
    messagesSent?: number;
    sessionDuration?: number;
    previousEscalations?: number;
    riskTrend?: 'increasing' | 'stable' | 'decreasing';
  };
  userContext?: {
    languageCode?: string;
    culturalContext?: string;
    accessibilityNeeds?: string[];
    preferredContactMethod?: 'phone' | 'text' | 'chat' | 'video';
    timeZone?: string;
    location?: {
      country: string;
      region?: string;
      hasGeolocation: boolean;
    };
  };
}

export interface CrisisAnalysisResult {
  isCrisis: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
  comparative: number;
  escalationRequired: boolean;
  emergencyServicesRequired: boolean;
  interventionRecommendations?: unknown[];
  escalationResponse?: any;
  riskAssessment?: any;
  enhanced: boolean;
  error?: string;
}

export class CrisisDetectionIntegrationService {
  /**
   * Analyze text for crisis indicators with automatic escalation
   */
  async analyzeTextForCrisis(
    text: string, 
    options: CrisisAnalysisOptions = {}
  ): Promise<CrisisAnalysisResult> {
    try {
      // Get crisis detection service
      const crisisService = await aiServiceManager.getCrisisDetectionService();
      
      // Prepare user context for analysis and potential escalation
      const userContext = {
        userId: options.userId || 'anonymous',
        conversationId: options.conversationId || `chat-${Date.now()}`,
        messagesSent: options.sessionData?.messagesSent || 1,
        sessionDuration: options.sessionData?.sessionDuration || 0,
        previousEscalations: options.sessionData?.previousEscalations || 0,
        riskTrend: options.sessionData?.riskTrend || 'stable',
        languageCode: options.userContext?.languageCode || 'en',
        culturalContext: options.userContext?.culturalContext,
        accessibilityNeeds: options.userContext?.accessibilityNeeds || [],
        preferredContactMethod: options.userContext?.preferredContactMethod || 'chat',
        timeZone: options.userContext?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: options.userContext?.location
      };

      // Perform crisis analysis with escalation integration
      const result = await crisisService.analyze(text, userContext);
      
      return {
        isCrisis: result.isCrisis,
        severity: result.severity,
        score: result.score,
        comparative: result.comparative,
        escalationRequired: result.escalationRequired || false,
        emergencyServicesRequired: result.emergencyServicesRequired || false,
        interventionRecommendations: result.interventionRecommendations,
        escalationResponse: result.escalationResponse,
        riskAssessment: result.riskAssessment,
        enhanced: result.enhanced,
        error: result.error
      };
    } catch (error) {
      console.error('Crisis detection analysis failed:', error);
      return {
        isCrisis: false,
        severity: 'none',
        score: 0,
        comparative: 0,
        escalationRequired: false,
        emergencyServicesRequired: false,
        enhanced: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Analyze messages in a conversation for crisis patterns
   */
  async analyzeConversationForCrisis(
    messages: string[], 
    options: CrisisAnalysisOptions = {}
  ): Promise<CrisisAnalysisResult[]> {
    const results: CrisisAnalysisResult[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const sessionData = {
        ...options.sessionData,
        messagesSent: i + 1,
        sessionDuration: options.sessionData?.sessionDuration || (i * 30000) // Estimate 30s per message
      };
      
      const result = await this.analyzeTextForCrisis(messages[i], {
        ...options,
        sessionData
      });
      
      results.push(result);
      
      // If crisis escalation was triggered, we should probably stop analyzing
      if (result.escalationRequired && result.escalationResponse) {
        console.log('Crisis escalation triggered, stopping analysis');
        break;
      }
    }
    
    return results;
  }

  /**
   * Check if user is in crisis state and needs immediate attention
   */
  async checkUserCrisisState(
    userId: string,
    recentMessages: string[],
    options: Omit<CrisisAnalysisOptions, 'userId'> = {}
  ): Promise<{
    isInCrisis: boolean;
    highestSeverity: string;
    escalationTriggered: boolean;
    recommendedActions: string[];
  }> {
    const results = await this.analyzeConversationForCrisis(recentMessages, {
      ...options,
      userId
    });
    
    const crisisResults = results.filter(r => r.isCrisis);
    const escalationTriggered = results.some(r => r.escalationRequired && r.escalationResponse);
    
    // Determine highest severity
    const severityLevels = ['none', 'low', 'medium', 'high', 'critical'];
    const highestSeverity = crisisResults.reduce((highest, result) => {
      const currentIndex = severityLevels.indexOf(result.severity);
      const highestIndex = severityLevels.indexOf(highest);
      return currentIndex > highestIndex ? result.severity : highest;
    }, 'none');
    
    // Collect recommended actions
    const recommendedActions = crisisResults
      .flatMap(r => r.interventionRecommendations || [])
      .map(rec => {
        // Type guard for recommendation object
        if (typeof rec === 'object' && rec !== null) {
          const recObj = rec as any;
          return recObj.action || recObj.description || String(rec);
        }
        return String(rec);
      })
      .filter((action, index, array) => array.indexOf(action) === index); // Remove duplicates
    
    return {
      isInCrisis: crisisResults.length > 0,
      highestSeverity,
      escalationTriggered,
      recommendedActions
    };
  }

  /**
   * Process emergency escalation for safety plan events
   */
  async processEmergencyEscalation(
    userId: string,
    severity: 'high' | 'critical',
    message: string,
    context: { source: string; [key: string]: any }
  ): Promise<void> {
    try {
      // Create emergency escalation event
      const escalationData = {
        userId,
        severity,
        message,
        source: context.source,
        timestamp: new Date(),
        context
      };

      // Log the escalation
      console.log('Emergency escalation triggered:', escalationData);

      // Here you would typically integrate with:
      // - Emergency notification systems
      // - Crisis hotlines
      // - Emergency contacts
      // - Healthcare providers
      
      // For now, just log the escalation
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to process emergency escalation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const crisisDetectionIntegrationService = new CrisisDetectionIntegrationService();
export default crisisDetectionIntegrationService;
