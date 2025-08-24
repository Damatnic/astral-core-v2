/**
 * Reflection Store
 *
 * Zustand store for managing user reflections, emotional processing,
 * and self-discovery features within the mental health platform.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Types for reflection functionality
export interface Reflection {
  id: string;
  title: string;
  content: string;
  prompt?: string;
  category: 'gratitude' | 'challenge' | 'growth' | 'emotion' | 'goal' | 'relationship' | 'general';
  mood?: number; // 1-10 scale
  tags: string[];
  isPrivate: boolean;
  timestamp: number;
  updatedAt?: number;
  reactions: {
    helpful: number;
    insightful: number;
    relatable: number;
    inspiring: number;
  };
  userReaction?: {
    type: 'helpful' | 'insightful' | 'relatable' | 'inspiring';
    timestamp: number;
  };
  wordCount: number;
  readingTime: number; // estimated minutes
  attachments?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    caption?: string;
  }[];
  metadata?: {
    emotionalState?: string[];
    energyLevel?: number;
    stressLevel?: number;
    insights?: string[];
  };
}

export interface ReflectionPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: Reflection['category'];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  tags: string[];
  isActive: boolean;
  usageCount: number;
  rating: number;
}

export interface ReflectionStats {
  totalReflections: number;
  totalWords: number;
  averageWordsPerReflection: number;
  longestStreak: number;
  currentStreak: number;
  categoryCounts: Record<Reflection['category'], number>;
  moodTrend: {
    average: number;
    direction: 'up' | 'down' | 'stable';
  };
  weeklyGoal: number;
  weeklyProgress: number;
}

// Store state interface
interface ReflectionState {
  // Reflections
  reflections: Reflection[];
  isLoading: boolean;
  
  // Prompts
  prompts: ReflectionPrompt[];
  isLoadingPrompts: boolean;
  currentPrompt: ReflectionPrompt | null;
  
  // Statistics
  stats: ReflectionStats;
  
  // UI state
  selectedReflectionId: string | null;
  filterCategory: Reflection['category'] | 'all';
  sortBy: 'recent' | 'oldest' | 'mood' | 'wordCount' | 'reactions';
  searchQuery: string;
  viewMode: 'grid' | 'list' | 'timeline';
  
  // Writing state
  isWriting: boolean;
  draftContent: string;
  autosaveEnabled: boolean;
  
  // Error handling
  error: string | null;
}

// Store actions interface
interface ReflectionActions {
  // Reflection management
  fetchReflections: () => Promise<void>;
  addReflection: (reflection: Omit<Reflection, 'id' | 'timestamp' | 'wordCount' | 'readingTime' | 'reactions'>) => Promise<void>;
  updateReflection: (id: string, updates: Partial<Reflection>) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;
  
  // Reactions
  addReaction: (reflectionId: string, reactionType: keyof Reflection['reactions']) => Promise<void>;
  removeReaction: (reflectionId: string) => Promise<void>;
  
  // Prompts
  fetchPrompts: () => Promise<void>;
  selectPrompt: (promptId: string) => void;
  clearPrompt: () => void;
  ratePrompt: (promptId: string, rating: number) => Promise<void>;
  
  // Statistics
  calculateStats: () => void;
  updateWeeklyGoal: (goal: number) => void;
  
  // UI actions
  setSelectedReflection: (id: string | null) => void;
  setFilterCategory: (category: ReflectionState['filterCategory']) => void;
  setSortBy: (sortBy: ReflectionState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ReflectionState['viewMode']) => void;
  
  // Writing actions
  startWriting: () => void;
  stopWriting: () => void;
  updateDraft: (content: string) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  toggleAutosave: () => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Default prompts
const DEFAULT_PROMPTS: Omit<ReflectionPrompt, 'id' | 'usageCount' | 'rating'>[] = [
  {
    title: 'Daily Gratitude',
    description: 'Reflect on what you\'re grateful for today',
    prompt: 'What are three things you\'re genuinely grateful for today? How did they make you feel?',
    category: 'gratitude',
    difficulty: 'easy',
    estimatedTime: 5,
    tags: ['gratitude', 'positivity', 'mindfulness'],
    isActive: true
  },
  {
    title: 'Challenge Reflection',
    description: 'Process a recent challenge or difficulty',
    prompt: 'Think about a recent challenge you faced. What did you learn from it? How did it help you grow?',
    category: 'challenge',
    difficulty: 'medium',
    estimatedTime: 10,
    tags: ['growth', 'resilience', 'learning'],
    isActive: true
  },
  {
    title: 'Emotional Check-in',
    description: 'Explore your current emotional state',
    prompt: 'How are you feeling right now? What emotions are present, and what might be causing them?',
    category: 'emotion',
    difficulty: 'easy',
    estimatedTime: 7,
    tags: ['emotions', 'self-awareness', 'mindfulness'],
    isActive: true
  },
  {
    title: 'Personal Growth',
    description: 'Reflect on your personal development',
    prompt: 'In what ways have you grown or changed recently? What aspects of yourself are you most proud of?',
    category: 'growth',
    difficulty: 'medium',
    estimatedTime: 12,
    tags: ['growth', 'self-improvement', 'progress'],
    isActive: true
  },
  {
    title: 'Goal Reflection',
    description: 'Examine your goals and progress',
    prompt: 'What goals are you working toward? What progress have you made, and what steps will you take next?',
    category: 'goal',
    difficulty: 'medium',
    estimatedTime: 15,
    tags: ['goals', 'planning', 'motivation'],
    isActive: true
  }
];

// Mock API client
const mockApiClient = {
  async get(endpoint: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    if (endpoint === '/reflections') {
      return { data: [] };
    }
    if (endpoint === '/reflection-prompts') {
      return { 
        data: DEFAULT_PROMPTS.map((prompt, index) => ({
          ...prompt,
          id: `prompt_${index + 1}`,
          usageCount: Math.floor(Math.random() * 100),
          rating: 4 + Math.random()
        }))
      };
    }
    
    return { data: [] };
  },
  
  async post(endpoint: string, data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
    
    const id = `${endpoint.split('/').pop()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { data: { id, ...data, timestamp: Date.now() } };
  },
  
  async put(endpoint: string, data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
    return { success: true, data: { ...data, updatedAt: Date.now() } };
  },
  
  async delete(endpoint: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
    return { success: true };
  }
};

// Utility functions
const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const calculateReadingTime = (wordCount: number): number => {
  return Math.ceil(wordCount / 200); // Assume 200 WPM reading speed
};

// Create the reflection store
export const useReflectionStore = create<ReflectionState & ReflectionActions>()(
  persist(
    devtools(
      (set, get) => ({
        // Initial state
        reflections: [],
        isLoading: false,
        prompts: [],
        isLoadingPrompts: false,
        currentPrompt: null,
        stats: {
          totalReflections: 0,
          totalWords: 0,
          averageWordsPerReflection: 0,
          longestStreak: 0,
          currentStreak: 0,
          categoryCounts: {
            gratitude: 0,
            challenge: 0,
            growth: 0,
            emotion: 0,
            goal: 0,
            relationship: 0,
            general: 0
          },
          moodTrend: {
            average: 0,
            direction: 'stable'
          },
          weeklyGoal: 5,
          weeklyProgress: 0
        },
        selectedReflectionId: null,
        filterCategory: 'all',
        sortBy: 'recent',
        searchQuery: '',
        viewMode: 'list',
        isWriting: false,
        draftContent: '',
        autosaveEnabled: true,
        error: null,

        // Reflection management
        fetchReflections: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await mockApiClient.get('/reflections');
            
            set({ 
              reflections: response.data || [],
              isLoading: false 
            });
            
            // Recalculate stats after fetching
            get().calculateStats();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch reflections',
              isLoading: false 
            });
          }
        },

        addReflection: async (reflectionData) => {
          try {
            set({ isLoading: true, error: null });
            
            const wordCount = calculateWordCount(reflectionData.content);
            const readingTime = calculateReadingTime(wordCount);
            
            const reflection: Omit<Reflection, 'id'> = {
              ...reflectionData,
              timestamp: Date.now(),
              wordCount,
              readingTime,
              reactions: {
                helpful: 0,
                insightful: 0,
                relatable: 0,
                inspiring: 0
              }
            };
            
            const response = await mockApiClient.post('/reflections', reflection);
            
            set(state => ({
              reflections: [response.data, ...state.reflections],
              isLoading: false,
              draftContent: '' // Clear draft after successful save
            }));
            
            // Recalculate stats
            get().calculateStats();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to save reflection',
              isLoading: false 
            });
          }
        },

        updateReflection: async (id, updates) => {
          try {
            // Recalculate word count and reading time if content changed
            if (updates.content) {
              updates.wordCount = calculateWordCount(updates.content);
              updates.readingTime = calculateReadingTime(updates.wordCount);
              updates.updatedAt = Date.now();
            }
            
            await mockApiClient.put(`/reflections/${id}`, updates);
            
            set(state => ({
              reflections: state.reflections.map(reflection =>
                reflection.id === id ? { ...reflection, ...updates } : reflection
              )
            }));
            
            get().calculateStats();
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update reflection' });
          }
        },

        deleteReflection: async (id) => {
          try {
            await mockApiClient.delete(`/reflections/${id}`);
            
            set(state => ({
              reflections: state.reflections.filter(reflection => reflection.id !== id),
              selectedReflectionId: state.selectedReflectionId === id ? null : state.selectedReflectionId
            }));
            
            get().calculateStats();
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete reflection' });
          }
        },

        // Reactions
        addReaction: async (reflectionId, reactionType) => {
          try {
            await mockApiClient.post(`/reflections/${reflectionId}/reactions`, {
              type: reactionType
            });
            
            set(state => ({
              reflections: state.reflections.map(reflection =>
                reflection.id === reflectionId
                  ? {
                      ...reflection,
                      reactions: {
                        ...reflection.reactions,
                        [reactionType]: reflection.reactions[reactionType] + 1
                      },
                      userReaction: {
                        type: reactionType,
                        timestamp: Date.now()
                      }
                    }
                  : reflection
              )
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add reaction' });
          }
        },

        removeReaction: async (reflectionId) => {
          try {
            const reflection = get().reflections.find(r => r.id === reflectionId);
            if (!reflection?.userReaction) return;
            
            await mockApiClient.delete(`/reflections/${reflectionId}/reactions`);
            
            set(state => ({
              reflections: state.reflections.map(r =>
                r.id === reflectionId && r.userReaction
                  ? {
                      ...r,
                      reactions: {
                        ...r.reactions,
                        [r.userReaction.type]: Math.max(0, r.reactions[r.userReaction.type] - 1)
                      },
                      userReaction: undefined
                    }
                  : r
              )
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to remove reaction' });
          }
        },

        // Prompts
        fetchPrompts: async () => {
          try {
            set({ isLoadingPrompts: true, error: null });
            
            const response = await mockApiClient.get('/reflection-prompts');
            
            set({ 
              prompts: response.data || [],
              isLoadingPrompts: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch prompts',
              isLoadingPrompts: false 
            });
          }
        },

        selectPrompt: (promptId) => {
          const prompt = get().prompts.find(p => p.id === promptId);
          set({ currentPrompt: prompt || null });
        },

        clearPrompt: () => {
          set({ currentPrompt: null });
        },

        ratePrompt: async (promptId, rating) => {
          try {
            await mockApiClient.put(`/reflection-prompts/${promptId}/rating`, { rating });
            
            set(state => ({
              prompts: state.prompts.map(prompt =>
                prompt.id === promptId ? { ...prompt, rating } : prompt
              )
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to rate prompt' });
          }
        },

        // Statistics
        calculateStats: () => {
          const { reflections } = get();
          
          if (reflections.length === 0) {
            set({
              stats: {
                totalReflections: 0,
                totalWords: 0,
                averageWordsPerReflection: 0,
                longestStreak: 0,
                currentStreak: 0,
                categoryCounts: {
                  gratitude: 0,
                  challenge: 0,
                  growth: 0,
                  emotion: 0,
                  goal: 0,
                  relationship: 0,
                  general: 0
                },
                moodTrend: {
                  average: 0,
                  direction: 'stable'
                },
                weeklyGoal: get().stats.weeklyGoal,
                weeklyProgress: 0
              }
            });
            return;
          }
          
          const totalWords = reflections.reduce((sum, r) => sum + r.wordCount, 0);
          const averageWordsPerReflection = totalWords / reflections.length;
          
          // Calculate category counts
          const categoryCounts = reflections.reduce((counts, reflection) => {
            counts[reflection.category] = (counts[reflection.category] || 0) + 1;
            return counts;
          }, {} as Record<Reflection['category'], number>);
          
          // Calculate mood trend
          const moodReflections = reflections.filter(r => r.mood !== undefined);
          const averageMood = moodReflections.length > 0
            ? moodReflections.reduce((sum, r) => sum + (r.mood || 0), 0) / moodReflections.length
            : 0;
          
          // Calculate streaks
          const sortedReflections = reflections
            .sort((a, b) => b.timestamp - a.timestamp);
          
          let currentStreak = 0;
          let longestStreak = 0;
          let tempStreak = 0;
          
          const today = new Date().setHours(0, 0, 0, 0);
          let checkDate = today;
          
          for (const reflection of sortedReflections) {
            const reflectionDate = new Date(reflection.timestamp).setHours(0, 0, 0, 0);
            
            if (reflectionDate === checkDate || reflectionDate === checkDate - 24 * 60 * 60 * 1000) {
              tempStreak++;
              if (reflectionDate === today || (currentStreak === 0 && reflectionDate === today - 24 * 60 * 60 * 1000)) {
                currentStreak = tempStreak;
              }
              checkDate = reflectionDate - 24 * 60 * 60 * 1000;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 0;
              break;
            }
          }
          
          longestStreak = Math.max(longestStreak, tempStreak);
          
          // Calculate weekly progress
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const weeklyReflections = reflections.filter(r => r.timestamp >= weekAgo);
          const weeklyProgress = Math.min(weeklyReflections.length / get().stats.weeklyGoal, 1);
          
          set({
            stats: {
              totalReflections: reflections.length,
              totalWords,
              averageWordsPerReflection,
              longestStreak,
              currentStreak,
              categoryCounts: {
                gratitude: 0,
                challenge: 0,
                growth: 0,
                emotion: 0,
                goal: 0,
                relationship: 0,
                general: 0,
                ...categoryCounts
              },
              moodTrend: {
                average: averageMood,
                direction: 'stable' // Could be calculated based on recent trend
              },
              weeklyGoal: get().stats.weeklyGoal,
              weeklyProgress
            }
          });
        },

        updateWeeklyGoal: (goal) => {
          set(state => ({
            stats: {
              ...state.stats,
              weeklyGoal: goal
            }
          }));
          
          // Recalculate progress with new goal
          get().calculateStats();
        },

        // UI actions
        setSelectedReflection: (id) => {
          set({ selectedReflectionId: id });
        },

        setFilterCategory: (category) => {
          set({ filterCategory: category });
        },

        setSortBy: (sortBy) => {
          set({ sortBy });
        },

        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },

        setViewMode: (mode) => {
          set({ viewMode: mode });
        },

        // Writing actions
        startWriting: () => {
          set({ isWriting: true });
        },

        stopWriting: () => {
          set({ isWriting: false });
        },

        updateDraft: (content) => {
          set({ draftContent: content });
          
          // Auto-save if enabled
          if (get().autosaveEnabled && content.trim()) {
            // Debounce auto-save (in real implementation)
            get().saveDraft();
          }
        },

        saveDraft: () => {
          // Save draft to localStorage or backend
          localStorage.setItem('reflectionDraft', get().draftContent);
        },

        clearDraft: () => {
          set({ draftContent: '' });
          localStorage.removeItem('reflectionDraft');
        },

        toggleAutosave: () => {
          set(state => ({ autosaveEnabled: !state.autosaveEnabled }));
        },

        // Utility actions
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        }
      }),
      { name: 'reflection-store' }
    ),
    {
      name: 'reflection-store',
      partialize: (state) => ({
        reflections: state.reflections,
        stats: state.stats,
        filterCategory: state.filterCategory,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
        autosaveEnabled: state.autosaveEnabled,
        draftContent: state.draftContent
      })
    }
  )
);

// Initialize draft from localStorage on store creation
if (typeof window !== 'undefined') {
  const savedDraft = localStorage.getItem('reflectionDraft');
  if (savedDraft) {
    useReflectionStore.setState({ draftContent: savedDraft });
  }
}

export default useReflectionStore;
