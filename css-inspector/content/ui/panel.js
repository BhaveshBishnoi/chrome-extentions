// Main inspector panel UI

class InspectorPanel {
    constructor() {
        this.panel = null;
        this.isDragging = false;
        this.isMinimized = false;
        this.currentTab = 'styles';
        this.position = { x: 20, y: 20 };
        this.activeElement = null;
    }

    /**
     * Initialize the panel
     */
    async init() {
        if (this.panel) return;

        // Load saved position
        const prefs = await StorageManager.loadPreferences();
        this.position = prefs.panelPosition || { x: 20, y: 20 };

        // Create panel
        this.panel = document.createElement('div');
        this.panel.id = 'css-inspector-panel';
        this.panel.className = 'css-inspector-panel';
        this.panel.style.left = this.position.x + 'px';
        this.panel.style.top = this.position.y + 'px';

        // Build panel structure
        this.panel.innerHTML = this.getPanelHTML();

        // Append to body
        document.body.appendChild(this.panel);

        // Setup event listeners
        this.setupEventListeners();

        // Hide initially
        this.hide();
    }

    /**
     * Get panel HTML structure
     */
    getPanelHTML() {
        return `
      <div class="panel-header">
        <div class="panel-title">
          <span class="panel-icon">🎨</span>
          <span>CSS Inspector</span>
        </div>
        <div class="panel-controls">
          <button class="panel-btn minimize-btn" title="Minimize">−</button>
          <button class="panel-btn close-btn" title="Close">×</button>
        </div>
      </div>

      <div class="panel-content">
        <div class="panel-tabs">
          <button class="tab-btn active" data-tab="styles">Styles</button>
          <button class="tab-btn" data-tab="box-model">Box Model</button>
          <button class="tab-btn" data-tab="typography">Typography</button>
          <button class="tab-btn" data-tab="colors">Colors</button>
        </div>

        <div class="panel-body">
          <div class="tab-content active" data-tab-content="styles">
            <div class="element-info">
              <div class="element-tag"></div>
              <div class="element-selector"></div>
            </div>
            <div class="styles-list"></div>
            <div class="add-property">
              <button class="add-property-btn">+ Add Property</button>
            </div>
          </div>

          <div class="tab-content" data-tab-content="box-model">
            <div class="box-model-diagram"></div>
            <div class="box-model-values"></div>
          </div>

          <div class="tab-content" data-tab-content="typography">
            <div class="typography-properties"></div>
          </div>

          <div class="tab-content" data-tab-content="colors">
            <div class="color-properties"></div>
          </div>
        </div>

        <div class="panel-footer">
          <button class="reset-btn">Reset Element</button>
          <div class="history-controls">
            <button class="undo-btn" title="Undo (Ctrl+Z)">↶</button>
            <button class="redo-btn" title="Redo (Ctrl+Shift+Z)">↷</button>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Header dragging
        const header = this.panel.querySelector('.panel-header');
        header.addEventListener('mousedown', (e) => this.startDrag(e));

        // Close button
        this.panel.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
            if (window.cssInspector) {
                cssInspector.deactivate();
            }
        });

        // Minimize button
        this.panel.querySelector('.minimize-btn').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Tab switching
        this.panel.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Reset button
        this.panel.querySelector('.reset-btn').addEventListener('click', () => {
            if (this.activeElement) {
                cssEditor.resetElement(this.activeElement);
                this.updatePanel(this.activeElement);
            }
        });

        // Undo/Redo buttons
        this.panel.querySelector('.undo-btn').addEventListener('click', () => {
            cssHistory.undo();
            this.updatePanel(this.activeElement);
        });

        this.panel.querySelector('.redo-btn').addEventListener('click', () => {
            cssHistory.redo();
            this.updatePanel(this.activeElement);
        });

        // Add property button
        this.panel.querySelector('.add-property-btn').addEventListener('click', () => {
            this.showAddPropertyDialog();
        });

        // Listen for CSS changes
        window.addEventListener('cssPropertyChanged', () => {
            this.updatePanel(this.activeElement);
        });

        window.addEventListener('cssHistoryChanged', () => {
            this.updateHistoryButtons();
        });
    }

    /**
     * Start panel dragging
     */
    startDrag(e) {
        if (e.target.classList.contains('panel-btn')) return;

        this.isDragging = true;
        const rect = this.panel.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const onMouseMove = (e) => {
            if (!this.isDragging) return;

            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;

            this.panel.style.left = x + 'px';
            this.panel.style.top = y + 'px';
        };

        const onMouseUp = () => {
            this.isDragging = false;
            this.position = {
                x: parseInt(this.panel.style.left),
                y: parseInt(this.panel.style.top)
            };
            StorageManager.savePanelPosition(this.position.x, this.position.y);

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            this.panel.classList.add('minimized');
            this.panel.querySelector('.minimize-btn').textContent = '+';
        } else {
            this.panel.classList.remove('minimized');
            this.panel.querySelector('.minimize-btn').textContent = '−';
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.panel.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        this.panel.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabName);
        });

        // Update content for new tab
        if (this.activeElement) {
            this.updateTabContent(tabName, this.activeElement);
        }
    }

    /**
     * Update panel for an element
     */
    updatePanel(element) {
        if (!element) {
            this.hide();
            return;
        }

        this.activeElement = element;
        this.show();

        // Update element info
        const tagName = element.tagName.toLowerCase();
        const elementId = element.id ? `#${element.id}` : '';
        const elementClasses = element.className ? `.${Array.from(element.classList).join('.')}` : '';

        this.panel.querySelector('.element-tag').textContent = tagName;
        this.panel.querySelector('.element-selector').textContent = elementId || elementClasses || '(no selector)';

        // Update current tab content
        this.updateTabContent(this.currentTab, element);

        // Update history buttons
        this.updateHistoryButtons();
    }

