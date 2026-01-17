// Background service worker for CSS Inspector extension

// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle inspector
  chrome.tabs.sendMessage(tab.id, { action: 'toggleInspector' });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true; // Required for async response
  }
  
  if (request.action === 'inspectorStateChanged') {
    // Update icon based on inspector state
    const iconPath = request.active ? 'icons/icon-active-' : 'icons/icon-';
    chrome.action.setIcon({
      tabId: sender.tab.id,
      path: {
        '16': iconPath + '16.png',
        '48': iconPath + '48.png',
        '128': iconPath + '128.png'
      }
    });
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CSS Inspector & Live CSS Playground installed!');
    
    // Set default preferences
    chrome.storage.sync.set({
      theme: 'dark',
      hoverMode: true,
      showBoxModel: true,
      keyboardShortcuts: true
    });
  }
});
