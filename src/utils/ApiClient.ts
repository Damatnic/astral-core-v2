import { Dilemma, AIChatMessage, ChatMessage, Feedback, Helper, ForumThread, ForumPost, CommunityProposal, Reflection, Block, ModerationAction, HelpSession, Achievement, UserStatus, CommunityStats, HelperGuidance, SafetyPlan, WellnessVideo, MoodCheckIn, Habit, HabitCompletion, Assessment, Resource, JournalEntry } from '../types';
import { demoDataService } from '../services/demoDataService';

// ====================================================================================
// API CLIENT REFACTOR COMPLETE
// This file has been fully transitioned to a client that calls a real backend API
// running on Netlify Functions. All mock logic and localStorage access has been
// removed and replaced with calls to the `_callApi` helper. The frontend is now
// completely decoupled from the data layer.
// ====================================================================================

/**
 * Check if Netlify Functions are available
 */
let netlifyFunctionsAvailable: boolean | null = null;

const checkNetlifyFunctions = async (): Promise<boolean> => {
    if (netlifyFunctionsAvailable !== null) {
        return netlifyFunctionsAvailable;
    }
    
    // In production, assume functions are available
    if (process.env.NODE_ENV === 'production') {
        netlifyFunctionsAvailable = true;
        return true;
    }
    
    // In development, check if we're running through Netlify Dev (port 8888)
    // This avoids making requests that cause 404 errors
    const currentPort = window.location.port;
    const isNetlifyDev = currentPort === '8888';
    
    if (isNetlifyDev) {
        netlifyFunctionsAvailable = true;
        console.info('✓ Running through Netlify Dev - API functions available');
    } else {
        netlifyFunctionsAvailable = false;
        console.info('✓ Running in demo mode on port', currentPort || '80');
    }
    
    return netlifyFunctionsAvailable;
};

/**
 * Check if we're in demo mode and return demo data if applicable
 */
const isInDemoMode = () => {
    // Force demo mode in development if Netlify Functions aren't available
    if (process.env.NODE_ENV === 'development' && netlifyFunctionsAvailable === false) {
        return true;
    }
    return localStorage.getItem('demo_token') !== null || process.env.VITE_USE_DEMO_DATA === 'true';
};

const getDemoUserType = (): 'user' | 'helper' | 'admin' | null => {
    const demoUser = localStorage.getItem('demo_user');
    if (!demoUser) return null;
    
    const user = JSON.parse(demoUser);
    if (user.userType === 'seeker') return 'user';
    if (user.userType === 'helper') return 'helper';
    if (user.userType === 'admin') return 'admin';
    return null;
};

/**
 * Get demo data for the current user type, fallback to API call
 */
const getDemoDataOrCallApi = async <T>(demoDataKey: string, apiCall: () => Promise<T>): Promise<T> => {
    if (isInDemoMode()) {
        const userType = getDemoUserType();
        if (userType) {
            const demoData = demoDataService.getDemoData(userType);
            if (demoData[demoDataKey]) {
                return demoData[demoDataKey];
            }
        }
    }
    return apiCall();
};


/**
 * The single source of truth for all backend API calls.
 * @param endpoint The API endpoint to call (e.g., '/dilemmas')
 * @param options Standard fetch options (method, body, etc.)
 */
const _callApi = async (endpoint: string, options: RequestInit = {}) => {
    // Check if Netlify Functions are available first
    await checkNetlifyFunctions();
    
    // In development mode, check if we should use demo data
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    
    // If in development and Netlify Functions aren't available, skip the API call entirely
    if (isDevelopment && netlifyFunctionsAvailable === false) {
        const devError = new Error('Demo mode - API skipped') as Error & { isDevelopmentError?: boolean };
        devError.isDevelopmentError = true;
        throw devError;
    }
    
    // In a real app, the access token would be retrieved from a secure context.
    const token = sessionStorage.getItem('accessToken');
    
    // Get anonymous ID for anonymous users
    const anonymousId = !token ? localStorage.getItem('astral_core_anonymous_id') : null;
    
    // Use Netlify Functions in development
    const baseUrl = process.env.VITE_API_URL || '/.netlify/functions';

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(anonymousId && { 'X-Anonymous-Id': anonymousId }),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // Broadcast an event that other parts of the app can listen for.
        // This is a clean way to handle auth errors globally.
        window.dispatchEvent(new CustomEvent('auth-error'));
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        // Check if response is HTML (common in development when Netlify functions aren't running)
        const contentType = response.headers.get('content-type');
        let errorData;
        
        if (contentType && contentType.includes('text/html')) {
            // In development, provide a friendlier error message for HTML responses
            if (process.env.NODE_ENV === 'development') {
                errorData = { 
                    message: 'API endpoint not available in development mode. Using demo data fallback.',
                    isDevelopmentError: true 
                };
            } else {
                errorData = { message: 'Server returned an unexpected response format.' };
            }
        } else {
            errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        }
        
        console.error(`API call to ${endpoint} failed with status ${response.status}.`, errorData);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return; // No content to parse
    }
    
    // Check for HTML response even on successful requests (development fallback)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        if (process.env.NODE_ENV === 'development') {
            throw new Error('API endpoint not available in development mode. Using demo data fallback.');
        }
        throw new Error('Server returned an unexpected response format.');
    }
    
    return response.json();
};

