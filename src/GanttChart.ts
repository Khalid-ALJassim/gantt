import { GanttConfig } from './models/GanttConfig';
import { Task, TaskInternal } from './models/Task';
import { TaskDependency, TimelineScale } from './models/Timeline';
import { TimelineRenderer } from './rendering/TimelineRenderer';
import { TaskRenderer } from './rendering/TaskRenderer';
import { DependencyRenderer } from './rendering/DependencyRenderer';
import { DragDropHandler } from './interaction/DragDropHandler';
import { SelectionHandler } from './interaction/SelectionHandler';
import { createSVGElement, clearElement } from './utils/svgUtils';
import { daysBetween } from './utils/dateUtils';

/**
 * Main Gantt Chart class
 */
export class GanttChart {
  private config: GanttConfig;
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private tasks: TaskInternal[] = [];
  private dependencies: TaskDependency[] = [];
  private timelineRenderer: TimelineRenderer;
  private taskRenderer: TaskRenderer;
  private dependencyRenderer: DependencyRenderer;
  private dragDropHandler?: DragDropHandler;
  private selectionHandler?: SelectionHandler;

  // Default configuration values
  private readonly DEFAULT_TASK_HEIGHT = 30;
  private readonly DEFAULT_TASK_PADDING = 5;
  private readonly DEFAULT_HEADER_HEIGHT = 60;
  private readonly DEFAULT_ROW_HEIGHT = 50;

  constructor(config: GanttConfig) {
    this.config = config;
    this.container = this.getContainer(config.container);
    this.svg = this.createSVG();
    
    // Initialize renderers (will be fully set up in render())
    const defaultTimeline = {
      scale: TimelineScale.DAY,
      pixelsPerDay: 40,
    };
    
    this.timelineRenderer = new TimelineRenderer(
      config.timeline || defaultTimeline,
      new Date(),
      new Date()
    );
    
    this.taskRenderer = new TaskRenderer(
      this.timelineRenderer,
      config.taskHeight || this.DEFAULT_TASK_HEIGHT,
      config.taskPadding || this.DEFAULT_TASK_PADDING,
      config.colors
    );
    
    this.dependencyRenderer = new DependencyRenderer(
      config.colors?.dependency
    );
  }

