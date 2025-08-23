import React, { useState, useEffect } from 'react';
import { LazyMarkdown } from './LazyMarkdown';
import { HeartIcon, VideoIcon, ThumbsUpIcon } from './icons.dynamic';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { Dilemma } from '../types';
import { AppButton } from './AppButton';
import { Card } from './Card';
import { useSwipeRef } from '../hooks/useSwipeGesture';

interface PostCardProps {
    dilemma: Dilemma; 
    onToggleSupport?: (dilemmaId: string) => void; 
    onStartChat?: (dilemmaId: string) => void; 
    onStartVideoChat?: (dilemmaId: string) => void;
    onReport?: (dilemmaId: string) => void;
    onDismissReport?: (dilemmaId: string) => void;
    onRemovePost?: (dilemmaId: string) => void;
    onAcceptDilemma?: (dilemmaId: string) => void;
    onDeclineRequest?: (dilemmaId: string) => void;
    onResolve?: (dilemmaId: string) => void;
    onSummarize?: (dilemmaId: string) => void;
    hasUnread?: boolean;
    isHelperView?: boolean;
    isMyPostView?: boolean;
    filteredCategories?: string[];
    aiMatchReason?: string;
}

const getColorIndex = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 8);
};

const PostCardComponent: React.FC<PostCardProps> = (props) => {
    const { 
        dilemma, 
        onToggleSupport, 
        onStartChat, 
        onStartVideoChat,
        onReport, 
        onDismissReport,
        onRemovePost,
        onAcceptDilemma,
        onDeclineRequest,
        onResolve, 
        onSummarize,
        hasUnread, 
        isHelperView, 
        isMyPostView, 
        filteredCategories = [], 
        aiMatchReason 
    } = props;
    const [isRevealed, setIsRevealed] = useState(false);
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [isAnimatingSupport, setIsAnimatingSupport] = useState(false);
    const [swipeAction, setSwipeAction] = useState<string | null>(null);
    
    const isFiltered = filteredCategories.includes(dilemma.category) && !isRevealed;

    // Configure swipe gestures for quick actions
    const { ref: swipeRef } = useSwipeRef<HTMLDivElement>({
        threshold: 100,
        velocityThreshold: 0.5,
        onSwipeLeft: () => {
            if (!isHelperView && !isMyPostView) {
                setSwipeAction('support');
                setTimeout(() => {
                    handleSupportClick({} as React.MouseEvent<HTMLButtonElement>);
                    setSwipeAction(null);
                }, 150);
            }
        },
        onSwipeRight: () => {
            if (isHelperView && dilemma.status === 'active') {
                setSwipeAction('accept');
                setTimeout(() => {
                    onAcceptDilemma?.(dilemma.id);
                    setSwipeAction(null);
                }, 150);
            }
        },
    });

    useEffect(() => {
        setIsRevealed(false);
    }, [filteredCategories]);

    const handleSupportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (onToggleSupport && !dilemma.isSupported) {
            onToggleSupport(dilemma.id);
            setIsAnimatingSupport(true);
            setTimeout(() => setIsAnimatingSupport(false), 300); // Duration of the animation
        }
        if (onStartChat) {
            onStartChat(dilemma.id);
        }
    };

    if (isFiltered) {
        return (
            <Card className="post-card" style={{ filter: 'blur(8px)', cursor: 'pointer' }} onClick={() => setIsRevealed(true)}>
                <div className="post-header">
                    <div className="post-user-info">
                        <div className={`avatar avatar-color-${getColorIndex(dilemma.userToken)}`}></div>
                        <span className="username">Anonymous User</span>
                    </div>
                    <div className="post-meta">
                        <span className="post-category">{dilemma.category}</span>
                        <div className="post-timestamp">{formatTimeAgo(dilemma.timestamp)}</div>
                    </div>
                </div>
                 <div className="post-content markdown-content" style={{textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)'}}>
                    <p>Content hidden based on your filter preferences.</p>
                    <p>Click to reveal.</p>
                </div>
            </Card>
        )
    }

    const renderHelperActions = () => {
        if (dilemma.status === 'direct_request') {
            return (
                <div className="form-actions-group">
                    <AppButton variant="success" className="btn-sm" onClick={() => onAcceptDilemma?.(dilemma.id)}>Accept Request</AppButton>
                    <AppButton variant="danger" className="btn-sm" onClick={() => onDeclineRequest?.(dilemma.id)}>Decline</AppButton>
                </div>
            );
        }

        if (dilemma.status === 'in_progress') {
             return (
                <div className="form-actions-group">
                    <AppButton variant="secondary" className={`btn-sm`} onClick={() => onStartChat?.(dilemma.id)} icon={<HeartIcon />}>
                        Chat with User
                    </AppButton>
                    {onStartVideoChat && <AppButton variant="secondary" className="btn-sm" onClick={() => onStartVideoChat(dilemma.id)} icon={<VideoIcon />}>
                        Video Chat
                    </AppButton>}
                </div>
            );
        }

        if (dilemma.isReported) {
             return (
                <div className="form-actions-group">
                    <AppButton variant="danger" className="btn-sm" onClick={() => onRemovePost?.(dilemma.id)}>Remove Post</AppButton>
                    <AppButton variant="secondary" className="btn-sm" onClick={() => onDismissReport?.(dilemma.id)}>Dismiss Report</AppButton>
                </div>
            );
        }
        
        return (
            <div className="form-actions-group">
                {!dilemma.summary && (
                    <AppButton variant="ghost" className="btn-sm" onClick={() => onSummarize?.(dilemma.id)} isLoading={dilemma.summaryLoading}>
                        Summarize
                    </AppButton>
                )}
                <AppButton variant="success" className="btn-sm" onClick={() => onAcceptDilemma?.(dilemma.id)} icon={<ThumbsUpIcon />}>
                    Accept Dilemma
                </AppButton>
            </div>
        );
    }

    return (
        <div 
            ref={swipeRef}
            className={`post-card-container touch-optimized ${swipeAction ? 'swipe-' + swipeAction : ''}`}
        >
            <Card className="post-card">
                <div className="post-header">
                    <div className="post-user-info">
                        <div className={`avatar avatar-color-${getColorIndex(dilemma.userToken)}`}></div>
                        <span className="username">Anonymous User</span>
                    </div>
                    <div className="post-meta">
                         <span className="post-category">{dilemma.category}</span>
                         <div className="post-timestamp">{formatTimeAgo(dilemma.timestamp)}</div>
                    </div>
                </div>
                {dilemma.isReported && isHelperView && (
                    <div className="report-reason-display">Reported for: <strong>{dilemma.reportReason}</strong></div>
                )}
                 {aiMatchReason && (
                    <div className="ai-match-reason">
                        ✨ {aiMatchReason}
                    </div>
                )}
                <div className="post-content markdown-content">
                    <LazyMarkdown className="post-markdown" autoLoad={true}>
                        {dilemma.content}
                    </LazyMarkdown>
                </div>
                
                {isHelperView && dilemma.summary && (
                    <div className="summary-container">
                        <button 
                            onClick={() => setIsSummaryVisible(!isSummaryVisible)} 
                            className="btn touch-optimized"
                            style={{
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                                padding: '12px 0',
                                font: 'inherit',
                                fontSize: '1.1em',
                                fontWeight: 'bold',
                                minHeight: '44px'
                            }}
                            aria-expanded={isSummaryVisible}
                        >
                            AI Summary {isSummaryVisible ? '▼' : '►'}
                        </button>
                        {isSummaryVisible && (
                            <div className="summary-content markdown-content">
                                <LazyMarkdown className="summary-markdown">
                                    {dilemma.summary}
                                </LazyMarkdown>
                            </div>
                        )}
                    </div>
                )}

                <div className="post-actions">
                    {isHelperView ? (
                         renderHelperActions()
                    ) : (
                        <div className="form-actions-group" style={{width: '100%', justifyContent: 'space-between'}}>
                            <AppButton variant="secondary" className={`btn-sm btn-support ${dilemma.isSupported ? 'supported' : ''} ${isAnimatingSupport ? 'anim-pop' : ''}`} onClick={handleSupportClick} icon={<HeartIcon />}>
                                {hasUnread && <div className="notification-dot-small"></div>}
                                <span className="support-text">{isMyPostView ? "View Chat" : "Offer Support"}</span>
                                {!isMyPostView && <span className="support-count">{dilemma.supportCount > 0 ? dilemma.supportCount : ''}</span>}
                            </AppButton>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                            {isMyPostView && dilemma.status === 'in_progress' && onResolve && (
                                <AppButton variant="success" className="btn-sm" onClick={() => onResolve(dilemma.id)}>
                                    Mark as Resolved
                                </AppButton>
                            )}
                            <AppButton variant="secondary" className={`btn-sm btn-report ${dilemma.isReported ? 'reported' : ''}`} onClick={(e) => {e.stopPropagation(); onReport?.(dilemma.id)}} disabled={dilemma.isReported}>
                                {dilemma.isReported ? 'Reported' : 'Report'}
                            </AppButton>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            
            {/* Swipe hint overlay for mobile */}
            {swipeAction && (
                <div className={`swipe-hint swipe-hint-${swipeAction}`}>
                    {swipeAction === 'support' && '💝 Offering Support'}
                    {swipeAction === 'accept' && '✅ Accepting Dilemma'}
                </div>
            )}
        </div>
    );
};

export const PostCard = React.memo(PostCardComponent);
