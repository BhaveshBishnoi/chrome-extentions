// background.js - Service Worker for Chrome Extension

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Image Collector & Downloader installed successfully!');

        // Set default preferences
        chrome.storage.local.set({
            theme: 'dark',
            excludeBase64: true
        });
    } else if (details.reason === 'update') {
        console.log('Image Collector & Downloader updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadImages') {
        // Handle bulk downloads if needed
        handleBulkDownload(request.images);
    }
    return true;
});

function handleBulkDownload(images) {
    images.forEach((image, index) => {
        setTimeout(() => {
            chrome.downloads.download({
                url: image.url,
                filename: image.filename || `image_${index + 1}.${image.format.toLowerCase()}`,
                saveAs: false
            });
        }, index * 200); // Stagger downloads to avoid overwhelming the browser
    });
}

// Optional: Add context menu support (right-click to download images)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'downloadAllImages',
        title: 'Download All Images',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downloadAllImages') {
        // Open the popup or trigger image collection
        chrome.action.openPopup();
    }
});
