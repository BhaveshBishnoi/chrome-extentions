// Popup logic

document.addEventListener('DOMContentLoaded', async () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check current inspector state
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getInspectorState' });
        updateUI(response.active);
    } catch (error) {
        // Content script not loaded yet
        updateUI(false);
    }

    // Toggle inspector on button click
    toggleBtn.addEventListener('click', async () => {
        try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggleInspector' });
            updateUI(response.active);

            // Close popup after toggling (optional)
            // window.close();
        } catch (error) {
            console.error('Error toggling inspector:', error);
            // Content script might not be loaded, show error
            alert('Please refresh the page to use CSS Inspector on this tab.');
        }
    });

    /**
     * Update UI based on inspector state
     */
    function updateUI(isActive) {
        if (isActive) {
            statusDot.classList.remove('inactive');
            statusDot.classList.add('active');
            statusText.classList.add('active');
            statusText.textContent = 'Active';
            toggleBtn.classList.add('active');
            toggleBtn.querySelector('span').textContent = 'Stop Inspector';
        } else {
            statusDot.classList.remove('active');
            statusDot.classList.add('inactive');
            statusText.classList.remove('active');
            statusText.textContent = 'Inactive';
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('span').textContent = 'Start Inspector';
        }
    }
});
