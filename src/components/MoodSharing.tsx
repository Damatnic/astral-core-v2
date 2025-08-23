import React, { useState, useEffect } from 'react';
import { getRealtimeService } from '../services/realtimeService';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import './MoodSharing.css';

interface MoodOption {
  value: number;
  label: string;
  emoji: string;
  color: string;
}

interface SharedMood {
  userId: string;
  username: string;
  mood: {
    value: number;
    label: string;
    emoji?: string;
    color?: string;
  };
  timestamp: number;
  message?: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, label: 'Very Sad', emoji: '😢', color: '#ef4444' },
  { value: 2, label: 'Sad', emoji: '😔', color: '#f97316' },
  { value: 3, label: 'Neutral', emoji: '😐', color: '#f59e0b' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#84cc16' },
  { value: 5, label: 'Great', emoji: '😊', color: '#10b981' }
];

interface MoodSharingProps {
  userId: string;
  username: string;
  showFeed?: boolean;
  allowSharing?: boolean;
}

export const MoodSharing: React.FC<MoodSharingProps> = ({
  userId,
  username,
  showFeed = true,
  allowSharing = true
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodMessage, setMoodMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [sharedMoods, setSharedMoods] = useState<SharedMood[]>([]);
  const [showShareForm, setShowShareForm] = useState(false);
  const realtimeService = getRealtimeService();

  useEffect(() => {
    // Subscribe to mood updates
    const unsubscribe = realtimeService.on('mood-update', (data: SharedMood) => {
      setSharedMoods(prev => {
        const updated = [data, ...prev];
        // Keep only last 20 moods
        return updated.slice(0, 20);
      });
    });

    return () => unsubscribe();
  }, []);

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    if (!showShareForm) {
      setShowShareForm(true);
    }
  };

  const handleShareMood = async () => {
    if (!selectedMood) return;

    setIsSharing(true);

    try {
      await realtimeService.shareMoodUpdate(
        {
          value: selectedMood.value,
          label: selectedMood.label,
          emoji: selectedMood.emoji,
          color: selectedMood.color
        },
        isPublic
      );

      // Add to local feed if public
      if (isPublic) {
        const sharedMood: SharedMood = {
          userId,
          username,
          mood: {
            value: selectedMood.value,
            label: selectedMood.label,
            emoji: selectedMood.emoji,
            color: selectedMood.color
          },
          timestamp: Date.now(),
          message: moodMessage
        };
        setSharedMoods(prev => [sharedMood, ...prev]);
      }

      // Reset form
      setShowShareForm(false);
      setMoodMessage('');
      setIsPublic(false);
      
      // Show success feedback
      showSuccessFeedback();
    } catch (error) {
      console.error('Failed to share mood:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const showSuccessFeedback = () => {
    // This could trigger a toast notification
    const feedback = document.createElement('div');
    feedback.className = 'mood-share-success';
    feedback.textContent = 'Mood shared successfully!';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  };

  const getMoodGradient = (value: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    return gradients[value - 1] || gradients[2];
  };

  return (
    <div className="mood-sharing-container">
      {allowSharing && (
        <div className="mood-selector-section">
          <h3>How are you feeling?</h3>
          
          <div className="mood-options">
            {MOOD_OPTIONS.map(mood => (
              <button
                key={mood.value}
                className={`mood-option ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                onClick={() => handleMoodSelect(mood)}
                style={{
                  borderColor: selectedMood?.value === mood.value ? mood.color : 'transparent'
                }}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>

          {showShareForm && selectedMood && (
            <div className="mood-share-form">
              <div className="selected-mood-display">
                <span className="selected-mood-emoji">{selectedMood.emoji}</span>
                <span className="selected-mood-text">
                  You're feeling <strong>{selectedMood.label.toLowerCase()}</strong>
                </span>
              </div>

              <textarea
                className="mood-message-input"
                placeholder="Add a message (optional)..."
                value={moodMessage}
                onChange={(e) => setMoodMessage(e.target.value)}
                maxLength={200}
              />

              <div className="mood-share-options">
                <label className="mood-public-toggle">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span>Share publicly in mood feed</span>
                </label>

                <div className="mood-share-actions">
                  <button
                    className="mood-cancel-button"
                    onClick={() => {
                      setShowShareForm(false);
                      setMoodMessage('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="mood-share-button"
                    onClick={handleShareMood}
                    disabled={isSharing}
                  >
                    {isSharing ? 'Sharing...' : 'Share Mood'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showFeed && (
        <div className="mood-feed-section">
          <div className="mood-feed-header">
            <h3>Community Mood Feed</h3>
            <span className="mood-feed-count">{sharedMoods.length} moods</span>
          </div>

          {sharedMoods.length === 0 ? (
            <div className="mood-feed-empty">
              <p>No moods shared yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="mood-feed-list">
              {sharedMoods.map((sharedMood, index) => (
                <div
                  key={`${sharedMood.userId}-${sharedMood.timestamp}-${index}`}
                  className="mood-feed-item"
                  style={{
                    background: getMoodGradient(sharedMood.mood.value)
                  }}
                >
                  <div className="mood-feed-item-header">
                    <span className="mood-feed-emoji">
                      {sharedMood.mood.emoji || MOOD_OPTIONS.find(m => m.value === sharedMood.mood.value)?.emoji}
                    </span>
                    <div className="mood-feed-user-info">
                      <span className="mood-feed-username">{sharedMood.username}</span>
                      <span className="mood-feed-time">
                        {formatTimeAgo(new Date(sharedMood.timestamp))}
                      </span>
                    </div>
                  </div>

                  <div className="mood-feed-content">
                    <p className="mood-feed-mood">
                      Feeling <strong>{sharedMood.mood.label.toLowerCase()}</strong>
                    </p>
                    {sharedMood.message && (
                      <p className="mood-feed-message">{sharedMood.message}</p>
                    )}
                  </div>

                  <div className="mood-feed-actions">
                    <button
                      className="mood-feed-support"
                      onClick={() => {
                        // Send supportive message
                        console.log('Sending support to', sharedMood.userId);
                      }}
                    >
                      💙 Send Support
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mood Analytics */}
      <div className="mood-analytics">
        <h4>Community Mood Trends</h4>
        <div className="mood-chart">
          {MOOD_OPTIONS.map(mood => {
            const count = sharedMoods.filter(m => m.mood.value === mood.value).length;
            const percentage = sharedMoods.length > 0 ? (count / sharedMoods.length) * 100 : 0;
            
            return (
              <div key={mood.value} className="mood-bar-container">
                <div className="mood-bar-label">
                  <span>{mood.emoji}</span>
                  <span>{count}</span>
                </div>
                <div className="mood-bar-track">
                  <div
                    className="mood-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: mood.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};