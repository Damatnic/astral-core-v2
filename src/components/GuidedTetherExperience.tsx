import React, { useState, useEffect } from 'react';
import { HeartIcon, LinkIcon, SparkleIcon, ShieldIcon, ActivityIcon } from './icons.dynamic';
import './GuidedTetherExperience.css';

interface GuidedExperience {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  type: 'breathing' | 'grounding' | 'connection' | 'affirmation';
  icon: React.ReactNode;
  steps: ExperienceStep[];
}

interface ExperienceStep {
  instruction: string;
  duration: number; // seconds
  action?: 'breathe' | 'visualize' | 'send' | 'receive';
  visual?: string;
}

const experiences: GuidedExperience[] = [
  {
    id: 'sync-breathing',
    name: 'Synchronized Breathing',
    description: 'Breathe together in perfect harmony',
    duration: 5,
    type: 'breathing',
    icon: <ActivityIcon />,
    steps: [
      { instruction: 'Get comfortable and close your eyes', duration: 10, action: 'visualize' },
      { instruction: 'Feel your partner\'s presence', duration: 10, action: 'receive' },
      { instruction: 'Breathe in together... 4 seconds', duration: 4, action: 'breathe', visual: 'inhale' },
      { instruction: 'Hold together... 7 seconds', duration: 7, action: 'breathe', visual: 'hold' },
      { instruction: 'Exhale together... 8 seconds', duration: 8, action: 'breathe', visual: 'exhale' },
      { instruction: 'Rest... 2 seconds', duration: 2, action: 'breathe', visual: 'rest' }
    ]
  },
  {
    id: 'heart-connection',
    name: 'Heart Connection',
    description: 'Send and receive compassionate energy',
    duration: 3,
    type: 'connection',
    icon: <HeartIcon />,
    steps: [
      { instruction: 'Place your hand on your heart', duration: 10, action: 'visualize' },
      { instruction: 'Feel warmth and compassion building', duration: 15, action: 'visualize' },
      { instruction: 'Send loving energy to your partner', duration: 20, action: 'send', visual: 'pulse' },
      { instruction: 'Receive their caring energy back', duration: 20, action: 'receive', visual: 'glow' },
      { instruction: 'Let the connection strengthen you both', duration: 15, action: 'visualize' }
    ]
  },
  {
    id: 'grounding-together',
    name: 'Grounding Together',
    description: 'Find stability through shared presence',
    duration: 4,
    type: 'grounding',
    icon: <ShieldIcon />,
    steps: [
      { instruction: 'Notice 5 things you can see', duration: 20, action: 'visualize' },
      { instruction: 'Share this awareness with your partner', duration: 10, action: 'send' },
      { instruction: 'Touch 4 different textures around you', duration: 20, action: 'visualize' },
      { instruction: 'Listen for 3 sounds in your environment', duration: 15, action: 'visualize' },
      { instruction: 'Notice 2 scents near you', duration: 10, action: 'visualize' },
      { instruction: 'Focus on 1 taste in your mouth', duration: 5, action: 'visualize' },
      { instruction: 'You are grounded and connected', duration: 10, action: 'receive' }
    ]
  },
  {
    id: 'affirmation-exchange',
    name: 'Affirmation Exchange',
    description: 'Share strength through positive words',
    duration: 3,
    type: 'affirmation',
    icon: <SparkleIcon />,
    steps: [
      { instruction: 'Think of your partner\'s strength', duration: 15, action: 'visualize' },
      { instruction: 'Send them: "You are brave"', duration: 10, action: 'send', visual: 'message' },
      { instruction: 'Receive their affirmation for you', duration: 10, action: 'receive', visual: 'message' },
      { instruction: 'Send them: "You are not alone"', duration: 10, action: 'send', visual: 'message' },
      { instruction: 'Feel the truth of these words', duration: 15, action: 'visualize' },
      { instruction: 'Let hope fill your heart', duration: 10, action: 'receive', visual: 'glow' }
    ]
  }
];

interface GuidedTetherExperienceProps {
  onExperienceComplete?: (experienceId: string) => void;
  partnerName?: string;
  isConnected?: boolean;
}

