// Main CSS Inspector - Element detection and selection

class CSSInspector {
    constructor() {
        this.isActive = false;
        this.hoverMode = true;
        this.selectedElement = null;
        this.hoveredElement = null;
        this.boundMouseMove = null;
        this.boundClick = null;
        this.boundKeyDown = null;
    }

    /**
     * Activate the inspector
     */
    async activate() {
        if (this.isActive) return;

        this.isActive = true;

        // Initialize UI components
        await inspectorPanel.init();
        elementHighlighter.init();

        // Load preferences
        const prefs = await StorageManager.loadPreferences();
        this.hoverMode = prefs.hoverMode !== false;

        // Setup event listeners
        this.boundMouseMove = (e) => this.onMouseMove(e);
        this.boundClick = (e) => this.onClick(e);
        this.boundKeyDown = (e) => this.onKeyDown(e);

        document.addEventListener('mousemove', this.boundMouseMove, true);
        document.addEventListener('click', this.boundClick, true);
        document.addEventListener('keydown', this.boundKeyDown, true);

        // Add visual indicator
        this.addActivationIndicator();

        // Notify background
        chrome.runtime.sendMessage({ action: 'inspectorStateChanged', active: true });

        console.log('CSS Inspector activated');
    }

    /**
     * Deactivate the inspector
     */
    deactivate() {
        if (!this.isActive) return;

        this.isActive = false;

        // Remove event listeners
        document.removeEventListener('mousemove', this.boundMouseMove, true);
        document.removeEventListener('click', this.boundClick, true);
        document.removeEventListener('keydown', this.boundKeyDown, true);

        // Hide UI
        elementHighlighter.hide();
        inspectorPanel.hide();

        // Remove indicator
        this.removeActivationIndicator();

        // Clear selection
        this.selectedElement = null;
        this.hoveredElement = null;

        // Notify background
        chrome.runtime.sendMessage({ action: 'inspectorStateChanged', active: false });

        console.log('CSS Inspector deactivated');
    }

    /**
     * Toggle inspector activation
     */
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    /**
     * Handle mouse move
     */
    onMouseMove(e) {
        if (!this.isActive || !this.hoverMode) return;

        // Ignore if hovering over inspector panel
        if (e.target.closest('#css-inspector-panel')) {
            return;
        }

        // Ignore inspector elements
        if (e.target.id && e.target.id.startsWith('css-inspector-')) {
            return;
        }

        const element = this.getElementFromPoint(e.clientX, e.clientY);

        if (element && element !== this.hoveredElement) {
            this.hoveredElement = element;

            // Don't highlight if element is selected
            if (!this.selectedElement || element !== this.selectedElement) {
                elementHighlighter.highlight(element, true);
            }
        }
    }

    /**
     * Handle click
     */
    onClick(e) {
        if (!this.isActive) return;

        // Ignore clicks on inspector panel
        if (e.target.closest('#css-inspector-panel')) {
            return;
        }

        // Ignore inspector elements
        if (e.target.id && e.target.id.startsWith('css-inspector-')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const element = this.getElementFromPoint(e.clientX, e.clientY);

        if (element) {
            this.selectElement(element);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    onKeyDown(e) {
        if (!this.isActive || !this.selectedElement) return;

        // Escape to deselect/deactivate
        if (e.key === 'Escape') {
            if (this.selectedElement) {
                this.deselectElement();
            } else {
                this.deactivate();
            }
            return;
        }

        // Arrow keys for parent/child navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectParent();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectFirstChild();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.selectPreviousSibling();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.selectNextSibling();
        }
    }

    /**
     * Select an element
     */
    selectElement(element) {
        if (!element || element === this.selectedElement) return;

        this.selectedElement = element;

        // Update editor
        cssEditor.setActiveElement(element);

        // Update highlighter
        elementHighlighter.highlight(element, true);

        // Update panel
        inspectorPanel.updatePanel(element);

        // Disable hover mode when element is selected
        this.hoverMode = false;

        console.log('Selected element:', element);
    }

    /**
     * Deselect current element
     */
    deselectElement() {
        this.selectedElement = null;
        this.hoverMode = true;

        elementHighlighter.hide();
        inspectorPanel.hide();
    }

    /**
     * Navigate to parent element
     */
    selectParent() {
        if (!this.selectedElement) return;

        const parent = this.selectedElement.parentElement;
        if (parent && parent !== document.body && parent !== document.documentElement) {
            this.selectElement(parent);
        }
    }

    /**
     * Navigate to first child element
     */
    selectFirstChild() {
        if (!this.selectedElement) return;

        const firstChild = this.selectedElement.children[0];
        if (firstChild) {
            this.selectElement(firstChild);
        }
    }

    /**
     * Navigate to previous sibling
     */
    selectPreviousSibling() {
        if (!this.selectedElement) return;

        const sibling = this.selectedElement.previousElementSibling;
        if (sibling) {
            this.selectElement(sibling);
        }
    }

    /**
     * Navigate to next sibling
     */
    selectNextSibling() {
        if (!this.selectedElement) return;

        const sibling = this.selectedElement.nextElementSibling;
        if (sibling) {
            this.selectElement(sibling);
        }
    }

    /**
     * Get element from point, excluding inspector elements
     */
    getElementFromPoint(x, y) {
        // Temporarily hide inspector elements
        const inspectorElements = document.querySelectorAll('[id^="css-inspector-"], .css-inspector-panel');
        inspectorElements.forEach(el => el.style.pointerEvents = 'none');

        const element = document.elementFromPoint(x, y);

        // Restore pointer events
        inspectorElements.forEach(el => el.style.pointerEvents = '');

        return element;
    }

    /**
     * Add visual indicator that inspector is active
     */
    addActivationIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'css-inspector-active-indicator';
        indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      z-index: 2147483646;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      animation: cssInspectorFadeIn 0.3s ease;
    `;
        indicator.textContent = '🎨 CSS Inspector Active';
        document.body.appendChild(indicator);

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes cssInspectorFadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
        document.head.appendChild(style);
    }

    /**
     * Remove activation indicator
     */
    removeActivationIndicator() {
        const indicator = document.getElementById('css-inspector-active-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Create global inspector instance
const cssInspector = new CSSInspector();

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleInspector') {
        cssInspector.toggle();
        sendResponse({ active: cssInspector.isActive });
    }

    if (request.action === 'getInspectorState') {
        sendResponse({ active: cssInspector.isActive });
    }
});

// Auto-activate on specific key combo (Ctrl+Shift+I)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        cssInspector.toggle();
    }
});