  /**
   * Get container element
   */
  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  /**
   * Create SVG element
   */
  private createSVG(): SVGSVGElement {
    const svg = createSVGElement('svg', {
      class: 'gantt-chart',
      width: '100%',
      height: '100%',
    });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .gantt-chart {
        font-family: Arial, sans-serif;
        user-select: none;
      }
      .task-bar {
        transition: fill 0.2s ease;
      }
      .task-bar:hover {
        opacity: 0.9;
      }
      .task.dragging .task-bar {
        opacity: 0.7;
      }
    `;
    this.container.appendChild(style);
    this.container.appendChild(svg);

    return svg;
  }

  /**
   * Load tasks into the Gantt chart
   */
  setTasks(tasks: Task[]): void {
    this.tasks = tasks as TaskInternal[];
    this.render();
  }

  /**
   * Set dependencies between tasks
   */
  setDependencies(dependencies: TaskDependency[]): void {
    this.dependencies = dependencies;
    this.render();
  }

  /**
   * Calculate chart dimensions based on tasks
   */
  private calculateDimensions(): {
    startDate: Date;
    endDate: Date;
    width: number;
    height: number;
  } {
    if (this.tasks.length === 0) {
      const now = new Date();
      return {
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        width: 1200,
        height: 400,
      };
    }

    // Find min and max dates
    let startDate = this.tasks[0].start;
    let endDate = this.tasks[0].end;

    this.tasks.forEach((task) => {
      if (task.start < startDate) startDate = task.start;
      if (task.end > endDate) endDate = task.end;
    });

    // Add padding
    startDate = new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    endDate = new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    const days = daysBetween(startDate, endDate);
    const pixelsPerDay = this.config.timeline?.pixelsPerDay || 40;
    const width = days * pixelsPerDay;
    
    const rowHeight = this.config.rowHeight || this.DEFAULT_ROW_HEIGHT;
    const headerHeight = this.config.headerHeight || this.DEFAULT_HEADER_HEIGHT;
    const height = headerHeight + this.tasks.length * rowHeight + 50;

    return { startDate, endDate, width, height };
  }

  /**
   * Render the Gantt chart
   */
  render(): void {
    // Clear existing content
    clearElement(this.svg);

    if (this.tasks.length === 0) {
      return;
    }

    // Calculate dimensions
    const { startDate, endDate, width, height } = this.calculateDimensions();

    // Update SVG dimensions
    this.svg.setAttribute('width', String(width));
    this.svg.setAttribute('height', String(height));
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Reinitialize timeline renderer with correct dates
    const timelineConfig = this.config.timeline || {
      scale: TimelineScale.DAY,
      pixelsPerDay: 40,
    };
    
    this.timelineRenderer = new TimelineRenderer(
      timelineConfig,
      startDate,
      endDate
    );

    // Reinitialize task renderer
    this.taskRenderer = new TaskRenderer(
      this.timelineRenderer,
      this.config.taskHeight || this.DEFAULT_TASK_HEIGHT,
      this.config.taskPadding || this.DEFAULT_TASK_PADDING,
      this.config.colors
    );

    const headerHeight = this.config.headerHeight || this.DEFAULT_HEADER_HEIGHT;
    const rowHeight = this.config.rowHeight || this.DEFAULT_ROW_HEIGHT;

    // Render components
    this.timelineRenderer.renderHeader(this.svg, width, headerHeight);
    this.timelineRenderer.renderGrid(this.svg, height, headerHeight);

    // Create arrowhead marker for dependencies
    this.dependencyRenderer.createArrowheadMarker(this.svg);

    // Calculate task positions
    this.tasks = this.taskRenderer.calculateTaskPositions(
      this.tasks,
      rowHeight,
      headerHeight
    );

    // Render dependencies (before tasks so they appear behind)
    if (this.dependencies.length > 0) {
      this.dependencyRenderer.renderDependencies(
        this.svg,
        this.dependencies,
        this.tasks
      );
    }

    // Render tasks
    this.taskRenderer.renderTasks(this.svg, this.tasks);

    // Set up interactions
    if (this.config.enableDragDrop !== false) {
      this.dragDropHandler = new DragDropHandler(
        this.svg,
        this.taskRenderer,
        this.timelineRenderer,
        this.tasks,
        (task) => this.handleTaskUpdate(task)
      );
    }

    if (this.config.enableSelection !== false) {
      this.selectionHandler = new SelectionHandler(
        this.svg,
        this.tasks,
        (task) => this.handleTaskSelect(task)
      );
    }
  }

  /**
   * Handle task update (e.g., after drag)
   */
  private handleTaskUpdate(task: TaskInternal): void {
    console.log('Task updated:', task);
    // Re-render to update dependencies if needed
    this.render();
  }

  /**
   * Handle task selection
   */
  private handleTaskSelect(task: TaskInternal | null): void {
    console.log('Task selected:', task);
  }

  /**
   * Get all tasks
   */
  getTasks(): TaskInternal[] {
    return this.tasks;
  }

  /**
   * Get task by ID
   */
  getTask(id: string): TaskInternal | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Update a task
   */
  updateTask(id: string, updates: Partial<Task>): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, updates);
      this.render();
    }
  }

  /**
   * Destroy the Gantt chart and clean up
   */
  destroy(): void {
    if (this.dragDropHandler) {
      this.dragDropHandler.destroy();
    }
    if (this.selectionHandler) {
      this.selectionHandler.destroy();
    }
    clearElement(this.container);
  }
}
