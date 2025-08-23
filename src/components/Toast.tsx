import React, { useEffect } from 'react';
import { Toast as ToastType } from '../types';
import { useNotification } from '../contexts/NotificationContext';

export const Toast: React.FC<{ toast: ToastType, onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onDismiss) {
                onDismiss(toast.id);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    // Use glass morphism for toasts
    const toastClasses = [
        'glass-card',
        'toast',
        `toast-${toast.type}`,
        'smooth-transition',
        'animate-float'
    ].join(' ');

    return (
        <div className={toastClasses}>
            <div className="toast-message">{toast.message}</div>
            <div className="toast-progress animate-gradient"></div>
        </div>
    );
};

export const ToastContainer: React.FC<{}> = () => {
    const { toasts, removeToast } = useNotification();
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};
