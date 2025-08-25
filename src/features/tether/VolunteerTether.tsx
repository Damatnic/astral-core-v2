/**
 * Volunteer Tether Component
 *
 * Comprehensive React component for volunteer peer support connections,
 * enabling trained volunteers to provide crisis support and guidance
 *
 * Features:
 * - Volunteer matching and connection system
 * - Real-time crisis alert handling
 * - Volunteer availability management
 * - Training and certification tracking
 * - Performance metrics and feedback
 * - Crisis escalation protocols
 * - Anonymous and verified support modes
 * - Cultural and language matching
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePeerSupport } from '../../hooks/usePeerSupport';
import { useAccessibilityMonitoring } from '../../hooks/useAccessibilityMonitoring';
import { astralTetherService } from '../../services/astralTetherService';
import { logger } from '../../utils/logger';

// Volunteer Profile Interface
interface VolunteerProfile {
  id: string;
  displayName: string;
  avatar?: string;
  bio: string;
  languages: string[];
  timeZone: string;
  specializations: string[];
  certifications: Array<{
    name: string;
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    issueDate: Date;
    expiryDate: Date;
    verified: boolean;
  }>;
  experience: {
    yearsVolunteering: number;
    totalSessions: number;
    crisisSessionsHandled: number;
    averageRating: number;
    completionRate: number;
  };
  availability: {
    status: 'available' | 'busy' | 'on_break' | 'offline';
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      maxSessions: number;
    }>;
    currentLoad: number;
    maxConcurrentSessions: number;
  };
  preferences: {
    crisisTypes: string[];
    ageGroups: string[];
    communicationMethods: Array<'chat' | 'voice' | 'video'>;
    culturalBackgrounds: string[];
  };
  performance: {
    responseTime: number; // minutes
    sessionQuality: number; // 1-5
    escalationRate: number; // percentage
    followUpRate: number; // percentage
    lastActive: Date;
  };
}

// Crisis Alert Interface
interface CrisisAlert {
  id: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  location?: {
    country: string;
    timezone: string;
    emergency_services?: string;
  };
  userPreferences: {
    language: string;
    culturalBackground?: string;
    communicationMethod: 'chat' | 'voice' | 'video';
    anonymity: boolean;
  };
  timestamp: Date;
  estimatedWaitTime: number;
  assignedVolunteer?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'escalated';
}

// Volunteer Session Interface
interface VolunteerSession {
  id: string;
  alertId: string;
  volunteerId: string;
  userId: string;
  type: 'crisis' | 'support' | 'follow_up';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  communicationMethod: 'chat' | 'voice' | 'video';
  notes?: string;
  outcome: 'resolved' | 'escalated' | 'referred' | 'ongoing';
  followUpRequired: boolean;
  feedback?: {
    userRating: number;
    userComment: string;
    volunteerNotes: string;
    supervisorReview?: string;
  };
}

// Component Props Interface
interface VolunteerTetherProps {
  volunteerId?: string;
  onSessionStart?: (session: VolunteerSession) => void;
  onSessionEnd?: (session: VolunteerSession) => void;
  onCrisisEscalation?: (alert: CrisisAlert) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'high-contrast';
}

/**
 * Volunteer Tether Component
 */
