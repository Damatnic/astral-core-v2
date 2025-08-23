

import React, { useState, useEffect } from 'react';
import { Reflection } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppTextArea';
import { Card } from '../components/Card';
import { SparkleIcon, HeartIcon, StarIcon, SendIcon } from '../components/icons.dynamic';
import { useReflectionStore } from '../stores/reflectionStore';
import { useAuth } from '../contexts/AuthContext';


// Sample reflections for demo purposes
const sampleReflections: Reflection[] = [
    {
        id: 'sample-1',
        content: 'Today I practiced gratitude by writing down three things that made me smile. It\'s amazing how focusing on small joys can shift your entire perspective. 🌟',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 42, star: 18, lightbulb: 7 },
        myReaction: undefined,
        userToken: 'anon-token-001'
    },
    {
        id: 'sample-2',
        content: 'Meditation has become my morning anchor. Just 10 minutes of mindfulness sets a peaceful tone for the entire day. The chaos doesn\'t disappear, but I handle it better.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 67, star: 23, lightbulb: 15 },
        myReaction: 'heart',
        userToken: 'anon-token-002'
    },
    {
        id: 'sample-3',
        content: 'Learned that it\'s okay to rest without guilt. Rest is not a reward for finishing everything; it\'s a necessity for being able to continue. Taking care of myself IS productive.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 89, star: 31, lightbulb: 22 },
        myReaction: undefined,
        userToken: 'anon-token-003'
    },
    {
        id: 'sample-4',
        content: 'Walking in nature today reminded me that growth takes time. Trees don\'t rush to bloom, and neither should I. Progress is progress, no matter how small.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 124, star: 45, lightbulb: 28 },
        myReaction: 'star',
        userToken: 'anon-token-004'
    },
    {
        id: 'sample-5',
        content: 'Called an old friend today. Connection is medicine for the soul. We laughed, we cried, we remembered why friendship matters. Reach out to someone you miss.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 156, star: 52, lightbulb: 34 },
        myReaction: undefined,
        userToken: 'anon-token-005'
    },
    {
        id: 'sample-6',
        content: 'Journaling breakthrough: I realized I\'ve been so focused on who I should be that I forgot to appreciate who I am. Self-acceptance is a daily practice, not a destination.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 203, star: 71, lightbulb: 48 },
        myReaction: 'lightbulb',
        userToken: 'anon-token-006'
    },
    {
        id: 'sample-7',
        content: 'Boundaries are not walls; they\'re bridges to healthier relationships. Said no to something that didn\'t serve me today, and it felt liberating.',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 178, star: 59, lightbulb: 41 },
        myReaction: undefined,
        userToken: 'anon-token-007'
    },
    {
        id: 'sample-8',
        content: 'The sunset tonight was a reminder that endings can be beautiful too. Every day gets a fresh start tomorrow. What a gift.',
        timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        reactions: { heart: 145, star: 67, lightbulb: 19 },
        myReaction: 'heart',
        userToken: 'anon-token-008'
    }
];

const inspirationalPrompts = [
    "What made you smile today?",
    "Share a moment of peace you experienced",
    "What are you grateful for right now?",
    "Describe a small victory from today",
    "What lesson did today teach you?",
    "Share something beautiful you noticed",
    "What act of kindness did you witness or perform?",
    "How did you take care of yourself today?"
];

