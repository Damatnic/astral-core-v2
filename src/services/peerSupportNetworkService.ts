/**
 * Peer Support Network Service
 * 
 * Provides culturally-sensitive peer matching and multilingual support
 * for crisis intervention through community-based assistance.
 * 
 * Features:
 * - Cultural and linguistic matching algorithms
 * - Experience-based peer pairing
 * - Real-time safety monitoring
 * - Crisis escalation protocols
 * - Privacy-preserving peer discovery
 * 
 * @license Apache-2.0
 */

import { culturalContextService } from './culturalContextService';
import { enhancedAICrisisDetectionService } from './enhancedAiCrisisDetectionService';
import { privacyPreservingAnalyticsService } from './privacyPreservingAnalyticsService';

// Peer Support Types
export interface PeerProfile {
  id: string;
  userToken: string;
  anonymizedId: string;
  language: string;
  culturalBackground: string;
  preferredLanguages: string[];
  availabilityStatus: 'available' | 'busy' | 'offline';
  experienceAreas: ExperienceArea[];
  supportStyle: 'listener' | 'advisor' | 'companion' | 'mentor';
  timezone: string;
  ageRange: '18-25' | '26-35' | '36-50' | '51+';
  safetyRating: number; // 0-5 based on peer feedback
  totalSupportSessions: number;
  averageRating: number;
  lastActive: number;
  isVerified: boolean;
  culturalSensitivityScore: number; // ML-calculated based on interactions
}

export interface ExperienceArea {
  category: 'anxiety' | 'depression' | 'grief' | 'trauma' | 'relationships' | 'work-stress' | 'family' | 'identity' | 'substance' | 'health';
  level: 'personal' | 'supported-others' | 'professional';
  description?: string;
}

export interface PeerMatch {
  peerId: string;
  compatibilityScore: number;
  culturalMatch: number;
  languageMatch: number;
  experienceMatch: number;
  availabilityMatch: number;
  safetyScore: number;
  matchReason: string;
  estimatedWaitTime: number; // minutes
}

export interface PeerSupportSession {
  id: string;
  seekerId: string;
  supporterId: string;
  language: string;
  culturalContext: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed' | 'escalated' | 'terminated';
  riskLevel: number;
  escalationTriggers: string[];
  moderationFlags: string[];
  sessionType: 'text-chat' | 'voice-call' | 'video-call' | 'group-session';
  privacyLevel: 'anonymous' | 'semi-anonymous' | 'identified';
}

export interface PeerSupportRequest {
  id: string;
  seekerToken: string;
  language: string;
  culturalPreference?: string;
  experienceNeeded: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
  preferredSupportStyle: string[];
  sessionType: 'text-chat' | 'voice-call' | 'video-call';
  description: string;
  timestamp: number;
  maxWaitTime: number; // minutes
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  language: string;
  culturalFocus: string;
  memberCount: number;
  isPrivate: boolean;
  moderators: string[];
  topics: string[];
  meetingSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    timezone: string;
    dayOfWeek?: number;
    timeOfDay: string;
  };
  safetyGuidelines: string[];
}

class PeerSupportNetworkService {
  private peerProfiles: Map<string, PeerProfile> = new Map();
  private activeSessions: Map<string, PeerSupportSession> = new Map();
  private pendingRequests: Map<string, PeerSupportRequest> = new Map();
  private communityGroups: Map<string, CommunityGroup> = new Map();
  private moderationQueue: string[] = [];

  constructor() {
    this.setupSafetyMonitoring();
    this.initializeDefaultGroups();
  }

  /**
   * Set up real-time safety monitoring for peer sessions
   */
  private setupSafetyMonitoring(): void {
    setInterval(() => {
      this.monitorActiveSessions();
    }, 30000); // Check every 30 seconds

    setInterval(() => {
      this.processAutoEscalations();
    }, 60000); // Check escalations every minute
  }

  /**
   * Initialize default community groups for each cultural context
   */
  private initializeDefaultGroups(): void {
    const culturalContexts = culturalContextService.getAllCulturalContexts();
    
    Object.entries(culturalContexts).forEach(([language, context]) => {
      const groupId = `default-${language}`;
      this.communityGroups.set(groupId, {
        id: groupId,
        name: `${language.toUpperCase()} Community Support`,
        description: `Peer support community for ${context.region} cultural context`,
        language,
        culturalFocus: context.region,
        memberCount: 0,
        isPrivate: false,
        moderators: [],
        topics: ['general-support', 'crisis-intervention', 'cultural-guidance'],
        safetyGuidelines: [
          'Respect cultural differences and perspectives',
          'Maintain confidentiality and anonymity',
          'Report any safety concerns immediately',
          'Follow crisis escalation protocols'
        ]
      });
    });
  }

