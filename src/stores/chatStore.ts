import { create } from 'zustand';
import { ChatMessage, ChatSession, HelperGuidance } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { useDilemmaStore } from './dilemmaStore';
import { useSessionStore } from './sessionStore';

interface ChatState {
  chatSessions: Record<string, ChatSession>;
  activeChatId: string | null;
  lastChatDilemmaId: string | null;
  guidance: HelperGuidance | null;
  isFeedbackModalOpen: boolean;

  // Computed
  activeChat: ChatSession | null;
  hasUnreadNotifications: boolean;

  // Actions
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  startChat: (dilemmaId: string, perspective: 'seeker' | 'helper') => Promise<void>;
  closeChat: (dilemmaId: string) => void;
  sendMessage: (dilemmaId: string, text: string) => Promise<void>;
  setTyping: (dilemmaId: string, isTyping: boolean) => void;
  submitFeedback: (wasHelpful: boolean) => Promise<void>;
  dismissGuidance: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatSessions: {},
  activeChatId: null,
  lastChatDilemmaId: null,
  guidance: null,
  isFeedbackModalOpen: false,
  
  get activeChat() {
    const { activeChatId, chatSessions } = get();
    return activeChatId ? chatSessions[activeChatId] : null;
  },
  
  get hasUnreadNotifications() {
    return Object.values(get().chatSessions).some((s: ChatSession) => s.unread);
  },

  openFeedbackModal: () => set({ isFeedbackModalOpen: true }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),

  startChat: async (dilemmaId, perspective) => {
    try {
      const messages = await ApiClient.chat.getMessages(dilemmaId);
      const helpSession = useSessionStore.getState().getHelpSessionByDilemmaId(dilemmaId);
      const dilemma = useDilemmaStore.getState().getDilemmaById(dilemmaId);
      const helperId = dilemma?.assignedHelperId;
      const helper = helperId ? await ApiClient.helpers.getById(helperId) : undefined;
      
      set((state) => ({
        ...state,
        chatSessions: {
          ...state.chatSessions,
          [dilemmaId]: {
            dilemmaId,
            messages,
            unread: false,
            isTyping: false,
            perspective,
            helpSessionId: helpSession?.id,
            helper: helper || undefined,
          }
        },
        activeChatId: dilemmaId,
      }));
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  },

  closeChat: (dilemmaId) => {
    const { chatSessions } = get();
    const chatSession = chatSessions[dilemmaId];
    if (chatSession?.helpSessionId) {
      // This is now handled by the backend when a dilemma is resolved.
      // useSessionStore.getState().endHelpSession(chatSession.helpSessionId);
    }
    set({
      activeChatId: null,
      lastChatDilemmaId: dilemmaId,
      isFeedbackModalOpen: true,
      guidance: null,
    });
  },

  sendMessage: async (dilemmaId, text) => {
    const { activeChat } = get();
    const dilemma = useDilemmaStore.getState().getDilemmaById(dilemmaId);
    const sender = activeChat?.perspective === 'seeker' ? 'poster' : 'user';
    const senderId = activeChat?.perspective === 'seeker' ? dilemma?.userToken : authState.helperProfile?.id;

    if (!senderId) {
        console.error("Could not determine sender ID for chat message.");
        return;
    }

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender,
      text,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      chatSessions: {
        ...state.chatSessions,
        [dilemmaId]: {
          ...state.chatSessions[dilemmaId],
          messages: [...(state.chatSessions[dilemmaId]?.messages ?? []), optimisticMessage],
        },
      },
    }));

    const savedMessage = await ApiClient.chat.sendMessage(dilemmaId, text, sender, senderId);
    // Optionally, replace optimistic message with the real one from the server
    set(state => ({
        chatSessions: {
            ...state.chatSessions,
            [dilemmaId]: {
                ...state.chatSessions[dilemmaId],
                messages: state.chatSessions[dilemmaId].messages.map(m => m.id === optimisticMessage.id ? savedMessage : m),
            }
        }
    }));
    
    // If the seeker sent the message, and the current user is a helper, check for guidance.
    if (sender === 'poster' && activeChat?.perspective === 'helper') {
        try {
            const guidanceResult = await ApiClient.ai.getHelperGuidance(text);
            if (guidanceResult.isCrisis || (guidanceResult.flagReason && guidanceResult.flagReason !== "none")) {
                set({ guidance: { ...guidanceResult, dilemmaId } });
            }
        } catch (error) {
            console.error("Failed to get AI helper guidance:", error);
        }
    }

  },

  setTyping: (dilemmaId, isTyping) => {
    set(state => ({
      chatSessions: {
        ...state.chatSessions,
        [dilemmaId]: { ...state.chatSessions[dilemmaId], isTyping },
      },
    }));
  },

  submitFeedback: async (wasHelpful) => {
    const { lastChatDilemmaId } = get();
    if (lastChatDilemmaId) {
      const dilemma = useDilemmaStore.getState().getDilemmaById(lastChatDilemmaId);
      if (dilemma?.assignedHelperId) {
        await ApiClient.feedback.submitFeedback(dilemma.id, dilemma.assignedHelperId, wasHelpful);
      }
    }
    set({ lastChatDilemmaId: null, isFeedbackModalOpen: false });
  },
  
  dismissGuidance: () => set({ guidance: null }),
}));
