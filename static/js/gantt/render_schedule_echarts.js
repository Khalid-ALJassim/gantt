/**
 * Dash integration layer for ECharts Gantt
 * Drop-in replacement for render_schedule.js
 */

import { GanttECharts } from './echarts/gantt-echarts.js';

// Ensure window.dash_clientside exists
if (typeof window.dash_clientside === 'undefined') {
  window.dash_clientside = {};
}

/**
 * Main render function for Dash clientside callback
 */
window.dash_clientside.echarts_gantt = {
  render: function(options, editing, wrapper_id) {
    // Parse options if string
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Failed to parse options:', e);
        options = {};
      }
    }
    
    // Determine AIO ID
    const aioId = wrapper_id?.aio_id || 
      (typeof wrapper_id === 'string' ? wrapper_id.replace('gantt-chart-', '') : 'main-gantt-chart');
    
    // Determine simple ID for element lookup
    const simpleId = wrapper_id?.aio_id ? 
      'gantt-chart-' + wrapper_id.aio_id : 
      (typeof wrapper_id === 'string' ? wrapper_id : 'gantt-chart');
    
    /**
     * Attempt to render chart with retries
     */
    function attemptRender(attemptNumber) {
      // Find container element
      const container = document.getElementById(simpleId);
      if (!container) {
        if (attemptNumber < 15) {
          setTimeout(() => attemptRender(attemptNumber + 1), 80);
          return;
        }
        console.warn('Chart container not found:', simpleId);
        return;
      }
      
      // Check if ECharts is loaded
      if (typeof echarts === 'undefined') {
        if (attemptNumber < 15) {
          setTimeout(() => attemptRender(attemptNumber + 1), 80);
          return;
        }
        console.warn('ECharts library not loaded');
        return;
      }
      
      try {
        // Transform Highcharts-style options to ECharts format
        const ganttOptions = transformOptions(options, editing, aioId);
        
        // Initialize or update chart
        if (!container.__echartsGantt__) {
          container.__echartsGantt__ = new GanttECharts(container, ganttOptions);
        } else {
          container.__echartsGantt__.update(ganttOptions);
        }
      } catch (error) {
        console.error('Failed to render Gantt chart:', error);
      }
    }
    
    // Start rendering
    attemptRender(0);
    
    // Return empty string for Dash callback
    return '';
  }
};

/**
 * Transform Highcharts-style options to ECharts format
 * @param {Object} options - Highcharts-style options
 * @param {boolean} editing - Whether editing is enabled
 * @param {string} aioId - AIO ID for Dash integration
 * @returns {Object} ECharts-compatible options
 */
function transformOptions(options, editing, aioId) {
  // Extract job data from Highcharts series format
  let jobs = [];
  if (options.series && Array.isArray(options.series)) {
    // Flatten all series data
    jobs = options.series.reduce((acc, series) => {
      if (series.data && Array.isArray(series.data)) {
        return acc.concat(series.data);
      }
      return acc;
    }, []);
  } else if (options.jobs && Array.isArray(options.jobs)) {
    jobs = options.jobs;
  }
  
  // Extract resource names from Highcharts yAxis
  let resources = [];
  if (options.yAxis && options.yAxis.categories) {
    resources = options.yAxis.categories;
  } else if (options.resources && Array.isArray(options.resources)) {
    resources = options.resources;
  }
  
  // Extract time range from Highcharts xAxis
  let viewStart = options.xAxis?.min || null;
  let viewEnd = options.xAxis?.max || null;
  
  // Handle rangeSelector for time range
  if (options.rangeSelector && options.rangeSelector.selected !== undefined) {
    const selected = options.rangeSelector.selected;
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    
    switch (selected) {
      case 0: // 1 week
        viewStart = now;
        viewEnd = now + 7 * DAY;
        break;
      case 1: // 1 month
        viewStart = now;
        viewEnd = now + 30 * DAY;
        break;
      case 2: // 3 months
        viewStart = now;
        viewEnd = now + 90 * DAY;
        break;
      default: // All
        viewStart = null;
        viewEnd = null;
    }
  }
  
  return {
    jobs: jobs,
    resources: resources,
    viewStart: viewStart,
    viewEnd: viewEnd,
    editable: editing === true,
    secondLine: options.second_line || options.secondLine || 'PRIMARY_SCOPE',
    thirdLine: options.third_line || options.thirdLine || ['TEAM'],
    aioId: aioId
  };
}

/**
 * Helper function to set zoom level
 */
window.dash_clientside.echarts_gantt.setZoom = function(level, wrapper_id) {
  const simpleId = wrapper_id?.aio_id ? 
    'gantt-chart-' + wrapper_id.aio_id : 
    (typeof wrapper_id === 'string' ? wrapper_id : 'gantt-chart');
  
  const container = document.getElementById(simpleId);
  if (container && container.__echartsGantt__) {
    container.__echartsGantt__.setZoomLevel(level);
  }
  
  return window.dash_clientside.no_update;
};

/**
 * Helper function to export chart
 */
window.dash_clientside.echarts_gantt.exportChart = function(type, wrapper_id) {
  const simpleId = wrapper_id?.aio_id ? 
    'gantt-chart-' + wrapper_id.aio_id : 
    (typeof wrapper_id === 'string' ? wrapper_id : 'gantt-chart');
  
  const container = document.getElementById(simpleId);
  if (container && container.__echartsGantt__) {
    const dataUrl = container.__echartsGantt__.exportImage(type);
    
    // Trigger download
    const link = document.createElement('a');
    link.download = `gantt_schedule_${new Date().toISOString().slice(0, 10)}.${type}`;
    link.href = dataUrl;
    link.click();
  }
  
  return window.dash_clientside.no_update;
};

/**
 * Helper function to clear selection
 */
window.dash_clientside.echarts_gantt.clearSelection = function(wrapper_id) {
  const simpleId = wrapper_id?.aio_id ? 
    'gantt-chart-' + wrapper_id.aio_id : 
    (typeof wrapper_id === 'string' ? wrapper_id : 'gantt-chart');
  
  const container = document.getElementById(simpleId);
  if (container && container.__echartsGantt__) {
    container.__echartsGantt__.clearSelection();
  }
  
  return window.dash_clientside.no_update;
};
