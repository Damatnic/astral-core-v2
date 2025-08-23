import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { useDilemmaStore } from './dilemmaStore';
import { ApiClient } from '../utils/ApiClient';
import { act } from 'react';

// Mock the entire ApiClient
jest.mock('../utils/ApiClient', () => ({
  ApiClient: {
    dilemmas: {
      getDilemmas: jest.fn(),
      postDilemma: jest.fn(),
      toggleSupport: jest.fn(),
    },
  },
}));

const mockedApiClient = ApiClient as jest.Mocked<typeof ApiClient>;
const initialState = useDilemmaStore.getState();

describe('dilemmaStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useDilemmaStore.setState(initialState);
    // Clear all mock implementations and call counts
    jest.clearAllMocks();
  });

  test('fetchDilemmas should update state on successful API call', async () => {
    const mockDilemmas = [{ id: '1', content: 'Test Dilemma' }];
    mockedApiClient.dilemmas.getDilemmas.mockResolvedValue(mockDilemmas as any);

    await act(async () => {
      await useDilemmaStore.getState().fetchDilemmas();
    });

    expect(useDilemmaStore.getState().isLoading).toBe(false);
    expect(useDilemmaStore.getState().allDilemmas).toEqual(mockDilemmas);
    expect(mockedApiClient.dilemmas.getDilemmas).toHaveBeenCalledTimes(1);
  });

  test('fetchDilemmas should handle API errors', async () => {
    mockedApiClient.dilemmas.getDilemmas.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      await useDilemmaStore.getState().fetchDilemmas();
    });

    expect(useDilemmaStore.getState().isLoading).toBe(false);
    // When API fails, sample community posts are provided
    const dilemmas = useDilemmaStore.getState().allDilemmas;
    expect(dilemmas.length).toBeGreaterThan(0);
    expect(dilemmas[0].id).toContain('community-');
  });

  test('postDilemma should call the API and refresh dilemmas', async () => {
    const newDilemmaData = { content: 'New Post', category: 'General' };
    const userToken = 'test-token';

    mockedApiClient.dilemmas.postDilemma.mockResolvedValue(undefined as any);
    mockedApiClient.dilemmas.getDilemmas.mockResolvedValue([]);

    await act(async () => {
      await useDilemmaStore.getState().postDilemma(newDilemmaData as any, userToken);
    });

    expect(mockedApiClient.dilemmas.postDilemma).toHaveBeenCalledWith(newDilemmaData, userToken);
    expect(mockedApiClient.dilemmas.getDilemmas).toHaveBeenCalledTimes(1); // fetchDilemmas is called after posting
  });
  
   test('toggleSupport should optimistically update the state and call the API', async () => {
    const initialDilemma = { id: '1', content: 'Test', isSupported: false, supportCount: 0 };
    useDilemmaStore.setState({ allDilemmas: [initialDilemma] as any });

    const updatedDilemmaFromApi = { ...initialDilemma, isSupported: true, supportCount: 1 };
    mockedApiClient.dilemmas.toggleSupport.mockResolvedValue(updatedDilemmaFromApi as any);

    await act(async () => {
      await useDilemmaStore.getState().toggleSupport('1');
    });

    expect(mockedApiClient.dilemmas.toggleSupport).toHaveBeenCalledWith('1');
    // Check final state
    expect(useDilemmaStore.getState().allDilemmas[0].isSupported).toBe(true);
    expect(useDilemmaStore.getState().allDilemmas[0].supportCount).toBe(1);
  });
});
