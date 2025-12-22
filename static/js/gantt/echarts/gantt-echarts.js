/**
 * Main ECharts Gantt wrapper class
 */

import { formatDate, COLORS, DIMENSIONS } from './utils.js';
import { 
  transformJobData, 
  transformResourceData, 
  calculateViewRange 
} from './data-transformer.js';
import { createTooltipConfig } from './tooltip-formatter.js';
import { renderJobBar, createCustomSeriesConfig } from './custom-series.js';
import { SelectionManager } from './selection-manager.js';
import { DragHandler } from './drag-handler.js';

export class GanttECharts {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    
    // Initialize ECharts instance
    this.chart = echarts.init(container);
    
    // Transform data
    this.resources = transformResourceData(options.resources || []);
    this.jobs = transformJobData(
      options.jobs || [], 
      this.resources,
      {
        secondLine: options.secondLine,
        thirdLine: options.thirdLine
      }
    );
    
    // Calculate view range
    const viewRange = calculateViewRange(this.jobs, {
      start: options.viewStart,
      end: options.viewEnd
    });
    this.viewStart = viewRange.start;
    this.viewEnd = viewRange.end;
    
    // Initialize managers
    this.selectionManager = new SelectionManager(this.chart, {
      aioId: options.aioId
    });
    
    this.dragHandler = new DragHandler(this.chart, {
      editable: options.editable,
      aioId: options.aioId
    });
    
    // Render chart
    this.render();
    
