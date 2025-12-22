"""
Example Dash Application with ECharts Gantt Scheduler

This demonstrates how to integrate the ECharts Gantt scheduler
into a Dash application.

Requirements:
    pip install dash

Run:
    python example_dash_app.py
"""

from dash import Dash, html, dcc, Input, Output, State, clientside_callback
import json
from datetime import datetime, timedelta

# Initialize Dash app
app = Dash(
    __name__,
    suppress_callback_exceptions=True
)

# Sample data generator
def generate_sample_data():
    """Generate sample Gantt chart data"""
    now = datetime.now().timestamp() * 1000  # Convert to milliseconds
    day_ms = 24 * 60 * 60 * 1000
    
    resources = ['GNDC-S1', 'GNDC-S2', 'ST-60', 'MR-45', 'WR-15']
    
    jobs = [
        {
            'id': 'WO-001',
            'name': 'Site Preparation',
            'y': 0,
            'x': now - 5 * day_ms,
            'x2': now + 10 * day_ms,
            'color': '#3498db',
            'scope': 'Foundation Work',
            'team': 'TEAM-A',
            'location': 'Site-1',
            'duration': 15
        },
        {
            'id': 'WO-002',
            'name': 'Equipment Installation',
            'y': 0,
            'x': now + 10 * day_ms,
            'x2': now + 25 * day_ms,
            'color': '#e74c3c',
            'scope': 'Mechanical',
            'team': 'TEAM-B',
            'location': 'Site-1',
            'duration': 15
        },
        {
            'id': 'WO-003',
            'name': 'Structural Reinforcement',
            'y': 1,
            'x': now - 10 * day_ms,
            'x2': now + 5 * day_ms,
            'color': '#2ecc71',
            'scope': 'Structural',
            'team': 'TEAM-C',
            'location': 'Site-2',
            'duration': 15
        },
        {
            'id': 'WO-004',
            'name': 'Electrical Works',
            'y': 1,
            'x': now + 5 * day_ms,
            'x2': now + 18 * day_ms,
            'color': '#f39c12',
            'scope': 'Electrical',
            'team': 'TEAM-D',
            'location': 'Site-2',
            'duration': 13
        },
        {
            'id': 'WO-005',
            'name': 'Pipeline Inspection',
            'y': 2,
            'x': now - 3 * day_ms,
            'x2': now + 12 * day_ms,
            'color': '#9b59b6',
            'scope': 'Inspection',
            'team': 'TEAM-A',
            'location': 'Site-3',
            'duration': 15
        },
        {
            'id': 'WO-006',
            'name': 'Valve Replacement',
            'y': 2,
            'x': now + 12 * day_ms,
            'x2': now + 20 * day_ms,
            'color': '#1abc9c',
            'scope': 'Mechanical',
            'team': 'TEAM-B',
            'location': 'Site-3',
            'duration': 8
        },
        {
            'id': 'WO-007',
            'name': 'Painting & Coating',
            'y': 3,
            'x': now + 2 * day_ms,
            'x2': now + 15 * day_ms,
            'color': '#e67e22',
            'scope': 'Surface Treatment',
            'team': 'TEAM-C',
            'location': 'Site-4',
            'duration': 13
        },
        {
            'id': 'WO-008',
            'name': 'Quality Testing',
            'y': 3,
            'x': now + 15 * day_ms,
            'x2': now + 22 * day_ms,
            'color': '#34495e',
            'scope': 'Quality Control',
            'team': 'TEAM-D',
            'location': 'Site-4',
            'duration': 7
        },
        {
            'id': 'WO-009',
            'name': 'Final Inspection',
            'y': 4,
            'x': now + 5 * day_ms,
            'x2': now + 10 * day_ms,
            'color': '#16a085',
            'scope': 'QA/QC',
            'team': 'TEAM-A',
            'location': 'Site-5',
            'duration': 5
        },
        {
            'id': 'WO-010',
            'name': 'Documentation',
            'y': 4,
            'x': now + 10 * day_ms,
            'x2': now + 17 * day_ms,
            'color': '#8e44ad',
            'scope': 'Administrative',
            'team': 'TEAM-B',
            'location': 'Office',
            'duration': 7
        }
    ]
    
    return {
        'series': [{'data': jobs}],
        'yAxis': {'categories': resources},
        'xAxis': {
            'min': now - 15 * day_ms,
            'max': now + 30 * day_ms
        },
        'second_line': 'scope',
        'third_line': ['team', 'location']
    }

