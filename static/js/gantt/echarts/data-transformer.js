/**
 * Transform data from Highcharts format to ECharts format
 */

import { parseColor } from './utils.js';

/**
 * Transform Highcharts-style data to ECharts format
 * @param {Array} highchartsData - Data in Highcharts format
 * @param {Array} resources - Resource names
 * @param {Object} config - Additional configuration
 * @returns {Array} Data in ECharts format
 */
export function transformJobData(highchartsData, resources, config = {}) {
  if (!highchartsData || !Array.isArray(highchartsData)) {
    return [];
  }

  const resourceMap = {};
  resources.forEach((res, idx) => {
    resourceMap[res] = idx;
  });

  return highchartsData.map(job => {
    const resourceIndex = typeof job.y === 'number' 
      ? job.y 
      : resourceMap[job.resource] || 0;

    return {
      id: job.id || job.name,
      name: job.name || job.id,
      value: [
        resourceIndex,           // Y position (resource index)
        job.x || job.start,      // Start time
        job.x2 || job.end        // End time
      ],
      // Metadata for rendering
      color: parseColor(job.color),
      borderColor: parseColor(job.borderColor || '#34495e'),
      borderWidth: job.borderWidth || 1,
      scope: job.scope || job.primaryScope || '',
      team: job.team || '',
      location: job.location || '',
      duration: job.duration,
      // Store original data for tooltip and events
      original: job,
      // Additional fields based on config
      secondLine: getSecondLineValue(job, config.secondLine),
      thirdLine: getThirdLineValue(job, config.thirdLine)
    };
  });
}

/**
 * Get value for second line display
 * @param {Object} job - Job data
 * @param {string} field - Field name
 * @returns {string} Display value
 */
function getSecondLineValue(job, field) {
  if (!field) return job.scope || '';
  
  const fieldMap = {
    'PRIMARY_SCOPE': job.primaryScope || job.scope,
    'SCOPE': job.scope,
    'DURATION': job.duration ? `${job.duration}d` : '',
    'TEAM': job.team
  };
  
  return fieldMap[field] || job[field] || '';
}

/**
 * Get value for third line display
 * @param {Object} job - Job data
 * @param {Array} fields - Array of field names
 * @returns {Array} Array of display values
 */
function getThirdLineValue(job, fields) {
  if (!fields || !Array.isArray(fields)) {
    return [{ type: 'team', value: job.team || '' }];
  }
  
  return fields.map(field => {
    switch (field) {
      case 'TEAM':
        return { type: 'team', value: job.team || '' };
      case 'LOCATION':
        return { type: 'location', value: job.location || '' };
      default:
        return { type: 'text', value: job[field] || '' };
    }
  }).filter(item => item.value);
}

/**
 * Transform resources to category axis data
 * @param {Array} resources - Resource names or objects
 * @returns {Array} Category axis data
 */
export function transformResourceData(resources) {
  if (!resources || !Array.isArray(resources)) {
    return [];
  }
  
  return resources.map(resource => {
    if (typeof resource === 'string') {
      return resource;
    }
    return resource.name || resource.id || String(resource);
  });
}

/**
 * Calculate optimal view range based on job data
 * @param {Array} jobs - Job data
 * @param {Object} options - Options for calculation
 * @returns {Object} View range with start and end
 */
export function calculateViewRange(jobs, options = {}) {
  if (!jobs || jobs.length === 0) {
    const now = Date.now();
    return {
      start: now,
      end: now + 90 * 24 * 60 * 60 * 1000 // 90 days
    };
  }

  const starts = jobs.map(j => j.value[1]).filter(v => v);
  const ends = jobs.map(j => j.value[2]).filter(v => v);
  
  const minStart = Math.min(...starts);
  const maxEnd = Math.max(...ends);
  
  // Add padding (10% on each side)
  const range = maxEnd - minStart;
  const padding = range * 0.1;
  
  return {
    start: options.start || minStart - padding,
    end: options.end || maxEnd + padding
  };
}

/**
 * Group jobs by resource
 * @param {Array} jobs - Job data
 * @returns {Object} Jobs grouped by resource index
 */
export function groupJobsByResource(jobs) {
  const grouped = {};
  
  jobs.forEach(job => {
    const resourceIndex = job.value[0];
    if (!grouped[resourceIndex]) {
      grouped[resourceIndex] = [];
    }
    grouped[resourceIndex].push(job);
  });
  
  return grouped;
}

/**
 * Sort jobs by start time
 * @param {Array} jobs - Job data
 * @returns {Array} Sorted jobs
 */
export function sortJobsByStartTime(jobs) {
  return [...jobs].sort((a, b) => {
    const startA = a.value[1];
    const startB = b.value[1];
    return startA - startB;
  });
}
