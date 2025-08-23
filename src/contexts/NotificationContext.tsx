import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { Toast as ToastType, ConfirmationModalState } from '../types';

interface NotificationContextType {
  toasts: ToastType[];
  addToast: (message: string, type?: ToastType['type']) => void;
  removeToast: (id: string) => void;
  confirmationModal: ConfirmationModalState | null;
  showConfirmationModal: (config: ConfirmationModalState) => void;
  hideConfirmationModal: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState | null>(null);

  const addToast = useCallback((message: string, type: ToastType['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirmationModal = useCallback((config: ConfirmationModalState) => {
    setConfirmationModal(config);
  }, []);

  const hideConfirmationModal = useCallback(() => {
    if (confirmationModal?.onCancel) {
        confirmationModal.onCancel();
    }
    setConfirmationModal(null);
  }, [confirmationModal]);
  
  const value = useMemo(() => ({ 
    toasts, 
    addToast, 
    removeToast,
    confirmationModal, 
    showConfirmationModal, 
    hideConfirmationModal 
  }), [toasts, addToast, removeToast, confirmationModal, showConfirmationModal, hideConfirmationModal]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Export NotificationContext for testing purposes
export { NotificationContext };