// CSS Parser Utilities

const CSSParser = {
    /**
     * Convert RGB color to Hex
     */
    rgbToHex(rgb) {
        const match = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (match && match.length === 4) ? "#" +
            ("0" + parseInt(match[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(match[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(match[3], 10).toString(16)).slice(-2) : rgb;
    },

    /**
     * Convert Hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    /**
     * Extract numeric value and unit from CSS value
     */
    parseValue(value) {
        const match = value.match(/^([-]?\d*\.?\d+)(.*)$/);
        if (match) {
            return {
                number: parseFloat(match[1]),
                unit: match[2] || ''
            };
        }
        return { number: 0, unit: '' };
    },

    /**
     * Format CSS property name for display
     */
    formatPropertyName(name) {
        return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    },

    /**
     * Get shorthand property name if applicable
     */
    getShorthand(property) {
        const shorthands = {
            'margin-top': 'margin',
            'margin-right': 'margin',
            'margin-bottom': 'margin',
            'margin-left': 'margin',
            'padding-top': 'padding',
            'padding-right': 'padding',
            'padding-bottom': 'padding',
            'padding-left': 'padding',
            'border-top-width': 'border',
            'border-right-width': 'border',
            'border-bottom-width': 'border',
            'border-left-width': 'border'
        };
        return shorthands[property] || null;
    },

    /**
     * Validate CSS property value
     */
    isValidValue(property, value) {
        if (!value || value === 'initial' || value === 'inherit' || value === 'unset') {
            return true;
        }

        // Create a temporary element to test the value
        const tempEl = document.createElement('div');
        tempEl.style[property] = value;
        return tempEl.style[property] !== '';
    },

    /**
     * Get all computed styles for an element
     */
    getComputedStyles(element) {
        return window.getComputedStyle(element);
    },

    /**
     * Get box model values
     */
    getBoxModel(element) {
        const computed = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return {
            width: rect.width,
            height: rect.height,
            margin: {
                top: parseFloat(computed.marginTop),
                right: parseFloat(computed.marginRight),
                bottom: parseFloat(computed.marginBottom),
                left: parseFloat(computed.marginLeft)
            },
            padding: {
                top: parseFloat(computed.paddingTop),
                right: parseFloat(computed.paddingRight),
                bottom: parseFloat(computed.paddingBottom),
                left: parseFloat(computed.paddingLeft)
            },
            border: {
                top: parseFloat(computed.borderTopWidth),
                right: parseFloat(computed.borderRightWidth),
                bottom: parseFloat(computed.borderBottomWidth),
                left: parseFloat(computed.borderLeftWidth)
            }
        };
    },

    /**
     * Get important CSS properties for an element
     */
    getImportantProperties(element) {
        const computed = window.getComputedStyle(element);

        return {
            display: computed.display,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            textAlign: computed.textAlign,
            margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
            padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
            border: computed.border,
            borderRadius: computed.borderRadius,
            opacity: computed.opacity,
            zIndex: computed.zIndex
        };
    }
};
