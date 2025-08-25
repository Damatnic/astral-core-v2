/**
 * Peer Support Hook
 *
 * Comprehensive React hook for managing peer support connections,
 * matching, and communication within the mental health platform
 *
 * Features:
 * - Peer matching based on preferences and compatibility
 * - Real-time peer connection management
 * - Support session scheduling and tracking
 * - Peer availability and status management
 * - Anonymous and verified peer connections
 * - Crisis escalation for peer supporters
 * - Peer feedback and rating system
 * - Cultural and language matching
 *
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { peerSupportNetworkService } from '../services/peerSupportNetworkService';
import { realtimeService } from '../services/realtimeService';
import { logger } from '../utils/logger';

// Peer Profile Interface
interface PeerProfile {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  avatar?: string;
  bio?: string;
  languages: string[];
  timeZone: string;
  specializations: string[];
  experienceLevel: 'peer' | 'experienced' | 'mentor' | 'professional';
  availability: {
    status: 'available' | 'busy' | 'away' | 'offline';
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    nextAvailable?: Date;
  };
  preferences: {
    ageRange: [number, number];
    genderPreference?: 'any' | 'same' | 'different';
    culturalBackground?: string[];
    communicationStyle: 'text' | 'voice' | 'video' | 'any';
  };
  stats: {
    totalSessions: number;
    averageRating: number;
    responseTime: number; // minutes
    completionRate: number; // percentage
  };
  verificationStatus: {
    isVerified: boolean;
    verificationLevel: 'basic' | 'enhanced' | 'professional';
    badges: string[];
  };
}

// Peer Match Interface
interface PeerMatch {
  peer: PeerProfile;
  compatibilityScore: number;
  matchReasons: string[];
  estimatedWaitTime: number; // minutes
  isRecommended: boolean;
  lastActive: Date;
}

// Support Session Interface
interface SupportSession {
  id: string;
  peerId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  type: 'chat' | 'voice' | 'video' | 'crisis';
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  topic?: string;
  isAnonymous: boolean;
  metadata: {
    crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    language: string;
    followUpRequired: boolean;
  };
  feedback?: {
    rating: number;
    comment: string;
    helpfulnessScore: number;
  };
}

// Connection Request Interface
interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  type: 'immediate' | 'scheduled' | 'crisis';
  scheduledTime?: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

// Peer Support Configuration
interface PeerSupportConfig {
  enableRealTimeMatching: boolean;
  enableAnonymousMode: boolean;
  enableCrisisEscalation: boolean;
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
  matchingCriteria: {
    prioritizeLanguage: boolean;
    prioritizeTimeZone: boolean;
    prioritizeExperience: boolean;
    allowCrossGender: boolean;
    maxWaitTime: number; // minutes
  };
  notifications: {
    enableMatchNotifications: boolean;
    enableSessionReminders: boolean;
    enableFollowUpReminders: boolean;
  };
}

// Hook Return Type
interface UsePeerSupportReturn {
  // Current State
  currentUser: PeerProfile | null;
  availablePeers: PeerMatch[];
  activeSessions: SupportSession[];
  connectionRequests: ConnectionRequest[];
  
  // Status
  isLoading: boolean;
  isMatching: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  lastUpdate: Date | null;
  
  // Peer Discovery
  findPeers: (criteria?: Partial<PeerProfile['preferences']>) => Promise<PeerMatch[]>;
  refreshMatches: () => Promise<void>;
  
  // Connection Management
  sendConnectionRequest: (peerId: string, message?: string, type?: 'immediate' | 'scheduled') => Promise<string>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  declineConnectionRequest: (requestId: string, reason?: string) => Promise<void>;
  
  // Session Management
  startSession: (peerId: string, type: 'chat' | 'voice' | 'video') => Promise<string>;
  endSession: (sessionId: string) => Promise<void>;
  scheduleSession: (peerId: string, scheduledTime: Date, type: 'chat' | 'voice' | 'video') => Promise<string>;
  cancelSession: (sessionId: string, reason?: string) => Promise<void>;
  
  // Crisis Support
  requestCrisisSupport: (severity: 'low' | 'medium' | 'high' | 'critical') => Promise<string>;
  escalateToProfessional: (sessionId: string) => Promise<void>;
  
  // Profile Management
  updateProfile: (updates: Partial<PeerProfile>) => Promise<void>;
  updateAvailability: (status: PeerProfile['availability']['status']) => Promise<void>;
  setSchedule: (schedule: PeerProfile['availability']['schedule']) => Promise<void>;
  
  // Feedback & Rating
  submitFeedback: (sessionId: string, rating: number, comment: string, helpfulnessScore: number) => Promise<void>;
  reportPeer: (peerId: string, reason: string, details: string) => Promise<void>;
  
  // Utilities
  getSessionHistory: () => Promise<SupportSession[]>;
  exportData: () => string;
  clearData: () => void;
}

// Default Configuration
const DEFAULT_CONFIG: PeerSupportConfig = {
  enableRealTimeMatching: true,
  enableAnonymousMode: true,
  enableCrisisEscalation: true,
  maxConcurrentSessions: 3,
  sessionTimeoutMinutes: 60,
  matchingCriteria: {
    prioritizeLanguage: true,
    prioritizeTimeZone: true,
    prioritizeExperience: false,
    allowCrossGender: true,
    maxWaitTime: 15
  },
  notifications: {
    enableMatchNotifications: true,
    enableSessionReminders: true,
    enableFollowUpReminders: true
  }
};

/**
 * Peer Support Hook
 * 
 * @param config - Optional configuration for peer support
 * @returns Peer support state and utilities
 */
