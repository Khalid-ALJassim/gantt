/**
 * Drag and drop system for job bars
 */

export class DragDrop {
  /**
   * @param {CanvasRenderer} renderer - Canvas renderer instance
   * @param {Timeline} timeline - Timeline instance
   * @param {StateManager} stateManager - State manager instance
   * @param {Object} data - Chart data {jobs, resources}
   */
  constructor(renderer, timeline, stateManager, data) {
    this.renderer = renderer;
    this.timeline = timeline;
    this.stateManager = stateManager;
    this.data = data;
    
    this.isDragging = false;
    this.draggedJob = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.originalJobData = null;
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} event - Mouse event
   * @param {Object} job - Job object being clicked
   */
  onMouseDown(event, job) {
    if (!job) return;
    
    this.isDragging = true;
    this.draggedJob = job;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    
    // Store original job data
    this.originalJobData = {
      start: job.start,
      end: job.end,
      y: job.y,
      duration: job.end - job.start
    };
    
    this.stateManager.startDrag({
      jobId: job.id,
      originalY: job.y,
      originalStart: job.start,
      originalEnd: job.end
    });
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseMove(event) {
    if (!this.isDragging || !this.draggedJob) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    // Calculate new start and end times
    const deltaTime = deltaX * this.timeline.msPerPixel;
    const newStart = this.originalJobData.start + deltaTime;
    const newEnd = newStart + this.originalJobData.duration;
    
    // Calculate new resource index
    const rect = this.renderer.canvas.getBoundingClientRect();
    const canvasY = event.clientY - rect.top;
    const newY = this.renderer.getResourceIndexFromY(canvasY);
    const clampedY = Math.max(0, Math.min(newY, this.data.resources.length - 1));
    
    // Update job position (temporarily)
    this.draggedJob.start = newStart;
    this.draggedJob.end = newEnd;
    this.draggedJob.y = clampedY;
    
    this.stateManager.updateDrag({
      currentY: clampedY,
      currentStart: newStart,
      currentEnd: newEnd,
      deltaX,
      deltaY
    });
  }

  /**
   * Handle mouse up event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseUp(event) {
    if (!this.isDragging || !this.draggedJob) return;
    
    const sourceResource = this.originalJobData.y;
    const targetResource = this.draggedJob.y;
    
    // Resequence jobs on target resource
    this.resequenceResource(targetResource);
    
    // If resource changed, resequence source resource too
    if (sourceResource !== targetResource) {
      this.resequenceResource(sourceResource);
    }
    
    // Emit drop event
    this.stateManager.endDrag({
      finalY: this.draggedJob.y,
      finalStart: this.draggedJob.start,
      finalEnd: this.draggedJob.end,
      sourceResource: this.data.resources[sourceResource],
      targetResource: this.data.resources[targetResource]
    });
    
    this.isDragging = false;
    this.draggedJob = null;
    this.originalJobData = null;
  }

  /**
   * Cancel drag operation
   */
  cancelDrag() {
    if (this.isDragging && this.draggedJob && this.originalJobData) {
      // Restore original position
      this.draggedJob.start = this.originalJobData.start;
      this.draggedJob.end = this.originalJobData.end;
      this.draggedJob.y = this.originalJobData.y;
      
      this.stateManager.cancelDrag();
      this.isDragging = false;
      this.draggedJob = null;
      this.originalJobData = null;
    }
  }

  /**
   * Resequence all jobs on a resource to be consecutive with no gaps
   * @param {number} resourceIndex - Resource index
   */
  resequenceResource(resourceIndex) {
    // Get all jobs on this resource
    const resourceJobs = this.data.jobs
      .filter(job => job.y === resourceIndex)
      .sort((a, b) => a.start - b.start);
    
    if (resourceJobs.length === 0) return;
    
    // Resequence jobs to be consecutive
    let currentTime = resourceJobs[0].start;
    
    resourceJobs.forEach(job => {
      const duration = job.end - job.start;
      job.start = currentTime;
      job.end = currentTime + duration;
      currentTime = job.end;
    });
  }

  /**
   * Update data reference
   * @param {Object} data - New chart data
   */
  updateData(data) {
    this.data = data;
  }

  /**
   * Check if currently dragging
   * @returns {boolean} True if dragging
   */
  isDraggingActive() {
    return this.isDragging;
  }
}
