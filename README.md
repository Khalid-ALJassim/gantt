# Apache ECharts Gantt Scheduler

A modern, high-performance Gantt chart scheduler built with Apache ECharts, designed for seamless integration with Dash applications.

## Overview

This project provides a complete replacement for Highcharts-based Gantt schedulers, offering:

- **Open Source**: MIT License with no licensing concerns
- **High Performance**: Canvas rendering handles large datasets efficiently
- **Rich Interactions**: Drag & drop, selection, zoom, pan, and export
- **Dash Integration**: Drop-in replacement for existing Highcharts implementations
- **Small Bundle**: ~300KB minified, tree-shakeable
- **Active Development**: Built on Apache ECharts, maintained by Apache Foundation

## Quick Start

### Standalone Demo

Open `demo.html` in your browser to see the scheduler in action with sample data.

### With Dash

```python
from dash import Dash, html, dcc, Input, Output, clientside_callback

app = Dash(__name__)

app.layout = html.Div([
    html.Div(id='gantt-chart', className='gantt-chart-container'),
    dcc.Store(id='gantt-options'),
    dcc.Store(id='gantt-selected-job-store'),
    dcc.Store(id='gantt-selected-resource-store'),
    dcc.Store(id='drop-payload-store')
])

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

## Features

### Visual
- Resource rows (Y-axis swim lanes)
- Timeline (X-axis with multiple zoom levels)
- Colored job bars with labels
- Current date indicator
- Rich tooltips

### Interactive
- **Drag & Drop**: Reschedule jobs horizontally, reassign resources vertically
- **Auto-Resequencing**: Jobs are automatically made consecutive with no gaps
- **Selection**: Click jobs or resource labels to select
- **Zoom & Pan**: Mouse wheel zoom, shift+drag pan, preset zoom buttons
- **Export**: PNG, JPEG, SVG downloads

## Documentation

See [ECHARTS_GANTT_README.md](./ECHARTS_GANTT_README.md) for comprehensive documentation including:
- Installation instructions
- API reference
- Data format specifications
- Migration guide from Highcharts
- Styling customization
- Performance optimization tips

## Project Structure

```
gantt/
├── static/js/gantt/
│   ├── echarts/
│   │   ├── utils.js                    # Helper utilities
│   │   ├── data-transformer.js         # Data format transformation
│   │   ├── tooltip-formatter.js        # Tooltip rendering
│   │   ├── custom-series.js            # Custom Gantt bar renderer
│   │   ├── selection-manager.js        # Selection state management
│   │   ├── drag-handler.js             # Drag & drop logic
│   │   └── gantt-echarts.js            # Main wrapper class
│   ├── styles/
│   │   └── gantt-echarts.css           # Stylesheet
│   └── render_schedule_echarts.js      # Dash integration
├── demo.html                           # Standalone demo
├── package.json                        # Dependencies
├── README.md                           # This file
└── ECHARTS_GANTT_README.md            # Full documentation
```

## Installation

```bash
npm install
```

Or use CDN for ECharts:

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
```

## License

MIT License - Free for commercial and personal use

## Why ECharts?

- **No Licensing Issues**: MIT license vs Highcharts' commercial license
- **Better Performance**: Canvas rendering, optimized for 1000+ jobs
- **Smaller Bundle**: 300KB vs 500KB+
- **Active Development**: Apache Foundation backing
- **Flexible API**: Complete control over rendering with `renderItem`
- **Built-in Features**: Zoom, pan, export included

## Credits

Built with [Apache ECharts](https://echarts.apache.org/)
