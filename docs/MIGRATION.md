# Migration Guide: Highcharts to ECharts Gantt Scheduler

## Overview

This guide helps you migrate from a Highcharts-based Gantt implementation to the new Apache ECharts-based scheduler. The ECharts implementation provides better performance, more features, and easier customization.

## Key Differences

### Library Changes

| Aspect | Highcharts | ECharts |
|--------|-----------|---------|
| License | Commercial (paid) | Apache 2.0 (free) |
| Bundle Size | ~350KB | ~320KB |
| Performance | Good | Excellent |
| Customization | Limited | Extensive |
| Animation | Built-in | Configurable |

### Architecture Changes

**Highcharts Approach:**
- Uses Highcharts Gantt module
- Series-based configuration
- Limited custom rendering

**ECharts Approach:**
- Custom series with renderItem
- Full control over rendering
- More flexible architecture

## Migration Steps

### 1. Update Dependencies

**Remove Highcharts:**
```json
// package.json - REMOVE
{
  "dependencies": {
    "highcharts": "^10.x.x",
    "highcharts-gantt": "^10.x.x"
  }
}
```

**Add ECharts:**
```json
// package.json - ADD
{
  "dependencies": {
    "echarts": "^5.4.3"
  }
}
```

**Update HTML:**
```html
<!-- OLD: Highcharts -->
<script src="https://code.highcharts.com/gantt/highcharts-gantt.js"></script>

<!-- NEW: ECharts -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script src="path/to/gantt-echarts.js"></script>
```

### 2. Update Data Structure

**Highcharts Format:**
```javascript
// Highcharts series data
const data = [{
    name: 'Task 1',
    start: Date.UTC(2024, 0, 1),
    end: Date.UTC(2024, 0, 15),
    y: 0,  // Resource index
    color: '#5470c6'
}];
```

**ECharts Format:**
```javascript
// ECharts job format
const jobs = [{
    id: 'job1',
    name: 'Task 1',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-15'),
    resource: 'resource1',  // Resource ID (more flexible)
    color: '#5470c6',
    sequence: 1
}];

const resources = [{
    id: 'resource1',
    name: 'Team A'
}];
```

**Migration Function:**
```javascript
function migrateHighchartsData(highchartsData, categories) {
    const resources = categories.map((name, index) => ({
        id: `resource${index}`,
        name: name
    }));
    
    const jobs = highchartsData.map((item, index) => ({
        id: item.id || `job${index}`,
        name: item.name,
        start: new Date(item.start),
        end: new Date(item.end),
        resource: `resource${item.y}`,
        color: item.color || '#5470c6',
        sequence: index
    }));
    
    return { jobs, resources };
}
```

### 3. Update Initialization Code

**Highcharts Initialization:**
```javascript
// OLD: Highcharts
Highcharts.ganttChart('container', {
    title: { text: 'Gantt Chart' },
    xAxis: { currentDateIndicator: true },
    yAxis: { categories: ['Team A', 'Team B'] },
    series: [{
        name: 'Tasks',
        data: data
    }]
});
```

**ECharts Initialization:**
```javascript
// NEW: ECharts
const gantt = new GanttEchartsScheduler('container', {
    colors: {
        job: '#5470c6',
        currentDate: '#ff0000'
    },
    barHeight: 30
});

gantt.setData(jobs, resources);
```

### 4. Update Event Handlers

**Highcharts Events:**
```javascript
// OLD: Highcharts
series: [{
    point: {
        events: {
            click: function() {
                console.log('Clicked:', this.name);
            },
            drop: function(e) {
                console.log('Dropped:', e);
            }
        }
    }
}]
```

**ECharts Events:**
```javascript
// NEW: ECharts
// Job selection is built-in
gantt.selectJob = function(job) {
    console.log('Selected:', job.name);
    // Your custom logic
};

// Job drop is built-in with auto-resequencing
gantt.handleJobDrop = function(job, targetResource, newStartTime) {
    console.log('Dropped:', job.name, 'to', targetResource.name);
    // Your custom logic
};
```

### 5. Update Drag & Drop

**Highcharts:**
```javascript
// Highcharts has built-in drag-drop but limited customization
series: [{
    dragDrop: {
        draggableX: true,
        draggableY: true
    }
}]
```

**ECharts:**
```javascript
// ECharts implementation includes:
// - Visual feedback during drag
// - Auto-resequencing after drop
// - Cross-resource support
// All built-in, no additional configuration needed
```

### 6. Update Zoom Controls

**Highcharts:**
```javascript
// Manual zoom implementation required
rangeSelector: {
    enabled: true,
    buttons: [{
        type: 'week',
        count: 1,
        text: '1w'
    }]
}
```

**ECharts:**
```javascript
// Built-in zoom controls (1w, 1m, 3m, All)
gantt.setZoom('1w');  // Zooms from today
gantt.setZoom('1m');
gantt.setZoom('3m');
gantt.setZoom('All');
```

### 7. Update Navigator

**Highcharts:**
```javascript
navigator: {
    enabled: true,
    series: { type: 'gantt' }
}
```

**ECharts:**
```javascript
// Navigator is automatically created and synced
// No additional configuration needed
```

### 8. Update Export Functionality

**Highcharts:**
```javascript
// Requires exporting module
exporting: {
    buttons: {
        contextButton: {
            menuItems: ['downloadPNG', 'downloadPDF']
        }
    }
}
```

**ECharts:**
```javascript
// Built-in export methods
gantt.exportToPNG();
gantt.exportToPDF();
```

## API Mapping

### Common Operations

| Operation | Highcharts | ECharts |
|-----------|-----------|---------|
| Set data | `chart.series[0].setData(data)` | `gantt.setData(jobs, resources)` |
| Select item | `point.select()` | `gantt.selectJob(job)` |
| Update item | `point.update({...})` | Update job object + `gantt.render()` |
| Zoom | `chart.xAxis[0].setExtremes(min, max)` | `gantt.setZoom(level)` |
| Export PNG | `chart.exportChart({type: 'image/png'})` | `gantt.exportToPNG()` |
| Export PDF | `chart.exportChart({type: 'application/pdf'})` | `gantt.exportToPDF()` |
| Destroy | `chart.destroy()` | `gantt.destroy()` |

### Options Mapping

| Highcharts Option | ECharts Equivalent |
|-------------------|-------------------|
| `chart.height` | Container height CSS |
| `xAxis.currentDateIndicator` | Built-in red line |
| `yAxis.categories` | `resources` array |
| `series.data` | `jobs` array |
| `series.color` | `job.color` |
| `plotOptions.series.animation` | Not needed (disabled for performance) |

## Dash Integration

### Before (Highcharts)

```python
# Custom Dash component or dash-bootstrap-components
import dash_html_components as html

html.Div([
    html.Div(id='gantt-container'),
    html.Script('''
        // Highcharts initialization code
    ''')
])
```

### After (ECharts)

```python
from gantt_dash import GanttScheduler, create_gantt_callbacks

# Clean, Pythonic component
GanttScheduler(
    id='gantt',
    jobs=jobs,
    resources=resources,
    height='700px'
)

# Built-in callbacks
stores = create_gantt_callbacks(app, 'gantt')
```

## Feature Comparison

| Feature | Highcharts | ECharts |
|---------|-----------|---------|
| Drag & Drop | ✅ Basic | ✅ Advanced + Auto-resequencing |
| Zoom Controls | ⚠️ Manual | ✅ Built-in (1w, 1m, 3m, All) |
| Mouse Wheel Zoom | ❌ | ✅ |
| Shift+Drag Pan | ❌ | ✅ |
| Current Date Line | ✅ | ✅ |
| Navigator | ✅ | ✅ |
| Resource Selection | ❌ | ✅ |
| Future Jobs Selection | ❌ | ✅ |
| Auto-resequencing | ❌ | ✅ |
| Multi-line Labels | ⚠️ Limited | ✅ |
| Dash Integration | ⚠️ Manual | ✅ Native |
| Export PNG/PDF | ✅ (Module required) | ✅ Built-in |
| Performance (100+ jobs) | ⚠️ Moderate | ✅ Excellent |

## Benefits of Migration

### 1. Cost Savings
- Highcharts: Commercial license required ($590+/year)
- ECharts: Free, Apache 2.0 license

### 2. Better Performance
- Faster rendering with 100+ jobs
- Smoother animations
- Lower memory usage

### 3. More Features
- Auto-resequencing algorithm
- Zoom from today (not center)
- Resource selection with future jobs
- Better drag & drop feedback

### 4. Easier Customization
- Full access to rendering pipeline
- Custom series with renderItem
- No license restrictions

### 5. Native Dash Integration
- Purpose-built Dash component
- Clean Python API
- Built-in store integration

## Common Pitfalls

### 1. Date Format
**Issue:** Highcharts uses timestamps, ECharts uses Date objects

**Solution:**
```javascript
// Convert timestamp to Date
const date = new Date(timestamp);

// Or use ISO strings
const date = new Date('2024-01-01T00:00:00');
```

### 2. Resource Indexing
**Issue:** Highcharts uses Y-index, ECharts uses resource IDs

**Solution:**
```javascript
// Create resource ID mapping
const resourceMap = {};
categories.forEach((name, index) => {
    resourceMap[index] = `resource${index}`;
});
```

### 3. Event Handling
**Issue:** Different event API

**Solution:** Override built-in methods instead of adding event listeners
```javascript
gantt.selectJob = function(job) {
    // Your logic here
};
```

## Testing Strategy

1. **Visual Regression Testing**
   - Compare screenshots before/after migration
   - Verify colors, spacing, alignment

2. **Functional Testing**
   - Test all interactions (drag, click, zoom)
   - Verify data updates correctly
   - Check edge cases (empty data, single job, etc.)

3. **Performance Testing**
   - Measure render time with 100+ jobs
   - Test smooth scrolling and zooming
   - Monitor memory usage

4. **Integration Testing**
   - Verify Dash store updates
   - Test callback chains
   - Check data synchronization

## Rollback Plan

If issues arise, you can temporarily rollback:

1. Keep both implementations in parallel
2. Use feature flags to toggle between them
3. Gradually migrate users
4. Monitor for issues

```javascript
const useECharts = window.FEATURE_FLAGS?.useECharts || false;

if (useECharts) {
    // New ECharts implementation
} else {
    // Old Highcharts implementation
}
```

## Support & Resources

- ECharts Documentation: https://echarts.apache.org/en/index.html
- ECharts Examples: https://echarts.apache.org/examples/en/index.html
- GitHub Issues: [repository]/issues
- Migration Support: [contact information]

## Conclusion

Migrating from Highcharts to ECharts provides:
- ✅ Cost savings (free vs. paid)
- ✅ Better performance
- ✅ More features
- ✅ Easier customization
- ✅ Native Dash integration

The migration process is straightforward with this guide, and the benefits are significant. Most projects can complete the migration in 1-2 days.
