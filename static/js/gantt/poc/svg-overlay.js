/**
 * SVG overlay for interactive elements
 */

export class SVGOverlay {
  /**
   * @param {HTMLElement} container - Container element
   * @param {number} width - Width
   * @param {number} height - Height
   */
  constructor(container, width, height) {
    this.container = container;
    this.svg = this.createSVGElement(width, height);
    this.elements = new Map();
  }

  /**
   * Create SVG element
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {SVGElement} SVG element
   */
  createSVGElement(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${width}px;
      height: ${height}px;
      pointer-events: none;
      z-index: 10;
    `;
    this.container.appendChild(svg);
    return svg;
  }

  /**
   * Clear all overlay elements
   */
  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.elements.clear();
  }

  /**
   * Draw selection highlight for a job
   * @param {string} jobId - Job ID
   * @param {Object} rect - Rectangle {x, y, width, height}
   */
  drawJobSelection(jobId, rect) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Highlight rectangle
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    highlight.setAttribute('x', rect.x);
    highlight.setAttribute('y', rect.y);
    highlight.setAttribute('width', rect.width);
    highlight.setAttribute('height', rect.height);
    highlight.setAttribute('fill', 'none');
    highlight.setAttribute('stroke', '#1976d2');
    highlight.setAttribute('stroke-width', '3');
    highlight.setAttribute('rx', '4');
    
    group.appendChild(highlight);
    this.svg.appendChild(group);
    this.elements.set(`job-${jobId}`, group);
  }

  /**
   * Draw drag ghost for a job
   * @param {Object} rect - Rectangle {x, y, width, height}
   * @param {string} color - Job color
   */
  drawDragGhost(rect, color) {
    const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ghost.setAttribute('x', rect.x);
    ghost.setAttribute('y', rect.y);
    ghost.setAttribute('width', rect.width);
    ghost.setAttribute('height', rect.height);
    ghost.setAttribute('fill', color || '#4A90E2');
    ghost.setAttribute('opacity', '0.3');
    ghost.setAttribute('rx', '4');
    ghost.setAttribute('stroke', '#1976d2');
    ghost.setAttribute('stroke-width', '2');
    ghost.setAttribute('stroke-dasharray', '5,5');
    
    this.svg.appendChild(ghost);
    this.elements.set('drag-ghost', ghost);
  }

  /**
   * Remove drag ghost
   */
  removeDragGhost() {
    const ghost = this.elements.get('drag-ghost');
    if (ghost && ghost.parentNode) {
      ghost.parentNode.removeChild(ghost);
      this.elements.delete('drag-ghost');
    }
  }

  /**
   * Draw drop target indicator
   * @param {number} y - Y coordinate
   * @param {number} width - Width of indicator
   */
  drawDropTarget(y, width) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', y);
    line.setAttribute('x2', width);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#4CAF50');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    
    this.svg.appendChild(line);
    this.elements.set('drop-target', line);
  }

  /**
   * Remove drop target indicator
   */
  removeDropTarget() {
    const target = this.elements.get('drop-target');
    if (target && target.parentNode) {
      target.parentNode.removeChild(target);
      this.elements.delete('drop-target');
    }
  }

  /**
   * Resize the overlay
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.svg.style.width = `${width}px`;
    this.svg.style.height = `${height}px`;
  }

  /**
   * Destroy the overlay
   */
  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}
