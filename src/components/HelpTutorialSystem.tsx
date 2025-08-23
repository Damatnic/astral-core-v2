/**
 * Help & Tutorial System Component
 * Comprehensive interactive help system with guided tours, tooltips, and contextual assistance
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccessibility } from './AccessibilityProvider';
import { useFeedback } from './UserFeedback';
import { Spinner } from './LoadingStates';

// Types for the help system
interface HelpTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'basics' | 'features' | 'wellness' | 'safety' | 'troubleshooting' | 'accessibility';
  tags: string[];
  relatedTopics?: string[];
  videoUrl?: string;
  screenshots?: string[];
}

interface TutorialStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  skipable?: boolean;
  highlightTarget?: boolean;
}

interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  requiredPath?: string;
  estimatedTime?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface TooltipData {
  id: string;
  selector: string;
  content: string;
  showOnHover?: boolean;
  showOnFocus?: boolean;
  delay?: number;
}

interface HelpSystemConfig {
  showTutorialOnFirstVisit?: boolean;
  enableTooltips?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableContextualHelp?: boolean;
  autoShowHelpForNewFeatures?: boolean;
}

interface HelpTutorialSystemProps {
  config?: HelpSystemConfig;
  userId?: string;
}

const HelpTutorialSystem: React.FC<HelpTutorialSystemProps> = ({
  config = {
    showTutorialOnFirstVisit: true,
    enableTooltips: true,
    enableKeyboardShortcuts: true,
    enableContextualHelp: true,
    autoShowHelpForNewFeatures: true,
  },
  userId,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<HelpTopic[]>([]);
  const [viewedTopics, setViewedTopics] = useState<Set<string>>(new Set());
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { showFeedback } = useFeedback();
  const helpPanelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Help topics database
  const helpTopics: HelpTopic[] = [
    // Basics
    {
      id: 'getting-started',
      title: 'Getting Started with Astral Core',
      description: 'Learn the basics of using our mental health support platform',
      content: `
        Welcome to Astral Core! Here's how to get started:
        
        1. **Complete Your Profile**: Add information about yourself to get personalized support
        2. **Explore Features**: Check out our wellness tools, community feed, and chat features
        3. **Connect with Peers**: Join support groups or start private conversations
        4. **Track Your Wellness**: Use our mood tracker and wellness assessments
        5. **Access Crisis Resources**: Find the red SOS button for immediate help
        
        Remember, you're not alone in this journey!
      `,
      category: 'basics',
      tags: ['beginner', 'start', 'new user', 'introduction'],
      relatedTopics: ['profile-setup', 'navigation', 'community-guidelines'],
    },
    {
      id: 'profile-setup',
      title: 'Setting Up Your Profile',
      description: 'Customize your profile for a personalized experience',
      content: `
        Your profile helps us provide better support:
        
        - **Privacy Settings**: Control who can see your information
        - **Support Preferences**: Choose how you want to receive help
        - **Emergency Contacts**: Add trusted contacts for crisis situations
        - **Comfort Level**: Set content filtering preferences
        - **Availability**: Let others know when you're available to chat
      `,
      category: 'basics',
      tags: ['profile', 'settings', 'privacy', 'preferences'],
      relatedTopics: ['privacy-settings', 'safety-features'],
    },
    
    // Features
    {
      id: 'mood-tracking',
      title: 'Using the Mood Tracker',
      description: 'Track your emotional wellbeing over time',
      content: `
        The mood tracker helps you understand patterns:
        
        1. **Daily Check-ins**: Log your mood multiple times a day
        2. **Emotion Tags**: Add specific emotions you're feeling
        3. **Triggers**: Note what influenced your mood
        4. **Patterns**: View trends and insights over time
        5. **Share with Therapist**: Export data for professional sessions
      `,
      category: 'features',
      tags: ['mood', 'tracking', 'wellness', 'emotions'],
      videoUrl: '/tutorials/mood-tracker.mp4',
      relatedTopics: ['wellness-tools', 'data-export'],
    },
    {
      id: 'peer-chat',
      title: 'Connecting Through Peer Chat',
      description: 'How to use our peer support chat system',
      content: `
        Connect with others who understand:
        
        - **Finding Peers**: Browse profiles or get matched automatically
        - **Starting Conversations**: Send a friendly introduction
        - **Chat Safety**: Report inappropriate behavior immediately
        - **Voice/Video**: Upgrade to voice or video when comfortable
        - **Group Chats**: Join topic-based support groups
      `,
      category: 'features',
      tags: ['chat', 'peer support', 'communication', 'connection'],
      relatedTopics: ['community-guidelines', 'safety-features', 'reporting'],
    },
    
    // Wellness
    {
      id: 'crisis-resources',
      title: 'Accessing Crisis Resources',
      description: 'Get immediate help when you need it most',
      content: `
        **If you're in immediate danger, call 911 or your local emergency number.**
        
        Crisis resources available 24/7:
        
        - **SOS Button**: Red button in corner for immediate help
        - **Crisis Hotlines**: Direct connection to trained counselors
        - **Text Support**: SMS-based crisis intervention
        - **Warm Lines**: Non-crisis emotional support
        - **Local Resources**: Find nearby mental health services
        
        We're here for you. You don't have to face this alone.
      `,
      category: 'safety',
      tags: ['crisis', 'emergency', 'help', 'support', 'suicide prevention'],
      relatedTopics: ['safety-features', 'emergency-contacts'],
    },
    {
      id: 'mindfulness-exercises',
      title: 'Mindfulness and Breathing Exercises',
      description: 'Calming techniques for anxiety and stress',
      content: `
        Practice mindfulness with our guided exercises:
        
        1. **Breathing Exercises**: 4-7-8 technique, box breathing
        2. **Body Scan**: Progressive muscle relaxation
        3. **Guided Meditation**: Audio sessions from 5-30 minutes
        4. **Grounding Techniques**: 5-4-3-2-1 sensory exercise
        5. **Visualization**: Peaceful imagery exercises
      `,
      category: 'wellness',
      tags: ['mindfulness', 'meditation', 'breathing', 'relaxation', 'anxiety'],
      videoUrl: '/tutorials/mindfulness.mp4',
      relatedTopics: ['anxiety-management', 'stress-relief'],
    },
    
    // Safety
    {
      id: 'privacy-settings',
      title: 'Managing Your Privacy',
      description: 'Control your information and visibility',
      content: `
        Your privacy is our priority:
        
        - **Profile Visibility**: Choose who sees your profile
        - **Anonymous Mode**: Participate without revealing identity
        - **Data Control**: Download or delete your data anytime
        - **Blocking**: Block users who make you uncomfortable
        - **Content Filtering**: Hide potentially triggering content
      `,
      category: 'safety',
      tags: ['privacy', 'security', 'anonymous', 'safety'],
      relatedTopics: ['data-export', 'blocking-users', 'content-filtering'],
    },
    {
      id: 'quick-exit',
      title: 'Using the Quick Exit Feature',
      description: 'Leave the site instantly for your safety',
      content: `
        The Quick Exit feature helps maintain your privacy:
        
        **How to use:**
        - Press ESC three times quickly
        - Click the Quick Exit button (if visible)
        - Use keyboard shortcut: Ctrl+Shift+Q
        
        **What happens:**
        - Instantly redirects to Google homepage
        - Clears your current session
        - Doesn't save browsing history
        
        Perfect for shared or monitored devices.
      `,
      category: 'safety',
      tags: ['exit', 'escape', 'privacy', 'safety', 'emergency'],
      relatedTopics: ['privacy-settings', 'session-management'],
    },
    
    // Accessibility
    {
      id: 'keyboard-navigation',
      title: 'Keyboard Navigation Guide',
      description: 'Navigate the platform without a mouse',
      content: `
        Full keyboard accessibility:
        
        **Navigation:**
        - Tab: Move forward through elements
        - Shift+Tab: Move backward
        - Enter: Activate buttons/links
        - Space: Check boxes, activate buttons
        - Arrow keys: Navigate menus and lists
        
        **Shortcuts:**
        - Alt+H: Open help
        - Alt+S: Search
        - Alt+M: Main menu
        - Alt+C: Open chat
        - Ctrl+/: Show all shortcuts
      `,
      category: 'accessibility',
      tags: ['keyboard', 'shortcuts', 'navigation', 'accessibility'],
      relatedTopics: ['screen-readers', 'accessibility-features'],
    },
  ];

  // Tutorials database
  const tutorials: Tutorial[] = [
    {
      id: 'platform-tour',
      name: 'Platform Tour',
      description: 'A complete walkthrough of Astral Core features',
      estimatedTime: 5,
      difficulty: 'beginner',
      steps: [
        {
          id: 'welcome',
          target: 'body',
          title: 'Welcome to Astral Core',
          content: 'Let\'s take a quick tour of the platform. You can exit anytime by pressing ESC.',
          position: 'center',
          skipable: true,
        },
        {
          id: 'navigation',
          target: '.main-nav',
          title: 'Main Navigation',
          content: 'Use these links to access different sections of the platform.',
          position: 'bottom',
          highlightTarget: true,
        },
        {
          id: 'dashboard',
          target: '.dashboard-widget',
          title: 'Your Dashboard',
          content: 'Your personal hub for tracking wellness and accessing quick features.',
          position: 'right',
          highlightTarget: true,
        },
        {
          id: 'crisis-button',
          target: '.crisis-button',
          title: 'Crisis Support',
          content: 'This red button is always available for immediate help.',
          position: 'left',
          highlightTarget: true,
        },
        {
          id: 'chat',
          target: '.chat-icon',
          title: 'Chat Feature',
          content: 'Connect with peers or AI support through our chat system.',
          position: 'left',
          highlightTarget: true,
        },
      ],
    },
    {
      id: 'mood-tracker-tutorial',
      name: 'Mood Tracking Tutorial',
      description: 'Learn how to track and understand your emotional patterns',
      estimatedTime: 3,
      difficulty: 'beginner',
      requiredPath: '/wellness/mood',
      steps: [
        {
          id: 'mood-intro',
          target: '.mood-tracker',
          title: 'Mood Tracker',
          content: 'Track your emotional wellbeing to identify patterns and triggers.',
          position: 'center',
        },
        {
          id: 'mood-scale',
          target: '.mood-scale',
          title: 'Rate Your Mood',
          content: 'Use the scale from 1-10 to rate how you\'re feeling right now.',
          position: 'top',
          highlightTarget: true,
        },
        {
          id: 'emotion-tags',
          target: '.emotion-tags',
          title: 'Add Emotions',
          content: 'Select specific emotions to better describe your mood.',
          position: 'bottom',
          highlightTarget: true,
        },
        {
          id: 'mood-notes',
          target: '.mood-notes',
          title: 'Add Notes',
          content: 'Write about what\'s influencing your mood (optional but helpful).',
          position: 'top',
          highlightTarget: true,
        },
        {
          id: 'mood-history',
          target: '.mood-history',
          title: 'View History',
          content: 'See your mood patterns over time with charts and insights.',
          position: 'left',
          highlightTarget: true,
        },
      ],
    },
    {
      id: 'crisis-intervention-tutorial',
      name: 'Crisis Support Guide',
      description: 'Understanding crisis features and how to get help',
      estimatedTime: 2,
      difficulty: 'beginner',
      steps: [
        {
          id: 'crisis-intro',
          target: 'body',
          title: 'Crisis Support Available 24/7',
          content: 'We\'re here to help. Let\'s review the crisis support features.',
          position: 'center',
        },
        {
          id: 'sos-button',
          target: '.crisis-button',
          title: 'SOS Button',
          content: 'Click this for immediate access to crisis resources and hotlines.',
          position: 'left',
          highlightTarget: true,
        },
        {
          id: 'crisis-chat',
          target: '.crisis-chat-option',
          title: 'Crisis Chat',
          content: 'Connect instantly with trained crisis counselors.',
          position: 'bottom',
          highlightTarget: true,
        },
        {
          id: 'safety-plan',
          target: '.safety-plan-link',
          title: 'Safety Planning',
          content: 'Create a personalized safety plan for difficult moments.',
          position: 'right',
          highlightTarget: true,
        },
      ],
    },
  ];

  // Tooltips database
  const tooltips: TooltipData[] = [
    {
      id: 'mood-tracker-tooltip',
      selector: '.mood-tracker-button',
      content: 'Track your mood daily to identify patterns',
      showOnHover: true,
      delay: 1000,
    },
    {
      id: 'crisis-button-tooltip',
      selector: '.crisis-button',
      content: 'Get immediate help - available 24/7',
      showOnHover: true,
      showOnFocus: true,
      delay: 500,
    },
    {
      id: 'chat-tooltip',
      selector: '.chat-icon',
      content: 'Connect with peers or AI support',
      showOnHover: true,
      delay: 1000,
    },
  ];

  // Keyboard shortcuts
  const keyboardShortcuts = [
    { keys: ['Alt', 'H'], action: 'Open Help', category: 'Navigation' },
    { keys: ['Alt', 'S'], action: 'Search', category: 'Navigation' },
    { keys: ['Alt', 'M'], action: 'Main Menu', category: 'Navigation' },
    { keys: ['Alt', 'C'], action: 'Open Chat', category: 'Communication' },
    { keys: ['Alt', 'D'], action: 'Dashboard', category: 'Navigation' },
    { keys: ['Ctrl', '/'], action: 'Show Shortcuts', category: 'Help' },
    { keys: ['Ctrl', 'Shift', 'Q'], action: 'Quick Exit', category: 'Safety' },
    { keys: ['ESC', 'ESC', 'ESC'], action: 'Emergency Exit', category: 'Safety' },
    { keys: ['Ctrl', 'K'], action: 'Command Palette', category: 'Navigation' },
    { keys: ['Alt', '1-9'], action: 'Quick Navigate', category: 'Navigation' },
  ];

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem(`help-system-${userId}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      setViewedTopics(new Set(state.viewedTopics || []));
      setCompletedTutorials(new Set(state.completedTutorials || []));
    }

    // Check if should show tutorial on first visit
    const hasVisited = localStorage.getItem('has-visited');
    if (!hasVisited && config.showTutorialOnFirstVisit) {
      localStorage.setItem('has-visited', 'true');
      startTutorial('platform-tour');
    }
  }, [userId, config.showTutorialOnFirstVisit]);

  // Save state
  useEffect(() => {
    const state = {
      viewedTopics: Array.from(viewedTopics),
      completedTutorials: Array.from(completedTutorials),
    };
    localStorage.setItem(`help-system-${userId}`, JSON.stringify(state));
  }, [userId, viewedTopics, completedTutorials]);

  // Search functionality
  const searchHelp = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = helpTopics.filter(topic => {
      const matchesQuery = 
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.description.toLowerCase().includes(lowerQuery) ||
        topic.content.toLowerCase().includes(lowerQuery) ||
        topic.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
      
      return matchesQuery && matchesCategory;
    });

    setSearchResults(results);
  }, [selectedCategory]);

  // Tutorial management
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (!tutorial) return;

    // Check if on required path
    if (tutorial.requiredPath && location.pathname !== tutorial.requiredPath) {
      showFeedback({
        type: 'info',
        message: `Navigating to ${tutorial.requiredPath} to start the tutorial`,
      });
      navigate(tutorial.requiredPath);
      setTimeout(() => startTutorial(tutorialId), 500);
      return;
    }

    setActiveTutorial(tutorial);
    setCurrentTutorialStep(0);
    announce(`Starting tutorial: ${tutorial.name}`);
  }, [location.pathname, navigate, announce, showFeedback]);

  const nextTutorialStep = useCallback(() => {
    if (!activeTutorial) return;

    if (currentTutorialStep < activeTutorial.steps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
      const nextStep = activeTutorial.steps[currentTutorialStep + 1];
      announce(`Step ${currentTutorialStep + 2}: ${nextStep.title}`);
    } else {
      completeTutorial();
    }
  }, [activeTutorial, currentTutorialStep]);

  const previousTutorialStep = useCallback(() => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
      const prevStep = activeTutorial!.steps[currentTutorialStep - 1];
      announce(`Step ${currentTutorialStep}: ${prevStep.title}`);
    }
  }, [activeTutorial, currentTutorialStep]);

  const completeTutorial = useCallback(() => {
    if (!activeTutorial) return;

    setCompletedTutorials(prev => new Set(prev).add(activeTutorial.id));
    showFeedback({
      type: 'success',
      message: 'Tutorial completed!',
      description: `You've completed the ${activeTutorial.name} tutorial`,
    });
    setActiveTutorial(null);
    setCurrentTutorialStep(0);
  }, [activeTutorial, showFeedback]);

  const exitTutorial = useCallback(() => {
    setActiveTutorial(null);
    setCurrentTutorialStep(0);
    announce('Tutorial exited');
  }, [announce]);

  // Tooltip management
  useEffect(() => {
    if (!config.enableTooltips) return;

    const handleTooltips = (e: MouseEvent | FocusEvent) => {
      tooltips.forEach(tooltip => {
        const element = document.querySelector(tooltip.selector);
        if (!element) return;

        const isHover = e.type === 'mouseenter' && tooltip.showOnHover;
        const isFocus = e.type === 'focus' && tooltip.showOnFocus;

        if ((isHover || isFocus) && element === e.target) {
          setTimeout(() => {
            setActiveTooltip(tooltip.id);
          }, tooltip.delay || 0);
        }
      });
    };

    const hideTooltips = () => {
      setActiveTooltip(null);
    };

    document.addEventListener('mouseenter', handleTooltips, true);
    document.addEventListener('focus', handleTooltips, true);
    document.addEventListener('mouseleave', hideTooltips, true);
    document.addEventListener('blur', hideTooltips, true);

    return () => {
      document.removeEventListener('mouseenter', handleTooltips, true);
      document.removeEventListener('focus', handleTooltips, true);
      document.removeEventListener('mouseleave', hideTooltips, true);
      document.removeEventListener('blur', hideTooltips, true);
    };
  }, [config.enableTooltips]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!config.enableKeyboardShortcuts) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      // Show shortcuts dialog
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Open help
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setIsHelpOpen(true);
      }

      // Navigate tutorial
      if (activeTutorial) {
        if (e.key === 'ArrowRight') nextTutorialStep();
        if (e.key === 'ArrowLeft') previousTutorialStep();
        if (e.key === 'Escape') exitTutorial();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [config.enableKeyboardShortcuts, activeTutorial, nextTutorialStep, previousTutorialStep, exitTutorial]);

  // Contextual help
  useEffect(() => {
    if (!config.enableContextualHelp) return;

    // Show relevant help based on current page
    const pageHelpMap: Record<string, string> = {
      '/dashboard': 'getting-started',
      '/wellness/mood': 'mood-tracking',
      '/chat': 'peer-chat',
      '/crisis': 'crisis-resources',
      '/settings/privacy': 'privacy-settings',
    };

    const relevantTopic = pageHelpMap[location.pathname];
    if (relevantTopic && !viewedTopics.has(relevantTopic)) {
      // Show contextual help hint
      setTimeout(() => {
        showFeedback({
          type: 'info',
          message: 'Need help with this page?',
          description: 'Press Alt+H to open the help guide',
          action: {
            label: 'Show Help',
            onClick: () => {
              setIsHelpOpen(true);
              setSearchQuery(relevantTopic);
              searchHelp(relevantTopic);
            },
          },
        });
      }, 3000);
    }
  }, [location.pathname, config.enableContextualHelp, viewedTopics, showFeedback, searchHelp]);

  // Render tutorial overlay
  const renderTutorial = () => {
    if (!activeTutorial) return null;

    const currentStep = activeTutorial.steps[currentTutorialStep];
    const progress = ((currentTutorialStep + 1) / activeTutorial.steps.length) * 100;

    return (
      <div className="tutorial-overlay" ref={overlayRef}>
        {currentStep.highlightTarget && (
          <div className="tutorial-highlight" />
        )}
        
        <div className={`tutorial-popup tutorial-popup--${currentStep.position}`}>
          <div className="tutorial-header">
            <div className="tutorial-progress">
              <div 
                className="tutorial-progress__bar" 
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <button 
              className="tutorial-close"
              onClick={exitTutorial}
              aria-label="Exit tutorial"
            >
              ×
            </button>
          </div>
          
          <div className="tutorial-content">
            <h3>{currentStep.title}</h3>
            <p>{currentStep.content}</p>
            
            {currentStep.action && (
              <button 
                className="tutorial-action"
                onClick={currentStep.action.onClick}
              >
                {currentStep.action.label}
              </button>
            )}
          </div>
          
          <div className="tutorial-navigation">
            <button 
              onClick={previousTutorialStep}
              disabled={currentTutorialStep === 0}
              aria-label="Previous step"
            >
              ← Back
            </button>
            
            <span className="tutorial-step-counter">
              {currentTutorialStep + 1} of {activeTutorial.steps.length}
            </span>
            
            {currentStep.skipable && (
              <button onClick={nextTutorialStep} className="tutorial-skip">
                Skip
              </button>
            )}
            
            <button 
              onClick={nextTutorialStep}
              className="tutorial-next"
              aria-label="Next step"
            >
              {currentTutorialStep === activeTutorial.steps.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render help panel
  const renderHelpPanel = () => {
    if (!isHelpOpen) return null;

    return (
      <div className="help-panel" ref={helpPanelRef} role="dialog" aria-label="Help panel">
        <div className="help-panel__header">
          <h2>Help & Support</h2>
          <button 
            className="help-panel__close"
            onClick={() => setIsHelpOpen(false)}
            aria-label="Close help"
          >
            ×
          </button>
        </div>
        
        <div className="help-panel__search">
          <input
            type="search"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchHelp(e.target.value);
            }}
            aria-label="Search help topics"
          />
        </div>
        
        <div className="help-panel__categories">
          {['all', 'basics', 'features', 'wellness', 'safety', 'accessibility', 'troubleshooting'].map(cat => (
            <button
              key={cat}
              className={`help-category ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                searchHelp(searchQuery);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="help-panel__content">
          {searchResults.length > 0 ? (
            <div className="help-results">
              {searchResults.map(topic => (
                <div key={topic.id} className="help-topic">
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <button 
                    onClick={() => {
                      setViewedTopics(prev => new Set(prev).add(topic.id));
                      // Show full topic content
                    }}
                  >
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="help-no-results">
              <p>No results found for "{searchQuery}"</p>
              <p>Try different keywords or browse categories</p>
            </div>
          ) : (
            <div className="help-featured">
              <h3>Featured Tutorials</h3>
              <div className="tutorial-list">
                {tutorials.map(tutorial => (
                  <div key={tutorial.id} className="tutorial-card">
                    <h4>{tutorial.name}</h4>
                    <p>{tutorial.description}</p>
                    <div className="tutorial-meta">
                      <span>⏱ {tutorial.estimatedTime} min</span>
                      <span>📊 {tutorial.difficulty}</span>
                      {completedTutorials.has(tutorial.id) && <span>✅ Completed</span>}
                    </div>
                    <button 
                      onClick={() => {
                        setIsHelpOpen(false);
                        startTutorial(tutorial.id);
                      }}
                    >
                      {completedTutorials.has(tutorial.id) ? 'Replay' : 'Start'} Tutorial
                    </button>
                  </div>
                ))}
              </div>
              
              <h3>Quick Links</h3>
              <div className="quick-links">
                <button onClick={() => setShowKeyboardShortcuts(true)}>
                  ⌨️ Keyboard Shortcuts
                </button>
                <button onClick={() => navigate('/faq')}>
                  ❓ FAQ
                </button>
                <button onClick={() => navigate('/contact')}>
                  📧 Contact Support
                </button>
                <button onClick={() => window.open('/docs', '_blank')}>
                  📚 Documentation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render keyboard shortcuts modal
  const renderKeyboardShortcuts = () => {
    if (!showKeyboardShortcuts) return null;

    const groupedShortcuts = keyboardShortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = [];
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, typeof keyboardShortcuts>);

    return (
      <div className="shortcuts-modal" role="dialog" aria-label="Keyboard shortcuts">
        <div className="shortcuts-modal__content">
          <div className="shortcuts-modal__header">
            <h2>Keyboard Shortcuts</h2>
            <button 
              onClick={() => setShowKeyboardShortcuts(false)}
              aria-label="Close shortcuts"
            >
              ×
            </button>
          </div>
          
          <div className="shortcuts-modal__body">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="shortcuts-category">
                <h3>{category}</h3>
                <div className="shortcuts-list">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="shortcut-item">
                      <span className="shortcut-keys">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            <kbd>{key}</kbd>
                            {i < shortcut.keys.length - 1 && ' + '}
                          </React.Fragment>
                        ))}
                      </span>
                      <span className="shortcut-action">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render active tooltip
  const renderTooltip = () => {
    if (!activeTooltip) return null;

    const tooltip = tooltips.find(t => t.id === activeTooltip);
    if (!tooltip) return null;

    return (
      <div className="help-tooltip" role="tooltip">
        {tooltip.content}
      </div>
    );
  };

  return (
    <>
      {/* Help trigger button */}
      <button 
        className="help-trigger"
        onClick={() => setIsHelpOpen(!isHelpOpen)}
        aria-label="Toggle help"
        aria-expanded={isHelpOpen}
      >
        ?
      </button>
      
      {/* Render components */}
      {renderHelpPanel()}
      {renderTutorial()}
      {renderKeyboardShortcuts()}
      {renderTooltip()}
      
      {/* Loading state */}
      {isLoading && (
        <div className="help-loading">
          <Spinner size="large" />
        </div>
      )}
    </>
  );
};

// Export individual components for flexibility
export const HelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button className="help-button" onClick={onClick} aria-label="Get help">
    <span className="help-button__icon">?</span>
    <span className="help-button__text">Help</span>
  </button>
);

export const TutorialCard: React.FC<{
  tutorial: Tutorial;
  completed: boolean;
  onStart: () => void;
}> = ({ tutorial, completed, onStart }) => (
  <div className="tutorial-card">
    <h3>{tutorial.name}</h3>
    <p>{tutorial.description}</p>
    <div className="tutorial-card__meta">
      <span>⏱ {tutorial.estimatedTime} min</span>
      {completed && <span className="tutorial-card__completed">✅ Completed</span>}
    </div>
    <button onClick={onStart}>
      {completed ? 'Replay' : 'Start'} Tutorial
    </button>
  </div>
);

export default HelpTutorialSystem;