    // Handle window resize
    this.resizeHandler = () => this.chart.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Render the Gantt chart
   */
  render() {
    const option = {
      // Grid configuration
      grid: {
        left: 150,
        right: 50,
        top: 100,
        bottom: 80,
        containLabel: true
      },
      
      // X-axis (timeline)
      xAxis: {
        type: 'time',
        min: this.viewStart,
        max: this.viewEnd,
        axisLabel: {
          formatter: (value) => formatDate(value, 'short'),
          fontSize: 11,
          color: COLORS.TEXT
        },
        axisLine: {
          lineStyle: {
            color: COLORS.DEFAULT_BORDER
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: COLORS.GRID_LINE,
            type: 'dashed'
          }
        }
      },
      
      // Y-axis (resources)
      yAxis: {
        type: 'category',
        data: this.resources,
        axisLabel: {
          fontSize: 12,
          color: COLORS.TEXT,
          fontWeight: 500,
          interval: 0
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: COLORS.DEFAULT_BORDER
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: COLORS.GRID_LINE
          }
        },
        // Make resource labels clickable
        triggerEvent: true
      },
      
      // Custom series for Gantt bars
      series: [
        createCustomSeriesConfig(this.jobs, renderJobBar)
      ],
      
      // Tooltip configuration
      tooltip: createTooltipConfig(),
      
      // DataZoom for pan and zoom
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          height: 30,
          bottom: 20,
          borderColor: COLORS.DEFAULT_BORDER,
          fillerColor: 'rgba(52, 152, 219, 0.2)',
          handleStyle: {
            color: '#3498db'
          },
          dataBackground: {
            lineStyle: {
              color: '#3498db',
              opacity: 0.5
            },
            areaStyle: {
              color: '#3498db',
              opacity: 0.2
            }
          }
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          zoomOnMouseWheel: true,
          moveOnMouseMove: 'shift',
          preventDefaultMouseMove: false
        }
      ],
      
      // Toolbox for export and controls
      toolbox: {
        right: 20,
        top: 10,
        feature: {
          saveAsImage: {
            type: 'png',
            name: 'gantt_schedule_' + new Date().toISOString().slice(0, 10),
            title: 'Save as PNG',
            pixelRatio: 2
          },
          dataZoom: {
            yAxisIndex: false,
            title: {
              zoom: 'Zoom',
              back: 'Reset Zoom'
            }
          },
          restore: {
            title: 'Restore'
          }
        }
      },
      
      // Add current date line
      graphic: this.createCurrentDateLine()
    };
    
    this.chart.setOption(option);
  }

  /**
   * Create current date indicator line
   * @returns {Array} Graphic elements
   */
  createCurrentDateLine() {
    const now = Date.now();
    
    // Only show if current date is within view range
    if (now < this.viewStart || now > this.viewEnd) {
      return [];
    }
    
    return [
      {
        type: 'line',
        z: 100,
        left: 150,
        right: 50,
        top: 100,
        bottom: 80,
        shape: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        style: {
          stroke: COLORS.CURRENT_DATE_LINE,
          lineWidth: 2
        },
        // Position will be calculated dynamically
        invisible: false,
        $action: 'merge',
        // Use transform to position at current date
        position: this.calculateCurrentDatePosition(now)
      }
    ];
  }

  /**
   * Calculate position for current date line
   * @param {number} timestamp - Current timestamp
   * @returns {Array} Position [x, y]
   */
  calculateCurrentDatePosition(timestamp) {
    try {
      const pos = this.chart.convertToPixel({ xAxisIndex: 0 }, timestamp);
      return [pos, 0];
    } catch (e) {
      return [0, 0];
    }
  }

  /**
   * Update chart with new data
   * @param {Object} newOptions - New options
   */
  update(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Transform new data
    this.resources = transformResourceData(newOptions.resources || this.resources);
    this.jobs = transformJobData(
      newOptions.jobs || this.jobs,
      this.resources,
      {
        secondLine: newOptions.secondLine || this.options.secondLine,
        thirdLine: newOptions.thirdLine || this.options.thirdLine
      }
    );
    
    // Update view range if provided
    if (newOptions.viewStart || newOptions.viewEnd) {
      const viewRange = calculateViewRange(this.jobs, {
        start: newOptions.viewStart,
        end: newOptions.viewEnd
      });
      this.viewStart = viewRange.start;
      this.viewEnd = viewRange.end;
    }
    
    // Update chart
    const option = this.chart.getOption();
    option.yAxis[0].data = this.resources;
    option.series[0].data = this.jobs;
    option.xAxis[0].min = this.viewStart;
    option.xAxis[0].max = this.viewEnd;
    
    this.chart.setOption(option, { replaceMerge: ['series'] });
  }

  /**
   * Set zoom level
   * @param {string} level - Zoom level ('1w', '1m', '3m', 'all')
   */
  setZoomLevel(level) {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    
    let start, end;
    
    switch (level) {
      case '1w':
        start = now;
        end = now + 7 * DAY;
        break;
      case '1m':
        start = now;
        end = now + 30 * DAY;
        break;
      case '3m':
        start = now;
        end = now + 90 * DAY;
        break;
      case 'all':
      default:
        const viewRange = calculateViewRange(this.jobs);
        start = viewRange.start;
        end = viewRange.end;
        break;
    }
    
    this.chart.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
      startValue: start,
      endValue: end
    });
  }

  /**
   * Export chart as image
   * @param {string} type - Image type ('png', 'jpeg', 'svg')
   * @returns {string} Data URL
   */
  exportImage(type = 'png') {
    return this.chart.getDataURL({
      type: type,
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
  }

  /**
   * Get selection state
   * @returns {Object} Selection state
   */
  getSelection() {
    return this.selectionManager.getSelectionState();
  }

  /**
   * Set selection state
   * @param {Array} jobIds - Job IDs to select
   * @param {Array} resourceIndices - Resource indices to select
   */
  setSelection(jobIds, resourceIndices) {
    if (jobIds) {
      this.selectionManager.setSelectedJobs(jobIds);
    }
    if (resourceIndices) {
      this.selectionManager.setSelectedResources(resourceIndices);
    }
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectionManager.clearSelections();
  }

  /**
   * Destroy chart and cleanup
   */
  destroy() {
    window.removeEventListener('resize', this.resizeHandler);
    this.selectionManager.destroy();
    this.dragHandler.destroy();
    this.chart.dispose();
  }
}
