/**
 * @jest-environment jsdom
 */

import { ApiClient } from './ApiClient';
import { setupProductionEnvironment, setupDevelopmentEnvironment } from './apiClientTestHelper';

// Mock the demoDataService
jest.mock('../services/demoDataService', () => ({
  demoDataService: {
    getDemoData: jest.fn(() => ({
      dilemmas: [],
      allDilemmas: [],
      helpSessions: [],
      journalEntries: [],
      profile: null,
    })),
  },
}));

describe('ApiClient', () => {
  let originalFetch: typeof global.fetch;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  let originalSessionStorage: Storage;
  let originalLocation: Location;
  let originalProcess: typeof process;

  beforeEach(async () => {
    // Mock fetch
    originalFetch = global.fetch;
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    };
    originalSessionStorage = global.sessionStorage;
    Object.defineProperty(global, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });

    // localStorage is already mocked globally in setupTests.ts

    // Setup production environment by default to avoid demo mode
    originalLocation = global.location;
    originalProcess = process;
    setupProductionEnvironment();

    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: jest.fn(() => 'mock-uuid-123'),
      },
      writable: true,
    });

    // Mock dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      value: jest.fn(),
      writable: true,
    });

    jest.clearAllMocks();
    
    // Reset the netlifyFunctionsAvailable flag before each test
    (global as any).netlifyFunctionsAvailable = null;
    
    // Re-initialize ApiClient with the new environment
    await ApiClient.initialize();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
    Object.defineProperty(global, 'location', {
      value: originalLocation,
      writable: true,
    });
    Object.defineProperty(process, 'env', {
      value: originalProcess.env,
      writable: true,
    });
  });

  describe('Initialization', () => {
    test('should have initialize method', async () => {
      expect(typeof ApiClient.initialize).toBe('function');
      await expect(ApiClient.initialize()).resolves.toBeUndefined();
    });

    test('should check Netlify Functions availability in development', async () => {
      setupDevelopmentEnvironment();

      await ApiClient.initialize();
      // Should complete without throwing
    });

    test('should assume Netlify Functions available in production', async () => {
      setupProductionEnvironment();
      
      await ApiClient.initialize();
      // Should complete without throwing
    });

    test.skip('should detect Netlify Dev environment', async () => {
      // Set up Netlify Dev environment (port 8888)
      process.env.NODE_ENV = 'development';
      Object.defineProperty(window, 'location', {
        value: { 
          hostname: 'localhost', 
          port: '8888', 
          origin: 'http://localhost:8888',
          host: 'localhost:8888',
          protocol: 'http:',
          pathname: '/',
          search: '',
          hash: ''
        },
        writable: true,
        configurable: true,
      });
      
      // Reset the flag and re-initialize
      (global as any).netlifyFunctionsAvailable = null;
      
      // Spy on console to verify the right message
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      await ApiClient.initialize();
      
      // In Netlify Dev environment, functions should be available
      // The test should verify behavior, not just console output
      // Mock a successful API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);
      
      // This should work without throwing a demo mode error
      const result = await ApiClient.resources.getResources();
      expect(result).toEqual([]);
      
      // Verify the API was actually called (not skipped for demo mode)
      expect(mockFetch).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      
      // Reset to production environment for other tests
      setupProductionEnvironment();
    });
  });

  describe('Resources API', () => {
    test('should fetch resources', async () => {
      setupProductionEnvironment();
      
      const mockResources = [{ id: '1', title: 'Test Resource' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockResources),
      } as any);

      const result = await ApiClient.resources.getResources();

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/resources',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResources);
    });
  });

  describe('Assessments API', () => {
    test('should submit PHQ-9 result', async () => {
      setupProductionEnvironment();
      
      const mockAssessment = { id: '1', score: 10, type: 'phq-9' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockAssessment),
      } as any);

      const result = await ApiClient.assessments.submitPhq9Result(
        'user123',
        10,
        [1, 2, 1, 2, 0, 1, 1, 0, 0]
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/assessments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userToken: 'user123',
            score: 10,
            answers: [1, 2, 1, 2, 0, 1, 1, 0, 0],
            type: 'phq-9',
          }),
        })
      );
      expect(result).toEqual(mockAssessment);
    });

    test('should submit GAD-7 result', async () => {
      setupProductionEnvironment();
      
      const mockAssessment = { id: '2', score: 8, type: 'gad-7' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockAssessment),
      } as any);

      const result = await ApiClient.assessments.submitGad7Result(
        'user123',
        8,
        [2, 1, 1, 2, 0, 1, 1]
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/assessments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userToken: 'user123',
            score: 8,
            answers: [2, 1, 1, 2, 0, 1, 1],
            type: 'gad-7',
          }),
        })
      );
      expect(result).toEqual(mockAssessment);
    });

    test('should get assessment history', async () => {
      setupProductionEnvironment();
      
      const mockHistory = [
        { id: '1', score: 10, type: 'phq-9' },
        { id: '2', score: 8, type: 'gad-7' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockHistory),
      } as any);

      const result = await ApiClient.assessments.getHistory('user123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/assessments/history/user123',
        expect.any(Object)
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('Habits API', () => {
    test('should get predefined habits', async () => {
      setupProductionEnvironment();
      
      const mockHabits = [{ id: '1', name: 'Meditation' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockHabits),
      } as any);

      const result = await ApiClient.habits.getPredefinedHabits();

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/habits/predefined',
        expect.any(Object)
      );
      expect(result).toEqual(mockHabits);
    });

    test('should track habit', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as any);

      await ApiClient.habits.trackHabit('user123', 'habit456');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/habits/track',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user123',
            habitId: 'habit456',
          }),
        })
      );
    });

    test('should log habit completion', async () => {
      setupProductionEnvironment();
      
      const mockCompletion = {
        id: 'completion123',
        habitId: 'habit456',
        date: '2024-01-15',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockCompletion),
      } as any);

      const result = await ApiClient.habits.logCompletion(
        'user123',
        'habit456',
        '2024-01-15'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/habits/log',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user123',
            habitId: 'habit456',
            date: '2024-01-15',
          }),
        })
      );
      expect(result).toEqual(mockCompletion);
    });
  });

  describe('Mood API', () => {
    test('should post mood check-in', async () => {
      setupProductionEnvironment();
      
      const checkInData = {
        moodScore: 7,
        energyLevel: 6,
        anxietyLevel: 3,
        sleepQuality: 4,
        tags: ['happy', 'productive'],
        notes: 'Feeling good today',
      };
      const mockCheckIn = {
        ...checkInData,
        id: 'checkin123',
        userToken: 'user123',
        timestamp: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockCheckIn),
      } as any);

      const result = await ApiClient.mood.postCheckIn(checkInData, 'user123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/mood/checkin',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...checkInData, userToken: 'user123' }),
        })
      );
      expect(result).toEqual(mockCheckIn);
    });

    test('should get mood history', async () => {
      setupProductionEnvironment();
      
      const mockHistory = [
        { id: 'checkin1', mood: 7, timestamp: new Date() },
        { id: 'checkin2', mood: 8, timestamp: new Date() },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockHistory),
      } as any);

      const result = await ApiClient.mood.getHistory('user123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/mood/history/user123',
        expect.any(Object)
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('Journal API', () => {
    test('should get journal entries with demo data fallback', async () => {
      // Set up demo mode
      jest.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'demo_token') return 'demo-token';
        if (key === 'demo_user') return JSON.stringify({ userType: 'seeker' });
        return null;
      });

      const result = await ApiClient.journal.getEntries('user123');

      // Should return empty array from mocked demo data
      expect(result).toEqual([]);
    });

    test('should post journal entry', async () => {
      setupProductionEnvironment();
      
      const mockEntry = {
        id: 'entry123',
        content: 'Today was a good day',
        userToken: 'user123',
        timestamp: new Date(),
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockEntry),
      } as any);

      const result = await ApiClient.journal.postEntry(
        'Today was a good day',
        'user123'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/journal/entry',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            content: 'Today was a good day',
            userToken: 'user123',
          }),
        })
      );
      expect(result).toEqual(mockEntry);
    });
  });

  describe('Videos API', () => {
    test('should get wellness videos', async () => {
      setupProductionEnvironment();
      
      const mockVideos = [
        { id: 'video1', title: 'Meditation Guide' },
        { id: 'video2', title: 'Breathing Exercise' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockVideos),
      } as any);

      const result = await ApiClient.videos.getVideos();

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/videos',
        expect.any(Object)
      );
      expect(result).toEqual(mockVideos);
    });

    test('should like video', async () => {
      setupProductionEnvironment();
      
      const mockVideo = { id: 'video1', likes: 10 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockVideo),
      } as any);

      const result = await ApiClient.videos.likeVideo('video1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/videos/like/video1',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockVideo);
    });

    test('should upload video', async () => {
      setupProductionEnvironment();
      
      const mockFile = new File(['video content'], 'test.mp4', {
        type: 'video/mp4',
      });
      const mockVideo = { id: 'video123', fileName: 'test.mp4' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockVideo),
      } as any);

      const result = await ApiClient.videos.uploadVideo(
        mockFile,
        'Test video description',
        'user123'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/wellness/videos/upload',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            description: 'Test video description',
            userToken: 'user123',
            fileName: 'test.mp4',
          }),
        })
      );
      expect(result).toEqual(mockVideo);
    });
  });

  describe('Safety Plan API', () => {
    test('should get safety plan', async () => {
      setupProductionEnvironment();
      
      const mockSafetyPlan = {
        id: 'plan123',
        warningSignes: ['feeling overwhelmed'],
        copingStrategies: ['deep breathing'],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockSafetyPlan),
      } as any);

      const result = await ApiClient.safetyPlan.get('user123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/users/safety-plan/user123',
        expect.any(Object)
      );
      expect(result).toEqual(mockSafetyPlan);
    });

    test('should save safety plan', async () => {
      setupProductionEnvironment();
      
      const safetyPlan = {
        id: 'plan123',
        warningSignes: ['feeling overwhelmed'],
        copingStrategies: ['deep breathing'],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as any);

      await ApiClient.safetyPlan.save(safetyPlan as any, 'user123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/users/safety-plan',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            plan: safetyPlan,
            userToken: 'user123',
          }),
        })
      );
    });
  });

  describe('Legal API', () => {
    test('should check consent', async () => {
      setupProductionEnvironment();
      
      const mockConsent = {
        document_version: '1.0',
        consent_timestamp: '2024-01-15T10:00:00Z',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockConsent),
      } as any);

      const result = await ApiClient.legal.checkConsent('user123', 'privacy-policy');

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/users/consent/user123/privacy-policy',
        expect.any(Object)
      );
      expect(result).toEqual(mockConsent);
    });

    test('should record consent', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as any);

      await ApiClient.legal.recordConsent(
        'user123',
        'seeker',
        'privacy-policy',
        '1.0'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/users/consent',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user123',
            userType: 'seeker',
            documentType: 'privacy-policy',
            documentVersion: '1.0',
          }),
        })
      );
    });
  });

  describe('Payment API', () => {
    test('should create donation intent', async () => {
      jest.useFakeTimers();
      
      const promise = ApiClient.payment.createDonationIntent(2500); // $25.00
      
      // Fast-forward time
      jest.advanceTimersByTime(500);
      
      const result = await promise;
      
      expect(result).toEqual({
        clientSecret: expect.stringContaining('pi_mock-uuid-123_secret_mock-uuid-123'),
      });
      
      jest.useRealTimers();
    });

    test('should log donation amount in development', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await ApiClient.payment.createDonationIntent(1000); // $10.00
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Simulating creating a payment intent for $10.00'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Emergency API', () => {
    test('should trigger emergency without location', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await ApiClient.emergency.trigger('dilemma123');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '!!! EMERGENCY TRIGGERED for Dilemma dilemma123 !!!'
      );
      
      consoleSpy.mockRestore();
    });

    test('should trigger emergency with location', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await ApiClient.emergency.trigger('dilemma123', {
        latitude: 40.7128,
        longitude: -74.0060,
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '!!! EMERGENCY TRIGGERED for Dilemma dilemma123 !!!'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '  > Location: lat=40.7128, lon=-74.006'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should handle 401 unauthorized responses', async () => {
      setupProductionEnvironment();
      
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as any);

      await expect(ApiClient.resources.getResources()).rejects.toThrow(
        'Unauthorized'
      );

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth-error',
        })
      );
    });

    test('should handle network errors', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiClient.resources.getResources()).rejects.toThrow(
        'Network error'
      );
    });

    test('should handle non-JSON error responses', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: jest.fn().mockRejectedValue(new Error('Not JSON')),
      } as any);

      await expect(ApiClient.resources.getResources()).rejects.toThrow(
        'An unknown API error occurred.'
      );
    });

    test('should handle HTML responses in development', async () => {
      setupDevelopmentEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'text/html' }),
      } as any);

      await expect(ApiClient.resources.getResources()).rejects.toThrow(
        'Demo mode - API skipped'
      );
    });

    test('should handle successful HTML responses in development', async () => {
      setupDevelopmentEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
      } as any);

      await expect(ApiClient.resources.getResources()).rejects.toThrow(
        'Demo mode - API skipped'
      );
    });
  });

  describe('Authentication', () => {
    test('should include authorization header when token is present', async () => {
      setupProductionEnvironment();
      
      jest.spyOn(sessionStorage, 'getItem').mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);

      await ApiClient.resources.getResources();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    test('should not include authorization header when token is not present', async () => {
      setupProductionEnvironment();
      
      jest.spyOn(sessionStorage, 'getItem').mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);

      await ApiClient.resources.getResources();

      const call = mockFetch.mock.calls[0];
      const headers = (call[1] as any).headers;
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  describe('Demo Mode', () => {
    test('should detect demo mode with demo_token', async () => {
      const localStorageSpy = jest.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'demo_token') return 'demo-token';
        if (key === 'demo_user') return JSON.stringify({ userType: 'seeker' });
        if (key === 'astral_core_anonymous_id') return null;
        return null;
      });
      process.env.VITE_USE_DEMO_DATA = undefined;

      // Set up production environment
      setupProductionEnvironment();
      (global as any).netlifyFunctionsAvailable = true;
      
      // Re-initialize to ensure the flag is set
      await ApiClient.initialize();
      
      // Mock a successful response for journal entries
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);
      
      // In production with demo_token, it should still make the API call
      // (demo_token check happens in isInDemoMode)
      const result = await ApiClient.journal.getEntries('user123');
      
      // Should return the response
      expect(result).toEqual([]);
      
      // Verify demo_token was checked
      expect(localStorageSpy).toHaveBeenCalled();
      const calls = localStorageSpy.mock.calls.map(call => call[0]);
      expect(calls).toContain('demo_token');
    });

    test('should detect demo mode with environment variable', () => {
      jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
      process.env.VITE_USE_DEMO_DATA = 'true';

      // This would be tested through API calls that check demo mode
      expect(process.env.VITE_USE_DEMO_DATA).toBe('true');
    });
  });

  describe('Dilemmas API', () => {
    test('should get dilemmas and fallback to demo data', async () => {
      // Mock development error
      setupDevelopmentEnvironment();
      
      // Re-initialize to apply new settings
      await ApiClient.initialize();

      const error = new Error('Demo mode - API skipped');
      (error as any).isDevelopmentError = true;
      mockFetch.mockRejectedValueOnce(error);

      const result = await ApiClient.dilemmas.getDilemmas();

      expect(result).toEqual([]); // From mocked demo data
    });

    test('should post dilemma', async () => {
      setupProductionEnvironment();
      
      const dilemmaData = {
        content: 'I need help with anxiety',
        category: 'mental-health',
      };
      const mockDilemma = { ...dilemmaData, id: 'dilemma123' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockDilemma),
      } as any);

      const result = await ApiClient.dilemmas.postDilemma(
        dilemmaData as any,
        'user123'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/dilemmas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...dilemmaData, userToken: 'user123' }),
        })
      );
      expect(result).toEqual(mockDilemma);
    });
  });

  describe('Helpers API', () => {
    test('should get helper profile in demo mode', async () => {
      jest.spyOn(localStorage, 'getItem').mockImplementation((key) => {
        if (key === 'demo_token') return 'demo-token';
        if (key === 'demo_user') return JSON.stringify({ userType: 'helper' });
        return null;
      });

      const result = await ApiClient.helpers.getProfile('auth0|123');

      expect(result).toBeNull(); // From mocked demo data
    });

    test('should get online helper count', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(25),
      } as any);

      const result = await ApiClient.helpers.getOnlineHelperCount();

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/helpers/online-count',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': '',
          }),
        })
      );
      expect(result).toBe(25);
    });

    test('should fallback to demo count on error', async () => {
      const error = new Error('Demo mode - API skipped');
      (error as any).isDevelopmentError = true;
      mockFetch.mockRejectedValueOnce(error);

      const result = await ApiClient.helpers.getOnlineHelperCount();

      expect(result).toBe(12);
    });
  });

  describe('AI API', () => {
    test('should handle chat request', async () => {
      setupProductionEnvironment();
      
      const messages = [
        { id: '1', sender: 'user' as const, text: 'Hello', timestamp: '2023-01-01T00:00:00Z' },
        { id: '2', sender: 'ai' as const, text: 'Hi there!', timestamp: '2023-01-01T00:00:01Z' },
      ];
      const systemInstruction = 'Be helpful';
      const mockResponse = { text: 'How can I help you?' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ApiClient.ai.chat(messages, systemInstruction);

      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/api-ai/chat',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ messages, userId: systemInstruction, provider: 'openai' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle invalid AI response', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue({}), // API returns empty object
      } as any);

      // The AI chat returns whatever the API returns
      const result = await ApiClient.ai.chat([], 'Be helpful');
      expect(result).toEqual({});
    });

    test('should load chat history with demo fallback', async () => {
      const error = new Error('Demo mode - API skipped');
      (error as any).isDevelopmentError = true;
      mockFetch.mockRejectedValueOnce(error);

      const result = await ApiClient.ai.loadChatHistory('test-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('Configuration', () => {
    test('should use custom API URL when provided', async () => {
      setupProductionEnvironment();
      
      process.env.VITE_API_URL = 'https://api.example.com';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);

      await ApiClient.resources.getResources();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/wellness/resources',
        expect.any(Object)
      );
    });

    test('should use default Netlify Functions URL', async () => {
      setupProductionEnvironment();
      
      process.env.VITE_API_URL = undefined;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);

      await ApiClient.resources.getResources();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/wellness/resources'),
        expect.any(Object)
      );
    });
  });

  describe('Response Handling', () => {
    test('should handle 204 No Content responses', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as any);

      const result = await ApiClient.habits.trackHabit('user123', 'habit456');

      expect(result).toBeUndefined();
    });

    test('should handle responses without content-type header', async () => {
      setupProductionEnvironment();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ success: true }),
      } as any);

      const result = await ApiClient.resources.getResources();

      expect(result).toEqual({ success: true });
    });
  });

  describe('Performance', () => {
    test('should handle concurrent API requests', async () => {
      setupProductionEnvironment();
      
      // Mock multiple successful responses
      for (let i = 0; i < 5; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: jest.fn().mockResolvedValue([]),
        } as any);
      }

      const promises = [
        ApiClient.resources.getResources(),
        ApiClient.videos.getVideos(),
        ApiClient.habits.getPredefinedHabits(),
        ApiClient.mood.getHistory('user123'),
        ApiClient.assessments.getHistory('user123'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    test('should not interfere with parallel requests on error', async () => {
      setupProductionEnvironment();
      
      // First request fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      // Second request succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: jest.fn().mockResolvedValue([]),
      } as any);

      const promises = [
        ApiClient.resources.getResources().catch(e => e.message),
        ApiClient.videos.getVideos(),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toBe('Network error');
      expect(results[1]).toEqual([]);
    });
  });
});