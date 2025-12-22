# Gantt ECharts Scheduler

A complete, production-ready Gantt scheduler built with Apache ECharts, featuring drag & drop, auto-resequencing, and full Dash integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![ECharts](https://img.shields.io/badge/echarts-5.4.3-green.svg)
![Python](https://img.shields.io/badge/python-3.7+-blue.svg)

## 🚀 Features

### Visual Components
- ✅ Resource rows on Y-axis with clickable labels
- ✅ Timeline on X-axis with multiple zoom levels
- ✅ Colored job bars with rounded corners
- ✅ Multi-line text labels on job bars
- ✅ Current date indicator (red line)
- ✅ Navigator bar for timeline overview
- ✅ Professional styling with CSS

### Interactive Features
- ✅ **Drag & Drop**: Move jobs between resources and times
- ✅ **Auto-Resequencing**: Automatically eliminates gaps after drops
- ✅ **Job Selection**: Click to select and highlight jobs
- ✅ **Resource Selection**: Click labels to select all future jobs
- ✅ **Rich Tooltips**: Hover for detailed job information
- ✅ **Zoom Controls**: Quick zoom (1w, 1m, 3m, All) from today
- ✅ **Mouse Wheel Zoom**: Scroll to zoom in/out
- ✅ **Shift+Drag Pan**: Hold Shift and drag to pan
- ✅ **Export**: Download as PNG or PDF

### Integration
- ✅ **Dash Integration**: Native Dash component with store sync
- ✅ **Store Sync**: gantt-selected-job-store, gantt-selected-resource-store, drop-payload-store
- ✅ **Event Callbacks**: React to user interactions
- ✅ **API Compatible**: Drop-in replacement for Highcharts implementations

## 📦 Installation

### NPM (JavaScript)
```bash
npm install echarts
```

### Python (Dash)
```bash
pip install dash
```

## 🎯 Quick Start

### Standalone JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <script src="src/gantt-echarts.js"></script>
    <link rel="stylesheet" href="assets/gantt-echarts.css">
</head>
<body>
    <div id="gantt-chart" style="width: 100%; height: 700px;"></div>
    
    <script>
        const gantt = new GanttEchartsScheduler('gantt-chart');
        
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
        ];
        
        const resources = [
            { id: 'resource1', name: 'Team A' }
        ];
        
        gantt.setData(jobs, resources);
    </script>
</body>
</html>
```

### Dash Integration

```python
from gantt_dash import GanttScheduler, create_gantt_callbacks
import dash
from dash import html

app = dash.Dash(__name__)

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
    {'id': 'resource1', 'name': 'Team A'}
]

app.layout = html.Div([
    GanttScheduler(
        id='gantt',
        jobs=jobs,
        resources=resources,
        height='700px'
    )
])

stores = create_gantt_callbacks(app, 'gantt')
app.run_server(debug=True)
```

## 📖 Documentation

- [Complete Documentation](docs/README.md)
- [Migration Guide from Highcharts](docs/MIGRATION.md)
- [API Reference](docs/README.md#api-reference)
- [Examples](examples/)

## 🎨 Live Demo

Open `examples/demo.html` in your browser to see a fully functional demo with:
- 10 sample jobs across 5 resources
- All interactive features enabled
- Real-time event display
- Export functionality

## 🏗️ Project Structure

```
gantt/
├── src/
│   ├── gantt-echarts.js      # Main ECharts implementation
│   └── gantt_dash.py          # Dash component wrapper
├── assets/
│   └── gantt-echarts.css      # Styling
├── examples/
│   └── demo.html              # Standalone demo
├── docs/
│   ├── README.md              # Full documentation
│   └── MIGRATION.md           # Highcharts migration guide
├── package.json
└── README.md
```

## 🔧 Configuration

```javascript
const gantt = new GanttEchartsScheduler('container', {
    // Dash store IDs (optional)
    dashStores: {
        selectedJob: 'gantt-selected-job-store',
        selectedResource: 'gantt-selected-resource-store',
        dropPayload: 'drop-payload-store'
    },
    
    // Color scheme
    colors: {
        job: '#5470c6',
        jobHover: '#7d93e8',
        jobSelected: '#2f4f9f',
        currentDate: '#ff0000',
        gridLine: '#e0e0e0',
        resourceLabel: '#333333'
    },
    
    // Layout
    barHeight: 30,
    rowHeight: 50,
    navigatorHeight: 50
});
```

## 🎯 Auto-Resequencing Algorithm

When a job is dropped on a resource, all jobs on that resource are automatically resequenced:

1. Get all jobs for the resource
2. Sort by start time
3. Assign consecutive sequence numbers (1, 2, 3, ...)
4. If moved from different resource, resequence both resources

This ensures jobs are always properly ordered with no gaps.

## 📊 Performance

Optimized for production use:
- ✅ **100+ jobs**: Smooth rendering and interactions
- ✅ **20+ resources**: No lag or stuttering
- ✅ **Real-time updates**: Minimal re-rendering
- ✅ **Memory efficient**: Proper cleanup and disposal

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ❌ IE11 (not supported due to ECharts 5+)

## 📝 Data Format

### Jobs
```javascript
{
    id: string,           // Unique identifier
    name: string,         // Display name
    resource: string,     // Resource ID
    start: Date,          // Start date/time
    end: Date,            // End date/time
    color: string,        // Hex color code
    sequence: number      // Order within resource
}
```

### Resources
```javascript
{
    id: string,           // Unique identifier
    name: string          // Display name
}
```

## 🔌 Dash Store Events

### Selected Job Store
```javascript
{
    jobId: string,
    name: string,
    resource: string,
    start: string (ISO),
    end: string (ISO)
}
```

### Selected Resource Store
```javascript
{
    resourceId: string,
    resourceName: string,
    futureJobs: array of job IDs
}
```

### Drop Payload Store
```javascript
{
    jobId: string,
    oldResource: string,
    newResource: string,
    newStart: string (ISO),
    newEnd: string (ISO)
}
```

## 🆚 Comparison with Highcharts

| Feature | Highcharts Gantt | ECharts Gantt |
|---------|-----------------|---------------|
| License | Commercial ($590+/year) | Free (Apache 2.0) |
| Performance | Good | Excellent |
| Auto-resequencing | ❌ | ✅ |
| Zoom from today | ❌ | ✅ |
| Resource selection | ❌ | ✅ |
| Native Dash | ❌ | ✅ |
| Customization | Limited | Extensive |

See [Migration Guide](docs/MIGRATION.md) for detailed comparison.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use in commercial and personal projects.

## 🙏 Acknowledgments

- Built with [Apache ECharts](https://echarts.apache.org/)
- Inspired by modern scheduling applications
- Designed for seamless Dash integration

## 📧 Support

- 📖 [Documentation](docs/README.md)
- 🐛 [Report Issues](../../issues)
- 💡 [Feature Requests](../../issues/new)

---

Made with ❤️ for the Dash community
