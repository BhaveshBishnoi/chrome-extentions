let darkEnabled = false;

// Get the current domain
const getDomain = () => {
  return window.location.hostname;
};

// Apply dark mode
const applyDarkMode = (enabled) => {
  darkEnabled = enabled;
  document.documentElement.classList.toggle("force-dark", darkEnabled);
};

// Load saved state on page load
const loadDarkModeState = () => {
  const domain = getDomain();
  chrome.storage.local.get([domain], (result) => {
    if (result[domain] === true) {
      applyDarkMode(true);
    }
  });
};

// Save state when toggling
const saveDarkModeState = (enabled) => {
  const domain = getDomain();
  chrome.storage.local.set({ [domain]: enabled });
};

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle-dark") {
    darkEnabled = !darkEnabled;
    applyDarkMode(darkEnabled);
    saveDarkModeState(darkEnabled);
  }
});

// Load state when page loads
loadDarkModeState();

const style = document.createElement("style");
style.innerHTML = `
.force-dark {
  background: #121212 !important;
  color: #e0e0e0 !important;
}

.force-dark * {
  background-color: transparent !important;
  color: inherit !important;
  border-color: #333 !important;
}

.force-dark img, .force-dark video {
  filter: brightness(0.8) contrast(1.2);
}

.force-dark a {
  color: #8ab4f8 !important;
}

.force-dark input, .force-dark textarea, .force-dark select {
  background-color: #2d2d2d !important;
  color: #e0e0e0 !important;
  border-color: #555 !important;
}

.force-dark button {
  background-color: #3d3d3d !important;
  color: #e0e0e0 !important;
  border-color: #555 !important;
}
`;
document.head.appendChild(style);
