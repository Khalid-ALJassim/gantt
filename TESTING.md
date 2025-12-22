# ECharts Gantt Scheduler - Testing Specification

## Overview

This document outlines the testing approach for the ECharts Gantt Scheduler implementation.

## Test Environment

- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js**: v20.19.6 (for syntax validation)
- **ECharts Version**: 5.4.3

## Unit Tests Status

### JavaScript Syntax Validation ✅
All JavaScript files pass Node.js syntax checks:
- `utils.js` ✅
- `data-transformer.js` ✅
- `tooltip-formatter.js` ✅
- `custom-series.js` ✅
- `selection-manager.js` ✅
- `drag-handler.js` ✅
- `gantt-echarts.js` ✅
- `render_schedule_echarts.js` ✅

## Manual Testing Checklist

### Visual Features
- [ ] Resource rows display correctly on Y-axis
- [ ] Timeline displays correctly on X-axis with proper date formatting
- [ ] Job bars render with:
  - [ ] Correct colors
  - [ ] Job ID/name on first line
  - [ ] Scope on second line
  - [ ] Team badge on third line
  - [ ] Rounded corners (6px)
  - [ ] Proper border styling
- [ ] Current date indicator (red vertical line) appears if today is in view
- [ ] Tooltips display rich information on hover
- [ ] All text is readable and properly positioned

### Interactive Features - Drag & Drop
- [ ] Jobs can be dragged horizontally
- [ ] Jobs can be dragged vertically to different resources
- [ ] During drag, job shows dragging opacity (0.8)
- [ ] During drag, other jobs are dimmed (opacity 0.3)
- [ ] On drop, auto-resequencing occurs:
  - [ ] Jobs on target resource become consecutive
  - [ ] Jobs on source resource (if different) become consecutive
  - [ ] No gaps between jobs on same resource
- [ ] Drop event syncs to `drop-payload-store`
- [ ] Cursor changes to 'move' when hovering over jobs in edit mode

### Interactive Features - Selection
- [ ] Clicking a job toggles its selection state
- [ ] Selected jobs show red border (3px)
- [ ] Unselected jobs show default border (1px)
- [ ] Multiple jobs can be selected simultaneously
- [ ] Clicking resource label selects all future jobs on that resource
  - [ ] Skips current job and next job (today+1)
  - [ ] Properly sorts jobs by start time
- [ ] Clicking selected resource label deselects all jobs
- [ ] Selection state syncs to `gantt-selected-job-store`
- [ ] Selection state syncs to `gantt-selected-resource-store`

### Interactive Features - Zoom & Pan
- [ ] Mouse wheel zooms the timeline
- [ ] Shift + drag pans the view
- [ ] Zoom slider at bottom works correctly
- [ ] Preset zoom buttons work:
  - [ ] 1w (1 week from today)
  - [ ] 1m (1 month from today)
  - [ ] 3m (3 months from today)
  - [ ] All (show full range)
- [ ] Zoom maintains center focus
- [ ] Pan respects timeline boundaries

### Interactive Features - Export
- [ ] PNG export works and downloads file
- [ ] JPEG export works and downloads file
- [ ] SVG export works and downloads file
- [ ] Exported images have correct dimensions
- [ ] Exported images include all visible elements
- [ ] File naming includes date

### Data Management
- [ ] Jobs transform correctly from Highcharts format
- [ ] Resources display in correct order
- [ ] View range calculates correctly with padding
- [ ] Jobs grouped by resource correctly
- [ ] Start/end times display in correct timezone
- [ ] Duration calculations are accurate

### Dash Integration
- [ ] `render` callback initializes chart with retry logic
- [ ] Chart updates when options change
- [ ] AIO ID correctly identifies chart instance
- [ ] Store updates trigger without errors
- [ ] Multiple charts can coexist on same page
- [ ] Chart cleanup (destroy) works properly

### Performance
- [ ] Chart renders 100 jobs in < 100ms
- [ ] Drag interaction is smooth (60fps)
- [ ] Selection toggle is instant
- [ ] Zoom/pan is smooth
- [ ] Memory usage stays stable during interactions
- [ ] No memory leaks on destroy

### Edge Cases
- [ ] Empty jobs array renders without error
- [ ] Empty resources array renders without error
- [ ] Single job renders correctly
- [ ] Job with zero duration handles gracefully
- [ ] Very long job names truncate with ellipsis
- [ ] Overlapping jobs on same resource handle correctly
- [ ] Jobs outside view range don't cause issues
- [ ] Negative durations are prevented
- [ ] Invalid dates are handled gracefully

### Browser Compatibility
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Chrome: Touch interactions work
- [ ] Mobile Safari: Touch interactions work

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces job details
- [ ] High contrast mode works
- [ ] Focus indicators are visible
- [ ] ARIA labels are present

## Automated Testing (Future)

### Unit Tests (Jest)
- Data transformation functions
- Utility functions (formatDate, getDurationInDays, etc.)
- Selection state management
- Resequencing algorithm

### Integration Tests (Playwright)
- Full drag & drop workflow
- Selection workflow
- Zoom/pan workflow
- Dash store synchronization

### E2E Tests (Cypress)
- Complete user journey
- Multi-chart scenarios
- Error handling

## Test Data

### Sample Jobs
```javascript
[
  {
    id: 'WO-001',
    name: 'Site Preparation',
    resource: 'GNDC-S1',
    y: 0,
    x: Date.now() - 5 * 24 * 60 * 60 * 1000,
    x2: Date.now() + 10 * 24 * 60 * 60 * 1000,
    color: '#3498db',
    scope: 'Foundation Work',
    team: 'TEAM-A',
    location: 'Site-1'
  }
  // ... more jobs
]
```

### Sample Resources
```javascript
['GNDC-S1', 'GNDC-S2', 'ST-60', 'MR-45']
```

## Known Limitations

1. **Touch Drag**: Touch drag on mobile may need additional polyfills
2. **IE Support**: Internet Explorer is not supported (requires modern ES6+ features)
3. **Custom Fonts**: Some fonts may affect text truncation calculations
4. **Timezone**: All dates are in local timezone, UTC support requires additional work

## Success Criteria

✅ All JavaScript files have valid syntax
⏳ Manual testing of demo.html shows all features working
⏳ No console errors during normal operation
⏳ Performance meets benchmarks (< 100ms render time)
⏳ Dash integration works with sample app

## Testing Results

### Run 1 (Initial Implementation)
- Date: 2025-12-22
- JavaScript Syntax: ✅ PASSED
- Demo Accessibility: ✅ PASSED
- Manual Testing: ⏳ PENDING
- Integration Testing: ⏳ PENDING

## Recommendations

1. **Implement unit tests** for utility and transformation functions
2. **Add integration tests** using Playwright for drag & drop
3. **Create E2E tests** for complete workflows
4. **Add performance benchmarks** to CI/CD pipeline
5. **Test with real data** from production environment
