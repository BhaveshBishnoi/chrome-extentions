// Property editor UI components

class PropertyEditors {
    /**
     * Create a color picker
     */
    static createColorPicker(property, value, onchange) {
        const container = document.createElement('div');
        container.className = 'css-editor-color-picker';

        // Color preview
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = value;

        // Color input
        const input = document.createElement('input');
        input.type = 'color';
        input.value = CSSParser.rgbToHex(value);
        input.addEventListener('change', (e) => {
            const newValue = e.target.value;
            preview.style.backgroundColor = newValue;
            onchange(newValue);
        });

        // Text input for manual entry
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'color-text-input';
        textInput.value = value;
        textInput.addEventListener('change', (e) => {
            const newValue = e.target.value;
            preview.style.backgroundColor = newValue;
            try {
                input.value = CSSParser.rgbToHex(newValue);
            } catch (err) {
                // Invalid color
            }
            onchange(newValue);
        });

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy color value';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textInput.value);
            copyBtn.innerHTML = '✓';
            setTimeout(() => copyBtn.innerHTML = '📋', 1000);
        });

        container.appendChild(preview);
        container.appendChild(input);
        container.appendChild(textInput);
        container.appendChild(copyBtn);

        return container;
    }

    /**
     * Create a numeric slider
     */
    static createNumericSlider(property, value, onchange) {
        const container = document.createElement('div');
        container.className = 'css-editor-slider';

        const parsed = CSSParser.parseValue(value);

        // Determine range based on property
        let min = 0, max = 100, step = 1;

        if (property.includes('opacity') || property.includes('alpha')) {
            min = 0; max = 1; step = 0.01;
        } else if (property.includes('font-size')) {
            min = 8; max = 72; step = 1;
        } else if (property.includes('width') || property.includes('height')) {
            min = 0; max = 1000; step = 1;
        }

        // Slider input
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = parsed.number;

        // Value display
        const valueDisplay = document.createElement('input');
        valueDisplay.type = 'text';
        valueDisplay.className = 'slider-value';
        valueDisplay.value = value;

        // Update handlers
        slider.addEventListener('input', (e) => {
            const newValue = e.target.value + parsed.unit;
            valueDisplay.value = newValue;
            onchange(newValue);
        });

        valueDisplay.addEventListener('change', (e) => {
            const newParsed = CSSParser.parseValue(e.target.value);
            slider.value = newParsed.number;
            onchange(e.target.value);
        });

        // Arrow key handlers for fine control
        valueDisplay.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const delta = e.shiftKey ? 10 : 1;
                const newValue = (parseFloat(slider.value) + delta) + parsed.unit;
                slider.value = parseFloat(slider.value) + delta;
                valueDisplay.value = newValue;
                onchange(newValue);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const delta = e.shiftKey ? 10 : 1;
                const newValue = (parseFloat(slider.value) - delta) + parsed.unit;
                slider.value = parseFloat(slider.value) - delta;
                valueDisplay.value = newValue;
                onchange(newValue);
            }
        });

        container.appendChild(slider);
        container.appendChild(valueDisplay);

        return container;
    }

    /**
     * Create a text input
     */
    static createTextInput(property, value, onchange) {
        const container = document.createElement('div');
        container.className = 'css-editor-text';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.placeholder = `Enter ${property}`;

        input.addEventListener('change', (e) => {
            onchange(e.target.value);
        });

        // Arrow keys for numeric values
        input.addEventListener('keydown', (e) => {
            const parsed = CSSParser.parseValue(input.value);

            if (!isNaN(parsed.number)) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const delta = e.shiftKey ? 10 : 1;
                    const newValue = (parsed.number + delta) + parsed.unit;
                    input.value = newValue;
                    onchange(newValue);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const delta = e.shiftKey ? 10 : 1;
                    const newValue = (parsed.number - delta) + parsed.unit;
                    input.value = newValue;
                    onchange(newValue);
                }
            }
        });

        container.appendChild(input);

        return container;
    }

    /**
     * Create a toggle switch
     */
    static createToggle(property, isOn, onchange) {
        const container = document.createElement('div');
        container.className = 'css-editor-toggle';

        const toggle = document.createElement('label');
        toggle.className = 'toggle-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isOn;

        const slider = document.createElement('span');
        slider.className = 'toggle-slider';

        checkbox.addEventListener('change', (e) => {
            onchange(e.target.checked);
        });

        toggle.appendChild(checkbox);
        toggle.appendChild(slider);
        container.appendChild(toggle);

        return container;
    }

    /**
     * Create a dropdown selector
     */
    static createDropdown(property, value, options, onchange) {
        const container = document.createElement('div');
        container.className = 'css-editor-dropdown';

        const select = document.createElement('select');

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (option === value) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            onchange(e.target.value);
        });

        container.appendChild(select);

        return container;
    }

    /**
     * Get common values for a property
     */
    static getCommonValues(property) {
        const commonValues = {
            'display': ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
            'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
            'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
            'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
            'align-items': ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
            'text-align': ['left', 'center', 'right', 'justify'],
            'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
            'text-transform': ['none', 'capitalize', 'uppercase', 'lowercase'],
            'overflow': ['visible', 'hidden', 'scroll', 'auto'],
            'cursor': ['auto', 'pointer', 'grab', 'text', 'move', 'not-allowed']
        };

        return commonValues[property] || null;
    }

    /**
     * Create appropriate editor for a property
     */
    static createEditor(element, property, value, onchange) {
        // Check if property has common values
        const commonValues = this.getCommonValues(property);
        if (commonValues) {
            return this.createDropdown(property, value, commonValues, onchange);
        }

        // Color properties
        if (property.includes('color') || property === 'background' || property === 'border-color') {
            return this.createColorPicker(property, value, onchange);
        }

        // Numeric properties with slider
        const parsed = CSSParser.parseValue(value);
        if (!isNaN(parsed.number) && (property.includes('size') || property.includes('width') ||
            property.includes('height') || property.includes('opacity'))) {
            return this.createNumericSlider(property, value, onchange);
        }

        // Default to text input
        return this.createTextInput(property, value, onchange);
    }
}
