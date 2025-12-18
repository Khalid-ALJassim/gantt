/**
 * Timeline system for date-to-pixel conversion and grid rendering
 */

import { formatDate } from './utils.js';

export class Timeline {
  /**
   * @param {Object} config - Timeline configuration
   * @param {number} config.viewStart - Start timestamp of visible timeline
   * @param {number} config.viewEnd - End timestamp of visible timeline
   * @param {number} config.width - Width of timeline in pixels
   * @param {number} config.height - Height of timeline in pixels
   * @param {number} config.leftMargin - Left margin for resource labels
   */
  constructor(config) {
    this.viewStart = config.viewStart;
    this.viewEnd = config.viewEnd;
    this.width = config.width;
    this.height = config.height;
    this.leftMargin = config.leftMargin || 120;
    this.topMargin = config.topMargin || 60;
    this.chartWidth = this.width - this.leftMargin;
    
    this.updateScale();
  }

  /**
   * Update the time-to-pixel scale
   */
  updateScale() {
    const timeRange = this.viewEnd - this.viewStart;
    this.msPerPixel = timeRange / this.chartWidth;
    this.pixelsPerMs = this.chartWidth / timeRange;
  }

  /**
   * Convert a date/timestamp to X coordinate
   * @param {Date|number} date - Date or timestamp
   * @returns {number} X coordinate in pixels
   */
  dateToX(date) {
    const timestamp = date instanceof Date ? date.getTime() : date;
    const offset = timestamp - this.viewStart;
    return this.leftMargin + (offset * this.pixelsPerMs);
  }

  /**
   * Convert X coordinate to date
   * @param {number} x - X coordinate in pixels
   * @returns {Date} Date object
   */
  xToDate(x) {
    const chartX = x - this.leftMargin;
    const timestamp = this.viewStart + (chartX * this.msPerPixel);
    return new Date(timestamp);
  }

  /**
   * Get appropriate time interval for grid lines based on zoom level
   * @returns {Object} Interval configuration {type, count}
   */
  getGridInterval() {
    const days = (this.viewEnd - this.viewStart) / (1000 * 60 * 60 * 24);
    
    if (days <= 7) {
      return { type: 'day', count: 1 };
    } else if (days <= 31) {
      return { type: 'day', count: 7 };
    } else if (days <= 90) {
      return { type: 'week', count: 1 };
    } else if (days <= 180) {
      return { type: 'week', count: 2 };
    } else if (days <= 365) {
      return { type: 'month', count: 1 };
    } else {
      return { type: 'month', count: 3 };
    }
  }

  /**
   * Get date labels for the timeline
   * @returns {Array<{date: Date, x: number, label: string}>} Array of date label objects
   */
  getDateLabels() {
    const labels = [];
    const interval = this.getGridInterval();
    const startDate = new Date(this.viewStart);
    
    // Align to interval boundary
    if (interval.type === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (interval.type === 'week') {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else if (interval.type === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }
    
    let currentDate = new Date(startDate);
    while (currentDate.getTime() <= this.viewEnd) {
      const x = this.dateToX(currentDate);
      if (x >= this.leftMargin && x <= this.width) {
        labels.push({
          date: new Date(currentDate),
          x: x,
          label: this.formatDateLabel(currentDate, interval.type)
        });
      }
      
      // Increment by interval
      if (interval.type === 'day') {
        currentDate.setDate(currentDate.getDate() + interval.count);
      } else if (interval.type === 'week') {
        currentDate.setDate(currentDate.getDate() + (7 * interval.count));
      } else if (interval.type === 'month') {
        currentDate.setMonth(currentDate.getMonth() + interval.count);
      }
    }
    
    return labels;
  }

  /**
   * Format date label based on interval type
   * @param {Date} date - Date to format
   * @param {string} intervalType - Type of interval ('day', 'week', 'month')
   * @returns {string} Formatted label
   */
  formatDateLabel(date, intervalType) {
    if (intervalType === 'day') {
      return formatDate(date, 'short');
    } else if (intervalType === 'week') {
      return formatDate(date, 'short');
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }

  /**
   * Zoom the timeline
   * @param {number} factor - Zoom factor (>1 to zoom in, <1 to zoom out)
   * @param {number} centerX - X coordinate to zoom towards (optional)
   */
  zoom(factor, centerX) {
    const centerDate = centerX ? this.xToDate(centerX) : 
                       new Date((this.viewStart + this.viewEnd) / 2);
    const centerTime = centerDate.getTime();
    
    const currentRange = this.viewEnd - this.viewStart;
    const newRange = currentRange / factor;
    
    // Calculate new bounds
    const startOffset = centerTime - this.viewStart;
    const endOffset = this.viewEnd - centerTime;
    const totalOffset = startOffset + endOffset;
    
    const startRatio = startOffset / totalOffset;
    const endRatio = endOffset / totalOffset;
    
    this.viewStart = Math.round(centerTime - (newRange * startRatio));
    this.viewEnd = Math.round(centerTime + (newRange * endRatio));
    
    // Ensure minimum range (1 day)
    const minRange = 1000 * 60 * 60 * 24;
    if (this.viewEnd - this.viewStart < minRange) {
      const mid = (this.viewStart + this.viewEnd) / 2;
      this.viewStart = mid - minRange / 2;
      this.viewEnd = mid + minRange / 2;
    }
    
    this.updateScale();
  }

  /**
   * Pan the timeline
   * @param {number} deltaX - Pixels to pan
   */
  pan(deltaX) {
    const deltaTime = deltaX * this.msPerPixel;
    this.viewStart -= deltaTime;
    this.viewEnd -= deltaTime;
    this.updateScale();
  }

  /**
   * Set the view range
   * @param {number} start - Start timestamp
   * @param {number} end - End timestamp
   */
  setViewRange(start, end) {
    this.viewStart = start;
    this.viewEnd = end;
    this.updateScale();
  }

  /**
   * Get the current date X position
   * @returns {number} X coordinate of current date
   */
  getCurrentDateX() {
    return this.dateToX(Date.now());
  }

  /**
   * Resize the timeline
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.chartWidth = width - this.leftMargin;
    this.updateScale();
  }
}
