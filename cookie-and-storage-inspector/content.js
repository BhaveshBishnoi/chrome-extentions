// Content script to access localStorage and sessionStorage
// This runs in the context of the webpage

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStorage') {
        try {
            const localStorageData = {};
            const sessionStorageData = {};

            // Extract localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                localStorageData[key] = localStorage.getItem(key);
            }

            // Extract sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                sessionStorageData[key] = sessionStorage.getItem(key);
            }

            sendResponse({
                localStorage: localStorageData,
                sessionStorage: sessionStorageData
            });
        } catch (error) {
            console.error('Error accessing storage:', error);
            sendResponse({
                localStorage: {},
                sessionStorage: {},
                error: error.message
            });
        }

        return true; // Keep the message channel open for async response
    }
});

// Optional: Detect storage changes (for future live update feature)
let lastLocalStorage = { ...localStorage };
let lastSessionStorage = { ...sessionStorage };

function detectStorageChanges() {
    const currentLocal = { ...localStorage };
    const currentSession = { ...sessionStorage };

    // Check if anything changed
    const localChanged = JSON.stringify(currentLocal) !== JSON.stringify(lastLocalStorage);
    const sessionChanged = JSON.stringify(currentSession) !== JSON.stringify(lastSessionStorage);

    if (localChanged || sessionChanged) {
        // Send message to popup about changes
        chrome.runtime.sendMessage({
            action: 'storageChanged',
            localStorage: currentLocal,
            sessionStorage: currentSession
        }).catch(() => {
            // Popup might not be open, ignore error
        });

        lastLocalStorage = currentLocal;
        lastSessionStorage = currentSession;
    }
}

// Check for changes every 2 seconds (optional feature)
// setInterval(detectStorageChanges, 2000);
