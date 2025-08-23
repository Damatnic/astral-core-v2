import { create } from 'zustand';

export interface TetherProfile {
  id: string;
  vibrationPattern: 'gentle' | 'rhythmic' | 'heartbeat' | 'custom';
  color: string;
  sound: 'heartbeat' | 'ocean' | 'rain' | 'silence' | 'custom';
  comfortMessages: string[];
  breathingPattern: 'box' | '478' | 'coherent' | 'custom';
}

export interface TetherCircleMember {
  id: string;
  name: string;
  avatar?: string;
  availability: 'available' | 'busy' | 'offline';
  lastTether?: string;
  trustLevel: 'primary' | 'secondary' | 'tertiary';
  preferredTimes?: string[];
}

export interface ActiveTether {
  id: string;
  partnerId: string;
  partnerName: string;
  startTime: Date;
  connectionStrength: number; // 0-100
  mode: 'crisis' | 'support' | 'mutual';
  isInitiator: boolean;
  hapticEnabled: boolean;
  audioEnabled: boolean;
  drawingEnabled: boolean;
}

export interface TetherSession {
  id: string;
  partnerId: string;
  partnerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  mode: 'crisis' | 'support' | 'mutual';
  notes?: string;
  helpfulnessRating?: number;
  patterns?: {
    peakIntensity: number;
    averageStrength: number;
    disconnections: number;
  };
}

interface TetherState {
  // State
  activeTether: ActiveTether | null;
  tetherCircle: TetherCircleMember[];
  tetherProfile: TetherProfile | null;
  sessionHistory: TetherSession[];
  pendingRequests: Array<{
    id: string;
    from: string;
    fromName: string;
    message: string;
    timestamp: Date;
  }>;
  
  // Settings
  autoEscalation: boolean;
  escalationContacts: string[];
  escalationTimeout: number; // minutes
  silentMode: boolean;
  lowBandwidthMode: boolean;
  
  // Actions
  initiateTether: (partnerId: string, mode: 'crisis' | 'support') => Promise<void>;
  acceptTether: (requestId: string) => Promise<void>;
  declineTether: (requestId: string) => Promise<void>;
  endTether: (notes?: string, rating?: number) => Promise<void>;
  updateConnectionStrength: (strength: number) => void;
  sendHapticPulse: (intensity: number) => void;
  toggleDrawing: () => void;
  updateTetherProfile: (profile: Partial<TetherProfile>) => void;
  addToCircle: (member: TetherCircleMember) => void;
  removeFromCircle: (memberId: string) => void;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => void;
  loadSessionHistory: () => Promise<void>;
  triggerWellnessCheck: (partnerId: string) => Promise<void>;
  escalateToCrisis: () => Promise<void>;
}

