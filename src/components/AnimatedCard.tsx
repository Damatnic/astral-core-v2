import React from 'react';
import { useScrollAnimation, useDelayedHover } from '../hooks/useAnimations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animationType?: 'fadeIn' | 'slideInUp' | 'scaleIn';
  hoverEffect?: boolean;
  onClick?: () => void;
  id?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  animationType = 'fadeIn',
  hoverEffect = true,
  onClick,
  id
}) => {
  const { elementRef, isVisible } = useScrollAnimation(0.1);
  const { isHovered, handleMouseEnter, handleMouseLeave } = useDelayedHover(50, 150);

  const animationClasses = [
    'card',
    isVisible ? `${animationType} fade-in-scroll visible` : 'fade-in-scroll',
    hoverEffect && isHovered ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  const cardStyle = {
    animationDelay: delay ? `${delay}ms` : undefined,
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  // If clickable, render as button element for proper accessibility
  if (onClick) {
    return (
      <button
        ref={elementRef as React.RefObject<HTMLButtonElement>}
        className={`${animationClasses} clickable-card`}
        style={cardStyle}
        onMouseEnter={hoverEffect ? handleMouseEnter : undefined}
        onMouseLeave={hoverEffect ? handleMouseLeave : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        type="button"
        id={id}
      >
        {children}
      </button>
    );
  }

  // Non-clickable card with hover effects (visual feedback only)
  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={animationClasses}
      style={cardStyle}
      onMouseEnter={hoverEffect ? handleMouseEnter : undefined}
      onMouseLeave={hoverEffect ? handleMouseLeave : undefined}
      id={id}
    >
      {children}
    </div>
  );
};

interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: 'fadeIn' | 'slideInUp' | 'scaleIn';
  className?: string;
  itemIdPrefix?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 100,
  animationType = 'slideInUp',
  className = '',
  itemIdPrefix = 'animated-item'
}) => {
  return (
    <div className={`card-list ${className}`}>
      {React.Children.map(children, (child, index) => (
        <AnimatedCard
          key={`${itemIdPrefix}-${index}`}
          id={`${itemIdPrefix}-${index}`}
          delay={index * staggerDelay}
          animationType={animationType}
          className="list-item"
        >
          {child}
        </AnimatedCard>
      ))}
    </div>
  );
};

export default AnimatedCard;
