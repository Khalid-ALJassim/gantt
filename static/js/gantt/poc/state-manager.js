/**
 * State management for the Gantt scheduler
 */

export class StateManager {
  constructor() {
    this.selectedJobs = new Set();
    this.selectedResources = new Set();
    this.dragState = null;
    this.hoverJob = null;
    this.hoverResource = null;
    this.listeners = new Map();
  }

  /**
   * Add a listener for state changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove a listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Select a job
   * @param {string} jobId - Job ID
   * @param {boolean} multiSelect - Whether to add to selection or replace
   */
  selectJob(jobId, multiSelect = false) {
    if (!multiSelect) {
      this.selectedJobs.clear();
    }
    this.selectedJobs.add(jobId);
    this.emit('selection-changed', {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Deselect a job
   * @param {string} jobId - Job ID
   */
  deselectJob(jobId) {
    this.selectedJobs.delete(jobId);
    this.emit('selection-changed', {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Toggle job selection
   * @param {string} jobId - Job ID
   * @param {boolean} multiSelect - Whether to add to selection or replace
   */
  toggleJobSelection(jobId, multiSelect = false) {
    if (this.selectedJobs.has(jobId)) {
      if (multiSelect) {
        this.deselectJob(jobId);
      } else {
        this.selectedJobs.clear();
        this.emit('selection-changed', {
          selectedJobs: [],
          selectedResources: Array.from(this.selectedResources)
        });
      }
    } else {
      this.selectJob(jobId, multiSelect);
    }
  }

  /**
   * Clear job selection
   */
  clearJobSelection() {
    this.selectedJobs.clear();
    this.emit('selection-changed', {
      selectedJobs: [],
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Select multiple jobs
   * @param {Array<string>} jobIds - Array of job IDs
   */
  selectJobs(jobIds) {
    this.selectedJobs.clear();
    jobIds.forEach(id => this.selectedJobs.add(id));
    this.emit('selection-changed', {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Check if a job is selected
   * @param {string} jobId - Job ID
   * @returns {boolean} True if selected
   */
  isJobSelected(jobId) {
    return this.selectedJobs.has(jobId);
  }

  /**
   * Select a resource
   * @param {string} resourceId - Resource ID
   */
  selectResource(resourceId) {
    this.selectedResources.add(resourceId);
    this.emit('selection-changed', {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Deselect a resource
   * @param {string} resourceId - Resource ID
   */
  deselectResource(resourceId) {
    this.selectedResources.delete(resourceId);
    this.emit('selection-changed', {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources)
    });
  }

  /**
   * Check if a resource is selected
   * @param {string} resourceId - Resource ID
   * @returns {boolean} True if selected
   */
  isResourceSelected(resourceId) {
    return this.selectedResources.has(resourceId);
  }

  /**
   * Start drag operation
   * @param {Object} dragData - Drag data
   */
  startDrag(dragData) {
    this.dragState = {
      ...dragData,
      startTime: Date.now()
    };
    this.emit('drag-start', this.dragState);
  }

  /**
   * Update drag operation
   * @param {Object} dragData - Updated drag data
   */
  updateDrag(dragData) {
    if (this.dragState) {
      this.dragState = { ...this.dragState, ...dragData };
      this.emit('drag-update', this.dragState);
    }
  }

  /**
   * End drag operation
   * @param {Object} dropData - Drop data
   */
  endDrag(dropData) {
    if (this.dragState) {
      const dragInfo = { ...this.dragState, ...dropData };
      this.dragState = null;
      this.emit('drag-end', dragInfo);
    }
  }

  /**
   * Cancel drag operation
   */
  cancelDrag() {
    if (this.dragState) {
      this.emit('drag-cancel', this.dragState);
      this.dragState = null;
    }
  }

  /**
   * Check if currently dragging
   * @returns {boolean} True if dragging
   */
  isDragging() {
    return this.dragState !== null;
  }

  /**
   * Set hover job
   * @param {string|null} jobId - Job ID or null
   */
  setHoverJob(jobId) {
    if (this.hoverJob !== jobId) {
      this.hoverJob = jobId;
      this.emit('hover-changed', { job: jobId, resource: this.hoverResource });
    }
  }

  /**
   * Set hover resource
   * @param {string|null} resourceId - Resource ID or null
   */
  setHoverResource(resourceId) {
    if (this.hoverResource !== resourceId) {
      this.hoverResource = resourceId;
      this.emit('hover-changed', { job: this.hoverJob, resource: resourceId });
    }
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {
      selectedJobs: Array.from(this.selectedJobs),
      selectedResources: Array.from(this.selectedResources),
      dragState: this.dragState,
      hoverJob: this.hoverJob,
      hoverResource: this.hoverResource
    };
  }

  /**
   * Reset all state
   */
  reset() {
    this.selectedJobs.clear();
    this.selectedResources.clear();
    this.dragState = null;
    this.hoverJob = null;
    this.hoverResource = null;
    this.emit('state-reset', null);
  }
}
