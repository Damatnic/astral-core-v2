import React from 'react';
import '../styles/modern-therapeutic-design.css';

// Beautiful Loading Spinner
export const TherapeuticSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`therapy-spinner ${sizeClasses[size]}`}>
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" 
           style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  );
};

// Pulsing Dots Loader
export const PulsingDots: React.FC<{ color?: string }> = ({ color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500'
  };

  return (
    <div className="loading-dots">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className={`loading-dot ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}
        />
      ))}
    </div>
  );
};

// Skeleton Card Loader
export const SkeletonCard: React.FC<{ showAvatar?: boolean }> = ({ showAvatar = true }) => {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {showAvatar && (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 skeleton-loader"></div>
        )}
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded skeleton-loader"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded skeleton-loader w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded skeleton-loader w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Text Lines
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded skeleton-loader"
          style={{ width: `${100 - (i * 15)}%` }}
        />
      ))}
    </div>
  );
};

// Skeleton Dashboard Stats
export const SkeletonStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="wellness-stat-card animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded skeleton-loader"></div>
              <div className="h-8 w-24 bg-gray-300 rounded skeleton-loader"></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 skeleton-loader"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full skeleton-loader"></div>
        </div>
      ))}
    </div>
  );
};

// Beautiful Page Loader
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading your wellness sanctuary..." 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-ping opacity-20" 
                 style={{ animationDelay: '0.5s' }}></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-breathe flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 animate-fadeIn">
          {message}
        </h2>
        
        <PulsingDots color="purple" />
      </div>
    </div>
  );
};

// Content Placeholder
export const ContentPlaceholder: React.FC<{ type?: 'post' | 'chat' | 'form' }> = ({ 
  type = 'post' 
}) => {
  if (type === 'post') {
    return (
      <div className="therapy-card animate-pulse">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 skeleton-loader"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded skeleton-loader mb-2"></div>
            <div className="h-3 w-24 bg-gray-200 rounded skeleton-loader"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded skeleton-loader"></div>
          <div className="h-4 bg-gray-200 rounded skeleton-loader w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded skeleton-loader w-4/6"></div>
        </div>
        <div className="h-48 bg-gray-200 rounded-xl skeleton-loader mb-4"></div>
        <div className="flex gap-4">
          <div className="h-8 w-20 bg-gray-200 rounded-lg skeleton-loader"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg skeleton-loader"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg skeleton-loader"></div>
        </div>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
            {i % 2 !== 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 skeleton-loader flex-shrink-0"></div>
            )}
            <div className={`max-w-xs ${i % 2 === 0 ? 'order-1' : ''}`}>
              <div className={`p-3 rounded-2xl ${
                i % 2 === 0 
                  ? 'bg-blue-100 rounded-br-none' 
                  : 'bg-gray-100 rounded-bl-none'
              }`}>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded skeleton-loader"></div>
                  <div className="h-3 bg-gray-200 rounded skeleton-loader w-4/5"></div>
                </div>
              </div>
            </div>
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 skeleton-loader flex-shrink-0 order-2"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded skeleton-loader mb-2"></div>
          <div className="h-11 bg-gray-100 rounded-xl skeleton-loader"></div>
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded skeleton-loader mb-2"></div>
          <div className="h-11 bg-gray-100 rounded-xl skeleton-loader"></div>
        </div>
        <div>
          <div className="h-4 w-28 bg-gray-200 rounded skeleton-loader mb-2"></div>
          <div className="h-32 bg-gray-100 rounded-xl skeleton-loader"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-11 flex-1 bg-gray-300 rounded-xl skeleton-loader"></div>
          <div className="h-11 flex-1 bg-gray-200 rounded-xl skeleton-loader"></div>
        </div>
      </div>
    );
  }

  return null;
};

// Breathing Animation Loader
export const BreathingLoader: React.FC<{ text?: string }> = ({ 
  text = "Take a deep breath..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 animate-breathe"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 animate-breathe" 
             style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-breathe" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-breathe" 
             style={{ animationDelay: '1.5s' }}></div>
      </div>
      <p className="text-lg text-gray-700 animate-pulse">{text}</p>
    </div>
  );
};

// Loading Button
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({ 
  loading = false, 
  children, 
  onClick, 
  className = '',
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`glass-button ripple-button ${variantClasses[variant]} ${className} ${
        loading ? 'cursor-not-allowed opacity-75' : ''
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Progress Bar Loader
export const ProgressLoader: React.FC<{ 
  progress: number; 
  label?: string;
  showPercentage?: boolean;
}> = ({ 
  progress, 
  label,
  showPercentage = true 
}) => {
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-900">{progress}%</span>}
        </div>
      )}
      <div className="wellness-progress">
        <div 
          className="wellness-progress-bar"
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: 'var(--gradient-calm)'
          }}
        />
      </div>
    </div>
  );
};

// Shimmer Effect Component
export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
};

// Export all components
export default {
  TherapeuticSpinner,
  PulsingDots,
  SkeletonCard,
  SkeletonText,
  SkeletonStats,
  PageLoader,
  ContentPlaceholder,
  BreathingLoader,
  LoadingButton,
  ProgressLoader,
  ShimmerEffect
};