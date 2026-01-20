// BOXY Chrome Extension - Popup Script

// State
let currentTab = null;
let selectedEnergy = 'warm';
let selectedLenses = [];
let config = null;
let cachedLenses = [];

// DOM Elements
const elements = {
  // States
  setupRequired: document.getElementById('setupRequired'),
  mainForm: document.getElementById('mainForm'),
  loadingState: document.getElementById('loadingState'),
  successState: document.getElementById('successState'),
  errorState: document.getElementById('errorState'),

  // Form fields
  title: document.getElementById('title'),
  url: document.getElementById('url'),
  summary: document.getElementById('summary'),
  summaryLoading: document.getElementById('summaryLoading'),
  myTake: document.getElementById('myTake'),
  classification: document.getElementById('classification'),
  lensDropdown: document.getElementById('lensDropdown'),
  selectedLenses: document.getElementById('selectedLenses'),
  duplicateWarning: document.getElementById('duplicateWarning'),

  // Buttons
  settingsBtn: document.getElementById('settingsBtn'),
  openSetupBtn: document.getElementById('openSetupBtn'),
  regenerateSummary: document.getElementById('regenerateSummary'),
  saveToFlow: document.getElementById('saveToFlow'),
  saveAsSpark: document.getElementById('saveAsSpark'),
  closeSuccess: document.getElementById('closeSuccess'),
  retryBtn: document.getElementById('retryBtn'),

  // Messages
  successMessage: document.getElementById('successMessage'),
  errorMessage: document.getElementById('errorMessage'),
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await getCurrentTab();
  setupEventListeners();

  if (!isConfigured()) {
    showState('setup');
  } else {
    await initializeForm();
    showState('form');
  }
});

// Load configuration from storage
async function loadConfig() {
  const result = await chrome.storage.sync.get(['config', 'cachedLenses']);
  config = result.config || null;
  cachedLenses = result.cachedLenses || [];
}

// Check if extension is configured
function isConfigured() {
  return config && config.notionApiKey && config.databases?.flow;
}

// Get current tab info
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
}

// Initialize form with page data
async function initializeForm() {
  if (!currentTab) return;

  // Set URL
  elements.url.value = currentTab.url;

  // Set title
  elements.title.value = currentTab.title || '';

  // Auto-detect classification from URL
  elements.classification.value = detectClassification(currentTab.url);

  // Load lenses into dropdown
  populateLensDropdown();

  // Generate summary
  generateSummary();

  // Check for duplicates
  checkForDuplicate(currentTab.url);
}

// Detect content type from URL
function detectClassification(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com')) {
    return 'video';
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'thread';
  }
  if (urlLower.includes('podcast') || urlLower.includes('spotify.com/episode')) {
    return 'podcast';
  }
  if (urlLower.includes('arxiv.org') || urlLower.includes('.pdf')) {
    return 'paper';
  }

  return 'article';
}

// Populate lens dropdown
function populateLensDropdown() {
  elements.lensDropdown.innerHTML = '<option value="">+ Add lens...</option>';

  cachedLenses.forEach(lens => {
    const option = document.createElement('option');
    option.value = lens.id;
    option.textContent = lens.name;
    elements.lensDropdown.appendChild(option);
  });
}

// Generate summary using AI
async function generateSummary() {
  elements.summaryLoading.style.display = 'flex';
  elements.summary.value = '';

  try {
    // Get page content from content script
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: extractPageContent,
    });

    const pageContent = result?.result || '';

    // Send to background for AI summary
    const response = await chrome.runtime.sendMessage({
      action: 'generateSummary',
      content: pageContent,
      title: currentTab.title,
      url: currentTab.url,
    });

    if (response?.summary) {
      elements.summary.value = response.summary;
    } else {
      elements.summary.value = '';
      elements.summary.placeholder = 'Could not generate summary. Add manually.';
    }
  } catch (error) {
    console.error('Summary generation failed:', error);
    elements.summary.placeholder = 'Add summary manually...';
  } finally {
    elements.summaryLoading.style.display = 'none';
  }
}

// Extract page content (runs in page context)
function extractPageContent() {
  // Get main content area
  const article = document.querySelector('article') ||
                  document.querySelector('main') ||
                  document.querySelector('.content') ||
                  document.body;

  // Get text content, limited to first 5000 chars
  const text = article.innerText || article.textContent || '';
  return text.slice(0, 5000);
}

