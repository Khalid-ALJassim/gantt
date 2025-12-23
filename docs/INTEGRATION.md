# Integration Guide

## Overview

This guide explains how to integrate the custom Gantt scheduler into your application, with specific instructions for Dash integration.

## Standalone Usage

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Gantt Scheduler</title>
  <style>
    #gantt-container {
      width: 100%;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="gantt-container"></div>
  
  <script type="module">
    import { GanttScheduler } from './static/js/gantt/poc/gantt-scheduler.js';
    
    const scheduler = new GanttScheduler('#gantt-container', {
      editing: true
    });
    
    scheduler.setData({
      jobs: [...],
      resources: [...],
      viewStart: Date.UTC(2024, 0, 1),
      viewEnd: Date.UTC(2024, 11, 31)
    });
  </script>
</body>
</html>
```

## Dash Integration

### Step 1: Copy Files

Copy the POC files to your Dash assets directory:

```bash
cp -r static/js/gantt/poc /path/to/your/dash/app/assets/js/gantt/
cp static/js/gantt/render_schedule_custom.js /path/to/your/dash/app/assets/js/gantt/
```

### Step 2: Replace Highcharts Call

**Before (Highcharts):**
```python
app.clientside_callback(
    "window.dash_clientside.highcharts_gantt.render",
    Output('gantt-chart', 'children'),
    Input('chart-options-store', 'data'),
    Input('editing-enabled', 'data'),
    State('gantt-wrapper', 'id')
)
```

**After (Custom):**
```python
app.clientside_callback(
    "window.dash_clientside.custom_gantt.render",
    Output('gantt-chart', 'children'),
    Input('chart-options-store', 'data'),
    Input('editing-enabled', 'data'),
    State('gantt-wrapper', 'id')
)
```

### Step 3: Data Format

Ensure your options follow this structure:

```python
options = {
    'series': [{
        'data': [
            {
                'id': 'W-113',
                'name': 'W-113',
                'scope': 'Re Completion',
                'team': 'WRO',
                'start': 1703116800000,
                'end': 1703548800000,
                'y': 0,
                'color': '#ff8787',
                'estGain': '200 BOPD',
                'optMethod': 'ESP',
                'location': 'Kuwait',
                'locationIcon': '🌍',
                'bopdRigHour': '50',
                'secondaryScope': ['ESP', 'Acid']
            },
            # ... more jobs
        ]
    }],
    'yAxis': {
        'categories': ['GNDC-S1', 'GNDC-S2', 'GNDC-S3', ...]
    },
    'xAxis': {
        'min': 1701388800000,
        'max': 1708214400000
    }
}
```

### Step 4: Listen for Events

**Selection Changes:**
```python
app.clientside_callback(
    """
    function(selectedJobs) {
        console.log('Selected jobs:', selectedJobs);
        return selectedJobs;
    }
    """,
    Output('selected-jobs-display', 'data'),
    Input('gantt-selected-job-store', 'data')
)
```

**Drop Events:**
```python
app.clientside_callback(
    """
    function(dropPayload) {
        if (dropPayload) {
            console.log('Job dropped:', dropPayload);
            // Send to backend for persistence
            return dropPayload;
        }
        return window.dash_clientside.no_update;
    }
    """,
    Output('drop-callback-trigger', 'data'),
    Input('drop-payload-store', 'data')
)
```

## API Reference

### GanttScheduler Constructor

```javascript
new GanttScheduler(container, options)
```

**Parameters:**
- `container` (string|HTMLElement): Container element or selector
- `options` (Object): Configuration options
  - `editing` (boolean): Enable drag-and-drop (default: true)
  - `leftMargin` (number): Width of resource labels (default: 120)
  - `topMargin` (number): Height of timeline (default: 60)
  - `rowHeight` (number): Height of each row (default: 40)

### Methods

#### setData(data)
Load chart data.

```javascript
scheduler.setData({
  jobs: [...],
  resources: [...],
  viewStart: 1701388800000,
  viewEnd: 1708214400000
});
```

#### zoomTo(range)
Zoom to preset range.

```javascript
scheduler.zoomTo('1w');  // 1 week
scheduler.zoomTo('1m');  // 1 month
scheduler.zoomTo('3m');  // 3 months
scheduler.zoomTo('all'); // All jobs
```

#### getSelectedJobs()
Get currently selected job IDs.

```javascript
const selectedIds = scheduler.getSelectedJobs();
// Returns: ['W-113', 'S-112', ...]
```

#### destroy()
Clean up and remove scheduler.

```javascript
scheduler.destroy();
```

### Events

#### gantt-selection-changed
Fired when selection changes.

```javascript
container.addEventListener('gantt-selection-changed', (event) => {
  console.log('Selected:', event.detail);
});
```

#### gantt-job-dropped
Fired when a job is dropped.

```javascript
container.addEventListener('gantt-job-dropped', (event) => {
  const { jobId, sourceResource, targetResource, newStart, newEnd } = event.detail;
  console.log(`Job ${jobId} moved from ${sourceResource} to ${targetResource}`);
});
```

## Customization

### Custom Colors

Define colors in job data:

```javascript
{
  id: 'W-113',
  color: '#ff8787',  // Custom color
  // ... other properties
}
```

### Custom Tooltip Content

Override the tooltip content generation:

```javascript
scheduler.tooltip.generateTooltipContent = function(job) {
  return `
    <div><strong>${job.name}</strong></div>
    <div>Custom content here</div>
  `;
};
```

### Custom Rendering

Extend the renderer for custom drawing:

```javascript
class CustomRenderer extends CanvasRenderer {
  drawJob(job, resources) {
    // Custom job rendering
    super.drawJob(job, resources);
    // Add custom elements
  }
}

// Use custom renderer
scheduler.renderer = new CustomRenderer(canvas, timeline, stateManager);
```

## Performance Tips

1. **Limit Data**: For best performance, show 100 jobs or less at once
2. **Throttle Updates**: Debounce data updates if receiving frequent changes
3. **Use Zoom**: Encourage users to zoom in to view details
4. **Virtual Scrolling**: For many resources, implement virtual scrolling

## Troubleshooting

### Chart not rendering
- Check browser console for errors
- Ensure container has width and height
- Verify data format matches expected structure

### Drag not working
- Ensure `editing: true` in options
- Check that jobs have valid start/end timestamps
- Verify y-axis values are within resource range

### Poor performance
- Reduce number of visible jobs
- Check for console errors/warnings
- Test on different browsers
- Monitor memory usage in DevTools

## Migration from Highcharts

### Key Differences

1. **No external dependencies**: Pure JavaScript
2. **Canvas-based**: Better performance for many elements
3. **Simpler API**: Fewer configuration options
4. **Event system**: Custom events instead of Highcharts events

### Migration Checklist

- [ ] Copy POC files to assets
- [ ] Update clientside callback function name
- [ ] Test data format compatibility
- [ ] Update event listeners
- [ ] Test all interactions (drag, select, zoom)
- [ ] Verify styling matches requirements
- [ ] Test on all target browsers
- [ ] Update documentation

## Examples

See `static/js/gantt/demo/index.html` for a complete working example.
