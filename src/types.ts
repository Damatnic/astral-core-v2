// --- Imports ---
import { UserRole } from './services/auth0Service';

// --- Interfaces ---

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  roles?: UserRole[];  // Added for Auth0 integration
  picture?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dilemma {
  id: string;
  userToken: string;
  userId?: string;
  title?: string;
  category: string;
  content: string;
  timestamp: string;
  postedAt?: string; // Alternative timestamp for display
  anonymous?: boolean; // Whether the post is anonymous
  supportCount: number;
  isSupported: boolean;
  isReported: boolean;
  reportReason?: string;
  status: 'active' | 'in_progress' | 'resolved' | 'direct_request' | 'declined' | 'removed_by_moderator';
  assignedHelperId?: Helper['id'];
  helperDisplayName?: string;
  resolved_by_seeker?: boolean;
  requestedHelperId?: Helper['id'];
  summary?: string;
  summaryLoading?: boolean;
  moderation?: {
    action: 'removed' | 'dismissed';
    timestamp: string;
    moderatorId: string;
    flagged?: boolean;
    approved?: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
  }
  aiMatchReason?: string;
}

export interface Helper {
    id: string; // Internal UUID
    auth0UserId: string; // From Auth0
    name?: string; // Alternative display name
    displayName: string;
    bio: string;
    joinDate: string;
    helperType: 'Community' | 'Certified';
    role: 'Community' | 'Certified' | 'Moderator' | 'Admin';
    reputation: number;
    isAvailable: boolean;
    expertise: string[];
    kudosCount?: number;
    totalSessions?: number;
    averageRating?: number;
    profileImageUrl?: string;
    achievements?: Achievement[];
    xp: number;
    level: number;
    nextLevelXp: number;
    applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
    applicationNotes?: string;
    trainingCompleted: boolean;
    quizScore?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'poster';
    text: string;
    timestamp: string;
}

export interface ChatSession {
    dilemmaId: string;
    messages: ChatMessage[];
    unread: boolean;
    isTyping?: boolean;
    perspective?: 'seeker' | 'helper';
    helpSessionId?: string;
    helper?: Helper;
}

export interface AIChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    metadata?: any; // Added for crisis detection metadata
}

export interface AIChatSession {
    id?: string;
    messages: AIChatMessage[];
    isTyping?: boolean;
    startedAt?: string;
    status?: string;
}

export interface AnalysisResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral' | '';
  isCrisis: boolean;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp?: number;
}

export interface ConfirmationModalState {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'secondary';
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    link: string;
    category: 'Crisis Support' | 'Anxiety' | 'Depression' | 'Coping Strategies' | 'Grief' | 'Emergency Help' | 'Text Support' | 'Youth & Students' | 'Veterans' | 'LGBTQ+';
    contact?: string;
}


export interface CrisisResource {
    title: string;
    contact: string;
}

export interface HelperGuidance {
    dilemmaId: string;
    isCrisis: boolean;
    flagReason: string;
    suggestedResponses: string[];
    suggestedResources: CrisisResource[];
}

export interface Feedback {
  dilemmaId: string;
  helperId: string;
  wasHelpful: boolean;
}

export interface ForumThread {
    id: string;
    title: string;
    authorId: string; // Helper ID
    authorName: string; // Helper display name
    timestamp: string;
    postCount: number;
    lastReply: string; // timestamp
}

export interface ForumPost {
    id: string;
    threadId: string;
    authorId: string; // Helper ID
    authorName: string; // Helper display name
    content: string;
    timestamp: string;
}

export interface CommunityProposal {
    id: string;
    title: string;
    description: string;
    authorId: string; // Helper ID
    authorName: string;
    status: 'open' | 'closed';
    createdAt: string;
    endsAt: string;
    votes: {
        for: number;
        against: number;
        abstain: number;
    }
}

export interface CommunityVote {
    proposalId: string;
    helperId: string;
    vote: 'for' | 'against' | 'abstain';
}