    /**
     * Update tab content
     */
    updateTabContent(tabName, element) {
        switch (tabName) {
            case 'styles':
                this.updateStylesTab(element);
                break;
            case 'box-model':
                this.updateBoxModelTab(element);
                break;
            case 'typography':
                this.updateTypographyTab(element);
                break;
            case 'colors':
                this.updateColorsTab(element);
                break;
        }
    }

    /**
     * Update styles tab
     */
    updateStylesTab(element) {
        const stylesList = this.panel.querySelector('.styles-list');
        stylesList.innerHTML = '';

        const important = CSSParser.getImportantProperties(element);

        Object.entries(important).forEach(([property, value]) => {
            const item = this.createPropertyItem(element, property, value);
            stylesList.appendChild(item);
        });
    }

    /**
     * Create a property item
     */
    createPropertyItem(element, property, value) {
        const item = document.createElement('div');
        item.className = 'property-item';

        const label = document.createElement('div');
        label.className = 'property-label';
        label.textContent = property;

        const editorContainer = document.createElement('div');
        editorContainer.className = 'property-editor';

        const editor = PropertyEditors.createEditor(element, property, value, (newValue) => {
            cssEditor.modifyProperty(element, property, newValue);
        });

        editorContainer.appendChild(editor);

        item.appendChild(label);
        item.appendChild(editorContainer);

        return item;
    }

    /**
     * Update box model tab
     */
    updateBoxModelTab(element) {
        const boxModel = CSSParser.getBoxModel(element);
        const diagram = this.panel.querySelector('.box-model-diagram');
        const values = this.panel.querySelector('.box-model-values');

        diagram.innerHTML = `
      <div class="box-model-visual">
        <div class="box-margin">
          <span class="box-label">margin</span>
          <div class="box-border">
            <span class="box-label">border</span>
            <div class="box-padding">
              <span class="box-label">padding</span>
              <div class="box-content">
                <span>${Math.round(boxModel.width)}×${Math.round(boxModel.height)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        values.innerHTML = `
      <div class="box-values">
        <div class="box-section">
          <h4>Margin</h4>
          <div class="box-grid">
            <span>${boxModel.margin.top}px</span>
            <span>${boxModel.margin.right}px</span>
            <span>${boxModel.margin.bottom}px</span>
            <span>${boxModel.margin.left}px</span>
          </div>
        </div>
        <div class="box-section">
          <h4>Padding</h4>
          <div class="box-grid">
            <span>${boxModel.padding.top}px</span>
            <span>${boxModel.padding.right}px</span>
            <span>${boxModel.padding.bottom}px</span>
            <span>${boxModel.padding.left}px</span>
          </div>
        </div>
        <div class="box-section">
          <h4>Border</h4>
          <div class="box-grid">
            <span>${boxModel.border.top}px</span>
            <span>${boxModel.border.right}px</span>
            <span>${boxModel.border.bottom}px</span>
            <span>${boxModel.border.left}px</span>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Update typography tab
     */
    updateTypographyTab(element) {
        const computed = window.getComputedStyle(element);
        const container = this.panel.querySelector('.typography-properties');

        const typographyProps = {
            'font-family': computed.fontFamily,
            'font-size': computed.fontSize,
            'font-weight': computed.fontWeight,
            'line-height': computed.lineHeight,
            'letter-spacing': computed.letterSpacing,
            'text-align': computed.textAlign,
            'text-transform': computed.textTransform,
            'text-decoration': computed.textDecoration
        };

        container.innerHTML = '';

        Object.entries(typographyProps).forEach(([property, value]) => {
            const item = this.createPropertyItem(element, property, value);
            container.appendChild(item);
        });
    }

    /**
     * Update colors tab
     */
    updateColorsTab(element) {
        const computed = window.getComputedStyle(element);
        const container = this.panel.querySelector('.color-properties');

        const colorProps = {
            'color': computed.color,
            'background-color': computed.backgroundColor,
            'border-color': computed.borderColor
        };

        container.innerHTML = '';

        Object.entries(colorProps).forEach(([property, value]) => {
            const item = this.createPropertyItem(element, property, value);
            container.appendChild(item);
        });
    }

    /**
     * Update history buttons state
     */
    updateHistoryButtons() {
        const stats = cssHistory.getStats();

        const undoBtn = this.panel.querySelector('.undo-btn');
        const redoBtn = this.panel.querySelector('.redo-btn');

        undoBtn.disabled = !stats.canUndo;
        redoBtn.disabled = !stats.canRedo;
    }

    /**
     * Show add property dialog
     */
    showAddPropertyDialog() {
        const property = prompt('Enter CSS property name:');
        if (!property) return;

        const value = prompt(`Enter value for ${property}:`);
        if (!value) return;

        if (this.activeElement) {
            cssEditor.addRule(this.activeElement, property, value);
            this.updatePanel(this.activeElement);
        }
    }

    /**
     * Show panel
     */
    show() {
        if (this.panel) {
            this.panel.style.display = 'block';
        }
    }

    /**
     * Hide panel
     */
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    /**
     * Destroy panel
     */
    destroy() {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    }
}

// Create global panel instance
const inspectorPanel = new InspectorPanel();
