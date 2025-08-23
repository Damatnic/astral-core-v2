import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { HeartIcon, PauseIcon, PlayIcon } from './icons.dynamic';
import './BreathingWidget.css';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: '4-7-8 Relaxation',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: 'Calms the nervous system and reduces anxiety'
  },
  {
    name: 'Box Breathing',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: 'Used by Navy SEALs for focus and calm'
  },
  {
    name: 'Coherent Breathing',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    description: 'Balances the autonomic nervous system'
  },
  {
    name: 'Quick Relief',
    inhale: 2,
    hold1: 2,
    exhale: 4,
    hold2: 0,
    description: 'Fast anxiety relief in stressful moments'
  }
];

export const BreathingWidget: React.FC<{ 
  embedded?: boolean;
  onComplete?: () => void;
  autoStart?: boolean;
}> = ({ embedded = false, onComplete, autoStart = false }) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0]);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const phaseTimeRef = useRef(0);
  const totalPhaseTimeRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      startBreathing();
    } else {
      stopBreathing();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, selectedPattern]);

  const startBreathing = () => {
    setShowInstructions(false);
    phaseTimeRef.current = 0;
    totalPhaseTimeRef.current = selectedPattern.inhale;
    setCurrentPhase('inhale');
    setProgress(0);
    
    intervalRef.current = setInterval(() => {
      phaseTimeRef.current += 0.1;
      const phaseProgress = (phaseTimeRef.current / totalPhaseTimeRef.current) * 100;
      setProgress(Math.min(phaseProgress, 100));
      
      if (phaseTimeRef.current >= totalPhaseTimeRef.current) {
        moveToNextPhase();
      }
    }, 100);
  };

  const moveToNextPhase = () => {
    const phases: ('inhale' | 'hold1' | 'exhale' | 'hold2')[] = ['inhale', 'hold1', 'exhale', 'hold2'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % 4;
    const nextPhase = phases[nextIndex];
    
    // Skip phases with 0 duration
    if (nextPhase === 'hold1' && selectedPattern.hold1 === 0) {
      setCurrentPhase('exhale');
      totalPhaseTimeRef.current = selectedPattern.exhale;
    } else if (nextPhase === 'hold2' && selectedPattern.hold2 === 0) {
      setCurrentPhase('inhale');
      totalPhaseTimeRef.current = selectedPattern.inhale;
      setCycles(prev => prev + 1);
      checkCompletion();
    } else {
      setCurrentPhase(nextPhase);
      totalPhaseTimeRef.current = selectedPattern[nextPhase];
    }
    
    phaseTimeRef.current = 0;
    setProgress(0);
  };

  const stopBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentPhase('inhale');
    setProgress(0);
  };

  const checkCompletion = () => {
    if (cycles >= 3 && onComplete) {
      setIsActive(false);
      onComplete();
    }
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return `Breathe In... ${selectedPattern.inhale}s`;
      case 'hold1':
        return `Hold... ${selectedPattern.hold1}s`;
      case 'exhale':
        return `Breathe Out... ${selectedPattern.exhale}s`;
      case 'hold2':
        return `Hold... ${selectedPattern.hold2}s`;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return '#4CAF50';
      case 'hold1':
      case 'hold2':
        return '#FFC107';
      case 'exhale':
        return '#2196F3';
    }
  };

  if (embedded) {
    return (
      <div className="breathing-widget-embedded">
        <div className="breathing-mini">
          <button
            className="breathing-mini-toggle"
            onClick={() => setIsActive(!isActive)}
            aria-label={isActive ? 'Stop breathing exercise' : 'Start breathing exercise'}
          >
            <HeartIcon className="breathing-mini-icon" />
            {isActive && (
              <div className="breathing-mini-pulse" style={{ backgroundColor: getPhaseColor() }} />
            )}
          </button>
          {isActive && (
            <div className="breathing-mini-text">
              {getPhaseInstruction()}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="breathing-widget-card">
      <div className="breathing-header">
        <h3 className="breathing-title">
          <HeartIcon className="breathing-icon" />
          Guided Breathing Exercise
        </h3>
        <p className="breathing-subtitle">
          Take a moment to center yourself with controlled breathing
        </p>
      </div>

      {showInstructions && !isActive && (
        <div className="breathing-instructions">
          <p>Choose a breathing pattern that suits your needs:</p>
        </div>
      )}

      {!isActive && (
        <div className="pattern-selector">
          {breathingPatterns.map((pattern) => (
            <button
              key={pattern.name}
              className={selectedPattern.name === pattern.name ? 'pattern-option selected' : 'pattern-option'}
              onClick={() => setSelectedPattern(pattern)}
            >
              <div className="pattern-name">{pattern.name}</div>
              <div className="pattern-timing">
                {pattern.inhale}-{pattern.hold1 || 0}-{pattern.exhale}-{pattern.hold2 || 0}
              </div>
              <div className="pattern-description">{pattern.description}</div>
            </button>
          ))}
        </div>
      )}

      {isActive && (
        <div className="breathing-visualization">
          <div className="breathing-circle-container">
            <div 
              className={`breathing-circle ${currentPhase}`}
              style={{ 
                transform: `scale(${currentPhase === 'inhale' ? 1 + (progress / 200) : 1 - (progress / 400)})`,
                backgroundColor: getPhaseColor()
              }}
            >
              <div className="breathing-circle-inner">
                <div className="phase-text">{getPhaseInstruction()}</div>
                <div className="cycle-count">Cycle {cycles + 1}/4</div>
              </div>
            </div>
            <svg className="breathing-progress-ring" width="300" height="300">
              <circle
                className="progress-ring-bg"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
              />
              <circle
                className="progress-ring-fill"
                stroke={getPhaseColor()}
                strokeWidth="4"
                fill="transparent"
                r="140"
                cx="150"
                cy="150"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                transform="rotate(-90 150 150)"
              />
            </svg>
          </div>
          
          <div className="breathing-tips">
            <p className="tip-text">
              {currentPhase === 'inhale' && "Breathe in slowly through your nose"}
              {currentPhase === 'hold1' && "Gently hold your breath"}
              {currentPhase === 'exhale' && "Release slowly through your mouth"}
              {currentPhase === 'hold2' && "Rest before the next breath"}
            </p>
          </div>
        </div>
      )}

      <div className="breathing-controls">
        <button
          className={isActive ? 'breathing-button stop' : 'breathing-button start'}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? (
            <>
              <PauseIcon />
              <span>Stop Exercise</span>
            </>
          ) : (
            <>
              <PlayIcon />
              <span>Start Breathing</span>
            </>
          )}
        </button>
        
        {cycles > 0 && (
          <div className="breathing-stats">
            <span className="stat-item">
              <HeartIcon className="stat-icon" />
              {cycles} cycles completed
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};