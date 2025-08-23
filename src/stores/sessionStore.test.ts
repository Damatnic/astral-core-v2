import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useSessionStore } from './sessionStore';
import { ApiClient } from '../utils/ApiClient';
import { act } from 'react';
import { authState } from '../contexts/AuthContext';

jest.mock('../utils/ApiClient');

const mockedApiClient = ApiClient as jest.Mocked<typeof ApiClient>;
const initialState = useSessionStore.getState();

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState(initialState);
    jest.clearAllMocks();
    // Mock authenticated user
    authState.user = { sub: 'user123' };
  });

  afterEach(() => {
    authState.user = null;
  });

  test('fetchHelpSessions should update state on successful API call', async () => {
    const mockSessions = [{ id: 's1', dilemmaId: 'd1' }];
    mockedApiClient.helpSessions.getForUser.mockResolvedValue(mockSessions as any);

    await act(async () => {
      await useSessionStore.getState().fetchHelpSessions();
    });

    expect(useSessionStore.getState().helpSessions).toEqual(mockSessions);
    expect(mockedApiClient.helpSessions.getForUser).toHaveBeenCalledWith('user123');
  });
  
  test('toggleFavorite should call the API and update the session in the store', async () => {
    const initialSession = { id: 's1', isFavorited: false };
    authState.userToken = 'user123'; // Set userToken for this test
    useSessionStore.setState({ helpSessions: [initialSession] as any });
    
    const updatedSession = { ...initialSession, isFavorited: true };
    mockedApiClient.helpSessions.toggleFavorite.mockResolvedValue(updatedSession as any);
    
    await act(async () => {
      await useSessionStore.getState().toggleFavorite('s1');
    });

    expect(mockedApiClient.helpSessions.toggleFavorite).toHaveBeenCalledWith('s1', 'user123');
    expect(useSessionStore.getState().helpSessions[0].isFavorited).toBe(true);
  });

  test('sendKudos should optimistically update and then call the API', async () => {
    const initialSession = { id: 's1', kudosGiven: false };
    authState.userToken = 'user123'; // Set userToken for this test
    useSessionStore.setState({ helpSessions: [initialSession] as any });

    mockedApiClient.helpSessions.sendKudos.mockResolvedValue({} as any);

    await act(async () => {
      await useSessionStore.getState().sendKudos('s1');
    });

    // Check optimistic update happened
    expect(useSessionStore.getState().helpSessions[0].kudosGiven).toBe(true);
    expect(mockedApiClient.helpSessions.sendKudos).toHaveBeenCalledWith('s1', 'user123');
  });

  test('sendKudos should revert optimistic update on API failure', async () => {
    const initialSession = { id: 's1', kudosGiven: false };
    authState.userToken = 'user123'; // Set userToken for this test
    useSessionStore.setState({ helpSessions: [initialSession] as any });

    mockedApiClient.helpSessions.sendKudos.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      await useSessionStore.getState().sendKudos('s1');
    });

    // Check that the state was reverted
    expect(useSessionStore.getState().helpSessions[0].kudosGiven).toBe(false);
  });
});
