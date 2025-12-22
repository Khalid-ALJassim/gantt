/**
 * Drag and drop handler for Gantt chart
 * Implements job dragging with auto-resequencing
 */

import { OPACITY } from './utils.js';
import { sortJobsByStartTime } from './data-transformer.js';

export class DragHandler {
  constructor(chart, options = {}) {
    this.chart = chart;
    this.options = options;
    this.dragging = null;
    this.dragStartPos = null;
    this.originalData = null;
    this.aioId = options.aioId || 'main-gantt-chart';
    this.enabled = options.editable !== false;
    
    if (this.enabled) {
      this.setupListeners();
    }
  }

  /**
   * Setup drag event listeners
   */
  setupListeners() {
    const zr = this.chart.getZr();
    
    zr.on('mousedown', this.handleMouseDown.bind(this));
    zr.on('mousemove', this.handleMouseMove.bind(this));
    zr.on('mouseup', this.handleMouseUp.bind(this));
    
    // Change cursor on hover
    zr.on('mousemove', (e) => {
      if (this.dragging) return;
      
      const pointInPixel = [e.offsetX, e.offsetY];
      const dataIndex = this.findJobAtPoint(pointInPixel);
      
      zr.setCursorStyle(dataIndex !== null ? 'move' : 'default');
    });
  }

  /**
   * Handle mouse down event
   * @param {Object} e - Mouse event
   */
  handleMouseDown(e) {
    if (!this.enabled) return;
    
    const pointInPixel = [e.offsetX, e.offsetY];
    const dataIndex = this.findJobAtPoint(pointInPixel);
    
    if (dataIndex !== null) {
      const option = this.chart.getOption();
      const job = option.series[0].data[dataIndex];
      
      this.dragging = {
        dataIndex: dataIndex,
        job: job,
        originalResource: job.value[0],
        originalStart: job.value[1],
        originalEnd: job.value[2]
      };
      
      this.dragStartPos = pointInPixel;
      this.originalData = JSON.parse(JSON.stringify(option.series[0].data));
      
      // Dim other jobs
      this.updateDragVisuals(true);
    }
  }

  /**
   * Handle mouse move event
   * @param {Object} e - Mouse event
   */
  handleMouseMove(e) {
    if (!this.dragging) return;
    
    const pointInPixel = [e.offsetX, e.offsetY];
    const deltaX = pointInPixel[0] - this.dragStartPos[0];
    const deltaY = pointInPixel[1] - this.dragStartPos[1];
    
    // Convert pixel delta to data delta
    const option = this.chart.getOption();
    const grid = this.chart.getModel().getComponent('grid');
    const xAxis = this.chart.getModel().getComponent('xAxis');
    const yAxis = this.chart.getModel().getComponent('yAxis');
    
    // Calculate time delta
    const xScale = xAxis.axis.scale;
    const xExtent = xScale.getExtent();
    const xPixelExtent = grid.coordinateSystem.getRect();
    const timePerPixel = (xExtent[1] - xExtent[0]) / xPixelExtent.width;
    const timeDelta = deltaX * timePerPixel;
    
    // Calculate resource delta
    const categories = yAxis.axis.scale.getOrdinalMeta().categories;
    const categoryHeight = xPixelExtent.height / categories.length;
    const resourceDelta = Math.round(deltaY / categoryHeight);
    
    // Update job position
    const newStart = this.dragging.originalStart + timeDelta;
    const newEnd = this.dragging.originalEnd + timeDelta;
    const duration = newEnd - newStart;
    let newResource = this.dragging.originalResource + resourceDelta;
    
    // Clamp resource to valid range
    newResource = Math.max(0, Math.min(newResource, categories.length - 1));
    
    // Update job data
    const updatedData = [...this.originalData];
    updatedData[this.dragging.dataIndex] = {
      ...this.dragging.job,
      value: [newResource, newStart, newEnd],
      dragging: true
    };
    
    // Update chart
    option.series[0].data = updatedData;
    this.chart.setOption(option, { animation: false });
  }

  /**
   * Handle mouse up event
   * @param {Object} e - Mouse event
   */
  handleMouseUp(e) {
    if (!this.dragging) return;
    
    const option = this.chart.getOption();
    const droppedJob = option.series[0].data[this.dragging.dataIndex];
    
    const targetResource = droppedJob.value[0];
    const newStart = droppedJob.value[1];
    const newEnd = droppedJob.value[2];
    
    // Perform auto-resequencing
    const resequencedData = this.resequenceJobs(
      this.originalData,
      droppedJob,
      targetResource,
      newStart,
      this.dragging.originalResource
    );
    
    // Update chart with resequenced data
    option.series[0].data = resequencedData;
    this.chart.setOption(option, { animation: true });
    
    // Reset drag visuals
    this.updateDragVisuals(false);
    
    // Trigger drop callback
    this.handleDrop({
      jobId: droppedJob.id,
      originalResource: this.dragging.originalResource,
      newResource: targetResource,
      originalStart: this.dragging.originalStart,
      originalEnd: this.dragging.originalEnd,
      newStart: newStart,
      newEnd: newEnd
    });
    
    this.dragging = null;
    this.dragStartPos = null;
    this.originalData = null;
  }

