# Custom Gantt Scheduler - Architecture Documentation

## Overview

The Custom Gantt Scheduler is a pure JavaScript implementation that replaces Highcharts-based Gantt charts with a custom, dependency-free solution. It uses HTML5 Canvas for high-performance rendering and provides full interactive capabilities including drag-and-drop, selection, tooltips, and zoom controls.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     GanttScheduler                           │
│                   (Main Controller)                          │
└─────────────────────────────────────────────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
┌─────▼─────┐        ┌──────▼──────┐       ┌──────▼──────┐
│ Timeline  │        │   State     │       │   Canvas    │
│           │        │  Manager    │       │  Renderer   │
└───────────┘        └─────────────┘       └─────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
┌─────▼─────┐        ┌──────▼──────┐       ┌──────▼──────┐
│ DragDrop  │        │ Selection   │       │  Tooltip    │
└───────────┘        └─────────────┘       └─────────────┘
      │                      │
      └──────────────────────┘
               │
        ┌──────▼──────┐
        │ SVG Overlay │
        └─────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Event-Driven**: State changes propagate through events
3. **Centralized State**: StateManager holds all mutable state
4. **Rendering Pipeline**: Clear separation between data and presentation
5. **Canvas-First**: High-performance rendering with Canvas 2D API
6. **Zero Dependencies**: No external libraries required

## Module Reference

See individual module files for detailed JSDoc documentation. Key modules:
- `gantt-scheduler.js` - Main controller
- `canvas-renderer.js` - Rendering engine
- `timeline.js` - Time/space calculations
- `state-manager.js` - State and events
- `drag-drop.js` - Drag-and-drop logic
- `selection.js` - Selection management
- `tooltip.js` - Hover tooltips
- `svg-overlay.js` - Interactive overlays
- `utils.js` - Shared utilities

## Data Structure

### Job Object
```javascript
{
  id: "W-113",
  name: "W-113",
  scope: "Re Completion",
  team: "WRO",
  start: 1703116800000,  // Unix timestamp (ms)
  end: 1703548800000,
  y: 0,                  // Resource index
  color: "#ff8787",
  estGain: "200 BOPD",
  optMethod: "ESP",
  location: "Kuwait",
  locationIcon: "🌍",
  bopdRigHour: "50",
  secondaryScope: ["ESP", "Acid"]
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES6+ JavaScript support.
