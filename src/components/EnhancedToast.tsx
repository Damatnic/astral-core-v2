/**
 * Enhanced Toast Component
 * 
 * Modern toast notification system with improved visual design,
 * animations, and accessibility features.
 */

import React, { useEffect, useState } from 'react';
import { CloseIcon, CheckIcon, AlertIcon  } from './icons.dynamic';

// For missing icons, create simple components
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  enhanced?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const TOAST_ICONS = {
  success: CheckIcon || (() => <span>✓</span>),
  error: CloseIcon || (() => <span>✗</span>),
  warning: AlertIcon || (() => <span>⚠</span>),
  info: InfoIcon,
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  enhanced = true,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const IconComponent = TOAST_ICONS[type];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  };

  const toastClass = enhanced ? 'toast-enhanced' : 'toast';
  const typeClass = enhanced ? type : `toast-${type}`;
  
  const classes = [
    toastClass,
    typeClass,
    `toast-${position}`,
    isVisible ? 'toast-visible' : 'toast-hidden',
    isLeaving ? 'toast-leaving' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {enhanced && (
        <div className="toast-icon-enhanced">
          <IconComponent />
        </div>
      )}
      
      <div className={enhanced ? 'toast-content-enhanced' : 'toast-content'}>
        {title && (
          <div className={enhanced ? 'toast-title-enhanced' : 'toast-title'}>
            {title}
          </div>
        )}
        <div className={enhanced ? 'toast-message-enhanced' : 'toast-message'}>
          {message}
        </div>
      </div>

      <button
        onClick={handleClose}
        className={enhanced ? 'btn-enhanced ghost sm' : 'toast-close'}
        aria-label="Close notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, 'onClose'>>;
  onClose: (id: string) => void;
  enhanced?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  enhanced = true,
  position = 'top-right'
}) => {
  if (toasts.length === 0) return null;

  const containerClass = enhanced ? 'toast-container-enhanced' : 'toast-container';
  const positionClass = `toast-container-${position}`;

  return (
    <div className={`${containerClass} ${positionClass}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
          enhanced={enhanced}
          position={position}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (message: string, title?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const showError = (message: string, title?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'error', title, message, ...options });
  };

  const showWarning = (message: string, title?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  const showInfo = (message: string, title?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
