// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Status Message
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message show ${type}`;
  
  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

// Get Active Tab
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Send Message to Content Script
async function sendToContentScript(action, data = {}) {
  try {
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, { action, ...data });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    showStatus('Error communicating with page. Please refresh and try again.', 'error');
    return null;
  }
}

// Render Forms
function renderForms(formsData) {
  const container = document.getElementById('formsContainer');
  
  if (!formsData || formsData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <p class="empty-text">No forms found on this page</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  formsData.forEach((form, formIndex) => {
    const formCard = document.createElement('div');
    formCard.className = 'form-card';
    formCard.dataset.formIndex = formIndex;
    
    const formName = form.name || form.id || `Form ${formIndex + 1}`;
    const fieldCount = form.fields.length;
    
    formCard.innerHTML = `
      <div class="form-header">
        <div class="form-title">
          <span>${formName}</span>
          <span class="form-badge">${fieldCount} field${fieldCount !== 1 ? 's' : ''}</span>
        </div>
        <svg class="form-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="form-body">
        <div class="form-info">
          ${form.id ? `<div class="info-row"><span class="info-label">ID:</span><span class="info-value">${form.id}</span></div>` : ''}
          ${form.name ? `<div class="info-row"><span class="info-label">Name:</span><span class="info-value">${form.name}</span></div>` : ''}
          ${form.action ? `<div class="info-row"><span class="info-label">Action:</span><span class="info-value">${form.action}</span></div>` : ''}
          ${form.method ? `<div class="info-row"><span class="info-label">Method:</span><span class="info-value">${form.method.toUpperCase()}</span></div>` : ''}
        </div>
        ${renderFields(form.fields)}
      </div>
    `;
    
    // Toggle expand/collapse
    const header = formCard.querySelector('.form-header');
    header.addEventListener('click', () => {
      formCard.classList.toggle('expanded');
    });
    
    container.appendChild(formCard);
  });
}

// Render Fields
function renderFields(fields) {
  if (!fields || fields.length === 0) {
    return '<div class="field-card"><p>No fields found</p></div>';
  }
  
  return fields.map(field => {
    const rules = [];
    const issues = [];
    
    // Build validation rules
    if (field.required) {
      rules.push('<span class="rule-tag required">Required</span>');
    }
    if (field.minLength) {
      rules.push(`<span class="rule-tag">Min: ${field.minLength}</span>`);
    }
    if (field.maxLength) {
      rules.push(`<span class="rule-tag">Max: ${field.maxLength}</span>`);
    }
    if (field.pattern) {
      rules.push(`<span class="rule-tag">Pattern: ${field.pattern}</span>`);
    }
    if (field.min !== null && field.min !== undefined) {
      rules.push(`<span class="rule-tag">Min Value: ${field.min}</span>`);
    }
    if (field.max !== null && field.max !== undefined) {
      rules.push(`<span class="rule-tag">Max Value: ${field.max}</span>`);
    }
    
    // Check for issues
    if (field.duplicateName) {
      issues.push('<span class="issue-badge warning">⚠ Duplicate Name</span>');
    }
    if (field.missingLabel) {
      issues.push('<span class="issue-badge warning">⚠ Missing Label</span>');
    }
    if (field.missingAriaLabel && !field.label) {
      issues.push('<span class="issue-badge warning">⚠ No ARIA Label</span>');
    }
    
    const validationStateClass = field.validationMessage ? 'invalid' : '';
    
    return `
      <div class="field-card ${validationStateClass}" data-field-id="${field.id || field.name}">
        <div class="field-header">
          <div class="field-name">${field.name || field.id || 'Unnamed Field'}</div>
          <div class="field-type">${field.type}</div>
        </div>
        ${rules.length > 0 ? `<div class="field-rules">${rules.join('')}</div>` : ''}
        <div class="field-meta">
          ${field.id ? `<div class="meta-item"><span class="meta-label">ID:</span><span class="meta-value">${field.id}</span></div>` : ''}
          ${field.disabled ? `<div class="meta-item"><span class="rule-tag">Disabled</span></div>` : ''}
          ${field.readonly ? `<div class="meta-item"><span class="rule-tag">Readonly</span></div>` : ''}
          ${field.placeholder ? `<div class="meta-item"><span class="meta-label">Placeholder:</span><span class="meta-value">${field.placeholder}</span></div>` : ''}
        </div>
        ${issues.length > 0 ? issues.join('') : ''}
        ${field.validationMessage ? `<div class="validation-message">${field.validationMessage}</div>` : ''}
        <div class="field-actions">
          <button class="btn-copy" data-copy='${JSON.stringify(field)}'>Copy Rules</button>
        </div>
      </div>
    `;
  }).join('');
}

// Search/Filter Forms
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const fieldCards = document.querySelectorAll('.field-card');
    
    fieldCards.forEach(card => {
      const fieldName = card.querySelector('.field-name')?.textContent.toLowerCase() || '';
      const fieldId = card.dataset.fieldId?.toLowerCase() || '';
      
      if (fieldName.includes(query) || fieldId.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Copy to Clipboard
function setupCopyButtons() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-copy')) {
      const data = e.target.dataset.copy;
      navigator.clipboard.writeText(data)
        .then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = originalText;
          }, 1500);
        })
        .catch(err => {
          console.error('Copy failed:', err);
          showStatus('Failed to copy', 'error');
        });
    }
  });
}

// Export Functions
async function exportJSON() {
  const response = await sendToContentScript('getFormsData');
  if (!response) return;
  
  const dataStr = JSON.stringify(response.forms, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `form-validation-report-${Date.now()}.json`;
  a.click();
  
  showStatus('JSON exported successfully', 'success');
}

async function exportCSV() {
  const response = await sendToContentScript('getFormsData');
  if (!response) return;
  
  const csvRows = [];
  csvRows.push(['Form', 'Field Name', 'Field ID', 'Type', 'Required', 'Min Length', 'Max Length', 'Pattern', 'Validation Message']);
  
  response.forms.forEach(form => {
    const formName = form.name || form.id || 'Unnamed';
    form.fields.forEach(field => {
      csvRows.push([
        formName,
        field.name || '',
        field.id || '',
        field.type,
        field.required ? 'Yes' : 'No',
        field.minLength || '',
        field.maxLength || '',
        field.pattern || '',
        field.validationMessage || ''
      ]);
    });
  });
  
  const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `form-validation-report-${Date.now()}.csv`;
  a.click();
  
  showStatus('CSV exported successfully', 'success');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupSearch();
  setupCopyButtons();
  
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Scan forms
  document.getElementById('scanBtn').addEventListener('click', async () => {
    showStatus('Scanning forms...', 'info');
    const response = await sendToContentScript('scanForms');
    if (response) {
      renderForms(response.forms);
      showStatus(`Found ${response.forms.length} form(s)`, 'success');
    }
  });
  
  // Test validation
  document.getElementById('validateBtn').addEventListener('click', async () => {
    showStatus('Testing validation...', 'info');
    const response = await sendToContentScript('testValidation');
    if (response) {
      renderForms(response.forms);
      const invalidCount = response.forms.reduce((count, form) => {
        return count + form.fields.filter(f => f.validationMessage).length;
      }, 0);
      
      if (invalidCount > 0) {
        showStatus(`Found ${invalidCount} invalid field(s)`, 'error');
      } else {
        showStatus('All fields are valid', 'success');
      }
    }
  });
  
  // Clear highlights
  document.getElementById('clearBtn').addEventListener('click', async () => {
    await sendToContentScript('clearHighlights');
    showStatus('Highlights cleared', 'success');
  });
  
  // Export buttons
  document.getElementById('exportJson').addEventListener('click', exportJSON);
  document.getElementById('exportCsv').addEventListener('click', exportCSV);
});
