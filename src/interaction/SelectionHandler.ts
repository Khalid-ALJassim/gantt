import { TaskInternal } from '../models/Task';

/**
 * Handles task selection interactions
 */
export class SelectionHandler {
  private svg: SVGSVGElement;
  private tasks: TaskInternal[];
  private selectedTask: TaskInternal | null = null;
  private onTaskSelect?: (task: TaskInternal | null) => void;

  constructor(
    svg: SVGSVGElement,
    tasks: TaskInternal[],
    onTaskSelect?: (task: TaskInternal | null) => void
  ) {
    this.svg = svg;
    this.tasks = tasks;
    this.onTaskSelect = onTaskSelect;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners for selection
   */
  private attachEventListeners(): void {
    this.svg.addEventListener('click', this.handleClick.bind(this));
  }

  /**
   * Handle click event
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as SVGElement;
    const taskElement = target.closest('.task') as SVGGElement;

    if (taskElement) {
      const taskId = taskElement.getAttribute('data-task-id');
      const task = this.tasks.find((t) => t.id === taskId);

      if (task) {
        // Deselect previous task
        if (this.selectedTask && this.selectedTask !== task) {
          this.selectedTask.selected = false;
          this.updateTaskAppearance(this.selectedTask.id, false);
        }

        // Toggle selection
        task.selected = !task.selected;
        this.selectedTask = task.selected ? task : null;
        this.updateTaskAppearance(task.id, task.selected);

        // Trigger callback
        if (this.onTaskSelect) {
          this.onTaskSelect(this.selectedTask);
        }
      }
    } else {
      // Clicked outside tasks, deselect
      if (this.selectedTask) {
        this.selectedTask.selected = false;
        this.updateTaskAppearance(this.selectedTask.id, false);
        this.selectedTask = null;

        if (this.onTaskSelect) {
          this.onTaskSelect(null);
        }
      }
    }
  }

  /**
   * Update task appearance based on selection
   */
  private updateTaskAppearance(taskId: string, selected: boolean): void {
    const taskElement = this.svg.querySelector(`[data-task-id="${taskId}"]`) as SVGGElement;
    if (taskElement) {
      const rect = taskElement.querySelector('.task-bar') as SVGRectElement;
      if (rect) {
        if (selected) {
          rect.setAttribute('fill', '#2196F3');
          rect.setAttribute('stroke', '#1976D2');
          rect.setAttribute('stroke-width', '2');
        } else {
          rect.setAttribute('fill', rect.getAttribute('data-original-fill') || '#4CAF50');
          rect.removeAttribute('stroke');
          rect.removeAttribute('stroke-width');
        }
      }
    }
  }

  /**
   * Get currently selected task
   */
  getSelectedTask(): TaskInternal | null {
    return this.selectedTask;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.svg.removeEventListener('click', this.handleClick.bind(this));
  }
}
