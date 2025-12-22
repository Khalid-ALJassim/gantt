/**
 * Selection manager for Gantt chart
 * Handles job and resource selection state
 */

import { COLORS, DIMENSIONS } from './utils.js';

export class SelectionManager {
  constructor(chart, options = {}) {
    this.chart = chart;
    this.options = options;
    this.selectedJobs = new Set();
    this.selectedResources = new Set();
    this.aioId = options.aioId || 'main-gantt-chart';
    
    this.setupListeners();
  }

  /**
   * Setup event listeners for selection
   */
  setupListeners() {
    // Job click selection
    this.chart.on('click', (params) => {
      if (params.componentType === 'series') {
        this.handleJobClick(params);
      } else if (params.componentType === 'yAxis') {
        this.handleResourceClick(params);
      }
    });
  }

  /**
   * Handle job click
   * @param {Object} params - Click event parameters
   */
  handleJobClick(params) {
    if (!params.data || !params.data.id) return;
    
    const jobId = params.data.id;
    this.toggleJobSelection(jobId);
  }

  /**
   * Handle resource label click
   * @param {Object} params - Click event parameters
   */
  handleResourceClick(params) {
    const resourceIndex = params.value;
    if (resourceIndex === undefined) return;
    
    this.toggleResourceSelection(resourceIndex);
  }

  /**
   * Toggle job selection state
   * @param {string} jobId - Job ID
   */
  toggleJobSelection(jobId) {
    if (this.selectedJobs.has(jobId)) {
      this.selectedJobs.delete(jobId);
    } else {
      this.selectedJobs.add(jobId);
    }
    
    this.updateVisuals();
    this.syncToDash();
  }

  /**
   * Toggle resource selection (selects all future jobs on resource)
   * @param {number} resourceIndex - Resource index
   */
  toggleResourceSelection(resourceIndex) {
    const wasSelected = this.selectedResources.has(resourceIndex);
    const now = Date.now();
    
    // Get all jobs on this resource
    const jobs = this.getJobsOnResource(resourceIndex);
    const sortedJobs = jobs.sort((a, b) => a.value[1] - b.value[1]);
    
    if (wasSelected) {
      // Deselect all jobs on this resource
      this.selectedResources.delete(resourceIndex);
      sortedJobs.forEach(job => {
        this.selectedJobs.delete(job.id);
      });
    } else {
      // Select jobs after today+1
      this.selectedResources.add(resourceIndex);
      
      // Find the current job (job that spans today)
      const todayIdx = sortedJobs.findIndex(job => {
        const start = job.value[1];
        const end = job.value[2];
        return start <= now && end >= now;
      });
      
      // Skip current job and next job (today+1), select rest
      const skipCount = 2;
      const startIdx = todayIdx >= 0 
        ? Math.min(todayIdx + skipCount, sortedJobs.length)
        : 0;
      
      sortedJobs.slice(startIdx).forEach(job => {
        this.selectedJobs.add(job.id);
      });
    }
    
    this.updateVisuals();
    this.syncToDash();
  }

  /**
   * Get all jobs on a specific resource
   * @param {number} resourceIndex - Resource index
   * @returns {Array} Jobs on the resource
   */
  getJobsOnResource(resourceIndex) {
    const option = this.chart.getOption();
    const seriesData = option.series[0].data;
    
    return seriesData.filter(job => job.value[0] === resourceIndex);
  }

  /**
   * Set selected jobs from external source
   * @param {Array} jobIds - Array of job IDs to select
   */
  setSelectedJobs(jobIds) {
    this.selectedJobs = new Set(jobIds);
    this.updateVisuals();
  }

  /**
   * Set selected resources from external source
   * @param {Array} resourceIndices - Array of resource indices to select
   */
  setSelectedResources(resourceIndices) {
    this.selectedResources = new Set(resourceIndices);
    this.updateVisuals();
  }

  /**
   * Clear all selections
   */
  clearSelections() {
    this.selectedJobs.clear();
    this.selectedResources.clear();
    this.updateVisuals();
    this.syncToDash();
  }

  /**
   * Update chart visuals based on selection state
   */
  updateVisuals() {
    const option = this.chart.getOption();
    
    // Update series data with selection state
    option.series[0].data = option.series[0].data.map(job => ({
      ...job,
      selected: this.selectedJobs.has(job.id),
      borderColor: this.selectedJobs.has(job.id) 
        ? COLORS.SELECTION 
        : (job.original?.borderColor || COLORS.DEFAULT_BORDER),
      borderWidth: this.selectedJobs.has(job.id)
        ? DIMENSIONS.SELECTION_BORDER_WIDTH
        : DIMENSIONS.DEFAULT_BORDER_WIDTH
    }));
    
    // Update chart with animation disabled for smooth selection
    this.chart.setOption(option, {
      replaceMerge: ['series'],
      animation: false
    });
  }

  /**
   * Sync selection state to Dash stores
   */
  syncToDash() {
    if (typeof window.dash_clientside === 'undefined') return;
    
    try {
      // Sync selected jobs
      window.dash_clientside.set_props(`gantt-selected-job-store${this.aioId ? '-' + this.aioId : ''}`, {
        data: Array.from(this.selectedJobs)
      });
      
      // Sync selected resources
      window.dash_clientside.set_props(`gantt-selected-resource-store${this.aioId ? '-' + this.aioId : ''}`, {
        data: Array.from(this.selectedResources)
      });
    } catch (error) {
      console.warn('Failed to sync to Dash stores:', error);
    }
  }

  /**
   * Get current selection state
   * @returns {Object} Selection state
   */
  getSelectionState() {
    return {
      jobs: Array.from(this.selectedJobs),
      resources: Array.from(this.selectedResources)
    };
  }

  /**
   * Destroy selection manager and cleanup
   */
  destroy() {
    this.chart.off('click');
    this.selectedJobs.clear();
    this.selectedResources.clear();
  }
}
