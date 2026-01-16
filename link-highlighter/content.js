// State management
let isHighlightEnabled = false;
let currentFilter = 'all';
let analyzedLinks = [];
let tooltipElement = null;

// Initialize
async function init() {
    const { isHighlightEnabled: enabled = false } = await chrome.storage.local.get('isHighlightEnabled');
    isHighlightEnabled = enabled;

    if (isHighlightEnabled) {
        analyzeAndHighlightLinks();
    }

    createTooltipElement();
}

// Create tooltip element
function createTooltipElement() {
    tooltipElement = document.createElement('div');
    tooltipElement.id = 'link-inspector-tooltip';
    tooltipElement.className = 'link-inspector-tooltip';
    document.body.appendChild(tooltipElement);
}

// Analyze all links on the page
function analyzeAndHighlightLinks() {
    const links = document.querySelectorAll('a[href]');
    analyzedLinks = [];

    links.forEach(link => {
        const analysis = analyzeLink(link);
        analyzedLinks.push(analysis);

        if (shouldShowLink(analysis)) {
            highlightLink(link, analysis);
        }
    });

    attachEventListeners();
}

// Analyze a single link
function analyzeLink(link) {
    const href = link.href;
    const rel = (link.rel || '').toLowerCase().split(' ').filter(r => r);
    const currentHost = window.location.hostname;

    // Determine if internal
    let linkHost;
    try {
        linkHost = new URL(href).hostname;
    } catch (e) {
        linkHost = currentHost; // Relative URLs are internal
    }

    const isInternal = linkHost === currentHost || linkHost === '' || href.startsWith('#') || href.startsWith('/');

    // Check attributes
    const isNofollow = rel.includes('nofollow');
    const isSponsored = rel.includes('sponsored');
    const isUgc = rel.includes('ugc');

    // Determine type (priority: sponsored > ugc > nofollow > external > internal)
    let type;
    if (isSponsored) {
        type = 'sponsored';
    } else if (isUgc) {
        type = 'ugc';
    } else if (isInternal && isNofollow) {
        type = 'internal-nofollow';
    } else if (isInternal) {
        type = 'internal-dofollow';
    } else if (!isInternal && isNofollow) {
        type = 'external-nofollow';
    } else {
        type = 'external-dofollow';
    }

    return {
        element: link,
        href: href,
        text: link.textContent.trim(),
        type: type,
        isInternal: isInternal,
        isNofollow: isNofollow,
        isSponsored: isSponsored,
        isUgc: isUgc,
        rel: rel
    };
}

// Highlight a link
function highlightLink(link, analysis) {
    // Remove existing classes
    link.classList.remove(
        'link-inspector-highlight',
        'link-inspector-internal-dofollow',
        'link-inspector-internal-nofollow',
        'link-inspector-external-dofollow',
        'link-inspector-external-nofollow',
        'link-inspector-sponsored',
        'link-inspector-ugc'
    );

    // Add new classes
    link.classList.add('link-inspector-highlight', `link-inspector-${analysis.type}`);
    link.dataset.linkType = analysis.type;
}

// Remove highlighting
function removeHighlighting() {
    const links = document.querySelectorAll('.link-inspector-highlight');
    links.forEach(link => {
        link.classList.remove(
            'link-inspector-highlight',
            'link-inspector-internal-dofollow',
            'link-inspector-internal-nofollow',
            'link-inspector-external-dofollow',
            'link-inspector-external-nofollow',
            'link-inspector-sponsored',
            'link-inspector-ugc'
        );
        delete link.dataset.linkType;
    });

    hideTooltip();
}

// Check if link should be shown based on current filter
function shouldShowLink(analysis) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'external') return !analysis.isInternal;
    if (currentFilter === 'nofollow') return analysis.isNofollow;
    if (currentFilter === 'sponsored') return analysis.isSponsored;
    return true;
}

