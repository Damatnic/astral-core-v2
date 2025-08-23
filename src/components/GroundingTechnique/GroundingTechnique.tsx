import React, { useState } from 'react';
import './GroundingTechnique.css';

interface GroundingTechniqueProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export const GroundingTechnique: React.FC<GroundingTechniqueProps> = ({ 
  onComplete,
  autoStart = false 
}) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[][]>([[], [], [], [], []]);
  const [isStarted, setIsStarted] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    { 
      number: 5, 
      sense: 'things you can SEE', 
      icon: '👁️', 
      placeholder: 'e.g., a blue wall, a lamp',
      color: '#3b82f6',
      tips: 'Look around and notice colors, shapes, and textures'
    },
    { 
      number: 4, 
      sense: 'things you can TOUCH', 
      icon: '✋', 
      placeholder: 'e.g., your chair, soft fabric',
      color: '#10b981',
      tips: 'Feel different textures - smooth, rough, warm, cool'
    },
    { 
      number: 3, 
      sense: 'things you can HEAR', 
      icon: '👂', 
      placeholder: 'e.g., birds chirping, fan noise',
      color: '#8b5cf6',
      tips: 'Listen for both near and distant sounds'
    },
    { 
      number: 2, 
      sense: 'things you can SMELL', 
      icon: '👃', 
      placeholder: 'e.g., coffee, fresh air',
      color: '#f59e0b',
      tips: 'Take deep breaths and notice any scents'
    },
    { 
      number: 1, 
      sense: 'thing you can TASTE', 
      icon: '👅', 
      placeholder: 'e.g., mint, coffee',
      color: '#ef4444',
      tips: 'Notice the taste in your mouth or take a sip of water'
    }
  ];

  const handleStart = () => {
    setIsStarted(true);
    setStep(0);
    setResponses([[], [], [], [], []]);
    setIsCompleted(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResponses([[], [], [], [], []]);
    setIsCompleted(false);
    setIsStarted(false);
  };

  const handleInputChange = (index: number, value: string) => {
    const newResponses = [...responses];
    if (!newResponses[step]) {
      newResponses[step] = [];
    }
    newResponses[step][index] = value;
    setResponses(newResponses);
  };

  const isStepComplete = () => {
    const currentResponses = responses[step] || [];
    const requiredCount = steps[step].number;
    const filledCount = currentResponses.filter(r => r && r.trim()).length;
    return filledCount >= Math.ceil(requiredCount / 2); // At least half filled
  };

  const calculateProgress = () => {
    const totalSteps = steps.length;
    const completedSteps = step + (isStepComplete() ? 1 : 0);
    return (completedSteps / totalSteps) * 100;
  };

  if (!isStarted) {
    return (
      <div className="grounding-technique">
        <div className="grounding-intro">
          <div className="intro-icon">🌳</div>
          <h2 className="intro-title">5-4-3-2-1 Grounding Technique</h2>
          <p className="intro-description">
            This exercise helps bring you back to the present moment by engaging all five senses.
            It's particularly helpful for anxiety, panic attacks, or when you're feeling overwhelmed.
          </p>
          <div className="intro-benefits">
            <h3>Benefits:</h3>
            <ul>
              <li>Reduces anxiety and panic</li>
              <li>Brings focus to the present</li>
              <li>Interrupts anxious thought patterns</li>
              <li>Grounds you in reality</li>
            </ul>
          </div>
          <button className="start-button" onClick={handleStart}>
            Begin Exercise
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="grounding-technique">
        <div className="completion-screen">
          <div className="completion-icon">🎉</div>
          <h2 className="completion-title">Well Done!</h2>
          <p className="completion-message">
            You've successfully completed the grounding exercise.
            Take a moment to notice how you feel now.
          </p>
          <div className="completion-summary">
            <h3>Your Grounding Summary:</h3>
            {steps.map((s, idx) => (
              <div key={idx} className="summary-item">
                <span className="summary-icon">{s.icon}</span>
                <span className="summary-count">
                  {(responses[idx] || []).filter(r => r && r.trim()).length} {s.sense.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="completion-actions">
            <button className="action-button primary" onClick={handleReset}>
              Try Again
            </button>
            {onComplete && (
              <button className="action-button secondary" onClick={onComplete}>
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[step];

  return (
    <div className="grounding-technique">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${calculateProgress()}%`,
              backgroundColor: currentStep.color 
            }}
          />
        </div>
        <div className="step-indicators">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`step-dot ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
              style={{ 
                backgroundColor: index <= step ? steps[index].color : '#e5e7eb' 
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="step-content">
        <div className="step-header" style={{ borderColor: currentStep.color }}>
          <div className="step-icon" style={{ color: currentStep.color }}>
            {currentStep.icon}
          </div>
          <h2 className="step-title">
            Name {currentStep.number} {currentStep.sense}
          </h2>
          <p className="step-tip">{currentStep.tips}</p>
        </div>

        <div className="input-grid">
          {Array.from({ length: currentStep.number }).map((_, index) => (
            <div key={index} className="input-wrapper">
              <span className="input-number" style={{ color: currentStep.color }}>
                {index + 1}
              </span>
              <input
                type="text"
                className="grounding-input"
                placeholder={currentStep.placeholder}
                value={responses[step]?.[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                style={{ borderColor: responses[step]?.[index] ? currentStep.color : '#e5e7eb' }}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          <button 
            className="nav-button previous" 
            onClick={handlePrevious}
            disabled={step === 0}
          >
            ← Previous
          </button>
          
          <div className="step-counter">
            Step {step + 1} of {steps.length}
          </div>

          <button 
            className="nav-button next" 
            onClick={handleNext}
            style={{ 
              backgroundColor: isStepComplete() ? currentStep.color : '#9ca3af' 
            }}
          >
            {step === steps.length - 1 ? 'Complete' : 'Next'} →
          </button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="quick-tips">
        <h4>Remember:</h4>
        <ul>
          <li>There are no wrong answers</li>
          <li>Take your time with each sense</li>
          <li>Focus on your breathing</li>
          <li>Be present in this moment</li>
        </ul>
      </div>
    </div>
  );
};

export default GroundingTechnique;