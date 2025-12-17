# Architecture Documentation

## Overview

This in-house Gantt chart implementation is built from scratch without any third-party charting dependencies. It uses native SVG for rendering and provides a modular architecture for easy extension.

## Design Principles

1. **Zero Charting Dependencies**: No Highcharts or other proprietary charting libraries
2. **Separation of Concerns**: Clear boundaries between models, rendering, and interaction
3. **Type Safety**: Comprehensive TypeScript interfaces and types
4. **Extensibility**: Modular design allows adding features without modifying core code
5. **Performance**: Efficient rendering using SVG and DOM manipulation

## Core Components

### 1. Data Models (`src/models/`)

Define the structure and configuration for the Gantt chart.

#### Task.ts
- `Task`: Public task interface with dates, dependencies, progress
- `TaskInternal`: Extended with rendering properties (x, y, width, height)

#### Timeline.ts
- `TimelineScale`: Enum for day/week/month scales
- `TimelineConfig`: Timeline display configuration
- `TaskDependency`: Defines relationships between tasks

#### GanttConfig.ts
- Main configuration interface for the chart
- Colors, dimensions, feature toggles

### 2. Rendering Engine (`src/rendering/`)

Responsible for SVG generation and visual representation.

#### TimelineRenderer.ts
- Renders the timeline header with date labels
- Generates vertical grid lines
- Converts between dates and X coordinates
- Supports multiple time scales (day/week/month)

**Key Methods:**
- `renderHeader()`: Draw timeline header
- `renderGrid()`: Draw vertical grid lines
- `dateToX()`: Convert date to pixel position
- `xToDate()`: Convert pixel position to date

#### TaskRenderer.ts
- Renders task bars with colors and labels
- Handles progress indicator overlays
- Calculates task positions based on dates
- Updates task positions during drag operations

**Key Methods:**
- `calculateTaskPositions()`: Position tasks based on dates
- `renderTask()`: Create SVG elements for a single task
- `renderTasks()`: Render all tasks
- `updateTaskPosition()`: Update during drag

#### DependencyRenderer.ts
- Renders arrows between dependent tasks
- Creates SVG paths connecting tasks
- Handles arrowhead markers

**Key Methods:**
- `renderDependencies()`: Draw all dependency arrows
- `createArrowheadMarker()`: Define arrowhead for dependencies

### 3. Interaction Layer (`src/interaction/`)

Manages user interactions with the chart.

#### DragDropHandler.ts
- Implements drag-and-drop for rescheduling tasks
- Calculates new dates based on drag position
- Triggers re-render with updated task positions
- Properly cleans up event listeners

**Event Flow:**
1. `mousedown` → Start drag, store offset
2. `mousemove` → Update visual position
3. `mouseup` → Calculate new dates, update model

#### SelectionHandler.ts
- Handles task selection/deselection
- Updates visual appearance of selected tasks
- Triggers selection callbacks
- Properly cleans up event listeners

### 4. Utilities (`src/utils/`)

Helper functions for common operations.

#### dateUtils.ts
- Date arithmetic (add days, calculate differences)
- Date formatting
- Week/month calculations

#### svgUtils.ts
- SVG element creation with attributes
- DOM manipulation helpers

### 5. Main Orchestrator (`src/GanttChart.ts`)

Coordinates all components and manages the chart lifecycle.

**Responsibilities:**
- Initialize all renderers
- Calculate chart dimensions
- Coordinate rendering pipeline
- Set up interaction handlers
- Provide public API

**Rendering Pipeline:**
1. Calculate dimensions from task data
2. Create/update timeline renderer
3. Render header and grid
4. Calculate task positions
5. Render dependencies (behind tasks)
6. Render tasks
7. Attach interaction handlers

## Extension Points

### Adding New Features

#### 1. Swimlanes/Resource Rows

Create a new renderer in `src/rendering/`:

```typescript
// SwimLaneRenderer.ts
export class SwimLaneRenderer {
  renderSwimLanes(svg: SVGSVGElement, resources: Resource[]): void {
    // Draw horizontal lanes
  }
}
```

Integrate in `GanttChart.ts`:
```typescript
private swimLaneRenderer: SwimLaneRenderer;

render(): void {
  // ... existing code ...
  this.swimLaneRenderer.renderSwimLanes(this.svg, this.resources);
  // ... render tasks in lanes ...
}
```

#### 2. Task Resizing

Extend `DragDropHandler.ts` or create `ResizeHandler.ts`:

```typescript
export class ResizeHandler {
  // Attach to task edges
  // Update task duration on drag
}
```

#### 3. Zoom/Pan Controls

Create `NavigationHandler.ts`:

```typescript
export class NavigationHandler {
  zoom(factor: number): void {
    // Update pixelsPerDay
    // Re-render chart
  }
  
  pan(deltaX: number): void {
    // Update viewport
  }
}
```

#### 4. Milestones

Extend `Task` interface:

```typescript
interface Task {
  // ... existing fields ...
  type?: 'task' | 'milestone';
}
```

Add milestone rendering in `TaskRenderer.ts`:

```typescript
renderMilestone(task: TaskInternal): SVGGElement {
  // Render diamond shape instead of bar
}
```

### Customization Options

#### Custom Colors

```typescript
const gantt = new GanttChart({
  colors: {
    taskBar: '#your-color',
    taskBarSelected: '#your-selected-color',
    // etc.
  }
});
```

#### Custom Time Scales

Extend `TimelineScale`:

```typescript
export enum TimelineScale {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter', // Add new scale
}
```

Update `TimelineRenderer.ts` to handle the new scale.

## Data Flow

```
User Action (click/drag)
    ↓
Interaction Handler (DragDropHandler/SelectionHandler)
    ↓
Update Internal Model (TaskInternal)
    ↓
Trigger Re-render (GanttChart.render())
    ↓
Renderers Update SVG (TimelineRenderer/TaskRenderer/etc.)
    ↓
Visual Update in Browser
```

## Performance Considerations

1. **Incremental Updates**: When possible, update only changed elements instead of full re-render
2. **Virtual Scrolling**: For large datasets, render only visible tasks
3. **Debouncing**: Throttle drag events to reduce render frequency
4. **DOM Reuse**: Reuse existing SVG elements instead of recreating

## Testing Strategy

### Unit Tests
- Test date calculations in `dateUtils.ts`
- Test SVG generation in renderers
- Test interaction logic

### Integration Tests
- Test full rendering pipeline
- Test drag-and-drop workflow
- Test selection behavior

### Manual Testing
- Use the example page in `examples/index.html`
- Test with various data sizes
- Verify cross-browser compatibility

## Future Enhancements

Potential features to add:

1. **Keyboard Navigation**: Arrow keys to navigate tasks
2. **Touch Support**: Mobile drag and drop
3. **Export**: PNG/PDF export functionality
4. **Undo/Redo**: History management
5. **Task Grouping**: Collapsible task groups
6. **Critical Path**: Highlight critical path
7. **Baseline Comparison**: Show baseline vs actual
8. **Resource Allocation**: Track resource usage
9. **Custom Fields**: User-defined task properties
10. **Themes**: Predefined color schemes

## Contributing Guidelines

When adding features:

1. Follow the modular architecture
2. Create new files for new components
3. Add TypeScript interfaces for data structures
4. Update documentation
5. Ensure no third-party charting dependencies
6. Write clean, maintainable code
7. Test thoroughly before committing

## Maintenance

### Regular Tasks
- Update TypeScript definitions as features are added
- Keep documentation in sync with code
- Review and optimize performance periodically
- Update examples with new features

### Debugging
- Use browser DevTools to inspect SVG elements
- Console.log in interaction handlers to trace events
- Check task coordinates and dimensions
- Verify event listener cleanup
