/**
 * React Hook for Peer Support Network
 * 
 * Provides easy access to peer support functionality including
 * peer matching, session management, and community features.
 * 
 * @license Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { peerSupportNetworkService } from '../services/peerSupportNetworkService';
import type { 
  PeerProfile, 
  PeerMatch, 
  PeerSupportRequest, 
  PeerSupportSession,
  CommunityGroup
} from '../services/peerSupportNetworkService';

export interface UsePeerSupportReturn {
  // Peer Management
  registerAsPeer: (peerData: Omit<PeerProfile, 'id' | 'anonymizedId' | 'safetyRating' | 'totalSupportSessions' | 'averageRating' | 'lastActive' | 'culturalSensitivityScore'>) => Promise<string | null>;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => void;
  
  // Support Seeking
  findPeerSupport: (request: PeerSupportRequest) => Promise<PeerMatch[]>;
  createSupportSession: (requestId: string, supporterId: string) => Promise<string | null>;
  completeSupportSession: (sessionId: string, feedback: {
    seekerRating?: number;
    supporterRating?: number;
    finalRiskLevel: number;
    followUpNeeded: boolean;
  }) => Promise<void>;
  
  // Community Features
  getCommunityGroups: (language: string, culturalContext?: string) => CommunityGroup[];
  joinCommunityGroup: (groupId: string) => Promise<boolean>;
  
  // Data and State
  peerMatches: PeerMatch[];
  activeSessions: PeerSupportSession[];
  communityGroups: CommunityGroup[];
  peerStatistics: any;
  
  // Loading States
  isLoading: boolean;
  isRegistering: boolean;
  isFindingMatches: boolean;
  error: string | null;
  
  // Actions
  refreshMatches: () => Promise<void>;
  refreshStatistics: () => void;
}

export const usePeerSupport = (userToken: string, language: string): UsePeerSupportReturn => {
  const [peerMatches, setPeerMatches] = useState<PeerMatch[]>([]);
  const [activeSessions, setActiveSessions] = useState<PeerSupportSession[]>([]);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [peerStatistics, setPeerStatistics] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register current user as a peer supporter
   */
  const registerAsPeer = useCallback(async (peerData: Omit<PeerProfile, 'id' | 'anonymizedId' | 'safetyRating' | 'totalSupportSessions' | 'averageRating' | 'lastActive' | 'culturalSensitivityScore'>): Promise<string | null> => {
    try {
      setIsRegistering(true);
      setError(null);
      
      const peerId = await peerSupportNetworkService.registerPeerSupporter({
        ...peerData,
        userToken
      });
      
      return peerId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register as peer supporter');
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [userToken]);

  /**
   * Update peer availability status
   */
  const updateAvailability = useCallback((status: 'available' | 'busy' | 'offline') => {
    // Implementation would update the peer's availability in the service
    console.log(`[Peer Support Hook] Updated availability to: ${status}`);
  }, []);

  /**
   * Find peer support matches for a request
   */
  const findPeerSupport = useCallback(async (request: PeerSupportRequest): Promise<PeerMatch[]> => {
    try {
      setIsFindingMatches(true);
      setError(null);
      
      const matches = await peerSupportNetworkService.findCompatiblePeers(request);
      setPeerMatches(matches);
      return matches;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find peer support matches');
      return [];
    } finally {
      setIsFindingMatches(false);
    }
  }, []);

  /**
   * Create a support session with a matched peer
   */
  const createSupportSession = useCallback(async (requestId: string, supporterId: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock request data - in real implementation, this would be stored
      const mockRequest: PeerSupportRequest = {
        id: requestId,
        seekerToken: userToken,
        language,
        experienceNeeded: [],
        urgencyLevel: 'medium',
        preferredSupportStyle: [],
        sessionType: 'text-chat',
        description: 'Seeking peer support',
        timestamp: Date.now(),
        maxWaitTime: 30
      };
      
      const sessionId = await peerSupportNetworkService.createPeerSupportSession(mockRequest, supporterId);
      return sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create support session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, language]);

  /**
   * Complete a support session with feedback
   */
  const completeSupportSession = useCallback(async (sessionId: string, feedback: {
    seekerRating?: number;
    supporterRating?: number;
    finalRiskLevel: number;
    followUpNeeded: boolean;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await peerSupportNetworkService.completePeerSupportSession(sessionId, feedback);
      
      // Remove from active sessions
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete support session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get community groups for current language/culture
   */
  const getCommunityGroups = useCallback((lang: string, culturalContext?: string): CommunityGroup[] => {
    return peerSupportNetworkService.getCommunityGroups(lang, culturalContext);
  }, []);

  /**
   * Join a community group
   */
  const joinCommunityGroup = useCallback(async (groupId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Implementation would handle group joining logic
      console.log(`[Peer Support Hook] Joining group: ${groupId}`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join community group');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh peer matches
   */
  const refreshMatches = useCallback(async (): Promise<void> => {
    try {
      setIsFindingMatches(true);
      setError(null);
      
      // Would refresh current matches based on user's criteria
      console.log('[Peer Support Hook] Refreshing peer matches...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh matches');
    } finally {
      setIsFindingMatches(false);
    }
  }, []);

  /**
   * Refresh peer support statistics
   */
  const refreshStatistics = useCallback(() => {
    try {
      const stats = peerSupportNetworkService.getPeerSupportStatistics();
      setPeerStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh statistics');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load community groups for current language
        const groups = getCommunityGroups(language);
        setCommunityGroups(groups);
        
        // Load statistics
        refreshStatistics();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [language, getCommunityGroups, refreshStatistics]);

  // Periodic statistics refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatistics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshStatistics]);

  return {
    registerAsPeer,
    updateAvailability,
    findPeerSupport,
    createSupportSession,
    completeSupportSession,
    getCommunityGroups,
    joinCommunityGroup,
    peerMatches,
    activeSessions,
    communityGroups,
    peerStatistics,
    isLoading,
    isRegistering,
    isFindingMatches,
    error,
    refreshMatches,
    refreshStatistics
  };
};