export function usePeerSupport(
  config: Partial<PeerSupportConfig> = {}
): UsePeerSupportReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [currentUser, setCurrentUser] = useState<PeerProfile | null>(null);
  const [availablePeers, setAvailablePeers] = useState<PeerMatch[]>([]);
  const [activeSessions, setActiveSessions] = useState<SupportSession[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Refs
  const realtimeSubscriptionRef = useRef<(() => void) | null>(null);
  const sessionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Initialize peer support
  const initializePeerSupport = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      // Load current user profile
      const profile = await peerSupportNetworkService.getCurrentUserProfile();
      setCurrentUser(profile);
      
      // Load active sessions
      const sessions = await peerSupportNetworkService.getActiveSessions();
      setActiveSessions(sessions);
      
      // Load pending connection requests
      const requests = await peerSupportNetworkService.getConnectionRequests();
      setConnectionRequests(requests);
      
      // Set up real-time subscriptions
      if (finalConfig.enableRealTimeMatching) {
        setupRealtimeSubscriptions();
      }
      
      setConnectionStatus('connected');
      setLastUpdate(new Date());
      
      logger.info('Peer support initialized', { userId: profile?.id });
    } catch (error) {
      logger.error('Failed to initialize peer support', { error });
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, [finalConfig.enableRealTimeMatching]);
  
  // Set up real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    try {
      const unsubscribe = realtimeService.subscribe('peer_support', {
        onPeerStatusChange: (peerId: string, status: PeerProfile['availability']['status']) => {
          setAvailablePeers(prev => 
            prev.map(match => 
              match.peer.id === peerId 
                ? { ...match, peer: { ...match.peer, availability: { ...match.peer.availability, status } } }
                : match
            )
          );
        },
        
        onConnectionRequest: (request: ConnectionRequest) => {
          setConnectionRequests(prev => [...prev, request]);
        },
        
        onSessionUpdate: (session: SupportSession) => {
          setActiveSessions(prev => {
            const existing = prev.find(s => s.id === session.id);
            if (existing) {
              return prev.map(s => s.id === session.id ? session : s);
            } else {
              return [...prev, session];
            }
          });
        },
        
        onCrisisAlert: (alert: any) => {
          // Handle crisis escalation
          logger.warn('Crisis alert received', { alert });
        }
      });
      
      realtimeSubscriptionRef.current = unsubscribe;
    } catch (error) {
      logger.error('Failed to set up real-time subscriptions', { error });
    }
  }, []);
  
  // Find Peers
  const findPeers = useCallback(async (criteria?: Partial<PeerProfile['preferences']>): Promise<PeerMatch[]> => {
    try {
      setIsMatching(true);
      
      const searchCriteria = {
        ...currentUser?.preferences,
        ...criteria
      };
      
      const matches = await peerSupportNetworkService.findMatches(searchCriteria, finalConfig.matchingCriteria);
      setAvailablePeers(matches);
      setLastUpdate(new Date());
      
      return matches;
    } catch (error) {
      logger.error('Failed to find peers', { error });
      return [];
    } finally {
      setIsMatching(false);
    }
  }, [currentUser, finalConfig.matchingCriteria]);
  
  // Refresh Matches
  const refreshMatches = useCallback(async () => {
    await findPeers();
  }, [findPeers]);
  
  // Send Connection Request
  const sendConnectionRequest = useCallback(async (
    peerId: string, 
    message?: string, 
    type: 'immediate' | 'scheduled' = 'immediate'
  ): Promise<string> => {
    try {
      const request = await peerSupportNetworkService.sendConnectionRequest({
        toUserId: peerId,
        message,
        type,
        expiresIn: finalConfig.matchingCriteria.maxWaitTime * 60 * 1000 // Convert to milliseconds
      });
      
      setConnectionRequests(prev => [...prev, request]);
      
      logger.info('Connection request sent', { peerId, type });
      return request.id;
    } catch (error) {
      logger.error('Failed to send connection request', { peerId, error });
      throw error;
    }
  }, [finalConfig.matchingCriteria.maxWaitTime]);
  
  // Accept Connection Request
  const acceptConnectionRequest = useCallback(async (requestId: string) => {
    try {
      await peerSupportNetworkService.acceptConnectionRequest(requestId);
      
      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' as const }
            : req
        )
      );
      
      logger.info('Connection request accepted', { requestId });
    } catch (error) {
      logger.error('Failed to accept connection request', { requestId, error });
      throw error;
    }
  }, []);
  
  // Decline Connection Request
  const declineConnectionRequest = useCallback(async (requestId: string, reason?: string) => {
    try {
      await peerSupportNetworkService.declineConnectionRequest(requestId, reason);
      
      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'declined' as const }
            : req
        )
      );
      
      logger.info('Connection request declined', { requestId, reason });
    } catch (error) {
      logger.error('Failed to decline connection request', { requestId, error });
      throw error;
    }
  }, []);
  
  // Start Session
  const startSession = useCallback(async (
    peerId: string, 
    type: 'chat' | 'voice' | 'video'
  ): Promise<string> => {
    try {
      const session = await peerSupportNetworkService.startSession({
        peerId,
        type,
        isAnonymous: currentUser?.isAnonymous || false
      });
      
      setActiveSessions(prev => [...prev, session]);
      
      // Set up session timeout
      const timeoutId = setTimeout(() => {
        endSession(session.id);
      }, finalConfig.sessionTimeoutMinutes * 60 * 1000);
      
      sessionTimeoutsRef.current.set(session.id, timeoutId);
      
      logger.info('Session started', { sessionId: session.id, peerId, type });
      return session.id;
    } catch (error) {
      logger.error('Failed to start session', { peerId, type, error });
      throw error;
    }
  }, [currentUser, finalConfig.sessionTimeoutMinutes]);
  
  // End Session
  const endSession = useCallback(async (sessionId: string) => {
    try {
      await peerSupportNetworkService.endSession(sessionId);
      
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Clear timeout
      const timeoutId = sessionTimeoutsRef.current.get(sessionId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        sessionTimeoutsRef.current.delete(sessionId);
      }
      
      logger.info('Session ended', { sessionId });
    } catch (error) {
      logger.error('Failed to end session', { sessionId, error });
      throw error;
    }
  }, []);
  
  // Schedule Session
  const scheduleSession = useCallback(async (
    peerId: string, 
    scheduledTime: Date, 
    type: 'chat' | 'voice' | 'video'
  ): Promise<string> => {
    try {
      const session = await peerSupportNetworkService.scheduleSession({
        peerId,
        scheduledTime,
        type,
        isAnonymous: currentUser?.isAnonymous || false
      });
      
      logger.info('Session scheduled', { sessionId: session.id, peerId, scheduledTime, type });
      return session.id;
    } catch (error) {
      logger.error('Failed to schedule session', { peerId, scheduledTime, type, error });
      throw error;
    }
  }, [currentUser]);
  
  // Cancel Session
  const cancelSession = useCallback(async (sessionId: string, reason?: string) => {
    try {
      await peerSupportNetworkService.cancelSession(sessionId, reason);
      
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Clear timeout
      const timeoutId = sessionTimeoutsRef.current.get(sessionId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        sessionTimeoutsRef.current.delete(sessionId);
      }
      
      logger.info('Session cancelled', { sessionId, reason });
    } catch (error) {
      logger.error('Failed to cancel session', { sessionId, error });
      throw error;
    }
  }, []);
  
  // Request Crisis Support
  const requestCrisisSupport = useCallback(async (
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<string> => {
    try {
      const session = await peerSupportNetworkService.requestCrisisSupport({
        severity,
        isAnonymous: currentUser?.isAnonymous || false,
        urgentMatching: severity === 'critical'
      });
      
      setActiveSessions(prev => [...prev, session]);
      
      logger.warn('Crisis support requested', { sessionId: session.id, severity });
      return session.id;
    } catch (error) {
      logger.error('Failed to request crisis support', { severity, error });
      throw error;
    }
  }, [currentUser]);
  
  // Escalate to Professional
  const escalateToProfessional = useCallback(async (sessionId: string) => {
    try {
      await peerSupportNetworkService.escalateToProfessional(sessionId);
      
      setActiveSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, type: 'crisis' as const, metadata: { ...session.metadata, crisisLevel: 'critical' } }
            : session
        )
      );
      
      logger.warn('Session escalated to professional', { sessionId });
    } catch (error) {
      logger.error('Failed to escalate to professional', { sessionId, error });
      throw error;
    }
  }, []);
  
  // Update Profile
  const updateProfile = useCallback(async (updates: Partial<PeerProfile>) => {
    try {
      const updatedProfile = await peerSupportNetworkService.updateProfile(updates);
      setCurrentUser(updatedProfile);
      
      logger.info('Profile updated', { updates });
    } catch (error) {
      logger.error('Failed to update profile', { updates, error });
      throw error;
    }
  }, []);
  
  // Update Availability
  const updateAvailability = useCallback(async (status: PeerProfile['availability']['status']) => {
    try {
      await peerSupportNetworkService.updateAvailability(status);
      
      setCurrentUser(prev => prev ? {
        ...prev,
        availability: { ...prev.availability, status }
      } : null);
      
      logger.info('Availability updated', { status });
    } catch (error) {
      logger.error('Failed to update availability', { status, error });
      throw error;
    }
  }, []);
  
  // Set Schedule
  const setSchedule = useCallback(async (schedule: PeerProfile['availability']['schedule']) => {
    try {
      await peerSupportNetworkService.setSchedule(schedule);
      
      setCurrentUser(prev => prev ? {
        ...prev,
        availability: { ...prev.availability, schedule }
      } : null);
      
      logger.info('Schedule updated', { schedule });
    } catch (error) {
      logger.error('Failed to set schedule', { schedule, error });
      throw error;
    }
  }, []);
  
  // Submit Feedback
  const submitFeedback = useCallback(async (
    sessionId: string, 
    rating: number, 
    comment: string, 
    helpfulnessScore: number
  ) => {
    try {
      await peerSupportNetworkService.submitFeedback(sessionId, {
        rating,
        comment,
        helpfulnessScore
      });
      
      setActiveSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, feedback: { rating, comment, helpfulnessScore } }
            : session
        )
      );
      
      logger.info('Feedback submitted', { sessionId, rating, helpfulnessScore });
    } catch (error) {
      logger.error('Failed to submit feedback', { sessionId, error });
      throw error;
    }
  }, []);
  
  // Report Peer
  const reportPeer = useCallback(async (peerId: string, reason: string, details: string) => {
    try {
      await peerSupportNetworkService.reportPeer(peerId, { reason, details });
      
      logger.warn('Peer reported', { peerId, reason });
    } catch (error) {
      logger.error('Failed to report peer', { peerId, reason, error });
      throw error;
    }
  }, []);
  
  // Get Session History
  const getSessionHistory = useCallback(async (): Promise<SupportSession[]> => {
    try {
      return await peerSupportNetworkService.getSessionHistory();
    } catch (error) {
      logger.error('Failed to get session history', { error });
      return [];
    }
  }, []);
  
  // Export Data
  const exportData = useCallback((): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentUser: currentUser ? { ...currentUser, id: '[REDACTED]' } : null,
      activeSessions: activeSessions.map(session => ({
        ...session,
        peerId: '[REDACTED]'
      })),
      connectionRequests: connectionRequests.map(request => ({
        ...request,
        fromUserId: '[REDACTED]',
        toUserId: '[REDACTED]'
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [currentUser, activeSessions, connectionRequests]);
  
  // Clear Data
  const clearData = useCallback(() => {
    setAvailablePeers([]);
    setActiveSessions([]);
    setConnectionRequests([]);
    setLastUpdate(null);
    
    // Clear all session timeouts
    sessionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    sessionTimeoutsRef.current.clear();
    
    logger.info('Peer support data cleared');
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initializePeerSupport();
    
    return () => {
      // Cleanup subscriptions
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current();
      }
      
      // Clear timeouts
      sessionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      sessionTimeoutsRef.current.clear();
    };
  }, [initializePeerSupport]);
  
  // Auto-refresh matches periodically
  useEffect(() => {
    if (!finalConfig.enableRealTimeMatching) return;
    
    const interval = setInterval(refreshMatches, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [finalConfig.enableRealTimeMatching, refreshMatches]);
  
  return {
    // Current State
    currentUser,
    availablePeers,
    activeSessions,
    connectionRequests,
    
    // Status
    isLoading,
    isMatching,
    connectionStatus,
    lastUpdate,
    
    // Peer Discovery
    findPeers,
    refreshMatches,
    
    // Connection Management
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    
    // Session Management
    startSession,
    endSession,
    scheduleSession,
    cancelSession,
    
    // Crisis Support
    requestCrisisSupport,
    escalateToProfessional,
    
    // Profile Management
    updateProfile,
    updateAvailability,
    setSchedule,
    
    // Feedback & Rating
    submitFeedback,
    reportPeer,
    
    // Utilities
    getSessionHistory,
    exportData,
    clearData
  };
}

export type { 
  UsePeerSupportReturn, 
  PeerProfile, 
  PeerMatch, 
  SupportSession, 
  ConnectionRequest,
  PeerSupportConfig 
};