// Check for duplicate URL
async function checkForDuplicate(url) {
  if (!config?.databases?.flow) return;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'checkDuplicate',
      url: url,
      databaseId: config.databases.flow,
    });

    if (response?.isDuplicate) {
      elements.duplicateWarning.style.display = 'flex';
    }
  } catch (error) {
    // Silently fail - duplicate check is nice-to-have
    console.log('Duplicate check failed:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  elements.openSetupBtn?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Energy buttons
  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEnergy = btn.dataset.energy;
    });
  });

  // Lens dropdown
  elements.lensDropdown.addEventListener('change', (e) => {
    if (!e.target.value) return;

    const selectedId = e.target.value;
    const selectedOption = cachedLenses.find(l => l.id === selectedId);

    if (selectedOption && !selectedLenses.find(l => l.id === selectedId)) {
      selectedLenses.push(selectedOption);
      renderSelectedLenses();
    }

    e.target.value = ''; // Reset dropdown
  });

  // Regenerate summary
  elements.regenerateSummary.addEventListener('click', () => {
    generateSummary();
  });

  // Save to Flow
  elements.saveToFlow.addEventListener('click', saveToFlow);

  // Save as Spark
  elements.saveAsSpark.addEventListener('click', () => {
    // Open spark popup or switch to spark mode
    showSparkMode();
  });

  // Success close
  elements.closeSuccess.addEventListener('click', () => {
    window.close();
  });

  // Retry
  elements.retryBtn.addEventListener('click', () => {
    showState('form');
  });
}

// Render selected lenses
function renderSelectedLenses() {
  elements.selectedLenses.innerHTML = '';

  selectedLenses.forEach(lens => {
    const tag = document.createElement('span');
    tag.className = 'lens-tag';
    tag.innerHTML = `
      ${lens.name}
      <button data-id="${lens.id}">&times;</button>
    `;

    tag.querySelector('button').addEventListener('click', () => {
      selectedLenses = selectedLenses.filter(l => l.id !== lens.id);
      renderSelectedLenses();
    });

    elements.selectedLenses.appendChild(tag);
  });
}

// Save to Flow
async function saveToFlow() {
  // Validate
  if (!elements.myTake.value.trim()) {
    elements.myTake.focus();
    elements.myTake.style.borderColor = 'var(--error)';
    return;
  }

  showState('loading');

  try {
    const flowItem = {
      title: elements.title.value,
      url: elements.url.value,
      summary: elements.summary.value,
      myTake: elements.myTake.value,
      energy: selectedEnergy,
      classification: elements.classification.value,
      lenses: selectedLenses.map(l => l.id),
    };

    const response = await chrome.runtime.sendMessage({
      action: 'saveToFlow',
      data: flowItem,
    });

    if (response?.success) {
      elements.successMessage.textContent = 'Added to Flow 📥';
      showState('success');
    } else {
      throw new Error(response?.error || 'Failed to save');
    }
  } catch (error) {
    console.error('Save failed:', error);
    elements.errorMessage.textContent = error.message || 'Something went wrong';
    showState('error');
  }
}

// Show spark mode (simplified)
function showSparkMode() {
  // For now, just get selected text and save as spark
  chrome.tabs.sendMessage(currentTab.id, { action: 'getSelectedText' }, async (response) => {
    const selectedText = response?.text || '';

    if (!selectedText) {
      alert('Select some text on the page first, then click "Save as Spark"');
      return;
    }

    showState('loading');

    try {
      const spark = {
        text: selectedText,
        type: 'quote',
        energy: selectedEnergy,
        lenses: selectedLenses.map(l => l.id),
        sourceUrl: currentTab.url,
        sourceTitle: currentTab.title,
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveSpark',
        data: spark,
      });

      if (response?.success) {
        elements.successMessage.textContent = 'Spark captured ⚡';
        showState('success');
      } else {
        throw new Error(response?.error || 'Failed to save spark');
      }
    } catch (error) {
      console.error('Spark save failed:', error);
      elements.errorMessage.textContent = error.message || 'Something went wrong';
      showState('error');
    }
  });
}

// Show state
function showState(state) {
  // Hide all states
  elements.setupRequired.style.display = 'none';
  elements.mainForm.style.display = 'none';
  elements.loadingState.style.display = 'none';
  elements.successState.style.display = 'none';
  elements.errorState.style.display = 'none';

  // Show requested state
  switch (state) {
    case 'setup':
      elements.setupRequired.style.display = 'flex';
      break;
    case 'form':
      elements.mainForm.style.display = 'block';
      break;
    case 'loading':
      elements.loadingState.style.display = 'flex';
      break;
    case 'success':
      elements.successState.style.display = 'flex';
      break;
    case 'error':
      elements.errorState.style.display = 'flex';
      break;
  }
}
