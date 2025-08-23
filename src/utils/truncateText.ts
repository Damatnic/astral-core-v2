/**
 * Truncates text to a specified length and adds ellipsis if truncated
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text with suffix if needed
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text) return '';
  
  // Handle negative max length
  if (maxLength <= 0) {
    return suffix;
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Trim the text before adding suffix to avoid trailing spaces
  return text.slice(0, maxLength).trimEnd() + suffix;
};

export default truncateText;