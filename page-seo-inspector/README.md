# Page SEO Snapshot

**Developer-focused Chrome extension for comprehensive on-page SEO and metadata inspection**

## 🎯 Overview

Page SEO Snapshot is a powerful, privacy-first Chrome extension designed for developers, frontend engineers, and technical SEO teams. It provides instant, comprehensive SEO analysis of any webpage with a single click—no external tools required.

All analysis runs locally in your browser and only activates when you click the extension icon.

## ✨ Features

### 📄 Meta Tag Inspection
- Page title with character and pixel width analysis
- Meta description with length validation
- Robots directives (index, noindex, follow, nofollow)
- Viewport and charset validation
- Content-type verification

### 🔗 Canonical & URL Analysis
- Canonical tag detection and validation
- Self-referencing canonical check
- Cross-domain canonical detection
- HTTP/HTTPS protocol mismatch alerts
- Trailing slash consistency check

### 📑 Heading Structure Analysis
- H1 count validation (detects missing or multiple H1s)
- H2-H6 distribution analysis
- Heading hierarchy validation
- Empty heading detection

### 📝 Content Metrics
- Word count
- Character count
- Paragraph count
- Reading time estimation
- Content-to-code ratio

### 🖼️ Image SEO Signals
- Total image count
- Images missing ALT attributes
- Empty ALT values detection
- Inline SVG detection

### 🔗 Link & Indexation Signals
- Internal vs external link counts
- Nofollow/sponsored/UGC link detection
- Pagination rel tags (prev/next)
- Hreflang attribute detection

### 🌐 Social Metadata Preview
**Open Graph:**
- og:title, og:description, og:image, og:url, og:type

**Twitter Cards:**
- twitter:card, twitter:title, twitter:description, twitter:image

### ⚙️ Technical SEO Signals
- Meta refresh redirect detection
- JavaScript-rendered content hints
- Iframe usage analysis
- Technical issue warnings

### 🏗️ Structured Data Detection
- JSON-LD schema detection
- Schema type identification (FAQPage, Article, Breadcrumb, etc.)
- Invalid JSON-LD warnings

### ⚡ Performance Hints
- Render-blocking CSS detection
- Inline style overuse warnings
- Excessive DOM node alerts
- Images missing dimensions

## 🎨 UI Features

- **Modern Design**: Premium dark/light mode with glassmorphism effects
- **Color-Coded Status**: Instant visual feedback (Pass ✓ / Warning ⚠ / Error ✗ / Info ℹ)
- **Expandable Sections**: Clean, organized dashboard layout
- **Theme Toggle**: Seamless dark/light mode switching
- **Copy to Clipboard**: Easy data export
- **Responsive Layout**: Mobile-friendly popup design

## 🚀 Installation

### Developer Mode (For Testing)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `page-seo-inspector` folder
6. The extension icon will appear in your toolbar

### Chrome Web Store (Coming Soon)

Once published, you'll be able to install directly from the Chrome Web Store.

## 📖 Usage

1. Navigate to any webpage you want to analyze
2. Click the **Page SEO Snapshot** extension icon
3. Wait for analysis to complete (usually < 1 second)
4. Review the comprehensive SEO report
5. Expand sections to see detailed metrics
6. Use the theme toggle to switch between dark/light mode

## 🔒 Privacy & Security

- ✅ **No data collection** - Zero personal data collected
- ✅ **No external API calls** - All analysis runs locally
- ✅ **No tracking or analytics** - Completely private
- ✅ **No data sent to servers** - Your data stays on your device
- ✅ **Minimal permissions** - Only `activeTab` and `storage` (for theme preference)

## 🛠️ Technical Stack

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **APIs**: Chrome Extension APIs, DOM APIs
- **Design**: Custom CSS with dark/light theme support

## 🎯 Target Users

- Frontend Developers
- Web Developers
- QA Engineers
- Technical SEO Teams
- Startup Engineering Teams
- Anyone building SEO-optimized websites

## 📋 Requirements

- Chrome browser (version 88+)
- No additional dependencies required

## 🗺️ Roadmap

Future enhancements planned:

- [ ] Export SEO report as JSON/PDF
- [ ] Compare staging vs production
- [ ] CI-friendly audit checklist
- [ ] Framework-specific warnings (React/Next.js)
- [ ] Historical SEO tracking
- [ ] Batch URL analysis

## 🐛 Known Issues

None currently. Please report issues on the GitHub repository.

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for developers who care about SEO**
