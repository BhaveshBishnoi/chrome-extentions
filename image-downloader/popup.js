// popup.js - Handles popup UI logic, filtering, and downloads

// Global state
let allImages = [];
let filteredImages = [];
let selectedImages = new Set();

// DOM Elements
const imageGrid = document.getElementById('imageGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const imageCountEl = document.getElementById('imageCount');
const selectedCountEl = document.getElementById('selectedCount');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const typeFilter = document.getElementById('typeFilter');
const sizeFilter = document.getElementById('sizeFilter');
const excludeBase64 = document.getElementById('excludeBase64');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Load preferences
    loadPreferences();

    // Set up event listeners
    setupEventListeners();

    // Request images from content script
    await requestImages();
}

function setupEventListeners() {
    downloadAllBtn.addEventListener('click', downloadAll);
    selectAllBtn.addEventListener('click', toggleSelectAll);
    darkModeToggle.addEventListener('click', toggleDarkMode);

    typeFilter.addEventListener('change', applyFilters);
    sizeFilter.addEventListener('change', applyFilters);
    excludeBase64.addEventListener('change', () => {
        savePreference('excludeBase64', excludeBase64.checked);
        applyFilters();
    });
}

async function requestImages() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, { action: 'getImages' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                showEmptyState();
                return;
            }

            if (response && response.images) {
                allImages = response.images;
                applyFilters();
            } else {
                showEmptyState();
            }
        });
    } catch (error) {
        console.error('Error requesting images:', error);
        showEmptyState();
    }
}

function applyFilters() {
    const typeValue = typeFilter.value;
    const minSize = parseInt(sizeFilter.value);
    const excludeBase64Images = excludeBase64.checked;

    filteredImages = allImages.filter(image => {
        // Filter by type
        if (typeValue !== 'all') {
            if (image.format.toLowerCase() !== typeValue.toLowerCase()) {
                return false;
            }
        }

        // Filter by minimum dimension
        if (minSize > 0) {
            if (image.width < minSize || image.height < minSize) {
                return false;
            }
        }

        // Exclude Base64 images
        if (excludeBase64Images && image.isBase64) {
            return false;
        }

        return true;
    });

    // Update UI
    updateImageCount();
    renderImages();
}

function renderImages() {
    loadingState.style.display = 'none';

    if (filteredImages.length === 0) {
        showEmptyState();
        return;
    }

    emptyState.style.display = 'none';
    imageGrid.style.display = 'grid';
    imageGrid.innerHTML = '';

    filteredImages.forEach((image, index) => {
        const card = createImageCard(image, index);
        imageGrid.appendChild(card);
    });
}

function createImageCard(image, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.index = index;
    card.dataset.url = image.url;

    if (selectedImages.has(image.url)) {
        card.classList.add('selected');
    }

    card.innerHTML = `
    <div class="image-wrapper">
      <input type="checkbox" class="image-checkbox" ${selectedImages.has(image.url) ? 'checked' : ''}>
      <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" class="image-preview" loading="lazy">
    </div>
    <div class="image-info">
      <div class="image-meta">
        <span class="image-dimensions">${image.width} × ${image.height}</span>
        <span class="image-format">${image.format}</span>
      </div>
      <div class="image-actions">
        <button class="image-action-btn download-btn" title="Download">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
        <button class="image-action-btn copy-btn" title="Copy URL">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
      </div>
    </div>
  `;

    // Event listeners
    const checkbox = card.querySelector('.image-checkbox');
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        toggleImageSelection(image.url, card);
    });

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.image-action-btn')) {
            checkbox.checked = !checkbox.checked;
            toggleImageSelection(image.url, card);
        }
    });

    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadImage(image);
    });

    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyImageUrl(image.url, copyBtn);
    });

    return card;
}

function toggleImageSelection(url, card) {
    if (selectedImages.has(url)) {
        selectedImages.delete(url);
        card.classList.remove('selected');
    } else {
        selectedImages.add(url);
        card.classList.add('selected');
    }
    updateSelectedCount();
}

