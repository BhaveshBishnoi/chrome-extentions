# CSS Inspector & Live CSS Playground

> A powerful Chrome extension for real-time CSS inspection and experimentation directly in your browser.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎨 Overview

CSS Inspector & Live CSS Playground is a developer-focused Chrome extension that allows you to inspect, modify, and experiment with CSS styles directly on any webpage without opening Chrome DevTools. All changes are client-side only and reset on page reload.

## ✨ Features

### 🔍 **CSS Inspection**
- Hover over any element to preview its CSS properties
- Click to lock and select elements for detailed inspection
- View computed styles and applied styles (class-based, inline)
- Visualize box model (margin, padding, border) with color-coded overlays
- See font details (family, size, weight, line-height)
- Color preview with hex/RGB copy functionality

### ⚡ **Live CSS Editing**
- Edit CSS properties in real-time with instant visual feedback
- Use arrow keys to increment/decrement numeric values
- Toggle properties on/off with visual switches
- Add new CSS rules dynamically
- Reset changes on a per-element basis
- Full undo/redo support with keyboard shortcuts

### 🎯 **Element Selection**
- **Hover Mode**: Preview elements as you move your mouse
- **Click-to-Lock Mode**: Select and focus on specific elements
- **DOM Navigation**: Use arrow keys to traverse parent/child/sibling elements
- **Manual Selector Input**: Target elements by CSS selector

### 🎨 **Premium UI**
- Beautiful dark mode with glassmorphism effects
- Draggable, resizable inspector panel
- Tabbed interface: Styles, Box Model, Typography, Colors
- Smart property editors (color picker, sliders, dropdowns)
- Smooth animations and micro-interactions

### 🔧 **Developer Tools**
- Keyboard shortcuts for all major actions
- Undo/Redo with Ctrl+Z / Ctrl+Shift+Z
- Copy color values with one click
- Export modified CSS (coming soon)

## 📦 Installation

### From Source (Developer Mode)

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/css-inspector.git
   cd css-inspector
   ```

2. **Open Chrome and navigate to extensions**
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `css-inspector` directory
   - The extension icon should appear in your toolbar

### From Chrome Web Store
*Coming soon...*

## 🚀 Usage

### Getting Started

1. **Activate the Inspector**
   - Click the extension icon in your toolbar, OR
   - Use keyboard shortcut: `Ctrl+Shift+I` (Cmd+Shift+I on Mac)

2. **Inspect Elements**
   - Hover over any element to preview its styles
   - Click an element to lock selection and open the inspector panel

3. **Edit CSS**
   - Modify property values in the panel
   - Use arrow keys (↑/↓) to adjust numeric values
   - Changes apply instantly to the page

4. **Navigate the DOM**
   - Use arrow keys to move between elements:
     - `↑` Select parent element
     - `↓` Select first child element
     - `←` Select previous sibling
     - `→` Select next sibling

5. **Undo/Redo**
   - `Ctrl+Z` (Cmd+Z) to undo
   - `Ctrl+Shift+Z` (Cmd+Shift+Z) to redo

6. **Deactivate**
   - Press `Esc` to deselect current element
   - Click the extension icon again to fully deactivate

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Toggle Inspector |
| `Ctrl+Z` | Undo last change |
| `Ctrl+Shift+Z` | Redo undone change |
| `↑` | Select parent element |
| `↓` | Select first child |
| `←` | Select previous sibling |
| `→` | Select next sibling |
| `Esc` | Deselect element / Close inspector |
| `↑/↓` on numeric input | Increment/Decrement value by 1 |
| `Shift+↑/↓` on numeric input | Increment/Decrement value by 10 |

## 🎯 Use Cases

- **Frontend Development**: Quickly test CSS changes without switching to DevTools
- **UI/UX Design**: Experiment with colors, spacing, and typography
- **Learning CSS**: Understand how CSS properties affect visual appearance
- **Debugging**: Identify and fix layout issues rapidly
- **Prototyping**: Try different design variations on live websites

## 🔒 Privacy & Security

- **No Data Collection**: This extension does not collect, store, or transmit any user data
- **No External Requests**: All processing happens locally in your browser
- **No Analytics**: Zero tracking or analytics
- **Client-Side Only**: All CSS changes are temporary and only affect your local view
- **Open Source**: Full transparency - inspect the code yourself

## 🛠️ Technical Details

- **Manifest Version**: V3
- **Permissions**: 
  - `activeTab`: Access active page on user action
  - `storage`: Save user preferences (panel position, theme)
- **Technologies**: Vanilla JavaScript (ES6+), CSS3, Chrome Extension APIs
- **Browser Compatibility**: Chrome, Edge, and other Chromium-based browsers

## 📚 Architecture

```
css-inspector/
├── manifest.json           # Extension configuration
├── background.js          # Service worker
├── content/               # Content scripts
│   ├── inspector.js       # Main inspection engine
│   ├── editor.js          # CSS editing logic
│   ├── history.js         # Undo/redo system
│   ├── ui/
│   │   ├── panel.js       # Inspector panel UI
│   │   ├── highlighter.js # Element highlighting
│   │   └── editors.js     # Property editors
│   ├── utils/
│   │   ├── cssParser.js   # CSS parsing utilities
│   │   └── storage.js     # Storage management
│   └── styles/
│       ├── panel.css      # Panel styling
│       └── highlighter.css # Highlighter styling
├── popup/
│   ├── popup.html         # Extension popup
│   ├── popup.css          # Popup styling
│   └── popup.js           # Popup logic
└── icons/                 # Extension icons

```

## 🤝 Contributing

Contributions are welcome! This is an open-source project.

## 📝 License

MIT License - feel free to use this extension for any purpose.

## 🎯 Roadmap

### Phase 1 ✅
- Element hover & selection
- CSS property reading
- Live editing engine

### Phase 2 ✅
- UI/UX improvements
- Undo/Redo system

### Phase 3 (Coming Soon)
- Export modified CSS
- Before/after comparison
- Snapshot experiments
- Grid & flex visual guides
- Responsive testing overlay

### Future Scope
- Firefox support
- Team shareable experiments
- AI-based CSS suggestions

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

Built with ❤️ for the developer community.

---

**Enjoy inspecting and experimenting with CSS! 🎨**