export const GuidedTetherExperience: React.FC<GuidedTetherExperienceProps> = ({
  onExperienceComplete,
  partnerName = 'your partner',
  isConnected = false
}) => {
  const [selectedExperience, setSelectedExperience] = useState<GuidedExperience | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  
  useEffect(() => {
    if (!isActive || !selectedExperience) return;
    
    const currentStep = selectedExperience.steps[currentStepIndex];
    const progressInterval = setInterval(() => {
      setStepProgress(prev => {
        const newProgress = prev + (100 / (currentStep.duration * 10)); // Update every 100ms
        if (newProgress >= 100) {
          // Move to next step
          if (currentStepIndex < selectedExperience.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            return 0;
          } else {
            // Experience complete
            completeExperience();
            return 100;
          }
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(progressInterval);
  }, [isActive, currentStepIndex, selectedExperience]);
  
  useEffect(() => {
    if (!selectedExperience) return;
    
    const completedSteps = currentStepIndex;
    const totalSteps = selectedExperience.steps.length;
    const currentStepCompletion = stepProgress / 100;
    
    setTotalProgress(((completedSteps + currentStepCompletion) / totalSteps) * 100);
  }, [currentStepIndex, stepProgress, selectedExperience]);
  
  const startExperience = (experience: GuidedExperience) => {
    setSelectedExperience(experience);
    setCurrentStepIndex(0);
    setStepProgress(0);
    setTotalProgress(0);
    setIsActive(true);
  };
  
  const pauseExperience = () => {
    setIsActive(false);
  };
  
  const resumeExperience = () => {
    setIsActive(true);
  };
  
  const stopExperience = () => {
    setIsActive(false);
    setSelectedExperience(null);
    setCurrentStepIndex(0);
    setStepProgress(0);
    setTotalProgress(0);
  };
  
  const completeExperience = () => {
    if (selectedExperience) {
      onExperienceComplete?.(selectedExperience.id);
    }
    setIsActive(false);
    setTimeout(() => {
      setSelectedExperience(null);
      setCurrentStepIndex(0);
      setStepProgress(0);
      setTotalProgress(0);
    }, 2000);
  };
  
  const getVisualElement = (visual?: string) => {
    switch (visual) {
      case 'inhale':
        return <div className="breath-circle expanding">Inhale</div>;
      case 'hold':
        return <div className="breath-circle holding">Hold</div>;
      case 'exhale':
        return <div className="breath-circle contracting">Exhale</div>;
      case 'rest':
        return <div className="breath-circle resting">Rest</div>;
      case 'pulse':
        return <div className="energy-pulse outgoing">💝</div>;
      case 'glow':
        return <div className="energy-glow incoming">✨</div>;
      case 'message':
        return <div className="affirmation-bubble">💬</div>;
      default:
        return null;
    }
  };
  
  if (!selectedExperience) {
    return (
      <div className="guided-experience-selector">
        <div className="selector-header">
          <h3 className="selector-title">
            <LinkIcon className="selector-icon" />
            Guided Tether Experiences
          </h3>
          <p className="selector-subtitle">
            {isConnected 
              ? `Choose an experience to share with ${partnerName}`
              : 'Select an experience to practice solo'}
          </p>
        </div>
        
        <div className="experience-grid">
          {experiences.map(experience => (
            <button
              key={experience.id}
              className="experience-card"
              onClick={() => startExperience(experience)}
            >
              <div className="experience-icon">{experience.icon}</div>
              <h4 className="experience-name">{experience.name}</h4>
              <p className="experience-description">{experience.description}</p>
              <div className="experience-meta">
                <span className="experience-duration">
                  🕐 {experience.duration} min
                </span>
                <span className="experience-type">
                  {experience.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  const currentStep = selectedExperience.steps[currentStepIndex];
  
  return (
    <div className="guided-experience-player">
      <div className="player-header">
        <h3 className="player-title">{selectedExperience.name}</h3>
        <div className="player-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStepIndex + 1} of {selectedExperience.steps.length}
          </span>
        </div>
      </div>
      
      <div className="experience-stage">
        <div className="visual-container">
          {getVisualElement(currentStep.visual)}
        </div>
        
        <div className="instruction-container">
          <p className="instruction-text">{currentStep.instruction}</p>
          
          {currentStep.action && (
            <div className={`action-indicator action-${currentStep.action}`}>
              {currentStep.action === 'send' && '→ Sending energy'}
              {currentStep.action === 'receive' && '← Receiving energy'}
              {currentStep.action === 'breathe' && '🫁 Breathing'}
              {currentStep.action === 'visualize' && '👁️ Visualizing'}
            </div>
          )}
        </div>
        
        <div className="step-progress-container">
          <div className="step-progress-bar">
            <div 
              className="step-progress-fill"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="player-controls">
        {isActive ? (
          <>
            <button className="control-btn pause" onClick={pauseExperience}>
              ⏸️ Pause
            </button>
            <button className="control-btn stop" onClick={stopExperience}>
              ⏹️ Stop
            </button>
          </>
        ) : (
          <>
            <button className="control-btn resume" onClick={resumeExperience}>
              ▶️ Resume
            </button>
            <button className="control-btn stop" onClick={stopExperience}>
              ⏹️ End
            </button>
          </>
        )}
      </div>
      
      {totalProgress >= 100 && (
        <div className="completion-message">
          <SparkleIcon className="completion-icon" />
          <p>Experience complete! You did wonderfully.</p>
        </div>
      )}
    </div>
  );
};