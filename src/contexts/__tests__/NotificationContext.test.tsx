import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../NotificationContext';

describe('NotificationContext', () => {
  let mockUUID = 0;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUUID = 0;
    
    // Mock crypto.randomUUID
    global.crypto = {
      randomUUID: jest.fn(() => `mock-uuid-${++mockUUID}`),
    } as any;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('NotificationProvider', () => {
    it('should provide default values', () => {
      const TestComponent = () => {
        const { toasts, confirmationModal } = useNotification();
        return (
          <div>
            <span data-testid="toasts-count">{toasts.length}</span>
            <span data-testid="modal-status">
              {confirmationModal ? 'Modal shown' : 'No modal'}
            </span>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('toasts-count')).toHaveTextContent('0');
      expect(screen.getByTestId('modal-status')).toHaveTextContent('No modal');
    });

    it.skip('should add toast notifications', () => {
      const TestComponent = () => {
        const { toasts, addToast } = useNotification();
        return (
          <div>
            <button onClick={() => addToast('Test message', 'success')}>
              Add Toast
            </button>
            <div data-testid="toasts">
              {toasts.map(toast => (
                <div key={toast.id}>
                  {toast.message} - {toast.type}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('toasts')).toBeEmptyDOMElement();

      // Add a toast
      act(() => {
        screen.getByText('Add Toast').click();
      });

      expect(screen.getByTestId('toasts')).toHaveTextContent('Test message - success');
    });

    it.skip('should remove toast notifications', async () => {
      const TestComponent = () => {
        const { toasts, addToast, removeToast } = useNotification();
        return (
          <div>
            <button onClick={() => addToast('Test message', 'info')}>
              Add Toast
            </button>
            <div data-testid="toasts">
              {toasts.map(toast => (
                <div key={toast.id}>
                  <span>{toast.message}</span>
                  <button onClick={() => removeToast(toast.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add a toast
      act(() => {
        screen.getByText('Add Toast').click();
      });

      expect(screen.getByText('Test message')).toBeInTheDocument();

      // Remove the toast
      act(() => {
        screen.getByText('Remove').click();
      });

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it.skip('should handle multiple toasts', () => {
      const TestComponent = () => {
        const { toasts, addToast } = useNotification();
        return (
          <div>
            <button onClick={() => addToast('First', 'success')}>Add First</button>
            <button onClick={() => addToast('Second', 'error')}>Add Second</button>
            <button onClick={() => addToast('Third', 'warning')}>Add Third</button>
            <span data-testid="toast-count">{toasts.length}</span>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

      act(() => {
        screen.getByText('Add First').click();
      });
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

      act(() => {
        screen.getByText('Add Second').click();
      });
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2');

      act(() => {
        screen.getByText('Add Third').click();
      });
      expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
    });

    it.skip('should show confirmation modal', () => {
      const TestComponent = () => {
        const { confirmationModal, showConfirmationModal } = useNotification();
        const handleShowModal = () => {
          showConfirmationModal({
            title: 'Confirm Action',
            message: 'Are you sure?',
            onConfirm: jest.fn(),
            onCancel: jest.fn(),
          });
        };

        return (
          <div>
            <button onClick={handleShowModal}>Show Modal</button>
            {confirmationModal && (
              <div data-testid="modal">
                <h2>{confirmationModal.title}</h2>
                <p>{confirmationModal.message}</p>
              </div>
            )}
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      act(() => {
        screen.getByText('Show Modal').click();
      });

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it.skip('should hide confirmation modal', () => {
      const TestComponent = () => {
        const { confirmationModal, showConfirmationModal, hideConfirmationModal } = useNotification();
        
        return (
          <div>
            <button 
              onClick={() => showConfirmationModal({
                title: 'Test',
                message: 'Test message',
                onConfirm: jest.fn(),
                onCancel: jest.fn(),
              })}
            >
              Show
            </button>
            <button onClick={hideConfirmationModal}>Hide</button>
            <span data-testid="modal-status">
              {confirmationModal ? 'Visible' : 'Hidden'}
            </span>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('modal-status')).toHaveTextContent('Hidden');

      // Show modal
      act(() => {
        screen.getByText('Show').click();
      });
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Visible');

      // Hide modal
      act(() => {
        screen.getByText('Hide').click();
      });
      expect(screen.getByTestId('modal-status')).toHaveTextContent('Hidden');
    });

    it('should generate unique IDs for toasts', () => {
      const TestComponent = () => {
        const { toasts, addToast } = useNotification();
        return (
          <div>
            <button onClick={() => addToast('Message')}>Add</button>
            <div data-testid="toast-ids">
              {toasts.map(toast => (
                <span key={toast.id}>{toast.id}</span>
              ))}
            </div>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add multiple toasts
      act(() => {
        screen.getByText('Add').click();
      });
      act(() => {
        screen.getByText('Add').click();
      });
      act(() => {
        screen.getByText('Add').click();
      });

      const ids = screen.getByTestId('toast-ids').textContent;
      // Check that IDs are unique (no duplicates when split)
      const idArray = ids?.match(/\S+/g) || [];
      const uniqueIds = new Set(idArray);
      expect(uniqueIds.size).toBe(idArray.length);
    });

    it.skip('should use default toast type when not specified', () => {
      const TestComponent = () => {
        const { toasts, addToast } = useNotification();
        return (
          <div>
            <button onClick={() => addToast('Default message')}>Add Default</button>
            {toasts.map(toast => (
              <span key={toast.id} data-testid="toast-type">{toast.type}</span>
            ))}
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      act(() => {
        screen.getByText('Add Default').click();
      });

      expect(screen.getByTestId('toast-type')).toHaveTextContent('success');
    });
  });

  describe('useNotification hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        useNotification();
        return null;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotification must be used within a NotificationProvider');

      console.error = originalError;
    });

    it('should return notification context when used within provider', () => {
      const TestComponent = () => {
        const context = useNotification();
        return (
          <div data-testid="context-status">
            {context ? 'Context available' : 'No context'}
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('context-status')).toHaveTextContent('Context available');
    });
  });
});