import React, { useState, useEffect, useRef } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { ChatSession, Dilemma } from '../types';
import { BackIcon, SendIcon, HeartIcon, CrisisIcon  } from '../components/icons.dynamic';
import { TypingIndicator } from '../components/TypingIndicator';
import { formatChatTimestamp } from '../utils/formatTimeAgo';
import { GuidancePanel } from '../components/GuidancePanel';
import { AppButton } from '../components/AppButton';
import { MobileAppInput, MobileChatComposer, useMobileViewport } from '../components/MobileKeyboardHandler';
import { ApiClient } from '../utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import CulturalCrisisAlert from '../components/CulturalCrisisAlert';
import { useNotification } from '../contexts/NotificationContext';
import { useChatStore } from '../stores/chatStore';
import { useSessionStore } from '../stores/sessionStore';
import { isError } from '../types/common';


export const ChatView: React.FC<{
    session: ChatSession;
    dilemma: Dilemma;
    onViewHelperProfile: (helperId: string) => void;
}> = ({ session, dilemma, onViewHelperProfile }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { userToken, helperProfile } = useAuth();
    const [showBreakPrompt, setShowBreakPrompt] = useState(false);
    const { addToast, showConfirmationModal } = useNotification();
    
    const { sendMessage, setTyping, closeChat, guidance, dismissGuidance } = useChatStore();
    const { helpSessions, toggleFavorite } = useSessionStore();
    
    // Mobile keyboard handling
    useMobileViewport();
    
    const perspective = session.perspective;
    const helperForChat = session.helper;
    const helpSessionDetails = helpSessions.find(hs => hs.id === session.helpSessionId);
    const isFavorited = helpSessionDetails?.isFavorited ?? false;
    
    // State for Emergency Hold Button
    const [, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Simple break prompt logic
        if (session.messages.length > 20 && session.messages.length % 10 === 0) {
            setShowBreakPrompt(true);
            setTimeout(() => setShowBreakPrompt(false), 10000);
        }
    }, [session.messages, session.isTyping]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        sendMessage(session.dilemmaId, newMessage);
        setNewMessage('');
        setTyping(session.dilemmaId, false);
    };

    const handleBlockUser = async () => {
        const blockerId = perspective === 'helper' ? helperProfile?.id : userToken;
        const blockedId = perspective === 'helper' ? dilemma.userToken : dilemma.assignedHelperId;

        if (!blockerId || !blockedId) {
            addToast("Could not identify users to block.", 'error');
            return;
        }
        
        showConfirmationModal({
            title: 'Block User?',
            message: 'Are you sure you want to block this user? You will no longer see their posts or messages.',
            confirmText: 'Block',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await ApiClient.userBlocking.blockUser(blockerId, blockedId);
                    addToast("User has been blocked. This chat will now close.", 'info');
                    closeChat(dilemma.id);
                } catch (err) {
                    const errorMessage = isError(err) ? err.message : "Failed to block user.";
                    addToast(errorMessage, 'error');
                }
            }
        });
    }

    const handleFavoriteClick = () => {
        if (session.helpSessionId) {
            toggleFavorite(session.helpSessionId);
        }
    };
    
    // --- Emergency Button Logic ---
    const triggerEmergency = () => {
        showConfirmationModal({
            title: 'Confirm Emergency',
            message: 'Are you in immediate danger? This will attempt to get your location and send an alert.',
            confirmText: 'YES, SEND ALERT',
            confirmVariant: 'danger',
            onConfirm: () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        ApiClient.emergency.trigger(dilemma.id, { latitude, longitude });
                        addToast("Emergency alert sent with your approximate location.", 'success');
                    },
                    (error) => {
                        let errorMessage = 'Could not get your location. ';
                        
                        // Provide specific error messages based on error code
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage += 'Location access was denied. Please enable location permissions in your browser settings.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage += 'Location information is unavailable. Your device may not support location services.';
                                break;
                            case error.TIMEOUT:
                                errorMessage += 'Location request timed out. Please check your internet connection.';
                                break;
                            default:
                                errorMessage += 'An unknown error occurred while getting your location.';
                        }
                        
                        console.error("Geolocation error:", error.code, error.message);
                        
                        showConfirmationModal({
                            title: 'Location Access Issue',
                            message: `${errorMessage}\n\nWould you like to send the emergency alert without location data?`,
                            confirmText: 'Yes, Send Anyway',
                            cancelText: 'Cancel',
                            confirmVariant: 'danger',
                            onConfirm: () => {
                                ApiClient.emergency.trigger(dilemma.id)
                                    .then(() => {
                                        addToast("Emergency alert sent successfully without location data.", 'warning');
                                    })
                                    .catch((err) => {
                                        console.error("Failed to send emergency alert:", err);
                                        addToast("Failed to send emergency alert. Please try again or call 911.", 'error');
                                    });
                            }
                        });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        });
    };

    const startHold = () => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        setIsHolding(true);
        const startTime = Date.now();
        const duration = 3000;

        const animateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setHoldProgress(progress);
            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animateProgress);
            }
        };
        animationFrameRef.current = requestAnimationFrame(animateProgress);

        holdTimerRef.current = window.setTimeout(() => {
            triggerEmergency();
            endHold();
        }, duration);
    };

    const endHold = () => {
        setIsHolding(false);
        setHoldProgress(0);
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const getHeaderTitle = () => {
        if (perspective === 'helper') return 'Chat with Seeker';
        if (helperForChat) return `Chat with ${helperForChat.displayName}`;
        return 'Waiting for a helper...';
    };

    const getHeaderSubTitle = () => {
         if (perspective === 'helper') return `About: "${dilemma.content.substring(0, 30)}..."`;
         if (helperForChat) return `Reputation: ${helperForChat.reputation.toFixed(1)}/5.0`;
         return `Your conversation about "${dilemma.content.substring(0, 30)}..."`;
    }

    return (
        <div className="chat-view">
            <div className="chat-header">
                <button onClick={() => closeChat(dilemma.id)} className="back-btn"><BackIcon /></button>
                <div className="chat-header-info">
                    <h2>
                        {helperForChat && perspective !== 'helper' ? (
                            <button 
                                type="button"
                                onClick={() => onViewHelperProfile(helperForChat.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    font: 'inherit',
                                    padding: 0
                                }}
                            >
                                {getHeaderTitle()}
                            </button>
                        ) : getHeaderTitle()}
                    </h2>
                    <p>{getHeaderSubTitle()}</p>
                </div>
                <div className="chat-header-actions" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    {perspective === 'seeker' && session.helpSessionId && (
                         <AppButton 
                            variant="ghost" 
                            className={`btn-sm btn-support ${isFavorited ? 'supported' : ''}`}
                            onClick={handleFavoriteClick}
                            style={{padding: '0.5rem'}}
                            aria-label={isFavorited ? 'Unfavorite this helper' : 'Favorite this helper'}
                            icon={<HeartIcon />}
                        />
                    )}
                    <AppButton variant="secondary" onClick={handleBlockUser} className="btn-sm">Block User</AppButton>
                </div>
            </div>
             {showBreakPrompt && (
                <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-warning)', color: 'var(--bg-primary)', textAlign: 'center' }}>
                    This is a long conversation. Remember to take breaks!
                </div>
            )}
            <div className="chat-messages">
                 {guidance?.isCrisis && perspective === 'seeker' && (
                   <CulturalCrisisAlert
                     analysisText={session.messages.slice(-3).map(m => m.text).join(' ')}
                     show={true}
                     userType="seeker"
                     onCrisisDetected={(_result) => {/* Crisis detected in chat */}}
                     onDismiss={() => dismissGuidance()}
                   />
                 )}
                 {session.messages.map(msg => (
                    <div key={msg.id} className={`message-group ${msg.sender}`}>
                        <div className="message-bubble-wrapper">
                             <div className="message-bubble markdown-content">
                                <LazyMarkdown className="chat-message" autoLoad={true}>
                                    {msg.text}
                                </LazyMarkdown>
                            </div>
                        </div>
                        <span className="message-timestamp">{formatChatTimestamp(msg.timestamp)}</span>
                    </div>
                ))}
                {session.isTyping && <TypingIndicator />}
                 <div ref={messagesEndRef} />
            </div>
            
            <MobileChatComposer style={{position: 'relative'}}>
                {perspective === 'seeker' && (
                    <button
                        className="btn btn-danger"
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        style={{
                            position: 'absolute',
                            right: 'calc(100% + 1rem)', /* Position left of the input area */
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 'auto',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            overflow: 'hidden',
                            minHeight: '44px', // Touch target size
                            borderRadius: '20px'
                        }}
                    >
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.3)', width: `${holdProgress * 100}%` }}></div>
                        <CrisisIcon />
                        <span style={{position: 'relative'}}>Emergency</span>
                    </button>
                )}
                <MobileAppInput
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value) {
                            setTyping(session.dilemmaId, true);
                        } else {
                             setTyping(session.dilemmaId, false);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="chat-input"
                    containerStyle={{ flexGrow: 1, marginBottom: 0 }}
                    style={{ 
                        fontSize: '16px', // Prevent zoom on iOS
                        padding: '12px 16px',
                        borderRadius: '20px'
                    }}
                />
                <AppButton 
                    onClick={handleSend} 
                    disabled={!newMessage.trim()} 
                    className="chat-send-btn"
                    style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        marginLeft: '8px'
                    }}
                >
                    <SendIcon />
                </AppButton>
            </MobileChatComposer>

            {/* AI Guidance Panel - Placed at the end to overlay correctly with CSS */}
            {perspective === 'helper' && guidance && guidance.dilemmaId === session.dilemmaId && (
                <GuidancePanel guidance={guidance} onDismiss={dismissGuidance} />
            )}
        </div>
    );
};

export default ChatView;