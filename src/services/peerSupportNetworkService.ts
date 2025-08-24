/**
 * Peer Support Network Service
 *
 * Provides culturally-sensitive peer matching and multilingual support
 * for crisis intervention through community-based assistance.
 */

import { notificationService } from './notificationService';
import { webSocketService } from './webSocketService';

export interface PeerProfile {
  id: string;
  userToken: string;
  anonymizedId: string;
  displayName: string;
  language: string;
  culturalBackground: string;
  preferredLanguages: string[];
  availabilityStatus: 'available' | 'busy' | 'offline' | 'do-not-disturb';
  experienceAreas: ExperienceArea[];
  supportStyle: 'listener' | 'advisor' | 'companion' | 'mentor';
  timezone: string;
  ageRange: '18-25' | '26-35' | '36-50' | '51+';
  safetyRating: number; // 0-5 based on peer feedback
  totalSupportSessions: number;
  averageRating: number;
  lastActive: Date;
  isVerified: boolean;
  culturalSensitivityScore: number;
  responseTime: number; // average minutes
  specializations: string[];
  certifications: string[];
  bio?: string;
  profileImage?: string;
  availability: AvailabilitySchedule;
  preferences: PeerPreferences;
  metrics: PeerMetrics;
}

export interface ExperienceArea {
  category: 'anxiety' | 'depression' | 'grief' | 'trauma' | 'relationships' | 'work-stress' | 'family' | 'identity' | 'substance' | 'health';
  level: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  yearsExperience: number;
  personalExperience: boolean;
  professionalTraining: boolean;
  certifications: string[];
  description?: string;
}

export interface AvailabilitySchedule {
  schedule: TimeSlot[];
  emergencyAvailable: boolean;
  maxConcurrentSessions: number;
  preferredSessionLength: number; // minutes
  timeZone: string;
  autoAcceptRequests: boolean;
  responseTimeGoal: number; // minutes
}

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  available: boolean;
}

export interface PeerPreferences {
  genderPreference?: 'male' | 'female' | 'non-binary' | 'no-preference';
  agePreference?: 'similar' | 'older' | 'younger' | 'no-preference';
  culturalMatch: boolean;
  languageMatch: boolean;
  experienceMatch: boolean;
  communicationStyle: 'direct' | 'supportive' | 'analytical' | 'empathetic';
  sessionTypes: ('text' | 'voice' | 'video')[];
  crisisComfortable: boolean;
  religiousConsiderations?: string[];
}

export interface PeerMetrics {
  totalSessions: number;
  totalHours: number;
  averageSessionDuration: number;
  successRate: number; // 0-1
  userSatisfactionScore: number; // 0-5
  crisisHandled: number;
  escalationsTriggered: number;
  noShowRate: number; // 0-1
  responseTimeAverage: number; // minutes
  lastMonthSessions: number;
  badges: PeerBadge[];
}

export interface PeerBadge {
  id: string;
  name: string;
  description: string;
  earnedDate: Date;
  category: 'experience' | 'quality' | 'availability' | 'specialization';
  icon?: string;
}

export interface SupportRequest {
  id: string;
  requesterId: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  preferredSupport: ExperienceArea['category'][];
  message?: string;
  isAnonymous: boolean;
  culturalPreferences?: CulturalPreferences;
  languagePreference: string;
  sessionType: 'text' | 'voice' | 'video';
  estimatedDuration?: number; // minutes
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'matched' | 'in-progress' | 'completed' | 'cancelled' | 'expired';
  matchedPeerId?: string;
  sessionId?: string;
}

export interface CulturalPreferences {
  background: string;
  language: string;
  religiousConsiderations?: string[];
  culturalPractices?: string[];
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
  familyInvolvement: 'preferred' | 'neutral' | 'avoid';
  genderSensitive: boolean;
}

