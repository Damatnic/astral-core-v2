import React, { useState, useMemo, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ViewHeader } from '../components/ViewHeader';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppInput';
import { MoodCheckIn } from '../types';
import { groupCheckInsByDay } from '../utils/chartUtils';
import { PlusIcon  } from '../components/icons.dynamic';
import { useWellnessStore } from '../stores/wellnessStore';
import { MoodTracker } from '../components/MoodTracker';
import { WellnessInsights } from '../components/WellnessInsights';
import { EnhancedMoodChart } from '../components/EnhancedMoodChart';
import { BreathingWidget } from '../components/BreathingWidget';
import { backendService } from '../services/backendService';
import { isError } from '../types/common';

const MOOD_EMOJIS = ['😞', '🙁', '😐', '🙂', '😊'];
const MOOD_TAGS = ['Grateful', 'Anxious', 'Tired', 'Hopeful', 'Stressed', 'Calm', 'Lonely', 'Productive'];

const RangeSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <div className="form-group">
        <label>{label}</label>
        <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="wellness-slider"
        />
    </div>
);

const CheckInTab: React.FC = () => {
    const { history, postCheckIn } = useWellnessStore();
    const { addToast } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chartPeriod, _setChartPeriod] = useState<'7days' | '30days' | '90days'>('7days');
    
    // Form state
    const [moodScore, setMoodScore] = useState(3);
    const [anxietyLevel, setAnxietyLevel] = useState(3);
    const [sleepQuality, setSleepQuality] = useState(3);
    const [energyLevel, setEnergyLevel] = useState(3);
    const [tags, setTags] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    
    // Load mood history from backend on mount
    useEffect(() => {
        const loadMoodHistory = async () => {
            try {
                const data = await backendService.mood.getMoodHistory();
                console.log('Loaded mood history from backend:', data);
                // In production, you would update the store with this data
            } catch (error) {
                console.error('Failed to load mood history:', error);
            }
        };
        loadMoodHistory();
    }, []);

    const chartData = useMemo(() => {
        const days = chartPeriod === '7days' ? 7 : chartPeriod === '30days' ? 30 : 90;
        return groupCheckInsByDay(history, days);
    }, [history, chartPeriod]);
    
    // Calculate insights data
    const insightsData = useMemo(() => {
        const moodAvg = history.length > 0 
            ? history.reduce((acc, h) => acc + h.moodScore, 0) / history.length 
            : 0;
        
        // Calculate streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            if (history.some(h => new Date(h.timestamp).toISOString().split('T')[0] === dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        // Get most common mood
        const moodCounts = history.reduce((acc, h) => {
            const emoji = MOOD_EMOJIS[Math.min(Math.floor(h.moodScore) - 1, 4)];
            acc[emoji] = (acc[emoji] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const topMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b, '😊'
        );
        
        return {
            moodAverage: moodAvg,
            streakDays: streak,
            totalCheckIns: history.length,
            topMood
        };
    }, [history]);

    const handleTagClick = (tag: string) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const resetForm = () => {
        setMoodScore(3);
        setAnxietyLevel(3);
        setSleepQuality(3);
        setEnergyLevel(3);
        setTags([]);
        setNotes('');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const checkInData: Omit<MoodCheckIn, 'id' | 'userToken' | 'timestamp'> = {
                moodScore,
                anxietyLevel,
                sleepQuality,
                energyLevel,
                tags,
                notes: notes.trim(),
            };
            
            // Save to local store (for offline support)
            await postCheckIn(checkInData);
            
            // Also save to backend if available
            try {
                const moodLabels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
                await backendService.mood.saveMoodEntry({
                    mood: moodLabels[moodScore - 1],
                    score: moodScore,
                    notes: notes.trim(),
                    triggers: tags.filter(t => ['Anxious', 'Stressed', 'Lonely'].includes(t)),
                    activities: tags.filter(t => ['Grateful', 'Hopeful', 'Calm', 'Productive'].includes(t))
                });
                console.log('Mood saved to backend successfully');
            } catch (backendError) {
                console.error('Failed to save to backend (will retry later):', backendError);
                // Don't show error to user - local save was successful
            }
            
            addToast('Your wellness check-in has been saved!', 'success');
            resetForm();
        } catch (error) {
            const errorMessage = isError(error) ? error.message : 'Failed to save check-in.';
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const hasCheckedInToday = useMemo(() => {
        if (!history || history.length === 0) return false;
        const today = new Date().toISOString().split('T')[0];
        return history.some(c => new Date(c.timestamp).toISOString().split('T')[0] === today);
    }, [history]);

    return (
    <>
        <Card enhanced variant="interactive">
            <h2>Daily Check-in</h2>
            {hasCheckedInToday ? (
                 <div className="empty-state" style={{padding: '2rem 1rem'}}>
                    <h3>Great job!</h3>
                    <p>You've already completed your check-in for today. Come back tomorrow!</p>
                </div>
            ) : (
                <>
                    <div className="form-group">
                        <label>How are you feeling overall today?</label>
                        <div className="mood-selector">
                            {MOOD_EMOJIS.map((emoji, index) => (
                                <button
                                    key={index}
                                    className={moodScore === index + 1 ? 'mood-emoji-btn selected' : 'mood-emoji-btn'}
                                    onClick={() => setMoodScore(index + 1)}
                                    aria-label={`Mood score ${index + 1}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <RangeSlider label="Anxiety Level (Low to High)" value={anxietyLevel} onChange={setAnxietyLevel} />
                    <RangeSlider label="Sleep Quality (Poor to Great)" value={sleepQuality} onChange={setSleepQuality} />
                    <RangeSlider label="Energy Level (Low to High)" value={energyLevel} onChange={setEnergyLevel} />
                    <div className="form-group">
                        <label>Select tags that apply:</label>
                         <div className="tag-selector filter-buttons">
                            {MOOD_TAGS.map(tag => (
                                <AppButton
                                    key={tag}
                                    className={tags.includes(tag) ? 'active' : ''}
                                    onClick={() => handleTagClick(tag)}
                                    variant='secondary'
                                >
                                    {tag}
                                </AppButton>
                            ))}
                        </div>
                    </div>
                    <AppTextArea label="Notes (Private)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any specific thoughts or events today?" rows={3} />
                    <div className="form-actions">
                        <AppButton enhanced size="lg" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>Save Today's Check-in</AppButton>
                    </div>
                </>
            )}
        </Card>
        
        <WellnessInsights {...insightsData} />
        
        <EnhancedMoodChart data={chartData} period={chartPeriod} />
    </>
    );
};

const HabitsTab: React.FC = () => {
    const { predefinedHabits, trackedHabits, isLoadingHabits, trackHabit, logCompletion } = useWellnessStore();

    const discoverableHabits = useMemo(() => {
        const trackedIds = new Set(trackedHabits.map(h => h.habitId));
        return predefinedHabits.filter(h => !trackedIds.has(h.id));
    }, [predefinedHabits, trackedHabits]);

    if (isLoadingHabits) {
        return <div className="loading-spinner" style={{ margin: '3rem auto' }}></div>;
    }
    
    return (
        <>
            <Card enhanced variant="elevated">
                <h2>My Habits</h2>
                {trackedHabits.length > 0 ? (
                    <ul className="habit-list">
                        {trackedHabits.map(habit => (
                            <li key={habit.habitId} className={habit.isCompletedToday ? 'habit-item completed' : 'habit-item'}>
                                <div className="habit-info">
                                    <h4>{predefinedHabits.find(h => h.id === habit.habitId)?.name}</h4>
                                    <p>{predefinedHabits.find(h => h.id === habit.habitId)?.description}</p>
                                </div>
                                <div className="habit-streak" title={`Current Streak: ${habit.currentStreak} days`}>
                                    <span>🔥</span>
                                    <span>{habit.currentStreak}</span>
                                </div>
                                <AppButton
                                    variant={habit.isCompletedToday ? 'success' : 'primary'}
                                    onClick={() => logCompletion(habit.habitId)}
                                    disabled={habit.isCompletedToday}
                                >
                                    {habit.isCompletedToday ? 'Done!' : 'Complete'}
                                </AppButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You're not tracking any habits yet. Add one from the list below to get started!</p>
                )}
            </Card>
             <Card enhanced variant="interactive">
                <h2>Discover New Habits</h2>
                {discoverableHabits.length > 0 ? (
                     <ul className="habit-list">
                        {discoverableHabits.map(habit => (
                            <li key={habit.id} className="habit-item">
                                <div className="habit-info">
                                    <h4>{habit.name}</h4>
                                    <p>{habit.description}</p>
                                </div>
                                <AppButton enhanced variant="secondary" size="sm" onClick={() => trackHabit(habit.id)} icon={<PlusIcon />}>
                                    Track
                                </AppButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You're tracking all available habits. Great job!</p>
                )}
            </Card>
        </>
    );
};

const JournalTab: React.FC = () => {
    const { journalEntries, postJournalEntry } = useWellnessStore();
    const { addToast } = useNotification();
    const [newEntry, setNewEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_LENGTH = 2000;

    const handleSubmit = async () => {
        if (!newEntry.trim()) return;
        setIsSubmitting(true);
        try {
            await postJournalEntry(newEntry);
            setNewEntry('');
            addToast('Journal entry saved.', 'success');
        } catch (error) {
            const errorMessage = isError(error) ? error.message : 'Failed to save journal entry.';
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card enhanced variant="glass">
                <h2>New Journal Entry</h2>
                <p>This is a private space for your thoughts. Only you can see these entries.</p>
                <AppTextArea
                    enhanced
                    value={newEntry}
                    onChange={e => setNewEntry(e.target.value)}
                    placeholder="What's on your mind today?"
                    rows={5}
                    maxLength={MAX_LENGTH}
                />
                <div className="form-actions">
                    <AppButton enhanced size="lg" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting || !newEntry.trim()}>
                        Save Entry
                    </AppButton>
                </div>
            </Card>

            <div className="journal-history">
                <h2>Past Entries</h2>
                {journalEntries.length > 0 ? (
                    journalEntries.map(entry => (
                        <Card enhanced variant="interactive" key={entry.id} className="journal-entry-card">
                            <p className="journal-entry-timestamp">
                                {new Date(entry.timestamp).toLocaleDateString(undefined, {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                            <p className="journal-entry-content">{entry.content}</p>
                        </Card>
                    ))
                ) : (
                    <Card enhanced variant="default">
                        <p>You have no journal entries yet.</p>
                    </Card>
                )}
            </div>
        </>
    );
};

export const WellnessView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mood' | 'checkin' | 'habits' | 'journal'>('mood');
    const { fetchHistory, fetchHabits, fetchJournalEntries } = useWellnessStore();
    const [showBreathing, setShowBreathing] = useState(false);

    // Fetch data when component mounts
    React.useEffect(() => {
        fetchHistory();
        fetchHabits();
        fetchJournalEntries();
    }, []); // Empty deps array - only run once on mount

    const handleMoodSubmit = (_moodData: { value: number; tags: string[]; note: string }) => {
        // Here you would typically save to your wellness store
        // You can integrate with your existing wellness store if needed
    };

    return (
        <>
            <style>{`
                .wellness-slider { width: 100%; }
                .mood-selector { display: flex; justify-content: space-around; margin-bottom: 1rem; }
                .mood-emoji-btn { font-size: 2.5rem; cursor: pointer; transition: transform 0.2s; padding: 0.5rem; border-radius: 50%; border: 2px solid transparent; background: none; }
                .mood-emoji-btn:hover { transform: scale(1.1); }
                .mood-emoji-btn.selected { transform: scale(1.2); border-color: var(--accent-primary); background: color-mix(in srgb, var(--accent-primary) 15%, transparent); }
                .tag-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
                .wellness-chart { display: flex; gap: 1rem; height: 250px; margin-top: 2rem; }
                .chart-y-axis { display: flex; flex-direction: column-reverse; justify-content: space-between; font-size: 1.25rem; }
                .chart-bars { display: flex; flex-grow: 1; justify-content: space-around; border-left: 2px solid var(--border-color); border-bottom: 2px solid var(--border-color); padding-left: 0.5rem; }
                .chart-bar-group { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 10%; }
                .chart-bar-wrapper { flex-grow: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center;}
                .chart-bar { width: 60%; background-color: var(--accent-primary); border-radius: 4px 4px 0 0; transition: height 0.5s ease-out, background-color 0.5s; }
                .chart-bar:hover { opacity: 0.8; }
                .chart-label { margin-top: 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.875rem; }
                .journal-history { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .journal-entry-card { padding: 1rem 1.5rem; }
                .journal-entry-timestamp { font-weight: bold; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
                .journal-entry-content { white-space: pre-wrap; }
            `}</style>
            <ViewHeader title="My Wellness" subtitle="Track your mood, build healthy habits, and reflect in your private journal." />
            
            {showBreathing && (
                <div style={{ marginBottom: '2rem' }}>
                    <BreathingWidget onComplete={() => setShowBreathing(false)} />
                </div>
            )}
            
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={() => setShowBreathing(!showBreathing)}
                    style={{
                        padding: '0.5rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {showBreathing ? '✨ Hide Breathing Exercise' : '🧘 Take a Mindful Moment'}
                </button>
            </div>

            <div className="dashboard-tabs">
                <AppButton className={activeTab === 'mood' ? 'active' : ''} onClick={() => setActiveTab('mood')}>Daily Mood</AppButton>
                <AppButton className={activeTab === 'checkin' ? 'active' : ''} onClick={() => setActiveTab('checkin')}>Check-in</AppButton>
                <AppButton className={activeTab === 'habits' ? 'active' : ''} onClick={() => setActiveTab('habits')}>Habits</AppButton>
                <AppButton className={activeTab === 'journal' ? 'active' : ''} onClick={() => setActiveTab('journal')}>Journal</AppButton>
            </div>

            {activeTab === 'mood' && (
                <div className="mood-tracker-container">
                    <MoodTracker onMoodSubmit={handleMoodSubmit} />
                </div>
            )}
            {activeTab === 'checkin' && <CheckInTab />}
            {activeTab === 'habits' && <HabitsTab />}
            {activeTab === 'journal' && <JournalTab />}
        </>
    );
};

export default WellnessView;