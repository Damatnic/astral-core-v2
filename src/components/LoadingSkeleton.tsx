import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'post' | 'comment' | 'profile' | 'chat';
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'post', 
  count = 1,
  className = '' 
}) => {
  const renderPostSkeleton = () => (
    <output className={`loading-skeleton post-skeleton glass-card smooth-transition ${className}`} aria-label="Loading post">
      <div className="skeleton-header">
        <div className="skeleton-avatar skeleton-loader animate-gradient"></div>
        <div className="skeleton-user-info">
          <div className="skeleton-username skeleton-loader"></div>
          <div className="skeleton-timestamp skeleton-loader"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-text-line skeleton-text-long skeleton-loader"></div>
        <div className="skeleton-text-line skeleton-text-medium skeleton-loader"></div>
        <div className="skeleton-text-line skeleton-text-short skeleton-loader"></div>
      </div>
      <div className="skeleton-actions">
        <div className="skeleton-action-btn skeleton-loader"></div>
        <div className="skeleton-action-btn skeleton-loader"></div>
        <div className="skeleton-action-btn skeleton-loader"></div>
      </div>
      <span className="sr-only">Loading post content...</span>
    </output>
  );

  const renderCommentSkeleton = () => (
    <output className={`loading-skeleton comment-skeleton glass-card smooth-transition ${className}`} aria-label="Loading comment">
      <div className="skeleton-header">
        <div className="skeleton-avatar skeleton-avatar-small skeleton-loader animate-gradient"></div>
        <div className="skeleton-user-info">
          <div className="skeleton-username skeleton-username-short skeleton-loader"></div>
          <div className="skeleton-timestamp skeleton-timestamp-short skeleton-loader"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-text-line skeleton-text-medium skeleton-loader"></div>
        <div className="skeleton-text-line skeleton-text-short skeleton-loader"></div>
      </div>
      <span className="sr-only">Loading comment...</span>
    </output>
  );

  const renderProfileSkeleton = () => (
    <output className={`loading-skeleton profile-skeleton glass-card smooth-transition ${className}`} aria-label="Loading profile">
      <div className="skeleton-profile-header">
        <div className="skeleton-avatar skeleton-avatar-large skeleton-loader animate-gradient"></div>
        <div className="skeleton-profile-info">
          <div className="skeleton-username skeleton-username-long skeleton-loader"></div>
          <div className="skeleton-bio-line skeleton-loader"></div>
          <div className="skeleton-bio-line skeleton-bio-short skeleton-loader"></div>
        </div>
      </div>
      <div className="skeleton-stats">
        <div className="skeleton-stat skeleton-loader"></div>
        <div className="skeleton-stat skeleton-loader"></div>
        <div className="skeleton-stat skeleton-loader"></div>
      </div>
      <span className="sr-only">Loading profile information...</span>
    </output>
  );

  const renderChatSkeleton = () => (
    <output className={`loading-skeleton chat-skeleton glass-card smooth-transition ${className}`} aria-label="Loading chat message">
      <div className="skeleton-message">
        <div className="skeleton-avatar skeleton-avatar-small skeleton-loader animate-gradient"></div>
        <div className="skeleton-message-content">
          <div className="skeleton-message-bubble glass-card">
            <div className="skeleton-text-line skeleton-text-medium skeleton-loader"></div>
            <div className="skeleton-text-line skeleton-text-short skeleton-loader"></div>
          </div>
          <div className="skeleton-timestamp skeleton-timestamp-small skeleton-loader"></div>
        </div>
      </div>
      <span className="sr-only">Loading chat message...</span>
    </output>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'comment':
        return renderCommentSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'chat':
        return renderChatSkeleton();
      case 'post':
      default:
        return renderPostSkeleton();
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
