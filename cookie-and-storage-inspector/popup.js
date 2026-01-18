// ===========================
// STATE MANAGEMENT
// ===========================
let currentTab = 'cookies';
let isMasked = false;
let searchQuery = '';
let allData = {
  cookies: [],
  localStorage: [],
  sessionStorage: []
};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  setupEventListeners();
  await loadAllData();
});

// ===========================
// THEME MANAGEMENT
// ===========================
function initializeTheme() {
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  chrome.storage.sync.set({ theme: newTheme });
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (!themeIcon) return; // Safety check

  if (theme === 'dark') {
    // Sun icon for dark mode
    themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    // Moon icon for light mode
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Mask toggle
  document.getElementById('maskToggle').addEventListener('click', toggleMask);

  // Search input
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function toggleMask() {
  isMasked = !isMasked;
  const maskBtn = document.getElementById('maskToggle');
  const maskIcon = document.querySelector('.mask-icon');

  if (!maskIcon) return; // Safety check

  if (isMasked) {
    maskBtn.classList.add('active');
    // Eye-off icon
    maskIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    maskBtn.classList.remove('active');
    // Eye icon
    maskIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }

  // Re-render current tab with mask applied
  renderCurrentTab();
}

function handleSearch(e) {
  searchQuery = e.target.value.toLowerCase();
  renderCurrentTab();
}

function switchTab(tabName) {
  currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tabName}-panel`);
  });

  renderCurrentTab();
}

// ===========================
// DATA LOADING
// ===========================
async function loadAllData() {
  await Promise.all([
    loadCookies(),
    loadStorage()
  ]);

  updateStorageSummary();
  renderCurrentTab();
}

async function loadCookies() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      allData.cookies = [];
      return;
    }

    const url = new URL(tab.url);
    const cookies = await chrome.cookies.getAll({ url: tab.url });

    allData.cookies = cookies.map(cookie => ({
      ...cookie,
      isAuth: detectAuthCookie(cookie.name),
      isSession: cookie.session,
      isExpired: cookie.expirationDate && cookie.expirationDate < Date.now() / 1000
    }));
  } catch (error) {
    console.error('Error loading cookies:', error);
    allData.cookies = [];
  }
}

async function loadStorage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab?.url) {
      allData.localStorage = [];
      allData.sessionStorage = [];
      return;
    }

    // Check if URL is a restricted page where content scripts can't run
    const url = tab.url;
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') || url.startsWith('about:') ||
      url === 'chrome://newtab/' || url === 'about:blank') {
      console.log('Cannot access storage on restricted pages');
      allData.localStorage = [];
      allData.sessionStorage = [];
      return;
    }

    // Try to communicate with content script
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'getStorage' });

    if (result) {
      allData.localStorage = processStorageData(result.localStorage || {});
      allData.sessionStorage = processStorageData(result.sessionStorage || {});
    }
  } catch (error) {
    // Content script not available (restricted page, not loaded yet, etc.)
    console.log('Storage access not available:', error.message);
    allData.localStorage = [];
    allData.sessionStorage = [];
  }
}

function processStorageData(storageObj) {
  return Object.entries(storageObj).map(([key, value]) => ({
    key,
    value,
    size: new Blob([value]).size,
    isLarge: new Blob([value]).size > 10000,
    isSensitive: detectSensitiveKey(key),
    isJSON: isValidJSON(value)
  }));
}

// ===========================
// DETECTION UTILITIES
// ===========================
function detectAuthCookie(name) {
  const authPatterns = ['auth', 'token', 'session', 'jwt', 'access', 'refresh', 'user', 'login'];
  return authPatterns.some(pattern => name.toLowerCase().includes(pattern));
}

function detectSensitiveKey(key) {
  const sensitivePatterns = ['password', 'secret', 'key', 'token', 'auth', 'credential', 'private'];
  return sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern));
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// ===========================
// STORAGE SUMMARY
// ===========================
function updateStorageSummary() {
  const cookieCountEl = document.getElementById('cookieCount');
  const localCountEl = document.getElementById('localCount');
  const sessionCountEl = document.getElementById('sessionCount');
  const totalSizeEl = document.getElementById('totalSize');

  if (cookieCountEl) cookieCountEl.textContent = allData.cookies.length;
  if (localCountEl) localCountEl.textContent = allData.localStorage.length;
  if (sessionCountEl) sessionCountEl.textContent = allData.sessionStorage.length;

  const totalSize = calculateTotalSize();
  if (totalSizeEl) totalSizeEl.textContent = formatBytes(totalSize);
}

function calculateTotalSize() {
  let total = 0;

  allData.cookies.forEach(cookie => {
    total += new Blob([cookie.value]).size;
  });

  allData.localStorage.forEach(item => total += item.size);
  allData.sessionStorage.forEach(item => total += item.size);

  return total;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===========================
// RENDERING
// ===========================
function renderCurrentTab() {
  switch (currentTab) {
    case 'cookies':
      renderCookies();
      break;
    case 'localStorage':
      renderStorage('localStorage');
      break;
    case 'sessionStorage':
      renderStorage('sessionStorage');
      break;
  }
}

function renderCookies() {
  const container = document.getElementById('cookiesContent');
  const filteredData = filterData(allData.cookies, ['name', 'value', 'domain']);

  if (filteredData.length === 0) {
    container.innerHTML = '<div class="empty-state">No cookies found or no matches for your search.</div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';

  filteredData.forEach(cookie => {
    const row = document.createElement('tr');
    row.className = 'data-row';

    const keyCell = document.createElement('td');
    keyCell.className = 'data-cell data-key';
    keyCell.textContent = cookie.name;

    const valueCell = document.createElement('td');
    valueCell.className = 'data-cell data-value';

    // Value and copy button
    const valueDiv = document.createElement('div');
    const valueSpan = document.createElement('span');
    valueSpan.className = `value-text ${isMasked && cookie.isAuth ? 'value-masked' : ''}`;
    valueSpan.textContent = cookie.value;
    valueDiv.appendChild(valueSpan);

    const copyBtn = createCopyButton(cookie.value);
    valueDiv.appendChild(copyBtn);
    valueCell.appendChild(valueDiv);

    // Badges
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'badge-container';

    if (cookie.secure) {
      badgeContainer.appendChild(createBadge('Secure', 'badge-secure'));
    }
    if (cookie.httpOnly) {
      badgeContainer.appendChild(createBadge('HttpOnly', 'badge-httponly'));
    }
    if (cookie.isAuth) {
      badgeContainer.appendChild(createBadge('Auth', 'badge-auth'));
    }
    if (cookie.isSession) {
      badgeContainer.appendChild(createBadge('Session', 'badge-session'));
    }
    if (cookie.sameSite) {
      badgeContainer.appendChild(createBadge(`SameSite: ${cookie.sameSite}`, 'badge-samesite'));
    }

    valueCell.appendChild(badgeContainer);

    // Cookie details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'cookie-details';
    detailsDiv.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Domain:</span>
        <span class="detail-value">${cookie.domain}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Path:</span>
        <span class="detail-value">${cookie.path}</span>
      </div>
      ${cookie.expirationDate ? `
        <div class="detail-row">
          <span class="detail-label">Expires:</span>
          <span class="detail-value">${new Date(cookie.expirationDate * 1000).toLocaleString()}</span>
        </div>
      ` : '<div class="detail-row"><span class="detail-label">Expires:</span><span class="detail-value">Session</span></div>'}
    `;

    if (cookie.isExpired) {
      const warning = document.createElement('div');
      warning.className = 'warning-message error-message';
      warning.innerHTML = '⚠️ This cookie has expired';
      detailsDiv.appendChild(warning);
    }

    valueCell.appendChild(detailsDiv);

    row.appendChild(keyCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  });

  container.innerHTML = '';
  container.appendChild(table);
}

