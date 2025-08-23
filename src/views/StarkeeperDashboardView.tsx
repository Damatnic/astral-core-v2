import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ViewHeader } from '../components/ViewHeader';
import { demoDataService } from '../services/demoDataService';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import '../styles/starkeeper-dashboard.css';

const getReactionEmoji = (reactionType: string) => {
    switch (reactionType) {
        case 'light': return '💡';
        case 'heart': return '❤️';
        case 'strength': return '💪';
        case 'hug': return '🤗';
        default: return '👍';
    }
};

export const StarkeeperDashboardView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'mood' | 'support' | 'community'>('overview');
    const [starkeeperData, setStarkeeperData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadStarkeeperData = async () => {
            setIsLoading(true);
            try {
                const data = demoDataService.getDemoData('user');
                setStarkeeperData(data);
            } catch (error) {
                console.error('Failed to load starkeeper data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStarkeeperData();
    }, []);

    if (isLoading) {
        return <div className="loading-spinner" />;
    }

    const renderOverviewTab = () => (
        <div className="starkeeper-overview">
            <Card className="welcome-card">
                <h3>🌟 Welcome back, {user?.name || 'Starkeeper'}!</h3>
                <p>Your personal wellness journey continues. You're doing great by being here.</p>
                <div className="quick-actions">
                    <AppButton onClick={() => setActiveTab('journal')} variant="primary">✍️ Write in Journal</AppButton>
                    <AppButton onClick={() => setActiveTab('mood')} variant="secondary">😊 Log Mood</AppButton>
                    <AppButton onClick={() => setActiveTab('support')} variant="success">🤝 Find Support</AppButton>
                </div>
            </Card>

            <div className="overview-stats">
                <Card className="stat-card">
                    <h4>📖 Journal Entries</h4>
                    <div className="stat-number">{starkeeperData?.journalEntries?.length || 0}</div>
                    <small>Last entry: {starkeeperData?.journalEntries?.[0] && formatTimeAgo(starkeeperData.journalEntries[0].timestamp)}</small>
                </Card>
                <Card className="stat-card">
                    <h4>📊 Mood Check-ins</h4>
                    <div className="stat-number">{starkeeperData?.moodCheckIns?.length || 0}</div>
                    <small>Latest: {starkeeperData?.moodCheckIns?.[0]?.moodScore}/5</small>
                </Card>
                <Card className="stat-card">
                    <h4>💬 Support Sessions</h4>
                    <div className="stat-number">{starkeeperData?.dilemmas?.filter((d: any) => d.status === 'resolved').length || 0}</div>
                    <small>Completed successfully</small>
                </Card>
            </div>

            {starkeeperData?.assessments && starkeeperData.assessments.length > 0 && (
                <Card className="recent-assessment">
                    <h3>📋 Recent Assessment</h3>
                    <div className="assessment-summary">
                        <strong>{starkeeperData.assessments[0].type.toUpperCase()}</strong>
                        <span className="assessment-score">Score: {starkeeperData.assessments[0].score}</span>
                        <p>{starkeeperData.assessments[0].recommendation}</p>
                        <small>Completed {formatTimeAgo(starkeeperData.assessments[0].timestamp)}</small>
                    </div>
                </Card>
            )}

            <Card className="crisis-resources">
                <h3>🚨 Crisis Support Always Available</h3>
                <p>If you're experiencing a crisis or having thoughts of self-harm, immediate help is available.</p>
                <div className="crisis-actions">
                    <AppButton variant="danger" onClick={() => window.open('tel:988')}>📞 Call 988</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>💬 Crisis Chat</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>📍 Find Local Help</AppButton>
                </div>
            </Card>
        </div>
    );

    const renderJournalTab = () => (
        <div className="journal-section">
            <Card>
                <h3>📖 Your Personal Journal</h3>
                <p>Writing about your thoughts and feelings can be a powerful tool for healing and self-discovery.</p>
                <AppButton variant="primary" onClick={() => {}}>✍️ Write New Entry</AppButton>
            </Card>

            {starkeeperData?.journalEntries && (
                <div className="journal-entries">
                    {starkeeperData.journalEntries.map((entry: any) => (
                        <Card key={entry.id} className="journal-entry">
                            <div className="entry-header">
                                <span className="entry-date">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                <span className="entry-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="entry-content">
                                {entry.content}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMoodTab = () => (
        <div className="mood-section">
            <Card>
                <h3>😊 Mood Tracking</h3>
                <p>Regular mood check-ins help you understand patterns and celebrate progress.</p>
                <AppButton variant="primary" onClick={() => {}}>📊 Log Current Mood</AppButton>
            </Card>

            {starkeeperData?.moodCheckIns && (
                <div className="mood-history">
                    {starkeeperData.moodCheckIns.map((mood: any) => (
                        <Card key={mood.id} className="mood-entry">
                            <div className="mood-header">
                                <span className="mood-date">{new Date(mood.timestamp).toLocaleDateString()}</span>
                                <div className="mood-score">
                                    <span>Mood: {mood.moodScore}/5</span>
                                    <span>Anxiety: {mood.anxietyLevel}/5</span>
                                    <span>Energy: {mood.energyLevel}/5</span>
                                    <span>Sleep: {mood.sleepQuality}/5</span>
                                </div>
                            </div>
                            {mood.tags && (
                                <div className="mood-tags">
                                    {mood.tags.map((tag: string) => (
                                        <span key={tag} className="mood-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                            {mood.notes && (
                                <div className="mood-notes">
                                    <strong>Notes:</strong> {mood.notes}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSupportTab = () => (
        <div className="support-section">
            <Card>
                <h3>🤝 Get Support</h3>
                <p>You don't have to face challenges alone. Connect with trained helpers and our supportive community.</p>
                <div className="support-options">
                    <AppButton variant="primary" onClick={() => {}}>💬 Start New Chat</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>🔍 Browse Available Guides</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>📝 Share a Dilemma</AppButton>
                </div>
            </Card>

            {starkeeperData?.dilemmas && (
                <Card>
                    <h3>📝 Your Support History</h3>
                    <div className="support-history">
                        {starkeeperData.dilemmas.map((dilemma: any) => (
                            <div key={dilemma.id} className="support-item">
                                <div className="support-header">
                                    <span className={`status-badge ${dilemma.status}`}>{dilemma.status}</span>
                                    <span className="support-date">{new Date(dilemma.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="support-content">
                                    <strong>Category:</strong> {dilemma.category}
                                    {dilemma.helperDisplayName && (
                                        <div><strong>Helper:</strong> {dilemma.helperDisplayName}</div>
                                    )}
                                    {dilemma.summary && (
                                        <div className="support-summary">
                                            <strong>Outcome:</strong> {dilemma.summary}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const renderCommunityTab = () => (
        <div className="community-section">
            <Card>
                <h3>🌍 Community Connection</h3>
                <p>Connect with others on similar journeys. Share experiences, offer support, and find encouragement.</p>
                <div className="community-options">
                    <AppButton variant="primary" onClick={() => {}}>🌟 Community Feed</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>💭 Share Reflection</AppButton>
                    <AppButton variant="secondary" onClick={() => {}}>📚 Wellness Resources</AppButton>
                </div>
            </Card>

            {starkeeperData?.communityReflections && (
                <Card>
                    <h3>💭 Recent Community Reflections</h3>
                    <div className="community-reflections">
                        {starkeeperData.communityReflections.slice(0, 3).map((reflection: any) => (
                            <div key={reflection.id} className="reflection-item">
                                <div className="reflection-content">{reflection.content}</div>
                                <div className="reflection-reactions">
                                    {Object.entries(reflection.reactions || {}).map(([reaction, count]: [string, any]) => (
                                        <span key={reaction} className="reaction">
                                            {getReactionEmoji(reaction)} {count}
                                        </span>
                                    ))}
                                </div>
                                <small>{formatTimeAgo(reflection.timestamp)}</small>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="safety-reminder">
                <h3>🛡️ Community Guidelines</h3>
                <p>Our community is built on respect, empathy, and safety. Please keep interactions supportive and kind.</p>
                <AppButton variant="secondary" onClick={() => {}}>📋 Read Full Guidelines</AppButton>
            </Card>
        </div>
    );

    return (
        <div className="starkeeper-dashboard">
            <ViewHeader 
                title="🌟 Your Wellness Journey"
                subtitle="Personal tools for growth, healing, and connection"
            />
            
            <div className="dashboard-tabs">
                <AppButton 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </AppButton>
                <AppButton 
                    className={activeTab === 'journal' ? 'active' : ''} 
                    onClick={() => setActiveTab('journal')}
                >
                    📖 Journal
                </AppButton>
                <AppButton 
                    className={activeTab === 'mood' ? 'active' : ''} 
                    onClick={() => setActiveTab('mood')}
                >
                    😊 Mood
                </AppButton>
                <AppButton 
                    className={activeTab === 'support' ? 'active' : ''} 
                    onClick={() => setActiveTab('support')}
                >
                    🤝 Support
                </AppButton>
                <AppButton 
                    className={activeTab === 'community' ? 'active' : ''} 
                    onClick={() => setActiveTab('community')}
                >
                    🌍 Community
                </AppButton>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'journal' && renderJournalTab()}
                {activeTab === 'mood' && renderMoodTab()}
                {activeTab === 'support' && renderSupportTab()}
                {activeTab === 'community' && renderCommunityTab()}
            </div>
        </div>
    );
};

export default StarkeeperDashboardView;
