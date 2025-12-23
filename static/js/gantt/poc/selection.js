/**
 * Selection system for jobs and resources
 */

export class Selection {
  /**
   * @param {StateManager} stateManager - State manager instance
   * @param {Object} data - Chart data {jobs, resources}
   */
  constructor(stateManager, data) {
    this.stateManager = stateManager;
    this.data = data;
  }

  /**
   * Handle job click
   * @param {string} jobId - Job ID
   * @param {boolean} ctrlKey - Whether Ctrl/Cmd key is pressed
   */
  handleJobClick(jobId, ctrlKey) {
    this.stateManager.toggleJobSelection(jobId, ctrlKey);
  }

  /**
   * Handle resource click
   * @param {string} resourceId - Resource ID
   */
  handleResourceClick(resourceId) {
    // Get all jobs on this resource
    const resourceJobs = this.data.jobs
      .filter(job => this.data.resources[job.y] === resourceId)
      .sort((a, b) => a.start - b.start);
    
    if (resourceJobs.length === 0) return;
    
    // Find the job containing current date (or the first upcoming job)
    const now = Date.now();
    let currentJobIndex = resourceJobs.findIndex(job => job.start <= now && job.end >= now);
    
    if (currentJobIndex === -1) {
      // No current job, find first future job
      currentJobIndex = resourceJobs.findIndex(job => job.start > now);
      if (currentJobIndex === -1) {
        // All jobs are in the past, select none
        return;
      }
    }
    
    // Skip the current job + 1 more, select all remaining
    const jobsToSelect = resourceJobs.slice(currentJobIndex + 2);
    
    if (jobsToSelect.length > 0) {
      const jobIds = jobsToSelect.map(job => job.id);
      this.stateManager.selectJobs(jobIds);
    }
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.stateManager.clearJobSelection();
  }

  /**
   * Select all jobs
   */
  selectAll() {
    const jobIds = this.data.jobs.map(job => job.id);
    this.stateManager.selectJobs(jobIds);
  }

  /**
   * Update data reference
   * @param {Object} data - New chart data
   */
  updateData(data) {
    this.data = data;
  }
}
