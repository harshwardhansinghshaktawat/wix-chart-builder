// Repository: wix-chart-builder
// Source file: chart-builder.js
// Custom Element ID: chart-builder-element
// Custom Element Tag: <chart-builder-element>

// chart-builder.js
class ChartBuilderElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chartInstance = null;
    this.datasets = Array(10).fill().map(() => ({ data: [], label: '', color: '#000000' }));
  }

  connectedCallback() {
    this.render();
    this.loadChartJS();
  }

  loadChartJS() {
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.initializeChart();
      document.head.appendChild(script);
    } else {
      this.initializeChart();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          --primary-color: #4285f4;
          --text-color: #333333;
        }
        
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }

        .tab-button {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-color);
          font-size: 16px;
        }

        .tab-button.active {
          border-bottom: 2px solid var(--primary-color);
          color: var(--primary-color);
        }

        .tab-content {
          display: none;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tab-content.active {
          display: block;
        }

        .dataset-editor {
          display: grid;
          gap: 15px;
          margin-bottom: 20px;
        }

        .update-button {
          background: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .edit-button {
          display: none;
          margin-top: 20px;
        }

        .chart-container {
          position: relative;
          height: 400px;
          width: 100%;
        }

        /* Accessibility: High contrast ratios */
        :host([theme="dark"]) {
          --primary-color: #8ab4f8;
          --text-color: #ffffff;
          background: #202124;
        }
      </style>

      <div class="container">
        <div class="editor">
          <div class="tabs">
            <button class="tab-button active" data-tab="data">Data</button>
            <button class="tab-button" data-tab="settings">Chart Settings</button>
            <button class="tab-button" data-tab="layout">Layout & Design</button>
            <button class="tab-button" data-tab="preview">Preview</button>
          </div>

          <div class="tab-content active" id="data-tab">
            <div class="dataset-editor">
              ${this.renderDatasetEditors()}
            </div>
          </div>

          <div class="tab-content" id="settings-tab">
            <select id="chart-type">
              <option value="line">Basic Line Chart</option>
              <option value="line-multi">Multi-Axis Line Chart</option>
              <option value="line-stepped">Stepped Line Chart</option>
              <option value="line-interpolated">Interpolated Line Chart</option>
              <option value="line-points">Line Chart with Points</option>
              <option value="line-filled">Filled Line Chart</option>
            </select>
            <!-- Additional chart-specific settings would go here -->
          </div>

          <div class="tab-content" id="layout-tab">
            <label>Theme:</label>
            <select id="theme-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <label>Font Color:</label>
            <input type="color" id="font-color">
            <label>Background Color:</label>
            <input type="color" id="bg-color">
          </div>

          <div class="tab-content" id="preview-tab">
            <canvas id="chart-canvas"></canvas>
          </div>

          <button class="update-button">Update Chart</button>
        </div>
        <div class="final-view" style="display: none;">
          <canvas id="final-chart"></canvas>
          <button class="edit-button">Edit</button>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  renderDatasetEditors() {
    return this.datasets.map((dataset, index) => `
      <div class="dataset">
        <input type="text" placeholder="Dataset ${index + 1} Label" value="${dataset.label}">
        <input type="color" value="${dataset.color}">
        <textarea placeholder="Data (comma-separated values)"></textarea>
        <input type="file" accept=".csv,.txt">
      </div>
    `).join('');
  }

  addEventListeners() {
    const tabs = this.shadowRoot.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const contents = this.shadowRoot.querySelectorAll('.tab-content');
        contents.forEach(c => c.classList.remove('active'));
        this.shadowRoot.querySelector(`#${tab.dataset.tab}-tab`).classList.add('active');
      });
    });

    this.shadowRoot.querySelector('.update-button').addEventListener('click', () => {
      this.updateChart();
      this.shadowRoot.querySelector('.editor').style.display = 'none';
      const finalView = this.shadowRoot.querySelector('.final-view');
      finalView.style.display = 'block';
      this.renderFinalChart();
    });

    this.shadowRoot.querySelector('.edit-button').addEventListener('click', () => {
      this.shadowRoot.querySelector('.editor').style.display = 'block';
      this.shadowRoot.querySelector('.final-view').style.display = 'none';
    });
  }

  initializeChart() {
    const ctx = this.shadowRoot.querySelector('#chart-canvas').getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  updateChart() {
    const chartType = this.shadowRoot.querySelector('#chart-type').value;
    const datasets = Array.from(this.shadowRoot.querySelectorAll('.dataset')).map(dataset => {
      const values = dataset.querySelector('textarea').value.split(',');
      return {
        label: dataset.querySelector('input[type="text"]').value,
        data: values.map(v => parseFloat(v.trim())),
        borderColor: dataset.querySelector('input[type="color"]').value,
        fill: chartType === 'line-filled'
      };
    });

    const theme = this.shadowRoot.querySelector('#theme-select').value;
    this.setAttribute('theme', theme);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.shadowRoot.querySelector('#chart-canvas').getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: chartType.includes('line') ? 'line' : chartType,
      data: {
        labels: datasets[0]?.data.map((_, i) => `Point ${i + 1}`) || [],
        datasets: datasets
      },
      options: this.getChartOptions(chartType)
    });
  }

  renderFinalChart() {
    const ctx = this.shadowRoot.querySelector('#final-chart').getContext('2d');
    new Chart(ctx, this.chartInstance.config);
  }

  getChartOptions(chartType) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    };

    switch(chartType) {
      case 'line-multi':
        return {
          ...baseOptions,
          scales: {
            y: { position: 'left' },
            y1: { position: 'right' }
          }
        };
      case 'line-stepped':
        return {
          ...baseOptions,
          elements: { line: { stepped: true } }
        };
      case 'line-interpolated':
        return {
          ...baseOptions,
          elements: { line: { tension: 0.4 } }
        };
      case 'line-points':
        return {
          ...baseOptions,
          elements: { point: { radius: 5 } }
        };
      default:
        return baseOptions;
    }
  }
}

customElements.define('chart-builder-element', ChartBuilderElement);
