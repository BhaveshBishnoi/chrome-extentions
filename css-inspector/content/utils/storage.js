// Storage management for preferences and session data

const StorageManager = {
    /**
     * Save user preferences
     */
    async savePreferences(prefs) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(prefs, () => {
                resolve();
            });
        });
    },

    /**
     * Load user preferences
     */
    async loadPreferences() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                theme: 'dark',
                hoverMode: true,
                showBoxModel: true,
                keyboardShortcuts: true,
                panelPosition: { x: 20, y: 20 },
                panelMinimized: false
            }, (items) => {
                resolve(items);
            });
        });
    },

    /**
     * Save panel position
     */
    async savePanelPosition(x, y) {
        return this.savePreferences({ panelPosition: { x, y } });
    },

    /**
     * Save session data (local storage only)
     */
    async saveSession(sessionData) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ session: sessionData }, () => {
                resolve();
            });
        });
    },

    /**
     * Load session data
     */
    async loadSession() {
        return new Promise((resolve) => {
            chrome.storage.local.get('session', (items) => {
                resolve(items.session || null);
            });
        });
    },

    /**
     * Clear session data
     */
    async clearSession() {
        return new Promise((resolve) => {
            chrome.storage.local.remove('session', () => {
                resolve();
            });
        });
    }
};
