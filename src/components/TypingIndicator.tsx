import React from 'react';

interface TypingIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  style,
  message = 'Typing',
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'typing-indicator-small',
    medium: 'typing-indicator-medium',
    large: 'typing-indicator-large'
  };

  const classes = [
    'typing-indicator',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={`${message}...`}
    >
      <div className="typing-indicator-dots">
        <span className="typing-dot" aria-hidden="true"></span>
        <span className="typing-dot" aria-hidden="true"></span>
        <span className="typing-dot" aria-hidden="true"></span>
      </div>
      <span className="sr-only">{message}...</span>
    </div>
  );
};

export { TypingIndicator };
export default TypingIndicator;