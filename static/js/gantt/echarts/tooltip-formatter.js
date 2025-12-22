/**
 * Tooltip formatter for Gantt chart
 */

import { formatDate, getDurationInDays } from './utils.js';

/**
 * Format tooltip HTML for a job
 * @param {Object} params - ECharts tooltip params
 * @returns {string} HTML string for tooltip
 */
export function formatTooltip(params) {
  const job = params.data;
  if (!job) return '';

  const start = job.value[1];
  const end = job.value[2];
  const duration = getDurationInDays(start, end);

  const html = `
    <div class="gantt-tooltip-card">
      <div class="tooltip-header">
        <div class="tooltip-title">${escapeHtml(job.name)}</div>
        <div class="tooltip-id">${escapeHtml(job.id)}</div>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="tooltip-label">Start:</span>
          <span class="tooltip-value">${formatDate(start, 'medium')}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">End:</span>
          <span class="tooltip-value">${formatDate(end, 'medium')}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Duration:</span>
          <span class="tooltip-value">${duration} day${duration !== 1 ? 's' : ''}</span>
        </div>
        ${job.scope ? `
        <div class="tooltip-row">
          <span class="tooltip-label">Scope:</span>
          <span class="tooltip-value">${escapeHtml(job.scope)}</span>
        </div>
        ` : ''}
        ${job.team ? `
        <div class="tooltip-row">
          <span class="tooltip-label">Team:</span>
          <span class="tooltip-value">${escapeHtml(job.team)}</span>
        </div>
        ` : ''}
        ${job.location ? `
        <div class="tooltip-row">
          <span class="tooltip-label">Location:</span>
          <span class="tooltip-value">${escapeHtml(job.location)}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get tooltip position
 * @param {Array} point - Mouse position [x, y]
 * @param {Object} params - Tooltip params
 * @param {HTMLElement} dom - Tooltip DOM element
 * @param {Object} rect - Container rect
 * @param {Object} size - Tooltip size
 * @returns {Array} Position [x, y]
 */
export function getTooltipPosition(point, params, dom, rect, size) {
  const x = point[0];
  const y = point[1];
  const viewWidth = rect.width;
  const viewHeight = rect.height;
  const boxWidth = size.contentSize[0];
  const boxHeight = size.contentSize[1];

  // Default position: above and to the right of cursor
  let posX = x + 15;
  let posY = y - boxHeight - 15;

  // Adjust if tooltip goes off right edge
  if (posX + boxWidth > viewWidth) {
    posX = x - boxWidth - 15;
  }

  // Adjust if tooltip goes off top edge
  if (posY < 0) {
    posY = y + 15;
  }

  // Adjust if tooltip goes off bottom edge
  if (posY + boxHeight > viewHeight) {
    posY = viewHeight - boxHeight - 10;
  }

  // Ensure minimum margins
  posX = Math.max(10, Math.min(posX, viewWidth - boxWidth - 10));
  posY = Math.max(10, Math.min(posY, viewHeight - boxHeight - 10));

  return [posX, posY];
}

/**
 * Create tooltip configuration for ECharts
 * @returns {Object} Tooltip configuration
 */
export function createTooltipConfig() {
  return {
    trigger: 'item',
    formatter: formatTooltip,
    position: getTooltipPosition,
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    padding: 0,
    textStyle: {
      color: '#374151'
    },
    extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px;'
  };
}
