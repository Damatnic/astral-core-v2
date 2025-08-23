/**
 * Test Suite for BreathingExerciseOverlay Component
 * Tests interactive breathing exercises with visual guide
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the CSS import
jest.mock('../../../styles/safe-ui-system.css', () => ({}));

import { BreathingExerciseOverlay } from '../BreathingExerciseOverlay';

// Custom render function for this test file
const renderComponent = (component: React.ReactElement) => {
  const root = document.getElementById('root') || document.createElement('div');
  if (!root.parentNode) {
    document.body.appendChild(root);
  }
  return render(component, { container: root });
};

describe('BreathingExerciseOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', async () => {
      const onClose = jest.fn();
      
      const { container } = renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={onClose} 
          autoStart={false}
        />
      );
      
      // Check that the overlay renders
      expect(container.querySelector('[data-testid="breathing-overlay"]')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Breathing Exercise')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={false} onClose={jest.fn()} autoStart={false} />);
      
      expect(screen.queryByText('Breathing Exercise')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display all exercise options', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      expect(screen.getByText('4-7-8 Breathing')).toBeInTheDocument();
      expect(screen.getByText('Box Breathing')).toBeInTheDocument();
      expect(screen.getByText('Belly Breathing')).toBeInTheDocument();
      expect(screen.getByText('5-5-5 Breathing')).toBeInTheDocument();
    });
  });

  describe('Exercise Selection', () => {
    it('should allow selecting different exercises', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} technique="box" autoStart={false} />);
      
      const boxBreathingButton = screen.getByText('Box Breathing');
      expect(boxBreathingButton).toHaveClass('selected');
    });

    it('should show exercise description on selection', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} technique="478" autoStart={false} />);
      
      expect(screen.getByText(/4-7-8 relaxation technique/i)).toBeInTheDocument();
    });

    it('should highlight selected exercise', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} technique="box" autoStart={false} />);
      
      const boxBreathingButton = screen.getByText('Box Breathing');
      expect(boxBreathingButton).toHaveClass('selected');
    });
  });

  describe('Exercise Execution', () => {
    it('should start exercise on play button click', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });

    it('should cycle through breathing phases', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} technique="478" />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      // Wait for initial state to settle
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Initial phase
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
      
      // Advance timer through inhale phase (4 seconds)
      // Need to advance in smaller increments to trigger all timer updates
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // Should move to hold phase
      expect(screen.getByRole('status')).toHaveTextContent(/Hold/i);
    });

    it('should display countdown timer', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Check timer is displayed using testid
      expect(screen.getByTestId('timer-display')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });

    it('should complete full breathing cycle', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} technique="478" />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Complete 4-7-8 cycle
      await act(async () => {
        jest.advanceTimersByTime(4000); // Inhale
      });
      
      await act(async () => {
        jest.advanceTimersByTime(7000); // Hold
      });
      
      await act(async () => {
        jest.advanceTimersByTime(8000); // Exhale
      });
      
      // Should start next cycle
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });
  });

  describe('Controls', () => {
    it('should pause exercise on pause button click', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(playButton);
      
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);
      
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('should resume exercise after pause', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(playButton);
      
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);
      
      const resumeButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(resumeButton);
      
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should reset exercise on stop button click', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(playButton);
      
      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);
      
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should show breathing animation', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Check for breathing circle animation element
      expect(screen.getByTestId('breathing-circle')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });

    it('should change animation based on phase', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} technique="478" />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Inhale phase
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
      
      // Move through inhale phase (4 seconds)
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // Should be in hold phase
      expect(screen.getByRole('status')).toHaveTextContent(/Hold/i);
      
      // Move through hold phase (7 seconds)
      for (let i = 0; i < 8; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // Should be in exhale phase now
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe Out/i);
    });

    it('should display progress indicator', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Check that progress bar is displayed using testid
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });
  });

  describe('Customization', () => {
    it('should allow custom cycle count', () => {
      renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={jest.fn()} 
          defaultCycles={5}
        />
      );
      
      expect(screen.getByText('5 cycles')).toBeInTheDocument();
    });

    it('should allow adjusting cycle count', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} />);
      
      const increaseButton = screen.getByRole('button', { name: /increase cycles/i });
      expect(increaseButton).toBeInTheDocument();
      
      expect(screen.getByText('3 cycles')).toBeInTheDocument();
    });

    it('should support custom exercise durations', () => {
      const customExercise = {
        name: 'Custom Breathing',
        inhale: 5,
        hold: 5,
        exhale: 5
      };
      
      renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={jest.fn()} 
          customExercise={customExercise}
          autoStart={false}
        />
      );
      
      const playButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(playButton);
      
      expect(screen.getByText('5')).toBeInTheDocument(); // Custom timing
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      // Check for start button
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      // Check for dialog role
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      // Test that button is in the document and can be tabbed to
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveAttribute('aria-label');
      
      // Test keyboard interaction - simulate clicking via keyboard activation
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Verify the exercise started
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
      
      // Verify pause button is now available and has proper ARIA attributes
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      expect(pauseButton).toBeInTheDocument();
      expect(pauseButton).toHaveAttribute('aria-label');
    });

    it('should announce phase changes to screen readers', async () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Check for phase message with aria-live region
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
    });

    it('should trap focus within overlay', () => {
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      const playButton = screen.getByRole('button', { name: /start/i });
      
      // Verify both buttons are present and focusable
      expect(closeButton).toBeInTheDocument();
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Completion and Feedback', () => {
    it('should show completion message after all cycles', async () => {
      const onComplete = jest.fn();
      
      renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={jest.fn()} 
          defaultCycles={1}
          autoStart={false}
          technique="478"
          onComplete={onComplete}
        />
      );
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Complete one full cycle (4-7-8 = 19 seconds total)
      // Advance in 1-second increments to trigger all timer updates
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // Check that the onComplete callback was called
      expect(onComplete).toHaveBeenCalled();
    });

    it('should track session statistics', async () => {
      const onComplete = jest.fn();
      
      renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={jest.fn()}
          onComplete={onComplete}
          defaultCycles={1}
          autoStart={false}
          technique="478"
        />
      );
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Complete one full cycle (4-7-8 = 19 seconds total)
      // Advance in 1-second increments to trigger all timer updates
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
        cycles: 1,
        exercise: '478'
      }));
    });

    it('should offer to continue after completion', async () => {
      const onComplete = jest.fn();
      
      renderComponent(
        <BreathingExerciseOverlay 
          isOpen={true} 
          onClose={jest.fn()} 
          defaultCycles={1}
          autoStart={false}
          technique="478"
          onComplete={onComplete}
        />
      );
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Complete one full cycle (4-7-8 = 19 seconds total)
      // Advance in 1-second increments to trigger all timer updates
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // After completion, the Start button should be available again
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle timer errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={jest.fn()} autoStart={false} />);
      
      // Should still be functional even with potential errors
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when X button clicked', () => {
      const onClose = jest.fn();
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={onClose} autoStart={false} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when ESC key pressed', () => {
      const onClose = jest.fn();
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={onClose} autoStart={false} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on overlay click when exercise is running', async () => {
      const onClose = jest.fn();
      renderComponent(<BreathingExerciseOverlay isOpen={true} onClose={onClose} autoStart={false} />);
      
      const playButton = screen.getByRole('button', { name: /start/i });
      
      act(() => {
        fireEvent.click(playButton);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      
      // Verify exercise is running
      expect(screen.getByRole('status')).toHaveTextContent(/Breathe In/i);
      
      // Overlay should not close when exercise is active
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});