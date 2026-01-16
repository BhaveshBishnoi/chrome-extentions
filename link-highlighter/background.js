// Extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Link Highlighter & SEO Inspector installed');

    // Set default state
    chrome.storage.local.set({ isHighlightEnabled: false });
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-highlight') {
        // Get current state
        const { isHighlightEnabled = false } = await chrome.storage.local.get('isHighlightEnabled');
        const newState = !isHighlightEnabled;

        // Save new state
        await chrome.storage.local.set({ isHighlightEnabled: newState });

        // Send message to active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggleHighlight',
                enabled: newState
            });
        }
    }
});

// Listen for tab updates to maintain state across page reloads
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const { isHighlightEnabled = false } = await chrome.storage.local.get('isHighlightEnabled');

        if (isHighlightEnabled) {
            chrome.tabs.sendMessage(tabId, {
                action: 'toggleHighlight',
                enabled: true
            }).catch(() => {
                // Content script might not be ready yet, ignore error
            });
        }
    }
});
