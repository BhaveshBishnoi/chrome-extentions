# Form Validation Tester - Chrome Extension

A powerful Chrome extension designed for QA engineers and developers to inspect, test, and debug form validations on any webpage.

## Features

### 🔍 Form Field Detection
- Detects all `<form>` elements on the page
- Lists all input, textarea, and select fields
- Identifies disabled and hidden fields

### ✅ Validation Rule Inspection
- Required field detection
- Min/Max length constraints
- Pattern/Regex rules
- Input type constraints (email, number, url, tel)
- Custom validation attributes
- HTML5 validation messages

### 🧪 Validation Testing
- Highlight fields failing validation
- Trigger validation without form submission
- Show validation error messages with tooltips
- Auto-focus first invalid field
- Test boundary values for numeric inputs

### 🎨 Visual Highlighting
- Color-coded borders for invalid fields (red pulse animation)
- Warning highlights for accessibility issues (orange)
- Interactive tooltips explaining validation issues
- Clean, non-intrusive overlay system

### 🛠️ QA & Debugging Tools
- **Copy validation rules** per field to clipboard
- **Export validation reports** in JSON or CSV format
- **Field search** by name or ID
- **Accessibility validation** hints (ARIA, missing labels)
- **Duplicate field name** detection
- **Missing label** detection

### 💎 Modern UI/UX
- Expandable form and field view
- Dark/Light mode toggle with persistence
- Clean, professional sidebar design (600x700px)
- Smooth animations and transitions
- Search/filter functionality

## Installation

1. **Download the extension files** to a local directory
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"**
5. **Select the extension directory** containing `manifest.json`

## Usage

### Basic Workflow

1. **Navigate** to any webpage containing forms
2. **Click** the Form Validation Tester icon in Chrome toolbar
3. **Click "Scan Forms"** to detect all forms and fields
4. **View** validation rules and field details in expandable cards
5. **Click "Test Validation"** to trigger validation and highlight issues
6. **Use search** to filter fields by name or ID
7. **Export** validation reports as needed

### Features in Detail

#### Scan Forms
- Detects all forms on the current page
- Extracts validation rules from HTML attributes
- Identifies accessibility issues
- Shows form metadata (name, ID, action, method)

#### Test Validation
- Triggers HTML5 validation on all fields
- Highlights invalid fields with red pulsing borders
- Shows validation messages in tooltips
- Scrolls to first invalid field
- Tests boundary values for numeric fields
- Checks for duplicate field names
- Verifies label accessibility

#### Export Reports
- **JSON**: Complete structured data with all validation details
- **CSV**: Tabular format for spreadsheet analysis

### Visual Indicators

- 🔴 **Red pulsing border**: Invalid field with validation error
- 🟠 **Orange border**: Warning (missing label, duplicate name)
- 🟢 **Green border**: Valid field (when applicable)

## Permissions

- **activeTab**: Required to inspect forms on the current page
- **storage**: Saves theme preference (dark/light mode)

## Privacy & Security

✅ **No data collection** - All processing happens locally  
✅ **No user input stored** - Only validation rules are examined  
✅ **Client-side only** - No external requests or servers  
✅ **Runs on active tab only** - Requires explicit user action

## Testing

A test page (`test.html`) is included with the extension containing:

1. **Registration Form**: Complex form with various validation types
   - Username (required, pattern, min/max length)
   - Email (required, email type)
   - Password fields (required, min length)
   - Age (required, min/max values)
   - Phone (pattern validation)
   - Website (URL validation)
   - Bio (textarea with length constraints)
   - Country (select dropdown)

2. **Contact Form**: Demonstrates common issues
   - Missing labels
   - Duplicate field names
   - Range inputs

3. **Newsletter Form**: Simple subscription form

To test:
1. Load the extension in Chrome
2. Open `test.html` in browser
3. Click the extension icon
4. Try "Scan Forms" and "Test Validation"

## Technical Stack

- **Manifest V3** (latest Chrome extension standard)
- **Vanilla JavaScript** (ES6+)
- **HTML5 Constraint Validation API**
- **CSS3** with custom properties for theming
- **SVG icons** for visual clarity

## File Structure

```
form-validation-tester/
├── manifest.json          # Extension configuration
├── popup.html            # Extension UI
├── popup.css             # Styles with dark/light themes
├── popup.js              # UI logic and communication
├── content.js            # Form inspection engine
├── test.html             # Test page with sample forms
├── icons/
│   ├── icon16.png        # Toolbar icon (16x16)
│   ├── icon48.png        # Extension manager (48x48)
│   └── icon128.png       # Chrome Web Store (128x128)
└── README.md             # Documentation
```

## Browser Compatibility

✅ Chrome (Manifest V3)  
✅ Edge (Chromium-based)  
⚠️ Other browsers may require manifest adjustments

## Future Enhancements

- Server-side validation hints
- Playwright/Cypress selector export
- Auto-generate test cases
- Custom validation rule definitions
- Form comparison (staging vs production)
- Performance metrics

## Target Users

- QA Engineers
- Frontend Developers
- Test Automation Engineers
- Web Accessibility Specialists

## License

MIT License - Free for personal and commercial use

## Support

For issues or feature requests, please check:
- Test the extension with the included `test.html`
- Verify you're using Chrome with Manifest V3 support
- Check browser console for any errors

---

**Built with ❤️ for QA and developers who care about form validation**
