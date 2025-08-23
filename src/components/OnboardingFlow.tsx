/**
 * Onboarding Flow Component
 * Interactive guided tour for new users with mental health considerations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from './AccessibilityProvider';
import { useFeedback } from './UserFeedback';
import { LoadingButton, ProgressBar } from './LoadingStates';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  skipable?: boolean;
  validation?: () => boolean;
  helpText?: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    role: 'seeker',
    primaryConcerns: [] as string[],
    preferredSupport: [] as string[],
    comfortLevel: 'moderate',
    notifications: true,
    emergencyContact: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { showFeedback } = useFeedback();

  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Astral Core',
      description: 'Your safe space for mental health support',
      content: (
        <div className="onboarding-welcome">
          <div className="onboarding-welcome__icon">
            <HeartIcon size={80} />
          </div>
          <h2>We're here to support you</h2>
          <p>
            Astral Core is a peer support platform where you can connect with others,
            share your experiences, and find the help you need in a safe, judgment-free environment.
          </p>
          <div className="onboarding-features">
            <div className="onboarding-feature">
              <span className="onboarding-feature__icon">🤝</span>
              <span>Peer Support</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature__icon">🔒</span>
              <span>Private & Secure</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature__icon">🆘</span>
              <span>Crisis Resources</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature__icon">💚</span>
              <span>Wellness Tools</span>
            </div>
          </div>
        </div>
      ),
      skipable: false,
    },
    {
      id: 'role-selection',
      title: 'How would you like to participate?',
      description: 'You can change this anytime',
      content: (
        <div className="onboarding-role">
          <div className="role-options">
            <button
              className={userPreferences.role === 'seeker' ? 'role-option selected' : 'role-option'}
              onClick={() => setUserPreferences(prev => ({ ...prev, role: 'seeker' }))}
              aria-pressed={userPreferences.role === 'seeker'}
            >
              <div className="role-option__icon">🌟</div>
              <h3>Seeker</h3>
              <p>Connect with peers and find support for your mental health journey</p>
            </button>
            <button
              className={userPreferences.role === 'helper' ? 'role-option selected' : 'role-option'}
              onClick={() => setUserPreferences(prev => ({ ...prev, role: 'helper' }))}
              aria-pressed={userPreferences.role === 'helper'}
            >
              <div className="role-option__icon">💝</div>
              <h3>Helper</h3>
              <p>Provide support and share your experience to help others</p>
            </button>
            <button
              className={userPreferences.role === 'both' ? 'role-option selected' : 'role-option'}
              onClick={() => setUserPreferences(prev => ({ ...prev, role: 'both' }))}
              aria-pressed={userPreferences.role === 'both'}
            >
              <div className="role-option__icon">🤲</div>
              <h3>Both</h3>
              <p>Switch between seeking support and helping others as needed</p>
            </button>
          </div>
        </div>
      ),
      validation: () => userPreferences.role !== '',
      skipable: false,
    },
    {
      id: 'concerns',
      title: 'What brings you here?',
      description: 'This helps us personalize your experience (optional)',
      content: (
        <div className="onboarding-concerns">
          <p className="privacy-note">
            <span className="privacy-icon">🔒</span>
            Your selections are private and only used to improve your experience
          </p>
          <div className="concern-options">
            {[
              { id: 'anxiety', label: 'Anxiety', icon: '😰' },
              { id: 'depression', label: 'Depression', icon: '😔' },
              { id: 'stress', label: 'Stress', icon: '😣' },
              { id: 'relationships', label: 'Relationships', icon: '💔' },
              { id: 'self-esteem', label: 'Self-esteem', icon: '🪞' },
              { id: 'trauma', label: 'Trauma', icon: '🌧️' },
              { id: 'addiction', label: 'Addiction', icon: '🔄' },
              { id: 'other', label: 'Other', icon: '💭' },
            ].map(concern => (
              <button
                key={concern.id}
                className={`concern-option ${
                  userPreferences.primaryConcerns.includes(concern.id) ? 'selected' : ''
                }`}
                onClick={() => {
                  setUserPreferences(prev => ({
                    ...prev,
                    primaryConcerns: prev.primaryConcerns.includes(concern.id)
                      ? prev.primaryConcerns.filter(c => c !== concern.id)
                      : [...prev.primaryConcerns, concern.id],
                  }));
                }}
                aria-pressed={userPreferences.primaryConcerns.includes(concern.id)}
              >
                <span className="concern-option__icon">{concern.icon}</span>
                <span className="concern-option__label">{concern.label}</span>
              </button>
            ))}
          </div>
        </div>
      ),
      skipable: true,
    },
    {
      id: 'support-preferences',
      title: 'How can we best support you?',
      description: 'Choose your preferred types of support',
      content: (
        <div className="onboarding-support">
          <div className="support-options">
            {[
              { id: 'peer-chat', label: 'Peer Chat', description: 'Connect 1-on-1 with peers', icon: '💬' },
              { id: 'group-support', label: 'Group Support', description: 'Join community discussions', icon: '👥' },
              { id: 'self-help', label: 'Self-Help Tools', description: 'Access wellness resources', icon: '📚' },
              { id: 'crisis-support', label: 'Crisis Support', description: '24/7 emergency resources', icon: '🆘' },
              { id: 'professional', label: 'Professional Resources', description: 'Find therapists and counselors', icon: '👨‍⚕️' },
            ].map(support => (
              <label
                key={support.id}
                className={`support-option ${
                  userPreferences.preferredSupport.includes(support.id) ? 'selected' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={userPreferences.preferredSupport.includes(support.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUserPreferences(prev => ({
                        ...prev,
                        preferredSupport: [...prev.preferredSupport, support.id],
                      }));
                    } else {
                      setUserPreferences(prev => ({
                        ...prev,
                        preferredSupport: prev.preferredSupport.filter(s => s !== support.id),
                      }));
                    }
                  }}
                  aria-label={support.label}
                />
                <div className="support-option__content">
                  <span className="support-option__icon">{support.icon}</span>
                  <div>
                    <h4>{support.label}</h4>
                    <p>{support.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ),
      skipable: true,
    },
    {
      id: 'safety-setup',
      title: 'Your Safety Matters',
      description: 'Set up safety features for your account',
      content: (
        <div className="onboarding-safety">
          <div className="safety-features">
            <div className="safety-feature">
              <h3>🚨 Quick Exit Button</h3>
              <p>
                Press ESC three times quickly to instantly leave the site if you need privacy.
                This feature is always available.
              </p>
            </div>
            <div className="safety-feature">
              <h3>📱 Crisis Hotline Access</h3>
              <p>
                Access crisis resources anytime from the red SOS button in the corner.
                Available 24/7 in multiple languages.
              </p>
            </div>
            <div className="safety-feature">
              <h3>🔔 Check-in Reminders</h3>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={userPreferences.notifications}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: e.target.checked,
                  }))}
                />
                <span>Enable wellness check-in reminders</span>
              </label>
            </div>
            <div className="safety-feature">
              <h3>👤 Emergency Contact (Optional)</h3>
              <input
                type="email"
                placeholder="Trusted contact email"
                value={userPreferences.emergencyContact}
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  emergencyContact: e.target.value,
                }))}
                aria-label="Emergency contact email"
              />
              <p className="help-text">
                We'll only contact them in genuine emergencies with your permission
              </p>
            </div>
          </div>
        </div>
      ),
      skipable: true,
    },
    {
      id: 'comfort-level',
      title: 'Set Your Comfort Level',
      description: 'Control what content you see',
      content: (
        <div className="onboarding-comfort">
          <p>Choose how much potentially triggering content you're comfortable seeing:</p>
          <div className="comfort-levels">
            <label className="comfort-level">
              <input
                type="radio"
                name="comfort"
                value="low"
                checked={userPreferences.comfortLevel === 'low'}
                onChange={() => setUserPreferences(prev => ({ ...prev, comfortLevel: 'low' }))}
              />
              <div className="comfort-level__content">
                <h4>🌱 Gentle</h4>
                <p>Hide potentially triggering content, focus on positive and uplifting posts</p>
              </div>
            </label>
            <label className="comfort-level">
              <input
                type="radio"
                name="comfort"
                value="moderate"
                checked={userPreferences.comfortLevel === 'moderate'}
                onChange={() => setUserPreferences(prev => ({ ...prev, comfortLevel: 'moderate' }))}
              />
              <div className="comfort-level__content">
                <h4>⚖️ Balanced</h4>
                <p>Show most content with trigger warnings where appropriate</p>
              </div>
            </label>
            <label className="comfort-level">
              <input
                type="radio"
                name="comfort"
                value="high"
                checked={userPreferences.comfortLevel === 'high'}
                onChange={() => setUserPreferences(prev => ({ ...prev, comfortLevel: 'high' }))}
              />
              <div className="comfort-level__content">
                <h4>💪 Open</h4>
                <p>Show all content, minimal filtering (you can still report inappropriate content)</p>
              </div>
            </label>
          </div>
        </div>
      ),
      skipable: false,
    },
    {
      id: 'tour-overview',
      title: 'Quick Tour',
      description: 'Let us show you around',
      content: (
        <div className="onboarding-tour">
          <div className="tour-items">
            <div className="tour-item">
              <div className="tour-item__number">1</div>
              <div className="tour-item__content">
                <h4>Dashboard</h4>
                <p>Your personal hub for wellness tracking and quick access to resources</p>
              </div>
            </div>
            <div className="tour-item">
              <div className="tour-item__number">2</div>
              <div className="tour-item__content">
                <h4>Community Feed</h4>
                <p>Connect with others, share experiences, and find support</p>
              </div>
            </div>
            <div className="tour-item">
              <div className="tour-item__number">3</div>
              <div className="tour-item__content">
                <h4>Chat</h4>
                <p>Private conversations with peers or AI-assisted support</p>
              </div>
            </div>
            <div className="tour-item">
              <div className="tour-item__number">4</div>
              <div className="tour-item__content">
                <h4>Wellness Tools</h4>
                <p>Track your mood, practice mindfulness, and build healthy habits</p>
              </div>
            </div>
            <div className="tour-item">
              <div className="tour-item__number">5</div>
              <div className="tour-item__content">
                <h4>Crisis Resources</h4>
                <p>Always accessible emergency support and professional resources</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Start Interactive Tour',
        onClick: async () => {
          localStorage.setItem('show-interactive-tour', 'true');
        },
      },
      skipable: true,
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description: 'Welcome to our community',
      content: (
        <div className="onboarding-complete">
          <div className="complete-icon">🎉</div>
          <h2>Welcome to Astral Core!</h2>
          <p>
            You've completed the setup. Remember, you're not alone in this journey.
            Our community is here to support you every step of the way.
          </p>
          <div className="complete-tips">
            <h3>Getting Started Tips:</h3>
            <ul>
              <li>🌟 Complete your first mood check-in</li>
              <li>💬 Introduce yourself in the community</li>
              <li>📖 Explore self-help resources</li>
              <li>🤝 Connect with a peer supporter</li>
            </ul>
          </div>
          <p className="remember-message">
            Remember: It's okay to not be okay. Take things at your own pace.
          </p>
        </div>
      ),
      skipable: false,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle step navigation
  const goToNextStep = useCallback(async () => {
    if (currentStepData.validation && !currentStepData.validation()) {
      showFeedback({
        type: 'warning',
        message: 'Please complete this step before continuing',
      });
      return;
    }

    if (currentStepData.action) {
      setIsLoading(true);
      try {
        await currentStepData.action.onClick();
      } catch (error) {
        showFeedback({
          type: 'error',
          message: 'An error occurred. Please try again.',
        });
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      announce(`Step ${currentStep + 2} of ${steps.length}: ${steps[currentStep + 1].title}`);
    } else {
      await completeOnboarding();
    }
  }, [currentStep, currentStepData, steps, announce, showFeedback]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      announce(`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].title}`);
    }
  }, [currentStep, steps, announce]);

  const skipCurrentStep = useCallback(() => {
    if (currentStepData.skipable) {
      goToNextStep();
    }
  }, [currentStepData, goToNextStep]);

  const completeOnboarding = async () => {
    setIsLoading(true);
    
    // Save user preferences
    try {
      localStorage.setItem('user-preferences', JSON.stringify(userPreferences));
      localStorage.setItem('onboarding-completed', 'true');
      
      // Track completion
      showFeedback({
        type: 'success',
        message: 'Welcome to Astral Core!',
        description: 'Your preferences have been saved',
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        onComplete();
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      showFeedback({
        type: 'error',
        message: 'Failed to save preferences',
        description: 'But you can continue to the app',
      });
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousStep();
      } else if (e.key === 'Escape' && onSkip) {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStep, goToPreviousStep, onSkip]);

  return (
    <div className="onboarding-flow" role="main" aria-label="Onboarding flow">
      <div className="onboarding-header">
        <ProgressBar
          value={progress}
          max={100}
          label={`Step ${currentStep + 1} of ${steps.length}`}
          showPercentage={false}
        />
        {onSkip && currentStep < steps.length - 1 && (
          <button
            className="onboarding-skip"
            onClick={onSkip}
            aria-label="Skip onboarding"
          >
            Skip for now
          </button>
        )}
      </div>

      <div className="onboarding-content">
        <div className="onboarding-step" key={currentStepData.id}>
          <h1 className="onboarding-step__title">{currentStepData.title}</h1>
          <p className="onboarding-step__description">{currentStepData.description}</p>
          
          <div className="onboarding-step__content">
            {currentStepData.content}
          </div>

          {currentStepData.helpText && (
            <p className="onboarding-step__help">{currentStepData.helpText}</p>
          )}
        </div>
      </div>

      <div className="onboarding-actions">
        {currentStep > 0 && (
          <button
            className="onboarding-action onboarding-action--back"
            onClick={goToPreviousStep}
            disabled={isLoading}
            aria-label="Previous step"
          >
            ← Back
          </button>
        )}
        
        <div className="onboarding-actions__right">
          {currentStepData.skipable && (
            <button
              className="onboarding-action onboarding-action--skip"
              onClick={skipCurrentStep}
              disabled={isLoading}
            >
              Skip
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <LoadingButton
              loading={isLoading}
              onClick={goToNextStep}
              className="onboarding-action onboarding-action--next"
              variant="primary"
            >
              Continue →
            </LoadingButton>
          ) : (
            <LoadingButton
              loading={isLoading}
              onClick={completeOnboarding}
              className="onboarding-action onboarding-action--complete"
              variant="primary"
            >
              Get Started
            </LoadingButton>
          )}
        </div>
      </div>
    </div>
  );
};

// Heart Icon Component
const HeartIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default OnboardingFlow;