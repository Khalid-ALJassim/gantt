# Quick Start Guide

Get started with the ECharts Gantt Scheduler in 5 minutes!

## Option 1: Standalone Demo (No Installation)

1. **Open the demo file**
   ```bash
   # Start a local HTTP server
   python3 -m http.server 8080
   ```

2. **View in browser**
   ```
   http://localhost:8080/demo.html
   ```

3. **Try the features**
   - Drag jobs horizontally to reschedule
   - Drag jobs vertically to change resources
   - Click jobs to select them
   - Click resource labels to select all future jobs
   - Use mouse wheel to zoom
   - Shift + drag to pan

## Option 2: Dash Application

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run the Example
```bash
python example_dash_app.py
```

### View in Browser
```
http://127.0.0.1:8050
```

## Option 3: Integration into Your Project

### 1. Add ECharts Library

Via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
```

Or via npm:
```bash
npm install echarts
```

### 2. Include Gantt Files

```html
<!-- CSS -->
<link rel="stylesheet" href="static/js/gantt/styles/gantt-echarts.css">

<!-- JavaScript (as ES module) -->
<script type="module">
  import { GanttECharts } from './static/js/gantt/echarts/gantt-echarts.js';
  
  const chart = new GanttECharts(container, options);
</script>
```

### 3. Basic Usage

```javascript
import { GanttECharts } from './static/js/gantt/echarts/gantt-echarts.js';

const container = document.getElementById('gantt-chart');

const chart = new GanttECharts(container, {
  jobs: [
    {
      id: 'WO-001',
      name: 'Site Preparation',
      y: 0,
      x: Date.now(),
      x2: Date.now() + 10 * 24 * 60 * 60 * 1000,
      color: '#3498db',
      scope: 'Foundation',
      team: 'TEAM-A'
    }
  ],
  resources: ['Resource 1', 'Resource 2'],
  editable: true
});
```

## Sample Data Format

```javascript
{
  jobs: [
    {
      id: 'JOB-001',           // Required: Unique identifier
      name: 'Job Name',         // Required: Display name
      y: 0,                     // Required: Resource index (0-based)
      x: 1672531200000,         // Required: Start timestamp (ms)
      x2: 1673740800000,        // Required: End timestamp (ms)
      color: '#3498db',         // Optional: Bar color
      scope: 'Scope',           // Optional: Second line text
      team: 'TEAM-A',          // Optional: Team badge
      location: 'Site-1'       // Optional: Location icon
    }
  ],
  resources: [                // Required: Resource names
    'Resource 1',
    'Resource 2',
    'Resource 3'
  ],
  editable: true,             // Optional: Enable drag & drop
  secondLine: 'scope',        // Optional: Field for second line
  thirdLine: ['team']         // Optional: Fields for third line
}
```

## Common Tasks

### Zoom to Specific Range
```javascript
chart.setZoomLevel('1m'); // '1w', '1m', '3m', 'all'
```

### Export as Image
```javascript
const dataUrl = chart.exportImage('png'); // 'png', 'jpeg', 'svg'
```

### Get Selection
```javascript
const selection = chart.getSelection();
console.log(selection.jobs);      // Array of selected job IDs
console.log(selection.resources); // Array of selected resource indices
```

### Clear Selection
```javascript
chart.clearSelection();
```

### Update Data
```javascript
chart.update({
  jobs: newJobsArray,
  resources: newResourcesArray
});
```

### Cleanup
```javascript
chart.destroy();
```

## Dash Integration

```python
from dash import Dash, html, dcc, Input, Output, clientside_callback

app = Dash(__name__)

app.layout = html.Div([
    html.Div(id='gantt-chart', className='gantt-chart-container'),
    dcc.Store(id='gantt-options'),
    # ECharts library
    html.Script(src='https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js')
])

# Clientside callback to render chart
clientside_callback(
    """
    function(options, editing, wrapperId) {
        return window.dash_clientside.echarts_gantt.render(
            options, editing, wrapperId
        );
    }
    """,
    Output('gantt-chart', 'children'),
    Input('gantt-options', 'data'),
    Input('editing-mode', 'value'),
    State('gantt-chart', 'id')
)
```

## Troubleshooting

### Chart Not Showing
- Check that container has height: `#gantt-chart { height: 600px; }`
- Verify ECharts is loaded: `console.log(typeof echarts)`
- Check browser console for errors

### Drag Not Working
- Ensure `editable: true` in options
- Verify jobs have valid `x`, `x2`, and `y` values

### Selection Not Syncing
- Check that `dash_clientside` is available
- Verify store IDs match exactly
- Check browser console for errors

## Next Steps

1. **Read the full documentation**: [ECHARTS_GANTT_README.md](./ECHARTS_GANTT_README.md)
2. **See migration guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
3. **Compare with Highcharts**: [COMPARISON.md](./COMPARISON.md)
4. **Review testing specs**: [TESTING.md](./TESTING.md)

## Getting Help

- **Examples**: See `demo.html` and `example_dash_app.py`
- **API Reference**: See `ECHARTS_GANTT_README.md`
- **ECharts Docs**: https://echarts.apache.org/

## Features Summary

✅ Drag & drop (horizontal and vertical)
✅ Auto-resequencing (no gaps between jobs)
✅ Selection (jobs and resources)
✅ Zoom and pan
✅ Export (PNG, JPEG, SVG)
✅ Rich tooltips
✅ Current date indicator
✅ Responsive design
✅ Dash integration
✅ MIT License (free forever)

Enjoy your new ECharts Gantt Scheduler! 🎉
