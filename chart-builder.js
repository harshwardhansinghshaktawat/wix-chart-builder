/**
 * Chart Builder Wix Custom Element
 * A custom chart builder component for Wix sites
 */
class ChartBuilderElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize properties
    this.chart = null;
    this.datasets = [];
    this.chartType = 'line';
    this.settings = {
      title: 'My Chart',
      xAxisTitle: 'X-Axis',
      yAxisTitle: 'Y-Axis',
      showLegend: true,
      showGridLines: true,
      animationsEnabled: true,
      chartBgColor: '#ffffff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      titleColor: '#333333',
      axisColor: '#666666',
      chartWidth: 800,
      chartHeight: 400,
      borderRadius: 8
    };
    
    // Chart specific options
    this.chartOptions = {
      line: {
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      },
      stepped: {
        stepped: 'middle',
        pointRadius: 3,
        borderWidth: 2
      },
      interpolated: {
        tension: 0.8,
        pointRadius: 2,
        borderWidth: 2
      },
      points: {
        tension: 0,
        pointRadius: 5,
        borderWidth: 1
      },
      filled: {
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
        fill: true
      }
    };
    
    // Themes
    this.themes = [
      {
        name: 'Default',
        colors: ['#4a6cfa', '#6e42c1', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#fd7e14', '#6f42c1', '#20c997', '#e83e8c'],
        bgColor: '#ffffff',
        titleColor: '#333333',
        axisColor: '#666666'
      },
      {
        name: 'Dark Mode',
        colors: ['#6ea8fe', '#a78bfa', '#6ddccf', '#f76e64', '#ffda6a', '#5dd7fc', '#feb272', '#c29ffa', '#63e6be', '#f691ce'],
        bgColor: '#212529',
        titleColor: '#f8f9fa',
        axisColor: '#e9ecef'
      },
      {
        name: 'Pastel',
        colors: ['#a8d1ff', '#c5b3e6', '#b2dfdb', '#ffccbc', '#fff9c4', '#b3e5fc', '#ffe0b2', '#e1bee7', '#c8e6c9', '#f8bbd0'],
        bgColor: '#f8f9fa',
        titleColor: '#495057',
        axisColor: '#6c757d'
      },
      {
        name: 'High Contrast',
        colors: ['#0066ff', '#7700ff', '#00cc00', '#ff0000', '#ffcc00', '#00ccff', '#ff7700', '#9900ff', '#00ff88', '#ff0099'],
        bgColor: '#ffffff',
        titleColor: '#000000',
        axisColor: '#333333'
      },
      {
        name: 'Monochrome',
        colors: ['#000000', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#444444', '#666666', '#888888'],
        bgColor: '#ffffff',
        titleColor: '#000000',
        axisColor: '#333333'
      }
    ];
  }

  connectedCallback() {
    this.loadDependencies().then(() => {
      this.render();
      this.initializeChart();
      this.initializeTabs();
      this.initializeDatasets();
      this.initializeOptions();
      this.initializeThemes();
      this.initializeEvents();
    });
  }

  disconnectedCallback() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadDependencies() {
    return new Promise((resolve) => {
      // Check if Chart.js is already loaded
      if (window.Chart) {
        if (window.Papa) {
          resolve();
          return;
        }
      }

      // Load Chart.js
      const chartScript = document.createElement('script');
      chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      document.head.appendChild(chartScript);

      // Load PapaParse
      const papaScript = document.createElement('script');
      papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
      document.head.appendChild(papaScript);

      // Wait for both scripts to load
      let loaded = 0;
      const onScriptLoad = () => {
        loaded++;
        if (loaded === 2) {
          resolve();
        }
      };

      chartScript.onload = onScriptLoad;
      papaScript.onload = onScriptLoad;
    });
  }

  render() {
    const shadow = this.shadowRoot;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    shadow.appendChild(style);

    // Create main container
    const container = document.createElement('div');
    container.className = 'chart-builder-container';
    container.innerHTML = this.getTemplate();
    shadow.appendChild(container);
  }

  getStyles() {
    return `
      :host {
        display: block;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      .chart-builder-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .chart-container {
        width: 100%;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        position: relative;
      }
      
      .editor-container {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
      }
      
      .tabs {
        display: flex;
        border-bottom: 1px solid #e9ecef;
        margin-bottom: 20px;
      }
      
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .tab:hover {
        background-color: #eef1ff;
      }
      
      .tab.active {
        border-bottom: 3px solid #4a6cfa;
        color: #4a6cfa;
      }
      
      .tab-content {
        display: none;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
      }
      
      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        transition: all 0.3s ease;
      }
      
      .form-control:focus {
        outline: none;
        border-color: #4a6cfa;
        box-shadow: 0 0 0 3px rgba(74, 108, 250, 0.2);
      }
      
      .form-select {
        width: 100%;
        padding: 10px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        transition: all 0.3s ease;
        background-color: white;
      }
      
      .form-select:focus {
        outline: none;
        border-color: #4a6cfa;
        box-shadow: 0 0 0 3px rgba(74, 108, 250, 0.2);
      }
      
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .btn-primary {
        background-color: #4a6cfa;
        color: white;
      }
      
      .btn-primary:hover {
        background-color: #3a5dd9;
      }
      
      .btn-secondary {
        background-color: #6e42c1;
        color: white;
      }
      
      .btn-secondary:hover {
        background-color: #5e37a6;
      }
      
      .btn-success {
        background-color: #28a745;
        color: white;
      }
      
      .btn-success:hover {
        background-color: #218838;
      }
      
      .btn-danger {
        background-color: #dc3545;
        color: white;
      }
      
      .btn-danger:hover {
        background-color: #c82333;
      }
      
      .btn-sm {
        padding: 5px 10px;
        font-size: 0.875rem;
      }
      
      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -10px;
      }
      
      .col {
        flex: 1;
        padding: 0 10px;
      }
      
      .color-picker-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }
      
      .color-option {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }
      
      .color-option.active {
        border-color: #343a40;
        transform: scale(1.1);
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      .data-table th, .data-table td {
        border: 1px solid #e9ecef;
        padding: 10px;
        text-align: left;
      }
      
      .data-table th {
        background-color: #eef1ff;
      }
      
      .data-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .data-set-container {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .data-set-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .data-set-title {
        font-weight: 600;
        color: #4a6cfa;
      }
      
      .dataset-controls {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .theme-option {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 10px;
      }
      
      .theme-option:hover {
        background-color: #eef1ff;
      }
      
      .theme-option.active {
        border-color: #4a6cfa;
        background-color: #eef1ff;
      }
      
      .theme-preview {
        height: 40px;
        border-radius: 8px;
        display: flex;
        overflow: hidden;
        margin-bottom: 5px;
      }
      
      .theme-color {
        flex: 1;
        height: 100%;
      }
      
      .edit-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #4a6cfa;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .edit-button:hover {
        background-color: #3a5dd9;
        transform: scale(1.05);
      }
      
      .edit-icon {
        width: 20px;
        height: 20px;
      }
      
      .hidden {
        display: none;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .row {
          flex-direction: column;
        }
        
        .col {
          padding: 10px 0;
        }
        
        .tabs {
          flex-wrap: wrap;
        }
        
        .tab {
          flex: 1;
          text-align: center;
          padding: 10px 5px;
        }
      }
    `;
  }

  getTemplate() {
    return `
      <div class="chart-container">
        <canvas id="chartCanvas"></canvas>
        <button id="editButton" class="edit-button hidden">
          <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      
      <div id="editorContainer" class="editor-container">
        <div class="tabs">
          <div class="tab active" data-tab="data">Data</div>
          <div class="tab" data-tab="settings">Chart Settings</div>
          <div class="tab" data-tab="layout">Layout & Design</div>
          <div class="tab" data-tab="preview">Preview</div>
        </div>
        
        <div id="dataTab" class="tab-content active">
          <h3>Chart Data</h3>
          <p>Configure your datasets below. You can add up to 10 datasets.</p>
          
          <div id="datasetContainer">
            <!-- Dataset 1 will be added here by default -->
          </div>
          
          <div style="margin-top: 20px;">
            <button id="addDatasetBtn" class="btn btn-primary">+ Add Dataset</button>
          </div>
        </div>
        
        <div id="settingsTab" class="tab-content">
          <h3>Chart Settings</h3>
          
          <div class="form-group">
            <label class="form-label" for="chartType">Chart Type</label>
            <select id="chartType" class="form-select">
              <option value="line">Basic Line Chart</option>
              <option value="multi-axis">Multi-Axis Line Chart</option>
              <option value="stepped">Stepped Line Chart</option>
              <option value="interpolated">Interpolated Line Chart</option>
              <option value="points">Line Chart with Points</option>
              <option value="filled">Filled Line Chart</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="chartTitle">Chart Title</label>
            <input type="text" id="chartTitle" class="form-control" placeholder="Enter chart title">
          </div>
          
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label class="form-label" for="xAxisTitle">X-Axis Title</label>
                <input type="text" id="xAxisTitle" class="form-control" placeholder="Enter X-axis title">
              </div>
            </div>
            <div class="col">
              <div class="form-group">
                <label class="form-label" for="yAxisTitle">Y-Axis Title</label>
                <input type="text" id="yAxisTitle" class="form-control" placeholder="Enter Y-axis title">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Chart Options</label>
            <div>
              <label>
                <input type="checkbox" id="showLegend"> Show Legend
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" id="showGridLines" checked> Show Grid Lines
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" id="animationsEnabled" checked> Enable Animations
              </label>
            </div>
          </div>
          
          <div id="chartSpecificOptions" class="form-group">
            <!-- Chart specific options will be loaded here dynamically -->
          </div>
        </div>
        
        <div id="layoutTab" class="tab-content">
          <h3>Layout & Design</h3>
          
          <div class="form-group">
            <label class="form-label">Predefined Themes</label>
            <div id="themesContainer">
              <!-- Themes will be added here -->
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Chart Background</label>
            <input type="color" id="chartBgColor" class="form-control" value="#ffffff">
          </div>
          
          <div class="form-group">
            <label class="form-label">Font Options</label>
            <select id="fontFamily" class="form-select">
              <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
              <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
            </select>
          </div>
          
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label class="form-label">Title Color</label>
                <input type="color" id="titleColor" class="form-control" value="#333333">
              </div>
            </div>
            <div class="col">
              <div class="form-group">
                <label class="form-label">Axis Labels Color</label>
                <input type="color" id="axisColor" class="form-control" value="#666666">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Chart Size</label>
            <div class="row">
              <div class="col">
                <label class="form-label">Width</label>
                <input type="range" id="chartWidth" min="300" max="1200" step="50" value="800" class="form-control">
                <span id="chartWidthValue">800px</span>
              </div>
              <div class="col">
                <label class="form-label">Height</label>
                <input type="range" id="chartHeight" min="200" max="800" step="50" value="400" class="form-control">
                <span id="chartHeightValue">400px</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Border Radius</label>
            <input type="range" id="borderRadius" min="0" max="20" step="1" value="8" class="form-control">
            <span id="borderRadiusValue">8px</span>
          </div>
        </div>
        
        <div id="previewTab" class="tab-content">
          <h3>Preview Your Chart</h3>
          <p>This is how your chart will look when published. You can make final adjustments here.</p>
          
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Chart Size Preview</label>
            <div class="row">
              <div class="col">
                <label class="form-label">Width</label>
                <input type="range" id="previewChartWidth" min="300" max="1200" step="50" value="800" class="form-control">
                <span id="previewChartWidthValue">800px</span>
              </div>
              <div class="col">
                <label class="form-label">Height</label>
                <input type="range" id="previewChartHeight" min="200" max="800" step="50" value="400" class="form-control">
                <span id="previewChartHeightValue">400px</span>
              </div>
            </div>
          </div>
          
          <div class="form-group" style="margin-top: 30px; text-align: center;">
            <button id="updateChartBtn" class="btn btn-success">Update Chart</button>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: right;">
          <button id="cancelBtn" class="btn btn-danger" style="margin-right: 10px;">Cancel</button>
          <button id="saveBtn" class="btn btn-primary">Save Changes</button>
          <button id="exportBtn" class="btn btn-success" style="margin-left: 10px;">Export Chart</button>
        </div>
      </div>
    `;
  }

  initializeTabs() {
    const tabs = this.shadowRoot.querySelectorAll('.tab');
    const tabContents = this.shadowRoot.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        this.shadowRoot.getElementById(`${tabId}Tab`).classList.add('active');
      });
    });
  }
  
  initializeDatasets() {
    // Add the first dataset by default
    this.addDataset();
    
    this.shadowRoot.getElementById('addDatasetBtn').addEventListener('click', () => {
      if (this.datasets.length < 10) {
        this.addDataset();
      } else {
        alert('Maximum of 10 datasets allowed.');
      }
    });
  }
  
  addDataset() {
    const datasetId = this.datasets.length;
    const datasetContainer = this.shadowRoot.getElementById('datasetContainer');
    
    // Create a new dataset object
    const dataset = {
      id: datasetId,
      label: `Dataset ${datasetId + 1}`,
      data: [65, 59, 80, 81, 56, 55, 40],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      borderColor: this.themes[0].colors[datasetId % this.themes[0].colors.length],
      backgroundColor: this.hexToRgba(this.themes[0].colors[datasetId % this.themes[0].colors.length], 0.2)
    };
    
    this.datasets.push(dataset);
    
    // Create dataset UI
    const datasetElement = document.createElement('div');
    datasetElement.className = 'data-set-container';
    datasetElement.id = `dataset-${datasetId}`;
    datasetElement.innerHTML = `
      <div class="data-set-header">
        <div class="data-set-title">Dataset ${datasetId + 1}</div>
        <div>
          <button class="btn btn-danger btn-sm delete-dataset-btn" data-id="${datasetId}">Delete</button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="datasetLabel-${datasetId}">Dataset Label</label>
        <input type="text" id="datasetLabel-${datasetId}" class="form-control dataset-label" data-id="${datasetId}" value="Dataset ${datasetId + 1}">
      </div>
      
      <div class="dataset-controls">
        <div>
          <label class="form-label" for="datasetColor-${datasetId}">Color</label>
          <input type="color" id="datasetColor-${datasetId}" class="form-control dataset-color" data-id="${datasetId}" value="${dataset.borderColor}">
        </div>
        
        <div>
          <label class="form-label" for="datasetOpacity-${datasetId}">Fill Opacity</label>
          <input type="range" id="datasetOpacity-${datasetId}" class="form-control dataset-opacity" data-id="${datasetId}" min="0" max="1" step="0.1" value="0.2">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Data Editor</label>
        <div class="row">
          <div class="col">
            <button class="btn btn-secondary btn-sm import-csv-btn" data-id="${datasetId}">Import CSV</button>
            <input type="file" id="csvFile-${datasetId}" class="csv-file-input" data-id="${datasetId}" style="display: none;" accept=".csv">
          </div>
          <div class="col">
            <button class="btn btn-secondary btn-sm bulk-edit-btn" data-id="${datasetId}">Bulk Edit</button>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <table class="data-table" id="dataTable-${datasetId}">
          <thead>
            <tr>
              <th>Label</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Data rows will be added here -->
          </tbody>
        </table>
        <button class="btn btn-primary btn-sm add-data-point-btn" data-id="${datasetId}">+ Add Data Point</button>
      </div>
      
      <div class="form-group bulk-edit-container" id="bulkEdit-${datasetId}" style="display: none;">
        <label class="form-label">Bulk Edit Data (Format: label,value on each line)</label>
        <textarea id="bulkEditText-${datasetId}" class="form-control" rows="7"></textarea>
        <div style="margin-top: 10px;">
          <button class="btn btn-primary btn-sm apply-bulk-edit-btn" data-id="${datasetId}">Apply</button>
          <button class="btn btn-secondary btn-sm cancel-bulk-edit-btn" data-id="${datasetId}">Cancel</button>
        </div>
      </div>
    `;
    
    datasetContainer.appendChild(datasetElement);
    
    // Add initial data rows
    this.updateDataTable(datasetId);
    
    // Set up event listeners for this dataset
    this.setupDatasetEvents(datasetId);
  }
  
  updateDataTable(datasetId) {
    const dataTable = this.shadowRoot.getElementById(`dataTable-${datasetId}`);
    const tableBody = dataTable.querySelector('tbody');
    const dataset = this.datasets[datasetId];
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add rows for each data point
    dataset.data.forEach((value, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <input type="text" class="form-control data-label" data-id="${datasetId}" data-index="${index}" value="${dataset.labels[index] || ''}">
        </td>
        <td>
          <input type="number" class="form-control data-value" data-id="${datasetId}" data-index="${index}" value="${value}">
        </td>
        <td>
          <button class="btn btn-danger btn-sm delete-data-point-btn" data-id="${datasetId}" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    
    // Set up event listeners for the inputs
    dataTable.querySelectorAll('.data-label').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const index = parseInt(e.target.getAttribute('data-index'));
        this.datasets[id].labels[index] = e.target.value;
        this.updateChart();
      });
    });
    
    dataTable.querySelectorAll('.data-value').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const index = parseInt(e.target.getAttribute('data-index'));
        this.datasets[id].data[index] = parseFloat(e.target.value);
        this.updateChart();
      });
    });
    
    dataTable.querySelectorAll('.delete-data-point-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const index = parseInt(e.target.getAttribute('data-index'));
        
        this.datasets[id].data.splice(index, 1);
        this.datasets[id].labels.splice(index, 1);
        
        this.updateDataTable(id);
        this.updateChart();
      });
    });
  }
  
  setupDatasetEvents(datasetId) {
    // Dataset label change
    this.shadowRoot.getElementById(`datasetLabel-${datasetId}`).addEventListener('change', (e) => {
      this.datasets[datasetId].label = e.target.value;
      this.updateChart();
    });
    
    // Dataset color change
    this.shadowRoot.getElementById(`datasetColor-${datasetId}`).addEventListener('change', (e) => {
      const color = e.target.value;
      this.datasets[datasetId].borderColor = color;
      this.datasets[datasetId].backgroundColor = this.hexToRgba(color, parseFloat(this.shadowRoot.getElementById(`datasetOpacity-${datasetId}`).value));
      this.updateChart();
    });
    
    // Dataset opacity change
    this.shadowRoot.getElementById(`datasetOpacity-${datasetId}`).addEventListener('change', (e) => {
      const opacity = parseFloat(e.target.value);
      const color = this.shadowRoot.getElementById(`datasetColor-${datasetId}`).value;
      this.datasets[datasetId].backgroundColor = this.hexToRgba(color, opacity);
      this.updateChart();
    });
    
    // Add data point
    this.shadowRoot.querySelector(`.add-data-point-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      this.datasets[datasetId].data.push(0);
      this.datasets[datasetId].labels.push(`Point ${this.datasets[datasetId].data.length}`);
      this.updateDataTable(datasetId);
      this.updateChart();
    });
    
    // Delete dataset
    this.shadowRoot.querySelector(`.delete-dataset-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      if (this.datasets.length > 1) {
        this.datasets.splice(datasetId, 1);
        
        // Remove the dataset element
        this.shadowRoot.getElementById(`dataset-${datasetId}`).remove();
        
        // Update dataset IDs
        this.refreshDatasetIds();
        
        this.updateChart();
      } else {
        alert('You must have at least one dataset.');
      }
    });
    
    // Import CSV
    this.shadowRoot.querySelector(`.import-csv-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      this.shadowRoot.getElementById(`csvFile-${datasetId}`).click();
    });
    
    this.shadowRoot.getElementById(`csvFile-${datasetId}`).addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvData = event.target.result;
          this.importCSV(datasetId, csvData);
        };
        reader.readAsText(file);
      }
    });
    
    // Bulk Edit
    this.shadowRoot.querySelector(`.bulk-edit-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      const bulkEditContainer = this.shadowRoot.getElementById(`bulkEdit-${datasetId}`);
      bulkEditContainer.style.display = 'block';
      
      // Populate the text area with current data
      const textArea = this.shadowRoot.getElementById(`bulkEditText-${datasetId}`);
      let bulkText = '';
      this.datasets[datasetId].data.forEach((value, index) => {
        bulkText += `${this.datasets[datasetId].labels[index] || ''},${value}\n`;
      });
      textArea.value = bulkText;
    });
    
    this.shadowRoot.querySelector(`.apply-bulk-edit-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      const textArea = this.shadowRoot.getElementById(`bulkEditText-${datasetId}`);
      const lines = textArea.value.split('\n');
      
      const newData = [];
      const newLabels = [];
      
      lines.forEach(line => {
        line = line.trim();
        if (line) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            newLabels.push(parts[0]);
            newData.push(parseFloat(parts[1]) || 0);
          }
        }
      });
      
      if (newData.length > 0) {
        this.datasets[datasetId].data = newData;
        this.datasets[datasetId].labels = newLabels;
        this.updateDataTable(datasetId);
        this.updateChart();
      }
      
      this.shadowRoot.getElementById(`bulkEdit-${datasetId}`).style.display = 'none';
    });
    
    this.shadowRoot.querySelector(`.cancel-bulk-edit-btn[data-id="${datasetId}"]`).addEventListener('click', () => {
      this.shadowRoot.getElementById(`bulkEdit-${datasetId}`).style.display = 'none';
    });
  }
  
  refreshDatasetIds() {
    // Update all dataset elements with new IDs
    const datasetContainers = this.shadowRoot.querySelectorAll('.data-set-container');
    datasetContainers.forEach((container, index) => {
      // Update dataset title
      const titleElement = container.querySelector('.data-set-title');
      titleElement.textContent = `Dataset ${index + 1}`;
      
      // Update all data attributes
      const elements = container.querySelectorAll('[data-id]');
      elements.forEach(el => {
        el.setAttribute('data-id', index);
      });
      
      // Update container ID
      container.id = `dataset-${index}`;
      
      // Update label input
      const labelInput = container.querySelector('.dataset-label');
      if (labelInput && labelInput.value.startsWith('Dataset ')) {
        labelInput.value = `Dataset ${index + 1}`;
        this.datasets[index].label = `Dataset ${index + 1}`;
      }
    });
  }
  
  importCSV(datasetId, csvData) {
    // Parse the CSV data
    window.Papa.parse(csvData, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const newData = [];
          const newLabels = [];
          
          // Skip header row if it exists
          const startRow = results.meta.fields ? 1 : 0;
          
          for (let i = startRow; i < results.data.length; i++) {
            const row = results.data[i];
            if (row.length >= 2) {
              newLabels.push(row[0]);
              newData.push(parseFloat(row[1]) || 0);
            }
          }
          
          if (newData.length > 0) {
            this.datasets[datasetId].data = newData;
            this.datasets[datasetId].labels = newLabels;
            this.updateDataTable(datasetId);
            this.updateChart();
          } else {
            alert('No valid data found in the CSV file.');
          }
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  }
  
  initializeOptions() {
    // Chart type change
    this.shadowRoot.getElementById('chartType').addEventListener('change', (e) => {
      this.chartType = e.target.value;
      this.updateChartSpecificOptions();
      this.updateChart();
    });
    
    // Chart title
    this.shadowRoot.getElementById('chartTitle').addEventListener('input', (e) => {
      this.settings.title = e.target.value;
      this.updateChart();
    });
    
    // Axis titles
    this.shadowRoot.getElementById('xAxisTitle').addEventListener('input', (e) => {
      this.settings.xAxisTitle = e.target.value;
      this.updateChart();
    });
    
    this.shadowRoot.getElementById('yAxisTitle').addEventListener('input', (e) => {
      this.settings.yAxisTitle = e.target.value;
      this.updateChart();
    });
    
    // Chart options
    this.shadowRoot.getElementById('showLegend').addEventListener('change', (e) => {
      this.settings.showLegend = e.target.checked;
      this.updateChart();
    });
    
    this.shadowRoot.getElementById('showGridLines').addEventListener('change', (e) => {
      this.settings.showGridLines = e.target.checked;
      this.updateChart();
    });
    
    this.shadowRoot.getElementById('animationsEnabled').addEventListener('change', (e) => {
      this.settings.animationsEnabled = e.target.checked;
      this.updateChart();
    });
    
    // Update chart specific options initially
    this.updateChartSpecificOptions();
    
    // Chart background color
    this.shadowRoot.getElementById('chartBgColor').addEventListener('change', (e) => {
      this.settings.chartBgColor = e.target.value;
      this.updateChart();
    });
    
    // Font family
    this.shadowRoot.getElementById('fontFamily').addEventListener('change', (e) => {
      this.settings.fontFamily = e.target.value;
      this.updateChart();
    });
    
    // Title color
    this.shadowRoot.getElementById('titleColor').addEventListener('change', (e) => {
      this.settings.titleColor = e.target.value;
      this.updateChart();
    });
    
    // Axis color
    this.shadowRoot.getElementById('axisColor').addEventListener('change', (e) => {
      this.settings.axisColor = e.target.value;
      this.updateChart();
    });
    
    // Chart size
    this.shadowRoot.getElementById('chartWidth').addEventListener('input', (e) => {
      this.settings.chartWidth = parseInt(e.target.value);
      this.shadowRoot.getElementById('chartWidthValue').textContent = `${this.settings.chartWidth}px`;
      this.updateChartSize();
    });
    
    this.shadowRoot.getElementById('chartHeight').addEventListener('input', (e) => {
      this.settings.chartHeight = parseInt(e.target.value);
      this.shadowRoot.getElementById('chartHeightValue').textContent = `${this.settings.chartHeight}px`;
      this.updateChartSize();
    });
    
    // Preview chart size
    this.shadowRoot.getElementById('previewChartWidth').addEventListener('input', (e) => {
      this.settings.chartWidth = parseInt(e.target.value);
      this.shadowRoot.getElementById('previewChartWidthValue').textContent = `${this.settings.chartWidth}px`;
      this.updateChartSize();
    });
    
    this.shadowRoot.getElementById('previewChartHeight').addEventListener('input', (e) => {
      this.settings.chartHeight = parseInt(e.target.value);
      this.shadowRoot.getElementById('previewChartHeightValue').textContent = `${this.settings.chartHeight}px`;
      this.updateChartSize();
    });
    
    // Border radius
    this.shadowRoot.getElementById('borderRadius').addEventListener('input', (e) => {
      this.settings.borderRadius = parseInt(e.target.value);
      this.shadowRoot.getElementById('borderRadiusValue').textContent = `${this.settings.borderRadius}px`;
      this.shadowRoot.querySelector('.chart-container').style.borderRadius = `${this.settings.borderRadius}px`;
    });
  }
  
  updateChartSpecificOptions() {
    const container = this.shadowRoot.getElementById('chartSpecificOptions');
    let html = '';
    
    switch (this.chartType) {
      case 'line':
        html = `
          <div class="form-group">
            <label class="form-label" for="lineTension">Line Tension</label>
            <input type="range" id="lineTension" class="form-control" min="0" max="1" step="0.1" value="${this.chartOptions.line.tension}">
            <span id="lineTensionValue">${this.chartOptions.line.tension}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="linePointRadius">Point Radius</label>
            <input type="range" id="linePointRadius" class="form-control" min="0" max="10" step="1" value="${this.chartOptions.line.pointRadius}">
            <span id="linePointRadiusValue">${this.chartOptions.line.pointRadius}px</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="lineBorderWidth">Line Width</label>
            <input type="range" id="lineBorderWidth" class="form-control" min="1" max="10" step="1" value="${this.chartOptions.line.borderWidth}">
            <span id="lineBorderWidthValue">${this.chartOptions.line.borderWidth}px</span>
          </div>
        `;
        break;
        
      case 'multi-axis':
        html = `
          <div class="form-group">
            <label class="form-label" for="multiAxisTension">Line Tension</label>
            <input type="range" id="multiAxisTension" class="form-control" min="0" max="1" step="0.1" value="${this.chartOptions.line.tension}">
            <span id="multiAxisTensionValue">${this.chartOptions.line.tension}</span>
          </div>
          <div class="form-group">
            <p>Multi-Axis settings will use alternate Y-axes for even and odd datasets.</p>
          </div>
        `;
        break;
        
      case 'stepped':
        html = `
          <div class="form-group">
            <label class="form-label" for="steppedMode">Stepped Mode</label>
            <select id="steppedMode" class="form-select">
              <option value="before" ${this.chartOptions.stepped.stepped === 'before' ? 'selected' : ''}>Before</option>
              <option value="after" ${this.chartOptions.stepped.stepped === 'after' ? 'selected' : ''}>After</option>
              <option value="middle" ${this.chartOptions.stepped.stepped === 'middle' ? 'selected' : ''}>Middle</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="steppedPointRadius">Point Radius</label>
            <input type="range" id="steppedPointRadius" class="form-control" min="0" max="10" step="1" value="${this.chartOptions.stepped.pointRadius}">
            <span id="steppedPointRadiusValue">${this.chartOptions.stepped.pointRadius}px</span>
          </div>
        `;
        break;
        
      case 'interpolated':
        html = `
          <div class="form-group">
            <label class="form-label" for="interpTension">Line Tension (Higher = more curved)</label>
            <input type="range" id="interpTension" class="form-control" min="0" max="1" step="0.1" value="${this.chartOptions.interpolated.tension}">
            <span id="interpTensionValue">${this.chartOptions.interpolated.tension}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="interpPointRadius">Point Radius</label>
            <input type="range" id="interpPointRadius" class="form-control" min="0" max="10" step="1" value="${this.chartOptions.interpolated.pointRadius}">
            <span id="interpPointRadiusValue">${this.chartOptions.interpolated.pointRadius}px</span>
          </div>
        `;
        break;
        
      case 'points':
        html = `
          <div class="form-group">
            <label class="form-label" for="pointsRadius">Point Radius</label>
            <input type="range" id="pointsRadius" class="form-control" min="1" max="15" step="1" value="${this.chartOptions.points.pointRadius}">
            <span id="pointsRadiusValue">${this.chartOptions.points.pointRadius}px</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="pointsBorderWidth">Line Width</label>
            <input type="range" id="pointsBorderWidth" class="form-control" min="0" max="5" step="1" value="${this.chartOptions.points.borderWidth}">
            <span id="pointsBorderWidthValue">${this.chartOptions.points.borderWidth}px</span>
          </div>
        `;
        break;
        
      case 'filled':
        html = `
          <div class="form-group">
            <label class="form-label" for="filledTension">Line Tension</label>
            <input type="range" id="filledTension" class="form-control" min="0" max="1" step="0.1" value="${this.chartOptions.filled.tension}">
            <span id="filledTensionValue">${this.chartOptions.filled.tension}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="filledPointRadius">Point Radius</label>
            <input type="range" id="filledPointRadius" class="form-control" min="0" max="10" step="1" value="${this.chartOptions.filled.pointRadius}">
            <span id="filledPointRadiusValue">${this.chartOptions.filled.pointRadius}px</span>
          </div>
        `;
        break;
    }
    
    container.innerHTML = html;
    
    // Add event listeners for chart specific options
    this.setupChartSpecificOptionEvents();
  }
  
  setupChartSpecificOptionEvents() {
    // Line chart options
    if (this.chartType === 'line') {
      const tensionInput = this.shadowRoot.getElementById('lineTension');
      const pointRadiusInput = this.shadowRoot.getElementById('linePointRadius');
      const borderWidthInput = this.shadowRoot.getElementById('lineBorderWidth');
      
      if (tensionInput) {
        tensionInput.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          this.chartOptions.line.tension = value;
          this.shadowRoot.getElementById('lineTensionValue').textContent = value;
          this.updateChart();
        });
      }
      
      if (pointRadiusInput) {
        pointRadiusInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.line.pointRadius = value;
          this.shadowRoot.getElementById('linePointRadiusValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
      
      if (borderWidthInput) {
        borderWidthInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.line.borderWidth = value;
          this.shadowRoot.getElementById('lineBorderWidthValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
    }
    
    // Multi-axis options
    if (this.chartType === 'multi-axis') {
      const tensionInput = this.shadowRoot.getElementById('multiAxisTension');
      
      if (tensionInput) {
        tensionInput.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          this.chartOptions.line.tension = value;
          this.shadowRoot.getElementById('multiAxisTensionValue').textContent = value;
          this.updateChart();
        });
      }
    }
    
    // Stepped options
    if (this.chartType === 'stepped') {
      const modeSelect = this.shadowRoot.getElementById('steppedMode');
      const pointRadiusInput = this.shadowRoot.getElementById('steppedPointRadius');
      
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          this.chartOptions.stepped.stepped = e.target.value;
          this.updateChart();
        });
      }
      
      if (pointRadiusInput) {
        pointRadiusInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.stepped.pointRadius = value;
          this.shadowRoot.getElementById('steppedPointRadiusValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
    }
    
    // Interpolated options
    if (this.chartType === 'interpolated') {
      const tensionInput = this.shadowRoot.getElementById('interpTension');
      const pointRadiusInput = this.shadowRoot.getElementById('interpPointRadius');
      
      if (tensionInput) {
        tensionInput.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          this.chartOptions.interpolated.tension = value;
          this.shadowRoot.getElementById('interpTensionValue').textContent = value;
          this.updateChart();
        });
      }
      
      if (pointRadiusInput) {
        pointRadiusInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.interpolated.pointRadius = value;
          this.shadowRoot.getElementById('interpPointRadiusValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
    }
    
    // Points options
    if (this.chartType === 'points') {
      const radiusInput = this.shadowRoot.getElementById('pointsRadius');
      const borderWidthInput = this.shadowRoot.getElementById('pointsBorderWidth');
      
      if (radiusInput) {
        radiusInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.points.pointRadius = value;
          this.shadowRoot.getElementById('pointsRadiusValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
      
      if (borderWidthInput) {
        borderWidthInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.points.borderWidth = value;
          this.shadowRoot.getElementById('pointsBorderWidthValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
    }
    
    // Filled options
    if (this.chartType === 'filled') {
      const tensionInput = this.shadowRoot.getElementById('filledTension');
      const pointRadiusInput = this.shadowRoot.getElementById('filledPointRadius');
      
      if (tensionInput) {
        tensionInput.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          this.chartOptions.filled.tension = value;
          this.shadowRoot.getElementById('filledTensionValue').textContent = value;
          this.updateChart();
        });
      }
      
      if (pointRadiusInput) {
        pointRadiusInput.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          this.chartOptions.filled.pointRadius = value;
          this.shadowRoot.getElementById('filledPointRadiusValue').textContent = `${value}px`;
          this.updateChart();
        });
      }
    }
  }
  
  initializeThemes() {
    const themesContainer = this.shadowRoot.getElementById('themesContainer');
    
    this.themes.forEach((theme, index) => {
      const themeElement = document.createElement('div');
      themeElement.className = `theme-option ${index === 0 ? 'active' : ''}`;
      themeElement.setAttribute('data-theme-index', index);
      
      let themePreviewHtml = '<div class="theme-preview">';
      theme.colors.slice(0, 5).forEach(color => {
        themePreviewHtml += `<div class="theme-color" style="background-color: ${color}"></div>`;
      });
      themePreviewHtml += '</div>';
      
      themeElement.innerHTML = `
        ${themePreviewHtml}
        <div>${theme.name}</div>
      `;
      
      themesContainer.appendChild(themeElement);
      
      themeElement.addEventListener('click', () => {
        // Deactivate all themes
        this.shadowRoot.querySelectorAll('.theme-option').forEach(el => {
          el.classList.remove('active');
        });
        
        // Activate this theme
        themeElement.classList.add('active');
        
        // Apply the theme
        this.applyTheme(index);
      });
    });
  }
  
  applyTheme(themeIndex) {
    const theme = this.themes[themeIndex];
    
    // Update chart background
    this.settings.chartBgColor = theme.bgColor;
    this.shadowRoot.getElementById('chartBgColor').value = theme.bgColor;
    
    // Update title color
    this.settings.titleColor = theme.titleColor;
    this.shadowRoot.getElementById('titleColor').value = theme.titleColor;
    
    // Update axis color
    this.settings.axisColor = theme.axisColor;
    this.shadowRoot.getElementById('axisColor').value = theme.axisColor;
    
    // Update dataset colors
    this.datasets.forEach((dataset, index) => {
      const color = theme.colors[index % theme.colors.length];
      dataset.borderColor = color;
      dataset.backgroundColor = this.hexToRgba(color, 0.2);
      
      // Update color inputs
      const colorInput = this.shadowRoot.getElementById(`datasetColor-${index}`);
      if (colorInput) {
        colorInput.value = color;
      }
    });
    
    this.updateChart();
  }
  
  initializeEvents() {
    // Update chart button
    this.shadowRoot.getElementById('updateChartBtn').addEventListener('click', () => {
      this.hideEditor();
    });
    
    // Edit button
    this.shadowRoot.getElementById('editButton').addEventListener('click', () => {
      this.showEditor();
    });
    
    // Save button
    this.shadowRoot.getElementById('saveBtn').addEventListener('click', () => {
      this.saveChartData();
      this.hideEditor();
    });
    
    // Cancel button
    this.shadowRoot.getElementById('cancelBtn').addEventListener('click', () => {
      this.hideEditor();
    });
    
    // Export button
    this.shadowRoot.getElementById('exportBtn').addEventListener('click', () => {
      this.exportChart();
    });
  }
  
  hideEditor() {
    this.shadowRoot.getElementById('editorContainer').classList.add('hidden');
    this.shadowRoot.getElementById('editButton').classList.remove('hidden');
  }
  
  showEditor() {
    this.shadowRoot.getElementById('editorContainer').classList.remove('hidden');
    this.shadowRoot.getElementById('editButton').classList.add('hidden');
  }
  
  updateChartSize() {
    const chartCanvas = this.shadowRoot.getElementById('chartCanvas');
    chartCanvas.parentElement.style.width = `${this.settings.chartWidth}px`;
    chartCanvas.parentElement.style.height = `${this.settings.chartHeight}px`;
    
    if (this.chart) {
      this.chart.resize();
    }
  }
  
  initializeChart() {
    const ctx = this.shadowRoot.getElementById('chartCanvas').getContext('2d');
    
    // Default configuration
    const config = this.getChartConfig();
    
    // Create the chart
    this.chart = new window.Chart(ctx, config);
    
    // Update chart size
    this.updateChartSize();
  }
  
  updateChart() {
    if (!this.chart) {
      return;
    }
    
    const config = this.getChartConfig();
    
    // Update chart type if needed
    if (this.chart.config.type !== 'line') {
      this.chart.destroy();
      const ctx = this.shadowRoot.getElementById('chartCanvas').getContext('2d');
      this.chart = new window.Chart(ctx, config);
      return;
    }
    
    // Update datasets
    this.chart.data.datasets = config.data.datasets;
    this.chart.data.labels = config.data.labels;
    
    // Update options
    this.chart.options = config.options;
    
    // Update the chart
    this.chart.update();
  }
  
  getChartConfig() {
    // Get the first dataset's labels as the shared labels
    const sharedLabels = this.datasets.length > 0 ? this.datasets[0].labels : [];
    
    // Create chart datasets
    const chartDatasets = this.datasets.map((dataset, index) => {
      const datasetConfig = {
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        borderWidth: 2,
        pointRadius: 3
      };
      
      // Add chart-type specific options
      switch (this.chartType) {
        case 'line':
          datasetConfig.tension = this.chartOptions.line.tension;
          datasetConfig.pointRadius = this.chartOptions.line.pointRadius;
          datasetConfig.borderWidth = this.chartOptions.line.borderWidth;
          break;
          
        case 'multi-axis':
          datasetConfig.tension = this.chartOptions.line.tension;
          // For multi-axis, alternate between left and right y-axis
          datasetConfig.yAxisID = index % 2 === 0 ? 'y' : 'y1';
          break;
          
        case 'stepped':
          datasetConfig.stepped = this.chartOptions.stepped.stepped;
          datasetConfig.pointRadius = this.chartOptions.stepped.pointRadius;
          datasetConfig.borderWidth = this.chartOptions.stepped.borderWidth;
          break;
          
        case 'interpolated':
          datasetConfig.tension = this.chartOptions.interpolated.tension;
          datasetConfig.pointRadius = this.chartOptions.interpolated.pointRadius;
          datasetConfig.borderWidth = this.chartOptions.interpolated.borderWidth;
          break;
          
        case 'points':
          datasetConfig.tension = 0;
          datasetConfig.pointRadius = this.chartOptions.points.pointRadius;
          datasetConfig.borderWidth = this.chartOptions.points.borderWidth;
          break;
          
        case 'filled':
          datasetConfig.tension = this.chartOptions.filled.tension;
          datasetConfig.pointRadius = this.chartOptions.filled.pointRadius;
          datasetConfig.borderWidth = this.chartOptions.filled.borderWidth;
          datasetConfig.fill = true;
          break;
      }
      
      return datasetConfig;
    });
    
    // Create chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: this.settings.animationsEnabled ? 1000 : 0
      },
      plugins: {
        legend: {
          display: this.settings.showLegend,
          labels: {
            font: {
              family: this.settings.fontFamily,
              size: 12
            },
            color: this.settings.titleColor
          }
        },
        title: {
          display: this.settings.title !== '',
          text: this.settings.title,
          font: {
            family: this.settings.fontFamily,
            size: 16,
            weight: 'bold'
          },
          color: this.settings.titleColor,
          padding: 20
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: this.settings.xAxisTitle !== '',
            text: this.settings.xAxisTitle,
            font: {
              family: this.settings.fontFamily,
              size: 12
            },
            color: this.settings.axisColor
          },
          grid: {
            display: this.settings.showGridLines
          },
          ticks: {
            font: {
              family: this.settings.fontFamily,
              size: 11
            },
            color: this.settings.axisColor
          }
        },
        y: {
          display: true,
          title: {
            display: this.settings.yAxisTitle !== '',
            text: this.settings.yAxisTitle,
            font: {
              family: this.settings.fontFamily,
              size: 12
            },
            color: this.settings.axisColor
          },
          grid: {
            display: this.settings.showGridLines
          },
          ticks: {
            font: {
              family: this.settings.fontFamily,
              size: 11
            },
            color: this.settings.axisColor
          }
        }
      }
    };
    
    // Add second y-axis for multi-axis chart
    if (this.chartType === 'multi-axis') {
      chartOptions.scales.y1 = {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Secondary Y-Axis',
          font: {
            family: this.settings.fontFamily,
            size: 12
          },
          color: this.settings.axisColor
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: this.settings.fontFamily,
            size: 11
          },
          color: this.settings.axisColor
        }
      };
    }
    
    return {
      type: 'line',
      data: {
        labels: sharedLabels,
        datasets: chartDatasets
      },
      options: chartOptions
    };
  }
  
  hexToRgba(hex, alpha = 1) {
    // Convert hex to RGB
    let r = 0, g = 0, b = 0;
    
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } 
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Save chart data to Wix
  saveChartData() {
    try {
      // Create a chart data object to save
      const chartData = {
        settings: this.settings,
        datasets: this.datasets,
        chartType: this.chartType,
        chartOptions: this.chartOptions
      };
      
      // Convert to JSON string
      const chartDataJSON = JSON.stringify(chartData);
      
      // Dispatch a custom event that Wix can listen to
      const event = new CustomEvent('wix-chart-save', { 
        detail: { chartData: chartDataJSON },
        bubbles: true, 
        composed: true 
      });
      
      this.dispatchEvent(event);
      
      // Notify user of successful save
      this.showNotification('Chart saved successfully!');
    } catch (error) {
      console.error('Error saving chart:', error);
      this.showNotification('Error saving chart. Please try again.', 'error');
    }
  }
  
  // Export chart as image
  exportChart() {
    if (!this.chart) {
      return;
    }
    
    try {
      // Get chart canvas and convert to data URL
      const chartCanvas = this.shadowRoot.getElementById('chartCanvas');
      const imageData = chartCanvas.toDataURL('image/png');
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = imageData;
      downloadLink.download = `${this.settings.title || 'chart'}.png`;
      
      // Append to body, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error exporting chart:', error);
      this.showNotification('Error exporting chart. Please try again.', 'error');
    }
  }
  
  // Show notification message
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
  
  // For Wix integration - load saved chart data
  loadChartData(chartDataJSON) {
    try {
      if (!chartDataJSON) return;
      
      const chartData = JSON.parse(chartDataJSON);
      
      if (chartData.settings) this.settings = chartData.settings;
      if (chartData.datasets) this.datasets = chartData.datasets;
      if (chartData.chartType) this.chartType = chartData.chartType;
      if (chartData.chartOptions) this.chartOptions = chartData.chartOptions;
      
      // Update UI with loaded data
      this.updateUIFromLoadedData();
      
      // Update chart
      this.updateChart();
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  }
  
  // Update UI elements from loaded data
  updateUIFromLoadedData() {
    // Update settings UI
    const chartTitle = this.shadowRoot.getElementById('chartTitle');
    if (chartTitle) chartTitle.value = this.settings.title;
    
    const xAxisTitle = this.shadowRoot.getElementById('xAxisTitle');
    if (xAxisTitle) xAxisTitle.value = this.settings.xAxisTitle;
    
    const yAxisTitle = this.shadowRoot.getElementById('yAxisTitle');
    if (yAxisTitle) yAxisTitle.value = this.settings.yAxisTitle;
    
    const showLegend = this.shadowRoot.getElementById('showLegend');
    if (showLegend) showLegend.checked = this.settings.showLegend;
    
    const showGridLines = this.shadowRoot.getElementById('showGridLines');
    if (showGridLines) showGridLines.checked = this.settings.showGridLines;
    
    const animationsEnabled = this.shadowRoot.getElementById('animationsEnabled');
    if (animationsEnabled) animationsEnabled.checked = this.settings.animationsEnabled;
    
    // Update chart type
    const chartTypeSelect = this.shadowRoot.getElementById('chartType');
    if (chartTypeSelect) chartTypeSelect.value = this.chartType;
    
    // Clear existing datasets and rebuild
    const datasetContainer = this.shadowRoot.getElementById('datasetContainer');
    if (datasetContainer) {
      datasetContainer.innerHTML = '';
      this.datasets.forEach((dataset, index) => {
        // Create UI for each dataset
        const datasetElement = document.createElement('div');
        datasetElement.className = 'data-set-container';
        datasetElement.id = `dataset-${index}`;
        // ... (add dataset UI content)
        datasetContainer.appendChild(datasetElement);
        this.updateDataTable(index);
        this.setupDatasetEvents(index);
      });
    }
    
    // Update chart specific options
    this.updateChartSpecificOptions();
  }
}

// Register the custom element
customElements.define('chart-builder-element', ChartBuilderElement);

// Export for Wix integration
export default ChartBuilderElement;