export interface SupportSession {
  id: string;
  requestId: string;
  peerId: string;
  requesterId: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no-show';
  sessionType: 'text' | 'voice' | 'video';
  urgencyLevel: SupportRequest['urgencyLevel'];
  safetyLevel: 'safe' | 'concern' | 'elevated' | 'crisis';
  interventions: SessionIntervention[];
  feedback?: SessionFeedback;
  duration?: number; // minutes
  escalated: boolean;
  escalationReason?: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface SessionIntervention {
  id: string;
  type: 'safety-check' | 'resource-sharing' | 'crisis-escalation' | 'professional-referral';
  triggeredBy: 'peer' | 'system' | 'requester';
  timestamp: Date;
  description: string;
  outcome: string;
  followUpRequired: boolean;
}

export interface SessionFeedback {
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  helpfulness: number; // 1-5
  empathy: number; // 1-5
  professionalism: number; // 1-5
  safetyFelt: number; // 1-5
  wouldRecommend: boolean;
  comments?: string;
  reportConcerns?: string;
  improvementSuggestions?: string[];
  submittedAt: Date;
}

export interface MatchingCriteria {
  experienceMatch: number; // weight 0-1
  culturalMatch: number; // weight 0-1
  languageMatch: number; // weight 0-1
  availabilityMatch: number; // weight 0-1
  ratingThreshold: number; // minimum rating
  responseTimeThreshold: number; // maximum minutes
  maxDistance?: number; // timezone hours
  requireVerified: boolean;
  requireCrisisExperience: boolean;
}

export interface PeerNetworkAnalytics {
  totalPeers: number;
  activePeers: number;
  totalRequests: number;
  matchRate: number; // 0-1
  averageMatchTime: number; // minutes
  averageSessionDuration: number; // minutes
  satisfactionScore: number; // 0-5
  crisisHandled: number;
  escalationRate: number; // 0-1
  culturalDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
  peakUsageHours: number[];
  retentionRate: number; // 0-1
}

class PeerSupportNetworkService {
  private peers: Map<string, PeerProfile> = new Map();
  private activeRequests: Map<string, SupportRequest> = new Map();
  private activeSessions: Map<string, SupportSession> = new Map();
  private matchingCriteria: MatchingCriteria = {
    experienceMatch: 0.3,
    culturalMatch: 0.2,
    languageMatch: 0.2,
    availabilityMatch: 0.3,
    ratingThreshold: 3.0,
    responseTimeThreshold: 15,
    requireVerified: true,
    requireCrisisExperience: false
  };
  private analytics: PeerNetworkAnalytics = {
    totalPeers: 0,
    activePeers: 0,
    totalRequests: 0,
    matchRate: 0,
    averageMatchTime: 0,
    averageSessionDuration: 0,
    satisfactionScore: 0,
    crisisHandled: 0,
    escalationRate: 0,
    culturalDistribution: {},
    languageDistribution: {},
    peakUsageHours: [],
    retentionRate: 0
  };

  constructor() {
    this.initializeService();
    this.startAnalyticsCollection();
  }

  /**
   * Register a new peer in the support network
   */
  async registerPeer(peerData: Omit<PeerProfile, 'id' | 'anonymizedId' | 'metrics'>): Promise<PeerProfile> {
    const peer: PeerProfile = {
      id: this.generateId(),
      anonymizedId: this.generateAnonymizedId(),
      ...peerData,
      metrics: this.initializePeerMetrics()
    };

    // Validate peer data
    await this.validatePeerProfile(peer);

    // Store peer
    this.peers.set(peer.id, peer);

    // Update analytics
    this.analytics.totalPeers++;
    this.updateCulturalDistribution(peer.culturalBackground);
    this.updateLanguageDistribution(peer.language);

    // Setup peer monitoring
    this.setupPeerMonitoring(peer.id);

    return peer;
  }

  /**
   * Create a support request
   */
  async createSupportRequest(requestData: Omit<SupportRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<string> {
    const request: SupportRequest = {
      id: this.generateId(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.getExpirationTime(requestData.urgencyLevel)),
      status: 'pending',
      ...requestData
    };

    // Store request
    this.activeRequests.set(request.id, request);

    // Find matching peers
    const matchingPeers = await this.findMatchingPeers(request);

    if (matchingPeers.length === 0) {
      // No peers available, handle accordingly
      await this.handleNoMatchingPeers(request);
      return request.id;
    }

    // Start matching process
    await this.initiateMatching(request, matchingPeers);

    // Update analytics
    this.analytics.totalRequests++;

    return request.id;
  }

  /**
   * Accept a support request
   */
  async acceptSupportRequest(requestId: string, peerId: string): Promise<SupportSession> {
    const request = this.activeRequests.get(requestId);
    if (!request) {
      throw new Error('Support request not found');
    }

    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error('Peer not found');
    }

    // Update request status
    request.status = 'matched';
    request.matchedPeerId = peerId;

    // Create support session
    const session = await this.createSupportSession(request, peer);

    // Remove from active requests
    this.activeRequests.delete(requestId);

    // Update peer availability
    await this.updatePeerAvailability(peerId, 'busy');

    // Notify requester
    await this.notifyRequestMatched(request, peer);

    return session;
  }

