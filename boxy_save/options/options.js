// BOXY Settings Page Logic

const STORAGE_KEYS = {
  apiKey: 'boxy_api_key',
  flowDb: 'boxy_flow_db',
  sparksDb: 'boxy_sparks_db',
  lensesDb: 'boxy_lenses_db',
  sourcesDb: 'boxy_sources_db',
  defaultEnergy: 'boxy_default_energy',
  defaultClassification: 'boxy_default_classification',
  autoClose: 'boxy_auto_close'
};

// DOM Elements
const elements = {
  apiKey: document.getElementById('apiKey'),
  toggleApiKey: document.getElementById('toggleApiKey'),
  flowDb: document.getElementById('flowDb'),
  sparksDb: document.getElementById('sparksDb'),
  lensesDb: document.getElementById('lensesDb'),
  sourcesDb: document.getElementById('sourcesDb'),
  defaultEnergy: document.getElementById('defaultEnergy'),
  defaultClassification: document.getElementById('defaultClassification'),
  autoClose: document.getElementById('autoClose'),
  testConnection: document.getElementById('testConnection'),
  saveSettings: document.getElementById('saveSettings'),
  statusIndicator: document.getElementById('statusIndicator'),
  statusText: document.getElementById('statusText'),
  successMessage: document.getElementById('successMessage'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.getElementById('errorText')
};

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);

// Event Listeners
elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
elements.testConnection.addEventListener('click', testConnection);
elements.saveSettings.addEventListener('click', saveSettings);

// Auto-hide messages when user starts typing
document.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', hideMessages);
});

/**
 * Load saved settings from chrome.storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(Object.values(STORAGE_KEYS));

    elements.apiKey.value = result[STORAGE_KEYS.apiKey] || '';
    elements.flowDb.value = result[STORAGE_KEYS.flowDb] || '';
    elements.sparksDb.value = result[STORAGE_KEYS.sparksDb] || '';
    elements.lensesDb.value = result[STORAGE_KEYS.lensesDb] || '';
    elements.sourcesDb.value = result[STORAGE_KEYS.sourcesDb] || '';
    elements.defaultEnergy.value = result[STORAGE_KEYS.defaultEnergy] || 'warm';
    elements.defaultClassification.value = result[STORAGE_KEYS.defaultClassification] || 'article';
    elements.autoClose.checked = result[STORAGE_KEYS.autoClose] !== false; // default true

    // Check connection status on load if we have credentials
    if (result[STORAGE_KEYS.apiKey] && result[STORAGE_KEYS.flowDb]) {
      await checkConnectionStatus();
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    showError('Failed to load settings');
  }
}

/**
 * Save settings to chrome.storage
 */
async function saveSettings() {
  const apiKey = elements.apiKey.value.trim();
  const flowDb = cleanDatabaseId(elements.flowDb.value);
  const sparksDb = cleanDatabaseId(elements.sparksDb.value);
  const lensesDb = cleanDatabaseId(elements.lensesDb.value);
  const sourcesDb = cleanDatabaseId(elements.sourcesDb.value);

  // Validation
  if (!apiKey) {
    showError('API Key is required');
    elements.apiKey.focus();
    return;
  }

  if (!apiKey.startsWith('secret_') && !apiKey.startsWith('ntn_')) {
    showError('API Key should start with "secret_" or "ntn_"');
    elements.apiKey.focus();
    return;
  }

  if (!flowDb) {
    showError('Flow Database ID is required');
    elements.flowDb.focus();
    return;
  }

  if (!sparksDb) {
    showError('Sparks Database ID is required');
    elements.sparksDb.focus();
    return;
  }

  if (!isValidDatabaseId(flowDb)) {
    showError('Flow Database ID format is invalid');
    elements.flowDb.focus();
    return;
  }

  if (!isValidDatabaseId(sparksDb)) {
    showError('Sparks Database ID format is invalid');
    elements.sparksDb.focus();
    return;
  }

  // Save to storage
  try {
    await chrome.storage.sync.set({
      [STORAGE_KEYS.apiKey]: apiKey,
      [STORAGE_KEYS.flowDb]: flowDb,
      [STORAGE_KEYS.sparksDb]: sparksDb,
      [STORAGE_KEYS.lensesDb]: lensesDb,
      [STORAGE_KEYS.sourcesDb]: sourcesDb,
      [STORAGE_KEYS.defaultEnergy]: elements.defaultEnergy.value,
      [STORAGE_KEYS.defaultClassification]: elements.defaultClassification.value,
      [STORAGE_KEYS.autoClose]: elements.autoClose.checked
    });

    // Update input values with cleaned IDs
    elements.flowDb.value = flowDb;
    elements.sparksDb.value = sparksDb;
    elements.lensesDb.value = lensesDb;
    elements.sourcesDb.value = sourcesDb;

    showSuccess();

    // Test connection after saving
    await checkConnectionStatus();
  } catch (error) {
    console.error('Failed to save settings:', error);
    showError('Failed to save settings: ' + error.message);
  }
}

