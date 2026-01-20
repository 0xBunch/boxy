// BOXY Content Script
// Handles page metadata extraction, text selection, and modal injection

(function() {
  // Prevent multiple injections
  if (window.__boxyLoaded) return;
  window.__boxyLoaded = true;

  let modalIframe = null;

  // ============================================
  // METADATA EXTRACTION
  // ============================================

  function getPageMetadata() {
    const getMeta = (name) => {
      const el = document.querySelector(
        `meta[property="${name}"], meta[name="${name}"]`
      );
      return el?.content || '';
    };

    // Try various sources for title
    const title =
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      document.title ||
      '';

    // Try various sources for description
    const description =
      getMeta('og:description') ||
      getMeta('twitter:description') ||
      getMeta('description') ||
      '';

    // Get favicon
    const faviconEl = document.querySelector('link[rel*="icon"]');
    const favicon = faviconEl?.href || '';

    return {
      title: title.trim(),
      description: description.trim(),
      url: window.location.href,
      favicon
    };
  }

  function getSelectedText() {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  }

  // ============================================
  // MODAL MANAGEMENT
  // ============================================

  function createModal(mode, initialData = {}) {
    // Remove existing modal if present
    removeModal();

    // Create iframe for modal
    modalIframe = document.createElement('iframe');
    modalIframe.id = 'boxy-modal-frame';
    modalIframe.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      border: none;
      z-index: 2147483647;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
      background: #1a1a2e;
    `;

    // Get page metadata
    const metadata = getPageMetadata();
    const selectedText = getSelectedText();

    // Build initial data for modal
    const data = {
      mode,
      metadata,
      selectedText,
      ...initialData
    };

    // Create modal HTML content
    const modalHTML = generateModalHTML(data);

    document.body.appendChild(modalIframe);

    // Write content to iframe
    const iframeDoc = modalIframe.contentDocument || modalIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(modalHTML);
    iframeDoc.close();

    // Handle messages from iframe
    window.addEventListener('message', handleIframeMessage);

    // Handle escape key
    document.addEventListener('keydown', handleEscapeKey);
  }

  function removeModal() {
    if (modalIframe) {
      modalIframe.remove();
      modalIframe = null;
    }
    window.removeEventListener('message', handleIframeMessage);
    document.removeEventListener('keydown', handleEscapeKey);
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      removeModal();
    }
  }

  function handleIframeMessage(event) {
    const { action, data } = event.data || {};

    if (action === 'close') {
      removeModal();
    }

    if (action === 'saveToFlow') {
      chrome.runtime.sendMessage({ action: 'saveToFlow', data }, (response) => {
        if (modalIframe) {
          modalIframe.contentWindow.postMessage({
            action: 'saveResult',
            ...response
          }, '*');
        }
        if (response.success) {
          showToast('Captured.');
          setTimeout(removeModal, 800);
        }
      });
    }

    if (action === 'saveSpark') {
      chrome.runtime.sendMessage({ action: 'saveSpark', data }, (response) => {
        if (modalIframe) {
          modalIframe.contentWindow.postMessage({
            action: 'saveResult',
            ...response
          }, '*');
        }
        if (response.success) {
          showToast('Spark captured.');
          setTimeout(removeModal, 800);
        }
      });
    }
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  function showToast(message, isError = false) {
    // Remove existing toast
    const existing = document.getElementById('boxy-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'boxy-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: ${isError ? '#dc2626' : '#1a1a2e'};
      color: white;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 2147483647;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: boxySlideIn 0.3s ease;
    `;

    // Add animation keyframes
    if (!document.getElementById('boxy-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'boxy-toast-styles';
      style.textContent = `
        @keyframes boxySlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Remove after delay
    setTimeout(() => {
      toast.style.animation = 'boxySlideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ============================================
  // MODAL HTML GENERATOR
  // ============================================

  function generateModalHTML(data) {
    const { mode, metadata, selectedText } = data;
    const sparkText = data.data?.text || selectedText || '';
    const sourceUrl = data.data?.sourceUrl || metadata.url;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #e5e5e5;
      padding: 24px;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      padding: 4px;
    }

    .close-btn:hover {
      color: #fff;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }

    .tab {
      flex: 1;
      padding: 10px 16px;
      background: transparent;
      border: 1px solid #333;
      color: #888;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .tab:hover {
      border-color: #555;
      color: #ccc;
    }

    .tab.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #fff;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #888;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input[type="text"],
    textarea,
    select {
      width: 100%;
      padding: 12px;
      background: #16162a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-family: inherit;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #2563eb;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .url-display {
      font-size: 12px;
      color: #666;
      word-break: break-all;
      padding: 8px 0;
    }

    .energy-picker {
      display: flex;
      gap: 8px;
    }

    .energy-btn {
      flex: 1;
      padding: 10px;
      background: #16162a;
      border: 1px solid #333;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .energy-btn:hover {
      border-color: #555;
    }

    .energy-btn.hot { color: #ef4444; }
    .energy-btn.warm { color: #f59e0b; }
    .energy-btn.cool { color: #3b82f6; }

    .energy-btn.selected {
      border-width: 2px;
    }
    .energy-btn.hot.selected { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .energy-btn.warm.selected { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .energy-btn.cool.selected { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: #2563eb;
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 24px;
      transition: background 0.15s ease;
    }

    .submit-btn:hover {
      background: #1d4ed8;
    }

    .submit-btn:disabled {
      background: #333;
      cursor: not-allowed;
    }

    .error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .panel {
      display: none;
    }

    .panel.active {
      display: block;
    }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">BOXY</div>
    <button class="close-btn" onclick="closeModal()">&times;</button>
  </div>

  <div class="tabs">
    <button class="tab ${mode === 'flow' ? 'active' : ''}" onclick="switchTab('flow')">Flow</button>
    <button class="tab ${mode === 'spark' ? 'active' : ''}" onclick="switchTab('spark')">Spark</button>
  </div>

  <!-- Flow Panel -->
  <div id="flow-panel" class="panel ${mode === 'flow' ? 'active' : ''}">
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="flow-title" value="${escapeHtml(metadata.title)}" />
    </div>

    <div class="form-group">
      <label>URL</label>
      <div class="url-display">${escapeHtml(metadata.url)}</div>
    </div>

    <div class="form-group">
      <label>My Take (required)</label>
      <textarea id="flow-take" placeholder="What made you save this?"></textarea>
      <div id="flow-take-error" class="error" style="display: none;">My Take is required</div>
    </div>

    <div class="form-group">
      <label>Energy</label>
      <div class="energy-picker">
        <button class="energy-btn hot" data-energy="hot" onclick="selectEnergy('flow', 'hot')">hot</button>
        <button class="energy-btn warm selected" data-energy="warm" onclick="selectEnergy('flow', 'warm')">warm</button>
        <button class="energy-btn cool" data-energy="cool" onclick="selectEnergy('flow', 'cool')">cool</button>
      </div>
    </div>

    <div class="form-group">
      <label>Type</label>
      <select id="flow-classification">
        <option value="article">article</option>
        <option value="video">video</option>
        <option value="podcast">podcast</option>
        <option value="thread">thread</option>
        <option value="tool">tool</option>
        <option value="newsletter">newsletter</option>
        <option value="book">book</option>
        <option value="note">note</option>
        <option value="other">other</option>
      </select>
    </div>

    <button class="submit-btn" onclick="saveFlow()">Save to Flow</button>
  </div>

  <!-- Spark Panel -->
  <div id="spark-panel" class="panel ${mode === 'spark' ? 'active' : ''}">
    <div class="form-group">
      <label>Spark</label>
      <textarea id="spark-text" placeholder="Your thought, quote, or observation...">${escapeHtml(sparkText)}</textarea>
      <div id="spark-text-error" class="error" style="display: none;">Spark text is required</div>
    </div>

    <div class="form-group">
      <label>Type</label>
      <select id="spark-type">
        <option value="quote" ${sparkText ? 'selected' : ''}>quote</option>
        <option value="thought" ${!sparkText ? 'selected' : ''}>thought</option>
        <option value="observation">observation</option>
        <option value="question">question</option>
        <option value="hot-take">hot-take</option>
        <option value="connection">connection</option>
      </select>
    </div>

    <div class="form-group">
      <label>Energy</label>
      <div class="energy-picker" id="spark-energy-picker">
        <button class="energy-btn hot" data-energy="hot" onclick="selectEnergy('spark', 'hot')">hot</button>
        <button class="energy-btn warm selected" data-energy="warm" onclick="selectEnergy('spark', 'warm')">warm</button>
        <button class="energy-btn cool" data-energy="cool" onclick="selectEnergy('spark', 'cool')">cool</button>
      </div>
    </div>

    <div class="form-group">
      <label>Source</label>
      <div class="url-display">${escapeHtml(sourceUrl)}</div>
    </div>

    <button class="submit-btn" onclick="saveSpark()">Capture Spark</button>
  </div>

  <script>
    const pageUrl = ${JSON.stringify(metadata.url)};
    let flowEnergy = 'warm';
    let sparkEnergy = 'warm';
    let saving = false;

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function closeModal() {
      window.parent.postMessage({ action: 'close' }, '*');
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelector('.tab:' + (tab === 'flow' ? 'first-child' : 'last-child')).classList.add('active');
      document.getElementById(tab + '-panel').classList.add('active');
    }

    function selectEnergy(form, energy) {
      const picker = form === 'flow'
        ? document.querySelector('#flow-panel .energy-picker')
        : document.querySelector('#spark-energy-picker');

      picker.querySelectorAll('.energy-btn').forEach(btn => btn.classList.remove('selected'));
      picker.querySelector('[data-energy="' + energy + '"]').classList.add('selected');

      if (form === 'flow') flowEnergy = energy;
      else sparkEnergy = energy;
    }

    function saveFlow() {
      if (saving) return;

      const title = document.getElementById('flow-title').value.trim();
      const myTake = document.getElementById('flow-take').value.trim();
      const classification = document.getElementById('flow-classification').value;

      // Validate
      const takeError = document.getElementById('flow-take-error');
      if (!myTake) {
        takeError.style.display = 'block';
        document.getElementById('flow-take').focus();
        return;
      }
      takeError.style.display = 'none';

      saving = true;
      const btn = document.querySelector('#flow-panel .submit-btn');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      window.parent.postMessage({
        action: 'saveToFlow',
        data: {
          title,
          url: pageUrl,
          myTake,
          energy: flowEnergy,
          classification
        }
      }, '*');
    }

    function saveSpark() {
      if (saving) return;

      const text = document.getElementById('spark-text').value.trim();
      const type = document.getElementById('spark-type').value;

      // Validate
      const textError = document.getElementById('spark-text-error');
      if (!text) {
        textError.style.display = 'block';
        document.getElementById('spark-text').focus();
        return;
      }
      textError.style.display = 'none';

      saving = true;
      const btn = document.querySelector('#spark-panel .submit-btn');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      window.parent.postMessage({
        action: 'saveSpark',
        data: {
          text,
          type,
          energy: sparkEnergy,
          sourceUrl: pageUrl
        }
      }, '*');
    }

    // Listen for save results
    window.addEventListener('message', (event) => {
      if (event.data.action === 'saveResult') {
        saving = false;
        const flowBtn = document.querySelector('#flow-panel .submit-btn');
        const sparkBtn = document.querySelector('#spark-panel .submit-btn');

        if (event.data.success) {
          flowBtn.textContent = 'Saved!';
          sparkBtn.textContent = 'Captured!';
        } else {
          flowBtn.textContent = 'Save to Flow';
          flowBtn.disabled = false;
          sparkBtn.textContent = 'Capture Spark';
          sparkBtn.disabled = false;
          alert('Error: ' + event.data.error);
        }
      }
    });

    // Focus first input
    setTimeout(() => {
      const activePanel = document.querySelector('.panel.active');
      const firstInput = activePanel.querySelector('textarea, input');
      if (firstInput) firstInput.focus();
    }, 100);
  </script>
</body>
</html>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ============================================
  // MESSAGE LISTENER
  // ============================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
      sendResponse({ status: 'ok' });
      return;
    }

    if (message.action === 'showModal') {
      createModal(message.mode, message);
      sendResponse({ status: 'ok' });
      return;
    }

    if (message.action === 'getMetadata') {
      sendResponse(getPageMetadata());
      return;
    }

    if (message.action === 'getSelectedText') {
      sendResponse({ text: getSelectedText() });
      return;
    }
  });
})();
