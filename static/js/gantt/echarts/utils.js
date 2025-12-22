/**
 * Helper utilities for ECharts Gantt implementation
 */

/**
 * Format date for axis labels
 * @param {number} timestamp - Unix timestamp
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, format = 'short') {
  const date = new Date(timestamp);
  
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  switch (format) {
    case 'short':
      return `${month} ${day}`;
    case 'medium':
      return `${month} ${day}, ${year}`;
    case 'long':
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    default:
      return `${month} ${day}`;
  }
}

/**
 * Calculate duration in days between two dates
 * @param {number} start - Start timestamp
 * @param {number} end - End timestamp
 * @returns {number} Duration in days
 */
export function getDurationInDays(start, end) {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Parse color string to ensure valid format
 * @param {string} color - Color string
 * @returns {string} Valid color string
 */
export function parseColor(color) {
  if (!color) return '#3498db';
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  return `#${color}`;
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if two date ranges overlap
 * @param {number} start1 - First range start
 * @param {number} end1 - First range end
 * @param {number} start2 - Second range start
 * @param {number} end2 - Second range end
 * @returns {boolean} True if ranges overlap
 */
export function dateRangesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

/**
 * Convert RGB to hex
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Constants for styling
 */
export const COLORS = {
  SELECTION: '#FF6B6B',
  DEFAULT_BORDER: '#34495e',
  GRID_LINE: '#e0e0e0',
  TEXT: '#495057',
  TEXT_SECONDARY: '#6c757d',
  BACKGROUND: '#ffffff',
  CURRENT_DATE_LINE: '#ff4444'
};

export const DIMENSIONS = {
  BAR_HEIGHT_RATIO: 0.6,
  BORDER_RADIUS: 6,
  DEFAULT_BORDER_WIDTH: 1,
  SELECTION_BORDER_WIDTH: 3,
  MIN_BAR_WIDTH: 30
};

export const OPACITY = {
  NORMAL: 1,
  DIMMED: 0.3,
  DRAGGING: 0.8
};
