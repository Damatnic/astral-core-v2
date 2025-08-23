import React, { useState, useEffect } from 'react';
import './AITypingIndicator.css';

interface AITypingIndicatorProps {
  variant?: 'dots' | 'pulse' | 'wave';
  text?: string;
  showText?: boolean;
  color?: string;
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({
  variant = 'dots',
  text = 'AI is thinking',
  showText = true,
  color
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="typing-dots">
            <span className="typing-dot" style={{ animationDelay: '0ms', backgroundColor: color }} />
            <span className="typing-dot" style={{ animationDelay: '150ms', backgroundColor: color }} />
            <span className="typing-dot" style={{ animationDelay: '300ms', backgroundColor: color }} />
          </div>
        );
      
      case 'pulse':
        return (
          <div className="typing-pulse">
            <div className="pulse-ring" style={{ borderColor: color }} />
            <div className="pulse-core" style={{ backgroundColor: color }} />
          </div>
        );
      
      case 'wave':
        return (
          <div className="typing-wave">
            {[0, 1, 2, 3, 4].map(i => (
              <span 
                key={i}
                className="wave-bar" 
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  backgroundColor: color 
                }}
              />
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="ai-typing-indicator">
      {renderIndicator()}
      {showText && (
        <span className="typing-text">
          {text}{'.'.repeat(animationPhase + 1)}
        </span>
      )}
    </div>
  );
};

export default AITypingIndicator;