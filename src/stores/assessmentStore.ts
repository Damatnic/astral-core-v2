import { create } from 'zustand';
import { Assessment } from '../types';
import { authState } from '../contexts/AuthContext';
import { culturalAssessmentService } from '../services/culturalAssessmentService';

interface AssessmentState {
  history: Assessment[];
  isLoading: boolean;
  
  // Actions
  fetchHistory: () => Promise<void>;
  submitPhq9Result: (score: number, answers: number[], cultural?: boolean, culturalContext?: string) => Promise<void>;
  submitGad7Result: (score: number, answers: number[], cultural?: boolean, culturalContext?: string) => Promise<void>;
  submitCulturalAssessment: (
    type: 'phq-9' | 'gad-7',
    scores: number[],
    answers: string[],
    languageCode: string,
    culturalContext?: string,
    sessionDuration?: number
  ) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
    history: [],
    isLoading: true,

    fetchHistory: async () => {
        const userToken = authState.userToken;
        if (!userToken) {
            set({ history: [], isLoading: false });
            return;
        }
        set({ isLoading: true });
        try {
            const response = await fetch('/api/assessments/history', {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                set({ history: data.assessments || [] });
            } else {
                console.error('Failed to fetch assessment history:', response.status);
                set({ history: [] });
            }
        } catch (error) {
            console.error("Failed to fetch assessment history:", error);
            set({ history: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    submitPhq9Result: async (score, answers, cultural = false, culturalContext) => {
        const userToken = authState.userToken;
        if (!userToken) throw new Error("User token is not available.");
        
        if (cultural && culturalContext) {
            // Use cultural assessment service
            await culturalAssessmentService.submitCulturalAssessment({
                userToken,
                type: 'phq-9',
                scores: answers,
                answers: answers.map(String),
                languageCode: 'en', // Default - could be detected from user settings
                culturalContext,
                sessionDuration: 300000 // 5 minutes default
            });
        } else {
            // Submit standard PHQ-9 assessment
            const response = await fetch('/api/assessments/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'phq-9',
                    score,
                    answers,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit PHQ-9: ${response.status}`);
            }
        }
        
        await get().fetchHistory();
    },
    
    submitGad7Result: async (score, answers, cultural = false, culturalContext) => {
        const userToken = authState.userToken;
        if (!userToken) throw new Error("User token is not available.");
        
        if (cultural && culturalContext) {
            // Use cultural assessment service
            await culturalAssessmentService.submitCulturalAssessment({
                userToken,
                type: 'gad-7',
                scores: answers,
                answers: answers.map(String),
                languageCode: 'en', // Default - could be detected from user settings
                culturalContext,
                sessionDuration: 300000 // 5 minutes default
            });
        } else {
            // Submit standard GAD-7 assessment
            const response = await fetch('/api/assessments/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'gad-7',
                    score,
                    answers,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit GAD-7: ${response.status}`);
            }
        }
        
        await get().fetchHistory();
    },

    submitCulturalAssessment: async (type, scores, answers, languageCode, culturalContext, sessionDuration = 300000) => {
        const userToken = authState.userToken;
        if (!userToken) throw new Error("User token is not available.");
        
        await culturalAssessmentService.submitCulturalAssessment({
            userToken,
            type,
            scores,
            answers,
            languageCode,
            culturalContext,
            sessionDuration
        });
        
        await get().fetchHistory();
    }
}));

// Initial data fetch
useAssessmentStore.getState().fetchHistory();