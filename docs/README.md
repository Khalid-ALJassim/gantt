# Gantt ECharts Scheduler - Documentation

## Overview

The Gantt ECharts Scheduler is a complete, production-ready Gantt chart implementation using Apache ECharts. It provides all the features required for a modern scheduling application with full Dash integration support.

## Features

### Visual Components

1. **Resource Rows on Y-axis** - Displays resources vertically with clickable labels
2. **Timeline on X-axis** - Shows time progression with configurable zoom levels
3. **Colored Job Bars** - Displays tasks with customizable colors and rounded corners
4. **Multi-line Text Labels** - Shows job names on bars with automatic truncation
5. **Current Date Indicator** - Red vertical line marking today's date
6. **Navigator Bar** - Timeline overview for easy navigation
7. **Zoom Controls** - Quick zoom buttons (1w, 1m, 3m, All)

### Interactions

1. **Drag & Drop** - Click and drag job bars to reschedule them
2. **Auto-Resequencing** - Automatically reorganizes jobs to eliminate gaps
3. **Job Selection** - Click job bars to select and highlight them
4. **Resource Selection** - Click resource labels to select all future jobs
5. **Rich Tooltips** - Hover over jobs to see detailed information
6. **Mouse Wheel Zoom** - Scroll to zoom in/out on the timeline
7. **Shift+Drag Pan** - Hold Shift and drag to pan the view
8. **Export** - Download schedule as PNG or PDF

## Installation

### Dependencies

```json
{
  "echarts": "^5.4.3"
}
```

For Dash integration:
```
pip install dash
```

### Include in HTML

```html
<!-- ECharts library -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>

<!-- Gantt scheduler -->
<script src="path/to/gantt-echarts.js"></script>
<link rel="stylesheet" href="path/to/gantt-echarts.css">
```

## Usage

### Basic JavaScript Usage

```javascript
// Create container
<div id="gantt-chart" style="width: 100%; height: 700px;"></div>

// Initialize scheduler
const gantt = new GanttEchartsScheduler('gantt-chart', {
    colors: {
        job: '#5470c6',
        jobHover: '#7d93e8',
        jobSelected: '#2f4f9f',
        currentDate: '#ff0000',
        gridLine: '#e0e0e0',
        resourceLabel: '#333333'
    },
    barHeight: 30,
    rowHeight: 50
});

// Prepare data
const jobs = [
    {
        id: 'job1',
        name: 'Task 1',
        resource: 'resource1',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
        color: '#5470c6',
        sequence: 1
    }
    // ... more jobs
];

const resources = [
    { id: 'resource1', name: 'Team A' },
    { id: 'resource2', name: 'Team B' }
    // ... more resources
];

// Set data and render
gantt.setData(jobs, resources);
```

### Dash Integration

```python
from gantt_dash import GanttScheduler, create_gantt_callbacks
import dash
from dash import html

app = dash.Dash(__name__)

# Define data
jobs = [
    {
        'id': 'job1',
        'name': 'Task 1',
        'resource': 'resource1',
        'start': '2024-01-01T00:00:00',
        'end': '2024-01-15T00:00:00',
        'color': '#5470c6',
        'sequence': 1
    }
]

resources = [
    {'id': 'resource1', 'name': 'Team A'},
    {'id': 'resource2', 'name': 'Team B'}
]

# Create layout
app.layout = html.Div([
    GanttScheduler(
        id='gantt',
        jobs=jobs,
        resources=resources,
        height='700px'
    )
])

# Create callbacks
stores = create_gantt_callbacks(app, 'gantt')

app.run_server(debug=True)
```

## API Reference

### Constructor Options

```javascript
new GanttEchartsScheduler(containerId, options)
```

**Parameters:**

- `containerId` (string): ID of the container element
- `options` (object): Configuration options
  - `dashStores` (object): Dash store IDs for integration
  - `colors` (object): Color configuration
  - `barHeight` (number): Height of job bars in pixels (default: 30)
  - `rowHeight` (number): Height of resource rows in pixels (default: 50)
  - `navigatorHeight` (number): Height of navigator in pixels (default: 50)

### Methods

#### setData(jobs, resources)
Sets the data for the Gantt chart.

**Parameters:**
- `jobs` (array): Array of job objects
- `resources` (array): Array of resource objects

