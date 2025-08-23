import { create } from 'zustand';
import { Reflection } from '../types';

interface ReflectionState {
    reflections: Reflection[];
    isLoading: boolean;
    error: string | null;
    
    setReflections: (reflections: Reflection[]) => void;
    addReflection: (reflection: Reflection) => void;
    updateReaction: (reflectionId: string, reactionType: string, userReaction?: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useReflectionStore = create<ReflectionState>((set) => ({
    reflections: [],
    isLoading: false,
    error: null,
    
    setReflections: (reflections) => set({ reflections }),
    
    addReflection: (reflection) => set((state) => ({
        reflections: [reflection, ...state.reflections]
    })),
    
    updateReaction: (reflectionId, reactionType, userReaction) => set((state) => ({
        reflections: state.reflections.map(r => {
            if (r.id === reflectionId) {
                const updatedReactions = { ...r.reactions };
                if (userReaction && !r.myReaction) {
                    updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
                }
                return {
                    ...r,
                    reactions: updatedReactions,
                    myReaction: userReaction || r.myReaction
                };
            }
            return r;
        })
    })),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error })
}));