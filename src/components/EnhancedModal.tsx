import React, { useRef, useEffect, useCallback } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { CloseIcon } from './icons.dynamic';
import './EnhancedModal.css';

export interface EnhancedModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to trap focus within modal */
  trapFocus?: boolean;
  /** Whether to auto-focus first element */
  autoFocus?: boolean;
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Modal variant */
  variant?: 'default' | 'confirmation' | 'form' | 'info';
  /** Announcement for screen readers when modal opens */
  openAnnouncement?: string;
  /** Custom close button label */
  closeButtonLabel?: string;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether modal is loading */
  loading?: boolean;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  trapFocus = true,
  autoFocus = true,
  size = 'md',
  variant = 'default',
  openAnnouncement,
  closeButtonLabel = 'Close modal',
  footer,
  loading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Initialize keyboard navigation
  const {
    focusFirst,
    focusLast,
    getFocusableElements,
    trapFocusInContainer
  } = useKeyboardNavigation(modalRef, {
    trapFocus,
    autoFocus,
    enableEscape: closeOnEscape,
    onEscape: onClose,
    restoreFocus: true,
    handleTab: true
  });

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === backdropRef.current) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  /**
   * Handle escape key
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          event.preventDefault();
          onClose();
        }
        break;

      case 'Tab':
        if (trapFocus) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length === 0) {
            event.preventDefault();
            return;
          }

          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          
          if (event.shiftKey) {
            // Shift + Tab - go to previous
            if (currentIndex === 0 || currentIndex === -1) {
              event.preventDefault();
              focusLast();
            }
          } else {
            // Tab - go to next
            if (currentIndex === focusableElements.length - 1 || currentIndex === -1) {
              event.preventDefault();
              focusFirst();
            }
          }
        }
        break;
    }
  }, [isOpen, closeOnEscape, onClose, trapFocus, getFocusableElements, focusFirst, focusLast]);

  /**
   * Manage focus and announcements when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      // Store last focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');

      // Enable focus trapping
      if (trapFocus) {
        trapFocusInContainer(true);
      }

      // Auto-focus first element or close button
      setTimeout(() => {
        if (autoFocus) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else if (closeButtonRef.current) {
            closeButtonRef.current.focus();
          }
        }
      }, 100);

      // Announce modal opening to screen readers
      if (openAnnouncement) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = openAnnouncement;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown, true);

      return () => {
        // Cleanup
        document.body.style.overflow = '';
        document.body.removeAttribute('aria-hidden');
        document.removeEventListener('keydown', handleKeyDown, true);
        
        // Disable focus trapping
        if (trapFocus) {
          trapFocusInContainer(false);
        }

        // Restore focus to last focused element
        if (lastFocusedElement.current && document.contains(lastFocusedElement.current)) {
          setTimeout(() => {
            lastFocusedElement.current?.focus();
          }, 100);
        }

        // Announce modal closing
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Modal closed';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      };
    }
  }, [isOpen, autoFocus, trapFocus, openAnnouncement, getFocusableElements, trapFocusInContainer, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  const modalClasses = [
    'enhanced-modal',
    `enhanced-modal--${size}`,
    `enhanced-modal--${variant}`,
    loading && 'enhanced-modal--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={backdropRef}
      className="enhanced-modal-backdrop"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="enhanced-modal__header">
          <h2 id="modal-title" className="enhanced-modal__title">
            {title}
          </h2>
          {showCloseButton && (
            <button
              ref={closeButtonRef}
              type="button"
              className="enhanced-modal__close"
              onClick={onClose}
              aria-label={closeButtonLabel}
              disabled={loading}
            >
              <CloseIcon className="enhanced-modal__close-icon" />
            </button>
          )}
        </header>

        {/* Modal Content */}
        <div id="modal-content" className="enhanced-modal__content">
          {loading ? (
            <div className="enhanced-modal__loading" aria-live="polite">
              <div className="enhanced-modal__spinner" />
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Modal Footer */}
        {footer && (
          <footer className="enhanced-modal__footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

/**
 * Modal context for managing multiple modals
 */
interface ModalContextValue {
  openModal: (id: string, props: Omit<EnhancedModalProps, 'isOpen' | 'onClose'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = React.useState<Record<string, EnhancedModalProps>>({});

  const openModal = useCallback((id: string, props: Omit<EnhancedModalProps, 'isOpen' | 'onClose'>) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        ...props,
        isOpen: true,
        onClose: () => closeModal(id)
      }
    }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return Boolean(modals[id]?.isOpen);
  }, [modals]);

  const contextValue: ModalContextValue = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {Object.entries(modals).map(([id, props]) => (
        <EnhancedModal key={id} {...props} />
      ))}
    </ModalContext.Provider>
  );
};

export default EnhancedModal;