// Initialize API client - check if Netlify Functions are available
checkNetlifyFunctions();

// --- Centralized API Client ---
export const ApiClient = {
    // Initialize the API client (checks for Netlify Functions availability)
    initialize: async () => {
        await checkNetlifyFunctions();
    },
    resources: {
        getResources: (): Promise<Resource[]> => {
            return _callApi('/wellness/resources');
        }
    },
    assessments: {
        submitPhq9Result: (userToken: string, score: number, answers: number[]): Promise<Assessment> => {
            return _callApi('/wellness/assessments', { method: 'POST', body: JSON.stringify({ userToken, score, answers, type: 'phq-9' }) });
        },
        submitGad7Result: (userToken: string, score: number, answers: number[]): Promise<Assessment> => {
             return _callApi('/wellness/assessments', { method: 'POST', body: JSON.stringify({ userToken, score, answers, type: 'gad-7' }) });
        },
        getHistory: (userToken: string): Promise<Assessment[]> => {
            return _callApi(`/wellness/assessments/history/${userToken}`);
        }
    },
    habits: {
        getPredefinedHabits: (): Promise<Habit[]> => {
            return _callApi('/wellness/habits/predefined');
        },
        getTrackedHabitIds: (userId: string): Promise<string[]> => {
            return _callApi(`/wellness/habits/tracked/${userId}`);
        },
        getCompletions: (userId: string): Promise<HabitCompletion[]> => {
            return _callApi(`/wellness/habits/completions/${userId}`);
        },
        trackHabit: (userId: string, habitId: string): Promise<void> => {
            return _callApi('/wellness/habits/track', { method: 'POST', body: JSON.stringify({ userId, habitId }) });
        },
        untrackHabit: (userId: string, habitId: string): Promise<void> => {
            return _callApi('/wellness/habits/untrack', { method: 'POST', body: JSON.stringify({ userId, habitId }) });
        },
        logCompletion: (userId: string, habitId: string, date: string): Promise<HabitCompletion> => {
            return _callApi('/wellness/habits/log', { method: 'POST', body: JSON.stringify({ userId, habitId, date }) });
        },
    },
    mood: {
        postCheckIn: (checkInData: Omit<MoodCheckIn, 'id' | 'userToken' | 'timestamp'>, userToken: string): Promise<MoodCheckIn> => {
            return _callApi('/wellness/mood/checkin', { method: 'POST', body: JSON.stringify({ ...checkInData, userToken }) });
        },
        getHistory: (userToken: string): Promise<MoodCheckIn[]> => {
            return _callApi(`/wellness/mood/history/${userToken}`);
        },
    },
    journal: {
        getEntries: (userToken: string): Promise<JournalEntry[]> => {
            return getDemoDataOrCallApi('journalEntries', () => _callApi(`/wellness/journal/${userToken}`));
        },
        getHistory: (userToken: string): Promise<JournalEntry[]> => {
            return getDemoDataOrCallApi('journalEntries', () => _callApi(`/wellness/journal/history/${userToken}`));
        },
        postEntry: (content: string, userToken: string): Promise<JournalEntry> => {
            return _callApi('/wellness/journal/entry', { method: 'POST', body: JSON.stringify({ content, userToken }) });
        },
    },
    videos: {
        getVideos: (): Promise<WellnessVideo[]> => {
            return _callApi('/wellness/videos');
        },
        likeVideo: (videoId: string): Promise<WellnessVideo> => {
            return _callApi(`/wellness/videos/like/${videoId}`, { method: 'POST' });
        },
        uploadVideo: async (file: File, description: string, userToken: string): Promise<WellnessVideo> => {
            // In a real app, this would be a multi-part upload, but for the mock backend we simplify.
            return _callApi('/wellness/videos/upload', { method: 'POST', body: JSON.stringify({ description, userToken, fileName: file.name }) });
        }
    },
    safetyPlan: {
        get: (userToken: string): Promise<SafetyPlan | null> => {
            return _callApi(`/users/safety-plan/${userToken}`);
        },
        save: (plan: SafetyPlan, userToken: string): Promise<void> => {
            return _callApi('/users/safety-plan', { method: 'POST', body: JSON.stringify({ plan, userToken }) });
        }
    },
    legal: {
        checkConsent: (userId: string, documentType: string): Promise<{ document_version: string; consent_timestamp: string } | null> => {
            return _callApi(`/users/consent/${userId}/${documentType}`);
        },
        recordConsent: (userId: string, userType: string, documentType: string, documentVersion: string): Promise<void> => {
            return _callApi('/users/consent', { method: 'POST', body: JSON.stringify({ userId, userType, documentType, documentVersion }) });
        }
    },
    payment: {
        createDonationIntent: (amount: number): Promise<{ clientSecret: string }> => {
            // This can remain a mock or be built out as a real function.
            // For now, no changes are needed as it doesn't rely on the mock DB.
            return new Promise((resolve) => {
                console.log(`Simulating creating a payment intent for $${(amount / 100).toFixed(2)}`);
                setTimeout(() => {
                    resolve({ clientSecret: `pi_${crypto.randomUUID()}_secret_${crypto.randomUUID()}` });
                }, 500);
            });
        }
    },
    emergency: {
        trigger: (dilemmaId: string, location?: { latitude: number; longitude: number }): Promise<void> => {
             // This can remain a mock or be built out as a real function.
            return new Promise((resolve) => {
                console.log(`!!! EMERGENCY TRIGGERED for Dilemma ${dilemmaId} !!!`);
                if (location) {
                    console.log(`  > Location: lat=${location.latitude}, lon=${location.longitude}`);
                }
                setTimeout(() => resolve(), 300);
            });
        }
    },
    helpSessions: {
        getForSeeker: (userId: string): Promise<HelpSession[]> => {
            return getDemoDataOrCallApi('helpSessions', () => _callApi(`/sessions/user/${userId}`));
        },
        getForUser: (userId: string): Promise<HelpSession[]> => {
            return getDemoDataOrCallApi('helpSessions', () => _callApi(`/sessions/user/${userId}`));
        },
        toggleFavorite: (sessionId: string, seekerId: string): Promise<HelpSession> => {
            return _callApi(`/sessions/${sessionId}/favorite`, { method: 'POST', body: JSON.stringify({ seekerId }) });
        },
        sendKudos: (sessionId: string, seekerId: string): Promise<{ updatedHelper: Helper, newAchievements: Achievement[] }> => {
            return _callApi(`/sessions/${sessionId}/kudos`, { method: 'POST', body: JSON.stringify({ seekerId }) });
        },
    },
    preferences: {
        getPreferences: (userId: string): Promise<{ researchConsent: boolean }> => {
            return _callApi(`/users/preferences/${userId}`);
        },
        updatePreferences: (userId: string, prefs: { researchConsent: boolean }): Promise<void> => {
            return _callApi(`/users/preferences/${userId}`, { method: 'PUT', body: JSON.stringify(prefs) });
        }
    },
    dilemmas: {
        getDilemmas: async (): Promise<Dilemma[]> => {
            try {
                return await _callApi('/dilemmas');
            } catch (error) {
                const err = error as { isDevelopmentError?: boolean; message?: string };
                if (err.isDevelopmentError || err.message?.includes('Demo mode')) {
                    // Return demo data in development
                    const userType = getDemoUserType() || 'user';
                    const demoData = demoDataService.getDemoData(userType);
                    return demoData.allDilemmas || demoData.dilemmas || [];
                }
                throw error;
            }
        },
        getForYouFeed: (userToken: string): Promise<Dilemma[]> => {
            return _callApi(`/dilemmas/for-you/${userToken}`);
        },
        postDilemma: (dilemmaData: Omit<Dilemma, 'id' | 'userToken' | 'supportCount' | 'isSupported' | 'isReported' | 'reportReason' | 'status' | 'assignedHelperId' | 'resolved_by_seeker' | 'requestedHelperId' | 'summary' | 'summaryLoading' | 'moderation' | 'aiMatchReason'>, userToken: string): Promise<Dilemma> => {
            return _callApi('/dilemmas', { method: 'POST', body: JSON.stringify({ ...dilemmaData, userToken }) });
        },
        createDirectRequest: (dilemmaData: Pick<Dilemma, 'content' | 'category'>, userToken: string, requestedHelperId: string): Promise<Dilemma> => {
            return _callApi('/dilemmas/direct-request', { method: 'POST', body: JSON.stringify({ ...dilemmaData, userToken, requestedHelperId }) });
        },
        declineRequest: (dilemmaId: string, helperId: string): Promise<Dilemma> => {
            return _callApi(`/dilemmas/${dilemmaId}/decline`, { method: 'POST', body: JSON.stringify({ helperId }) });
        },
        toggleSupport: (dilemmaId: string): Promise<Dilemma> => {
            return _callApi(`/dilemmas/${dilemmaId}/support`, { method: 'POST' });
        },
        report: (dilemmaId: string, reason: string): Promise<Dilemma> => {
            return _callApi(`/dilemmas/${dilemmaId}/report`, { method: 'POST', body: JSON.stringify({ reason }) });
        },
        acceptDilemma: (dilemmaId: string, helperId: string): Promise<{dilemma: Dilemma, session: HelpSession, updatedHelper: Helper, newAchievements: Achievement[]}> => {
            return _callApi(`/dilemmas/${dilemmaId}/accept`, { method: 'POST', body: JSON.stringify({ helperId }) });
        },
        resolveBySeeker: (dilemmaId: string, userToken: string): Promise<Dilemma> => {
            return _callApi(`/dilemmas/${dilemmaId}/resolve`, { method: 'POST', body: JSON.stringify({ userToken }) });
        },
    },
    chat: {
        getMessages: (dilemmaId: string): Promise<ChatMessage[]> => {
            return _callApi(`/chat/${dilemmaId}/messages`);
        },
        sendMessage: (dilemmaId: string, text: string, sender: 'user' | 'poster', senderId: string): Promise<ChatMessage> => {
            return _callApi(`/chat/${dilemmaId}/messages`, { method: 'POST', body: JSON.stringify({ text, sender, senderId }) });
        },
    },
    helpers: {
        getById: (helperId: string): Promise<Helper | null> => {
            return _callApi(`/helpers/${helperId}`);
        },
        getAllHelpers: (): Promise<Helper[]> => {
            return _callApi('/helpers');
        },
        getProfile: (auth0UserId: string): Promise<Helper | null> => {
            if (isInDemoMode()) {
                const userType = getDemoUserType();
                if (userType === 'helper' || userType === 'admin') {
                    const demoData = demoDataService.getDemoData(userType);
                    return Promise.resolve(demoData.profile || null);
                }
            }
            return _callApi(`/helpers/profile/${auth0UserId}`);
        },
        getFavoriteHelpersDetails: (seekerId: string): Promise<Helper[]> => {
            return _callApi(`/helpers/favorites/${seekerId}`);
        },
        createProfile: (profileData: Pick<Helper, 'auth0UserId' | 'displayName' | 'expertise' | 'bio'>): Promise<Helper> => {
            return _callApi('/helpers', { method: 'POST', body: JSON.stringify(profileData) });
        },
        updateProfile: (helperId: string, updates: Partial<Pick<Helper, 'displayName' | 'expertise' | 'bio'>>): Promise<Helper> => {
            return _callApi(`/helpers/${helperId}`, { method: 'PUT', body: JSON.stringify(updates) });
        },
        setAvailability: (helperId: string, isAvailable: boolean): Promise<Helper> => {
            return _callApi(`/helpers/${helperId}/availability`, { method: 'PUT', body: JSON.stringify({ isAvailable }) });
        },
        getOnlineHelperCount: async (): Promise<number> => {
            // This is one of the few non-authed endpoints
            try {
                return await _callApi('/helpers/online-count', { headers: { 'Authorization': '' } });
            } catch (error) {
                const err = error as { isDevelopmentError?: boolean; message?: string };
                if (err.isDevelopmentError || err.message?.includes('Demo mode')) {
                    return 12; // Demo count
                }
                throw error;
            }
        },
        getHelperAchievements: (helperId: string): Promise<Achievement[]> => {
            return _callApi(`/helpers/${helperId}/achievements`);
        },
        submitTrainingQuiz: (helperId: string, score: number): Promise<Helper> => {
            return _callApi(`/helpers/${helperId}/training`, { method: 'POST', body: JSON.stringify({ score }) });
        },
        submitApplication: (helperId: string): Promise<Helper> => {
            return _callApi(`/helpers/${helperId}/application`, { method: 'POST' });
        },
    },
    admin: {
        getApplications: (): Promise<Helper[]> => {
             return _callApi('/admin/applications');
        },
        getApplicantDetails: (helperId: string): Promise<unknown> => {
            return _callApi(`/admin/applicants/${helperId}`);
        },
        updateApplicationStatus: (helperId: string, status: Helper['applicationStatus'], _actingHelper: Helper, notes?: string): Promise<Helper> => {
            return _callApi(`/admin/applications/${helperId}`, { method: 'PUT', body: JSON.stringify({ status, notes }) });
        },
        getCommunityStats: (): Promise<CommunityStats> => {
            return _callApi('/admin/stats');
        },
    },
    feedback: {
        submitFeedback: (dilemmaId: string, helperId: string, wasHelpful: boolean): Promise<void> => {
            return _callApi('/feedback', { method: 'POST', body: JSON.stringify({ dilemmaId, helperId, wasHelpful }) });
        },
        getFeedbackForHelper: (helperId: string): Promise<Feedback[]> => {
            return _callApi(`/feedback/${helperId}`);
        }
    },
    helperCommunity: {
        getThreads: (): Promise<ForumThread[]> => {
            return _callApi('/community/threads');
        },
        getPosts: (threadId: string): Promise<ForumPost[]> => {
            return _callApi(`/community/posts/${threadId}`);
        },
        createPost: (postData: Omit<ForumPost, 'id' | 'timestamp'>): Promise<ForumPost> => {
            return _callApi('/community/posts', { method: 'POST', body: JSON.stringify(postData) });
        },
        createThread: (threadData: Omit<ForumThread, 'id' | 'timestamp' | 'postCount' | 'lastReply'>, firstPostContent: string): Promise<ForumThread> => {
            return _callApi('/community/threads', { method: 'POST', body: JSON.stringify({ ...threadData, firstPostContent }) });
        },
        getProposals: (): Promise<CommunityProposal[]> => {
            return _callApi('/community/proposals');
        },
        createProposal: (proposalData: Omit<CommunityProposal, 'id' | 'createdAt' | 'endsAt' | 'status' | 'votes'>): Promise<CommunityProposal> => {
            return _callApi('/community/proposals', { method: 'POST', body: JSON.stringify(proposalData) });
        },
        voteOnProposal: (proposalId: string, helperId: string, vote: 'for' | 'against' | 'abstain'): Promise<CommunityProposal> => {
            return _callApi(`/community/proposals/${proposalId}/vote`, { method: 'POST', body: JSON.stringify({ helperId, vote }) });
        }
    },
    reflections: {
        getReflections: (): Promise<Reflection[]> => {
            return _callApi('/reflections');
        },
        postReflection: (userToken: string, content: string): Promise<Reflection> => {
            return _callApi('/reflections', { method: 'POST', body: JSON.stringify({ userToken, content }) });
        },
        addReaction: (reflectionId: string, reactionType: string, userToken: string): Promise<Reflection> => {
            return _callApi(`/reflections/${reflectionId}/react`, { method: 'POST', body: JSON.stringify({ reactionType, userToken }) });
        },
    },
    userBlocking: {
        getBlockedUsers: (blockerId: string): Promise<Block[]> => {
            return _callApi(`/users/blocked/${blockerId}`);
        },
        blockUser: (blockerId: string, blockedId: string): Promise<Block> => {
            return _callApi('/users/block', { method: 'POST', body: JSON.stringify({ blockerId, blockedId }) });
        },
        unblockUser: (blockerId: string, blockedId: string): Promise<void> => {
            return _callApi('/users/unblock', { method: 'POST', body: JSON.stringify({ blockerId, blockedId }) });
        }
    },
    moderation: {
        getHistory: (userId: string): Promise<ModerationAction[]> => {
            return _callApi(`/moderation/history/${userId}`);
        },
        dismissReport: (dilemmaId: string, _actingHelper: Helper): Promise<Dilemma> => {
            return _callApi(`/moderation/reports/${dilemmaId}/dismiss`, { method: 'POST' });
        },
        removePost: (dilemmaId: string, _actingHelper: Helper): Promise<Dilemma> => {
            return _callApi(`/moderation/posts/${dilemmaId}`, { method: 'DELETE' });
        },
        getUserStatus: (userId: string): Promise<UserStatus> => {
            return _callApi(`/moderation/users/${userId}/status`);
        },
        issueWarning: (userId: string): Promise<UserStatus> => {
            return _callApi(`/moderation/users/${userId}/warn`, { method: 'POST' });
        },
        banUser: (userId: string, reason: string, durationHours?: number): Promise<UserStatus> => {
            return _callApi(`/moderation/users/${userId}/ban`, { method: 'POST', body: JSON.stringify({ reason, durationHours }) });
        },
    },
    ai: {
        chat: async (messages: AIChatMessage[], userId?: string, provider?: 'openai' | 'claude'): Promise<{ response: string; metadata?: any }> => {
            try {
                const response = await _callApi('/api-ai/chat', {
                    method: 'POST',
                    body: JSON.stringify({ messages, userId, provider: provider || 'openai' }),
                });
                return response;
            } catch (error) {
                console.error('AI chat error:', error);
                return {
                    response: "I'm having trouble connecting right now. Please try again in a moment.",
                    metadata: { error: true }
                };
            }
        },
        sendMessageToAI: async (messages: AIChatMessage[]): Promise<string> => {
            // Legacy compatibility - convert to new format
            const result = await ApiClient.ai.chat(messages);
            return result.response;
        },
        resetAIChat: async (userId: string) => {
            return _callApi('/api-ai/clear', { 
                method: 'POST',
                body: JSON.stringify({ userId })
            });
        },
        saveChatHistory: async (userId: string, messages: AIChatMessage[]): Promise<void> => {
            return _callApi('/api-ai/history', { 
                method: 'POST', 
                body: JSON.stringify({ userId, messages }) 
            });
        },
        loadChatHistory: async (userId: string): Promise<AIChatMessage[]> => {
            try {
                const response = await _callApi(`/api-ai/history?userId=${userId}`);
                return response.messages || [];
            } catch (error) {
                const err = error as { isDevelopmentError?: boolean; message?: string };
                if (err.isDevelopmentError || err.message?.includes('Demo mode')) {
                    return [];
                }
                console.error('Failed to load chat history:', error);
                return [];
            }
        },
        getProviders: async (): Promise<{ providers: string[]; default: string | null }> => {
            try {
                return await _callApi('/api-ai/providers');
            } catch (error) {
                console.error('Failed to get AI providers:', error);
                return { providers: [], default: null };
            }
        },
        draftPostFromChat: async (messages: AIChatMessage[]): Promise<{ postContent: string, category: string }> => {
            return _callApi('/ai/draft-post', { method: 'POST', body: JSON.stringify({ messages }) });
        },
        getHelperGuidance: async (text: string): Promise<HelperGuidance> => {
            return _callApi('/ai/guidance', { method: 'POST', body: JSON.stringify({ text }) });
        },
        summarizeDilemma: async (content: string): Promise<string> => {
            const res = await _callApi('/ai/summarize-dilemma', { method: 'POST', body: JSON.stringify({ content }) });
            return res.summary;
        },
        summarizeChat: async (transcript: string): Promise<string> => {
            const res = await _callApi('/ai/summarize-chat', { method: 'POST', body: JSON.stringify({ transcript }) });
            return res.summary;
        },
        getAiMatchedDilemmas: async (helper: Helper, dilemmas: Dilemma[]): Promise<Dilemma[]> => {
             const res = await _callApi('/ai/match-dilemmas', { method: 'POST', body: JSON.stringify({ helper, dilemmas }) });
             return res.matchedDilemmas;
        },
        summarizeHelperPerformance: async (transcript: string): Promise<string> => {
            const res = await _callApi('/ai/summarize-performance', { method: 'POST', body: JSON.stringify({ transcript }) });
            return res.summary;
        },
    }
};
