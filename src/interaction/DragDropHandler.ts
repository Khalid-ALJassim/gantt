import { TaskInternal } from '../models/Task';
import { TaskRenderer } from '../rendering/TaskRenderer';
import { TimelineRenderer } from '../rendering/TimelineRenderer';

/**
 * Handles drag and drop interactions for tasks
 */
export class DragDropHandler {
  private svg: SVGSVGElement;
  private taskRenderer: TaskRenderer;
  private timelineRenderer: TimelineRenderer;
  private tasks: TaskInternal[];
  private draggedTask: TaskInternal | null = null;
  private draggedElement: SVGGElement | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onTaskUpdate?: (task: TaskInternal) => void;

  constructor(
    svg: SVGSVGElement,
    taskRenderer: TaskRenderer,
    timelineRenderer: TimelineRenderer,
    tasks: TaskInternal[],
    onTaskUpdate?: (task: TaskInternal) => void
  ) {
    this.svg = svg;
    this.taskRenderer = taskRenderer;
    this.timelineRenderer = timelineRenderer;
    this.tasks = tasks;
    this.onTaskUpdate = onTaskUpdate;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners for drag and drop
   */
  private attachEventListeners(): void {
    this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    const target = event.target as SVGElement;
    const taskElement = target.closest('.task') as SVGGElement;

    if (taskElement) {
      const taskId = taskElement.getAttribute('data-task-id');
      const task = this.tasks.find((t) => t.id === taskId);

      if (task) {
        this.draggedTask = task;
        this.draggedElement = taskElement;

        const point = this.getSVGPoint(event);
        this.dragOffset.x = point.x - task.x;
        this.dragOffset.y = point.y - task.y;

        // Add dragging class
        taskElement.classList.add('dragging');
        event.preventDefault();
      }
    }
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.draggedTask || !this.draggedElement) {
      return;
    }

    const point = this.getSVGPoint(event);
    const newX = point.x - this.dragOffset.x;
    const newY = point.y - this.dragOffset.y;

    // Update task position
    this.taskRenderer.updateTaskPosition(this.draggedElement, newX, newY);

    event.preventDefault();
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.draggedTask || !this.draggedElement) {
      return;
    }

    // Remove dragging class
    this.draggedElement.classList.remove('dragging');

    // Calculate new dates based on position
    const rect = this.draggedElement.querySelector('.task-bar') as SVGRectElement;
    if (rect) {
      const newX = parseFloat(rect.getAttribute('x') || '0');
      const newStartDate = this.timelineRenderer.xToDate(newX);
      const duration = this.getDaysBetween(this.draggedTask.start, this.draggedTask.end);
      const newEndDate = this.addDays(newStartDate, duration);

      // Update task dates
      this.draggedTask.start = newStartDate;
      this.draggedTask.end = newEndDate;
      this.draggedTask.x = newX;

      // Trigger callback
      if (this.onTaskUpdate) {
        this.onTaskUpdate(this.draggedTask);
      }
    }

    this.draggedTask = null;
    this.draggedElement = null;

    event.preventDefault();
  }

  /**
   * Get SVG point from mouse event
   */
  private getSVGPoint(event: MouseEvent): { x: number; y: number } {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Calculate days between two dates
   */
  private getDaysBetween(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.svg.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.svg.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.svg.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.svg.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
  }
}