export interface Reflection {
    id: string;
    userToken: string; // Anonymous user token
    content: string;
    timestamp: string;
    reactions: { [type: string]: number }; // e.g. { light: 12 }
    myReaction?: string; // The reaction type the current user has given, if any
}

export interface Block {
    blockerId: string; // ID of the user initiating the block
    blockedId: string; // ID of the user being blocked
    timestamp: string;
}

export interface ModerationAction {
    id: string;
    type?: string; // Type of moderation action
    targetId?: string; // Target of the action
    userId: string; // The user who was moderated
    moderatorId?: string; // The moderator who performed the action
    action: string; // e.g., 'Post Removed', 'Warning Issued'
    reason: string;
    timestamp: string;
    status?: string; // Status of the action
    relatedContentId?: string | null; // ID of the post/comment
}

export interface UserStatus {
    userId: string; // Can be anonymous userToken or helperId
    warnings: number;
    isBanned: boolean;
    banReason?: string;
    banExpires?: string;
}

export interface HelpSession {
    id: string;
    dilemmaId: string;
    seekerId: string;
    helperId: string;
    helperDisplayName: string;
    startedAt: string;
    endedAt?: string;
    isFavorited: boolean;
    kudosGiven?: boolean;
    kudosGiven?: boolean;
    summary?: string;
    summaryLoading?: boolean;
    helperSummary?: string;
    helperSummaryLoading?: boolean;
}

export interface CommunityStats {
    activeDilemmas: number;
    avgTimeToFirstSupport: string; // e.g., "5m 30s"
    totalHelpers: number;
    mostCommonCategory: string;
}

export interface SafetyPlan {
    triggers: string;
    copingStrategies: string;
    supportContacts: string;
    safePlaces: string;
}

export interface LegalConsentRecord {
    userId: string;
    userType: string;
    documentType: string;
    documentVersion: string;
    consentTimestamp: string;
}

export interface WellnessVideo {
    id: string;
    title?: string;
    url?: string; // Alternative property name for videoUrl
    videoUrl: string;
    userToken?: string;
    description: string;
    likes: number;
    comments?: number;
    shares?: number;
    timestamp?: string;
    isLiked?: boolean; // Client-side state
    thumbnailUrl?: string;
    duration?: string;
    category?: string;
    tags?: string[];
    uploadedBy?: string;
    uploadedAt?: string;
    views?: number;
}

export interface MoodCheckIn {
  id: string;
  userToken: string;
  timestamp: string;
  moodScore: number; // 1-5
  anxietyLevel: number; // 1-5
  sleepQuality: number; // 1-5
  energyLevel: number; // 1-5
  tags: string[];
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'Mindfulness' | 'Physical' | 'Social' | 'Self-Care';
}

export interface TrackedHabit {
  userId: string;
  habitId: string;
  trackedAt: string;
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
}

export interface HabitCompletion {
  id: string;
  userId: string;
  habitId: string;
  completedAt: string; // ISO date string (YYYY-MM-DD)
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    options: { text: string; value: number }[];
}

export interface AssessmentResult {
    score: number;
    severity: string;
    recommendation: string;
}

export interface Assessment {
    id: string;
    title?: string;
    userToken: string;
    type: 'phq-9' | 'gad-7';
    timestamp: string;
    score: number;
    answers: number[];
}

export interface JournalEntry {
  id: string;
  userToken: string;
  timestamp: string;
  content: string;
}

// ===== ADMIN SPECIFIC INTERFACES =====

export interface AdminProfile {
    id: string;
    name: string;
    role: 'Astral Admin';
    department: string;
    clearanceLevel: string;
    yearsWithPlatform: number;
    profilePicture?: string;
    contactInfo: {
        email: string;
        phone: string;
        emergencyContact: string;
    };
}

