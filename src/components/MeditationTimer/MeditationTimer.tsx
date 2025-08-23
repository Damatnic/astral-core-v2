import React, { useState, useEffect, useRef } from 'react';
import './MeditationTimer.css';

interface MeditationPreset {
  name: string;
  duration: number; // in minutes
  description: string;
  icon: string;
  ambientSound?: string;
}

interface MeditationTimerProps {
  onComplete?: (duration: number) => void;
  autoStart?: boolean;
}

const MEDITATION_PRESETS: MeditationPreset[] = [
  { name: 'Quick Reset', duration: 3, description: 'A brief moment of calm', icon: '⚡' },
  { name: 'Mindful Break', duration: 5, description: 'Perfect for work breaks', icon: '☕' },
  { name: 'Daily Practice', duration: 10, description: 'Build your meditation habit', icon: '🌅' },
  { name: 'Deep Focus', duration: 15, description: 'Enhance concentration', icon: '🎯' },
  { name: 'Stress Relief', duration: 20, description: 'Release tension and anxiety', icon: '🌊' },
  { name: 'Extended Session', duration: 30, description: 'Deep meditation practice', icon: '🏔️' }
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Silence', icon: '🔇' },
  { id: 'rain', name: 'Rain', icon: '🌧️', frequency: 200 },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', frequency: 150 },
  { id: 'forest', name: 'Forest', icon: '🌲', frequency: 180 },
  { id: 'bells', name: 'Tibetan Bells', icon: '🔔', frequency: 528 },
  { id: 'whitenoise', name: 'White Noise', icon: '📻', frequency: 100 }
];

const BELL_INTERVALS = [
  { value: 0, label: 'No bells' },
  { value: 1, label: 'Every minute' },
  { value: 3, label: 'Every 3 minutes' },
  { value: 5, label: 'Every 5 minutes' }
];

