// Form Validation Tester - Content Script
// Handles form detection, validation rule extraction, and visual highlighting

let currentFormsData = [];
let highlightedElements = new Set();

// Main message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanForms') {
        const forms = scanForms();
        currentFormsData = forms;
        sendResponse({ forms });
    } else if (request.action === 'testValidation') {
        const forms = testValidation();
        currentFormsData = forms;
        sendResponse({ forms });
    } else if (request.action === 'clearHighlights') {
        clearHighlights();
        sendResponse({ success: true });
    } else if (request.action === 'getFormsData') {
        sendResponse({ forms: currentFormsData });
    }

    return true; // Keep channel open for async response
});

// Scan all forms on the page
function scanForms() {
    const forms = Array.from(document.querySelectorAll('form'));
    const formsData = [];

    forms.forEach((form, index) => {
        const formData = {
            index,
            id: form.id || null,
            name: form.name || null,
            action: form.action || null,
            method: form.method || null,
            fields: []
        };

        // Get all form fields
        const fields = form.querySelectorAll('input, textarea, select');
        const fieldNames = new Map();

        // First pass: count field names to detect duplicates
        fields.forEach(field => {
            const name = field.name || field.id;
            if (name) {
                fieldNames.set(name, (fieldNames.get(name) || 0) + 1);
            }
        });

        fields.forEach(field => {
            const fieldData = extractFieldData(field, fieldNames);
            formData.fields.push(fieldData);
        });

        formsData.push(formData);
    });

    return formsData;
}

// Extract field validation data
function extractFieldData(field, fieldNames) {
    const name = field.name || field.id || '';
    const id = field.id || '';
    const type = field.type || field.tagName.toLowerCase();

    const fieldData = {
        name,
        id,
        type,
        required: field.required || field.hasAttribute('required'),
        disabled: field.disabled,
        readonly: field.readOnly,
        placeholder: field.placeholder || null,

        // Length constraints
        minLength: field.minLength > 0 ? field.minLength : null,
        maxLength: field.maxLength > 0 ? field.maxLength : null,

        // Value constraints (for number, range, date inputs)
        min: field.min || null,
        max: field.max || null,
        step: field.step || null,

        // Pattern
        pattern: field.pattern || null,

        // Current validation state
        validationMessage: null,
        validity: null,

        // Accessibility and quality checks
        label: getFieldLabel(field),
        missingLabel: !getFieldLabel(field),
        missingAriaLabel: !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby'),
        duplicateName: fieldNames.get(name) > 1,

        // Custom validation attributes
        customValidation: extractCustomValidation(field)
    };

    return fieldData;
}

// Get field label
function getFieldLabel(field) {
    // Check for associated label element
    if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) return label.textContent.trim();
    }

    // Check for parent label
    const parentLabel = field.closest('label');
    if (parentLabel) {
        return parentLabel.textContent.trim();
    }

    // Check for aria-label
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check for aria-labelledby
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
        const labelElement = document.getElementById(labelledBy);
        if (labelElement) return labelElement.textContent.trim();
    }

    return null;
}

// Extract custom validation attributes
function extractCustomValidation(field) {
    const custom = {};

    // Data attributes that might indicate validation
    Array.from(field.attributes).forEach(attr => {
        if (attr.name.startsWith('data-validate') ||
            attr.name.startsWith('data-rule') ||
            attr.name.startsWith('data-validation')) {
            custom[attr.name] = attr.value;
        }
    });

    return Object.keys(custom).length > 0 ? custom : null;
}

