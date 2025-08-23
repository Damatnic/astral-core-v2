import React from 'react';

interface AIAssistanceIndicatorProps {
  isActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  message?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export const AIAssistanceIndicator: React.FC<AIAssistanceIndicatorProps> = ({
  isActive = true,
  className = '',
  style,
  message = 'AI assistance active',
  variant = 'default'
}) => {
  const baseClass = 'ai-assistance-indicator';
  const variantClass = variant !== 'default' ? `ai-assistance-indicator-${variant}` : '';
  const activeClass = isActive ? 'ai-assistance-active' : 'ai-assistance-inactive';

  const classes = [
    baseClass,
    variantClass,
    activeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={isActive ? message : 'AI assistance inactive'}
    >
      <div className="ai-indicator-icon" aria-hidden="true">
        <span className="ai-indicator-pulse"></span>
      </div>
      {variant !== 'minimal' && (
        <span className="ai-indicator-text">
          {isActive ? message : 'AI assistance inactive'}
        </span>
      )}
    </div>
  );
};