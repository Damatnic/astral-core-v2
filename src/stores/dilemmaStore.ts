import { create } from 'zustand';
import { Dilemma, SortOption } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { useChatStore } from './chatStore';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';

const POSTS_PER_PAGE = 10;

interface DilemmaState {
  allDilemmas: Dilemma[];
  forYouDilemmas: Dilemma[];
  isLoading: boolean;
  filter: string;
  sort: SortOption;
  searchTerm: string;
  currentPage: number;
  reportingDilemmaId: string | null;
  isReportModalOpen: boolean;
  blockedUserIds: Set<string>;

  // Derived state
  reportedDilemmas: Dilemma[];
  visibleDilemmas: Dilemma[];
  hasMore: boolean;

  // Actions
  fetchDilemmas: () => Promise<void>;
  fetchForYouFeed: () => Promise<void>;
  setFilter: (filter: string) => void;
  setSort: (sort: SortOption) => void;
  setSearchTerm: (term: string) => void;
  loadMore: () => void;
  postDilemma: (data: Omit<Dilemma, 'id' | 'userToken' | 'supportCount' | 'isSupported' | 'isReported' | 'reportReason' | 'status' | 'assignedHelperId' | 'resolved_by_seeker' | 'requestedHelperId' | 'summary' | 'summaryLoading' | 'moderation' | 'aiMatchReason'>, userToken: string) => Promise<void>;
  createDirectRequest: (data: Pick<Dilemma, 'content' | 'category'>, userToken: string, requestedHelperId: string) => Promise<void>;
  toggleSupport: (dilemmaId: string) => Promise<void>;
  openReportModal: (dilemmaId: string) => void;
  closeReportModal: () => void;
  reportDilemma: (reason: string) => Promise<void>;
  getDilemmaById: (id: string) => Dilemma | undefined;
  acceptDilemma: (dilemmaId: string) => Promise<void>;
  resolveDilemma: (dilemmaId: string, userToken: string) => Promise<void>;
  declineRequest: (dilemmaId: string) => Promise<void>;
  summarizeDilemma: (dilemmaId: string) => Promise<void>;
  dismissReport: (dilemmaId: string) => Promise<void>;
  removePost: (dilemmaId: string) => Promise<void>;
}