export interface HelperApplication {
    id: string;
    applicantName: string;
    applicationType: string;
    submissionDate: Date;
    status: 'pending_review' | 'under_review' | 'flagged' | 'approved' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    credentials: string[];
    specialties: string[];
    backgroundCheckStatus: 'pending' | 'in_progress' | 'completed' | 'flagged';
    referencesVerified: boolean;
    reviewNotes: string;
    riskAssessment: 'low' | 'medium' | 'high';
}

export interface EscalatedCase {
    id: string;
    type: 'serious_safety_concern' | 'helper_boundary_violation' | 'platform_security_incident' | 'policy_violation';
    description: string;
    reportedBy: string;
    escalationTime: Date;
    status: 'pending' | 'under_investigation' | 'urgent_intervention' | 'resolved' | 'escalated';
    userInvolved?: string;
    helperInvolved?: string;
    actionsTaken: string[];
    outcome: string;
    followUpRequired: boolean;
}

export interface PlatformAnalytics {
    userMetrics: {
        totalActiveUsers: number;
        newRegistrationsToday: number;
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        userRetentionRate: number;
        averageSessionDuration: number;
    };
    helperMetrics: {
        totalActiveHelpers: number;
        averageResponseTime: number;
        helpersOnline: number;
        totalSessionsToday: number;
        helperSatisfactionRating: number;
        helperUtilizationRate: number;
    };
    crisisMetrics: {
        crisisAlertsToday: number;
        averageResponseTimeToCrisis: number;
        crisisResolutionRate: number;
        escalationRate: number;
        emergencyContactsActivated: number;
        preventionSuccessRate: number;
    };
    platformHealth: {
        systemUptime: number;
        averagePageLoadTime: number;
        errorRate: number;
        dataBackupStatus: string;
        securityIncidents: number;
        performanceScore: number;
    };
}

export interface CommunityHealthMetrics {
    totalPosts: number;
    flaggedContent: number;
    moderatedContent: number;
    positiveSentimentRate: number;
    engagementRate: number;
    reportedIncidents: number;
    communityGuidanceInterventions: number;
}

export interface QualityMetrics {
    helperPerformanceReviews: number;
    userSatisfactionScore: number;
    platformFeatureUsage: {
        journaling: number;
        peerSupport: number;
        crisisSupport: number;
        resourceLibrary: number;
        moodTracking: number;
    };
    completedAudits: number;
    pendingAudits: number;
}

export interface AdminAction {
    id: string;
    type: 'helper_approval' | 'policy_update' | 'security_enhancement' | 'moderation_action';
    description: string;
    timestamp: Date;
    adminUser: string;
}

export interface SystemAlert {
    id: string;
    type: 'performance' | 'security' | 'maintenance' | 'crisis';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    status: 'new' | 'acknowledged' | 'monitoring' | 'resolved';
}

export interface AstralAdminDashboard {
    profile: AdminProfile;
    helperApplications: HelperApplication[];
    escalatedCases: EscalatedCase[];
    analytics: PlatformAnalytics;
    communityHealth: CommunityHealthMetrics;
    qualityMetrics: QualityMetrics;
    recentActions: AdminAction[];
    systemAlerts: SystemAlert[];
}

// ===== COMMUNITY CONTENT INTERFACES =====

export interface WellnessChallenge {
    id: string;
    title: string;
    description: string;
    category: 'mindfulness' | 'physical' | 'emotional' | 'social' | 'creativity' | 'gratitude';
    duration: number; // days
    startDate: string;
    endDate: string;
    createdBy: string;
    createdByName: string;
    participants: ChallengeParticipant[];
    dailyPrompts: DailyPrompt[];
    status: 'upcoming' | 'active' | 'completed';
    isPublic: boolean;
    tags: string[];
}

export interface ChallengeParticipant {
    userId: string;
    username: string;
    joinedDate: string;
    currentStreak: number;
    totalDaysCompleted: number;
    isActive: boolean;
}

export interface DailyPrompt {
    day: number;
    title: string;
    description: string;
    type: 'reflection' | 'action' | 'mindfulness' | 'gratitude' | 'creative';
    estimatedTime: string; // e.g., "5-10 minutes"
}

