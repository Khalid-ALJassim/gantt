import { Task, TaskInternal } from '../models/Task.js';
import { createSVGElement } from '../utils/svgUtils.js';
import { TimelineRenderer } from './TimelineRenderer.js';

/**
 * Color configuration for task rendering
 */
interface TaskColors {
  taskBar?: string;
  taskBarHover?: string;
  taskBarSelected?: string;
  taskBarProgress?: string;
}

/**
 * Renders task bars
 */
export class TaskRenderer {
  private timelineRenderer: TimelineRenderer;
  private taskHeight: number;
  private taskPadding: number;
  private colors: {
    taskBar: string;
    taskBarHover: string;
    taskBarSelected: string;
    taskBarProgress: string;
  };

  constructor(
    timelineRenderer: TimelineRenderer,
    taskHeight: number = 30,
    taskPadding: number = 5,
    colors?: TaskColors
  ) {
    this.timelineRenderer = timelineRenderer;
    this.taskHeight = taskHeight;
    this.taskPadding = taskPadding;
    this.colors = {
      taskBar: colors?.taskBar || '#4CAF50',
      taskBarHover: colors?.taskBarHover || '#45a049',
      taskBarSelected: colors?.taskBarSelected || '#2196F3',
      taskBarProgress: colors?.taskBarProgress || '#81C784',
    };
  }

  /**
   * Convert tasks to internal format with positions
   */
  calculateTaskPositions(tasks: Task[], rowHeight: number, headerHeight: number): TaskInternal[] {
    return tasks.map((task, index) => {
      const x = this.timelineRenderer.dateToX(task.start);
      const endX = this.timelineRenderer.dateToX(task.end);
      const width = endX - x;
      const y = headerHeight + index * rowHeight + this.taskPadding;

      return {
        ...task,
        x,
        y,
        width,
        height: this.taskHeight,
      };
    });
  }

  /**
   * Render a single task bar
   */
  renderTask(task: TaskInternal): SVGGElement {
    const taskGroup = createSVGElement('g', {
      class: 'task',
      'data-task-id': task.id,
    });

    // Main task bar
    const rect = createSVGElement('rect', {
      x: task.x,
      y: task.y,
      width: task.width,
      height: task.height,
      fill: task.selected ? this.colors.taskBarSelected : (task.color || this.colors.taskBar),
      rx: 4,
      ry: 4,
      cursor: 'move',
      class: 'task-bar',
    });
    taskGroup.appendChild(rect);

    // Progress bar (if progress is defined)
    if (task.progress !== undefined && task.progress > 0) {
      const progressWidth = (task.width * task.progress) / 100;
      const progressRect = createSVGElement('rect', {
        x: task.x,
        y: task.y,
        width: progressWidth,
        height: task.height,
        fill: this.colors.taskBarProgress,
        rx: 4,
        ry: 4,
        'pointer-events': 'none',
        class: 'task-progress',
      });
      taskGroup.appendChild(progressRect);
    }

    // Task name label
    const text = createSVGElement('text', {
      x: task.x + 8,
      y: task.y + task.height / 2 + 5,
      fill: '#fff',
      'font-size': 12,
      'font-family': 'Arial, sans-serif',
      'pointer-events': 'none',
    });
    text.textContent = task.name;
    taskGroup.appendChild(text);

    return taskGroup;
  }

  /**
   * Render all tasks
   */
  renderTasks(svg: SVGSVGElement, tasks: TaskInternal[]): void {
    const tasksGroup = createSVGElement('g', { class: 'tasks' });

    tasks.forEach((task) => {
      const taskElement = this.renderTask(task);
      tasksGroup.appendChild(taskElement);
    });

    svg.appendChild(tasksGroup);
  }

  /**
   * Update task position (for drag and drop)
   */
  updateTaskPosition(taskElement: SVGGElement, x: number, y: number): void {
    const rect = taskElement.querySelector('.task-bar') as SVGRectElement;
    if (rect) {
      rect.setAttribute('x', String(x));
      rect.setAttribute('y', String(y));
    }

    const text = taskElement.querySelector('text') as SVGTextElement;
    if (text) {
      const currentY = parseFloat(rect.getAttribute('y') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');
      text.setAttribute('x', String(x + 8));
      text.setAttribute('y', String(currentY + height / 2 + 5));
    }

    const progressRect = taskElement.querySelector('.task-progress') as SVGRectElement;
    if (progressRect) {
      progressRect.setAttribute('x', String(x));
      progressRect.setAttribute('y', String(y));
    }
  }
}
