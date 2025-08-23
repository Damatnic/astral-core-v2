import { render, screen, fireEvent } from '../../test-utils';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ErrorState />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected error. Please try again.')).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      const title = 'Custom Error Title';
      const message = 'Custom error message with details';
      
      render(<ErrorState title={title} message={message} />);
      
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render AlertTriangleIcon', () => {
      const { container } = render(<ErrorState />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('stroke', 'currentColor');
    });

    it('should apply custom className', () => {
      const { container } = render(<ErrorState className="custom-error" />);
      
      expect(container.firstChild).toHaveClass('error-state', 'custom-error');
    });

    it('should render retry button by default when onRetry is provided', () => {
      render(<ErrorState onRetry={mockOnRetry} />);
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not render retry button when showRetry is false', () => {
      render(<ErrorState onRetry={mockOnRetry} showRetry={false} />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState showRetry={true} />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should call onRetry when retry button is clicked', () => {
      render(<ErrorState onRetry={mockOnRetry} />);
      
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should show "Retrying..." text when isRetrying is true', () => {
      render(<ErrorState onRetry={mockOnRetry} isRetrying={true} />);
      
      expect(screen.getByText('Retrying...')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should disable retry button when isRetrying is true', () => {
      render(<ErrorState onRetry={mockOnRetry} isRetrying={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not disable retry button when isRetrying is false', () => {
      render(<ErrorState onRetry={mockOnRetry} isRetrying={false} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should not call onRetry when button is disabled', () => {
      render(<ErrorState onRetry={mockOnRetry} isRetrying={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      render(<ErrorState />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<ErrorState />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-hidden="true" on icon', () => {
      const { container } = render(<ErrorState />);
      
      const iconContainer = container.querySelector('.error-state-icon');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper aria-label on retry button', () => {
      render(<ErrorState onRetry={mockOnRetry} />);
      
      const button = screen.getByLabelText('Retry the previous action');
      expect(button).toBeInTheDocument();
    });

    it('should maintain accessibility when retrying', () => {
      render(<ErrorState onRetry={mockOnRetry} isRetrying={true} />);
      
      const button = screen.getByLabelText('Retry the previous action');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to elements', () => {
      const { container } = render(<ErrorState onRetry={mockOnRetry} />);
      
      expect(container.querySelector('.error-state')).toBeInTheDocument();
      expect(container.querySelector('.error-state-icon')).toBeInTheDocument();
      expect(container.querySelector('.error-state-title')).toBeInTheDocument();
      expect(container.querySelector('.error-state-message')).toBeInTheDocument();
      expect(container.querySelector('.error-state-actions')).toBeInTheDocument();
      expect(container.querySelector('.retry-button')).toBeInTheDocument();
    });

    it('should not render actions container when no retry button', () => {
      const { container } = render(<ErrorState showRetry={false} />);
      
      expect(container.querySelector('.error-state-actions')).not.toBeInTheDocument();
    });
  });

  describe('Icon Component', () => {
    it('should render AlertTriangleIcon with correct attributes', () => {
      const { container } = render(<ErrorState />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      // Check for both camelCase and lowercase attributes (React normalizes differently)
      expect(svg.getAttribute('stroke-width') || svg.getAttribute('strokeWidth')).toBe('2');
      expect(svg.getAttribute('stroke-linecap') || svg.getAttribute('strokeLinecap')).toBe('round');
      expect(svg.getAttribute('stroke-linejoin') || svg.getAttribute('strokeLinejoin')).toBe('round');
    });

    it('should render correct paths for AlertTriangleIcon', () => {
      const { container } = render(<ErrorState />);
      
      const paths = container.querySelectorAll('svg path');
      expect(paths).toHaveLength(3);
      
      expect(paths[0]).toHaveAttribute('d', 'm21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z');
      expect(paths[1]).toHaveAttribute('d', 'M12 9v4');
      expect(paths[2]).toHaveAttribute('d', 'm12 17 .01 0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<ErrorState title="" />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('');
    });

    it('should handle empty message', () => {
      const { container } = render(<ErrorState message="" />);
      
      const message = container.querySelector('.error-state-message');
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent('');
    });

    it('should handle undefined className', () => {
      const { container } = render(<ErrorState className={undefined} />);
      
      expect(container.firstChild).toHaveClass('error-state');
    });

    it('should handle rapid retry clicks', () => {
      render(<ErrorState onRetry={mockOnRetry} />);
      
      const button = screen.getByText('Try Again');
      
      // Rapidly click multiple times
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });

    it('should handle transition from retrying to not retrying', () => {
      const { rerender } = render(
        <ErrorState onRetry={mockOnRetry} isRetrying={true} />
      );
      
      expect(screen.getByText('Retrying...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
      
      rerender(<ErrorState onRetry={mockOnRetry} isRetrying={false} />);
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that contains a lot of information about what went wrong and why the user might be experiencing this issue. It includes technical details and troubleshooting suggestions.';
      
      render(<ErrorState message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle HTML-like content in title and message', () => {
      const titleWithTags = 'Error <script>alert("xss")</script> occurred';
      const messageWithTags = 'Message with <img src="x" onerror="alert(1)"> content';
      
      render(<ErrorState title={titleWithTags} message={messageWithTags} />);
      
      // Should render as text, not execute HTML
      expect(screen.getByText(titleWithTags)).toBeInTheDocument();
      expect(screen.getByText(messageWithTags)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should maintain correct DOM structure', () => {
      const { container } = render(<ErrorState onRetry={mockOnRetry} />);
      
      const errorState = container.firstChild as HTMLElement;
      expect(errorState).toHaveClass('error-state');
      
      const children = Array.from(errorState?.children || []);
      expect(children).toHaveLength(4); // icon, title, message, actions
      
      expect(children[0]).toHaveClass('error-state-icon');
      expect(children[1]).toHaveClass('error-state-title');
      expect(children[2]).toHaveClass('error-state-message');
      expect(children[3]).toHaveClass('error-state-actions');
    });

    it('should have correct heading level for title', () => {
      render(<ErrorState title="Error Title" />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Error Title');
    });

    it('should use paragraph element for message', () => {
      const { container } = render(<ErrorState message="Error message" />);
      
      const message = container.querySelector('.error-state-message');
      expect(message?.tagName.toLowerCase()).toBe('p');
    });
  });

  describe('Default Export', () => {
    it('should export ErrorState as default', async () => {
      const DefaultErrorState = (await import('../ErrorState')).default;
      
      render(<DefaultErrorState title="Default Export Test" />);
      
      expect(screen.getByText('Default Export Test')).toBeInTheDocument();
    });
  });
});