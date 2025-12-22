/**
 * Custom series renderer for Gantt chart bars
 */

import { DIMENSIONS, COLORS } from './utils.js';

/**
 * Render a single job bar
 * @param {Object} params - Render parameters from ECharts
 * @param {Object} api - ECharts API
 * @returns {Object} Render group with job bar and labels
 */
export function renderJobBar(params, api) {
  const categoryIndex = api.value(0); // Resource index
  const start = api.value(1);         // Start time
  const end = api.value(2);           // End time
  
  // Convert data values to pixel coordinates
  const startPos = api.coord([start, categoryIndex]);
  const endPos = api.coord([end, categoryIndex]);
  
  // Calculate bar dimensions
  const barWidth = endPos[0] - startPos[0];
  const categoryHeight = api.size([0, 1])[1];
  const barHeight = categoryHeight * DIMENSIONS.BAR_HEIGHT_RATIO;
  
  // Get job data
  const jobData = params.data;
  const isSelected = jobData.selected || false;
  const isDragging = jobData.dragging || false;
  
  // Calculate position
  const x = startPos[0];
  const y = startPos[1] - barHeight / 2;
  
  // Determine styling based on state
  const borderColor = isSelected ? COLORS.SELECTION : (jobData.borderColor || COLORS.DEFAULT_BORDER);
  const borderWidth = isSelected ? DIMENSIONS.SELECTION_BORDER_WIDTH : DIMENSIONS.DEFAULT_BORDER_WIDTH;
  const opacity = isDragging ? 0.8 : (jobData.opacity || 1);
  
  // Create render group
  const group = {
    type: 'group',
    children: []
  };
  
  // Main bar rectangle
  group.children.push({
    type: 'rect',
    shape: {
      x: x,
      y: y,
      width: Math.max(barWidth, DIMENSIONS.MIN_BAR_WIDTH),
      height: barHeight,
      r: DIMENSIONS.BORDER_RADIUS
    },
    style: {
      fill: jobData.color || '#3498db',
      stroke: borderColor,
      lineWidth: borderWidth,
      opacity: opacity
    },
    z2: isDragging ? 100 : 10
  });
  
  // Only render text if bar is wide enough
  if (barWidth > 50) {
    // Job name (first line)
    group.children.push({
      type: 'text',
      style: {
        text: truncateText(jobData.name, barWidth - 14),
        x: x + 7,
        y: y + 12,
        fill: '#000',
        fontSize: 12,
        fontWeight: 'bold',
        textVerticalAlign: 'top'
      },
      z2: isDragging ? 101 : 11
    });
    
    // Second line (scope or other field)
    if (jobData.secondLine && barHeight > 30) {
      group.children.push({
        type: 'text',
        style: {
          text: truncateText(jobData.secondLine, barWidth - 14),
          x: x + 7,
          y: y + 26,
          fill: '#495057',
          fontSize: 11,
          textVerticalAlign: 'top'
        },
        z2: isDragging ? 101 : 11
      });
    }
    
    // Third line (team badge and location)
    if (jobData.team && barHeight > 45) {
      const badgeY = y + barHeight - 18;
      
      // Team badge background
      const teamText = jobData.team;
      const badgeWidth = Math.min(teamText.length * 7 + 10, barWidth - 14);
      
      group.children.push({
        type: 'rect',
        shape: {
          x: x + 7,
          y: badgeY,
          width: badgeWidth,
          height: 14,
          r: 3
        },
        style: {
          fill: 'rgba(0, 0, 0, 0.35)'
        },
        z2: isDragging ? 101 : 11
      });
      
      // Team text
      group.children.push({
        type: 'text',
        style: {
          text: truncateText(teamText, badgeWidth - 6),
          x: x + 12,
          y: badgeY + 10,
          fill: '#fff',
          fontSize: 10,
          fontWeight: '500',
          textVerticalAlign: 'middle'
        },
        z2: isDragging ? 101 : 11
      });
      
      // Location icon (if present and space available)
      if (jobData.location && barWidth > badgeWidth + 30) {
        const locationX = x + 7 + badgeWidth + 5;
        
        // Simple location pin icon using SVG path
        group.children.push({
          type: 'path',
          shape: {
            pathData: 'M6 0C3.239 0 1 2.239 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.761-2.239-5-5-5zm0 7.5c-1.381 0-2.5-1.119-2.5-2.5S4.619 2.5 6 2.5 8.5 3.619 8.5 5 7.381 7.5 6 7.5z',
            x: locationX,
            y: badgeY + 1,
            width: 12,
            height: 12
          },
          style: {
            fill: '#6c757d'
          },
          z2: isDragging ? 101 : 11
        });
      }
    }
  }
  
  return group;
}

/**
 * Truncate text to fit within given width
 * @param {string} text - Text to truncate
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string} Truncated text
 */
function truncateText(text, maxWidth) {
  if (!text) return '';
  
  // Rough estimate: 7 pixels per character
  const maxChars = Math.floor(maxWidth / 7);
  
  if (text.length <= maxChars) {
    return text;
  }
  
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Create custom series configuration
 * @param {Array} data - Job data
 * @param {Function} renderItem - Custom render function
 * @returns {Object} Series configuration
 */
export function createCustomSeriesConfig(data, renderItem) {
  return {
    type: 'custom',
    renderItem: renderItem || renderJobBar,
    data: data,
    encode: {
      x: [1, 2],    // Start and end times
      y: 0,         // Resource index
      tooltip: [0, 1, 2]
    },
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut'
  };
}
