# In-House Gantt Chart Implementation

A custom-built, dependency-free Gantt chart library built from scratch without relying on Highcharts or any third-party charting libraries. This implementation provides complete control over rendering, interactions, and data management.

## Features

✨ **Core Capabilities:**
- **Custom SVG Rendering**: Built from the ground up with SVG for crisp, scalable visualizations
- **Drag and Drop**: Full support for dragging tasks to reschedule them
- **Task Selection**: Click to select/deselect tasks with visual feedback
- **Dependencies**: Visualize task relationships with automatic arrow rendering
- **Progress Tracking**: Display progress bars within task bars
- **Flexible Timeline**: Support for day, week, and month scales
- **Modular Architecture**: Extensible design for adding custom features

🔧 **Technical Highlights:**
- Zero third-party charting dependencies
- TypeScript support with full type definitions
- Event-driven interaction system
- Clean separation of concerns (models, rendering, interaction)
- Fully customizable appearance

## Installation

```bash
npm install
npm run build
```

## Quick Start

```typescript
import { GanttChart, TimelineScale } from '@gantt/core';

// Define your tasks
const tasks = [
  {
    id: 'task-1',
    name: 'Project Planning',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-10'),
    progress: 100,
  },
  {
    id: 'task-2',
    name: 'Development',
    start: new Date('2024-01-08'),
    end: new Date('2024-01-20'),
    progress: 50,
    dependencies: ['task-1'],
  },
];

// Define dependencies
const dependencies = [
  { fromTaskId: 'task-1', toTaskId: 'task-2' },
];

// Create Gantt chart
const gantt = new GanttChart({
  container: '#gantt-container',
  timeline: {
    scale: TimelineScale.DAY,
    pixelsPerDay: 30,
  },
  enableDragDrop: true,
  enableSelection: true,
});

gantt.setTasks(tasks);
gantt.setDependencies(dependencies);
```

## Configuration Options

```typescript
interface GanttConfig {
  container: HTMLElement | string;        // Container element or selector
  timeline?: {
    scale: TimelineScale;                 // DAY, WEEK, or MONTH
    pixelsPerDay?: number;                // Default: 40
  };
  taskHeight?: number;                    // Default: 30
  taskPadding?: number;                   // Default: 5
  headerHeight?: number;                  // Default: 60
  rowHeight?: number;                     // Default: 50
  colors?: {
    taskBar?: string;                     // Default: '#4CAF50'
    taskBarHover?: string;
    taskBarSelected?: string;
    taskBarProgress?: string;
    grid?: string;
    dependency?: string;
  };
  enableDragDrop?: boolean;               // Default: true
  enableSelection?: boolean;              // Default: true
}
```

## API Reference

### GanttChart Methods

- `setTasks(tasks: Task[])` - Set the tasks to display
- `setDependencies(dependencies: TaskDependency[])` - Set task dependencies
- `getTasks()` - Get all tasks
- `getTask(id: string)` - Get a specific task by ID
- `updateTask(id: string, updates: Partial<Task>)` - Update a task
- `render()` - Re-render the chart
- `destroy()` - Clean up and remove the chart

### Task Interface

```typescript
interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number;          // 0-100
  dependencies?: string[];    // Task IDs
  color?: string;
  description?: string;
}
```

### TaskDependency Interface

```typescript
interface TaskDependency {
  fromTaskId: string;
  toTaskId: string;
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}
```

## Architecture

The library is organized into modular components:

```
src/
├── models/           # Data models and interfaces
│   ├── Task.ts
│   ├── Timeline.ts
│   └── GanttConfig.ts
├── rendering/        # Rendering components
│   ├── TimelineRenderer.ts
│   ├── TaskRenderer.ts
│   └── DependencyRenderer.ts
├── interaction/      # User interaction handlers
│   ├── DragDropHandler.ts
│   └── SelectionHandler.ts
├── utils/           # Utility functions
│   ├── dateUtils.ts
│   └── svgUtils.ts
└── GanttChart.ts    # Main chart orchestrator
```

### Component Responsibilities

- **Models**: Define data structures and configuration interfaces
- **Rendering**: Handle SVG generation and visual representation
- **Interaction**: Manage user events (drag, click, hover)
- **Utils**: Provide reusable helper functions
- **GanttChart**: Main class that coordinates all components

## Demo

To run the demo:

```bash
npm install
npm run build
npm run example
```

Then open your browser to view the interactive demo.

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch for changes
npm run dev
```

## Browser Support

Modern browsers with ES2020 and SVG support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

This is an in-house implementation. Contributions should follow the established architecture and maintain the zero-dependency philosophy for charting libraries.

## Design Decisions

### Why SVG?
- Vector graphics scale perfectly at any zoom level
- DOM manipulation provides fine-grained control
- Native browser support without additional dependencies
- Easy to style and animate with CSS

### Why No External Charting Library?
- Full control over features and rendering
- No licensing concerns
- Smaller bundle size
- Custom features without workarounds
- Complete source code ownership

### Modular Architecture
Each subsystem (rendering, interaction, data) is independent and can be extended or replaced without affecting others. This makes the codebase maintainable and testable.
