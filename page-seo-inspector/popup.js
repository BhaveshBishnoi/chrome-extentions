// ==========================================
// PAGE SEO SNAPSHOT - POPUP CONTROLLER
// ==========================================

// Theme management
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// UI Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');
const pageUrl = document.getElementById('pageUrl');
const overallScore = document.getElementById('overallScore');
const sectionsContainer = document.getElementById('sections');

// Set up message listener BEFORE injecting script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEO_ANALYSIS_COMPLETE') {
    displayResults(message.data);
  } else if (message.type === 'SEO_ANALYSIS_ERROR') {
    showError(message.error);
  }
});

// Initialize on popup open
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      showError('No active tab found');
      return;
    }

    // Check if we can access this URL
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      showError('Cannot analyze Chrome internal pages');
      return;
    }

    pageUrl.textContent = tab.url;

    // Inject and execute content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

  } catch (error) {
    showError(error.message);
  }
});

// Display results
function displayResults(data) {
  loadingState.style.display = 'none';
  results.style.display = 'block';

  // Calculate overall score
  const score = calculateScore(data);
  overallScore.textContent = score;

  // Render sections
  renderSections(data);

  // Setup copy buttons
  setupCopyButtons(data);
}

// Calculate SEO score (0-100)
function calculateScore(data) {
  let score = 100;
  let deductions = 0;

  // Meta tags
  if (!data.meta.title || data.meta.title.length === 0) deductions += 10;
  else if (data.meta.titleLength > 60) deductions += 3;

  if (!data.meta.description || data.meta.description.length === 0) deductions += 10;
  else if (data.meta.descriptionLength > 160) deductions += 3;

  // Canonical
  if (!data.canonical.hasCanonical) deductions += 5;
  if (data.canonical.issues.length > 0) deductions += 5;

  // Headings
  if (data.headings.h1Count === 0) deductions += 8;
  if (data.headings.h1Count > 1) deductions += 5;
  if (data.headings.issues.length > 0) deductions += 3;

  // Images
  if (data.images.missingAlt > 0) {
    deductions += Math.min(10, data.images.missingAlt * 0.5);
  }

  // Social
  if (!data.social.openGraph.title) deductions += 5;
  if (!data.social.openGraph.description) deductions += 3;
  if (!data.social.openGraph.image) deductions += 3;

  // Structured data
  if (data.structuredData.schemas.length === 0) deductions += 5;

  score = Math.max(0, score - deductions);
  return Math.round(score);
}

// Render all sections
function renderSections(data) {
  sectionsContainer.innerHTML = '';

  // Meta Tags Section
  addSection({
    icon: '📄',
    title: 'Meta Tags',
    status: getMetaStatus(data.meta),
    content: renderMetaTags(data.meta)
  });

  // Canonical Section
  addSection({
    icon: '🔗',
    title: 'Canonical & URL',
    status: getCanonicalStatus(data.canonical),
    content: renderCanonical(data.canonical)
  });

  // Headings Section
  addSection({
    icon: '📑',
    title: 'Heading Structure',
    status: getHeadingsStatus(data.headings),
    content: renderHeadings(data.headings)
  });

  // Content Section
  addSection({
    icon: '📝',
    title: 'Content Metrics',
    status: 'info',
    content: renderContent(data.content)
  });

  // Images Section
  addSection({
    icon: '🖼️',
    title: 'Image SEO',
    status: getImagesStatus(data.images),
    content: renderImages(data.images)
  });

  // Links Section
  addSection({
    icon: '🔗',
    title: 'Links & Navigation',
    status: 'info',
    content: renderLinks(data.links)
  });

  // Social Section
  addSection({
    icon: '🌐',
    title: 'Social Metadata',
    status: getSocialStatus(data.social),
    content: renderSocial(data.social)
  });

  // Technical SEO Section
  addSection({
    icon: '⚙️',
    title: 'Technical SEO',
    status: getTechnicalStatus(data.technical),
    content: renderTechnical(data.technical)
  });

  // Structured Data Section
  addSection({
    icon: '🏗️',
    title: 'Structured Data',
    status: getStructuredDataStatus(data.structuredData),
    content: renderStructuredData(data.structuredData)
  });

  // Performance Section
  addSection({
    icon: '⚡',
    title: 'Performance Hints',
    status: getPerformanceStatus(data.performance),
    content: renderPerformance(data.performance)
  });
}

