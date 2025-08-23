/**
 * Demo Data Service
 * 
 * Provides realistic sample data for all user types during demo presentations.
 * Creates interconnected scenarios showing the complete support ecosystem.
 */

import { 
    Dilemma, 
    Helper, 
    JournalEntry, 
    MoodCheckIn, 
    Assessment, 
    Reflection,
    ForumThread,
    ChatSession,
    AIChatSession,
    HelpSession,
    ModerationAction,
    CommunityStats
} from '../types';

export class DemoDataService {
    private static instance: DemoDataService;
    
    public static getInstance(): DemoDataService {
        if (!DemoDataService.instance) {
            DemoDataService.instance = new DemoDataService();
        }
        return DemoDataService.instance;
    }

    // Starkeeper (User) Sample Data
    getStarkeeperJournalEntries(userToken: string): JournalEntry[] {
        return [
            {
                id: 'journal-001',
                userToken,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                content: "Been feeling really overwhelmed with work lately. The deadlines keep piling up and I feel like I'm drowning. Sometimes I wonder if I'm good enough for this job. Maybe talking to someone would help..."
            },
            {
                id: 'journal-002',
                userToken,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                content: "Had a breakthrough moment today during my session with Luna. She helped me realize that my anxiety spirals usually start with comparison to others. Going to try the breathing exercises she suggested."
            },
            {
                id: 'journal-003',
                userToken,
                timestamp: new Date().toISOString(), // Today
                content: "Practicing gratitude like my guide suggested. Three things I'm grateful for: 1) The supportive community here 2) Having a safe space to share my thoughts 3) Small progress feels significant. The tether feature really helped when I was panicking yesterday."
            }
        ];
    }

    getStarkeeperMoodCheckIns(userToken: string): MoodCheckIn[] {
        return [
            {
                id: 'mood-001',
                userToken,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                moodScore: 2,
                anxietyLevel: 4,
                sleepQuality: 2,
                energyLevel: 2,
                tags: ['overwhelmed', 'stressed', 'isolated'],
                notes: 'Work pressure getting to me. Barely sleeping.'
            },
            {
                id: 'mood-002',
                userToken,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                moodScore: 3,
                anxietyLevel: 3,
                sleepQuality: 3,
                energyLevel: 3,
                tags: ['hopeful', 'supported'],
                notes: 'Had a really good session with my guide. Feeling more hopeful.'
            },
            {
                id: 'mood-003',
                userToken,
                timestamp: new Date().toISOString(),
                moodScore: 4,
                anxietyLevel: 2,
                sleepQuality: 4,
                energyLevel: 4,
                tags: ['grateful', 'motivated', 'calm'],
                notes: 'Breathing exercises are working! Slept better last night.'
            }
        ];
    }

    getStarkeeperDilemmas(userToken: string): Dilemma[] {
        return [
            {
                id: 'dilemma-001',
                userToken,
                category: 'work-anxiety',
                content: "I've been having panic attacks at work almost daily. My boss keeps piling on more projects and I feel like I'm suffocating. I'm scared to tell anyone because I don't want to seem weak or lose my job. Has anyone else dealt with workplace anxiety like this?",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                supportCount: 12,
                isSupported: true,
                isReported: false,
                status: 'resolved',
                assignedHelperId: 'helper-luna',
                helperDisplayName: 'Luna ✨',
                resolved_by_seeker: true,
                summary: "Connected with Luna who provided excellent breathing techniques and workplace boundary strategies. Panic attacks have reduced significantly."
            },
            {
                id: 'dilemma-002',
                userToken,
                category: 'relationships',
                content: "My best friend has been distant lately and I'm worried I did something wrong. They used to text me every day but now it's been a week of silence. I'm anxious about reaching out because what if they're avoiding me on purpose?",
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                supportCount: 7,
                isSupported: false,
                isReported: false,
                status: 'active',
                aiMatchReason: "Relationship anxiety and fear of abandonment - would benefit from perspective on communication strategies"
            }
        ];
    }

    getStarkeeperAssessments(userToken: string): Assessment[] {
        return [
            {
                id: 'assessment-001',
                userToken,
                type: 'gad-7',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                score: 12,
                answers: [2, 2, 1, 2, 1, 2, 2]
            },
            {
                id: 'assessment-002',
                userToken,
                type: 'phq-9',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                score: 8,
                answers: [1, 1, 2, 1, 0, 1, 1, 1, 0]
            },
            {
                id: 'assessment-003',
                userToken,
                type: 'gad-7',
                timestamp: new Date().toISOString(),
                score: 8,
                answers: [1, 1, 1, 2, 1, 1, 1]
            }
        ];
    }

    // Constellation Guide (Helper) Sample Data
    getConstellationGuideProfile(): Helper {
        return {
            id: 'helper-luna',
            auth0UserId: 'demo-helper-001',
            displayName: 'Luna ✨',
            bio: 'Certified therapist specializing in anxiety and workplace stress. Here to listen and support your journey. 🌙 Remember: seeking help is a sign of strength, not weakness.',
            joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
            helperType: 'Certified',
            role: 'Certified',
            reputation: 4.9,
            isAvailable: true,
            expertise: ['anxiety', 'workplace-stress', 'panic-attacks', 'breathing-techniques'],
            kudosCount: 89,
            xp: 2450,
            level: 8,
            nextLevelXp: 2500,
            applicationStatus: 'approved',
            trainingCompleted: true,
            quizScore: 95
        };
    }

    getAllDilemmasForHelper(): Dilemma[] {
        return [
            // Active dilemmas that can be picked up
            {
                id: 'dilemma-available-001',
                userToken: 'user-need-help-001',
                category: 'anxiety',
                content: "I've been having trouble sleeping because my mind races with worries about everything I need to do tomorrow. Even when I'm exhausted, I can't seem to turn off my thoughts. Has anyone found techniques that help with bedtime anxiety?",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                supportCount: 3,
                isSupported: false,
                isReported: false,
                status: 'active',
                aiMatchReason: "Anxiety specialist match - Luna's expertise in breathing techniques could help with bedtime racing thoughts"
            },
            {
                id: 'dilemma-available-002',
                userToken: 'user-need-help-002',
                category: 'workplace-stress',
                content: "My coworker keeps taking credit for my ideas in meetings. I'm too afraid to speak up because they have more seniority, but it's really affecting my confidence and motivation. I don't know how to handle this professionally.",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                supportCount: 1,
                isSupported: false,
                isReported: false,
                status: 'active',
                aiMatchReason: "Workplace boundary issues - Luna's background in workplace stress management could provide professional guidance"
            },
            // Direct request for Luna
            {
                id: 'dilemma-direct-001',
                userToken: 'user-returning-001',
                category: 'anxiety',
                content: "Hi Luna, you helped me a few weeks ago with my panic attacks and I was wondering if we could talk again? They've been getting worse since I started a new job and I could really use your guidance with the breathing techniques you taught me.",
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                supportCount: 0,
                isSupported: false,
                isReported: false,
                status: 'direct_request',
                requestedHelperId: 'helper-luna'
            },
            // Luna's active case
            {
                id: 'dilemma-001',
                userToken: 'demo-user-001',
                category: 'work-anxiety',
                content: "I've been having panic attacks at work almost daily. My boss keeps piling on more projects and I feel like I'm suffocating. I'm scared to tell anyone because I don't want to seem weak or lose my job. Has anyone else dealt with workplace anxiety like this?",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                supportCount: 12,
                isSupported: true,
                isReported: false,
                status: 'resolved',
                assignedHelperId: 'helper-luna',
                helperDisplayName: 'Luna ✨',
                resolved_by_seeker: true,
                summary: "Connected with Luna who provided excellent breathing techniques and workplace boundary strategies. Panic attacks have reduced significantly."
            },
            // Community content from other users
            ...this.getStarkeeperDilemmas('demo-user-001')
        ];
    }

    getHelperChatSessions(): ChatSession[] {
        return [
            {
                dilemmaId: 'dilemma-001',
                messages: [
                    {
                        id: 'msg-001',
                        sender: 'user',
                        text: "Thank you for reaching out. I really need someone to talk to about these panic attacks.",
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'msg-002',
                        sender: 'poster',
                        text: "I'm here to listen and support you. Panic attacks can feel overwhelming, but there are effective techniques we can explore together. Can you tell me what triggers them most at work?",
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'msg-003',
                        sender: 'user',
                        text: "Usually when my boss assigns multiple urgent deadlines at once. My chest gets tight and I can't breathe properly.",
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'msg-004',
                        sender: 'poster',
                        text: "That physical response is very common with anxiety. Let's try a grounding technique: 5-4-3-2-1. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This helps bring you back to the present moment.",
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
                    }
                ],
                unread: false,
                perspective: 'helper',
                helpSessionId: 'session-001'
            }
        ];
    }

    getHelperSessions(): HelpSession[] {
        return [
            {
                id: 'session-001',
                dilemmaId: 'dilemma-001',
                seekerId: 'demo-user-001',
                helperId: 'helper-luna',
                helperDisplayName: 'Luna ✨',
                startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                isFavorited: true,
                kudosGiven: true,
                summary: "Successful session addressing workplace panic attacks. Provided grounding techniques and boundary-setting strategies.",
                helperSummary: "Responsive client, implemented breathing techniques effectively. Recommended ongoing practice and follow-up if symptoms persist."
            },
            {
                id: 'session-002',
                dilemmaId: 'dilemma-003',
                seekerId: 'demo-user-002',
                helperId: 'helper-luna',
                helperDisplayName: 'Luna ✨',
                startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                isFavorited: false,
                kudosGiven: false,
                summary: "Ongoing session - relationship anxiety support"
            }
        ];
    }

    // Astral Admin Sample Data
    getAdminHelperApplications(): Helper[] {
        return [
            {
                id: 'helper-pending-001',
                auth0UserId: 'pending-helper-001',
                displayName: 'Alex Chen',
                bio: 'Psychology graduate with experience in peer counseling. Passionate about mental health advocacy and crisis intervention.',
                joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                helperType: 'Community',
                role: 'Community',
                reputation: 0,
                isAvailable: false,
                expertise: ['depression', 'anxiety', 'crisis-support'],
                xp: 0,
                level: 1,
                nextLevelXp: 100,
                applicationStatus: 'pending',
                applicationNotes: 'Strong background in psychology. Completed crisis intervention training. References pending verification.',
                trainingCompleted: true,
                quizScore: 88
            },
            {
                id: 'helper-rejected-001',
                auth0UserId: 'rejected-helper-001',
                displayName: 'Sam Johnson',
                bio: 'Want to help people with their problems.',
                joinDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                helperType: 'Community',
                role: 'Community',
                reputation: 0,
                isAvailable: false,
                expertise: ['general'],
                xp: 0,
                level: 1,
                nextLevelXp: 100,
                applicationStatus: 'rejected',
                applicationNotes: 'Insufficient training completion. Bio lacks professionalism. Quiz score below threshold.',
                trainingCompleted: false,
                quizScore: 45
            }
        ];
    }

