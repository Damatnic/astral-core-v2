import React, { useState, useEffect, useRef } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { Dilemma, AIChatMessage } from '../types';
import { MAX_CONTENT_LENGTH, CATEGORIES } from '../constants';
import { ApiClient } from '../utils/ApiClient';
import { AppTextArea, AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SendIcon, AICompanionIcon  } from '../components/icons.dynamic';
import { TypingIndicator } from '../components/TypingIndicator';
import { Card } from '../components/Card';
import i18n from '../i18n';
import { useNotification } from '../contexts/NotificationContext';
import { detectCrisis } from '../utils/crisisDetection';
import { CrisisAlertBanner } from '../components/CrisisAlertBanner';
import { AIAssistanceIndicator } from '../components/AIAssistanceIndicator';

export const ShareView: React.FC<{
    onPostSubmit: (dilemma: Omit<Dilemma, 'id' | 'userToken' | 'supportCount' | 'isSupported' | 'isReported' | 'reportReason' | 'status' | 'assignedHelperId' | 'resolved_by_seeker' | 'requestedHelperId' | 'summary' | 'summaryLoading' | 'moderation' | 'aiMatchReason'>) => void;
    userToken: string | null;
}> = ({ onPostSubmit, userToken }) => {
    // Component State
    const [viewMode, setViewMode] = useState<'chat' | 'form'>('chat');
    
    // Hooks
    const { addToast } = useNotification();

    // Chat State
    const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Form State
    const [postContent, setPostContent] = useState('');
    const [postCategory, setPostCategory] = useState('Relationships');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);
    const [wasAIDrafted, setWasAIDrafted] = useState(false);
    
    // Crisis Detection State
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const [crisisSeverity, setCrisisSeverity] = useState<'low' | 'medium' | 'high'>('medium');

    // Initial AI message
    useEffect(() => {
        setIsAiTyping(true);
        setTimeout(() => {
             setChatMessages([
                { id: crypto.randomUUID(), sender: 'ai', text: i18n.t('ai_welcome'), timestamp: new Date().toISOString() }
            ]);
            setIsAiTyping(false);
        }, 1000);
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isAiTyping]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !userToken) return;

        const newUserMessage: AIChatMessage = {
            id: crypto.randomUUID(),
            sender: 'user',
            text: userInput,
            timestamp: new Date().toISOString()
        };
        
        const updatedMessages = [...chatMessages, newUserMessage];
        setChatMessages(updatedMessages);
        setUserInput('');
        setIsAiTyping(true);

        const systemInstruction = "You are Astral, a friendly and empathetic AI companion for a mental health peer support app. Your role is to help users articulate their thoughts and feelings so they can write a post for the community. You are NOT a therapist. Do not give advice. Ask open-ended questions, validate their feelings, and gently guide them to clarify their thoughts. Keep your responses concise and supportive.";

        try {
            const aiResponse = await ApiClient.ai.chat(updatedMessages, systemInstruction);
            const newAiMessage: AIChatMessage = {
                id: crypto.randomUUID(),
                sender: 'ai',
                text: aiResponse.response,
                timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, newAiMessage]);
        } catch (e) {
            console.error("AI chat error:", e);
            const errorMessage: AIChatMessage = {
                id: crypto.randomUUID(),
                sender: 'ai',
                text: "I'm having a little trouble connecting. Please try again in a moment.",
                timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleDraftPost = async () => {
        if (chatMessages.length <= 1) return; // Need more than just the initial AI message
        setIsDrafting(true);
        try {
            const { postContent: draftedContent, category: draftedCategory } = await ApiClient.ai.draftPostFromChat(chatMessages);
            setPostContent(draftedContent);
            setPostCategory(draftedCategory);
            setWasAIDrafted(true);
            setViewMode('form');
        } catch (e) {
             console.error("AI draft error:", e);
             addToast("Sorry, I couldn't draft a post right now. Please try again.", 'error');
        } finally {
            setIsDrafting(false);
        }
    };

    // Check for crisis content whenever post content changes
    useEffect(() => {
        if (postContent) {
            const crisisCheck = detectCrisis(postContent);
            if (crisisCheck.isCrisis && crisisCheck.severity !== 'low') {
                setShowCrisisAlert(true);
                setCrisisSeverity(crisisCheck.severity);
            }
        }
    }, [postContent]);

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!postContent.trim() || !userToken) return;
        
        // Final crisis check before submission
        const crisisCheck = detectCrisis(postContent);
        if (crisisCheck.isCrisis && crisisCheck.severity === 'high') {
            setShowCrisisAlert(true);
            setCrisisSeverity('high');
            // Still allow submission but ensure help resources are visible
        }
        
        setIsSubmitting(true);
        onPostSubmit({
            category: postCategory,
            content: postContent,
            timestamp: new Date().toISOString(),
        });
        // Reset state after submission
        setTimeout(() => {
             setPostContent('');
             setPostCategory('Relationships');
             setWasAIDrafted(false);
             setViewMode('chat');
             setChatMessages([
                { id: crypto.randomUUID(), sender: 'ai', text: "Your post has been shared! If you'd like to draft another one, just start chatting.", timestamp: new Date().toISOString() }
             ]);
             setIsSubmitting(false);
        }, 500);
    };

    const getCharCounterClass = () => {
        if (postContent.length > MAX_CONTENT_LENGTH) return 'error';
        if (postContent.length > MAX_CONTENT_LENGTH - 100) return 'warning';
        return '';
    };

    if (viewMode === 'chat') {
        return (
            <div className="chat-view" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                {showCrisisAlert && (
                    <CrisisAlertBanner 
                        show={showCrisisAlert}
                        severity={crisisSeverity}
                        onClose={() => setShowCrisisAlert(false)}
                    />
                )}
                 <div className="view-header" style={{flexShrink: 0, padding: '2.5rem 2.5rem 0 2.5rem', marginBottom: 0}}>
                    <h1>{i18n.t('share_your_thoughts')}</h1>
                    <p className="view-subheader">{i18n.t('chat_with_ai_prompt')}</p>
                </div>
                <div className="chat-messages" style={{flexGrow: 1, padding: '1.5rem'}}>
                    {chatMessages.map(msg => (
                         <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                            {msg.sender === 'ai' && <div className="avatar-ai"><AICompanionIcon /></div>}
                            <div className="message-bubble markdown-content">
                                {msg.sender === 'ai' && <AIAssistanceIndicator variant="compact" message="AI Companion" />}
                                <LazyMarkdown autoLoad={true}>{msg.text}</LazyMarkdown>
                            </div>
                        </div>
                    ))}
                    {isAiTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-composer" style={{flexShrink: 0}}>
                    <AppButton onClick={handleDraftPost} variant="secondary" isLoading={isDrafting} disabled={chatMessages.length <= 1} className="draft-btn">{i18n.t('draft_post_from_chat')}</AppButton>
                    <AppInput
                        type="text"
                        placeholder={i18n.t('chat_with_ai_here')}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isAiTyping && handleSendMessage()}
                        disabled={isAiTyping || isDrafting}
                        className="chat-input"
                        containerStyle={{ flexGrow: 1, marginBottom: 0 }}
                    />
                    <AppButton
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isAiTyping || isDrafting}
                        isLoading={isAiTyping}
                        className="chat-send-btn"
                    >
                        {!isAiTyping && <SendIcon />}
                    </AppButton>
                </div>
            </div>
        )
    }

    // Form View
    return (
        <>
            {showCrisisAlert && (
                <CrisisAlertBanner 
                    show={showCrisisAlert}
                    severity={crisisSeverity}
                    onClose={() => setShowCrisisAlert(false)}
                />
            )}
            <div className="view-header">
                <h1>{i18n.t('review_your_post')}</h1>
                <p className="view-subheader">{i18n.t('review_your_post_subheader')}</p>
            </div>
            <Card>
                {wasAIDrafted && (
                    <AIAssistanceIndicator 
                        variant="default" 
                        message="AI-Drafted Content"
                        className="mb-3"
                    />
                )}
                <form>
                    <div className="form-group">
                        <label htmlFor="category">{i18n.t('category')}</label>
                        <select id="category" className="form-control" value={postCategory} onChange={e => setPostCategory(e.target.value)}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <AppTextArea
                        label={i18n.t('your_anonymous_post')}
                        id="content"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        maxLength={MAX_CONTENT_LENGTH + 50}
                        aria-describedby="char-counter markdown-support"
                        footer={(
                            <>
                                <small id="markdown-support">Markdown supported.</small>
                                <div id="char-counter" className={`char-counter ${getCharCounterClass()}`}>{postContent.length} / {MAX_CONTENT_LENGTH}</div>
                            </>
                        )}
                    />
                    <div className="form-actions">
                        <AppButton onClick={() => setViewMode('chat')} variant="ghost" disabled={isSubmitting}>{i18n.t('back_to_chat')}</AppButton>
                        <AppButton
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!postContent.trim() || isSubmitting || postContent.length > MAX_CONTENT_LENGTH}
                            isLoading={isSubmitting}
                        >
                            {i18n.t('submit_anonymously')}
                        </AppButton>
                    </div>
                </form>
            </Card>
        </>
    );
};

export default ShareView;