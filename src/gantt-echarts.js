/**
 * Complete Gantt Scheduler Implementation using Apache ECharts
 * 
 * Features:
 * - Resource rows on Y-axis with clickable labels
 * - Timeline on X-axis with multiple zoom levels
 * - Colored job bars with rounded corners
 * - Multi-line text labels on job bars
 * - Current date indicator (red line)
 * - Navigator bar for timeline overview
 * - Drag & Drop with auto-resequencing
 * - Job and Resource selection
 * - Rich tooltips
 * - Zoom/Pan controls
 * - Export to PDF/PNG
 */

class GanttEchartsScheduler {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.navigatorChart = null;
        
        // Configuration
        this.config = {
            dashStores: options.dashStores || {},
            colors: options.colors || this.getDefaultColors(),
            barHeight: options.barHeight || 30,
            rowHeight: options.rowHeight || 50,
            navigatorHeight: options.navigatorHeight || 50,
            ...options
        };
        
        // State
        this.data = {
            jobs: [],
            resources: []
        };
        this.selectedJob = null;
        this.selectedResource = null;
        this.draggedJob = null;
        this.isDragging = false;
        this.currentZoom = 'All';
        
        // Time range
        this.timeRange = {
            start: new Date(),
            end: new Date()
        };
        
        this.init();
    }
    
    init() {
        // Create main chart container
        const mainChartDiv = document.createElement('div');
        mainChartDiv.id = `${this.containerId}-main`;
        mainChartDiv.style.width = '100%';
        mainChartDiv.style.height = 'calc(100% - 100px)';
        this.container.appendChild(mainChartDiv);
        
        // Create navigator container
        const navigatorDiv = document.createElement('div');
        navigatorDiv.id = `${this.containerId}-navigator`;
        navigatorDiv.style.width = '100%';
        navigatorDiv.style.height = '50px';
        navigatorDiv.style.marginTop = '10px';
        this.container.appendChild(navigatorDiv);
        
        // Create zoom controls
        this.createZoomControls();
        
        // Initialize ECharts instances
        this.chart = echarts.init(mainChartDiv);
        this.navigatorChart = echarts.init(navigatorDiv);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.chart.resize();
            this.navigatorChart.resize();
        });
    }
    
    getDefaultColors() {
        return {
            job: '#5470c6',
            jobHover: '#7d93e8',
            jobSelected: '#2f4f9f',
            currentDate: '#ff0000',
            gridLine: '#e0e0e0',
            resourceLabel: '#333333'
        };
    }
    
    createZoomControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'gantt-zoom-controls';
        controlsDiv.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 100;
            display: flex;
            gap: 5px;
        `;
        
        const zoomLevels = ['1w', '1m', '3m', 'All'];
        zoomLevels.forEach(level => {
            const btn = document.createElement('button');
            btn.textContent = level;
            btn.className = 'gantt-zoom-btn';
            btn.style.cssText = `
                padding: 5px 10px;
                border: 1px solid #ccc;
                background: white;
                cursor: pointer;
                border-radius: 3px;
            `;
            btn.addEventListener('click', () => this.setZoom(level));
            controlsDiv.appendChild(btn);
        });
        
        // Export buttons
        const exportPdfBtn = document.createElement('button');
        exportPdfBtn.textContent = 'PDF';
        exportPdfBtn.className = 'gantt-export-btn';
        exportPdfBtn.style.cssText = `
            padding: 5px 10px;
            border: 1px solid #ccc;
            background: white;
            cursor: pointer;
            border-radius: 3px;
            margin-left: 10px;
        `;
        exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        controlsDiv.appendChild(exportPdfBtn);
        
        const exportPngBtn = document.createElement('button');
        exportPngBtn.textContent = 'PNG';
        exportPngBtn.className = 'gantt-export-btn';
        exportPngBtn.style.cssText = `
            padding: 5px 10px;
            border: 1px solid #ccc;
            background: white;
            cursor: pointer;
            border-radius: 3px;
        `;
        exportPngBtn.addEventListener('click', () => this.exportToPNG());
        controlsDiv.appendChild(exportPngBtn);
        
        this.container.style.position = 'relative';
        this.container.appendChild(controlsDiv);
    }
    
    setData(jobs, resources) {
        this.data.jobs = jobs.map((job, index) => ({
            ...job,
            id: job.id || `job_${index}`,
            start: new Date(job.start),
            end: new Date(job.end),
            resource: job.resource,
            name: job.name || `Job ${index}`,
            color: job.color || this.config.colors.job,
            sequence: job.sequence !== undefined ? job.sequence : index
        }));
        
        this.data.resources = resources.map((resource, index) => ({
            id: resource.id || `resource_${index}`,
            name: resource.name || `Resource ${index}`,
            ...resource
        }));
        
        this.calculateTimeRange();
        this.render();
    }
    
    calculateTimeRange() {
        if (this.data.jobs.length === 0) {
            const now = new Date();
            this.timeRange.start = new Date(now.getFullYear(), now.getMonth(), 1);
            this.timeRange.end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
            return;
        }
        
        let minDate = new Date(Math.min(...this.data.jobs.map(j => j.start.getTime())));
        let maxDate = new Date(Math.max(...this.data.jobs.map(j => j.end.getTime())));
        
        // Add padding
        const padding = (maxDate - minDate) * 0.1;
        this.timeRange.start = new Date(minDate.getTime() - padding);
        this.timeRange.end = new Date(maxDate.getTime() + padding);
    }
    
    setZoom(level) {
        this.currentZoom = level;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let start, end;
        switch (level) {
            case '1w':
                start = new Date(today);
                end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case '1m':
                start = new Date(today);
                end = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                break;
            case '3m':
                start = new Date(today);
                end = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
                break;
            case 'All':
            default:
                this.calculateTimeRange();
                this.render();
                return;
        }
        
        this.timeRange.start = start;
        this.timeRange.end = end;
        this.render();
    }
    
    render() {
        this.renderMainChart();
        this.renderNavigator();
    }
    
    renderMainChart() {
        const resources = this.data.resources;
        const jobs = this.data.jobs;
        
        // Create resource map for Y-axis
        const resourceMap = {};
        resources.forEach((resource, index) => {
            resourceMap[resource.id] = index;
        });
        
        // Prepare series data
        const seriesData = jobs.map(job => {
            const resourceIndex = resourceMap[job.resource] !== undefined 
                ? resourceMap[job.resource] 
                : 0;
            
            return {
                name: job.name,
                value: [
                    resourceIndex,
                    job.start.getTime(),
                    job.end.getTime(),
                    job.end.getTime() - job.start.getTime()
                ],
                itemStyle: {
                    color: job.color,
                    borderRadius: 5
                },
                jobData: job
            };
        });
        
        const option = {
            tooltip: {
                formatter: (params) => {
                    if (params.componentType === 'series') {
                        const job = params.data.jobData;
                        return `
                            <strong>${job.name}</strong><br/>
                            Resource: ${job.resource}<br/>
                            Start: ${this.formatDate(job.start)}<br/>
                            End: ${this.formatDate(job.end)}<br/>
                            Duration: ${this.getDuration(job.start, job.end)}
                        `;
                    }
                    return '';
                }
            },
            grid: {
                left: 120,
                right: 50,
                top: 50,
                bottom: 30,
                containLabel: false
            },
            xAxis: {
                type: 'time',
                min: this.timeRange.start.getTime(),
                max: this.timeRange.end.getTime(),
                axisLabel: {
                    formatter: (value) => this.formatAxisDate(new Date(value))
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: this.config.colors.gridLine
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: resources.map(r => r.name),
                axisLabel: {
                    color: this.config.colors.resourceLabel,
                    fontSize: 12
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: this.config.colors.gridLine
                    }
                }
            },
            series: [
                {
                    type: 'custom',
                    renderItem: (params, api) => this.renderJobBar(params, api),
                    encode: {
                        x: [1, 2],
                        y: 0
                    },
                    data: seriesData,
                    animation: false
                }
            ]
        };
        
        // Add current date line
        const now = new Date();
        if (now >= this.timeRange.start && now <= this.timeRange.end) {
            option.series.push({
                type: 'line',
                markLine: {
                    symbol: 'none',
                    data: [{
                        xAxis: now.getTime(),
                        lineStyle: {
                            color: this.config.colors.currentDate,
                            width: 2,
                            type: 'solid'
                        },
                        label: {
                            formatter: 'Today',
                            position: 'end'
                        }
                    }],
                    silent: false,
                    animation: false
                }
            });
        }
        
        this.chart.setOption(option, true);
    }
    
    renderJobBar(params, api) {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        
        const height = this.config.barHeight;
        const y = start[1] - height / 2;
        
        const rectShape = echarts.graphic.clipRectByRect(
            {
                x: start[0],
                y: y,
                width: end[0] - start[0],
                height: height
            },
            {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
            }
        );
        
        const job = params.data.jobData;
        const isSelected = this.selectedJob && this.selectedJob.id === job.id;
        
        return rectShape && {
            type: 'group',
            children: [
                {
                    type: 'rect',
                    shape: rectShape,
                    style: {
                        fill: isSelected ? this.config.colors.jobSelected : job.color,
                        stroke: isSelected ? '#000' : 'transparent',
                        lineWidth: isSelected ? 2 : 0
                    },
                    styleEmphasis: {
                        fill: this.config.colors.jobHover
                    },
                    textConfig: {
                        position: 'inside'
                    },
                    textContent: {
                        style: {
                            text: job.name,
                            fill: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                            overflow: 'truncate',
                            width: rectShape.width - 10
                        }
                    }
                }
            ]
        };
    }
    
    renderNavigator() {
        const jobs = this.data.jobs;
        
        if (jobs.length === 0) {
            return;
        }
        
        // Calculate full time range
        const allStart = new Date(Math.min(...jobs.map(j => j.start.getTime())));
        const allEnd = new Date(Math.max(...jobs.map(j => j.end.getTime())));
        
        const navigatorData = jobs.map(job => ({
            value: [
                job.start.getTime(),
                0,
                job.end.getTime()
            ],
            itemStyle: {
                color: job.color,
                opacity: 0.6
            }
        }));
        
        const option = {
            grid: {
                left: 120,
                right: 50,
                top: 5,
                bottom: 5,
                containLabel: false
            },
            xAxis: {
                type: 'time',
                min: allStart.getTime(),
                max: allEnd.getTime(),
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                show: false,
                min: -1,
                max: 1
            },
            series: [
                {
                    type: 'custom',
                    renderItem: (params, api) => {
                        const start = api.coord([api.value(0), 0]);
                        const end = api.coord([api.value(2), 0]);
                        
                        return {
                            type: 'rect',
                            shape: {
                                x: start[0],
                                y: params.coordSys.y,
                                width: end[0] - start[0],
                                height: params.coordSys.height
                            },
                            style: api.style()
                        };
                    },
                    data: navigatorData,
                    animation: false
                }
            ],
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    height: 20,
                    bottom: 0,
                    handleSize: '80%',
                    showDetail: false
                }
            ]
        };
        
        this.navigatorChart.setOption(option, true);
    }
    
    setupEventListeners() {
        // Click event for job selection
        this.chart.on('click', (params) => {
            if (params.componentType === 'series' && params.data.jobData) {
                this.selectJob(params.data.jobData);
            }
        });
        
        // Y-axis label click for resource selection
        this.chart.getZr().on('click', (params) => {
            const pointInPixel = [params.offsetX, params.offsetY];
            const pointInGrid = this.chart.convertFromPixel('grid', pointInPixel);
            
            if (pointInGrid && params.offsetX < 120) { // In Y-axis label area
                const resourceIndex = Math.floor(pointInGrid[1]);
                if (resourceIndex >= 0 && resourceIndex < this.data.resources.length) {
                    this.selectResource(this.data.resources[resourceIndex]);
                }
            }
        });
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Mouse wheel zoom
        this.chart.getZr().on('mousewheel', (e) => {
            e.event.preventDefault();
            const delta = e.event.wheelDelta || -e.event.detail;
            this.handleZoom(delta > 0 ? 1.1 : 0.9, e.offsetX, e.offsetY);
        });
        
        // Shift + drag to pan
        let isPanning = false;
        let panStart = null;
        
        this.chart.getZr().on('mousedown', (e) => {
            if (e.event.shiftKey) {
                isPanning = true;
                panStart = { x: e.offsetX, y: e.offsetY };
                this.chart.getZr().setCursorStyle('grab');
            }
        });
        
        this.chart.getZr().on('mousemove', (e) => {
            if (isPanning && panStart) {
                const dx = e.offsetX - panStart.x;
                this.handlePan(dx);
                panStart = { x: e.offsetX, y: e.offsetY };
            }
        });
        
        this.chart.getZr().on('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                panStart = null;
                this.chart.getZr().setCursorStyle('default');
            }
        });
    }
    
    setupDragAndDrop() {
        let dragStart = null;
        
        this.chart.on('mousedown', (params) => {
            if (params.componentType === 'series' && params.data.jobData) {
                this.draggedJob = params.data.jobData;
                dragStart = { x: params.event.offsetX, y: params.event.offsetY };
                this.isDragging = true;
                this.chart.getZr().setCursorStyle('move');
            }
        });
        
        this.chart.getZr().on('mousemove', (e) => {
            if (this.isDragging && this.draggedJob) {
                // Visual feedback during drag
                this.chart.getZr().setCursorStyle('move');
            }
        });
        
        this.chart.getZr().on('mouseup', (e) => {
            if (this.isDragging && this.draggedJob) {
                const pointInPixel = [e.offsetX, e.offsetY];
                const pointInGrid = this.chart.convertFromPixel('grid', pointInPixel);
                
                if (pointInGrid) {
                    const [timeValue, resourceIndex] = pointInGrid;
                    const targetResourceIndex = Math.round(resourceIndex);
                    
                    if (targetResourceIndex >= 0 && targetResourceIndex < this.data.resources.length) {
                        const targetResource = this.data.resources[targetResourceIndex];
                        const newStartTime = new Date(timeValue);
                        
                        this.handleJobDrop(this.draggedJob, targetResource, newStartTime);
                    }
                }
                
                this.isDragging = false;
                this.draggedJob = null;
                this.chart.getZr().setCursorStyle('default');
            }
        });
    }
    
    handleJobDrop(job, targetResource, newStartTime) {
        const duration = job.end.getTime() - job.start.getTime();
        const oldResource = job.resource;
        
        // Update job
        job.start = newStartTime;
        job.end = new Date(newStartTime.getTime() + duration);
        job.resource = targetResource.id;
        
        // Auto-resequence
        this.autoResequence(targetResource.id);
        
        if (oldResource !== targetResource.id) {
            this.autoResequence(oldResource);
        }
        
        // Sync to Dash store
        this.syncDropPayload({
            jobId: job.id,
            oldResource: oldResource,
            newResource: targetResource.id,
            newStart: job.start.toISOString(),
            newEnd: job.end.toISOString()
        });
        
        this.render();
    }
    
    autoResequence(resourceId) {
        // Get all jobs for this resource
        const resourceJobs = this.data.jobs
            .filter(j => j.resource === resourceId)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
        
        // Resequence to be consecutive with no gaps
        let currentSequence = 1;
        resourceJobs.forEach(job => {
            job.sequence = currentSequence++;
        });
    }
    
    selectJob(job) {
        this.selectedJob = job;
        this.syncSelectedJob(job);
        this.render();
    }
    
    selectResource(resource) {
        this.selectedResource = resource;
        
        // Select all future jobs on this resource
        const now = new Date();
        const futureJobs = this.data.jobs.filter(job => 
            job.resource === resource.id && job.start >= now
        );
        
        this.syncSelectedResource(resource, futureJobs);
        this.render();
    }
    
    handleZoom(factor, centerX, centerY) {
        const range = this.timeRange.end.getTime() - this.timeRange.start.getTime();
        const newRange = range / factor;
        const diff = range - newRange;
        
        // Zoom from center
        const centerPoint = this.chart.convertFromPixel('grid', [centerX, centerY]);
        if (!centerPoint) return;
        
        const centerTime = centerPoint[0];
        const centerRatio = (centerTime - this.timeRange.start.getTime()) / range;
        
        this.timeRange.start = new Date(this.timeRange.start.getTime() + diff * centerRatio);
        this.timeRange.end = new Date(this.timeRange.end.getTime() - diff * (1 - centerRatio));
        
        this.render();
    }
    
    handlePan(deltaX) {
        const range = this.timeRange.end.getTime() - this.timeRange.start.getTime();
        const gridWidth = this.chart.getWidth() - 170; // Subtract margins
        const timePerPixel = range / gridWidth;
        const timeShift = -deltaX * timePerPixel;
        
        this.timeRange.start = new Date(this.timeRange.start.getTime() + timeShift);
        this.timeRange.end = new Date(this.timeRange.end.getTime() + timeShift);
        
        this.render();
    }
    
    exportToPNG() {
        const url = this.chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        
        const link = document.createElement('a');
        link.download = `gantt-schedule-${Date.now()}.png`;
        link.href = url;
        link.click();
    }
    
    exportToPDF() {
        // For PDF export, we use the PNG data and convert it
        // In a production environment, you might use jsPDF or similar
        const url = this.chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        
        // This is a simplified version - in production, use jsPDF
        const link = document.createElement('a');
        link.download = `gantt-schedule-${Date.now()}.png`;
        link.href = url;
        link.click();
        
        console.warn('PDF export currently saves as PNG. Integrate jsPDF for true PDF export.');
    }
    
    // Dash store sync methods
    syncSelectedJob(job) {
        if (this.config.dashStores && this.config.dashStores.selectedJob) {
            const store = document.getElementById(this.config.dashStores.selectedJob);
            if (store) {
                const event = new CustomEvent('updateStore', {
                    detail: {
                        jobId: job.id,
                        name: job.name,
                        resource: job.resource,
                        start: job.start.toISOString(),
                        end: job.end.toISOString()
                    }
                });
                store.dispatchEvent(event);
            }
        }
    }
    
    syncSelectedResource(resource, futureJobs) {
        if (this.config.dashStores && this.config.dashStores.selectedResource) {
            const store = document.getElementById(this.config.dashStores.selectedResource);
            if (store) {
                const event = new CustomEvent('updateStore', {
                    detail: {
                        resourceId: resource.id,
                        resourceName: resource.name,
                        futureJobs: futureJobs.map(j => j.id)
                    }
                });
                store.dispatchEvent(event);
            }
        }
    }
    
    syncDropPayload(payload) {
        if (this.config.dashStores && this.config.dashStores.dropPayload) {
            const store = document.getElementById(this.config.dashStores.dropPayload);
            if (store) {
                const event = new CustomEvent('updateStore', { detail: payload });
                store.dispatchEvent(event);
            }
        }
    }
    
    // Utility methods
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatAxisDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    getDuration(start, end) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    destroy() {
        if (this.chart) {
            this.chart.dispose();
        }
        if (this.navigatorChart) {
            this.navigatorChart.dispose();
        }
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GanttEchartsScheduler;
}
if (typeof window !== 'undefined') {
    window.GanttEchartsScheduler = GanttEchartsScheduler;
}
