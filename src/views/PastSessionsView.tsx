import React, { useState } from 'react';
import { LazyMarkdown } from '../components/LazyMarkdown';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AppButton } from '../components/AppButton';
import { KudosIcon, HeartIcon  } from '../components/icons.dynamic';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { useSessionStore } from '../stores/sessionStore';
import { EmptyState } from '../components/EmptyState';
import { MyPostsIcon  } from '../components/icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';

export const PastSessionsView: React.FC = () => {
    const { helpSessions, toggleFavorite, sendKudos, generateSeekerSummary } = useSessionStore();
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedSessionSummary, setSelectedSessionSummary] = useState('');
    const { addToast } = useNotification();

    const viewSummary = (summary: string) => {
        setSelectedSessionSummary(summary);
        setIsSummaryModalOpen(true);
    };

    const handleGenerateSummary = async (sessionId: string) => {
        try {
            await generateSeekerSummary(sessionId);
        } catch (error) {
            console.error(error);
            addToast('Failed to generate summary. Please try again later.', 'error');
        }
    };

    return (
    <>
        <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Chat Summary">
            <div className="markdown-content">
                <LazyMarkdown autoLoad={true}>{selectedSessionSummary}</LazyMarkdown>
            </div>
        </Modal>

        {helpSessions.length > 0 ? (
            <Card>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {helpSessions.map(session => (
                        <li key={session.id} className="setting-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                            <div>
                                <p style={{ fontWeight: 'bold' }}>Chat with {session.helperDisplayName}</p>
                                <small>
                                    {session.endedAt ? `Ended ${formatTimeAgo(session.endedAt)}` : `Started ${formatTimeAgo(session.startedAt)}`}
                                </small>
                            </div>
                            <div className="form-actions-group">
                                {session.summaryLoading ? (
                                    <div className="loading-spinner" style={{width: '16px', height: '16px', margin: '0 0.5rem'}}></div>
                                ) : session.summary ? (
                                    <AppButton variant="secondary" className="btn-sm" onClick={() => viewSummary(session.summary!)}>
                                        View Summary
                                    </AppButton>
                                ) : (
                                    <AppButton variant="ghost" className="btn-sm" onClick={() => handleGenerateSummary(session.id)}>
                                        Get AI Summary
                                    </AppButton>
                                )}
                                {session.endedAt && (
                                    <AppButton
                                        variant="secondary"
                                        className="btn-sm"
                                        onClick={() => sendKudos(session.id)}
                                        disabled={session.kudosGiven}
                                        style={{padding: '0.5rem', background: session.kudosGiven ? 'var(--success-background)' : undefined}}
                                        aria-label={session.kudosGiven ? 'Kudos already sent' : 'Send Kudos'}
                                        icon={<KudosIcon />}
                                    />
                                )}
                                <AppButton 
                                    variant="ghost" 
                                    className={`btn-sm btn-support ${session.isFavorited ? 'supported' : ''}`}
                                    onClick={() => toggleFavorite(session.id)}
                                    aria-label={session.isFavorited ? 'Unfavorite this helper' : 'Favorite this helper'}
                                     style={{padding: '0.5rem'}}
                                     icon={<HeartIcon />}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        ) : (
            <Card>
                <EmptyState
                    icon={<MyPostsIcon />}
                    title="No Past Sessions"
                    message="Your completed chat sessions with helpers will appear here."
                />
            </Card>
        )}
    </>
    );
};

export default PastSessionsView;