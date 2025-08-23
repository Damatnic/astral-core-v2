import { create } from 'zustand';
import { MoodCheckIn, Habit, TrackedHabit, HabitCompletion, JournalEntry } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { calculateStreaks } from '../utils/habitUtils';

interface WellnessState {
  history: MoodCheckIn[];
  journalEntries: JournalEntry[];
  isLoading: boolean;
  predefinedHabits: Habit[];
  trackedHabits: TrackedHabit[];
  isLoadingHabits: boolean;
  completions: HabitCompletion[];

  // Actions
  fetchHistory: () => Promise<void>;
  postCheckIn: (checkInData: Omit<MoodCheckIn, 'id' | 'userToken' | 'timestamp'>) => Promise<void>;
  fetchHabits: () => Promise<void>;
  trackHabit: (habitId: string) => Promise<void>;
  untrackHabit: (habitId: string) => Promise<void>;
  logCompletion: (habitId: string) => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  postJournalEntry: (content: string) => Promise<void>;
}

export const useWellnessStore = create<WellnessState>((set, get) => ({
  history: [],
  journalEntries: [],
  isLoading: true,
  predefinedHabits: [],
  trackedHabits: [],
  isLoadingHabits: true,
  completions: [],

  fetchHistory: async () => {
    const userToken = authState.userToken;
    if (!userToken) {
        set({ history: [], isLoading: false });
        return;
    }
    set({ isLoading: true });
    try {
      const data = await ApiClient.mood.getHistory(userToken);
      set({ history: data });
    } catch (error) {
      // Provide demo data in development mode
      const err = error as { message?: string; isDevelopmentError?: boolean };
      if (err.message?.includes('Demo mode') || err.isDevelopmentError || true) { // Always show demo data for now
        const demoHistory: MoodCheckIn[] = [];
        // Generate 2 weeks of mood data
        for (let i = 0; i < 14; i++) {
          const daysAgo = i;
          const mood = Math.floor(Math.random() * 2) + 3; // 3-5 range for mostly positive
          const anxiety = Math.floor(Math.random() * 3) + 1; // 1-3 range for low-moderate
          demoHistory.push({
            id: `demo-${i}`,
            userToken: userToken,
            timestamp: new Date(Date.now() - (daysAgo * 86400000)).toISOString(),
            moodScore: mood,
            anxietyLevel: anxiety,
            sleepQuality: Math.floor(Math.random() * 2) + 3,
            energyLevel: Math.floor(Math.random() * 3) + 2,
            tags: [
              ['Grateful', 'Calm', 'Hopeful'][Math.floor(Math.random() * 3)],
              ['Productive', 'Tired', 'Anxious'][Math.floor(Math.random() * 3)]
            ],
            notes: [
              'Had a good therapy session today',
              'Practiced meditation this morning',
              'Went for a walk in nature',
              'Connected with a friend',
              'Accomplished my daily goals',
              'Feeling more balanced',
              'Working through some challenges'
            ][Math.floor(Math.random() * 7)]
          });
        }
        set({ history: demoHistory });
      } else {
        console.error("Failed to fetch wellness history:", error);
        set({ history: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  postCheckIn: async (checkInData) => {
    const userToken = authState.userToken;
    if (!userToken) throw new Error("User token is not available.");
    
    await ApiClient.mood.postCheckIn(checkInData, userToken);
    await get().fetchHistory();
  },

  fetchJournalEntries: async () => {
    const userToken = authState.userToken;
    if (!userToken) {
        set({ journalEntries: [] });
        return;
    }
    try {
      const data = await ApiClient.journal.getEntries(userToken);
      set({ journalEntries: data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) });
    } catch (error) {
      // Provide demo data in development mode
      const err = error as { message?: string; isDevelopmentError?: boolean };
      if (err.message?.includes('Demo mode') || err.isDevelopmentError || true) { // Always show demo data for now
        set({ 
          journalEntries: [
            {
              id: 'demo-journal-1',
              userToken: userToken,
              content: 'Today was a breakthrough day in therapy. We talked about setting boundaries with family, and I finally understood why it\'s been so hard for me. It\'s not about not caring - it\'s about caring for myself too. I\'m going to practice saying "no" to one small thing this week.',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: 'demo-journal-2',
              userToken: userToken,
              content: 'Anxiety was high this morning, but I used the 5-4-3-2-1 grounding technique and it actually worked! 5 things I could see, 4 I could touch, 3 I could hear, 2 I could smell, 1 I could taste. By the end, I felt present again. Small victories matter.',
              timestamp: new Date(Date.now() - 172800000).toISOString()
            },
            {
              id: 'demo-journal-3',
              userToken: userToken,
              content: 'Grateful for: 1) Morning coffee with no rush, 2) My cat purring next to me, 3) A text from an old friend, 4) The sunset I caught on my walk, 5) This safe space to express myself. Some days gratitude is easier than others, but today it feels genuine.',
              timestamp: new Date(Date.now() - 259200000).toISOString()
            },
            {
              id: 'demo-journal-4',
              userToken: userToken,
              content: 'Had a panic attack at the grocery store today. But instead of beating myself up, I\'m proud that I: recognized it happening, found a quiet spot, used my breathing exercises, and finished my shopping afterward. Recovery isn\'t linear, and that\'s okay.',
              timestamp: new Date(Date.now() - 345600000).toISOString()
            },
            {
              id: 'demo-journal-5',
              userToken: userToken,
              content: 'Sleep has been better this week. I think the new bedtime routine is helping - no screens after 10pm, chamomile tea, and 10 minutes of stretching. It\'s amazing how small changes can make such a difference. Tonight I\'ll try adding some meditation.',
              timestamp: new Date(Date.now() - 432000000).toISOString()
            }
          ]
        });
      } else {
        console.error("Failed to fetch journal entries:", error);
        set({ journalEntries: [] });
      }
    }
  },

  postJournalEntry: async (content) => {
    const userToken = authState.userToken;
    if (!userToken) throw new Error("User token is not available.");
    
    await ApiClient.journal.postEntry(content, userToken);
    await get().fetchJournalEntries();
  },

  fetchHabits: async () => {
    const userToken = authState.userToken;
    if (!userToken) {
      set({ predefinedHabits: [], trackedHabits: [], completions: [], isLoadingHabits: false });
      return;
    }
    set({ isLoadingHabits: true });
    try {
        const [predefined, trackedIds, comps] = await Promise.all([
            ApiClient.habits.getPredefinedHabits(),
            ApiClient.habits.getTrackedHabitIds(userToken),
            ApiClient.habits.getCompletions(userToken),
        ]);
        
        const trackedWithStreaks = calculateStreaks(predefined.filter(h => trackedIds.includes(h.id)), comps, userToken);
        set({
            predefinedHabits: predefined,
            completions: comps,
            trackedHabits: trackedWithStreaks,
        });
    } catch (error) {
        // Provide demo data in development mode
        const err = error as { message?: string; isDevelopmentError?: boolean };
        if (err.message?.includes('Demo mode') || err.isDevelopmentError) {
            const demoPredefined = [
                { id: 'habit-1', name: 'Daily Meditation', description: 'Practice mindfulness for 10 minutes', category: 'Mindfulness' as const, icon: '🧘' },
                { id: 'habit-2', name: 'Gratitude Journal', description: 'Write 3 things you\'re grateful for', category: 'Self-Care' as const, icon: '📝' },
                { id: 'habit-3', name: 'Morning Walk', description: 'Take a 20-minute walk outdoors', category: 'Physical' as const, icon: '🚶' },
                { id: 'habit-4', name: 'Deep Breathing', description: 'Practice deep breathing exercises', category: 'Mindfulness' as const, icon: '💨' },
                { id: 'habit-5', name: 'Hydration', description: 'Drink 8 glasses of water', category: 'Physical' as const, icon: '💧' }
            ];
            
            const demoTracked = [
                {
                    userId: 'demo-user',
                    habitId: 'habit-1',
                    trackedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
                    currentStreak: 7,
                    longestStreak: 14,
                    isCompletedToday: false
                },
                {
                    userId: 'demo-user',
                    habitId: 'habit-3',
                    trackedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                    currentStreak: 3,
                    longestStreak: 10,
                    isCompletedToday: true
                }
            ];
            
            set({
                predefinedHabits: demoPredefined,
                trackedHabits: demoTracked,
                completions: []
            });
        } else {
            console.error("Failed to fetch habits data:", error);
        }
    } finally {
        set({ isLoadingHabits: false });
    }
  },

  trackHabit: async (habitId) => {
    const userToken = authState.userToken;
    if (!userToken) return;
    await ApiClient.habits.trackHabit(userToken, habitId);
    await get().fetchHabits();
  },
  
  untrackHabit: async (habitId) => {
    const userToken = authState.userToken;
    if (!userToken) return;
    await ApiClient.habits.untrackHabit(userToken, habitId);
    await get().fetchHabits();
  },

  logCompletion: async (habitId) => {
    const userToken = authState.userToken;
    if (!userToken) return;
    const today = new Date().toISOString().split('T')[0];
    await ApiClient.habits.logCompletion(userToken, habitId, today);
    await get().fetchHabits();
  },
}));

// Initial data fetches - disabled to prevent refresh issues
// These will be called when the component mounts instead
// useWellnessStore.getState().fetchHistory();
// useWellnessStore.getState().fetchHabits();
// useWellnessStore.getState().fetchJournalEntries();