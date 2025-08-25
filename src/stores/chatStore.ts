/**
 * Chat Store
 *
 * Zustand store for managing chat sessions, messages, helper guidance,
 * and feedback functionality for the mental health platform.
 * 
 * @fileoverview Chat state management with real-time messaging support
 * @version 2.0.0
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ChatMessage, ChatSession, HelperGuidance } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { useDilemmaStore } from './dilemmaStore';
import { useSessionStore } from './sessionStore';

/**
 * Chat state interface
 */
export interface ChatState {
  // Core state
  chatSessions: Record<string, ChatSession>;
  activeChatId: string | null;
  lastChatDilemmaId: string | null;
  guidance: HelperGuidance | null;
  isFeedbackModalOpen: boolean;
  isTyping: Record<string, boolean>; // Track typing status per chat
  unreadCounts: Record<string, number>; // Unread message counts per chat
  
  // Loading states
  isLoadingChat: boolean;
  isSendingMessage: boolean;
  isSubmittingFeedback: boolean;
  
  // Error states
  chatError: string | null;
  messageError: string | null;
  feedbackError: string | null;
}

/**
 * Chat actions interface
 */
export interface ChatActions {
  // Computed getters
  activeChat: ChatSession | null;
  hasUnreadNotifications: boolean;
  totalUnreadCount: number;
  
  // Chat management actions
  startChat: (dilemmaId: string, perspective: 'seeker' | 'helper') => Promise<void>;
  closeChat: (dilemmaId: string) => void;
  switchToChat: (chatId: string) => void;
  clearAllChats: () => void;
  
  // Message actions
  sendMessage: (dilemmaId: string, text: string, attachments?: any[]) => Promise<void>;
  markMessagesAsRead: (chatId: string) => void;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  
  // Typing indicators
  setTyping: (dilemmaId: string, isTyping: boolean) => void;
  clearTyping: (dilemmaId: string) => void;
  
  // Guidance and feedback
  dismissGuidance: () => void;
  setGuidance: (guidance: HelperGuidance) => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  submitFeedback: (wasHelpful: boolean, additionalComments?: string) => Promise<void>;
  
  // Real-time updates
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  updateChatSession: (chatId: string, updates: Partial<ChatSession>) => void;
  
  // Error handling
  clearErrors: () => void;
  setChatError: (error: string) => void;
  setMessageError: (error: string) => void;
  setFeedbackError: (error: string) => void;
  
  // Utility actions
  getChatHistory: (chatId: string) => Promise<ChatMessage[]>;
  exportChatHistory: (chatId: string) => Promise<string>;
  searchMessages: (query: string, chatId?: string) => ChatMessage[];
}

/**
 * Combined chat store interface
 */
export type ChatStore = ChatState & ChatActions;

/**
 * Chat store implementation
 */
