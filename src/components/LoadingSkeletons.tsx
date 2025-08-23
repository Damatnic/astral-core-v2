/**
 * Loading Skeleton Components for Astral Core
 * 
 * This file provides skeleton loading components for all major UI elements
 * to improve perceived performance and user experience during loading states.
 * 
 * Features:
 * - Responsive skeleton layouts
 * - Smooth shimmer animations
 * - Dark mode support
 * - Accessibility compliance
 * - Performance optimized
 */

import React from 'react';
import './loading-skeletons.css';

/* =================================
   BASE SKELETON COMPONENTS
   ================================= */

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  animation = 'wave',
  ...props
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
  };

  const classes = [
    'skeleton',
    `skeleton-${variant}`,
    `skeleton-${animation}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} {...props} />;
};

/* =================================
   TEXT SKELETON COMPONENTS
   ================================= */

interface TextSkeletonProps {
  lines?: number;
  variant?: 'heading' | 'body' | 'caption';
  className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 1,
  variant = 'body',
  className = ''
}) => {
  const getLineHeight = (variant: string): string => {
    switch (variant) {
      case 'heading':
        return '1.5em';
      case 'caption':
        return '1em';
      default:
        return '1.2em';
    }
  };

  const lineElements: React.ReactElement[] = [];
  for (let i = 0; i < lines; i++) {
    lineElements.push(
      <Skeleton
        key={`text-skeleton-line-${i}`}
        variant="text"
        height={getLineHeight(variant)}
        width={i === lines - 1 ? '75%' : '100%'}
        className="text-skeleton-line"
      />
    );
  }

  return (
    <div className={`text-skeleton text-skeleton-${variant} ${className}`}>
      {lineElements}
    </div>
  );
};

/* =================================
   POST CARD SKELETON
   ================================= */

export const PostCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`post-card-skeleton skeleton-container ${className}`}>
      {/* Header with avatar and user info */}
      <div className="post-card-skeleton-header">
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          className="post-card-skeleton-avatar"
        />
        <div className="post-card-skeleton-user-info">
          <Skeleton
            variant="text"
            width="120px"
            height="1.2em"
            className="post-card-skeleton-username"
          />
          <Skeleton
            variant="text"
            width="80px"
            height="1em"
            className="post-card-skeleton-timestamp"
          />
        </div>
        <Skeleton
          variant="rectangular"
          width={24}
          height={24}
          className="post-card-skeleton-menu"
        />
      </div>

      {/* Content area */}
      <div className="post-card-skeleton-content">
        <TextSkeleton lines={3} variant="body" />
      </div>

      {/* Optional image placeholder */}
      <Skeleton
        variant="rectangular"
        height="200px"
        className="post-card-skeleton-image"
      />

      {/* Actions bar */}
      <div className="post-card-skeleton-actions">
        <Skeleton
          variant="rectangular"
          width={60}
          height={32}
          className="post-card-skeleton-action"
        />
        <Skeleton
          variant="rectangular"
          width={60}
          height={32}
          className="post-card-skeleton-action"
        />
        <Skeleton
          variant="rectangular"
          width={80}
          height={32}
          className="post-card-skeleton-action"
        />
      </div>
    </div>
  );
};

/* =================================
   CHAT MESSAGE SKELETON
   ================================= */

interface ChatMessageSkeletonProps {
  isOwn?: boolean;
  hasAvatar?: boolean;
  className?: string;
}

export const ChatMessageSkeleton: React.FC<ChatMessageSkeletonProps> = ({
  isOwn = false,
  hasAvatar = true,
  className = ''
}) => {
  return (
    <div className={`chat-message-skeleton ${isOwn ? 'chat-message-skeleton-own' : ''} ${className}`}>
      {!isOwn && hasAvatar && (
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          className="chat-message-skeleton-avatar"
        />
      )}
      <div className="chat-message-skeleton-content">
        <div className="chat-message-skeleton-bubble">
          <TextSkeleton lines={Math.floor(Math.random() * 3) + 1} variant="body" />
        </div>
        <Skeleton
          variant="text"
          width="60px"
          height="0.8em"
          className="chat-message-skeleton-timestamp"
        />
      </div>
    </div>
  );
};

/* =================================
   PROFILE CARD SKELETON
   ================================= */

export const ProfileCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`profile-card-skeleton skeleton-container ${className}`}>
      {/* Profile header */}
      <div className="profile-card-skeleton-header">
        <Skeleton
          variant="circular"
          width={80}
          height={80}
          className="profile-card-skeleton-avatar"
        />
        <div className="profile-card-skeleton-info">
          <Skeleton
            variant="text"
            width="150px"
            height="1.5em"
            className="profile-card-skeleton-name"
          />
          <Skeleton
            variant="text"
            width="100px"
            height="1em"
            className="profile-card-skeleton-role"
          />
          <Skeleton
            variant="text"
            width="80px"
            height="1em"
            className="profile-card-skeleton-status"
          />
        </div>
      </div>

      {/* Stats section */}
      <div className="profile-card-skeleton-stats">
        <div className="profile-card-skeleton-stat">
          <Skeleton variant="text" width="40px" height="1.8em" />
          <Skeleton variant="text" width="60px" height="1em" />
        </div>
        <div className="profile-card-skeleton-stat">
          <Skeleton variant="text" width="40px" height="1.8em" />
          <Skeleton variant="text" width="60px" height="1em" />
        </div>
        <div className="profile-card-skeleton-stat">
          <Skeleton variant="text" width="40px" height="1.8em" />
          <Skeleton variant="text" width="60px" height="1em" />
        </div>
      </div>

      {/* Bio section */}
      <div className="profile-card-skeleton-bio">
        <TextSkeleton lines={2} variant="body" />
      </div>

      {/* Actions */}
      <div className="profile-card-skeleton-actions">
        <Skeleton
          variant="rectangular"
          height="40px"
          className="profile-card-skeleton-action-primary"
        />
        <Skeleton
          variant="rectangular"
          height="40px"
          className="profile-card-skeleton-action-secondary"
        />
      </div>
    </div>
  );
};

/* =================================
   NAVIGATION SKELETON
   ================================= */

export const NavigationSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigationItems: React.ReactElement[] = [];
  for (let i = 0; i < 6; i++) {
    navigationItems.push(
      <div key={`nav-item-${i}`} className="navigation-skeleton-item">
        <Skeleton
          variant="rectangular"
          width={24}
          height={24}
          className="navigation-skeleton-icon"
        />
        <Skeleton
          variant="text"
          width="80px"
          height="1.2em"
          className="navigation-skeleton-label"
        />
      </div>
    );
  }

  return (
    <div className={`navigation-skeleton ${className}`}>
      {navigationItems}
    </div>
  );
};

/* =================================
   DASHBOARD WIDGET SKELETON
   ================================= */

export const DashboardWidgetSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`dashboard-widget-skeleton skeleton-container ${className}`}>
      {/* Widget header */}
      <div className="dashboard-widget-skeleton-header">
        <Skeleton
          variant="text"
          width="120px"
          height="1.5em"
          className="dashboard-widget-skeleton-title"
        />
        <Skeleton
          variant="rectangular"
          width={20}
          height={20}
          className="dashboard-widget-skeleton-icon"
        />
      </div>

      {/* Widget content */}
      <div className="dashboard-widget-skeleton-content">
        <Skeleton
          variant="text"
          width="60px"
          height="2.5em"
          className="dashboard-widget-skeleton-value"
        />
        <Skeleton
          variant="text"
          width="100px"
          height="1em"
          className="dashboard-widget-skeleton-label"
        />
      </div>

      {/* Optional chart area */}
      <Skeleton
        variant="rectangular"
        height="80px"
        className="dashboard-widget-skeleton-chart"
      />
    </div>
  );
};

/* =================================
   FEED SKELETON
   ================================= */

interface FeedSkeletonProps {
  itemCount?: number;
  className?: string;
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({
  itemCount = 5,
  className = ''
}) => {
  const feedItems: React.ReactElement[] = [];
  for (let i = 0; i < itemCount; i++) {
    feedItems.push(
      <PostCardSkeleton key={`feed-item-${i}`} className="feed-skeleton-item" />
    );
  }

  return (
    <div className={`feed-skeleton ${className}`}>
      {feedItems}
    </div>
  );
};

/* =================================
   SEARCH RESULTS SKELETON
   ================================= */

export const SearchResultsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const searchResults: React.ReactElement[] = [];
  for (let i = 0; i < 4; i++) {
    searchResults.push(
      <div key={`search-result-${i}`} className="search-result-skeleton-item">
        <Skeleton
          variant="rectangular"
          width={48}
          height={48}
          className="search-result-skeleton-thumbnail"
        />
        <div className="search-result-skeleton-content">
          <Skeleton
            variant="text"
            width="200px"
            height="1.3em"
            className="search-result-skeleton-title"
          />
          <TextSkeleton lines={2} variant="body" />
          <Skeleton
            variant="text"
            width="120px"
            height="1em"
            className="search-result-skeleton-meta"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`search-results-skeleton ${className}`}>
      {searchResults}
    </div>
  );
};

/* =================================
   TABLE SKELETON
   ================================= */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = ''
}) => {
  const headerCells: React.ReactElement[] = [];
  if (hasHeader) {
    for (let i = 0; i < columns; i++) {
      headerCells.push(
        <Skeleton
          key={`header-cell-${i}`}
          variant="text"
          height="1.5em"
          className="table-skeleton-header-cell"
        />
      );
    }
  }

  const bodyRows: React.ReactElement[] = [];
  for (let i = 0; i < rows; i++) {
    const rowCells: React.ReactElement[] = [];
    for (let j = 0; j < columns; j++) {
      rowCells.push(
        <Skeleton
          key={`row-${i}-cell-${j}`}
          variant="text"
          height="1.2em"
          className="table-skeleton-cell"
        />
      );
    }
    bodyRows.push(
      <div key={`table-row-${i}`} className="table-skeleton-row">
        {rowCells}
      </div>
    );
  }

  return (
    <div className={`table-skeleton ${className}`}>
      {hasHeader && (
        <div className="table-skeleton-header">
          {headerCells}
        </div>
      )}
      <div className="table-skeleton-body">
        {bodyRows}
      </div>
    </div>
  );
};

/* =================================
   FORM SKELETON
   ================================= */

export const FormSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const formFields: React.ReactElement[] = [];
  for (let i = 0; i < 4; i++) {
    formFields.push(
      <div key={`form-field-${i}`} className="form-skeleton-field">
        <Skeleton
          variant="text"
          width="100px"
          height="1.2em"
          className="form-skeleton-label"
        />
        <Skeleton
          variant="rectangular"
          height="48px"
          className="form-skeleton-input"
        />
      </div>
    );
  }

  return (
    <div className={`form-skeleton ${className}`}>
      {/* Form title */}
      <Skeleton
        variant="text"
        width="200px"
        height="2em"
        className="form-skeleton-title"
      />

      {/* Form fields */}
      {formFields}

      {/* Form actions */}
      <div className="form-skeleton-actions">
        <Skeleton
          variant="rectangular"
          width="100px"
          height="44px"
          className="form-skeleton-button"
        />
        <Skeleton
          variant="rectangular"
          width="80px"
          height="44px"
          className="form-skeleton-button"
        />
      </div>
    </div>
  );
};

/* =================================
   LOADING STATE WRAPPER
   ================================= */

interface LoadingWrapperProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  skeleton,
  children,
  className = ''
}) => {
  return (
    <div className={`loading-wrapper ${className}`}>
      {loading ? skeleton : children}
    </div>
  );
};

/* =================================
   SKELETON LIST
   ================================= */

interface SkeletonListProps {
  count: number;
  skeleton: React.ReactNode;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count,
  skeleton,
  className = ''
}) => {
  const listItems: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    listItems.push(
      <div key={`skeleton-list-item-${i}`} className="skeleton-list-item">
        {skeleton}
      </div>
    );
  }

  return (
    <div className={`skeleton-list ${className}`}>
      {listItems}
    </div>
  );
};

// Export the base Skeleton component as default for lazy loading
export default Skeleton;
