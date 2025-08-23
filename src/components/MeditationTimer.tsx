import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, RefreshIcon, VolumeIcon } from './icons.dynamic';
import './MeditationTimer.css';

interface MeditationTimerProps {
  onComplete?: () => void;
}

const PRESET_TIMES = [
  { minutes: 3, label: '3 min', description: 'Quick reset' },
  { minutes: 5, label: '5 min', description: 'Brief meditation' },
  { minutes: 10, label: '10 min', description: 'Standard session' },
  { minutes: 15, label: '15 min', description: 'Deep relaxation' },
  { minutes: 20, label: '20 min', description: 'Extended practice' },
  { minutes: 30, label: '30 min', description: 'Full session' }
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Silence', emoji: '🔇' },
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'bells', name: 'Tibetan Bowls', emoji: '🔔' },
  { id: 'white', name: 'White Noise', emoji: '📻' }
];

export const MeditationTimer: React.FC<MeditationTimerProps> = ({ onComplete }) => {
  const [selectedTime, setSelectedTime] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [showGuidance, setShowGuidance] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();
  const gainNodeRef = useRef<GainNode>();
  
  useEffect(() => {
    setTimeRemaining(selectedTime * 60);
  }, [selectedTime]);
  
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playCompletionSound();
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onComplete]);
  
  useEffect(() => {
    // Initialize audio context for ambient sounds
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      stopAmbientSound();
    };
  }, []);
  
  useEffect(() => {
    if (isRunning && selectedSound !== 'none') {
      playAmbientSound();
    } else {
      stopAmbientSound();
    }
  }, [isRunning, selectedSound]);
  
  const playAmbientSound = () => {
    if (!audioContextRef.current) return;
    
    stopAmbientSound();
    
    const ctx = audioContextRef.current;
    oscillatorRef.current = ctx.createOscillator();
    gainNodeRef.current = ctx.createGain();
    
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(ctx.destination);
    
    // Configure sound based on selection
    switch (selectedSound) {
      case 'rain':
        oscillatorRef.current.type = 'square';
        oscillatorRef.current.frequency.value = 100;
        gainNodeRef.current.gain.value = 0.01;
        break;
      case 'ocean':
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.value = 50;
        gainNodeRef.current.gain.value = 0.02;
        // Add wave effect
        oscillatorRef.current.frequency.setValueCurveAtTime(
          new Float32Array([50, 60, 50, 40, 50]),
          ctx.currentTime,
          5
        );
        break;
      case 'forest':
        oscillatorRef.current.type = 'triangle';
        oscillatorRef.current.frequency.value = 200;
        gainNodeRef.current.gain.value = 0.005;
        break;
      case 'bells':
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.value = 528; // Love frequency
        gainNodeRef.current.gain.value = 0.02;
        break;
      case 'white':
        // White noise - using a different approach
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gainNodeRef.current);
        gainNodeRef.current.gain.value = 0.01;
        whiteNoise.start();
        return;
    }
    
    oscillatorRef.current.start();
  };
  
  const stopAmbientSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = undefined;
    }
  };
  
  const playCompletionSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Play a pleasant chime sequence
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4); // G5
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  };
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(selectedTime * 60);
    stopAmbientSound();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = () => {
    return ((selectedTime * 60 - timeRemaining) / (selectedTime * 60)) * 100;
  };
  
  const getGuidanceMessage = () => {
    const progress = getProgress();
    if (progress < 10) return "Find a comfortable position and close your eyes...";
    if (progress < 30) return "Focus on your breath, in and out...";
    if (progress < 50) return "Let thoughts pass like clouds in the sky...";
    if (progress < 70) return "Return to your breath when your mind wanders...";
    if (progress < 90) return "You're doing great, stay present...";
    return "Gently prepare to return...";
  };
  
  return (
    <div className="meditation-timer-card">
      <div className="timer-header">
        <h3 className="timer-title">Meditation Timer</h3>
        <p className="timer-subtitle">Find your inner peace</p>
      </div>
      
      {/* Time Selection */}
      {!isRunning && (
        <div className="time-presets">
          {PRESET_TIMES.map(preset => (
            <button
              key={preset.minutes}
              className={`preset-btn ${selectedTime === preset.minutes ? 'active' : ''}`}
              onClick={() => setSelectedTime(preset.minutes)}
            >
              <span className="preset-label">{preset.label}</span>
              <span className="preset-description">{preset.description}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Timer Display */}
      <div className="timer-display-container">
        <div className="timer-circle">
          <svg className="timer-svg" viewBox="0 0 200 200">
            <circle
              className="timer-circle-bg"
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(102, 126, 234, 0.1)"
              strokeWidth="8"
            />
            <circle
              className="timer-circle-progress"
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeDasharray={`${getProgress() * 5.65} 565`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="timer-display">
            <div className="timer-time">{formatTime(timeRemaining)}</div>
            {isRunning && showGuidance && (
              <div className="timer-guidance">{getGuidanceMessage()}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ambient Sounds */}
      <div className="ambient-sounds">
        <h4 className="sounds-title">
          <VolumeIcon className="sounds-icon" />
          Ambient Sound
        </h4>
        <div className="sound-options">
          {AMBIENT_SOUNDS.map(sound => (
            <button
              key={sound.id}
              className={`sound-btn ${selectedSound === sound.id ? 'active' : ''}`}
              onClick={() => setSelectedSound(sound.id)}
              disabled={isRunning}
            >
              <span className="sound-emoji">{sound.emoji}</span>
              <span className="sound-name">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="timer-controls">
        <button
          className="timer-btn primary"
          onClick={toggleTimer}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          className="timer-btn secondary"
          onClick={resetTimer}
        >
          <RefreshIcon />
          <span>Reset</span>
        </button>
      </div>
      
      {/* Settings */}
      <div className="timer-settings">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={showGuidance}
            onChange={(e) => setShowGuidance(e.target.checked)}
          />
          <span>Show guidance messages</span>
        </label>
      </div>
    </div>
  );
};