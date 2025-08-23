import React, { useState, useEffect } from 'react';
import { SparkleIcon, BookIcon, HeartIcon, RefreshIcon } from './icons.dynamic';
import './JournalPrompts.css';

interface JournalPrompt {
  id: string;
  category: 'gratitude' | 'reflection' | 'growth' | 'emotions' | 'creativity';
  prompt: string;
  followUp?: string;
  emoji: string;
}

const prompts: JournalPrompt[] = [
  // Gratitude
  {
    id: 'g1',
    category: 'gratitude',
    prompt: 'What are three small things that brought you joy today?',
    followUp: 'How can you create more of these moments?',
    emoji: '🙏'
  },
  {
    id: 'g2',
    category: 'gratitude',
    prompt: 'Who in your life are you most grateful for right now?',
    followUp: 'How can you express this gratitude to them?',
    emoji: '💝'
  },
  {
    id: 'g3',
    category: 'gratitude',
    prompt: 'What ability or skill do you have that you\'re thankful for?',
    followUp: 'How has this helped you recently?',
    emoji: '✨'
  },
  
  // Reflection
  {
    id: 'r1',
    category: 'reflection',
    prompt: 'If today had a color, what would it be and why?',
    followUp: 'What emotions does this color represent for you?',
    emoji: '🎨'
  },
  {
    id: 'r2',
    category: 'reflection',
    prompt: 'What pattern have you noticed in your thoughts lately?',
    followUp: 'Is this pattern serving you or holding you back?',
    emoji: '🔄'
  },
  {
    id: 'r3',
    category: 'reflection',
    prompt: 'What would you tell your younger self about where you are now?',
    followUp: 'What advice would they give you?',
    emoji: '⏰'
  },
  
  // Growth
  {
    id: 'gr1',
    category: 'growth',
    prompt: 'What challenge are you currently facing that could help you grow?',
    followUp: 'What\'s one small step you can take today?',
    emoji: '🌱'
  },
  {
    id: 'gr2',
    category: 'growth',
    prompt: 'What fear would you like to overcome?',
    followUp: 'What would your life look like without this fear?',
    emoji: '🦋'
  },
  {
    id: 'gr3',
    category: 'growth',
    prompt: 'What new habit would most improve your wellbeing?',
    followUp: 'How can you make this habit easier to start?',
    emoji: '🌟'
  },
  
  // Emotions
  {
    id: 'e1',
    category: 'emotions',
    prompt: 'What emotion have you been avoiding lately?',
    followUp: 'What is this emotion trying to tell you?',
    emoji: '💭'
  },
  {
    id: 'e2',
    category: 'emotions',
    prompt: 'How does your body feel right now? Scan from head to toe.',
    followUp: 'Where are you holding tension or stress?',
    emoji: '🧘'
  },
  {
    id: 'e3',
    category: 'emotions',
    prompt: 'What makes you feel most like yourself?',
    followUp: 'When did you last feel this way?',
    emoji: '💫'
  },
  
  // Creativity
  {
    id: 'c1',
    category: 'creativity',
    prompt: 'If your current mood was weather, what would it be?',
    followUp: 'Draw or describe this weather in detail.',
    emoji: '🌦️'
  },
  {
    id: 'c2',
    category: 'creativity',
    prompt: 'Write a haiku about how you\'re feeling right now.',
    followUp: 'What images come to mind?',
    emoji: '📝'
  },
  {
    id: 'c3',
    category: 'creativity',
    prompt: 'If you could design your perfect day, what would it include?',
    followUp: 'Which elements could you incorporate tomorrow?',
    emoji: '🎭'
  }
];

interface JournalPromptsProps {
  onPromptSelect?: (prompt: string) => void;
}