  /**
   * Register a new peer supporter
   */
  async registerPeerSupporter(peerData: Omit<PeerProfile, 'id' | 'anonymizedId' | 'safetyRating' | 'totalSupportSessions' | 'averageRating' | 'lastActive' | 'culturalSensitivityScore'>): Promise<string> {
    try {
      const peerId = `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const anonymizedId = this.generateAnonymizedPeerId(peerData.userToken);

      const profile: PeerProfile = {
        ...peerData,
        id: peerId,
        anonymizedId,
        safetyRating: 5.0, // Start with perfect safety rating
        totalSupportSessions: 0,
        averageRating: 0,
        lastActive: Date.now(),
        culturalSensitivityScore: 0.8, // Default score, will be updated based on interactions
      };

      this.peerProfiles.set(peerId, profile);
      
      console.log(`[Peer Support] Registered new peer supporter: ${peerId} (${peerData.language})`);
      return peerId;
    } catch (error) {
      console.error('[Peer Support] Failed to register peer supporter:', error);
      throw error;
    }
  }

  /**
   * Generate anonymized peer ID for privacy
   */
  private generateAnonymizedPeerId(userToken: string): string {
    const salt = 'peer-support-anonymization-2025';
    const data = `${userToken}-${salt}`;
    
    // Simple hash implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `peer-${Math.abs(hash).toString(36).substr(0, 8)}`;
  }

  /**
   * Find compatible peers for support request
   */
  async findCompatiblePeers(request: PeerSupportRequest): Promise<PeerMatch[]> {
    try {
      const availablePeers = Array.from(this.peerProfiles.values())
        .filter(peer => 
          peer.availabilityStatus === 'available' &&
          peer.preferredLanguages.includes(request.language)
        );

      const matches: PeerMatch[] = [];

      for (const peer of availablePeers) {
        const match = await this.calculatePeerCompatibility(peer, request);
        if (match.compatibilityScore > 0.6) { // Minimum compatibility threshold
          matches.push(match);
        }
      }

      // Sort by compatibility score
      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      return matches.slice(0, 5); // Return top 5 matches
    } catch (error) {
      console.error('[Peer Support] Failed to find compatible peers:', error);
      return [];
    }
  }

  /**
   * Calculate peer compatibility using multiple factors
   */
  private async calculatePeerCompatibility(peer: PeerProfile, request: PeerSupportRequest): Promise<PeerMatch> {
    // Cultural compatibility
    const culturalContext = culturalContextService.getCulturalContext(request.language);
    const culturalMatch = peer.culturalBackground === culturalContext.region ? 1.0 : 0.7;

    // Language compatibility
    const primaryLanguageMatch = peer.language === request.language ? 1.0 : 0.0;
    const secondaryLanguageMatch = peer.preferredLanguages.includes(request.language) ? 0.8 : 0.0;
    const languageMatch = Math.max(primaryLanguageMatch, secondaryLanguageMatch);

    // Experience compatibility
    const experienceMatch = this.calculateExperienceMatch(peer.experienceAreas, request.experienceNeeded);

    // Availability and responsiveness
    const timeSinceLastActive = Date.now() - peer.lastActive;
    const availabilityMatch = Math.max(0, 1 - (timeSinceLastActive / (24 * 60 * 60 * 1000))); // Decay over 24 hours

    // Safety and quality score
    const safetyScore = (peer.safetyRating / 5.0) * 0.7 + (peer.averageRating / 5.0) * 0.3;

    // Overall compatibility score
    const compatibilityScore = (
      culturalMatch * 0.25 +
      languageMatch * 0.25 +
      experienceMatch * 0.25 +
      availabilityMatch * 0.15 +
      safetyScore * 0.10
    );

    // Generate match reason
    const matchReason = this.generateMatchReason(culturalMatch, languageMatch, experienceMatch, availabilityMatch);

    // Estimate wait time based on peer's current load
    const estimatedWaitTime = this.calculateEstimatedWaitTime(peer);

    return {
      peerId: peer.id,
      compatibilityScore,
      culturalMatch,
      languageMatch,
      experienceMatch,
      availabilityMatch,
      safetyScore,
      matchReason,
      estimatedWaitTime
    };
  }

  /**
   * Calculate experience area match score
   */
  private calculateExperienceMatch(peerExperience: ExperienceArea[], requestedExperience: string[]): number {
    if (requestedExperience.length === 0) return 0.5; // Neutral if no specific experience requested

    const matchingAreas = peerExperience.filter(exp => 
      requestedExperience.includes(exp.category)
    );

    if (matchingAreas.length === 0) return 0.2; // Low score if no matching experience

    // Weight by experience level
    const weightedScore = matchingAreas.reduce((sum, exp) => {
      let levelWeight: number;
      if (exp.level === 'professional') {
        levelWeight = 1.0;
      } else if (exp.level === 'supported-others') {
        levelWeight = 0.8;
      } else {
        levelWeight = 0.6;
      }
      return sum + levelWeight;
    }, 0);

    return Math.min(1.0, weightedScore / requestedExperience.length);
  }

  /**
   * Generate human-readable match reason
   */
  private generateMatchReason(cultural: number, language: number, experience: number, availability: number): string {
    const reasons: string[] = [];

    if (cultural >= 0.9) reasons.push('strong cultural understanding');
    if (language >= 0.9) reasons.push('native language match');
    if (experience >= 0.8) reasons.push('relevant experience');
    if (availability >= 0.8) reasons.push('highly responsive');

    return reasons.length > 0 ? 
      `Recommended for ${reasons.join(', ')}` : 
      'General compatibility match';
  }

  /**
   * Calculate estimated wait time for peer
   */
  private calculateEstimatedWaitTime(peer: PeerProfile): number {
    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => session.supporterId === peer.id && session.status === 'active');

    // Base wait time on current load and historical session length
    const baseWaitTime = activeSessions.length * 15; // 15 minutes per active session
    const randomVariation = Math.random() * 10; // Add some variation

    return Math.round(baseWaitTime + randomVariation);
  }

  /**
   * Create a peer support session
   */
  async createPeerSupportSession(request: PeerSupportRequest, supporterId: string): Promise<string> {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const supporter = this.peerProfiles.get(supporterId);
      
      if (!supporter) {
        throw new Error('Supporter not found');
      }

      // Get initial risk assessment
      const initialRiskLevel = await this.assessInitialRisk(request);

      const session: PeerSupportSession = {
        id: sessionId,
        seekerId: request.seekerToken,
        supporterId,
        language: request.language,
        culturalContext: culturalContextService.getCulturalContext(request.language).region,
        startTime: Date.now(),
        status: 'pending',
        riskLevel: initialRiskLevel,
        escalationTriggers: [],
        moderationFlags: [],
        sessionType: request.sessionType,
        privacyLevel: 'anonymous'
      };

      this.activeSessions.set(sessionId, session);
      this.pendingRequests.delete(request.id);

      // Update supporter availability
      supporter.availabilityStatus = 'busy';
      this.peerProfiles.set(supporterId, supporter);

      console.log(`[Peer Support] Created session ${sessionId} (${request.language})`);
      return sessionId;
    } catch (error) {
      console.error('[Peer Support] Failed to create support session:', error);
      throw error;
    }
  }

  /**
   * Assess initial risk level for support request
   */
  private async assessInitialRisk(request: PeerSupportRequest): Promise<number> {
    try {
      // Use enhanced AI crisis detection for initial assessment
      const analysis = await enhancedAICrisisDetectionService.analyzeCrisisWithML(
        request.description,
        request.language
      );

      // Map urgency level to risk score
      const urgencyRisk = {
        'low': 0.2,
        'medium': 0.5,
        'high': 0.7,
        'crisis': 0.9
      }[request.urgencyLevel] || 0.5;

      // Combine AI analysis with urgency level
      return Math.max(analysis.realTimeRisk?.immediateRisk || 0.5, urgencyRisk);
    } catch (error) {
      console.error('[Peer Support] Failed to assess initial risk:', error);
      // Default to medium risk if assessment fails
      return 0.5;
    }
  }

  /**
   * Monitor active sessions for safety and escalation triggers
   */
  private async monitorActiveSessions(): Promise<void> {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status !== 'active') continue;

      try {
        // Check session duration for potential issues
        const sessionDuration = (Date.now() - session.startTime) / (1000 * 60); // minutes
        
        if (sessionDuration > 120) { // 2 hours
          session.escalationTriggers.push('long-duration-session');
        }

        // Check for high risk levels
        if (session.riskLevel > 0.8) {
          session.escalationTriggers.push('high-risk-level');
        }

        // Update session
        this.activeSessions.set(sessionId, session);

        // Trigger escalation if needed
        if (session.escalationTriggers.length > 0) {
          await this.processSessionEscalation(sessionId);
        }

      } catch (error) {
        console.error(`[Peer Support] Failed to monitor session ${sessionId}:`, error);
      }
    }
  }

  /**
   * Process session escalation to professional help
   */
  private async processSessionEscalation(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      // Mark session as escalated
      session.status = 'escalated';
      this.activeSessions.set(sessionId, session);

      // Add to moderation queue
      this.moderationQueue.push(sessionId);

      // Record escalation in analytics
      await privacyPreservingAnalyticsService.recordInterventionOutcome({
        sessionId: sessionId,
        userToken: session.seekerId,
        language: session.language,
        interventionType: 'peer-support',
        initialRiskLevel: session.riskLevel,
        finalRiskLevel: session.riskLevel, // Risk level maintained due to escalation
        sessionDuration: (Date.now() - session.startTime) / (1000 * 60),
      });

      console.log(`[Peer Support] Escalated session ${sessionId} to professional support`);
    } catch (error) {
      console.error(`[Peer Support] Failed to escalate session ${sessionId}:`, error);
    }
  }

  /**
   * Process automatic escalations based on triggers
   */
  private processAutoEscalations(): void {
    // Process moderation queue
    while (this.moderationQueue.length > 0) {
      const sessionId = this.moderationQueue.shift();
      if (sessionId) {
        // In a real implementation, this would notify human moderators
        console.log(`[Peer Support] Session ${sessionId} requires moderation attention`);
      }
    }
  }

  /**
   * Complete a peer support session
   */
  async completePeerSupportSession(sessionId: string, feedback: {
    seekerRating?: number;
    supporterRating?: number;
    finalRiskLevel: number;
    followUpNeeded: boolean;
  }): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update session
      session.endTime = Date.now();
      session.status = 'completed';
      session.riskLevel = feedback.finalRiskLevel;

      // Update supporter availability and stats
      const supporter = this.peerProfiles.get(session.supporterId);
      if (supporter) {
        supporter.availabilityStatus = 'available';
        supporter.totalSupportSessions += 1;
        supporter.lastActive = Date.now();

        if (feedback.supporterRating) {
          // Update average rating
          const totalRating = supporter.averageRating * (supporter.totalSupportSessions - 1) + feedback.supporterRating;
          supporter.averageRating = totalRating / supporter.totalSupportSessions;
        }

        this.peerProfiles.set(session.supporterId, supporter);
      }

      // Record session outcome in analytics
      const sessionDuration = (session.endTime - session.startTime) / (1000 * 60);
      await privacyPreservingAnalyticsService.recordInterventionOutcome({
        sessionId: sessionId,
        userToken: session.seekerId,
        language: session.language,
        interventionType: 'peer-support',
        initialRiskLevel: session.riskLevel,
        finalRiskLevel: feedback.finalRiskLevel,
        sessionDuration,
        feedback: feedback.seekerRating
      });

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      console.log(`[Peer Support] Completed session ${sessionId}`);
    } catch (error) {
      console.error('[Peer Support] Failed to complete session:', error);
      throw error;
    }
  }

  /**
   * Get community groups for a language/culture
   */
  getCommunityGroups(language: string, culturalContext?: string): CommunityGroup[] {
    return Array.from(this.communityGroups.values())
      .filter(group => 
        group.language === language &&
        (!culturalContext || group.culturalFocus === culturalContext)
      );
  }

  /**
   * Get peer support statistics
   */
  getPeerSupportStatistics(): {
    totalPeers: number;
    availablePeers: number;
    activeSessions: number;
    completedSessions: number;
    averageSessionDuration: number;
    languageDistribution: Record<string, number>;
    culturalDistribution: Record<string, number>;
  } {
    const totalPeers = this.peerProfiles.size;
    const availablePeers = Array.from(this.peerProfiles.values())
      .filter(peer => peer.availabilityStatus === 'available').length;
    
    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => session.status === 'active').length;

    // Calculate completed sessions and average duration
    let completedSessions = 0;
    let totalDuration = 0;
    
    Array.from(this.peerProfiles.values()).forEach(peer => {
      completedSessions += peer.totalSupportSessions;
    });

    // Language and cultural distribution
    const languageDistribution: Record<string, number> = {};
    const culturalDistribution: Record<string, number> = {};

    Array.from(this.peerProfiles.values()).forEach(peer => {
      languageDistribution[peer.language] = (languageDistribution[peer.language] || 0) + 1;
      culturalDistribution[peer.culturalBackground] = (culturalDistribution[peer.culturalBackground] || 0) + 1;
    });

    return {
      totalPeers,
      availablePeers,
      activeSessions,
      completedSessions,
      averageSessionDuration: totalDuration / Math.max(completedSessions, 1),
      languageDistribution,
      culturalDistribution
    };
  }
}

// Export singleton instance
export const peerSupportNetworkService = new PeerSupportNetworkService();