  /**
   * Find job at given point
   * @param {Array} point - Pixel coordinates [x, y]
   * @returns {number|null} Data index or null
   */
  findJobAtPoint(point) {
    const option = this.chart.getOption();
    const data = option.series[0].data;
    
    for (let i = 0; i < data.length; i++) {
      const job = data[i];
      const resourceIndex = job.value[0];
      const start = job.value[1];
      const end = job.value[2];
      
      // Convert to pixel coordinates
      const startPos = this.chart.convertToPixel({ seriesIndex: 0 }, [start, resourceIndex]);
      const endPos = this.chart.convertToPixel({ seriesIndex: 0 }, [end, resourceIndex]);
      
      if (!startPos || !endPos) continue;
      
      const grid = this.chart.getModel().getComponent('grid');
      const yAxis = this.chart.getModel().getComponent('yAxis');
      const categories = yAxis.axis.scale.getOrdinalMeta().categories;
      const categoryHeight = grid.coordinateSystem.getRect().height / categories.length;
      const barHeight = categoryHeight * 0.6;
      
      // Check if point is within bar bounds
      if (point[0] >= startPos[0] && point[0] <= endPos[0]) {
        const barTop = startPos[1] - barHeight / 2;
        const barBottom = startPos[1] + barHeight / 2;
        
        if (point[1] >= barTop && point[1] <= barBottom) {
          return i;
        }
      }
    }
    
    return null;
  }

  /**
   * Update visuals during drag
   * @param {boolean} isDragging - Whether currently dragging
   */
  updateDragVisuals(isDragging) {
    const option = this.chart.getOption();
    
    option.series[0].data = option.series[0].data.map((job, idx) => {
      if (isDragging && idx !== this.dragging.dataIndex) {
        return { ...job, opacity: OPACITY.DIMMED };
      } else {
        return { ...job, opacity: OPACITY.NORMAL, dragging: false };
      }
    });
    
    this.chart.setOption(option, { animation: false });
  }

  /**
   * Resequence jobs after drop
   * @param {Array} allJobs - All job data
   * @param {Object} movedJob - The job that was moved
   * @param {number} targetResource - Target resource index
   * @param {number} newStart - New start time
   * @param {number} originalResource - Original resource index
   * @returns {Array} Resequenced job data
   */
  resequenceJobs(allJobs, movedJob, targetResource, newStart, originalResource) {
    const result = allJobs.map(job => ({ ...job }));
    const movedJobIndex = result.findIndex(j => j.id === movedJob.id);
    
    // Update moved job
    const duration = movedJob.value[2] - movedJob.value[1];
    result[movedJobIndex].value = [targetResource, newStart, newStart + duration];
    
    // Resequence target resource
    const targetJobs = result
      .map((job, idx) => ({ job, idx }))
      .filter(({ job }) => job.value[0] === targetResource);
    
    targetJobs.sort((a, b) => a.job.value[1] - b.job.value[1]);
    
    // Make jobs consecutive (no gaps)
    let currentTime = targetJobs[0].job.value[1];
    targetJobs.forEach(({ job, idx }) => {
      const duration = job.value[2] - job.value[1];
      result[idx].value = [targetResource, currentTime, currentTime + duration];
      currentTime = currentTime + duration;
    });
    
    // If resource changed, resequence source resource
    if (targetResource !== originalResource) {
      const sourceJobs = result
        .map((job, idx) => ({ job, idx }))
        .filter(({ job }) => job.value[0] === originalResource);
      
      sourceJobs.sort((a, b) => a.job.value[1] - b.job.value[1]);
      
      if (sourceJobs.length > 0) {
        let currentTime = sourceJobs[0].job.value[1];
        sourceJobs.forEach(({ job, idx }) => {
          const duration = job.value[2] - job.value[1];
          result[idx].value = [originalResource, currentTime, currentTime + duration];
          currentTime = currentTime + duration;
        });
      }
    }
    
    return result;
  }

  /**
   * Handle drop completion
   * @param {Object} dropData - Drop event data
   */
  handleDrop(dropData) {
    if (typeof window.dash_clientside === 'undefined') return;
    
    try {
      window.dash_clientside.set_props(`drop-payload-store${this.aioId ? '-' + this.aioId : ''}`, {
        data: dropData
      });
    } catch (error) {
      console.warn('Failed to sync drop to Dash store:', error);
    }
  }

  /**
   * Enable or disable dragging
   * @param {boolean} enabled - Whether dragging is enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Destroy drag handler and cleanup
   */
  destroy() {
    const zr = this.chart.getZr();
    zr.off('mousedown');
    zr.off('mousemove');
    zr.off('mouseup');
  }
}