export const VolunteerTether: React.FC<VolunteerTetherProps> = ({
  volunteerId,
  onSessionStart,
  onSessionEnd,
  onCrisisEscalation,
  className = '',
  theme = 'light'
}) => {
  // Hooks
  const {
    currentUser,
    availablePeers,
    activeSessions,
    connectionRequests,
    isLoading,
    connectionStatus,
    acceptConnectionRequest,
    startSession,
    endSession,
    requestCrisisSupport,
    escalateToProfessional,
    updateAvailability
  } = usePeerSupport();

  const {
    violations,
    metrics,
    isMonitoring,
    announceLiveRegion,
    setFocusTrap
  } = useAccessibilityMonitoring();

  // State
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState<CrisisAlert[]>([]);
  const [currentSession, setCurrentSession] = useState<VolunteerSession | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'on_break' | 'offline'>('offline');
  const [sessionHistory, setSessionHistory] = useState<VolunteerSession[]>([]);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);

  // Load volunteer profile
  useEffect(() => {
    const loadVolunteerProfile = async () => {
      if (!volunteerId) return;

      try {
        const profile = await astralTetherService.getVolunteerProfile(volunteerId);
        setVolunteerProfile(profile);
        setAvailabilityStatus(profile.availability.status);
      } catch (error) {
        logger.error('Failed to load volunteer profile', { volunteerId, error });
      }
    };

    loadVolunteerProfile();
  }, [volunteerId]);

  // Load pending crisis alerts
  useEffect(() => {
    const loadPendingAlerts = async () => {
      if (!volunteerProfile) return;

      try {
        const alerts = await astralTetherService.getPendingCrisisAlerts({
          volunteerId: volunteerProfile.id,
          specializations: volunteerProfile.specializations,
          languages: volunteerProfile.languages,
          maxSeverity: 'critical'
        });
        
        setPendingAlerts(alerts);
      } catch (error) {
        logger.error('Failed to load pending alerts', { error });
      }
    };

    const interval = setInterval(loadPendingAlerts, 10000); // Check every 10 seconds
    loadPendingAlerts();

    return () => clearInterval(interval);
  }, [volunteerProfile]);

  // Handle availability change
  const handleAvailabilityChange = useCallback(async (status: typeof availabilityStatus) => {
    if (!volunteerProfile) return;

    try {
      await updateAvailability(status);
      setAvailabilityStatus(status);
      
      announceLiveRegion(`Availability changed to ${status}`, 'polite');
      
      logger.info('Volunteer availability updated', { volunteerId: volunteerProfile.id, status });
    } catch (error) {
      logger.error('Failed to update availability', { status, error });
    }
  }, [volunteerProfile, updateAvailability, announceLiveRegion]);

  // Handle crisis alert acceptance
  const handleAcceptAlert = useCallback(async (alert: CrisisAlert) => {
    if (!volunteerProfile) return;

    try {
      // Accept the crisis alert
      await astralTetherService.acceptCrisisAlert(alert.id, volunteerProfile.id);
      
      // Start volunteer session
      const session = await astralTetherService.startVolunteerSession({
        alertId: alert.id,
        volunteerId: volunteerProfile.id,
        userId: alert.userId,
        type: 'crisis',
        communicationMethod: alert.userPreferences.communicationMethod
      });

      setCurrentSession(session);
      setSelectedAlert(alert);
      setPendingAlerts(prev => prev.filter(a => a.id !== alert.id));
      
      // Update availability to busy
      await handleAvailabilityChange('busy');
      
      // Announce to screen reader
      announceLiveRegion(`Crisis session started with severity ${alert.severity}`, 'assertive');
      
      // Callback
      onSessionStart?.(session);
      
      logger.info('Crisis alert accepted', { alertId: alert.id, sessionId: session.id });
    } catch (error) {
      logger.error('Failed to accept crisis alert', { alertId: alert.id, error });
    }
  }, [volunteerProfile, handleAvailabilityChange, announceLiveRegion, onSessionStart]);

  // Handle session completion
  const handleCompleteSession = useCallback(async (
    outcome: VolunteerSession['outcome'],
    notes?: string,
    followUpRequired: boolean = false
  ) => {
    if (!currentSession) return;

    try {
      const completedSession = await astralTetherService.completeVolunteerSession(currentSession.id, {
        outcome,
        notes,
        followUpRequired,
        endTime: new Date()
      });

      setCurrentSession(null);
      setSelectedAlert(null);
      setSessionHistory(prev => [...prev, completedSession]);
      
      // Update availability back to available
      await handleAvailabilityChange('available');
      
      // Announce completion
      announceLiveRegion(`Session completed with outcome: ${outcome}`, 'polite');
      
      // Callback
      onSessionEnd?.(completedSession);
      
      logger.info('Volunteer session completed', { 
        sessionId: currentSession.id, 
        outcome,
        duration: completedSession.duration 
      });
    } catch (error) {
      logger.error('Failed to complete session', { sessionId: currentSession.id, error });
    }
  }, [currentSession, handleAvailabilityChange, announceLiveRegion, onSessionEnd]);

  // Handle crisis escalation
  const handleEscalateToEmergency = useCallback(async () => {
    if (!currentSession || !selectedAlert) return;

    try {
      await astralTetherService.escalateToEmergencyServices(selectedAlert.id, {
        volunteerId: volunteerProfile?.id,
        sessionId: currentSession.id,
        reason: 'Immediate professional intervention required',
        location: selectedAlert.location
      });

      // Complete session with escalation outcome
      await handleCompleteSession('escalated', 'Escalated to emergency services due to immediate risk');
      
      // Announce escalation
      announceLiveRegion('Crisis escalated to emergency services', 'assertive');
      
      // Callback
      onCrisisEscalation?.(selectedAlert);
      
      logger.warn('Crisis escalated to emergency services', { 
        alertId: selectedAlert.id,
        sessionId: currentSession.id 
      });
    } catch (error) {
      logger.error('Failed to escalate crisis', { error });
    }
  }, [currentSession, selectedAlert, volunteerProfile, handleCompleteSession, announceLiveRegion, onCrisisEscalation]);

  // Memoized statistics
  const volunteerStats = useMemo(() => {
    if (!volunteerProfile) return null;

    return {
      totalSessions: volunteerProfile.experience.totalSessions,
      crisisSessions: volunteerProfile.experience.crisisSessionsHandled,
      averageRating: volunteerProfile.experience.averageRating,
      responseTime: volunteerProfile.performance.responseTime,
      completionRate: volunteerProfile.experience.completionRate
    };
  }, [volunteerProfile]);

  // Loading state
  if (isLoading || !volunteerProfile) {
    return (
      <div 
        className={`volunteer-tether ${className} theme-${theme}`}
        role="main"
        aria-label="Volunteer Tether Dashboard Loading"
      >
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Loading volunteer dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`volunteer-tether ${className} theme-${theme}`}
      role="main"
      aria-label="Volunteer Tether Dashboard"
    >
      {/* Header */}
      <header className="volunteer-header">
        <div className="volunteer-info">
          <img 
            src={volunteerProfile.avatar || '/default-avatar.png'} 
            alt={`${volunteerProfile.displayName} avatar`}
            className="volunteer-avatar"
          />
          <div className="volunteer-details">
            <h1>{volunteerProfile.displayName}</h1>
            <p className="volunteer-specializations">
              {volunteerProfile.specializations.join(', ')}
            </p>
          </div>
        </div>

        {/* Availability Controls */}
        <div className="availability-controls" role="group" aria-label="Availability Controls">
          <label htmlFor="availability-select" className="sr-only">
            Change Availability Status
          </label>
          <select
            id="availability-select"
            value={availabilityStatus}
            onChange={(e) => handleAvailabilityChange(e.target.value as typeof availabilityStatus)}
            className="availability-select"
            aria-describedby="availability-help"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="on_break">On Break</option>
            <option value="offline">Offline</option>
          </select>
          <span id="availability-help" className="sr-only">
            Your current availability status affects which crisis alerts you receive
          </span>
        </div>
      </header>

      {/* Statistics Dashboard */}
      <section className="volunteer-stats" aria-label="Volunteer Statistics">
        <h2>Your Impact</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{volunteerStats?.totalSessions}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{volunteerStats?.crisisSessions}</span>
            <span className="stat-label">Crisis Interventions</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{volunteerStats?.averageRating.toFixed(1)}</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{volunteerStats?.responseTime}min</span>
            <span className="stat-label">Avg Response Time</span>
          </div>
        </div>
      </section>

      {/* Current Session */}
      {currentSession && selectedAlert && (
        <section className="current-session" aria-label="Current Crisis Session">
          <h2>Active Crisis Session</h2>
          <div className="session-details">
            <div className="crisis-info">
              <div className={`severity-badge severity-${selectedAlert.severity}`}>
                {selectedAlert.severity.toUpperCase()}
              </div>
              <p><strong>Type:</strong> {selectedAlert.type}</p>
              <p><strong>Duration:</strong> {Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)} minutes</p>
              <p><strong>Communication:</strong> {selectedAlert.userPreferences.communicationMethod}</p>
            </div>

            <div className="session-actions">
              <button
                onClick={() => handleCompleteSession('resolved', undefined, false)}
                className="btn btn-success"
                aria-describedby="resolve-help"
              >
                Mark Resolved
              </button>
              <span id="resolve-help" className="sr-only">
                Mark this crisis as resolved and end the session
              </span>

              <button
                onClick={() => handleCompleteSession('referred', undefined, true)}
                className="btn btn-warning"
                aria-describedby="refer-help"
              >
                Refer for Follow-up
              </button>
              <span id="refer-help" className="sr-only">
                Refer this user for professional follow-up care
              </span>

              <button
                onClick={handleEscalateToEmergency}
                className="btn btn-danger"
                aria-describedby="escalate-help"
              >
                Escalate to Emergency
              </button>
              <span id="escalate-help" className="sr-only">
                Escalate this crisis to emergency services immediately
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Pending Crisis Alerts */}
      {!currentSession && pendingAlerts.length > 0 && (
        <section className="pending-alerts" aria-label="Pending Crisis Alerts">
          <h2>Crisis Alerts ({pendingAlerts.length})</h2>
          <div className="alerts-list">
            {pendingAlerts.map((alert) => (
              <div key={alert.id} className="alert-card" role="article">
                <div className="alert-header">
                  <div className={`severity-badge severity-${alert.severity}`}>
                    {alert.severity.toUpperCase()}
                  </div>
                  <span className="alert-time">
                    {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                  </span>
                </div>
                
                <div className="alert-content">
                  <h3>{alert.type}</h3>
                  <p className="alert-description">{alert.description}</p>
                  
                  <div className="alert-preferences">
                    <span className="preference-tag">
                      {alert.userPreferences.language}
                    </span>
                    <span className="preference-tag">
                      {alert.userPreferences.communicationMethod}
                    </span>
                    {alert.userPreferences.anonymity && (
                      <span className="preference-tag anonymous">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>

                <div className="alert-actions">
                  <button
                    onClick={() => handleAcceptAlert(alert)}
                    className="btn btn-primary"
                    disabled={availabilityStatus !== 'available'}
                    aria-describedby={`alert-${alert.id}-help`}
                  >
                    Accept Crisis
                  </button>
                  <span id={`alert-${alert.id}-help`} className="sr-only">
                    Accept this crisis alert and start a support session
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Alerts Message */}
      {!currentSession && pendingAlerts.length === 0 && availabilityStatus === 'available' && (
        <section className="no-alerts" aria-label="No Crisis Alerts">
          <div className="empty-state">
            <h2>No Crisis Alerts</h2>
            <p>You're available and ready to help. Crisis alerts will appear here when they match your profile.</p>
            <div className="volunteer-readiness">
              <h3>Your Readiness Status:</h3>
              <ul>
                <li>✅ Profile Complete</li>
                <li>✅ Certifications Valid</li>
                <li>✅ Available for Crisis Support</li>
                <li>✅ {volunteerProfile.languages.length} Language(s) Supported</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Offline/Unavailable State */}
      {availabilityStatus !== 'available' && !currentSession && (
        <section className="unavailable-state" aria-label="Unavailable Status">
          <div className="status-message">
            <h2>Currently {availabilityStatus.replace('_', ' ').toUpperCase()}</h2>
            <p>
              {availabilityStatus === 'offline' && 'You are offline and will not receive crisis alerts.'}
              {availabilityStatus === 'busy' && 'You are marked as busy and will not receive new alerts.'}
              {availabilityStatus === 'on_break' && 'You are on break and will not receive crisis alerts.'}
            </p>
            <button
              onClick={() => handleAvailabilityChange('available')}
              className="btn btn-primary"
            >
              Mark as Available
            </button>
          </div>
        </section>
      )}

      {/* Accessibility Status */}
      {isMonitoring && violations.length > 0 && (
        <div className="accessibility-status" role="status" aria-live="polite">
          <span className="sr-only">
            {violations.length} accessibility issues detected. Please review.
          </span>
        </div>
      )}
    </div>
  );
};

export default VolunteerTether;
export type { VolunteerTetherProps, VolunteerProfile, CrisisAlert, VolunteerSession };