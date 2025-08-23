import { render, screen, fireEvent } from '../../test-utils';
import { AppButton } from '../AppButton';
import { createMockButtonProps } from '../../test-utils';

describe('AppButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with children', () => {
      const props = createMockButtonProps({ children: 'Test Button' });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });

    it('should render button with correct type attribute', () => {
      const types = ['button', 'submit', 'reset'] as const;
      
      types.forEach(type => {
        const { unmount } = render(
          <AppButton {...createMockButtonProps({ type })} />
        );
        
        expect(screen.getByRole('button')).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('should render with icon when provided', () => {
      const icon = <span data-testid="test-icon">🔍</span>;
      const props = createMockButtonProps({ icon, children: 'Search' });
      render(<AppButton {...props} />);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Search');
    });

    it('should render icon-only button correctly', () => {
      const icon = <span data-testid="icon">🔍</span>;
      const props = createMockButtonProps({
        icon,
        iconOnly: true,
        'aria-label': 'Search button'
      });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-icon-only');
      expect(button).toHaveAttribute('aria-label', 'Search button');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should not render children text in icon-only mode', () => {
      const icon = <span data-testid="icon">🔍</span>;
      const props = createMockButtonProps({
        icon,
        iconOnly: true,
        children: 'This should not appear'
      });
      render(<AppButton {...props} />);
      
      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Button Variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'ghost'] as const;
    
    variants.forEach(variant => {
      it(`should apply correct classes for ${variant} variant when enhanced`, () => {
        const props = createMockButtonProps({ variant, enhanced: true });
        render(<AppButton {...props} />);
        
        const button = screen.getByRole('button');
        // Check for glass-button base class for enhanced mode
        // All enhanced variants use glass-button as base
        expect(button).toHaveClass('glass-button');
        
        // Check for variant-specific therapeutic classes
        if (variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'danger') {
          expect(button).toHaveClass(`btn-${variant}-therapeutic`);
        } else if (variant === 'ghost') {
          // Ghost variant just gets passed through as is
          expect(button).toHaveClass('ghost');
        }
      });

      it(`should apply correct classes for ${variant} variant when not enhanced`, () => {
        const props = createMockButtonProps({ variant, enhanced: false });
        render(<AppButton {...props} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn', `btn-${variant}`);
      });
    });
  });

  describe('Button Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      it(`should apply correct size class for ${size} when enhanced`, () => {
        const props = createMockButtonProps({ size, enhanced: true });
        render(<AppButton {...props} />);
        
        const button = screen.getByRole('button');
        if (size !== 'md') {
          expect(button).toHaveClass(`btn-${size}`);
        } else {
          // 'md' is default, so no size class should be applied
          expect(button).not.toHaveClass('btn-md');
        }
      });

      it(`should apply correct size class for ${size} when not enhanced`, () => {
        const props = createMockButtonProps({ size, enhanced: false });
        render(<AppButton {...props} />);
        
        const button = screen.getByRole('button');
        if (size !== 'md') {
          expect(button).toHaveClass(`btn-${size}`);
        } else {
          // 'md' is default, so no size class should be applied
          expect(button).not.toHaveClass('btn-md');
        }
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      const props = createMockButtonProps({ isLoading: true });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
      // The component uses loading-dots, not loading-spinner
      expect(document.querySelector('.loading-dots')).toBeInTheDocument();
      expect(screen.queryByText('Test Button')).not.toBeInTheDocument();
    });

    it('should not show children when loading', () => {
      const props = createMockButtonProps({
        isLoading: true,
        children: 'Submit Form'
      });
      render(<AppButton {...props} />);
      
      expect(screen.queryByText('Submit Form')).not.toBeInTheDocument();
      // The component uses loading-dots, not loading-spinner
      expect(document.querySelector('.loading-dots')).toBeInTheDocument();
    });

    it('should show loading dots when loading', () => {
      const props = createMockButtonProps({ isLoading: true, size: 'lg' });
      render(<AppButton {...props} />);
      
      // The component uses loading-dots with individual dots
      const loadingDots = document.querySelector('.loading-dots');
      expect(loadingDots).toBeInTheDocument();
      const dots = document.querySelectorAll('.loading-dot');
      expect(dots).toHaveLength(3);
    });

    it('should show loading dots for default size', () => {
      const props = createMockButtonProps({ isLoading: true, size: 'md' });
      render(<AppButton {...props} />);
      
      // The component uses loading-dots
      const loadingDots = document.querySelector('.loading-dots');
      expect(loadingDots).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const props = createMockButtonProps({ disabled: true });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be disabled when isLoading is true', () => {
      const props = createMockButtonProps({ isLoading: true });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be disabled when both disabled and isLoading are true', () => {
      const props = createMockButtonProps({ disabled: true, isLoading: true });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not call onClick when disabled', () => {
      const props = createMockButtonProps({ disabled: true });
      render(<AppButton {...props} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(props.onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const props = createMockButtonProps({ isLoading: true });
      render(<AppButton {...props} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(props.onClick).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when button is clicked', () => {
      const props = createMockButtonProps();
      render(<AppButton {...props} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(props.onClick).toHaveBeenCalledTimes(1);
      expect(props.onClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should call onClick multiple times when clicked multiple times', () => {
      const props = createMockButtonProps();
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(props.onClick).toHaveBeenCalledTimes(3);
    });

    it('should pass click event to onClick handler', () => {
      const props = createMockButtonProps();
      render(<AppButton {...props} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(props.onClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: expect.any(Element)
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper touch target size', () => {
      const props = createMockButtonProps();
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      
      expect(button.style.minHeight).toBe('44px');
      expect(button.style.display).toBe('inline-flex');
      expect(button.style.alignItems).toBe('center');
      expect(button.style.justifyContent).toBe('center');
      expect(button.style.touchAction).toBe('manipulation');
    });

    it('should have minimum width for icon-only buttons', () => {
      const props = createMockButtonProps({ iconOnly: true });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button.style.minWidth).toBe('44px');
    });

    it('should use aria-label for icon-only buttons with string children', () => {
      const props = createMockButtonProps({
        iconOnly: true,
        children: 'Search'
      });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Search');
    });

    it('should use provided aria-label over children for icon-only buttons', () => {
      const props = createMockButtonProps({
        iconOnly: true,
        children: 'Search',
        'aria-label': 'Custom search button'
      });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom search button');
    });

    it('should use provided aria-label for regular buttons', () => {
      const props = createMockButtonProps({
        'aria-label': 'Custom button label'
      });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom button label');
    });

    it('should not have aria-label when not icon-only and no explicit aria-label', () => {
      const props = createMockButtonProps({ iconOnly: false });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-label');
    });
  });

  describe('CSS Classes', () => {
    it('should apply enhanced classes when enhanced is true', () => {
      const props = createMockButtonProps({ enhanced: true });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      // Enhanced mode uses glass-button as base
      expect(button).toHaveClass('glass-button');
      expect(button).toHaveClass('btn-primary-therapeutic'); // Default variant is primary
      // Touch classes are always applied
      expect(button).toHaveClass('touch-optimized', 'touch-feedback');
    });

    it('should apply legacy classes when enhanced is false', () => {
      const props = createMockButtonProps({ enhanced: false });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-primary'); // Legacy uses btn-primary
      expect(button).toHaveClass('touch-optimized', 'touch-feedback');
      // Ripple is applied by default when ripple={true}
      expect(button).toHaveClass('ripple-button');
    });

    it('should apply custom className', () => {
      const props = createMockButtonProps({ className: 'custom-button-class' });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toHaveClass('custom-button-class');
    });

    it('should combine all appropriate classes', () => {
      const props = createMockButtonProps({
        variant: 'primary',
        size: 'lg',
        enhanced: true,
        iconOnly: true,
        className: 'custom-class'
      });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'glass-button',
        'btn-primary-therapeutic',
        'btn-lg',
        'btn-icon-only',
        'custom-class'
      );
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom styles', () => {
      const customStyle = {
        backgroundColor: 'red',
        color: 'white',
        padding: '10px'
      };
      const props = createMockButtonProps({ style: customStyle });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe('red');
      expect(button.style.color).toBe('white');
      expect(button.style.padding).toBe('10px');
    });

    it('should merge custom styles with default touch target styles', () => {
      const customStyle = { backgroundColor: 'blue' };
      const props = createMockButtonProps({ style: customStyle });
      render(<AppButton {...props} />);
      
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe('blue');
      expect(button.style.minHeight).toBe('44px'); // Default touch target style
      expect(button.style.display).toBe('inline-flex');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined children gracefully', () => {
      const props = createMockButtonProps({ children: undefined });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      const props = createMockButtonProps({ children: null });
      render(<AppButton {...props} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle complex children content', () => {
      const complexChildren = (
        <>
          <span>Complex</span>
          <strong>Content</strong>
        </>
      );
      const props = createMockButtonProps({ children: complexChildren });
      render(<AppButton {...props} />);
      
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle icon with complex children in icon-only mode', () => {
      const icon = <span data-testid="icon">🔍</span>;
      const complexChildren = (
        <>
          <span>Should</span>
          <span>Not</span>
          <span>Appear</span>
        </>
      );
      const props = createMockButtonProps({
        icon,
        iconOnly: true,
        children: complexChildren
      });
      render(<AppButton {...props} />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.queryByText('Should')).not.toBeInTheDocument();
      expect(screen.queryByText('Not')).not.toBeInTheDocument();
      expect(screen.queryByText('Appear')).not.toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const props = createMockButtonProps({ isLoading: false });
      const { rerender } = render(<AppButton {...props} />);
      
      // Rapidly change loading state
      rerender(<AppButton {...props} isLoading={true} />);
      const loadingDots = document.querySelector('.loading-dots');
      expect(loadingDots).toBeInTheDocument();
      
      rerender(<AppButton {...props} isLoading={false} />);
      const noLoadingDots = document.querySelector('.loading-dots');
      expect(noLoadingDots).not.toBeInTheDocument();
      
      rerender(<AppButton {...props} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});