export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        chatSessions: {},
        activeChatId: null,
        lastChatDilemmaId: null,
        guidance: null,
        isFeedbackModalOpen: false,
        isTyping: {},
        unreadCounts: {},
        
        // Loading states
        isLoadingChat: false,
        isSendingMessage: false,
        isSubmittingFeedback: false,
        
        // Error states
        chatError: null,
        messageError: null,
        feedbackError: null,

        // Computed getters
        get activeChat() {
          const { activeChatId, chatSessions } = get();
          return activeChatId ? chatSessions[activeChatId] || null : null;
        },

        get hasUnreadNotifications() {
          const { unreadCounts } = get();
          return Object.values(unreadCounts).some(count => count > 0);
        },

        get totalUnreadCount() {
          const { unreadCounts } = get();
          return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
        },

        // Chat management actions
        startChat: async (dilemmaId: string, perspective: 'seeker' | 'helper') => {
          const state = get();
          
          try {
            set({ isLoadingChat: true, chatError: null });
            
            // Check if chat already exists
            const existingChatId = Object.keys(state.chatSessions).find(
              id => state.chatSessions[id].dilemmaId === dilemmaId
            );
            
            if (existingChatId) {
              set({ 
                activeChatId: existingChatId,
                lastChatDilemmaId: dilemmaId,
                isLoadingChat: false 
              });
              return;
            }
            
            // Create new chat session
            const response = await ApiClient.post('/api/chat/start', {
              dilemmaId,
              perspective,
              userToken: authState.userToken
            });
            
            if (response.success && response.data) {
              const newSession: ChatSession = {
                id: response.data.chatId,
                dilemmaId,
                perspective,
                messages: [],
                participants: response.data.participants || [],
                status: 'active',
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                metadata: response.data.metadata || {}
              };
              
              set(state => ({
                chatSessions: {
                  ...state.chatSessions,
                  [newSession.id]: newSession
                },
                activeChatId: newSession.id,
                lastChatDilemmaId: dilemmaId,
                unreadCounts: {
                  ...state.unreadCounts,
                  [newSession.id]: 0
                },
                isLoadingChat: false
              }));
              
              // Update session store if available
              const sessionStore = useSessionStore.getState();
              if (sessionStore.startSession) {
                sessionStore.startSession({
                  type: 'chat',
                  dilemmaId,
                  chatId: newSession.id
                });
              }
            } else {
              throw new Error(response.error || 'Failed to start chat');
            }
          } catch (error) {
            console.error('Failed to start chat:', error);
            set({ 
              chatError: error instanceof Error ? error.message : 'Failed to start chat',
              isLoadingChat: false 
            });
          }
        },

        closeChat: (dilemmaId: string) => {
          const state = get();
          const chatId = Object.keys(state.chatSessions).find(
            id => state.chatSessions[id].dilemmaId === dilemmaId
          );
          
          if (chatId) {
            set(state => {
              const newSessions = { ...state.chatSessions };
              const newUnreadCounts = { ...state.unreadCounts };
              const newTyping = { ...state.isTyping };
              
              delete newSessions[chatId];
              delete newUnreadCounts[chatId];
              delete newTyping[chatId];
              
              return {
                chatSessions: newSessions,
                unreadCounts: newUnreadCounts,
                isTyping: newTyping,
                activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
                lastChatDilemmaId: state.lastChatDilemmaId === dilemmaId ? null : state.lastChatDilemmaId
              };
            });
          }
        },

        switchToChat: (chatId: string) => {
          const state = get();
          if (state.chatSessions[chatId]) {
            set({ 
              activeChatId: chatId,
              lastChatDilemmaId: state.chatSessions[chatId].dilemmaId 
            });
            
            // Mark messages as read
            get().markMessagesAsRead(chatId);
          }
        },

        clearAllChats: () => {
          set({
            chatSessions: {},
            activeChatId: null,
            lastChatDilemmaId: null,
            unreadCounts: {},
            isTyping: {},
            guidance: null,
            isFeedbackModalOpen: false
          });
        },

        // Message actions
        sendMessage: async (dilemmaId: string, text: string, attachments?: any[]) => {
          const state = get();
          const chatId = Object.keys(state.chatSessions).find(
            id => state.chatSessions[id].dilemmaId === dilemmaId
          );
          
          if (!chatId) {
            set({ messageError: 'Chat session not found' });
            return;
          }
          
          try {
            set({ isSendingMessage: true, messageError: null });
            
            const tempMessage: ChatMessage = {
              id: `temp-${Date.now()}`,
              chatId,
              senderId: authState.user?.id || 'unknown',
              content: text,
              type: 'text',
              timestamp: Date.now(),
              status: 'sending',
              attachments: attachments || []
            };
            
            // Add temporary message to UI
            get().addMessage(chatId, tempMessage);
            
            const response = await ApiClient.post('/api/chat/message', {
              chatId,
              dilemmaId,
              text,
              attachments,
              userToken: authState.userToken
            });
            
            if (response.success && response.data) {
              // Replace temporary message with server response
              set(state => ({
                chatSessions: {
                  ...state.chatSessions,
                  [chatId]: {
                    ...state.chatSessions[chatId],
                    messages: state.chatSessions[chatId].messages.map(msg =>
                      msg.id === tempMessage.id 
                        ? { ...response.data.message, status: 'sent' }
                        : msg
                    ),
                    lastActivity: new Date().toISOString()
                  }
                },
                isSendingMessage: false
              }));
            } else {
              // Mark message as failed
              get().updateMessage(chatId, tempMessage.id, { status: 'failed' });
              throw new Error(response.error || 'Failed to send message');
            }
          } catch (error) {
            console.error('Failed to send message:', error);
            set({ 
              messageError: error instanceof Error ? error.message : 'Failed to send message',
              isSendingMessage: false 
            });
          }
        },

        markMessagesAsRead: (chatId: string) => {
          set(state => ({
            unreadCounts: {
              ...state.unreadCounts,
              [chatId]: 0
            }
          }));
        },

        deleteMessage: async (chatId: string, messageId: string) => {
          try {
            const response = await ApiClient.delete(`/api/chat/message/${messageId}`, {
              userToken: authState.userToken
            });
            
            if (response.success) {
              set(state => ({
                chatSessions: {
                  ...state.chatSessions,
                  [chatId]: {
                    ...state.chatSessions[chatId],
                    messages: state.chatSessions[chatId].messages.filter(
                      msg => msg.id !== messageId
                    )
                  }
                }
              }));
            }
          } catch (error) {
            console.error('Failed to delete message:', error);
            set({ messageError: 'Failed to delete message' });
          }
        },

        editMessage: async (chatId: string, messageId: string, newText: string) => {
          try {
            const response = await ApiClient.put(`/api/chat/message/${messageId}`, {
              text: newText,
              userToken: authState.userToken
            });
            
            if (response.success) {
              get().updateMessage(chatId, messageId, {
                content: newText,
                edited: true,
                editedAt: Date.now()
              });
            }
          } catch (error) {
            console.error('Failed to edit message:', error);
            set({ messageError: 'Failed to edit message' });
          }
        },

        // Typing indicators
        setTyping: (dilemmaId: string, isTyping: boolean) => {
          set(state => ({
            isTyping: {
              ...state.isTyping,
              [dilemmaId]: isTyping
            }
          }));
          
          // Auto-clear typing after 3 seconds
          if (isTyping) {
            setTimeout(() => {
              get().clearTyping(dilemmaId);
            }, 3000);
          }
        },

        clearTyping: (dilemmaId: string) => {
          set(state => {
            const newTyping = { ...state.isTyping };
            delete newTyping[dilemmaId];
            return { isTyping: newTyping };
          });
        },

        // Guidance and feedback
        dismissGuidance: () => {
          set({ guidance: null });
        },

        setGuidance: (guidance: HelperGuidance) => {
          set({ guidance });
        },

        openFeedbackModal: () => {
          set({ isFeedbackModalOpen: true });
        },

        closeFeedbackModal: () => {
          set({ isFeedbackModalOpen: false, feedbackError: null });
        },

        submitFeedback: async (wasHelpful: boolean, additionalComments?: string) => {
          const state = get();
          
          try {
            set({ isSubmittingFeedback: true, feedbackError: null });
            
            const response = await ApiClient.post('/api/feedback', {
              chatId: state.activeChatId,
              dilemmaId: state.lastChatDilemmaId,
              wasHelpful,
              additionalComments,
              userToken: authState.userToken
            });
            
            if (response.success) {
              set({ 
                isFeedbackModalOpen: false,
                isSubmittingFeedback: false 
              });
            } else {
              throw new Error(response.error || 'Failed to submit feedback');
            }
          } catch (error) {
            console.error('Failed to submit feedback:', error);
            set({ 
              feedbackError: error instanceof Error ? error.message : 'Failed to submit feedback',
              isSubmittingFeedback: false 
            });
          }
        },

        // Real-time updates
        addMessage: (chatId: string, message: ChatMessage) => {
          set(state => {
            const chat = state.chatSessions[chatId];
            if (!chat) return state;
            
            const isFromOtherUser = message.senderId !== authState.user?.id;
            
            return {
              chatSessions: {
                ...state.chatSessions,
                [chatId]: {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastActivity: new Date().toISOString()
                }
              },
              unreadCounts: {
                ...state.unreadCounts,
                [chatId]: isFromOtherUser 
                  ? (state.unreadCounts[chatId] || 0) + 1
                  : state.unreadCounts[chatId] || 0
              }
            };
          });
        },

        updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => {
          set(state => ({
            chatSessions: {
              ...state.chatSessions,
              [chatId]: {
                ...state.chatSessions[chatId],
                messages: state.chatSessions[chatId].messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                )
              }
            }
          }));
        },

        updateChatSession: (chatId: string, updates: Partial<ChatSession>) => {
          set(state => ({
            chatSessions: {
              ...state.chatSessions,
              [chatId]: {
                ...state.chatSessions[chatId],
                ...updates
              }
            }
          }));
        },

        // Error handling
        clearErrors: () => {
          set({ 
            chatError: null, 
            messageError: null, 
            feedbackError: null 
          });
        },

        setChatError: (error: string) => {
          set({ chatError: error });
        },

        setMessageError: (error: string) => {
          set({ messageError: error });
        },

        setFeedbackError: (error: string) => {
          set({ feedbackError: error });
        },

        // Utility actions
        getChatHistory: async (chatId: string) => {
          try {
            const response = await ApiClient.get(`/api/chat/${chatId}/history`, {
              userToken: authState.userToken
            });
            
            if (response.success && response.data) {
              return response.data.messages || [];
            }
            return [];
          } catch (error) {
            console.error('Failed to get chat history:', error);
            return [];
          }
        },

        exportChatHistory: async (chatId: string) => {
          const state = get();
          const chat = state.chatSessions[chatId];
          
          if (!chat) return '';
          
          const messages = chat.messages.map(msg => 
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.senderId}: ${msg.content}`
          ).join('\n');
          
          return `Chat History - ${chat.dilemmaId}\n${'='.repeat(50)}\n${messages}`;
        },

        searchMessages: (query: string, chatId?: string) => {
          const state = get();
          const searchIn = chatId 
            ? [state.chatSessions[chatId]].filter(Boolean)
            : Object.values(state.chatSessions);
          
          const results: ChatMessage[] = [];
          const lowerQuery = query.toLowerCase();
          
          searchIn.forEach(chat => {
            chat.messages.forEach(message => {
              if (message.content.toLowerCase().includes(lowerQuery)) {
                results.push(message);
              }
            });
          });
          
          return results.sort((a, b) => b.timestamp - a.timestamp);
        }
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          chatSessions: state.chatSessions,
          lastChatDilemmaId: state.lastChatDilemmaId,
          unreadCounts: state.unreadCounts
        })
      }
    ),
    { name: 'ChatStore' }
  )
);

/**
 * Default export for convenience
 */
export default useChatStore;
