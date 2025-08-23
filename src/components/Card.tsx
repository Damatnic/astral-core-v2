import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  enhanced?: boolean;
  variant?: 'default' | 'interactive' | 'glass' | 'elevated' | 'neumorph' | 'therapy';
  animate?: 'breathe' | 'float' | 'glow' | 'none';
  gradient?: 'calm' | 'wellness' | 'sky' | 'ocean' | 'sunset' | 'forest' | 'aurora' | 'peaceful' | 'none';
  moodVariant?: 'happy' | 'calm' | 'anxious' | 'sad' | 'none';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  style, 
  onClick, 
  role,
  tabIndex,
  enhanced = true,
  variant = 'default',
  animate = 'none',
  gradient = 'none',
  moodVariant = 'none',
  'aria-label': ariaLabel 
}) => {
  // Determine base class
  const baseClass = enhanced ? 'card-enhanced' : 'card';
  
  // Add variant class only when enhanced and variant is not 'default'
  const variantClass = enhanced && variant !== 'default' ? variant : '';
  
  // Add clickable class when onClick is provided
  const clickableClass = onClick ? 'card-clickable' : '';
  
  // Animation classes
  const animationClass = animate !== 'none' ? `animate-${animate}` : '';
  
  // Gradient classes
  const gradientClass = gradient !== 'none' ? `animate-gradient gradient-${gradient}` : '';
  
  // Mood variant classes
  const moodClass = moodVariant !== 'none' ? `mood-card-${moodVariant}` : '';
  
  // Touch optimization - only add for non-enhanced interactive cards
  const touchClasses = onClick && !enhanced ? 'touch-optimized touch-feedback smooth-transition' : 'smooth-transition';
  
  const isInteractive = !!onClick;
  
  const classes = [
    baseClass,
    variantClass,
    clickableClass,
    animationClass,
    gradientClass,
    moodClass,
    touchClasses,
    className
  ].filter(Boolean).join(' ');
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event as any as React.MouseEvent<HTMLDivElement>);
    }
  };
  
  // Apply gradient background if specified
  const enhancedStyle = gradient !== 'none' ? {
    ...style,
    background: `var(--gradient-${gradient})`,
    backgroundSize: '200% 200%'
  } : style;
  
  return (
    <div 
      className={classes}
      style={enhancedStyle} 
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={role || (isInteractive ? 'button' : 'region')}
      tabIndex={isInteractive ? (tabIndex ?? 0) : undefined}
      aria-label={ariaLabel}
      {...(isInteractive && { 'aria-pressed': 'false' })}
    >
      {children}
    </div>
  );
};