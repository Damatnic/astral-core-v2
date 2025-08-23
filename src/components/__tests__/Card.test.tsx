import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { Card } from '../Card';

describe('Card', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('should render card with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Card className="custom-card">
          <div>Content</div>
        </Card>
      );
      
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '10px' };
      const { container } = render(
        <Card style={customStyle}>
          <div>Content</div>
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card.style.backgroundColor).toBe('red');
      expect(card.style.padding).toBe('10px');
    });

    it('should render with enhanced classes by default', () => {
      const { container } = render(
        <Card>
          <div>Content</div>
        </Card>
      );
      
      expect(container.firstChild).toHaveClass('card-enhanced');
    });

    it('should render with legacy classes when enhanced is false', () => {
      const { container } = render(
        <Card enhanced={false}>
          <div>Content</div>
        </Card>
      );
      
      expect(container.firstChild).toHaveClass('card');
      expect(container.firstChild).not.toHaveClass('card-enhanced');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'interactive', 'glass', 'elevated'] as const;
    
    variants.forEach(variant => {
      it(`should apply correct classes for ${variant} variant when enhanced`, () => {
        const { container } = render(
          <Card variant={variant} enhanced={true}>
            <div>Content</div>
          </Card>
        );
        
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('card-enhanced');
        
        if (variant !== 'default') {
          expect(card).toHaveClass(variant);
        } else {
          // Default variant should not add a variant class
          expect(card).not.toHaveClass('default');
        }
      });
    });

    it('should not apply variant classes when not enhanced', () => {
      const { container } = render(
        <Card variant="interactive" enhanced={false}>
          <div>Content</div>
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('card');
      expect(card).not.toHaveClass('interactive');
    });
  });

  describe('Interactive Cards', () => {
    it('should render as button role when onClick is provided', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Interactive content</div>
        </Card>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render as region role when no onClick provided', () => {
      render(
        <Card>
          <div>Static content</div>
        </Card>
      );
      
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should use custom role when provided', () => {
      render(
        <Card role="article" onClick={mockOnClick}>
          <div>Content</div>
        </Card>
      );
      
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should be focusable when interactive', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Interactive content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should use custom tabIndex when provided', () => {
      render(
        <Card onClick={mockOnClick} tabIndex={-1}>
          <div>Interactive content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });

    it('should not be focusable when not interactive', () => {
      render(
        <Card>
          <div>Static content</div>
        </Card>
      );
      
      const card = screen.getByRole('region');
      expect(card).not.toHaveAttribute('tabIndex');
    });

    it('should add touch classes for legacy interactive cards', () => {
      const { container } = render(
        <Card onClick={mockOnClick} enhanced={false}>
          <div>Content</div>
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('touch-optimized', 'touch-feedback');
    });

    it('should not add touch classes for enhanced interactive cards', () => {
      const { container } = render(
        <Card onClick={mockOnClick} enhanced={true}>
          <div>Content</div>
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('touch-optimized', 'touch-feedback');
    });

    it('should add aria-pressed attribute for interactive cards', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Interactive content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when clicked', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick for other keys', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(card, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(card, { key: 'a', code: 'KeyA' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not handle keyDown events when not interactive', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <Card>
          <div>Static content</div>
        </Card>
      );
      
      const card = screen.getByRole('region');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should prevent default behavior on Enter and Space', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      });
      const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');
      
      fireEvent(card, enterEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      render(
        <Card aria-label="Custom card label">
          <div>Content</div>
        </Card>
      );
      
      expect(screen.getByLabelText('Custom card label')).toBeInTheDocument();
    });

    it('should not have aria-label when not provided', () => {
      render(
        <Card>
          <div>Content</div>
        </Card>
      );
      
      const card = screen.getByRole('region');
      expect(card).not.toHaveAttribute('aria-label');
    });

    it('should have proper role for interactive cards', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Interactive content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should have proper role for static cards', () => {
      render(
        <Card>
          <div>Static content</div>
        </Card>
      );
      
      const card = screen.getByRole('region');
      expect(card).toHaveAttribute('role', 'region');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined className', () => {
      const { container } = render(
        <Card className={undefined as string | undefined}>
          <div>Content</div>
        </Card>
      );
      
      expect(container.firstChild).toHaveClass('card-enhanced');
    });

    it('should handle empty className', () => {
      const { container } = render(
        <Card className="">
          <div>Content</div>
        </Card>
      );
      
      expect(container.firstChild).toHaveClass('card-enhanced');
    });

    it('should handle complex children', () => {
      render(
        <Card>
          <div>
            <h3>Card Title</h3>
            <p>Card description</p>
            <button>Action Button</button>
          </div>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('should handle null or undefined children gracefully', () => {
      const { unmount } = render(<Card>{null}</Card>);
      expect(screen.getByRole('region')).toBeInTheDocument();
      unmount();
      
      render(<Card>{undefined}</Card>);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should handle multiple className values', () => {
      const { container } = render(
        <Card className="class1 class2 class3">
          <div>Content</div>
        </Card>
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('card-enhanced', 'class1', 'class2', 'class3');
    });

    it('should handle rapid click events', () => {
      render(
        <Card onClick={mockOnClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      
      // Rapidly click multiple times
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Event Handling', () => {
    it('should pass correct event object to onClick', () => {
      let receivedEvent: any;
      const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        receivedEvent = event;
      };
      
      render(
        <Card onClick={handleClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(receivedEvent).toBeTruthy();
      expect(receivedEvent.type).toBe('click');
    });

    it('should pass keyboard event to onClick when triggered by keyboard', () => {
      let receivedEvent: any;
      const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        receivedEvent = event;
      };
      
      render(
        <Card onClick={handleClick}>
          <div>Clickable content</div>
        </Card>
      );
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      
      expect(receivedEvent).toBeTruthy();
      expect(receivedEvent.key).toBe('Enter');
    });
  });
});