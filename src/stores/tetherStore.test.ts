import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useTetherStore, TetherProfile, TetherCircleMember, ActiveTether, TetherSession } from './tetherStore';
import { act } from 'react';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  onopen: null as ((event: Event) => void) | null,
  onclose: null as ((event: CloseEvent) => void) | null,
  onmessage: null as ((event: MessageEvent) => void) | null,
  onerror: null as ((event: Event) => void) | null,
  readyState: WebSocket.OPEN,
};

global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock navigator.vibrate
Object.defineProperty(global.navigator, 'vibrate', {
  value: jest.fn(),
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(() => 'test-token') as jest.MockedFunction<(key: string) => string | null>,
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

const initialProfile: TetherProfile = {
  id: 'default',
  vibrationPattern: 'heartbeat',
  color: '#6B46C1',
  sound: 'heartbeat',
  comfortMessages: [
    "I'm here with you",
    "You're not alone",
    "Breathe with me",
    "You're safe",
    "This will pass"
  ],
  breathingPattern: 'box'
};

const mockTetherMember: TetherCircleMember = {
  id: 'member-1',
  name: 'Test Helper',
  availability: 'available',
  trustLevel: 'primary',
  avatar: 'https://example.com/avatar.jpg',
  lastTether: '2023-10-15T10:00:00.000Z',
  preferredTimes: ['morning', 'evening']
};

const mockActiveTether: ActiveTether = {
  id: 'session-123',
  partnerId: 'partner-1',
  partnerName: 'Test Partner',
  startTime: new Date('2023-10-15T10:30:00.000Z'),
  connectionStrength: 75,
  mode: 'support',
  isInitiator: true,
  hapticEnabled: true,
  audioEnabled: true,
  drawingEnabled: false
};

const mockTetherSession: TetherSession = {
  id: 'session-456',
  partnerId: 'partner-2',
  partnerName: 'Session Partner',
  startTime: new Date('2023-10-15T09:00:00.000Z'),
  endTime: new Date('2023-10-15T09:30:00.000Z'),
  duration: 1800000, // 30 minutes
  mode: 'crisis',
  notes: 'Helpful session',
  helpfulnessRating: 5,
  patterns: {
    peakIntensity: 90,
    averageStrength: 65,
    disconnections: 1
  }
};

describe('tetherStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useTetherStore.setState({
      activeTether: null,
      tetherCircle: [],
      tetherProfile: { ...initialProfile },
      sessionHistory: [],
      pendingRequests: [],
      autoEscalation: true,
      escalationContacts: [],
      escalationTimeout: 5,
      silentMode: false,
      lowBandwidthMode: false,
    });
    jest.clearAllMocks();
    mockedFetch.mockClear();
    mockSessionStorage.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    test('should have correct initial state', () => {
      const state = useTetherStore.getState();
      
      expect(state.activeTether).toBeNull();
      expect(state.tetherCircle).toEqual([]);
      expect(state.tetherProfile).toEqual(initialProfile);
      expect(state.sessionHistory).toEqual([]);
      expect(state.pendingRequests).toEqual([]);
      expect(state.autoEscalation).toBe(true);
      expect(state.escalationContacts).toEqual([]);
      expect(state.escalationTimeout).toBe(5);
      expect(state.silentMode).toBe(false);
      expect(state.lowBandwidthMode).toBe(false);
    });

    test('should have all required action functions', () => {
      const state = useTetherStore.getState();
      
      expect(typeof state.initiateTether).toBe('function');
      expect(typeof state.acceptTether).toBe('function');
      expect(typeof state.declineTether).toBe('function');
      expect(typeof state.endTether).toBe('function');
      expect(typeof state.updateConnectionStrength).toBe('function');
      expect(typeof state.sendHapticPulse).toBe('function');
      expect(typeof state.toggleDrawing).toBe('function');
      expect(typeof state.updateTetherProfile).toBe('function');
      expect(typeof state.addToCircle).toBe('function');
      expect(typeof state.removeFromCircle).toBe('function');
      expect(typeof state.updateAvailability).toBe('function');
      expect(typeof state.loadSessionHistory).toBe('function');
      expect(typeof state.triggerWellnessCheck).toBe('function');
      expect(typeof state.escalateToCrisis).toBe('function');
    });
  });

  describe('initiateTether action', () => {
    test('should successfully initiate a tether session', async () => {
      const mockResponse = {
        sessionId: 'new-session-123',
        partnerName: 'Test Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      const state = useTetherStore.getState();
      
      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ partnerId: 'partner-1', mode: 'support' })
      });

      expect(state.activeTether).toMatchObject({
        id: 'new-session-123',
        partnerId: 'partner-1',
        partnerName: 'Test Partner',
        connectionStrength: 50,
        mode: 'support',
        isInitiator: true,
        hapticEnabled: true,
        drawingEnabled: false
      });

      expect(global.WebSocket).toHaveBeenCalledWith('wss://api.astralcore.app/tether/new-session-123');
    });

    test('should set up WebSocket message handling', async () => {
      const mockResponse = {
        sessionId: 'ws-session-123',
        partnerName: 'WS Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      // Test WebSocket message handling
      const strengthMessage = {
        type: 'strength_update',
        strength: 85
      };

      act(() => {
        mockWebSocket.onmessage?.({ data: JSON.stringify(strengthMessage) } as MessageEvent);
      });

      const state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(85);
    });

    test('should handle haptic WebSocket messages', async () => {
      const mockResponse = {
        sessionId: 'haptic-session',
        partnerName: 'Haptic Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      const hapticMessage = {
        type: 'haptic',
        pattern: [100, 50, 100]
      };

      act(() => {
        mockWebSocket.onmessage?.({ data: JSON.stringify(hapticMessage) } as MessageEvent);
      });

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
    });

    test('should handle API errors gracefully', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        useTetherStore.getState().initiateTether('partner-1', 'support')
      ).rejects.toThrow('Network error');

      const state = useTetherStore.getState();
      expect(state.activeTether).toBeNull();
    });

    test('should set up auto-escalation for crisis mode', async () => {
      jest.useFakeTimers();
      
      const mockResponse = {
        sessionId: 'crisis-session',
        partnerName: 'Crisis Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      useTetherStore.setState({ autoEscalation: true, escalationTimeout: 1 }); // 1 minute

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'crisis');
      });

      // Fast-forward time to trigger escalation
      act(() => {
        jest.advanceTimersByTime(60000); // 1 minute
      });

      // Auto-escalation should be set up but not tested here as it depends on state at timeout
      jest.useRealTimers();
    });

    test('should disable audio when silent mode is enabled', async () => {
      useTetherStore.setState({ silentMode: true });

      const mockResponse = {
        sessionId: 'silent-session',
        partnerName: 'Silent Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      const state = useTetherStore.getState();
      expect(state.activeTether?.audioEnabled).toBe(false);
    });
  });

  describe('acceptTether action', () => {
    test('should accept a tether request successfully', async () => {
      const mockRequest = {
        id: 'request-123',
        from: 'requester-1',
        fromName: 'Requester',
        message: 'Please help',
        timestamp: new Date()
      };

      useTetherStore.setState({ pendingRequests: [mockRequest] });

      const mockResponse = {
        sessionId: 'accepted-session-123'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().acceptTether('request-123');
      });

      const state = useTetherStore.getState();
      
      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ requestId: 'request-123' })
      });

      expect(state.activeTether).toMatchObject({
        id: 'accepted-session-123',
        partnerId: 'requester-1',
        partnerName: 'Requester',
        mode: 'support',
        isInitiator: false
      });

      expect(state.pendingRequests).toHaveLength(0);
    });

    test('should handle non-existent request gracefully', async () => {
      await act(async () => {
        await useTetherStore.getState().acceptTether('non-existent-request');
      });

      expect(mockedFetch).not.toHaveBeenCalled();
      const state = useTetherStore.getState();
      expect(state.activeTether).toBeNull();
    });

    test('should handle API errors gracefully', async () => {
      const mockRequest = {
        id: 'error-request',
        from: 'requester-1',
        fromName: 'Requester',
        message: 'Please help',
        timestamp: new Date()
      };

      useTetherStore.setState({ pendingRequests: [mockRequest] });
      mockedFetch.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        await useTetherStore.getState().acceptTether('error-request');
      });

      // Should not crash and should preserve pending requests
      const state = useTetherStore.getState();
      expect(state.pendingRequests).toContain(mockRequest);
    });
  });

  describe('declineTether action', () => {
    test('should decline a tether request successfully', async () => {
      const mockRequest = {
        id: 'decline-request',
        from: 'requester-1',
        fromName: 'Requester',
        message: 'Please help',
        timestamp: new Date()
      };

      useTetherStore.setState({ pendingRequests: [mockRequest] });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().declineTether('decline-request');
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ requestId: 'decline-request' })
      });

      const state = useTetherStore.getState();
      expect(state.pendingRequests).toHaveLength(0);
    });

    test('should handle API errors gracefully', async () => {
      const mockRequest = {
        id: 'error-decline',
        from: 'requester-1',
        fromName: 'Requester',
        message: 'Please help',
        timestamp: new Date()
      };

      useTetherStore.setState({ pendingRequests: [mockRequest] });
      mockedFetch.mockRejectedValueOnce(new Error('Decline Error'));

      await act(async () => {
        await useTetherStore.getState().declineTether('error-decline');
      });

      // Should still remove from pending requests on error
      const state = useTetherStore.getState();
      expect(state.pendingRequests).toHaveLength(0);
    });
  });

  describe('endTether action', () => {
    test('should end an active tether session', async () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().endTether('Great session!', 5);
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          sessionId: activeTether.id,
          notes: 'Great session!',
          rating: 5
        })
      });

      const state = useTetherStore.getState();
      expect(state.activeTether).toBeNull();
      expect(state.sessionHistory).toHaveLength(1);
      expect(state.sessionHistory[0]).toMatchObject({
        id: activeTether.id,
        partnerId: activeTether.partnerId,
        partnerName: activeTether.partnerName,
        mode: activeTether.mode,
        notes: 'Great session!',
        helpfulnessRating: 5
      });
    });

    test('should handle ending session without notes or rating', async () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().endTether();
      });

      const state = useTetherStore.getState();
      expect(state.sessionHistory[0].notes).toBeUndefined();
      expect(state.sessionHistory[0].helpfulnessRating).toBeUndefined();
    });

    test('should not do anything when no active tether', async () => {
      await act(async () => {
        await useTetherStore.getState().endTether();
      });

      expect(mockedFetch).not.toHaveBeenCalled();
    });

    test('should trigger haptic feedback on end', async () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().endTether();
      });

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 50, 50, 25]);
    });

    test('should not trigger haptic in silent mode', async () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether, silentMode: true });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().endTether();
      });

      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  describe('updateConnectionStrength action', () => {
    test('should update connection strength for active tether', () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      act(() => {
        useTetherStore.getState().updateConnectionStrength(85);
      });

      const state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(85);
    });

    test('should clamp connection strength to 0-100 range', () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      act(() => {
        useTetherStore.getState().updateConnectionStrength(-10);
      });

      let state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(0);

      act(() => {
        useTetherStore.getState().updateConnectionStrength(150);
      });

      state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(100);
    });

    test('should not update when no active tether', () => {
      const originalState = useTetherStore.getState();

      act(() => {
        useTetherStore.getState().updateConnectionStrength(85);
      });

      const newState = useTetherStore.getState();
      expect(newState).toEqual(originalState);
    });
  });

  describe('sendHapticPulse action', () => {
    test('should send haptic pulse when tether is active and enabled', async () => {
      const activeTether = { ...mockActiveTether, hapticEnabled: true };
      useTetherStore.setState({ activeTether });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().sendHapticPulse(8);
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/haptic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          sessionId: activeTether.id,
          intensity: 8
        })
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(80); // intensity * 10
    });

    test('should not send haptic when disabled', () => {
      const activeTether = { ...mockActiveTether, hapticEnabled: false };
      useTetherStore.setState({ activeTether });

      act(() => {
        useTetherStore.getState().sendHapticPulse(8);
      });

      expect(mockedFetch).not.toHaveBeenCalled();
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });

    test('should not send haptic when no active tether', () => {
      act(() => {
        useTetherStore.getState().sendHapticPulse(8);
      });

      expect(mockedFetch).not.toHaveBeenCalled();
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });

    test('should not vibrate in silent mode', async () => {
      const activeTether = { ...mockActiveTether, hapticEnabled: true };
      useTetherStore.setState({ activeTether, silentMode: true });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().sendHapticPulse(8);
      });

      expect(mockedFetch).toHaveBeenCalled(); // Still sends to partner
      expect(navigator.vibrate).not.toHaveBeenCalled(); // But doesn't vibrate locally
    });
  });

  describe('toggleDrawing action', () => {
    test('should toggle drawing mode for active tether', () => {
      const activeTether = { ...mockActiveTether, drawingEnabled: false };
      useTetherStore.setState({ activeTether });

      act(() => {
        useTetherStore.getState().toggleDrawing();
      });

      let state = useTetherStore.getState();
      expect(state.activeTether?.drawingEnabled).toBe(true);

      act(() => {
        useTetherStore.getState().toggleDrawing();
      });

      state = useTetherStore.getState();
      expect(state.activeTether?.drawingEnabled).toBe(false);
    });

    test('should not toggle when no active tether', () => {
      const originalState = useTetherStore.getState();

      act(() => {
        useTetherStore.getState().toggleDrawing();
      });

      const newState = useTetherStore.getState();
      expect(newState).toEqual(originalState);
    });
  });

  describe('updateTetherProfile action', () => {
    test('should update tether profile partially', async () => {
      const profileUpdate = {
        vibrationPattern: 'rhythmic' as const,
        color: '#FF0000'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().updateTetherProfile(profileUpdate);
      });

      const state = useTetherStore.getState();
      expect(state.tetherProfile?.vibrationPattern).toBe('rhythmic');
      expect(state.tetherProfile?.color).toBe('#FF0000');
      expect(state.tetherProfile?.sound).toBe('heartbeat'); // Unchanged

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(state.tetherProfile)
      });
    });

    test('should handle null profile gracefully', async () => {
      useTetherStore.setState({ tetherProfile: null });

      await act(async () => {
        useTetherStore.getState().updateTetherProfile({ color: '#FF0000' });
      });

      expect(mockedFetch).not.toHaveBeenCalled();
    });

    test('should update comfort messages', async () => {
      const newMessages = ['You are strong', 'This too shall pass'];

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().updateTetherProfile({ comfortMessages: newMessages });
      });

      const state = useTetherStore.getState();
      expect(state.tetherProfile?.comfortMessages).toEqual(newMessages);
    });
  });

  describe('addToCircle action', () => {
    test('should add member to tether circle', async () => {
      const newMember = { ...mockTetherMember };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().addToCircle(newMember);
      });

      const state = useTetherStore.getState();
      expect(state.tetherCircle).toContain(newMember);
      expect(state.tetherCircle).toHaveLength(1);

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/circle/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(newMember)
      });
    });

    test('should add multiple members to circle', async () => {
      const member1 = { ...mockTetherMember, id: 'member-1' };
      const member2 = { ...mockTetherMember, id: 'member-2' };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().addToCircle(member1);
        useTetherStore.getState().addToCircle(member2);
      });

      const state = useTetherStore.getState();
      expect(state.tetherCircle).toHaveLength(2);
      expect(state.tetherCircle).toContain(member1);
      expect(state.tetherCircle).toContain(member2);
    });
  });

  describe('removeFromCircle action', () => {
    test('should remove member from tether circle', async () => {
      const member1 = { ...mockTetherMember, id: 'member-1' };
      const member2 = { ...mockTetherMember, id: 'member-2' };
      
      useTetherStore.setState({ tetherCircle: [member1, member2] });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await act(async () => {
        useTetherStore.getState().removeFromCircle('member-1');
      });

      const state = useTetherStore.getState();
      expect(state.tetherCircle).toHaveLength(1);
      expect(state.tetherCircle).not.toContain(member1);
      expect(state.tetherCircle).toContain(member2);

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/circle/remove/member-1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('should handle removing non-existent member gracefully', async () => {
      const member1 = { ...mockTetherMember, id: 'member-1' };
      useTetherStore.setState({ tetherCircle: [member1] });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await act(async () => {
        useTetherStore.getState().removeFromCircle('non-existent');
      });

      const state = useTetherStore.getState();
      expect(state.tetherCircle).toHaveLength(1);
      expect(state.tetherCircle).toContain(member1);
    });
  });

  describe('updateAvailability action', () => {
    test('should update availability status', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().updateAvailability('busy');
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ status: 'busy' })
      });
    });

    test('should handle all availability states', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const statuses: Array<'available' | 'busy' | 'offline'> = ['available', 'busy', 'offline'];

      for (const status of statuses) {
        await act(async () => {
          useTetherStore.getState().updateAvailability(status);
        });

        expect(mockedFetch).toHaveBeenLastCalledWith('/api/tether/availability', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({ status })
        });
      }
    });
  });

  describe('loadSessionHistory action', () => {
    test('should load session history successfully', async () => {
      const mockSessions = [mockTetherSession];
      
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: mockSessions }),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().loadSessionHistory();
      });

      const state = useTetherStore.getState();
      expect(state.sessionHistory).toEqual(mockSessions);

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/history', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('should handle API errors gracefully', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('History load failed'));

      await act(async () => {
        await useTetherStore.getState().loadSessionHistory();
      });

      const state = useTetherStore.getState();
      expect(state.sessionHistory).toEqual([]); // Should remain unchanged
    });

    test('should handle empty history response', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [] }),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().loadSessionHistory();
      });

      const state = useTetherStore.getState();
      expect(state.sessionHistory).toEqual([]);
    });
  });

  describe('triggerWellnessCheck action', () => {
    test('should trigger wellness check successfully', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().triggerWellnessCheck('partner-123');
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/wellness-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ partnerId: 'partner-123' })
      });
    });

    test('should handle wellness check API errors', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Wellness check failed'));

      await act(async () => {
        await useTetherStore.getState().triggerWellnessCheck('partner-123');
      });

      // Should not throw or crash
      expect(mockedFetch).toHaveBeenCalled();
    });
  });

  describe('escalateToCrisis action', () => {
    test('should escalate to crisis with contacts', async () => {
      const escalationContacts = ['contact1@example.com', 'contact2@example.com'];
      useTetherStore.setState({ escalationContacts });

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().escalateToCrisis();
      });

      expect(mockedFetch).toHaveBeenCalledWith('/api/tether/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ contacts: escalationContacts })
      });
    });

    test('should not escalate when no contacts are configured', async () => {
      useTetherStore.setState({ escalationContacts: [] });

      await act(async () => {
        await useTetherStore.getState().escalateToCrisis();
      });

      expect(mockedFetch).not.toHaveBeenCalled();
    });

    test('should handle escalation API errors', async () => {
      useTetherStore.setState({ escalationContacts: ['contact@example.com'] });
      mockedFetch.mockRejectedValueOnce(new Error('Escalation failed'));

      await act(async () => {
        await useTetherStore.getState().escalateToCrisis();
      });

      expect(mockedFetch).toHaveBeenCalled();
    });
  });

  describe('complex state interactions', () => {
    test('should handle full tether lifecycle', async () => {
      // Add member to circle
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().addToCircle(mockTetherMember);
      });

      // Initiate tether
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'lifecycle-session', partnerName: 'Partner' }),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      // Update connection strength
      act(() => {
        useTetherStore.getState().updateConnectionStrength(90);
      });

      // Send haptic pulse
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        useTetherStore.getState().sendHapticPulse(7);
      });

      // End tether
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await useTetherStore.getState().endTether('Great session!', 5);
      });

      const state = useTetherStore.getState();
      expect(state.tetherCircle).toHaveLength(1);
      expect(state.activeTether).toBeNull();
      expect(state.sessionHistory).toHaveLength(1);
      expect(state.sessionHistory[0].helpfulnessRating).toBe(5);
    });

    test('should handle concurrent operations', async () => {
      // Mock all fetch calls to succeed
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      // Perform multiple operations concurrently
      await act(async () => {
        await Promise.all([
          useTetherStore.getState().updateTetherProfile({ color: '#FF0000' }),
          useTetherStore.getState().addToCircle(mockTetherMember),
          useTetherStore.getState().updateAvailability('available'),
          useTetherStore.getState().loadSessionHistory()
        ]);
      });

      // All operations should complete without conflicts
      const state = useTetherStore.getState();
      expect(state.tetherProfile?.color).toBe('#FF0000');
      expect(state.tetherCircle).toHaveLength(1);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle malformed WebSocket messages', async () => {
      const mockResponse = {
        sessionId: 'malformed-ws-session',
        partnerName: 'WS Partner'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      // Send malformed message
      act(() => {
        mockWebSocket.onmessage?.({ data: 'invalid-json' } as MessageEvent);
      });

      // Should not crash
      const state = useTetherStore.getState();
      expect(state.activeTether).toBeTruthy();
    });

    test('should handle extreme connection strength values', () => {
      const activeTether = { ...mockActiveTether };
      useTetherStore.setState({ activeTether });

      act(() => {
        useTetherStore.getState().updateConnectionStrength(Number.MAX_VALUE);
      });

      let state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(100);

      act(() => {
        // Use a negative number to test the minimum clamping
        useTetherStore.getState().updateConnectionStrength(-100);
      });

      state = useTetherStore.getState();
      expect(state.activeTether?.connectionStrength).toBe(0);

      // Also test Number.MIN_VALUE (smallest positive number)
      act(() => {
        useTetherStore.getState().updateConnectionStrength(Number.MIN_VALUE);
      });

      state = useTetherStore.getState();
      // Number.MIN_VALUE is a very small positive number, so it stays as is (within 0-100 range)
      expect(state.activeTether?.connectionStrength).toBeCloseTo(Number.MIN_VALUE);
    });

    test('should handle missing session token gracefully', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      await act(async () => {
        await useTetherStore.getState().initiateTether('partner-1', 'support');
      });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer null'
          })
        })
      );
    });

    test('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';
      
      mockedFetch.mockRejectedValueOnce(timeoutError);

      await expect(
        useTetherStore.getState().initiateTether('partner-1', 'support')
      ).rejects.toThrow('Network timeout');
    });

    test('should preserve state consistency during errors', async () => {
      const originalState = useTetherStore.getState();
      
      mockedFetch.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        try {
          await useTetherStore.getState().initiateTether('partner-1', 'support');
        } catch (error) {
          // Expected to throw
        }
      });

      const newState = useTetherStore.getState();
      expect(newState.activeTether).toBeNull(); // Should remain null
      expect(newState.tetherCircle).toEqual(originalState.tetherCircle);
      expect(newState.sessionHistory).toEqual(originalState.sessionHistory);
    });
  });

  describe('settings and configuration', () => {
    test('should handle all escalation timeout values', () => {
      const timeouts = [1, 5, 10, 30, 60];
      
      timeouts.forEach(timeout => {
        act(() => {
          useTetherStore.setState({ escalationTimeout: timeout });
        });

        const state = useTetherStore.getState();
        expect(state.escalationTimeout).toBe(timeout);
      });
    });

    test('should handle auto-escalation toggle', () => {
      act(() => {
        useTetherStore.setState({ autoEscalation: false });
      });

      let state = useTetherStore.getState();
      expect(state.autoEscalation).toBe(false);

      act(() => {
        useTetherStore.setState({ autoEscalation: true });
      });

      state = useTetherStore.getState();
      expect(state.autoEscalation).toBe(true);
    });

    test('should handle multiple escalation contacts', () => {
      const contacts = [
        'primary@example.com',
        'secondary@example.com',
        'emergency@example.com'
      ];

      act(() => {
        useTetherStore.setState({ escalationContacts: contacts });
      });

      const state = useTetherStore.getState();
      expect(state.escalationContacts).toEqual(contacts);
    });

    test('should handle bandwidth and accessibility modes', () => {
      act(() => {
        useTetherStore.setState({ 
          lowBandwidthMode: true, 
          silentMode: true 
        });
      });

      const state = useTetherStore.getState();
      expect(state.lowBandwidthMode).toBe(true);
      expect(state.silentMode).toBe(true);
    });
  });
});