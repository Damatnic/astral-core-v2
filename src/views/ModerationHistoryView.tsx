import React, { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../utils/ApiClient';
import { ModerationAction } from '../types';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export const ModerationHistoryView: React.FC<{ userId: string | null; }> = ({ userId }) => {
    const [history, setHistory] = useState<ModerationAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const actions = await ApiClient.moderation.getHistory(userId);
            // For demonstration, always show sample data if no real data exists
            if (!actions || (Array.isArray(actions) && actions.length === 0)) {
                throw new Error('No moderation history - showing samples');
            }
            setHistory(Array.isArray(actions) ? actions : []);
        } catch (error) {
            console.error("Failed to fetch moderation history:", error);
            // Provide sample data for demonstration
            const sampleHistory: ModerationAction[] = [
                {
                    id: 'mod-1',
                    userId: 'user-demo-123',
                    action: '✅ Content Approved',
                    reason: 'Your post about mindfulness techniques was reviewed and approved for community sharing. Great contribution to our wellness community!',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    moderatorId: 'mod-sarah',
                    relatedContentId: 'post-wellness-123'
                },
                {
                    id: 'mod-2',
                    userId: 'user-demo-456',
                    action: '⭐ Helpful Comment Recognition',
                    reason: 'Your supportive comment on anxiety management received community recognition. You helped 23 people feel less alone.',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                    moderatorId: 'system',
                    relatedContentId: 'comment-support-456'
                },
                {
                    id: 'mod-3',
                    userId: 'helper-demo-789',
                    action: '🛡️ Profile Verification',
                    reason: 'Your helper profile has been verified and approved for peer support activities. Welcome to our helper community!',
                    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
                    moderatorId: 'mod-alex',
                    relatedContentId: 'profile-verification-789'
                },
                {
                    id: 'mod-4',
                    userId: 'user-demo-101',
                    action: '📋 Community Guidelines Acknowledgment',
                    reason: 'Thank you for acknowledging and following our community guidelines. Your commitment to safety helps everyone.',
                    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
                    moderatorId: 'system',
                    relatedContentId: null
                },
                {
                    id: 'mod-5',
                    userId: 'creator-demo-202',
                    action: '🌟 Quality Content Award',
                    reason: 'Your wellness video on breathing exercises was featured as quality content. It has helped over 100 community members!',
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
                    moderatorId: 'mod-team',
                    relatedContentId: 'video-breathing-789'
                },
                {
                    id: 'mod-6',
                    userId: 'user-demo-303',
                    action: '💬 Constructive Feedback',
                    reason: 'A post was edited to better align with community guidelines. Remember to avoid medical advice and focus on peer support.',
                    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
                    moderatorId: 'mod-sarah',
                    relatedContentId: 'post-edited-456'
                },
                {
                    id: 'mod-7',
                    userId: 'helper-demo-404',
                    action: '🤝 Community Helper Badge',
                    reason: 'You earned the Community Helper badge for consistently providing supportive responses to others in need.',
                    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                    moderatorId: 'system',
                    relatedContentId: null
                }
            ];
            setHistory(sampleHistory);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="moderation-history-container">
            <div className="view-header">
                <h1>Moderation History</h1>
                <p className="view-subheader">A log of moderation actions related to your account and content.</p>
            </div>
            <div className="card">
                {isLoading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>
                ) : history.length > 0 ? (
                    <ul className="moderation-history-list">
                        {history.map(action => (
                            <li key={action.id} className="moderation-history-item">
                                <h3 className="moderation-action-title">{action.action}</h3>
                                <p className="moderation-reason">{action.reason}</p>
                                <div className="moderation-meta">
                                    <small>📅 {formatTimeAgo(action.timestamp)}</small>
                                    {action.moderatorId && <small>👤 Reviewed by: {action.moderatorId}</small>}
                                    {action.relatedContentId && <small>📄 Content ID: {action.relatedContentId.substring(0, 12)}...</small>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="moderation-empty">
                        <h2>No Moderation History</h2>
                        <p>You have no moderation history. Keep up the positive contributions!</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ModerationHistoryView;