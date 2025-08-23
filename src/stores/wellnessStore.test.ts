import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useWellnessStore } from './wellnessStore';
import { ApiClient } from '../utils/ApiClient';
import { act } from 'react';
import { authState } from '../contexts/AuthContext';

jest.mock('../utils/ApiClient');

const mockedApiClient = ApiClient as jest.Mocked<typeof ApiClient>;
const initialState = useWellnessStore.getState();

describe('wellnessStore', () => {
  beforeEach(() => {
    useWellnessStore.setState(initialState);
    jest.clearAllMocks();
    authState.userToken = 'user123';
  });

  afterEach(() => {
    authState.userToken = null;
  });

  test('fetchHistory should update state on successful API call', async () => {
    const mockHistory = [{ id: '1', moodScore: 4 }];
    mockedApiClient.mood.getHistory.mockResolvedValue(mockHistory as any);

    await act(async () => {
      await useWellnessStore.getState().fetchHistory();
    });

    expect(useWellnessStore.getState().isLoading).toBe(false);
    expect(useWellnessStore.getState().history).toEqual(mockHistory);
    expect(mockedApiClient.mood.getHistory).toHaveBeenCalledWith('user123');
  });

  test('postCheckIn should call the API and then refresh history', async () => {
    const checkInData = { moodScore: 5, tags: ['Grateful'] };
    mockedApiClient.mood.postCheckIn.mockResolvedValue({} as any);
    mockedApiClient.mood.getHistory.mockResolvedValue([]); // For the refresh call

    await act(async () => {
      await useWellnessStore.getState().postCheckIn(checkInData as any);
    });

    expect(mockedApiClient.mood.postCheckIn).toHaveBeenCalledWith(checkInData, 'user123');
    expect(mockedApiClient.mood.getHistory).toHaveBeenCalledTimes(1);
  });

  test('fetchHabits should fetch all data and calculate streaks', async () => {
    const mockPredefined = [{ id: 'h1', name: 'Meditate' }];
    const mockTrackedIds = ['h1'];
    const mockCompletions = [{ habitId: 'h1', completedAt: new Date().toISOString() }];

    mockedApiClient.habits.getPredefinedHabits.mockResolvedValue(mockPredefined as any);
    mockedApiClient.habits.getTrackedHabitIds.mockResolvedValue(mockTrackedIds);
    mockedApiClient.habits.getCompletions.mockResolvedValue(mockCompletions as any);
    
    await act(async () => {
      await useWellnessStore.getState().fetchHabits();
    });

    const state = useWellnessStore.getState();
    expect(state.isLoadingHabits).toBe(false);
    expect(state.predefinedHabits).toEqual(mockPredefined);
    expect(state.trackedHabits).toHaveLength(1);
    expect(state.trackedHabits[0].currentStreak).toBe(1); // From calculateStreaks
  });
});
