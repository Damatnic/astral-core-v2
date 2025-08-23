import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for managing smooth scroll-based animations
 */
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return { elementRef, isVisible };
};

/**
 * Hook for managing element animations with delays
 */
export const useStaggeredAnimation = (itemCount: number, baseDelay = 100) => {
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());

  const triggerAnimation = useCallback(() => {
    setAnimatedItems(new Set());
    
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setAnimatedItems(prev => new Set([...prev, i]));
      }, i * baseDelay);
    }
  }, [itemCount, baseDelay]);

  const isItemAnimated = useCallback((index: number) => {
    return animatedItems.has(index);
  }, [animatedItems]);

  return { triggerAnimation, isItemAnimated };
};

/**
 * Hook for managing ripple effects on button clicks
 */
export const useRippleEffect = () => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  }, []);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // Remove ripple after animation completes
    setTimeout(() => removeRipple(id), 600);
  }, [removeRipple]);

  return { ripples, createRipple };
};

/**
 * Hook for managing hover states with delays
 */
export const useDelayedHover = (enterDelay = 0, leaveDelay = 300) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, enterDelay);
  }, [enterDelay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, leaveDelay);
  }, [leaveDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isHovered, handleMouseEnter, handleMouseLeave };
};

/**
 * Hook for managing loading states with minimum duration
 */
export const useLoadingState = (minDuration = 500) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const startTimeRef = useRef<number>();

  const startLoading = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsLoading(true);
    setShowLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setShowLoading(false);
      }, remainingTime);
    } else {
      setShowLoading(false);
    }
  }, [minDuration]);

  return { isLoading, showLoading, startLoading, stopLoading };
};

/**
 * Hook for managing animation sequences
 */
export const useAnimationSequence = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const executeStep = useCallback((step: () => void, index: number, totalSteps: number) => {
    step();
    setCurrentStep(index + 1);
    
    if (index === totalSteps - 1) {
      setIsPlaying(false);
    }
  }, []);

  const playSequence = useCallback((steps: Array<() => void>, delays: number[]) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentStep(0);

    let totalDelay = 0;
    
    steps.forEach((step, index) => {
      setTimeout(() => executeStep(step, index, steps.length), totalDelay);
      totalDelay += delays[index] || 0;
    });
  }, [isPlaying, executeStep]);

  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return { currentStep, isPlaying, playSequence, resetSequence };
};

/**
 * Hook for managing form animations and feedback
 */
export const useFormAnimations = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successFields, setSuccessFields] = useState<Set<string>>(new Set());

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearSuccess = useCallback((fieldName: string) => {
    setSuccessFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  }, []);

  const showFieldError = useCallback((fieldName: string, errorMessage: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
    
    // Auto-clear error after delay
    setTimeout(() => clearError(fieldName), 5000);
  }, [clearError]);

  const showFieldSuccess = useCallback((fieldName: string) => {
    setSuccessFields(prev => new Set([...prev, fieldName]));
    
    // Auto-clear success after delay
    setTimeout(() => clearSuccess(fieldName), 3000);
  }, [clearSuccess]);

  const clearFieldState = useCallback((fieldName: string) => {
    clearError(fieldName);
    clearSuccess(fieldName);
  }, [clearError, clearSuccess]);

  return {
    errors,
    successFields,
    showFieldError,
    showFieldSuccess,
    clearFieldState
  };
};

/**
 * Hook for managing page transition animations
 */
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit' | 'idle'>('idle');

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    setTransitionStage('exit');
    
    // Switch to enter stage after exit animation
    setTimeout(() => {
      setTransitionStage('enter');
    }, 250);
    
    // Complete transition
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionStage('idle');
    }, 500);
  }, []);

  return { isTransitioning, transitionStage, startTransition };
};

/**
 * Hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};
