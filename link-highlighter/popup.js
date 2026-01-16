// Get DOM elements
const toggleHighlight = document.getElementById('toggleHighlight');
const filterButtons = document.querySelectorAll('.filter-btn');
const exportCsvBtn = document.getElementById('exportCsv');
const copyDataBtn = document.getElementById('copyData');

// Current state
let currentFilter = 'all';
let linkData = null;

// Initialize popup
async function init() {
  // Load saved state from storage
  const { isHighlightEnabled = false } = await chrome.storage.local.get('isHighlightEnabled');
  toggleHighlight.checked = isHighlightEnabled;

  // Get current tab and request link data
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab?.id) {
    // Request link analysis from content script
    chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready yet');
        return;
      }
      
      if (response && response.data) {
        linkData = response.data;
        updateCounts(response.data);
      }
    });
  }
}

// Update link counts in the popup
function updateCounts(data) {
  document.getElementById('count-internal-dofollow').textContent = data.internalDofollow || 0;
  document.getElementById('count-internal-nofollow').textContent = data.internalNofollow || 0;
  document.getElementById('count-external-dofollow').textContent = data.externalDofollow || 0;
  document.getElementById('count-external-nofollow').textContent = data.externalNofollow || 0;
  document.getElementById('count-sponsored').textContent = data.sponsored || 0;
  document.getElementById('count-ugc').textContent = data.ugc || 0;
}

// Toggle highlighting
toggleHighlight.addEventListener('change', async (e) => {
  const isEnabled = e.target.checked;
  
  // Save state
  await chrome.storage.local.set({ isHighlightEnabled: isEnabled });
  
  // Send message to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'toggleHighlight', 
      enabled: isEnabled 
    });
  }
});

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    // Update active state
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFilter = btn.dataset.filter;
    
    // Send filter to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'applyFilter', 
        filter: currentFilter 
      });
    }
  });
});

// Export to CSV
exportCsvBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'getLinks' }, (response) => {
      if (response && response.links) {
        const csv = convertToCSV(response.links);
        downloadCSV(csv, `links-${new Date().toISOString().split('T')[0]}.csv`);
      }
    });
  }
});

// Copy data to clipboard
copyDataBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'getLinks' }, async (response) => {
      if (response && response.links) {
        const text = formatLinksAsText(response.links);
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalText = copyDataBtn.innerHTML;
        copyDataBtn.innerHTML = '<span class="btn-icon">✓</span>Copied!';
        setTimeout(() => {
          copyDataBtn.innerHTML = originalText;
        }, 2000);
      }
    });
  }
});

// Convert links to CSV format
function convertToCSV(links) {
  const headers = ['URL', 'Text', 'Type', 'Location', 'Rel Attributes'];
  const rows = links.map(link => [
    link.href,
    link.text.replace(/"/g, '""'), // Escape quotes
    link.type,
    link.isInternal ? 'Internal' : 'External',
    link.rel.join(', ')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format links as plain text
function formatLinksAsText(links) {
  let text = `Link Analysis Report\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `Total Links: ${links.length}\n\n`;
  
  const grouped = links.reduce((acc, link) => {
    if (!acc[link.type]) acc[link.type] = [];
    acc[link.type].push(link);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([type, linkList]) => {
    text += `\n${type.toUpperCase()} (${linkList.length})\n`;
    text += '='.repeat(50) + '\n';
    linkList.forEach((link, i) => {
      text += `${i + 1}. ${link.text || '(no text)'}\n`;
      text += `   URL: ${link.href}\n`;
      if (link.rel.length > 0) {
        text += `   Rel: ${link.rel.join(', ')}\n`;
      }
      text += '\n';
    });
  });
  
  return text;
}

// Initialize on load
init();
