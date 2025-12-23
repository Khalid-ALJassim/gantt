/**
 * Tooltip system for displaying job information
 */

import { formatDate } from './utils.js';

export class Tooltip {
  /**
   * @param {HTMLElement} container - Container element for tooltip
   */
  constructor(container) {
    this.container = container;
    this.tooltip = this.createTooltipElement();
    this.currentJob = null;
    this.visible = false;
  }

  /**
   * Create tooltip DOM element
   * @returns {HTMLElement} Tooltip element
   */
  createTooltipElement() {
    const tooltip = document.createElement('div');
    tooltip.className = 'gantt-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: none;
      line-height: 1.5;
    `;
    this.container.appendChild(tooltip);
    return tooltip;
  }

  /**
   * Show tooltip for a job
   * @param {Object} job - Job object
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  show(job, x, y) {
    if (!job) {
      this.hide();
      return;
    }
    
    this.currentJob = job;
    this.tooltip.innerHTML = this.generateTooltipContent(job);
    this.tooltip.style.display = 'block';
    this.visible = true;
    
    // Position tooltip
    this.position(x, y);
  }

  /**
   * Generate HTML content for tooltip
   * @param {Object} job - Job object
   * @returns {string} HTML content
   */
  generateTooltipContent(job) {
    const parts = [];
    
    // Job name
    parts.push(`<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${job.name || job.id}</div>`);
    
    // Job ID
    if (job.id !== job.name) {
      parts.push(`<div><strong>ID:</strong> ${job.id}</div>`);
    }
    
    // Scope
    if (job.scope) {
      parts.push(`<div><strong>Scope:</strong> ${job.scope}</div>`);
    }
    
    // Dates
    const startDate = formatDate(job.start, 'long');
    const endDate = formatDate(job.end, 'long');
    parts.push(`<div><strong>Start:</strong> ${startDate}</div>`);
    parts.push(`<div><strong>End:</strong> ${endDate}</div>`);
    
    // Duration
    const duration = Math.ceil((job.end - job.start) / (1000 * 60 * 60 * 24));
    parts.push(`<div><strong>Duration:</strong> ${duration} days</div>`);
    
    // Team
    if (job.team) {
      parts.push(`<div><strong>Team:</strong> ${job.team}</div>`);
    }
    
    // Estimated gain
    if (job.estGain) {
      parts.push(`<div><strong>Est. Gain:</strong> ${job.estGain}</div>`);
    }
    
    // Optimization method
    if (job.optMethod) {
      parts.push(`<div><strong>Method:</strong> ${job.optMethod}</div>`);
    }
    
    // Location
    if (job.location) {
      const locationText = job.locationIcon ? `${job.locationIcon} ${job.location}` : job.location;
      parts.push(`<div><strong>Location:</strong> ${locationText}</div>`);
    }
    
    // BOPD Rig Hour
    if (job.bopdRigHour) {
      parts.push(`<div><strong>BOPD/Rig Hour:</strong> ${job.bopdRigHour}</div>`);
    }
    
    // Secondary scope
    if (job.secondaryScope && job.secondaryScope.length > 0) {
      parts.push(`<div><strong>Secondary Scope:</strong> ${job.secondaryScope.join(', ')}</div>`);
    }
    
    return parts.join('');
  }

  /**
   * Position the tooltip
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  position(x, y) {
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Default position: right and below cursor
    let left = x + 15;
    let top = y + 15;
    
    // Check if tooltip would overflow right edge
    if (left + tooltipRect.width > containerRect.width) {
      left = x - tooltipRect.width - 15;
    }
    
    // Check if tooltip would overflow bottom edge
    if (top + tooltipRect.height > containerRect.height) {
      top = y - tooltipRect.height - 15;
    }
    
    // Ensure tooltip stays within bounds
    left = Math.max(5, Math.min(left, containerRect.width - tooltipRect.width - 5));
    top = Math.max(5, Math.min(top, containerRect.height - tooltipRect.height - 5));
    
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  /**
   * Update tooltip position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  updatePosition(x, y) {
    if (this.visible) {
      this.position(x, y);
    }
  }

  /**
   * Hide tooltip
   */
  hide() {
    this.tooltip.style.display = 'none';
    this.visible = false;
    this.currentJob = null;
  }

  /**
   * Check if tooltip is visible
   * @returns {boolean} True if visible
   */
  isVisible() {
    return this.visible;
  }

  /**
   * Destroy tooltip
   */
  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
  }
}
