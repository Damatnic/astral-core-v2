/**
 * Mock for Privacy Preserving Analytics Service
 */

export const privacyPreservingAnalyticsService = {
  trackEvent: jest.fn(() => Promise.resolve()),
  trackMoodEntry: jest.fn(() => Promise.resolve()),
  trackCrisisInteraction: jest.fn(() => Promise.resolve()),
  trackFeatureUsage: jest.fn(() => Promise.resolve()),
  trackSafetyPlanUsage: jest.fn(() => Promise.resolve()),
  trackResourceAccess: jest.fn(() => Promise.resolve()),
  trackUserEngagement: jest.fn(() => Promise.resolve()),
  recordInterventionOutcome: jest.fn(() => Promise.resolve()),
  getAnonymizedInsights: jest.fn(() => Promise.resolve({
    totalEvents: 0,
    eventTypes: {},
    timeDistribution: {},
    userSegments: {}
  })),
  getUserAnalytics: jest.fn(() => Promise.resolve({
    userId: 'anonymous',
    events: [],
    insights: {}
  })),
  clearAnalytics: jest.fn(() => Promise.resolve()),
  exportAnalytics: jest.fn(() => Promise.resolve({})),
  setUserConsent: jest.fn(() => Promise.resolve()),
  getUserConsent: jest.fn(() => Promise.resolve(true)),
  anonymizeData: jest.fn((data) => ({
    ...data,
    userId: 'anonymous',
    personalInfo: null
  })),
  hashIdentifier: jest.fn((id) => `hashed_${id}`),
  aggregateData: jest.fn((data) => ({
    count: Array.isArray(data) ? data.length : 1,
    summary: 'aggregated'
  })),
  applyDifferentialPrivacy: jest.fn((data) => data),
  validatePrivacyCompliance: jest.fn(() => true),
  getPrivacyReport: jest.fn(() => Promise.resolve({
    compliance: true,
    dataCategories: [],
    processingActivities: [],
    risks: []
  }))
};

export default privacyPreservingAnalyticsService;