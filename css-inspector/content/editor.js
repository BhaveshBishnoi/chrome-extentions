// Live CSS editing engine

class CSSEditor {
    constructor() {
        this.activeElement = null;
        this.originalStyles = new Map();
    }

    /**
     * Set the active element for editing
     */
    setActiveElement(element) {
        this.activeElement = element;

        // Store original styles if not already stored
        if (!this.originalStyles.has(element)) {
            const computed = window.getComputedStyle(element);
            const originalStyle = {};

            // Store all current computed styles
            for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                originalStyle[prop] = computed.getPropertyValue(prop);
            }

            this.originalStyles.set(element, originalStyle);
        }
    }

    /**
     * Modify a CSS property
     */
    modifyProperty(element, property, value, addToHistory = true) {
        if (!element) return false;

        const oldValue = element.style.getPropertyValue(property) ||
            window.getComputedStyle(element).getPropertyValue(property);

        // Validate the value
        if (!CSSParser.isValidValue(property, value)) {
            console.warn(`Invalid CSS value: ${property}: ${value}`);
            return false;
        }

        // Apply the change
        element.style.setProperty(property, value);

        // Add to history
        if (addToHistory) {
            cssHistory.addChange(element, property, oldValue, value);
        }

        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('cssPropertyChanged', {
            detail: { element, property, oldValue, newValue: value }
        }));

        return true;
    }

    /**
     * Increment/decrement numeric value
     */
    adjustNumericValue(element, property, delta, shiftKey = false) {
        if (!element) return false;

        const currentValue = element.style.getPropertyValue(property) ||
            window.getComputedStyle(element).getPropertyValue(property);

        const parsed = CSSParser.parseValue(currentValue);

        if (isNaN(parsed.number)) {
            return false;
        }

        // Adjust delta based on shift key (larger steps)
        const actualDelta = shiftKey ? delta * 10 : delta;
        const newNumber = parsed.number + actualDelta;
        const newValue = newNumber + parsed.unit;

        return this.modifyProperty(element, property, newValue);
    }

    /**
     * Toggle a property on/off
     */
    toggleProperty(element, property) {
        if (!element) return false;

        const currentValue = element.style.getPropertyValue(property);

        if (currentValue) {
            // Property is set, remove it
            const oldValue = currentValue;
            element.style.removeProperty(property);

            cssHistory.addChange(element, property, oldValue, '');

            window.dispatchEvent(new CustomEvent('cssPropertyChanged', {
                detail: { element, property, oldValue, newValue: '' }
            }));

            return false; // Now off
        } else {
            // Property is not set, restore from original or computed
            const original = this.originalStyles.get(element);
            const value = original ? original[property] : window.getComputedStyle(element).getPropertyValue(property);

            return this.modifyProperty(element, property, value);
        }
    }

    /**
     * Add a new CSS rule
     */
    addRule(element, property, value) {
        return this.modifyProperty(element, property, value);
    }

    /**
     * Remove a CSS property
     */
    removeProperty(element, property, addToHistory = true) {
        if (!element) return false;

        const oldValue = element.style.getPropertyValue(property) ||
            window.getComputedStyle(element).getPropertyValue(property);

        element.style.removeProperty(property);

        if (addToHistory) {
            cssHistory.addChange(element, property, oldValue, '');
        }

        window.dispatchEvent(new CustomEvent('cssPropertyChanged', {
            detail: { element, property, oldValue, newValue: '' }
        }));

        return true;
    }

    /**
     * Reset element to original styles
     */
    resetElement(element) {
        if (!element) return 0;

        // Clear all inline styles
        element.style.cssText = '';

        // Reset in history
        const changesCount = cssHistory.resetElement(element);

        // Remove from original styles map
        this.originalStyles.delete(element);

        window.dispatchEvent(new CustomEvent('cssElementReset', {
            detail: { element, changesCount }
        }));

        return changesCount;
    }

    /**
     * Get all modified properties for an element
     */
    getModifiedProperties(element) {
        if (!element) return [];

        const modified = [];
        const inlineStyles = element.style;

        for (let i = 0; i < inlineStyles.length; i++) {
            const prop = inlineStyles[i];
            modified.push({
                property: prop,
                value: inlineStyles.getPropertyValue(prop)
            });
        }

        return modified;
    }

    /**
     * Copy all modified CSS for an element
     */
    getCSSString(element) {
        if (!element) return '';

        const modified = this.getModifiedProperties(element);

        return modified.map(m => `  ${m.property}: ${m.value};`).join('\n');
    }

    /**
     * Keyboard shortcut handlers
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if inspector is active
            if (!this.activeElement) return;

            // Ctrl/Cmd + Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                const change = cssHistory.undo();
                if (change) {
                    window.dispatchEvent(new CustomEvent('cssHistoryChanged', {
                        detail: { action: 'undo', change }
                    }));
                }
            }

            // Ctrl/Cmd + Shift + Z for redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                const change = cssHistory.redo();
                if (change) {
                    window.dispatchEvent(new CustomEvent('cssHistoryChanged', {
                        detail: { action: 'redo', change }
                    }));
                }
            }
        });
    }
}

// Create global editor instance
const cssEditor = new CSSEditor();

// Initialize keyboard shortcuts
cssEditor.setupKeyboardShortcuts();
