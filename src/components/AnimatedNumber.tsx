import React, { useState, useEffect } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  formatter = (n) => n.toString(),
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue === value) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (difference * easeOut));
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return (
    <output 
      className={`animated-number${isAnimating ? ' animating' : ''} ${className}`}
      aria-live="polite"
      aria-label={`Current value: ${formatter(displayValue)}`}
    >
      {formatter(displayValue)}
    </output>
  );
};

AnimatedNumber.displayName = 'AnimatedNumber';