  /**
   * Start a support session
   */
  async startSupportSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'active';
    session.startTime = new Date();

    // Setup session monitoring
    this.setupSessionMonitoring(session);

    // Notify participants
    await this.notifySessionStarted(session);

    // Create communication channel
    await this.setupCommunicationChannel(session);
  }

  /**
   * End a support session
   */
  async endSupportSession(sessionId: string, endedBy: string, reason?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'completed';
    session.endTime = new Date();
    session.duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);

    // Update peer availability
    await this.updatePeerAvailability(session.peerId, 'available');

    // Request feedback
    await this.requestSessionFeedback(session);

    // Update metrics
    await this.updateSessionMetrics(session);

    // Clean up resources
    await this.cleanupSession(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  /**
   * Escalate a session for professional intervention
   */
  async escalateSession(sessionId: string, reason: string, escalatedBy: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.escalated = true;
    session.escalationReason = reason;
    session.safetyLevel = 'crisis';

    // Create intervention record
    const intervention: SessionIntervention = {
      id: this.generateId(),
      type: 'crisis-escalation',
      triggeredBy: escalatedBy as any,
      timestamp: new Date(),
      description: `Session escalated: ${reason}`,
      outcome: 'Professional intervention requested',
      followUpRequired: true
    };

    session.interventions.push(intervention);

    // Notify crisis intervention service
    await this.notifyCrisisIntervention(session);

    // Update analytics
    this.analytics.escalationRate = (this.analytics.escalationRate + 1) / this.analytics.totalRequests;
  }

  /**
   * Get peer profile by ID
   */
  getPeer(peerId: string): PeerProfile | undefined {
    return this.peers.get(peerId);
  }

  /**
   * Get active sessions for a peer
   */
  getPeerSessions(peerId: string): SupportSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.peerId === peerId);
  }

  /**
   * Get network analytics
   */
  getAnalytics(): PeerNetworkAnalytics {
    return { ...this.analytics };
  }

  /**
   * Update peer availability
   */
  async updatePeerAvailability(peerId: string, status: PeerProfile['availabilityStatus']): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return;
    }

    peer.availabilityStatus = status;
    peer.lastActive = new Date();

    // Update active peers count
    this.updateActivePeersCount();

    // Notify network of availability change
    await this.broadcastAvailabilityUpdate(peer);
  }

  /**
   * Submit session feedback
   */
  async submitSessionFeedback(feedback: Omit<SessionFeedback, 'submittedAt'>): Promise<void> {
    const session = this.activeSessions.get(feedback.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const completeFeedback: SessionFeedback = {
      ...feedback,
      submittedAt: new Date()
    };

    session.feedback = completeFeedback;

    // Update peer metrics
    await this.updatePeerMetrics(feedback.toUserId, feedback);

    // Update overall analytics
    this.updateSatisfactionMetrics(feedback);
  }

  // Private helper methods

  private generateId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnonymizedId(): string {
    return `anon_${Math.random().toString(36).substr(2, 12)}`;
  }

  private initializePeerMetrics(): PeerMetrics {
    return {
      totalSessions: 0,
      totalHours: 0,
      averageSessionDuration: 0,
      successRate: 0,
      userSatisfactionScore: 0,
      crisisHandled: 0,
      escalationsTriggered: 0,
      noShowRate: 0,
      responseTimeAverage: 0,
      lastMonthSessions: 0,
      badges: []
    };
  }

  private async validatePeerProfile(peer: PeerProfile): Promise<void> {
    if (!peer.displayName || !peer.language) {
      throw new Error('Missing required peer profile information');
    }

    if (peer.safetyRating < 0 || peer.safetyRating > 5) {
      throw new Error('Invalid safety rating');
    }

    // Additional validation logic
  }

  private getExpirationTime(urgency: SupportRequest['urgencyLevel']): number {
    switch (urgency) {
      case 'critical': return 5 * 60 * 1000; // 5 minutes
      case 'high': return 15 * 60 * 1000; // 15 minutes
      case 'medium': return 60 * 60 * 1000; // 1 hour
      case 'low': return 4 * 60 * 60 * 1000; // 4 hours
      default: return 60 * 60 * 1000;
    }
  }

  private async findMatchingPeers(request: SupportRequest): Promise<PeerProfile[]> {
    const availablePeers = Array.from(this.peers.values())
      .filter(peer => peer.availabilityStatus === 'available')
      .filter(peer => this.matchingCriteria.requireVerified ? peer.isVerified : true)
      .filter(peer => peer.averageRating >= this.matchingCriteria.ratingThreshold);

    // Calculate match scores
    const scoredPeers = availablePeers.map(peer => ({
      peer,
      score: this.calculateMatchScore(peer, request)
    }));

    // Sort by score and return top matches
    return scoredPeers
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.peer);
  }

  private calculateMatchScore(peer: PeerProfile, request: SupportRequest): number {
    let score = 0;

    // Experience match
    const experienceMatch = request.preferredSupport.some(area =>
      peer.experienceAreas.some(exp => exp.category === area)
    );
    score += experienceMatch ? this.matchingCriteria.experienceMatch : 0;

    // Language match
    const languageMatch = peer.preferredLanguages.includes(request.languagePreference);
    score += languageMatch ? this.matchingCriteria.languageMatch : 0;

    // Cultural match
    const culturalMatch = request.culturalPreferences?.background === peer.culturalBackground;
    score += culturalMatch ? this.matchingCriteria.culturalMatch : 0;

    // Availability match (response time)
    const responseTimeMatch = peer.responseTime <= this.matchingCriteria.responseTimeThreshold;
    score += responseTimeMatch ? this.matchingCriteria.availabilityMatch : 0;

    // Bonus for high ratings
    score += (peer.averageRating - 3) * 0.1;

    // Bonus for cultural sensitivity
    score += peer.culturalSensitivityScore * 0.1;

    return Math.min(score, 1.0);
  }

  private async handleNoMatchingPeers(request: SupportRequest): Promise<void> {
    // Notify requester about no available peers
    await notificationService.sendNotification({
      userId: request.requesterId,
      title: 'No Peers Available',
      message: 'No matching peers are currently available. We\'ll notify you when someone becomes available.',
      priority: 'medium',
      type: 'peer-support'
    });

    // Add to waiting list or escalate if urgent
    if (request.urgencyLevel === 'critical') {
      await this.escalateToProfessionalSupport(request);
    }
  }

  private async initiateMatching(request: SupportRequest, peers: PeerProfile[]): Promise<void> {
    // Send match requests to top peers
    for (const peer of peers.slice(0, 3)) {
      await this.sendMatchRequest(request, peer);
    }

    // Set up timeout for matching
    setTimeout(() => {
      if (this.activeRequests.has(request.id)) {
        this.handleMatchingTimeout(request);
      }
    }, this.getExpirationTime(request.urgencyLevel));
  }

  private async sendMatchRequest(request: SupportRequest, peer: PeerProfile): Promise<void> {
    await notificationService.sendNotification({
      userId: peer.userToken,
      title: 'Peer Support Request',
      message: `Someone needs ${request.urgencyLevel} priority support. Can you help?`,
      priority: request.urgencyLevel === 'critical' ? 'critical' : 'high',
      type: 'peer-support-request'
    });

    // Send via WebSocket for real-time delivery
    await webSocketService.sendToUser(peer.userToken, {
      type: 'peer-support-request',
      data: {
        requestId: request.id,
        urgency: request.urgencyLevel,
        supportAreas: request.preferredSupport,
        estimatedDuration: request.estimatedDuration,
        isAnonymous: request.isAnonymous
      }
    });
  }

  private async createSupportSession(request: SupportRequest, peer: PeerProfile): Promise<SupportSession> {
    const session: SupportSession = {
      id: this.generateId(),
      requestId: request.id,
      peerId: peer.id,
      requesterId: request.requesterId,
      startTime: new Date(),
      status: 'scheduled',
      sessionType: request.sessionType,
      urgencyLevel: request.urgencyLevel,
      safetyLevel: 'safe',
      interventions: [],
      escalated: false,
      followUpRequired: false
    };

    this.activeSessions.set(session.id, session);
    request.sessionId = session.id;

    return session;
  }

  private setupSessionMonitoring(session: SupportSession): void {
    // Monitor session for safety indicators
    const monitoringInterval = setInterval(async () => {
      if (!this.activeSessions.has(session.id)) {
        clearInterval(monitoringInterval);
        return;
      }

      await this.checkSessionSafety(session);
    }, 60000); // Check every minute
  }

  private async checkSessionSafety(session: SupportSession): Promise<void> {
    // Implementation of safety monitoring logic
    // This would typically analyze conversation patterns, keywords, etc.
  }

  private setupPeerMonitoring(peerId: string): void {
    // Monitor peer activity and performance
  }

  private updateActivePeersCount(): void {
    this.analytics.activePeers = Array.from(this.peers.values())
      .filter(peer => peer.availabilityStatus === 'available').length;
  }

  private updateCulturalDistribution(background: string): void {
    this.analytics.culturalDistribution[background] = 
      (this.analytics.culturalDistribution[background] || 0) + 1;
  }

  private updateLanguageDistribution(language: string): void {
    this.analytics.languageDistribution[language] = 
      (this.analytics.languageDistribution[language] || 0) + 1;
  }

  private async updatePeerMetrics(peerId: string, feedback: SessionFeedback): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    peer.metrics.userSatisfactionScore = 
      (peer.metrics.userSatisfactionScore + feedback.rating) / 2;
    peer.averageRating = peer.metrics.userSatisfactionScore;
  }

  private updateSatisfactionMetrics(feedback: SessionFeedback): void {
    this.analytics.satisfactionScore = 
      (this.analytics.satisfactionScore + feedback.rating) / 2;
  }

  private async notifyRequestMatched(request: SupportRequest, peer: PeerProfile): Promise<void> {
    await notificationService.sendNotification({
      userId: request.requesterId,
      title: 'Peer Support Matched',
      message: `You've been matched with a peer supporter. They'll be with you shortly.`,
      priority: 'high',
      type: 'peer-support-matched'
    });
  }

  private async notifySessionStarted(session: SupportSession): Promise<void> {
    // Notify both participants
  }

  private async setupCommunicationChannel(session: SupportSession): Promise<void> {
    // Setup secure communication channel
    await webSocketService.createChannel(`peer_session_${session.id}`, [
      session.requesterId,
      session.peerId
    ]);
  }

  private async requestSessionFeedback(session: SupportSession): Promise<void> {
    // Request feedback from both participants
  }

  private async updateSessionMetrics(session: SupportSession): Promise<void> {
    if (session.duration) {
      this.analytics.averageSessionDuration = 
        (this.analytics.averageSessionDuration + session.duration) / 2;
    }
  }

  private async cleanupSession(session: SupportSession): Promise<void> {
    // Clean up session resources
    await webSocketService.closeChannel(`peer_session_${session.id}`);
  }

  private async notifyCrisisIntervention(session: SupportSession): Promise<void> {
    // Notify crisis intervention services
    console.log(`Crisis intervention needed for session ${session.id}`);
  }

  private async broadcastAvailabilityUpdate(peer: PeerProfile): Promise<void> {
    // Broadcast availability update to network
  }

  private async escalateToProfessionalSupport(request: SupportRequest): Promise<void> {
    // Escalate to professional crisis support
    console.log(`Escalating request ${request.id} to professional support`);
  }

  private async handleMatchingTimeout(request: SupportRequest): Promise<void> {
    // Handle when no peer accepts the request within timeout
    request.status = 'expired';
    this.activeRequests.delete(request.id);
  }

  private initializeService(): void {
    // Initialize service components
  }

  private startAnalyticsCollection(): void {
    // Start collecting analytics
  }
}

export const peerSupportNetworkService = new PeerSupportNetworkService();