# App layout
app.layout = html.Div([
    # Header
    html.Div([
        html.H1('ECharts Gantt Scheduler Demo'),
        html.P('Interactive Gantt chart with drag & drop, selection, and zoom'),
    ], style={
        'padding': '20px',
        'backgroundColor': '#ffffff',
        'borderRadius': '8px',
        'marginBottom': '20px',
        'boxShadow': '0 1px 3px rgba(0,0,0,0.1)'
    }),
    
    # Controls
    html.Div([
        html.Div([
            html.Label('Edit Mode:', style={'marginRight': '10px', 'fontWeight': '500'}),
            dcc.RadioItems(
                id='edit-mode',
                options=[
                    {'label': 'View Only', 'value': False},
                    {'label': 'Editable', 'value': True}
                ],
                value=True,
                inline=True
            )
        ], style={'marginBottom': '10px'}),
        
        html.Button('Clear Selection', id='clear-selection-btn', n_clicks=0,
                   style={'marginRight': '10px'}),
        html.Button('Refresh Data', id='refresh-data-btn', n_clicks=0),
    ], style={
        'padding': '15px',
        'backgroundColor': '#f9fafb',
        'borderRadius': '8px',
        'marginBottom': '20px'
    }),
    
    # Gantt Chart Container
    html.Div(
        id='gantt-chart',
        className='gantt-chart-container',
        style={'height': '600px'}
    ),
    
    # Info Panel
    html.Div([
        html.H3('Selection & Events'),
        html.Div(id='selection-info'),
        html.Div(id='drop-info'),
    ], style={
        'padding': '20px',
        'backgroundColor': '#ffffff',
        'borderRadius': '8px',
        'marginTop': '20px',
        'boxShadow': '0 1px 3px rgba(0,0,0,0.1)'
    }),
    
    # Data Stores
    dcc.Store(id='gantt-options', data=generate_sample_data()),
    dcc.Store(id='gantt-selected-job-store'),
    dcc.Store(id='gantt-selected-resource-store'),
    dcc.Store(id='drop-payload-store'),
    
    # Include ECharts library
    html.Script(src='https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'),
    
    # Include our Gantt implementation
    html.Link(rel='stylesheet', href='/assets/gantt-echarts.css'),
], style={
    'maxWidth': '1400px',
    'margin': '0 auto',
    'padding': '20px',
    'backgroundColor': '#f3f4f6',
    'minHeight': '100vh'
})

# Clientside callback to render the Gantt chart
clientside_callback(
    """
    function(options, editing, wrapperId) {
        if (typeof window.dash_clientside === 'undefined') {
            window.dash_clientside = {};
        }
        
        // For demo purposes, if the echarts_gantt module isn't loaded,
        // just return a placeholder message
        if (typeof window.dash_clientside.echarts_gantt === 'undefined' ||
            typeof window.dash_clientside.echarts_gantt.render === 'undefined') {
            return 'Loading ECharts Gantt...';
        }
        
        return window.dash_clientside.echarts_gantt.render(
            options, editing, wrapperId
        );
    }
    """,
    Output('gantt-chart', 'children'),
    Input('gantt-options', 'data'),
    Input('edit-mode', 'value'),
    State('gantt-chart', 'id')
)

# Server-side callback to display selection info
@app.callback(
    Output('selection-info', 'children'),
    Input('gantt-selected-job-store', 'data'),
    Input('gantt-selected-resource-store', 'data')
)
def update_selection_info(selected_jobs, selected_resources):
    """Display information about current selection"""
    jobs_text = f"Selected Jobs: {selected_jobs if selected_jobs else 'None'}"
    resources_text = f"Selected Resources: {selected_resources if selected_resources else 'None'}"
    
    return html.Div([
        html.P(jobs_text, style={'marginBottom': '5px'}),
        html.P(resources_text)
    ])

# Server-side callback to display drop events
@app.callback(
    Output('drop-info', 'children'),
    Input('drop-payload-store', 'data')
)
def update_drop_info(drop_data):
    """Display information about drag & drop events"""
    if not drop_data:
        return html.P('No drag & drop events yet')
    
    return html.Div([
        html.H4('Last Drop Event:', style={'marginTop': '15px', 'marginBottom': '10px'}),
        html.Pre(json.dumps(drop_data, indent=2), style={
            'backgroundColor': '#f3f4f6',
            'padding': '10px',
            'borderRadius': '4px',
            'fontSize': '12px'
        })
    ])

# Server-side callback to refresh data
@app.callback(
    Output('gantt-options', 'data'),
    Input('refresh-data-btn', 'n_clicks'),
    prevent_initial_call=True
)
def refresh_data(n_clicks):
    """Regenerate sample data"""
    return generate_sample_data()

# Instructions for clear selection (would need clientside implementation)
@app.callback(
    Output('clear-selection-btn', 'n_clicks'),
    Input('clear-selection-btn', 'n_clicks'),
    prevent_initial_call=True
)
def clear_selection(n_clicks):
    """Clear selection - implementation depends on clientside callback"""
    # This would trigger a clientside callback to clear selection
    # For demo purposes, we just return the click count
    return 0

if __name__ == '__main__':
    print("""
    ====================================
    ECharts Gantt Scheduler Demo
    ====================================
    
    Starting Dash application...
    
    Open your browser and navigate to:
    http://127.0.0.1:8050
    
    Features to try:
    - Toggle Edit Mode to enable/disable dragging
    - Drag jobs horizontally to reschedule
    - Drag jobs vertically to change resources
    - Click jobs to select/deselect
    - Click resource labels to select all future jobs
    - Use mouse wheel to zoom
    - Shift+drag to pan
    
    Press Ctrl+C to stop the server
    ====================================
    """)
    
    app.run_server(debug=True, port=8050)
