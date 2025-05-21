import { format, parse, isValid } from 'date-fns';

/**
 * Formats a date according to the specified format
 * @param date The date to format
 * @param formatString The format string to use
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | null | undefined, formatString: string = 'yyyy-MM-dd'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
}

/**
 * Parses a date string according to the specified format
 * @param dateString The date string to parse
 * @param formatString The format string to use
 * @returns The parsed Date object or null if invalid
 */
export function parseDate(dateString: string, formatString: string = 'yyyy-MM-dd'): Date | null {
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Gets the current business date (can be overridden by the user)
 * @returns The current business date
 */
export function getBusinessDate(): Date {
  // Check if there's a user-selected date in localStorage
  const storedDate = localStorage.getItem('businessDate');
  if (storedDate) {
    try {
      const parsedDate = new Date(storedDate);
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch (error) {
      console.error('Error parsing stored business date:', error);
    }
  }
  
  // Default to current date if no stored date or parsing fails
  return new Date();
}

/**
 * Sets the current business date
 * @param date The date to set as the business date
 */
export function setBusinessDate(date: Date): void {
  if (isValid(date)) {
    localStorage.setItem('businessDate', date.toISOString());
  }
}