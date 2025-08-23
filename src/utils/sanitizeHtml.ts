/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by safely sanitizing HTML content
 */

// Safe HTML sanitization without external dependencies
export function sanitizeHtml(html: string): string {
  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.textContent = html;
  
  // Return the sanitized text content with properly escaped ampersands
  let result = temp.innerHTML;
  // Ensure & is properly escaped to &amp;
  if (result.includes('&') && !result.includes('&amp;')) {
    result = result.replace(/&(?!lt;|gt;|quot;|#39;|amp;)/g, '&amp;');
  }
  return result;
}

// Convert markdown-like syntax to safe HTML
export function safeMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  // First, escape any HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // Start with escaped text
  let safe = escapeHtml(text);
  
  // Then apply markdown transformations using safe replacements
  safe = safe
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Handle links separately with validation
  safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Validate URL to prevent javascript: and data: protocols
    const isValidUrl = (urlString: string) => {
      try {
        const parsed = new URL(urlString);
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
      } catch {
        // If not a valid absolute URL, check if it's a relative path
        return urlString.startsWith('/') || urlString.startsWith('#');
      }
    };
    
    if (isValidUrl(url)) {
      const safeUrl = escapeHtml(url);
      const safeText = escapeHtml(text);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
    }
    return escapeHtml(match); // Return original if URL is not valid
  });
  
  return safe;
}

// React-safe rendering helper
export function createSafeHtml(content: string): { __html: string } {
  return { __html: safeMarkdownToHtml(content) };
}