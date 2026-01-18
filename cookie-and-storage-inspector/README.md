# 🍪 Cookie & Storage Viewer

A read-only Chrome extension for safely inspecting cookies, localStorage, and sessionStorage data. Perfect for developers, QA engineers, and security testers who need to debug authentication, session, and state-related issues.

## ✨ Features

### 🍪 Cookie Viewer
- View all cookies for the current domain
- Display comprehensive cookie attributes:
  - Name, value, domain, path
  - Secure & HttpOnly flags
  - Expiration date & SameSite attribute
- Auto-highlight auth/session cookies
- Token expiration warnings
- SameSite compatibility hints

### 💾 LocalStorage Viewer
- View all localStorage key-value pairs
- Automatic JSON pretty printing
- Detect and flag large values (>10KB)
- Highlight sensitive-looking keys
- Display storage size per item

### ⏱️ SessionStorage Viewer
- View sessionStorage data
- Lifecycle information
- Side-by-side comparison with localStorage

### 🔒 Read-Only Safety
- **Zero mutation** - No edit or delete capabilities
- Data inspection only
- No external data transmission
- Client-side processing only

### 🎨 Advanced Features
- **Search & Filter** - Real-time search across all storage types
- **Copy to Clipboard** - One-click copy for any value
- **Sensitive Value Masking** - Toggle to hide/show sensitive data
- **Storage Size Summary** - See total storage usage at a glance
- **Dark/Light Mode** - Beautiful themes with smooth transitions
- **Debugging Tools** - Auth flow detection, expiration warnings, and more

## 🚀 Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension directory

## 📖 Usage

1. Navigate to any webpage
2. Click the extension icon in your Chrome toolbar
3. The popup will display all storage data for the current page
4. Switch between tabs to view Cookies, LocalStorage, or SessionStorage
5. Use the search bar to filter specific keys or values
6. Click copy buttons to copy values to clipboard
7. Toggle the mask button to hide/show sensitive values
8. Toggle theme for your preferred viewing mode

## 🎯 Target Users

- **Backend Developers** - Debug API authentication flows
- **Frontend Developers** - Inspect client-side state management
- **QA Engineers** - Verify session handling and data persistence
- **Security Testers** - Audit cookie security flags and storage practices

## 🔐 Privacy & Security

- ✅ No data collection
- ✅ No external API calls
- ✅ No data transmission
- ✅ Local processing only
- ✅ Read-only access
- ✅ Open source

## 🛠️ Technical Details

### Permissions
- `activeTab` - Access current tab's URL
- `cookies` - Read cookie data
- `storage` - Save UI preferences (theme)
- `<all_urls>` - Access storage across all sites

### Tech Stack
- Manifest V3
- Vanilla JavaScript (ES6+)
- Chrome Extension APIs
- Web Storage API

## 📋 File Structure

```
cookie-and-storage-inspector/
├── manifest.json       # Extension configuration
├── popup.html          # Main UI structure
├── popup.css           # Styles with theme support
├── popup.js            # Main logic and rendering
├── content.js          # Content script for storage access
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## 🎨 Screenshots

The extension features:
- Modern, clean tabbed interface
- Color-coded badges for security flags
- Expandable JSON viewer
- Real-time search and filtering
- Responsive dark/light themes

## 🔮 Future Enhancements

- Environment comparison (dev vs prod)
- Storage snapshot & diff
- Export data to JSON
- Incognito mode support
- Live update detection

## 👨‍💻 Credits

Made with ❤️ by [Bhavesh Bishnoi](https://bhaveshbishnoi.com)

## 📄 License

MIT License - Feel free to use and modify!

---

**Note**: This extension is for debugging purposes only. Always handle sensitive data with care and follow your organization's security policies.
