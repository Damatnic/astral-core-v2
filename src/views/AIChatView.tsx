

import React, { useState, useEffect, useRef } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { AIChatSession } from '../types';
import { BackIcon, SendIcon, AICompanionIcon, SparkleIcon, LockIcon  } from '../components/icons.dynamic';
import { TypingIndicator } from '../components/TypingIndicator';
import { formatChatTimestamp } from '../utils/formatTimeAgo';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AIAssistanceIndicator } from '../components/AIAssistanceIndicator';
import { TherapistSelector, Therapist } from '../components/TherapistSelector';

export const AIChatView: React.FC<{
    session: AIChatSession;
    onSendMessage: (text: string) => Promise<void>;
    onClose: () => void;
}> = ({ session, onSendMessage, onClose }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [showTherapistSelector, setShowTherapistSelector] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages, session.isTyping]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setIsSending(true);
        const textToSend = newMessage;
        setNewMessage('');
        await onSendMessage(textToSend);
        setIsSending(false);
    };

    const handleAcceptDisclaimer = () => {
        setShowDisclaimer(false);
        setShowTherapistSelector(true);
    };

    const handleSelectTherapist = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setShowTherapistSelector(false);
    };

    const handleChangeTherapist = () => {
        setShowTherapistSelector(true);
    };

    if (showDisclaimer) {
        return (
            <>
                <style>{`
                    .ai-disclaimer-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(10px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease-out;
                    }
                    
                    .ai-disclaimer-modal {
                        background: var(--card-bg);
                        border-radius: 1.5rem;
                        padding: 2.5rem;
                        max-width: 560px;
                        width: 90%;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        border: 1px solid var(--border-color);
                        animation: modalZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes modalZoomIn {
                        from {
                            transform: scale(0.9);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                    
                    .ai-disclaimer-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .ai-disclaimer-icon {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 1rem;
                        padding: 1rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.5rem;
                    }
                    
                    .ai-disclaimer-title {
                        flex: 1;
                    }
                    
                    .ai-disclaimer-title h2 {
                        margin: 0;
                        font-size: 1.5rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    
                    .ai-disclaimer-subtitle {
                        color: var(--text-secondary);
                        font-size: 0.875rem;
                        margin-top: 0.25rem;
                    }
                    
                    .ai-disclaimer-body {
                        margin: 1.5rem 0;
                    }
                    
                    .ai-disclaimer-body p {
                        line-height: 1.6;
                        color: var(--text-primary);
                        margin-bottom: 1rem;
                    }
                    
                    .ai-disclaimer-list {
                        background: rgba(102, 126, 234, 0.05);
                        border-left: 3px solid #667eea;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        margin: 1.5rem 0;
                    }
                    
                    .ai-disclaimer-list ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .ai-disclaimer-list li {
                        padding: 0.5rem 0;
                        color: var(--text-primary);
                        display: flex;
                        align-items: flex-start;
                    }
                    
                    .ai-disclaimer-list li:before {
                        content: '⚠';
                        color: #f59e0b;
                        margin-right: 0.75rem;
                        font-size: 1.1rem;
                    }
                    
                    .ai-disclaimer-warning {
                        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1));
                        border: 1px solid rgba(245, 158, 11, 0.3);
                        border-radius: 0.75rem;
                        padding: 1rem;
                        margin: 1.5rem 0;
                    }
                    
                    .ai-disclaimer-warning p {
                        margin: 0;
                        color: var(--text-primary);
                        font-size: 0.9rem;
                    }
                    
                    .ai-disclaimer-actions {
                        display: flex;
                        gap: 1rem;
                        margin-top: 2rem;
                    }
                    
                    .ai-disclaimer-actions button {
                        flex: 1;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.75rem;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }
                    
                    .ai-disclaimer-actions .btn-back {
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        border: 1px solid var(--border-color);
                    }
                    
                    .ai-disclaimer-actions .btn-back:hover {
                        background: var(--bg-tertiary);
                    }
                    
                    .ai-disclaimer-actions .btn-continue {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                    }
                    
                    .ai-disclaimer-actions .btn-continue:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.3);
                    }
                    
                    @media (max-width: 768px) {
                        .ai-disclaimer-overlay {
                            padding: 1rem;
                            justify-content: center;
                        }
                        
                        .ai-disclaimer-modal {
                            margin-right: 0;
                            padding: 1.5rem;
                        }
                        
                        .ai-disclaimer-actions {
                            flex-direction: column;
                        }
                    }
                `}</style>
                <div className="ai-disclaimer-overlay">
                    <div className="ai-disclaimer-modal">
                        <div className="ai-disclaimer-header">
                            <div className="ai-disclaimer-icon">
                                <AICompanionIcon />
                            </div>
                            <div className="ai-disclaimer-title">
                                <h2>Astral AI Companion</h2>
                                <div className="ai-disclaimer-subtitle">Your supportive AI listener</div>
                            </div>
                        </div>
                        
                        <div className="ai-disclaimer-body">
                            <p>You're about to connect with Astral AI, an automated companion designed to provide a safe, judgment-free space for you to express your thoughts and feelings.</p>
                            
                            <div className="ai-disclaimer-list">
                                <ul>
                                    <li>This is an AI assistant, not a human or licensed therapist</li>
                                    <li>Designed for supportive listening and emotional exploration</li>
                                    <li>Cannot provide medical advice or handle crisis situations</li>
                                </ul>
                            </div>
                            
                            <div className="ai-disclaimer-warning">
                                <p>💡 <strong>Need immediate help?</strong> Please use our "Get Help Now" resources for crisis support and professional assistance.</p>
                            </div>
                            
                            <p>By continuing, you acknowledge that you understand the nature and limitations of this AI companion.</p>
                        </div>
                        
                        <div className="ai-disclaimer-actions">
                            <button className="btn-back" onClick={onClose}>Go Back</button>
                            <button className="btn-continue" onClick={handleAcceptDisclaimer}>I Understand, Continue</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (showTherapistSelector) {
        return (
            <div className="therapist-selection-container">
                <div className="therapist-selection-header">
                    <button 
                        onClick={onClose}
                        className="back-button"
                        aria-label="Go back"
                    >
                        <BackIcon />
                    </button>
                    <h1>AI Therapy</h1>
                </div>
                <TherapistSelector 
                    onSelectTherapist={handleSelectTherapist}
                    selectedTherapist={selectedTherapist}
                />
            </div>
        );
    }

    if (!selectedTherapist) {
        setShowTherapistSelector(true);
        return null;
    }

    return (
        <div className="ai-chat-view">
            <div className="ai-chat-header">
                <button onClick={onClose} className="ai-chat-back-btn">
                    <BackIcon />
                    <span>Back</span>
                </button>
                <div className="ai-chat-header-center">
                    <div className="ai-chat-avatar-wrapper">
                        <div className="ai-chat-avatar therapist-avatar-chat">
                            <span className="therapist-emoji-chat">{selectedTherapist.avatar}</span>
                        </div>
                        <div className="ai-chat-status-dot"></div>
                    </div>
                    <div className="ai-chat-header-info">
                        <h2>{selectedTherapist.name}</h2>
                        <p className="ai-chat-subtitle">
                            <SparkleIcon />
                            <span>{selectedTherapist.specialty}</span>
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleChangeTherapist}
                    className="change-therapist-btn"
                    title="Change therapist"
                >
                    <SparkleIcon />
                </button>
                <AIAssistanceIndicator variant="compact" />
            </div>
            
            <div className="ai-chat-messages">
                <div className="ai-chat-messages-inner">
                    <div className="ai-chat-safe-space">
                        <LockIcon />
                        <span>Safe & Confidential Space</span>
                    </div>
                    
                    {selectedTherapist && (
                        <div className="ai-therapist-card">
                            <div className="ai-therapist-avatar">
                                {selectedTherapist.name.charAt(0)}
                            </div>
                            <div className="ai-therapist-info">
                                <h3>{selectedTherapist.name}</h3>
                                <p>{selectedTherapist.bio}</p>
                            </div>
                        </div>
                    )}
                    
                    {session.messages.length === 0 && (
                        <div className="ai-chat-welcome">
                            <div className="ai-chat-welcome-icon">
                                <AICompanionIcon />
                            </div>
                            <h3>Welcome to your safe space</h3>
                            <p>I'm here to listen and help you explore your thoughts and feelings. Everything you share is private and judgment-free.</p>
                            <div className="ai-chat-suggestions">
                                <button className="ai-chat-suggestion" onClick={() => onSendMessage("I'm feeling stressed")}>
                                    I'm feeling stressed
                                </button>
                                <button className="ai-chat-suggestion" onClick={() => onSendMessage("I need someone to talk to")}>
                                    I need someone to talk to
                                </button>
                                <button className="ai-chat-suggestion" onClick={() => onSendMessage("Help me understand my emotions")}>
                                    Help me understand my emotions
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {(session.messages || []).map(msg => (
                        <div key={msg.id} className={`ai-message-group ${msg.sender}`}>
                            <div className="ai-message-wrapper">
                                {msg.sender === 'ai' && (
                                    <div className="ai-message-avatar">
                                        <AICompanionIcon />
                                    </div>
                                )}
                                <div className="ai-message-content">
                                    <div className="ai-message-bubble markdown-content">
                                        <LazyMarkdown className="ai-message" autoLoad={true}>
                                            {msg.text}
                                        </LazyMarkdown>
                                    </div>
                                    <span className="ai-message-timestamp">
                                        {formatChatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {session.isTyping && (
                        <div className="ai-message-group ai">
                            <div className="ai-message-wrapper">
                                <div className="ai-message-avatar">
                                    <AICompanionIcon />
                                </div>
                                <div className="ai-message-content">
                                    <TypingIndicator />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div className="ai-chat-composer">
                <div className="ai-chat-composer-inner">
                    <AppInput
                        type="text"
                        placeholder="Share what's on your mind..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                        disabled={isSending || session.isTyping}
                        className="ai-chat-input"
                        containerStyle={{flexGrow: 1, marginBottom: 0}}
                    />
                    <AppButton 
                        onClick={handleSend} 
                        disabled={!newMessage.trim() || isSending || session.isTyping} 
                        isLoading={isSending} 
                        className="ai-chat-send-btn"
                        variant="primary"
                    >
                        {!isSending && <SendIcon />}
                    </AppButton>
                </div>
                <p className="ai-chat-privacy-note">
                    <LockIcon />
                    Your conversation is private and secure
                </p>
            </div>
        </div>
    );
};

// Route wrapper component for use in AppRoutes
export const AIChatRoute: React.FC = () => {
    const [session, setSession] = useState<AIChatSession>({
        messages: [],
        isTyping: false
    });

    const handleSendMessage = async (text: string) => {
        // Implementation would go here
        // For now, just add the message to session
        const newMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user' as const,
            text,
            timestamp: new Date().toISOString()
        };
        
        setSession(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage]
        }));
    };

    const handleClose = () => {
        // Navigate back or close - could use router navigation here
        window.history.back();
    };

    return (
        <AIChatView 
            session={session}
            onSendMessage={handleSendMessage}
            onClose={handleClose}
        />
    );
};

export default AIChatRoute;