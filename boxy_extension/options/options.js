// BOXY Options Page

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const flowDbInput = document.getElementById('flow-db');
  const sparksDbInput = document.getElementById('sparks-db');
  const lensesDbInput = document.getElementById('lenses-db');
  const sourcesDbInput = document.getElementById('sources-db');
  const testBtn = document.getElementById('test-btn');
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status');
  const form = document.getElementById('settings-form');

  // Load existing config
  chrome.storage.sync.get('boxy_config', (result) => {
    const config = result.boxy_config || {};
    if (config.notion_api_key) {
      apiKeyInput.value = config.notion_api_key;
    }
    if (config.databases?.flow) {
      flowDbInput.value = config.databases.flow;
    }
    if (config.databases?.sparks) {
      sparksDbInput.value = config.databases.sparks;
    }
    if (config.databases?.lenses) {
      lensesDbInput.value = config.databases.lenses;
    }
    if (config.databases?.sources) {
      sourcesDbInput.value = config.databases.sources;
    }
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
  }

  function hideStatus() {
    statusEl.className = 'status';
  }

  // Extract database ID from URL or raw ID
  function extractDatabaseId(input) {
    if (!input) return '';

    // Remove any whitespace
    input = input.trim();

    // If it's a Notion URL, extract the ID
    const urlMatch = input.match(/([a-f0-9]{32})/i);
    if (urlMatch) {
      return urlMatch[1];
    }

    // If it looks like a UUID with dashes, remove them
    const uuidMatch = input.match(/([a-f0-9-]{36})/i);
    if (uuidMatch) {
      return uuidMatch[1].replace(/-/g, '');
    }

    // Return as-is if it's already a clean ID
    return input.replace(/-/g, '');
  }

  // Test connection
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const flowDb = extractDatabaseId(flowDbInput.value);
    const sparksDb = extractDatabaseId(sparksDbInput.value);
    const lensesDb = extractDatabaseId(lensesDbInput.value);
    const sourcesDb = extractDatabaseId(sourcesDbInput.value);

    if (!apiKey) {
      showStatus('Please enter your Notion API key', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    hideStatus();

    // Temporarily save config for testing
    const config = {
      notion_api_key: apiKey,
      databases: {
        flow: flowDb,
        sparks: sparksDb,
        lenses: lensesDb,
        sources: sourcesDb
      }
    };

    await chrome.storage.sync.set({ boxy_config: config });

    // Test via service worker
    chrome.runtime.sendMessage({ action: 'testConnection' }, (response) => {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';

      if (response.success) {
        showStatus('Connected successfully!', 'success');
      } else {
        showStatus('Connection failed: ' + response.error, 'error');
      }
    });
  });

  // Save settings
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const flowDb = extractDatabaseId(flowDbInput.value);
    const sparksDb = extractDatabaseId(sparksDbInput.value);
    const lensesDb = extractDatabaseId(lensesDbInput.value);
    const sourcesDb = extractDatabaseId(sourcesDbInput.value);

    if (!apiKey) {
      showStatus('API key is required', 'error');
      return;
    }

    if (!flowDb && !sparksDb) {
      showStatus('At least one database ID is required', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const config = {
      notion_api_key: apiKey,
      databases: {
        flow: flowDb,
        sparks: sparksDb,
        lenses: lensesDb,
        sources: sourcesDb
      }
    };

    try {
      await chrome.storage.sync.set({ boxy_config: config });
      showStatus('Settings saved!', 'success');
    } catch (error) {
      showStatus('Failed to save: ' + error.message, 'error');
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  });
});
