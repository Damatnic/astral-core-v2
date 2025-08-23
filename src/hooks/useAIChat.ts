import { useState, useCallback, useEffect } from 'react';
import { AIChatSession, AIChatMessage } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { authState } from '../contexts/AuthContext';
import { enhancedCrisisDetectionService } from '../services/crisisDetectionService';
import { aiModerationService } from '../services/aiModerationService';

interface UseAIChatOptions {
    userId?: string;
    provider?: 'openai' | 'claude';
    enableCrisisDetection?: boolean;
    enableModeration?: boolean;
}

export const useAIChat = (options: UseAIChatOptions = {}) => {
    const {
        userId = authState.userToken || 'anonymous',
        provider = 'openai',
        enableCrisisDetection = true,
        enableModeration = true
    } = options;
    
    const [session, setSession] = useState<AIChatSession>({ messages: [], isTyping: false });
    const [crisisDetected, setCrisisDetected] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(provider);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            const messages = await ApiClient.ai.loadChatHistory(userId);
            // Ensure messages is always an array
            const validMessages = Array.isArray(messages) ? messages : [];
            setSession(prev => ({ ...prev, messages: validMessages }));
        } catch (error) {
            // In development, provide a more specific message for API unavailability
            if ((error as Error).message?.includes('API endpoint not available in development') || 
                (error as Error).message?.includes('not valid JSON')) {
                console.warn("AI chat history unavailable in development mode - using empty state");
            } else {
                console.error("Failed to load AI chat history:", error);
            }
            // Initialize with empty array on error
            setSession(prev => ({ ...prev, messages: [] }));
        }
    }, [userId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const resetAIChat = async () => {
        await ApiClient.ai.resetAIChat(userId);
        setSession({ messages: [], isTyping: false });
        setCrisisDetected(false);
        setError(null);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        
        // Check authentication before sending message
        if (!authState.userToken) {
            console.warn('User is not authenticated. Cannot send messages.');
            return;
        }
        
        setError(null);
        
        // Content moderation
        if (enableModeration) {
            const moderationResult = aiModerationService.moderateMessage(text);
            if (!moderationResult.safe) {
                const safeResponse = aiModerationService.generateSafeResponse(moderationResult);
                const warningMessage: AIChatMessage = {
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    text: safeResponse,
                    timestamp: new Date().toISOString(),
                    metadata: { moderated: true, category: moderationResult.category }
                };
                setSession(prev => ({ 
                    ...prev, 
                    messages: [...prev.messages, warningMessage] 
                }));
                
                if (moderationResult.escalate) {
                    setCrisisDetected(true);
                }
                return;
            }
        }
        
        // Crisis detection
        if (enableCrisisDetection) {
            const crisisAnalysis = enhancedCrisisDetectionService.analyzeCrisisContent(text);
            if (crisisAnalysis.hasCrisisIndicators && 
                (crisisAnalysis.severityLevel === 'high' || crisisAnalysis.severityLevel === 'critical')) {
                setCrisisDetected(true);
            }
        }

        const userMessage: AIChatMessage = { 
            id: crypto.randomUUID(), 
            sender: 'user', 
            text: aiModerationService.sanitizeForDisplay(text), 
            timestamp: new Date().toISOString() 
        };

        const updatedMessages = [...session.messages, userMessage];
        setSession({ messages: updatedMessages, isTyping: true });
        
        try {
            const response = await ApiClient.ai.chat(updatedMessages, userId, currentProvider);
            
            const aiMessage: AIChatMessage = { 
                id: crypto.randomUUID(), 
                sender: 'ai', 
                text: response.response, 
                timestamp: new Date().toISOString(),
                metadata: response.metadata
            };
            
            if (response.metadata?.crisisDetected) {
                setCrisisDetected(true);
            }
            
            const finalMessages = [...updatedMessages, aiMessage];
            setSession({ messages: finalMessages, isTyping: false });
            await ApiClient.ai.saveChatHistory(userId, finalMessages);
        } catch (e) {
            console.error('AI chat error:', e);
            setError('Unable to connect to AI service. Please try again.');
            
            const errorMessage: AIChatMessage = { 
                id: crypto.randomUUID(), 
                sender: 'ai', 
                text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please contact 988 or emergency services.", 
                timestamp: new Date().toISOString() 
            };
            
            setSession({ 
                messages: [...updatedMessages, errorMessage], 
                isTyping: false 
            });
        }
    };
    
    const switchProvider = (newProvider: 'openai' | 'claude') => {
        setCurrentProvider(newProvider);
    };
    
    const checkNeedsIntervention = () => {
        if (!enableModeration) return false;
        return aiModerationService.needsHumanIntervention(
            session.messages.map(m => ({ text: m.text, sender: m.sender }))
        );
    };

    return {
        session,
        sendMessage,
        resetAIChat,
        crisisDetected,
        error,
        currentProvider,
        switchProvider,
        needsIntervention: checkNeedsIntervention()
    };
};
