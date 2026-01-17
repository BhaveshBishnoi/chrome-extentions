// Undo/Redo history management system

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 50;
    }

    /**
     * Add a new change to history
     */
    addChange(element, property, oldValue, newValue) {
        // Remove any history after current index (when undoing then making new changes)
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new change
        this.history.push({
            element: element,
            selector: this.getElementSelector(element),
            property: property,
            oldValue: oldValue,
            newValue: newValue,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    /**
     * Undo last change
     */
    undo() {
        if (!this.canUndo()) {
            return null;
        }

        const change = this.history[this.currentIndex];
        this.currentIndex--;

        // Apply the old value
        if (change.element && change.element.isConnected) {
            change.element.style.setProperty(change.property, change.oldValue);
        }

        return change;
    }

    /**
     * Redo previously undone change
     */
    redo() {
        if (!this.canRedo()) {
            return null;
        }

        this.currentIndex++;
        const change = this.history[this.currentIndex];

        // Apply the new value
        if (change.element && change.element.isConnected) {
            change.element.style.setProperty(change.property, change.newValue);
        }

        return change;
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Get element selector for identification
     */
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            const classes = Array.from(element.classList).join('.');
            return `${element.tagName.toLowerCase()}.${classes}`;
        }

        // Use nth-child if no id or class
        const parent = element.parentElement;
        if (parent) {
            const index = Array.from(parent.children).indexOf(element) + 1;
            return `${this.getElementSelector(parent)} > ${element.tagName.toLowerCase()}:nth-child(${index})`;
        }

        return element.tagName.toLowerCase();
    }

    /**
     * Get changes for a specific element
     */
    getElementChanges(element) {
        return this.history.filter(change => change.element === element);
    }

    /**
     * Reset all changes for an element
     */
    resetElement(element) {
        const changes = this.getElementChanges(element);

        // Reset each property to its original value
        changes.forEach(change => {
            if (change.element && change.element.isConnected) {
                change.element.style.setProperty(change.property, '');
            }
        });

        // Remove these changes from history
        this.history = this.history.filter(change => change.element !== element);
        this.currentIndex = this.history.length - 1;

        return changes.length;
    }

    /**
     * Get history statistics
     */
    getStats() {
        return {
            total: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}

// Create global history instance
const cssHistory = new HistoryManager();