export const useDilemmaStore = create<DilemmaState>((set, get) => {
    const calculateDerivedState = (state: DilemmaState) => {
        const { allDilemmas, filter, sort, searchTerm, currentPage, blockedUserIds } = state;

        // Calculate reportedDilemmas
        const reportedDilemmas = allDilemmas.filter(d => d.isReported && d.status !== 'removed_by_moderator');

        // Calculate visibleDilemmas and hasMore for the community feed
        let filteredDilemmas = allDilemmas.filter(d =>
            d.status === 'active' &&
            !d.assignedHelperId &&
            !d.isReported &&
            !blockedUserIds.has(d.userToken)
        );

        if (filter !== 'All') {
            filteredDilemmas = filteredDilemmas.filter(d => d.category === filter);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filteredDilemmas = filteredDilemmas.filter(d => d.content.toLowerCase().includes(lowerCaseSearchTerm));
        }

        switch (sort) {
            case 'newest':
                filteredDilemmas.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                break;
            case 'most-support':
                filteredDilemmas.sort((a, b) => b.supportCount - a.supportCount);
                break;
            case 'needs-support':
                filteredDilemmas.sort((a, b) => a.supportCount - b.supportCount);
                break;
        }

        const paginatedDilemmas = filteredDilemmas.slice(0, currentPage * POSTS_PER_PAGE);
        const hasMore = paginatedDilemmas.length < filteredDilemmas.length;

        return {
            reportedDilemmas,
            visibleDilemmas: paginatedDilemmas,
            hasMore,
        };
    };

  return {
    allDilemmas: [],
    forYouDilemmas: [],
    isLoading: true,
    filter: 'All',
    sort: 'newest',
    searchTerm: '',
    currentPage: 1,
    reportingDilemmaId: null,
    isReportModalOpen: false,
    blockedUserIds: new Set(),
    reportedDilemmas: [],
    visibleDilemmas: [],
    hasMore: false,

    fetchDilemmas: async () => {
        set({ isLoading: true });
        try {
            const dilemmas = await ApiClient.dilemmas.getDilemmas();
            set(state => ({
                ...state,
                allDilemmas: dilemmas,
                isLoading: false,
                ...calculateDerivedState({ ...state, allDilemmas: dilemmas })
            }));
        } catch (error) {
            console.error("Failed to fetch dilemmas:", error);
            // Provide sample community posts when API fails
            const sampleCommunityPosts: Dilemma[] = [
                {
                    id: 'community-1',
                    userToken: 'user-abc123',
                    content: 'I\'ve been struggling with social anxiety for months. Every time I need to speak up in meetings, my heart races and I freeze up. Has anyone found effective ways to manage this?',
                    category: 'Anxiety',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                    supportCount: 12,
                    isSupported: false,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: undefined,
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system'
                    }
                },
                {
                    id: 'community-2',
                    userToken: 'user-def456',
                    content: 'Going through a difficult breakup after 3 years together. The loneliness hits hardest in the evenings. Looking for healthy coping strategies that have worked for others.',
                    category: 'Relationships',
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                    supportCount: 8,
                    isSupported: true,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: undefined,
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system'
                    }
                },
                {
                    id: 'community-3',
                    userToken: 'user-ghi789',
                    content: 'Started a new exercise routine to help with depression. Week 2 and already feeling more energy. For anyone considering it - even 15 minutes of walking helps!',
                    category: 'Coping Strategies',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                    supportCount: 25,
                    isSupported: false,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: undefined,
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system'
                    }
                }
            ];
            set(state => ({
                ...state,
                allDilemmas: sampleCommunityPosts,
                isLoading: false,
                ...calculateDerivedState({ ...state, allDilemmas: sampleCommunityPosts })
            }));
        }
    },

    fetchForYouFeed: async () => {
        const userToken = authState.userToken;
        if (!userToken) return;
        try {
            const dilemmas = await ApiClient.dilemmas.getForYouFeed(userToken);
            set({ forYouDilemmas: Array.isArray(dilemmas) ? dilemmas : [] });
        } catch (error) {
            console.error("Failed to load For You feed:", error);
            // Provide inspiring sample posts for the "For You" feed
            const sampleForYouPosts: Dilemma[] = [
                {
                    id: 'sample-1',
                    userToken: 'sample-user-1',
                    content: '🌟 Just wanted to share that I completed my first week of daily meditation! Started with just 5 minutes and it\'s already helping with my anxiety. Small steps really do add up. Anyone else trying mindfulness practices?',
                    category: 'Anxiety',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    supportCount: 23,
                    isSupported: false,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: 'User celebrating meditation progress and encouraging others',
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system',
                        flagged: false,
                        approved: true,
                        reviewedBy: 'system',
                        reviewedAt: new Date().toISOString()
                    },
                    aiMatchReason: 'Positive mental health progress post'
                },
                {
                    id: 'sample-2',
                    userToken: 'sample-user-2',
                    content: '💙 Today marks 30 days since I started therapy. I was so scared to take that first step, but it\'s been life-changing. For anyone considering it - you deserve support and healing. The hardest part is just beginning.',
                    category: 'Depression',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                    supportCount: 47,
                    isSupported: true,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: 'Celebrating therapy milestone and encouraging others',
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'mod-sarah',
                        flagged: false,
                        approved: true,
                        reviewedBy: 'mod-sarah',
                        reviewedAt: new Date().toISOString()
                    },
                    aiMatchReason: 'Inspiring recovery story'
                },
                {
                    id: 'sample-3',
                    userToken: 'sample-user-3',
                    content: '🌱 Quick reminder: healing isn\'t linear. I had a tough day yesterday but today I\'m feeling more hopeful. Be gentle with yourself through the ups and downs. You\'re doing better than you think. ✨',
                    category: 'Coping Strategies',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                    supportCount: 31,
                    isSupported: false,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: 'Encouraging post about non-linear healing process',
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system',
                        flagged: false,
                        approved: true,
                        reviewedBy: 'system',
                        reviewedAt: new Date().toISOString()
                    },
                    aiMatchReason: 'Supportive community message'
                },
                {
                    id: 'sample-4',
                    userToken: 'sample-user-4',
                    content: '🎨 Art therapy has been my safe space lately. When words feel too heavy, colors and shapes help me express what I\'m feeling. What creative outlets help you process emotions? Would love to hear your experiences!',
                    category: 'Coping Strategies',
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
                    supportCount: 18,
                    isSupported: true,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: 'Sharing art therapy benefits and asking for community input',
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'mod-alex',
                        flagged: false,
                        approved: true,
                        reviewedBy: 'mod-alex',
                        reviewedAt: new Date().toISOString()
                    },
                    aiMatchReason: 'Creative coping strategy discussion'
                },
                {
                    id: 'sample-5',
                    userToken: 'sample-user-5',
                    content: '🌿 Grateful for this community. Three months ago I felt so alone in my struggles. Now I have a support network of people who truly understand. Thank you for being here and sharing your stories. We\'re stronger together. 💚',
                    category: 'Gratitude',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
                    supportCount: 56,
                    isSupported: false,
                    isReported: false,
                    reportReason: undefined,
                    status: 'active',
                    assignedHelperId: undefined,
                    resolved_by_seeker: false,
                    requestedHelperId: undefined,
                    summary: 'Expressing gratitude for community support',
                    summaryLoading: false,
                    moderation: {
                        action: 'dismissed',
                        timestamp: new Date().toISOString(),
                        moderatorId: 'system',
                        flagged: false,
                        approved: true,
                        reviewedBy: 'system',
                        reviewedAt: new Date().toISOString()
                    },
                    aiMatchReason: 'Community appreciation post'
                }
            ];
            set({ forYouDilemmas: sampleForYouPosts });
        }
    },
    
    setFilter: (filter) => set(state => {
        const newState = { ...state, filter, currentPage: 1 };
        return { ...newState, ...calculateDerivedState(newState) };
    }),
    setSort: (sort) => set(state => {
        const newState = { ...state, sort };
        return { ...newState, ...calculateDerivedState(newState) };
    }),
    setSearchTerm: (term) => set(state => {
        const newState = { ...state, searchTerm: term, currentPage: 1 };
        return { ...newState, ...calculateDerivedState(newState) };
    }),
    loadMore: () => set(state => {
        const newState = { ...state, currentPage: state.currentPage + 1 };
        return { ...newState, ...calculateDerivedState(newState) };
    }),
    
    openReportModal: (dilemmaId) => set({ reportingDilemmaId: dilemmaId, isReportModalOpen: true }),
    closeReportModal: () => set({ reportingDilemmaId: null, isReportModalOpen: false }),

    getDilemmaById: (id) => get().allDilemmas.find(d => d.id === id),
    
    postDilemma: async (data, userToken) => {
        await ApiClient.dilemmas.postDilemma(data, userToken);
        await get().fetchDilemmas();
    },

    createDirectRequest: async (data, userToken, requestedHelperId) => {
        await ApiClient.dilemmas.createDirectRequest(data, userToken, requestedHelperId);
        await get().fetchDilemmas();
    },
    
    toggleSupport: async (dilemmaId) => {
        const updated = await ApiClient.dilemmas.toggleSupport(dilemmaId);
        set(state => {
            const newAllDilemmas = state.allDilemmas.map(d => d.id === updated.id ? updated : d);
            const newState = { ...state, allDilemmas: newAllDilemmas };
            return { ...newState, ...calculateDerivedState(newState) };
        });
    },
    
    reportDilemma: async (reason) => {
        const { reportingDilemmaId } = get();
        if (!reportingDilemmaId) return;
        const updated = await ApiClient.dilemmas.report(reportingDilemmaId, reason);
        set(state => {
            const newAllDilemmas = state.allDilemmas.map(d => d.id === updated.id ? updated : d);
            const newState = { ...state, allDilemmas: newAllDilemmas, reportingDilemmaId: null };
            return { ...newState, ...calculateDerivedState(newState) };
        });
    },
    
    acceptDilemma: async (dilemmaId) => {
        const helper = authState.helperProfile;
        if (!helper) throw new Error("Helper profile not found");
        
        const result = await ApiClient.dilemmas.acceptDilemma(dilemmaId, helper.id);
        
        set(state => {
            const newAllDilemmas = state.allDilemmas.map(d => d.id === result.dilemma.id ? result.dilemma : d);
            const newState = { ...state, allDilemmas: newAllDilemmas };
            return { ...newState, ...calculateDerivedState(newState) };
        });
        
        if (result.updatedHelper) {
            authService.updateHelperProfile(result.updatedHelper);
        }
        
        if (result.newAchievements && result.newAchievements.length > 0) {
            result.newAchievements.forEach(ach => {
                notificationService.addToast(`🏆 Achievement Unlocked: ${ach.name}!`, 'success');
            });
        }

        useChatStore.getState().startChat(result.dilemma.id, 'helper');
    },
    
    declineRequest: async (dilemmaId) => {
        const helper = authState.helperProfile;
        if (!helper) throw new Error("Helper profile not found");

        const updatedDilemma = await ApiClient.dilemmas.declineRequest(dilemmaId, helper.id);
        set(state => {
            const newAllDilemmas = state.allDilemmas.map(d => d.id === updatedDilemma.id ? updatedDilemma : d);
            const newState = { ...state, allDilemmas: newAllDilemmas };
            return { ...newState, ...calculateDerivedState(newState) };
        });
    },

    resolveDilemma: async (dilemmaId, userToken) => {
        const updated = await ApiClient.dilemmas.resolveBySeeker(dilemmaId, userToken);
        set(state => {
            const newAllDilemmas = state.allDilemmas.map(d => d.id === updated.id ? updated : d);
            const newState = { ...state, allDilemmas: newAllDilemmas };
            return { ...newState, ...calculateDerivedState(newState) };
        });
    },

    summarizeDilemma: async (dilemmaId) => {
        const dilemma = get().allDilemmas.find(d => d.id === dilemmaId);
        if (!dilemma) return;

        set(state => ({ allDilemmas: state.allDilemmas.map(d => d.id === dilemmaId ? { ...d, summaryLoading: true } : d) }));
        try {
            const summary = await ApiClient.ai.summarizeDilemma(dilemma.content);
            set(state => ({ allDilemmas: state.allDilemmas.map(d => d.id === dilemmaId ? { ...d, summary, summaryLoading: false } : d) }));
        } catch (err) {
            console.error("Failed to summarize dilemma", err);
            set(state => ({ allDilemmas: state.allDilemmas.map(d => d.id === dilemmaId ? { ...d, summaryLoading: false } : d) }));
        }
    },

    dismissReport: async (dilemmaId) => {
        const helper = authState.helperProfile;
        if (!helper) throw new Error("Moderator profile not found");
        await ApiClient.moderation.dismissReport(dilemmaId, helper);
        await get().fetchDilemmas();
    },

    removePost: async (dilemmaId) => {
        const helper = authState.helperProfile;
        if (!helper) throw new Error("Moderator profile not found");
        await ApiClient.moderation.removePost(dilemmaId, helper);
        await get().fetchDilemmas();
    },
  }
});

// Initial data fetch
useDilemmaStore.getState().fetchDilemmas();