export const useTetherStore = create<TetherState>((set, get) => ({
  // Initial state
  activeTether: null,
  tetherCircle: [],
  tetherProfile: {
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
  },
  sessionHistory: [],
  pendingRequests: [],
  autoEscalation: true,
  escalationContacts: [],
  escalationTimeout: 5,
  silentMode: false,
  lowBandwidthMode: false,

  // Actions
  initiateTether: async (partnerId: string, mode: 'crisis' | 'support') => {
    try {
      const response = await fetch('/api/tether/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ partnerId, mode })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set up WebSocket connection for real-time updates
        const ws = new WebSocket(`wss://api.astralcore.app/tether/${data.sessionId}`);
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'strength_update') {
              get().updateConnectionStrength(message.strength);
            } else if (message.type === 'haptic') {
              // Trigger haptic feedback
              if ('vibrate' in navigator && !get().silentMode) {
                navigator.vibrate(message.pattern);
              }
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        set({
          activeTether: {
            id: data.sessionId,
            partnerId,
            partnerName: data.partnerName,
            startTime: new Date(),
            connectionStrength: 50,
            mode,
            isInitiator: true,
            hapticEnabled: true,
            audioEnabled: !get().silentMode,
            drawingEnabled: false
          }
        });

        // Set up auto-escalation if enabled
        if (get().autoEscalation && mode === 'crisis') {
          setTimeout(() => {
            const currentTether = get().activeTether;
            if (currentTether && !currentTether.partnerId) {
              get().escalateToCrisis();
            }
          }, get().escalationTimeout * 60 * 1000);
        }
      }
    } catch (error) {
      console.error('Failed to initiate tether:', error);
      throw error;
    }
  },

  acceptTether: async (requestId: string) => {
    try {
      const request = get().pendingRequests.find(r => r.id === requestId);
      if (!request) return;

      const response = await fetch('/api/tether/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        const data = await response.json();
        
        set({
          activeTether: {
            id: data.sessionId,
            partnerId: request.from,
            partnerName: request.fromName,
            startTime: new Date(),
            connectionStrength: 50,
            mode: 'support',
            isInitiator: false,
            hapticEnabled: true,
            audioEnabled: !get().silentMode,
            drawingEnabled: false
          },
          pendingRequests: get().pendingRequests.filter(r => r.id !== requestId)
        });
      }
    } catch (error) {
      console.error('Failed to accept tether:', error);
    }
  },

  declineTether: async (requestId: string) => {
    try {
      await fetch('/api/tether/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ requestId })
      });
    } catch (error) {
      console.error('Failed to decline tether:', error);
    } finally {
      // Always remove from pending requests, even on error
      set({
        pendingRequests: get().pendingRequests.filter(r => r.id !== requestId)
      });
    }
  },

  endTether: async (notes?: string, rating?: number) => {
    const current = get().activeTether;
    if (!current) return;

    try {
      await fetch('/api/tether/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          sessionId: current.id,
          notes,
          rating
        })
      });

      const session: TetherSession = {
        id: current.id,
        partnerId: current.partnerId,
        partnerName: current.partnerName,
        startTime: current.startTime,
        endTime: new Date(),
        duration: Date.now() - current.startTime.getTime(),
        mode: current.mode,
        notes,
        helpfulnessRating: rating
      };

      set({
        activeTether: null,
        sessionHistory: [...get().sessionHistory, session]
      });

      // Gentle fade-out with haptic feedback
      if ('vibrate' in navigator && !get().silentMode) {
        navigator.vibrate([100, 50, 50, 50, 25]);
      }
    } catch (error) {
      console.error('Failed to end tether:', error);
    }
  },

  updateConnectionStrength: (strength: number) => {
    const current = get().activeTether;
    if (!current) return;

    set({
      activeTether: {
        ...current,
        connectionStrength: Math.max(0, Math.min(100, strength))
      }
    });
  },

  sendHapticPulse: (intensity: number) => {
    const current = get().activeTether;
    if (!current || !current.hapticEnabled) return;

    // Send to partner via WebSocket
    fetch('/api/tether/haptic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
      },
      body: JSON.stringify({
        sessionId: current.id,
        intensity
      })
    });

    // Local haptic feedback
    if ('vibrate' in navigator && !get().silentMode) {
      const duration = intensity * 10;
      navigator.vibrate(duration);
    }
  },

  toggleDrawing: () => {
    const current = get().activeTether;
    if (!current) return;

    set({
      activeTether: {
        ...current,
        drawingEnabled: !current.drawingEnabled
      }
    });
  },

  updateTetherProfile: (profile: Partial<TetherProfile>) => {
    const current = get().tetherProfile;
    if (!current) return;

    const updated = { ...current, ...profile };
    set({ tetherProfile: updated });

    // Save to backend
    fetch('/api/tether/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
      },
      body: JSON.stringify(updated)
    });
  },

  addToCircle: (member: TetherCircleMember) => {
    set({
      tetherCircle: [...get().tetherCircle, member]
    });

    // Save to backend
    fetch('/api/tether/circle/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
      },
      body: JSON.stringify(member)
    });
  },

  removeFromCircle: (memberId: string) => {
    set({
      tetherCircle: get().tetherCircle.filter(m => m.id !== memberId)
    });

    // Remove from backend
    fetch(`/api/tether/circle/remove/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
      }
    });
  },

  updateAvailability: (status: 'available' | 'busy' | 'offline') => {
    fetch('/api/tether/availability', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
      },
      body: JSON.stringify({ status })
    });
  },

  loadSessionHistory: async () => {
    try {
      const response = await fetch('/api/tether/history', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        set({ sessionHistory: data.sessions });
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  },

  triggerWellnessCheck: async (partnerId: string) => {
    try {
      await fetch('/api/tether/wellness-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ partnerId })
      });
    } catch (error) {
      console.error('Failed to trigger wellness check:', error);
    }
  },

  escalateToCrisis: async () => {
    const contacts = get().escalationContacts;
    if (contacts.length === 0) return;

    try {
      await fetch('/api/tether/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ contacts })
      });
    } catch (error) {
      console.error('Failed to escalate to crisis:', error);
    }
  }
}));