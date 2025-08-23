/**
 * React 18 Testing Fix
 * Provides a working render implementation for React 18 with React Testing Library
 */

import React, { ReactElement } from 'react';
import { queries, RenderOptions, RenderResult } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { act } from '@testing-library/react';

export function renderWithReact18(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult {
  // Ensure we have a document.body
  if (typeof document === 'undefined') {
    throw new Error('document is not defined');
  }
  
  if (!document.body) {
    const body = document.createElement('body');
    if (document.documentElement) {
      document.documentElement.appendChild(body);
    }
  }
  
  // Create container
  const container = document.createElement('div');
  container.setAttribute('data-testid', 'react18-container');
  document.body.appendChild(container);
  
  // Create root and render
  let root: ReturnType<typeof createRoot> | null = null;
  
  act(() => {
    root = createRoot(container);
    const Wrapper = options?.wrapper || React.Fragment;
    root.render(<Wrapper>{ui}</Wrapper>);
  });
  
  // Return RTL-compatible result
  return {
    container,
    baseElement: document.body,
    debug: (element = container) => {
      console.log(require('pretty-format').format(element, {
        plugins: [
          require('pretty-format').plugins.DOMElement,
          require('pretty-format').plugins.DOMCollection,
        ],
      }));
    },
    unmount: () => {
      act(() => {
        root?.unmount();
      });
    },
    rerender: (newUi: ReactElement) => {
      act(() => {
        const Wrapper = options?.wrapper || React.Fragment;
        root?.render(<Wrapper>{newUi}</Wrapper>);
      });
    },
    asFragment: () => {
      const template = document.createElement('template');
      template.innerHTML = container.innerHTML;
      return template.content;
    },
    ...queries.getAllByBoundAttribute(container, 'data-testid'),
    ...Object.entries(queries).reduce((acc, [key, query]) => {
      if (typeof query === 'function') {
        acc[key] = query.bind(null, container);
      }
      return acc;
    }, {} as any),
  } as RenderResult;
}