/**
 * Test Notion API connection
 */
async function testConnection() {
  const apiKey = elements.apiKey.value.trim();
  const flowDb = cleanDatabaseId(elements.flowDb.value);

  if (!apiKey || !flowDb) {
    showError('API Key and Flow Database ID are required to test connection');
    return;
  }

  elements.testConnection.disabled = true;
  elements.testConnection.textContent = 'Testing...';
  updateStatus('checking', 'Checking connection...');

  try {
    // Test by retrieving the database
    const response = await fetch(`https://api.notion.com/v1/databases/${flowDb}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateStatus('connected', `Connected to "${data.title?.[0]?.plain_text || 'Database'}"`);
      showSuccess('Connection successful!');
    } else if (response.status === 401) {
      updateStatus('error', 'Invalid API key');
      showError('Invalid API key. Check your integration token.');
    } else if (response.status === 404) {
      updateStatus('error', 'Database not found');
      showError('Database not found. Make sure the database is shared with your integration.');
    } else {
      const error = await response.json();
      updateStatus('error', 'Connection failed');
      showError(error.message || 'Failed to connect to Notion');
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    updateStatus('error', 'Connection error');
    showError('Network error. Check your internet connection.');
  } finally {
    elements.testConnection.disabled = false;
    elements.testConnection.textContent = 'Test Connection';
  }
}

/**
 * Check connection status silently
 */
async function checkConnectionStatus() {
  const apiKey = elements.apiKey.value.trim();
  const flowDb = cleanDatabaseId(elements.flowDb.value);

  if (!apiKey || !flowDb) {
    updateStatus('disconnected', 'Not configured');
    return;
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${flowDb}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateStatus('connected', `Connected to "${data.title?.[0]?.plain_text || 'Flow'}"`);
    } else {
      updateStatus('error', 'Connection issue');
    }
  } catch (error) {
    updateStatus('disconnected', 'Not connected');
  }
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
  const isPassword = elements.apiKey.type === 'password';
  elements.apiKey.type = isPassword ? 'text' : 'password';
  elements.toggleApiKey.textContent = isPassword ? 'Hide' : 'Show';
}

/**
 * Clean and normalize database ID
 * Handles full URLs, IDs with dashes, etc.
 */
function cleanDatabaseId(input) {
  if (!input) return '';

  let id = input.trim();

  // Extract ID from URL if pasted
  // Format: notion.so/workspace/Name-abc123def456... or notion.so/abc123def456...
  const urlMatch = id.match(/notion\.so\/(?:.*-)?([a-f0-9]{32})/i);
  if (urlMatch) {
    id = urlMatch[1];
  }

  // Remove dashes
  id = id.replace(/-/g, '');

  // Extract just the ID part (32 hex chars)
  const idMatch = id.match(/[a-f0-9]{32}/i);
  if (idMatch) {
    return idMatch[0];
  }

  return id;
}

/**
 * Validate database ID format
 */
function isValidDatabaseId(id) {
  return /^[a-f0-9]{32}$/i.test(id);
}

/**
 * Update connection status indicator
 */
function updateStatus(status, text) {
  elements.statusIndicator.className = 'status-indicator ' + status;
  elements.statusText.textContent = text;
}

/**
 * Show success message
 */
function showSuccess(message = 'Settings saved successfully!') {
  elements.successMessage.textContent = '✓ ' + message;
  elements.successMessage.style.display = 'block';
  elements.errorMessage.style.display = 'none';

  setTimeout(() => {
    elements.successMessage.style.display = 'none';
  }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
  elements.errorText.textContent = message;
  elements.errorMessage.style.display = 'block';
  elements.successMessage.style.display = 'none';
}

/**
 * Hide all messages
 */
function hideMessages() {
  elements.successMessage.style.display = 'none';
  elements.errorMessage.style.display = 'none';
}
