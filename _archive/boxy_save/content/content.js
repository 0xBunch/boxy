// BOXY Content Script
// Handles page content extraction, toasts, and selection tooltip

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__BOXY_CONTENT_LOADED__) return;
  window.__BOXY_CONTENT_LOADED__ = true;

  // Toast container
  let toastContainer = null;
  let selectionTooltip = null;

  /**
   * Initialize BOXY content script
   */
  function init() {
    createToastContainer();
    setupMessageListener();
    setupSelectionListener();
    console.log('[BOXY] Content script loaded');
  }

  /**
   * Create toast notification container
   */
  function createToastContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.className = 'boxy-toast-container';
    toastContainer.id = 'boxy-toast-container';
    document.body.appendChild(toastContainer);
  }

  /**
   * Show a toast notification
   */
  function showToast(options) {
    const { type = 'success', title, message, duration = 3000 } = options;

    const icons = {
      success: '✓',
      error: '✕',
      loading: '◌'
    };

    const toast = document.createElement('div');
    toast.className = `boxy-toast ${type}`;
    toast.innerHTML = `
      <span class="boxy-toast-icon">${icons[type]}</span>
      <div class="boxy-toast-content">
        <span class="boxy-toast-title">${title}</span>
        ${message ? `<span class="boxy-toast-message">${message}</span>` : ''}
      </div>
      <button class="boxy-toast-close">✕</button>
    `;

    // Close button
    toast.querySelector('.boxy-toast-close').addEventListener('click', () => {
      removeToast(toast);
    });

    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove (unless loading)
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  }

  /**
   * Remove a toast
   */
  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.remove('show');
    toast.classList.add('hide');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Update an existing toast
   */
  function updateToast(toast, options) {
    if (!toast) return;

    const { type, title, message } = options;

    if (type) {
      toast.className = `boxy-toast ${type} show`;
      const icons = { success: '✓', error: '✕', loading: '◌' };
      toast.querySelector('.boxy-toast-icon').textContent = icons[type];
    }

    if (title) {
      toast.querySelector('.boxy-toast-title').textContent = title;
    }

    if (message !== undefined) {
      const msgEl = toast.querySelector('.boxy-toast-message');
      if (msgEl) {
        msgEl.textContent = message;
      } else if (message) {
        const content = toast.querySelector('.boxy-toast-content');
        const newMsg = document.createElement('span');
        newMsg.className = 'boxy-toast-message';
        newMsg.textContent = message;
        content.appendChild(newMsg);
      }
    }
  }

  /**
   * Extract page content for saving
   */
  function extractPageContent() {
    const content = {
      url: window.location.href,
      title: document.title || '',
      description: '',
      selectedText: '',
      siteName: '',
      author: '',
      publishDate: '',
      imageUrl: ''
    };

    // Meta tags
    const metaTags = {
      'og:description': 'description',
      'description': 'description',
      'og:site_name': 'siteName',
      'author': 'author',
      'og:image': 'imageUrl',
      'twitter:image': 'imageUrl',
      'article:published_time': 'publishDate',
      'date': 'publishDate'
    };

    document.querySelectorAll('meta').forEach(meta => {
      const property = meta.getAttribute('property') || meta.getAttribute('name');
      const contentValue = meta.getAttribute('content');

      if (property && contentValue && metaTags[property]) {
        const key = metaTags[property];
        if (!content[key]) {
          content[key] = contentValue;
        }
      }
    });

    // Selected text
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      content.selectedText = selection.toString().trim();
    }

    // Try to extract main content for summary (simplified)
    const articleSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content'
    ];

    for (const selector of articleSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        content.mainText = el.innerText.substring(0, 2000);
        break;
      }
    }

    if (!content.mainText) {
      content.mainText = document.body.innerText.substring(0, 2000);
    }

    return content;
  }

  /**
   * Setup listener for messages from popup/background
   */
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'getPageContent':
          sendResponse(extractPageContent());
          break;

        case 'showToast':
          showToast(request.options);
          sendResponse({ success: true });
          break;

        case 'showSaveProgress':
          const loadingToast = showToast({
            type: 'loading',
            title: 'Saving to BOXY...',
            message: request.target || 'Flow'
          });
          sendResponse({ toastId: loadingToast ? 'created' : null });
          break;

        case 'showSaveSuccess':
          // Remove any loading toasts
          document.querySelectorAll('.boxy-toast.loading').forEach(removeToast);
          showToast({
            type: 'success',
            title: 'Saved to BOXY',
            message: request.message || 'Added to your Flow'
          });
          sendResponse({ success: true });
          break;

        case 'showSaveError':
          // Remove any loading toasts
          document.querySelectorAll('.boxy-toast.loading').forEach(removeToast);
          showToast({
            type: 'error',
            title: 'Save Failed',
            message: request.message || 'Something went wrong'
          });
          sendResponse({ success: true });
          break;

        case 'getSelectedText':
          const selection = window.getSelection();
          sendResponse({ text: selection ? selection.toString().trim() : '' });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }

      return true; // Keep channel open for async response
    });
  }

  /**
   * Setup selection listener for tooltip
   */
  function setupSelectionListener() {
    let hideTimeout = null;

    document.addEventListener('mouseup', (e) => {
      // Clear any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      // Hide tooltip if no selection or clicked inside tooltip
      if (!text || text.length < 10 || e.target.closest('.boxy-selection-tooltip')) {
        hideSelectionTooltip();
        return;
      }

      // Show tooltip near selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      showSelectionTooltip(
        rect.left + window.scrollX + rect.width / 2,
        rect.top + window.scrollY - 10,
        text
      );
    });

    // Hide on scroll or resize
    document.addEventListener('scroll', () => hideSelectionTooltip(), { passive: true });
    window.addEventListener('resize', () => hideSelectionTooltip(), { passive: true });

    // Hide on click outside
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.boxy-selection-tooltip')) {
        hideSelectionTooltip();
      }
    });
  }

  /**
   * Show selection tooltip
   */
  function showSelectionTooltip(x, y, text) {
    // Remove existing
    hideSelectionTooltip();

    selectionTooltip = document.createElement('div');
    selectionTooltip.className = 'boxy-selection-tooltip';
    selectionTooltip.innerHTML = `
      <button class="boxy-tooltip-btn primary" data-action="spark">
        ⚡ Save Spark
      </button>
    `;

    // Position
    selectionTooltip.style.left = `${x}px`;
    selectionTooltip.style.top = `${y}px`;
    selectionTooltip.style.transform = 'translate(-50%, -100%)';

    // Event handlers
    selectionTooltip.querySelector('[data-action="spark"]').addEventListener('click', () => {
      saveSpark(text);
      hideSelectionTooltip();
    });

    document.body.appendChild(selectionTooltip);

    // Animate in
    requestAnimationFrame(() => {
      selectionTooltip.classList.add('show');
    });
  }

  /**
   * Hide selection tooltip
   */
  function hideSelectionTooltip() {
    if (selectionTooltip) {
      selectionTooltip.classList.remove('show');
      setTimeout(() => {
        if (selectionTooltip && selectionTooltip.parentNode) {
          selectionTooltip.parentNode.removeChild(selectionTooltip);
        }
        selectionTooltip = null;
      }, 200);
    }
  }

  /**
   * Save selected text as a Spark
   */
  function saveSpark(text) {
    const pageContent = extractPageContent();

    showToast({
      type: 'loading',
      title: 'Saving Spark...'
    });

    chrome.runtime.sendMessage({
      action: 'saveSpark',
      data: {
        highlight: text,
        url: pageContent.url,
        title: pageContent.title,
        siteName: pageContent.siteName
      }
    }, (response) => {
      // Remove loading toast
      document.querySelectorAll('.boxy-toast.loading').forEach(removeToast);

      if (response && response.success) {
        showToast({
          type: 'success',
          title: 'Spark Saved',
          message: 'Highlight captured'
        });
      } else {
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: response?.error || 'Could not save spark'
        });
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
