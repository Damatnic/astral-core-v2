/**
 * AI Assistant View
 * Interactive AI chat interface with crisis detection and safety features
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  SparkleIcon, 
  SendIcon, 
  HeartIcon, 
  AlertTriangleIcon,
  MicrophoneIcon,
  VolumeUpIcon,
  RefreshIcon,
  SettingsIcon,
  ShieldIcon,
  InfoIcon,
  UserIcon,
  BotIcon
} from '../components/icons.dynamic';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppTextArea';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { crisisDetectionService } from '../services/crisisDetectionService';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    crisisDetected?: boolean;
    sentiment?: number;
    intent?: string;
    confidence?: number;
  };
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
  traits: string[];
  responseStyle: 'supportive' | 'clinical' | 'casual' | 'professional';
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  messageCount: number;
  topics: string[];
  mood: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: 'sage',
    name: 'Sage',
    description: 'Wise, empathetic, and supportive companion',
    avatar: '🧙‍♀️',
    traits: ['empathetic', 'wise', 'patient', 'supportive'],
    responseStyle: 'supportive'
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Energetic, optimistic, and encouraging',
    avatar: '⭐',
    traits: ['optimistic', 'energetic', 'encouraging', 'creative'],
    responseStyle: 'casual'
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Calm, mindful, and grounding presence',
    avatar: '🧘‍♂️',
    traits: ['calm', 'mindful', 'grounding', 'peaceful'],
    responseStyle: 'clinical'
  }
];

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'hurt myself', 'self-harm',
  'overdose', 'can\'t go on', 'no point', 'better off dead'
];

const SUPPORTIVE_RESPONSES = [
  "I hear you, and I want you to know that your feelings are valid. What you're experiencing matters.",
  "Thank you for sharing that with me. It takes courage to open up about difficult feelings.",
  "I'm here to listen and support you. You don't have to go through this alone.",
  "That sounds really challenging. How are you taking care of yourself right now?",
  "I appreciate you trusting me with these thoughts. What would feel most helpful right now?"
];

const AIAssistantView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(AI_PERSONALITIES[0]);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    sessionId: `session_${Date.now()}`,
    userId: user?.id || 'anonymous',
    startTime: new Date(),
    messageCount: 0,
    topics: [],
    mood: 5,
    riskLevel: 'low'
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize conversation with greeting
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: 'greeting',
      text: `Hi ${user?.name || 'there'}! I'm ${selectedPersonality.name}, your AI companion. I'm here to listen, provide support, and help you explore your thoughts and feelings. How are you doing today?`,
      sender: 'ai',
      timestamp: new Date(),
      metadata: {
        intent: 'greeting',
        confidence: 1.0
      }
    };

    setMessages([initialMessage]);
  }, [user?.name, selectedPersonality]);

  // Crisis detection
  const detectCrisis = useCallback((text: string): boolean => {
    try {
      const result = crisisDetectionService.detectCrisis(text);
      
      if (result.hasCrisisIndicators) {
        setIsCrisisDetected(true);
        setConversationContext(prev => ({
          ...prev,
          riskLevel: result.severityLevel === 'critical' || result.severityLevel === 'high' ? 'critical' : 'high'
        }));

        // Show crisis notification
        showNotification(
          'Crisis Support Available',
          'I notice you might be going through a difficult time. Professional help is available 24/7.',
          'warning'
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Crisis detection error:', error);
      return false;
    }
  }, [showNotification]);

  // Generate AI response
  const generateAIResponse = useCallback(async (userMessage: string, crisisDetected: boolean): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    if (crisisDetected) {
      return `I'm really concerned about what you've shared. Your life has value, and there are people who want to help. Please consider reaching out to:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Emergency Services: 911

I'm here to support you too. Would you like to talk about what's been making things feel so difficult?`;
    }

    // Simple response generation based on keywords and personality
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      return selectedPersonality.responseStyle === 'supportive' 
        ? "I hear that you're feeling sad. Those feelings are completely valid. Sometimes when we're going through difficult times, it can help to talk about what's contributing to these feelings. What's been weighing on your mind lately?"
        : "Depression can feel overwhelming. What's one small thing that usually brings you a moment of peace or comfort?";
    }

    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return "Anxiety can be really challenging to manage. It sounds like you're dealing with some worrying thoughts. Would it help to talk through what's causing you to feel anxious right now?";
    }

    if (lowerMessage.includes('stressed')) {
      return "Stress can really take a toll on us. What's been the biggest source of stress for you lately? Sometimes breaking it down can make it feel more manageable.";
    }

    if (lowerMessage.includes('thank')) {
      return "You're very welcome. I'm glad I could be here for you. Remember, reaching out and talking about how you're feeling is a sign of strength.";
    }

    // Default supportive response
    const randomResponse = SUPPORTIVE_RESPONSES[Math.floor(Math.random() * SUPPORTIVE_RESPONSES.length)];
    return randomResponse;
  }, [selectedPersonality]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Detect crisis
    const crisisDetected = detectCrisis(userMessage.text);

    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      topics: [...prev.topics, userMessage.text.substring(0, 50)]
    }));

    try {
      // Generate AI response
      const aiResponseText = await generateAIResponse(userMessage.text, crisisDetected);

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          crisisDetected,
          intent: crisisDetected ? 'crisis_support' : 'general_support',
          confidence: 0.8
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: "I apologize, but I'm having trouble responding right now. Please try again, or if you're in crisis, please reach out to emergency services or a crisis hotline immediately.",
        sender: 'system',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, detectCrisis, generateAIResponse]);

  // Handle enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Clear conversation
  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setIsCrisisDetected(false);
    setConversationContext(prev => ({
      ...prev,
      messageCount: 0,
      topics: [],
      riskLevel: 'low'
    }));

    // Re-initialize with greeting
    setTimeout(() => {
      const greetingMessage: ChatMessage = {
        id: 'new_greeting',
        text: `Let's start fresh! I'm ${selectedPersonality.name}, and I'm here to support you. What would you like to talk about?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
    }, 100);
  }, [selectedPersonality]);

  // Message component
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className={`message-bubble ${message.sender}`}>
      <div className="message-avatar">
        {message.sender === 'user' ? (
          <UserIcon className="w-6 h-6" />
        ) : message.sender === 'ai' ? (
          <span className="ai-avatar">{selectedPersonality.avatar}</span>
        ) : (
          <InfoIcon className="w-6 h-6" />
        )}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.text.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className="message-meta">
          <span className="message-time">{formatTimeAgo(message.timestamp)}</span>
          {message.metadata?.crisisDetected && (
            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="ai-assistant-view">
      <ViewHeader 
        title="AI Assistant"
        subtitle={`Chatting with ${selectedPersonality.name}`}
        icon={<SparkleIcon className="w-6 h-6" />}
      />

      {/* Crisis Alert Banner */}
      {isCrisisDetected && (
        <Card className="crisis-alert-banner">
          <div className="crisis-content">
            <AlertTriangleIcon className="w-6 h-6 text-red-500" />
            <div className="crisis-text">
              <h4>Crisis Support Available</h4>
              <p>If you're in immediate danger, please call 911 or go to your nearest emergency room.</p>
            </div>
            <div className="crisis-actions">
              <AppButton variant="danger" size="small">
                Call 988
              </AppButton>
              <AppButton variant="secondary" size="small">
                Resources
              </AppButton>
            </div>
          </div>
        </Card>
      )}

      {/* AI Personality Selector */}
      <Card className="personality-selector">
        <div className="selector-header">
          <h4>Choose Your AI Companion</h4>
        </div>
        <div className="personality-options">
          {AI_PERSONALITIES.map((personality) => (
            <div
              key={personality.id}
              className={`personality-option ${selectedPersonality.id === personality.id ? 'selected' : ''}`}
              onClick={() => setSelectedPersonality(personality)}
            >
              <span className="personality-avatar">{personality.avatar}</span>
              <div className="personality-info">
                <h5>{personality.name}</h5>
                <p>{personality.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="chat-interface">
        <div className="chat-header">
          <div className="chat-info">
            <span className="ai-avatar">{selectedPersonality.avatar}</span>
            <div>
              <h4>{selectedPersonality.name}</h4>
              <p>{selectedPersonality.description}</p>
            </div>
          </div>
          <div className="chat-actions">
            <AppButton
              variant="secondary"
              size="small"
              onClick={handleClearConversation}
              icon={<RefreshIcon className="w-4 h-4" />}
            >
              New Chat
            </AppButton>
          </div>
        </div>

        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-avatar">
                  <span className="ai-avatar">{selectedPersonality.avatar}</span>
                </div>
                <div className="typing-content">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{selectedPersonality.name} is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-container">
          <div className="input-wrapper">
            <AppTextArea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Share your thoughts with ${selectedPersonality.name}...`}
              rows={1}
              className="chat-input"
              disabled={isTyping}
            />
            <div className="input-actions">
              <AppButton
                variant="primary"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                icon={<SendIcon className="w-5 h-5" />}
                className="send-button"
              >
                Send
              </AppButton>
            </div>
          </div>
          
          <div className="chat-footer">
            <div className="privacy-notice">
              <ShieldIcon className="w-4 h-4" />
              <span>Your conversations are private and secure. Crisis detection helps ensure your safety.</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Conversation Stats */}
      <Card className="conversation-stats">
        <h4>Session Information</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Messages</span>
            <span className="stat-value">{conversationContext.messageCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{formatTimeAgo(conversationContext.startTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Risk Level</span>
            <span className={`stat-value risk-${conversationContext.riskLevel}`}>
              {conversationContext.riskLevel.charAt(0).toUpperCase() + conversationContext.riskLevel.slice(1)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantView;
