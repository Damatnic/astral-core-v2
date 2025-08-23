/**
 * Astral Tether Service
 * 
 * Bidirectional crisis support feature that creates meaningful digital presence 
 * between users during difficult moments. Provides synchronized haptic feedback,
 * breathing guides, and real-time connection management.
 */

import { getWebSocketService } from './webSocketService';
import { notificationService } from './notificationService';
import { getSecureStorage } from './secureStorageService';

export interface TetherRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  expiresAt: number;
  location?: { lat: number; lng: number };
  preferredDuration?: number; // minutes
  tetherType: 'breathing' | 'presence' | 'conversation' | 'emergency';
  isAnonymous?: boolean;
  anonymousAlias?: string;
}

export interface TetherSession {
  id: string;
  participants: string[];
  startTime: number;
  endTime?: number;
  status: 'active' | 'ended' | 'escalated';
  tetherType: TetherRequest['tetherType'];
  hapticSync: boolean;
  breathingSync: boolean;
  currentPhase?: 'inhale' | 'hold' | 'exhale' | 'pause';
  phaseStartTime?: number;
  pressureSensitivity: number; // 0.1 to 1.0
  settings: TetherSettings;
  metrics: TetherMetrics;
}

export interface TetherSettings {
  hapticEnabled: boolean;
  hapticIntensity: number; // 0.1 to 1.0
  breathingGuideEnabled: boolean;
  breathingPattern: 'box' | '4-7-8' | 'coherent' | 'custom';
  customInhale?: number;
  customHold?: number;
  customExhale?: number;
  customPause?: number;
  pressureShareEnabled: boolean;
  emergencyContacts: string[];
  professionalHandoffEnabled: boolean;
  privacyLevel: 'open' | 'friends' | 'emergency-only';
  autoAcceptFromCircle: boolean;
}

export interface TetherProfile {
  userId: string;
  displayName: string;
  isAvailable: boolean;
  availabilityStatus: 'available' | 'in-session' | 'do-not-disturb' | 'offline';
  friendCode: string;
  preferredTetherTypes: TetherRequest['tetherType'][];
  responseTime: number; // average seconds
  successfulSessions: number;
  rating: number;
  emergencyContact: boolean;
  professionalSupport: boolean;
  languages: string[];
  timezone: string;
  availability: {
    days: number[]; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  };
  trustedConnections: string[]; // userIds of trusted friends
  lastActiveTimestamp?: number;
}

export interface TetherMetrics {
  heartRateSync?: number[];
  pressureReadings?: { timestamp: number; pressure: number }[];
  breathingRate?: number[];
  sessionQuality: number; // 1-10
  completionRate: number; // 0-1
  averageResponseTime: number; // seconds
  effectivenessScore: number; // 1-10
}

export interface TetherCircle {
  id: string;
  name: string;
  members: string[];
  emergencyProtocol: boolean;
  autoNotify: boolean;
  created: number;
  lastActive: number;
}

type TetherEventHandler = (data: unknown) => void;

class AstralTetherService {
  private activeSessions = new Map<string, TetherSession>();
  private pendingRequests = new Map<string, TetherRequest>();
  private userProfiles = new Map<string, TetherProfile>();
  private userSettings?: TetherSettings;
  private websocketService = getWebSocketService();
  private secureStorage = getSecureStorage();
  private eventHandlers = new Map<string, Set<TetherEventHandler>>();
  private currentUserId?: string;
  private hapticController?: any;
  private breathingInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private offlineQueue: TetherRequest[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    await this.loadUserSettings();
    await this.loadUserProfile();
    this.setupWebSocketListeners();
    this.initializeHapticFeedback();
    this.initializePressureSensing();
    this.initializeOfflineSupport();
    this.initializePanicButton();
  }