// Test validation on all forms
function testValidation() {
    clearHighlights();

    const forms = scanForms();

    forms.forEach(formData => {
        const form = document.querySelectorAll('form')[formData.index];
        const fields = form.querySelectorAll('input, textarea, select');

        formData.fields.forEach((fieldData, index) => {
            const field = fields[index];

            // Trigger validation
            if (field && !field.disabled) {
                // Check HTML5 validity
                const isValid = field.checkValidity();

                if (!isValid) {
                    fieldData.validationMessage = field.validationMessage;
                    fieldData.validity = {
                        valueMissing: field.validity.valueMissing,
                        typeMismatch: field.validity.typeMismatch,
                        patternMismatch: field.validity.patternMismatch,
                        tooLong: field.validity.tooLong,
                        tooShort: field.validity.tooShort,
                        rangeUnderflow: field.validity.rangeUnderflow,
                        rangeOverflow: field.validity.rangeOverflow,
                        stepMismatch: field.validity.stepMismatch,
                        badInput: field.validity.badInput
                    };

                    // Highlight invalid field
                    highlightField(field, 'invalid', field.validationMessage);
                } else {
                    // Test boundary values for numeric fields
                    if (field.type === 'number' || field.type === 'range') {
                        testBoundaryValues(field, fieldData);
                    }
                }

                // Check for accessibility issues
                if (fieldData.missingLabel) {
                    highlightField(field, 'warning', 'Missing label for accessibility');
                }

                if (fieldData.duplicateName) {
                    highlightField(field, 'warning', 'Duplicate field name detected');
                }
            }
        });
    });

    // Focus first invalid field
    const firstInvalid = document.querySelector('.fvt-highlight-invalid');
    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return forms;
}

// Test boundary values
function testBoundaryValues(field, fieldData) {
    const min = parseFloat(field.min);
    const max = parseFloat(field.max);

    if (!isNaN(min) && fieldData.validationMessage === null) {
        fieldData.boundaryTests = {
            minValue: min,
            minTested: true
        };
    }

    if (!isNaN(max) && fieldData.validationMessage === null) {
        fieldData.boundaryTests = {
            ...fieldData.boundaryTests,
            maxValue: max,
            maxTested: true
        };
    }
}

// Highlight field visually
function highlightField(field, type, message) {
    // Add highlight class
    field.classList.add(`fvt-highlight-${type}`);
    highlightedElements.add(field);

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = `fvt-tooltip fvt-tooltip-${type}`;
    tooltip.textContent = message;
    tooltip.style.cssText = `
    position: absolute;
    background: ${type === 'invalid' ? '#ef4444' : '#f59e0b'};
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10000;
    pointer-events: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    max-width: 200px;
    word-wrap: break-word;
    display: none;
  `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const showTooltip = () => {
        const rect = field.getBoundingClientRect();
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.display = 'block';
    };

    const hideTooltip = () => {
        tooltip.style.display = 'none';
    };

    field.addEventListener('mouseenter', showTooltip);
    field.addEventListener('mouseleave', hideTooltip);
    field.addEventListener('focus', showTooltip);
    field.addEventListener('blur', hideTooltip);

    // Store tooltip reference for cleanup
    field._fvtTooltip = tooltip;
}

// Clear all highlights
function clearHighlights() {
    highlightedElements.forEach(field => {
        field.classList.remove('fvt-highlight-invalid', 'fvt-highlight-warning', 'fvt-highlight-valid');

        // Remove tooltip
        if (field._fvtTooltip) {
            field._fvtTooltip.remove();
            delete field._fvtTooltip;
        }
    });

    highlightedElements.clear();

    // Remove any orphaned tooltips
    document.querySelectorAll('.fvt-tooltip').forEach(tooltip => tooltip.remove());
}

// Inject highlight styles
function injectStyles() {
    if (document.getElementById('fvt-styles')) return;

    const style = document.createElement('style');
    style.id = 'fvt-styles';
    style.textContent = `
    .fvt-highlight-invalid {
      outline: 3px solid #ef4444 !important;
      outline-offset: 2px !important;
      animation: fvt-pulse 2s infinite !important;
    }
    
    .fvt-highlight-warning {
      outline: 3px solid #f59e0b !important;
      outline-offset: 2px !important;
    }
    
    .fvt-highlight-valid {
      outline: 3px solid #10b981 !important;
      outline-offset: 2px !important;
    }
    
    @keyframes fvt-pulse {
      0%, 100% {
        outline-color: #ef4444;
      }
      50% {
        outline-color: #dc2626;
      }
    }
    
    .fvt-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 10px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid currentColor;
    }
  `;

    document.head.appendChild(style);
}

// Initialize on load
injectStyles();
