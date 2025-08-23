/**
 * Locale Formatting Utilities
 * 
 * Provides culturally-aware formatting for dates, times, numbers,
 * and other locale-specific data
 * 
 * @license Apache-2.0
 */

import i18n from '../i18n';

// Supported locales with their specific configurations
const localeConfigs = {
  'en': {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberDecimal: '.',
    numberThousands: ',',
    currency: 'USD',
    firstDayOfWeek: 0, // Sunday
    calendar: 'gregorian'
  },
  'es': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberDecimal: ',',
    numberThousands: '.',
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    calendar: 'gregorian'
  },
  'pt-BR': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberDecimal: ',',
    numberThousands: '.',
    currency: 'BRL',
    firstDayOfWeek: 0, // Sunday
    calendar: 'gregorian'
  },
  'pt-PT': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberDecimal: ',',
    numberThousands: ' ',
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    calendar: 'gregorian'
  },
  'ar': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberDecimal: '٫',
    numberThousands: '٬',
    currency: 'SAR',
    firstDayOfWeek: 6, // Saturday
    calendar: 'islamic-umalqura',
    numerals: 'arab'
  },
  'zh': {
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    numberDecimal: '.',
    numberThousands: ',',
    currency: 'CNY',
    firstDayOfWeek: 1, // Monday
    calendar: 'gregorian'
  },
  'vi': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberDecimal: ',',
    numberThousands: '.',
    currency: 'VND',
    firstDayOfWeek: 1, // Monday
    calendar: 'gregorian'
  },
  'tl': {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberDecimal: '.',
    numberThousands: ',',
    currency: 'PHP',
    firstDayOfWeek: 0, // Sunday
    calendar: 'gregorian'
  }
};

/**
 * Get locale configuration
 */
function getLocaleConfig(locale?: string) {
  const currentLocale = locale || i18n.language || 'en';
  const baseLocale = currentLocale.split('-')[0];
  return localeConfigs[currentLocale as keyof typeof localeConfigs] || 
         localeConfigs[baseLocale as keyof typeof localeConfigs] || 
         localeConfigs['en'];
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale?: string
): string {
  const d = new Date(date);
  const currentLocale = locale || i18n.language || 'en';
  
  // Use Intl.DateTimeFormat for proper locale formatting
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: '2-digit', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };
  
  const options: Intl.DateTimeFormatOptions = formatOptions[format];
  
  // Special handling for Arabic to use Islamic calendar if preferred
  if (currentLocale === 'ar' && getLocaleConfig(currentLocale).calendar === 'islamic-umalqura') {
    options.calendar = 'islamic-umalqura';
  }
  
  return new Intl.DateTimeFormat(currentLocale, options).format(d);
}

/**
 * Format time according to locale
 */
