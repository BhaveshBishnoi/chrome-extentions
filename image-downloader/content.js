// content.js - Scans the current page for all images

(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getImages') {
      collectImages().then(images => {
        sendResponse({ images: images });
      });
      return true; // Will respond asynchronously
    }
  });

  async function collectImages() {
    const imageMap = new Map(); // Use Map to avoid duplicates

    // 1. Collect <img> tag images
    const imgElements = document.querySelectorAll('img');
    for (const img of imgElements) {
      await processImageElement(img, imageMap);
    }

    // 2. Collect CSS background images
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      await processBackgroundImage(element, imageMap);
    }

    // 3. Collect images from picture/source elements
    const pictureElements = document.querySelectorAll('picture source, picture img');
    for (const img of pictureElements) {
      await processImageElement(img, imageMap);
    }

    // Convert Map to Array
    return Array.from(imageMap.values());
  }

  async function processImageElement(img, imageMap) {
    let src = img.src || img.currentSrc || img.dataset.src;
    
    if (!src || src === window.location.href) return;

    // Convert relative URLs to absolute
    try {
      src = new URL(src, window.location.href).href;
    } catch (e) {
      return;
    }

    // Skip if already processed
    if (imageMap.has(src)) return;

    // Get natural dimensions
    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;

    if (width === 0 || height === 0) return; // Skip broken images

    const imageData = {
      url: src,
      width: width,
      height: height,
      format: getImageFormat(src),
      isBase64: src.startsWith('data:'),
      alt: img.alt || '',
      size: width * height // Approximate size metric
    };

    imageMap.set(src, imageData);
  }

  async function processBackgroundImage(element, imageMap) {
    const style = window.getComputedStyle(element);
    const bgImage = style.backgroundImage;

    if (!bgImage || bgImage === 'none') return;

    // Extract URL from background-image
    const urlMatch = bgImage.match(/url\(['"]?([^'"()]+)['"]?\)/);
    if (!urlMatch) return;

    let src = urlMatch[1];

    // Convert relative URLs to absolute
    try {
      src = new URL(src, window.location.href).href;
    } catch (e) {
      return;
    }

    // Skip if already processed
    if (imageMap.has(src)) return;

    // For background images, we need to load them to get dimensions
    try {
      const dimensions = await getImageDimensions(src);
      
      const imageData = {
        url: src,
        width: dimensions.width,
        height: dimensions.height,
        format: getImageFormat(src),
        isBase64: src.startsWith('data:'),
        alt: '',
        size: dimensions.width * dimensions.height
      };

      imageMap.set(src, imageData);
    } catch (e) {
      // Skip images that fail to load
    }
  }

  function getImageDimensions(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  function getImageFormat(url) {
    if (url.startsWith('data:')) {
      const match = url.match(/data:image\/([^;]+)/);
      return match ? match[1].toUpperCase() : 'BASE64';
    }

    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    const formatMap = {
      'jpg': 'JPG',
      'jpeg': 'JPG',
      'png': 'PNG',
      'gif': 'GIF',
      'webp': 'WEBP',
      'svg': 'SVG',
      'bmp': 'BMP',
      'ico': 'ICO',
      'avif': 'AVIF'
    };

    return formatMap[extension] || 'UNKNOWN';
  }
})();
