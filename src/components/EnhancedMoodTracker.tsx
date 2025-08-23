import React, { useState, useEffect } from 'react';
import '../styles/modern-therapeutic-design.css';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  value: number;
}

interface MoodEntry {
  mood: string;
  value: number;
  timestamp: Date;
  note?: string;
  triggers?: string[];
  activities?: string[];
}

const EnhancedMoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const moodOptions: MoodOption[] = [
    {
      id: 'amazing',
      label: 'Amazing',
      emoji: '🤩',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      description: 'Feeling fantastic and full of energy',
      value: 10
    },
    {
      id: 'happy',
      label: 'Happy',
      emoji: '😊',
      color: '#90EE90',
      gradient: 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)',
      description: 'Feeling good and positive',
      value: 8
    },
    {
      id: 'calm',
      label: 'Calm',
      emoji: '😌',
      color: '#87CEEB',
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
      description: 'Peaceful and relaxed',
      value: 7
    },
    {
      id: 'okay',
      label: 'Okay',
      emoji: '😐',
      color: '#DDA0DD',
      gradient: 'linear-gradient(135deg, #DDA0DD 0%, #9370DB 100%)',
      description: 'Neutral, neither good nor bad',
      value: 5
    },
    {
      id: 'anxious',
      label: 'Anxious',
      emoji: '😰',
      color: '#FFB6C1',
      gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
      description: 'Feeling worried or nervous',
      value: 4
    },
    {
      id: 'sad',
      label: 'Sad',
      emoji: '😔',
      color: '#B0C4DE',
      gradient: 'linear-gradient(135deg, #B0C4DE 0%, #708090 100%)',
      description: 'Feeling down or blue',
      value: 3
    },
    {
      id: 'angry',
      label: 'Angry',
      emoji: '😠',
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)',
      description: 'Feeling frustrated or upset',
      value: 2
    },
    {
      id: 'overwhelmed',
      label: 'Overwhelmed',
      emoji: '😵',
      color: '#9B59B6',
      gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
      description: 'Too much to handle right now',
      value: 1
    }
  ];

  const triggers = [
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'relationships', label: 'Relationships', emoji: '❤️' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'money', label: 'Money', emoji: '💰' },
    { id: 'sleep', label: 'Sleep', emoji: '😴' },
    { id: 'social', label: 'Social Media', emoji: '📱' },
    { id: 'news', label: 'News', emoji: '📰' },
    { id: 'weather', label: 'Weather', emoji: '🌤️' },
    { id: 'other', label: 'Other', emoji: '🔮' }
  ];

  const activities = [
    { id: 'exercise', label: 'Exercise', emoji: '🏃' },
    { id: 'meditation', label: 'Meditation', emoji: '🧘' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'reading', label: 'Reading', emoji: '📚' },
    { id: 'nature', label: 'Nature', emoji: '🌳' },
    { id: 'friends', label: 'Friends', emoji: '👥' },
    { id: 'creative', label: 'Creative', emoji: '🎨' },
    { id: 'rest', label: 'Rest', emoji: '🛋️' },
    { id: 'therapy', label: 'Therapy', emoji: '💬' }
  ];

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMoodHistory(parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
    }
  }, []);

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    // Animate the selection
    const element = document.getElementById(`mood-${mood.id}`);
    if (element) {
      element.classList.add('animate-glow');
      setTimeout(() => element.classList.remove('animate-glow'), 2000);
    }
  };

  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers(prev =>
      prev.includes(triggerId)
        ? prev.filter(t => t !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(a => a !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEntry: MoodEntry = {
      mood: selectedMood.label,
      value: selectedMood.value,
      timestamp: new Date(),
      note: moodNote,
      triggers: selectedTriggers,
      activities: selectedActivities
    };

    const updatedHistory = [newEntry, ...moodHistory];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedMood(null);
      setMoodNote('');
      setSelectedTriggers([]);
      setSelectedActivities([]);
      setCurrentStep(1);
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.value, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'stable';
    const recent = moodHistory.slice(0, 7);
    const older = moodHistory.slice(7, 14);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, e) => acc + e.value, 0) / recent.length;
    const olderAvg = older.reduce((acc, e) => acc + e.value, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  };

  return (
    <div className="enhanced-mood-tracker">
      {/* Header with Stats */}
      <div className="glass-card p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              How are you feeling today?
            </h2>
            <p className="text-gray-600">
              Track your emotional journey and identify patterns
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{getAverageMood()}</p>
              <p className="text-sm text-gray-600">Avg Mood</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{moodHistory.length}</p>
              <p className="text-sm text-gray-600">Entries</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                getMoodTrend() === 'improving' ? 'text-green-600' :
                getMoodTrend() === 'declining' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {getMoodTrend() === 'improving' ? '↑' :
                 getMoodTrend() === 'declining' ? '↓' : '→'}
              </p>
              <p className="text-sm text-gray-600">Trend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-1 transition-all ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="therapy-card animate-fadeIn">
        {/* Step 1: Mood Selection */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Select your current mood
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.id}
                  id={`mood-${mood.id}`}
                  onClick={() => handleMoodSelect(mood)}
                  className={`mood-option ${selectedMood?.id === mood.id ? 'selected' : ''}`}
                  style={{
                    background: selectedMood?.id === mood.id ? mood.gradient : undefined
                  }}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="font-medium text-sm">{mood.label}</div>
                  <div className="text-xs opacity-75 mt-1">{mood.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                disabled={!selectedMood}
                className="glass-button ripple-button"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Triggers */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              What might be influencing your mood?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Select any that apply (optional)
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {triggers.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => handleTriggerToggle(trigger.id)}
                  className={`therapy-chip ${
                    selectedTriggers.includes(trigger.id) ? 'selected' : ''
                  }`}
                  style={{
                    background: selectedTriggers.includes(trigger.id)
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : undefined,
                    color: selectedTriggers.includes(trigger.id) ? 'white' : undefined
                  }}
                >
                  <span className="text-xl mr-2">{trigger.emoji}</span>
                  <span className="text-sm">{trigger.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="glass-button">
                ← Back
              </button>
              <button onClick={nextStep} className="glass-button ripple-button">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Activities */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              What activities have you done today?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Track what helps you feel better (optional)
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityToggle(activity.id)}
                  className={`therapy-chip ${
                    selectedActivities.includes(activity.id) ? 'selected' : ''
                  }`}
                  style={{
                    background: selectedActivities.includes(activity.id)
                      ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                      : undefined,
                    color: selectedActivities.includes(activity.id) ? 'white' : undefined
                  }}
                >
                  <span className="text-xl mr-2">{activity.emoji}</span>
                  <span className="text-sm">{activity.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="glass-button">
                ← Back
              </button>
              <button onClick={nextStep} className="glass-button ripple-button">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Note */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Add a note about your day
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Write anything you'd like to remember (optional)
            </p>
            
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="How was your day? What's on your mind?"
              className="therapy-textarea w-full"
              rows={5}
            />

            {/* Summary */}
            {selectedMood && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Your mood summary:</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedMood.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedMood.label}</p>
                    {selectedTriggers.length > 0 && (
                      <p className="text-xs text-gray-600">
                        Triggers: {selectedTriggers.join(', ')}
                      </p>
                    )}
                    {selectedActivities.length > 0 && (
                      <p className="text-xs text-gray-600">
                        Activities: {selectedActivities.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="glass-button">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="glass-button ripple-button bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {isSubmitting ? (
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                ) : (
                  'Save Mood Entry'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="glass-card p-8 animate-slideIn">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Mood Tracked!
                </h3>
                <p className="text-gray-600">
                  Thank you for sharing how you&apos;re feeling
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Mood History */}
      {moodHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Mood Entries
          </h3>
          
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map((entry, index) => {
              const moodOption = moodOptions.find(m => m.label === entry.mood);
              return (
                <div
                  key={index}
                  className="glass-card p-4 flex items-center gap-4"
                  style={{
                    borderLeft: `4px solid ${moodOption?.color || '#gray'}`
                  }}
                >
                  <span className="text-2xl">
                    {moodOption?.emoji || '😐'}
                  </span>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.mood}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-gray-700 mt-1">
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-400">
                    {entry.value}/10
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMoodTracker;