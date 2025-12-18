/**
 * Main Gantt Scheduler class
 * Coordinates all subsystems and provides the public API
 */

import { Timeline } from './timeline.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { StateManager } from './state-manager.js';
import { DragDrop } from './drag-drop.js';
import { Selection } from './selection.js';
import { Tooltip } from './tooltip.js';
import { SVGOverlay } from './svg-overlay.js';
import { throttle } from './utils.js';

export class GanttScheduler {
  /**
   * @param {string|HTMLElement} container - Container element or selector
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    // Get container element
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    // Configuration
    this.options = {
      leftMargin: 120,
      topMargin: 60,
      rowHeight: 40,
      editing: true,
      ...options
    };
    
    // Data
    this.data = {
      jobs: [],
      resources: [],
      viewStart: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      viewEnd: Date.now() + (90 * 24 * 60 * 60 * 1000)    // 90 days ahead
    };
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the scheduler
   */
  init() {
    // Setup container
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display: block; cursor: default;';
    this.container.appendChild(this.canvas);
    
    // Get dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    // Initialize subsystems
    this.stateManager = new StateManager();
    
    this.timeline = new Timeline({
      viewStart: this.data.viewStart,
      viewEnd: this.data.viewEnd,
      width: this.width,
      height: this.height,
      leftMargin: this.options.leftMargin,
      topMargin: this.options.topMargin
    });
    
    this.renderer = new CanvasRenderer(this.canvas, this.timeline, this.stateManager);
    
    this.dragDrop = new DragDrop(
      this.renderer,
      this.timeline,
      this.stateManager,
      this.data
    );
    
    this.selection = new Selection(this.stateManager, this.data);
    
    this.tooltip = new Tooltip(this.container);
    
    this.svgOverlay = new SVGOverlay(this.container, this.width, this.height);
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup state listeners
    this.setupStateListeners();
    
    // Initial render
    this.render();
  }

  /**
   * Setup DOM event listeners
   */
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', throttle(this.onMouseMove.bind(this), 16)); // ~60fps
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    
    // Wheel event for zoom
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    // Window resize
    window.addEventListener('resize', throttle(this.onResize.bind(this), 250));
    
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  /**
   * Setup state change listeners
   */
  setupStateListeners() {
    this.stateManager.on('selection-changed', () => {
      this.render();
      this.notifySelectionChange();
    });
    
    this.stateManager.on('drag-start', () => {
      this.canvas.style.cursor = 'grabbing';
    });
    
    this.stateManager.on('drag-update', () => {
      this.render();
    });
    
    this.stateManager.on('drag-end', (dragInfo) => {
      this.canvas.style.cursor = 'default';
      this.render();
      this.notifyDrop(dragInfo);
    });
    
    this.stateManager.on('drag-cancel', () => {
      this.canvas.style.cursor = 'default';
      this.render();
    });
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check for resource click
    const resource = this.renderer.getResourceAt(x, y);
    if (resource) {
      this.selection.handleResourceClick(resource);
      return;
    }
    
    // Check for job click
    const job = this.renderer.getJobAt(x, y);
    if (job) {
      if (this.options.editing) {
        // Start drag
        this.dragDrop.onMouseDown(event, job);
      } else {
        // Just select
        this.selection.handleJobClick(job.id, event.ctrlKey || event.metaKey);
      }
      return;
    }
    
    // Click on empty space - clear selection
    if (!event.ctrlKey && !event.metaKey) {
      this.selection.clearSelection();
    }
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Handle drag
    if (this.dragDrop.isDraggingActive()) {
      this.dragDrop.onMouseMove(event);
      this.render();
      return;
    }
    
    // Handle hover for tooltip
    const job = this.renderer.getJobAt(x, y);
    if (job) {
      this.canvas.style.cursor = this.options.editing ? 'grab' : 'pointer';
      this.tooltip.show(job, x, y);
      this.stateManager.setHoverJob(job.id);
    } else {
      this.canvas.style.cursor = 'default';
      this.tooltip.hide();
      this.stateManager.setHoverJob(null);
    }
  }

  /**
   * Handle mouse up event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseUp(event) {
    if (this.dragDrop.isDraggingActive()) {
      this.dragDrop.onMouseUp(event);
    }
  }

  /**
   * Handle mouse leave event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseLeave(event) {
    this.tooltip.hide();
    if (this.dragDrop.isDraggingActive()) {
      this.dragDrop.cancelDrag();
      this.render();
    }
  }

  /**
   * Handle wheel event for zoom
   * @param {WheelEvent} event - Wheel event
   */
  onWheel(event) {
    event.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // Zoom in or out
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.timeline.zoom(zoomFactor, x);
    
    this.render();
  }

  /**
   * Handle window resize
   */
  onResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    this.renderer.resize(this.width, this.height);
    this.timeline.resize(this.width, this.height);
    this.svgOverlay.resize(this.width, this.height);
    
    this.render();
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyDown(event) {
    // Escape to cancel drag
    if (event.key === 'Escape' && this.dragDrop.isDraggingActive()) {
      this.dragDrop.cancelDrag();
      this.render();
    }
    
    // Ctrl+A to select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selection.selectAll();
    }
  }

  /**
   * Handle key up
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyUp(event) {
    // Placeholder for future features
  }

  /**
   * Render the chart
   */
  render() {
    this.renderer.render(this.data);
  }

  /**
   * Set data for the chart
   * @param {Object} data - Chart data {jobs, resources, viewStart, viewEnd}
   */
  setData(data) {
    this.data = {
      jobs: data.jobs || [],
      resources: data.resources || [],
      viewStart: data.viewStart || this.data.viewStart,
      viewEnd: data.viewEnd || this.data.viewEnd
    };
    
    // Update timeline
    this.timeline.setViewRange(this.data.viewStart, this.data.viewEnd);
    
    // Update subsystems
    this.dragDrop.updateData(this.data);
    this.selection.updateData(this.data);
    
    this.render();
  }

  /**
   * Zoom to a specific time range
   * @param {string} range - Range preset ('1w', '1m', '3m', 'all')
   */
  zoomTo(range) {
    const now = Date.now();
    let viewStart, viewEnd;
    
    switch (range) {
      case '1w':
        viewStart = now - (3 * 24 * 60 * 60 * 1000);
        viewEnd = now + (4 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        viewStart = now - (15 * 24 * 60 * 60 * 1000);
        viewEnd = now + (15 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        viewStart = now - (45 * 24 * 60 * 60 * 1000);
        viewEnd = now + (45 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        if (this.data.jobs.length > 0) {
          const allStarts = this.data.jobs.map(j => j.start);
          const allEnds = this.data.jobs.map(j => j.end);
          viewStart = Math.min(...allStarts);
          viewEnd = Math.max(...allEnds);
          
          // Add 10% padding
          const padding = (viewEnd - viewStart) * 0.1;
          viewStart -= padding;
          viewEnd += padding;
        } else {
          viewStart = now - (90 * 24 * 60 * 60 * 1000);
          viewEnd = now + (90 * 24 * 60 * 60 * 1000);
        }
        break;
      default:
        return;
    }
    
    this.timeline.setViewRange(viewStart, viewEnd);
    this.render();
  }

  /**
   * Notify external systems of selection change
   */
  notifySelectionChange() {
    const state = this.stateManager.getState();
    
    // For Dash integration
    if (window.dash_clientside) {
      if (window.dash_clientside.set_props) {
        window.dash_clientside.set_props('gantt-selected-job-store', {
          data: state.selectedJobs
        });
      }
    }
    
    // Custom event
    const event = new CustomEvent('gantt-selection-changed', {
      detail: state.selectedJobs
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Notify external systems of drop event
   * @param {Object} dragInfo - Drag information
   */
  notifyDrop(dragInfo) {
    const job = this.data.jobs.find(j => j.id === dragInfo.jobId);
    
    const payload = {
      jobId: dragInfo.jobId,
      sourceResource: dragInfo.sourceResource,
      targetResource: dragInfo.targetResource,
      newStart: dragInfo.finalStart,
      newEnd: dragInfo.finalEnd,
      job: job
    };
    
    // For Dash integration
    if (window.dash_clientside) {
      if (window.dash_clientside.set_props) {
        window.dash_clientside.set_props('drop-payload-store', {
          data: payload
        });
      }
    }
    
    // Custom event
    const event = new CustomEvent('gantt-job-dropped', {
      detail: payload
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Get selected jobs
   * @returns {Array<string>} Selected job IDs
   */
  getSelectedJobs() {
    return this.stateManager.getState().selectedJobs;
  }

  /**
   * Destroy the scheduler
   */
  destroy() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    
    // Destroy subsystems
    this.tooltip.destroy();
    this.svgOverlay.destroy();
    
    // Clear container
    this.container.innerHTML = '';
  }
}
