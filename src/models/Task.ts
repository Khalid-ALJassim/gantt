/**
 * Represents a task in the Gantt chart
 */
export interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number; // 0-100
  dependencies?: string[]; // IDs of tasks this task depends on
  color?: string;
  description?: string;
}

/**
 * Internal task model with additional rendering properties
 */
export interface TaskInternal extends Task {
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
}