**Job Object Structure:**
```javascript
{
    id: string,           // Unique job identifier
    name: string,         // Job display name
    resource: string,     // Resource ID this job belongs to
    start: Date,          // Start date/time
    end: Date,            // End date/time
    color: string,        // Hex color code
    sequence: number      // Order within resource
}
```

**Resource Object Structure:**
```javascript
{
    id: string,           // Unique resource identifier
    name: string          // Resource display name
}
```

#### setZoom(level)
Sets the zoom level of the timeline.

**Parameters:**
- `level` (string): One of '1w', '1m', '3m', or 'All'

**Behavior:**
- Zooms from today's date (not center)
- '1w': Shows 1 week from today
- '1m': Shows 1 month from today
- '3m': Shows 3 months from today
- 'All': Shows all data

#### selectJob(job)
Programmatically select a job.

**Parameters:**
- `job` (object): Job object to select

#### selectResource(resource)
Programmatically select a resource.

**Parameters:**
- `resource` (object): Resource object to select

#### exportToPNG()
Exports the chart as a PNG image.

#### exportToPDF()
Exports the chart as a PDF document (currently saves as PNG).

#### destroy()
Cleans up and destroys the chart instance.

## Auto-Resequencing Algorithm

When a job is dropped on a resource, the scheduler automatically resequences all jobs on that resource to be consecutive with no gaps.

### Algorithm Details:

1. Get all jobs for the target resource
2. Sort by start time
3. Assign consecutive sequence numbers starting from 1
4. If the job was moved from a different resource, resequence the source resource as well

This ensures jobs are always properly ordered within each resource.

## Dash Store Integration

The scheduler integrates with three Dash stores:

### gantt-selected-job-store
Triggered when a job is selected.

**Data Structure:**
```javascript
{
    jobId: string,
    name: string,
    resource: string,
    start: string (ISO),
    end: string (ISO)
}
```

### gantt-selected-resource-store
Triggered when a resource is selected.

**Data Structure:**
```javascript
{
    resourceId: string,
    resourceName: string,
    futureJobs: array of job IDs
}
```

### drop-payload-store
Triggered when a job is dropped.

**Data Structure:**
```javascript
{
    jobId: string,
    oldResource: string,
    newResource: string,
    newStart: string (ISO),
    newEnd: string (ISO)
}
```

## Styling

The scheduler comes with pre-built CSS classes that can be customized:

### Main Classes

- `.gantt-container` - Main container
- `.gantt-zoom-controls` - Zoom button container
- `.gantt-zoom-btn` - Individual zoom buttons
- `.gantt-export-btn` - Export buttons
- `.gantt-tooltip` - Tooltip styling
- `.gantt-job-bar` - Job bar styling
- `.gantt-resource-label` - Resource label styling
- `.gantt-navigator` - Navigator bar styling

### Customization Example

```css
.gantt-container {
    border: 2px solid #333;
    border-radius: 8px;
}

.gantt-zoom-btn {
    background: #5470c6;
    color: white;
}

.gantt-job-bar {
    opacity: 0.9;
}
```

## Performance

The scheduler is optimized to handle:

- **100+ jobs** smoothly
- **20+ resources** without lag
- **Real-time updates** with minimal re-rendering
- **Large time ranges** with efficient rendering

### Performance Tips:

1. Use `animation: false` in series options for better performance
2. Limit the number of visible jobs by using time range filtering
3. Implement virtual scrolling for 50+ resources
4. Batch updates when modifying multiple jobs

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (ECharts 5+ requirement)

## Examples

See the `examples/` directory for:

- `demo.html` - Standalone demo with sample data
- More examples coming soon

## Troubleshooting

### Chart Not Rendering

1. Ensure ECharts is loaded before gantt-echarts.js
2. Check that container has explicit height
3. Verify container ID matches the one passed to constructor

### Drag & Drop Not Working

1. Check browser console for errors
2. Ensure jobs have valid start/end dates
3. Verify resources exist for all jobs

### Dash Integration Issues

1. Ensure stores are created with correct IDs
2. Check that callbacks are properly registered
3. Verify data format matches expected structure

## License

MIT License

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Documentation: [repository]/docs
- Examples: [repository]/examples
