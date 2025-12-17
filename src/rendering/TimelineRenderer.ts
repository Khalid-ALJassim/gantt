import { TimelineConfig, TimelineScale } from '../models/Timeline.js';
import { createSVGElement } from '../utils/svgUtils.js';
import { addDays, formatDate } from '../utils/dateUtils.js';

/**
 * Renders the timeline (header with dates and grid)
 */
export class TimelineRenderer {
  private config: TimelineConfig;
  private startDate: Date;
  private endDate: Date;
  private pixelsPerDay: number;

  constructor(config: TimelineConfig, startDate: Date, endDate: Date) {
    this.config = config;
    this.startDate = startDate;
    this.endDate = endDate;
    this.pixelsPerDay = config.pixelsPerDay || 40;
  }

  /**
   * Render the timeline header
   */
  renderHeader(svg: SVGSVGElement, width: number, height: number): void {
    const headerGroup = createSVGElement('g', { class: 'timeline-header' });

    // Background
    const headerBg = createSVGElement('rect', {
      x: 0,
      y: 0,
      width,
      height,
      fill: '#f5f5f5',
      stroke: '#ddd',
      'stroke-width': 1,
    });
    headerGroup.appendChild(headerBg);

    // Render date labels based on scale
    this.renderDateLabels(headerGroup, height);

    svg.appendChild(headerGroup);
  }

  /**
   * Render date labels in the header
   */
  private renderDateLabels(group: SVGGElement, headerHeight: number): void {
    const currentDate = new Date(this.startDate);

    while (currentDate <= this.endDate) {
      const x = this.dateToX(currentDate);
      const label = this.formatLabel(currentDate);

      // Vertical grid line
      const line = createSVGElement('line', {
        x1: x,
        y1: 0,
        x2: x,
        y2: headerHeight,
        stroke: '#ddd',
        'stroke-width': 1,
      });
      group.appendChild(line);

      // Date label
      const text = createSVGElement('text', {
        x: x + 5,
        y: headerHeight / 2 + 5,
        fill: '#333',
        'font-size': 12,
        'font-family': 'Arial, sans-serif',
      });
      text.textContent = label;
      group.appendChild(text);

      // Move to next date based on scale
      currentDate.setDate(currentDate.getDate() + this.getScaleIncrement());
    }
  }

  /**
   * Render vertical grid lines
   */
  renderGrid(svg: SVGSVGElement, height: number, headerHeight: number): void {
    const gridGroup = createSVGElement('g', { class: 'grid' });
    const currentDate = new Date(this.startDate);

    while (currentDate <= this.endDate) {
      const x = this.dateToX(currentDate);

      const line = createSVGElement('line', {
        x1: x,
        y1: headerHeight,
        x2: x,
        y2: height,
        stroke: '#e0e0e0',
        'stroke-width': 1,
      });
      gridGroup.appendChild(line);

      currentDate.setDate(currentDate.getDate() + this.getScaleIncrement());
    }

    svg.appendChild(gridGroup);
  }

  /**
   * Convert a date to X coordinate
   */
  dateToX(date: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiff = (date.getTime() - this.startDate.getTime()) / msPerDay;
    return daysDiff * this.pixelsPerDay;
  }

  /**
   * Convert X coordinate to date
   */
  xToDate(x: number): Date {
    const days = x / this.pixelsPerDay;
    return addDays(this.startDate, Math.round(days));
  }

  /**
   * Format date label based on scale
   */
  private formatLabel(date: Date): string {
    switch (this.config.scale) {
      case TimelineScale.DAY:
        return formatDate(date);
      case TimelineScale.WEEK:
        return `Week ${this.getWeekNumber(date)}`;
      case TimelineScale.MONTH:
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return formatDate(date);
    }
  }

  /**
   * Get increment days based on scale
   */
  private getScaleIncrement(): number {
    switch (this.config.scale) {
      case TimelineScale.DAY:
        return 1;
      case TimelineScale.WEEK:
        return 7;
      case TimelineScale.MONTH:
        return 30;
      default:
        return 1;
    }
  }

  /**
   * Get week number of the year
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getPixelsPerDay(): number {
    return this.pixelsPerDay;
  }
}
