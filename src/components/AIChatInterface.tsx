import React, { useState, useEffect, useRef } from 'react';
import { AIChatMessage } from '../types';
import { TypingIndicator } from './TypingIndicator';
import { AIAssistanceIndicator } from './AIAssistanceIndicator';
import { CrisisAlert } from './CrisisAlert';
import { formatChatTimestamp } from '../utils/formatTimeAgo';
import { AppButton } from './AppButton';
import { AppTextArea } from './AppTextArea';
import { 
  AICompanionIcon, 
  SendIcon, 
  WarningIcon, 
  LockIcon,
  SparkleIcon,
  RefreshIcon,
  MoreIcon
} from './icons.dynamic';
import { enhancedCrisisDetectionService } from '../services/crisisDetectionService';
import './AIChatInterface.css';

interface AIChatInterfaceProps {
  userId: string;
  userName?: string;
  onClose?: () => void;
  provider?: 'openai' | 'claude';
  theme?: 'light' | 'dark' | 'calming';
}

interface ChatState {
  messages: AIChatMessage[];
  isTyping: boolean;
  error: string | null;
  crisisDetected: boolean;
  sessionId: string;
  provider: 'openai' | 'claude';
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  userId,
  userName = 'Friend',
  onClose,
  provider = 'openai',
  theme = 'calming'
}) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null,
    crisisDetected: false,
    sessionId: crypto.randomUUID(),
    provider
  });
  
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isTyping]);
  
  // Load conversation history
  useEffect(() => {
    loadHistory();
  }, [userId]);
  
  const loadHistory = async () => {
    try {
      const response = await fetch(`/.netlify/functions/api-ai/history?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setState(prev => ({ 
            ...prev, 
            messages: data.messages,
            sessionId: data.metadata?.sessionId || prev.sessionId 
          }));
          setShowWelcome(false);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim() || state.isTyping) return;
    
    const userMessage: AIChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...state.messages, userMessage];
    setState(prev => ({ 
      ...prev, 
      messages: newMessages, 
      isTyping: true, 
      error: null 
    }));
    setInputValue('');
    setShowWelcome(false);
    
    // Check for crisis indicators locally first
    const crisisAnalysis = enhancedCrisisDetectionService.analyzeCrisisContent(userMessage.text);
    if (crisisAnalysis.hasCrisisIndicators && 
        (crisisAnalysis.severityLevel === 'high' || crisisAnalysis.severityLevel === 'critical')) {
      setState(prev => ({ ...prev, crisisDetected: true }));
    }
    
    try {
      const response = await fetch('/.netlify/functions/api-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          userId,
          provider: state.provider
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      const aiMessage: AIChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.metadata
      };
      
      setState(prev => ({ 
        ...prev, 
        messages: [...newMessages, aiMessage],
        isTyping: false,
        crisisDetected: data.metadata?.crisisDetected || prev.crisisDetected
      }));
      
      // Save to history
      await fetch('/.netlify/functions/api-ai/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...newMessages, aiMessage]
        })
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      setState(prev => ({ 
        ...prev, 
        isTyping: false,
        error: 'Unable to connect to AI service. Please try again.'
      }));
    }
  };
  
  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      try {
        await fetch('/.netlify/functions/api-ai/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        setState(prev => ({
          ...prev,
          messages: [],
          crisisDetected: false,
          sessionId: crypto.randomUUID()
        }));
        setShowWelcome(true);
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };
  
  const switchProvider = (newProvider: 'openai' | 'claude') => {
    setState(prev => ({ ...prev, provider: newProvider }));
    setShowOptions(false);
  };
  
  const quickActions = [
    "I'm feeling anxious",
    "I need someone to talk to",
    "Help me understand my emotions",
    "I want to practice mindfulness"
  ];
  
  return (
    <div className={`ai-chat-interface ai-chat-theme-${theme}`}>
      {/* Crisis Alert Banner */}
      {state.crisisDetected && (
        <CrisisAlert 
          show={true}
          severity="high"
          message="We've detected you may be going through a difficult time. Support is available."
          actions={['Contact Crisis Hotline', 'View Resources']}
          resources={['988 Suicide & Crisis Lifeline', 'Crisis Text Line']}
          emergencyMode={false}
          onDismiss={() => setState(prev => ({ ...prev, crisisDetected: false }))}
          onClose={() => setState(prev => ({ ...prev, crisisDetected: false }))}
        />
      )}
      
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <div className="ai-chat-avatar">
            <AICompanionIcon />
          </div>
          <div className="ai-chat-header-info">
            <h3>AI Support Companion</h3>
            <div className="ai-chat-status">
              <span className="ai-chat-status-dot"></span>
              <span>Always here for you</span>
              <AIAssistanceIndicator variant="compact" />
            </div>
          </div>
        </div>
        
        <div className="ai-chat-header-actions">
          <button 
            className="ai-chat-action-btn"
            onClick={() => setShowOptions(!showOptions)}
            aria-label="More options"
          >
            <MoreIcon />
          </button>
          {onClose && (
            <button 
              className="ai-chat-action-btn"
              onClick={onClose}
              aria-label="Close chat"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Options Dropdown */}
        {showOptions && (
          <div className="ai-chat-options">
            <div className="ai-chat-option-group">
              <label>AI Provider:</label>
              <button 
                className={state.provider === 'openai' ? 'active' : ''}
                onClick={() => switchProvider('openai')}
              >
                OpenAI GPT-4
              </button>
              <button 
                className={state.provider === 'claude' ? 'active' : ''}
                onClick={() => switchProvider('claude')}
              >
                Claude 3
              </button>
            </div>
            <button className="ai-chat-option-btn" onClick={clearChat}>
              <RefreshIcon /> Clear Conversation
            </button>
          </div>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="ai-chat-messages">
        {/* Welcome Screen */}
        {showWelcome && state.messages.length === 0 && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-welcome-icon">
              <SparkleIcon />
            </div>
            <h2>Hello, {userName}!</h2>
            <p>I&apos;m here to listen and support you through whatever you&apos;re experiencing.</p>
            
            <div className="ai-chat-features">
              <div className="ai-chat-feature">
                <LockIcon />
                <span>Private & Confidential</span>
              </div>
              <div className="ai-chat-feature">
                <AICompanionIcon />
                <span>24/7 Support</span>
              </div>
              <div className="ai-chat-feature">
                <WarningIcon />
                <span>Crisis Detection</span>
              </div>
            </div>
            
            <div className="ai-chat-quick-actions">
              <p>Quick conversation starters:</p>
              <div className="ai-chat-quick-buttons">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="ai-chat-quick-btn"
                    onClick={() => {
                      setInputValue(action);
                      inputRef.current?.focus();
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Message List */}
        <div className="ai-chat-message-list">
          {state.messages.map((message) => (
            <div 
              key={message.id} 
              className={`ai-chat-message ai-chat-message-${message.sender}`}
            >
              <div className="ai-chat-message-avatar">
                {message.sender === 'ai' ? <AICompanionIcon /> : userName.charAt(0).toUpperCase()}
              </div>
              <div className="ai-chat-message-content">
                <div className="ai-chat-message-bubble">
                  {message.text}
                  {message.metadata?.crisisDetected && (
                    <div className="ai-chat-crisis-flag">
                      <WarningIcon /> Crisis indicators detected
                    </div>
                  )}
                </div>
                <span className="ai-chat-message-time">
                  {formatChatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {state.isTyping && (
            <div className="ai-chat-message ai-chat-message-ai">
              <div className="ai-chat-message-avatar">
                <AICompanionIcon />
              </div>
              <div className="ai-chat-message-content">
                <TypingIndicator />
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {state.error && (
            <div className="ai-chat-error">
              <WarningIcon /> {state.error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="ai-chat-input-area">
        <AppTextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message here... (Shift+Enter for new line)"
          disabled={state.isTyping}
          rows={3}
          maxLength={1000}
          className="ai-chat-input"
        />
        
        <div className="ai-chat-input-actions">
          <span className="ai-chat-char-count">
            {inputValue.length}/1000
          </span>
          <AppButton
            onClick={sendMessage}
            disabled={!inputValue.trim() || state.isTyping}
            variant="primary"
            className="ai-chat-send-btn"
          >
            <SendIcon /> Send
          </AppButton>
        </div>
        
        <div className="ai-chat-privacy-note">
          <LockIcon />
          <span>Your conversation is private and encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;