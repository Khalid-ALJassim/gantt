/**
 * Timeline scale units
 */
export enum TimelineScale {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * Timeline configuration
 */
export interface TimelineConfig {
  scale: TimelineScale;
  startDate?: Date;
  endDate?: Date;
  pixelsPerDay?: number;
}

/**
 * Represents a dependency/link between tasks
 */
export interface TaskDependency {
  fromTaskId: string;
  toTaskId: string;
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}