    getAdminModerationActions(): ModerationAction[] {
        return [
            {
                id: 'mod-001',
                type: 'content_removal',
                targetId: 'dilemma-removed-001',
                moderatorId: 'admin-001',
                userId: 'user-flagged-001',
                action: 'Post Removed',
                reason: 'Inappropriate content - sharing personal contact information',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                relatedContentId: 'dilemma-removed-001'
            },
            {
                id: 'mod-002',
                type: 'user_warning',
                targetId: 'user-warned-001',
                moderatorId: 'admin-001',
                userId: 'user-warned-001',
                action: 'Warning Issued',
                reason: 'Multiple reports for aggressive language in chat sessions',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            },
            {
                id: 'mod-003',
                type: 'helper_suspension',
                targetId: 'helper-suspended-001',
                moderatorId: 'admin-001',
                userId: 'helper-suspended-001',
                action: 'Helper Suspended',
                reason: 'Violation of helper guidelines - providing medical advice beyond scope',
                timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            }
        ];
    }

    getAdminCommunityStats(): CommunityStats {
        return {
            activeDilemmas: 47,
            avgTimeToFirstSupport: "8m 32s",
            totalHelpers: 23,
            mostCommonCategory: "anxiety"
        };
    }

    // Comprehensive Astral Admin Profile & Dashboard Data
    getAstralAdminProfile(): any {
        return {
            id: 'admin-001',
            name: 'Dr. Michael Torres',
            displayName: 'Dr. Michael Torres',
            role: 'Admin',
            department: 'Platform Operations & Safety',
            clearanceLevel: 'Executive',
            yearsWithPlatform: 3,
            profilePicture: '/demo-images/admin-torres.jpg',
            contactInfo: {
                email: 'm.torres@astralcore.org',
                phone: '+1-555-0123',
                emergencyContact: '+1-555-0199'
            },
            
            // Helper Applications to Review
            helperApplications: [
                {
                    id: 'app-001',
                    applicantName: 'Dr. Lisa Wang',
                    applicationType: 'New Helper Application',
                    submissionDate: new Date('2024-01-10T09:15:00'),
                    status: 'pending_review',
                    priority: 'high',
                    credentials: ['Licensed Psychologist', 'PhD Clinical Psychology', '10+ years experience'],
                    specialties: ['Trauma Recovery', 'Addiction Support', 'Family Therapy'],
                    backgroundCheckStatus: 'completed',
                    referencesVerified: true,
                    reviewNotes: 'Strong credentials, excellent references. Recommend approval.',
                    riskAssessment: 'low'
                },
                {
                    id: 'app-002',
                    applicantName: 'Jordan Smith',
                    applicationType: 'Peer Support Specialist',
                    submissionDate: new Date('2024-01-12T14:30:00'),
                    status: 'under_review',
                    priority: 'medium',
                    credentials: ['Certified Peer Support Specialist', 'Lived Experience Advocate'],
                    specialties: ['Depression Support', 'Recovery Journey'],
                    backgroundCheckStatus: 'in_progress',
                    referencesVerified: false,
                    reviewNotes: 'Awaiting final reference verification.',
                    riskAssessment: 'low'
                },
                {
                    id: 'app-003',
                    applicantName: 'Alex Chen',
                    applicationType: 'Crisis Intervention Specialist',
                    submissionDate: new Date('2024-01-08T11:45:00'),
                    status: 'flagged',
                    priority: 'urgent',
                    credentials: ['Crisis Intervention Certification'],
                    specialties: ['Suicide Prevention', 'Emergency Response'],
                    backgroundCheckStatus: 'flagged',
                    referencesVerified: true,
                    reviewNotes: 'Background check revealed undisclosed prior incident. Requires executive review.',
                    riskAssessment: 'high'
                }
            ],
            
            // Escalated Moderation Cases
            escalatedCases: [
                {
                    id: 'esc-001',
                    type: 'serious_safety_concern',
                    description: 'User posted detailed self-harm plan in community forum',
                    reportedBy: 'guide-001',
                    escalationTime: new Date('2024-01-15T16:20:00'),
                    status: 'urgent_intervention',
                    userInvolved: 'user-crisis-003',
                    actionsTaken: ['Immediate crisis intervention', 'Emergency contact notified', 'Professional referral initiated'],
                    outcome: 'pending',
                    followUpRequired: true
                },
                {
                    id: 'esc-002',
                    type: 'helper_boundary_violation',
                    description: 'Helper provided personal contact information to user',
                    reportedBy: 'automated_system',
                    escalationTime: new Date('2024-01-14T22:15:00'),
                    status: 'under_investigation',
                    helperInvolved: 'guide-003',
                    actionsTaken: ['Temporary suspension', 'Investigation initiated', 'User safety verified'],
                    outcome: 'investigation_ongoing',
                    followUpRequired: true
                },
                {
                    id: 'esc-003',
                    type: 'platform_security_incident',
                    description: 'Unauthorized access attempt to admin dashboard',
                    reportedBy: 'security_system',
                    escalationTime: new Date('2024-01-13T03:45:00'),
                    status: 'resolved',
                    actionsTaken: ['IP blocked', 'Security protocols updated', 'Access logs reviewed'],
                    outcome: 'threat_neutralized',
                    followUpRequired: false
                }
            ],
            
            // Platform Analytics Dashboard
            analytics: {
                userMetrics: {
                    totalActiveUsers: 15724,
                    newRegistrationsToday: 47,
                    dailyActiveUsers: 3892,
                    weeklyActiveUsers: 8456,
                    userRetentionRate: 78.3,
                    averageSessionDuration: 23.5
                },
                helperMetrics: {
                    totalActiveHelpers: 324,
                    averageResponseTime: 8.2,
                    helpersOnline: 89,
                    totalSessionsToday: 156,
                    helperSatisfactionRating: 4.7,
                    helperUtilizationRate: 67.8
                },
                crisisMetrics: {
                    crisisAlertsToday: 12,
                    averageResponseTimeToCrisis: 4.3,
                    crisisResolutionRate: 94.2,
                    escalationRate: 8.7,
                    emergencyContactsActivated: 3,
                    preventionSuccessRate: 91.5
                },
                platformHealth: {
                    systemUptime: 99.97,
                    averagePageLoadTime: 1.2,
                    errorRate: 0.03,
                    dataBackupStatus: 'current',
                    securityIncidents: 0,
                    performanceScore: 96.8
                }
            },
            
            // Community Health Monitoring
            communityHealth: {
                totalPosts: 1847,
                flaggedContent: 23,
                moderatedContent: 156,
                positiveSentimentRate: 73.4,
                engagementRate: 45.2,
                reportedIncidents: 8,
                communityGuidanceInterventions: 34
            },
            
            // Quality Assurance Metrics
            qualityMetrics: {
                helperPerformanceReviews: 12,
                userSatisfactionScore: 4.6,
                platformFeatureUsage: {
                    journaling: 89.3,
                    peerSupport: 67.8,
                    crisisSupport: 23.4,
                    resourceLibrary: 56.7,
                    moodTracking: 78.9
                },
                completedAudits: 4,
                pendingAudits: 2
            },
            
            // Administrative Actions Log
            recentActions: [
                {
                    id: 'action-001',
                    type: 'helper_approval',
                    description: 'Approved new helper application for Dr. Amanda Rodriguez',
                    timestamp: new Date('2024-01-15T10:30:00'),
                    adminUser: 'admin-001'
                },
                {
                    id: 'action-002',
                    type: 'policy_update',
                    description: 'Updated crisis intervention protocols per new guidelines',
                    timestamp: new Date('2024-01-14T15:45:00'),
                    adminUser: 'admin-001'
                },
                {
                    id: 'action-003',
                    type: 'security_enhancement',
                    description: 'Implemented additional 2FA requirements for helpers',
                    timestamp: new Date('2024-01-13T09:20:00'),
                    adminUser: 'admin-001'
                }
            ],
            
            // System Alerts
            systemAlerts: [
                {
                    id: 'alert-001',
                    type: 'performance',
                    severity: 'medium',
                    message: 'Database query response time above threshold in crisis support module',
                    timestamp: new Date('2024-01-15T14:20:00'),
                    status: 'acknowledged'
                },
                {
                    id: 'alert-002',
                    type: 'security',
                    severity: 'low',
                    message: 'Multiple failed login attempts from IP range 192.168.1.x',
                    timestamp: new Date('2024-01-15T11:35:00'),
                    status: 'monitoring'
                }
            ]
        };
    }

    // Community Content for All Users
    getCommunityReflections(): Reflection[] {
        return [
            {
                id: 'reflection-001',
                userToken: 'community-user-001',
                content: "Today I realized that healing isn't linear. Some days are harder than others, and that's okay. Progress isn't always visible from the inside. 🌱",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                reactions: { light: 15, heart: 8, strength: 12 },
                myReaction: 'light'
            },
            {
                id: 'reflection-002',
                userToken: 'community-user-002',
                content: "Grateful for this community. Yesterday I was in a dark place, but reading everyone's stories reminded me I'm not alone. Sometimes just knowing others understand makes all the difference.",
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                reactions: { heart: 22, light: 18, hug: 9 }
            },
            {
                id: 'reflection-003',
                userToken: 'demo-user-001',
                content: "Six months ago I couldn't leave my apartment without panic attacks. Today I gave a presentation at work. The breathing techniques from my guide Luna really work. If you're struggling, please reach out - it gets better. 💙",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                reactions: { strength: 28, light: 31, heart: 19 }
            }
        ];
    }

