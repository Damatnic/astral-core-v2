/**
 * Lazy Markdown Component - Mobile Optimized
 * Reduces initial bundle size by loading markdown processing on-demand
 */

import React, { Suspense, lazy, useState } from 'react';
import { safeMarkdownToHtml } from '../utils/sanitizeHtml';

// Lazy load the heavy markdown dependencies
const ReactMarkdown = lazy(() => import('react-markdown'));

interface LazyMarkdownProps {
  children: string;
  className?: string;
  placeholder?: React.ReactNode;
  autoLoad?: boolean;
}

// Move components outside to avoid re-creation
const OptimizedImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img 
    {...props} 
    alt={props.alt || 'Content image'}
    style={{ maxWidth: '100%', height: 'auto' }}
    loading="lazy"
  />
);

const OptimizedLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, ...props }) => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const LazyMarkdown: React.FC<LazyMarkdownProps> = ({
  children,
  className = '',
  placeholder,
  autoLoad = false
}) => {
  const [shouldLoad, setShouldLoad] = useState(autoLoad);
  const [isLoading, setIsLoading] = useState(false);

  // Use safe markdown rendering
  const renderSimpleMarkdown = (text: string) => {
    return safeMarkdownToHtml(text);
  };

  const handleLoadMarkdown = () => {
    setIsLoading(true);
    setShouldLoad(true);
  };

  if (!shouldLoad) {
    return (
      <div className={`lazy-markdown-placeholder ${className}`}>
        {placeholder || (
          <button 
            onClick={handleLoadMarkdown}
            style={{ 
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '0',
              textAlign: 'left',
              width: '100%'
            }}
            aria-label="Load full markdown content"
          >
            <div 
              dangerouslySetInnerHTML={{ 
                __html: renderSimpleMarkdown(children.substring(0, 200) + (children.length > 200 ? '...' : '')) 
              }} 
            />
            <div
              className="load-markdown-btn"
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              Load Full Content
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="markdown-loading">
          {isLoading && <p>Loading enhanced formatting...</p>}
          <div dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(children) }} />
        </div>
      }
    >
      <MarkdownRenderer className={className}>
        {children}
      </MarkdownRenderer>
    </Suspense>
  );
};

// Separate component for the actual markdown rendering
const MarkdownRenderer: React.FC<{ children: string; className: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <ReactMarkdown 
      className={className}
      components={{
        img: OptimizedImage,
        a: OptimizedLink
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

// Hook for markdown loading
export const useMarkdownLoader = (content: string, autoLoad = false) => {
  const [isLoaded, setIsLoaded] = useState(autoLoad);
  const [isLoading, setIsLoading] = useState(false);

  const loadMarkdown = () => {
    setIsLoading(true);
    setIsLoaded(true);
  };

  return {
    isLoaded,
    isLoading,
    loadMarkdown,
    content
  };
};

export default LazyMarkdown;
