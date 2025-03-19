/**
 * Chart Builder Custom Element for Wix Studio
 * 
 * Custom Element ID: chart-builder
 * Custom Element Tag: chart-builder
 * GitHub Repository: wix-chart-builder
 * Source JS File: chart-builder.js
 * 
 * This custom element creates an advanced chart builder using Chart.js
 * with support for different line chart types and customization options.
 */

class ChartBuilder extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Chart instance
    this.chartInstance = null;
    
    // Chart data
    this.chartData = {
      datasets: [
        {
          label: 'Dataset 1',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: false
        }
      ],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    };
    
    // Chart settings
    this.chartSettings = {
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Chart Title',
            font: {
              size: 18,
              family: 'Arial'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'X Axis'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Y Axis'
            }
          }
        }
      }
    };
    
    // Chart themes
    this.themes = {
      'default': {
        colors: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgb(255, 159, 64)'],
        backgroundColor: '#ffffff',
        fontFamily: 'Arial',
        titleColor: '#333333',
        axisColor: '#666666'
      },
      'dark': {
        colors: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgb(255, 159, 64)'],
        backgroundColor: '#333333',
        fontFamily: 'Arial',
        titleColor: '#ffffff',
        axisColor: '#cccccc'
      },
      'pastel': {
        colors: ['rgb(187, 222, 251)', 'rgb(248, 187, 208)', 'rgb(200, 230, 201)', 'rgb(255, 224, 178)', 'rgb(209, 196, 233)', 'rgb(244, 143, 177)', 'rgb(129, 199, 132)'],
        backgroundColor: '#f5f5f5',
        fontFamily: 'Roboto',
        titleColor: '#444444',
        axisColor: '#777777'
      },
      'high-contrast': {
        colors: ['rgb(0, 0, 0)', 'rgb(230, 0, 0)', 'rgb(0, 102, 204)', 'rgb(153, 0, 153)', 'rgb(0, 153, 0)', 'rgb(204, 102, 0)', 'rgb(102, 102, 153)'],
        backgroundColor: '#ffffff',
        fontFamily: 'Arial',
        titleColor: '#000000',
        axisColor: '#000000'
      }
    };
    
    // Current theme
    this.currentTheme = 'default';
    
    // Is editor open or chart view
    this.isEditorView = true;
  }
  
  connectedCallback() {
    this.render();
    this.loadChartJsLibrary();
  }
  
  loadChartJsLibrary() {
    // Check if Chart.js is already loaded
    if (window.Chart) {
      this.initializeChart();
      return;
    }
    
    // Create Chart.js script element
    const chartJsScript = document.createElement('script');
    chartJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js';
    chartJsScript.integrity = 'sha512-QSkVNOCYLtj73J4hbmVoOV6KVZuMluZlioC+trLpewV8qMjsWqlIQvkn1KGX2StWvPMdWGBqim1xlC8krl1EKQ==';
    chartJsScript.crossOrigin = 'anonymous';
    chartJsScript.referrerPolicy = 'no-referrer';
    
    // Event listener for when the script is loaded
    chartJsScript.addEventListener('load', () => {
      this.initializeChart();
    });
    
    // Add the script to the document
    this.shadowRoot.appendChild(chartJsScript);
  }
  
  initializeChart() {
    // Get the canvas element
    const canvas = this.shadowRoot.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    // Create chart instance
    this.chartInstance = new Chart(ctx, {
      type: this.chartSettings.type,
      data: this.chartData,
      options: this.chartSettings.options
    });
    
    // Initialize event listeners
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // Tab navigation
    const tabs = this.shadowRoot.querySelectorAll('.tab-button');
    const tabContents = this.shadowRoot.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to the clicked tab
        tab.classList.add('active');
        
        // Hide all tab contents
        tabContents.forEach(content => content.style.display = 'none');
        
        // Show the corresponding tab content
        const tabId = tab.getAttribute('data-tab');
        this.shadowRoot.getElementById(tabId).style.display = 'block';
      });
    });
    
    // Chart type selection
    const chartTypeSelect = this.shadowRoot.getElementById('chart-type');
    chartTypeSelect.addEventListener('change', () => {
      this.updateChartType(chartTypeSelect.value);
    });
    
    // Add dataset button
    const addDatasetBtn = this.shadowRoot.getElementById('add-dataset');
    addDatasetBtn.addEventListener('click', () => {
      this.addDataset();
    });
    
    // Update chart button
    const updateChartBtn = this.shadowRoot.getElementById('update-chart');
    updateChartBtn.addEventListener('click', () => {
      this.updateChart();
      this.toggleEditorView();
    });
    
    // Edit chart button
    const editChartBtn = this.shadowRoot.getElementById('edit-chart');
    editChartBtn.addEventListener('click', () => {
      this.toggleEditorView();
    });
    
    // Theme selection
    const themeSelect = this.shadowRoot.getElementById('chart-theme');
    themeSelect.addEventListener('change', () => {
      this.changeTheme(themeSelect.value);
    });
    
    // File import
    const fileImport = this.shadowRoot.getElementById('file-import');
    fileImport.addEventListener('change', (event) => {
      this.importDataFromFile(event);
    });
    
    // Bulk data editor
    const bulkDataEditor = this.shadowRoot.getElementById('bulk-data');
    const bulkDataUpdateBtn = this.shadowRoot.getElementById('update-bulk-data');
    bulkDataUpdateBtn.addEventListener('click', () => {
      this.updateBulkData(bulkDataEditor.value);
    });
    
    // Initialize dataset editors
    this.updateDatasetEditors();
  }
  
  updateDatasetEditors() {
    const datasetContainer = this.shadowRoot.getElementById('datasets-container');
    datasetContainer.innerHTML = '';
    
    this.chartData.datasets.forEach((dataset, index) => {
      const datasetEditor = document.createElement('div');
      datasetEditor.className = 'dataset-editor';
      datasetEditor.innerHTML = `
        <div class="dataset-header">
          <h4>Dataset ${index + 1}</h4>
          <button class="delete-dataset" data-index="${index}">Delete</button>
        </div>
        <div class="dataset-fields">
          <div class="form-group">
            <label>Label</label>
            <input type="text" class="dataset-label" value="${dataset.label}" data-index="${index}">
          </div>
          <div class="form-group">
            <label>Border Color</label>
            <input type="color" class="dataset-border-color" value="${this.rgbToHex(dataset.borderColor)}" data-index="${index}">
          </div>
          <div class="form-group">
            <label>Background Color</label>
            <input type="color" class="dataset-bg-color" value="${this.rgbToHex(dataset.backgroundColor.replace('0.5', '1'))}" data-index="${index}">
          </div>
          <div class="form-group">
            <label>Fill</label>
            <select class="dataset-fill" data-index="${index}">
              <option value="false" ${dataset.fill === false ? 'selected' : ''}>No</option>
              <option value="true" ${dataset.fill === true ? 'selected' : ''}>Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tension (Curve)</label>
            <input type="range" min="0" max="1" step="0.1" class="dataset-tension" value="${dataset.tension}" data-index="${index}">
            <span>${dataset.tension}</span>
          </div>
          <div class="form-group">
            <label>Data Points (comma separated)</label>
            <input type="text" class="dataset-data" value="${dataset.data.join(',')}" data-index="${index}">
          </div>
        </div>
      `;
      
      datasetContainer.appendChild(datasetEditor);
      
      // Add event listeners for dataset fields
      const deleteBtn = datasetEditor.querySelector('.delete-dataset');
      deleteBtn.addEventListener('click', () => {
        this.deleteDataset(index);
      });
      
      const labelInput = datasetEditor.querySelector('.dataset-label');
      labelInput.addEventListener('change', () => {
        this.updateDatasetProperty(index, 'label', labelInput.value);
      });
      
      const borderColorInput = datasetEditor.querySelector('.dataset-border-color');
      borderColorInput.addEventListener('change', () => {
        this.updateDatasetProperty(index, 'borderColor', borderColorInput.value);
      });
      
      const bgColorInput = datasetEditor.querySelector('.dataset-bg-color');
      bgColorInput.addEventListener('change', () => {
        this.updateDatasetProperty(index, 'backgroundColor', this.hexToRgba(bgColorInput.value, 0.5));
      });
      
      const fillSelect = datasetEditor.querySelector('.dataset-fill');
      fillSelect.addEventListener('change', () => {
        this.updateDatasetProperty(index, 'fill', fillSelect.value === 'true');
      });
      
      const tensionInput = datasetEditor.querySelector('.dataset-tension');
      tensionInput.addEventListener('input', (e) => {
        const span = e.target.nextElementSibling;
        span.textContent = e.target.value;
        this.updateDatasetProperty(index, 'tension', parseFloat(e.target.value));
      });
      
      const dataInput = datasetEditor.querySelector('.dataset-data');
      dataInput.addEventListener('change', () => {
        const dataArray = dataInput.value.split(',').map(val => parseFloat(val.trim()));
        this.updateDatasetProperty(index, 'data', dataArray);
      });
    });
  }
  
  rgbToHex(rgb) {
    // Convert rgb(r, g, b) to #rrggbb
    if (!rgb || typeof rgb !== 'string') return '#4bc0c0';
    
    const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
    const match = rgb.match(rgbRegex);
    
    if (!match) return '#4bc0c0';
    
    function componentToHex(c) {
      const hex = parseInt(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }
    
    return `#${componentToHex(match[1])}${componentToHex(match[2])}${componentToHex(match[3])}`;
  }
  
  hexToRgba(hex, alpha) {
    // Convert #rrggbb to rgba(r, g, b, a)
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  updateDatasetProperty(index, property, value) {
    if (index >= this.chartData.datasets.length) return;
    
    this.chartData.datasets[index][property] = value;
  }
  
  addDataset() {
    // Check if we've reached the maximum number of datasets
    if (this.chartData.datasets.length >= 10) {
      alert('Maximum of 10 datasets reached.');
      return;
    }
    
    // Get the next color from the theme
    const colorIndex = this.chartData.datasets.length % this.themes[this.currentTheme].colors.length;
    const color = this.themes[this.currentTheme].colors[colorIndex];
    
    // Add a new dataset
    this.chartData.datasets.push({
      label: `Dataset ${this.chartData.datasets.length + 1}`,
      data: [0, 0, 0, 0, 0, 0],
      borderColor: color,
      backgroundColor: this.hexToRgba(this.rgbToHex(color), 0.5),
      tension: 0.1,
      fill: false
    });
    
    // Update dataset editors
    this.updateDatasetEditors();
  }
  
  deleteDataset(index) {
    if (this.chartData.datasets.length <= 1) {
      alert('Cannot delete the last dataset.');
      return;
    }
    
    this.chartData.datasets.splice(index, 1);
    this.updateDatasetEditors();
  }
  
  updateBulkData(data) {
    try {
      // Split by lines
      const lines = data.trim().split('\n');
      
      // First line is labels
      this.chartData.labels = lines[0].split(',').map(label => label.trim());
      
      // Rest of the lines are data for each dataset
      for (let i = 1; i < lines.length && i <= this.chartData.datasets.length; i++) {
        const dataPoints = lines[i].split(',').map(val => parseFloat(val.trim()));
        this.chartData.datasets[i - 1].data = dataPoints;
      }
      
      // Update dataset editors
      this.updateDatasetEditors();
      
    } catch (error) {
      alert('Error parsing bulk data. Please check format.');
      console.error(error);
    }
  }
  
  importDataFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const contents = e.target.result;
      this.shadowRoot.getElementById('bulk-data').value = contents;
      this.updateBulkData(contents);
    };
    
    reader.readAsText(file);
  }
  
  updateLabels() {
    const labelsInput = this.shadowRoot.getElementById('chart-labels');
    this.chartData.labels = labelsInput.value.split(',').map(label => label.trim());
  }
  
  updateChartTitle() {
    const titleInput = this.shadowRoot.getElementById('chart-title');
    this.chartSettings.options.plugins.title.text = titleInput.value;
  }
  
  updateChartType(type) {
    // Handle different line chart types
    switch (type) {
      case 'basic-line':
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.tension = 0;
          dataset.fill = false;
          dataset.stepped = false;
          dataset.pointRadius = 3;
        });
        break;
      case 'multi-axis-line':
        this.chartSettings.type = 'line';
        this.chartSettings.options.scales.y1 = {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Y Axis (Right)'
          }
        };
        // Assign alternate datasets to right axis
        this.chartData.datasets.forEach((dataset, index) => {
          dataset.yAxisID = index % 2 === 0 ? 'y' : 'y1';
          dataset.tension = 0;
          dataset.fill = false;
          dataset.stepped = false;
        });
        break;
      case 'stepped-line':
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.stepped = true;
          dataset.tension = 0;
          dataset.fill = false;
        });
        break;
      case 'interpolated-line':
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.stepped = false;
          dataset.tension = 0.4;
          dataset.fill = false;
        });
        break;
      case 'line-with-points':
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.stepped = false;
          dataset.tension = 0;
          dataset.fill = false;
          dataset.pointRadius = 6;
          dataset.pointHoverRadius = 8;
        });
        break;
      case 'filled-line':
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.stepped = false;
          dataset.tension = 0.3;
          dataset.fill = true;
        });
        break;
      default:
        this.chartSettings.type = 'line';
        this.chartData.datasets.forEach(dataset => {
          dataset.tension = 0.1;
          dataset.fill = false;
          dataset.stepped = false;
        });
    }
    
    // Update chart type specific settings fields
    this.updateChartTypeSettings(type);
  }
  
  updateChartTypeSettings(type) {
    const chartTypeSettingsDiv = this.shadowRoot.getElementById('chart-type-settings');
    
    switch (type) {
      case 'multi-axis-line':
        chartTypeSettingsDiv.innerHTML = `
          <div class="form-group">
            <label>Left Y-Axis Title</label>
            <input type="text" id="left-y-axis" value="${this.chartSettings.options.scales.y.title.text}">
          </div>
          <div class="form-group">
            <label>Right Y-Axis Title</label>
            <input type="text" id="right-y-axis" value="${this.chartSettings.options.scales.y1?.title.text || 'Y Axis (Right)'}">
          </div>
        `;
        
        // Add event listeners
        const leftYAxis = this.shadowRoot.getElementById('left-y-axis');
        leftYAxis.addEventListener('change', () => {
          this.chartSettings.options.scales.y.title.text = leftYAxis.value;
        });
        
        const rightYAxis = this.shadowRoot.getElementById('right-y-axis');
        rightYAxis.addEventListener('change', () => {
          if (!this.chartSettings.options.scales.y1) {
            this.chartSettings.options.scales.y1 = {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: rightYAxis.value
              }
            };
          } else {
            this.chartSettings.options.scales.y1.title.text = rightYAxis.value;
          }
        });
        break;
        
      case 'stepped-line':
        chartTypeSettingsDiv.innerHTML = `
          <div class="form-group">
            <label>Step Position</label>
            <select id="step-position">
              <option value="middle">Middle</option>
              <option value="before">Before</option>
              <option value="after">After</option>
            </select>
          </div>
        `;
        
        const stepPosition = this.shadowRoot.getElementById('step-position');
        stepPosition.addEventListener('change', () => {
          this.chartData.datasets.forEach(dataset => {
            dataset.stepped = stepPosition.value;
          });
        });
        break;
        
      case 'interpolated-line':
        chartTypeSettingsDiv.innerHTML = `
          <div class="form-group">
            <label>Curve Tension (all datasets)</label>
            <input type="range" min="0" max="1" step="0.1" id="curve-tension" value="0.4">
            <span>0.4</span>
          </div>
        `;
        
        const curveTension = this.shadowRoot.getElementById('curve-tension');
        curveTension.addEventListener('input', (e) => {
          const span = e.target.nextElementSibling;
          span.textContent = e.target.value;
          
          this.chartData.datasets.forEach(dataset => {
            dataset.tension = parseFloat(e.target.value);
          });
        });
        break;
        
      case 'line-with-points':
        chartTypeSettingsDiv.innerHTML = `
          <div class="form-group">
            <label>Point Radius</label>
            <input type="range" min="1" max="10" step="1" id="point-radius" value="6">
            <span>6</span>
          </div>
          <div class="form-group">
            <label>Point Style</label>
            <select id="point-style">
              <option value="circle">Circle</option>
              <option value="cross">Cross</option>
              <option value="star">Star</option>
              <option value="triangle">Triangle</option>
              <option value="rect">Rectangle</option>
            </select>
          </div>
        `;
        
        const pointRadius = this.shadowRoot.getElementById('point-radius');
        pointRadius.addEventListener('input', (e) => {
          const span = e.target.nextElementSibling;
          span.textContent = e.target.value;
          
          this.chartData.datasets.forEach(dataset => {
            dataset.pointRadius = parseInt(e.target.value);
            dataset.pointHoverRadius = parseInt(e.target.value) + 2;
          });
        });
        
        const pointStyle = this.shadowRoot.getElementById('point-style');
        pointStyle.addEventListener('change', () => {
          this.chartData.datasets.forEach(dataset => {
            dataset.pointStyle = pointStyle.value;
          });
        });
        break;
        
      case 'filled-line':
        chartTypeSettingsDiv.innerHTML = `
          <div class="form-group">
            <label>Fill Alpha (Opacity)</label>
            <input type="range" min="0" max="1" step="0.1" id="fill-alpha" value="0.5">
            <span>0.5</span>
          </div>
        `;
        
        const fillAlpha = this.shadowRoot.getElementById('fill-alpha');
        fillAlpha.addEventListener('input', (e) => {
          const span = e.target.nextElementSibling;
          span.textContent = e.target.value;
          
          this.chartData.datasets.forEach(dataset => {
            const color = this.rgbToHex(dataset.borderColor);
            dataset.backgroundColor = this.hexToRgba(color, parseFloat(e.target.value));
          });
        });
        break;
        
      default:
        chartTypeSettingsDiv.innerHTML = '';
    }
  }
  
  changeTheme(theme) {
    if (!this.themes[theme]) return;
    
    this.currentTheme = theme;
    const themeSettings = this.themes[theme];
    
    // Update chart background
    this.shadowRoot.getElementById('chartContainer').style.backgroundColor = themeSettings.backgroundColor;
    
    // Update font family
    this.chartSettings.options.plugins.title.font.family = themeSettings.fontFamily;
    this.chartSettings.options.font = {
      family: themeSettings.fontFamily
    };
    
    // Update colors
    this.chartSettings.options.plugins.title.color = themeSettings.titleColor;
    this.chartSettings.options.scales.x.ticks = { color: themeSettings.axisColor };
    this.chartSettings.options.scales.y.ticks = { color: themeSettings.axisColor };
    
    // Update datasets colors
    this.chartData.datasets.forEach((dataset, index) => {
      const colorIndex = index % themeSettings.colors.length;
      dataset.borderColor = themeSettings.colors[colorIndex];
      dataset.backgroundColor = this.hexToRgba(this.rgbToHex(themeSettings.colors[colorIndex]), 0.5);
    });
    
    // Update dataset editors to reflect new colors
    this.updateDatasetEditors();
  }
  
  updateChart() {
    // Update labels from input
    this.updateLabels();
    
    // Update chart title
    this.updateChartTitle();
    
    // Update fonts
    const fontFamily = this.shadowRoot.getElementById('font-family').value;
    this.chartSettings.options.font = {
      family: fontFamily
    };
    this.chartSettings.options.plugins.title.font.family = fontFamily;
    
    const fontSize = this.shadowRoot.getElementById('font-size').value;
    this.chartSettings.options.plugins.title.font.size = parseInt(fontSize);
    
    // Update axes
    this.chartSettings.options.scales.x.title.text = this.shadowRoot.getElementById('x-axis-title').value;
    this.chartSettings.options.scales.y.title.text = this.shadowRoot.getElementById('y-axis-title').value;
    
    // Update legend position
    this.chartSettings.options.plugins.legend.position = this.shadowRoot.getElementById('legend-position').value;
    
    // Destroy the previous chart
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    // Create a new chart with updated settings
    const canvas = this.shadowRoot.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    this.chartInstance = new Chart(ctx, {
      type: this.chartSettings.type,
      data: this.chartData,
      options: this.chartSettings.options
    });
  }
  
  toggleEditorView() {
    this.isEditorView = !this.isEditorView;
    
    const editorContainer = this.shadowRoot.getElementById('editor-container');
    const chartContainer = this.shadowRoot.getElementById('chartContainer');
    const editButton = this.shadowRoot.getElementById('edit-chart');
    
    if (this.isEditorView) {
      // Show editor
      editorContainer.style.display = 'block';
      chartContainer.style.height = '300px';
      editButton.style.display = 'none';
    } else {
      // Show chart only
      editorContainer.style.display = 'none';
      chartContainer.style.height = '100%';
      editButton.style.display = 'block';
    }
    
    // Resize chart to fit container
    this.chartInstance.resize();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
          --primary-color: #3f51b5;
          --secondary-color: #f50057;
          --light-gray: #f5f5f5;
          --medium-gray: #ddd;
          --dark-gray: #333;
          --border-radius: 4px;
          --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        * {
          box-sizing: border-box;
        }
        
        .container {
          width: 100%;
          height: 100%;
          padding: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        #chartContainer {
          position: relative;
          width: 100%;
          height: 300px;
          background: #fff;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        
        #chartCanvas {
          width: 100%;
          height: 100%;
        }
        
        #editor-container {
          margin-top: 16px;
          border-radius: var(--border-radius);
          background: #fff;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        
        .tab-navigation {
          display: flex;
          background: var(--light-gray);
          border-bottom: 1px solid var(--medium-gray);
        }
        
        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--dark-gray);
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .tab-button.active {
          color: var(--primary-color);
          border-bottom: 3px solid var(--primary-color);
        }
        
        .tab-content {
          display: none;
          padding: 20px;
        }
        
        #data-tab {
          display: block;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }
        
        input[type="text"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--medium-gray);
          border-radius: var(--border-radius);
          font-size: 14px;
        }
        
        input[type="color"] {
          width: 40px;
          height: 40px;
          padding: 0;
          border: 1px solid var(--medium-gray);
          border-radius: var(--border-radius);
        }
        
        input[type="range"] {
          width: 100%;
        }
        
        button {
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        button:hover {
          background: #303f9f;
        }
        
        .datasets-section {
          margin-top: 20px;
        }
        
        .dataset-editor {
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid var(--medium-gray);
          border-radius: var(--border-radius);
          background: var(--light-gray);
        }
        
        .dataset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .dataset-header h4 {
          margin: 0;
        }
        
        .delete-dataset {
          background: var(--secondary-color);
        }
        
        .delete-dataset:hover {
          background: #c51162;
        }
        
        #bulk-data {
          min-height: 100px;
          font-family: monospace;
        }
        
        .file-import-container {
          margin-bottom: 16px;
        }
        
        #edit-chart {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
          display: none;
        }
        
        .chart-controls {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        
        .chart-themes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        
        .theme-preview {
          height: 80px;
          border-radius: var(--border-radius);
          border: 1px solid var(--medium-gray);
          overflow: hidden;
          cursor: pointer;
        }
        
        .theme-preview:hover {
          border-color: var(--primary-color);
        }
        
        .theme-preview.active {
          border: 2px solid var(--primary-color);
        }
        
        /* Accessibility focus styles */
        button:focus,
        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 600px) {
          .tab-button {
            padding: 12px 16px;
            font-size: 12px;
          }
          
          .tab-content {
            padding: 16px;
          }
        }
      </style>
      
      <div class="container">
        <div id="chartContainer">
          <canvas id="chartCanvas"></canvas>
          <button id="edit-chart">Edit Chart</button>
        </div>
        
        <div id="editor-container">
          <div class="tab-navigation">
            <button class="tab-button active" data-tab="data-tab">Data</button>
            <button class="tab-button" data-tab="settings-tab">Chart Settings</button>
            <button class="tab-button" data-tab="layout-tab">Layout & Design</button>
            <button class="tab-button" data-tab="preview-tab">Preview</button>
          </div>
          
          <!-- Data Tab -->
          <div id="data-tab" class="tab-content">
            <div class="form-group">
              <label>Labels (comma separated)</label>
              <input type="text" id="chart-labels" value="${this.chartData.labels.join(',')}">
            </div>
            
            <div class="file-import-container">
              <label for="file-import">Import Data from CSV</label>
              <input type="file" id="file-import" accept=".csv">
            </div>
            
            <div class="form-group">
              <label>Bulk Data Editor (first row: labels, following rows: data)</label>
              <textarea id="bulk-data">${this.chartData.labels.join(',')}\n${this.chartData.datasets.map(ds => ds.data.join(',')).join('\n')}</textarea>
              <button id="update-bulk-data">Update Bulk Data</button>
            </div>
            
            <div class="datasets-section">
              <h3>Datasets</h3>
              <button id="add-dataset">Add Dataset</button>
              <div id="datasets-container">
                <!-- Dataset editors will be added here -->
              </div>
            </div>
          </div>
          
          <!-- Chart Settings Tab -->
          <div id="settings-tab" class="tab-content">
            <div class="form-group">
              <label>Chart Title</label>
              <input type="text" id="chart-title" value="${this.chartSettings.options.plugins.title.text}">
            </div>
            
            <div class="form-group">
              <label>Chart Type</label>
              <select id="chart-type">
                <option value="basic-line">Basic Line Chart</option>
                <option value="multi-axis-line">Multi-Axis Line Chart</option>
                <option value="stepped-line">Stepped Line Chart</option>
                <option value="interpolated-line">Interpolated Line Chart</option>
                <option value="line-with-points">Line Chart with Points</option>
                <option value="filled-line">Filled Line Chart</option>
              </select>
            </div>
            
            <div id="chart-type-settings">
              <!-- Chart type specific settings will be added here -->
            </div>
            
            <div class="form-group">
              <label>X-Axis Title</label>
              <input type="text" id="x-axis-title" value="${this.chartSettings.options.scales.x.title.text}">
            </div>
            
            <div class="form-group">
              <label>Y-Axis Title</label>
              <input type="text" id="y-axis-title" value="${this.chartSettings.options.scales.y.title.text}">
            </div>
            
            <div class="form-group">
              <label>Legend Position</label>
              <select id="legend-position">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <!-- Layout Tab -->
          <div id="layout-tab" class="tab-content">
            <div class="form-group">
              <label>Theme</label>
              <select id="chart-theme">
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="pastel">Pastel</option>
                <option value="high-contrast">High Contrast</option>
              </select>
            </div>
            
            <div class="chart-themes">
              <div class="theme-preview" style="background: #ffffff;" data-theme="default"></div>
              <div class="theme-preview" style="background: #333333;" data-theme="dark"></div>
              <div class="theme-preview" style="background: #f5f5f5;" data-theme="pastel"></div>
              <div class="theme-preview" style="background: #ffffff; border: 2px solid #000;" data-theme="high-contrast"></div>
            </div>
            
            <div class="form-group">
              <label>Font Family</label>
              <select id="font-family">
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Roboto">Roboto</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Title Font Size</label>
              <input type="range" min="12" max="32" step="1" id="font-size" value="${this.chartSettings.options.plugins.title.font.size}">
              <span>${this.chartSettings.options.plugins.title.font.size}px</span>
            </div>
          </div>
          
          <!-- Preview Tab -->
          <div id="preview-tab" class="tab-content">
            <p>This is a preview of your chart. Click "Update Chart" to apply all changes.</p>
          </div>
          
          <div class="chart-controls">
            <button id="update-chart">Update Chart</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('chart-builder', ChartBuilder);

// For Wix Studio
export default {
  id: 'chart-builder',
  name: 'Chart Builder',
  properties: {
    // Wix settings here
  }
};
