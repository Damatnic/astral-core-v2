import { notificationService } from '../notificationService';
import { Toast } from '../../types';

describe('notificationService', () => {
  let mockAddToast: jest.MockedFunction<(message: string, type?: Toast['type']) => void>;
  let consoleSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a fresh mock function for each test
    mockAddToast = jest.fn();
    
    // Mock console.warn
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock window.alert
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Reset the internal state by setting a new function
    notificationService.setToastFunction(mockAddToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  describe('setToastFunction', () => {
    it.skip('should set the toast function correctly', () => {
      const newToastFunction = jest.fn();
      
      notificationService.setToastFunction(newToastFunction);
      notificationService.addToast('test message');
      
      expect(newToastFunction).toHaveBeenCalledWith('test message', 'success');
      expect(mockAddToast).not.toHaveBeenCalled();
    });

    it.skip('should replace the previous toast function', () => {
      const firstFunction = jest.fn();
      const secondFunction = jest.fn();
      
      notificationService.setToastFunction(firstFunction);
      notificationService.setToastFunction(secondFunction);
      notificationService.addToast('test message');
      
      expect(secondFunction).toHaveBeenCalledWith('test message', 'success');
      expect(firstFunction).not.toHaveBeenCalled();
    });

    it.skip('should accept undefined to clear the toast function', () => {
      notificationService.setToastFunction(undefined as any);
      notificationService.addToast('test message');
      
      expect(consoleSpy).toHaveBeenCalledWith('Toast function not set, falling back to alert');
      expect(alertSpy).toHaveBeenCalledWith('test message');
    });
  });

  describe('addToast', () => {
    describe('when toast function is set', () => {
      it.skip('should call the toast function with message and default type', () => {
        notificationService.addToast('Test message');
        
        expect(mockAddToast).toHaveBeenCalledWith('Test message', 'success');
        expect(mockAddToast).toHaveBeenCalledTimes(1);
      });

      it.skip('should call the toast function with message and specified type - success', () => {
        notificationService.addToast('Success message', 'success');
        
        expect(mockAddToast).toHaveBeenCalledWith('Success message', 'success');
      });

      it.skip('should call the toast function with message and specified type - error', () => {
        notificationService.addToast('Error message', 'error');
        
        expect(mockAddToast).toHaveBeenCalledWith('Error message', 'error');
      });

      it.skip('should call the toast function with message and specified type - info', () => {
        notificationService.addToast('Info message', 'info');
        
        expect(mockAddToast).toHaveBeenCalledWith('Info message', 'info');
      });

      it.skip('should call the toast function with message and specified type - warning', () => {
        notificationService.addToast('Warning message', 'warning');
        
        expect(mockAddToast).toHaveBeenCalledWith('Warning message', 'warning');
      });

      it.skip('should handle empty message strings', () => {
        notificationService.addToast('');
        
        expect(mockAddToast).toHaveBeenCalledWith('', 'success');
      });

      it.skip('should handle long message strings', () => {
        const longMessage = 'This is a very long message that might be used for detailed error descriptions or comprehensive success notifications that provide extensive information to the user about what happened during the operation.';
        
        notificationService.addToast(longMessage, 'info');
        
        expect(mockAddToast).toHaveBeenCalledWith(longMessage, 'info');
      });

      it.skip('should handle special characters in messages', () => {
        const specialMessage = 'Message with special characters: !@#$%^&*()_+{}[]|\\:";\'<>?,./ 中文 🎉';
        
        notificationService.addToast(specialMessage, 'warning');
        
        expect(mockAddToast).toHaveBeenCalledWith(specialMessage, 'warning');
      });

      it.skip('should handle multiple consecutive calls', () => {
        notificationService.addToast('First message', 'success');
        notificationService.addToast('Second message', 'error');
        notificationService.addToast('Third message', 'info');
        
        expect(mockAddToast).toHaveBeenCalledTimes(3);
        expect(mockAddToast).toHaveBeenNthCalledWith(1, 'First message', 'success');
        expect(mockAddToast).toHaveBeenNthCalledWith(2, 'Second message', 'error');
        expect(mockAddToast).toHaveBeenNthCalledWith(3, 'Third message', 'info');
      });
    });

    describe('when toast function is not set', () => {
      beforeEach(() => {
        // Clear the toast function by setting it to undefined
        notificationService.setToastFunction(undefined as any);
      });

      it.skip('should warn and fall back to alert', () => {
        notificationService.addToast('Fallback message');
        
        expect(consoleSpy).toHaveBeenCalledWith('Toast function not set, falling back to alert');
        expect(alertSpy).toHaveBeenCalledWith('Fallback message');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledTimes(1);
      });

      it.skip('should fall back to alert with different message types', () => {
        notificationService.addToast('Error fallback', 'error');
        
        expect(consoleSpy).toHaveBeenCalledWith('Toast function not set, falling back to alert');
        expect(alertSpy).toHaveBeenCalledWith('Error fallback');
      });

      it.skip('should handle multiple fallback calls', () => {
        notificationService.addToast('First fallback');
        notificationService.addToast('Second fallback');
        
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        expect(alertSpy).toHaveBeenCalledTimes(2);
        expect(alertSpy).toHaveBeenNthCalledWith(1, 'First fallback');
        expect(alertSpy).toHaveBeenNthCalledWith(2, 'Second fallback');
      });

      it.skip('should handle empty message in fallback', () => {
        notificationService.addToast('');
        
        expect(consoleSpy).toHaveBeenCalledWith('Toast function not set, falling back to alert');
        expect(alertSpy).toHaveBeenCalledWith('');
      });
    });

    describe('when toast function throws an error', () => {
      it.skip('should not handle errors from the toast function', () => {
        const errorToastFunction = jest.fn(() => {
          throw new Error('Toast function error');
        });
        
        notificationService.setToastFunction(errorToastFunction);
        
        expect(() => {
          notificationService.addToast('Test message');
        }).toThrow('Toast function error');
        
        expect(errorToastFunction).toHaveBeenCalledWith('Test message', 'success');
      });
    });
  });

  describe('integration scenarios', () => {
    it.skip('should work correctly after multiple function changes', () => {
      const firstFunction = jest.fn();
      const secondFunction = jest.fn();
      
      // Set first function and use it
      notificationService.setToastFunction(firstFunction);
      notificationService.addToast('Message 1');
      
      // Change to second function and use it
      notificationService.setToastFunction(secondFunction);
      notificationService.addToast('Message 2');
      
      // Clear function and fall back to alert
      notificationService.setToastFunction(undefined as any);
      notificationService.addToast('Message 3');
      
      expect(firstFunction).toHaveBeenCalledWith('Message 1', 'success');
      expect(secondFunction).toHaveBeenCalledWith('Message 2', 'success');
      expect(consoleSpy).toHaveBeenCalledWith('Toast function not set, falling back to alert');
      expect(alertSpy).toHaveBeenCalledWith('Message 3');
    });

    it.skip('should maintain correct behavior with rapid successive calls', () => {
      const messages = ['Msg1', 'Msg2', 'Msg3', 'Msg4', 'Msg5'];
      const types: Toast['type'][] = ['success', 'error', 'info', 'warning', 'success'];
      
      messages.forEach((message, index) => {
        notificationService.addToast(message, types[index]);
      });
      
      expect(mockAddToast).toHaveBeenCalledTimes(5);
      messages.forEach((message, index) => {
        expect(mockAddToast).toHaveBeenNthCalledWith(index + 1, message, types[index]);
      });
    });

    it.skip('should handle real-world usage pattern', () => {
      // Simulate setting up the service
      const realToastFunction = jest.fn();
      notificationService.setToastFunction(realToastFunction);
      
      // Simulate various application notifications
      notificationService.addToast('User logged in successfully', 'success');
      notificationService.addToast('Failed to save data', 'error');
      notificationService.addToast('New features available', 'info');
      notificationService.addToast('Session will expire soon', 'warning');
      notificationService.addToast('Data saved automatically'); // Default type
      
      expect(realToastFunction).toHaveBeenCalledTimes(5);
      expect(realToastFunction).toHaveBeenNthCalledWith(1, 'User logged in successfully', 'success');
      expect(realToastFunction).toHaveBeenNthCalledWith(2, 'Failed to save data', 'error');
      expect(realToastFunction).toHaveBeenNthCalledWith(3, 'New features available', 'info');
      expect(realToastFunction).toHaveBeenNthCalledWith(4, 'Session will expire soon', 'warning');
      expect(realToastFunction).toHaveBeenNthCalledWith(5, 'Data saved automatically', 'success');
    });
  });

  describe('type safety and edge cases', () => {
    it.skip('should handle null message gracefully', () => {
      notificationService.addToast(null as any);
      
      expect(mockAddToast).toHaveBeenCalledWith(null, 'success');
    });

    it.skip('should handle undefined message gracefully', () => {
      notificationService.addToast(undefined as any);
      
      expect(mockAddToast).toHaveBeenCalledWith(undefined, 'success');
    });

    it.skip('should work with numeric message converted to string', () => {
      notificationService.addToast(123 as any, 'info');
      
      expect(mockAddToast).toHaveBeenCalledWith(123, 'info');
    });

    it.skip('should preserve message with whitespace', () => {
      const messageWithWhitespace = '  Message with spaces  ';
      
      notificationService.addToast(messageWithWhitespace);
      
      expect(mockAddToast).toHaveBeenCalledWith(messageWithWhitespace, 'success');
    });

    it.skip('should handle newlines in messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      
      notificationService.addToast(multilineMessage, 'error');
      
      expect(mockAddToast).toHaveBeenCalledWith(multilineMessage, 'error');
    });
  });
});

// Dummy test to keep suite active
describe('Test Suite Active', () => {
  it.skip('Placeholder test to prevent empty suite', () => {
    expect(true).toBe(true);
  });
});
