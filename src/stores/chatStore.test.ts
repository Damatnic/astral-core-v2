import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { useChatStore } from './chatStore';
import { useDilemmaStore } from './dilemmaStore';
import { useSessionStore } from './sessionStore';
import { ApiClient } from '../utils/ApiClient';
import { act } from 'react';

jest.mock('../utils/ApiClient');
jest.mock('./dilemmaStore');
jest.mock('./sessionStore');

const mockedApiClient = ApiClient as jest.Mocked<typeof ApiClient>;
const mockedDilemmaStore = useDilemmaStore as jest.Mocked<any>;
const mockedSessionStore = useSessionStore as jest.Mocked<any>;

const initialState = useChatStore.getState();

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState(initialState);
    jest.clearAllMocks();
  });

  test('startChat should fetch messages and set the active chat', async () => {
    const dilemmaId = 'd1';
    const mockMessages = [{ id: 'm1', text: 'Hello' }];
    const mockDilemma = { id: dilemmaId, assignedHelperId: 'h1' };
    const mockSession = { id: 's1', dilemmaId };
    
    mockedApiClient.chat.getMessages.mockResolvedValue(mockMessages as any);
    mockedDilemmaStore.getState.mockReturnValue({ getDilemmaById: () => mockDilemma });
    mockedSessionStore.getState.mockReturnValue({ getHelpSessionByDilemmaId: () => mockSession });
    mockedApiClient.helpers.getById.mockResolvedValue({ id: 'h1', displayName: 'Helper' } as any);

    await act(async () => {
      await useChatStore.getState().startChat(dilemmaId, 'seeker');
    });

    const state = useChatStore.getState();
    expect(state.activeChatId).toBe(dilemmaId);
    expect(state.chatSessions[dilemmaId]).toBeDefined();
    expect(state.chatSessions[dilemmaId].messages).toEqual(mockMessages);
    expect(state.chatSessions[dilemmaId].perspective).toBe('seeker');
  });

  test('sendMessage should add an optimistic message and call the API', async () => {
    const dilemmaId = 'd1';
    const text = 'New message';
    const mockSavedMessage = { id: 'm2', text, sender: 'poster', timestamp: new Date().toISOString() };
    
    // Set up initial state with active chat
    useChatStore.setState({ 
      activeChatId: dilemmaId, 
      chatSessions: { 
        [dilemmaId]: { 
          dilemmaId, 
          messages: [], 
          perspective: 'seeker',
          unread: false,
          isTyping: false
        } as any 
      }
    });
    
    mockedDilemmaStore.getState.mockReturnValue({ getDilemmaById: () => ({ userToken: 'user123' }) });
    mockedApiClient.chat.sendMessage.mockResolvedValue(mockSavedMessage as any);

    await act(async () => {
      await useChatStore.getState().sendMessage(dilemmaId, text);
    });

    const state = useChatStore.getState();
    expect(state.chatSessions[dilemmaId].messages).toHaveLength(1);
    expect(state.chatSessions[dilemmaId].messages[0].text).toBe(text);
    expect(state.chatSessions[dilemmaId].messages[0].sender).toBe('poster'); // 'poster' for seeker perspective
    expect(mockedApiClient.chat.sendMessage).toHaveBeenCalledWith(dilemmaId, text, 'poster', 'user123');
  });

  test('closeChat should clear active chat and trigger feedback modal', () => {
    const dilemmaId = 'd1';
    const sessionId = 's1';
    useChatStore.setState({ 
      activeChatId: dilemmaId, 
      chatSessions: { 
        [dilemmaId]: { 
          helpSessionId: sessionId,
          dilemmaId,
          messages: [],
          perspective: 'seeker',
          unread: false,
          isTyping: false
        } as any 
      }
    });
    
    // Note: endHelpSession is commented out in the actual implementation
    // const endSessionMock = jest.fn();
    // mockedSessionStore.getState.mockReturnValue({ endHelpSession: endSessionMock });

    act(() => {
      useChatStore.getState().closeChat(dilemmaId);
    });
    
    const state = useChatStore.getState();
    expect(state.activeChatId).toBeNull();
    expect(state.isFeedbackModalOpen).toBe(true);
    expect(state.lastChatDilemmaId).toBe(dilemmaId);
    // endHelpSession is no longer called as per the implementation
    // expect(endSessionMock).toHaveBeenCalledWith(sessionId);
  });
});