export const MeditationTimer: React.FC<MeditationTimerProps> = ({ 
  onComplete,
  autoStart = false 
}) => {
  const [selectedPreset, setSelectedPreset] = useState<MeditationPreset>(MEDITATION_PRESETS[2]);
  const [customDuration, setCustomDuration] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [bellInterval, setBellInterval] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bellTimeRef = useRef<number>(0);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.02; // Very low volume for ambient
    }

    // Load stats from localStorage
    const savedStats = localStorage.getItem('meditationStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setSessionCount(stats.sessionCount || 0);
      setTotalMinutes(stats.totalMinutes || 0);
    }

    return () => {
      stopAmbientSound();
    };
  }, []);

  // Play bell sound
  const playBell = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 528; // Solfeggio frequency
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      const now = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
      
      oscillator.start(now);
      oscillator.stop(now + 2);
    } catch (error) {
      console.log('Bell sound not available');
    }
  };

  // Start ambient sound
  const startAmbientSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current || selectedSound.id === 'none') return;
    
    try {
      stopAmbientSound();
      
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = selectedSound.frequency || 200;
      
      // Add some variation for more natural sound
      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = 5;
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      oscillator.connect(gainNodeRef.current);
      
      oscillator.start();
      lfo.start();
      
      oscillatorRef.current = oscillator;
    } catch (error) {
      console.log('Ambient sound not available');
    }
  };

  // Stop ambient sound
  const stopAmbientSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        // Already stopped
      }
    }
  };

  // Handle timer
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          stopAmbientSound();
          playBell(); // Final bell
          
          // Update stats
          const duration = isCustom ? customDuration : selectedPreset.duration;
          const newSessionCount = sessionCount + 1;
          const newTotalMinutes = totalMinutes + duration;
          
          setSessionCount(newSessionCount);
          setTotalMinutes(newTotalMinutes);
          
          localStorage.setItem('meditationStats', JSON.stringify({
            sessionCount: newSessionCount,
            totalMinutes: newTotalMinutes,
            lastSession: new Date().toISOString()
          }));
          
          if (onComplete) onComplete(duration);
          return 0;
        }
        
        // Check for interval bells
        if (bellInterval > 0) {
          const elapsedSeconds = (isCustom ? customDuration * 60 : selectedPreset.duration * 60) - prev + 1;
          if (elapsedSeconds % (bellInterval * 60) === 0 && elapsedSeconds > 0) {
            playBell();
          }
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, bellInterval, customDuration, selectedPreset, isCustom, sessionCount, totalMinutes, onComplete]);

  const handleStart = () => {
    const duration = isCustom ? customDuration : selectedPreset.duration;
    setTimeRemaining(duration * 60);
    setIsActive(true);
    setIsPaused(false);
    bellTimeRef.current = 0;
    playBell(); // Starting bell
    startAmbientSound();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(0);
    stopAmbientSound();
  };

  const handlePresetSelect = (preset: MeditationPreset) => {
    setSelectedPreset(preset);
    setIsCustom(false);
    if (isActive) {
      handleStop();
    }
  };

  const handleCustomDurationChange = (value: number) => {
    setCustomDuration(value);
    setIsCustom(true);
    if (isActive) {
      handleStop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = isCustom ? customDuration * 60 : selectedPreset.duration * 60;
    return ((total - timeRemaining) / total) * 100;
  };

  return (
    <div className="meditation-timer">
      <div className="timer-header">
        <h2>Meditation Timer</h2>
        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="timer-settings">
          <div className="setting-group">
            <label>Ambient Sound</label>
            <div className="sound-options">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  className={`sound-btn ${selectedSound.id === sound.id ? 'active' : ''}`}
                  onClick={() => setSelectedSound(sound)}
                  disabled={isActive}
                >
                  <span className="sound-icon">{sound.icon}</span>
                  <span className="sound-name">{sound.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>Interval Bells</label>
            <div className="bell-options">
              {BELL_INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  className={`bell-btn ${bellInterval === interval.value ? 'active' : ''}`}
                  onClick={() => setBellInterval(interval.value)}
                  disabled={isActive}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="preset-selector">
        <h3>Choose Duration</h3>
        <div className="preset-grid">
          {MEDITATION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={`preset-btn ${!isCustom && selectedPreset.name === preset.name ? 'active' : ''}`}
              onClick={() => handlePresetSelect(preset)}
              disabled={isActive}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-name">{preset.name}</span>
              <span className="preset-duration">{preset.duration} min</span>
              <span className="preset-description">{preset.description}</span>
            </button>
          ))}
        </div>

        <div className="custom-duration">
          <label>Custom Duration (minutes)</label>
          <input
            type="range"
            min="1"
            max="60"
            value={customDuration}
            onChange={(e) => handleCustomDurationChange(Number(e.target.value))}
            disabled={isActive}
          />
          <span className="duration-display">{customDuration} minutes</span>
        </div>
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg className="progress-ring" width="280" height="280">
            <circle
              className="progress-ring-bg"
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              className="progress-ring-progress"
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={`${getProgress() * 8.17} 817`}
              transform="rotate(-90 140 140)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="timer-content">
            {isActive ? (
              <>
                <div className="time-display">{formatTime(timeRemaining)}</div>
                <div className="timer-status">
                  {isPaused ? 'Paused' : 'Meditating'}
                </div>
              </>
            ) : (
              <>
                <div className="ready-display">
                  {isCustom ? `${customDuration} min` : `${selectedPreset.duration} min`}
                </div>
                <div className="ready-text">Ready to begin</div>
              </>
            )}
          </div>
        </div>

        <div className="timer-controls">
          {!isActive ? (
            <button className="control-btn start" onClick={handleStart}>
              ▶️ Start Meditation
            </button>
          ) : (
            <>
              <button className="control-btn pause" onClick={handlePause}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button className="control-btn stop" onClick={handleStop}>
                ⏹️ End Session
              </button>
            </>
          )}
        </div>
      </div>

      <div className="meditation-stats">
        <div className="stat-card">
          <span className="stat-icon">🧘</span>
          <div className="stat-info">
            <span className="stat-value">{sessionCount}</span>
            <span className="stat-label">Sessions</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <div className="stat-info">
            <span className="stat-value">{totalMinutes}</span>
            <span className="stat-label">Total Minutes</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-info">
            <span className="stat-value">{Math.floor(totalMinutes / 60)}</span>
            <span className="stat-label">Hours</span>
          </div>
        </div>
      </div>

      <div className="meditation-tips">
        <h4>Meditation Tips</h4>
        <ul>
          <li>Find a comfortable, quiet space</li>
          <li>Sit with your back straight but relaxed</li>
          <li>Focus on your breath naturally</li>
          <li>When thoughts arise, gently return to breathing</li>
          <li>Be patient and kind with yourself</li>
        </ul>
      </div>
    </div>
  );
};

export default MeditationTimer;