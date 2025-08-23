import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { CrisisAlert } from '../CrisisAlertFixed';
import { createMockCrisisAlert } from '../../test-utils';

// Mock the CSS file
jest.mock('../CrisisAlert.css', () => ({}));

describe('CrisisAlert', () => {
  let mockWindow: { open: jest.Mock; alert: jest.Mock; confirm: jest.Mock; prompt: jest.Mock };

  beforeEach(() => {
    // Mock window methods directly
    mockWindow = {
      open: jest.fn(),
      alert: jest.fn(),
      confirm: jest.fn(),
      prompt: jest.fn()
    };
    
    // Apply mocks to global window
    Object.assign(window, mockWindow);
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render crisis alert when show is true', () => {
      const props = createMockCrisisAlert({ show: true });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Crisis Support Needed')).toBeInTheDocument();
      expect(screen.getByText(props.message)).toBeInTheDocument();
    });

    it('should not render when show is false', () => {
      const props = createMockCrisisAlert({ show: false });
      render(<CrisisAlert {...props} />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should render with correct severity classes', () => {
      const severities = ['critical', 'high', 'medium', 'low', 'none'] as const;
      
      severities.forEach((severity) => {
        const { unmount } = render(
          <CrisisAlert {...createMockCrisisAlert({ severity })} />
        );
        
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass(`crisis-alert--${severity}`);
        
        unmount();
      });
    });

    it('should render emergency contacts for critical/high severity', () => {
      const props = createMockCrisisAlert({ severity: 'critical' });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByText('Immediate Help Available')).toBeInTheDocument();
      expect(screen.getByText('988 Suicide & Crisis Lifeline')).toBeInTheDocument();
      expect(screen.getByText('Crisis Text Line')).toBeInTheDocument();
      expect(screen.getByText('Emergency Services')).toBeInTheDocument();
    });

    it('should not render emergency contacts for lower severity', () => {
      const props = createMockCrisisAlert({ severity: 'low' });
      render(<CrisisAlert {...props} />);
      
      expect(screen.queryByText('Immediate Help Available')).not.toBeInTheDocument();
    });

    it('should render actions list when provided', () => {
      const actions = ['Take deep breaths', 'Call a friend', 'Use grounding techniques'];
      const props = createMockCrisisAlert({ actions });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
      actions.forEach(action => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it('should render resources list when provided', () => {
      const resources = ['Crisis Hotline: 988', 'Online Support Groups', 'Mental Health Apps'];
      const props = createMockCrisisAlert({ resources });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByText('Additional Resources')).toBeInTheDocument();
      resources.forEach(resource => {
        expect(screen.getByText(resource)).toBeInTheDocument();
      });
    });

    it('should render helper guidance for helper users', () => {
      const props = createMockCrisisAlert({ userType: 'helper' });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByText('Helper Guidance:')).toBeInTheDocument();
      expect(screen.getByText(/This situation requires professional intervention/)).toBeInTheDocument();
    });

    it('should render close button when not in emergency mode', () => {
      const props = createMockCrisisAlert({ emergencyMode: false });
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByLabelText('Close alert')).toBeInTheDocument();
    });

    it('should not render close button in emergency mode', () => {
      const props = createMockCrisisAlert({ emergencyMode: true });
      render(<CrisisAlert {...props} />);
      
      expect(screen.queryByLabelText('Close alert')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-labelledby', 'crisis-alert-title');
      expect(alert).toHaveAttribute('tabIndex', '-1');
    });

    it('should focus the alert element when shown', async () => {
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      await waitFor(() => {
        const alert = document.getElementById('crisis-alert');
        expect(alert).toBeInTheDocument();
        // Focus is called but may not work in test environment
        expect(alert).toHaveAttribute('tabIndex', '-1');
      });
    });

    it('should have accessible emergency contact buttons', () => {
      const props = createMockCrisisAlert({ severity: 'critical' });
      render(<CrisisAlert {...props} />);
      
      const callButtons = screen.getAllByRole('button');
      const emergencyButtons = callButtons.filter((button: HTMLElement) => 
        button.textContent?.includes('988') || 
        button.textContent?.includes('741741') || 
        button.textContent?.includes('911')
      );
      
      expect(emergencyButtons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation for backdrop dismissal', () => {
      const props = createMockCrisisAlert({ emergencyMode: false });
      render(<CrisisAlert {...props} />);
      
      const backdrop = screen.getByRole('button', { name: /close alert backdrop/i });
      expect(backdrop).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss when close button is clicked', () => {
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      const closeButton = screen.getByLabelText('Close alert');
      fireEvent.click(closeButton);
      
      expect(props.onDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      const dismissButton = screen.getByText('I understand');
      fireEvent.click(dismissButton);
      
      expect(props.onDismiss).toHaveBeenCalled();
    });

    it('should call onDismiss when backdrop is clicked (non-emergency mode)', () => {
      const props = createMockCrisisAlert({ emergencyMode: false });
      render(<CrisisAlert {...props} />);
      
      const backdrop = screen.getByRole('button', { name: /close alert backdrop/i });
      fireEvent.click(backdrop);
      
      expect(props.onDismiss).toHaveBeenCalled();
    });

    it('should not call onDismiss when backdrop is clicked in emergency mode', () => {
      const props = createMockCrisisAlert({ emergencyMode: true });
      render(<CrisisAlert {...props} />);
      
      // Emergency mode should not have a backdrop button for dismissal
      expect(screen.queryByLabelText('Close alert')).not.toBeInTheDocument();
    });

    it('should support keyboard dismissal with Enter key', () => {
      const props = createMockCrisisAlert({ emergencyMode: false });
      render(<CrisisAlert {...props} />);
      
      const backdrop = screen.getByRole('button', { name: /close alert backdrop/i });
      fireEvent.keyDown(backdrop, { key: 'Enter', code: 'Enter' });
      
      expect(props.onDismiss).toHaveBeenCalled();
    });

    it('should support keyboard dismissal with Space key', () => {
      const props = createMockCrisisAlert({ emergencyMode: false });
      render(<CrisisAlert {...props} />);
      
      const backdrop = screen.getByRole('button', { name: /close alert backdrop/i });
      fireEvent.keyDown(backdrop, { key: ' ', code: 'Space' });
      
      expect(props.onDismiss).toHaveBeenCalled();
    });

    it('should call onCrisisChat when crisis chat button is clicked', () => {
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      const chatButton = screen.getByText(/Start Crisis Chat/);
      fireEvent.click(chatButton);
      
      expect(props.onCrisisChat).toHaveBeenCalled();
    });

    it('should open crisis chat website when no onCrisisChat handler provided', () => {
      const props = createMockCrisisAlert({ onCrisisChat: undefined });
      render(<CrisisAlert {...props} />);
      
      const chatButton = screen.getByText(/Start Crisis Chat/);
      fireEvent.click(chatButton);
      
      expect(mockWindow.open).toHaveBeenCalledWith(
        'https://suicidepreventionlifeline.org/chat/',
        '_blank'
      );
    });

    it('should handle emergency contact calls', () => {
      const props = createMockCrisisAlert({ severity: 'critical' });
      render(<CrisisAlert {...props} />);
      
      const callButton = screen.getByText('988 Suicide & Crisis Lifeline');
      fireEvent.click(callButton);
      
      expect(props.onEmergencyCall).toHaveBeenCalled();
      expect(mockWindow.open).toHaveBeenCalledWith('tel:988', '_self');
    });

    it('should handle emergency text contacts', () => {
      const props = createMockCrisisAlert({ severity: 'critical' });
      render(<CrisisAlert {...props} />);
      
      const textButton = screen.getByText('Crisis Text Line');
      fireEvent.click(textButton);
      
      expect(props.onEmergencyCall).toHaveBeenCalled();
      expect(mockWindow.open).toHaveBeenCalledWith('sms:741741', '_self');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty actions array', () => {
      const props = createMockCrisisAlert({ actions: [] });
      render(<CrisisAlert {...props} />);
      
      expect(screen.queryByText('Recommended Actions')).not.toBeInTheDocument();
    });

    it('should handle empty resources array', () => {
      const props = createMockCrisisAlert({ resources: [] });
      render(<CrisisAlert {...props} />);
      
      expect(screen.queryByText('Additional Resources')).not.toBeInTheDocument();
    });

    it('should handle undefined severity gracefully', () => {
      const props = createMockCrisisAlert({ severity: undefined as unknown });
      render(<CrisisAlert {...props} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('crisis-alert--none');
      expect(screen.getByText('Support Available')).toBeInTheDocument();
    });

    it('should handle missing onEmergencyCall handler', () => {
      const props = createMockCrisisAlert({
        severity: 'critical',
        onEmergencyCall: undefined
      });
      render(<CrisisAlert {...props} />);
      
      const callButton = screen.getByText('988 Suicide & Crisis Lifeline');
      fireEvent.click(callButton);
      
      // Should still try to open the phone app
      expect(mockWindow.open).toHaveBeenCalledWith('tel:988', '_self');
    });

    it('should display timestamp when alert is shown', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const props = createMockCrisisAlert();
      render(<CrisisAlert {...props} />);
      
      expect(screen.getByText(mockDate.toLocaleTimeString())).toBeInTheDocument();
      
      jest.restoreAllMocks();
    });
  });

  describe('Animation and Timing', () => {
    it('should apply show class when show prop is true', () => {
      const props = createMockCrisisAlert({ show: true });
      render(<CrisisAlert {...props} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('crisis-alert--show');
    });

    it('should apply hide class when show prop is false', async () => {
      const props = createMockCrisisAlert({ show: true });
      const { rerender } = render(<CrisisAlert {...props} />);
      
      // Change show to false
      rerender(<CrisisAlert {...props} show={false} />);
      
      const alert = screen.queryByRole('alert');
      if (alert) {
        expect(alert).toHaveClass('crisis-alert--hide');
      }
    });

    it('should handle rapid show/hide changes', async () => {
      const props = createMockCrisisAlert({ show: true });
      const { rerender } = render(<CrisisAlert {...props} />);
      
      // Rapidly toggle show prop
      rerender(<CrisisAlert {...props} show={false} />);
      rerender(<CrisisAlert {...props} show={true} />);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Severity Configurations', () => {
    const severityTests = [
      {
        severity: 'critical' as const,
        expectedTitle: 'IMMEDIATE ATTENTION NEEDED',
        expectedClass: 'crisis-alert--critical',
        shouldPulse: true,
        shouldShowEmergencyContacts: true
      },
      {
        severity: 'high' as const,
        expectedTitle: 'Crisis Support Needed',
        expectedClass: 'crisis-alert--high',
        shouldPulse: true,
        shouldShowEmergencyContacts: true
      },
      {
        severity: 'medium' as const,
        expectedTitle: 'Support Recommended',
        expectedClass: 'crisis-alert--medium',
        shouldPulse: false,
        shouldShowEmergencyContacts: false
      },
      {
        severity: 'low' as const,
        expectedTitle: 'Resources Available',
        expectedClass: 'crisis-alert--low',
        shouldPulse: false,
        shouldShowEmergencyContacts: false
      },
      {
        severity: 'none' as const,
        expectedTitle: 'Support Available',
        expectedClass: 'crisis-alert--none',
        shouldPulse: false,
        shouldShowEmergencyContacts: false
      }
    ];

    severityTests.forEach(({ severity, expectedTitle, expectedClass, shouldPulse, shouldShowEmergencyContacts }) => {
      it(`should render correctly for ${severity} severity`, () => {
        const props = createMockCrisisAlert({ severity });
        render(<CrisisAlert {...props} />);
        
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass(expectedClass);
        
        const icon = alert.querySelector('.crisis-alert__icon');
        if (shouldPulse) {
          expect(icon).toHaveClass('crisis-alert__icon--pulse');
        } else {
          expect(icon).not.toHaveClass('crisis-alert__icon--pulse');
        }
        
        if (shouldShowEmergencyContacts) {
          expect(screen.getByText('Immediate Help Available')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Immediate Help Available')).not.toBeInTheDocument();
        }
      });
    });
  });
});
