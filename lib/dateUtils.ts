/**
 * Get the Sunday that ends the current week (or the week of a given date)
 * @param date - Optional date to get the week ending for
 * @returns Date object representing the Sunday of that week
 */
export function getWeekEnding(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day; // If it's Sunday, use it; otherwise, get next Sunday
  const sunday = new Date(d);
  sunday.setDate(d.getDate() + diff);
  sunday.setHours(23, 59, 59, 999); // End of day
  return sunday;
}

/**
 * Format a date as YYYY-MM-DD in local timezone
 * @param date - Date to format
 * @returns String in YYYY-MM-DD format
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date in local timezone
 * @param dateString - String in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get a display string for a week (e.g., "Week ending 25 Aug")
 * @param weekEnding - Date representing the week ending
 * @returns Display string
 */
export function getWeekDisplay(weekEnding: Date | string): string {
  const date = typeof weekEnding === 'string' ? parseDateLocal(weekEnding) : weekEnding;
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `Week ending ${date.toLocaleDateString('en-GB', options)}`;
}

/**
 * Get an array of recent week endings (for dropdown options)
 * @param count - Number of weeks to generate
 * @returns Array of Date objects representing week endings
 */
export function getRecentWeekEndings(count: number = 8): Date[] {
  const weeks: Date[] = [];
  const currentWeekEnding = getWeekEnding();
  
  for (let i = 0; i < count; i++) {
    const weekEnding = new Date(currentWeekEnding);
    weekEnding.setDate(weekEnding.getDate() - (i * 7));
    weeks.push(weekEnding);
  }
  
  return weeks;
}