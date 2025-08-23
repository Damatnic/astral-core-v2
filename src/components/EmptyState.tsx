import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No content yet",
  message = "There's nothing to show here at the moment.",
  icon,
  action,
  className = '',
  children
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
      {children && <div className="empty-state-children">{children}</div>}
    </div>
  );
};

export { EmptyState };
export default EmptyState;