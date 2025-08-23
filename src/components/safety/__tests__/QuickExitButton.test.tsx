/**
 * Test Suite for QuickExitButton Component
 * Tests emergency site exit functionality with keyboard shortcuts
 */

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithoutProviders, cleanup } from '../../../test-utils';
import '@testing-library/jest-dom';
import QuickExitButton from '../QuickExitButton';
import { BrowserRouter } from 'react-router-dom';

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  replace: jest.fn(),
  assign: jest.fn()
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true
});

// Use the existing sessionStorage mock from setupTests.ts
// Just create references to the existing mock functions for easier testing
const mockSessionStorage = window.sessionStorage as {
  clear: jest.Mock;
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  key: jest.Mock;
  length: number;
};

// Use the existing localStorage mock from setupTests.ts
// Just create references to the existing mock functions for easier testing
const mockLocalStorage = window.localStorage as {
  clear: jest.Mock;
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  key: jest.Mock;
  length: number;
};

// Custom render function that includes Router
const render = (ui: React.ReactElement) => {
  return renderWithoutProviders(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('QuickExitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = 'http://localhost:3000';
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.clear.mockClear();
    
    // Ensure document.body exists
    if (!document.body) {
      document.body = document.createElement('body');
    }
    
    // Create a div container for React Testing Library
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    
    // Setup CSS variables for testing
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --safe-error: #e74c3c;
        --safe-gray-700: #4a5568;
        --safe-gray-600: #718096;
        --safe-gray-800: #2d3748;
        --safe-white: #ffffff;
        --safe-radius-md: 8px;
        --safe-shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
        --safe-shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
  });
  
  afterEach(() => {
    cleanup();
    // Clean up the root div
    const root = document.getElementById('root');
    if (root && root.parentNode) {
      root.parentNode.removeChild(root);
    }
  });

  describe('Rendering', () => {
    it('should render the quick exit button', () => {
      // Wrap in act to catch any errors during rendering
      let renderResult;
      act(() => {
        try {
          renderResult = render(<QuickExitButton />);
        } catch (error) {
          console.error('Render error:', error);
          throw error;
        }
      });
      
      const { container } = renderResult!;
      
      // Debug output
      console.log('Container HTML:', container.innerHTML);
      console.log('Body HTML:', document.body.innerHTML);

      // Try simpler queries first
      const allButtons = screen.queryAllByRole('button');
      console.log('All buttons found:', allButtons.length);
      
      const button = screen.queryByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Quick Exit')).toBeInTheDocument();
      expect(screen.getByText(/ESC x3/i)).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      render(<QuickExitButton />);

      expect(screen.getByTestId('exit-icon')).toBeInTheDocument();
    });

    it('should have high z-index for visibility', () => {
      render(<QuickExitButton />);

      const wrapper = screen.getByTestId('quick-exit-wrapper');
      // Check inline style directly as numbers are converted to strings in DOM
      expect(wrapper.style.zIndex).toBe('9999');
    });
  });

  describe('Exit Functionality', () => {
    it('should clear browsing data on click', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      expect(mockSessionStorage.clear).toHaveBeenCalled();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('should redirect to safe site on click', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      expect(mockLocation.replace).toHaveBeenCalledWith('https://www.google.com');
    });

    it('should use custom redirect URL if provided', () => {
      render(<QuickExitButton redirectUrl="https://weather.com" />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      expect(mockLocation.replace).toHaveBeenCalledWith('https://weather.com');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should exit on triple ESC press', () => {
      render(<QuickExitButton />);

      // Press ESC three times quickly
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(mockLocation.replace).toHaveBeenCalledWith('https://www.google.com');
    });

    it('should reset counter if ESC presses are too slow', async () => {
      jest.useFakeTimers();

      render(<QuickExitButton />);

      // First ESC
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      // Wait too long
      jest.advanceTimersByTime(1000);
      
      // Second and third ESC
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(mockLocation.replace).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should ignore other keys', () => {
      render(<QuickExitButton />);

      fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(window, { key: 'Space', code: 'Space' });
      fireEvent.keyDown(window, { key: 'A', code: 'KeyA' });

      expect(mockLocation.replace).not.toHaveBeenCalled();
    });

    it('should work with keyboard shortcut customization', () => {
      render(<QuickExitButton shortcutKey="q" shortcutCount={2} />);

      fireEvent.keyDown(window, { key: 'q', code: 'KeyQ' });
      fireEvent.keyDown(window, { key: 'q', code: 'KeyQ' });

      expect(mockLocation.replace).toHaveBeenCalled();
    });
  });

  describe('Visual Feedback', () => {
    it('should show hover state', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('hover');

      fireEvent.mouseLeave(button);
      expect(button).not.toHaveClass('hover');
    });

    it('should show focus state for keyboard navigation', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      
      fireEvent.focus(button);
      expect(button).toHaveClass('focused');
    });

    it('should show pressed state', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      
      fireEvent.mouseDown(button);
      expect(button).toHaveClass('pressed');

      fireEvent.mouseUp(button);
      expect(button).not.toHaveClass('pressed');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toHaveAttribute('aria-label', 'Emergency exit - leaves site immediately');
      expect(button).toHaveAttribute('aria-describedby', expect.stringContaining('instructions'));
    });

    it('should be keyboard accessible', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      
      // Verify button is in the document and has proper aria attributes
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label');

      // Test keyboard interaction - Enter key should trigger exit
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(mockLocation.replace).toHaveBeenCalled();
    });

    it('should announce exit to screen readers', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      const announcement = screen.getByRole('alert');
      expect(announcement).toHaveTextContent(/Exiting site/i);
    });
  });

  describe('Positioning Options', () => {
    it('should support different positions', () => {
      const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

      positions.forEach(position => {
        const { container } = render(<QuickExitButton position={position as any} />);

        const wrapper = container.querySelector('.quick-exit-wrapper');
        expect(wrapper).toHaveClass(`position-${position}`);
      });
    });

    it('should be fixed position by default', () => {
      render(<QuickExitButton />);

      const wrapper = screen.getByTestId('quick-exit-wrapper');
      // Check inline style directly since getComputedStyle may not work in test environment
      expect(wrapper.style.position).toBe('fixed');
    });
  });

  describe('Customization', () => {
    it('should accept custom button text', () => {
      render(<QuickExitButton buttonText="Leave Now" />);

      expect(screen.getByText('Leave Now')).toBeInTheDocument();
    });

    it('should accept custom styles', () => {
      render(<QuickExitButton className="custom-exit-button" />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toHaveClass('custom-exit-button');
    });

    it('should support size variants', () => {
      const { rerender } = render(<QuickExitButton size="small" />);

      let button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toHaveClass('size-small');

      rerender(<QuickExitButton size="large" />);

      button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toHaveClass('size-large');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be touch accessible on mobile', () => {
      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      
      fireEvent.touchStart(button);
      expect(button).toHaveClass('pressed');
      
      fireEvent.touchEnd(button);
      expect(button).not.toHaveClass('pressed');
    });

    it('should adjust size on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400
      });

      render(<QuickExitButton />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      expect(button).toHaveClass('mobile-size');
    });
  });

  describe('Privacy Features', () => {
    it('should clear cookies if configured', () => {
      const clearCookies = jest.fn();
      
      render(<QuickExitButton clearCookies={clearCookies} />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      expect(clearCookies).toHaveBeenCalled();
    });

    it('should clear history if possible', () => {
      const mockHistory = {
        pushState: jest.fn(),
        replaceState: jest.fn()
      };

      Object.defineProperty(window, 'history', {
        value: mockHistory,
        writable: true
      });

      render(<QuickExitButton clearHistory={true} />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      expect(mockHistory.replaceState).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle redirect failures gracefully', () => {
      mockLocation.replace.mockImplementation(() => {
        throw new Error('Navigation blocked');
      });

      render(<QuickExitButton fallbackUrl="https://news.google.com" />);

      const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
      fireEvent.click(button);

      // Should attempt fallback
      expect(mockLocation.href).toBe('https://news.google.com');
    });

    it('should handle storage clearing errors', () => {
      // Mock console.error to suppress error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Reset mocks first
      mockLocation.replace.mockClear();
      mockLocation.href = 'http://localhost:3000';
      
      // Save original implementation
      const originalClear = mockSessionStorage.clear;
      let callCount = 0;
      
      try {
        // Set up error-throwing mock that only throws when component calls it
        mockSessionStorage.clear.mockImplementation(() => {
          callCount++;
          // Only throw error when called from component (not from test cleanup)
          if (callCount === 1) {
            throw new Error('Storage error');
          }
          // Otherwise do nothing (for cleanup calls)
        });

        render(<QuickExitButton fallbackUrl="https://news.google.com" />);

        const button = screen.getByRole('button', { name: /emergency exit.*leaves site immediately/i });
        
        // Click the button - should use fallback when storage clearing fails
        fireEvent.click(button);
        
        // When storage clearing fails, component should use fallback
        expect(mockLocation.href).toBe('https://news.google.com');
        expect(consoleSpy).toHaveBeenCalledWith('Error clearing data:', expect.any(Error));
      } finally {
        // Always restore original implementation
        mockSessionStorage.clear = originalClear;
        consoleSpy.mockRestore();
      }
    });
  });

});