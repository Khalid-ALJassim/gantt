# Custom Gantt Scheduler POC

A proof-of-concept implementation of a custom Gantt scheduler without external charting dependencies.

## Overview

This repository contains a complete proof-of-concept for a custom Gantt scheduler that replaces Highcharts with a pure JavaScript, Canvas-based solution. It demonstrates all core features including drag-and-drop, selection, tooltips, zoom controls, and auto-resequencing.

## Features

✅ Canvas-based rendering for high performance  
✅ Drag-and-drop jobs with auto-resequencing  
✅ Job and resource selection  
✅ Rich hover tooltips  
✅ Zoom controls (1w, 1m, 3m, All)  
✅ Current date indicator  
✅ Dash-compatible integration layer  
✅ Zero external dependencies  

## Quick Start

### View the Demo

1. Start a local HTTP server:
   ```bash
   cd static/js/gantt/demo
   python3 -m http.server 8000
   ```

2. Open in browser:
   ```
   http://localhost:8000/index.html
   ```

### Try It Out

- Click on job bars to select them
- Drag jobs to move them between resources or change dates
- Use zoom controls to adjust the view
- Hover over jobs for detailed tooltips
- Click resource labels to select future jobs

## Documentation

- **[README](docs/README.md)** - Complete POC documentation
- **[ARCHITECTURE](docs/ARCHITECTURE.md)** - System architecture
- **[INTEGRATION](docs/INTEGRATION.md)** - Integration guide for Dash

## Project Structure

```
static/js/gantt/
├── poc/                    # Core modules
│   ├── gantt-scheduler.js  # Main controller
│   ├── canvas-renderer.js  # Rendering engine
│   ├── timeline.js         # Time calculations
│   ├── state-manager.js    # State management
│   ├── drag-drop.js        # Drag-and-drop
│   ├── selection.js        # Selection logic
│   ├── tooltip.js          # Tooltips
│   ├── svg-overlay.js      # Overlays
│   └── utils.js            # Utilities
├── demo/                   # Standalone demo
│   ├── index.html
│   ├── sample-data.js
│   └── styles.css
└── render_schedule_custom.js  # Dash wrapper

docs/                       # Documentation
├── README.md
├── ARCHITECTURE.md
└── INTEGRATION.md
```

## Key Technologies

- **HTML5 Canvas** - High-performance rendering
- **ES6 Modules** - Modern JavaScript
- **SVG** - Interactive overlays
- **Zero Dependencies** - No external libraries

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

This POC validates the approach. For production use:

1. Add comprehensive tests
2. Implement remaining features (touch support, keyboard navigation)
3. Add accessibility features
4. Optimize performance for large datasets
5. Create production build process

## License

[Your License Here]
