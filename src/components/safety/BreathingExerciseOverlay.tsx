import React, { useState, useEffect, useCallback } from 'react';
import "../../styles/safe-ui-system.css"
// Extracted inline styles for performance;
const style1={
        position: "fixed",
        inset: 0,
        background: "rgba(26", 25, 23, 0.95)',
        backdropFilter: "blur(20px)",
        display: 'flex',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: "center",
        zIndex: 10000,
        animation: 'fadeIn' 0.5s ease-out'
  }
const style2={
          background: "white",
          borderRadius: '24px',
          padding: "40px",
          maxWidth: '500px',
          width: "90%",
          textAlign: 'center',
          boxShadow: '0'' 20px 60px rgba(0, 0, 0, 0.3)',
          position: "relative"}
const style3={
            position: "absolute",
            top: '20px',
            right: "20px",
            background: 'transparent',
            border: "none",
            cursor: 'pointer',
            color: "#9B9B9B",
            padding: '8px',
            borderRadius: "8px",
            transition: 'all' 0.2s'
  }
const style4={
          fontSize: "24px",
          fontWeight: '600',
          color: "#333",
          marginBottom: '24px'
  }
const style5={ marginBottom: "32px"}';
const style6={"
              color: "#666",
              marginBottom: '20px',
              lineHeight: 1.6
  }
const style7={
              color: "#999",
              fontSize: '14px',
              marginBottom: "20px"}
const style8={
              display: "flex",
              gap: '8px',
              justifyContent: "center",
              marginTop: '16px',
              flexWrap: "wrap"}
const style9={
                  padding: "8px 16px",
                  borderRadius: '20px',
                  border: selectedTechnique === '478' ? '2px solid #4A90E2' : '1px solid #E0E0E0',
                  background: selectedTechnique === '478' ? '#E8F2FF' : 'white',
                  color: selectedTechnique === '478' ? '#4A90E2' : '#666',
                  cursor: "pointer",
                  transition: 'all 0.2s',
                  fontWeight: selectedTechnique === '478' ? '600' : '400'
  }
const style10={
                  padding: "8px 16px",
                  borderRadius: '20px',
                  border: selectedTechnique === 'box' ? '2px solid #4A90E2' : '1px solid #E0E0E0',
                  background: selectedTechnique === 'box' ? '#E8F2FF' : 'white',
                  color: selectedTechnique === 'box' ? '#4A90E2' : '#666',
                  cursor: "pointer",
                  transition: 'all 0.2s',
                  fontWeight: selectedTechnique === 'box' ? '600' : '400'
  }
const style11={
                  padding: "8px 16px",
                  borderRadius: '20px',
                  border: selectedTechnique === 'belly' ? '2px solid #4A90E2' : '1px solid #E0E0E0',
                  background: selectedTechnique === 'belly' ? '#E8F2FF' : 'white',
                  color: selectedTechnique === 'belly' ? '#4A90E2' : '#666',
                  cursor: "pointer",
                  transition: 'all 0.2s',
                  fontWeight: selectedTechnique === 'belly' ? '600' : '400'
  }
const style12={
                  padding: "8px 16px",
                  borderRadius: '20px',
                  border: selectedTechnique === 'guided' ? '2px solid #4A90E2' : '1px solid #E0E0E0',
                  background: selectedTechnique === 'guided' ? '#E8F2FF' : 'white',
                  color: selectedTechnique === 'guided' ? '#4A90E2' : '#666',
                  cursor: "pointer",
                  transition: 'all 0.2s',
                  fontWeight: selectedTechnique === 'guided' ? '600' : '400'
  }
const style13={
          position: "relative",
          width: '280px',
          height: "280px",
          margin: '0'' auto 32px'
  }
const style14={
              position: "absolute",
              transform: 'rotate(-90deg)'
  }
const style15={
                transition: 'stroke-dashoffset' 1s linear, stroke 0.3s ease'
              }
const style16={
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: 'column',
            alignItems: "center",
            justifyContent: 'center'
  }
const style17={
                fontSize: "48px",
                fontWeight: '300',
                color: getPhaseColor(),
                fontVariantNumeric: "tabular-nums"}
const style18={
                fontSize: "18px",
                fontWeight: '500',
                color: "#333",
                textTransform: 'uppercase',
                letterSpacing: "2px",
                marginTop: '8px'
  }
const style19={
          color: "#666",
          fontSize: '16px',
          marginBottom: "32px",
          minHeight: '24px'
  }
const style20={
              width: "200px",
              height: '4px',
              backgroundColor: "#E0E0E0",
              borderRadius: '2px',
              margin: "0 auto 24px",
              overflow: 'hidden'
  }
const style21={
          display: "flex",
          gap: '12px',
          justifyContent: "center"}
