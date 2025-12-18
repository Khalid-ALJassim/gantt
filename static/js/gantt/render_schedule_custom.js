/**
 * Dash-compatible wrapper for the custom Gantt scheduler
 * Drop-in replacement for render_schedule.js (Highcharts-based)
 */

// Import the GanttScheduler class
// Note: In a real Dash deployment, you would need to bundle this or use a module loader
// For now, we assume the modules are available

window.dash_clientside = window.dash_clientside || {};
window.dash_clientside.custom_gantt = {
  /**
   * Render the Gantt chart
   * @param {Object} options - Chart options
   * @param {boolean} editing - Whether editing is enabled
   * @param {string} wrapper_id - Container element ID
   * @returns {string} Success message
   */
  render: function(options, editing, wrapper_id) {
    // Dynamically import the GanttScheduler
    // This is a workaround since we can't use ES6 imports directly in Dash clientside callbacks
    return new Promise((resolve) => {
      // Check if modules are loaded
      if (typeof GanttScheduler === 'undefined') {
        // Load modules dynamically
        loadModules().then(() => {
          renderChart(options, editing, wrapper_id);
          resolve(`Custom Gantt chart rendered in ${wrapper_id}`);
        });
      } else {
        renderChart(options, editing, wrapper_id);
        resolve(`Custom Gantt chart rendered in ${wrapper_id}`);
      }
    });
  }
};

/**
 * Load all required modules
 */
function loadModules() {
  return new Promise((resolve) => {
    const modules = [
      '/assets/js/gantt/poc/utils.js',
      '/assets/js/gantt/poc/timeline.js',
      '/assets/js/gantt/poc/state-manager.js',
      '/assets/js/gantt/poc/canvas-renderer.js',
      '/assets/js/gantt/poc/selection.js',
      '/assets/js/gantt/poc/drag-drop.js',
      '/assets/js/gantt/poc/tooltip.js',
      '/assets/js/gantt/poc/svg-overlay.js',
      '/assets/js/gantt/poc/gantt-scheduler.js'
    ];
    
    let loaded = 0;
    modules.forEach(src => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === modules.length) {
          resolve();
        }
      };
      document.head.appendChild(script);
    });
  });
}

/**
 * Render the chart
 */
function renderChart(options, editing, wrapper_id) {
  const container = document.getElementById(wrapper_id);
  if (!container) {
    console.error(`Container ${wrapper_id} not found`);
    return;
  }
  
  // Clean up existing instance
  if (container._ganttScheduler) {
    container._ganttScheduler.destroy();
  }
  
  // Transform options to match our data structure
  const data = transformOptionsToData(options);
  
  // Create scheduler instance
  const scheduler = new GanttScheduler(container, {
    editing: editing,
    leftMargin: 120,
    topMargin: 60
  });
  
  // Set data
  scheduler.setData(data);
  
  // Store instance on container
  container._ganttScheduler = scheduler;
  
  console.log('Custom Gantt scheduler initialized with', data.jobs.length, 'jobs');
}

/**
 * Transform Highcharts-style options to our data structure
 */
function transformOptionsToData(options) {
  const data = {
    jobs: [],
    resources: [],
    viewStart: null,
    viewEnd: null
  };
  
  // Extract series data (jobs)
  if (options.series && options.series.length > 0) {
    const series = options.series[0];
    
    if (series.data) {
      data.jobs = series.data.map(item => {
        // Highcharts uses 'start' and 'end' (timestamps)
        // 'y' is the resource index
        return {
          id: item.id || item.name,
          name: item.name,
          scope: item.scope,
          team: item.team,
          start: item.start,
          end: item.end,
          y: item.y,
          color: item.color,
          estGain: item.estGain,
          optMethod: item.optMethod,
          location: item.location,
          locationIcon: item.locationIcon,
          bopdRigHour: item.bopdRigHour,
          secondaryScope: item.secondaryScope
        };
      });
    }
  }
  
  // Extract resources (Y-axis categories)
  if (options.yAxis && options.yAxis.categories) {
    data.resources = options.yAxis.categories;
  }
  
  // Extract view range from X-axis
  if (options.xAxis) {
    data.viewStart = options.xAxis.min || Date.now() - (30 * 24 * 60 * 60 * 1000);
    data.viewEnd = options.xAxis.max || Date.now() + (90 * 24 * 60 * 60 * 1000);
  }
  
  // If no view range specified, calculate from jobs
  if (!data.viewStart || !data.viewEnd) {
    if (data.jobs.length > 0) {
      const starts = data.jobs.map(j => j.start);
      const ends = data.jobs.map(j => j.end);
      data.viewStart = Math.min(...starts);
      data.viewEnd = Math.max(...ends);
      
      // Add padding
      const padding = (data.viewEnd - data.viewStart) * 0.1;
      data.viewStart -= padding;
      data.viewEnd += padding;
    } else {
      // Default range
      data.viewStart = Date.now() - (30 * 24 * 60 * 60 * 1000);
      data.viewEnd = Date.now() + (90 * 24 * 60 * 60 * 1000);
    }
  }
  
  return data;
}

/**
 * Get scheduler instance from container
 */
function getSchedulerInstance(wrapper_id) {
  const container = document.getElementById(wrapper_id);
  return container ? container._ganttScheduler : null;
}

// Export for use in other scripts
window.getGanttScheduler = getSchedulerInstance;
