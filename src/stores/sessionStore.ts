import { create } from 'zustand';
import { HelpSession } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';

interface SessionState {
  helpSessions: HelpSession[];
  videoChatDilemmaId: string | null;
  pendingVideoChatDilemmaId: string | null;
  isVideoConsentModalOpen: boolean;

  fetchHelpSessions: () => Promise<void>;
  getHelpSessionByDilemmaId: (dilemmaId: string) => HelpSession | undefined;
  toggleFavorite: (sessionId: string) => Promise<void>;
  sendKudos: (sessionId: string) => Promise<void>;
  generateSeekerSummary: (sessionId: string) => Promise<void>;
  generateHelperPerformanceSummary: (sessionId: string) => Promise<void>;
  
  // Video Chat Actions
  startVideoChat: (dilemmaId: string) => void;
  acceptVideoConsent: () => void;
  declineVideoConsent: () => void;
  endVideoChat: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  helpSessions: [],
  videoChatDilemmaId: null,
  pendingVideoChatDilemmaId: null,
  isVideoConsentModalOpen: false,

  fetchHelpSessions: async () => {
    const userId = authState.user?.sub || authState.userToken;
    if (!userId) return;
    try {
      const sessions = await ApiClient.helpSessions.getForUser(userId);
      set({ helpSessions: sessions });
    } catch (error) {
      console.error("Failed to load help sessions:", error);
    }
  },

  getHelpSessionByDilemmaId: (dilemmaId) => {
    return get().helpSessions.find(s => s.dilemmaId === dilemmaId);
  },

  toggleFavorite: async (sessionId) => {
    const seekerId = authState.userToken;
    if (!seekerId) return;
    const updatedSession = await ApiClient.helpSessions.toggleFavorite(sessionId, seekerId);
    set(state => ({
      helpSessions: state.helpSessions.map(s => s.id === updatedSession.id ? updatedSession : s),
    }));
  },

  sendKudos: async (sessionId) => {
    const seekerId = authState.userToken;
    if (!seekerId) return;

    set(state => ({
        helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, kudosGiven: true } : s),
    }));

    try {
      const result = await ApiClient.helpSessions.sendKudos(sessionId, seekerId);
      if (result && result.updatedHelper) {
          authService.updateHelperProfile(result.updatedHelper);
      }
      if (result && result.newAchievements && result.newAchievements.length > 0) {
          result.newAchievements.forEach(ach => {
              notificationService.addToast(`🏆 Achievement Unlocked: ${ach.name}!`, 'success');
          });
      }
    } catch (error) {
      console.error("Failed to send kudos:", error);
       set(state => ({
        helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, kudosGiven: false } : s),
    }));
    }
  },

  generateSeekerSummary: async (sessionId) => {
    const session = get().helpSessions.find(s => s.id === sessionId);
    if (!session) return;

    set(state => ({
        helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, summaryLoading: true } : s)
    }));

    try {
        const messages = await ApiClient.chat.getMessages(session.dilemmaId);
        const transcript = messages.map(m => `${m.sender === 'poster' ? 'Seeker' : 'Helper'}: ${m.text}`).join('\n');
        const summary = await ApiClient.ai.summarizeChat(transcript);
        set(state => ({
            helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, summary, summaryLoading: false } : s)
        }));
    } catch (err) {
        console.error("Failed to generate seeker summary:", err);
        set(state => ({
            helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, summaryLoading: false } : s)
        }));
        throw err; // Re-throw for the component to catch
    }
  },
  
  generateHelperPerformanceSummary: async (sessionId) => {
    set(state => ({ helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, helperSummaryLoading: true } : s)}));
    try {
        // In a real app, we would get the chat transcript from the session
        const summary = await ApiClient.ai.summarizeHelperPerformance("");
        set(state => ({ helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, helperSummary: summary, helperSummaryLoading: false } : s)}));
    } catch(err) {
        console.error("Failed to generate helper summary:", err);
        set(state => ({ helpSessions: state.helpSessions.map(s => s.id === sessionId ? { ...s, helperSummaryLoading: false } : s)}));
    }
  },
  
  // --- Video Chat Implementation ---
  startVideoChat: (dilemmaId: string) => {
    set({ pendingVideoChatDilemmaId: dilemmaId, isVideoConsentModalOpen: true });
  },
  acceptVideoConsent: () => {
    const pendingId = get().pendingVideoChatDilemmaId;
    if (pendingId) {
        set({
            videoChatDilemmaId: pendingId,
            pendingVideoChatDilemmaId: null,
            isVideoConsentModalOpen: false,
        });
    }
  },
  declineVideoConsent: () => {
    set({ pendingVideoChatDilemmaId: null, isVideoConsentModalOpen: false });
  },
  endVideoChat: () => {
    set({ videoChatDilemmaId: null });
    // Maybe add a toast here via a notification context/store
  },
}));