  public emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public on(event: string, handler: TetherEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public off(event: string, handler: TetherEventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public removeAllListeners() {
    this.eventHandlers.clear();
  }

  private setupWebSocketListeners() {
    this.websocketService.subscribe('tether-request', this.handleTetherRequest.bind(this));
    this.websocketService.subscribe('tether-response', this.handleTetherResponse.bind(this));
    this.websocketService.subscribe('tether-pressure', this.handlePressureUpdate.bind(this));
    this.websocketService.subscribe('tether-heartbeat', this.handleHeartbeatSync.bind(this));
    this.websocketService.subscribe('tether-breathing', this.handleBreathingSync.bind(this));
    this.websocketService.subscribe('tether-end', this.handleTetherEnd.bind(this));
    this.websocketService.subscribe('tether-emergency', this.handleEmergencyEscalation.bind(this));
  }

  private async initializeHapticFeedback() {
    try {
      if ('vibrate' in navigator) {
        this.hapticController = navigator;
      }
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  }

  private async initializePressureSensing() {
    try {
      if ('DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));
      }
    } catch (error) {
      console.log('Pressure sensing not available');
    }
  }

  private initializeOfflineSupport() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      notificationService.addToast('You are offline. Tether requests will be sent when connection is restored.', 'info');
    });
  }

  private initializePanicButton() {
    // Listen for triple-tap or specific key combination
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    document.addEventListener('click', (event) => {
      // Check if click is in tether area
      const target = event.target as HTMLElement;
      if (target.closest('.tether-view')) {
        tapCount++;
        
        if (tapCount === 3) {
          this.triggerPanicMode();
          tapCount = 0;
        }

        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 500);
      }
    });

