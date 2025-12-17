import { TimelineConfig } from './Timeline.js';

/**
 * Configuration for the Gantt chart
 */
export interface GanttConfig {
  container: HTMLElement | string;
  timeline?: TimelineConfig;
  taskHeight?: number;
  taskPadding?: number;
  headerHeight?: number;
  rowHeight?: number;
  colors?: {
    taskBar?: string;
    taskBarHover?: string;
    taskBarSelected?: string;
    taskBarProgress?: string;
    grid?: string;
    dependency?: string;
  };
  enableDragDrop?: boolean;
  enableSelection?: boolean;
}