function renderStorage(storageType) {
  const container = document.getElementById(`${storageType}Content`);
  const data = allData[storageType];
  const filteredData = filterData(data, ['key', 'value']);

  if (filteredData.length === 0) {
    // Check if we're on a restricted page
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
        container.innerHTML = `
          <div class="empty-state">
            <p><strong>Storage not accessible on this page</strong></p>
            <p style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
              Browser security restrictions prevent accessing storage on chrome://, edge://, and about: pages.
              <br>Try opening this extension on a regular website.
            </p>
          </div>
        `;
      } else {
        container.innerHTML = '<div class="empty-state">No data found or no matches for your search.</div>';
      }
    });
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';

  filteredData.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'data-row';

    const keyCell = document.createElement('td');
    keyCell.className = 'data-cell data-key';
    keyCell.textContent = item.key;

    const valueCell = document.createElement('td');
    valueCell.className = 'data-cell data-value';

    // Value and copy button
    const valueDiv = document.createElement('div');
    const valueSpan = document.createElement('span');
    valueSpan.className = `value-text ${isMasked && item.isSensitive ? 'value-masked' : ''}`;

    // Show truncated value if too long
    const displayValue = item.value.length > 100 ? item.value.substring(0, 100) + '...' : item.value;
    valueSpan.textContent = displayValue;
    valueDiv.appendChild(valueSpan);

    const copyBtn = createCopyButton(item.value);
    valueDiv.appendChild(copyBtn);
    valueCell.appendChild(valueDiv);

    // Badges
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'badge-container';

    if (item.isLarge) {
      badgeContainer.appendChild(createBadge('Large Value', 'badge-large'));
    }
    if (item.isSensitive) {
      badgeContainer.appendChild(createBadge('Sensitive', 'badge-sensitive'));
    }
    if (item.isJSON) {
      badgeContainer.appendChild(createBadge('JSON', 'badge-samesite'));
    }

    valueCell.appendChild(badgeContainer);

    // JSON viewer for JSON values
    if (item.isJSON) {
      const jsonViewer = document.createElement('div');
      jsonViewer.className = 'json-viewer';
      try {
        const parsed = JSON.parse(item.value);
        jsonViewer.textContent = JSON.stringify(parsed, null, 2);
      } catch {
        jsonViewer.textContent = item.value;
      }
      valueCell.appendChild(jsonViewer);
    }

    // Size info
    const sizeInfo = document.createElement('div');
    sizeInfo.className = 'detail-row mt-sm';
    sizeInfo.innerHTML = `
      <span class="detail-label">Size:</span>
      <span class="detail-value">${formatBytes(item.size)}</span>
    `;
    sizeInfo.style.fontSize = '11px';
    sizeInfo.style.color = 'var(--text-secondary)';
    valueCell.appendChild(sizeInfo);

    row.appendChild(keyCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  });

  container.innerHTML = '';
  container.appendChild(table);
}

// ===========================
// HELPER FUNCTIONS
// ===========================
function filterData(data, searchFields) {
  if (!searchQuery) return data;

  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(searchQuery);
    });
  });
}

function createBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function createCopyButton(text) {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '12');
  icon.setAttribute('height', '12');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2');
  icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
  icon.style.display = 'inline-block';
  icon.style.verticalAlign = 'middle';
  icon.style.marginRight = '4px';

  const text_span = document.createElement('span');
  text_span.textContent = 'Copy';

  btn.appendChild(icon);
  btn.appendChild(text_span);

  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      text_span.textContent = 'Copied';
      icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      btn.classList.add('copied');
      setTimeout(() => {
        text_span.textContent = 'Copy';
        icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
        btn.classList.remove('copied');
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  return btn;
}