export const JournalPrompts: React.FC<JournalPromptsProps> = ({ 
  onPromptSelect
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  useEffect(() => {
    // Load used prompts from localStorage
    const saved = localStorage.getItem('usedJournalPrompts');
    if (saved) {
      setUsedPromptIds(new Set(JSON.parse(saved)));
    }
  }, []);
  
  useEffect(() => {
    // Save used prompts to localStorage
    localStorage.setItem('usedJournalPrompts', JSON.stringify(Array.from(usedPromptIds)));
  }, [usedPromptIds]);
  
  const getRandomPrompt = (category?: string) => {
    let availablePrompts = prompts.filter(p => !usedPromptIds.has(p.id));
    
    if (availablePrompts.length === 0) {
      // Reset if all prompts have been used
      setUsedPromptIds(new Set());
      availablePrompts = prompts;
    }
    
    if (category && category !== 'all') {
      availablePrompts = availablePrompts.filter(p => p.category === category);
    }
    
    if (availablePrompts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    return availablePrompts[randomIndex];
  };
  
  const selectNewPrompt = () => {
    const prompt = getRandomPrompt(selectedFilter);
    if (prompt) {
      setCurrentPrompt(prompt);
      setShowFollowUp(false);
      setUsedPromptIds(prev => new Set([...prev, prompt.id]));
      
      if (onPromptSelect) {
        onPromptSelect(prompt.prompt);
      }
    }
  };
  
  const categories = [
    { id: 'all', name: 'All Prompts', emoji: '🌈' },
    { id: 'gratitude', name: 'Gratitude', emoji: '🙏' },
    { id: 'reflection', name: 'Reflection', emoji: '🪞' },
    { id: 'growth', name: 'Growth', emoji: '🌱' },
    { id: 'emotions', name: 'Emotions', emoji: '💭' },
    { id: 'creativity', name: 'Creativity', emoji: '🎨' }
  ];
  
  return (
    <div className="journal-prompts-card">
      <div className="prompts-header">
        <h3 className="prompts-title">
          <BookIcon className="prompts-icon" />
          Journal Prompts
        </h3>
        <p className="prompts-subtitle">
          Guided questions to inspire your reflection
        </p>
      </div>
      
      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedFilter === cat.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedFilter(cat.id);
              setCurrentPrompt(null);
            }}
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>
      
      {currentPrompt ? (
        <div className="prompt-display">
          <div className="prompt-badge">
            <span className="prompt-emoji">{currentPrompt.emoji}</span>
            <span className="prompt-category">{currentPrompt.category}</span>
          </div>
          
          <div className="prompt-content">
            <p className="prompt-text">{currentPrompt.prompt}</p>
            
            {currentPrompt.followUp && (
              <button
                className="follow-up-toggle"
                onClick={() => setShowFollowUp(!showFollowUp)}
              >
                {showFollowUp ? 'Hide' : 'Show'} follow-up question
              </button>
            )}
            
            {showFollowUp && currentPrompt.followUp && (
              <div className="follow-up-content">
                <SparkleIcon className="follow-up-icon" />
                <p className="follow-up-text">{currentPrompt.followUp}</p>
              </div>
            )}
          </div>
          
          <div className="prompt-actions">
            <button
              className="use-prompt-btn"
              onClick={() => {
                if (onPromptSelect && currentPrompt) {
                  const fullPrompt = showFollowUp && currentPrompt.followUp
                    ? `${currentPrompt.prompt}\n\n${currentPrompt.followUp}`
                    : currentPrompt.prompt;
                  onPromptSelect(fullPrompt);
                }
              }}
            >
              <HeartIcon />
              Use This Prompt
            </button>
            
            <button
              className="new-prompt-btn"
              onClick={selectNewPrompt}
            >
              <RefreshIcon />
              New Prompt
            </button>
          </div>
        </div>
      ) : (
        <div className="prompt-empty">
          <p className="empty-message">
            Select a category and click the button below to get started
          </p>
          <button
            className="get-started-btn"
            onClick={selectNewPrompt}
          >
            <SparkleIcon />
            Get a Prompt
          </button>
        </div>
      )}
      
      <div className="prompts-footer">
        <p className="prompts-tip">
          💡 Tip: Write freely without judgment. There are no wrong answers.
        </p>
      </div>
    </div>
  );
};