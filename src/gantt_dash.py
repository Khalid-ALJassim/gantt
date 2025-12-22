"""
Dash component wrapper for Gantt ECharts Scheduler

This module provides a Dash component that wraps the GanttEchartsScheduler
JavaScript implementation, enabling seamless integration with Dash applications.
"""

from dash import dcc, html
import dash
from dash.dependencies import Input, Output, State
import json


class GanttScheduler(html.Div):
    """
    Gantt Scheduler Dash Component
    
    A complete, production-ready Gantt scheduler using Apache ECharts.
    
    Properties:
    - id: Component ID
    - jobs: List of job dictionaries with keys: id, name, resource, start, end, color, sequence
    - resources: List of resource dictionaries with keys: id, name
    - height: Height of the chart (default: '700px')
    - colors: Color configuration dictionary
    """
    
    def __init__(self, 
                 id,
                 jobs=None,
                 resources=None,
                 height='700px',
                 colors=None,
                 **kwargs):
        
        jobs = jobs or []
        resources = resources or []
        colors = colors or {}
        
        # Create stores for state management
        selected_job_store = dcc.Store(id=f'{id}-selected-job-store')
        selected_resource_store = dcc.Store(id=f'{id}-selected-resource-store')
        drop_payload_store = dcc.Store(id=f'{id}-drop-payload-store')
        
        # Create the chart container
        chart_container = html.Div(
            id=f'{id}-container',
            className='gantt-container',
            style={'height': height}
        )
        
        # Include required scripts and styles
        echarts_script = html.Script(
            src='https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
        )
        
        gantt_script = html.Script(
            src='/assets/gantt-echarts.js'
        )
        
        # Data store
        data_store = dcc.Store(
            id=f'{id}-data-store',
            data={
                'jobs': jobs,
                'resources': resources,
                'colors': colors
            }
        )
        
        # Initialization script
        init_script = html.Script(f"""
            (function() {{
                if (typeof window.initGantt_{id.replace('-', '_')} === 'undefined') {{
                    window.initGantt_{id.replace('-', '_')} = function() {{
                        if (typeof echarts === 'undefined' || typeof GanttEchartsScheduler === 'undefined') {{
                            setTimeout(window.initGantt_{id.replace('-', '_')}, 100);
                            return;
                        }}
                        
                        const container = document.getElementById('{id}-container');
                        const dataStore = document.getElementById('{id}-data-store');
                        
                        if (!container || !dataStore) {{
                            setTimeout(window.initGantt_{id.replace('-', '_')}, 100);
                            return;
                        }}
                        
                        const data = JSON.parse(dataStore.textContent);
                        
                        window.gantt_{id.replace('-', '_')} = new GanttEchartsScheduler(
                            '{id}-container',
                            {{
                                dashStores: {{
                                    selectedJob: '{id}-selected-job-store',
                                    selectedResource: '{id}-selected-resource-store',
                                    dropPayload: '{id}-drop-payload-store'
                                }},
                                colors: data.colors
                            }}
                        );
                        
                        window.gantt_{id.replace('-', '_')}.setData(data.jobs, data.resources);
                    }};
                    
                    if (document.readyState === 'loading') {{
                        document.addEventListener('DOMContentLoaded', window.initGantt_{id.replace('-', '_')});
                    }} else {{
                        window.initGantt_{id.replace('-', '_')}();
                    }}
                }}
            }})();
        """)
        
        # Combine all elements
        super().__init__(
            children=[
                echarts_script,
                gantt_script,
                selected_job_store,
                selected_resource_store,
                drop_payload_store,
                data_store,
                chart_container,
                init_script
            ],
            **kwargs
        )


def create_gantt_callbacks(app, gantt_id):
    """
    Create Dash callbacks for the Gantt scheduler
    
    Args:
        app: Dash app instance
        gantt_id: ID of the GanttScheduler component
    
    Returns:
        Dictionary of callback outputs that can be used in other callbacks
    """
    
    @app.callback(
        Output(f'{gantt_id}-selected-job-store', 'data'),
        Input(f'{gantt_id}-selected-job-store', 'modified_timestamp'),
        State(f'{gantt_id}-selected-job-store', 'data'),
        prevent_initial_call=True
    )
    def handle_job_selection(ts, data):
        """Handle job selection events"""
        if data:
            print(f"Job selected: {data}")
        return data
    
    @app.callback(
        Output(f'{gantt_id}-selected-resource-store', 'data'),
        Input(f'{gantt_id}-selected-resource-store', 'modified_timestamp'),
        State(f'{gantt_id}-selected-resource-store', 'data'),
        prevent_initial_call=True
    )
    def handle_resource_selection(ts, data):
        """Handle resource selection events"""
        if data:
            print(f"Resource selected: {data}")
        return data
    
    @app.callback(
        Output(f'{gantt_id}-drop-payload-store', 'data'),
        Input(f'{gantt_id}-drop-payload-store', 'modified_timestamp'),
        State(f'{gantt_id}-drop-payload-store', 'data'),
        prevent_initial_call=True
    )
    def handle_job_drop(ts, data):
        """Handle job drop events"""
        if data:
            print(f"Job dropped: {data}")
        return data
    
    return {
        'selected_job': f'{gantt_id}-selected-job-store',
        'selected_resource': f'{gantt_id}-selected-resource-store',
        'drop_payload': f'{gantt_id}-drop-payload-store'
    }


# Example usage
if __name__ == '__main__':
    from datetime import datetime, timedelta
    
    app = dash.Dash(__name__)
    
    # Sample data
    today = datetime.now()
    sample_jobs = [
        {
            'id': 'job1',
            'name': 'Frontend Development',
            'resource': 'resource1',
            'start': (today - timedelta(days=7)).isoformat(),
            'end': (today + timedelta(days=7)).isoformat(),
            'color': '#5470c6',
            'sequence': 1
        },
        {
            'id': 'job2',
            'name': 'Backend API',
            'resource': 'resource1',
            'start': (today + timedelta(days=8)).isoformat(),
            'end': (today + timedelta(days=21)).isoformat(),
            'color': '#91cc75',
            'sequence': 2
        },
        {
            'id': 'job3',
            'name': 'UI/UX Design',
            'resource': 'resource2',
            'start': (today - timedelta(days=14)).isoformat(),
            'end': (today - timedelta(days=2)).isoformat(),
            'color': '#fac858',
            'sequence': 1
        }
    ]
    
    sample_resources = [
        {'id': 'resource1', 'name': 'Engineering Team'},
        {'id': 'resource2', 'name': 'Design Team'},
        {'id': 'resource3', 'name': 'Marketing Team'}
    ]
    
    app.layout = html.Div([
        html.H1('Gantt Scheduler Demo'),
        GanttScheduler(
            id='gantt',
            jobs=sample_jobs,
            resources=sample_resources,
            height='700px'
        ),
        html.Div(id='output')
    ])
    
    # Create callbacks
    stores = create_gantt_callbacks(app, 'gantt')
    
    @app.callback(
        Output('output', 'children'),
        Input(stores['selected_job'], 'data'),
        Input(stores['selected_resource'], 'data'),
        Input(stores['drop_payload'], 'data')
    )
    def display_events(job, resource, drop):
        """Display selected events"""
        return html.Div([
            html.H3('Events:'),
            html.P(f'Selected Job: {job}'),
            html.P(f'Selected Resource: {resource}'),
            html.P(f'Last Drop: {drop}')
        ])
    
    app.run_server(debug=True)
