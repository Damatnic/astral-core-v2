import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useAssessmentStore } from './assessmentStore';
import { act } from 'react';
import { authState } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const initialState = useAssessmentStore.getState();

describe('assessmentStore', () => {
  beforeEach(() => {
    useAssessmentStore.setState(initialState);
    jest.clearAllMocks();
    authState.userToken = 'user123';
    mockedFetch.mockClear();
  });

  afterEach(() => {
    authState.userToken = null;
    jest.restoreAllMocks();
  });

  test('fetchHistory should update state on successful API call', async () => {
    const mockHistory = [{ id: 'a1', type: 'phq-9', score: 10 }];
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assessments: mockHistory }),
    } as Response);

    await act(async () => {
      await useAssessmentStore.getState().fetchHistory();
    });

    const state = useAssessmentStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.history).toEqual(mockHistory);
    expect(mockedFetch).toHaveBeenCalledWith('/api/assessments/history', {
      headers: {
        'Authorization': 'Bearer user123',
        'Content-Type': 'application/json'
      }
    });
  });
  
  test('submitPhq9Result should call the API and then refresh history', async () => {
    const score = 15;
    const answers = [1,2,3,1,2,3,1,2,0];
    
    // Mock submit response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);
    
    // Mock refresh history response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assessments: [] }),
    } as Response);

    await act(async () => {
      await useAssessmentStore.getState().submitPhq9Result(score, answers);
    });

    expect(mockedFetch).toHaveBeenCalledWith('/api/assessments/submit', 
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer user123',
          'Content-Type': 'application/json'
        },
        body: expect.stringMatching(/"type":"phq-9"/)
      })
    );
    
    // Verify the body contains the expected data
    const callArgs = mockedFetch.mock.calls[0];
    const bodyData = JSON.parse(callArgs[1].body);
    expect(bodyData).toEqual({
      type: 'phq-9',
      score,
      answers,
      timestamp: expect.any(String)
    });
    expect(mockedFetch).toHaveBeenCalledTimes(2); // Submit + refresh
  });
  
  test('submitGad7Result should call the API and then refresh history', async () => {
    const score = 12;
    const answers = [1,2,3,1,2,3,0];
    
    // Mock submit response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);
    
    // Mock refresh history response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assessments: [] }),
    } as Response);

    await act(async () => {
      await useAssessmentStore.getState().submitGad7Result(score, answers);
    });

    expect(mockedFetch).toHaveBeenCalledWith('/api/assessments/submit', 
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer user123',
          'Content-Type': 'application/json'
        },
        body: expect.stringMatching(/"type":"gad-7"/)
      })
    );
    
    // Verify the body contains the expected data
    const callArgs = mockedFetch.mock.calls[0];
    const bodyData = JSON.parse(callArgs[1].body);
    expect(bodyData).toEqual({
      type: 'gad-7',
      score,
      answers,
      timestamp: expect.any(String)
    });
    expect(mockedFetch).toHaveBeenCalledTimes(2); // Submit + refresh
  });
});
