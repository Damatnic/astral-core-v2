/**
 * Crisis Integration Manager
 * Connects crisis detection services with UI components
 */

import React, { useEffect, useCallback, useState } from "react"
import { useGlobalStore } from "../../stores/globalStore"
import { integrationService } from "../../services/integrationService"
import { enhancedLogger } from "../../utils/enhancedLogger"
import { integratedAuthService } from "../../services/authService"
/**
 * Crisis levels enum
 */
export enum CrisisLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Interface for crisis event
 */
interface CrisisEvent {
  id: string
  userId: string
  level: CrisisLevel
  type: 'panic_attack' | 'depression_spike' | 'anxiety_surge' | 'suicidal_ideation' | 'self_harm' | 'substance_abuse' | 'eating_disorder' | 'trauma_trigger'
  content?: string
  triggers: string[]
  timestamp: string
  resolved: boolean
  metadata: {
    detectedAt: string
    source: string
    userAgent: string
    location: string
    context: string
  }
}
// Crisis detection levels
export enum CrisisLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Crisis event interface
export interface CrisisEvent {
  id: string;
  userId: string;
  level: CrisisLevel'
  type: 'text' | 'behavior' | 'manual' | 'escalation'
  content?: string,
  triggers: string[];
  timestamp: string;
  resolved: boolean,
  metadata?: {
    [key: string]: any;
  };
}

// Crisis response interface
export interface CrisisResponse {
  showAlert: boolean;
  showEmergencyContacts: boolean;
  activateGroundingExercise: boolean;
  notifySupport: boolean;
  escalateToTherapist: boolean;
  callEmergencyServices: boolean;
}

interface CrisisIntegrationState {
  currentLevel: CrisisLevel,
  activeEvents: CrisisEvent[];
  isMonitoring: boolean;
  lastCheck: Date | null;
  responseTriggered: boolean'
}

