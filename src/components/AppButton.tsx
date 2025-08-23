import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'glass' | 'neumorph' | 'crisis';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AppButtonProps {
  children?: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  'aria-label'?: string;
  icon?: React.ReactNode;
  enhanced?: boolean;
  iconOnly?: boolean;
  animate?: 'breathe' | 'glow' | 'none';
  ripple?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  style,
  icon,
  enhanced = true,
  iconOnly = false,
  animate = 'none',
  ripple = true,
  'aria-label': ariaLabel,
}) => {
  // Determine base class based on variant
  let baseClass = 'btn';
  let variantClass = '';
  
  if (enhanced) {
    switch(variant) {
      case 'glass':
        baseClass = 'glass-button';
        break;
      case 'neumorph':
        baseClass = 'neumorph-button';
        break;
      case 'crisis':
        baseClass = 'crisis-button';
        break;
      case 'primary':
        baseClass = 'glass-button';
        variantClass = 'btn-primary-therapeutic';
        break;
      case 'secondary':
        baseClass = 'glass-button';
        variantClass = 'btn-secondary-therapeutic';
        break;
      case 'success':
        baseClass = 'glass-button';
        variantClass = 'btn-success-therapeutic';
        break;
      case 'danger':
        baseClass = 'glass-button';
        variantClass = 'btn-danger-therapeutic';
        break;
      default:
        baseClass = 'glass-button';
        variantClass = variant;
    }
  } else {
    variantClass = `btn-${variant}`;
  }
  
  // Size classes
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  // Icon-only button handling
  const iconOnlyClass = iconOnly ? 'btn-icon-only' : '';
  
  // Animation classes
  const animationClass = animate !== 'none' ? `animate-${animate}` : '';
  
  // Ripple effect
  const rippleClass = ripple ? 'ripple-button' : '';
  
  // Touch and transition classes
  const touchClasses = 'touch-optimized touch-feedback smooth-transition';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    iconOnlyClass,
    animationClass,
    rippleClass,
    touchClasses,
    className
  ].filter(Boolean).join(' ');

  // Ensure WCAG 2.1 AA compliance for touch targets
  const touchTargetStyle = {
    minHeight: '44px', // WCAG 2.1 AA touch target requirement
    minWidth: iconOnly ? '44px' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation', // Improve touch responsiveness
    ...style
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={touchTargetStyle}
      aria-label={ariaLabel || (iconOnly && typeof children === 'string' ? children : undefined)}
    >
      {isLoading ? (
        <div className="loading-dots">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {!iconOnly && <span className="btn-text">{children}</span>}
        </>
      )}
    </button>
  );
};