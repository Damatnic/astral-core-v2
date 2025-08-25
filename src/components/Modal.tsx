import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './icons.dynamic';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title: string;
  isDismissible?: boolean;
  allowSwipeToDismiss?: boolean;
  enhanced?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  isDismissible = true,
  allowSwipeToDismiss = false,
  enhanced = false,
  size = 'md',
  className = '',
  overlayClassName = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const startTouchY = useRef<number>(0);
  const currentTouchY = useRef<number>(0);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDismissible && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, isDismissible, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle scroll prevention
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  // Handle swipe to dismiss
  const handleTouchStart = (event: React.TouchEvent) => {
    if (!allowSwipeToDismiss) return;
    startTouchY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!allowSwipeToDismiss) return;
    currentTouchY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!allowSwipeToDismiss || !isDismissible || !onClose) return;
    
    const deltaY = currentTouchY.current - startTouchY.current;
    
    // If swiped down more than 100px, close modal
    if (deltaY > 100) {
      onClose();
    }
  };

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (
      closeOnOverlayClick &&
      isDismissible &&
      onClose &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  // Get modal size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'max-w-full m-4';
      default:
        return 'max-w-md';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        enhanced 
          ? 'bg-black bg-opacity-50 backdrop-blur-sm' 
          : 'bg-black bg-opacity-50'
      }`} />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${getSizeClasses()} bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${
          enhanced ? 'shadow-2xl' : ''
        } ${className}`}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h3>
          
          {showCloseButton && isDismissible && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Specialized modal variants
export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          button: 'bg-red-600 hover:bg-red-700 text-white',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: 'text-yellow-500'
        };
      default:
        return {
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: 'text-blue-500'
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${classes.icon}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${classes.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const LoadingModal: React.FC<{
  isOpen: boolean;
  title: string;
  message?: string;
}> = ({ isOpen, title, message }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} 
      title={title} 
      isDismissible={false}
      showCloseButton={false}
      size="sm"
    >
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        {message && (
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </Modal>
  );
};

export const FullScreenModal: React.FC<{
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
      className="h-full max-h-screen"
      overlayClassName="p-0"
    >
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </Modal>
  );
};

export default Modal;