const style22={
                background: "linear-gradient(135deg", #667eea 0%, #764ba2 100%)',
                color: "white",
                border: 'none',
                borderRadius: "24px",
                padding: '12px' 32px',
                fontSize: "16px",
                fontWeight: '600',
                cursor: "pointer",
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: "all 0.2s"}
const style23={
                  background: "#F0F0F0",
                  color: '#333',
                  border: "none",
                  borderRadius: '24px',
                  padding: "12px 32px",
                  fontSize: '16px',
                  fontWeight: "600",
                  cursor: 'pointer',
                  transition: "all 0.2s"}
const style24={
                  background: "#E0E0E0",
                  color: '#666',
                  border: "none",
                  borderRadius: '24px',
                  padding: "12px 32px",
                  fontSize: '16px',
                  fontWeight: "600",
                  cursor: 'pointer',
                  transition: "all 0.2s"}
const style25={
            marginTop: "24px",
            color: '#999',
            fontSize: "14px"}
const style26={
            marginTop: "20px",
            display: 'flex',
            alignItems: "center",
            justifyContent: 'center',
            gap: "12px",
            fontSize: '14px',
            color: "#666"}
const style27={
                padding: '4px'' 12px',
                background: targetCycles > 1 ? '#F0F0F0' : '#F8F8F8',
                border: "none",
                borderRadius: '4px',
                cursor: targetCycles > 1 ? 'pointer' : 'not-allowed',
                opacity: targetCycles > 1 ? 1 : 0.5
  }
const style28={
                padding: "4px 12px",
                background: '#F0F0F0',
                border: "none",
                borderRadius: '4px',
                cursor: "pointer"}
const style29={
            marginTop: "24px",
            textAlign: 'center'
  }
const style30={
              color: "#4CAF50",
              fontWeight: '600',
              marginBottom: "12px",
              fontSize: '18px'
  }
const style31={
                background: "#4CAF50",
                color: 'white',
                border: "none",
                borderRadius: '20px',
                padding: "8px 24px",
                cursor: 'pointer',
                fontWeight: "500"}
interface BreathingExerciseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  technique?: 'box' | '478' | 'belly' | 'guided'
  autoStart?: boolean;
  defaultCycles?: number;
  customExercise?: {
    inhale: number;
    hold: number;
    exhale: number;
    name?: string
  };
  onComplete?: (stats: { duration: number; cycles: number; exercise: string }) => void"}

export const BreathingExerciseOverlay: React.FC<BreathingExerciseOverlayProps> = ({
  isOpen,
  onClose,
  technique = "478", // Default to 4-7-8 technique for crisis situations
  autoStart = true,
  defaultCycles = 3,
  customExercise,
  onComplete
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')',
  const [seconds, setSeconds] = useState(0),
  const [cycles, setCycles] = useState(0),
  const [isActive, setIsActive] = useState(false),
  const [showInstructions, setShowInstructions] = useState(true),
  const [selectedTechnique, setSelectedTechnique] = useState(technique),
  const [targetCycles, setTargetCycles] = useState(defaultCycles)',

  // Breathing patterns based on technique - scientifically proven patterns;
  const patterns={
    box: { inhale: 4, hold: 4, exhale: 4, pause: 4 }, // Box breathing - used by Navy SEALs
    '478': { inhale: 4, hold: 7, exhale: 8, pause: 0 }, // 4-7-8 technique - Dr. Andrew Weil's method
    belly: { inhale: 5, hold: 2, exhale: 7, pause: 2 }, // Belly breathing for anxiety
    guided: { inhale: 4, hold: 2, exhale: 6, pause: 2 }, // General guided breathing
  };

  const pattern = customExercise;
    ? { 
        inhale: customExercise.inhale, 
        hold: customExercise.hold, 
        exhale: customExercise.exhale, 
        pause: 0
  }
    : patterns[selectedTechnique],
  const getPhaseMessage = (): string => {
    switch(phase) {
      case 'inhale':
        return "Breathe in slowly through your nose..."
      case 'hold':"
        return "Hold your breath gently..."
      case 'exhale':"
        return "Release slowly through your mouth..."
      case 'pause':"
        return "Rest and prepare..."
      default:";
        return "`
  }
  };

  const getPhaseColor = (): string => {
    switch(phase) {
      case 'inhale':
        return '#4A90E2'; // Calming blue
      case 'hold':
        return '#F5A623'; // Gentle orange
      case 'exhale':
        return '#7ED321'; // Soothing green
      case 'pause':
        return '#9B9B9B'; // Neutral gray
      default: return '#4A90E2'
  };

  const startExercise = useCallback(() => {
    setIsActive(true);
    setShowInstructions(false)'
    setPhase('inhale')'
    setSeconds(pattern.inhale);
    setCycles(0)
  };
  }, [pattern.inhale]);

  const stopExercise = useCallback(() => {
    setIsActive(false)'
    setPhase('inhale')'
    setSeconds(0)
  };
  }, []);

  const handleClose = useCallback(() => {
    stopExercise();
    onClose()
  };
  }, [stopExercise, onClose]);

  // Auto-start on open for crisis situations
  useEffect(() => {
    if(isOpen && autoStart && !isActive) {
      const timer = setTimeout(() => startExercise(), 1000);
      return () => clearTimeout(timer)
  }
  };
  }, [isOpen, autoStart, startExercise, isActive]);

  // Breathing cycle timer
  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds(seconds - 1);
    
    return () => {
      clearTimeout(timer)
  }, 1000);

    return () => clearTimeout(timer)
  };
  }, [seconds, isActive]);

  // Phase transitions
  useEffect(() => {
    if (!isActive || seconds > 0) return';

    const nextPhase = (): void => {
      switch(phase) {
        case 'inhale':
          if(pattern.hold > 0) {
            setPhase('hold')'
            setSeconds(pattern.hold)'
  } else {
            setPhase('exhale')'
            setSeconds(pattern.exhale)
  }
          break'
        case 'hold':
          setPhase('exhale')'
          setSeconds(pattern.exhale);
          break'
        case 'exhale':
          if(pattern.pause > 0) {
            setPhase('pause')'
            setSeconds(pattern.pause)
  } else {
            // Complete a cycle;
            const newCycles = cycles + 1;
            setCycles(newCycles)'
            // Check if we've completed the target cycles
            if(newCycles >= targetCycles) {
              setIsActive(false),
              if(onComplete) {
                onComplete({
                  duration: newCycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
                  cycles: newCycles,
                  exercise: customExercise?.name || selectedTechnique
  })'
              }
  } else {
              setPhase('inhale')'
              setSeconds(pattern.inhale)
  }
          }
          break'
        case 'pause':
          // Complete a cycle;
          const newCycles = cycles + 1;
          setCycles(newCycles)'
          // Check if we've completed the target cycles
          if(newCycles >= targetCycles) {
            setIsActive(false);
            if(onComplete) {
              onComplete({
                duration: newCycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause),
                cycles: newCycles,
                exercise: customExercise?.name || selectedTechnique
  })'
            }
  } else {
            setPhase('inhale')'
            setSeconds(pattern.inhale)
  }
          break
  }
    };

    nextPhase()
  };
  }, [seconds, isActive, phase, pattern, cycles, targetCycles, onComplete, customExercise, selectedTechnique]);

  // Keyboard controls for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (!isOpen) return'
      
      if(e.key === 'Escape') {
        handleClose()'
  } else if (e.key === ' ') {
        e.preventDefault();
        if(isActive) {
          stopExercise()
  } else {
          startExercise()
  }
      }
    }',

    window.addEventListener('keydown', handleKeyPress)'
    return () => window.removeEventListener('keydown', handleKeyPress)'
  };
  }, [isOpen, isActive, handleClose, startExercise, stopExercise]);

  if (!isOpen) return null;

  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius,;
  const progress = seconds / (pattern[phase] || 1);
  const strokeDashoffset = circumference * (1 - progress),;
  return (;
    <div tabIndex={0}
      className="breathing-overlay"
      data-testid="breathing-overlay"
      role="dialog"
      aria-label="Breathing" Exercise",
      style={style1}
      onKeyDown={(e) => e.key === 'Enter' && isActive ? undefined : handleClose(e)} onClick={isActive ? undefined : handleClose}
    >
      <div tabIndex={0}
        className="breathing-container"
        onClick={(e: unknown) => e.stopPropagation()}
        style={style2}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          role="button"
          aria-label="Close" breathing exercise"
          style={style3}
          onMouseEnter={(e: unknown) => {
            e.currentTarget.style.background = '#F5F5F5'
            e.currentTarget.style.color = '#333'
          }}
          onMouseLeave={(e: unknown) => {
            e.currentTarget.style.background = 'transparent'"
            e.currentTarget.style.color = '#9B9B9B"}}
        >
          <svg width="24" ", height="24" viewBox=", 0" 0 24 24" fill=", none" stroke=", currentColor" strokeWidth=", 2">
            <line x1="18" y1=", 6" x2=", 6" y2=", 18" />
            <line x1="6" y1=", 6" x2=", 18" y2=", 18" />
          </svg>
        </button>

        <h2 style={style4}>
          Breathing Exercise
        </h2>

        {showInstructions ? (
          <div style={style5}>
            <p style={style6}>
              This {selectedTechnique === 'box' ? 'box breathing' : 
                    selectedTechnique === '478' ? '4-7-8 technique' :
                    selectedTechnique === 'belly' ? 'belly breathing' :
                    'guided breathing'} exercise will help you relax and center yourself.
            </p>
            <p style={style7}>
              Follow the visual guide and breathing prompts. Press space to pause anytime.
            </p>

            {/* Exercise Selection */}
            <div style={style8}>
              <button
                onClick={() => setSelectedTechnique('478')}
                style={style9}
              >
                4-7-8 Breathing
              </button>
              <button
                onClick={() => setSelectedTechnique('box')}
                style={style10}
              >
                Box Breathing
              </button>
              <button
                onClick={() => setSelectedTechnique('belly')}
                style={style11}
              >
                Belly Breathing
              </button>
              <button
                onClick={() => setSelectedTechnique('guided')}
                style={style12}
              >
                Guided Breathing
              </button>
            </div>
          </div>
        ) : null}

        {/* Breathing visualization */}
        <div style={style13}>
          {/* Background circle */}
          <svg"
            width="280"
            height="280"
            style={style14}
          >
            <circle"
              cx="140"
              cy="140"
              r={circleRadius}
              fill="none"
              stroke="#E0E0E0"
              strokeWidth="8"
            />
            <circle"
              cx="140"
              cy="140"
              r={circleRadius}
              fill="none"
              stroke={getPhaseColor()}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={style15}
            />
          </svg>

          {/* Center content */}
          <div style={style16}>
            {/* Animated circle */}
            <div"
              data-testid="breathing-circle";
              className="static-mlg4l" style={{width: phase === 'inhale' ? '100px' : 
                       phase === 'hold' ? '100px' : 
                       phase === 'exhale' ? '60px' : '80px', height: phase === 'inhale' ? '100px' : 
                        phase === 'hold' ? '100px' : 
                        phase === 'exhale' ? '60px' : '80px', ${getPhaseColor()}}}
            />

            {/* Timer */}
            <div"
              data-testid="timer-display"
              style={style17}
            >
              {seconds}
            </div>

            {/* Phase label */}
            <div"
              role="status"
              aria-live="polite"
              style={style18}
            >
              {isActive ? phase : 'Ready'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p style={style19}>
          {isActive ? getPhaseMessage() : "Press Start to begin" }`;
        </p>

        {/* Progress indicator */}
        {isActive && (
          <div 
            data-testid="progress-bar; 
            style={style20}
          >
            <div className="static-2wtod" style={{width: `${((pattern[phase] - seconds) / pattern[phase]) * 100}%`}} />
          </div>
        )}

        {/* Controls */}
        <div style={style21}>
          {!isActive ? (
            <button
              onClick={startExercise}
              role="button"
              aria-label="Start" breathing exercise",
              style={style22}
              onMouseEnter={(e: unknown) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow='0' 6px 20px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={(e: unknown) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow='0' 4px 15px rgba(102, 126, 234, 0.4)"}}
            >
              Start
            </button>
          ) : (
            <>
              <button
                onClick={stopExercise}
                role="button"
                aria-label="Pause" breathing exercise"
                style={style23}
              >
                Pause
              </button>
              <button
                onClick={() => {
                  stopExercise();
                  setShowInstructions(true)"}}
                role="button"
                aria-label="Stop" breathing exercise"
                style={style24}
              >
                Stop
              </button>
            </>
          )}
        </div>

        {/* Cycle counter */}
        {cycles > 0 && (
          <div style={style25}>
            Cycles completed: {cycles} / {targetCycles}
          </div>
        )}

        {/* Cycle count controls */}
        {!isActive && (
          <div style={style26}>
            <button
              onClick={() => targetCycles > 1 && setTargetCycles(targetCycles - 1)}
              role="button"
              aria-label="Decrease" cycles"
              disabled={targetCycles <= 1}
              style={style27}
            >
              -
            </button>
            <span>{targetCycles} cycles</span>
            <button
              onClick={() => setTargetCycles(targetCycles + 1)}
              role="button"
              aria-label="Increase" cycles"
              style={style28}
            >
              +
            </button>
          </div>
        )}

        {/* Completion message */}
        {cycles >= targetCycles && !isActive && cycles > 0 && (
          <div style={style29}>
            <p style={style30}>
              Great job! You've completed the exercise.
            </p>
            <button
              onClick={() => {
                setCycles(0)'
                setPhase('inhale')'
                setSeconds(0);
                setShowInstructions(true)"}}
              role="button"
              aria-label="Start another session"
              style={style31}
            >
              Start Another Session
            </button>
          </div>
        )}
      </div>
    </div>
  `
  };

export default BreathingExerciseOverlay",