import { TaskDependency } from '../models/Timeline.js';
import { TaskInternal } from '../models/Task.js';
import { createSVGElement } from '../utils/svgUtils.js';

/**
 * Renders dependency arrows between tasks
 */
export class DependencyRenderer {
  private color: string;

  constructor(color: string = '#666') {
    this.color = color;
  }

  /**
   * Render all dependencies
   */
  renderDependencies(
    svg: SVGSVGElement,
    dependencies: TaskDependency[],
    tasks: TaskInternal[]
  ): void {
    const depsGroup = createSVGElement('g', { class: 'dependencies' });

    dependencies.forEach((dep) => {
      const fromTask = tasks.find((t) => t.id === dep.fromTaskId);
      const toTask = tasks.find((t) => t.id === dep.toTaskId);

      if (fromTask && toTask) {
        const arrow = this.createDependencyArrow(fromTask, toTask);
        depsGroup.appendChild(arrow);
      }
    });

    // Insert dependencies before tasks so they render behind
    const tasksGroup = svg.querySelector('.tasks');
    if (tasksGroup) {
      svg.insertBefore(depsGroup, tasksGroup);
    } else {
      svg.appendChild(depsGroup);
    }
  }

  /**
   * Create a dependency arrow between two tasks
   */
  private createDependencyArrow(from: TaskInternal, to: TaskInternal): SVGGElement {
    const arrowGroup = createSVGElement('g', { class: 'dependency' });

    // Calculate connection points (finish-to-start by default)
    const fromX = from.x + from.width;
    const fromY = from.y + from.height / 2;
    const toX = to.x;
    const toY = to.y + to.height / 2;

    // Create path
    const path = this.createArrowPath(fromX, fromY, toX, toY);
    const pathElement = createSVGElement('path', {
      d: path,
      stroke: this.color,
      'stroke-width': 2,
      fill: 'none',
      'marker-end': 'url(#arrowhead)',
    });

    arrowGroup.appendChild(pathElement);

    return arrowGroup;
  }

  /**
   * Create SVG path for dependency arrow
   */
  private createArrowPath(x1: number, y1: number, x2: number, y2: number): string {
    const midX = (x1 + x2) / 2;

    // Create a path with horizontal and vertical segments
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  /**
   * Create arrowhead marker definition
   */
  createArrowheadMarker(svg: SVGSVGElement): void {
    const defs = createSVGElement('defs', {});
    const marker = createSVGElement('marker', {
      id: 'arrowhead',
      markerWidth: 10,
      markerHeight: 10,
      refX: 9,
      refY: 3,
      orient: 'auto',
    });

    const polygon = createSVGElement('polygon', {
      points: '0 0, 10 3, 0 6',
      fill: this.color,
    });

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }
}
