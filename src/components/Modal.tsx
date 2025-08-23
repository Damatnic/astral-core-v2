import React, { useEffect, useRef } from 'react';
import { CloseIcon  } from './icons.dynamic';

export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose?: () => void; 
  children: React.ReactNode; 
  title: string; 
  isDismissible?: boolean;
  allowSwipeToDismiss?: boolean;
  enhanced?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  description?: string;
  variant?: 'glass' | 'neumorph' | 'default';
  animate?: boolean;
}> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  isDismissible = true,
  allowSwipeToDismiss = true,
  enhanced = true,
  size = 'md',
  description,
  variant = 'glass',
  animate = true
}) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Save previous focus and manage focus restoration
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            
            // Focus the modal content after it opens
            setTimeout(() => {
                const focusableElement = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
                if (focusableElement) {
                    focusableElement.focus();
                } else {
                    modalRef.current?.focus();
                }
            }, 100);
        } else if (previousFocusRef.current) {
            // Restore focus when modal closes
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
        }
    }, [isOpen]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            // Close modal on Escape key
            if (event.key === 'Escape' && isDismissible && onClose) {
                event.preventDefault();
                onClose();
                return;
            }

            // Handle Tab key for focus trapping
            if (event.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey && document.activeElement === firstElement) {
                    // Shift + Tab on first element - go to last
                    event.preventDefault();
                    lastElement?.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    // Tab on last element - go to first
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDismissible, onClose]);

    if (!isOpen) return null;

    const overlayClasses = [enhanced ? 'modal-overlay-enhanced smooth-transition' : 'modal-overlay'];
    
    // Determine content classes based on variant
    let contentClasses = ['modal-panel'];
    if (enhanced) {
        switch(variant) {
            case 'glass':
                contentClasses = ['glass-card', 'modal-content-enhanced'];
                break;
            case 'neumorph':
                contentClasses = ['neumorph-card', 'modal-content-enhanced'];
                break;
            default:
                contentClasses = ['modal-content-enhanced'];
        }
    }
    
    if (animate) {
        contentClasses.push('animate-breathe');
    }
    
    if (enhanced && size !== 'md') {
        contentClasses.push(`modal-${size}`);
    }

    return (
        <div className={overlayClasses.join(' ')}>
            {isDismissible && (
                <button
                    className="modal-overlay-button"
                    onClick={onClose}
                    aria-label="Close modal"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: -1
                    }}
                />
            )}
            <dialog 
                ref={modalRef}
                className={contentClasses.join(' ')} 
                open={isOpen}
                aria-labelledby="modal-title"
                aria-describedby={description ? "modal-description" : undefined}
                onCancel={(e) => {
                    e.preventDefault(); // Prevent default browser behavior
                    if (isDismissible && onClose) onClose();
                }}
            >
                <div className={enhanced ? 'modal-header-enhanced smooth-transition' : 'modal-header'}>
                    <h2 id="modal-title" className={enhanced ? 'modal-title-enhanced gradient-text' : ''}>{title}</h2>
                    {isDismissible && (
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`modal-close-btn touch-optimized smooth-transition ${enhanced ? 'glass-button' : ''}`} 
                            aria-label={`Close ${title} dialog`}
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
                {description && (
                    <div id="modal-description" className="sr-only">
                        {description}
                    </div>
                )}
                <div className={enhanced ? 'modal-body-enhanced smooth-transition' : 'modal-body'}>
                    {children}
                </div>
                {enhanced && isDismissible && (
                    <div className="modal-footer-enhanced">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="glass-button smooth-transition"
                            aria-label={`Close ${title} dialog`}
                        >
                            Close
                        </button>
                    </div>
                )}
                {allowSwipeToDismiss && isDismissible && !enhanced && (
                    <div className="modal-swipe-hint" aria-hidden="true">
                        <div className="swipe-indicator"></div>
                        <span>Swipe to dismiss</span>
                    </div>
                )}
            </dialog>
        </div>
    );
};