export const ReflectionsView: React.FC<{ userToken?: string | null; }> = ({ userToken: propUserToken }) => {
    const { userToken: contextUserToken } = useAuth();
    const userToken = propUserToken ?? contextUserToken;
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [newReflection, setNewReflection] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'recent'>('all');
    const [currentPrompt, setCurrentPrompt] = useState(inspirationalPrompts[0]);
    const MAX_REFLECTION_LENGTH = 280;
    
    // Update store whenever reflections change
    const { setReflections: updateStore } = useReflectionStore();

    useEffect(() => {
        setIsLoading(true);
        ApiClient.reflections.getReflections()
            .then(data => {
                const reflectionsData = data.length > 0 ? data : sampleReflections;
                setReflections(reflectionsData);
                updateStore(reflectionsData); // Update the store
            })
            .catch((err) => {
                console.error('Failed to load reflections:', err);
                // Use sample data as fallback
                setReflections(sampleReflections);
                updateStore(sampleReflections); // Update the store
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Rotate through prompts
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPrompt(prev => {
                const currentIndex = inspirationalPrompts.indexOf(prev);
                return inspirationalPrompts[(currentIndex + 1) % inspirationalPrompts.length];
            });
        }, 10000); // Change every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const getFilteredReflections = () => {
        let filtered = [...reflections];
        switch (activeFilter) {
            case 'popular':
                return filtered.sort((a, b) => {
                    const totalA = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
                    const totalB = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
                    return totalB - totalA;
                });
            case 'recent':
                return filtered.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
            default:
                return filtered;
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReflection.trim() || !userToken) return;
        setIsSubmitting(true);
        try {
            const posted = await ApiClient.reflections.postReflection(userToken, newReflection.trim());
            setReflections(prev => [posted, ...prev]);
            setNewReflection('');
        } catch(err) {
            console.error(err);
            alert("Could not post your reflection. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReact = (reflectionId: string, reactionType: string) => {
        if (!userToken) {
            alert("You must have a user token to react.");
            return;
        }

        // Optimistic UI update
        setReflections(prev => prev.map(r => {
            if (r.id === reflectionId && !r.myReaction) {
                return {
                    ...r,
                    reactions: { ...r.reactions, [reactionType]: (r.reactions[reactionType] || 0) + 1 },
                    myReaction: reactionType,
                };
            }
            return r;
        }));

        ApiClient.reflections.addReaction(reflectionId, reactionType, userToken)
            .catch(err => {
                console.error("Failed to save reaction:", err);
                // Rollback UI on failure
                 setReflections(prev => prev.map(r => {
                    if (r.id === reflectionId) {
                        return {
                            ...r,
                            reactions: { ...r.reactions, [reactionType]: r.reactions[reactionType] - 1 },
                            myReaction: undefined,
                        };
                    }
                    return r;
                }));
            });
    }

    const filteredReflections = getFilteredReflections();

    return (
        <>
            <style>{`
                .reflections-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 2rem;
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .reflections-header {
                    text-align: center;
                    padding: 3rem 2rem;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%);
                    border-radius: 20px;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .reflections-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
                    animation: float 20s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -30px) rotate(120deg); }
                    66% { transform: translate(-20px, 20px) rotate(240deg); }
                }

                .reflections-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                    z-index: 1;
                }

                .reflections-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    position: relative;
                    z-index: 1;
                }

                .reflection-stats {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-top: 1.5rem;
                    position: relative;
                    z-index: 1;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .stat-number {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .compose-section {
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border-color);
                }

                .prompt-banner {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border: 1px solid rgba(168, 85, 247, 0.2);
                }

                .prompt-icon {
                    color: #a855f7;
                    font-size: 1.5rem;
                }

                .prompt-text {
                    flex: 1;
                    color: var(--text-primary);
                    font-style: italic;
                    animation: fadeInOut 10s ease-in-out infinite;
                }

                @keyframes fadeInOut {
                    0%, 90% { opacity: 1; }
                    95%, 100% { opacity: 0; }
                }

                .compose-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .textarea-wrapper {
                    position: relative;
                }

                .character-count {
                    position: absolute;
                    bottom: 0.5rem;
                    right: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    background: var(--bg-primary);
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                }

                .character-count.warning {
                    color: #f59e0b;
                }

                .character-count.error {
                    color: #ef4444;
                }

                .filter-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    padding: 0.5rem;
                    background: var(--card-bg);
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .filter-tab {
                    flex: 1;
                    padding: 0.75rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .filter-tab:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .filter-tab.active {
                    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
                }

                .reflections-grid {
                    display: grid;
                    gap: 1.5rem;
                    animation: fadeInUp 0.5s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .reflection-card {
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }

                .reflection-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    border-color: rgba(168, 85, 247, 0.3);
                }

                .reflection-content {
                    color: var(--text-primary);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    font-size: 1.05rem;
                }

                .reflection-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .reflection-time {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .reaction-buttons {
                    display: flex;
                    gap: 0.75rem;
                }

                .reaction-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem 0.75rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text-secondary);
                }

                .reaction-btn:hover {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
                    border-color: #a855f7;
                    transform: scale(1.05);
                }

                .reaction-btn.active {
                    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                    color: white;
                    border-color: transparent;
                }

                .reaction-icon {
                    font-size: 1.1rem;
                }

                .reaction-count {
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .empty-reflections {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--card-bg);
                    border-radius: 16px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-reflections h3 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-reflections p {
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .reflections-container {
                        padding: 1rem;
                    }

                    .reflections-header {
                        padding: 2rem 1rem;
                    }

                    .reflections-header h1 {
                        font-size: 2rem;
                    }

                    .reflection-stats {
                        gap: 1rem;
                    }

                    .filter-tabs {
                        flex-direction: column;
                    }

                    .compose-section {
                        padding: 1.5rem;
                    }
                }
            `}</style>

            <div className="reflections-container">
                <div className="reflections-header">
                    <h1>Astral Reflections</h1>
                    <p>A sanctuary for positive thoughts, gratitude, and shared wisdom</p>
                    <div className="reflection-stats">
                        <div className="stat-item">
                            <span className="stat-number">{reflections.length}</span>
                            <span className="stat-label">Reflections</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {reflections.reduce((sum, r) => sum + Object.values(r.reactions).reduce((a, b) => a + b, 0), 0)}
                            </span>
                            <span className="stat-label">Reactions</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">✨</span>
                            <span className="stat-label">Growing Daily</span>
                        </div>
                    </div>
                </div>

                <div className="compose-section">
                    <div className="prompt-banner">
                        <span className="prompt-icon">💭</span>
                        <span className="prompt-text">{currentPrompt}</span>
                    </div>
                    <form onSubmit={handleSubmit} className="compose-form">
                        <div className="textarea-wrapper">
                            <AppTextArea
                                label="Share your reflection"
                                placeholder="Write something positive, inspiring, or grateful..."
                                value={newReflection}
                                onChange={(e) => setNewReflection(e.target.value)}
                                maxLength={MAX_REFLECTION_LENGTH}
                                rows={4}
                            />
                            <span className={`character-count ${
                                newReflection.length > MAX_REFLECTION_LENGTH * 0.9 ? 'warning' : ''
                            } ${
                                newReflection.length >= MAX_REFLECTION_LENGTH ? 'error' : ''
                            }`}>
                                {newReflection.length} / {MAX_REFLECTION_LENGTH}
                            </span>
                        </div>
                        <div className="form-actions" style={{justifyContent: 'flex-end'}}>
                            <AppButton 
                                type="submit" 
                                onClick={() => {}} 
                                isLoading={isSubmitting} 
                                disabled={isSubmitting || !newReflection.trim()}
                                variant="primary"
                                enhanced
                            >
                                <SendIcon />
                                Share Reflection
                            </AppButton>
                        </div>
                    </form>
                </div>

                <div className="filter-tabs">
                    <button 
                        className={activeFilter === 'all' ? 'filter-tab active' : 'filter-tab'}
                        onClick={() => setActiveFilter('all')}
                    >
                        <StarIcon />
                        All Reflections
                    </button>
                    <button 
                        className={activeFilter === 'popular' ? 'filter-tab active' : 'filter-tab'}
                        onClick={() => setActiveFilter('popular')}
                    >
                        <HeartIcon />
                        Most Loved
                    </button>
                    <button 
                        className={activeFilter === 'recent' ? 'filter-tab active' : 'filter-tab'}
                        onClick={() => setActiveFilter('recent')}
                    >
                        <SparkleIcon />
                        Recent
                    </button>
                </div>
            
                <div className="reflections-grid">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <Card key={i} className="reflection-card">
                                <div className="content-skeleton" style={{height: '60px', marginBottom: '1rem'}}></div>
                                <div className="content-skeleton" style={{height: '20px', width: '30%'}}></div>
                            </Card>
                        ))
                    ) : filteredReflections.length > 0 ? (
                        filteredReflections.map(reflection => (
                            <div key={reflection.id} className="reflection-card">
                                <p className="reflection-content">{reflection.content}</p>
                                <div className="reflection-meta">
                                    <span className="reflection-time">
                                        {new Date(reflection.timestamp).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <div className="reaction-buttons">
                                        <button 
                                            className={reflection.myReaction === 'heart' ? 'reaction-btn active' : 'reaction-btn'}
                                            onClick={() => handleReact(reflection.id, 'heart')}
                                        >
                                            <span className="reaction-icon">❤️</span>
                                            <span className="reaction-count">{reflection.reactions.heart || 0}</span>
                                        </button>
                                        <button 
                                            className={reflection.myReaction === 'star' ? 'reaction-btn active' : 'reaction-btn'}
                                            onClick={() => handleReact(reflection.id, 'star')}
                                        >
                                            <span className="reaction-icon">⭐</span>
                                            <span className="reaction-count">{reflection.reactions.star || 0}</span>
                                        </button>
                                        <button 
                                            className={reflection.myReaction === 'lightbulb' ? 'reaction-btn active' : 'reaction-btn'}
                                            onClick={() => handleReact(reflection.id, 'lightbulb')}
                                        >
                                            <span className="reaction-icon">💡</span>
                                            <span className="reaction-count">{reflection.reactions.lightbulb || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-reflections">
                            <div className="empty-icon">🌟</div>
                            <h3>No reflections yet</h3>
                            <p>Be the first to share a positive thought or moment of gratitude</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReflectionsView;