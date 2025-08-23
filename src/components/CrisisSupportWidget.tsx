import React, { useState } from 'react';
import { PhoneIcon, HeartIcon, ShieldIcon, ClockIcon, ChatIcon, SparkleIcon } from './icons.dynamic';
import './CrisisSupportWidget.css';

interface QuickHelpOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  type: 'call' | 'text' | 'navigate' | 'exercise';
  priority: boolean;
}

export const CrisisSupportWidget: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);
  
  const groundingSteps = [
    { sense: 'See', count: 5, prompt: 'Name 5 things you can see around you', icon: '👁️' },
    { sense: 'Touch', count: 4, prompt: 'Touch 4 things and describe their texture', icon: '✋' },
    { sense: 'Hear', count: 3, prompt: 'Listen for 3 sounds you can hear', icon: '👂' },
    { sense: 'Smell', count: 2, prompt: 'Notice 2 things you can smell', icon: '👃' },
    { sense: 'Taste', count: 1, prompt: 'Focus on 1 thing you can taste', icon: '👅' }
  ];
  
  const quickHelpOptions: QuickHelpOption[] = [
    {
      icon: <PhoneIcon />,
      title: 'Call 988',
      description: 'Immediate crisis support',
      action: () => window.open('tel:988', '_blank'),
      type: 'call',
      priority: true
    },
    {
      icon: <ChatIcon />,
      title: 'Text HOME to 741741',
      description: 'Crisis text support',
      action: () => window.open('sms:741741?body=HOME', '_blank'),
      type: 'text',
      priority: true
    },
    {
      icon: <HeartIcon />,
      title: 'Breathing Exercise',
      description: 'Calm your anxiety',
      action: () => setActiveExercise('breathing'),
      type: 'exercise',
      priority: false
    },
    {
      icon: <SparkleIcon />,
      title: 'Grounding Exercise',
      description: '5-4-3-2-1 technique',
      action: () => {
        setShowGrounding(true);
        setGroundingStep(0);
      },
      type: 'exercise',
      priority: false
    },
    {
      icon: <ShieldIcon />,
      title: 'My Safety Plan',
      description: 'Access your personal plan',
      action: () => window.location.href = '#/safety-plan',
      type: 'navigate',
      priority: false
    },
    {
      icon: <ClockIcon />,
      title: 'Quiet Space',
      description: 'Find a moment of peace',
      action: () => window.location.href = '#/quiet-space',
      type: 'navigate',
      priority: false
    }
  ];
  
  const affirmations = [
    "You are stronger than you know",
    "This feeling will pass",
    "You deserve support and care",
    "It's okay to ask for help",
    "You matter and you belong",
    "Tomorrow is a new day",
    "You've survived difficult times before",
    "Your feelings are valid"
  ];
  
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  
  const nextAffirmation = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };
  
  return (
    <div className="crisis-support-widget">
      <div className="widget-header">
        <div className="pulse-indicator">
          <span className="pulse-dot"></span>
        </div>
        <h2 className="widget-title">
          <HeartIcon className="widget-icon" />
          You&apos;re Not Alone
        </h2>
      </div>
      
      <div className="affirmation-banner" onClick={nextAffirmation}>
        <p className="affirmation-text">
          💙 {affirmations[currentAffirmation]}
        </p>
        <span className="affirmation-hint">Tap for another</span>
      </div>
      
      <div className="quick-help-grid">
        {quickHelpOptions.map((option, index) => (
          <button
            key={index}
            className={`quick-help-btn ${option.priority ? 'priority' : ''} ${option.type}`}
            onClick={option.action}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="btn-icon">{option.icon}</div>
            <div className="btn-content">
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
            {option.priority && <span className="urgent-badge">Immediate</span>}
          </button>
        ))}
      </div>
      
      {showGrounding && (
        <div className="grounding-overlay">
          <div className="grounding-modal">
            <h3>Grounding Exercise</h3>
            <div className="grounding-step">
              <div className="step-icon">{groundingSteps[groundingStep].icon}</div>
              <div className="step-content">
                <h4>{groundingSteps[groundingStep].sense}</h4>
                <p>{groundingSteps[groundingStep].prompt}</p>
                <div className="step-counter">
                  {Array.from({ length: groundingSteps[groundingStep].count }, (_, i) => (
                    <span key={i} className="count-dot"></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grounding-actions">
              {groundingStep < groundingSteps.length - 1 ? (
                <button 
                  className="next-step-btn"
                  onClick={() => setGroundingStep(groundingStep + 1)}
                >
                  Next Step →
                </button>
              ) : (
                <button 
                  className="complete-btn"
                  onClick={() => {
                    setShowGrounding(false);
                    setGroundingStep(0);
                  }}
                >
                  Complete ✓
                </button>
              )}
              <button 
                className="close-btn"
                onClick={() => {
                  setShowGrounding(false);
                  setGroundingStep(0);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeExercise === 'breathing' && (
        <div className="breathing-mini-widget">
          <div className="breathing-animation">
            <div className="breath-circle"></div>
            <p className="breath-instruction">Breathe with the circle</p>
          </div>
          <button 
            className="close-exercise"
            onClick={() => setActiveExercise(null)}
          >
            Close
          </button>
        </div>
      )}
      
      <div className="remember-section">
        <p className="remember-text">
          <ShieldIcon className="remember-icon" />
          Remember: Reaching out for help is a sign of strength, not weakness.
        </p>
      </div>
    </div>
  );
};