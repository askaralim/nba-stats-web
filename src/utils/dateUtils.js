/**
 * Date Utility Functions
 * Shared date formatting utilities for frontend
 * Note: Date conversion logic could be moved to backend for iOS compatibility
 */

/**
 * Get current date in Chinese timezone
 * @returns {Date} Date object representing today in Chinese timezone
 */
export function getChineseDate() {
  const now = new Date();
  const chineseDateStr = now.toLocaleString('en-CA', { timeZone: 'Asia/Shanghai' }).split(',')[0];
  const [year, month, day] = chineseDateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date for API (YYYYMMDD)
 * Converts Chinese date to US Eastern timezone date for ESPN API
 * @param {Date} chineseDate - Date in Chinese timezone
 * @returns {string} Date string in YYYYMMDD format for API
 */
export function formatDateForAPI(chineseDate) {
  const year = chineseDate.getFullYear();
  const month = chineseDate.getMonth() + 1;
  const day = chineseDate.getDate();
  
  const chineseDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const chineseMidnight = new Date(`${chineseDateStr}T00:00:00+08:00`);
  
  const usEasternDateStr = chineseMidnight.toLocaleString('en-CA', { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [usYear, usMonth, usDay] = usEasternDateStr.split('-');
  return `${usYear}${String(usMonth).padStart(2, '0')}${String(usDay).padStart(2, '0')}`;
}

/**
 * Format date for display in Chinese format (yyyy-mm-dd 星期X)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = date.toLocaleString('zh-CN', { weekday: 'long' });
  return `${year}-${month}-${day} ${weekday}`;
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Get tomorrow's date
 * @returns {Date} Tomorrow's date
 */
export function getTomorrowDate() {
  const tomorrow = new Date(getChineseDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