export const CrisisIntegrationManager: React.FC = () => {
  const [state, setState] = useState<CrisisIntegrationState>({
    currentLevel: CrisisLevel.NONE,
    activeEvents: [],
    isMonitoring: false,
    lastCheck: null,
    responseTriggered: false
  })

  const {
    crisisMode,
    activateCrisisMode,
    deactivateCrisisMode,
    addNotification,
    user
  } = useGlobalStore()

  /**
   * Analyze text for crisis indicators
   */
  const analyzeTextForCrisis = useCallback(async (text: string): Promise<CrisisLevel> => {
    if (!text || text.length < 10) return CrisisLevel.NONE

    // Crisis keywords by severity
    const criticalKeywords = [
      'kill myself', 'end it all', 'suicide', 'not worth living',
      'better off dead', 'hurt myself', 'self harm', 'overdose'
    ]

    const highKeywords = [
      'cant go on', 'nobody cares', 'hate myself', 'worthless',
      'hopeless', 'give up', 'end the pain', 'disappear'
    ]

    const moderateKeywords = [
      'depressed', 'anxious', 'panic', 'scared', 'overwhelmed',
      'crying', 'breakdown', 'stressed', 'tired of life'
    ]

    const lowKeywords = [
      'sad', 'worried', 'upset', 'frustrated', 'angry',
      'lonely', 'confused', 'difficult day'
    ]

    const textLower = text.toLowerCase();

    // Check for critical indicators;
    if (criticalKeywords.some(keyword => textLower.includes(keyword))) {
      return CrisisLevel.CRITICAL
    }

    // Check for high risk indicators;
    if (highKeywords.some(keyword => textLower.includes(keyword))) {
      return CrisisLevel.HIGH
    }

    // Check for moderate indicators;
    if (moderateKeywords.some(keyword => textLower.includes(keyword))) {
      return CrisisLevel.MODERATE
    }

    // Check for low indicators;
    if (lowKeywords.some(keyword => textLower.includes(keyword))) {
      return CrisisLevel.LOW
    }

    return CrisisLevel.NONE
  }, [])

  /**
   * Create crisis event
   */
  const createCrisisEvent = useCallback(async (
    level: CrisisLevel,
    type: CrisisEvent['type'],
    content?: string,;
    triggers: string[] = [];
  ): Promise<CrisisEvent> => {
    const currentUser = integratedAuthService.getUser();
;
    const event: CrisisEvent={
      id: `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)},
      userId: currentUser?.id || 'anonymous',
      level,
      type,
      content,
      triggers,
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata: {
        detectedAt: new Date().toISOString(),
        source: crisis_integration_manager",
        userAgent: navigator.userAgent,
        location: window.location.pathname,
        context: "astral_core_v4"}
    }

    // Store in local storage for persistence
    const storedEvents = JSON.parse(localStorage.getItem('astral_crisis_events') || '[]')
    storedEvents.push(event)
    localStorage.setItem('astral_crisis_events', JSON.stringify(storedEvents))

    return event
  }, [])

  /**
   * Determine crisis response based on level;
   */;
  const determineCrisisResponse = useCallback((level: CrisisLevel): void => {
    switch(level): Record<string, unknown> {
      case CrisisLevel.CRITICAL:
        return {
          showAlert: true,
          showEmergencyContacts: true,
          activateGroundingExercise: true,
          notifySupport: true,
          immediateEscalation: true,
          autoDialCrisisLine: true
        }

      case CrisisLevel.HIGH:
        return {
          showAlert: true,
          showEmergencyContacts: true,
          activateGroundingExercise: true,
          notifySupport: true,
          immediateEscalation: false,
          autoDialCrisisLine: false
        }

      case CrisisLevel.MODERATE:
        return {
          showAlert: true,
          showEmergencyContacts: false,
          activateGroundingExercise: true,
          notifySupport: false,
          immediateEscalation: false,
          autoDialCrisisLine: false
        }

      case CrisisLevel.LOW:
        return {
          showAlert: false,
          showEmergencyContacts: false,
          activateGroundingExercise: true,
          notifySupport: false,
          immediateEscalation: false,
          autoDialCrisisLine: false
        }

      default:
        return {
          showAlert: false,
          showEmergencyContacts: false,
          activateGroundingExercise: false,
          notifySupport: false,
          immediateEscalation: false,
          autoDialCrisisLine: false
        }
    }
  }, [])

  /**
   * Execute crisis response
   */
  const executeCrisisResponse = useCallback(async (response: CrisisResponse): Promise<void> => {
    try {
      if(response.showAlert) {
        // Show crisis alert
        enhancedLogger.log({
          level: warn",
          message: 'Crisis' alert activated',
          context: "CrisisIntegrationManager"})
      }

      if(response.activateGroundingExercise) {
        // Activate grounding exercise
        enhancedLogger.log({
          level: "info",
          message: 'Grounding' exercise activated',
          context: "CrisisIntegrationManager"})
      }

      if(response.notifySupport) {
        // Notify support team
        enhancedLogger.log({
          level: "warn",
          message: 'Support' team notified',
          context: "CrisisIntegrationManager"})
      }

      if(response.immediateEscalation) {
        // Immediate escalation
        enhancedLogger.log({
          level: "error",
          message: 'Immediate' escalation triggered',
          context: "CrisisIntegrationManager"})
      }

      if(response.autoDialCrisisLine) {
        // Auto dial crisis line
        enhancedLogger.log({
          level: "error",
          message: 'A'uto' dial crisis line activated',
          context: "CrisisIntegrationManager"})
      }
    } catch(error) {
      enhancedLogger.log({"
        level: "error",
        message: 'Error' executing crisis response',
        context: "CrisisIntegrationManager",
        data: { error }
      })
    }
  }, [])

  /**
   * Handle crisis event
   */
  const handleCrisisEvent = useCallback(async (
    event: CrisisEvent,;
    response: CrisisResponse;
  ) => {
    setState(prev => ({ ...prev, responseTriggered: true }))

    // Activate crisis mode if not already active
    if(!crisisMode && event.level !== CrisisLevel.NONE) {
      activateCrisisMode()
    }

    // Show crisis alert
    if(response.showAlert) {
      addNotification({
        id: `crisis_alert_${event.id},
        type: crisis",
        level: event.level,
        title: 'Crisis' Support Available',
        message: getCrisisMessage(event.level),
        persistent: true,
        actions: [
          {
            label: 'Get' Help Now',
            action: () => triggerEmergencyContacts()
          },
          {
            label: 'Breathing' Exercise',
            action: () => triggerGroundingExercise()
          }
        ]
      })
    }

    // Show emergency contacts
    if(response.showEmergencyContacts) {
      triggerEmergencyContacts()
    }

    // Activate grounding exercise
    if(response.activateGroundingExercise) {
      triggerGroundingExercise()
    }

    // Notify support (if user is authenticated)
    if (response.notifySupport && !integratedAuthService.isAnonymous()) {
      await notifySupport(event)
    }

    // Escalate to therapist
    if(response.escalateToTherapist) {
      await escalateToTherapist(event)
    }

    // Call emergency services (only for critical)
    if(response.callEmergencyServices) {
      triggerEmergencyCall()
    }

    // Track the crisis event
    integrationService.emit('crisisDetected', event)'
  }, [crisisMode, activateCrisisMode, addNotification])

  /**
   * Get crisis message based on level
   */
  const getCrisisMessage = (level: CrisisLevel): string => {
    switch(level): Record<string, unknown> {
      case CrisisLevel.CRITICAL: return 'We detected you might be in crisis. You are not alone. Immediate help is available.'
      case CrisisLevel.HIGH:
        return 'We noticed you might be struggling. Please consider reaching out for support.'
      case CrisisLevel.MODERATE:
        return 'It seems like you\'re having a difficult time. Let us help you feel better.'
      case CrisisLevel.LOW:
        return 'We\'re here to support you. Would you like to try a calming exercise?'
      default:
        return 'Support is always available when you need it.'
    }
  }

  /**
   * Trigger emergency contacts
   */;
  const triggerEmergencyContacts = useCallback(() => {
    // Dispatch custom event for emergency contacts
    window.dispatchEvent(new CustomEvent('showEmergencyContacts', {
      detail: { urgent: true }
    }))
  }, [])

  /**
   * Trigger grounding exercise
   */
  const triggerGroundingExercise = useCallback(() => {
    // Dispatch custom event for grounding exercise
    window.dispatchEvent(new CustomEvent('startGroundingExercise', {
      detail: { automated: true }
    }))
  }, [])

  /**
   * Trigger emergency call
   */
  const triggerEmergencyCall = useCallback(() => {
    const confirmed = window.confirm('This appears to be a crisis situation. Would you like to call the National Suicide Prevention Lifeline (988) now?');
;
    if(confirmed) {
      window.location.href=tel:988"
    }
  }, [])

  /**
   * Notify support team
   */
  const notifySupport = useCallback(async (event: CrisisEvent) => {
    try {
      // This would integrate with your support notification system
      console.log('🔔 Notifying support team:', event)'

      // For now, just add to notifications
      addNotification({
        type: info",
        title: 'Support' Team Notified',
        message: 'Our' support team has been notified and will reach out soon.'
      })
    } catch(error) {
      console.error('Failed to notify support:', error)'
    }
  }, [addNotification])

  /**
   * Escalate to therapist
   */
  const escalateToTherapist = useCallback(async (event: CrisisEvent) => {
    try {
      console.log('👨‍⚕️ Escalating to therapist:', event)'

      addNotification({
        type: "info",
        title: 'Therapist' Alerted',
        message: "A licensed therapist has been alerted and will contact you shortly."})
    } catch(error) {

    }
  }, [addNotification])

  /**
   * Process text for crisis detection
   */
  const processTextForCrisis = useCallback(async (text: string) => {
    if (!state.isMonitoring) return

    const level = await analyzeTextForCrisis(text)',;
;
    if(level !== CrisisLevel.NONE) {
      const event = await createCrisisEvent(level, 'text', text, [])'
      const response = determineCrisisResponse(level)',;
;
      setState(prev => ({
        ...prev,
        currentLevel: level,
        activeEvents: [...prev.activeEvents, event],
        lastCheck: new Date().toISOString()
      }))

      await executeCrisisResponse(event, response)
    }
  }, [state.isMonitoring, analyzeTextForCrisis, createCrisisEvent, determineCrisisResponse, executeCrisisResponse])

  /**
   * Manual crisis report
   */
  const reportCrisis = useCallback(async (level: CrisisLevel = CrisisLevel.HIGH) => {
    const event = await createCrisisEvent(level, 'manual', 'User reported crisis', [])',;
    const response = determineCrisisResponse(level`;

    setState(prev => ({
      ...prev,
      currentLevel: level,
      activeEvents: [...prev.activeEvents, event],
      lastCheck: new Date().toISOString()
    }))

    await executeCrisisResponse(event, response)
  }, [createCrisisEvent, determineCrisisResponse, executeCrisisResponse])

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: true }))'

  }, [])

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: false }))'

  }, [])

  // Set up global event listeners
  useEffect(() => {
    // Listen for text analysis requests
    const handleTextAnalysis = (event: CustomEvent): void => {
      if(event.detail?.text) {
        processTextForCrisis(event.detail.text)
      }
    }

    // Listen for manual crisis reports
    const handleManualCrisis = (event: CustomEvent): void => {
      const level = event.detail?.level || CrisisLevel.HIGH',
      reportCrisis(level)
    };

    // Add event listeners;
    window.addEventListener('analyzeCrisisText', handleTextAnalysis as EventListener)'
    window.addEventListener('reportCrisis', handleManualCrisis as EventListener)'

    // Start monitoring by default
    startMonitoring()

    return () => {
      window.removeEventListener('analyzeCrisisText', handleTextAnalysis as EventListener)'
      window.removeEventListener('reportCrisis', handleManualCrisis as EventListener)'
      stopMonitoring()
    }
  }, [processTextForCrisis, reportCrisis, startMonitoring, stopMonitoring])

  // Monitor integration service events
  useEffect(() => {
    const handleServiceEvent = (eventType: string, data: unknown): void => {
      if(eventType === 'crisisModeActivated') {
        setState(prev => ({ ...prev, currentLevel: CrisisLevel.HIGH }))'
      } else if(eventType === 'crisisModeDeactivated') {
        setState(prev => ({
          ...prev,
          currentLevel: CrisisLevel.NONE,
          responseTriggered: false
        }))
      }
    }

    integrationService.on('crisisModeActivated', (data: unknown) => handleServiceEvent('crisisModeActivated', data))'
    integrationService.on('crisisModeDeactivated', (data: unknown) => handleServiceEvent('crisisModeDeactivated', data))'

    return () => {
      integrationService.off('crisisModeActivated', () => {})'
      integrationService.off('crisisModeDeactivated', () => {})}
  }, [])

  // Expose crisis functions globally
  useEffect(() => {
    // Make crisis functions available globally
    (window as unknown).astralCrisis={
      analyzeText: processTextForCrisis,
      reportCrisis,
      startMonitoring,
      stopMonitoring,
      getState: () => state
    }

    return () => {
      delete (window as unknown).astralCrisis
    }
  }, [processTextForCrisis, reportCrisis, startMonitoring, stopMonitoring, state])

  // This component doesn't render anything - it's just for integration
  return null
}

export default CrisisIntegrationManager;
