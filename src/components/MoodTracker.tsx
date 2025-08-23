import React, { useState } from 'react';
import { HeartIcon, SparkleIcon, CheckIcon  } from './icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import { AppButton } from './AppButton';
import { useCulturalCrisisDetection } from '../hooks/useCulturalCrisisDetection';
import CulturalCrisisAlert from './CulturalCrisisAlert';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  value: number;
  color: string;
  description: string;
}

const moodOptions: MoodOption[] = [
  {
    id: 'terrible',
    emoji: '😢',
    label: 'Terrible',
    value: 1,
    color: '#ef4444',
    description: 'Feeling really down today'
  },
  {
    id: 'bad',
    emoji: '😞',
    label: 'Bad',
    value: 2,
    color: '#f97316',
    description: 'Not having a good day'
  },
  {
    id: 'okay',
    emoji: '😐',
    label: 'Okay',
    value: 3,
    color: '#eab308',
    description: 'Feeling neutral'
  },
  {
    id: 'good',
    emoji: '🙂',
    label: 'Good',
    value: 4,
    color: '#22c55e',
    description: 'Having a good day'
  },
  {
    id: 'great',
    emoji: '😊',
    label: 'Great',
    value: 5,
    color: '#10b981',
    description: 'Feeling amazing!'
  }
];

const moodTags = [
  'Grateful', 'Anxious', 'Tired', 'Hopeful', 'Stressed', 
  'Calm', 'Lonely', 'Productive', 'Excited', 'Peaceful',
  'Overwhelmed', 'Confident', 'Sad', 'Energetic', 'Worried',
  'Hopeless', 'Trapped', 'Worthless', 'Alone'
];

interface MoodTrackerProps {
  onMoodSubmit?: (mood: { value: number; tags: string[]; note: string }) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const { addToast } = useNotification();
  const { dismissCulturalAlert } = useCulturalCrisisDetection();

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    setIsSubmitted(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      addToast('Please select your mood first', 'error');
      return;
    }

    // Check for potential crisis indicators based on mood selection and content
    const hasLowMood = selectedMood.value <= 2;
    const hasConcerningTags = selectedTags.some(tag => 
      ['hopeless', 'overwhelmed', 'trapped', 'worthless', 'alone'].includes(tag.toLowerCase())
    );
    const hasConcerningNote = note.toLowerCase().includes('suicide') || 
                              note.toLowerCase().includes('hurt myself') ||
                              note.toLowerCase().includes('end it all');

    if (hasLowMood || hasConcerningTags || hasConcerningNote) {
      setShowCrisisAlert(true);
      // Don't proceed with mood submission until crisis alert is addressed
      return;
    }

    const moodData = {
      value: selectedMood.value,
      tags: selectedTags,
      note: note.trim()
    };

    onMoodSubmit?.(moodData);
    setIsSubmitted(true);
    addToast(`Mood logged: ${selectedMood.label} 💜`, 'success');
    
    // Reset after a delay
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  const handleReset = () => {
    setSelectedMood(null);
    setSelectedTags([]);
    setNote('');
    setIsSubmitted(false);
    setShowCrisisAlert(false);
  };

  const handleCrisisDismiss = () => {
    setShowCrisisAlert(false);
    dismissCulturalAlert();
  };

  if (isSubmitted && selectedMood) {
    return (
      <div className="mood-tracker submitted">
        <div className="mood-submitted-content">
          <div className="mood-submitted-icon">
            <CheckIcon />
          </div>
          <h3>Mood Logged Successfully!</h3>
          <div className="mood-submitted-summary">
            <div className="mood-submitted-emoji" style={{ color: selectedMood.color }}>
              {selectedMood.emoji}
            </div>
            <p>You're feeling <strong>{selectedMood.label.toLowerCase()}</strong> today</p>
            {selectedTags.length > 0 && (
              <div className="mood-submitted-tags">
                {selectedTags.map(tag => (
                  <span key={tag} className="mood-tag selected">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <AppButton 
            enhanced 
            size="sm" 
            variant="secondary" 
            onClick={handleReset}
          >
            Log Another Mood
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracker">
      {showCrisisAlert && (
        <CulturalCrisisAlert
          analysisText={`Mood: ${selectedMood?.label} (${selectedMood?.value}/5). Tags: ${selectedTags.join(', ')}. Note: ${note.trim()}`}
          show={true}
          onDismiss={handleCrisisDismiss}
        />
      )}
      
      <div className="mood-tracker-header">
        <div className="mood-header-content">
          <HeartIcon />
          <div>
            <h2>How are you feeling today?</h2>
            <p>Take a moment to check in with yourself</p>
          </div>
        </div>
      </div>

      <div className="mood-selection">
        <h3>Select your mood</h3>
        <div className="mood-options">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              className={`mood-option ${selectedMood?.id === mood.id ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              style={{ 
                '--mood-color': mood.color,
                borderColor: selectedMood?.id === mood.id ? mood.color : 'transparent'
              } as React.CSSProperties}
            >
              <div className="mood-emoji">{mood.emoji}</div>
              <div className="mood-label">{mood.label}</div>
              <div className="mood-description">{mood.description}</div>
              {selectedMood?.id === mood.id && (
                <div className="mood-selected-indicator">
                  <CheckIcon />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedMood && (
        <>
          <div className="mood-tags-section">
            <h3>What's contributing to this feeling? (optional)</h3>
            <div className="mood-tags">
              {moodTags.map((tag) => (
                <button
                  key={tag}
                  className={`mood-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>

          <div className="mood-note-section">
            <h3>Any additional thoughts? (optional)</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How was your day? What's on your mind?"
              className="mood-note-input"
              rows={3}
              maxLength={500}
            />
            <div className="mood-note-counter">
              {note.length}/500 characters
            </div>
          </div>

          <div className="mood-tracker-actions form-actions">
            <AppButton 
              enhanced 
              size="sm" 
              variant="secondary" 
              onClick={handleReset}
            >
              Reset
            </AppButton>
            <AppButton 
              enhanced 
              size="md" 
              variant="primary" 
              onClick={handleSubmit}
              icon={<SparkleIcon />}
            >
              Log My Mood
            </AppButton>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodTracker;