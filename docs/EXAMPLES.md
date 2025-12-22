# Usage Examples for Gantt ECharts Scheduler

This file provides practical examples of how to use the Gantt ECharts Scheduler in various scenarios.

## Example 1: Basic Usage (Standalone HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Basic Gantt Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <script src="path/to/gantt-echarts.js"></script>
    <link rel="stylesheet" href="path/to/gantt-echarts.css">
</head>
<body>
    <div id="gantt-chart" style="width: 100%; height: 700px;"></div>
    
    <script>
        // Initialize the scheduler
        const gantt = new GanttEchartsScheduler('gantt-chart');
        
        // Define your jobs
        const jobs = [
            {
                id: 'job1',
                name: 'Design Phase',
                resource: 'design-team',
                start: new Date('2024-01-01'),
                end: new Date('2024-01-15'),
                color: '#5470c6',
                sequence: 1
            },
            {
                id: 'job2',
                name: 'Development Phase',
                resource: 'dev-team',
                start: new Date('2024-01-10'),
                end: new Date('2024-02-15'),
                color: '#91cc75',
                sequence: 1
            }
        ];
        
        // Define your resources
        const resources = [
            { id: 'design-team', name: 'Design Team' },
            { id: 'dev-team', name: 'Development Team' }
        ];
        
        // Set data and render
        gantt.setData(jobs, resources);
    </script>
</body>
</html>
```

## Example 2: With Custom Configuration

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart', {
    // Custom colors
    colors: {
        job: '#3498db',
        jobHover: '#5dade2',
        jobSelected: '#1f618d',
        currentDate: '#e74c3c',
        gridLine: '#ecf0f1',
        resourceLabel: '#2c3e50'
    },
    
    // Custom dimensions
    barHeight: 35,
    rowHeight: 60,
    navigatorHeight: 60
});

gantt.setData(jobs, resources);
```

## Example 3: Dash Integration

```python
import dash
from dash import html, dcc
from gantt_dash import GanttScheduler, create_gantt_callbacks
from datetime import datetime, timedelta

app = dash.Dash(__name__)

# Prepare data
today = datetime.now()
jobs = [
    {
        'id': 'job1',
        'name': 'Project Planning',
        'resource': 'pm-team',
        'start': today.isoformat(),
        'end': (today + timedelta(days=7)).isoformat(),
        'color': '#3498db',
        'sequence': 1
    },
    {
        'id': 'job2',
        'name': 'Development Sprint 1',
        'resource': 'dev-team',
        'start': (today + timedelta(days=8)).isoformat(),
        'end': (today + timedelta(days=22)).isoformat(),
        'color': '#2ecc71',
        'sequence': 1
    }
]

resources = [
    {'id': 'pm-team', 'name': 'Project Management'},
    {'id': 'dev-team', 'name': 'Development Team'}
]

# Create layout
app.layout = html.Div([
    html.H1('Project Schedule'),
    
    GanttScheduler(
        id='project-gantt',
        jobs=jobs,
        resources=resources,
        height='600px'
    ),
    
    html.Div(id='selection-output')
])

# Create callbacks
stores = create_gantt_callbacks(app, 'project-gantt')

# React to job selection
@app.callback(
    dash.dependencies.Output('selection-output', 'children'),
    dash.dependencies.Input(stores['selected_job'], 'data')
)
def display_selected_job(job_data):
    if job_data:
        return html.Div([
            html.H3(f"Selected: {job_data['name']}"),
            html.P(f"Resource: {job_data['resource']}"),
            html.P(f"Start: {job_data['start']}"),
            html.P(f"End: {job_data['end']}")
        ])
    return html.P("No job selected")

if __name__ == '__main__':
    app.run_server(debug=True)
```

## Example 4: Handling Drag & Drop Events

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart');
gantt.setData(jobs, resources);

// Override the drop handler to add custom logic
const originalDropHandler = gantt.handleJobDrop.bind(gantt);
gantt.handleJobDrop = function(job, targetResource, newStartTime) {
    // Custom validation
    if (newStartTime < new Date()) {
        alert('Cannot schedule jobs in the past!');
        return;
    }
    
    // Call original handler
    originalDropHandler(job, targetResource, newStartTime);
    
    // Custom post-processing
    console.log(`Job ${job.name} moved to ${targetResource.name}`);
    
    // Send to backend
    fetch('/api/update-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jobId: job.id,
            newResource: targetResource.id,
            newStart: newStartTime.toISOString(),
            newEnd: job.end.toISOString()
        })
    });
};
```

## Example 5: Dynamic Data Updates

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart');
gantt.setData(jobs, resources);

// Function to add a new job
function addJob(jobData) {
    gantt.data.jobs.push({
        id: jobData.id,
        name: jobData.name,
        resource: jobData.resource,
        start: new Date(jobData.start),
        end: new Date(jobData.end),
        color: jobData.color || '#5470c6',
        sequence: gantt.data.jobs.filter(j => j.resource === jobData.resource).length + 1
    });
    gantt.render();
}

// Function to remove a job
function removeJob(jobId) {
    gantt.data.jobs = gantt.data.jobs.filter(j => j.id !== jobId);
    gantt.render();
}

// Function to update a job
function updateJob(jobId, updates) {
    const job = gantt.data.jobs.find(j => j.id === jobId);
    if (job) {
        Object.assign(job, updates);
        if (updates.start) job.start = new Date(updates.start);
        if (updates.end) job.end = new Date(updates.end);
        gantt.render();
    }
}

// Example usage
addJob({
    id: 'new-job',
    name: 'New Task',
    resource: 'dev-team',
    start: '2024-03-01',
    end: '2024-03-15',
    color: '#e74c3c'
});
```

## Example 6: With Export Functionality

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart');
gantt.setData(jobs, resources);

// Export to PNG
document.getElementById('export-png-btn').addEventListener('click', () => {
    gantt.exportToPNG();
});

// Export to PDF
document.getElementById('export-pdf-btn').addEventListener('click', () => {
    gantt.exportToPDF();
});

// Custom export with filename
function exportWithCustomName() {
    const url = gantt.chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
    });
    
    const link = document.createElement('a');
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
    link.href = url;
    link.click();
}
```

## Example 7: Programmatic Zoom Control

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart');
gantt.setData(jobs, resources);

// Set zoom level programmatically
gantt.setZoom('1m');  // Show 1 month from today

// Create custom zoom buttons
document.getElementById('zoom-week').addEventListener('click', () => {
    gantt.setZoom('1w');
});

document.getElementById('zoom-month').addEventListener('click', () => {
    gantt.setZoom('1m');
});

document.getElementById('zoom-quarter').addEventListener('click', () => {
    gantt.setZoom('3m');
});

document.getElementById('zoom-all').addEventListener('click', () => {
    gantt.setZoom('All');
});
```

## Example 8: Advanced Dash Integration with Real-time Updates

```python
import dash
from dash import html, dcc, Input, Output, State
from gantt_dash import GanttScheduler, create_gantt_callbacks
import json

app = dash.Dash(__name__)

# Initial data store
app.layout = html.Div([
    html.H1('Real-time Project Schedule'),
    
    dcc.Store(id='jobs-store', data=initial_jobs),
    dcc.Store(id='resources-store', data=initial_resources),
    
    GanttScheduler(
        id='gantt',
        jobs=initial_jobs,
        resources=initial_resources,
        height='700px'
    ),
    
    html.Div([
        html.Button('Add Job', id='add-job-btn'),
        html.Button('Remove Selected', id='remove-job-btn'),
        html.Button('Refresh Data', id='refresh-btn')
    ]),
    
    dcc.Interval(id='interval', interval=60000, n_intervals=0)  # Refresh every minute
])

stores = create_gantt_callbacks(app, 'gantt')

@app.callback(
    Output('jobs-store', 'data'),
    Input('refresh-btn', 'n_clicks'),
    Input('interval', 'n_intervals'),
    prevent_initial_call=True
)
def refresh_jobs(n_clicks, n_intervals):
    # Fetch updated jobs from database/API
    updated_jobs = fetch_jobs_from_backend()
    return updated_jobs

@app.callback(
    Output('gantt', 'jobs'),
    Input('jobs-store', 'data')
)
def update_gantt_jobs(jobs_data):
    return jobs_data

@app.callback(
    Output('jobs-store', 'data', allow_duplicate=True),
    Input(stores['drop_payload'], 'data'),
    State('jobs-store', 'data'),
    prevent_initial_call=True
)
def handle_job_drop(drop_data, current_jobs):
    if drop_data:
        # Update the job in the store
        for job in current_jobs:
            if job['id'] == drop_data['jobId']:
                job['resource'] = drop_data['newResource']
                job['start'] = drop_data['newStart']
                job['end'] = drop_data['newEnd']
                
        # Persist to backend
        save_jobs_to_backend(current_jobs)
        
    return current_jobs

if __name__ == '__main__':
    app.run_server(debug=True)
```

## Example 9: With Custom Tooltips

```javascript
const gantt = new GanttEchartsScheduler('gantt-chart');
gantt.setData(jobs, resources);

// The tooltip is already configured, but you can access the chart to customize it
const option = gantt.chart.getOption();
option.tooltip = {
    formatter: (params) => {
        if (params.componentType === 'series') {
            const job = params.data.jobData;
            return `
                <div style="padding: 10px;">
                    <strong style="font-size: 14px;">${job.name}</strong><br/>
                    <hr style="margin: 5px 0;"/>
                    <strong>Resource:</strong> ${job.resource}<br/>
                    <strong>Start:</strong> ${gantt.formatDate(job.start)}<br/>
                    <strong>End:</strong> ${gantt.formatDate(job.end)}<br/>
                    <strong>Duration:</strong> ${gantt.getDuration(job.start, job.end)}<br/>
                    <strong>Status:</strong> ${job.status || 'In Progress'}
                </div>
            `;
        }
        return '';
    }
};
gantt.chart.setOption(option);
```

## Example 10: Loading Data from API

```javascript
async function initializeGantt() {
    const gantt = new GanttEchartsScheduler('gantt-chart');
    
    // Show loading state
    document.getElementById('gantt-chart').innerHTML = '<div class="gantt-loading">Loading...</div>';
    
    try {
        // Fetch data from API
        const [jobsResponse, resourcesResponse] = await Promise.all([
            fetch('/api/jobs'),
            fetch('/api/resources')
        ]);
        
        const jobs = await jobsResponse.json();
        const resources = await resourcesResponse.json();
        
        // Transform data if needed
        const transformedJobs = jobs.map(job => ({
            ...job,
            start: new Date(job.start),
            end: new Date(job.end)
        }));
        
        // Set data and render
        gantt.setData(transformedJobs, resources);
        
    } catch (error) {
        console.error('Error loading gantt data:', error);
        document.getElementById('gantt-chart').innerHTML = '<div class="gantt-empty">Failed to load data</div>';
    }
}

// Initialize on page load
initializeGantt();
```

## Notes

- All dates should be JavaScript `Date` objects in the JavaScript implementation
- For Dash integration, use ISO 8601 date strings
- Job IDs and Resource IDs should be unique
- Sequence numbers are used for ordering jobs within a resource
- Colors should be hex codes (e.g., '#5470c6')
- The scheduler automatically handles responsive resizing

For more information, see the full documentation at `docs/README.md`.
