/**
 * Canvas rendering system for the Gantt chart
 */

import { truncateText } from './utils.js';

export class CanvasRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Timeline} timeline - Timeline instance
   * @param {StateManager} stateManager - State manager instance
   */
  constructor(canvas, timeline, stateManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.timeline = timeline;
    this.stateManager = stateManager;
    
    // Configuration
    this.rowHeight = 40;
    this.rowPadding = 4;
    this.barHeight = 32;
    this.cornerRadius = 4;
    
    // Cache for rendered elements
    this.jobRects = new Map();
    this.resourceRects = new Map();
    
    // Set up high DPI rendering
    this.setupHighDPI();
  }

  /**
   * Setup high DPI rendering
   */
  setupHighDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  /**
   * Resize the canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.setupHighDPI();
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
  }

  /**
   * Render the complete chart
   * @param {Object} data - Chart data {jobs, resources}
   */
  render(data) {
    this.clear();
    this.jobRects.clear();
    this.resourceRects.clear();
    
    // Draw background
    this.drawBackground();
    
    // Draw grid
    this.drawGrid();
    
    // Draw jobs first (so they appear behind resources)
    this.drawJobs(data.jobs, data.resources);
    
    // Draw current date indicator
    this.drawCurrentDateIndicator();
    
    // Draw timeline on top
    this.drawTimeline();
    
    // Draw resources on top (so labels are visible)
    this.drawResources(data.resources);
  }

  /**
   * Draw background
   */
  drawBackground() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
  }

  /**
   * Draw grid lines
   */
  drawGrid() {
    const dateLabels = this.timeline.getDateLabels();
    
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    
    // Vertical grid lines
    dateLabels.forEach(label => {
      this.ctx.beginPath();
      this.ctx.moveTo(label.x, this.timeline.topMargin);
      this.ctx.lineTo(label.x, this.displayHeight);
      this.ctx.stroke();
    });
    
    // Horizontal grid lines (resource separators)
    const startY = this.timeline.topMargin;
    const numResources = Math.floor((this.displayHeight - startY) / this.rowHeight);
    
    this.ctx.strokeStyle = '#f0f0f0';
    for (let i = 0; i <= numResources; i++) {
      const y = startY + (i * this.rowHeight);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.displayWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw timeline with date labels
   */
  drawTimeline() {
    const dateLabels = this.timeline.getDateLabels();
    
    // Timeline background
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(0, 0, this.displayWidth, this.timeline.topMargin);
    
    // Date labels
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#333333';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    dateLabels.forEach(label => {
      this.ctx.fillText(label.label, label.x, this.timeline.topMargin / 2);
    });
    
    // Bottom border
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.timeline.topMargin);
    this.ctx.lineTo(this.displayWidth, this.timeline.topMargin);
    this.ctx.stroke();
  }

  /**
   * Draw resource labels on Y-axis
   * @param {Array<string>} resources - Array of resource names
   */
  drawResources(resources) {
    const startY = this.timeline.topMargin;
    
    // Resource label background
    this.ctx.fillStyle = '#fafafa';
    this.ctx.fillRect(0, startY, this.timeline.leftMargin, this.displayHeight - startY);
    
    // Right border
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.timeline.leftMargin, startY);
    this.ctx.lineTo(this.timeline.leftMargin, this.displayHeight);
    this.ctx.stroke();
    
    // Resource labels
    this.ctx.font = 'bold 13px Arial';
    this.ctx.fillStyle = '#333333';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    
    resources.forEach((resource, index) => {
      const y = startY + (index * this.rowHeight) + (this.rowHeight / 2);
      const x = 10;
      
      // Store rect for interaction
      const rect = {
        x: 0,
        y: startY + (index * this.rowHeight),
        width: this.timeline.leftMargin,
        height: this.rowHeight
      };
      this.resourceRects.set(resource, rect);
      
      // Highlight if selected
      if (this.stateManager.isResourceSelected(resource)) {
        this.ctx.fillStyle = '#e3f2fd';
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.fillStyle = '#333333';
      }
      
      this.ctx.fillText(resource, x, y);
    });
  }

  /**
   * Draw current date indicator
   */
  drawCurrentDateIndicator() {
    const currentX = this.timeline.getCurrentDateX();
    
    if (currentX >= this.timeline.leftMargin && currentX <= this.displayWidth) {
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(currentX, this.timeline.topMargin);
      this.ctx.lineTo(currentX, this.displayHeight);
      this.ctx.stroke();
      
      this.ctx.setLineDash([]);
    }
  }

  /**
   * Draw job bars
   * @param {Array<Object>} jobs - Array of job objects
   * @param {Array<string>} resources - Array of resource names
   */
  drawJobs(jobs, resources) {
    // Draw non-dragging jobs first
    const draggedJobId = this.stateManager.dragState?.jobId;
    
    jobs.forEach(job => {
      if (job.id !== draggedJobId) {
        this.drawJob(job, resources);
      }
    });
    
    // Draw dragged job last (on top)
    if (draggedJobId) {
      const draggedJob = jobs.find(j => j.id === draggedJobId);
      if (draggedJob) {
        this.drawJob(draggedJob, resources);
      }
    }
  }

  /**
   * Draw a single job bar
   * @param {Object} job - Job object
   * @param {Array<string>} resources - Array of resource names
   */
  drawJob(job, resources) {
    const startX = this.timeline.dateToX(job.start);
    const endX = this.timeline.dateToX(job.end);
    const width = endX - startX;
    
    if (width < 1 || startX > this.displayWidth || endX < this.timeline.leftMargin) {
      return; // Job not visible
    }
    
    const y = this.timeline.topMargin + (job.y * this.rowHeight) + this.rowPadding;
    const height = this.barHeight;
    
    // Store rect for interaction
    const rect = { x: startX, y, width, height, job };
    this.jobRects.set(job.id, rect);
    
    // Determine if job is selected or being dragged
    const isSelected = this.stateManager.isJobSelected(job.id);
    const isDragging = this.stateManager.dragState?.jobId === job.id;
    
    // Draw job bar
    this.ctx.save();
    
    // Shadow for depth
    if (!isDragging) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetY = 2;
    }
    
    // Draw rounded rectangle
    this.ctx.fillStyle = job.color || '#4A90E2';
    if (isDragging) {
      this.ctx.globalAlpha = 0.5;
    }
    this.drawRoundedRect(startX, y, width, height, this.cornerRadius);
    this.ctx.fill();
    
    // Border for selected jobs
    if (isSelected) {
      this.ctx.strokeStyle = '#1976d2';
      this.ctx.lineWidth = 3;
      this.drawRoundedRect(startX, y, width, height, this.cornerRadius);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
    
    // Draw job text if there's enough space
    if (width > 40) {
      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      const textX = startX + 8;
      const textY = y + 6;
      const maxTextWidth = width - 16;
      
      // Job name
      const jobName = truncateText(job.name || job.id, maxTextWidth, '12px Arial');
      this.ctx.fillText(jobName, textX, textY);
      
      // Scope (if space available)
      if (height > 24 && job.scope) {
        this.ctx.font = '10px Arial';
        const scopeText = truncateText(job.scope, maxTextWidth, '10px Arial');
        this.ctx.fillText(scopeText, textX, textY + 16);
      }
      
      this.ctx.restore();
    }
  }

  /**
   * Draw rounded rectangle path
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   */
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Get job at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Job object or null
   */
  getJobAt(x, y) {
    for (const [jobId, rect] of this.jobRects) {
      if (x >= rect.x && x <= rect.x + rect.width &&
          y >= rect.y && y <= rect.y + rect.height) {
        return rect.job;
      }
    }
    return null;
  }

  /**
   * Get resource at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string|null} Resource name or null
   */
  getResourceAt(x, y) {
    for (const [resource, rect] of this.resourceRects) {
      if (x >= rect.x && x <= rect.x + rect.width &&
          y >= rect.y && y <= rect.y + rect.height) {
        return resource;
      }
    }
    return null;
  }

  /**
   * Get resource index from Y coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Resource index
   */
  getResourceIndexFromY(y) {
    const relativeY = y - this.timeline.topMargin;
    return Math.floor(relativeY / this.rowHeight);
  }
}