function toggleSelectAll() {
    if (selectedImages.size === filteredImages.length) {
        // Deselect all
        selectedImages.clear();
        document.querySelectorAll('.image-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.image-checkbox').checked = false;
        });
        selectAllBtn.textContent = 'Select All';
    } else {
        // Select all
        filteredImages.forEach(image => selectedImages.add(image.url));
        document.querySelectorAll('.image-card').forEach(card => {
            card.classList.add('selected');
            card.querySelector('.image-checkbox').checked = true;
        });
        selectAllBtn.textContent = 'Deselect All';
    }
    updateSelectedCount();
}

function updateImageCount() {
    imageCountEl.textContent = filteredImages.length;
}

function updateSelectedCount() {
    selectedCountEl.textContent = selectedImages.size;
    downloadAllBtn.disabled = selectedImages.size === 0;

    if (selectedImages.size === filteredImages.length && filteredImages.length > 0) {
        selectAllBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Deselect All
    `;
    } else {
        selectAllBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
      Select All
    `;
    }
}

function downloadImage(image) {
    const filename = generateFilename(image);
    chrome.downloads.download({
        url: image.url,
        filename: filename,
        saveAs: false
    });
}

async function downloadAll() {
    const imagesToDownload = filteredImages.filter(img => selectedImages.has(img.url));

    if (imagesToDownload.length === 0) return;

    if (imagesToDownload.length === 1) {
        downloadImage(imagesToDownload[0]);
        return;
    }

    // Use JSZip for bulk download
    downloadAllBtn.disabled = true;
    downloadAllBtn.innerHTML = `
    <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
    Downloading...
  `;

    try {
        // Load JSZip dynamically
        await loadScript('lib/jszip.min.js');

        const zip = new JSZip();
        const folder = zip.folder('images');

        // Fetch all images
        for (let i = 0; i < imagesToDownload.length; i++) {
            const image = imagesToDownload[i];
            try {
                if (image.isBase64) {
                    // Handle base64 images
                    const base64Data = image.url.split(',')[1];
                    folder.file(generateFilename(image, i + 1), base64Data, { base64: true });
                } else {
                    // Fetch regular images
                    const response = await fetch(image.url);
                    const blob = await response.blob();
                    folder.file(generateFilename(image, i + 1), blob);
                }
            } catch (error) {
                console.error(`Failed to download image: ${image.url}`, error);
            }
        }

        // Generate ZIP and download
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

        chrome.downloads.download({
            url: url,
            filename: `images_${timestamp}.zip`,
            saveAs: true
        });

    } catch (error) {
        console.error('Error creating ZIP:', error);
        alert('Failed to create ZIP file. Please try downloading images individually.');
    } finally {
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download All
    `;
    }
}

function copyImageUrl(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
        button.style.background = 'var(--success)';
        button.style.color = 'white';

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    });
}

function generateFilename(image, index) {
    const urlParts = image.url.split('/');
    let filename = urlParts[urlParts.length - 1].split('?')[0];

    // Handle cases where there's no filename in URL
    if (!filename || filename.length < 3 || !filename.includes('.')) {
        const ext = image.format.toLowerCase();
        filename = `image_${index || Date.now()}.${ext}`;
    }

    return filename;
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    savePreference('theme', isLightMode ? 'light' : 'dark');

    // Update icon
    darkModeToggle.innerHTML = isLightMode ? `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ` : `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;
}

function loadPreferences() {
    chrome.storage.local.get(['theme', 'excludeBase64'], (result) => {
        if (result.theme === 'light') {
            document.body.classList.add('light-mode');
            darkModeToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
        }

        if (result.excludeBase64 !== undefined) {
            excludeBase64.checked = result.excludeBase64;
        }
    });
}

function savePreference(key, value) {
    chrome.storage.local.set({ [key]: value });
}

function showEmptyState() {
    loadingState.style.display = 'none';
    imageGrid.style.display = 'none';
    emptyState.style.display = 'flex';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