    getForumThreads(): ForumThread[] {
        return [
            {
                id: 'thread-001',
                title: 'Crisis Intervention Best Practices - Updated Guidelines',
                authorId: 'helper-luna',
                authorName: 'Luna ✨',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                postCount: 12,
                lastReply: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: 'thread-002',
                title: 'Supporting Users with Workplace Anxiety - Strategies and Resources',
                authorId: 'admin-001',
                authorName: 'Demo Astral Admin',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                postCount: 8,
                lastReply: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    // AI Chat Demo Scenarios
    getAIChatDemoSession(): AIChatSession {
        return {
            id: 'ai-session-001',
            startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'active',
            messages: [
                {
                    id: 'ai-msg-001',
                    sender: 'user',
                    text: "I'm feeling really anxious about a job interview tomorrow. My mind keeps racing with all the things that could go wrong.",
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                },
                {
                    id: 'ai-msg-002',
                    sender: 'ai',
                    text: "It's completely natural to feel anxious before an important interview. This shows the opportunity matters to you. Let's work through some techniques to help you feel more prepared and calm. Can you tell me what specific concerns are weighing on your mind?",
                    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString()
                },
                {
                    id: 'ai-msg-003',
                    sender: 'user',
                    text: "I'm worried I'll blank out when they ask me questions, or that I'll say something wrong and embarrass myself.",
                    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
                },
                {
                    id: 'ai-msg-004',
                    sender: 'ai',
                    text: "Those are very common interview worries. Here are some strategies that can help:\n\n1. **Practice the STAR method** (Situation, Task, Action, Result) for answering behavioral questions\n2. **Prepare 3-5 key stories** about your experiences that showcase your skills\n3. **Use box breathing**: Inhale for 4, hold for 4, exhale for 4, hold for 4\n\nWould you like to practice one of these techniques right now?",
                    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    // Crisis Escalation Demo Data
    getCrisisScenarioData() {
        return {
            dilemma: {
                id: 'crisis-001',
                userToken: 'crisis-user-001',
                category: 'crisis',
                content: "I can't take this anymore. Everything feels hopeless and I don't see the point in continuing. I've been thinking about ending it all.",
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                supportCount: 0,
                isSupported: false,
                isReported: true,
                reportReason: 'Crisis - immediate intervention needed',
                status: 'in_progress',
                assignedHelperId: 'helper-crisis-specialist',
                helperDisplayName: 'Crisis Support Team'
            },
            chatMessages: [
                {
                    id: 'crisis-msg-001',
                    sender: 'poster' as const,
                    text: "I see you're going through an incredibly difficult time right now, and I want you to know that reaching out here took courage. You matter, and there are people who want to help. Can you tell me if you're in a safe place right now?",
                    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
                },
                {
                    id: 'crisis-msg-002',
                    sender: 'poster' as const,
                    text: "I'm connecting you with our crisis specialists and providing immediate resources. The National Suicide Prevention Lifeline is available 24/7 at 988. You don't have to go through this alone.",
                    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    // Interconnected Workflow: User → Helper → Admin
    getInterconnectedWorkflowData(): any {
        return {
            // STEP 1: User posts vulnerable content that triggers AI concern detection
            userPost: {
                id: 'workflow-dilemma-001',
                userToken: 'demo-user-workflow',
                username: 'Hope_Seeker_22',
                category: 'crisis-support',
                content: "I've been having really dark thoughts lately and I don't know how to make them stop. Everything feels pointless and I'm wondering if people would be better off without me. I keep thinking about ways to just... not be here anymore. I don't want to feel this way but I can't see any way out.",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                supportCount: 0,
                isSupported: false,
                isReported: false,
                status: 'crisis_detected',
                aiConcernLevel: 'high',
                aiFlags: ['suicidal_ideation', 'hopelessness', 'social_withdrawal'],
                triggerKeywords: ['dark thoughts', 'pointless', 'better off without me', 'not be here'],
                riskAssessment: 'immediate_intervention_required'
            },

            // STEP 2: AI Detection and Automatic Helper Assignment
            aiDetectionResponse: {
                detectionTime: new Date(Date.now() - 3 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(), // 2 mins after post
                confidenceScore: 0.94,
                riskLevel: 'critical',
                flaggedConcerns: ['suicidal_ideation', 'immediate_danger', 'hopelessness'],
                automatedActions: [
                    'Crisis specialist immediately notified',
                    'Post prioritized in helper queue',
                    'Safety resources automatically shared',
                    'Admin alerted for potential escalation'
                ],
                assignedHelperId: 'helper-crisis-001',
                helperDisplayName: 'Dr. Sarah Chen - Crisis Specialist'
            },

            // STEP 3: Helper Response and Intervention
            helperIntervention: {
                responderId: 'helper-crisis-001',
                responderName: 'Dr. Sarah Chen',
                responderCredentials: ['Licensed Clinical Psychologist', 'Crisis Intervention Specialist', '15+ years experience'],
                responseTime: new Date(Date.now() - 3 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(), // 8 mins after post
                initialResponse: "Thank you for reaching out and sharing what you're going through - that took incredible courage. I want you to know that you're not alone, and these feelings, while overwhelming right now, can change. Your life has value and meaning. I'm here to support you through this difficult time.",
                interventionActions: [
                    'Immediate safety assessment conducted',
                    'Crisis resources provided',
                    'Safety plan development initiated',
                    'Professional referral offered',
                    'Follow-up session scheduled'
                ],
                safetyPlan: {
                    immediateSteps: [
                        'If in immediate danger, call 988 (Suicide & Crisis Lifeline)',
                        'Reach out to trusted friend/family member',
                        'Remove any means of self-harm from immediate environment',
                        'Stay in public/safe spaces'
                    ],
                    copingStrategies: [
                        'Deep breathing exercises (4-7-8 technique)',
                        'Grounding technique: 5-4-3-2-1 sensory awareness',
                        'Listen to calming music or favorite podcast',
                        'Take a warm shower or bath'
                    ],
                    supportContacts: [
                        'Crisis Lifeline: 988',
                        'Crisis Text Line: Text HOME to 741741',
                        'Emergency Services: 911',
                        'Platform Crisis Support: Available 24/7'
                    ]
                },
                outcomeAssessment: 'user_stabilized_accepting_help'
            },

            // STEP 4: Admin Review and Oversight
            adminReview: {
                reviewerId: 'admin-001',
                reviewerName: 'Dr. Michael Torres',
                reviewTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 1 hour later
                reviewType: 'crisis_intervention_audit',
                findings: {
                    helperResponse: 'excellent_professional_appropriate',
                    timeToResponse: 'within_acceptable_range',
                    interventionQuality: 'comprehensive_effective',
                    safetyMeasures: 'all_protocols_followed',
                    userOutcome: 'positive_engagement_achieved'
                },
                adminActions: [
                    'Helper performance commended',
                    'Crisis response documented for training',
                    'User added to enhanced monitoring list',
                    'Quality assurance metrics updated',
                    'Follow-up reminder scheduled'
                ],
                qualityScore: 9.7,
                recommendedImprovements: [
                    'Consider shorter initial response time target',
                    'Add automated resource delivery enhancement'
                ],
                escalationDecision: 'no_further_escalation_needed',
                followUpRequired: true,
                followUpScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
            },

            // STEP 5: Positive Resolution Tracking
            resolutionTracking: {
                outcomeId: 'resolution-workflow-001',
                currentStatus: 'stable_with_support',
                timeToStabilization: '2 hours 15 minutes',
                interventionsUsed: [
                    'Crisis counselor immediate response',
                    'Safety plan implementation',
                    'Professional referral accepted',
                    'Ongoing platform support established'
                ],
                userFeedback: {
                    rating: 5,
                    comment: "Dr. Chen saved my life. I felt heard and supported when I had nowhere else to turn. The safety plan helped me get through the worst moments, and knowing help is available 24/7 gives me hope.",
                    wouldRecommend: true,
                    followUpAccepted: true
                },
                platformMetrics: {
                    crisisResolutionSuccess: true,
                    emergencyContactActivated: false,
                    professionalReferralCompleted: true,
                    userRetainedOnPlatform: true,
                    helperKudosReceived: true
                },
                longTermOutcome: 'user_engaging_ongoing_support'
            }
        };
    }

    // Additional Interconnected Scenarios
    getMultipleWorkflowScenarios(): any {
        return {
            // SCENARIO 1: Workplace Boundary Violation → Helper Response → Admin Action
            scenario1: {
                userReport: {
                    id: 'violation-report-001',
                    reportingUser: 'demo-user-002',
                    reportedHelper: 'helper-boundary-violation',
                    incidentType: 'inappropriate_contact',
                    description: "Helper shared their personal phone number and suggested meeting in person outside the platform. This made me very uncomfortable.",
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    evidence: [
                        'Chat logs showing personal contact sharing',
                        'Screenshot of meeting suggestion message'
                    ],
                    reportStatus: 'under_investigation'
                },
                helperPerspective: {
                    helperId: 'helper-boundary-violation',
                    helperName: 'Jake Morrison',
                    incidentFromHelperView: "I thought I was being helpful by offering more personal support. I didn't realize this violated platform guidelines.",
                    violationType: 'professional_boundary_crossed',
                    priorViolations: 0,
                    accountStatus: 'temporarily_suspended',
                    remedialAction: 'mandatory_retraining_required'
                },
                adminResponse: {
                    investigatingAdmin: 'admin-001',
                    investigationStarted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    investigationFindings: [
                        'Clear boundary violation confirmed',
                        'User safety compromised',
                        'Helper training deficiency identified',
                        'No malicious intent detected'
                    ],
                    actionsTaken: [
                        'Helper temporarily suspended',
                        'Mandatory retraining scheduled',
                        'User provided additional support',
                        'Platform guidelines clarified',
                        'Monitoring increased for this helper'
                    ],
                    resolutionTime: '4 hours 30 minutes',
                    outcome: 'violation_confirmed_training_required'
                }
            },

            // SCENARIO 2: Community Content Escalation → Moderation → Policy Update
            scenario2: {
                communityPost: {
                    id: 'flagged-content-001',
                    authorId: 'user-problematic-001',
                    category: 'general_discussion',
                    content: "I found a way to get prescription medication without seeing a doctor. DM me if you want to know how. These doctors don't understand what we really need.",
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    flags: ['illegal_activity', 'medication_advice', 'safety_concern'],
                    reportCount: 7,
                    reportReasons: ['Promoting illegal activity', 'Unsafe medical advice', 'Community safety']
                },
                helperModeration: {
                    moderatingHelper: 'helper-moderator-001',
                    moderatorName: 'Lisa Rodriguez',
                    reviewTime: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
                    moderationDecision: 'remove_and_escalate',
                    justification: 'Content promotes illegal medication acquisition and poses serious safety risks to community members',
                    immediateActions: [
                        'Post removed from community',
                        'User notified of violation',
                        'Case escalated to admin team',
                        'Similar content scan initiated'
                    ],
                    riskAssessment: 'high_community_safety_risk'
                },
                adminPolicyResponse: {
                    reviewingAdmin: 'admin-001',
                    escalationReview: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                    policyImplications: [
                        'Medication advice guidelines need strengthening',
                        'Automated detection filters require enhancement',
                        'Helper training modules need updating'
                    ],
                    systemChanges: [
                        'Enhanced keyword detection for medication-related content',
                        'Automatic escalation for drug-related posts',
                        'Community guidelines updated',
                        'Helper training curriculum revised'
                    ],
                    preventiveMeasures: [
                        'Proactive content scanning implemented',
                        'Educational resources about medication safety added',
                        'Community awareness campaign launched'
                    ],
                    outcome: 'policy_strengthened_prevention_improved'
                }
            },

            // SCENARIO 3: Positive Success Story → Recognition → Platform Improvement
            scenario3: {
                successStory: {
                    userId: 'user-success-001',
                    username: 'GrowingStronger',
                    journeyDuration: '6 months',
                    initialState: 'severe_anxiety_depression_isolation',
                    supportReceived: [
                        'Regular sessions with certified helper Dr. Amanda',
                        'Peer support group participation',
                        'Crisis intervention during difficult periods',
                        'Resource library utilization',
                        'Community engagement growth'
                    ],
                    currentState: 'stable_managing_well_helping_others',
                    testimonal: "Six months ago I could barely leave my house. Now I'm not only managing my anxiety but I'm here supporting others. This platform literally saved my life and gave me purpose.",
                    metricsImprovement: {
                        anxietyReduction: '70%',
                        depressionImprovement: '65%',
                        socialConnection: '300% increase',
                        selfEfficacy: '80% improvement',
                        qualityOfLife: '85% improvement'
                    }
                },
                helperRecognition: {
                    helperId: 'helper-amanda-success',
                    helperName: 'Dr. Amanda Rodriguez',
                    caseOutcome: 'exceptional_success',
                    clientProgress: 'transformational_recovery',
                    supportQuality: 'exemplary_professional_caring',
                    recognition: [
                        'Helper of the Month award',
                        'Case study selected for training materials',
                        'Peer recognition from helper community',
                        'Client testimonial featured'
                    ],
                    platformImpact: 'demonstrates_platform_effectiveness'
                },
                adminAnalysis: {
                    analysisType: 'success_case_study',
                    keyFactors: [
                        'Consistent long-term support relationship',
                        'Multi-modal platform feature utilization',
                        'Effective crisis intervention when needed',
                        'Community integration and peer support',
                        'Resource accessibility and engagement'
                    ],
                    platformInsights: [
                        'Long-term helper relationships drive better outcomes',
                        'Crisis support safety net enables risk-taking in growth',
                        'Community connection accelerates recovery',
                        'Resource variety meets diverse learning styles'
                    ],
                    implementedImprovements: [
                        'Helper continuity program enhanced',
                        'Community connection features expanded',
                        'Crisis support protocols refined',
                        'Success milestone tracking added'
                    ],
                    outcomeForPlatform: 'evidence_based_feature_enhancement'
                }
            }
        };
    }

    // Initialize demo data based on user type
    initializeDemoData(userType: 'user' | 'helper' | 'admin', userToken: string) {
        const data: any = {};

        // Add interconnected workflow data for all user types
        const workflowData = this.getInterconnectedWorkflowData();
        const multipleScenarios = this.getMultipleWorkflowScenarios();
        const crisisScenarios = this.getCrisisEscalationScenarios();

        if (userType === 'user') {
            data.journalEntries = this.getStarkeeperJournalEntries(userToken);
            data.moodCheckIns = this.getStarkeeperMoodCheckIns(userToken);
            data.dilemmas = this.getStarkeeperDilemmas(userToken);
            data.assessments = this.getStarkeeperAssessments(userToken);
            
            // Add workflow data from user perspective
            data.workflowExample = {
                myPost: workflowData.userPost,
                helperSupport: workflowData.helperIntervention,
                safetyPlan: workflowData.helperIntervention.safetyPlan,
                myFeedback: workflowData.resolutionTracking.userFeedback,
                ongoingSupport: workflowData.resolutionTracking
            };
            
            // Add additional scenarios from user perspective
            data.platformExamples = {
                crisisSupport: workflowData,
                boundaryProtection: multipleScenarios.scenario1.userReport,
                communityGuidelines: multipleScenarios.scenario2.communityPost,
                successStory: multipleScenarios.scenario3.successStory
            };

            // Add crisis escalation scenarios from user perspective
            data.crisisScenarios = {
                suicidalCrisis: {
                    myPost: crisisScenarios.immediateRisk.userPost,
                    helpReceived: crisisScenarios.immediateRisk.helperResponse,
                    safetyPlan: crisisScenarios.immediateRisk.helperResponse.safetyInterventions,
                    outcome: crisisScenarios.immediateRisk.resolutionTracking
                },
                domesticViolenceCrisis: {
                    myPost: crisisScenarios.domesticViolence.userPost,
                    helpReceived: crisisScenarios.domesticViolence.helperResponse,
                    safetyPlan: crisisScenarios.domesticViolence.helperResponse.safetyActions,
                    outcome: crisisScenarios.domesticViolence.resolutionTracking
                },
                substanceCrisis: {
                    myPost: crisisScenarios.substanceAbuseCrisis.userPost,
                    helpReceived: crisisScenarios.substanceAbuseCrisis.helperResponse,
                    medicalSupport: crisisScenarios.substanceAbuseCrisis.helperResponse.medicalGuidance,
                    outcome: crisisScenarios.substanceAbuseCrisis.resolutionTracking
                }
            };
        } else if (userType === 'helper') {
            data.profile = this.getConstellationGuideProfile();
            data.chatSessions = this.getHelperChatSessions();
            data.helpSessions = this.getHelperSessions();
            data.allDilemmas = this.getAllDilemmasForHelper();
            
            // Add workflow data from helper perspective
            data.workflowExample = {
                crisisAlert: workflowData.userPost,
                aiDetection: workflowData.aiDetectionResponse,
                myIntervention: workflowData.helperIntervention,
                adminReview: workflowData.adminReview,
                outcome: workflowData.resolutionTracking
            };
            
            // Add additional scenarios from helper perspective
            data.helperScenarios = {
                crisisIntervention: workflowData.helperIntervention,
                boundaryTraining: multipleScenarios.scenario1.helperPerspective,
                contentModeration: multipleScenarios.scenario2.helperModeration,
                successRecognition: multipleScenarios.scenario3.helperRecognition
            };

            // Add crisis escalation scenarios from helper perspective
            data.crisisInterventions = {
                suicideIntervention: {
                    crisisAlert: crisisScenarios.immediateRisk.userPost,
                    aiAssessment: crisisScenarios.immediateRisk.aiDetection,
                    myResponse: crisisScenarios.immediateRisk.helperResponse,
                    adminBackup: crisisScenarios.immediateRisk.adminEscalation,
                    outcome: crisisScenarios.immediateRisk.resolutionTracking
                },
                domesticViolenceIntervention: {
                    crisisAlert: crisisScenarios.domesticViolence.userPost,
                    aiAssessment: crisisScenarios.domesticViolence.aiDetection,
                    myResponse: crisisScenarios.domesticViolence.helperResponse,
                    adminBackup: crisisScenarios.domesticViolence.adminEscalation,
                    outcome: crisisScenarios.domesticViolence.resolutionTracking
                },
                medicalEmergencyIntervention: {
                    crisisAlert: crisisScenarios.substanceAbuseCrisis.userPost,
                    aiAssessment: crisisScenarios.substanceAbuseCrisis.aiDetection,
                    myResponse: crisisScenarios.substanceAbuseCrisis.helperResponse,
                    adminBackup: crisisScenarios.substanceAbuseCrisis.adminEscalation,
                    outcome: crisisScenarios.substanceAbuseCrisis.resolutionTracking
                }
            };
        } else if (userType === 'admin') {
            data.profile = this.getAstralAdminProfile();
            data.helperApplications = this.getAdminHelperApplications();
            data.moderationActions = this.getAdminModerationActions();
            data.communityStats = this.getAdminCommunityStats();
            
            // Add workflow data from admin perspective
            data.workflowExample = {
                incidentOverview: workflowData.userPost,
                aiSystem: workflowData.aiDetectionResponse,
                helperResponse: workflowData.helperIntervention,
                myReview: workflowData.adminReview,
                systemMetrics: workflowData.resolutionTracking.platformMetrics,
                qualityAssurance: workflowData.adminReview.findings
            };
            
            // Add comprehensive admin oversight scenarios
            data.adminOversight = {
                crisisManagement: workflowData.adminReview,
                boundaryEnforcement: multipleScenarios.scenario1.adminResponse,
                policyDevelopment: multipleScenarios.scenario2.adminPolicyResponse,
                successAnalysis: multipleScenarios.scenario3.adminAnalysis
            };

            // Add crisis escalation scenarios from admin perspective
            data.crisisManagement = {
                suicideCrisisOversight: {
                    incident: crisisScenarios.immediateRisk.userPost,
                    aiSystem: crisisScenarios.immediateRisk.aiDetection,
                    helperResponse: crisisScenarios.immediateRisk.helperResponse,
                    myEscalation: crisisScenarios.immediateRisk.adminEscalation,
                    systemMetrics: crisisScenarios.immediateRisk.resolutionTracking
                },
                domesticViolenceCrisisOversight: {
                    incident: crisisScenarios.domesticViolence.userPost,
                    aiSystem: crisisScenarios.domesticViolence.aiDetection,
                    helperResponse: crisisScenarios.domesticViolence.helperResponse,
                    myEscalation: crisisScenarios.domesticViolence.adminEscalation,
                    systemMetrics: crisisScenarios.domesticViolence.resolutionTracking
                },
                medicalEmergencyCrisisOversight: {
                    incident: crisisScenarios.substanceAbuseCrisis.userPost,
                    aiSystem: crisisScenarios.substanceAbuseCrisis.aiDetection,
                    helperResponse: crisisScenarios.substanceAbuseCrisis.helperResponse,
                    myEscalation: crisisScenarios.substanceAbuseCrisis.adminEscalation,
                    systemMetrics: crisisScenarios.substanceAbuseCrisis.resolutionTracking
                }
            };
        }

        // Common data for all user types
        data.communityReflections = this.getCommunityReflections();
        data.forumThreads = this.getForumThreads();
        data.aiChatSession = this.getAIChatDemoSession();
        data.crisisScenario = this.getCrisisScenarioData();

        // Store in localStorage with demo prefix
        localStorage.setItem(`demo_data_${userType}`, JSON.stringify(data));
        
        return data;
    }

    // Get demo data for current user
    getDemoData(userType: 'user' | 'helper' | 'admin'): any {
        try {
            const stored = localStorage.getItem(`demo_data_${userType}`);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (parseError) {
                    // If stored data is malformed, regenerate it
                    console.warn('Malformed demo data found, regenerating...');
                }
            }
        } catch (storageError) {
            // If localStorage is not available or throws an error
            console.warn('localStorage error, generating fresh demo data');
        }
        
        // Initialize if not found or on error
        let userToken = 'demo-token-' + Date.now();
        try {
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const parsed = JSON.parse(demoUser);
                if (parsed && parsed.sub) {
                    userToken = parsed.sub;
                }
            }
        } catch (e) {
            // Use default token if parsing fails
        }
            
        return this.initializeDemoData(userType, userToken);
    }

    // Clear demo data (for reset/logout)
    clearDemoData() {
        localStorage.removeItem('demo_data_user');
        localStorage.removeItem('demo_data_helper');
        localStorage.removeItem('demo_data_admin');
    }

    // Comprehensive Crisis Escalation Scenarios
    getCrisisEscalationScenarios(): any {
        return {
            // SCENARIO 1: Immediate Danger - Suicidal Ideation with Plan
            immediateRisk: {
                // Step 1: User posts crisis content
                userPost: {
                    id: 'crisis-immediate-001',
                    userToken: 'user-crisis-immediate',
                    username: 'desperateforanswers_92',
                    category: 'crisis-support',
                    content: "I can't do this anymore. I have pills saved up and tonight feels like the right time. I've written letters to everyone. My family will be better off without the burden of dealing with me. I just wanted to say goodbye to this community that tried to help.",
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
                    supportCount: 0,
                    isSupported: false,
                    isReported: false,
                    status: 'critical_crisis_detected',
                    aiFlags: ['suicide_plan', 'means_available', 'imminent_danger', 'goodbye_message'],
                    riskLevel: 'critical',
                    urgencyScore: 10
                },

                // Step 2: AI Detection Response (< 30 seconds)
                aiDetection: {
                    detectionTime: new Date(Date.now() - 4.5 * 60 * 1000).toISOString(),
                    algorithm: 'Advanced Crisis Detection v3.2',
                    confidenceScore: 0.98,
                    riskFactors: [
                        'Specific method mentioned (pills)',
                        'Expressed intent with timeline (tonight)',
                        'Farewell behavior (letters written)',
                        'Burden narrative (family better off)',
                        'Finality language (goodbye message)'
                    ],
                    automatedActions: [
                        'Crisis alert to all available specialists',
                        'Emergency contact protocol activated',
                        'Content flagged for immediate intervention',
                        'User IP geo-location for emergency services',
                        'Admin escalation triggered automatically'
                    ],
                    estimatedTimeToAct: '15-30 minutes based on post language'
                },

                // Step 3: Helper Crisis Response (within 2 minutes)
                helperResponse: {
                    responderId: 'helper-crisis-specialist-001',
                    responderName: 'Dr. Emma Williams',
                    credentials: ['Licensed Clinical Psychologist', 'Crisis Intervention Specialist', 'Suicide Prevention Certified'],
                    responseTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 2 minutes after post
                    urgencyProtocol: 'Level 1 - Imminent Danger',
                    initialResponse: "I can see you're in tremendous pain right now, and I'm so glad you reached out here. Your life has value and meaning, even when it doesn't feel that way. I'm a crisis specialist and I'm here with you right now. Please don't take those pills tonight. Can you help me understand what's making tonight feel different?",
                    immediateActions: [
                        'Private crisis chat initiated',
                        'Emergency protocols activated',
                        'Safety plan deployment',
                        'Crisis lifeline numbers provided',
                        'Emergency contact authorization requested'
                    ],
                    safetyInterventions: [
                        'Pills removal from immediate area',
                        'Crisis hotline: 988 Suicide & Crisis Lifeline',
                        'Text support: HOME to 741741',
                        'Emergency services: 911 if immediate danger',
                        'Trusted person notification'
                    ],
                    riskMitigation: 'Active engagement, safety contracting, means restriction'
                },

                // Step 4: Admin Emergency Escalation (within 5 minutes)
                adminEscalation: {
                    escalatedBy: 'helper-crisis-specialist-001',
                    reviewingAdmin: 'admin-crisis-001',
                    adminName: 'Dr. Michael Torres - Crisis Director',
                    escalationTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    escalationReason: 'Imminent danger with specific plan and means',
                    emergencyProtocols: [
                        'Emergency services notification prepared',
                        'Crisis team assembly activated',
                        'Legal emergency contact override authorized',
                        'Platform crisis mode engaged',
                        'Follow-up intervention scheduled'
                    ],
                    legalActions: 'Emergency contact authorization under crisis intervention protocols',
                    resourcesDeployed: [
                        'Crisis specialist team (3 helpers assigned)',
                        'Emergency counselor on standby',
                        'Legal emergency contact procedures',
                        'Local crisis center notification',
                        '24-hour monitoring activated'
                    ]
                },

                // Step 5: Resolution Tracking
                resolutionTracking: {
                    currentStatus: 'crisis_stabilized_monitoring',
                    timeToStabilization: '47 minutes',
                    interventionSuccess: true,
                    emergencyServicesContacted: false, // User accepted help voluntarily
                    safetyPlanImplemented: true,
                    ongoingSupport: 'Intensive 72-hour monitoring with daily check-ins',
                    outcome: 'User agreed to remove pills, contacted trusted friend, emergency contact notified, professional referral accepted',
                    followUpScheduled: [
                        '2-hour safety check-in',
                        '24-hour crisis counselor session',
                        '72-hour platform welfare check',
                        'Weekly therapy referral appointment'
                    ]
                }
            },

            // SCENARIO 2: Domestic Violence Crisis with Escalation
            domesticViolence: {
                userPost: {
                    id: 'crisis-dv-002',
                    userToken: 'user-dv-crisis',
                    username: 'scared_but_trying',
                    category: 'crisis-support',
                    content: "He found my phone and saw I was getting help here. He's escalating and I'm scared for tonight. He took my car keys and I can't leave. My kids are asleep upstairs. I don't know what to do. If something happens to me, please know this community gave me hope when I had none.",
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    supportCount: 2,
                    isSupported: false,
                    isReported: true,
                    status: 'safety_crisis_detected',
                    aiFlags: ['domestic_violence', 'immediate_danger', 'children_involved', 'isolation_tactics'],
                    riskLevel: 'high',
                    urgencyScore: 9
                },

                aiDetection: {
                    detectionTime: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
                    algorithm: 'Domestic Violence Crisis Detection v2.1',
                    confidenceScore: 0.94,
                    riskFactors: [
                        'Escalating abuser behavior',
                        'Physical isolation (keys taken)',
                        'Children present in dangerous situation',
                        'Fear for immediate safety',
                        'Potential goodbye message'
                    ],
                    automatedActions: [
                        'Domestic violence specialist notified',
                        'Safety planning resources deployed',
                        'Local DV hotline information provided',
                        'Emergency exit strategy resources',
                        'Admin crisis team alerted'
                    ]
                },

                helperResponse: {
                    responderId: 'helper-dv-specialist-001',
                    responderName: 'Maria Santos, LCSW',
                    credentials: ['Licensed Clinical Social Worker', 'Domestic Violence Specialist', 'Child Safety Advocate'],
                    responseTime: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
                    urgencyProtocol: 'Level 2 - Immediate Safety Risk',
                    initialResponse: "I'm here with you and I believe you. This is not your fault. Your safety and your children's safety are the priority. Do you have a safe room you can go to right now? I'm going to share some immediate safety resources and we'll work through this together.",
                    safetyActions: [
                        'Immediate safety planning activated',
                        'DV hotline: 1-800-799-7233 provided',
                        'Local shelter information shared',
                        'Safety bag checklist provided',
                        'Emergency contact strategy discussed'
                    ],
                    emergencyResources: [
                        'National DV Hotline with text option',
                        'Local shelter with immediate availability',
                        'Legal advocacy resources',
                        'Child protective safety planning',
                        'Emergency transportation assistance'
                    ]
                },

                adminEscalation: {
                    escalatedBy: 'helper-dv-specialist-001',
                    reviewingAdmin: 'admin-safety-001',
                    adminName: 'Sarah Chen - Safety Operations Director',
                    escalationTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    escalationReason: 'Children at risk, immediate physical danger',
                    emergencyProtocols: [
                        'Child protection services consultation',
                        'Local law enforcement liaison',
                        'Emergency shelter coordination',
                        'Legal advocacy team notification',
                        'Crisis intervention team deployment'
                    ],
                    legalConsiderations: 'Mandatory reporting protocols for children at risk',
                    resourcesDeployed: [
                        'DV crisis team (2 specialists)',
                        'Child safety advocate',
                        'Emergency shelter coordination',
                        'Legal advocacy referral',
                        'Transportation assistance network'
                    ]
                },

                resolutionTracking: {
                    currentStatus: 'emergency_safety_plan_implemented',
                    timeToSafetyPlan: '25 minutes',
                    interventionSuccess: true,
                    emergencyServicesContacted: true, // Police wellness check requested
                    safetyPlanImplemented: true,
                    outcome: 'User and children safely relocated to shelter, police welfare check completed, legal advocacy initiated',
                    followUpScheduled: [
                        'Daily safety check-ins for 1 week',
                        'Legal advocacy appointment scheduled',
                        'Counseling for children arranged',
                        'Long-term safety planning session'
                    ]
                }
            },

            // SCENARIO 3: Substance Abuse Crisis with Medical Emergency
            substanceAbuseCrisis: {
                userPost: {
                    id: 'crisis-substance-003',
                    userToken: 'user-substance-crisis',
                    username: 'trying_to_recover',
                    category: 'crisis-support',
                    content: "I relapsed after 6 months clean and I took way too much. My heart is racing and I can't stop shaking. I'm scared I'm overdosing but I can't call anyone because I'll lose my job and my family will disown me. I don't want to die but I don't know what to do.",
                    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
                    supportCount: 1,
                    isSupported: false,
                    isReported: false,
                    status: 'medical_crisis_detected',
                    aiFlags: ['overdose_symptoms', 'medical_emergency', 'fear_of_consequences', 'immediate_danger'],
                    riskLevel: 'critical',
                    urgencyScore: 10
                },

                aiDetection: {
                    detectionTime: new Date(Date.now() - 7.5 * 60 * 1000).toISOString(),
                    algorithm: 'Medical Emergency Detection v1.8',
                    confidenceScore: 0.96,
                    riskFactors: [
                        'Physical overdose symptoms described',
                        'Fear preventing emergency contact',
                        'Substance relapse with quantity concern',
                        'Medical distress indicators',
                        'Isolation due to stigma'
                    ],
                    automatedActions: [
                        'Medical emergency specialist notified',
                        'Overdose prevention resources provided',
                        'Emergency medical guidance initiated',
                        'Crisis medical team alerted',
                        'Harm reduction resources deployed'
                    ]
                },

                helperResponse: {
                    responderId: 'helper-medical-crisis-001',
                    responderName: 'Dr. James Rodriguez, MD',
                    credentials: ['Emergency Medicine Physician', 'Addiction Medicine Specialist', 'Crisis Intervention Certified'],
                    responseTime: new Date(Date.now() - 6.5 * 60 * 1000).toISOString(),
                    urgencyProtocol: 'Level 1 - Medical Emergency',
                    initialResponse: "This is a medical emergency and you need immediate help. Your life is more important than any job or relationship. Please call 911 or go to the nearest emergency room right now. I'm a doctor and I can tell you that what you're describing sounds like you need medical attention immediately. Your family and job can be dealt with later - right now we need to keep you alive.",
                    medicalGuidance: [
                        'Immediate 911 call strongly advised',
                        'Stay awake and try to stay calm',
                        'If you have someone nearby, ask them to stay with you',
                        'Do not take any more substances',
                        'Try to remember what and how much you took'
                    ],
                    emergencyActions: [
                        'Medical emergency protocol activated',
                        'Emergency services coordination offered',
                        'Poison control center information provided',
                        'Emergency room escort service offered',
                        'Family notification support offered'
                    ]
                },

                adminEscalation: {
                    escalatedBy: 'helper-medical-crisis-001',
                    reviewingAdmin: 'admin-medical-001',
                    adminName: 'Dr. Lisa Park - Medical Crisis Director',
                    escalationTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    escalationReason: 'Life-threatening medical emergency, overdose symptoms',
                    emergencyProtocols: [
                        'Emergency medical services coordination',
                        'Hospital emergency department notification',
                        'Crisis medical team deployment',
                        'Family notification protocols',
                        'Employment protection advocacy'
                    ],
                    medicalProtocols: 'Emergency overdose intervention, medical stabilization, addiction crisis support',
                    resourcesDeployed: [
                        'Emergency medical specialist team',
                        'Hospital emergency coordination',
                        'Addiction counselor on standby',
                        'Employment rights advocate',
                        'Family support services'
                    ]
                },

                resolutionTracking: {
                    currentStatus: 'medical_emergency_resolved',
                    timeToEmergencyServices: '12 minutes',
                    interventionSuccess: true,
                    emergencyServicesContacted: true, // User called 911 with helper support
                    medicalTreatmentReceived: true,
                    outcome: 'User transported to emergency room, medically stabilized, addiction treatment referral completed, employment protection advocacy initiated',
                    followUpScheduled: [
                        'Daily recovery check-ins for 2 weeks',
                        'Addiction counselor appointment scheduled',
                        'Employment rights consultation',
                        'Family support session arranged',
                        'Relapse prevention planning'
                    ]
                }
            }
        };
    }

    // ===== COMMUNITY CONTENT METHODS =====

    getWellnessChallenges(): unknown[] {
        return [
            {
                id: 'challenge-mindfulness-001',
                title: '30-Day Mindful Moments',
                description: 'Discover the power of mindfulness with daily 5-minute practices. Each day brings a new technique to help ground yourself and find inner peace.',
                category: 'mindfulness',
                duration: 30,
                startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'helper-wellness-001',
                createdByName: 'Luna Martinez, Mindfulness Coach',
                participants: [
                    {
                        userId: 'user-mindful-001',
                        username: 'PeacefulJourney23',
                        joinedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 12,
                        totalDaysCompleted: 12,
                        isActive: true
                    },
                    {
                        userId: 'user-mindful-002',
                        username: 'SerenitySeeker',
                        joinedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 8,
                        totalDaysCompleted: 10,
                        isActive: true
                    },
                    {
                        userId: 'user-mindful-003',
                        username: 'CalmWaters88',
                        joinedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 6,
                        totalDaysCompleted: 8,
                        isActive: true
                    }
                ],
                dailyPrompts: [
                    {
                        day: 1,
                        title: 'Breath Awareness',
                        description: 'Spend 5 minutes focusing solely on your natural breath. Notice the sensation of air entering and leaving your body.',
                        type: 'mindfulness',
                        estimatedTime: '5 minutes'
                    },
                    {
                        day: 2,
                        title: 'Body Scan Meditation',
                        description: 'Slowly scan your body from head to toe, noticing any sensations without judgment.',
                        type: 'mindfulness',
                        estimatedTime: '7 minutes'
                    },
                    {
                        day: 3,
                        title: 'Mindful Walking',
                        description: 'Take a slow, deliberate walk, focusing on each step and the feeling of your feet touching the ground.',
                        type: 'action',
                        estimatedTime: '10 minutes'
                    }
                ],
                status: 'active',
                isPublic: true,
                tags: ['mindfulness', 'meditation', 'stress-relief', 'beginner-friendly']
            },
            {
                id: 'challenge-gratitude-002',
                title: 'Gratitude Garden - 21 Days',
                description: 'Cultivate an attitude of gratitude by identifying and reflecting on three things you\'re grateful for each day. Watch your perspective bloom!',
                category: 'gratitude',
                duration: 21,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'helper-gratitude-001',
                createdByName: 'Emma Chen, Positive Psychology Specialist',
                participants: [
                    {
                        userId: 'user-grateful-001',
                        username: 'SunshineSpirit',
                        joinedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 6,
                        totalDaysCompleted: 6,
                        isActive: true
                    },
                    {
                        userId: 'user-grateful-002',
                        username: 'ThankfulHeart92',
                        joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 5,
                        totalDaysCompleted: 5,
                        isActive: true
                    }
                ],
                dailyPrompts: [
                    {
                        day: 1,
                        title: 'Simple Joys',
                        description: 'Identify three simple things that brought you joy today. They can be as small as a warm cup of coffee or a smile from a stranger.',
                        type: 'gratitude',
                        estimatedTime: '5 minutes'
                    },
                    {
                        day: 2,
                        title: 'People in Your Life',
                        description: 'Think of three people you\'re grateful for and why. Consider sending one of them a message of appreciation.',
                        type: 'reflection',
                        estimatedTime: '8 minutes'
                    },
                    {
                        day: 3,
                        title: 'Personal Strengths',
                        description: 'Reflect on three personal qualities or strengths you\'re grateful to possess. How have they helped you recently?',
                        type: 'reflection',
                        estimatedTime: '10 minutes'
                    }
                ],
                status: 'active',
                isPublic: true,
                tags: ['gratitude', 'positivity', 'reflection', 'mood-boost']
            },
            {
                id: 'challenge-creativity-003',
                title: 'Creative Expression Journey',
                description: 'Explore different forms of creative expression to boost mood and self-discovery. No artistic experience required - just an open heart!',
                category: 'creativity',
                duration: 14,
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'helper-creative-001',
                createdByName: 'Alex Rivera, Art Therapist',
                participants: [
                    {
                        userId: 'user-creative-001',
                        username: 'ColorfulSoul',
                        joinedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        currentStreak: 0,
                        totalDaysCompleted: 0,
                        isActive: true
                    }
                ],
                dailyPrompts: [
                    {
                        day: 1,
                        title: 'Emotion Doodling',
                        description: 'Draw or doodle how you\'re feeling right now. Don\'t worry about it looking "good" - just let your emotions flow onto paper.',
                        type: 'creative',
                        estimatedTime: '15 minutes'
                    },
                    {
                        day: 2,
                        title: 'Poetry of the Moment',
                        description: 'Write a short poem (even just 4 lines) about something you noticed today. Focus on imagery and feeling rather than perfect rhymes.',
                        type: 'creative',
                        estimatedTime: '10 minutes'
                    }
                ],
                status: 'upcoming',
                isPublic: true,
                tags: ['creativity', 'art-therapy', 'self-expression', 'mood-boost']
            }
        ];
    }

    getGroupDiscussions(): unknown[] {
        return [
            {
                id: 'discussion-anxiety-001',
                title: 'Managing Anxiety in Daily Life',
                description: 'A supportive space to share practical strategies for managing anxiety, from breathing techniques to lifestyle adjustments. All levels of experience welcome.',
                category: 'support',
                hostId: 'helper-anxiety-001',
                hostName: 'Dr. Jennifer Walsh',
                hostType: 'helper',
                participants: [
                    {
                        userId: 'user-anxiety-001',
                        username: 'BreatheEasy23',
                        userType: 'starkeeper',
                        joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        userId: 'user-anxiety-002',
                        username: 'CalmMind88',
                        userType: 'starkeeper',
                        joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                    },
                    {
                        userId: 'helper-peer-001',
                        username: 'PeerSupporter_Maria',
                        userType: 'helper',
                        joinedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                    }
                ],
                messages: [
                    {
                        id: 'msg-anxiety-001',
                        senderId: 'helper-anxiety-001',
                        senderName: 'Dr. Jennifer Walsh',
                        senderType: 'helper',
                        content: 'Welcome everyone! Let\'s start by sharing one small victory you\'ve had this week in managing your anxiety. Remember, no victory is too small to celebrate.',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'heart', count: 5, users: ['user-anxiety-001', 'user-anxiety-002', 'helper-peer-001'] }
                        ],
                        isSupported: true,
                        supportCount: 5
                    },
                    {
                        id: 'msg-anxiety-002',
                        senderId: 'user-anxiety-001',
                        senderName: 'BreatheEasy23',
                        senderType: 'starkeeper',
                        content: 'I actually used the 4-7-8 breathing technique before a meeting this week and it really helped! I felt so much more centered going in.',
                        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'light', count: 3, users: ['helper-anxiety-001', 'user-anxiety-002', 'helper-peer-001'] },
                            { type: 'strength', count: 2, users: ['helper-anxiety-001', 'helper-peer-001'] }
                        ],
                        isSupported: true,
                        supportCount: 8
                    },
                    {
                        id: 'msg-anxiety-003',
                        senderId: 'helper-peer-001',
                        senderName: 'PeerSupporter_Maria',
                        senderType: 'helper',
                        content: 'That\'s wonderful, @BreatheEasy23! The 4-7-8 technique is so powerful. I love how you prepared yourself before the meeting - that\'s such good self-care.',
                        timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'heart', count: 4, users: ['user-anxiety-001', 'user-anxiety-002', 'helper-anxiety-001'] }
                        ],
                        isSupported: true,
                        supportCount: 6
                    },
                    {
                        id: 'msg-anxiety-004',
                        senderId: 'user-anxiety-002',
                        senderName: 'CalmMind88',
                        senderType: 'starkeeper',
                        content: 'I\'ve been struggling with morning anxiety lately. Does anyone have tips for starting the day feeling more grounded?',
                        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'hug', count: 6, users: ['helper-anxiety-001', 'user-anxiety-001', 'helper-peer-001'] }
                        ],
                        isSupported: true,
                        supportCount: 6
                    }
                ],
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                duration: 60,
                isRecurring: true,
                recurrencePattern: 'weekly',
                status: 'active',
                isPrivate: false,
                maxParticipants: 12,
                tags: ['anxiety', 'coping-strategies', 'peer-support', 'weekly']
            },
            {
                id: 'discussion-recovery-002',
                title: 'Recovery Stories: Sharing Hope',
                description: 'A space for those in recovery to share their journey, milestones, and insights. Whether you\'re just starting or years into recovery, your story matters.',
                category: 'recovery',
                hostId: 'helper-recovery-001',
                hostName: 'Michael Chen, Recovery Counselor',
                hostType: 'helper',
                participants: [
                    {
                        userId: 'user-recovery-001',
                        username: 'PhoenixRising',
                        userType: 'starkeeper',
                        joinedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        userId: 'user-recovery-002',
                        username: 'OneDay_AtATime',
                        userType: 'starkeeper',
                        joinedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                    }
                ],
                messages: [
                    {
                        id: 'msg-recovery-001',
                        senderId: 'user-recovery-001',
                        senderName: 'PhoenixRising',
                        senderType: 'starkeeper',
                        content: 'Today marks 6 months clean for me. Some days are still hard, but I\'m learning to celebrate these milestones. Each day I choose recovery is a victory.',
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'strength', count: 8, users: ['helper-recovery-001', 'user-recovery-002'] },
                            { type: 'star', count: 5, users: ['helper-recovery-001', 'user-recovery-002'] }
                        ],
                        isSupported: true,
                        supportCount: 15
                    },
                    {
                        id: 'msg-recovery-002',
                        senderId: 'helper-recovery-001',
                        senderName: 'Michael Chen',
                        senderType: 'helper',
                        content: '6 months is incredible, @PhoenixRising! Your commitment to your recovery is inspiring. How are you celebrating this milestone?',
                        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'heart', count: 3, users: ['user-recovery-001', 'user-recovery-002'] }
                        ],
                        isSupported: true,
                        supportCount: 4
                    }
                ],
                scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                duration: 90,
                isRecurring: true,
                recurrencePattern: 'weekly',
                status: 'scheduled',
                isPrivate: true,
                maxParticipants: 8,
                tags: ['recovery', 'addiction', 'peer-support', 'hope', 'milestones']
            },
            {
                id: 'discussion-social-003',
                title: 'Building Healthy Relationships',
                description: 'Explore strategies for building and maintaining healthy relationships, setting boundaries, and improving communication skills in a supportive environment.',
                category: 'social',
                hostId: 'helper-relationships-001',
                hostName: 'Dr. Sarah Kim, Relationship Therapist',
                hostType: 'helper',
                participants: [
                    {
                        userId: 'user-social-001',
                        username: 'BoundaryBuilder',
                        userType: 'starkeeper',
                        joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        isActive: true,
                        lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                    }
                ],
                messages: [
                    {
                        id: 'msg-social-001',
                        senderId: 'helper-relationships-001',
                        senderName: 'Dr. Sarah Kim',
                        senderType: 'helper',
                        content: 'This week, let\'s talk about the difference between being helpful and being enabling. How do we support others while maintaining healthy boundaries?',
                        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                        reactions: [
                            { type: 'light', count: 2, users: ['user-social-001'] }
                        ],
                        isSupported: true,
                        supportCount: 3
                    }
                ],
                scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                duration: 75,
                isRecurring: true,
                recurrencePattern: 'biweekly',
                status: 'scheduled',
                isPrivate: false,
                maxParticipants: 10,
                tags: ['relationships', 'boundaries', 'communication', 'self-care']
            }
        ];
    }

    getCommunityForumPosts(): unknown[] {
        return [
            {
                id: 'forum-anxiety-tips-001',
                title: 'Daily Anxiety Management - What\'s Working for You?',
                description: 'Share your go-to strategies for managing anxiety day-to-day. Looking for practical tips I can use when things get overwhelming.',
                category: 'anxiety-support',
                authorId: 'user-forum-001',
                authorName: 'SeekingCalm',
                authorType: 'starkeeper',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                replyCount: 8,
                supportCount: 12,
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                tags: ['anxiety', 'coping-strategies', 'daily-life'],
                isSticky: false,
                isLocked: false,
                responses: [
                    {
                        id: 'reply-anxiety-001',
                        authorId: 'helper-anxiety-peer-001',
                        authorName: 'CalmingPresence',
                        authorType: 'helper',
                        content: 'The 5-4-3-2-1 grounding technique has been a game-changer for me: 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. It brings me back to the present moment when my thoughts spiral.',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        supportCount: 6,
                        isSupported: true
                    },
                    {
                        id: 'reply-anxiety-002',
                        authorId: 'user-forum-002',
                        authorName: 'BreatheDeep22',
                        authorType: 'starkeeper',
                        content: 'I keep a \'worry time\' - 15 minutes each day where I allow myself to worry about everything, then I close that mental door. It helps me not carry anxiety all day long.',
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        supportCount: 4,
                        isSupported: true
                    },
                    {
                        id: 'reply-anxiety-003',
                        authorId: 'helper-professional-001',
                        authorName: 'Dr. Elena Rodriguez',
                        authorType: 'helper',
                        content: 'These are wonderful strategies! I\'d also add that progressive muscle relaxation can be very effective. Start with your toes and work your way up, tensing and then relaxing each muscle group. It helps release physical tension that often accompanies anxiety.',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        supportCount: 5,
                        isSupported: true
                    }
                ]
            },
            {
                id: 'forum-recovery-celebrate-002',
                title: 'Small Wins Worth Celebrating 🌟',
                description: 'Recovery isn\'t just about the big milestones - it\'s made up of countless small victories. What small win are you celebrating today?',
                category: 'recovery-support',
                authorId: 'user-recovery-forum-001',
                authorName: 'StepByStep',
                authorType: 'starkeeper',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                replyCount: 15,
                supportCount: 23,
                lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                tags: ['recovery', 'milestones', 'celebration', 'progress'],
                isSticky: true,
                isLocked: false,
                responses: [
                    {
                        id: 'reply-recovery-001',
                        authorId: 'user-recovery-forum-002',
                        authorName: 'NewBeginnings',
                        authorType: 'starkeeper',
                        content: 'I went to a social event last night and didn\'t feel the urge to drink! Instead, I enjoyed meaningful conversations and woke up clear-headed this morning. Feels amazing.',
                        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                        supportCount: 8,
                        isSupported: true
                    },
                    {
                        id: 'reply-recovery-002',
                        authorId: 'helper-recovery-peer-001',
                        authorName: 'SoberStrong',
                        authorType: 'helper',
                        content: 'That\'s incredible @NewBeginnings! Those first social events can be challenging. You should be so proud of yourself for staying true to your recovery and still having a good time.',
                        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
                        supportCount: 6,
                        isSupported: true
                    },
                    {
                        id: 'reply-recovery-003',
                        authorId: 'user-recovery-forum-003',
                        authorName: 'GratefulHeart',
                        authorType: 'starkeeper',
                        content: 'I called my sponsor when I was feeling triggered instead of isolating. It was hard to reach out, but I\'m so glad I did. Connection is healing.',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        supportCount: 9,
                        isSupported: true
                    }
                ]
            },
            {
                id: 'forum-daily-checkin-003',
                title: 'Daily Check-in: How are you feeling today?',
                description: 'A safe space to share how you\'re doing today - the good, the challenging, and everything in between. No judgment, just support.',
                category: 'daily-support',
                authorId: 'moderator-checkin-001',
                authorName: 'Community Guide Alex',
                authorType: 'moderator',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                replyCount: 22,
                supportCount: 31,
                lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                tags: ['daily-checkin', 'emotional-support', 'community'],
                isSticky: true,
                isLocked: false,
                responses: [
                    {
                        id: 'reply-checkin-001',
                        authorId: 'user-checkin-001',
                        authorName: 'MorningLight',
                        authorType: 'starkeeper',
                        content: 'Feeling cautiously optimistic today. Had a rough patch last week, but I\'m taking things one moment at a time and focusing on self-compassion.',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        supportCount: 7,
                        isSupported: true
                    },
                    {
                        id: 'reply-checkin-002',
                        authorId: 'user-checkin-002',
                        authorName: 'QuietStrength',
                        authorType: 'starkeeper',
                        content: 'Struggling with some old thought patterns today, but I\'m grateful for this community. Just knowing others understand makes a difference.',
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        supportCount: 12,
                        isSupported: true
                    },
                    {
                        id: 'reply-checkin-003',
                        authorId: 'helper-support-001',
                        authorName: 'CompassionateHelper',
                        authorType: 'helper',
                        content: '@QuietStrength - sending you strength today. Those old patterns are tough, but recognizing them is such an important step. You\'re not alone in this. 💙',
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        supportCount: 8,
                        isSupported: true
                    }
                ]
            },
            {
                id: 'forum-relationships-boundaries-004',
                title: 'Learning to Say No: Boundary Setting Tips',
                description: 'I\'m working on setting healthier boundaries but struggle with guilt when I say no. How do you balance being helpful with taking care of yourself?',
                category: 'relationships',
                authorId: 'user-boundaries-001',
                authorName: 'LearningToChoose',
                authorType: 'starkeeper',
                timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
                replyCount: 11,
                supportCount: 18,
                lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                tags: ['boundaries', 'relationships', 'self-care', 'guilt'],
                isSticky: false,
                isLocked: false,
                responses: [
                    {
                        id: 'reply-boundaries-001',
                        authorId: 'helper-boundaries-001',
                        authorName: 'Dr. Michelle Park',
                        authorType: 'helper',
                        content: 'Boundary guilt is so common! Remember that saying no to one thing means saying yes to something else - often your own well-being. You can\'t pour from an empty cup.',
                        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
                        supportCount: 9,
                        isSupported: true
                    },
                    {
                        id: 'reply-boundaries-002',
                        authorId: 'user-boundaries-002',
                        authorName: 'BoundaryBuilder88',
                        authorType: 'starkeeper',
                        content: 'I started with small nos first - like declining optional social events when I was exhausted. It helped me practice the skill before bigger situations came up.',
                        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        supportCount: 6,
                        isSupported: true
                    }
                ]
            },
            {
                id: 'forum-wellness-habits-005',
                title: 'Building Sustainable Wellness Habits',
                description: 'What small, daily habits have made the biggest difference in your mental health? Looking for realistic practices I can actually stick with.',
                category: 'wellness',
                authorId: 'user-wellness-001',
                authorName: 'SmallSteps',
                authorType: 'starkeeper',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                replyCount: 19,
                supportCount: 26,
                lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                tags: ['wellness', 'habits', 'self-care', 'routine'],
                isSticky: false,
                isLocked: false,
                responses: [
                    {
                        id: 'reply-wellness-001',
                        authorId: 'user-wellness-002',
                        authorName: 'MindfulMornings',
                        authorType: 'starkeeper',
                        content: 'I started with just 2 minutes of deep breathing every morning before I even get out of bed. It\'s grown into a fuller meditation practice, but starting tiny was key.',
                        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
                        supportCount: 8,
                        isSupported: true
                    },
                    {
                        id: 'reply-wellness-002',
                        authorId: 'helper-wellness-001',
                        authorName: 'WellnessGuide_Sam',
                        authorType: 'helper',
                        content: 'The \'two-minute rule\' is powerful! Any habit can be started in 2 minutes or less. Read one page, write one sentence in a journal, do one sun salutation. Small consistency beats large inconsistency every time.',
                        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
                        supportCount: 11,
                        isSupported: true
                    }
                ]
            }
        ];
    }

    getCommunityEvents(): unknown[] {
        return [
            {
                id: 'event-mindfulness-workshop-001',
                title: 'Introduction to Mindfulness for Beginners',
                description: 'A gentle introduction to mindfulness practices designed specifically for those dealing with anxiety and stress. No experience necessary - just bring an open mind and comfortable clothes.',
                type: 'workshop',
                hostId: 'helper-mindfulness-001',
                hostName: 'Luna Martinez, Certified Mindfulness Instructor',
                startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
                timezone: 'PST',
                maxParticipants: 15,
                currentParticipants: [
                    {
                        userId: 'user-mindful-event-001',
                        username: 'SeekingPeace',
                        registeredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        attended: false
                    },
                    {
                        userId: 'user-mindful-event-002',
                        username: 'CalmSeeker99',
                        registeredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        attended: false
                    },
                    {
                        userId: 'user-mindful-event-003',
                        username: 'AnxiousNoMore',
                        registeredDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                        attended: false
                    }
                ],
                isVirtual: true,
                meetingLink: 'https://astralcore.meeting/mindfulness-intro',
                resources: [
                    {
                        id: 'resource-mindful-001',
                        title: 'Beginner\'s Guide to Breathing Exercises',
                        type: 'document',
                        url: '/resources/breathing-guide.pdf',
                        description: 'Simple breathing techniques you can use anywhere'
                    },
                    {
                        id: 'resource-mindful-002',
                        title: 'Guided Body Scan Meditation',
                        type: 'audio',
                        url: '/resources/body-scan-meditation.mp3',
                        description: '15-minute guided meditation for relaxation'
                    }
                ],
                status: 'upcoming',
                tags: ['mindfulness', 'anxiety-relief', 'beginner-friendly', 'stress-management']
            },
            {
                id: 'event-support-group-001',
                title: 'Young Adults Support Circle',
                description: 'A weekly support group for young adults (18-30) navigating life transitions, career stress, and relationship challenges. Safe, confidential, and peer-led.',
                type: 'support-group',
                hostId: 'helper-young-adult-001',
                hostName: 'Alex Chen, Peer Support Specialist',
                startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000).toISOString(),
                timezone: 'EST',
                maxParticipants: 8,
                currentParticipants: [
                    {
                        userId: 'user-young-001',
                        username: 'TransitionTime',
                        registeredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        attended: true,
                        feedback: 'Really appreciate the safe space to share. Feeling less alone.',
                        rating: 5
                    },
                    {
                        userId: 'user-young-002',
                        username: 'CareerAnxiety',
                        registeredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        attended: true,
                        feedback: 'Great group dynamic. Looking forward to next week.',
                        rating: 4
                    }
                ],
                isVirtual: true,
                meetingLink: 'https://astralcore.meeting/young-adults-support',
                resources: [
                    {
                        id: 'resource-support-001',
                        title: 'Young Adult Life Transition Guide',
                        type: 'document',
                        url: '/resources/life-transition-guide.pdf'
                    }
                ],
                status: 'upcoming',
                tags: ['young-adults', 'peer-support', 'life-transitions', 'weekly']
            },
            {
                id: 'event-wellness-session-001',
                title: 'Art Therapy: Creative Expression for Healing',
                description: 'Explore emotions through creative expression in this gentle art therapy session. All skill levels welcome - this is about healing, not creating perfect art.',
                type: 'wellness',
                hostId: 'helper-art-therapy-001',
                hostName: 'Dr. Maria Rodriguez, Licensed Art Therapist',
                startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                timezone: 'CST',
                maxParticipants: 12,
                currentParticipants: [
                    {
                        userId: 'user-art-001',
                        username: 'CreativeHealing',
                        registeredDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        attended: false
                    }
                ],
                isVirtual: false,
                resources: [
                    {
                        id: 'resource-art-001',
                        title: 'Art Therapy Supply List',
                        type: 'document',
                        url: '/resources/art-supplies.pdf',
                        description: 'Basic supplies needed for the session'
                    },
                    {
                        id: 'resource-art-002',
                        title: 'Art for Emotional Expression Guide',
                        type: 'worksheet',
                        url: '/resources/art-expression-worksheet.pdf'
                    }
                ],
                status: 'upcoming',
                tags: ['art-therapy', 'creative-expression', 'healing', 'emotions']
            }
        ];
    }

    getPeerConnections(): unknown[] {
        return [
            {
                id: 'connection-accountability-001',
                starkeeperId: 'user-account-001',
                peerId: 'user-account-peer-001',
                peerName: 'MindfulMate',
                connectionType: 'accountability-buddy',
                connectedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                lastInteraction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                sharedGoals: [
                    'Daily 10-minute meditation',
                    'Journaling before bed',
                    'Weekly anxiety check-ins'
                ],
                status: 'active',
                interactionCount: 28,
                isMatched: true
            },
            {
                id: 'connection-mentor-001',
                starkeeperId: 'user-mentee-001',
                peerId: 'helper-mentor-001',
                peerName: 'RecoveryGuide_Sarah',
                connectionType: 'mentor',
                connectedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                sharedGoals: [
                    '90-day sobriety milestone',
                    'Building healthy coping strategies',
                    'Rebuilding family relationships'
                ],
                status: 'active',
                interactionCount: 45,
                isMatched: true
            },
            {
                id: 'connection-study-001',
                starkeeperId: 'user-student-001',
                peerId: 'user-student-peer-001',
                peerName: 'StudyBuddy_Alex',
                connectionType: 'study-partner',
                connectedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                lastInteraction: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                sharedGoals: [
                    'DBT skills practice',
                    'Anxiety management techniques',
                    'Academic stress reduction'
                ],
                status: 'active',
                interactionCount: 12,
                isMatched: true
            }
        ];
    }

    getCommunityUsers(): unknown[] {
        return [
            {
                id: 'user-community-001',
                username: 'HopefulJourney',
                userType: 'starkeeper',
                joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                contributionScore: 245,
                badges: [
                    {
                        id: 'badge-helper-001',
                        name: 'Supportive Voice',
                        description: 'Provided meaningful support to 10+ community members',
                        icon: '💙',
                        earnedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                        category: 'helping'
                    },
                    {
                        id: 'badge-participation-001',
                        name: 'Active Participant',
                        description: 'Engaged in community for 30+ consecutive days',
                        icon: '⭐',
                        earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        category: 'participation'
                    }
                ],
                isOnline: true
            },
            {
                id: 'helper-community-001',
                username: 'CompassionateGuide',
                userType: 'helper',
                joinedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                contributionScore: 890,
                badges: [
                    {
                        id: 'badge-leader-001',
                        name: 'Community Leader',
                        description: 'Outstanding leadership and guidance in the community',
                        icon: '🌟',
                        earnedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                        category: 'leadership'
                    },
                    {
                        id: 'badge-mentor-001',
                        name: 'Dedicated Mentor',
                        description: 'Mentored 25+ community members',
                        icon: '🤝',
                        earnedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        category: 'helping'
                    }
                ],
                isOnline: true
            },
            {
                id: 'user-community-002',
                username: 'GrowingStronger',
                userType: 'starkeeper',
                joinedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                contributionScore: 156,
                badges: [
                    {
                        id: 'badge-milestone-001',
                        name: 'First Steps',
                        description: 'Completed first week in the community',
                        icon: '👣',
                        earnedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                        category: 'milestone'
                    }
                ],
                isOnline: false
            }
        ];
    }
}

export const demoDataService = DemoDataService.getInstance();