    // Keyboard shortcut: Ctrl+Shift+P
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.triggerPanicMode();
      }
    });
  }

  private async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.sendTetherRequest(request);
      } catch (error) {
        console.error('Failed to send queued request:', error);
        this.offlineQueue.push(request);
      }
    }
  }

  async triggerPanicMode() {
    // Immediate haptic feedback
    if (this.hapticController) {
      this.hapticController.vibrate([200, 100, 200, 100, 200]);
    }

    // Send emergency tether to all trusted connections
    const profile = this.userProfiles.get(this.currentUserId || 'default-user');
    if (profile && profile.trustedConnections.length > 0) {
      const emergencyRequest = {
        fromUserId: this.currentUserId || 'default-user',
        toUserId: profile.trustedConnections[0], // Primary emergency contact
        message: 'EMERGENCY - Panic button activated. I need immediate help.',
        urgency: 'critical' as const,
        tetherType: 'emergency' as const,
        preferredDuration: 60,
        location: await this.getCurrentLocation()
      };

      try {
        const sessionId = await this.sendTetherRequest(emergencyRequest);
        
        // Auto-escalate to professional help
        setTimeout(() => {
          this.requestEmergencyEscalation(sessionId, 'professional');
        }, 30000); // 30 seconds
        
        notificationService.addToast('Emergency tether sent. Help is on the way.', 'error');
      } catch (error) {
        console.error('Failed to send emergency tether:', error);
        // Fallback to direct emergency services
        window.location.href = 'tel:911';
      }
    } else {
      // No trusted connections - go straight to emergency services
      window.location.href = 'tel:911';
    }
  }

  private async getCurrentLocation(): Promise<{ lat: number; lng: number } | undefined> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: true
        });
      });
      
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error('Failed to get location:', error);
      return undefined;
    }
  }

  private async loadUserSettings() {
    try {
      const settingsData = await this.secureStorage.getItem('tether-settings');
      if (settingsData) {
        this.userSettings = JSON.parse(settingsData);
      } else {
        this.userSettings = this.getDefaultSettings();
        await this.saveUserSettings();
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
      this.userSettings = this.getDefaultSettings();
    }
  }

  private async loadUserProfile() {
    try {
      const userId = this.currentUserId || 'default-user';
      const profileData = await this.secureStorage.getItem(`tether-profile-${userId}`);
      if (profileData) {
        const profile = JSON.parse(profileData);
        this.userProfiles.set(userId, profile);
      } else {
        // Create default profile with friend code
        const newProfile: TetherProfile = {
          userId,
          displayName: userId,
          isAvailable: true,
          availabilityStatus: 'available',
          friendCode: this.generateFriendCode(),
          preferredTetherTypes: ['breathing', 'presence'],
          responseTime: 0,
          successfulSessions: 0,
          rating: 0,
          emergencyContact: false,
          professionalSupport: false,
          languages: ['en'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          availability: {
            days: [0, 1, 2, 3, 4, 5, 6],
            startTime: '00:00',
            endTime: '23:59'
          },
          trustedConnections: [],
          lastActiveTimestamp: Date.now()
        };
        this.userProfiles.set(userId, newProfile);
        await this.saveUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private getDefaultSettings(): TetherSettings {
    return {
      hapticEnabled: true,
      hapticIntensity: 0.7,
      breathingGuideEnabled: true,
      breathingPattern: 'box',
      pressureShareEnabled: true,
      emergencyContacts: [],
      professionalHandoffEnabled: true,
      privacyLevel: 'friends',
      autoAcceptFromCircle: false
    };
  }

  private async saveUserSettings() {
    try {
      await this.secureStorage.setItem('tether-settings', JSON.stringify(this.userSettings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }

  // Friend Code System
  
  private generateFriendCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-'; // Format: XXXX-XXXX
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async saveUserProfile(profile: TetherProfile): Promise<void> {
    try {
      await this.secureStorage.setItem(`tether-profile-${profile.userId}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  async addTrustedConnection(friendCode: string): Promise<boolean> {
    try {
      // Find user by friend code
      const profiles = Array.from(this.userProfiles.values());
      const friendProfile = profiles.find(p => p.friendCode === friendCode);
      
      if (!friendProfile) {
        throw new Error('Invalid friend code');
      }

      const currentProfile = this.userProfiles.get(this.currentUserId || 'default-user');
      if (!currentProfile) {
        throw new Error('Current user profile not found');
      }

      // Add to trusted connections
      if (!currentProfile.trustedConnections.includes(friendProfile.userId)) {
        currentProfile.trustedConnections.push(friendProfile.userId);
        await this.saveUserProfile(currentProfile);
      }

      return true;
    } catch (error) {
      console.error('Failed to add trusted connection:', error);
      return false;
    }
  }

  async updateAvailabilityStatus(status: TetherProfile['availabilityStatus']): Promise<void> {
    const profile = this.userProfiles.get(this.currentUserId || 'default-user');
    if (profile) {
      profile.availabilityStatus = status;
      profile.lastActiveTimestamp = Date.now();
      await this.saveUserProfile(profile);
      
      // Broadcast status update
      this.websocketService.send('tether-status-update', {
        userId: profile.userId,
        status,
        timestamp: Date.now()
      });
    }
  }

  // Public API Methods

  async sendTetherRequest(request: Omit<TetherRequest, 'id' | 'timestamp' | 'expiresAt'>): Promise<string> {
    let minutes: number;
    switch (request.urgency) {
      case 'critical':
        minutes = 5;
        break;
      case 'high':
        minutes = 15;
        break;
      default:
        minutes = 30;
    }
    
    const tetherRequest: TetherRequest = {
      ...request,
      id: `tether-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      expiresAt: Date.now() + (minutes * 60 * 1000)
    };

    // Handle anonymous requests
    if (request.isAnonymous) {
      tetherRequest.anonymousAlias = this.generateAnonymousAlias();
      // Don't include real user ID in anonymous requests
      tetherRequest.fromUserId = `anon-${tetherRequest.id}`;
    }

    // Check if online
    if (!this.isOnline) {
      this.offlineQueue.push(tetherRequest);
      await this.secureStorage.setItem('tether-offline-queue', JSON.stringify(this.offlineQueue));
      notificationService.addToast(
        'Tether request queued. Will be sent when connection is restored.',
        'info'
      );
      return tetherRequest.id;
    }

    this.pendingRequests.set(tetherRequest.id, tetherRequest);
    
    try {
      this.websocketService.send('tether-request', tetherRequest);
      
      notificationService.addToast(
        request.isAnonymous 
          ? `Anonymous tether request sent`
          : `Tether request sent to user ${request.toUserId}`,
        'info'
      );
    } catch (error) {
      console.error('Failed to send tether request:', error);
      // Add to offline queue on failure
      this.offlineQueue.push(tetherRequest);
      throw error;
    }

    this.emit('tether-request-sent', tetherRequest);
    return tetherRequest.id;
  }

  private generateAnonymousAlias(): string {
    const adjectives = ['Gentle', 'Caring', 'Kind', 'Supportive', 'Understanding', 'Peaceful'];
    const nouns = ['Friend', 'Companion', 'Helper', 'Listener', 'Guardian', 'Presence'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  }

  async respondToTetherRequest(requestId: string, accepted: boolean): Promise<string | null> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error('Tether request not found');
    }

    if (accepted) {
      const sessionId = await this.createTetherSession(request);
      this.websocketService.send('tether-response', {
        requestId,
        accepted: true,
        sessionId
      });
      this.emit('tether-session-created', sessionId);
      return sessionId;
    } else {
      this.websocketService.send('tether-response', {
        requestId,
        accepted: false
      });
      this.pendingRequests.delete(requestId);
      return null;
    }
  }

  private async createTetherSession(request: TetherRequest): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: TetherSession = {
      id: sessionId,
      participants: [request.fromUserId, request.toUserId],
      startTime: Date.now(),
      status: 'active',
      tetherType: request.tetherType,
      hapticSync: this.userSettings?.hapticEnabled || false,
      breathingSync: this.userSettings?.breathingGuideEnabled || false,
      pressureSensitivity: 0.5,
      settings: this.userSettings || this.getDefaultSettings(),
      metrics: {
        sessionQuality: 0,
        completionRate: 0,
        averageResponseTime: 0,
        effectivenessScore: 0
      }
    };

    this.activeSessions.set(sessionId, session);
    
    if (session.breathingSync) {
      this.startBreathingSync(sessionId);
    }

    this.startHeartbeatMonitoring(sessionId);

    return sessionId;
  }

  async startBreathingSync(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.breathingSync) return;

    const pattern = session.settings.breathingPattern;
    let inhale = 4000, hold = 4000, exhale = 6000, pause = 2000;

    switch (pattern) {
      case '4-7-8':
        inhale = 4000; hold = 7000; exhale = 8000; pause = 1000;
        break;
      case 'coherent':
        inhale = 5000; hold = 0; exhale = 5000; pause = 0;
        break;
      case 'custom':
        inhale = (session.settings.customInhale || 4) * 1000;
        hold = (session.settings.customHold || 4) * 1000;
        exhale = (session.settings.customExhale || 6) * 1000;
        pause = (session.settings.customPause || 2) * 1000;
        break;
    }

    const breathingCycle = async () => {
      if (!this.activeSessions.has(sessionId)) return;

      session.currentPhase = 'inhale';
      session.phaseStartTime = Date.now();
      this.emit('breathing-phase', { sessionId, phase: 'inhale', duration: inhale });
      
      setTimeout(() => {
        if (hold > 0) {
          session.currentPhase = 'hold';
          session.phaseStartTime = Date.now();
          this.emit('breathing-phase', { sessionId, phase: 'hold', duration: hold });
        }
        
        setTimeout(() => {
          session.currentPhase = 'exhale';
          session.phaseStartTime = Date.now();
          this.emit('breathing-phase', { sessionId, phase: 'exhale', duration: exhale });
          
          setTimeout(() => {
            if (pause > 0) {
              session.currentPhase = 'pause';
              session.phaseStartTime = Date.now();
              this.emit('breathing-phase', { sessionId, phase: 'pause', duration: pause });
            }
            
            setTimeout(breathingCycle, pause);
          }, exhale);
        }, hold);
      }, inhale);
    };

    breathingCycle();
  }

  sendPressureUpdate(sessionId: string, pressure: number): void {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.settings.pressureShareEnabled) return;

    const normalizedPressure = Math.max(0, Math.min(1, pressure));
    
    this.websocketService.send('tether-pressure', {
      sessionId,
      pressure: normalizedPressure,
      timestamp: Date.now()
    });

    if (session.hapticSync && this.hapticController) {
      const intensity = Math.floor(normalizedPressure * session.settings.hapticIntensity * 100);
      this.hapticController.vibrate(intensity);
    }

    if (!session.metrics.pressureReadings) {
      session.metrics.pressureReadings = [];
    }
    session.metrics.pressureReadings.push({
      timestamp: Date.now(),
      pressure: normalizedPressure
    });

    this.emit('pressure-update', { sessionId, pressure: normalizedPressure });
  }

  private startHeartbeatMonitoring(sessionId: string): void {
    this.heartbeatInterval = setInterval(() => {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
        }
        return;
      }

      this.websocketService.send('tether-heartbeat', {
        sessionId,
        timestamp: Date.now(),
        isActive: true
      });
    }, 5000);
  }

  async endTetherSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.status = 'ended';
    session.endTime = Date.now();

    session.metrics.completionRate = 1.0;
    session.metrics.sessionQuality = this.calculateSessionQuality(session);

    this.websocketService.send('tether-end', {
      sessionId,
      endTime: session.endTime,
      metrics: session.metrics
    });

    if (this.breathingInterval) {
      clearInterval(this.breathingInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    await this.storeSessionMetrics(session);

    this.activeSessions.delete(sessionId);
    this.emit('tether-session-ended', sessionId);
  }

  private calculateSessionQuality(session: TetherSession): number {
    let quality = 5;

    const duration = (session.endTime || Date.now()) - session.startTime;
    const minutes = duration / (1000 * 60);
    if (minutes >= 10) quality += 2;
    else if (minutes >= 5) quality += 1;

    if (session.metrics.pressureReadings && session.metrics.pressureReadings.length > 10) {
      quality += 1;
    }

    if (session.breathingSync) {
      quality += 1;
    }

    return Math.min(10, quality);
  }

  private async storeSessionMetrics(session: TetherSession): Promise<void> {
    try {
      const sessionData = {
        ...session,
        storedAt: Date.now()
      };
      await this.secureStorage.setItem(`session-${session.id}`, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store session metrics:', error);
    }
  }

  // Event Handlers

  private handleTetherRequest(request: TetherRequest): void {
    this.pendingRequests.set(request.id, request);
    
    notificationService.addToast(
      `Tether request from ${request.fromUserId}: ${request.message}`,
      request.urgency === 'critical' ? 'error' : 'info'
    );

    this.emit('tether-request-received', request);
  }

  private handleTetherResponse(response: { requestId: string; accepted: boolean; sessionId?: string }): void {
    const request = this.pendingRequests.get(response.requestId);
    if (!request) return;

    if (response.accepted && response.sessionId) {
      this.emit('tether-request-accepted', { request, sessionId: response.sessionId });
    } else {
      this.emit('tether-request-declined', request);
    }

    this.pendingRequests.delete(response.requestId);
  }

  private handlePressureUpdate(data: { sessionId: string; pressure: number; timestamp: number }): void {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    if (session.hapticSync && this.hapticController) {
      const intensity = Math.floor(data.pressure * session.settings.hapticIntensity * 100);
      this.hapticController.vibrate(intensity);
    }

    this.emit('pressure-received', data);
  }

  private handleHeartbeatSync(data: { sessionId: string; timestamp: number; isActive: boolean }): void {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    this.emit('heartbeat-received', data);
  }

  private handleBreathingSync(data: { sessionId: string; phase: string; timestamp: number }): void {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    this.emit('breathing-sync-received', data);
  }

  private handleTetherEnd(data: { sessionId: string; endTime: number; metrics: TetherMetrics }): void {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    session.status = 'ended';
    session.endTime = data.endTime;
    session.metrics = { ...session.metrics, ...data.metrics };

    this.activeSessions.delete(data.sessionId);
    this.emit('tether-session-ended', data.sessionId);
  }

  private handleEmergencyEscalation(data: { sessionId: string; escalationType: string; contact?: string }): void {
    const session = this.activeSessions.get(data.sessionId);
    if (!session) return;

    session.status = 'escalated';
    this.emit('emergency-escalation', data);

    if (data.escalationType === 'professional' && session.settings.professionalHandoffEnabled) {
      this.requestProfessionalHandoff(data.sessionId, data.contact);
    }
  }

  private handleDeviceMotion(event: DeviceMotionEvent): void {
    const acceleration = event.acceleration;
    if (acceleration) {
      const pressure = Math.sqrt(
        (acceleration.x || 0) ** 2 + 
        (acceleration.y || 0) ** 2 + 
        (acceleration.z || 0) ** 2
      ) / 10;

      this.activeSessions.forEach((session, sessionId) => {
        if (session.settings.pressureShareEnabled) {
          this.sendPressureUpdate(sessionId, pressure);
        }
      });
    }
  }

  async requestEmergencyEscalation(sessionId: string, escalationType: 'professional' | 'emergency' | 'crisis'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const escalationData = {
      sessionId,
      escalationType,
      timestamp: Date.now(),
      participants: session.participants,
      urgency: 'critical',
      sessionMetrics: session.metrics
    };

    this.websocketService.send('tether-emergency', escalationData);

    if (escalationType === 'professional') {
      await this.requestProfessionalHandoff(sessionId);
    }

    this.emit('emergency-escalation-requested', escalationData);
  }

  private async requestProfessionalHandoff(sessionId: string, preferredContact?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const handoffRequest = {
      sessionId,
      timestamp: Date.now(),
      sessionData: {
        duration: Date.now() - session.startTime,
        tetherType: session.tetherType,
        participants: session.participants,
        metrics: session.metrics
      },
      preferredContact,
      urgency: 'high'
    };

    console.log('Professional handoff requested:', handoffRequest);

    this.emit('professional-handoff-requested', handoffRequest);
  }

  // Getters and Utility Methods

  getActiveSession(sessionId: string): TetherSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getActiveSessions(): TetherSession[] {
    return Array.from(this.activeSessions.values());
  }

  getPendingRequests(): TetherRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  getUserSettings(): TetherSettings | undefined {
    return this.userSettings;
  }

  async updateUserSettings(settings: Partial<TetherSettings>): Promise<void> {
    this.userSettings = { ...this.userSettings, ...settings } as TetherSettings;
    await this.saveUserSettings();
    this.emit('settings-updated', this.userSettings);
  }

  isAvailable(): boolean {
    const settings = this.userSettings;
    if (!settings) return false;

    return this.activeSessions.size < 3;
  }

  destroy(): void {
    if (this.breathingInterval) clearInterval(this.breathingInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.activeSessions.forEach((_, sessionId) => {
      this.endTetherSession(sessionId);
    });

    this.eventHandlers.clear();

    if ('DeviceMotionEvent' in window) {
      window.removeEventListener('devicemotion', this.handleDeviceMotion.bind(this));
    }
  }

  // Compatibility methods for TetherView
  async initiateTether(request: Omit<TetherRequest, 'id' | 'timestamp' | 'expiresAt'>): Promise<string> {
    return this.sendTetherRequest(request);
  }

  async acceptTether(requestId: string, _userId: string): Promise<boolean> {
    const sessionId = await this.respondToTetherRequest(requestId, true);
    return sessionId !== null;
  }

  async endTether(sessionId: string, _userId: string): Promise<void> {
    return this.endTetherSession(sessionId);
  }

  updateConnectionStrength(sessionId: string, strength: number): void {
    // Store connection strength as pressure update
    this.sendPressureUpdate(sessionId, strength);
  }

  async saveComfortProfile(_userId: string, profile: any): Promise<void> {
    // Save profile settings as user settings
    if (profile.settings) {
      await this.updateUserSettings(profile.settings);
    }
  }
}

// Singleton instance
let astralTetherServiceInstance: AstralTetherService | null = null;

export const getAstralTetherService = (): AstralTetherService => {
  if (!astralTetherServiceInstance) {
    astralTetherServiceInstance = new AstralTetherService();
  }
  return astralTetherServiceInstance;
};

export default AstralTetherService;
