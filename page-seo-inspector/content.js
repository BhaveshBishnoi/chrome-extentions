// ==========================================
// PAGE SEO SNAPSHOT - CONTENT SCRIPT
// SEO Analysis Engine
// ==========================================

(function () {
    'use strict';

    // Main analysis function
    function analyzePage() {
        try {
            const data = {
                pageUrl: window.location.href,
                meta: analyzeMeta(),
                canonical: analyzeCanonical(),
                headings: analyzeHeadings(),
                content: analyzeContent(),
                images: analyzeImages(),
                links: analyzeLinks(),
                social: analyzeSocial(),
                technical: analyzeTechnical(),
                structuredData: analyzeStructuredData(),
                performance: analyzePerformance()
            };

            // Send results to popup
            chrome.runtime.sendMessage({
                type: 'SEO_ANALYSIS_COMPLETE',
                data: data
            });
        } catch (error) {
            chrome.runtime.sendMessage({
                type: 'SEO_ANALYSIS_ERROR',
                error: error.message
            });
        }
    }

    // ==========================================
    // META TAG ANALYSIS
    // ==========================================
    function analyzeMeta() {
        const title = document.title || '';
        const description = getMetaContent('description') || '';
        const robots = getMetaContent('robots') || '';
        const viewport = getMetaContent('viewport') || '';
        const charset = document.characterSet || '';

        // Calculate title pixel width (approximate)
        const titlePixelWidth = estimatePixelWidth(title);

        return {
            title: title,
            titleLength: title.length,
            titlePixelWidth: titlePixelWidth,
            description: description,
            descriptionLength: description.length,
            robots: robots,
            viewport: viewport,
            charset: charset
        };
    }

    // ==========================================
    // CANONICAL URL ANALYSIS
    // ==========================================
    function analyzeCanonical() {
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        const hasCanonical = !!canonicalLink;
        const canonicalUrl = canonicalLink ? canonicalLink.href : '';
        const currentUrl = window.location.href;

        const issues = [];

        if (hasCanonical) {
            // Check self-referencing
            const isSelfReferencing = canonicalUrl === currentUrl ||
                canonicalUrl === currentUrl.replace(/\/$/, '') ||
                canonicalUrl + '/' === currentUrl;

            // Check protocol mismatch
            try {
                const canonicalProtocol = new URL(canonicalUrl).protocol;
                const currentProtocol = window.location.protocol;
                if (canonicalProtocol !== currentProtocol) {
                    issues.push(`Protocol mismatch: ${currentProtocol} vs ${canonicalProtocol}`);
                }

                // Check cross-domain
                const canonicalDomain = new URL(canonicalUrl).hostname;
                const currentDomain = window.location.hostname;
                if (canonicalDomain !== currentDomain) {
                    issues.push(`Cross-domain canonical: ${canonicalDomain}`);
                }

                // Check trailing slash inconsistency
                if (!isSelfReferencing &&
                    Math.abs(canonicalUrl.length - currentUrl.length) === 1) {
                    issues.push('Trailing slash mismatch');
                }
            } catch (e) {
                issues.push('Invalid canonical URL');
            }

            return {
                hasCanonical: true,
                url: canonicalUrl,
                isSelfReferencing: isSelfReferencing,
                issues: issues
            };
        }

        return {
            hasCanonical: false,
            url: '',
            isSelfReferencing: false,
            issues: ['No canonical tag found']
        };
    }

    // ==========================================
    // HEADING STRUCTURE ANALYSIS
    // ==========================================
    function analyzeHeadings() {
        const headings = {
            h1Count: document.querySelectorAll('h1').length,
            h2Count: document.querySelectorAll('h2').length,
            h3Count: document.querySelectorAll('h3').length,
            h4Count: document.querySelectorAll('h4').length,
            h5Count: document.querySelectorAll('h5').length,
            h6Count: document.querySelectorAll('h6').length,
            issues: []
        };

        // Check H1 count
        if (headings.h1Count === 0) {
            headings.issues.push('No H1 heading found');
        } else if (headings.h1Count > 1) {
            headings.issues.push(`Multiple H1 headings (${headings.h1Count} found)`);
        }

        // Check for empty headings
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let emptyCount = 0;
        allHeadings.forEach(h => {
            if (!h.textContent.trim()) emptyCount++;
        });

        if (emptyCount > 0) {
            headings.issues.push(`${emptyCount} empty heading(s) found`);
        }

        // Check hierarchy (simplified)
        const headingLevels = [];
        allHeadings.forEach(h => {
            const level = parseInt(h.tagName.charAt(1));
            headingLevels.push(level);
        });

        // Check for skipped levels
        let previousLevel = 0;
        for (let level of headingLevels) {
            if (level - previousLevel > 1) {
                headings.issues.push('Heading hierarchy has gaps');
                break;
            }
            previousLevel = level;
        }

        return headings;
    }

    // ==========================================
    // CONTENT METRICS ANALYSIS
    // ==========================================
    function analyzeContent() {
        const bodyText = document.body.innerText || '';
        const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const characterCount = bodyText.length;
        const paragraphCount = document.querySelectorAll('p').length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

        // Content-to-code ratio (approximate)
        const htmlLength = document.documentElement.outerHTML.length;
        const contentRatio = Math.round((characterCount / htmlLength) * 100);

        return {
            wordCount: wordCount,
            characterCount: characterCount,
            paragraphCount: paragraphCount,
            readingTime: readingTime,
            contentRatio: contentRatio
        };
    }

    // ==========================================
    // IMAGE SEO ANALYSIS
    // ==========================================
    function analyzeImages() {
        const images = document.querySelectorAll('img');
        const svgs = document.querySelectorAll('svg');

        let missingAlt = 0;
        let emptyAlt = 0;
        const issues = [];

        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            } else if (img.alt.trim() === '') {
                emptyAlt++;
            }
        });

        return {
            totalImages: images.length,
            missingAlt: missingAlt,
            emptyAlt: emptyAlt,
            svgCount: svgs.length,
            issues: issues
        };
    }

    // ==========================================
    // LINK ANALYSIS
    // ==========================================
    function analyzeLinks() {
        const links = document.querySelectorAll('a[href]');
        const currentDomain = window.location.hostname;

        let internal = 0;
        let external = 0;
        let nofollow = 0;
        let sponsored = 0;
        let ugc = 0;

        links.forEach(link => {
            try {
                const href = link.href;
                const linkDomain = new URL(href).hostname;

                if (linkDomain === currentDomain || href.startsWith('/') || href.startsWith('#')) {
                    internal++;
                } else {
                    external++;
                }

                const rel = link.rel || '';
                if (rel.includes('nofollow')) nofollow++;
                if (rel.includes('sponsored')) sponsored++;
                if (rel.includes('ugc')) ugc++;
            } catch (e) {
                // Invalid URL, skip
            }
        });

        const hasPagination = !!(document.querySelector('link[rel="prev"]') ||
            document.querySelector('link[rel="next"]'));
        const hasHreflang = !!document.querySelector('link[rel="alternate"][hreflang]');

        return {
            internal: internal,
            external: external,
            nofollow: nofollow,
            sponsored: sponsored,
            ugc: ugc,
            hasPagination: hasPagination,
            hasHreflang: hasHreflang
        };
    }

    // ==========================================
    // SOCIAL METADATA ANALYSIS
    // ==========================================
    function analyzeSocial() {
        return {
            openGraph: {
                title: getMetaProperty('og:title'),
                description: getMetaProperty('og:description'),
                image: getMetaProperty('og:image'),
                url: getMetaProperty('og:url'),
                type: getMetaProperty('og:type')
            },
            twitter: {
                card: getMetaName('twitter:card'),
                title: getMetaName('twitter:title'),
                description: getMetaName('twitter:description'),
                image: getMetaName('twitter:image')
            }
        };
    }

    // ==========================================
    // TECHNICAL SEO ANALYSIS
    // ==========================================
    function analyzeTechnical() {
        const metaRefresh = !!document.querySelector('meta[http-equiv="refresh"]');
        const iframeCount = document.querySelectorAll('iframe').length;
        const issues = [];

        // Check for JS-rendered content indicators
        const hasReactRoot = !!document.getElementById('root');
        const hasVueApp = !!document.getElementById('app');
        const hasJSContent = hasReactRoot || hasVueApp ||
            document.body.innerHTML.includes('__NEXT_DATA__');

        if (metaRefresh) {
            issues.push('Meta refresh redirect detected');
        }

        if (iframeCount > 3) {
            issues.push(`High iframe count (${iframeCount})`);
        }

        return {
            metaRefresh: metaRefresh,
            iframeCount: iframeCount,
            hasJSContent: hasJSContent,
            issues: issues
        };
    }

    // ==========================================
    // STRUCTURED DATA ANALYSIS
    // ==========================================
    function analyzeStructuredData() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        const schemas = [];
        let invalidSchemas = 0;

        jsonLdScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);

                // Handle both single and array of schemas
                const items = Array.isArray(data) ? data : [data];

                items.forEach(item => {
                    if (item['@type']) {
                        schemas.push(item['@type']);
                    } else if (item['@graph']) {
                        // Handle @graph format
                        item['@graph'].forEach(graphItem => {
                            if (graphItem['@type']) {
                                schemas.push(graphItem['@type']);
                            }
                        });
                    }
                });
            } catch (e) {
                invalidSchemas++;
            }
        });

        return {
            schemas: [...new Set(schemas)], // Remove duplicates
            invalidSchemas: invalidSchemas
        };
    }

    // ==========================================
    // PERFORMANCE HINTS ANALYSIS
    // ==========================================
    function analyzePerformance() {
        const renderBlockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])').length;
        const inlineStyles = document.querySelectorAll('style').length;
        const domNodes = document.querySelectorAll('*').length;

        const images = document.querySelectorAll('img');
        let imagesWithoutDimensions = 0;

        images.forEach(img => {
            if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
                imagesWithoutDimensions++;
            }
        });

        const issues = [];

        if (renderBlockingCSS > 5) {
            issues.push(`${renderBlockingCSS} render-blocking CSS files`);
        }

        if (inlineStyles > 10) {
            issues.push(`High inline style count (${inlineStyles})`);
        }

        if (domNodes > 1500) {
            issues.push(`Large DOM (${domNodes.toLocaleString()} nodes)`);
        }

        if (imagesWithoutDimensions > 0) {
            issues.push(`${imagesWithoutDimensions} images missing dimensions`);
        }

        return {
            renderBlockingCSS: renderBlockingCSS,
            inlineStyles: inlineStyles,
            domNodes: domNodes,
            imagesWithoutDimensions: imagesWithoutDimensions,
            issues: issues
        };
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    function getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.content : '';
    }

    function getMetaProperty(property) {
        const meta = document.querySelector(`meta[property="${property}"]`);
        return meta ? meta.content : '';
    }

    function getMetaName(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.content : '';
    }

    function estimatePixelWidth(text) {
        // Approximate pixel width for Google SERP title (average 5.3px per char)
        return Math.round(text.length * 5.3);
    }

    // Run analysis
    analyzePage();
})();
