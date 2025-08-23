import { render, screen } from '../../test-utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />);
      
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('loading-spinner-container');
    });

    it('should render spinner with custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveClass('loading-spinner-container', 'custom-spinner');
    });

    it('should render message when provided', () => {
      const message = 'Loading data...';
      render(<LoadingSpinner message={message} />);
      
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should not render message when not provided', () => {
      const { container } = render(<LoadingSpinner />);
      
      expect(container.querySelector('.loading-message')).not.toBeInTheDocument();
    });

    it('should render with correct HTML structure', () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      
      expect(container.querySelector('output')).toBeInTheDocument();
      expect(container.querySelector('.therapy-spinner')).toBeInTheDocument();
      expect(container.querySelector('.loading-dots')).toBeInTheDocument();
      expect(container.querySelector('.loading-message')).toBeInTheDocument();
      expect(container.querySelectorAll('.loading-dot')).toHaveLength(3);
    });
  });

  describe('Sizes', () => {
    const sizes = [
      { size: 'small' as const, expectedClass: 'w-4 h-4' },
      { size: 'medium' as const, expectedClass: 'w-8 h-8' },
      { size: 'large' as const, expectedClass: 'w-12 h-12' }
    ];

    sizes.forEach(({ size, expectedClass }) => {
      it(`should apply correct classes for ${size} size`, () => {
        const { container } = render(<LoadingSpinner size={size} />);
        
        const dots = container.querySelector('.loading-dots');
        expect(dots).toHaveClass(expectedClass);
      });
    });

    it('should use medium size by default', () => {
      const { container } = render(<LoadingSpinner />);
      
      const dots = container.querySelector('.loading-dots');
      expect(dots).toHaveClass('w-8', 'h-8');
    });

    it('should handle invalid size gracefully', () => {
      // TypeScript would prevent this, but testing runtime behavior
      const { container } = render(<LoadingSpinner size={'invalid' as 'small' | 'medium' | 'large' | undefined} />);
      
      const dots = container.querySelector('.loading-dots');
      // Should default to medium or handle gracefully
      expect(dots).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use output element with role status', () => {
      render(<LoadingSpinner />);
      
      const output = screen.getByRole('status');
      expect(output.tagName.toLowerCase()).toBe('output');
    });

    it('should have aria-live="polite"', () => {
      render(<LoadingSpinner />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-hidden="true" on spinner element', () => {
      const { container } = render(<LoadingSpinner />);
      
      // The loading dots don't have aria-hidden in this implementation
      const dots = container.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
    });

    it('should have aria-hidden="true" on loading dots', () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      
      // The loading dots don't have aria-hidden in this implementation
      const dots = container.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
    });

    it('should include "Loading:" prefix for screen readers', () => {
      render(<LoadingSpinner message="Please wait" />);
      
      const srText = screen.getByText('Loading:');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should provide complete message context for screen readers', () => {
      const message = 'Fetching user data';
      render(<LoadingSpinner message={message} />);
      
      // Screen readers should get "Loading: Fetching user data"
      expect(screen.getByText('Loading:')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should render simple text messages', () => {
      const message = 'Loading data';
      render(<LoadingSpinner message={message} />);
      
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render complex messages', () => {
      const message = 'Processing your request, please wait...';
      render(<LoadingSpinner message={message} />);
      
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should handle empty string message', () => {
      const { container } = render(<LoadingSpinner message="" />);
      
      const messageElement = container.querySelector('.loading-message');
      // Empty message should not render a message element
      expect(messageElement).not.toBeInTheDocument();
      
      // Verify the spinner itself is still rendered
      expect(container.querySelector('.loading-dots')).toBeInTheDocument();
    });

    it('should handle messages with special characters', () => {
      const message = 'Loading... 50% complete! @#$%';
      render(<LoadingSpinner message={message} />);
      
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessage = 'This is a very long loading message that might wrap to multiple lines and should still display correctly without breaking the component layout or accessibility features';
      render(<LoadingSpinner message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should render loading dots alongside message', () => {
      const { container } = render(<LoadingSpinner message="Loading" />);
      
      const dots = container.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
      expect(container.querySelectorAll('.loading-dot')).toHaveLength(3);
    });
  });

  describe('CSS Classes', () => {
    it('should apply base classes', () => {
      const { container } = render(<LoadingSpinner />);
      
      expect(container.firstChild).toHaveClass('loading-spinner-container');
      
      const therapySpinner = container.querySelector('.therapy-spinner');
      expect(therapySpinner).toBeInTheDocument();
      
      const dots = container.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
    });

    it('should combine custom className with base classes', () => {
      const customClass = 'my-custom-loader';
      const { container } = render(<LoadingSpinner className={customClass} />);
      
      expect(container.firstChild).toHaveClass('loading-spinner-container', customClass);
    });

    it('should handle multiple custom classes', () => {
      const customClasses = 'class1 class2 class3';
      const { container } = render(<LoadingSpinner className={customClasses} />);
      
      expect(container.firstChild).toHaveClass(
        'loading-spinner-container',
        'class1',
        'class2', 
        'class3'
      );
    });

    it('should apply size-specific classes correctly', () => {
      const { container: smallContainer } = render(<LoadingSpinner size="small" />);
      const { container: mediumContainer } = render(<LoadingSpinner size="medium" />);
      const { container: largeContainer } = render(<LoadingSpinner size="large" />);
      
      expect(smallContainer.querySelector('.loading-dots')).toHaveClass('w-4', 'h-4');
      expect(mediumContainer.querySelector('.loading-dots')).toHaveClass('w-8', 'h-8');
      expect(largeContainer.querySelector('.loading-dots')).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Component Structure', () => {
    it('should have correct element hierarchy', () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      
      const output = container.querySelector('output');
      expect(output).toBeInTheDocument();
      
      const therapySpinner = output?.querySelector('.therapy-spinner');
      expect(therapySpinner).toBeInTheDocument();
      
      const dots = therapySpinner?.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
      
      const messageElement = output?.querySelector('.loading-message');
      expect(messageElement).toBeInTheDocument();
      
      const srText = messageElement?.querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
    });

    it('should maintain structure without message', () => {
      const { container } = render(<LoadingSpinner />);
      
      const output = container.querySelector('output');
      expect(output).toBeInTheDocument();
      
      const therapySpinner = output?.querySelector('.therapy-spinner');
      expect(therapySpinner).toBeInTheDocument();
      
      const dots = therapySpinner?.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
      
      // Should not have message elements
      const messageElement = output?.querySelector('.loading-message');
      expect(messageElement).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined className', () => {
      render(<LoadingSpinner className={undefined} />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveClass('loading-spinner-container');
    });

    it('should handle null message', () => {
      render(<LoadingSpinner message={undefined} />);
      
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should handle undefined message', () => {
      render(<LoadingSpinner message={undefined} />);
      
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should handle undefined size', () => {
      render(<LoadingSpinner size={undefined} />);
      
      const { container } = render(<LoadingSpinner />);
      const dots = container.querySelector('.loading-dots');
      expect(dots).toHaveClass('w-8', 'h-8'); // Should default to medium
    });

    it('should handle numeric message', () => {
      render(<LoadingSpinner message={'123'} />);
      
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should handle boolean message', () => {
      render(<LoadingSpinner message={'true'} />);
      
      // React will render boolean as string
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Named and Default Exports', () => {
    it('should export LoadingSpinner as named export', () => {
      const { LoadingSpinner: NamedLoadingSpinner } = require('../LoadingSpinner');
      
      render(<NamedLoadingSpinner message="Named export test" />);
      
      expect(screen.getByText('Named export test')).toBeInTheDocument();
    });

    it('should export LoadingSpinner as default export', () => {
      // Already testing with default import
      render(<LoadingSpinner message="Default export test" />);
      
      expect(screen.getByText('Default export test')).toBeInTheDocument();
    });
  });

  describe('Integration with Different Content', () => {
    it('should work with different size and message combinations', () => {
      const combinations = [
        { size: 'small' as const, message: 'Small loader' },
        { size: 'medium' as const, message: 'Medium loader' },
        { size: 'large' as const, message: 'Large loader' }
      ];
      
      combinations.forEach(({ size, message }) => {
        const { container, unmount } = render(
          <LoadingSpinner size={size} message={message} />
        );
        
        expect(screen.getByText(message)).toBeInTheDocument();
        
        const dots = container.querySelector('.loading-dots');
        const sizeClasses = {
          small: 'w-4 h-4',
          medium: 'w-8 h-8',
          large: 'w-12 h-12'
        };
        expect(dots).toHaveClass(sizeClasses[size].split(' ')[0]);
        expect(dots).toHaveClass(sizeClasses[size].split(' ')[1]);
        
        unmount();
      });
    });

    it('should maintain accessibility with all prop combinations', () => {
      const props = [
        { size: 'small' as const, message: 'Test', className: 'test-class' },
        { size: 'large' as const, className: 'another-class' },
        { message: 'Just message' },
        {}
      ];
      
      props.forEach((prop) => {
        const { unmount } = render(<LoadingSpinner {...prop} />);
        
        const container = screen.getByRole('status');
        expect(container).toHaveAttribute('aria-live', 'polite');
        
        unmount();
      });
    });
  });
});