export function formatTime(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'short',
  locale?: string
): string {
  const d = new Date(date);
  const currentLocale = locale || i18n.language || 'en';
  const config = getLocaleConfig(currentLocale);
  
  const timeFormatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: config.timeFormat === '12h'
    },
    medium: { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: config.timeFormat === '12h'
    },
    long: { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      timeZoneName: 'short',
      hour12: config.timeFormat === '12h'
    }
  };
  
  const options = timeFormatOptions[format];
  
  return new Intl.DateTimeFormat(currentLocale, options).format(d);
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string | number,
  dateFormat: 'short' | 'medium' | 'long' = 'medium',
  timeFormat: 'short' | 'medium' | 'long' = 'short',
  locale?: string
): string {
  const formattedDate = formatDate(date, dateFormat, locale);
  const formattedTime = formatTime(date, timeFormat, locale);
  
  const currentLocale = locale || i18n.language || 'en';
  
  // Different separators for different locales
  const separator = ['zh', 'ja', 'ko'].includes(currentLocale) ? ' ' : ', ';
  
  return `${formattedDate}${separator}${formattedTime}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale?: string
): string {
  const d = new Date(date);
  const now = new Date();
  const currentLocale = locale || i18n.language || 'en';
  
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });
  
  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, 'second');
  } else if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  } else if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  } else if (Math.abs(diffDay) < 7) {
    return rtf.format(diffDay, 'day');
  } else if (Math.abs(diffWeek) < 4) {
    return rtf.format(diffWeek, 'week');
  } else if (Math.abs(diffMonth) < 12) {
    return rtf.format(diffMonth, 'month');
  } else {
    return rtf.format(diffYear, 'year');
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    style?: 'decimal' | 'percent' | 'currency';
    currency?: string;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  },
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  const config = getLocaleConfig(currentLocale);
  
  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
    style: options?.style || 'decimal',
    currency: options?.currency || config.currency,
    notation: options?.notation
  };
  
  // Special handling for Arabic numerals
  if (currentLocale === 'ar' && 'numerals' in config && config.numerals === 'arab') {
    formatOptions.numberingSystem = 'arab';
  }
  
  return new Intl.NumberFormat(currentLocale, formatOptions).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  currency?: string,
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  const config = getLocaleConfig(currentLocale);
  
  return formatNumber(
    value,
    {
      style: 'currency',
      currency: currency || config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    },
    currentLocale
  );
}

/**
 * Format percentage according to locale
 */
export function formatPercent(
  value: number,
  decimals = 0,
  locale?: string
): string {
  return formatNumber(
    value,
    {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    },
    locale
  );
}

/**
 * Format phone number according to locale
 */
export function formatPhoneNumber(
  phoneNumber: string,
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on locale
  switch (currentLocale) {
    case 'en':
      // US format: (XXX) XXX-XXXX
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      break;
      
    case 'es':
      // Spain format: +34 XXX XX XX XX
      if (cleaned.startsWith('34')) {
        return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
      }
      break;
      
    case 'pt-BR':
      // Brazil format: +55 (XX) XXXXX-XXXX
      if (cleaned.startsWith('55')) {
        return `+55 (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
      }
      break;
      
    case 'ar':
      // Saudi format: +966 5X XXX XXXX
      if (cleaned.startsWith('966')) {
        return `+966 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
      }
      break;
      
    case 'zh':
      // China format: +86 XXX XXXX XXXX
      if (cleaned.startsWith('86')) {
        return `+86 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
      }
      break;
      
    case 'vi':
      // Vietnam format: +84 XX XXX XXXX
      if (cleaned.startsWith('84')) {
        return `+84 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
      }
      break;
      
    case 'tl':
      // Philippines format: +63 XXX XXX XXXX
      if (cleaned.startsWith('63')) {
        return `+63 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
      }
      break;
  }
  
  // Default formatting for unrecognized formats
  return phoneNumber;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(
  seconds: number,
  format: 'short' | 'long' = 'short',
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  
  if (format === 'short') {
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
  } else {
    // Use Intl for proper plural forms
    const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'always' });
    
    if (hours > 0) {
      const hourStr = rtf.format(hours, 'hour').replace(/^in |ago$/g, '').trim();
      parts.push(hourStr);
    }
    if (minutes > 0) {
      const minStr = rtf.format(minutes, 'minute').replace(/^in |ago$/g, '').trim();
      parts.push(minStr);
    }
    if (secs > 0 || parts.length === 0) {
      const secStr = rtf.format(secs, 'second').replace(/^in |ago$/g, '').trim();
      parts.push(secStr);
    }
    
    // Join with appropriate conjunction
    if ('ListFormat' in Intl) {
      const IntlWithListFormat = Intl as any & {
        ListFormat?: new (locale: string, options?: any) => { format: (list: string[]) => string }
      };
      if (IntlWithListFormat.ListFormat) {
        const listFormatter = new IntlWithListFormat.ListFormat(currentLocale, { style: 'long', type: 'conjunction' });
        return listFormatter.format(parts);
      }
    }
    return parts.join(', ');
  }
}

/**
 * Format list of items according to locale
 */