// Add section to UI
function addSection({ icon, title, status, content }) {
  const section = document.createElement('div');
  section.className = 'section';

  section.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <div class="section-icon">${icon}</div>
        <h3>${title}</h3>
      </div>
      <div class="section-status">
        <span class="status-badge ${status}">
          ${getStatusIcon(status)} ${status.toUpperCase()}
        </span>
        <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    <div class="section-content">
      <div class="section-body">
        ${content}
      </div>
    </div>
  `;

  section.querySelector('.section-header').addEventListener('click', () => {
    section.classList.toggle('expanded');
  });

  sectionsContainer.appendChild(section);
}

// Status helpers
function getStatusIcon(status) {
  const icons = {
    pass: '✓',
    warning: '⚠',
    error: '✗',
    info: 'ℹ'
  };
  return icons[status] || 'ℹ';
}

function getMetaStatus(meta) {
  if (!meta.title || !meta.description) return 'error';
  if (meta.titleLength > 60 || meta.descriptionLength > 160) return 'warning';
  return 'pass';
}

function getCanonicalStatus(canonical) {
  if (!canonical.hasCanonical) return 'warning';
  if (canonical.issues.length > 0) return 'warning';
  return 'pass';
}

function getHeadingsStatus(headings) {
  if (headings.h1Count === 0 || headings.h1Count > 1) return 'error';
  if (headings.issues.length > 0) return 'warning';
  return 'pass';
}

function getImagesStatus(images) {
  if (images.missingAlt > 5) return 'error';
  if (images.missingAlt > 0) return 'warning';
  return 'pass';
}

function getSocialStatus(social) {
  const ogMissing = !social.openGraph.title || !social.openGraph.description;
  if (ogMissing) return 'warning';
  return 'pass';
}

function getTechnicalStatus(technical) {
  if (technical.metaRefresh || technical.issues.length > 0) return 'warning';
  return 'pass';
}

function getStructuredDataStatus(structuredData) {
  if (structuredData.schemas.length === 0) return 'warning';
  if (structuredData.invalidSchemas > 0) return 'error';
  return 'pass';
}

function getPerformanceStatus(performance) {
  if (performance.issues.length > 3) return 'warning';
  if (performance.issues.length > 0) return 'info';
  return 'pass';
}

// Render functions
function renderMetaTags(meta) {
  return `
    <div class="metric-group">
      ${renderMetric('Title', meta.title || 'Missing', meta.title ? 'pass' : 'error')}
      ${renderMetric('Title Length', `${meta.titleLength} chars (${meta.titlePixelWidth}px)`, meta.titleLength <= 60 ? 'pass' : 'warning')}
      ${renderMetric('Description', meta.description || 'Missing', meta.description ? 'pass' : 'error')}
      ${renderMetric('Description Length', `${meta.descriptionLength} chars`, meta.descriptionLength <= 160 ? 'pass' : 'warning')}
      ${renderMetric('Robots', meta.robots || 'Not specified', 'info')}
      ${renderMetric('Viewport', meta.viewport ? 'Present' : 'Missing', meta.viewport ? 'pass' : 'warning')}
      ${renderMetric('Charset', meta.charset || 'Not specified', meta.charset ? 'pass' : 'warning')}
    </div>
  `;
}

function renderCanonical(canonical) {
  let html = '<div class="metric-group">';
  html += renderMetric('Has Canonical', canonical.hasCanonical ? 'Yes' : 'No', canonical.hasCanonical ? 'pass' : 'warning');

  if (canonical.hasCanonical) {
    html += renderMetric('Canonical URL', `<code>${canonical.url}</code>`, 'info');
    html += renderMetric('Self-referencing', canonical.isSelfReferencing ? 'Yes' : 'No', canonical.isSelfReferencing ? 'pass' : 'warning');
  }

  canonical.issues.forEach(issue => {
    html += renderMetric('Issue', issue, 'warning');
  });

  html += '</div>';
  return html;
}

function renderHeadings(headings) {
  return `
    <div class="metric-group">
      ${renderMetric('H1 Count', headings.h1Count, headings.h1Count === 1 ? 'pass' : 'error')}
      ${renderMetric('H2 Count', headings.h2Count, 'info')}
      ${renderMetric('H3 Count', headings.h3Count, 'info')}
      ${renderMetric('H4 Count', headings.h4Count, 'info')}
      ${renderMetric('H5 Count', headings.h5Count, 'info')}
      ${renderMetric('H6 Count', headings.h6Count, 'info')}
      ${headings.issues.map(issue => renderMetric('Issue', issue, 'warning')).join('')}
    </div>
  `;
}

function renderContent(content) {
  return `
    <div class="metric-group">
      ${renderMetric('Word Count', content.wordCount.toLocaleString(), 'info')}
      ${renderMetric('Character Count', content.characterCount.toLocaleString(), 'info')}
      ${renderMetric('Paragraph Count', content.paragraphCount, 'info')}
      ${renderMetric('Reading Time', `${content.readingTime} min`, 'info')}
      ${renderMetric('Content-to-Code Ratio', `${content.contentRatio}%`, 'info')}
    </div>
  `;
}

function renderImages(images) {
  return `
    <div class="metric-group">
      ${renderMetric('Total Images', images.totalImages, 'info')}
      ${renderMetric('Missing ALT', images.missingAlt, images.missingAlt === 0 ? 'pass' : 'error')}
      ${renderMetric('Empty ALT', images.emptyAlt, images.emptyAlt === 0 ? 'pass' : 'warning')}
      ${renderMetric('Inline SVGs', images.svgCount, 'info')}
      ${images.issues.map(issue => renderMetric('Issue', issue, 'warning')).join('')}
    </div>
  `;
}

function renderLinks(links) {
  return `
    <div class="metric-group">
      ${renderMetric('Internal Links', links.internal, 'info')}
      ${renderMetric('External Links', links.external, 'info')}
      ${renderMetric('Nofollow Links', links.nofollow, 'info')}
      ${renderMetric('Sponsored Links', links.sponsored, 'info')}
      ${renderMetric('UGC Links', links.ugc, 'info')}
      ${renderMetric('Has Pagination', links.hasPagination ? 'Yes' : 'No', 'info')}
      ${renderMetric('Has Hreflang', links.hasHreflang ? 'Yes' : 'No', 'info')}
    </div>
  `;
}

function renderSocial(social) {
  let html = '<div class="metric-group">';
  html += '<h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 13px;">Open Graph</h4>';
  html += renderMetric('og:title', social.openGraph.title || 'Missing', social.openGraph.title ? 'pass' : 'warning');
  html += renderMetric('og:description', social.openGraph.description || 'Missing', social.openGraph.description ? 'pass' : 'warning');
  html += renderMetric('og:image', social.openGraph.image || 'Missing', social.openGraph.image ? 'pass' : 'warning');
  html += renderMetric('og:url', social.openGraph.url || 'Not set', 'info');
  html += renderMetric('og:type', social.openGraph.type || 'Not set', 'info');

  html += '<h4 style="color: var(--text-primary); margin: 16px 0 8px; font-size: 13px;">Twitter Card</h4>';
  html += renderMetric('twitter:card', social.twitter.card || 'Not set', social.twitter.card ? 'pass' : 'info');
  html += renderMetric('twitter:title', social.twitter.title || 'Not set', 'info');
  html += renderMetric('twitter:description', social.twitter.description || 'Not set', 'info');
  html += renderMetric('twitter:image', social.twitter.image || 'Not set', 'info');

  html += '</div>';
  return html;
}

function renderTechnical(technical) {
  return `
    <div class="metric-group">
      ${renderMetric('Meta Refresh', technical.metaRefresh ? 'Detected' : 'None', technical.metaRefresh ? 'warning' : 'pass')}
      ${renderMetric('Iframes', technical.iframeCount, technical.iframeCount > 0 ? 'info' : 'pass')}
      ${renderMetric('JS Rendered Content', technical.hasJSContent ? 'Detected' : 'None', 'info')}
      ${technical.issues.map(issue => renderMetric('Issue', issue, 'warning')).join('')}
    </div>
  `;
}

function renderStructuredData(structuredData) {
  let html = '<div class="metric-group">';
  html += renderMetric('Schema Count', structuredData.schemas.length, structuredData.schemas.length > 0 ? 'pass' : 'warning');
  html += renderMetric('Invalid Schemas', structuredData.invalidSchemas, structuredData.invalidSchemas === 0 ? 'pass' : 'error');

  if (structuredData.schemas.length > 0) {
    html += renderMetric('Schema Types', structuredData.schemas.join(', '), 'info');
  }

  html += '</div>';
  return html;
}

function renderPerformance(performance) {
  return `
    <div class="metric-group">
      ${renderMetric('Render-blocking CSS', performance.renderBlockingCSS, performance.renderBlockingCSS > 5 ? 'warning' : 'pass')}
      ${renderMetric('Inline Styles', performance.inlineStyles, performance.inlineStyles > 10 ? 'warning' : 'pass')}
      ${renderMetric('DOM Nodes', performance.domNodes.toLocaleString(), performance.domNodes > 1500 ? 'warning' : 'pass')}
      ${renderMetric('Images w/o Dimensions', performance.imagesWithoutDimensions, performance.imagesWithoutDimensions > 0 ? 'warning' : 'pass')}
      ${performance.issues.map(issue => renderMetric('Hint', issue, 'info')).join('')}
    </div>
  `;
}

function renderMetric(label, value, status) {
  return `
    <div class="metric-item">
      <div class="metric-indicator ${status}"></div>
      <div class="metric-content">
        <div class="metric-label">${label}</div>
        <div class="metric-value">${value}</div>
      </div>
    </div>
  `;
}

// Copy functionality
function setupCopyButtons(data) {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const copyType = btn.dataset.copy;

      if (copyType === 'url') {
        navigator.clipboard.writeText(data.pageUrl);
        showCopyFeedback(btn);
      }
    });
  });
}

function showCopyFeedback(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  button.style.color = 'var(--status-pass)';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = '';
  }, 1500);
}

// Error display
function showError(message) {
  loadingState.style.display = 'none';
  errorState.style.display = 'flex';
  errorMessage.textContent = message;
}
