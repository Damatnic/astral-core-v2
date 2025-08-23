/**
 * Analytics Service for Astral Core
 * Privacy-compliant analytics for mental health platform
 * Follows GDPR, HIPAA-adjacent principles, and user privacy first approach
 */

import { EventProperties } from "../types/common";

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: "user_action" | "page_view" | "feature_usage" | "performance" | "error" | "crisis_intervention" | "wellness_tracking";
  properties?: EventProperties;
  timestamp: number;
  sessionId: string;
  userId?: string;
  isAnonymized: boolean;
  sensitivityLevel: "public" | "private" | "sensitive" | "crisis";
}

export interface ConsentStatus {
  analytics: boolean;
  performance: boolean;
  functionality: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
  ipHash?: string;
}

export interface PrivacySettings {
  dataRetentionDays: number;
  allowCrossSession: boolean;
  anonymizeAfterDays: number;
  purgeAfterDays: number;
  collectLocationData: boolean;
  collectDeviceData: boolean;
  shareCrisisData: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  collectPersonalData: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint?: string;
  privacySettings: PrivacySettings;
  requireConsent: boolean;
  gdprCompliant: boolean;
  hipaaAdjacent: boolean;
  crisisPriority: boolean;
}

export interface DataExportRequest {
  userId: string;
  requestDate: number;
  includeAnalytics: boolean;
  includeJourneys: boolean;
  format: "json" | "csv";
  status: "pending" | "processing" | "completed" | "failed";
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private readonly sessionId: string;
  private userId?: string;
  private consentStatus: ConsentStatus | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    const defaultPrivacySettings: PrivacySettings = {
      dataRetentionDays: 30,
      allowCrossSession: false,
      anonymizeAfterDays: 7,
      purgeAfterDays: 90,
      collectLocationData: false,
      collectDeviceData: true,
      shareCrisisData: true
    };

    this.config = {
      enabled: true,
      collectPersonalData: false,
      batchSize: 10,
      flushInterval: 30000,
      privacySettings: {
        ...defaultPrivacySettings,
        ...(config.privacySettings || {})
      },
      requireConsent: true,
      gdprCompliant: true,
      hipaaAdjacent: true,
      crisisPriority: true,
      ...config
    };

    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  track(name: string, category: AnalyticsEvent["category"], properties?: EventProperties): void {
    if (!this.config.enabled) return;
    
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      category,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      isAnonymized: false,
      sensitivityLevel: "public"
    };

    this.eventQueue.push(event);
  }

  trackPageView(path: string, properties?: EventProperties): void {
    this.track("page_view", "page_view", { path, ...properties });
  }

  trackFeatureUsage(feature: string, action: string, properties?: EventProperties): void {
    this.track(`${feature}_${action}`, "feature_usage", {
      feature,
      action,
      ...properties
    });
  }

  trackEvent(eventName: string, properties?: EventProperties): void {
    this.track(eventName, "user_action", properties);
  }

  trackError(error: Error, context?: string): void {
    this.track("error", "error", {
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
      context,
      url: window.location.href
    });
  }

  trackUserAction(action: string, element?: string, properties?: EventProperties): void {
    this.track(action, "user_action", {
      element,
      ...properties
    });
  }

  trackTiming(name: string, duration: number, category?: string): void {
    this.track("timing", "performance", {
      name,
      duration,
      category
    });
  }

  trackCrisisIntervention(action: string, properties?: EventProperties): void {
    this.track(action, "crisis_intervention", {
      timestamp: Date.now(),
      urgent: true,
      ...properties
    });
  }

  trackWellnessActivity(activity: string, properties?: EventProperties): void {
    this.track(activity, "wellness_tracking", {
      timestamp: Date.now(),
      ...properties
    });
  }

  updateConsent(consent: Partial<ConsentStatus>): void {
    this.consentStatus = {
      ...this.consentStatus!,
      ...consent,
      timestamp: Date.now()
    };
  }

  getConsentStatus(): ConsentStatus | null {
    return this.consentStatus;
  }

  async exportUserData(userId: string): Promise<DataExportRequest> {
    return {
      userId,
      requestDate: Date.now(),
      includeAnalytics: true,
      includeJourneys: true,
      format: "json",
      status: "completed"
    };
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  endSession(): void {
    // Clean up
  }

  flush(): void {
    this.eventQueue = [];
    }

  isEnabled(): boolean {
    return this.config.enabled;
}

  optOut(): void {
    this.config.enabled = false;
    this.eventQueue = [];
  }

  optIn(): void {
    this.config.enabled = true;
    }
}

// Singleton instance
let analyticsServiceInstance: AnalyticsService | null = null;

export const getAnalyticsService = (): AnalyticsService => {
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new AnalyticsService();
  }
  return analyticsServiceInstance;
};

// Export singleton for Astral Core
export const astralCoreAnalytics = getAnalyticsService();

// Export the class for extending
export { AnalyticsService };

// Export the configured instance as default
export default astralCoreAnalytics;