export function formatList(
  items: string[],
  style: 'long' | 'short' | 'narrow' = 'long',
  type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction',
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  
  try {
    if ('ListFormat' in Intl) {
      const IntlWithListFormat = Intl as any & {
        ListFormat?: new (locale: string, options?: any) => { format: (list: string[]) => string }
      };
      if (IntlWithListFormat.ListFormat) {
        const formatter = new IntlWithListFormat.ListFormat(currentLocale, { style, type });
        return formatter.format(items);
      }
    }
    throw new Error('ListFormat not supported');
  } catch (error) {
    // Fallback for unsupported locales
    if (type === 'conjunction') {
      return items.join(', ');
    } else if (type === 'disjunction') {
      return items.join(' or ');
    } else {
      return items.join(', ');
    }
  }
}

/**
 * Format name according to cultural preferences
 */
export function formatName(
  firstName: string,
  lastName: string,
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  // Cultural formatting considerations
  // getCulturalContext(currentLocale); // Cultural context for number formatting
  
  // Different name order for different cultures
  switch (currentLocale) {
    case 'zh':
    case 'ja':
    case 'ko':
    case 'vi':
      // Family name first
      return `${lastName} ${firstName}`;
      
    case 'ar':
      // May include honorifics
      return `${firstName} ${lastName}`;
      
    default:
      // Western order
      return `${firstName} ${lastName}`;
  }
}

/**
 * Format address according to locale
 */
export function formatAddress(
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  },
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  const parts: string[] = [];
  
  // Different address formats for different locales
  switch (currentLocale) {
    case 'en':
    case 'tl':
      // US/Philippines format
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state && address.postalCode) {
        parts.push(`${address.state} ${address.postalCode}`);
      } else if (address.state) {
        parts.push(address.state);
      } else if (address.postalCode) {
        parts.push(address.postalCode);
      }
      if (address.country) parts.push(address.country);
      break;
      
    case 'zh':
    case 'ja':
    case 'ko':
      // East Asian format (reversed)
      if (address.country) parts.push(address.country);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.state) parts.push(address.state);
      if (address.city) parts.push(address.city);
      if (address.street) parts.push(address.street);
      break;
      
    default:
      // European/Latin American format
      if (address.street) parts.push(address.street);
      if (address.postalCode && address.city) {
        parts.push(`${address.postalCode} ${address.city}`);
      } else if (address.city) {
        parts.push(address.city);
      }
      if (address.state) parts.push(address.state);
      if (address.country) parts.push(address.country);
      break;
  }
  
  return parts.join(', ');
}

/**
 * Get calendar week start day for locale
 */
export function getWeekStartDay(locale?: string): number {
  const currentLocale = locale || i18n.language || 'en';
  const config = getLocaleConfig(currentLocale);
  return config.firstDayOfWeek;
}

/**
 * Check if locale uses RTL
 */
export function isRTL(locale?: string): boolean {
  const currentLocale = locale || i18n.language || 'en';
  return currentLocale === 'ar' || currentLocale === 'he' || currentLocale === 'fa';
}

/**
 * Get appropriate date picker format
 */
export function getDatePickerFormat(locale?: string): string {
  const config = getLocaleConfig(locale);
  return config.dateFormat.toLowerCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, locale?: string): string {
  const currentLocale = locale || i18n.language || 'en';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${formatNumber(size, { maximumFractionDigits: 2 }, currentLocale)} ${units[unitIndex]}`;
}

/**
 * Format temperature
 */
export function formatTemperature(
  value: number,
  unit: 'celsius' | 'fahrenheit' = 'celsius',
  locale?: string
): string {
  const currentLocale = locale || i18n.language || 'en';
  
  // US uses Fahrenheit
  if (currentLocale === 'en' && unit === 'celsius') {
    // Convert to Fahrenheit for US locale
    const fahrenheit = (value * 9/5) + 32;
    return `${formatNumber(fahrenheit, { maximumFractionDigits: 1 }, currentLocale)}°F`;
  }
  
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${formatNumber(value, { maximumFractionDigits: 1 }, currentLocale)}${symbol}`;
}

// Export all functions
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatPhoneNumber,
  formatDuration,
  formatList,
  formatName,
  formatAddress,
  getWeekStartDay,
  isRTL,
  getDatePickerFormat,
  formatFileSize,
  formatTemperature
};