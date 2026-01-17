// Element highlighter overlay for visual feedback

class ElementHighlighter {
    constructor() {
        this.overlay = null;
        this.dimensionsLabel = null;
        this.boxModelOverlays = null;
        this.isActive = false;
    }

    /**
     * Initialize highlighter overlays
     */
    init() {
        if (this.overlay) return;

        // Create main highlight overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'css-inspector-highlight';
        this.overlay.className = 'css-inspector-highlight';

        // Create box model overlays
        this.boxModelOverlays = {
            margin: this.createBoxOverlay('margin'),
            border: this.createBoxOverlay('border'),
            padding: this.createBoxOverlay('padding'),
            content: this.createBoxOverlay('content')
        };

        // Create dimensions label
        this.dimensionsLabel = document.createElement('div');
        this.dimensionsLabel.className = 'css-inspector-dimensions';

        // Append to body
        document.body.appendChild(this.overlay);
        Object.values(this.boxModelOverlays).forEach(o => document.body.appendChild(o));
        document.body.appendChild(this.dimensionsLabel);
    }

    /**
     * Create a box model overlay element
     */
    createBoxOverlay(type) {
        const overlay = document.createElement('div');
        overlay.className = `css-inspector-box-${type}`;
        overlay.style.display = 'none';
        return overlay;
    }

    /**
     * Highlight an element
     */
    highlight(element, showBoxModel = true) {
        if (!element || element === document.body || element === document.documentElement) {
            this.hide();
            return;
        }

        this.init();
        this.isActive = true;

        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);

        // Position main overlay
        this.overlay.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

        // Show box model if enabled
        if (showBoxModel) {
            this.showBoxModel(element, rect, computed);
        } else {
            this.hideBoxModel();
        }

        // Update dimensions label
        this.updateDimensionsLabel(rect);

        this.isActive = true;
    }

    /**
     * Show box model overlays
     */
    showBoxModel(element, rect, computed) {
        const boxModel = CSSParser.getBoxModel(element);

        // Margin overlay
        const marginOverlay = this.boxModelOverlays.margin;
        marginOverlay.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX - boxModel.margin.left}px;
      top: ${rect.top + window.scrollY - boxModel.margin.top}px;
      width: ${rect.width + boxModel.margin.left + boxModel.margin.right}px;
      height: ${rect.height + boxModel.margin.top + boxModel.margin.bottom}px;
    `;

        // Border overlay (content + padding + border)
        const borderOverlay = this.boxModelOverlays.border;
        borderOverlay.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

        // Padding overlay (content + padding)
        const paddingOverlay = this.boxModelOverlays.padding;
        paddingOverlay.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX + boxModel.border.left}px;
      top: ${rect.top + window.scrollY + boxModel.border.top}px;
      width: ${rect.width - boxModel.border.left - boxModel.border.right}px;
      height: ${rect.height - boxModel.border.top - boxModel.border.bottom}px;
    `;

        // Content overlay
        const contentOverlay = this.boxModelOverlays.content;
        contentOverlay.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX + boxModel.border.left + boxModel.padding.left}px;
      top: ${rect.top + window.scrollY + boxModel.border.top + boxModel.padding.top}px;
      width: ${rect.width - boxModel.border.left - boxModel.border.right - boxModel.padding.left - boxModel.padding.right}px;
      height: ${rect.height - boxModel.border.top - boxModel.border.bottom - boxModel.padding.top - boxModel.padding.bottom}px;
    `;
    }

    /**
     * Hide box model overlays
     */
    hideBoxModel() {
        Object.values(this.boxModelOverlays).forEach(overlay => {
            overlay.style.display = 'none';
        });
    }

    /**
     * Update dimensions label
     */
    updateDimensionsLabel(rect) {
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        this.dimensionsLabel.textContent = `${width} × ${height}`;
        this.dimensionsLabel.style.cssText = `
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY - 25}px;
    `;
    }

    /**
     * Hide all overlays
     */
    hide() {
        if (!this.overlay) return;

        this.overlay.style.display = 'none';
        this.dimensionsLabel.style.display = 'none';
        this.hideBoxModel();
        this.isActive = false;
    }

    /**
     * Remove all overlays from DOM
     */
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
            this.dimensionsLabel.remove();
            Object.values(this.boxModelOverlays).forEach(o => o.remove());

            this.overlay = null;
            this.dimensionsLabel = null;
            this.boxModelOverlays = null;
        }
        this.isActive = false;
    }

    /**
     * Update highlighter on scroll
     */
    updateOnScroll() {
        if (this.isActive && cssInspector && cssInspector.selectedElement) {
            this.highlight(cssInspector.selectedElement);
        }
    }
}

// Create global highlighter instance
const elementHighlighter = new ElementHighlighter();

// Update on scroll
window.addEventListener('scroll', () => elementHighlighter.updateOnScroll(), true);
window.addEventListener('resize', () => elementHighlighter.updateOnScroll());
