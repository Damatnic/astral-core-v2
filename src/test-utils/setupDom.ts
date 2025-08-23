/**
 * DOM Setup for React 18 Testing
 * Ensures proper DOM structure for React Testing Library with React 18
 */

export function setupDOM(): void {
  // Check if we're in a jsdom environment
  if (typeof document === 'undefined') {
    throw new Error('Document is not defined. Ensure jest is configured with testEnvironment: "jsdom"');
  }

  // Ensure documentElement exists
  if (!document.documentElement) {
    throw new Error('Document.documentElement is not defined');
  }

  // Create body if it doesn't exist
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
  }

  // Don't add any default containers - let tests create what they need
  // This prevents conflicts between different testing approaches
}

export function cleanupDOM(): void {
  if (typeof document !== 'undefined' && document.body) {
    // Remove all children from body except critical testing infrastructure
    const children = Array.from(document.body.children);
    children.forEach(child => {
      // Don't remove elements that might be part of the test infrastructure
      if (child.id !== '__react_testing_library__') {
        try {
          document.body.removeChild(child);
        } catch (e) {
          // Ignore errors from already removed nodes
        }
      }
    });
  }
}

export function ensureContainer(): HTMLElement {
  setupDOM();
  return document.body;
}