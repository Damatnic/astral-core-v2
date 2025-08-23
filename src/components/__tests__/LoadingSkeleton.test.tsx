import { render, screen } from '../../test-utils';
import LoadingSkeleton from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('Rendering', () => {
    it('should render post skeleton by default', () => {
      render(<LoadingSkeleton />);
      
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
      expect(screen.getByText('Loading post content...')).toBeInTheDocument();
    });

    it('should render single skeleton by default', () => {
      const { container } = render(<LoadingSkeleton />);
      
      const skeletons = container.querySelectorAll('.loading-skeleton');
      expect(skeletons).toHaveLength(1);
    });

    it('should render multiple skeletons when count is specified', () => {
      const { container } = render(<LoadingSkeleton count={3} />);
      
      const skeletons = container.querySelectorAll('.loading-skeleton');
      expect(skeletons).toHaveLength(3);
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingSkeleton className="custom-skeleton" />);
      
      const skeleton = container.querySelector('.loading-skeleton');
      expect(skeleton).toHaveClass('custom-skeleton');
    });
  });

  describe('Variant: Post', () => {
    it('should render post skeleton variant', () => {
      const { container } = render(<LoadingSkeleton variant="post" />);
      
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
      expect(container.querySelector('.post-skeleton')).toBeInTheDocument();
    });

    it('should render post skeleton structure', () => {
      const { container } = render(<LoadingSkeleton variant="post" />);
      
      // Header elements
      expect(container.querySelector('.skeleton-header')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-avatar')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-user-info')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-username')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-timestamp')).toBeInTheDocument();
      
      // Content elements
      expect(container.querySelector('.skeleton-content')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-text-line')).toHaveLength(3);
      expect(container.querySelector('.skeleton-text-long')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-text-medium')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-text-short')).toBeInTheDocument();
      
      // Action elements
      expect(container.querySelector('.skeleton-actions')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-action-btn')).toHaveLength(3);
    });

    it('should have screen reader text for post', () => {
      render(<LoadingSkeleton variant="post" />);
      
      expect(screen.getByText('Loading post content...')).toBeInTheDocument();
      expect(screen.getByText('Loading post content...')).toHaveClass('sr-only');
    });
  });

  describe('Variant: Comment', () => {
    it('should render comment skeleton variant', () => {
      const { container } = render(<LoadingSkeleton variant="comment" />);
      
      expect(screen.getByLabelText('Loading comment')).toBeInTheDocument();
      expect(container.querySelector('.comment-skeleton')).toBeInTheDocument();
    });

    it('should render comment skeleton structure', () => {
      const { container } = render(<LoadingSkeleton variant="comment" />);
      
      // Header elements
      expect(container.querySelector('.skeleton-header')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-avatar-small')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-username-short')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-timestamp-short')).toBeInTheDocument();
      
      // Content elements
      expect(container.querySelector('.skeleton-content')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-text-line')).toHaveLength(2);
    });

    it('should have screen reader text for comment', () => {
      render(<LoadingSkeleton variant="comment" />);
      
      expect(screen.getByText('Loading comment...')).toBeInTheDocument();
      expect(screen.getByText('Loading comment...')).toHaveClass('sr-only');
    });
  });

  describe('Variant: Profile', () => {
    it('should render profile skeleton variant', () => {
      const { container } = render(<LoadingSkeleton variant="profile" />);
      
      expect(screen.getByLabelText('Loading profile')).toBeInTheDocument();
      expect(container.querySelector('.profile-skeleton')).toBeInTheDocument();
    });

    it('should render profile skeleton structure', () => {
      const { container } = render(<LoadingSkeleton variant="profile" />);
      
      // Profile header
      expect(container.querySelector('.skeleton-profile-header')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-avatar-large')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-profile-info')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-username-long')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-bio-line')).toHaveLength(2);
      expect(container.querySelector('.skeleton-bio-short')).toBeInTheDocument();
      
      // Stats
      expect(container.querySelector('.skeleton-stats')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-stat')).toHaveLength(3);
    });

    it('should have screen reader text for profile', () => {
      render(<LoadingSkeleton variant="profile" />);
      
      expect(screen.getByText('Loading profile information...')).toBeInTheDocument();
      expect(screen.getByText('Loading profile information...')).toHaveClass('sr-only');
    });
  });

  describe('Variant: Chat', () => {
    it('should render chat skeleton variant', () => {
      const { container } = render(<LoadingSkeleton variant="chat" />);
      
      expect(screen.getByLabelText('Loading chat message')).toBeInTheDocument();
      expect(container.querySelector('.chat-skeleton')).toBeInTheDocument();
    });

    it('should render chat skeleton structure', () => {
      const { container } = render(<LoadingSkeleton variant="chat" />);
      
      expect(container.querySelector('.skeleton-message')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-avatar-small')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-message-content')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-message-bubble')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-text-line')).toHaveLength(2);
      expect(container.querySelector('.skeleton-timestamp-small')).toBeInTheDocument();
    });

    it('should have screen reader text for chat', () => {
      render(<LoadingSkeleton variant="chat" />);
      
      expect(screen.getByText('Loading chat message...')).toBeInTheDocument();
      expect(screen.getByText('Loading chat message...')).toHaveClass('sr-only');
    });
  });

  describe('Multiple Skeletons', () => {
    it('should render correct number of skeletons', () => {
      const counts = [1, 2, 3, 5, 10];
      
      counts.forEach(count => {
        const { container, unmount } = render(<LoadingSkeleton count={count} />);
        
        const skeletons = container.querySelectorAll('.loading-skeleton');
        expect(skeletons).toHaveLength(count);
        
        unmount();
      });
    });

    it('should render multiple skeletons with different variants', () => {
      const variants = ['post', 'comment', 'profile', 'chat'] as const;
      
      variants.forEach(variant => {
        const { container, unmount } = render(
          <LoadingSkeleton variant={variant} count={3} />
        );
        
        const skeletons = container.querySelectorAll('.loading-skeleton');
        expect(skeletons).toHaveLength(3);
        
        skeletons.forEach((skeleton: Element) => {
          expect(skeleton).toHaveClass(`${variant}-skeleton`);
        });
        
        unmount();
      });
    });

    it('should generate unique keys for multiple skeletons', () => {
      const { container } = render(<LoadingSkeleton count={3} />);
      
      // Each skeleton should be wrapped in a div with a unique key
      const wrapperDivs = container.querySelectorAll('div > .loading-skeleton');
      expect(wrapperDivs).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should use output element with aria-label', () => {
      render(<LoadingSkeleton variant="post" />);
      
      const output = screen.getByRole('status');
      expect(output.tagName.toLowerCase()).toBe('output');
      expect(output).toHaveAttribute('aria-label', 'Loading post');
    });

    it('should have appropriate aria-labels for each variant', () => {
      const variantLabels = {
        post: 'Loading post',
        comment: 'Loading comment',
        profile: 'Loading profile',
        chat: 'Loading chat message'
      };
      
      Object.entries(variantLabels).forEach(([variant, label]) => {
        const { unmount } = render(<LoadingSkeleton variant={variant as 'post' | 'comment' | 'profile' | 'chat'} />);
        
        expect(screen.getByLabelText(label)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should have screen reader text for each variant', () => {
      const screenReaderTexts = {
        post: 'Loading post content...',
        comment: 'Loading comment...',
        profile: 'Loading profile information...',
        chat: 'Loading chat message...'
      };
      
      Object.entries(screenReaderTexts).forEach(([variant, text]) => {
        const { unmount } = render(<LoadingSkeleton variant={variant as 'post' | 'comment' | 'profile' | 'chat'} />);
        
        expect(screen.getByText(text)).toBeInTheDocument();
        expect(screen.getByText(text)).toHaveClass('sr-only');
        
        unmount();
      });
    });

    it('should maintain accessibility with multiple skeletons', () => {
      render(<LoadingSkeleton variant="comment" count={3} />);
      
      const outputs = screen.getAllByRole('status');
      expect(outputs).toHaveLength(3);
      
      outputs.forEach((output: HTMLElement) => {
        expect(output).toHaveAttribute('aria-label', 'Loading comment');
      });
      
      const screenReaderTexts = screen.getAllByText('Loading comment...');
      expect(screenReaderTexts).toHaveLength(3);
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct base classes', () => {
      const { container } = render(<LoadingSkeleton />);
      
      const skeleton = container.querySelector('.loading-skeleton');
      expect(skeleton).toHaveClass('loading-skeleton', 'post-skeleton');
    });

    it('should combine base classes with custom className', () => {
      const { container } = render(
        <LoadingSkeleton className="custom-class" variant="comment" />
      );
      
      const skeleton = container.querySelector('.loading-skeleton');
      expect(skeleton).toHaveClass('loading-skeleton', 'comment-skeleton', 'custom-class');
    });

    it('should handle empty className', () => {
      const { container } = render(<LoadingSkeleton className="" />);
      
      const skeleton = container.querySelector('.loading-skeleton');
      expect(skeleton).toHaveClass('loading-skeleton', 'post-skeleton');
    });
  });

  describe('Edge Cases', () => {
    it('should handle count of 0', () => {
      const { container } = render(<LoadingSkeleton count={0} />);
      
      expect(container.children).toHaveLength(0);
    });

    it('should handle negative count', () => {
      const { container } = render(<LoadingSkeleton count={-1} />);
      
      expect(container.children).toHaveLength(0);
    });

    it('should handle large count numbers', () => {
      const { container } = render(<LoadingSkeleton count={100} />);
      
      const skeletons = container.querySelectorAll('.loading-skeleton');
      expect(skeletons).toHaveLength(100);
    });

    it('should handle invalid variant and default to post', () => {
      const { container } = render(<LoadingSkeleton variant={'invalid' as 'post' | 'comment' | 'profile' | 'chat'} />);
      
      expect(container.querySelector('.post-skeleton')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading post')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
      const { container } = render(
        <LoadingSkeleton 
          variant={undefined as 'post' | 'comment' | 'profile' | 'chat' | undefined} 
          count={undefined as number | undefined} 
          className={undefined as string | undefined}
        />
      );
      
      expect(container.querySelector('.post-skeleton')).toBeInTheDocument();
      expect(container.querySelectorAll('.loading-skeleton')).toHaveLength(1);
    });
  });

  describe('Component Structure', () => {
    it('should wrap each skeleton in a div with unique key', () => {
      const { container } = render(<LoadingSkeleton count={2} />);
      
      const wrappers = Array.from(container.children);
      expect(wrappers).toHaveLength(2);
      
      wrappers.forEach((wrapper: Element) => {
        expect(wrapper.tagName.toLowerCase()).toBe('div');
        // Keys are not directly accessible, but structure should be correct
        expect(wrapper.children).toHaveLength(1);
        expect(wrapper.firstChild).toHaveClass('loading-skeleton');
      });
    });

    it('should maintain consistent structure across variants', () => {
      const variants = ['post', 'comment', 'profile', 'chat'] as const;
      
      variants.forEach(variant => {
        const { container, unmount } = render(<LoadingSkeleton variant={variant} />);
        
        const skeleton = container.querySelector('.loading-skeleton');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton?.tagName.toLowerCase()).toBe('output');
        
        // Each variant should have its specific class
        expect(skeleton).toHaveClass(`${variant}-skeleton`);
        
        // Each should have screen reader text
        const srText = container.querySelector('.sr-only');
        expect(srText).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Default Export', () => {
    it('should export LoadingSkeleton as default', () => {
      // Already testing with default import at the top
      expect(LoadingSkeleton).toBeDefined();
    });
  });
});