export interface GroupDiscussion {
    id: string;
    title: string;
    description: string;
    category: 'support' | 'education' | 'social' | 'recovery' | 'general';
    hostId: string;
    hostName: string;
    hostType: 'helper' | 'peer' | 'moderator';
    participants: DiscussionParticipant[];
    messages: DiscussionMessage[];
    scheduledDate?: string;
    duration?: number; // minutes
    isRecurring: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    isPrivate: boolean;
    maxParticipants?: number;
    tags: string[];
}

export interface DiscussionParticipant {
    userId: string;
    username: string;
    userType: 'starkeeper' | 'helper' | 'moderator';
    joinedDate: string;
    isActive: boolean;
    lastSeen: string;
}

export interface DiscussionMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'starkeeper' | 'helper' | 'moderator';
    content: string;
    timestamp: string;
    reactions: MessageReaction[];
    isSupported: boolean;
    supportCount: number;
}

export interface MessageReaction {
    type: 'heart' | 'light' | 'strength' | 'hug' | 'star';
    count: number;
    users: string[];
}

export interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    type: 'workshop' | 'support-group' | 'social' | 'educational' | 'wellness';
    hostId: string;
    hostName: string;
    startTime: string;
    endTime: string;
    timezone: string;
    maxParticipants?: number;
    currentParticipants: EventParticipant[];
    isVirtual: boolean;
    meetingLink?: string;
    resources: EventResource[];
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    tags: string[];
}

export interface EventParticipant {
    userId: string;
    username: string;
    registeredDate: string;
    attended?: boolean;
    feedback?: string;
    rating?: number; // 1-5
}

export interface EventResource {
    id: string;
    title: string;
    type: 'document' | 'video' | 'audio' | 'link' | 'worksheet';
    url: string;
    description?: string;
}

export interface PeerConnection {
    id: string;
    starkeeperId: string;
    peerId: string;
    peerName: string;
    connectionType: 'accountability-buddy' | 'mentor' | 'peer-support' | 'study-partner';
    connectedDate: string;
    lastInteraction: string;
    sharedGoals: string[];
    status: 'active' | 'paused' | 'ended';
    interactionCount: number;
    isMatched: boolean;
}

export interface CommunityContent {
    wellnessChallenges: WellnessChallenge[];
    groupDiscussions: GroupDiscussion[];
    communityEvents: CommunityEvent[];
    peerConnections: PeerConnection[];
    forumThreads: ForumThread[];
    activeUsers: CommunityUser[];
}

export interface CommunityUser {
    id: string;
    username: string;
    userType: 'starkeeper' | 'helper' | 'moderator' | 'admin';
    joinedDate: string;
    lastActive: string;
    contributionScore: number;
    badges: UserBadge[];
    isOnline: boolean;
}

export interface UserBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedDate: string;
    category: 'participation' | 'helping' | 'milestone' | 'leadership' | 'special';
}

// ===== END ADMIN INTERFACES =====


export type View = 'share' | 'feed' | 'crisis' | 'settings' | 'guidelines' | 'login' | 'legal' | 'dashboard' | 'constellation-guide-dashboard' | 'starkeeper-dashboard' | 'my-activity' | 'safety-plan' | 'quiet-space' | 'ai-chat' | 'video-chat' | 'create-profile' | 'helper-profile' | 'helper-training' | 'helper-community' | 'reflections' | 'moderation-history' | 'blocked-users' | 'public-helper-profile' | 'moderation-dashboard' | 'admin-dashboard' | 'helper-application' | 'donation' | 'wellness-videos' | 'upload-video' | 'wellness-tracking' | 'tether' | 'enhanced-tether' | 'veterans-resources' | 'peer-support' | 'assessments' | 'assessment-history' | 'assessment-detail' | 'workflow-demo' | 'ui-showcase' | 'group-session';
export type ActiveView = { view: View; params?: any };
export type SortOption = 'newest' | 'most-support' | 'needs-support';
export type Theme = 'light' | 'dark';