// Apply filter
function applyFilter(filter) {
    currentFilter = filter;

    analyzedLinks.forEach(analysis => {
        if (shouldShowLink(analysis)) {
            if (isHighlightEnabled) {
                highlightLink(analysis.element, analysis);
            }
        } else {
            analysis.element.classList.remove('link-inspector-highlight');
        }
    });
}

// Attach event listeners for tooltips
function attachEventListeners() {
    const highlightedLinks = document.querySelectorAll('.link-inspector-highlight');

    highlightedLinks.forEach(link => {
        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);
    });
}

// Show tooltip
function handleMouseEnter(e) {
    const link = e.currentTarget;
    const analysis = analyzedLinks.find(a => a.element === link);

    if (!analysis || !tooltipElement) return;

    // Build tooltip content
    let content = `<div class="tooltip-type">${formatType(analysis.type)}</div>`;
    content += `<div class="tooltip-url">${truncateUrl(analysis.href)}</div>`;

    if (analysis.rel.length > 0) {
        content += `<div class="tooltip-rel">Rel: ${analysis.rel.join(', ')}</div>`;
    }

    tooltipElement.innerHTML = content;
    tooltipElement.style.display = 'block';

    // Position tooltip
    positionTooltip(e);
}

// Hide tooltip
function handleMouseLeave() {
    hideTooltip();
}

function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
}

// Position tooltip near cursor
function positionTooltip(e) {
    if (!tooltipElement) return;

    const x = e.pageX;
    const y = e.pageY;
    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let left = x + 10;
    let top = y + 10;

    // Prevent tooltip from going off-screen
    if (left + tooltipWidth > windowWidth + scrollX) {
        left = x - tooltipWidth - 10;
    }

    if (top + tooltipHeight > windowHeight + scrollY) {
        top = y - tooltipHeight - 10;
    }

    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
}

// Format type for display
function formatType(type) {
    const typeMap = {
        'internal-dofollow': 'Internal Dofollow',
        'internal-nofollow': 'Internal Nofollow',
        'external-dofollow': 'External Dofollow',
        'external-nofollow': 'External Nofollow',
        'sponsored': 'Sponsored Link',
        'ugc': 'UGC Link'
    };
    return typeMap[type] || type;
}

// Truncate URL for display
function truncateUrl(url) {
    if (url.length <= 50) return url;
    return url.substring(0, 47) + '...';
}

// Get link counts
function getLinkCounts() {
    const counts = {
        internalDofollow: 0,
        internalNofollow: 0,
        externalDofollow: 0,
        externalNofollow: 0,
        sponsored: 0,
        ugc: 0
    };

    analyzedLinks.forEach(link => {
        if (link.type === 'internal-dofollow') counts.internalDofollow++;
        else if (link.type === 'internal-nofollow') counts.internalNofollow++;
        else if (link.type === 'external-dofollow') counts.externalDofollow++;
        else if (link.type === 'external-nofollow') counts.externalNofollow++;
        else if (link.type === 'sponsored') counts.sponsored++;
        else if (link.type === 'ugc') counts.ugc++;
    });

    return counts;
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleHighlight') {
        isHighlightEnabled = request.enabled;

        if (isHighlightEnabled) {
            analyzeAndHighlightLinks();
        } else {
            removeHighlighting();
        }

        sendResponse({ success: true });
    }
    else if (request.action === 'applyFilter') {
        applyFilter(request.filter);
        sendResponse({ success: true });
    }
    else if (request.action === 'analyzePage') {
        if (analyzedLinks.length === 0) {
            analyzeAndHighlightLinks();
        }
        const counts = getLinkCounts();
        sendResponse({ data: counts });
    }
    else if (request.action === 'getLinks') {
        const links = analyzedLinks.map(a => ({
            href: a.href,
            text: a.text,
            type: a.type,
            isInternal: a.isInternal,
            rel: a.rel
        }));
        sendResponse({ links: links });
    }

    return true; // Keep channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
