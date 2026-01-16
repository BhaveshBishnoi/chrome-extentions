# Link Highlighter & SEO Inspector

A powerful Chrome extension that highlights all links on a webpage and identifies their SEO attributes using colors and tooltips. Perfect for SEO professionals, digital marketers, developers, and website auditors.

![Extension Icon](icons/icon128.png)

## ✨ Features

### Core Functionality
- **Automatic Link Detection**: Scans and analyzes all `<a>` links on any webpage
- **SEO Classification**: Identifies 6 types of links:
  - Internal Dofollow (Green)
  - Internal Nofollow (Orange)
  - External Dofollow (Blue)
  - External Nofollow (Red)
  - Sponsored Links (Purple)
  - UGC Links (Pink)
- **Visual Highlighting**: Color-coded borders and backgrounds for easy identification
- **Smart Tooltips**: Hover over any link to see its type, URL, and rel attributes
- **Link Summary**: Real-time count of each link type in the popup

### Enhanced Features
- **Export to CSV**: Download all link data for offline analysis
- **Copy to Clipboard**: Quick copy of formatted link data
- **Filter Controls**: Show only external, nofollow, or sponsored links
- **Keyboard Shortcut**: Toggle highlighting with `Alt+Shift+L`
- **Persistent State**: Remembers your preferences across browsing sessions

## 🎨 Color Coding

| Link Type | Color | Description |
|-----------|-------|-------------|
| Internal Dofollow | 🟢 Green | Links to pages within your domain that pass SEO value |
| Internal Nofollow | 🟠 Orange | Links within your domain marked as nofollow |
| External Dofollow | 🔵 Blue | Links to external domains that pass SEO value |
| External Nofollow | 🔴 Red | Links to external domains marked as nofollow |
| Sponsored | 🟣 Purple | Links marked with rel="sponsored" |
| UGC | 🩷 Pink | User-generated content links (rel="ugc") |

## 🚀 Installation

### For Development
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `link-highlighter` directory

### From Chrome Web Store
*Coming soon - Extension will be published to the Chrome Web Store*

## 📖 Usage

1. **Activate Extension**: Click the extension icon in your Chrome toolbar
2. **Toggle Highlighting**: Use the toggle switch in the popup or press `Alt+Shift+L`
3. **View Summary**: Check the popup for link counts by type
4. **Apply Filters**: Click filter buttons to show specific link types
5. **Export Data**: Click "Export CSV" or "Copy Data" for analysis
6. **Hover for Details**: Move your mouse over highlighted links to see tooltips

## 🛠️ Technical Details

- **Manifest Version**: V3
- **Permissions**: `activeTab`, `scripting`, `storage`
- **Content Script**: Automatically injected on all pages
- **Background Worker**: Service worker for keyboard shortcuts
- **No Page Breaking**: Lightweight injection with no layout impact

## 📁 Project Structure

```
link-highlighter/
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup logic
├── content.js             # Link detection & highlighting
├── styles.css             # Injected link styles
├── background.js          # Service worker
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## 🎯 Use Cases

- **SEO Audits**: Quickly identify link structure and nofollow usage
- **Content Review**: Verify sponsored and UGC link compliance
- **Link Building**: Analyze competitor link strategies
- **Website Development**: Ensure proper rel attributes during development
- **Quality Assurance**: Validate link implementation before launch

## 🔮 Future Roadmap

- [ ] Lighthouse integration for comprehensive SEO scoring
- [ ] Broken link detection and reporting
- [ ] Page-level SEO score calculation
- [ ] Anchor text analysis
- [ ] Link redirect chain detection
- [ ] Firefox and Edge support

## 📝 License

MIT License - Feel free to use and modify for your needs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Made with 💜 for the SEO community**
