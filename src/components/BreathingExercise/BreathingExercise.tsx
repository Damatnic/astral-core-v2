import React, { useState, useEffect, useRef } from 'react';
import './BreathingExercise.css';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: 'Box Breathing',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: 'Equal intervals for calm and focus'
  },
  {
    name: '4-7-8 Relaxation',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: 'Quick relaxation and sleep aid'
  },
  {
    name: 'Calm Breathing',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    description: 'Simple pattern for anxiety relief'
  },
  {
    name: 'Energizing Breath',
    inhale: 6,
    hold1: 2,
    exhale: 3,
    hold2: 1,
    description: 'Boost energy and alertness'
  }
];

interface BreathingExerciseProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ 
  onComplete, 
  autoStart = false 
}) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0]);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [countdown, setCountdown] = useState(selectedPattern.inhale);
  const [cycles, setCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.05; // Low volume
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
    };
  }, []);

  // Play sound feedback
  const playSound = (frequency: number, duration: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    try {
      // Create new oscillator
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNodeRef.current);
      
      // Fade in and out
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.setValueAtTime(0, now);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.log('Audio playback not available');
    }
  };

  // Handle breathing cycle
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          setPhase((currentPhase) => {
            let nextPhase: typeof phase;
            let nextDuration: number;
            
            switch (currentPhase) {
              case 'inhale':
                nextPhase = selectedPattern.hold1 > 0 ? 'hold1' : 'exhale';
                nextDuration = selectedPattern.hold1 > 0 ? selectedPattern.hold1 : selectedPattern.exhale;
                playSound(440, 0.1); // A4 note
                break;
              case 'hold1':
                nextPhase = 'exhale';
                nextDuration = selectedPattern.exhale;
                break;
              case 'exhale':
                nextPhase = selectedPattern.hold2 > 0 ? 'hold2' : 'inhale';
                nextDuration = selectedPattern.hold2 > 0 ? selectedPattern.hold2 : selectedPattern.inhale;
                playSound(330, 0.1); // E4 note
                break;
              case 'hold2':
                nextPhase = 'inhale';
                nextDuration = selectedPattern.inhale;
                // Complete one cycle
                setCycles((prev) => {
                  const newCycles = prev + 1;
                  if (newCycles >= targetCycles) {
                    setIsActive(false);
                    playSound(523, 0.3); // C5 note - completion
                    if (onComplete) onComplete();
                  }
                  return newCycles;
                });
                break;
              default:
                nextPhase = 'inhale';
                nextDuration = selectedPattern.inhale;
            }
            
            // Skip phases with 0 duration
            if (nextDuration === 0) {
              if (nextPhase === 'hold1') {
                return 'exhale';
              } else if (nextPhase === 'hold2') {
                setCycles((prev) => {
                  const newCycles = prev + 1;
                  if (newCycles >= targetCycles) {
                    setIsActive(false);
                    playSound(523, 0.3);
                    if (onComplete) onComplete();
                  }
                  return newCycles;
                });
                return 'inhale';
              }
            }
            
            return nextPhase;
          });
          
          // Return the new countdown value
          if (phase === 'inhale' && selectedPattern.hold1 > 0) return selectedPattern.hold1;
          if (phase === 'inhale' && selectedPattern.hold1 === 0) return selectedPattern.exhale;
          if (phase === 'hold1') return selectedPattern.exhale;
          if (phase === 'exhale' && selectedPattern.hold2 > 0) return selectedPattern.hold2;
          if (phase === 'exhale' && selectedPattern.hold2 === 0) return selectedPattern.inhale;
          if (phase === 'hold2') return selectedPattern.inhale;
          return selectedPattern.inhale;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, phase, selectedPattern, targetCycles, onComplete]);

  const handleStart = () => {
    setCycles(0);
    setPhase('inhale');
    setCountdown(selectedPattern.inhale);
    setIsActive(true);
    setIsPaused(false);
    playSound(523, 0.1); // Start sound
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setCycles(0);
    setPhase('inhale');
    setCountdown(selectedPattern.inhale);
  };

  const handlePatternChange = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    if (isActive) {
      handleStop();
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold1':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'hold2':
        return 'Hold';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 1;
    
    switch (phase) {
      case 'inhale':
        return 1 + (1 - countdown / selectedPattern.inhale) * 0.4;
      case 'hold1':
        return 1.4;
      case 'exhale':
        return 1.4 - (1 - countdown / selectedPattern.exhale) * 0.4;
      case 'hold2':
        return 1;
      default:
        return 1;
    }
  };

  return (
    <div className="breathing-exercise">
      <div className="breathing-header">
        <h2>Breathing Exercise</h2>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="breathing-settings">
          <div className="pattern-selector">
            <label>Pattern:</label>
            <div className="pattern-buttons">
              {BREATHING_PATTERNS.map((pattern) => (
                <button
                  key={pattern.name}
                  className={`pattern-btn ${selectedPattern.name === pattern.name ? 'active' : ''}`}
                  onClick={() => handlePatternChange(pattern)}
                  disabled={isActive}
                >
                  <span className="pattern-name">{pattern.name}</span>
                  <span className="pattern-desc">{pattern.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cycles-selector">
            <label>Target Cycles: {targetCycles}</label>
            <input
              type="range"
              min="3"
              max="10"
              value={targetCycles}
              onChange={(e) => setTargetCycles(Number(e.target.value))}
              disabled={isActive}
            />
          </div>
        </div>
      )}

      <div className="breathing-visualization">
        <div className="breathing-circle-container">
          <div 
            className={`breathing-circle ${phase}`}
            style={{ transform: `scale(${getCircleScale()})` }}
          >
            <div className="breathing-inner-circle">
              {isActive && (
                <>
                  <div className="phase-text">{getPhaseText()}</div>
                  <div className="countdown-text">{countdown}</div>
                </>
              )}
              {!isActive && (
                <div className="start-text">Click Start</div>
              )}
            </div>
          </div>
          
          {/* Progress ring */}
          <svg className="progress-ring" width="300" height="300">
            <circle
              className="progress-ring-bg"
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              className="progress-ring-progress"
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeDasharray={`${(cycles / targetCycles) * 880} 880`}
              transform="rotate(-90 150 150)"
            />
          </svg>
        </div>

        <div className="breathing-info">
          <div className="pattern-info">
            <h3>{selectedPattern.name}</h3>
            <p>{selectedPattern.description}</p>
            <div className="pattern-timing">
              <span>In: {selectedPattern.inhale}s</span>
              {selectedPattern.hold1 > 0 && <span>Hold: {selectedPattern.hold1}s</span>}
              <span>Out: {selectedPattern.exhale}s</span>
              {selectedPattern.hold2 > 0 && <span>Hold: {selectedPattern.hold2}s</span>}
            </div>
          </div>

          <div className="progress-info">
            <div className="cycles-counter">
              <span className="cycles-label">Cycles:</span>
              <span className="cycles-value">{cycles} / {targetCycles}</span>
            </div>
            {isActive && (
              <div className="time-remaining">
                {Math.ceil(((targetCycles - cycles) * 
                  (selectedPattern.inhale + selectedPattern.hold1 + 
                   selectedPattern.exhale + selectedPattern.hold2)) / 60)} min remaining
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="breathing-controls">
        {!isActive ? (
          <button className="control-btn start-btn" onClick={handleStart}>
            ▶️ Start Exercise
          </button>
        ) : (
          <>
            <button className="control-btn pause-btn" onClick={handlePause}>
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button className="control-btn stop-btn" onClick={handleStop}>
              ⏹️ Stop
            </button>
          </>
        )}
      </div>

      <div className="breathing-tips">
        <h4>Tips for Better Breathing:</h4>
        <ul>
          <li>Find a comfortable seated position</li>
          <li>Keep your back straight but relaxed</li>
          <li>Breathe through your nose if possible</li>
          <li>Focus on deep belly breathing</li>
          <li>Let thoughts pass without judgment</li>
        </ul>
      </div>
    </div>
  );
};

export default BreathingExercise;