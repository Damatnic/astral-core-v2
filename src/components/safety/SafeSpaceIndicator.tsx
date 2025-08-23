import React, { useEffect, useState } from 'react';
import '../../styles/safe-ui-system.css';

interface SafeSpaceIndicatorProps {
  isPrivateMode?: boolean;
  userName?: string;
  sessionType?: 'anonymous' | 'private' | 'public';
  className?: string;
  theme?: string;
  children?: React.ReactNode;
}

export const SafeSpaceIndicator: React.FC<SafeSpaceIndicatorProps> = ({
  isPrivateMode = false,
  userName,
  sessionType = 'public',
  className = '',
  theme = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    setIsVisible(true);
    
    // Breathing cycle for calming effect
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => {
        switch(prev) {
          case 'inhale': return 'hold';
          case 'hold': return 'exhale';
          case 'exhale': return 'inhale';
          default: return 'inhale';
        }
      });
    }, 4000);

    return () => clearInterval(breathingInterval);
  }, []);

  const getIndicatorText = () => {
    if (isPrivateMode || sessionType === 'private') {
      return '🔒 Private & Safe';
    }
    if (sessionType === 'anonymous') {
      return '👤 Anonymous Mode';
    }
    return '🛡️ Safe Space';
  };

  const getIndicatorColor = () => {
    switch(sessionType) {
      case 'private': return 'var(--safe-accent-cool)';
      case 'anonymous': return 'var(--safe-accent)';
      default: return 'var(--safe-primary-light)';
    }
  };

  const getBreathingDotColor = () => {
    if (breathingPhase === 'inhale') return 'var(--safe-success)';
    if (breathingPhase === 'hold') return 'var(--safe-warning)';
    return 'var(--safe-info)';
  };

  const getClassNames = () => {
    const classes = ['safe-space-indicator'];
    if (isVisible) classes.push('visible');
    if (className) classes.push(className);
    if (theme) classes.push(`theme-${theme}`);
    return classes.join(' ');
  };

  return (
    <div 
      className={getClassNames()}
      data-testid="safe-space-indicator"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: `linear-gradient(135deg, ${getIndicatorColor()}, var(--safe-white))`,
        padding: '12px 20px',
        borderRadius: 'var(--safe-radius-full)',
        boxShadow: 'var(--safe-shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.5s ease-out',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div 
        className="breathing-dot"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: getBreathingDotColor(),
          animation: 'safe-breathe 12s ease-in-out infinite',
          boxShadow: '0 0 10px currentColor',
        }}
      />
      
      <span 
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--safe-gray-800)',
          letterSpacing: '0.5px',
        }}
      >
        {getIndicatorText()}
      </span>

      {userName && (
        <span 
          style={{
            fontSize: '12px',
            color: 'var(--safe-gray-600)',
            borderLeft: '1px solid var(--safe-gray-300)',
            paddingLeft: '12px',
            marginLeft: '4px',
          }}
        >
          {userName}
        </span>
      )}

      <button
        aria-label="Privacy settings"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--safe-gray-600)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--safe-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--safe-gray-600)'}
        onClick={() => {
          // Handle privacy settings click
          console.log('Open privacy settings');
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24" />
        </svg>
      </button>
      
      {children && <div style={{ marginLeft: '8px' }}>{children}</div>}
    </div>
  );
};

export default SafeSpaceIndicator;